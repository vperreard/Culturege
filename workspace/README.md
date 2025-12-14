# Workspace - Pipeline Multi-Agents

Ce dossier est utilisé par le système multi-agents pour stocker les fichiers intermédiaires et finaux.

## Structure

```
workspace/
├── source/      # 📥 Mets tes sujets ici
├── research/    # 🔍 Recherches (Agent Chercheur)
├── images/      # 🖼️ Images vérifiées (Agent Curateur)
├── visuals/     # 📊 Diagrammes (Agent Diagrammeur)
├── drafts/      # 📝 Brouillons (Fiche + QCM)
└── output/      # 📤 Fichiers finaux à importer
```

## Utilisation

```bash
# Dans Claude Code :
/generate Mon sujet

# Ou étape par étape :
/research Mon sujet
/images
/diagram
/fiche
/qcm
/finalize
```

## Nettoyage

Les fichiers intermédiaires peuvent être supprimés après import :
```bash
rm -rf research/* images/* visuals/* drafts/*
```

Garde les fichiers `output/` comme backup.
