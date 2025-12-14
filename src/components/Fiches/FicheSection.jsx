import { useState } from 'react'
import { motion } from 'framer-motion'
import { Quote, ChevronRight, Info } from 'lucide-react'

function FicheSection({ section }) {
  const [expandedElement, setExpandedElement] = useState(null)

  // Render based on section type
  switch (section.type) {
    case 'text':
      return <TextSection content={section.content} />

    case 'timeline':
      return <TimelineSection content={section.content} />

    case 'interactive':
      return (
        <InteractiveSection
          content={section.content}
          expandedElement={expandedElement}
          onToggleElement={setExpandedElement}
        />
      )

    case 'comparison':
      return <ComparisonSection content={section.content} />

    case 'quote':
      return <QuoteSection content={section.content} />

    case 'definition':
      return <DefinitionSection content={section.content} />

    default:
      return <TextSection content={section.content} />
  }
}

// Text Section
function TextSection({ content }) {
  return (
    <div className="prose prose-slate dark:prose-invert prose-sm max-w-none">
      {content.paragraphs?.map((paragraph, index) => (
        <p key={index} className="text-slate-700 dark:text-slate-300 leading-relaxed">
          {paragraph}
        </p>
      ))}
    </div>
  )
}

// Timeline Section
function TimelineSection({ content }) {
  return (
    <div className="relative">
      <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-slate-700"></div>
      <div className="space-y-4">
        {content.events?.map((event, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative pl-8"
          >
            <div className={`absolute left-0 w-6 h-6 rounded-full flex items-center justify-center ${
              event.importance === 'major'
                ? 'bg-primary text-white'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-600'
            }`}>
              <span className="text-xs font-bold">{index + 1}</span>
            </div>
            <div className={`p-3 rounded-lg ${
              event.importance === 'major'
                ? 'bg-primary/5 border border-primary/20'
                : 'bg-slate-50 dark:bg-slate-800'
            }`}>
              <p className="text-xs font-semibold text-primary mb-1">{event.date}</p>
              <p className="font-medium text-slate-900 dark:text-white text-sm">{event.event}</p>
              {event.details && (
                <p className="text-xs text-slate-500 mt-1">{event.details}</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// Interactive Section (diagrams, cards)
function InteractiveSection({ content, expandedElement, onToggleElement }) {
  if (content.interactiveType === 'cards' || content.interactiveType === 'pyramid') {
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
              className={`p-4 rounded-xl border-2 transition-all ${
                expandedElement === element.id
                  ? 'border-primary bg-primary/5'
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

              {expandedElement === element.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700"
                >
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {element.description}
                  </p>
                  {element.funFact && (
                    <p className="text-xs text-primary mt-2 italic">
                      💡 {element.funFact}
                    </p>
                  )}
                  {element.characteristics && (
                    <ul className="mt-2 space-y-1">
                      {element.characteristics.map((char, i) => (
                        <li key={i} className="text-xs text-slate-500 flex items-center gap-1">
                          <span>•</span> {char}
                        </li>
                      ))}
                    </ul>
                  )}
                  {element.consequence && (
                    <p className="text-xs text-error mt-2">
                      ⚠️ Conséquence : {element.consequence}
                    </p>
                  )}
                  {element.examples && (
                    <p className="text-xs text-slate-500 mt-2">
                      Exemples : {element.examples.join(', ')}
                    </p>
                  )}
                </motion.div>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    )
  }

  // Diagram type - simplified view
  return (
    <div className="space-y-3">
      {content.description && (
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{content.description}</p>
      )}
      <div className="grid gap-3">
        {content.elements?.map((element) => (
          <motion.button
            key={element.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => onToggleElement(expandedElement === element.id ? null : element.id)}
            className="w-full text-left p-4 rounded-xl border-2 transition-all hover:border-primary/50"
            style={{ borderColor: element.color || '#e2e8f0' }}
          >
            <div className="flex items-center gap-3">
              {element.icon && <span className="text-2xl">{element.icon}</span>}
              <span
                className="font-semibold"
                style={{ color: element.color }}
              >
                {element.label}
              </span>
            </div>
            {expandedElement === element.id && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-3 text-sm text-slate-600 dark:text-slate-400"
              >
                {element.description}
                {element.funFact && (
                  <p className="text-xs text-primary mt-2 italic">💡 {element.funFact}</p>
                )}
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  )
}

// Comparison Section
function ComparisonSection({ content }) {
  return (
    <div>
      {content.description && (
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{content.description}</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {content.items?.map((item, index) => (
          <div
            key={index}
            className="p-4 rounded-xl border-2"
            style={{ borderColor: item.color || '#e2e8f0' }}
          >
            <div className="flex items-center gap-2 mb-3">
              {item.icon && <span className="text-xl">{item.icon}</span>}
              <h4 className="font-semibold text-slate-900 dark:text-white">{item.name}</h4>
            </div>
            <ul className="space-y-2">
              {item.characteristics?.map((char, i) => (
                <li key={i} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                  <span className="text-slate-400 mt-0.5">•</span>
                  {char}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

// Quote Section
function QuoteSection({ content }) {
  return (
    <div className="relative bg-slate-50 dark:bg-slate-800 rounded-xl p-6">
      <Quote className="absolute top-4 left-4 w-8 h-8 text-slate-200 dark:text-slate-700" />
      <blockquote className="relative z-10">
        <p className="text-lg italic text-slate-700 dark:text-slate-300 mb-2 pl-6">
          "{content.quote}"
        </p>
        {content.translation && (
          <p className="text-sm text-slate-500 pl-6 mb-3">
            ({content.translation})
          </p>
        )}
        <footer className="pl-6">
          <cite className="text-sm font-medium text-slate-900 dark:text-white not-italic">
            — {content.author}
          </cite>
          {content.context && (
            <p className="text-xs text-slate-500 mt-1">{content.context}</p>
          )}
        </footer>
        {content.significance && (
          <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              <Info className="w-3 h-3 inline mr-1" />
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
    <div className="space-y-3">
      {content.terms?.map((term, index) => (
        <div key={index} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <dt className="font-semibold text-slate-900 dark:text-white">{term.word}</dt>
          <dd className="text-sm text-slate-600 dark:text-slate-400 mt-1">{term.definition}</dd>
        </div>
      ))}
    </div>
  )
}

export default FicheSection
