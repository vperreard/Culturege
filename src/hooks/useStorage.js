import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'culturemaster_data'
const FIRST_VISIT_KEY = 'culturemaster_first_visit'

export function useStorage() {
  const [data, setData] = useState(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isFirstVisit, setIsFirstVisit] = useState(true)

  // Load data on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      const firstVisit = localStorage.getItem(FIRST_VISIT_KEY)

      if (stored) {
        const parsedData = JSON.parse(stored)
        setData(parsedData)
      }

      setIsFirstVisit(!firstVisit)
    } catch (e) {
      console.warn('LocalStorage non disponible:', e)
    }
    setIsLoaded(true)
  }, [])

  // Save data whenever it changes
  useEffect(() => {
    if (data && isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      } catch (e) {
        console.warn('Impossible de sauvegarder:', e)
      }
    }
  }, [data, isLoaded])

  // Update data
  const updateData = useCallback((updater) => {
    setData(prev => {
      const newData = typeof updater === 'function' ? updater(prev) : updater
      return {
        ...prev,
        ...newData,
        lastModified: new Date().toISOString()
      }
    })
  }, [])

  // Complete first visit
  const completeFirstVisit = useCallback(() => {
    try {
      localStorage.setItem(FIRST_VISIT_KEY, 'true')
      setIsFirstVisit(false)
    } catch (e) {
      console.warn('Impossible de sauvegarder:', e)
    }
  }, [])

  // Export data
  const exportData = useCallback(() => {
    if (!data) return null

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

    return exportPayload
  }, [data])

  // Import data
  const importData = useCallback(async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result)

          // Validation
          if (!importedData.version || importedData.app !== 'CultureMaster') {
            throw new Error('Fichier de sauvegarde invalide')
          }

          // Remove export metadata
          const { version, exportedAt, app, ...cleanData } = importedData

          setData(cleanData)
          resolve(cleanData)
        } catch (err) {
          reject(new Error('Impossible de lire le fichier: ' + err.message))
        }
      }

      reader.onerror = () => reject(new Error('Erreur de lecture'))
      reader.readAsText(file)
    })
  }, [])

  // Clear all data
  const clearData = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(FIRST_VISIT_KEY)
      setData(null)
      setIsFirstVisit(true)
    } catch (e) {
      console.warn('Impossible de supprimer les données:', e)
    }
  }, [])

  return {
    data,
    updateData,
    isLoaded,
    isFirstVisit,
    completeFirstVisit,
    exportData,
    importData,
    clearData
  }
}

export default useStorage
