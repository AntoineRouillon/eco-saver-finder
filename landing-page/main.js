document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('root');

  // Create the landing page content
  root.innerHTML = `
    <!-- Hero Section -->
    <header class="hero">
      <div class="container">
          <div class="hero-content">
              <div class="badge">
                  <img src="./images/icon48.png" alt="Logo ou image" class="centered-image">
              </div>
              <h1>Économisez sur Amazon</h1>
              <p>Trouvez automatiquement des alternatives d'occasion sur Leboncoin pendant votre navigation sur Amazon.fr</p>
              <div class="button-group">
                  <a href="https://chromewebstore.google.com/detail/cimlfbhfcmldcaklknleaacnanjonfbl"
                     class="button button-primary"
                     target="_blank"
                     rel="noopener noreferrer"
                     id="chrome-store-button">
                     Ajouter à Chrome
                  </a>
                  <a href="#demo" class="button button-outline" id="demo-button">Comment ça marche</a>
              </div>
          </div>
      </div>
  </header>

    <!-- Demo Section -->
    <section id="demo" class="demo">
      <div class="container">
        <div class="section-header">
          <h2>Comment ça marche</h2>
          <p>Notre extension s'intègre parfaitement à votre expérience de navigation sur Amazon, vous aidant à trouver de meilleures offres alternatives sur Leboncoin.</p>
        </div>
        <div class="browser-mockup">
          <div class="browser-header">
            <div class="browser-dots">
              <div class="browser-dot dot-red"></div>
              <div class="browser-dot dot-yellow"></div>
              <div class="browser-dot dot-green"></div>
            </div>
            <div class="browser-address">amazon.fr/blender</div>
          </div>
          <div class="browser-content">
            <div class="amazon-mockup">
              <div class="amazon-header">
                <img src="./images/amazon.png" alt="Logo">
              </div>
              <div class="amazon-product">
                <div class="amazon-product-grid">
                  <div class="amazon-product-image">
                    <img src="./images/blender-occasion.png" alt="Moulinex Blendforce" onerror="this.src='https://m.media-amazon.com/images/I/71G4ilhGrnL._AC_SX425_.jpg'" />
                  </div>
                  <div class="amazon-product-info">
                    <h1 class="amazon-product-title">Moulinex LM430810 Blendforce Blender Électrique Smoothie Mixeur Soupe 800W 2L Noir</h1>
                    <div class="amazon-product-rating">
                      <div class="amazon-stars">★★★★☆</div>
                      <span>2,364 évaluations</span>
                    </div>
                    <div class="amazon-product-price">
                      <span class="amazon-price">49€</span>
                    </div>
                    <div class="amazon-product-delivery">
                      <span>Livraison GRATUITE par Amazon</span>
                    </div>
                    <div class="amazon-product-actions">
                      <button class="amazon-button amazon-cart">Ajouter au panier</button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Extension Toggle - Matching the actual extension UI -->
              <div class="extension-toggle">
                <div class="extension-toggle-button" id="extension-toggle">
                  <img src="./images/icon16.png" alt="AltMarket" width="16" height="16" onerror="this.src='https://www.leboncoin.fr/favicon.ico'" />
                  <span class="extension-toggle-text">Alternatives</span>
                  <div class="extension-badge">3</div>
                </div>
              </div>

              <!-- Extension Panel (initially hidden) -->
              <div class="extension-panel" id="extension-panel">
                <div class="extension-panel-header">
                  <div>
                    <div class="extension-panel-title">AltMarket</div>
                    <div class="extension-panel-subtitle">Alternatives d'occasion</div>
                  </div>
                  <span class="extension-close" id="extension-close">×</span>
                </div>
                <div class="extension-panel-content">
                  <div class="extension-filter-controls">
                    <p class="extension-results-count">3 alternatives trouvées sur Leboncoin</p>
                    <div class="extension-filter-container">
                      <button class="extension-filter-button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div class="extension-alternatives">
                    <div class="alternative-item">
                      <div class="alternative-image">
                        <img src="./images/blende1.png" alt="Blender d'occasion" onerror="this.src='https://img.leboncoin.fr/api/v1/lbcpb1/images/9e/f6/11/9ef611c92919e52197afebeeb8365eb9dac04a04.jpg?rule=ad-image-thumb'" />
                        <span class="alternative-date">19/03/2023</span>
                      </div>
                      <div class="alternative-content">
                        <h4 class="alternative-title">Blender Moulinex Blendforce</h4>
                        <div class="alternative-badges">
                          <span class="alternative-badge-delivery">Livraison possible</span>
                          <span class="alternative-badge-location">Paris 15e</span>
                        </div>
                        <div class="alternative-footer">
                          <p class="alternative-price">35,00 €</p>
                          <a href="" class="alternative-link">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                              <polyline points="15 3 21 3 21 9"></polyline>
                              <line x1="10" y1="14" x2="21" y2="3"></line>
                            </svg>
                            Voir
                          </a>
                        </div>
                      </div>
                    </div>
                    <div class="alternative-item">
                      <div class="alternative-image">
                        <img src="./images/blender2.png" alt="Blender d'occasion" onerror="this.src='https://img.leboncoin.fr/api/v1/lbcpb1/images/c4/55/fe/c455fec7e7f58e6385d3c47d7603b1e4a3d6d6c3.jpg?rule=ad-image-thumb'" />
                        <span class="alternative-date">15/03/2023</span>
                      </div>
                      <div class="alternative-content">
                        <h4 class="alternative-title">Blender Moulinex comme neuf</h4>
                        <div class="alternative-badges">
                          <span class="alternative-badge-delivery">Livraison possible</span>
                          <span class="alternative-badge-location">Lyon</span>
                        </div>
                        <div class="alternative-footer">
                          <p class="alternative-price">42,50 €</p>
                          <a href="" class="alternative-link">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                              <polyline points="15 3 21 3 21 9"></polyline>
                              <line x1="10" y1="14" x2="21" y2="3"></line>
                            </svg>
                            Voir
                          </a>
                        </div>
                      </div>
                    </div>
                    <div class="alternative-item">
                      <div class="alternative-image">
                        <img src="./images/blender3.png" alt="Blender d'occasion" onerror="this.src='https://img.leboncoin.fr/api/v1/lbcpb1/images/88/73/16/887316ec3113c32120da50b40d45727cadf6fb0a.jpg?rule=ad-image-thumb'" />
                        <span class="alternative-date">10/03/2023</span>
                      </div>
                      <div class="alternative-content">
                        <h4 class="alternative-title">Blender électrique Moulinex LM430</h4>
                        <div class="alternative-badges">
                          <span class="alternative-badge-delivery">Livraison possible</span>
                          <span class="alternative-badge-location">Marseille</span>
                        </div>
                        <div class="alternative-footer">
                          <p class="alternative-price">29,99 €</p>
                          <a href="" class="alternative-link">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                              <polyline points="15 3 21 3 21 9"></polyline>
                              <line x1="10" y1="14" x2="21" y2="3"></line>
                            </svg>
                            Voir
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features">
      <div class="container">
        <div class="section-header">
          <h2>Fonctionnalités clés</h2>
        </div>
        <div class="features-grid">
          <div class="feature-card">
            <h3>Trouvez de meilleures offres</h3>
            <p>Recherchez automatiquement des alternatives d'occasion pendant que vous naviguez sur les produits Amazon.</p>
          </div>
          <div class="feature-card">
            <h3>Économisez de l'argent</h3>
            <p>Comparez les prix entre produits neufs et d'occasion pour prendre des décisions d'achat plus intelligentes.</p>
          </div>
          <div class="feature-card">
            <h3>Achetez durablement</h3>
            <p>Réduisez l'impact environnemental en considérant des articles d'occasion avant d'acheter neuf.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Installation Section -->
    <section id="download" class="installation">
      <div class="container">
        <div class="section-header">
          <h2>Achetez malin, c'est simple</h2>
          <p>L'extension navigateur Chrome est gratuite et simple d'utilisation.</p>
        </div>
        <div class="steps-container">
          <div class="step">
            <div class="step-number">1</div>
            <h3>Installez</h3>
            <p>Obtenez l'extension depuis le Chrome Web Store.</p>
          </div>
          <div class="step">
            <div class="step-number">2</div>
            <h3>Naviguez</h3>
            <p>Commencez à faire du shopping sur Amazon.</p>
          </div>
          <div class="step">
            <div class="step-number">3</div>
            <h3>Comparez</h3>
            <p>Recherchez des alternatives sur Leboncoin en 1 clic.</p>
          </div>
          <div class="step">
            <div class="step-number">4</div>
            <h3>Économisez</h3>
            <p>Réalisez des économies en achetant d'occasion.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="container">
        <p>© ${new Date().getFullYear()} AltMarket. Tous droits réservés.</p>
      </div>
    </footer>
  `;

  // Add extension toggle functionality
  const toggleButton = document.querySelector('#extension-toggle');
  const extensionPanel = document.querySelector('#extension-panel');
  const closeButton = document.querySelector('#extension-close');

  toggleButton.addEventListener('click', () => {
    toggleExtensionPanel();
  });

  closeButton.addEventListener('click', () => {
    extensionPanel.style.display = 'none';
    toggleButton.classList.remove('active');
  });

  function toggleExtensionPanel() {
    if (extensionPanel.style.display === 'none' || extensionPanel.style.display === '') {
      extensionPanel.style.display = 'flex';
      toggleButton.classList.add('active');
    } else {
      extensionPanel.style.display = 'none';
      toggleButton.classList.remove('active');
    }
  }

  // Scroll behavior for navigation
  const demoButton = document.querySelector('#demo-button');
  demoButton.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelector('#demo').scrollIntoView({ behavior: 'smooth' });

    // Show the extension panel after scrolling to demo
    setTimeout(() => {
      toggleExtensionPanel();
    }, 800);
  });

  // Update Chrome Web Store button handler
  const chromeStoreButton = document.querySelector('#chrome-store-button');
  chromeStoreButton.addEventListener('click', (e) => {
    // Don't prevent default here to allow the natural link behavior
    // This ensures the link opens in a new tab as specified by target="_blank"

    // For tracking or analytics, you could add code here
    console.log('Chrome Web Store button clicked');
  });
});
