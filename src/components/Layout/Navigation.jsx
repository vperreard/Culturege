import { Home, BookOpen, PlusCircle, BarChart3, User } from 'lucide-react'
import { motion } from 'framer-motion'

const navItems = [
  { id: 'dashboard', icon: Home, label: 'Accueil' },
  { id: 'fiches', icon: BookOpen, label: 'Fiches' },
  { id: 'generator', icon: PlusCircle, label: 'Nouveau' },
  { id: 'stats', icon: BarChart3, label: 'Stats' },
  { id: 'settings', icon: User, label: 'Profil' }
]

function Navigation({ currentView, onNavigate }) {
  // Hide navigation during quiz
  if (currentView === 'quiz') {
    return null
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 safe-area-bottom z-50">
      <div className="max-w-4xl mx-auto px-2">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const isActive = currentView === item.id ||
              (item.id === 'dashboard' && currentView === 'quiz-selector')
            const Icon = item.icon

            return (
              <motion.button
                key={item.id}
                whileTap={{ scale: 0.9 }}
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center justify-center w-16 h-14 rounded-lg transition-colors ${
                  isActive
                    ? 'text-primary'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5]' : ''}`} />
                <span className={`text-xs mt-1 ${isActive ? 'font-medium' : ''}`}>
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-0 w-12 h-0.5 bg-primary rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

export default Navigation
