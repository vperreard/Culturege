/**
 * Bridge Server - Connects the PWA to Claude Code CLI
 *
 * SMART PARALLEL ARCHITECTURE:
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │  Phase 1 (parallel)       Phase 2 (sequential)    Phase 3          │
 * │  ┌──────────────┐                                                  │
 * │  │  Recherche   │─────┐    ┌──────────────┐      ┌──────────────┐  │
 * │  └──────────────┘     ├───▶│    Fiche     │─────▶│  Questions   │  │
 * │         +             │    │ (+ images)   │      │(basées fiche)│  │
 * │  ┌──────────────┐     │    └──────────────┘      └──────────────┘  │
 * │  │   Images     │─────┘                                            │
 * │  └──────────────┘                                                  │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * Why this order:
 * - Research + Images can run in parallel (both based on topic)
 * - Fiche needs research AND images to place them correctly
 * - Questions MUST come after fiche to reference actual content
 *
 * Usage: node server/bridge.js
 * Port: 7001
 */

import express from 'express'
import cors from 'cors'
import { spawn, execSync } from 'child_process'
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
 * Spawn a Claude Code process with streaming output
 * @param {string} prompt - The prompt to send to Claude
 * @param {string} label - Label for logging (e.g., "Recherche", "Images")
 * @param {object} gen - Generation object to update progress
 * @param {string} outputFile - Optional output file path
 * @returns {Promise<{output: string, toolCalls: number}>}
 */
function spawnClaudeTask(prompt, label, gen, outputFile = null) {
  return new Promise((resolve, reject) => {
    const emoji = {
      'Recherche': '🔬',
      'Images': '🖼️',
      'Fiche': '📝',
      'Questions': '❓',
      'Assembly': '🔧'
    }[label] || '⚙️'

    console.log(`\n${emoji} [${label}] Démarrage...`)

    // DEBUG MODE: Run Claude with visible output in terminal
    // Use 'inherit' for stdout/stderr so we see everything
    const claude = spawn('claude', ['-p', prompt], {
      cwd: PROJECT_ROOT,
      env: { ...process.env },
      stdio: ['pipe', 'inherit', 'inherit']  // stdin:pipe, stdout:inherit, stderr:inherit
    })

    if (!claude.pid) {
      console.log(`   ${emoji} [${label}] ❌ Échec du spawn!`)
      reject(new Error('Failed to spawn claude process'))
      return
    }

    console.log(`   ${emoji} [${label}] 🔧 PID: ${claude.pid}`)
    console.log(`   ${emoji} [${label}] 👀 Mode DEBUG: output visible dans le terminal`)
    console.log(`   ${emoji} [${label}] ─────────────────────────────────────────────`)

    const startTime = Date.now()

    // With 'inherit', output goes directly to terminal - we don't capture it
    // But we track time and wait for completion

    claude.on('close', async (code) => {
      const duration = ((Date.now() - startTime) / 1000).toFixed(1)

      console.log(`\n   ${emoji} [${label}] ─────────────────────────────────────────────`)
      console.log(`   ${emoji} [${label}] 📋 Terminé avec code: ${code} (${duration}s)`)

      if (code === 0) {
        console.log(`   ${emoji} [${label}] ✅ Succès !`)

        // Try to read output file if specified
        let result = null
        if (outputFile) {
          try {
            const content = await fs.readFile(outputFile, 'utf-8')
            result = JSON.parse(content)
            console.log(`   ${emoji} [${label}] 📁 Fichier trouvé: ${outputFile}`)
          } catch (e) {
            console.log(`   ${emoji} [${label}] ⚠️ Fichier non trouvé: ${outputFile}`)
          }
        }

        resolve({ output: '', toolCalls: 0, duration: parseFloat(duration), result })
      } else {
        console.log(`   ${emoji} [${label}] ❌ Erreur (code: ${code})`)
        reject(new Error(`Process exited with code ${code}`))
      }
    })

    claude.on('error', (err) => {
      console.log(`   ${emoji} [${label}] ❌ Spawn error: ${err.message}`)
      reject(err)
    })
  })
}

/**
 * POST /generate
 * Start a new fiche generation with PARALLEL execution
 */
app.post('/generate', async (req, res) => {
  const { topic, category } = req.body
  console.log(`\n${'═'.repeat(60)}`)
  console.log(`📥 NOUVELLE GÉNÉRATION: "${topic}" (${category || 'histoire'})`)
  console.log(`${'═'.repeat(60)}`)

  if (!topic) {
    return res.status(400).json({ error: 'Topic is required' })
  }

  const id = generateId()
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const topicSlug = topic.toLowerCase().replace(/\s+/g, '-').substring(0, 30)

  // Create workspace directories
  const workspacePaths = {
    research: join(PROJECT_ROOT, 'workspace', 'research', `${topicSlug}-${timestamp}.md`),
    images: join(PROJECT_ROOT, 'workspace', 'images', `${topicSlug}-${timestamp}.json`),
    fiche: join(PROJECT_ROOT, 'workspace', 'fiches', `${topicSlug}-${timestamp}.json`),
    questions: join(PROJECT_ROOT, 'workspace', 'questions', `${topicSlug}-${timestamp}.json`),
    output: join(PROJECT_ROOT, 'workspace', 'output', `${topicSlug}-${timestamp}.json`)
  }

  // Ensure directories exist
  await Promise.all([
    fs.mkdir(join(PROJECT_ROOT, 'workspace', 'research'), { recursive: true }),
    fs.mkdir(join(PROJECT_ROOT, 'workspace', 'images'), { recursive: true }),
    fs.mkdir(join(PROJECT_ROOT, 'workspace', 'fiches'), { recursive: true }),
    fs.mkdir(join(PROJECT_ROOT, 'workspace', 'questions'), { recursive: true }),
    fs.mkdir(join(PROJECT_ROOT, 'workspace', 'output'), { recursive: true })
  ])

  // Initialize generation status
  const gen = {
    id,
    topic,
    category: category || 'histoire',
    status: 'running',
    progress: 'Initialisation...',
    phase: 1,
    logs: [],
    startedAt: new Date().toISOString(),
    stats: { phase1: null, phase2: null, total: null }
  }
  generations.set(id, gen)

  // Return immediately, process in background
  res.json({ id, message: 'Generation started (parallel mode)', topic })

  // ════════════════════════════════════════════════════════════
  // PHASE 1: Recherche + Images EN PARALLÈLE
  // ════════════════════════════════════════════════════════════
  console.log(`\n┌─────────────────────────────────────────────────────────┐`)
  console.log(`│  PHASE 1: Recherche + Images (PARALLÈLE)                │`)
  console.log(`└─────────────────────────────────────────────────────────┘`)

  gen.phase = 1
  gen.progress = 'Phase 1: Recherche + Images en parallèle...'

  const researchPrompt = `
Tu es dans le projet CultureMaster. Lis le fichier .claude/agents/researcher.md et effectue une recherche APPROFONDIE sur "${topic}" (catégorie: ${category || 'histoire'}).

INSTRUCTIONS:
1. Lis d'abord .claude/agents/researcher.md pour comprendre la méthodologie
2. Effectue 8-10 recherches WebSearch différentes sur le sujet
3. Couvre: définition, histoire, concepts clés, exemples, controverses, actualités
4. Sauvegarde ta recherche complète dans: ${workspacePaths.research}

Format de sortie: Un fichier markdown structuré avec toutes les informations trouvées.
`

  const imagesPrompt = `
Tu es dans le projet CultureMaster. Lis le fichier .claude/agents/image-curator.md et trouve des images pour "${topic}".

INSTRUCTIONS:
1. Lis d'abord .claude/agents/image-curator.md
2. Recherche 8-10 images pertinentes sur Wikimedia Commons
3. Pour chaque image: URL, titre, description, attribution
4. Sauvegarde dans: ${workspacePaths.images}

Format JSON:
{
  "heroImage": { "url": "...", "title": "...", "attribution": "..." },
  "images": [{ "url": "...", "title": "...", "attribution": "...", "context": "..." }]
}
`

  try {
    const phase1Start = Date.now()
    const [researchResult, imagesResult] = await Promise.all([
      spawnClaudeTask(researchPrompt, 'Recherche', gen, workspacePaths.research),
      spawnClaudeTask(imagesPrompt, 'Images', gen, workspacePaths.images)
    ])

    gen.stats.phase1 = {
      duration: ((Date.now() - phase1Start) / 1000).toFixed(1),
      researchTools: researchResult.toolCalls,
      imagesTools: imagesResult.toolCalls
    }
    console.log(`\n✅ Phase 1 terminée en ${gen.stats.phase1.duration}s`)

    // ════════════════════════════════════════════════════════════
    // PHASE 2: Rédaction de la Fiche (SÉQUENTIEL - a besoin des images)
    // ════════════════════════════════════════════════════════════
    console.log(`\n┌─────────────────────────────────────────────────────────┐`)
    console.log(`│  PHASE 2: Rédaction de la Fiche (avec images)           │`)
    console.log(`└─────────────────────────────────────────────────────────┘`)

    gen.phase = 2
    gen.progress = 'Phase 2: Rédaction de la fiche...'

    const fichePrompt = `
Tu es dans le projet CultureMaster. Crée une fiche EXCEPTIONNELLE sur "${topic}".

CONTEXTE DISPONIBLE:
- Recherche complète: ${workspacePaths.research}
- Images trouvées: ${workspacePaths.images}

INSTRUCTIONS:
1. Lis d'abord .claude/agents/fiche-writer.md pour le format exact
2. Lis la recherche: ${workspacePaths.research}
3. Lis les images disponibles: ${workspacePaths.images}
4. Crée une fiche avec:
   - heroImage: choisis la meilleure image comme hero
   - 5-7 sections riches (4-5 paragraphes chacune)
   - INTÈGRE les images dans les sections appropriées (image.position: "left", "right", "full")
   - timeline narrative avec stories détaillées
   - mythes vs réalité (format flip cards)
5. Sauvegarde dans: ${workspacePaths.fiche}

IMPORTANT:
- Le contenu doit être PROFOND, pas superficiel. Chaque section = mini-article.
- Place les images là où elles illustrent le mieux le texte.
- Assure-toi que chaque fait important soit bien expliqué (pour les questions après).
`

    const phase2Start = Date.now()
    const ficheResult = await spawnClaudeTask(fichePrompt, 'Fiche', gen, workspacePaths.fiche)

    gen.stats.phase2 = {
      duration: ((Date.now() - phase2Start) / 1000).toFixed(1),
      ficheTools: ficheResult.toolCalls
    }
    console.log(`\n✅ Phase 2 terminée en ${gen.stats.phase2.duration}s`)

    // ════════════════════════════════════════════════════════════
    // PHASE 3: Création des Questions (SÉQUENTIEL - basées sur la fiche)
    // ════════════════════════════════════════════════════════════
    console.log(`\n┌─────────────────────────────────────────────────────────┐`)
    console.log(`│  PHASE 3: Questions QCM (basées sur la fiche)           │`)
    console.log(`└─────────────────────────────────────────────────────────┘`)

    gen.phase = 3
    gen.progress = 'Phase 3: Création des questions...'

    const questionsPrompt = `
Tu es dans le projet CultureMaster. Crée des questions QCM sur "${topic}".

CONTEXTE - LIS CES FICHIERS:
- La fiche rédigée: ${workspacePaths.fiche}
- La recherche: ${workspacePaths.research}

INSTRUCTIONS CRITIQUES:
1. Lis d'abord .claude/agents/qcm-generator.md
2. Lis ATTENTIVEMENT la fiche: ${workspacePaths.fiche}
3. Crée 10 questions dont les réponses se trouvent DANS LA FICHE:
   - 3 faciles (définitions, faits de base mentionnés dans la fiche)
   - 4 moyennes (compréhension des concepts expliqués)
   - 3 difficiles (détails spécifiques de la fiche)
4. Chaque question: 4 options, 1 bonne réponse, explication avec référence à la section
5. Sauvegarde dans: ${workspacePaths.questions}

RÈGLE D'OR: Chaque bonne réponse DOIT pouvoir être trouvée dans le contenu de la fiche.
Indique dans l'explication: "Cette information se trouve dans la section [X]"

Format JSON: { "questions": [...] }
`

    const phase3Start = Date.now()
    const questionsResult = await spawnClaudeTask(questionsPrompt, 'Questions', gen, workspacePaths.questions)

    gen.stats.phase3 = {
      duration: ((Date.now() - phase3Start) / 1000).toFixed(1),
      questionsTools: questionsResult.toolCalls
    }
    console.log(`\n✅ Phase 3 terminée en ${gen.stats.phase3.duration}s`)

    // ════════════════════════════════════════════════════════════
    // PHASE 4: Assemblage final
    // ════════════════════════════════════════════════════════════
    console.log(`\n┌─────────────────────────────────────────────────────────┐`)
    console.log(`│  PHASE 4: Assemblage final                              │`)
    console.log(`└─────────────────────────────────────────────────────────┘`)

    gen.phase = 4
    gen.progress = 'Assemblage final...'

    // Read the generated files and assemble
    let fiche = null
    let questions = null

    try {
      const ficheContent = await fs.readFile(workspacePaths.fiche, 'utf-8')
      fiche = JSON.parse(ficheContent)
    } catch (e) {
      console.log('   ⚠️ Impossible de lire la fiche, tentative de parsing...')
    }

    try {
      const questionsContent = await fs.readFile(workspacePaths.questions, 'utf-8')
      const qData = JSON.parse(questionsContent)
      questions = qData.questions || qData
    } catch (e) {
      console.log('   ⚠️ Impossible de lire les questions, tentative de parsing...')
    }

    if (fiche || questions) {
      const finalResult = {
        fiche: fiche || { title: topic, sections: [] },
        questions: questions || []
      }

      // Save final output
      await fs.writeFile(workspacePaths.output, JSON.stringify(finalResult, null, 2))

      const totalDuration = ((Date.now() - new Date(gen.startedAt).getTime()) / 1000).toFixed(1)
      gen.stats.total = totalDuration
      gen.status = 'completed'
      gen.progress = 'Terminé !'
      gen.result = finalResult
      gen.completedAt = new Date().toISOString()

      console.log(`\n${'═'.repeat(60)}`)
      console.log(`✅ GÉNÉRATION TERMINÉE !`)
      console.log(`   📊 Durée totale: ${totalDuration}s`)
      console.log(`   📊 Phase 1 (Recherche+Images): ${gen.stats.phase1.duration}s`)
      console.log(`   📊 Phase 2 (Fiche): ${gen.stats.phase2.duration}s`)
      console.log(`   📊 Phase 3 (Questions): ${gen.stats.phase3.duration}s`)
      console.log(`${'═'.repeat(60)}\n`)
    } else {
      throw new Error('Impossible d\'assembler le résultat final')
    }

  } catch (error) {
    console.log(`\n❌ ERREUR: ${error.message}`)
    gen.status = 'error'
    gen.progress = 'Erreur'
    gen.error = error.message
  }
})

/**
 * GET /status/:id
 */
app.get('/status/:id', (req, res) => {
  const gen = generations.get(req.params.id)
  if (!gen) {
    return res.status(404).json({ error: 'Generation not found' })
  }
  const { logs, ...status } = gen
  res.json({ ...status, logsCount: logs.length })
})

/**
 * GET /result/:id
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
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', port: PORT, mode: 'parallel' })
})

// Test if claude command is available
try {
  const claudePath = execSync('which claude', { encoding: 'utf-8' }).trim()
  console.log(`✅ Claude trouvé: ${claudePath}`)

  // Test a simple command
  const version = execSync('claude --version', { encoding: 'utf-8', timeout: 5000 }).trim()
  console.log(`✅ Version: ${version}`)

  // Test a simple prompt
  console.log(`🧪 Test d'un prompt simple...`)
  const testResult = execSync('claude -p "Dis juste OK"', {
    encoding: 'utf-8',
    timeout: 30000,
    cwd: PROJECT_ROOT
  }).trim()
  console.log(`✅ Réponse test: ${testResult.substring(0, 100)}`)
} catch (e) {
  console.log(`❌ Claude non accessible: ${e.message}`)
  console.log(`   Vérifiez que claude est installé et dans le PATH`)
}

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║   🚀 CultureMaster Bridge Server (SMART PARALLEL)                 ║
║                                                                   ║
║   Port: ${PORT}                                                     ║
║   URL:  http://localhost:${PORT}                                    ║
║                                                                   ║
║   Architecture:                                                   ║
║   ┌────────────┐                                                  ║
║   │ Recherche  │───┐  Phase 1     ┌────────┐     ┌───────────┐    ║
║   └────────────┘   ├─────────────▶│ Fiche  │────▶│ Questions │    ║
║         ║         │   (parallel)  │(+imgs) │     │(sur fiche)│    ║
║   ┌────────────┐   │               └────────┘     └───────────┘    ║
║   │   Images   │───┘                Phase 2         Phase 3       ║
║   └────────────┘                                                  ║
║                                                                   ║
║   ✓ Questions basées sur le contenu réel de la fiche              ║
║   ✓ Images placées aux bons endroits dans le texte                ║
║                                                                   ║
║   Endpoints:                                                      ║
║   • POST /generate     - Lancer une génération                    ║
║   • GET  /status/:id   - Vérifier statut & phase                  ║
║   • GET  /result/:id   - Récupérer le résultat                    ║
║   • GET  /logs/:id     - Voir les logs détaillés                  ║
║   • GET  /health       - Health check                             ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
  `)
})
