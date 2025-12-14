import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, AlertCircle, Loader2, Check, Key, ChevronDown,
  Terminal, Wifi, WifiOff, BookOpen, HelpCircle
} from 'lucide-react'

const BRIDGE_URL = 'http://localhost:7001'

function NewTopicForm({ categories, onGenerated, onBack }) {
  const [topic, setTopic] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState(null)
  const [difficulty, setDifficulty] = useState(2)
  const [questionCount, setQuestionCount] = useState(10)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState(null)
  const [apiKey, setApiKey] = useState(localStorage.getItem('claude_api_key') || '')
  const [showApiKeyInput, setShowApiKeyInput] = useState(!apiKey)

  // Claude Code mode
  const [useClaudeCode, setUseClaudeCode] = useState(true)
  const [bridgeAvailable, setBridgeAvailable] = useState(null)
  const [generationId, setGenerationId] = useState(null)
  const [progress, setProgress] = useState('')
  const pollRef = useRef(null)

  // Check if bridge is available on mount
  useEffect(() => {
    checkBridgeHealth()
  }, [])

  // Poll for generation status
  useEffect(() => {
    if (generationId && isGenerating) {
      pollRef.current = setInterval(async () => {
        try {
          const response = await fetch(`${BRIDGE_URL}/status/${generationId}`)
          const status = await response.json()

          setProgress(status.progress)

          if (status.status === 'completed') {
            clearInterval(pollRef.current)
            // Fetch the result
            const resultResponse = await fetch(`${BRIDGE_URL}/result/${generationId}`)
            const result = await resultResponse.json()
            handleGenerationComplete(result)
          } else if (status.status === 'error') {
            clearInterval(pollRef.current)
            setError(status.error || 'Erreur lors de la génération')
            setIsGenerating(false)
          }
        } catch (err) {
          console.error('Polling error:', err)
        }
      }, 2000)

      return () => clearInterval(pollRef.current)
    }
  }, [generationId, isGenerating])

  const checkBridgeHealth = async () => {
    try {
      const response = await fetch(`${BRIDGE_URL}/health`, { timeout: 2000 })
      const data = await response.json()
      setBridgeAvailable(data.status === 'ok')
    } catch (err) {
      setBridgeAvailable(false)
    }
  }

  const handleGenerationComplete = (result) => {
    setIsGenerating(false)
    setGenerationId(null)
    setProgress('')

    // Extract fiche and questions from result
    const fiche = result.fiche || result
    const questions = result.questions || []

    // Add IDs and metadata to questions
    const processedQuestions = questions.map((q, index) => ({
      ...q,
      id: q.id || `q-gen-${Date.now()}-${index}`,
      categoryId: selectedCategory?.id || fiche.categoryId,
      subcategoryId: selectedSubcategory?.id || fiche.subcategoryId,
      createdAt: new Date().toISOString(),
      timesAnswered: 0,
      timesCorrect: 0
    }))

    // Add ID to fiche if not present
    const processedFiche = fiche ? {
      ...fiche,
      id: fiche.id || `f-gen-${Date.now()}`,
      categoryId: selectedCategory?.id || fiche.categoryId,
    } : null

    onGenerated({
      fiche: processedFiche,
      questions: processedQuestions
    })
  }

  const handleGenerateWithBridge = async () => {
    if (!topic.trim() || !selectedCategory) return

    setIsGenerating(true)
    setError(null)
    setProgress('Connexion au serveur...')

    try {
      const response = await fetch(`${BRIDGE_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          category: selectedCategory.id
        })
      })

      if (!response.ok) {
        throw new Error('Erreur de connexion au serveur bridge')
      }

      const data = await response.json()
      setGenerationId(data.id)
      setProgress('Démarrage de Claude Code...')

    } catch (err) {
      console.error('Bridge error:', err)
      setError(`Erreur: ${err.message}. Assure-toi que le serveur bridge tourne (npm run bridge)`)
      setIsGenerating(false)
    }
  }

  const handleGenerateWithApi = async () => {
    if (!topic.trim() || !selectedCategory || !apiKey) return

    setIsGenerating(true)
    setError(null)

    try {
      localStorage.setItem('claude_api_key', apiKey)

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4000,
          messages: [{
            role: 'user',
            content: generatePrompt(topic, selectedCategory, selectedSubcategory, difficulty, questionCount)
          }]
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || `Erreur API: ${response.status}`)
      }

      const data = await response.json()
      const content = data.content[0].text

      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Format de réponse invalide')
      }

      const generated = JSON.parse(jsonMatch[0])

      const questions = generated.questions.map((q, index) => ({
        ...q,
        id: `q-gen-${Date.now()}-${index}`,
        categoryId: selectedCategory.id,
        subcategoryId: selectedSubcategory?.id || selectedCategory.subcategories?.[0]?.id,
        createdAt: new Date().toISOString(),
        timesAnswered: 0,
        timesCorrect: 0
      }))

      onGenerated({ questions, fiche: null })

    } catch (err) {
      console.error('Generation error:', err)
      setError(err.message || 'Une erreur est survenue lors de la génération')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerate = () => {
    if (useClaudeCode) {
      handleGenerateWithBridge()
    } else {
      handleGenerateWithApi()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary text-white mb-4 animate-glow">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Générer du contenu
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Crée des fiches et questions sur n'importe quel sujet
        </p>
      </div>

      {/* Mode Selection */}
      <div className="card">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          Mode de génération
        </label>
        <div className="grid grid-cols-2 gap-3">
          {/* Claude Code mode */}
          <button
            onClick={() => setUseClaudeCode(true)}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              useClaudeCode
                ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                : 'border-slate-200 dark:border-slate-700 hover:border-primary/50'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Terminal className="w-5 h-5 text-primary" />
              <span className="font-semibold text-slate-900 dark:text-white">Claude Code</span>
              {bridgeAvailable === true && (
                <span className="ml-auto flex items-center gap-1 text-xs text-success">
                  <Wifi className="w-3 h-3" /> Connecté
                </span>
              )}
              {bridgeAvailable === false && (
                <span className="ml-auto flex items-center gap-1 text-xs text-error">
                  <WifiOff className="w-3 h-3" /> Hors ligne
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Utilise ton abonnement Claude Code local. Génère des fiches complètes avec images.
            </p>
          </button>

          {/* API Key mode */}
          <button
            onClick={() => setUseClaudeCode(false)}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              !useClaudeCode
                ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                : 'border-slate-200 dark:border-slate-700 hover:border-primary/50'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Key className="w-5 h-5 text-secondary" />
              <span className="font-semibold text-slate-900 dark:text-white">Clé API</span>
            </div>
            <p className="text-xs text-slate-500">
              Utilise ta propre clé API Anthropic. Questions uniquement.
            </p>
          </button>
        </div>
      </div>

      {/* Claude Code Instructions */}
      <AnimatePresence>
        {useClaudeCode && bridgeAvailable === false && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="card bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-amber-800 dark:text-amber-400 mb-2">
                    Serveur bridge non détecté
                  </h3>
                  <p className="text-sm text-amber-700 dark:text-amber-500 mb-3">
                    Pour utiliser Claude Code, lance le serveur bridge dans un terminal :
                  </p>
                  <code className="block bg-slate-900 text-green-400 p-3 rounded-lg text-sm font-mono">
                    cd Culturege && npm run bridge
                  </code>
                  <button
                    onClick={checkBridgeHealth}
                    className="mt-3 text-sm text-primary font-medium hover:underline"
                  >
                    Vérifier la connexion
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* API Key Input (only for API mode) */}
      <AnimatePresence>
        {!useClaudeCode && showApiKeyInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="card">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Clé API Anthropic
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-ant-..."
                className="input"
              />
              {apiKey && (
                <button
                  onClick={() => setShowApiKeyInput(false)}
                  className="text-sm text-primary font-medium mt-2"
                >
                  Continuer
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Topic Input */}
      <div className="card">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Quel sujet veux-tu apprendre ?
        </label>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Ex: La guerre de Cent Ans, Les planètes du système solaire..."
          className="input"
          disabled={isGenerating}
        />
      </div>

      {/* Category Selection */}
      <div className="card">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Catégorie
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                setSelectedCategory(category)
                setSelectedSubcategory(null)
              }}
              disabled={isGenerating}
              className={`p-3 rounded-xl border-2 text-left transition-all ${
                selectedCategory?.id === category.id
                  ? 'border-primary bg-primary/5'
                  : 'border-slate-200 dark:border-slate-700 hover:border-primary/50'
              } disabled:opacity-50`}
            >
              <span className="text-xl">{category.icon}</span>
              <p className="text-sm font-medium text-slate-900 dark:text-white mt-1">
                {category.name}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Subcategory Selection */}
      <AnimatePresence>
        {selectedCategory?.subcategories && selectedCategory.subcategories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="card"
          >
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Sous-catégorie (optionnel)
            </label>
            <div className="flex flex-wrap gap-2">
              {selectedCategory.subcategories.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubcategory(
                    selectedSubcategory?.id === sub.id ? null : sub
                  )}
                  disabled={isGenerating}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
                    selectedSubcategory?.id === sub.id
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  } disabled:opacity-50`}
                >
                  <span>{sub.icon}</span>
                  <span>{sub.name}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Difficulty & Count (only for API mode) */}
      {!useClaudeCode && (
        <div className="grid grid-cols-2 gap-4">
          <div className="card">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Difficulté
            </label>
            <div className="flex gap-2">
              {[1, 2, 3].map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  disabled={isGenerating}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                    difficulty === level
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  } disabled:opacity-50`}
                >
                  {level === 1 ? 'Facile' : level === 2 ? 'Moyen' : 'Difficile'}
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Questions
            </label>
            <div className="flex gap-2">
              {[5, 10, 15].map((count) => (
                <button
                  key={count}
                  onClick={() => setQuestionCount(count)}
                  disabled={isGenerating}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    questionCount === count
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  } disabled:opacity-50`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* What you'll get */}
      {useClaudeCode && (
        <div className="card bg-primary/5 border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <span className="font-medium text-slate-900 dark:text-white">Ce que tu vas obtenir</span>
          </div>
          <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-success" />
              Une fiche complète avec images Wikimedia
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-success" />
              Timeline interactive avec histoires
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-success" />
              Contenu profond (deviens un connaisseur)
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-success" />
              10 questions QCM pour tester tes connaissances
            </li>
          </ul>
        </div>
      )}

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="card bg-error/10 border-error/20 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
            <p className="text-sm text-error">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={
          !topic.trim() ||
          !selectedCategory ||
          isGenerating ||
          (useClaudeCode && bridgeAvailable === false) ||
          (!useClaudeCode && !apiKey)
        }
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-lg flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-xl"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>{progress || 'Génération en cours...'}</span>
          </>
        ) : (
          <>
            <Sparkles className="w-6 h-6" />
            {useClaudeCode ? 'Générer fiche + questions' : `Générer ${questionCount} questions`}
          </>
        )}
      </button>

      {isGenerating && (
        <div className="text-center space-y-2">
          <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-secondary animate-shimmer" style={{ width: '100%' }} />
          </div>
          <p className="text-sm text-slate-500">
            {useClaudeCode
              ? 'Claude Code travaille sur ta fiche... Cela peut prendre 2-5 minutes.'
              : 'Génération via API... 30-60 secondes.'}
          </p>
        </div>
      )}
    </div>
  )
}

// Generate prompt for Claude API (simple mode)
function generatePrompt(topic, category, subcategory, difficulty, count) {
  const difficultyLabel = difficulty === 1 ? 'facile' : difficulty === 2 ? 'moyen' : 'difficile'

  return `Tu es un expert en création de QCM pédagogiques de haute qualité.

SUJET : ${topic}
CATÉGORIE : ${category.name}${subcategory ? ` > ${subcategory.name}` : ''}
DIFFICULTÉ : ${difficultyLabel}
NOMBRE : ${count} questions

Génère exactement ${count} questions QCM en JSON avec cette structure :

{
  "questions": [
    {
      "question": "[Question claire et précise]",
      "difficulty": ${difficulty},
      "answers": [
        { "id": "a1", "text": "[Réponse A]", "isCorrect": false, "feedback": "[Pourquoi c'est faux - optionnel]" },
        { "id": "a2", "text": "[Réponse B]", "isCorrect": true },
        { "id": "a3", "text": "[Réponse C]", "isCorrect": false, "feedback": "[Pourquoi c'est faux - optionnel]" },
        { "id": "a4", "text": "[Réponse D]", "isCorrect": false, "feedback": "[Pourquoi c'est faux - optionnel]" }
      ],
      "explanation": "[Explication détaillée de la bonne réponse - 2-3 phrases]",
      "anecdote": "[Fait mémorable ou surprenant lié à la question]",
      "tags": ["tag1", "tag2", "tag3"]
    }
  ]
}

RÈGLES IMPORTANTES :
1. Une seule bonne réponse par question
2. Les mauvaises réponses doivent être plausibles mais clairement fausses
3. Évite les formulations négatives ("Lequel n'est PAS...")
4. L'explication doit être instructive
5. L'anecdote doit être mémorable et aider à retenir
6. Varie les types de questions (dates, lieux, personnes, concepts...)

Réponds UNIQUEMENT avec le JSON, sans commentaires.`
}

export default NewTopicForm
