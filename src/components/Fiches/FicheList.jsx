import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Clock, TrendingUp, Star, Filter } from 'lucide-react'

function FicheList({ fiches, categories, ficheProgress, onSelectFiche }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)

  // Filter fiches
  const filteredFiches = fiches.filter(fiche => {
    if (selectedCategory && fiche.categoryId !== selectedCategory) return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        fiche.title.toLowerCase().includes(query) ||
        fiche.subtitle?.toLowerCase().includes(query) ||
        fiche.keyPoints?.some(kp => kp.toLowerCase().includes(query))
      )
    }
    return true
  })

  // Sort by last studied, then by title
  const sortedFiches = [...filteredFiches].sort((a, b) => {
    const aProgress = ficheProgress[a.id]
    const bProgress = ficheProgress[b.id]

    if (aProgress?.lastStudied && !bProgress?.lastStudied) return -1
    if (!aProgress?.lastStudied && bProgress?.lastStudied) return 1
    if (aProgress?.lastStudied && bProgress?.lastStudied) {
      return new Date(bProgress.lastStudied) - new Date(aProgress.lastStudied)
    }
    return a.title.localeCompare(b.title)
  })

  // Render difficulty
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
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Rechercher une fiche..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input pl-10"
        />
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            !selectedCategory
              ? 'bg-primary text-white'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
          }`}
        >
          Toutes
        </button>
        {categories.map(category => {
          const count = fiches.filter(f => f.categoryId === category.id).length
          if (count === 0) return null

          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                selectedCategory === category.id
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
              <span className="opacity-60">({count})</span>
            </button>
          )
        })}
      </div>

      {/* Fiches list */}
      <div className="space-y-3">
        {sortedFiches.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">Aucune fiche trouvée</p>
          </div>
        ) : (
          sortedFiches.map((fiche, index) => {
            const category = categories.find(c => c.id === fiche.categoryId)
            const progress = ficheProgress[fiche.id]
            const masteryLevel = progress?.masteryLevel || 0

            return (
              <motion.button
                key={fiche.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectFiche(fiche.id)}
                className="w-full card-interactive p-4 text-left"
                style={{ borderLeft: `4px solid ${category?.color || '#ccc'}` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{category?.icon}</span>
                      <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                        {fiche.title}
                      </h3>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">
                      {fiche.subtitle}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {fiche.estimatedTime} min
                      </span>
                      {renderDifficulty(fiche.difficulty)}
                      {masteryLevel > 0 && (
                        <span className="flex items-center gap-1 text-success">
                          <TrendingUp className="w-3 h-3" />
                          {masteryLevel}%
                        </span>
                      )}
                    </div>
                  </div>

                  {masteryLevel > 0 && (
                    <div className="w-10 h-10 rounded-full border-2 border-success flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-success">{masteryLevel}%</span>
                    </div>
                  )}
                </div>
              </motion.button>
            )
          })
        )}
      </div>
    </div>
  )
}

export default FicheList
