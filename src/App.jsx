import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Components
import Header from './components/Layout/Header'
import Navigation from './components/Layout/Navigation'
import Dashboard from './components/Progress/Dashboard'
import QuizSelector from './components/Quiz/QuizSelector'
import QuizEngine from './components/Quiz/QuizEngine'
import FicheList from './components/Fiches/FicheList'
import FicheViewer from './components/Fiches/FicheViewer'
import NewTopicForm from './components/Generator/NewTopicForm'
import Settings from './components/Settings/Settings'
import Welcome from './components/Welcome/Welcome'

// Hooks
import { useStorage } from './hooks/useStorage'

// Data
import categoriesData from './data/categories.json'
import initialQuestionsData from './data/initialQuestions.json'
import initialFichesData from './data/initialFiches.json'

function App() {
  const { data, updateData, isLoaded, isFirstVisit, completeFirstVisit } = useStorage()
  const [currentView, setCurrentView] = useState('dashboard')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedFiche, setSelectedFiche] = useState(null)
  const [quizConfig, setQuizConfig] = useState(null)

  // Initialize data if first visit
  useEffect(() => {
    if (isLoaded && isFirstVisit) {
      updateData({
        questions: initialQuestionsData.questions,
        fiches: initialFichesData.fiches,
        categories: categoriesData.categories,
        userProgress: {
          profile: {
            startDate: new Date().toISOString(),
            totalStudyTime: 0,
            currentStreak: 0,
            longestStreak: 0,
            lastActive: new Date().toISOString()
          },
          stats: {
            totalQuestions: 0,
            correctAnswers: 0,
            averageScore: 0,
            totalFichesStudied: 0,
            totalTopicsGenerated: 0,
            perfectQuizzes: 0,
            totalQuizCompleted: 0
          },
          categoryProgress: {},
          questionHistory: [],
          ficheProgress: {},
          achievements: [],
          settings: {
            theme: 'light',
            dailyGoal: 20,
            notificationsEnabled: false,
            preferredDifficulty: 2,
            soundEnabled: true,
            animationsEnabled: true
          }
        }
      })
    }
  }, [isLoaded, isFirstVisit, updateData])

  // Update last active date and check streak
  useEffect(() => {
    if (isLoaded && data?.userProgress) {
      const today = new Date().toDateString()
      const lastActive = new Date(data.userProgress.profile.lastActive).toDateString()

      if (today !== lastActive) {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const wasYesterday = yesterday.toDateString() === lastActive

        updateData({
          userProgress: {
            ...data.userProgress,
            profile: {
              ...data.userProgress.profile,
              lastActive: new Date().toISOString(),
              currentStreak: wasYesterday ? data.userProgress.profile.currentStreak + 1 : 1,
              longestStreak: Math.max(
                data.userProgress.profile.longestStreak,
                wasYesterday ? data.userProgress.profile.currentStreak + 1 : 1
              )
            }
          }
        })
      }
    }
  }, [isLoaded, data?.userProgress?.profile?.lastActive])

  // Handle navigation
  const navigateTo = (view, params = {}) => {
    setSelectedCategory(params.category || null)
    setSelectedFiche(params.fiche || null)
    setQuizConfig(params.quizConfig || null)
    setCurrentView(view)
  }

  // Start quiz
  const startQuiz = (config) => {
    setQuizConfig(config)
    setCurrentView('quiz')
  }

  // View fiche
  const viewFiche = (ficheId) => {
    const fiche = data?.fiches?.find(f => f.id === ficheId)
    if (fiche) {
      setSelectedFiche(fiche)
      setCurrentView('fiche-viewer')
    }
  }

  // Handle quiz completion
  const onQuizComplete = (results) => {
    const { questions, answers, score, correctCount, totalTime } = results

    // Update question statistics
    const updatedQuestions = data.questions.map(q => {
      const answer = answers.find(a => a.questionId === q.id)
      if (answer) {
        return {
          ...q,
          timesAnswered: (q.timesAnswered || 0) + 1,
          timesCorrect: (q.timesCorrect || 0) + (answer.correct ? 1 : 0)
        }
      }
      return q
    })

    // Update user progress
    const totalQuestions = (data.userProgress.stats.totalQuestions || 0) + questions.length
    const correctAnswers = (data.userProgress.stats.correctAnswers || 0) + correctCount
    const isPerfect = correctCount === questions.length

    updateData({
      questions: updatedQuestions,
      userProgress: {
        ...data.userProgress,
        stats: {
          ...data.userProgress.stats,
          totalQuestions,
          correctAnswers,
          averageScore: Math.round((correctAnswers / totalQuestions) * 100),
          totalQuizCompleted: (data.userProgress.stats.totalQuizCompleted || 0) + 1,
          perfectQuizzes: (data.userProgress.stats.perfectQuizzes || 0) + (isPerfect ? 1 : 0)
        },
        questionHistory: [
          ...data.userProgress.questionHistory,
          ...answers.map(a => ({
            questionId: a.questionId,
            answeredAt: new Date().toISOString(),
            correct: a.correct,
            timeSpent: a.timeSpent,
            selectedAnswerId: a.selectedAnswerId
          }))
        ]
      }
    })

    navigateTo('dashboard')
  }

  // Loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Chargement...</p>
        </div>
      </div>
    )
  }

  // Welcome screen for first visit
  if (isFirstVisit) {
    return (
      <Welcome
        onStart={completeFirstVisit}
        onImport={(importedData) => {
          updateData(importedData)
          completeFirstVisit()
        }}
      />
    )
  }

  // Main app
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 pb-20">
      <Header
        currentView={currentView}
        onBack={() => navigateTo('dashboard')}
        onSettings={() => navigateTo('settings')}
      />

      <main className="max-w-4xl mx-auto px-4 pt-4 pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {currentView === 'dashboard' && (
              <Dashboard
                data={data}
                categories={categoriesData.categories}
                onStartQuiz={startQuiz}
                onViewFiche={viewFiche}
                onSelectCategory={(cat) => navigateTo('quiz-selector', { category: cat })}
              />
            )}

            {currentView === 'quiz-selector' && (
              <QuizSelector
                category={selectedCategory}
                categories={categoriesData.categories}
                questions={data?.questions || []}
                onStartQuiz={startQuiz}
                onBack={() => navigateTo('dashboard')}
              />
            )}

            {currentView === 'quiz' && quizConfig && (
              <QuizEngine
                config={quizConfig}
                questions={data?.questions || []}
                categories={categoriesData.categories}
                onComplete={onQuizComplete}
                onExit={() => navigateTo('dashboard')}
                onViewFiche={viewFiche}
              />
            )}

            {currentView === 'fiches' && (
              <FicheList
                fiches={data?.fiches || []}
                categories={categoriesData.categories}
                ficheProgress={data?.userProgress?.ficheProgress || {}}
                onSelectFiche={viewFiche}
              />
            )}

            {currentView === 'fiche-viewer' && selectedFiche && (
              <FicheViewer
                fiche={selectedFiche}
                category={categoriesData.categories.find(c => c.id === selectedFiche.categoryId)}
                progress={data?.userProgress?.ficheProgress?.[selectedFiche.id] || {}}
                onBack={() => navigateTo('fiches')}
                onStartQuiz={(ficheQuestions) => startQuiz({
                  questions: ficheQuestions,
                  mode: 'fiche',
                  ficheId: selectedFiche.id
                })}
                onUpdateProgress={(progress) => {
                  updateData({
                    userProgress: {
                      ...data.userProgress,
                      ficheProgress: {
                        ...data.userProgress.ficheProgress,
                        [selectedFiche.id]: progress
                      }
                    }
                  })
                }}
              />
            )}

            {currentView === 'generator' && (
              <NewTopicForm
                categories={categoriesData.categories}
                onGenerated={(newContent) => {
                  updateData({
                    questions: [...(data?.questions || []), ...newContent.questions],
                    fiches: newContent.fiche ? [...(data?.fiches || []), newContent.fiche] : data?.fiches,
                    userProgress: {
                      ...data.userProgress,
                      stats: {
                        ...data.userProgress.stats,
                        totalTopicsGenerated: (data.userProgress.stats.totalTopicsGenerated || 0) + 1
                      }
                    }
                  })
                  navigateTo('dashboard')
                }}
                onBack={() => navigateTo('dashboard')}
              />
            )}

            {currentView === 'settings' && (
              <Settings
                data={data}
                onUpdateSettings={(settings) => {
                  updateData({
                    userProgress: {
                      ...data.userProgress,
                      settings
                    }
                  })
                }}
                onExport={() => data}
                onImport={(importedData) => updateData(importedData)}
                onBack={() => navigateTo('dashboard')}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <Navigation
        currentView={currentView}
        onNavigate={navigateTo}
      />
    </div>
  )
}

export default App
