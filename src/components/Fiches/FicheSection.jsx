import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Quote, ChevronRight, Info, Calendar, MapPin,
  User, Sparkles, RotateCcw, ArrowRight, Zap
} from 'lucide-react'

function FicheSection({ section, categoryId }) {
  const [expandedElement, setExpandedElement] = useState(null)
  const [flippedCards, setFlippedCards] = useState(new Set())

  // Get category gradient class
  const getCategoryGradient = () => {
    const gradients = {
      'histoire': 'bg-gradient-history',
      'sciences': 'bg-gradient-science',
      'politique': 'bg-gradient-politics',
      'art': 'bg-gradient-art',
    }
    return gradients[categoryId] || 'bg-gradient-history'
  }

  // Render based on section type
  switch (section.type) {
    case 'text':
      return <TextSection content={section.content} image={section.image} animation={section.animation} />

    case 'timeline':
      return <TimelineSection content={section.content} />

    case 'interactive':
      return (
        <InteractiveSection
          content={section.content}
          expandedElement={expandedElement}
          onToggleElement={setExpandedElement}
          flippedCards={flippedCards}
          onFlipCard={(id) => setFlippedCards(prev => {
            const newSet = new Set(prev)
            if (newSet.has(id)) newSet.delete(id)
            else newSet.add(id)
            return newSet
          })}
        />
      )

    case 'comparison':
      return <ComparisonSection content={section.content} categoryGradient={getCategoryGradient()} />

    case 'quote':
      return <QuoteSection content={section.content} />

    case 'definition':
      return <DefinitionSection content={section.content} />

    case 'image_analysis':
      return <ImageAnalysisSection content={section.content} />

    case 'cards':
      return <CardsSection content={section.content} />

    default:
      return <TextSection content={section.content} image={section.image} />
  }
}

// Premium Text Section with Image support
function TextSection({ content, image, animation }) {
  const animationClass = animation?.type === 'fadeIn' ? 'animate-fade-in-up' :
                         animation?.type === 'slideIn' ? 'animate-slide-in-left' : ''

  return (
    <div className={`space-y-4 ${animationClass}`}>
      {/* Image if position is top or full */}
      {image && (image.position === 'full' || image.position === 'top') && (
        <figure className="relative rounded-xl overflow-hidden mb-6">
          <img
            src={image.url}
            alt={image.caption || ''}
            className="w-full h-64 object-cover"
            loading="lazy"
          />
          <div className="hero-overlay absolute inset-0" />
          {image.caption && (
            <figcaption className="absolute bottom-0 left-0 right-0 p-4 text-white text-sm">
              {image.caption}
            </figcaption>
          )}
        </figure>
      )}

      <div className={`flex gap-6 ${image?.position === 'right' ? 'flex-row' : image?.position === 'left' ? 'flex-row-reverse' : ''}`}>
        {/* Text content */}
        <div className={`prose prose-slate dark:prose-invert prose-sm max-w-none ${image && (image.position === 'left' || image.position === 'right') ? 'flex-1' : ''}`}>
          {content.paragraphs?.map((paragraph, index) => (
            <p
              key={index}
              className={`text-slate-700 dark:text-slate-300 leading-relaxed ${index === 0 ? 'text-lg font-medium first-letter:text-3xl first-letter:font-bold first-letter:text-primary' : ''}`}
            >
              {paragraph}
            </p>
          ))}
        </div>

        {/* Side image */}
        {image && (image.position === 'left' || image.position === 'right') && (
          <figure className="w-48 flex-shrink-0">
            <img
              src={image.url}
              alt={image.caption || ''}
              className="w-full h-auto rounded-xl shadow-lg hover-lift"
              loading="lazy"
            />
            {image.caption && (
              <figcaption className="text-xs text-slate-500 mt-2 text-center italic">
                {image.caption}
              </figcaption>
            )}
          </figure>
        )}
      </div>
    </div>
  )
}

// Premium Interactive Timeline
function TimelineSection({ content }) {
  const [expandedEvent, setExpandedEvent] = useState(null)

  return (
    <div className="relative">
      {/* Vertical connector line */}
      <div className="absolute left-4 top-8 bottom-8 w-1 timeline-connector rounded-full"></div>

      <div className="space-y-6">
        {content.events?.map((event, index) => {
          const isExpanded = expandedEvent === index
          const isMajor = event.importance === 'major'

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative pl-12"
            >
              {/* Timeline node */}
              <div className={`absolute left-0 w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-all ${
                isMajor
                  ? 'bg-gradient-to-br from-primary to-secondary text-white animate-pulse-soft'
                  : 'bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600'
              }`}>
                {isMajor ? (
                  <Sparkles className="w-4 h-4" />
                ) : (
                  <span className="text-xs font-bold text-slate-500">{index + 1}</span>
                )}
              </div>

              {/* Event card */}
              <motion.button
                onClick={() => setExpandedEvent(isExpanded ? null : index)}
                className={`w-full text-left rounded-xl transition-all hover-glow ${
                  isMajor
                    ? 'bg-gradient-to-br from-primary/10 to-secondary/5 border-2 border-primary/30'
                    : 'bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700'
                }`}
                whileTap={{ scale: 0.99 }}
              >
                <div className="p-4">
                  {/* Date badge */}
                  <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold mb-2 ${
                    isMajor
                      ? 'bg-primary text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}>
                    <Calendar className="w-3 h-3" />
                    {event.date}
                  </div>

                  {/* Event title */}
                  <h4 className={`font-semibold text-slate-900 dark:text-white ${isMajor ? 'text-lg' : ''}`}>
                    {event.event}
                  </h4>

                  {/* Image preview if available */}
                  {event.image && !isExpanded && (
                    <div className="mt-3 h-24 rounded-lg overflow-hidden">
                      <img
                        src={event.image}
                        alt={event.event}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}

                  {/* Expand indicator */}
                  {(event.story || event.consequence || event.details) && (
                    <div className="flex items-center gap-1 mt-2 text-primary text-xs font-medium">
                      {isExpanded ? 'Réduire' : 'Lire l\'histoire'}
                      <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </div>
                  )}
                </div>

                {/* Expanded content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-4">
                        {/* Full image */}
                        {event.image && (
                          <figure className="rounded-xl overflow-hidden">
                            <img
                              src={event.image}
                              alt={event.event}
                              className="w-full h-48 object-cover"
                              loading="lazy"
                            />
                          </figure>
                        )}

                        {/* Story */}
                        {event.story && (
                          <div className="p-4 bg-white/50 dark:bg-slate-900/50 rounded-lg border-l-4 border-secondary">
                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
                              {event.story}
                            </p>
                          </div>
                        )}

                        {/* Details */}
                        {event.details && (
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {event.details}
                          </p>
                        )}

                        {/* Why important */}
                        {event.pourquoi_important && (
                          <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                            <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-amber-800 dark:text-amber-300">
                              {event.pourquoi_important}
                            </p>
                          </div>
                        )}

                        {/* Consequence */}
                        {event.consequence && (
                          <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg">
                            <ArrowRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-slate-700 dark:text-slate-300">
                              <span className="font-semibold text-primary">Conséquence :</span> {event.consequence}
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// Interactive Section with Flip Cards for Myths
function InteractiveSection({ content, expandedElement, onToggleElement, flippedCards, onFlipCard }) {
  // Flip cards for myths vs reality
  if (content.interactiveType === 'flip_cards') {
    return (
      <div className="space-y-4">
        {content.description && (
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{content.description}</p>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          {content.elements?.map((element, index) => {
            const isFlipped = flippedCards.has(element.id || index)

            return (
              <motion.div
                key={element.id || index}
                className="relative h-48 cursor-pointer perspective-1000"
                onClick={() => onFlipCard(element.id || index)}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  className="absolute inset-0 w-full h-full"
                  initial={false}
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Front - Myth */}
                  <div
                    className="absolute inset-0 w-full h-full rounded-xl p-5 flex flex-col justify-center items-center text-center bg-gradient-to-br from-red-500/20 to-orange-500/20 border-2 border-red-300 dark:border-red-800"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <span className="text-3xl mb-3">{element.icon || '🤔'}</span>
                    <p className="font-medium text-slate-900 dark:text-white">{element.front}</p>
                    <span className="mt-3 text-xs text-slate-500 flex items-center gap-1">
                      <RotateCcw className="w-3 h-3" /> Cliquez pour révéler
                    </span>
                  </div>

                  {/* Back - Reality */}
                  <div
                    className="absolute inset-0 w-full h-full rounded-xl p-5 flex flex-col justify-center items-center text-center bg-gradient-to-br from-green-500/20 to-teal-500/20 border-2 border-green-300 dark:border-green-800"
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                  >
                    <span className="text-3xl mb-3">✅</span>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{element.back}</p>
                  </div>
                </motion.div>
              </motion.div>
            )
          })}
        </div>
      </div>
    )
  }

  // Standard cards/pyramid
  return (
    <div className="space-y-3">
      {content.description && (
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{content.description}</p>
      )}
      {content.elements?.map((element) => (
        <motion.button
          key={element.id}
          whileTap={{ scale: 0.98 }}
          onClick={() => onToggleElement(expandedElement === element.id ? null : element.id)}
          className="w-full text-left"
        >
          <div
            className={`p-4 rounded-xl border-2 transition-all hover-glow ${
              expandedElement === element.id
                ? 'border-primary bg-primary/5 shadow-lg'
                : 'border-slate-200 dark:border-slate-700 hover:border-primary/50'
            }`}
            style={element.color ? { borderLeftColor: element.color, borderLeftWidth: '4px' } : {}}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {element.icon && <span className="text-2xl">{element.icon}</span>}
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">{element.label}</h4>
                  {element.percentage && (
                    <span className="text-xs text-slate-500">{element.percentage}</span>
                  )}
                </div>
              </div>
              <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${
                expandedElement === element.id ? 'rotate-90' : ''
              }`} />
            </div>

            <AnimatePresence>
              {expandedElement === element.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700"
                >
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {element.description}
                  </p>
                  {element.funFact && (
                    <p className="text-xs text-primary mt-2 italic bg-primary/5 p-2 rounded">
                      💡 {element.funFact}
                    </p>
                  )}
                  {element.characteristics && (
                    <ul className="mt-2 space-y-1">
                      {element.characteristics.map((char, i) => (
                        <li key={i} className="text-xs text-slate-500 flex items-center gap-1">
                          <span className="text-primary">•</span> {char}
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.button>
      ))}
    </div>
  )
}

// Premium Comparison Section with VS Badge
function ComparisonSection({ content, categoryGradient }) {
  return (
    <div className={`rounded-2xl p-6 ${categoryGradient}`}>
      {content.description && (
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">{content.description}</p>
      )}

      <div className="relative">
        {/* VS Badge - only show for exactly 2 items */}
        {content.items?.length === 2 && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="vs-badge w-12 h-12 text-sm shadow-xl animate-pulse-soft">
              VS
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {content.items?.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2 }}
              className="glass-card p-5 hover-lift"
            >
              {/* Header with icon and image */}
              <div className="flex items-center gap-3 mb-4">
                {item.icon && <span className="text-3xl">{item.icon}</span>}
                <div>
                  <h4 className="font-bold text-lg text-slate-900 dark:text-white">{item.name}</h4>
                  {item.dates && (
                    <span className="text-xs text-slate-500">{item.dates}</span>
                  )}
                </div>
              </div>

              {/* Image if available */}
              {item.image && (
                <figure className="mb-4 rounded-lg overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-32 object-cover"
                    loading="lazy"
                  />
                </figure>
              )}

              {/* Characteristics */}
              <ul className="space-y-2">
                {item.characteristics?.map((char, i) => (
                  <li key={i} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                    <Zap className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    {char}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Premium Quote Section
function QuoteSection({ content }) {
  return (
    <div className="quote-premium p-6 relative overflow-hidden">
      <span className="quote-mark">"</span>
      <blockquote className="relative z-10 pt-8">
        <p className="text-xl italic text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
          "{content.quote}"
        </p>
        {content.translation && (
          <p className="text-sm text-slate-500 mb-4 pl-4 border-l-2 border-slate-300">
            {content.translation}
          </p>
        )}
        <footer className="flex items-center gap-3">
          {content.authorImage && (
            <img
              src={content.authorImage}
              alt={content.author}
              className="w-12 h-12 rounded-full object-cover border-2 border-secondary"
            />
          )}
          <div>
            <cite className="font-semibold text-slate-900 dark:text-white not-italic">
              — {content.author}
            </cite>
            {content.context && (
              <p className="text-xs text-slate-500">{content.context}</p>
            )}
          </div>
        </footer>
        {content.significance && (
          <div className="mt-4 p-3 bg-white/50 dark:bg-slate-900/50 rounded-lg">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              <Info className="w-4 h-4 inline mr-1 text-secondary" />
              {content.significance}
            </p>
          </div>
        )}
      </blockquote>
    </div>
  )
}

// Definition Section
function DefinitionSection({ content }) {
  return (
    <div className="space-y-4">
      {content.terms?.map((term, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border-l-4 border-primary"
        >
          <dt className="font-bold text-slate-900 dark:text-white text-lg">{term.word}</dt>
          <dd className="text-slate-600 dark:text-slate-400 mt-2">{term.definition}</dd>
          {term.etymology && (
            <p className="text-xs text-slate-500 mt-2 italic">
              📚 Étymologie : {term.etymology}
            </p>
          )}
        </motion.div>
      ))}
    </div>
  )
}

// Image Analysis Section (for artwork analysis)
function ImageAnalysisSection({ content }) {
  const [selectedElement, setSelectedElement] = useState(null)

  return (
    <div className="space-y-6">
      {/* Main image */}
      <figure className="relative rounded-2xl overflow-hidden shadow-xl">
        <img
          src={content.imageUrl}
          alt={content.title || 'Analyse d\'image'}
          className="w-full h-auto"
          loading="lazy"
        />
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <p className="text-white font-semibold">{content.artist}</p>
          <p className="text-white/70 text-sm">{content.date} • {content.location}</p>
        </div>
      </figure>

      {/* Analysis points */}
      {content.analysis && (
        <div className="space-y-3">
          <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-secondary" />
            Points d'analyse
          </h4>
          {content.analysis.map((point, index) => (
            <motion.button
              key={index}
              onClick={() => setSelectedElement(selectedElement === index ? null : index)}
              className="w-full text-left p-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover-glow transition-all"
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-primary">{point.element}</span>
                <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${selectedElement === index ? 'rotate-90' : ''}`} />
              </div>
              <AnimatePresence>
                {selectedElement === index && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-sm text-slate-600 dark:text-slate-400 mt-2"
                  >
                    {point.explanation}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.button>
          ))}
        </div>
      )}

      {/* Fun fact */}
      {content.funFact && (
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
          <p className="text-sm text-amber-800 dark:text-amber-300">
            <span className="font-bold">💡 Le saviez-vous ?</span> {content.funFact}
          </p>
        </div>
      )}
    </div>
  )
}

// Cards Section (for places, recommendations)
function CardsSection({ content }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {content.map((card, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className="glass-card p-5 hover-lift"
        >
          {card.image && (
            <img
              src={card.image}
              alt={card.titre}
              className="w-full h-32 object-cover rounded-lg mb-3"
              loading="lazy"
            />
          )}
          <h4 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            {card.titre}
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-400">{card.description}</p>
          {card.conseil && (
            <p className="text-xs text-primary mt-2 italic">
              💡 {card.conseil}
            </p>
          )}
        </motion.div>
      ))}
    </div>
  )
}

export default FicheSection
