/**
 * Bridge Server - Connects the PWA to Claude Code CLI
 *
 * This server receives requests from the app and spawns Claude Code
 * to generate fiches using the multi-agent pipeline.
 *
 * Usage: node server/bridge.js
 * Port: 7001
 */

import express from 'express'
import cors from 'cors'
import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs/promises'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const PROJECT_ROOT = join(__dirname, '..')

const app = express()
const PORT = 7001

app.use(cors())
app.use(express.json())

// Store generation status
const generations = new Map()

/**
 * Generate a unique ID for each generation request
 */
function generateId() {
  return `gen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * POST /generate
 * Start a new fiche generation
 * Body: { topic: string, category: string }
 */
app.post('/generate', async (req, res) => {
  const { topic, category } = req.body
  console.log(`\n📥 Nouvelle requête: "${topic}" (${category || 'histoire'})`)

  if (!topic) {
    return res.status(400).json({ error: 'Topic is required' })
  }

  const id = generateId()
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const outputPath = join(PROJECT_ROOT, 'workspace', 'output', `${topic.toLowerCase().replace(/\s+/g, '-')}-${timestamp}.json`)

  // Initialize generation status
  generations.set(id, {
    id,
    topic,
    category: category || 'histoire',
    status: 'running',
    progress: 'Démarrage...',
    logs: [],
    startedAt: new Date().toISOString(),
    outputPath
  })

  // Build the prompt for Claude Code
  const prompt = `
Tu es dans le projet CultureMaster. Exécute le pipeline multi-agent pour créer une fiche sur "${topic}" (catégorie: ${category || 'histoire'}).

ÉTAPES À SUIVRE :

1. RECHERCHE : Lis .claude/agents/researcher.md et effectue une recherche approfondie avec WebSearch (8-10 recherches différentes). Sauvegarde dans workspace/research/

2. IMAGES : Lis .claude/agents/image-curator.md et trouve 8-10 images sur Wikimedia Commons. Sauvegarde dans workspace/images/

3. FICHE : Lis .claude/agents/fiche-writer.md et crée une fiche EXCEPTIONNELLE avec :
   - heroImage (URL Wikimedia)
   - sections avec images intégrées
   - timeline narrative avec stories
   - contenu profond (4-5 paragraphes par section)

4. QUESTIONS : Lis .claude/agents/qcm-generator.md et crée 10 questions variées

5. ASSEMBLAGE FINAL : Crée le fichier JSON final avec la fiche ET les questions dans workspace/output/

Le fichier final doit être un JSON valide avec cette structure :
{
  "fiche": { ... },
  "questions": [ ... ]
}

Sauvegarde le résultat final dans : ${outputPath}

IMPORTANT : Respecte STRICTEMENT les instructions des agents pour la qualité du contenu.
`

  // Spawn Claude Code CLI
  console.log(`🚀 Lancement de Claude Code (ID: ${id})...`)
  const claude = spawn('claude', ['--print', prompt], {
    cwd: PROJECT_ROOT,
    env: { ...process.env },
    stdio: ['pipe', 'pipe', 'pipe']
  })

  let output = ''
  let errorOutput = ''

  console.log(`⏳ Génération en cours...`)

  claude.stdout.on('data', (data) => {
    const text = data.toString()
    output += text

    // Update progress based on output
    const gen = generations.get(id)
    if (gen) {
      gen.logs.push(text)

      // Detect progress from output
      if (text.includes('recherche') || text.includes('WebSearch')) {
        gen.progress = 'Recherche en cours...'
      } else if (text.includes('image') || text.includes('Wikimedia')) {
        gen.progress = 'Recherche d\'images...'
      } else if (text.includes('fiche') || text.includes('section')) {
        gen.progress = 'Rédaction de la fiche...'
      } else if (text.includes('question') || text.includes('QCM')) {
        gen.progress = 'Création des questions...'
      } else if (text.includes('Sauvegarde') || text.includes('output')) {
        gen.progress = 'Finalisation...'
      }
    }
  })

  claude.stderr.on('data', (data) => {
    errorOutput += data.toString()
    const gen = generations.get(id)
    if (gen) {
      gen.logs.push(`[stderr] ${data.toString()}`)
    }
  })

  claude.on('close', async (code) => {
    console.log(`\n📋 Claude Code terminé (code: ${code})`)
    const gen = generations.get(id)
    if (!gen) return

    if (code === 0) {
      // Try to read the output file
      try {
        const fileContent = await fs.readFile(outputPath, 'utf-8')
        const result = JSON.parse(fileContent)
        gen.status = 'completed'
        gen.progress = 'Terminé !'
        gen.result = result
        gen.completedAt = new Date().toISOString()
        console.log(`✅ Fiche générée avec succès !`)
      } catch (err) {
        // Try to extract JSON from output
        try {
          const jsonMatch = output.match(/\{[\s\S]*"fiche"[\s\S]*\}/)
          if (jsonMatch) {
            gen.result = JSON.parse(jsonMatch[0])
            gen.status = 'completed'
            gen.progress = 'Terminé !'
            gen.completedAt = new Date().toISOString()
          } else {
            gen.status = 'error'
            gen.progress = 'Erreur de parsing'
            gen.error = 'Could not find valid JSON in output'
          }
        } catch (parseErr) {
          gen.status = 'error'
          gen.progress = 'Erreur de parsing'
          gen.error = parseErr.message
        }
      }
    } else {
      gen.status = 'error'
      gen.progress = 'Erreur'
      gen.error = errorOutput || `Process exited with code ${code}`
    }
  })

  claude.on('error', (err) => {
    console.log(`❌ Erreur Claude Code: ${err.message}`)
    const gen = generations.get(id)
    if (gen) {
      gen.status = 'error'
      gen.progress = 'Erreur'
      gen.error = err.message
    }
  })

  res.json({ id, message: 'Generation started', topic })
})

/**
 * GET /status/:id
 * Get the status of a generation
 */
app.get('/status/:id', (req, res) => {
  const gen = generations.get(req.params.id)

  if (!gen) {
    return res.status(404).json({ error: 'Generation not found' })
  }

  // Return status without full logs (unless requested)
  const { logs, ...status } = gen
  res.json({
    ...status,
    logsCount: logs.length
  })
})

/**
 * GET /result/:id
 * Get the result of a completed generation
 */
app.get('/result/:id', (req, res) => {
  const gen = generations.get(req.params.id)

  if (!gen) {
    return res.status(404).json({ error: 'Generation not found' })
  }

  if (gen.status !== 'completed') {
    return res.status(400).json({ error: 'Generation not completed', status: gen.status })
  }

  res.json(gen.result)
})

/**
 * GET /logs/:id
 * Get the logs of a generation
 */
app.get('/logs/:id', (req, res) => {
  const gen = generations.get(req.params.id)

  if (!gen) {
    return res.status(404).json({ error: 'Generation not found' })
  }

  res.json({ logs: gen.logs })
})

/**
 * GET /health
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', port: PORT })
})

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🚀 CultureMaster Bridge Server                           ║
║                                                            ║
║   Port: ${PORT}                                              ║
║   URL:  http://localhost:${PORT}                             ║
║                                                            ║
║   Endpoints:                                               ║
║   • POST /generate     - Start fiche generation            ║
║   • GET  /status/:id   - Check generation status           ║
║   • GET  /result/:id   - Get completed result              ║
║   • GET  /logs/:id     - Get generation logs               ║
║   • GET  /health       - Health check                      ║
║                                                            ║
║   Ready to receive requests from the app!                  ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `)
})
