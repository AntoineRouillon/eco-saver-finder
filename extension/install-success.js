
// Ce script peut être utilisé pour ajouter des interactions supplémentaires à la page
document.addEventListener('DOMContentLoaded', function() {
  console.log('Page de succès d\'installation chargée');
  
  // Animation d'entrée pour les éléments principaux
  const elements = [
    document.querySelector('h1'),
    document.querySelector('h2'),
    document.querySelector('.card'),
    document.querySelector('.instructions')
  ];
  
  // Ajouter une animation simple d'apparition
  elements.forEach((element, index) => {
    if (element) {
      element.style.opacity = '0';
      element.style.transform = 'translateY(20px)';
      element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      
      setTimeout(() => {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      }, 100 * (index + 1));
    }
  });
});
