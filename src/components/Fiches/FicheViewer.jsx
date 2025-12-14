import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Clock, Star, Target, Lightbulb, Quote, CheckCircle,
  ChevronDown, ChevronUp, Play, BookOpen, Sparkles, Brain, MapPin, ExternalLink
} from 'lucide-react'
import FicheSection from './FicheSection'

function FicheViewer({ fiche, category, progress, onBack, onStartQuiz, onUpdateProgress }) {
  const [expandedSections, setExpandedSections] = useState(new Set())
  const [completedSections, setCompletedSections] = useState(new Set(progress.completedSections || []))
  const [showAllSections, setShowAllSections] = useState(false)

  // Calculate mastery based on completed sections
  const totalSections = fiche.sections.length
  const completedCount = completedSections.size
  const masteryLevel = Math.round((completedCount / totalSections) * 100)

  // Get category-specific gradient
  const getCategoryGradient = () => {
    const gradients = {
      'histoire': 'from-amber-900/90 via-amber-800/70 to-transparent',
      'sciences': 'from-cyan-900/90 via-cyan-800/70 to-transparent',
      'politique': 'from-blue-900/90 via-blue-800/70 to-transparent',
      'art': 'from-purple-900/90 via-purple-800/70 to-transparent',
    }
    return gradients[fiche.categoryId] || 'from-slate-900/90 via-slate-800/70 to-transparent'
  }

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

  // Expand all sections
  const expandAllSections = () => {
    if (showAllSections) {
      setExpandedSections(new Set())
    } else {
      setExpandedSections(new Set(fiche.sections.map(s => s.id)))
    }
    setShowAllSections(!showAllSections)
  }

  // Render difficulty stars
  const renderDifficulty = (level) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3].map(i => (
          <Star
            key={i}
            className={`w-4 h-4 ${i <= level ? 'text-yellow-400 fill-yellow-400' : 'text-white/30'}`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6 -mt-4">
      {/* Hero Section with Image */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden shadow-2xl"
      >
        {/* Hero Image */}
        {fiche.heroImage ? (
          <div className="relative h-72 sm:h-80">
            <img
              src={fiche.heroImage}
              alt={fiche.title}
              className="w-full h-full object-cover"
            />
            <div className={`absolute inset-0 bg-gradient-to-t ${getCategoryGradient()}`} />
          </div>
        ) : (
          <div className={`h-48 bg-gradient-to-br ${
            fiche.categoryId === 'histoire' ? 'from-amber-700 to-amber-900' :
            fiche.categoryId === 'sciences' ? 'from-cyan-700 to-cyan-900' :
            fiche.categoryId === 'art' ? 'from-purple-700 to-purple-900' :
            'from-blue-700 to-blue-900'
          }`} />
        )}

        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          {/* Category badge */}
          <div className="flex items-center gap-3 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium">
              <span className="text-lg">{category?.icon}</span>
              {category?.name}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs">
              <Clock className="w-3 h-3" />
              {fiche.estimatedTime} min
            </span>
            <span className="inline-flex items-center gap-1">
              {renderDifficulty(fiche.difficulty)}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 drop-shadow-lg">
            {fiche.title}
          </h1>
          <p className="text-white/80 text-lg">
            {fiche.subtitle}
          </p>
        </div>
      </motion.div>

      {/* Progress Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="stat-card p-5"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-slate-600 dark:text-slate-400 font-medium">Votre progression</span>
          <span className="stat-value text-2xl">{masteryLevel}%</span>
        </div>
        <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${masteryLevel}%` }}
            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
        <p className="text-xs text-slate-500 mt-2">
          {completedCount}/{totalSections} sections complétées
        </p>
      </motion.div>

      {/* Objectives */}
      {fiche.objectives && fiche.objectives.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card p-5 bg-gradient-to-br from-primary/10 to-secondary/5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-primary animate-pulse-soft" />
            <h3 className="font-bold text-slate-900 dark:text-white">Ce que vous allez apprendre</h3>
          </div>
          <ul className="space-y-3">
            {fiche.objectives.map((objective, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="flex items-start gap-3 text-slate-700 dark:text-slate-300"
              >
                <Sparkles className="w-4 h-4 text-secondary mt-1 flex-shrink-0" />
                {objective}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Section toggle button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={expandAllSections}
        className="w-full py-3 text-center text-primary font-medium hover:bg-primary/5 rounded-lg transition-colors"
      >
        {showAllSections ? 'Réduire toutes les sections' : 'Développer toutes les sections'}
      </motion.button>

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
              transition={{ delay: 0.2 + index * 0.05 }}
              className={`rounded-2xl overflow-hidden transition-all ${
                isExpanded
                  ? 'shadow-xl ring-2 ring-primary/20'
                  : 'shadow-md hover:shadow-lg'
              } ${
                isCompleted
                  ? 'bg-gradient-to-r from-success/5 to-white dark:to-slate-800'
                  : 'bg-white dark:bg-slate-800'
              }`}
            >
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between text-left p-5"
              >
                <div className="flex items-center gap-3">
                  {isCompleted ? (
                    <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center animate-scale-in">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                      <span className="text-sm font-bold text-slate-500">{index + 1}</span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {section.title}
                    </h3>
                    <span className="text-xs text-slate-500 capitalize">{section.type}</span>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                </motion.div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 border-t border-slate-200 dark:border-slate-700 pt-5">
                      <FicheSection section={section} categoryId={fiche.categoryId} />

                      {!isCompleted && (
                        <motion.button
                          whileTap={{ scale: 0.98 }}
                          onClick={(e) => {
                            e.stopPropagation()
                            markSectionComplete(section.id)
                          }}
                          className="mt-6 w-full py-3 text-primary font-medium flex items-center justify-center gap-2 bg-primary/5 hover:bg-primary/10 rounded-xl transition-colors"
                        >
                          <CheckCircle className="w-5 h-5" />
                          Marquer comme lu
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>

      {/* Key Points - Premium Card */}
      {fiche.keyPoints && fiche.keyPoints.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative overflow-hidden rounded-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-yellow-500/20" />
          <div className="relative p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center animate-glow">
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-xl text-slate-900 dark:text-white">Points clés à retenir</h3>
            </div>
            <div className="space-y-3">
              {fiche.keyPoints.map((point, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="relative pl-6"
                >
                  {/* Keypoint badge */}
                  <div className={`absolute -left-1 top-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                    index % 3 === 0 ? 'bg-primary' :
                    index % 3 === 1 ? 'bg-secondary' : 'bg-amber-500'
                  }`}>
                    {index + 1}
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 pl-4 border-l-2 border-amber-300">
                    {point}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Mnemonics - Brain Card */}
      {fiche.mnemonics && fiche.mnemonics.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative overflow-hidden rounded-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-violet-500/10 to-indigo-500/20" />
          <div className="relative p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center animate-float">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-xl text-slate-900 dark:text-white">Moyens mnémotechniques</h3>
            </div>
            <div className="space-y-4">
              {fiche.mnemonics.map((mnemonic, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="glass-card p-4"
                >
                  <p className="font-medium text-purple-900 dark:text-purple-300 text-lg">
                    {mnemonic.content}
                  </p>
                  <p className="text-purple-700 dark:text-purple-400 text-sm mt-2 flex items-start gap-2">
                    <ArrowLeft className="w-4 h-4 rotate-180 mt-0.5 flex-shrink-0" />
                    {mnemonic.explanation}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Related Topics */}
      {fiche.relatedTopics && fiche.relatedTopics.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <h3 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <ExternalLink className="w-5 h-5 text-primary" />
            Pour aller plus loin
          </h3>
          <div className="flex flex-wrap gap-2">
            {fiche.relatedTopics.map((topic, index) => (
              <span
                key={index}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
              >
                {topic}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Sources */}
      {fiche.sources && fiche.sources.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="text-xs text-slate-500 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl"
        >
          <p className="font-semibold mb-2">Sources :</p>
          <ul className="space-y-1">
            {fiche.sources.map((source, index) => (
              <li key={index}>
                {source.url ? (
                  <a href={source.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                    {source.titre || source.title || source}
                  </a>
                ) : (
                  <span>{source.titre || source.title || source}</span>
                )}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Quiz Button */}
      {fiche.quiz && fiche.quiz.length > 0 && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onStartQuiz(fiche.quiz)}
          className="w-full py-5 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-lg flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl transition-shadow"
        >
          <Play className="w-6 h-6" />
          Tester mes connaissances
          <span className="px-2 py-0.5 bg-white/20 rounded-full text-sm">
            {fiche.quiz.length} questions
          </span>
        </motion.button>
      )}
    </div>
  )
}

export default FicheViewer
