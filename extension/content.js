
// Variable pour stocker les informations du produit
let currentProductInfo = null;
// Variable pour stocker toutes les alternatives pour le filtrage
let allAlternatives = [];
// Paramètres de filtre actuels
let currentFilter = {
  type: 'none', // 'none', 'price-asc', 'price-desc', 'date-asc', 'date-desc'
  label: 'Aucun filtre' // Étiquette à afficher
};
// Stocker l'URL actuelle pour détecter les changements de page
let currentUrl = window.location.href;
// Objet pour mettre en cache les alternatives par URL de produit
let alternativesCache = {};

// Créer et injecter l'interface utilisateur de l'extension
function createExtensionUI() {
  // Créer un conteneur pour l'extension
  const container = document.createElement('div');
  container.id = 'amazon-alternative-finder';
  container.className = 'aaf-container';
  document.body.appendChild(container);

  // Ajouter l'interface initiale (état replié)
  container.innerHTML = `
    <div class="aaf-toggle">
      <img src="${chrome.runtime.getURL('icons/icon16.png')}" alt="AltMarket">
      <span class="aaf-toggle-text">Rechercher</span>
    </div>
    <div class="aaf-panel">
      <div class="aaf-header">
        <div>
          <div class="aaf-header-title">AltMarket</div>
          <div class="aaf-header-subtitle">Alternatives d'occasion</div>
        </div>
        <button class="aaf-close-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="aaf-content">
        <div class="aaf-loading">
          <div class="aaf-spinner"></div>
          <p>Recherche d'alternatives...</p>
        </div>
        <div class="aaf-results" style="display: none;">
          <div class="aaf-filter-controls">
            <p class="aaf-results-count">0 alternatives trouvées sur Leboncoin</p>
            <div class="aaf-filter-container">
              <button class="aaf-filter-button" title="Filtrer les résultats">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                </svg>
              </button>
              <div class="aaf-filter-menu">
                <div class="aaf-filter-option aaf-active" data-filter="none">
                  <span class="aaf-filter-option-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </span>
                  <span>Aucun filtre</span>
                </div>
                <div class="aaf-filter-option" data-filter="price-asc">
                  <span class="aaf-filter-option-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </span>
                  <span>Prix: Croissant</span>
                </div>
                <div class="aaf-filter-option" data-filter="price-desc">
                  <span class="aaf-filter-option-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </span>
                  <span>Prix: Décroissant</span>
                </div>
                <div class="aaf-filter-option" data-filter="date-asc">
                  <span class="aaf-filter-option-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </span>
                  <span>Date: Plus récent</span>
                </div>
                <div class="aaf-filter-option" data-filter="date-desc">
                  <span class="aaf-filter-option-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </span>
                  <span>Date: Plus ancien</span>
                </div>
              </div>
            </div>
          </div>
          <div class="aaf-items"></div>
        </div>
      </div>
      <!--<div class="aaf-footer">
        <div class="aaf-feedback-text">Est-ce que cela vous a aidé ?</div>
        <div class="aaf-feedback-buttons">
          <button class="aaf-feedback-btn aaf-yes-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M7 10v12"></path>
              <path d="M15 5.88 14 10h5.83a2 2 0 0 1-1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"></path>
            </svg>
            Oui
          </button>
          <button class="aaf-feedback-btn aaf-no-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 14V2"></path>
              <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z"></path>
            </svg>
            Non
          </button>
        </div>
      </div> -->
    </div>
  `;

  // Ajouter les écouteurs d'événements
  const toggle = container.querySelector('.aaf-toggle');
  const closeBtn = container.querySelector('.aaf-close-btn');

  toggle.addEventListener('click', () => {
    container.classList.toggle('aaf-expanded');

    // Si nous développons et avons des informations de produit mais pas encore d'alternatives chargées, les récupérer
    if (container.classList.contains('aaf-expanded') && currentProductInfo) {
      // Vérifier si nous avons des alternatives en cache pour ce produit
      if (alternativesCache[window.location.href]) {
        console.log("Utilisation des alternatives en cache pour:", window.location.href);
        renderAlternatives(alternativesCache[window.location.href]);
      } else {
        requestAlternatives(currentProductInfo);
      }
    }
  });

  closeBtn.addEventListener('click', () => {
    container.classList.remove('aaf-expanded');
  });

  // Ajouter l'écouteur pour le bouton de filtre
  const filterButton = container.querySelector('.aaf-filter-button');
  const filterMenu = container.querySelector('.aaf-filter-menu');

  filterButton.addEventListener('click', (event) => {
    event.stopPropagation();
    filterMenu.classList.toggle('aaf-show-menu');
  });

  // Ajouter des écouteurs d'événements de clic aux options de filtre
  const filterOptions = container.querySelectorAll('.aaf-filter-option');
  filterOptions.forEach(option => {
    option.addEventListener('click', () => {
      const filterType = option.getAttribute('data-filter');
      const filterLabel = option.querySelector('span:last-child').textContent;

      // Mettre à jour le filtre et fermer le menu
      if (filterType) {
        currentFilter.type = filterType;
        currentFilter.label = filterLabel;
        updateFilterUI();
        renderFilteredAlternatives();
        filterMenu.classList.remove('aaf-show-menu');
      }
    });
  });

  // Fermer le menu de filtre lors d'un clic à l'extérieur
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.aaf-filter-container')) {
      const allFilterMenus = document.querySelectorAll('.aaf-filter-menu');
      allFilterMenus.forEach(menu => menu.classList.remove('aaf-show-menu'));
    }
  });

  return container;
}

// Mettre à jour l'interface utilisateur du bouton de filtre pour refléter le filtre actuel
function updateFilterUI() {
  const container = document.getElementById('amazon-alternative-finder');
  if (!container) return;

  const filterButton = container.querySelector('.aaf-filter-button');
  const filterOptions = container.querySelectorAll('.aaf-filter-option');

  // Mettre à jour l'état actif du bouton de filtre
  if (currentFilter.type === 'none') {
    filterButton.classList.remove('active');
  } else {
    filterButton.classList.add('active');
  }

  // Mettre à jour l'état actif dans le menu de filtre
  filterOptions.forEach(option => {
    option.classList.remove('aaf-active');

    const optionFilter = option.getAttribute('data-filter');

    if (optionFilter === currentFilter.type) {
      option.classList.add('aaf-active');
    }
  });
}

// Fonction pour demander des alternatives au script d'arrière-plan
function requestAlternatives(productInfo) {
  const container = document.getElementById('amazon-alternative-finder');
  if (!container) return;

  const loading = container.querySelector('.aaf-loading');
  const results = container.querySelector('.aaf-results');

  // Afficher l'état de chargement
  if (loading && results) {
    loading.style.display = 'flex';
    results.style.display = 'none';
  }

  // Vérifier si nous avons des alternatives en cache pour ce produit
  if (alternativesCache[window.location.href]) {
    console.log("Utilisation des alternatives en cache pour:", window.location.href);
    renderAlternatives(alternativesCache[window.location.href]);
    return;
  }

  // Demander des alternatives au script d'arrière-plan
  chrome.runtime.sendMessage({
    action: "GET_ALTERNATIVES",
    productInfo: productInfo
  }, response => {
    console.log("Réponse reçue du script d'arrière-plan:", response);
    // Les alternatives réelles viendront dans un message séparé
  });
}

// Créer une carte à partir du HTML brut de l'article
function createCardFromRawHTML(item) {
  const itemElement = document.createElement('div');
  itemElement.className = 'aaf-item';

  // Analyser le HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(item.html, 'text/html');
  const article = doc.querySelector('article');

  if (!article) {
    console.error('Aucun élément article trouvé dans le HTML');
    return null;
  }

  // Essayer d'extraire les informations de base pour l'affichage
  // Prix
  const price = extractTextContent(article, '[data-test-id="price"]') ||
                extractTextContent(article, '.text-callout.text-on-surface') ||
                'Prix non disponible';

  // Titre
  const title = extractTextContent(article, '[data-test-id="adcard-title"]') ||
                extractTextContent(article, '.text-body-1.text-on-surface') ||
                extractTextContent(article, 'h2') ||
                'Titre de l\'article';

  // Emplacement - utiliser notre fonction améliorée
  const location = extractLocation(article);

  // Date - extraire la date de l'annonce
  const date = extractDate(article);

  // Image
  let imageUrl = '';
  const imgElement = article.querySelector('img');
  if (imgElement && imgElement.src) {
    imageUrl = imgElement.src;
  }

  // Vérifier les badges (nous ignorons maintenant le badge Pro)
  const hasDelivery = article.textContent.includes('Livraison possible');

  // Créer le HTML des badges
  let badges = '';
  if (hasDelivery) {
    badges += '<span class="aaf-badge-delivery">Livraison possible</span>';
  } else {
    // Ajout du badge location si pas de livraison possible
    badges += `<span class="aaf-badge-location">${location}</span>`;
  }

  // Obtenir l'URL (si disponible)
  let url = item.url || '#';
  if (url && url.startsWith('/')) {
    url = 'https://www.leboncoin.fr' + url;
  }

  // Stocker la date pour le tri
  if (date) {
    itemElement.dataset.date = date;
  }

  // Stocker le prix numérique pour le tri
  const numericPrice = parseFloat(price.replace(/[^\d,]/g, '').replace(',', '.'));
  itemElement.dataset.price = isNaN(numericPrice) ? '0' : numericPrice.toString();

  // Rendre l'élément entier cliquable
  itemElement.style.cursor = 'pointer';
  itemElement.addEventListener('click', () => {
    window.open(url, '_blank');
  });

  // Construire le HTML de la carte d'article
  itemElement.innerHTML = `
    <div class="aaf-item-image">
      <img src="${imageUrl}" alt="${title}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiBmaWxsPSIjYWFhIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';">
    </div>
    <div class="aaf-item-content">
      <h4 class="aaf-item-title">${title}</h4>
      <div class="aaf-item-badges">${badges}</div>
      <div class="aaf-item-footer">
        <span class="aaf-item-price">${price}</span>
        <a href="${url}" target="_blank" class="aaf-item-link" onclick="event.stopPropagation()">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
          Voir
        </a>
      </div>
    </div>
    <div class="aaf-item-raw-html" style="display: none;">
      ${item.html}
    </div>
  `;

  return itemElement;
}

// Fonction auxiliaire pour extraire le contenu textuel des éléments avec une meilleure précision
function extractTextContent(parentElement, selector) {
  const element = parentElement.querySelector(selector);
  return element ? element.textContent.trim() : null;
}

// Fonction pour extraire la date de l'annonce
function extractDate(article) {
  // Chercher l'élément avec aria-label contenant "il y a" qui est généralement la date
  const dateElement = article.querySelector('p[aria-label*="il y a"]') ||
                      article.querySelector('p[aria-label="Aujourd\'hui"]');

  if (dateElement) {
    return dateElement.textContent.trim();
  }

  // Chercher parmi tous les éléments text-caption pour trouver une indication de date
  const allCaptions = article.querySelectorAll('p.text-caption.text-neutral');
  for (const caption of allCaptions) {
    const text = caption.textContent.trim();
    if (text.startsWith("il y a") || text === "Aujourd'hui" || text === "Hier") {
      return text;
    }
  }

  return null;
}

// Fonction améliorée pour extraire la localisation avec précision
function extractLocation(article) {
  // Sélecteur le plus précis d'abord - élément avec aria-label contenant "Située à"
  const locationWithAriaLabel = article.querySelector('p[aria-label*="Située à"]');
  if (locationWithAriaLabel) {
    // Extrait uniquement la partie ville de l'aria-label
    const ariaLabel = locationWithAriaLabel.getAttribute('aria-label') || '';
    const match = ariaLabel.match(/Située à ([^,]+)/);
    location = match ? match[1].trim() : locationWithAriaLabel.textContent.trim();
    return location;
  }

  // Sélecteurs alternatifs par ordre de précision
  const selectors = [
    'p.text-caption.text-neutral:last-of-type', // Souvent le dernier paragraphe avec cette classe est la localisation
    '.adcard_8f3833cd8 p.text-caption.text-neutral:last-child', // Sélecteur plus spécifique
    'div:last-child > p.text-caption.text-neutral:last-child', // Cibler le dernier élément de localisation
  ];

  // Essayer chaque sélecteur jusqu'à trouver un qui fonctionne
  for (const selector of selectors) {
    const element = article.querySelector(selector);
    if (element) {
      const text = element.textContent.trim();
      // Éviter de capturer la date (commence souvent par "il y a")
      if (text && !text.startsWith("il y a") && text !== "Aujourd'hui" && text !== "Hier") {
        location = text;
        break;
      }
    }
  }

  // Si on n'a toujours pas trouvé, on essaie une approche plus générique
  if (!location) {
    // Chercher tous les éléments text-caption et analyser leur contenu
    const allCaptions = article.querySelectorAll('p.text-caption.text-neutral');
    for (const caption of allCaptions) {
      const text = caption.textContent.trim();
      // Éviter les textes qui semblent être des dates ou des catégories
      if (text && !text.includes('il y a') && !text.includes('Tech') &&
          text !== "Aujourd'hui" && text !== "Hier") {
        location = text;
        break;
      }
    }
  }

  return location || 'Lieu non disponible';
}

// Appliquer les filtres actuels aux alternatives et les afficher
function renderFilteredAlternatives() {
  const container = document.getElementById('amazon-alternative-finder');
  if (!container) return;

  const itemsContainer = container.querySelector('.aaf-items');
  if (!itemsContainer) return;

  // Vider le conteneur
  itemsContainer.innerHTML = '';

  // Créer une copie des alternatives à trier
  const filteredAlternatives = [...allAlternatives];

  // Appliquer le tri si un filtre est actif
  if (currentFilter.type !== 'none') {
    filteredAlternatives.sort((a, b) => {
      const elemA = document.createElement('div');
      const elemB = document.createElement('div');

      // Créer des éléments temporaires pour extraire des valeurs comparables
      const cardA = createCardFromRawHTML({ ...a });
      const cardB = createCardFromRawHTML({ ...b });

      if (!cardA || !cardB) return 0;

      let valueA, valueB;
      let sortMultiplier = 1;

      if (currentFilter.type.startsWith('price')) {
        valueA = parseFloat(cardA.dataset.price) || 0;
        valueB = parseFloat(cardB.dataset.price) || 0;
        sortMultiplier = currentFilter.type === 'price-asc' ? 1 : -1;
      } else if (currentFilter.type.startsWith('date')) {
        // Pour la date, nous utilisons le texte de date qui peut être relatif
        valueA = cardA.dataset.date || '';
        valueB = cardB.dataset.date || '';

        // Heuristique simple pour le tri de date relative (pas parfait mais un point de départ)
        if (valueA.includes('min') && valueB.includes('h')) return currentFilter.type === 'date-asc' ? -1 : 1;
        if (valueA.includes('h') && valueB.includes('min')) return currentFilter.type === 'date-asc' ? 1 : -1;
        if (valueA.includes('h') && valueB.includes('h')) {
          const hoursA = parseInt(valueA.match(/\d+/)[0]) || 0;
          const hoursB = parseInt(valueB.match(/\d+/)[0]) || 0;
          return currentFilter.type === 'date-asc' ? hoursA - hoursB : hoursB - hoursA;
        }
        if (valueA.includes('j') && !valueB.includes('j')) return currentFilter.type === 'date-asc' ? 1 : -1;
        if (!valueA.includes('j') && valueB.includes('j')) return currentFilter.type === 'date-asc' ? -1 : 1;
        if (valueA.includes('j') && valueB.includes('j')) {
          const daysA = parseInt(valueA.match(/\d+/)[0]) || 0;
          const daysB = parseInt(valueB.match(/\d+/)[0]) || 0;
          return currentFilter.type === 'date-asc' ? daysA - daysB : daysB - daysA;
        }
        return valueA.localeCompare(valueB);
      }

      return (valueA - valueB) * sortMultiplier;
    });
  }

  // Afficher les alternatives triées
  filteredAlternatives.forEach(item => {
    if (item.html) {
      const itemElement = createCardFromRawHTML(item);
      if (itemElement) {
        itemsContainer.appendChild(itemElement);
      }
    }
  });
}

// Afficher les alternatives dans le panneau
function renderAlternatives(alternatives) {
  console.log("Affichage des alternatives:", alternatives);

  const container = document.getElementById('amazon-alternative-finder');
  if (!container) return;

  const loading = container.querySelector('.aaf-loading');
  const results = container.querySelector('.aaf-results');
  const resultsCount = container.querySelector('.aaf-results-count');
  const toggleText = container.querySelector('.aaf-toggle-text');
  const filterControls = container.querySelector('.aaf-filter-controls');
  const itemsContainer = container.querySelector('.aaf-items');

  // Masquer l'état de chargement
  if (loading) {
    loading.style.display = 'none';
  }

  // Vérifier si alternatives est un tableau et contient des éléments
  if (!Array.isArray(alternatives) || alternatives.length === 0) {
    // Afficher la nouvelle interface pour aucun résultat
    if (results) {
      results.style.display = 'block';

      // Masquer les contrôles de filtre et le nombre de résultats
      if (filterControls) {
        filterControls.style.display = 'none';
      }

      // Ajouter la nouvelle interface pour aucun résultat
      if (itemsContainer) {
        itemsContainer.innerHTML = `
          <div class="aaf-no-results">
            <svg class="aaf-no-results-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 121.7 122.88">
              <path d="M53.62 0c14.81 0 28.21 6 37.91 15.7 9.7 9.7 15.7 23.11 15.7 37.91 0 10.83-3.21 20.91-8.74 29.35l23.2 25.29-16 14.63-22.37-24.62a53.359 53.359 0 01-29.7 8.98c-14.81 0-28.21-6-37.91-15.7C6 81.82 0 68.42 0 53.62 0 38.81 6 25.41 15.7 15.7 25.41 6 38.81 0 53.62 0zm8.01 38.91a4.747 4.747 0 016.76-.02 4.868 4.868 0 01.02 6.83l-8.17 8.29 8.18 8.3c1.85 1.88 1.82 4.92-.05 6.79-1.88 1.87-4.9 1.87-6.74-.01l-8.13-8.24-8.14 8.26a4.747 4.747 0 01-6.76.02 4.868 4.868 0 01-.02-6.83l8.17-8.3-8.18-8.3c-1.85-1.88-1.82-4.92.06-6.79 1.88-1.87 4.9-1.87 6.74.01l8.13 8.24 8.13-8.25zM87.3 19.93C78.68 11.31 66.77 5.98 53.62 5.98c-13.15 0-25.06 5.33-33.68 13.95-8.63 8.62-13.96 20.53-13.96 33.69 0 13.15 5.33 25.06 13.95 33.68 8.62 8.62 20.53 13.95 33.68 13.95 13.16 0 25.06-5.33 33.68-13.95 8.62-8.62 13.95-20.53 13.95-33.68.01-13.16-5.32-25.07-13.94-33.69z" fill-rule="evenodd" clip-rule="evenodd"/>
            </svg>
            <div class="aaf-no-results-text">Aucune alternative trouvée</div>
          </div>
        `;
      }
    }

    // Réinitialiser le texte du toggle s'il n'y a pas de résultats
    if (toggleText) {
      toggleText.textContent = "Rechercher sur leboncoin";
      toggleText.classList.remove('has-alternatives');
    }

    return;
  }

  // Afficher les contrôles de filtre lorsque nous avons des résultats
  if (filterControls) {
    filterControls.style.display = 'flex';
  }

  // Stocker toutes les alternatives pour le filtrage
  allAlternatives = [...alternatives];

  // Mettre en cache les alternatives pour cette URL de produit
  alternativesCache[window.location.href] = alternatives;

  // Mettre à jour le texte du toggle avec le compte
  if (toggleText) {
    toggleText.textContent = `${alternatives.length} alternatives`;
    toggleText.classList.add('has-alternatives');
  }

  // Mettre à jour le texte du nombre
  if (resultsCount) {
    resultsCount.textContent = `${alternatives.length} alternatives trouvées sur Leboncoin`;
  }

  // Appliquer tous les filtres actifs et afficher
  if (currentFilter.type !== 'none') {
    renderFilteredAlternatives();
  } else {
    // Si aucun filtre n'est actif, afficher normalement
    if (itemsContainer) {
      itemsContainer.innerHTML = '';

      // Ajouter chaque alternative comme une carte
      alternatives.forEach(item => {
        if (item.html) {
          const itemElement = createCardFromRawHTML(item);
          if (itemElement) {
            itemsContainer.appendChild(itemElement);
          }
        }
      });
    }
  }

  // Afficher les résultats
  if (results) {
    results.style.display = 'block';
  }

  // Réinitialiser les boutons de filtre à l'état par défaut
  updateFilterUI();

  // Stocker les alternatives dans sessionStorage pour la persistance
  try {
    // Stocker avec la clé URL pour différencier entre les produits
    sessionStorage.setItem(`aaf_alternatives_${window.location.pathname}`, JSON.stringify(alternatives));

    // Stocker également l'ensemble du cache
    sessionStorage.setItem('aaf_alternatives_cache', JSON.stringify(alternativesCache));
  } catch (error) {
    console.error("Erreur lors du stockage des alternatives dans sessionStorage:", error);
  }
}

// Vérifier si l'URL actuelle est une page de produit Amazon
function isAmazonProductPage() {
  return window.location.href.match(/amazon\.fr.*\/dp\//);
}

// Réinitialiser l'état de l'interface utilisateur lors de la navigation vers un nouveau produit
function resetUI() {
  const container = document.getElementById('amazon-alternative-finder');
  if (!container) return;

  // Réinitialiser le texte du toggle
  const toggleText = container.querySelector('.aaf-toggle-text');
  if (toggleText) {
    toggleText.textContent = "Rechercher sur leboncoin";
    toggleText.classList.remove('has-alternatives');
  }

  // Réinitialiser les alternatives
  allAlternatives = [];

  // Afficher le chargement si le panneau est développé
  if (container.classList.contains('aaf-expanded')) {
    const loading = container.querySelector('.aaf-loading');
    const results = container.querySelector('.aaf-results');

    if (loading && results) {
      loading.style.display = 'flex';
      results.style.display = 'none';
    }

    // Si nous avons des alternatives en cache pour cette URL, les afficher
    if (alternativesCache[window.location.href]) {
      console.log("Utilisation des alternatives en cache après changement d'URL:", window.location.href);
      renderAlternatives(alternativesCache[window.location.href]);
    }
  }
}

// Initialiser l'interface utilisateur de l'extension
function initExtension() {
  if (isAmazonProductPage()) {
    console.log("Page produit Amazon détectée. Initialisation de l'extension...");
    createExtensionUI();

    // Essayer de charger le cache d'alternatives depuis sessionStorage
    try {
      const storedCache = sessionStorage.getItem('aaf_alternatives_cache');
      if (storedCache) {
        alternativesCache = JSON.parse(storedCache);
        console.log("Cache d'alternatives chargé depuis sessionStorage:", alternativesCache);
      }

      // Vérifier si nous avons des alternatives en cache pour l'URL actuelle
      if (alternativesCache[window.location.href]) {
        console.log("Alternatives en cache trouvées pour l'URL actuelle:", window.location.href);
        renderAlternatives(alternativesCache[window.location.href]);
      } else {
        // Essayer de charger les alternatives spécifiques à l'URL depuis sessionStorage
        const storedAlternatives = sessionStorage.getItem(`aaf_alternatives_${window.location.pathname}`);
        if (storedAlternatives) {
          const parsedAlternatives = JSON.parse(storedAlternatives);
          console.log("Alternatives chargées depuis sessionStorage:", parsedAlternatives);
          renderAlternatives(parsedAlternatives);
          // Également ajouter au cache
          alternativesCache[window.location.href] = parsedAlternatives;
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement des alternatives depuis sessionStorage:", error);
    }

    // Configurer la détection de changement d'URL
    currentUrl = window.location.href;
  }
}

// Écouter les infos produit du script d'arrière-plan
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Script de contenu a reçu un message:", message);

  if (message.action === "PRODUCT_INFO") {
    console.log("Informations produit reçues:", message.productInfo);

    // Stocker les informations produit
    currentProductInfo = message.productInfo;

    // Initialiser l'interface si elle n'existe pas
    let container = document.getElementById('amazon-alternative-finder');
    if (!container) {
      container = createExtensionUI();
    }
  } else if (message.action === "ALTERNATIVES_FOUND") {
    console.log("Alternatives reçues:", message.alternatives);

    // Afficher les alternatives dans l'interface
    renderAlternatives(message.alternatives);

    // Mettre en cache les alternatives pour cette URL de produit
    if (message.alternatives && message.alternatives.length > 0) {
      alternativesCache[window.location.href] = message.alternatives;

      // Mettre à jour sessionStorage avec le nouveau cache
      try {
        sessionStorage.setItem('aaf_alternatives_cache', JSON.stringify(alternativesCache));
      } catch (error) {
        console.error("Erreur lors du stockage du cache d'alternatives dans sessionStorage:", error);
      }
    }
  }
});

// Initialiser l'extension lorsque le DOM est entièrement chargé
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initExtension);
} else {
  initExtension();
}

// Configurer la détection de changement d'URL avec MutationObserver pour réinitialiser le badge lors de la navigation vers un nouveau produit
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    console.log('URL changée pour', url);
    resetUI();
  }
}).observe(document, {subtree: true, childList: true});
