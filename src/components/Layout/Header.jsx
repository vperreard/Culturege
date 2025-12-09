import { ArrowLeft, Settings, Download } from 'lucide-react'
import { motion } from 'framer-motion'

function Header({ currentView, onBack, onSettings }) {
  const showBack = currentView !== 'dashboard'
  const title = getTitle(currentView)

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 safe-area-top">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBack ? (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="p-2 -ml-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              aria-label="Retour"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </motion.button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎓</span>
              <span className="font-bold text-lg text-slate-900 dark:text-white">CultureMaster</span>
            </div>
          )}

          {showBack && (
            <h1 className="font-semibold text-slate-900 dark:text-white">
              {title}
            </h1>
          )}
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onSettings}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            aria-label="Paramètres"
          >
            <Settings className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </motion.button>
        </div>
      </div>
    </header>
  )
}

function getTitle(view) {
  const titles = {
    'dashboard': 'Accueil',
    'quiz-selector': 'Choisir un quiz',
    'quiz': 'Quiz',
    'fiches': 'Fiches',
    'fiche-viewer': 'Fiche',
    'generator': 'Nouveau sujet',
    'settings': 'Paramètres',
    'stats': 'Statistiques'
  }
  return titles[view] || ''
}

export default Header
