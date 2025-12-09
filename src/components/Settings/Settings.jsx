import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Download, Upload, Trash2, Moon, Sun, Bell, Volume2, Sparkles,
  Target, AlertCircle, Check, Key, ChevronRight
} from 'lucide-react'

function Settings({ data, onUpdateSettings, onExport, onImport, onBack }) {
  const [showConfirmReset, setShowConfirmReset] = useState(false)
  const [importSuccess, setImportSuccess] = useState(false)
  const [importError, setImportError] = useState(null)
  const [apiKey, setApiKey] = useState(localStorage.getItem('claude_api_key') || '')
  const [showApiKey, setShowApiKey] = useState(false)
  const fileInputRef = useRef(null)

  const settings = data?.userProgress?.settings || {
    theme: 'light',
    dailyGoal: 20,
    notificationsEnabled: false,
    soundEnabled: true,
    animationsEnabled: true
  }

  const stats = data?.userProgress?.stats || {}
  const profile = data?.userProgress?.profile || {}

  const handleExport = () => {
    const exportPayload = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      app: 'CultureMaster',
      ...data
    }

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: 'application/json'
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `culturemaster-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImportError(null)
    setImportSuccess(false)

    try {
      const text = await file.text()
      const importedData = JSON.parse(text)

      if (importedData.app !== 'CultureMaster') {
        throw new Error('Fichier de sauvegarde invalide')
      }

      const { version, exportedAt, app, ...cleanData } = importedData
      onImport(cleanData)
      setImportSuccess(true)

      setTimeout(() => setImportSuccess(false), 3000)
    } catch (err) {
      setImportError(err.message || 'Impossible de lire le fichier')
    }
  }

  const handleSaveApiKey = () => {
    localStorage.setItem('claude_api_key', apiKey)
    setShowApiKey(false)
  }

  const handleReset = () => {
    localStorage.removeItem('culturemaster_data')
    localStorage.removeItem('culturemaster_first_visit')
    window.location.reload()
  }

  const updateSetting = (key, value) => {
    onUpdateSettings({
      ...settings,
      [key]: value
    })
  }

  return (
    <div className="space-y-6">
      {/* Profile Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
          Mes statistiques
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <p className="text-2xl font-bold text-primary">{stats.totalQuestions || 0}</p>
            <p className="text-xs text-slate-500">Questions répondues</p>
          </div>
          <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <p className="text-2xl font-bold text-success">{stats.averageScore || 0}%</p>
            <p className="text-xs text-slate-500">Score moyen</p>
          </div>
          <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <p className="text-2xl font-bold text-secondary">{stats.totalQuizCompleted || 0}</p>
            <p className="text-xs text-slate-500">Quiz terminés</p>
          </div>
          <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <p className="text-2xl font-bold text-orange-500">{profile.longestStreak || 0}</p>
            <p className="text-xs text-slate-500">Meilleure série</p>
          </div>
        </div>
      </motion.div>

      {/* Settings */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card space-y-4"
      >
        <h3 className="font-semibold text-slate-900 dark:text-white">
          Préférences
        </h3>

        {/* Daily Goal */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Target className="w-5 h-5 text-slate-500" />
            <div>
              <p className="font-medium text-slate-900 dark:text-white text-sm">Objectif quotidien</p>
              <p className="text-xs text-slate-500">Questions par jour</p>
            </div>
          </div>
          <select
            value={settings.dailyGoal}
            onChange={(e) => updateSetting('dailyGoal', parseInt(e.target.value))}
            className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white dark:bg-slate-800 text-sm"
          >
            {[10, 15, 20, 30, 50].map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        {/* Sound */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Volume2 className="w-5 h-5 text-slate-500" />
            <div>
              <p className="font-medium text-slate-900 dark:text-white text-sm">Sons</p>
              <p className="text-xs text-slate-500">Effets sonores</p>
            </div>
          </div>
          <button
            onClick={() => updateSetting('soundEnabled', !settings.soundEnabled)}
            className={`w-12 h-7 rounded-full transition-colors ${
              settings.soundEnabled ? 'bg-primary' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                settings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Animations */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-slate-500" />
            <div>
              <p className="font-medium text-slate-900 dark:text-white text-sm">Animations</p>
              <p className="text-xs text-slate-500">Effets visuels</p>
            </div>
          </div>
          <button
            onClick={() => updateSetting('animationsEnabled', !settings.animationsEnabled)}
            className={`w-12 h-7 rounded-full transition-colors ${
              settings.animationsEnabled ? 'bg-primary' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                settings.animationsEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </motion.div>

      {/* API Key */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        <button
          onClick={() => setShowApiKey(!showApiKey)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Key className="w-5 h-5 text-slate-500" />
            <div className="text-left">
              <p className="font-medium text-slate-900 dark:text-white text-sm">Clé API Claude</p>
              <p className="text-xs text-slate-500">
                {apiKey ? 'Configurée' : 'Non configurée'}
              </p>
            </div>
          </div>
          <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${showApiKey ? 'rotate-90' : ''}`} />
        </button>

        {showApiKey && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700"
          >
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-ant-..."
              className="input mb-2"
            />
            <button
              onClick={handleSaveApiKey}
              className="btn-primary w-full"
            >
              Sauvegarder
            </button>
          </motion.div>
        )}
      </motion.div>

      {/* Data Management */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card space-y-3"
      >
        <h3 className="font-semibold text-slate-900 dark:text-white">
          Mes données
        </h3>

        <button
          onClick={handleExport}
          className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <Download className="w-5 h-5 text-primary" />
          <div className="text-left">
            <p className="font-medium text-slate-900 dark:text-white text-sm">Exporter mes données</p>
            <p className="text-xs text-slate-500">Télécharger une sauvegarde JSON</p>
          </div>
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <Upload className="w-5 h-5 text-secondary" />
          <div className="text-left">
            <p className="font-medium text-slate-900 dark:text-white text-sm">Importer des données</p>
            <p className="text-xs text-slate-500">Restaurer une sauvegarde</p>
          </div>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />

        {importSuccess && (
          <div className="flex items-center gap-2 text-sm text-success">
            <Check className="w-4 h-4" />
            Données importées avec succès !
          </div>
        )}

        {importError && (
          <div className="flex items-center gap-2 text-sm text-error">
            <AlertCircle className="w-4 h-4" />
            {importError}
          </div>
        )}
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card border-error/30"
      >
        <h3 className="font-semibold text-error mb-3">Zone dangereuse</h3>

        {!showConfirmReset ? (
          <button
            onClick={() => setShowConfirmReset(true)}
            className="w-full flex items-center gap-3 p-3 rounded-lg bg-error/10 hover:bg-error/20 transition-colors"
          >
            <Trash2 className="w-5 h-5 text-error" />
            <div className="text-left">
              <p className="font-medium text-error text-sm">Réinitialiser l'application</p>
              <p className="text-xs text-error/70">Supprimer toutes les données</p>
            </div>
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-error">
              Es-tu sûr ? Cette action est irréversible. Toutes tes données seront supprimées.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="flex-1 btn-secondary"
              >
                Annuler
              </button>
              <button
                onClick={handleReset}
                className="flex-1 bg-error text-white font-medium py-2 px-4 rounded-lg hover:bg-error/90 transition-colors"
              >
                Confirmer
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* App Info */}
      <div className="text-center text-sm text-slate-400 pt-4">
        <p>CultureMaster v1.0.0</p>
        <p className="text-xs mt-1">Tes données restent sur ton appareil</p>
      </div>
    </div>
  )
}

export default Settings
