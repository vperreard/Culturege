import { motion } from 'framer-motion'
import { Check, X, Lightbulb, BookOpen, ChevronRight } from 'lucide-react'

function AnswerFeedback({ question, selectedAnswerId, onNext, onViewFiche, isLast }) {
  const correctAnswer = question.answers.find(a => a.isCorrect)
  const selectedAnswer = question.answers.find(a => a.id === selectedAnswerId)
  const isCorrect = selectedAnswer?.isCorrect

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`card border-2 ${isCorrect ? 'border-success bg-success/5' : 'border-error bg-error/5'}`}
    >
      {/* Result header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isCorrect ? 'bg-success' : 'bg-error'}`}>
          {isCorrect ? (
            <Check className="w-5 h-5 text-white" />
          ) : (
            <X className="w-5 h-5 text-white" />
          )}
        </div>
        <div>
          <h4 className={`font-bold text-lg ${isCorrect ? 'text-success' : 'text-error'}`}>
            {isCorrect ? 'Correct !' : 'Incorrect'}
          </h4>
          {!isCorrect && (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              La bonne réponse était : <strong>{correctAnswer.text}</strong>
            </p>
          )}
        </div>
      </div>

      {/* Wrong answer feedback */}
      {!isCorrect && selectedAnswer?.feedback && (
        <div className="bg-error/10 rounded-lg p-3 mb-4">
          <p className="text-sm text-error">
            {selectedAnswer.feedback}
          </p>
        </div>
      )}

      {/* Explanation */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 mb-4">
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
          {question.explanation}
        </p>
      </div>

      {/* Anecdote */}
      {question.anecdote && (
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 mb-4 border border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-2">
            <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="font-medium text-amber-700 dark:text-amber-400 mb-1">Le savais-tu ?</h5>
              <p className="text-sm text-amber-800 dark:text-amber-300">
                {question.anecdote}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-2">
        {onViewFiche && (
          <button
            onClick={onViewFiche}
            className="btn-secondary flex-1 flex items-center justify-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            Voir la fiche
          </button>
        )}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onNext}
          className="btn-primary flex-1 flex items-center justify-center gap-2"
        >
          {isLast ? 'Voir les résultats' : 'Question suivante'}
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  )
}

export default AnswerFeedback
