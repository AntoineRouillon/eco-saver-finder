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

// Fonction utilitaire pour gérer le pluriel/singulier
function formatAlternativesCount(count) {
  return count === 1 ? `${count} alternative` : `${count} alternatives`;
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
          <div class="aaf-initial-loading" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 200px;">
            <div class="aaf-spinner"></div>
            <p>Recherche d'alternatives...</p>
          </div>
          <div class="aaf-skeleton-loading" style="display: none;">
            <!-- Skeleton loading cards will be added here -->
            <div class="aaf-filter-controls">
              <div class="aaf-skeleton-filter" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <div class="aaf-skeleton-text" style="width: 150px; height: 16px; background: #eee; border-radius: 4px;"></div>
                <div class="aaf-skeleton-button" style="width: 32px; height: 32px; background: #eee; border-radius: 4px;"></div>
              </div>
            </div>
            <div class="aaf-skeleton-items">
              <!-- Single skeleton card will be inserted here by JavaScript -->
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

  // Create a single skeleton card (instead of three)
  const skeletonContainer = container.querySelector('.aaf-skeleton-items');
  if (skeletonContainer) {
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

// ... keep existing code (remaining functions)
