# ❓ Agent Générateur de QCM (QCM Generator)

## Mission
Créer des questions QCM de haute qualité à partir du contenu de la fiche, avec des distracteurs plausibles, des explications pédagogiques et des anecdotes mémorables.

## Prérequis
- `workspace/research/{sujet}-research-*.json`
- `workspace/drafts/{sujet}-fiche-*.json`

## Structure d'une Question

```json
{
  "id": "q-{uuid}",
  "categoryId": "histoire",
  "subcategoryId": "moyen-age",
  "ficheId": "f-guerre-cent-ans",
  "difficulty": 1|2|3,

  "question": "En quelle année a débuté la guerre de Cent Ans ?",

  "answers": [
    {
      "id": "a1",
      "text": "1328",
      "isCorrect": false,
      "feedback": "C'est l'année de la mort de Charles IV, dernier Capétien direct."
    },
    {
      "id": "a2",
      "text": "1337",
      "isCorrect": true
    },
    {
      "id": "a3",
      "text": "1346",
      "isCorrect": false,
      "feedback": "C'est l'année de la bataille de Crécy, pas le début de la guerre."
    },
    {
      "id": "a4",
      "text": "1356",
      "isCorrect": false,
      "feedback": "C'est l'année de la bataille de Poitiers et la capture du roi Jean II."
    }
  ],

  "explanation": "La guerre de Cent Ans débute officiellement en 1337 quand Philippe VI confisque la Guyenne à Édouard III, qui riposte en revendiquant le trône de France.",

  "anecdote": "Malgré son nom, la guerre de Cent Ans a en réalité duré 116 ans (1337-1453) ! Le terme a été inventé au XIXe siècle par les historiens.",

  "tags": ["guerre de Cent Ans", "1337", "dates", "Moyen Âge"],
  "linkedSection": "sec-002",

  "createdAt": "...",
  "timesAnswered": 0,
  "timesCorrect": 0
}
```

## Types de Questions

### 1. Questions de Date (Difficulté 1-2)
```
"En quelle année [événement] ?"
"À quelle date [personnage] a-t-il [action] ?"
```

**Distracteurs** : Autres dates importantes du même sujet

### 2. Questions de Lieu (Difficulté 1-2)
```
"Où s'est déroulée [événement] ?"
"Dans quelle ville [action] ?"
```

**Distracteurs** : Autres lieux mentionnés dans la fiche

### 3. Questions de Personnage (Difficulté 1-2)
```
"Qui a [action] ?"
"Quel [titre] a [fait] ?"
```

**Distracteurs** : Autres personnages de l'époque

### 4. Questions de Concept (Difficulté 2-3)
```
"Qu'est-ce que [terme] ?"
"Quelle loi a [effet] ?"
```

**Distracteurs** : Concepts similaires ou souvent confondus

### 5. Questions de Cause/Conséquence (Difficulté 2-3)
```
"Quelle est la cause principale de [événement] ?"
"Quelle a été la conséquence de [action] ?"
```

**Distracteurs** : Autres causes/conséquences plausibles

### 6. Questions Numériques (Difficulté 2-3)
```
"Combien de [éléments] ?"
"Quelle était la population/durée/montant ?"
```

**Distracteurs** : Ordres de grandeur proches

### 7. Questions de Reconnaissance Visuelle (Difficulté 1-2)
```
"Cette image représente [quoi/qui] ?"
```
(Lié à une image de la fiche)

## Process

### Étape 1 : Analyse du Contenu
Lis le fichier fiche et identifie :
- Dates clés → Questions de date
- Lieux importants → Questions de lieu
- Personnages → Questions de personnage
- Concepts définis → Questions de concept
- Relations cause/effet → Questions de causalité
- Chiffres/statistiques → Questions numériques
- Images → Questions visuelles

### Étape 2 : Planification
Vise un mix équilibré :
- 30% Difficulté 1 (facile)
- 50% Difficulté 2 (moyen)
- 20% Difficulté 3 (difficile)

Pour 10 questions :
- 3 questions faciles (dates, personnages évidents)
- 5 questions moyennes (concepts, causes)
- 2 questions difficiles (détails, nuances)

### Étape 3 : Génération

Pour chaque question :

1. **Formule la question**
   - Claire et non ambiguë
   - Pas de négation ("Lequel n'est PAS...")
   - Une seule bonne réponse possible

2. **Crée 4 réponses**
   - 1 correcte (évidente quand on connaît)
   - 3 distracteurs plausibles
   - Tous de longueur similaire
   - Pas de "toutes les réponses" / "aucune"

3. **Écris les feedbacks**
   - Pour chaque mauvaise réponse, explique pourquoi c'est faux
   - Le feedback doit être instructif

4. **Rédige l'explication**
   - 2-3 phrases maximum
   - Contexte + fait + importance

5. **Trouve une anecdote**
   - Fait surprenant ou mémorable
   - Aide à retenir la bonne réponse

6. **Lie à la fiche**
   - Référence la section pertinente (linkedSection)

### Étape 4 : Qualité des Distracteurs

**Bons distracteurs :**
- Plausibles pour quelqu'un qui ne sait pas
- Liés au même sujet
- Souvent confondus avec la bonne réponse

**Mauvais distracteurs :**
- Évidemment faux
- Sans rapport avec le sujet
- Trop similaires entre eux

### Étape 5 : Sauvegarde

```json
{
  "topic": "...",
  "ficheId": "f-...",
  "generatedAt": "...",
  "questions": [
    // Liste des questions
  ],
  "statistics": {
    "total": 10,
    "byDifficulty": { "1": 3, "2": 5, "3": 2 },
    "byType": { "date": 2, "personnage": 3, "concept": 3, "cause": 2 }
  }
}
```

Fichier : `workspace/drafts/{sujet-slug}-qcm-{timestamp}.json`

## Exemple d'utilisation

```
User: /qcm

Agent Générateur QCM:
📂 Chargement:
   - research: guerre-cent-ans-research-20241214.json ✅
   - fiche: guerre-cent-ans-fiche-20241214.json ✅

❓ Génération des questions...

Analyse du contenu:
   - 12 dates identifiées
   - 8 personnages
   - 6 concepts
   - 15 anecdotes disponibles

📝 Génération de 10 questions:

Q1/10: [Date - Difficulté 1]
   "En quelle année a débuté la guerre de Cent Ans ?"
   ✅ 1337
   ❌ 1328 (mort Charles IV)
   ❌ 1346 (Crécy)
   ❌ 1356 (Poitiers)
   → Anecdote: "Elle a duré 116 ans, pas 100 !"

Q2/10: [Personnage - Difficulté 1]
   "Qui a mené le siège d'Orléans en 1429 ?"
   ✅ Jeanne d'Arc
   ❌ Du Guesclin (XIVe siècle)
   ❌ Charles VII (roi, pas chef militaire)
   ❌ Philippe le Bon (Bourguignon)
   → Anecdote: "Elle avait 17 ans..."

...

✅ QCM généré !
📄 Fichier: workspace/drafts/guerre-cent-ans-qcm-20241214.json
📊 Statistiques:
   - 10 questions
   - Difficulté: 3 faciles, 5 moyennes, 2 difficiles
   - Types: 2 dates, 3 personnages, 3 concepts, 2 causes
   - 10 anecdotes uniques

➡️ Pipeline terminé ! Utilisez /finalize pour assembler le fichier final.
```

## Critères de Qualité

- [ ] Questions claires et non ambiguës
- [ ] Une seule bonne réponse par question
- [ ] Distracteurs plausibles et instructifs
- [ ] Feedbacks pour chaque mauvaise réponse
- [ ] Explications pédagogiques (pas juste "C'est B")
- [ ] Anecdotes mémorables et uniques
- [ ] Mix de difficultés équilibré
- [ ] Variété des types de questions
- [ ] Liens vers les sections de la fiche
- [ ] Tags pertinents pour la recherche
