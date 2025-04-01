
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
│   ├── _locales/          # Fichiers de localisation
│   │   ├── en/            # Traductions anglaises
│   │   └── fr/            # Traductions françaises
│   └── icons/             # Icônes de l'extension
│
└── landing-page/          # Site web de présentation de l'extension
    ├── index.html         # Page HTML principale
    ├── styles.css         # Feuille de style CSS
    ├── main.js            # Script JavaScript pour la landing page
    └── images/            # Images et ressources visuelles
        ├── amazon.png     # Logo Amazon pour les démos
        ├── blender1.png   # Images de démonstration
        ├── blender2.png   # Images de démonstration
        ├── blender3.png   # Images de démonstration
        └── opengraph.png  # Image pour le partage sur les réseaux sociaux
```

## Extension de navigateur

### Fonctionnalités

- Détecte automatiquement lorsque vous naviguez sur des pages produit d'Amazon.fr
- Affiche les alternatives d'occasion disponibles sur Leboncoin.fr
- Interface propre et minimaliste
- Aide les utilisateurs à prendre des décisions d'achat économiques et durables

### Installation de l'extension

1. Via le Chrome Web Store: Visitez [la page de l'extension](https://chromewebstore.google.com/detail/cimlfbhfcmldcaklknleaacnanjonfbl) et cliquez sur "Ajouter à Chrome"
2. Installation manuelle:
   - Téléchargez le code source ou clonez ce dépôt
   - Ouvrez Chrome et accédez à `chrome://extensions/`
   - Activez le "Mode développeur" dans le coin supérieur droit
   - Cliquez sur "Charger l'extension non empaquetée" et sélectionnez le dossier `extension`
   - L'extension devrait maintenant être installée et active

## Site web de présentation

Le dossier `landing-page` contient un site web statique qui présente l'extension, explique son fonctionnement et ses avantages.

### Fonctionnalités du site

- Présentation interactive de l'extension
- Démonstration du fonctionnement avec un exemple de produit
- Lien direct vers le Chrome Web Store pour l'installation
- Design responsive adapté à tous les appareils

### Déploiement du site

Pour déployer le site web :

1. Téléchargez le contenu du dossier `landing-page` sur votre serveur web
2. Assurez-vous que tous les fichiers (HTML, CSS, JS, images) sont accessibles
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
