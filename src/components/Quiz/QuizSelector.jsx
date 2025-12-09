import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Play, Star, Clock, Filter } from 'lucide-react'

function QuizSelector({ category, categories, questions, onStartQuiz, onBack }) {
  const [difficulty, setDifficulty] = useState(0) // 0 = all, 1 = easy, 2 = medium, 3 = hard
  const [subcategory, setSubcategory] = useState(null)
  const [questionCount, setQuestionCount] = useState(10)

  // Filter questions
  const filteredQuestions = questions.filter(q => {
    if (category && q.categoryId !== category.id) return false
    if (subcategory && q.subcategoryId !== subcategory.id) return false
    if (difficulty > 0 && q.difficulty !== difficulty) return false
    return true
  })

  const handleStart = () => {
    if (filteredQuestions.length === 0) return

    const selectedQuestions = shuffleArray([...filteredQuestions]).slice(0, questionCount)

    onStartQuiz({
      mode: 'category',
      categoryId: category?.id,
      subcategoryId: subcategory?.id,
      difficulty,
      questions: selectedQuestions.map(q => q.id),
      count: Math.min(questionCount, filteredQuestions.length)
    })
  }

  const difficultyOptions = [
    { value: 0, label: 'Toutes', icon: null },
    { value: 1, label: 'Facile', icon: '⭐' },
    { value: 2, label: 'Moyen', icon: '⭐⭐' },
    { value: 3, label: 'Difficile', icon: '⭐⭐⭐' }
  ]

  const countOptions = [5, 10, 15, 20]

  return (
    <div className="space-y-6">
      {/* Category Header */}
      {category && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 text-center"
          style={{ borderTop: `4px solid ${category.color}` }}
        >
          <span className="text-4xl">{category.icon}</span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-2">
            {category.name}
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            {filteredQuestions.length} question{filteredQuestions.length > 1 ? 's' : ''} disponible{filteredQuestions.length > 1 ? 's' : ''}
          </p>
        </motion.div>
      )}

      {/* Subcategories */}
      {category?.subcategories && category.subcategories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Sous-catégorie
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSubcategory(null)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                !subcategory
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Toutes
            </button>
            {category.subcategories.map((sub) => {
              const subQuestions = questions.filter(
                q => q.categoryId === category.id && q.subcategoryId === sub.id
              )
              if (subQuestions.length === 0) return null

              return (
                <button
                  key={sub.id}
                  onClick={() => setSubcategory(sub)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                    subcategory?.id === sub.id
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <span>{sub.icon}</span>
                  <span>{sub.name}</span>
                  <span className="opacity-60">({subQuestions.length})</span>
                </button>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Difficulty */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <Star className="w-4 h-4" />
          Difficulté
        </h3>
        <div className="flex flex-wrap gap-2">
          {difficultyOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDifficulty(opt.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                difficulty === opt.value
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {opt.icon && <span className="mr-1">{opt.icon}</span>}
              {opt.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Question Count */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Nombre de questions
        </h3>
        <div className="flex gap-2">
          {countOptions.map((count) => (
            <button
              key={count}
              onClick={() => setQuestionCount(count)}
              disabled={filteredQuestions.length < count}
              className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                questionCount === count
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {count}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Start Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="pt-4"
      >
        <button
          onClick={handleStart}
          disabled={filteredQuestions.length === 0}
          className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className="w-5 h-5" />
          Commencer le quiz
        </button>
        {filteredQuestions.length === 0 && (
          <p className="text-center text-slate-500 text-sm mt-2">
            Aucune question disponible avec ces critères
          </p>
        )}
      </motion.div>
    </div>
  )
}

function shuffleArray(array) {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

export default QuizSelector
