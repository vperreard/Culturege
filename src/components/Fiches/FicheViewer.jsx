import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Clock, Star, Target, Lightbulb, Quote, CheckCircle,
  ChevronDown, ChevronUp, Play, BookOpen
} from 'lucide-react'
import FicheSection from './FicheSection'

function FicheViewer({ fiche, category, progress, onBack, onStartQuiz, onUpdateProgress }) {
  const [expandedSections, setExpandedSections] = useState(new Set())
  const [completedSections, setCompletedSections] = useState(new Set(progress.completedSections || []))

  // Calculate mastery based on completed sections
  const totalSections = fiche.sections.length
  const completedCount = completedSections.size
  const masteryLevel = Math.round((completedCount / totalSections) * 100)

  // Update progress when completed sections change
  useEffect(() => {
    onUpdateProgress({
      ...progress,
      lastStudied: new Date().toISOString(),
      studyCount: (progress.studyCount || 0) + (completedSections.size > 0 ? 1 : 0),
      completedSections: Array.from(completedSections),
      masteryLevel
    })
  }, [completedSections])

  // Toggle section expansion
  const toggleSection = (sectionId) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId)
      } else {
        newSet.add(sectionId)
      }
      return newSet
    })
  }

  // Mark section as completed
  const markSectionComplete = (sectionId) => {
    setCompletedSections(prev => new Set([...prev, sectionId]))
  }

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

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
        style={{ borderTop: `4px solid ${category?.color || '#2563eb'}` }}
      >
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
          <span className="text-lg">{category?.icon}</span>
          <span>{category?.name}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {fiche.estimatedTime} min
          </span>
          <span>•</span>
          {renderDifficulty(fiche.difficulty)}
        </div>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
          {fiche.title}
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          {fiche.subtitle}
        </p>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-slate-500">Progression</span>
            <span className="font-medium text-primary">{masteryLevel}%</span>
          </div>
          <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${masteryLevel}%` }}
              className="h-full bg-primary rounded-full"
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </motion.div>

      {/* Objectives */}
      {fiche.objectives && fiche.objectives.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card bg-primary/5 border-primary/20"
        >
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-slate-900 dark:text-white">Objectifs</h3>
          </div>
          <ul className="space-y-2">
            {fiche.objectives.map((objective, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                <span className="text-primary mt-0.5">•</span>
                {objective}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Sections */}
      <div className="space-y-4">
        {fiche.sections.map((section, index) => {
          const isExpanded = expandedSections.has(section.id)
          const isCompleted = completedSections.has(section.id)

          return (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="card"
            >
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  {isCompleted && (
                    <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                  )}
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    {section.title}
                  </h3>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700 mt-4">
                      <FicheSection section={section} />

                      {!isCompleted && (
                        <button
                          onClick={() => markSectionComplete(section.id)}
                          className="mt-4 text-sm text-primary font-medium flex items-center gap-1 hover:underline"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Marquer comme lu
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>

      {/* Key Points */}
      {fiche.keyPoints && fiche.keyPoints.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
        >
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5 text-amber-600" />
            <h3 className="font-semibold text-amber-800 dark:text-amber-400">Points clés</h3>
          </div>
          <ul className="space-y-2">
            {fiche.keyPoints.map((point, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-amber-900 dark:text-amber-300">
                <span className="text-amber-500 mt-0.5">✓</span>
                {point}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Mnemonics */}
      {fiche.mnemonics && fiche.mnemonics.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🧠</span>
            <h3 className="font-semibold text-purple-800 dark:text-purple-400">Moyens mnémotechniques</h3>
          </div>
          <div className="space-y-3">
            {fiche.mnemonics.map((mnemonic, index) => (
              <div key={index} className="text-sm">
                <p className="font-medium text-purple-900 dark:text-purple-300">
                  {mnemonic.content}
                </p>
                <p className="text-purple-700 dark:text-purple-400 text-xs mt-1">
                  → {mnemonic.explanation}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Quiz Button */}
      {fiche.quiz && fiche.quiz.length > 0 && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onStartQuiz(fiche.quiz)}
          className="w-full btn-primary py-4 flex items-center justify-center gap-2"
        >
          <Play className="w-5 h-5" />
          Tester mes connaissances ({fiche.quiz.length} questions)
        </motion.button>
      )}
    </div>
  )
}

export default FicheViewer
