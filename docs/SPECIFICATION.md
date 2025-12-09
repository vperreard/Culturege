# CultureMaster - Application de Culture Générale

## 🎯 Vision du Projet

Application web progressive (PWA) de culture générale permettant :

- D'apprendre via des QCM intelligents multi-catégories
- De consulter des fiches pédagogiques riches et interactives
- D'enrichir continuellement la base de connaissances via l'API Claude
- De synchroniser ses données entre appareils via export/import JSON

-----

## 📱 Contraintes Techniques

|Contrainte    |Solution retenue                                  |
|--------------|--------------------------------------------------|
|Accès mobile  |PWA (Progressive Web App) installable             |
|Persistance   |LocalStorage + Export/Import JSON (Dropbox/iCloud)|
|Hors-ligne    |Service Worker pour cache des fiches              |
|Enrichissement|API Anthropic intégrée                            |

-----

## 🏗️ Architecture Globale

```
culture-master/
├── index.html              # Point d'entrée PWA
├── manifest.json           # Configuration PWA
├── sw.js                   # Service Worker (cache offline)
├── src/
│   ├── main.jsx            # Entry point React
│   ├── App.jsx             # Composant racine + Router
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── Header.jsx
│   │   │   ├── Navigation.jsx
│   │   │   └── Footer.jsx
│   │   ├── Quiz/
│   │   │   ├── QuizEngine.jsx      # Moteur de QCM
│   │   │   ├── QuestionCard.jsx    # Affichage question
│   │   │   ├── AnswerFeedback.jsx  # Feedback réponse
│   │   │   ├── QuizResults.jsx     # Résultats fin quiz
│   │   │   └── QuizSelector.jsx    # Sélection catégorie/difficulté
│   │   ├── Fiches/
│   │   │   ├── FicheViewer.jsx     # Visualiseur de fiche
│   │   │   ├── FicheList.jsx       # Liste des fiches
│   │   │   ├── FicheContent.jsx    # Contenu interactif
│   │   │   └── FicheAnimations.jsx # Composants animés
│   │   ├── Progress/
│   │   │   ├── Dashboard.jsx       # Tableau de bord progression
│   │   │   ├── StatsCard.jsx       # Statistiques par catégorie
│   │   │   └── StreakTracker.jsx   # Suivi des séries
│   │   ├── Generator/
│   │   │   ├── NewTopicForm.jsx    # Formulaire nouveau sujet
│   │   │   ├── GenerationStatus.jsx # État de génération
│   │   │   └── ApiHandler.jsx      # Gestion appels Claude
│   │   └── Data/
│   │       ├── ImportExport.jsx    # Import/Export JSON
│   │       └── DataManager.jsx     # Gestion état global
│   ├── hooks/
│   │   ├── useQuiz.js              # Logique quiz
│   │   ├── useProgress.js          # Logique progression
│   │   ├── useStorage.js           # Persistance données
│   │   └── useApi.js               # Appels API Claude
│   ├── data/
│   │   ├── initialQuestions.json   # QCM de base
│   │   ├── initialFiches.json      # Fiches de base
│   │   └── categories.json         # Catégories disponibles
│   ├── styles/
│   │   └── globals.css             # Styles Tailwind custom
│   └── utils/
│       ├── scoring.js              # Calcul scores
│       ├── spaceRepetition.js      # Algorithme révision espacée
│       └── dataValidation.js       # Validation données
└── docs/
    └── API_PROMPTS.md              # Prompts pour génération
```

-----

## 📊 Structure des Données

### 1. Catégories (`categories.json`)

```json
{
  "categories": [
    {
      "id": "histoire",
      "name": "Histoire",
      "icon": "🏛️",
      "color": "#8B4513",
      "subcategories": [
        { "id": "antiquite", "name": "Antiquité" },
        { "id": "moyen-age", "name": "Moyen Âge" },
        { "id": "renaissance", "name": "Renaissance" },
        { "id": "moderne", "name": "Époque moderne" },
        { "id": "contemporain", "name": "Époque contemporaine" }
      ]
    },
    {
      "id": "geographie",
      "name": "Géographie",
      "icon": "🌍",
      "color": "#228B22",
      "subcategories": [
        { "id": "europe", "name": "Europe" },
        { "id": "ameriques", "name": "Amériques" },
        { "id": "asie", "name": "Asie" },
        { "id": "afrique", "name": "Afrique" },
        { "id": "oceanie", "name": "Océanie" }
      ]
    },
    {
      "id": "sciences",
      "name": "Sciences",
      "icon": "🔬",
      "color": "#4169E1",
      "subcategories": [
        { "id": "physique", "name": "Physique" },
        { "id": "chimie", "name": "Chimie" },
        { "id": "biologie", "name": "Biologie" },
        { "id": "astronomie", "name": "Astronomie" },
        { "id": "medecine", "name": "Médecine" }
      ]
    },
    {
      "id": "arts",
      "name": "Arts & Culture",
      "icon": "🎨",
      "color": "#9932CC",
      "subcategories": [
        { "id": "peinture", "name": "Peinture" },
        { "id": "musique", "name": "Musique" },
        { "id": "litterature", "name": "Littérature" },
        { "id": "cinema", "name": "Cinéma" },
        { "id": "architecture", "name": "Architecture" }
      ]
    },
    {
      "id": "politique",
      "name": "Politique & Société",
      "icon": "⚖️",
      "color": "#DC143C",
      "subcategories": [
        { "id": "institutions", "name": "Institutions" },
        { "id": "economie", "name": "Économie" },
        { "id": "geopolitique", "name": "Géopolitique" },
        { "id": "philosophie", "name": "Philosophie" }
      ]
    },
    {
      "id": "oenologie",
      "name": "Œnologie",
      "icon": "🍷",
      "color": "#722F37",
      "subcategories": [
        { "id": "regions", "name": "Régions viticoles" },
        { "id": "cepages", "name": "Cépages" },
        { "id": "degustation", "name": "Dégustation" },
        { "id": "accords", "name": "Accords mets-vins" }
      ]
    }
  ]
}
```

### 2. Questions QCM (`questions`)

```typescript
interface Question {
  id: string;                    // UUID unique
  categoryId: string;            // Référence catégorie
  subcategoryId: string;         // Référence sous-catégorie
  ficheId: string;               // Lien vers fiche associée
  difficulty: 1 | 2 | 3;         // 1=Facile, 2=Moyen, 3=Difficile
  question: string;              // Énoncé de la question
  answers: Answer[];             // 4 réponses possibles
  explanation: string;           // Explication détaillée
  anecdote?: string;             // Anecdote mémorable
  tags: string[];                // Tags pour recherche
  createdAt: string;             // Date création ISO
  timesAnswered: number;         // Nombre de fois répondue
  timesCorrect: number;          // Nombre de bonnes réponses
  nextReview?: string;           // Date prochaine révision (spaced repetition)
}

interface Answer {
  id: string;
  text: string;
  isCorrect: boolean;
  feedback?: string;             // Feedback spécifique si sélectionnée
}
```

**Exemple concret :**

```json
{
  "id": "q-hist-001",
  "categoryId": "histoire",
  "subcategoryId": "antiquite",
  "ficheId": "f-rome-republique",
  "difficulty": 2,
  "question": "En quelle année Jules César a-t-il franchi le Rubicon, déclenchant la guerre civile ?",
  "answers": [
    { "id": "a1", "text": "52 av. J.-C.", "isCorrect": false, "feedback": "C'est l'année de la bataille d'Alésia contre Vercingétorix." },
    { "id": "a2", "text": "49 av. J.-C.", "isCorrect": true },
    { "id": "a3", "text": "44 av. J.-C.", "isCorrect": false, "feedback": "C'est l'année de l'assassinat de César aux Ides de mars." },
    { "id": "a4", "text": "31 av. J.-C.", "isCorrect": false, "feedback": "C'est la bataille d'Actium, victoire d'Octave sur Marc Antoine." }
  ],
  "explanation": "Le 10 janvier 49 av. J.-C., César franchit le Rubicon avec ses légions, violant la loi romaine interdisant à tout général de traverser cette rivière en armes. Cette décision marqua le début de la guerre civile contre Pompée.",
  "anecdote": "La célèbre phrase 'Alea jacta est' (Le sort en est jeté) aurait été prononcée à ce moment. En réalité, selon Suétone, César aurait dit en grec 'Ἀνερρίφθω κύβος' (Que le dé soit lancé), citant le dramaturge Ménandre.",
  "tags": ["César", "République romaine", "guerre civile", "Rubicon"],
  "createdAt": "2024-01-15T10:30:00Z",
  "timesAnswered": 0,
  "timesCorrect": 0
}
```

### 3. Fiches Pédagogiques (`fiches`)

```typescript
interface Fiche {
  id: string;
  categoryId: string;
  subcategoryId: string;
  title: string;
  subtitle: string;
  difficulty: 1 | 2 | 3;
  estimatedTime: number;          // Minutes de lecture
  objectives: string[];           // Objectifs d'apprentissage
  sections: Section[];
  keyPoints: string[];            // Points clés à retenir
  mnemonics: Mnemonic[];          // Techniques de mémorisation
  timeline?: TimelineEvent[];     // Chronologie si pertinent
  quiz: string[];                 // IDs des questions liées
  relatedFiches: string[];        // Fiches connexes
  createdAt: string;
  lastStudied?: string;
  masteryLevel: number;           // 0-100%
}

interface Section {
  id: string;
  type: 'text' | 'interactive' | 'comparison' | 'timeline' | 'map' | 'gallery' | 'quote' | 'definition';
  title: string;
  content: any;                   // Structure selon le type
  animation?: AnimationConfig;
}

interface Mnemonic {
  type: 'acronym' | 'phrase' | 'visual' | 'story' | 'association';
  content: string;
  explanation: string;
}

interface TimelineEvent {
  date: string;
  event: string;
  importance: 'major' | 'minor';
  details?: string;
}

interface AnimationConfig {
  type: 'fadeIn' | 'slideIn' | 'scale' | 'reveal' | 'typewriter';
  delay?: number;
  duration?: number;
  trigger: 'onView' | 'onClick' | 'onHover';
}
```

**Exemple de section interactive :**

```json
{
  "id": "sec-003",
  "type": "interactive",
  "title": "Les institutions de la République romaine",
  "content": {
    "interactiveType": "diagram",
    "elements": [
      {
        "id": "senat",
        "label": "Sénat",
        "position": { "x": 50, "y": 20 },
        "color": "#8B0000",
        "description": "300 puis 600 membres. Contrôle la politique étrangère et les finances.",
        "clickable": true
      },
      {
        "id": "consuls",
        "label": "Consuls (×2)",
        "position": { "x": 50, "y": 50 },
        "color": "#FFD700",
        "description": "Magistrats suprêmes élus pour 1 an. Commandent les armées.",
        "clickable": true
      },
      {
        "id": "assemblees",
        "label": "Assemblées populaires",
        "position": { "x": 50, "y": 80 },
        "color": "#4169E1",
        "description": "Comices centuriates et tributes. Votent les lois et élisent les magistrats.",
        "clickable": true
      }
    ],
    "connections": [
      { "from": "senat", "to": "consuls", "label": "conseille" },
      { "from": "assemblees", "to": "consuls", "label": "élit" }
    ]
  },
  "animation": {
    "type": "fadeIn",
    "delay": 200,
    "trigger": "onView"
  }
}
```

### 4. Progression Utilisateur (`userProgress`)

```typescript
interface UserProgress {
  version: string;                    // Version du schéma
  exportedAt: string;                 // Date export ISO
  profile: UserProfile;
  stats: GlobalStats;
  categoryProgress: CategoryProgress[];
  questionHistory: QuestionAttempt[];
  ficheProgress: FicheProgress[];
  achievements: Achievement[];
  settings: UserSettings;
}

interface UserProfile {
  name?: string;
  startDate: string;
  totalStudyTime: number;             // Minutes
  currentStreak: number;              // Jours consécutifs
  longestStreak: number;
  lastActive: string;
}

interface GlobalStats {
  totalQuestions: number;
  correctAnswers: number;
  averageScore: number;
  totalFichesStudied: number;
  totalTopicsGenerated: number;
}

interface CategoryProgress {
  categoryId: string;
  questionsAnswered: number;
  correctAnswers: number;
  averageScore: number;
  masteryLevel: number;               // 0-100
  weakAreas: string[];                // Sous-catégories à travailler
  strongAreas: string[];              // Sous-catégories maîtrisées
}

interface QuestionAttempt {
  questionId: string;
  answeredAt: string;
  correct: boolean;
  timeSpent: number;                  // Secondes
  selectedAnswerId: string;
}

interface FicheProgress {
  ficheId: string;
  lastStudied: string;
  studyCount: number;
  completedSections: string[];
  masteryLevel: number;
  notes?: string;                     // Notes personnelles
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  unlockedAt: string;
  icon: string;
}

interface UserSettings {
  theme: 'light' | 'dark' | 'auto';
  dailyGoal: number;                  // Questions par jour
  notificationsEnabled: boolean;
  preferredDifficulty: 1 | 2 | 3;
  soundEnabled: boolean;
  animationsEnabled: boolean;
}
```

-----

## 🎨 Design System

### Palette de Couleurs

```css
:root {
  /* Couleurs principales */
  --primary: #2563eb;           /* Bleu principal */
  --primary-dark: #1d4ed8;
  --primary-light: #3b82f6;

  /* Couleurs secondaires */
  --secondary: #7c3aed;         /* Violet */
  --accent: #f59e0b;            /* Ambre pour highlights */

  /* Couleurs sémantiques */
  --success: #10b981;           /* Vert - bonne réponse */
  --error: #ef4444;             /* Rouge - mauvaise réponse */
  --warning: #f59e0b;           /* Orange - attention */
  --info: #3b82f6;              /* Bleu - information */

  /* Neutres */
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --bg-tertiary: #f1f5f9;
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-muted: #94a3b8;
  --border: #e2e8f0;

  /* Dark mode */
  --dark-bg-primary: #0f172a;
  --dark-bg-secondary: #1e293b;
  --dark-bg-tertiary: #334155;
  --dark-text-primary: #f8fafc;
  --dark-text-secondary: #cbd5e1;
  --dark-border: #334155;

  /* Spacing */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  --space-2xl: 3rem;

  /* Border radius */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-normal: 250ms ease;
  --transition-slow: 350ms ease;
}
```

### Typographie

```css
/* Font families */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-serif: 'Merriweather', Georgia, serif;  /* Pour les citations */
--font-mono: 'JetBrains Mono', monospace;      /* Pour le code */

/* Font sizes */
--text-xs: 0.75rem;      /* 12px */
--text-sm: 0.875rem;     /* 14px */
--text-base: 1rem;       /* 16px */
--text-lg: 1.125rem;     /* 18px */
--text-xl: 1.25rem;      /* 20px */
--text-2xl: 1.5rem;      /* 24px */
--text-3xl: 1.875rem;    /* 30px */
--text-4xl: 2.25rem;     /* 36px */
```

### Composants UI Standards

#### Boutons

```jsx
// Bouton primaire
<button className="px-4 py-2 bg-primary text-white font-medium rounded-lg
                   hover:bg-primary-dark transition-colors shadow-sm
                   active:scale-[0.98] disabled:opacity-50">
  Valider
</button>

// Bouton secondaire
<button className="px-4 py-2 bg-white text-primary font-medium rounded-lg
                   border-2 border-primary hover:bg-primary/5 transition-colors">
  Annuler
</button>

// Bouton ghost
<button className="px-4 py-2 text-text-secondary hover:text-primary
                   hover:bg-primary/5 rounded-lg transition-colors">
  Passer
</button>
```

#### Cards

```jsx
// Card standard
<div className="bg-white rounded-xl shadow-md border border-border p-6
                hover:shadow-lg transition-shadow">
  {/* Contenu */}
</div>

// Card interactive (cliquable)
<div className="bg-white rounded-xl shadow-md border border-border p-6
                hover:shadow-lg hover:border-primary/30
                cursor-pointer transition-all active:scale-[0.99]">
  {/* Contenu */}
</div>
```

#### Feedback visuel QCM

```jsx
// Réponse correcte
<div className="border-2 border-success bg-success/10 rounded-lg p-4
                animate-pulse-once">
  <span className="text-success font-medium">✓ Correct !</span>
</div>

// Réponse incorrecte
<div className="border-2 border-error bg-error/10 rounded-lg p-4
                animate-shake">
  <span className="text-error font-medium">✗ Incorrect</span>
</div>
```

-----

## 🔄 Flux Utilisateur

### 1. Premier Lancement

```
┌─────────────────────────────────────────────────────────┐
│                    ÉCRAN D'ACCUEIL                      │
│                                                         │
│   ┌─────────────────────────────────────────────────┐   │
│   │            🎓 CultureMaster                     │   │
│   │                                                 │   │
│   │     Bienvenue ! Prêt à enrichir ta culture     │   │
│   │              générale ?                         │   │
│   │                                                 │   │
│   │   ┌─────────────────────────────────────────┐   │   │
│   │   │      📥 Importer une sauvegarde         │   │   │
│   │   └─────────────────────────────────────────┘   │   │
│   │                                                 │   │
│   │   ┌─────────────────────────────────────────┐   │   │
│   │   │      🚀 Commencer une nouvelle          │   │   │
│   │   │           aventure                       │   │   │
│   │   └─────────────────────────────────────────┘   │   │
│   │                                                 │   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 2. Dashboard Principal

```
┌─────────────────────────────────────────────────────────┐
│  ☰  CultureMaster                    🔔  ⚙️  💾        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   Bonjour ! 🔥 Série de 5 jours                        │
│                                                         │
│   ┌─────────────────────────────────────────────────┐   │
│   │  📊 Aujourd'hui         │  🎯 Objectif          │   │
│   │     12/20 questions     │     ████████░░ 80%    │   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
│   ┌─────────────────────────────────────────────────┐   │
│   │          🎲 QUIZ RAPIDE                         │   │
│   │     10 questions aléatoires                     │   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
│   📚 Catégories                                         │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐              │
│   │ 🏛️       │ │ 🌍       │ │ 🔬       │              │
│   │ Histoire │ │ Géo      │ │ Sciences │              │
│   │ 75%      │ │ 45%      │ │ 30%      │              │
│   └──────────┘ └──────────┘ └──────────┘              │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐              │
│   │ 🎨       │ │ ⚖️       │ │ 🍷       │              │
│   │ Arts     │ │ Politique│ │ Œnologie │              │
│   │ 60%      │ │ 20%      │ │ 85%      │              │
│   └──────────┘ └──────────┘ └──────────┘              │
│                                                         │
│   📝 Fiches récentes                                    │
│   ┌─────────────────────────────────────────────────┐   │
│   │ La République romaine          ▶️ Continuer     │   │
│   │ Les cépages de Bourgogne       ✓ Maîtrisé      │   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
├─────────────────────────────────────────────────────────┤
│   🏠        📚        ➕        📊        👤           │
│  Accueil   Fiches   Nouveau   Stats    Profil         │
└─────────────────────────────────────────────────────────┘
```

### 3. Mode Quiz

```
┌─────────────────────────────────────────────────────────┐
│  ←  Quiz Histoire                      3/10  ⏱️ 1:23   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   ████████████░░░░░░░░░░░░░░░░  30%                    │
│                                                         │
│   ┌─────────────────────────────────────────────────┐   │
│   │                                                 │   │
│   │   En quelle année Jules César a-t-il           │   │
│   │   franchi le Rubicon ?                         │   │
│   │                                                 │   │
│   │   🏛️ Histoire • Antiquité • ⭐⭐               │   │
│   │                                                 │   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
│   ┌─────────────────────────────────────────────────┐   │
│   │  A.  52 av. J.-C.                              │   │
│   └─────────────────────────────────────────────────┘   │
│   ┌─────────────────────────────────────────────────┐   │
│   │  B.  49 av. J.-C.                      ← hover │   │
│   └─────────────────────────────────────────────────┘   │
│   ┌─────────────────────────────────────────────────┐   │
│   │  C.  44 av. J.-C.                              │   │
│   └─────────────────────────────────────────────────┘   │
│   ┌─────────────────────────────────────────────────┐   │
│   │  D.  31 av. J.-C.                              │   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
│                                                         │
│   ┌─────────────────────────────────────────────────┐   │
│   │  💡 Indice    │    ⏭️ Passer                    │   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 4. Feedback Après Réponse

```
┌─────────────────────────────────────────────────────────┐
│  ←  Quiz Histoire                      3/10  ⏱️ 1:45   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   ┌─────────────────────────────────────────────────┐   │
│   │  ✓  CORRECT !                         +10 pts  │   │
│   │     ══════════════════════════════════════════ │   │
│   │                                                 │   │
│   │  Le 10 janvier 49 av. J.-C., César franchit    │   │
│   │  le Rubicon avec ses légions, violant la loi   │   │
│   │  romaine interdisant à tout général de         │   │
│   │  traverser cette rivière en armes.             │   │
│   │                                                 │   │
│   │  ┌───────────────────────────────────────────┐ │   │
│   │  │ 💡 ANECDOTE                               │ │   │
│   │  │                                           │ │   │
│   │  │ La célèbre phrase "Alea jacta est"        │ │   │
│   │  │ aurait en réalité été prononcée en        │ │   │
│   │  │ grec : "Ἀνερρίφθω κύβος"                  │ │   │
│   │  └───────────────────────────────────────────┘ │   │
│   │                                                 │   │
│   │  📚 Voir la fiche : République romaine    →    │   │
│   │                                                 │   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
│   ┌─────────────────────────────────────────────────┐   │
│   │              Question suivante →                │   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 5. Vue Fiche Pédagogique

```
┌─────────────────────────────────────────────────────────┐
│  ←  Fiche                              📥  ⭐  •••     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   LA RÉPUBLIQUE ROMAINE                                 │
│   509 - 27 av. J.-C.                                   │
│                                                         │
│   🏛️ Histoire • Antiquité • ⏱️ 15 min                  │
│   ████████░░ 80% maîtrisé                              │
│                                                         │
│   ┌─────────────────────────────────────────────────┐   │
│   │  📋 OBJECTIFS                                   │   │
│   │  • Comprendre les institutions républicaines    │   │
│   │  • Identifier les causes de la chute           │   │
│   │  • Situer les événements clés                  │   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
│   ═══════════════════════════════════════════════════   │
│                                                         │
│   1. LES INSTITUTIONS                                   │
│   ─────────────────────                                │
│                                                         │
│   ┌─────────────────────────────────────────────────┐   │
│   │        [DIAGRAMME INTERACTIF]                   │   │
│   │                                                 │   │
│   │           ┌─────────┐                          │   │
│   │           │  SÉNAT  │  ← cliquez pour détails  │   │
│   │           └────┬────┘                          │   │
│   │                │                               │   │
│   │           ┌────▼────┐                          │   │
│   │           │ CONSULS │                          │   │
│   │           └────┬────┘                          │   │
│   │                │                               │   │
│   │        ┌───────▼───────┐                       │   │
│   │        │  ASSEMBLÉES   │                       │   │
│   │        └───────────────┘                       │   │
│   │                                                 │   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
│   Le système républicain reposait sur un équilibre     │
│   subtil entre trois pouvoirs...                       │
│                                                         │
│                        ▼ Continuer                      │
└─────────────────────────────────────────────────────────┘
```

### 6. Génération Nouveau Sujet

```
┌─────────────────────────────────────────────────────────┐
│  ←  Nouveau sujet                                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   ➕ AJOUTER UN NOUVEAU SUJET                           │
│                                                         │
│   ┌─────────────────────────────────────────────────┐   │
│   │  Quel sujet voulez-vous apprendre ?            │   │
│   │                                                 │   │
│   │  ┌─────────────────────────────────────────┐   │   │
│   │  │ La guerre de Cent Ans                   │   │   │
│   │  └─────────────────────────────────────────┘   │   │
│   │                                                 │   │
│   │  Catégorie : Histoire ▼                        │   │
│   │  Sous-catégorie : Moyen Âge ▼                  │   │
│   │                                                 │   │
│   │  Difficulté souhaitée :                        │   │
│   │  ○ Débutant  ● Intermédiaire  ○ Expert        │   │
│   │                                                 │   │
│   │  Nombre de questions : 10 ▼                    │   │
│   │                                                 │   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
│   ⚠️ La génération utilise l'API Claude et peut        │
│      prendre 30-60 secondes.                           │
│                                                         │
│   ┌─────────────────────────────────────────────────┐   │
│   │            🚀 GÉNÉRER LE CONTENU                │   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
│   ─────────────────────────────────────────────────────│
│                                                         │
│   📝 Sujets récemment générés :                        │
│   • Les présidents de la Ve République                 │
│   • Le système solaire                                 │
│   • L'impressionnisme                                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

-----

## 🤖 Intégration API Claude

### Configuration

```javascript
// src/config/api.js
export const CLAUDE_CONFIG = {
  model: 'claude-sonnet-4-20250514',
  maxTokens: 4000,
  baseUrl: 'https://api.anthropic.com/v1/messages'
};
```

### Prompts de Génération

#### Génération de Questions QCM

```javascript
// src/prompts/generateQuestions.js
export const generateQuestionsPrompt = (topic, category, subcategory, difficulty, count) => `
Tu es un expert en création de QCM pédagogiques de haute qualité.

SUJET : ${topic}
CATÉGORIE : ${category} > ${subcategory}
DIFFICULTÉ : ${difficulty}/3 (1=facile, 2=moyen, 3=difficile)
NOMBRE : ${count} questions

Génère exactement ${count} questions QCM en JSON avec cette structure :

{
  "questions": [
    {
      "id": "q-[uuid-court]",
      "question": "[Question claire et précise]",
      "answers": [
        { "id": "a1", "text": "[Réponse A]", "isCorrect": false, "feedback": "[Pourquoi c'est faux - optionnel]" },
        { "id": "a2", "text": "[Réponse B]", "isCorrect": true },
        { "id": "a3", "text": "[Réponse C]", "isCorrect": false, "feedback": "[Pourquoi c'est faux - optionnel]" },
        { "id": "a4", "text": "[Réponse D]", "isCorrect": false, "feedback": "[Pourquoi c'est faux - optionnel]" }
      ],
      "explanation": "[Explication détaillée de la bonne réponse - 2-3 phrases]",
      "anecdote": "[Fait mémorable ou surprenant lié à la question]",
      "tags": ["tag1", "tag2", "tag3"]
    }
  ]
}

RÈGLES IMPORTANTES :
1. Une seule bonne réponse par question
2. Les mauvaises réponses doivent être plausibles mais clairement fausses
3. Évite les formulations négatives ("Lequel n'est PAS...")
4. L'explication doit être instructive, pas juste "C'est B car B est correct"
5. L'anecdote doit être mémorable et aider à retenir
6. Varie les types de questions (dates, lieux, personnes, concepts...)
7. Pour difficulté 1 : questions de base, faits connus
8. Pour difficulté 2 : questions demandant réflexion, liens entre concepts
9. Pour difficulté 3 : questions pointues, détails, nuances

Réponds UNIQUEMENT avec le JSON, sans commentaires.
`;
```

#### Génération de Fiche Pédagogique

```javascript
// src/prompts/generateFiche.js
export const generateFichePrompt = (topic, category, subcategory, difficulty) => `
Tu es un expert pédagogue créant des fiches d'apprentissage interactives et mémorables.

SUJET : ${topic}
CATÉGORIE : ${category} > ${subcategory}
DIFFICULTÉ : ${difficulty}/3

Génère une fiche pédagogique complète en JSON :

{
  "id": "f-[uuid-court]",
  "title": "[Titre accrocheur]",
  "subtitle": "[Sous-titre contextuel]",
  "estimatedTime": [minutes],
  "objectives": [
    "[Objectif 1 - verbe d'action]",
    "[Objectif 2]",
    "[Objectif 3]"
  ],
  "sections": [
    {
      "id": "sec-001",
      "type": "text",
      "title": "Introduction",
      "content": {
        "paragraphs": ["[Paragraphe d'accroche captivant]"]
      }
    },
    {
      "id": "sec-002",
      "type": "timeline",
      "title": "Chronologie clé",
      "content": {
        "events": [
          { "date": "[Date]", "event": "[Événement]", "importance": "major", "details": "[Détails]" }
        ]
      }
    },
    {
      "id": "sec-003",
      "type": "interactive",
      "title": "[Titre section interactive]",
      "content": {
        "interactiveType": "cards|diagram|comparison|map",
        "elements": [
          {
            "id": "el-001",
            "label": "[Label]",
            "description": "[Description au clic]",
            "icon": "[emoji]"
          }
        ]
      }
    },
    {
      "id": "sec-004",
      "type": "comparison",
      "title": "[Titre comparaison]",
      "content": {
        "items": [
          { "name": "[Item A]", "characteristics": ["[Carac 1]", "[Carac 2]"] },
          { "name": "[Item B]", "characteristics": ["[Carac 1]", "[Carac 2]"] }
        ]
      }
    },
    {
      "id": "sec-005",
      "type": "quote",
      "title": "Citation mémorable",
      "content": {
        "quote": "[Citation]",
        "author": "[Auteur]",
        "context": "[Contexte]"
      }
    },
    {
      "id": "sec-006",
      "type": "text",
      "title": "À retenir",
      "content": {
        "paragraphs": ["[Résumé des points essentiels]"]
      }
    }
  ],
  "keyPoints": [
    "[Point clé 1 - une phrase]",
    "[Point clé 2]",
    "[Point clé 3]",
    "[Point clé 4]",
    "[Point clé 5]"
  ],
  "mnemonics": [
    {
      "type": "acronym|phrase|visual|story|association",
      "content": "[Le moyen mnémotechnique]",
      "explanation": "[Ce qu'il permet de retenir]"
    }
  ],
  "relatedTopics": ["[Sujet connexe 1]", "[Sujet connexe 2]"]
}

RÈGLES :
1. Contenu riche et détaillé (pas superficiel)
2. Au moins 5 sections variées
3. Inclure au moins 1 élément interactif
4. Anecdotes et faits surprenants pour mémorisation
5. Langage accessible mais précis
6. Mnémotechniques créatifs et efficaces

Réponds UNIQUEMENT avec le JSON.
`;
```

### Gestionnaire d'API

```javascript
// src/hooks/useApi.js
import { useState, useCallback } from 'react';
import { CLAUDE_CONFIG } from '../config/api';

export function useApi() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  const callClaude = useCallback(async (prompt, onProgress) => {
    setIsLoading(true);
    setError(null);
    setProgress(0);

    try {
      const response = await fetch(CLAUDE_CONFIG.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
          'x-api-key': localStorage.getItem('claude_api_key') || ''
        },
        body: JSON.stringify({
          model: CLAUDE_CONFIG.model,
          max_tokens: CLAUDE_CONFIG.maxTokens,
          messages: [{ role: 'user', content: prompt }]
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      setProgress(100);

      // Parse JSON from response
      const content = data.content[0].text;
      return JSON.parse(content);

    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateQuestions = useCallback(async (params) => {
    const prompt = generateQuestionsPrompt(
      params.topic,
      params.category,
      params.subcategory,
      params.difficulty,
      params.count
    );
    return callClaude(prompt);
  }, [callClaude]);

  const generateFiche = useCallback(async (params) => {
    const prompt = generateFichePrompt(
      params.topic,
      params.category,
      params.subcategory,
      params.difficulty
    );
    return callClaude(prompt);
  }, [callClaude]);

  return {
    isLoading,
    error,
    progress,
    generateQuestions,
    generateFiche
  };
}
```

-----

## 💾 Système de Persistance

### Export/Import JSON

```javascript
// src/utils/dataManager.js

export const exportData = (data) => {
  const exportPayload = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    app: 'CultureMaster',
    ...data
  };

  const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
    type: 'application/json'
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `culturemaster-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const importData = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);

        // Validation
        if (!data.version || !data.app === 'CultureMaster') {
          throw new Error('Fichier de sauvegarde invalide');
        }

        resolve(data);
      } catch (err) {
        reject(new Error('Impossible de lire le fichier'));
      }
    };

    reader.onerror = () => reject(new Error('Erreur de lecture'));
    reader.readAsText(file);
  });
};
```

### LocalStorage avec fallback

```javascript
// src/hooks/useStorage.js
import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'culturemaster_data';

export function useStorage() {
  const [data, setData] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Charger au démarrage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setData(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('LocalStorage non disponible');
    }
    setIsLoaded(true);
  }, []);

  // Sauvegarder automatiquement
  useEffect(() => {
    if (data && isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (e) {
        console.warn('Impossible de sauvegarder');
      }
    }
  }, [data, isLoaded]);

  const updateData = useCallback((updater) => {
    setData(prev => {
      const newData = typeof updater === 'function' ? updater(prev) : updater;
      return { ...prev, ...newData, lastModified: new Date().toISOString() };
    });
  }, []);

  return { data, updateData, isLoaded };
}
```

-----

## 🎯 Algorithme de Révision Espacée

```javascript
// src/utils/spacedRepetition.js

// Algorithme SM-2 simplifié
export function calculateNextReview(question, wasCorrect, currentEaseFactor = 2.5) {
  let newEaseFactor = currentEaseFactor;
  let interval;

  if (wasCorrect) {
    // Augmente l'intervalle
    if (question.consecutiveCorrect === 0) {
      interval = 1; // 1 jour
    } else if (question.consecutiveCorrect === 1) {
      interval = 6; // 6 jours
    } else {
      interval = Math.round(question.lastInterval * newEaseFactor);
    }

    // Ajuste le facteur de facilité
    newEaseFactor = Math.max(1.3, newEaseFactor + 0.1);
  } else {
    // Reset et diminue le facteur
    interval = 1;
    newEaseFactor = Math.max(1.3, newEaseFactor - 0.2);
  }

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);

  return {
    nextReview: nextReviewDate.toISOString(),
    interval,
    easeFactor: newEaseFactor,
    consecutiveCorrect: wasCorrect ? (question.consecutiveCorrect || 0) + 1 : 0
  };
}

// Sélectionne les questions à réviser
export function getQuestionsToReview(questions, limit = 20) {
  const now = new Date();

  return questions
    .filter(q => {
      if (!q.nextReview) return true; // Jamais répondue
      return new Date(q.nextReview) <= now;
    })
    .sort((a, b) => {
      // Priorité : jamais répondues, puis par date de révision
      if (!a.nextReview) return -1;
      if (!b.nextReview) return 1;
      return new Date(a.nextReview) - new Date(b.nextReview);
    })
    .slice(0, limit);
}
```

-----

## 🎮 Système de Gamification

### Achievements

```javascript
// src/data/achievements.js
export const ACHIEVEMENTS = [
  {
    id: 'first_quiz',
    name: 'Premier pas',
    description: 'Terminer ton premier quiz',
    icon: '🎯',
    condition: (stats) => stats.totalQuizCompleted >= 1
  },
  {
    id: 'perfect_10',
    name: 'Sans faute !',
    description: '10/10 sur un quiz',
    icon: '🏆',
    condition: (stats) => stats.perfectQuizzes >= 1
  },
  {
    id: 'streak_7',
    name: 'Une semaine !',
    description: '7 jours consécutifs d\'apprentissage',
    icon: '🔥',
    condition: (stats) => stats.currentStreak >= 7
  },
  {
    id: 'all_categories',
    name: 'Touche-à-tout',
    description: 'Répondre à au moins 10 questions dans chaque catégorie',
    icon: '🌟',
    condition: (stats) => Object.values(stats.categoriesProgress).every(c => c.answered >= 10)
  },
  {
    id: 'fiche_master',
    name: 'Rat de bibliothèque',
    description: 'Étudier 20 fiches complètes',
    icon: '📚',
    condition: (stats) => stats.fichesCompleted >= 20
  },
  {
    id: 'creator',
    name: 'Créateur',
    description: 'Générer 5 nouveaux sujets',
    icon: '✨',
    condition: (stats) => stats.topicsGenerated >= 5
  },
  {
    id: 'expert_history',
    name: 'Historien',
    description: 'Atteindre 90% de maîtrise en Histoire',
    icon: '🏛️',
    condition: (stats) => stats.categoriesProgress.histoire?.mastery >= 90
  },
  {
    id: 'wine_connoisseur',
    name: 'Œnologue',
    description: 'Atteindre 90% de maîtrise en Œnologie',
    icon: '🍷',
    condition: (stats) => stats.categoriesProgress.oenologie?.mastery >= 90
  }
];
```

-----

## 📱 Configuration PWA

### manifest.json

```json
{
  "name": "CultureMaster",
  "short_name": "CultureMaster",
  "description": "Application de culture générale interactive",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0f172a",
  "theme_color": "#2563eb",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "categories": ["education", "games"],
  "lang": "fr-FR"
}
```

### Service Worker (sw.js)

```javascript
const CACHE_NAME = 'culturemaster-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/src/main.jsx',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

-----

## 🚀 Guide de Démarrage pour Claude Code

### Étape 1 : Initialisation du projet

```bash
# Créer le projet avec Vite + React
npm create vite@latest culture-master -- --template react
cd culture-master

# Installer les dépendances
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Dépendances supplémentaires
npm install framer-motion lucide-react uuid
```

### Étape 2 : Ordre d'implémentation recommandé

1. **Structure de base**
- Layout et navigation
- Système de routing (React Router ou état)
- Hook useStorage pour persistance
1. **Données initiales**
- Créer categories.json
- Créer 20-30 questions de démo variées
- Créer 3-5 fiches de démo
1. **Module Quiz**
- QuizSelector (choix catégorie/difficulté)
- QuizEngine (logique)
- QuestionCard + AnswerFeedback
- QuizResults
1. **Module Fiches**
- FicheList
- FicheViewer
- Composants de sections (text, timeline, interactive…)
1. **Module Progression**
- Dashboard
- StatsCard
- Achievements
1. **Module Génération**
- Configuration API
- NewTopicForm
- GenerationStatus
1. **Export/Import**
- ImportExport component
- Boutons dans settings
1. **PWA**
- manifest.json
- Service Worker
- Icons

### Étape 3 : Tester sur mobile

```bash
# Lancer en mode développement avec accès réseau
npm run dev -- --host

# Accéder depuis le téléphone via l'IP locale
# Ex: http://192.168.1.XX:5173
```

-----

## 📝 Notes Importantes

1. **Clé API** : L'utilisateur devra entrer sa clé API Claude dans les settings (stockée en localStorage, jamais exposée)
1. **Limitation LocalStorage** : ~5-10 MB selon navigateur. Si l'app grandit beaucoup, prévoir compression ou nettoyage des anciennes données
1. **Mode hors-ligne** : Les quiz et fiches fonctionnent offline, seule la génération nécessite internet
1. **Responsive** : Tout doit être pensé mobile-first (boutons assez grands, touch-friendly)
1. **Accessibilité** : Contraste suffisant, navigation clavier possible

-----

*Documentation générée pour CultureMaster v1.0*
*À utiliser avec Claude Code pour l'implémentation*
