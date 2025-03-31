
document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('root');
  
  // Create the landing page content
  root.innerHTML = `
    <!-- Hero Section -->
    <header class="hero">
      <div class="container">
        <div class="hero-content">
          <span class="badge">Achats Intelligents</span>
          <h1>Économisez sur Amazon</h1>
          <p>Trouvez automatiquement des alternatives d'occasion sur Leboncoin pendant votre navigation sur Amazon.fr</p>
          <div class="button-group">
            <a href="#demo" class="button button-primary">Comment ça marche</a>
            <a href="#download" class="button button-outline">Télécharger l'extension</a>
          </div>
        </div>
      </div>
    </header>

    <!-- Demo Section -->
    <section id="demo" class="demo">
      <div class="container">
        <div class="section-header">
          <h2>Comment ça marche</h2>
          <p>Notre extension s'intègre parfaitement à votre expérience de navigation sur Amazon, vous aidant à trouver de meilleures offres sur les marchés d'occasion.</p>
        </div>
        <div class="browser-mockup">
          <div class="browser-header">
            <div class="browser-dots">
              <div class="browser-dot dot-red"></div>
              <div class="browser-dot dot-yellow"></div>
              <div class="browser-dot dot-green"></div>
            </div>
            <div class="browser-address">amazon.fr/Moulinex-LM430810-Blendforce-Électrique-Smoothie/dp/B07FSL8PYF</div>
          </div>
          <div class="browser-content">
            <div class="amazon-mockup">
              <div class="amazon-header">
                <div class="amazon-logo">amazon.fr</div>
                <div class="amazon-search">
                  <input type="text" placeholder="Rechercher" disabled />
                </div>
              </div>
              <div class="amazon-product">
                <div class="amazon-product-grid">
                  <div class="amazon-product-image">
                    <img src="https://m.media-amazon.com/images/I/71G4ilhGrnL._AC_SX425_.jpg" alt="Moulinex Blendforce" />
                  </div>
                  <div class="amazon-product-info">
                    <h1 class="amazon-product-title">Moulinex LM430810 Blendforce Blender Électrique Smoothie Mixeur Soupe 800W 2L Noir</h1>
                    <div class="amazon-product-rating">
                      <div class="amazon-stars">★★★★☆</div>
                      <span>2,364 évaluations</span>
                    </div>
                    <div class="amazon-product-price">
                      <span class="amazon-price">59,99 €</span>
                    </div>
                    <div class="amazon-product-delivery">
                      <span>Livraison GRATUITE par Amazon</span>
                    </div>
                    <div class="amazon-product-actions">
                      <button class="amazon-button amazon-cart">Ajouter au panier</button>
                      <button class="amazon-button amazon-buy">Acheter maintenant</button>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Extension Toggle -->
              <div class="extension-toggle">
                <div class="extension-toggle-button">
                  <img src="https://www.leboncoin.fr/favicon.ico" alt="AltMarket" width="16" height="16" />
                  <span>Alternatives</span>
                </div>
              </div>
              
              <!-- Extension Panel (initially hidden) -->
              <div class="extension-panel" style="display: none;">
                <div class="extension-panel-header">
                  <h3>Alternatives d'occasion trouvées</h3>
                  <span class="extension-close">×</span>
                </div>
                <div class="extension-panel-content">
                  <div class="extension-alternatives">
                    <div class="alternative-item">
                      <img src="https://img.leboncoin.fr/api/v1/lbcpb1/images/9e/f6/11/9ef611c92919e52197afebeeb8365eb9dac04a04.jpg?rule=ad-image-thumb" alt="Blender d'occasion" />
                      <div class="alternative-info">
                        <h4>Blender Moulinex Blendforce</h4>
                        <p class="alternative-price">35,00 €</p>
                        <p class="alternative-location">Paris 15e</p>
                        <a href="#" class="alternative-link">Voir l'annonce</a>
                      </div>
                    </div>
                    <div class="alternative-item">
                      <img src="https://img.leboncoin.fr/api/v1/lbcpb1/images/c4/55/fe/c455fec7e7f58e6385d3c47d7603b1e4a3d6d6c3.jpg?rule=ad-image-thumb" alt="Blender d'occasion" />
                      <div class="alternative-info">
                        <h4>Blender Moulinex comme neuf</h4>
                        <p class="alternative-price">42,50 €</p>
                        <p class="alternative-location">Lyon</p>
                        <a href="#" class="alternative-link">Voir l'annonce</a>
                      </div>
                    </div>
                    <div class="alternative-item">
                      <img src="https://img.leboncoin.fr/api/v1/lbcpb1/images/88/73/16/887316ec3113c32120da50b40d45727cadf6fb0a.jpg?rule=ad-image-thumb" alt="Blender d'occasion" />
                      <div class="alternative-info">
                        <h4>Blender électrique Moulinex LM430</h4>
                        <p class="alternative-price">29,99 €</p>
                        <p class="alternative-location">Marseille</p>
                        <a href="#" class="alternative-link">Voir l'annonce</a>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="extension-panel-footer">
                  <p>Économisez jusqu'à 50% par rapport au prix Amazon!</p>
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
          <h2>Installation</h2>
          <p>Commencer avec notre extension est rapide et facile.</p>
        </div>
        <div class="steps-container">
          <div class="step">
            <div class="step-number">1</div>
            <h3>Télécharger</h3>
            <p>Obtenez l'extension depuis le Chrome Web Store.</p>
          </div>
          <div class="step">
            <div class="step-number">2</div>
            <h3>Installer</h3>
            <p>Ajoutez l'extension à votre navigateur en quelques clics.</p>
          </div>
          <div class="step">
            <div class="step-number">3</div>
            <h3>Naviguez & Économisez</h3>
            <p>Commencez à faire du shopping sur Amazon et voyez automatiquement les alternatives.</p>
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
  const toggleButton = document.querySelector('.extension-toggle-button');
  const extensionPanel = document.querySelector('.extension-panel');
  const closeButton = document.querySelector('.extension-close');
  
  toggleButton.addEventListener('click', () => {
    if (extensionPanel.style.display === 'none') {
      extensionPanel.style.display = 'block';
      toggleButton.classList.add('active');
    } else {
      extensionPanel.style.display = 'none';
      toggleButton.classList.remove('active');
    }
  });
  
  closeButton.addEventListener('click', () => {
    extensionPanel.style.display = 'none';
    toggleButton.classList.remove('active');
  });

  // Scroll behavior for navigation
  const demoButton = document.querySelector('.button-primary');
  demoButton.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelector('#demo').scrollIntoView({ behavior: 'smooth' });
  });

  const downloadButton = document.querySelector('.button-outline');
  downloadButton.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelector('#download').scrollIntoView({ behavior: 'smooth' });
  });
});
