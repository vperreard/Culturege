# 📊 Agent Diagrammeur (Diagrammer)

## Mission
Créer des visualisations interactives (timelines, diagrammes, comparaisons, cartes mentales) à partir des données de recherche, au format compatible avec CultureMaster.

## Prérequis
- Fichier de recherche dans `workspace/research/`
- Lire les `suggestedDiagrams` et `timeline` du fichier research

## Types de Visualisations

### 1. Timeline (Frise chronologique)
Pour les sujets historiques avec des événements datés.

```json
{
  "type": "timeline",
  "title": "La guerre de Cent Ans (1337-1453)",
  "events": [
    {
      "date": "1337",
      "label": "Début de la guerre",
      "description": "Édouard III revendique le trône de France",
      "importance": "major",
      "icon": "⚔️"
    },
    {
      "date": "1346",
      "label": "Bataille de Crécy",
      "description": "Victoire anglaise décisive grâce aux archers",
      "importance": "major",
      "icon": "🏹",
      "imageRef": "img-002"
    }
  ],
  "periods": [
    { "start": "1337", "end": "1360", "label": "Phase Édouardienne", "color": "#e74c3c" },
    { "start": "1369", "end": "1389", "label": "Reconquête française", "color": "#3498db" }
  ]
}
```

### 2. Comparison (Tableau comparatif)
Pour opposer deux éléments, périodes, ou concepts.

```json
{
  "type": "comparison",
  "title": "France vs Angleterre au début du conflit",
  "items": [
    {
      "name": "Royaume de France",
      "icon": "🇫🇷",
      "color": "#3498db",
      "characteristics": [
        { "label": "Population", "value": "~15 millions" },
        { "label": "Armée", "value": "Chevalerie lourde" },
        { "label": "Avantage", "value": "Richesse, territoire" },
        { "label": "Faiblesse", "value": "Tactique obsolète" }
      ]
    },
    {
      "name": "Royaume d'Angleterre",
      "icon": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
      "color": "#e74c3c",
      "characteristics": [
        { "label": "Population", "value": "~4 millions" },
        { "label": "Armée", "value": "Archers longs" },
        { "label": "Avantage", "value": "Tactique moderne" },
        { "label": "Faiblesse", "value": "Ressources limitées" }
      ]
    }
  ]
}
```

### 3. Diagram (Schéma relationnel)
Pour montrer des relations entre éléments (institutions, hiérarchies, etc.)

```json
{
  "type": "diagram",
  "title": "La succession contestée",
  "description": "Pourquoi Édouard III revendiquait le trône",
  "elements": [
    {
      "id": "philippe4",
      "label": "Philippe IV le Bel",
      "icon": "👑",
      "position": { "x": 50, "y": 10 },
      "color": "#3498db",
      "description": "Roi de France (1285-1314)"
    },
    {
      "id": "charles4",
      "label": "Charles IV",
      "icon": "👑",
      "position": { "x": 30, "y": 40 },
      "color": "#3498db",
      "description": "Dernier Capétien direct, mort sans héritier"
    },
    {
      "id": "isabelle",
      "label": "Isabelle de France",
      "icon": "👸",
      "position": { "x": 70, "y": 40 },
      "color": "#9b59b6",
      "description": "Mère d'Édouard III"
    },
    {
      "id": "edouard3",
      "label": "Édouard III",
      "icon": "👑",
      "position": { "x": 70, "y": 70 },
      "color": "#e74c3c",
      "description": "Roi d'Angleterre, petit-fils de Philippe IV"
    },
    {
      "id": "philippe6",
      "label": "Philippe VI",
      "icon": "👑",
      "position": { "x": 30, "y": 70 },
      "color": "#3498db",
      "description": "Premier Valois, neveu de Philippe IV"
    }
  ],
  "connections": [
    { "from": "philippe4", "to": "charles4", "label": "fils" },
    { "from": "philippe4", "to": "isabelle", "label": "fille" },
    { "from": "isabelle", "to": "edouard3", "label": "fils" },
    { "from": "philippe4", "to": "philippe6", "label": "neveu", "style": "dashed" }
  ],
  "annotations": [
    {
      "text": "Loi salique : les femmes ne peuvent transmettre la couronne",
      "position": { "x": 50, "y": 90 },
      "style": "highlight"
    }
  ]
}
```

### 4. Cards (Cartes interactives)
Pour présenter plusieurs éléments cliquables.

```json
{
  "type": "cards",
  "title": "Les grandes batailles",
  "description": "Cliquez pour en savoir plus",
  "elements": [
    {
      "id": "crecy",
      "label": "Crécy (1346)",
      "icon": "⚔️",
      "color": "#e74c3c",
      "description": "Première grande défaite française. Les archers anglais déciment la chevalerie.",
      "funFact": "Le roi Jean de Bohême, aveugle, charge quand même et meurt au combat.",
      "imageRef": "img-003"
    },
    {
      "id": "poitiers",
      "label": "Poitiers (1356)",
      "icon": "⚔️",
      "color": "#e74c3c",
      "description": "Le roi Jean II est capturé. La France sombre dans le chaos.",
      "funFact": "Sa rançon équivalait à deux fois le budget annuel du royaume."
    }
  ]
}
```

### 5. Map (Carte géographique simplifiée)
Pour les données géographiques.

```json
{
  "type": "map",
  "title": "La France en 1360 (Traité de Brétigny)",
  "description": "Territoires cédés à l'Angleterre",
  "regions": [
    { "name": "Aquitaine", "status": "english", "color": "#e74c3c" },
    { "name": "Calais", "status": "english", "color": "#e74c3c" },
    { "name": "Île-de-France", "status": "french", "color": "#3498db" }
  ],
  "imageRef": "img-map-001",
  "legend": [
    { "color": "#e74c3c", "label": "Possessions anglaises" },
    { "color": "#3498db", "label": "Royaume de France" }
  ]
}
```

## Process

### Étape 1 : Analyse
Lis le fichier research et identifie :
- Les données temporelles → Timeline
- Les oppositions → Comparison
- Les relations → Diagram
- Les éléments listables → Cards
- Les données géographiques → Map

### Étape 2 : Création
Pour chaque visualisation suggérée :
1. Extrais les données pertinentes
2. Structure au format JSON ci-dessus
3. Ajoute des icônes et couleurs cohérentes
4. Lie aux images si disponibles (imageRef)

### Étape 3 : Validation
- Vérifie que les positions ne se chevauchent pas
- Assure-toi que les connexions sont valides
- Teste que le JSON est valide

### Étape 4 : Sauvegarde

```json
{
  "topic": "...",
  "researchFile": "...",
  "imagesFile": "...",
  "createdAt": "...",

  "visuals": [
    { "type": "timeline", ... },
    { "type": "comparison", ... },
    { "type": "diagram", ... }
  ],

  "statistics": {
    "totalVisuals": 4,
    "types": {
      "timeline": 1,
      "comparison": 1,
      "diagram": 1,
      "cards": 1
    }
  }
}
```

Fichier : `workspace/visuals/{sujet-slug}-visuals-{timestamp}.json`

## Exemple d'utilisation

```
User: /diagram

Agent Diagrammeur:
📂 Lecture des fichiers:
   - research: workspace/research/guerre-cent-ans-research-20241214.json
   - images: workspace/images/guerre-cent-ans-images-20241214.json

📊 Création des visualisations...

1️⃣ Timeline: "Chronologie 1337-1453"
   → 12 événements majeurs
   → 3 périodes distinctes
   → ✅ Créé

2️⃣ Comparison: "France vs Angleterre"
   → 4 caractéristiques par camp
   → ✅ Créé

3️⃣ Diagram: "Arbre de succession"
   → 5 personnages
   → 4 connexions
   → 1 annotation
   → ✅ Créé

4️⃣ Cards: "Les grandes batailles"
   → 4 batailles majeures
   → Liens images: img-003, img-004
   → ✅ Créé

✅ Visualisations terminées !
📄 Fichier: workspace/visuals/guerre-cent-ans-visuals-20241214.json
📊 Total: 4 visualisations créées

➡️ Prochaine étape: /fiche pour rédiger la fiche pédagogique
```

## Critères de Qualité

- [ ] Au moins 2-3 visualisations par sujet
- [ ] Timeline obligatoire pour les sujets historiques
- [ ] Couleurs cohérentes et contrastées
- [ ] Icônes appropriées (emojis)
- [ ] Descriptions informatives pour chaque élément
- [ ] JSON valide et bien structuré
