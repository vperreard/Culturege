import { motion } from 'framer-motion'
import { Trophy, Star, Clock, Target, Check, X, Home, RotateCcw } from 'lucide-react'

function QuizResults({ questions, answers, categories, correctCount, totalTime, onFinish, onViewFiche }) {
  const score = Math.round((correctCount / questions.length) * 100)
  const isPerfect = correctCount === questions.length

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Get performance message
  const getMessage = () => {
    if (score === 100) return { emoji: '🏆', text: 'Parfait ! Tu es un expert !' }
    if (score >= 80) return { emoji: '🎉', text: 'Excellent ! Continue comme ça !' }
    if (score >= 60) return { emoji: '👍', text: 'Bien joué ! Tu progresses !' }
    if (score >= 40) return { emoji: '💪', text: 'Pas mal ! Encore un effort !' }
    return { emoji: '📚', text: 'Continue à réviser !' }
  }

  const message = getMessage()

  return (
    <div className="space-y-6">
      {/* Score Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`card text-center py-8 ${isPerfect ? 'bg-gradient-to-b from-yellow-50 to-white dark:from-yellow-900/20 dark:to-slate-800' : ''}`}
      >
        {isPerfect && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="mb-4"
          >
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto" />
          </motion.div>
        )}

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="text-5xl mb-2"
        >
          {message.emoji}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            {score}%
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 font-medium">
            {message.text}
          </p>
        </motion.div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-3 gap-3"
      >
        <div className="card p-4 text-center">
          <Target className="w-5 h-5 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {correctCount}/{questions.length}
          </p>
          <p className="text-xs text-slate-500">Bonnes réponses</p>
        </div>

        <div className="card p-4 text-center">
          <Clock className="w-5 h-5 text-secondary mx-auto mb-2" />
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {formatTime(totalTime)}
          </p>
          <p className="text-xs text-slate-500">Temps total</p>
        </div>

        <div className="card p-4 text-center">
          <Star className="w-5 h-5 text-yellow-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {Math.round(totalTime / questions.length)}s
          </p>
          <p className="text-xs text-slate-500">Moy./question</p>
        </div>
      </motion.div>

      {/* Questions Review */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
          Récapitulatif
        </h3>
        <div className="space-y-2">
          {questions.map((question, index) => {
            const answer = answers[index]
            const isCorrect = answer?.correct
            const category = categories.find(c => c.id === question.categoryId)

            return (
              <div
                key={question.id}
                className={`card p-3 flex items-center gap-3 ${isCorrect ? 'border-l-4 border-l-success' : 'border-l-4 border-l-error'}`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${isCorrect ? 'bg-success' : 'bg-error'}`}>
                  {isCorrect ? (
                    <Check className="w-3 h-3 text-white" />
                  ) : (
                    <X className="w-3 h-3 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-900 dark:text-white truncate">
                    {question.question}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span>{category?.icon}</span>
                    <span>
                      {isCorrect ? 'Correct' : `Réponse : ${question.answers.find(a => a.isCorrect)?.text}`}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex gap-3 pt-4"
      >
        <button
          onClick={onFinish}
          className="btn-primary flex-1 flex items-center justify-center gap-2"
        >
          <Home className="w-4 h-4" />
          Terminer
        </button>
      </motion.div>
    </div>
  )
}

export default QuizResults
