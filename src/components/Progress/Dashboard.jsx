import { motion } from 'framer-motion'
import { Flame, Target, Shuffle, ChevronRight, Clock, TrendingUp } from 'lucide-react'

function Dashboard({ data, categories, onStartQuiz, onViewFiche, onSelectCategory }) {
  const stats = data?.userProgress?.stats || {}
  const profile = data?.userProgress?.profile || {}
  const fiches = data?.fiches || []
  const questions = data?.questions || []

  // Calculate today's progress
  const today = new Date().toDateString()
  const todayAnswers = data?.userProgress?.questionHistory?.filter(
    h => new Date(h.answeredAt).toDateString() === today
  ) || []
  const dailyGoal = data?.userProgress?.settings?.dailyGoal || 20
  const todayProgress = Math.min((todayAnswers.length / dailyGoal) * 100, 100)

  // Get recent fiches
  const recentFiches = fiches
    .filter(f => data?.userProgress?.ficheProgress?.[f.id]?.lastStudied)
    .sort((a, b) => {
      const aDate = data?.userProgress?.ficheProgress?.[a.id]?.lastStudied
      const bDate = data?.userProgress?.ficheProgress?.[b.id]?.lastStudied
      return new Date(bDate) - new Date(aDate)
    })
    .slice(0, 3)

  // Calculate category progress
  const getCategoryProgress = (categoryId) => {
    const categoryQuestions = questions.filter(q => q.categoryId === categoryId)
    if (categoryQuestions.length === 0) return 0

    const answered = categoryQuestions.filter(q => q.timesAnswered > 0)
    const totalCorrect = answered.reduce((sum, q) => sum + (q.timesCorrect || 0), 0)
    const totalAnswered = answered.reduce((sum, q) => sum + (q.timesAnswered || 0), 0)

    return totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0
  }

  return (
    <div className="space-y-6">
      {/* Welcome & Streak */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Bonjour !
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Prêt à apprendre ?
          </p>
        </div>
        {profile.currentStreak > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 bg-orange-100 dark:bg-orange-900/30 rounded-full">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="font-bold text-orange-600 dark:text-orange-400">
              {profile.currentStreak} jour{profile.currentStreak > 1 ? 's' : ''}
            </span>
          </div>
        )}
      </motion.div>

      {/* Today's Progress */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <span className="font-medium text-slate-900 dark:text-white">Aujourd'hui</span>
          </div>
          <span className="text-sm text-slate-500">
            {todayAnswers.length} / {dailyGoal} questions
          </span>
        </div>
        <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${todayProgress}%` }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="h-full bg-primary rounded-full"
          />
        </div>
        {todayProgress >= 100 && (
          <p className="text-sm text-success mt-2 font-medium">
            Objectif atteint ! Bravo !
          </p>
        )}
      </motion.div>

      {/* Quick Quiz */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onStartQuiz({ mode: 'random', count: 10 })}
        className="w-full card-interactive bg-gradient-to-r from-primary to-secondary text-white"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Shuffle className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-lg">Quiz rapide</h3>
              <p className="text-white/80 text-sm">10 questions aléatoires</p>
            </div>
          </div>
          <ChevronRight className="w-6 h-6" />
        </div>
      </motion.button>

      {/* Categories */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <span>Catégories</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {categories.map((category, index) => {
            const progress = getCategoryProgress(category.id)
            const categoryQuestions = questions.filter(q => q.categoryId === category.id)

            return (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelectCategory(category)}
                disabled={categoryQuestions.length === 0}
                className="card-interactive p-4 text-left disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-2xl">{category.icon}</span>
                <h4 className="font-medium text-slate-900 dark:text-white mt-2 text-sm">
                  {category.name}
                </h4>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${progress}%`,
                        backgroundColor: category.color
                      }}
                    />
                  </div>
                  <span className="text-xs text-slate-500 font-medium">{progress}%</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {categoryQuestions.length} question{categoryQuestions.length > 1 ? 's' : ''}
                </p>
              </motion.button>
            )
          })}
        </div>
      </motion.div>

      {/* Recent Fiches */}
      {recentFiches.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
            Fiches récentes
          </h3>
          <div className="space-y-2">
            {recentFiches.map((fiche) => {
              const category = categories.find(c => c.id === fiche.categoryId)
              const progress = data?.userProgress?.ficheProgress?.[fiche.id]

              return (
                <motion.button
                  key={fiche.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onViewFiche(fiche.id)}
                  className="w-full card-interactive p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{category?.icon}</span>
                    <div className="text-left">
                      <h4 className="font-medium text-slate-900 dark:text-white text-sm">
                        {fiche.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Clock className="w-3 h-3" />
                        <span>{fiche.estimatedTime} min</span>
                        {progress?.masteryLevel > 0 && (
                          <>
                            <span>•</span>
                            <TrendingUp className="w-3 h-3" />
                            <span>{progress.masteryLevel}%</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </motion.button>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Global Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-3 gap-3"
      >
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-primary">{stats.totalQuestions || 0}</p>
          <p className="text-xs text-slate-500">Questions</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-success">{stats.averageScore || 0}%</p>
          <p className="text-xs text-slate-500">Score moyen</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-secondary">{stats.totalQuizCompleted || 0}</p>
          <p className="text-xs text-slate-500">Quiz</p>
        </div>
      </motion.div>
    </div>
  )
}

export default Dashboard
