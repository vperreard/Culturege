import { motion } from 'framer-motion'
import { Star, Check, X } from 'lucide-react'

function QuestionCard({ question, category, subcategory, selectedAnswer, showFeedback, onSelectAnswer }) {
  const correctAnswer = question.answers.find(a => a.isCorrect)

  // Render difficulty stars
  const renderDifficulty = (level) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3].map(i => (
          <Star
            key={i}
            className={`w-3 h-3 ${i <= level ? 'text-yellow-500 fill-yellow-500' : 'text-slate-300'}`}
          />
        ))}
      </div>
    )
  }

  // Get answer button style
  const getAnswerStyle = (answer) => {
    if (!showFeedback) {
      return selectedAnswer === answer.id
        ? 'border-primary bg-primary/5'
        : 'border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-800'
    }

    if (answer.isCorrect) {
      return 'border-success bg-success/10'
    }

    if (selectedAnswer === answer.id && !answer.isCorrect) {
      return 'border-error bg-error/10'
    }

    return 'border-slate-200 dark:border-slate-700 opacity-50'
  }

  return (
    <div className="card space-y-4">
      {/* Question metadata */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {category && (
          <span
            className="px-2 py-1 rounded-full font-medium"
            style={{
              backgroundColor: `${category.color}15`,
              color: category.color
            }}
          >
            {category.icon} {category.name}
          </span>
        )}
        {subcategory && (
          <span className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
            {subcategory.icon} {subcategory.name}
          </span>
        )}
        <span className="ml-auto">{renderDifficulty(question.difficulty)}</span>
      </div>

      {/* Question text */}
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white leading-relaxed">
        {question.question}
      </h3>

      {/* Answers */}
      <div className="space-y-2 pt-2">
        {question.answers.map((answer, index) => {
          const letter = String.fromCharCode(65 + index) // A, B, C, D
          const isSelected = selectedAnswer === answer.id
          const isCorrect = answer.isCorrect

          return (
            <motion.button
              key={answer.id}
              whileTap={!showFeedback ? { scale: 0.98 } : {}}
              onClick={() => !showFeedback && onSelectAnswer(answer.id)}
              disabled={showFeedback}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all ${getAnswerStyle(answer)} disabled:cursor-default`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-medium text-sm flex-shrink-0 ${
                    showFeedback && isCorrect
                      ? 'bg-success text-white'
                      : showFeedback && isSelected && !isCorrect
                      ? 'bg-error text-white'
                      : isSelected
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {showFeedback && isCorrect ? (
                    <Check className="w-4 h-4" />
                  ) : showFeedback && isSelected && !isCorrect ? (
                    <X className="w-4 h-4" />
                  ) : (
                    letter
                  )}
                </span>
                <span className={`flex-1 ${showFeedback && !isCorrect && !isSelected ? 'text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                  {answer.text}
                </span>
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

export default QuestionCard
