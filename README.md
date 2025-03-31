
# AltMarket - Amazon Alternative Finder

Une extension de navigateur qui aide les utilisateurs à économiser sur leurs achats Amazon en montrant des alternatives d'occasion disponibles sur Leboncoin.fr.

## Structure du projet

Ce projet est composé de deux parties distinctes :

```
├── extension/             # Fichiers de l'extension pour le navigateur
│   ├── manifest.json      # Manifeste de l'extension
│   ├── background.js      # Service worker en arrière-plan
│   ├── content.js         # Script injecté dans les pages Amazon
│   ├── content.css        # Styles pour l'interface utilisateur de l'extension
│   └── icons/             # Icônes de l'extension
│
└── landing-page/          # Site web de présentation de l'extension
    ├── index.html         # Page HTML principale
    ├── styles.css         # Feuille de style CSS
    └── main.js            # Script JavaScript pour la landing page
```

## Extension de navigateur

### Fonctionnalités

- Détecte automatiquement lorsque vous naviguez sur des pages produit d'Amazon.fr
- Affiche les alternatives d'occasion disponibles sur Leboncoin.fr
- Interface propre et minimaliste
- Aide les utilisateurs à prendre des décisions d'achat économiques et durables

### Installation de l'extension

1. Téléchargez le code source ou clonez ce dépôt
2. Ouvrez Chrome et accédez à `chrome://extensions/`
3. Activez le "Mode développeur" dans le coin supérieur droit
4. Cliquez sur "Charger l'extension non empaquetée" et sélectionnez le dossier `extension`
5. L'extension devrait maintenant être installée et active

## Site web de présentation

Le dossier `landing-page` contient un site web statique qui présente l'extension, explique son fonctionnement et ses avantages.

### Déploiement du site

Pour déployer le site web :

1. Téléchargez le contenu du dossier `landing-page` sur votre serveur web
2. Assurez-vous que tous les fichiers (HTML, CSS, JS) sont accessibles
3. Le site est prêt à être consulté

## Développement

### Extension

Pour modifier l'extension :

1. Effectuez vos modifications dans le dossier `extension`
2. Rechargez l'extension dans Chrome en cliquant sur l'icône de rechargement sur la page `chrome://extensions/`
3. Testez vos modifications

### Site web

Pour modifier le site web :

1. Éditez les fichiers dans le dossier `landing-page`
2. Testez localement en ouvrant `index.html` dans un navigateur
3. Déployez les fichiers modifiés sur votre serveur web

## Licence

Licence MIT

