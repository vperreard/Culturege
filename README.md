# 🎓 CultureMaster

Application de culture générale avec QCM intelligents et fiches pédagogiques interactives.

## 🚀 Démarrage rapide

```bash
# Installation des dépendances
npm install

# Lancement en développement
npm run dev

# Lancement avec accès réseau (pour tester sur mobile)
npm run dev -- --host
```

## 📁 Structure

```
culture-master/
├── src/
│   ├── components/
│   │   ├── Quiz/          # Moteur de QCM
│   │   ├── Fiches/        # Viewer de fiches interactives
│   │   ├── Progress/      # Dashboard et stats
│   │   └── Generator/     # Génération via API Claude
│   ├── hooks/             # useQuiz, useStorage, useApi
│   └── data/              # Questions et fiches initiales
├── public/                # Assets statiques et icônes PWA
└── docs/                  # Documentation complète
```

## 📖 Documentation

**Tout est dans `docs/SPECIFICATION.md`** :

- Architecture détaillée
- Structure des données (questions, fiches, progression)
- Design system complet
- Prompts API pour la génération
- Flux utilisateur et wireframes

## 🎯 Fonctionnalités

- ✅ QCM multi-catégories avec feedback détaillé
- ✅ Fiches pédagogiques interactives (animations, schémas, timelines)
- ✅ Suivi de progression et révision espacée
- ✅ Génération de contenu via API Claude
- ✅ Export/Import JSON (synchro Dropbox/iCloud)
- ✅ PWA installable sur mobile

## 💡 Technologies

- **React** + **Vite** - Framework et bundler
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icônes
- **PWA** - Service Worker pour mode hors-ligne

---

*Bonne exploration de la culture générale !* 🧠
