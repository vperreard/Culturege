import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Clock, ChevronRight, BookOpen } from 'lucide-react'
import QuestionCard from './QuestionCard'
import AnswerFeedback from './AnswerFeedback'
import QuizResults from './QuizResults'

function QuizEngine({ config, questions: allQuestions, categories, onComplete, onExit, onViewFiche }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState([])
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const [startTime] = useState(Date.now())
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())

  // Get quiz questions
  const quizQuestions = config.questions
    ? config.questions.map(id => allQuestions.find(q => q.id === id)).filter(Boolean)
    : shuffleArray(
        config.categoryId
          ? allQuestions.filter(q => q.categoryId === config.categoryId)
          : allQuestions
      ).slice(0, config.count || 10)

  const currentQuestion = quizQuestions[currentIndex]
  const progress = ((currentIndex) / quizQuestions.length) * 100
  const elapsedTime = Math.floor((Date.now() - startTime) / 1000)

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Update timer
  const [displayTime, setDisplayTime] = useState('0:00')
  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayTime(formatTime(Math.floor((Date.now() - startTime) / 1000)))
    }, 1000)
    return () => clearInterval(interval)
  }, [startTime])

  // Handle answer selection
  const handleAnswer = useCallback((answerId) => {
    if (showFeedback) return

    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000)
    const correctAnswer = currentQuestion.answers.find(a => a.isCorrect)
    const isCorrect = answerId === correctAnswer.id

    setSelectedAnswer(answerId)
    setShowFeedback(true)

    setAnswers(prev => [...prev, {
      questionId: currentQuestion.id,
      selectedAnswerId: answerId,
      correct: isCorrect,
      timeSpent
    }])
  }, [showFeedback, currentQuestion, questionStartTime])

  // Handle next question
  const handleNext = useCallback(() => {
    if (currentIndex < quizQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setSelectedAnswer(null)
      setShowFeedback(false)
      setQuestionStartTime(Date.now())
    } else {
      setIsFinished(true)
    }
  }, [currentIndex, quizQuestions.length])

  // Handle quiz completion
  const handleComplete = useCallback(() => {
    const correctCount = answers.filter(a => a.correct).length
    const score = Math.round((correctCount / quizQuestions.length) * 100)

    onComplete({
      questions: quizQuestions,
      answers,
      score,
      correctCount,
      totalTime: Math.floor((Date.now() - startTime) / 1000)
    })
  }, [answers, quizQuestions, startTime, onComplete])

  // Show results
  if (isFinished) {
    const correctCount = answers.filter(a => a.correct).length
    return (
      <QuizResults
        questions={quizQuestions}
        answers={answers}
        categories={categories}
        correctCount={correctCount}
        totalTime={Math.floor((Date.now() - startTime) / 1000)}
        onFinish={handleComplete}
        onViewFiche={onViewFiche}
      />
    )
  }

  if (!currentQuestion) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Aucune question disponible</p>
        <button onClick={onExit} className="btn-primary mt-4">
          Retour
        </button>
      </div>
    )
  }

  const category = categories.find(c => c.id === currentQuestion.categoryId)
  const subcategory = category?.subcategories?.find(s => s.id === currentQuestion.subcategoryId)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onExit}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5 text-slate-500" />
        </button>

        <div className="flex items-center gap-4 text-sm text-slate-500">
          <span className="font-medium">
            {currentIndex + 1}/{quizQuestions.length}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {displayTime}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-primary rounded-full"
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <QuestionCard
            question={currentQuestion}
            category={category}
            subcategory={subcategory}
            selectedAnswer={selectedAnswer}
            showFeedback={showFeedback}
            onSelectAnswer={handleAnswer}
          />
        </motion.div>
      </AnimatePresence>

      {/* Feedback */}
      <AnimatePresence>
        {showFeedback && (
          <AnswerFeedback
            question={currentQuestion}
            selectedAnswerId={selectedAnswer}
            onNext={handleNext}
            onViewFiche={currentQuestion.ficheId ? () => onViewFiche(currentQuestion.ficheId) : null}
            isLast={currentIndex === quizQuestions.length - 1}
          />
        )}
      </AnimatePresence>
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

export default QuizEngine
