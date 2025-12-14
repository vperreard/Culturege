import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Upload, Rocket, BookOpen, Brain, Trophy } from 'lucide-react'

function Welcome({ onStart, onImport }) {
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  const handleImport = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    setError(null)

    try {
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result)
          if (data.app !== 'CultureMaster') {
            throw new Error('Fichier invalide')
          }
          const { version, exportedAt, app, ...cleanData } = data
          onImport(cleanData)
        } catch (err) {
          setError('Fichier de sauvegarde invalide')
          setIsImporting(false)
        }
      }
      reader.onerror = () => {
        setError('Erreur de lecture du fichier')
        setIsImporting(false)
      }
      reader.readAsText(file)
    } catch (err) {
      setError('Une erreur est survenue')
      setIsImporting(false)
    }
  }

  const features = [
    { icon: Brain, title: 'QCM intelligents', desc: 'Apprends avec des quiz adaptatifs' },
    { icon: BookOpen, title: 'Fiches interactives', desc: 'Contenu riche et engageant' },
    { icon: Trophy, title: 'Suivi de progression', desc: 'Visualise tes progrès' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-primary-dark flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center text-white mb-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="text-6xl mb-4"
        >
          🎓
        </motion.div>
        <h1 className="text-3xl font-bold mb-2">CultureMaster</h1>
        <p className="text-white/80 text-lg">
          Ta culture générale, niveau supérieur
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md"
      >
        <div className="space-y-4 mb-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-slate-900">{feature.title}</h3>
                <p className="text-sm text-slate-500">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="space-y-3">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onStart}
            className="w-full py-3 px-4 bg-primary hover:bg-primary-dark text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <Rocket className="w-5 h-5" />
            Commencer l'aventure
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <Upload className="w-5 h-5" />
            {isImporting ? 'Importation...' : 'Importer une sauvegarde'}
          </motion.button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />

          {error && (
            <p className="text-sm text-error text-center">{error}</p>
          )}
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-white/60 text-sm mt-6"
      >
        Tes données restent sur ton appareil
      </motion.p>
    </div>
  )
}

export default Welcome
