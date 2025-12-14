import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, AlertCircle, Loader2, Check, Key, ChevronDown } from 'lucide-react'

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

  const handleGenerate = async () => {
    if (!topic.trim() || !selectedCategory || !apiKey) return

    setIsGenerating(true)
    setError(null)

    try {
      // Save API key
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

      // Parse JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Format de réponse invalide')
      }

      const generated = JSON.parse(jsonMatch[0])

      // Add metadata to questions
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary text-white mb-4">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Générer du contenu
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Utilise l'IA pour créer des questions sur n'importe quel sujet
        </p>
      </div>

      {/* API Key */}
      {showApiKeyInput && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
        >
          <div className="flex items-start gap-3">
            <Key className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-amber-800 dark:text-amber-400 mb-2">
                Clé API Anthropic requise
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-500 mb-3">
                Pour générer du contenu, tu as besoin d'une clé API Claude.
                Elle sera stockée uniquement sur ton appareil.
              </p>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-ant-..."
                className="input bg-white"
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
          </div>
        </motion.div>
      )}

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
              className={`p-3 rounded-xl border-2 text-left transition-all ${
                selectedCategory?.id === category.id
                  ? 'border-primary bg-primary/5'
                  : 'border-slate-200 dark:border-slate-700 hover:border-primary/50'
              }`}
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
      {selectedCategory?.subcategories && selectedCategory.subcategories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
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
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
                  selectedSubcategory?.id === sub.id
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>{sub.icon}</span>
                <span>{sub.name}</span>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Difficulty & Count */}
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
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                  difficulty === level
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
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
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  questionCount === count
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {count}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="card bg-error/10 border-error/20 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
          <p className="text-sm text-error">{error}</p>
        </div>
      )}

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={!topic.trim() || !selectedCategory || !apiKey || isGenerating}
        className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Génération en cours...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Générer {questionCount} questions
          </>
        )}
      </button>

      {isGenerating && (
        <p className="text-center text-sm text-slate-500">
          Cela peut prendre 30-60 secondes...
        </p>
      )}
    </div>
  )
}

// Generate prompt for Claude
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
