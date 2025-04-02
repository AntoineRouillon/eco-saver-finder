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
// Variable pour suivre si le scraping a commencé (No results check returned false)
let isScrapingStarted = false;
// Clé pour le localStorage pour l'onboarding
const ONBOARDING_COMPLETED_KEY = 'altmarket_onboarding_completed';

// Fonction utilitaire pour gérer le pluriel/singulier
function formatAlternativesCount(count) {
  return count === 1 ? `${count} alternative` : `${count} alternatives`;
}

// Vérifier si l'onboarding a déjà été complété
function isOnboardingCompleted() {
  return localStorage.getItem(ONBOARDING_COMPLETED_KEY) === 'true';
}

// Marquer l'onboarding comme complété
function markOnboardingCompleted() {
  localStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
}

// Créer l'overlay d'onboarding
function createOnboardingOverlay() {
  // Si l'onboarding a déjà été complété, ne pas le montrer
  if (isOnboardingCompleted()) {
    return null;
  }

  const overlay = document.createElement('div');
  overlay.id = 'aaf-onboarding-overlay';
  overlay.className = 'aaf-onboarding-overlay';
  
  // Ajouter le tooltip
  const tooltip = document.createElement('div');
  tooltip.className = 'aaf-onboarding-tooltip';
  tooltip.innerHTML = `
    <div class="aaf-onboarding-tooltip-content">
      <p>Cliquez sur le bouton rechercher pour découvrir les alternatives disponibles sur Leboncoin</p>
      <button class="aaf-onboarding-got-it">J'ai compris</button>
    </div>
    <div class="aaf-onboarding-tooltip-arrow"></div>
  `;
  
  overlay.appendChild(tooltip);
  document.body.appendChild(overlay);

  // Positionner le tooltip près du toggle button
  positionOnboardingTooltip();

  // Ajouter l'écouteur pour le bouton "J'ai compris"
  const gotItButton = overlay.querySelector('.aaf-onboarding-got-it');
  if (gotItButton) {
    gotItButton.addEventListener('click', (e) => {
      e.stopPropagation();
      dismissOnboarding();
    });
  }

  // Fermer l'onboarding lorsque l'utilisateur clique sur le toggle
  const toggleButton = document.querySelector('.aaf-toggle');
  if (toggleButton) {
    toggleButton.addEventListener('click', dismissOnboarding, { once: true });
  }

  // Fermer l'onboarding lorsque l'utilisateur clique sur l'overlay
  overlay.addEventListener('click', (e) => {
    // Ne pas fermer si le clic est sur le tooltip
    if (!e.target.closest('.aaf-onboarding-tooltip-content')) {
      dismissOnboarding();
    }
  });

  return overlay;
}

// Positionner le tooltip près du toggle button
function positionOnboardingTooltip() {
  const toggleButton = document.querySelector('.aaf-toggle');
  const tooltip = document.querySelector('.aaf-onboarding-tooltip');
  
  if (toggleButton && tooltip) {
    const toggleRect = toggleButton.getBoundingClientRect();
    
    // Positionnement à gauche du toggle
    tooltip.style.top = `${toggleRect.top + toggleRect.height / 2 - tooltip.offsetHeight / 2}px`;
    tooltip.style.right = `${document.documentElement.clientWidth - toggleRect.left + 20}px`;
    
    // Positionner la flèche du tooltip
    const tooltipArrow = tooltip.querySelector('.aaf-onboarding-tooltip-arrow');
    if (tooltipArrow) {
      tooltipArrow.style.top = '50%';
      tooltipArrow.style.right = '-10px'; // La flèche pointe vers la droite
    }
  }
}

// Fermer et nettoyer l'onboarding
function dismissOnboarding() {
  const overlay = document.getElementById('aaf-onboarding-overlay');
  if (overlay) {
    overlay.classList.add('aaf-fade-out');
    
    setTimeout(() => {
      overlay.remove();
      markOnboardingCompleted();
    }, 300); // Correspond à la durée de l'animation
  }
}

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
        <div class="aaf-header-icon">
          <img src="${chrome.runtime.getURL('icons/icon48.png')}" alt="AltMarket" width="48" height="48">
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
          <div class="aaf-initial-loading" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 200px;">
            <div class="aaf-spinner"></div>
            <p>Recherche d'alternatives...</p>
          </div>
          <div class="aaf-skeleton-loading" style="display: none;">
            <!-- Skeleton loading cards will be added here -->
            <div class="aaf-filter-controls">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              </div>
            </div>
            <div class="aaf-skeleton-items">
              <!-- Skeleton cards will be inserted here by JavaScript -->
            </div>
          </div>
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

  // Create skeleton cards (similar to the React component's SkeletonProductCard)
  const skeletonContainer = container.querySelector('.aaf-skeleton-items');
  if (skeletonContainer) {
    for (let i = 0; i < 3; i++) {
      const skeletonCard = document.createElement('div');
      skeletonCard.className = 'aaf-skeleton-card';
      skeletonCard.innerHTML = `
        <div class="aaf-skeleton-image" style="width: 100%; height: 160px; background: #eee; border-radius: 8px 8px 0 0;"></div>
        <div class="aaf-skeleton-content" style="padding: 12px;">
          <div class="aaf-skeleton-title" style="width: 100%; height: 16px; background: #eee; border-radius: 4px; margin-bottom: 8px;"></div>
          <div class="aaf-skeleton-subtitle" style="width: 75%; height: 16px; background: #eee; border-radius: 4px; margin-bottom: 12px;"></div>
          <div class="aaf-skeleton-badges" style="display: flex; gap: 4px; margin-bottom: 12px;">
            <div class="aaf-skeleton-badge" style="width: 60px; height: 20px; background: #eee; border-radius: 10px;"></div>
            <div class="aaf-skeleton-badge" style="width: 80px; height: 20px; background: #eee; border-radius: 10px;"></div>
          </div>
          <div class="aaf-skeleton-footer" style="display: flex; justify-content: space-between; align-items: center;">
            <div class="aaf-skeleton-price" style="width: 60px; height: 20px; background: #eee; border-radius: 4px;"></div>
            <div class="aaf-skeleton-button" style="width: 60px; height: 28px; background: #eee; border-radius: 4px;"></div>
          </div>
        </div>
      `;
      skeletonContainer.appendChild(skeletonCard);
    }
  }

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
  const initialLoading = container.querySelector('.aaf-initial-loading');
  const results = container.querySelector('.aaf-results');

  // Afficher l'état de chargement initial (spinner)
  if (loading && initialLoading && results) {
    loading.style.display = 'block';
    initialLoading.style.display = 'flex';
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
  let price = extractTextContent(article, '[data-test-id="price"]') ||
              extractTextContent(article, '.text-callout.text-on-surface') ||
              'Prix non disponible';
  
  // Ajouter un espace entre le symbole € et "Baisse de prix" si présent
  price = price.replace(/€Baisse/, '€ Baisse');
  
  // Remplacer "Baisse de prix" par l'icône SVG
  price = price.replace(/Baisse de prix/, '<svg class="aaf-price-decrease-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" data-title="SvgGraphArrowDown" fill="currentColor"><title>Baisse de prix</title><path fill-rule="evenodd" clip-rule="evenodd" d="M2.29289 6.3006C2.68341 5.8998 3.31658 5.8998 3.7071 6.3006L8.53842 11.2591L11.5076 8.21177C11.8239 7.89353 12.2493 7.71532 12.6922 7.71532C13.1352 7.71532 13.5605 7.89357 13.8769 8.21181L13.884 8.21898L20 14.496V11.2895C20 10.7226 20.4477 10.2631 21 10.2631C21.5523 10.2631 22 10.7226 22 11.2895V16.9737C22 17.5405 21.5523 18 21 18H15.4616C14.9093 18 14.4616 17.5405 14.4616 16.9737C14.4616 16.4069 14.9093 15.9474 15.4616 15.9474H18.5858L12.6922 9.89881L9.72307 12.9461C9.40673 13.2644 8.98139 13.4426 8.53842 13.4426C8.09546 13.4426 7.67016 13.2643 7.35382 12.9461L7.34667 12.9389L2.29289 7.75204C1.90237 7.35123 1.90237 6.7014 2.29289 6.3006Z"></path></svg>');

  // Titre
  const title = extractTextContent(article, '[data-test-id="adcard-title"]') ||
                extractTextContent(article, '.text-body-1.text-on-surface') ||
                extractTextContent(article, 'h2') ||
                'Titre de l\'article';

  // Emplacement - utiliser notre fonction améliorée
  const location = extractLocation(article);
  
  // Date - utiliser la nouvelle fonction extractDate
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
  }
  
  // Toujours ajouter le badge location
  badges += `<span class="aaf-badge-location">${location}</span>`;

  // Obtenir l'URL (si disponible)
  let url = item.url || '#';
  if (url && url.startsWith('/')) {
    url = 'https://www.leboncoin.fr' + url;
  }

  // Stocker la date pour le tri
  itemElement.dataset.date = date;

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
      ${date ? `<span class="aaf-badge-date">${date}</span>` : ''}
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

// Fonction améliorée pour extraire la localisation avec plus de précision
function extractLocation(article) {
  // Essayer d'abord les sélecteurs spécifiques avec aria-label contenant "Située à"
  const locationWithAriaLabel = article.querySelector('p[aria-label*="Située à"]');
  if (locationWithAriaLabel) {
    // Extrait uniquement la partie ville de l'aria-label
    const ariaLabel = locationWithAriaLabel.getAttribute('aria-label') || '';
    const match = ariaLabel.match(/Située à ([^\.]+)/);
    return match ? match[1].trim() : locationWithAriaLabel.textContent.trim();
  }
  
  // Sélecteurs alternatifs par ordre de précision, en excluant explicitement les dates
  const selectors = [
    'p.text-caption.text-neutral:not([aria-label*="Date de dépôt"])',
    '.adcard_8f3833cd8 p.text-caption.text-neutral:not([aria-label*="Date de dépôt"])',
    'div:last-child > p.text-caption.text-neutral:not([aria-label*="Date de dépôt"])',
  ];
  
  // Essayer chaque sélecteur jusqu'à trouver un qui fonctionne
  for (const selector of selectors) {
    const elements = Array.from(article.querySelectorAll(selector));
    // Filter out elements that are likely not location (e.g., category, date)
    const locationCandidate = elements.find(el => {
      const text = el.textContent.trim();
      const ariaLabel = el.getAttribute('aria-label') || '';
      return !ariaLabel.includes('Date de dépôt') && 
             !ariaLabel.includes('Catégorie') && 
             text.length > 0;
    });
    
    if (locationCandidate) {
      return locationCandidate.textContent.trim();
    }
  }
  
  return 'Lieu non disponible';
}

// Nouvelle fonction pour extraire la date avec plus de précision
function extractDate(article) {
  // Rechercher les éléments avec aria-label contenant "Date de dépôt"
  const dateWithAriaLabel = article.querySelector('p[aria-label*="Date de dépôt"]');
  if (dateWithAriaLabel) {
    return dateWithAriaLabel.textContent.trim();
  }
  
  // Rechercher les éléments avec data-test-id="ad-date"
  const dateWithTestId = article.querySelector('[data-test-id="ad-date"]');
  if (dateWithTestId) {
    return dateWithTestId.textContent.trim();
  }
  
  // Rechercher tous les éléments text-caption qui pourraient contenir une date
  const allTextCaptions = Array.from(article.querySelectorAll('p.text-caption.text-neutral'));
  const dateCandidate = allTextCaptions.find(el => {
    const text = el.textContent.trim();
    // Vérifier si le texte ressemble à une date
    return /^\d{2}\/\d{2}\/\d{4}$/.test(text) || // Format: 19/03/2025
           /^il y a \d+ (minute|minutes|heure|heures|jour|jours)$/.test(text); // Format: il y a X minutes/heures/jours
  });
  
  if (dateCandidate) {
    return dateCandidate.textContent.trim();
  }
  
  return '';
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

  // Hide all loading states
  hideSkeletonLoading();

  // Masquer l'état de chargement
  if (loading) {
    loading.style.display = 'none';
  }

  // Vérifier si alternatives est un tableau et contient des éléments
  if (!Array.isArray(alternatives) || alternatives.length === 0) {
    // Afficher la nouvelle interface pour aucun résultat
    if (results) {
      // Appliquer la classe CSS pour masquer les contrôles de filtre
      results.classList.add('aaf-no-results-found');
      results.style.display = 'block';

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
      toggleText.textContent = "Aucune alternative";
      toggleText.classList.remove('has-alternatives');
    }

    return;
  }

  // S'assurer que la classe pour cacher les contrôles de filtre est supprimée
  if (results) {
    results.classList.remove('aaf-no-results-found');
  }

  // Stocker toutes les alternatives pour le filtrage
  allAlternatives = [...alternatives];

  // Mettre en cache les alternatives pour cette URL de produit
  alternativesCache[window.location.href] = alternatives;

  // Mettre à jour le texte du toggle avec le compte (avec gestion singulier/pluriel)
  if (toggleText) {
    toggleText.textContent = formatAlternativesCount(alternatives.length);
    toggleText.classList.add('has-alternatives');
  }

  // Mettre à jour le texte du nombre (avec gestion singulier/pluriel)
  if (resultsCount) {
    resultsCount.textContent = alternatives.length === 1 
      ? `${alternatives.length} alternative trouvée sur Leboncoin`
      : `${alternatives.length} alternatives trouvées sur Leboncoin`;
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
    toggleText.textContent = "Rechercher";
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
    const container = createExtensionUI();
    
    // Afficher l'onboarding si c'est la première utilisation
    setTimeout(() => {
      createOnboardingOverlay();
    }, 1000); // Petit délai pour s'assurer que l'interface est bien chargée

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
  } else if (message.action === "NO_RESULTS_CHECK_COMPLETED" && message.result === false) {
    // This message would be sent from background.js when the "No results check" returns false
    console.log("'No results check' completed with result: false");
    showSkeletonLoading();
  } else if (message.action === "SCRAPING_STARTED") {
    // Alternative way to trigger skeleton loading - when scraping has started
    console.log("Scraping started, showing skeleton loading");
    showSkeletonLoading();
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

// Function to show skeleton loading cards when scraping has started
function showSkeletonLoading() {
  isScrapingStarted = true;
  const container = document.getElementById('amazon-alternative-finder');
  if (!container) return;
  
  const initialLoading = container.querySelector('.aaf-initial-loading');
  const skeletonLoading = container.querySelector('.aaf-skeleton-loading');
  
  if (initialLoading && skeletonLoading) {
    initialLoading.style.display = 'none';
    skeletonLoading.style.display = 'block';
  }
}

// Function to hide skeleton loading and show results
function hideSkeletonLoading() {
  const container = document.getElementById('amazon-alternative-finder');
  if (!container) return;
  
  const loading = container.querySelector('.aaf-loading');
  const skeletonLoading = container.querySelector('.aaf-skeleton-loading');
  
  if (loading) {
    loading.style.display = 'none';
  }
  
  if (skeletonLoading) {
    skeletonLoading.style.display = 'none';
  }
}
