# Système Multi-Agents CultureMaster

## Vue d'ensemble

Ce système utilise **Claude Code** (qui s'exécute sur ton ordinateur) pour orchestrer plusieurs agents spécialisés dans la création de contenu pédagogique de haute qualité.

```
┌──────────────────────────────────────────────────────────────────┐
│                         TON ORDINATEUR                            │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │                       CLAUDE CODE                             ││
│  │                                                               ││
│  │   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        ││
│  │   │Chercheur│→ │ Images  │→ │Diagramme│→ │ Fiche   │→ QCM   ││
│  │   └─────────┘  └─────────┘  └─────────┘  └─────────┘        ││
│  │        │            │            │            │              ││
│  │        ▼            ▼            ▼            ▼              ││
│  │   ┌──────────────────────────────────────────────────────┐  ││
│  │   │              workspace/ (fichiers locaux)             │  ││
│  │   │   research/  images/  visuals/  drafts/  output/     │  ││
│  │   └──────────────────────────────────────────────────────┘  ││
│  │                                                               ││
│  └──────────────────────────────────────────────────────────────┘│
│                              │                                    │
│                              ▼                                    │
│                    📱 Import dans l'app                          │
│                       CultureMaster                               │
└──────────────────────────────────────────────────────────────────┘
```

## Pourquoi ce système ?

### Problème avec la génération simple
- Un seul appel API = contenu superficiel
- Pas d'images ou images cassées
- Pas de diagrammes interactifs
- Pas de vérification des sources

### Solution multi-agents
| Agent | Rôle | Super-pouvoir |
|-------|------|---------------|
| 🔍 Chercheur | Recherche web approfondie | Croise plusieurs sources |
| 🖼️ Curateur Images | Trouve et vérifie les images | `curl` pour tester les URLs |
| 📊 Diagrammeur | Crée timelines, schémas | Visualisations structurées |
| 📝 Rédacteur | Assemble la fiche | Contenu pédagogique engageant |
| ❓ Générateur QCM | Crée les questions | Distracteurs plausibles |

## Utilisation

### Prérequis
- Claude Code installé sur ton ordinateur
- Le projet CultureMaster cloné

### Option 1 : Pipeline complet (recommandé)

```bash
# Dans Claude Code, tape simplement :
/generate La guerre de Cent Ans
```

Cela exécute automatiquement tous les agents en séquence (~2-4 minutes).

### Option 2 : Agent par agent

```bash
# Étape 1 : Recherche
/research La guerre de Cent Ans

# Étape 2 : Images (après validation de la recherche)
/images

# Étape 3 : Diagrammes
/diagram

# Étape 4 : Fiche
/fiche

# Étape 5 : QCM
/qcm

# Étape 6 : Assemblage
/finalize
```

Avantage : Tu peux vérifier/modifier chaque étape.

### Option 3 : Depuis un fichier source

```bash
# Crée un fichier avec ton sujet détaillé
echo "La Renaissance italienne\nFocus sur: Florence, Michel-Ange, Léonard" > workspace/source/renaissance.md

# Lance le pipeline
/generate workspace/source/renaissance.md
```

## Structure des fichiers

```
workspace/
├── source/              # 📥 Tes sujets à traiter
│   └── mon-sujet.md
├── research/            # 🔍 Output du Chercheur
│   └── mon-sujet-research-20241214.json
├── images/              # 🖼️ Output du Curateur
│   └── mon-sujet-images-20241214.json
├── visuals/             # 📊 Output du Diagrammeur
│   └── mon-sujet-visuals-20241214.json
├── drafts/              # 📝 Brouillons
│   ├── mon-sujet-fiche-20241214.json
│   └── mon-sujet-qcm-20241214.json
└── output/              # 📤 Fichiers finaux
    └── mon-sujet-final-20241214.json
```

## Importer dans CultureMaster

### Méthode 1 : Via l'interface
1. Ouvre l'app CultureMaster
2. Va dans **Paramètres** > **Importer des données**
3. Sélectionne le fichier `workspace/output/xxx-final.json`

### Méthode 2 : Copie directe
1. Ouvre `workspace/output/xxx-final.json`
2. Copie le contenu de `fiche` dans `src/data/initialFiches.json`
3. Copie le contenu de `questions` dans `src/data/initialQuestions.json`

## Le concept de "Divulgation Progressive"

Le système utilise la **divulgation progressive** pour optimiser le contexte :

```
┌────────────────────────────────────────────────────────────────┐
│                    MAUVAISE APPROCHE ❌                         │
│                                                                 │
│  Charger TOUS les agents au démarrage                          │
│  → Contexte saturé                                             │
│  → Performances dégradées                                      │
│  → Confusion possible                                          │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                    BONNE APPROCHE ✅                            │
│                                                                 │
│  1. Charger instructions.md (léger, ~100 lignes)               │
│  2. Identifier l'agent nécessaire                              │
│  3. Charger UNIQUEMENT cet agent                               │
│  4. Exécuter                                                   │
│  5. Décharger, passer au suivant                               │
└────────────────────────────────────────────────────────────────┘
```

## Vérification des images

L'agent Curateur utilise `curl` pour vérifier que chaque image est accessible :

```bash
# Ce que fait l'agent automatiquement :
curl -I -s -o /dev/null -w "%{http_code}" "https://upload.wikimedia.org/..."

# Résultats possibles :
# 200 → ✅ Image OK
# 301/302 → Suivre redirection
# 404 → ❌ Image morte, chercher alternative
# 403 → ❌ Accès interdit, chercher alternative
```

**Pourquoi c'est important ?**
- Les URLs Wikimedia changent parfois
- Certaines images sont supprimées
- L'app affiche des images cassées sinon

## Créer un nouvel agent

Tu veux un agent pour créer des posts Instagram ? Facile !

```bash
# Demande à Claude Code :
"Crée un nouvel agent instagram-post qui génère des posts à partir des fiches"
```

Claude va automatiquement :
1. Créer `.claude/agents/instagram-post.md`
2. Mettre à jour `.claude/instructions.md`
3. Créer `.claude/commands/instagram.md`

## Exemples de sujets

```bash
# Histoire
/generate La Révolution française
/generate L'Empire romain
/generate La guerre froide

# Sciences
/generate Le système solaire
/generate L'ADN et la génétique
/generate Les trous noirs

# Géographie
/generate Les volcans
/generate Le fleuve Amazone
/generate Les capitales européennes

# Arts
/generate L'impressionnisme
/generate Mozart et la musique classique
/generate Le cinéma muet

# Œnologie
/generate Les cépages de Bourgogne
/generate Le champagne
/generate Les vins du Rhône
```

## Troubleshooting

### "Les images ne s'affichent pas"
→ Relance `/images` pour re-vérifier les URLs

### "Le pipeline est trop lent"
→ Utilise les options `--skip-images` ou `--skip-diagrams`

### "Je veux modifier le contenu généré"
→ Édite les fichiers dans `workspace/drafts/` puis `/finalize`

### "Claude ne trouve pas les agents"
→ Vérifie que tu es dans le dossier du projet CultureMaster

## Comparaison avec la génération in-app

| Critère | In-App (API) | Multi-Agents (Claude Code) |
|---------|--------------|---------------------------|
| Vitesse | ~30s | ~3min |
| Images | Non | Oui, vérifiées |
| Diagrammes | Basiques | Riches et variés |
| Recherche | Limitée | Web approfondie |
| Qualité | Moyenne | Haute |
| Personnalisation | Faible | Totale |

**Recommandation :**
- **In-App** : Pour des quiz rapides et simples
- **Multi-Agents** : Pour du contenu premium à partager

---

*Documentation du système Multi-Agents CultureMaster v1.0*
