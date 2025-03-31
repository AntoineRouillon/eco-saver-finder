
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
            <div class="browser-address">amazon.fr/echo-dot-2022/dp/B09B94956P/</div>
          </div>
          <div class="browser-content">
            <img src="https://m.media-amazon.com/images/I/61MbLLagiVL._AC_SX679_.jpg" alt="Amazon Echo Dot" />
            <div id="browser-extension-demo"></div>
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

  // Add some interactive behavior
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
