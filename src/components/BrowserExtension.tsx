
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, ExternalLink, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface Product {
  id: string;
  title: string;
  price: string;
  image: string;
  location: string;
  url: string;
  html?: string;
}

interface BrowserExtensionProps {
  onClose: () => void;
}

const BrowserExtension = ({ onClose }: BrowserExtensionProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setProducts([
        {
          id: '1',
          title: 'Echo Dot (4ème génération) - Très bon état',
          price: '29,00 €',
          image: 'https://m.media-amazon.com/images/I/61MbLLagiVL._AC_SX679_.jpg',
          location: 'Paris',
          url: '#',
          html: '<article data-test-id="ad" class="relative h-[inherit] group/adcard"><div class="flex h-[inherit] flex-col"><div class="adcard_d1a8809dc relative flex h-[inherit]"><div class="adcard_5300a9ba4 relative"><div class="relative h-full"><div class="bg-neutral-container relative box-border flex h-full min-h-auto min-w-auto items-center justify-center overflow-hidden"><img src="https://m.media-amazon.com/images/I/61MbLLagiVL._AC_SX679_.jpg" alt="" class="absolute inset-0 m-auto size-full object-cover"></div></div></div><div class="adcard_8f3833cd8 m-lg relative min-w-0"><div class="flex h-full flex-col justify-between"><div class="gap-y-sm flex min-w-0 flex-col"><div class="gap-x-md flex items-start"><div class="gap-x-sm flex min-w-0 items-center"><p data-test-id="adcard-title" class="text-body-1 text-on-surface line-clamp-(--line-clamp) font-bold break-words text-ellipsis">Echo Dot (4ème génération) - Très bon état</p></div></div><p class="text-callout text-on-surface leading-sz-20! flex flex-wrap items-center font-bold" data-test-id="price" aria-label="Prix: 29,00 €"><span class="">29,00 €</span></p></div><div class="mt-md gap-md flex flex-col justify-between"><div class="flex flex-wrap items-center gap-md mb-md"><span data-spark-component="tag" class="box-border inline-flex items-center justify-center gap-sm whitespace-nowrap text-caption font-bold h-sz-20 px-md rounded-full border-sm border-current text-support">Pro</span></div><div><p aria-label="Catégorie : Tech" class="text-caption text-neutral">Tech</p><p aria-label="Située à Paris" class="text-caption text-neutral">Paris</p></div></div></div></div></div></div></article>'
        },
        {
          id: '2',
          title: 'Enceinte Echo Dot comme neuve',
          price: '25,50 €',
          image: 'https://m.media-amazon.com/images/I/61MbLLagiVL._AC_SX679_.jpg',
          location: 'Lyon',
          url: '#',
          html: '<article data-test-id="ad" class="relative h-[inherit] group/adcard"><div class="flex h-[inherit] flex-col"><div class="adcard_d1a8809dc relative flex h-[inherit]"><div class="adcard_5300a9ba4 relative"><div class="relative h-full"><div class="bg-neutral-container relative box-border flex h-full min-h-auto min-w-auto items-center justify-center overflow-hidden"><img src="https://m.media-amazon.com/images/I/61MbLLagiVL._AC_SX679_.jpg" alt="" class="absolute inset-0 m-auto size-full object-cover"></div></div></div><div class="adcard_8f3833cd8 m-lg relative min-w-0"><div class="flex h-full flex-col justify-between"><div class="gap-y-sm flex min-w-0 flex-col"><div class="gap-x-md flex items-start"><div class="gap-x-sm flex min-w-0 items-center"><p data-test-id="adcard-title" class="text-body-1 text-on-surface line-clamp-(--line-clamp) font-bold break-words text-ellipsis">Enceinte Echo Dot comme neuve</p></div></div><p class="text-callout text-on-surface leading-sz-20! flex flex-wrap items-center font-bold" data-test-id="price" aria-label="Prix: 25,50 €"><span class="">25,50 €</span></p></div><div class="mt-md gap-md flex flex-col justify-between"><div class="flex flex-wrap items-center gap-md mb-md"><span data-spark-component="tag" class="box-border inline-flex items-center justify-center gap-sm whitespace-nowrap text-caption font-bold h-sz-20 px-md rounded-full border-sm border-current text-support">Pro</span><span data-spark-component="tag" class="box-border inline-flex items-center justify-center gap-sm whitespace-nowrap text-caption font-bold h-sz-20 px-md rounded-full bg-support-container text-on-support-container">Livraison possible</span></div><div><p aria-label="Catégorie : Tech" class="text-caption text-neutral">Tech</p><p aria-label="Située à Lyon" class="text-caption text-neutral">Lyon</p></div></div></div></div></div></div></article>'
        },
        {
          id: '3',
          title: 'Amazon Echo Dot 4 - Bon état',
          price: '32,00 €',
          image: 'https://m.media-amazon.com/images/I/61MbLLagiVL._AC_SX679_.jpg',
          location: 'Marseille',
          url: '#',
          html: '<article data-test-id="ad" class="relative h-[inherit] group/adcard"><div class="flex h-[inherit] flex-col"><div class="adcard_d1a8809dc relative flex h-[inherit]"><div class="adcard_5300a9ba4 relative"><div class="relative h-full"><div class="bg-neutral-container relative box-border flex h-full min-h-auto min-w-auto items-center justify-center overflow-hidden"><img src="https://m.media-amazon.com/images/I/61MbLLagiVL._AC_SX679_.jpg" alt="" class="absolute inset-0 m-auto size-full object-cover"></div></div></div><div class="adcard_8f3833cd8 m-lg relative min-w-0"><div class="flex h-full flex-col justify-between"><div class="gap-y-sm flex min-w-0 flex-col"><div class="gap-x-md flex items-start"><div class="gap-x-sm flex min-w-0 items-center"><p data-test-id="adcard-title" class="text-body-1 text-on-surface line-clamp-(--line-clamp) font-bold break-words text-ellipsis">Amazon Echo Dot 4 - Bon état</p></div></div><p class="text-callout text-on-surface leading-sz-20! flex flex-wrap items-center font-bold" data-test-id="price" aria-label="Prix: 32,00 €"><span class="">32,00 €</span></p></div><div class="mt-md gap-md flex flex-col justify-between"><div class="flex flex-wrap items-center gap-md mb-md"><span data-spark-component="tag" class="box-border inline-flex items-center justify-center gap-sm whitespace-nowrap text-caption font-bold h-sz-20 px-md rounded-full bg-support-container text-on-support-container">Livraison possible</span></div><div><p aria-label="Catégorie : Tech" class="text-caption text-neutral">Tech</p><p aria-label="Située à Marseille" class="text-caption text-neutral">Marseille</p></div></div></div></div></div></div></article>'
        }
      ]);
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const extractDataFromHTML = (html: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const article = doc.querySelector('article');
    
    if (!article) return null;
    
    // Nous ne récupérons plus le badge Pro
    const deliveryBadge = article.querySelector('.text-on-support-container') !== null;
    
    return {
      hasDelivery: deliveryBadge
    };
  };

  const renderNoResults = () => {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <svg 
          className="w-16 h-16 mb-4 text-[#4AB07B]" 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 121.7 122.88"
          fill="currentColor"
        >
          <path d="M53.62 0c14.81 0 28.21 6 37.91 15.7 9.7 9.7 15.7 23.11 15.7 37.91 0 10.83-3.21 20.91-8.74 29.35l23.2 25.29-16 14.63-22.37-24.62a53.359 53.359 0 01-29.7 8.98c-14.81 0-28.21-6-37.91-15.7C6 81.82 0 68.42 0 53.62 0 38.81 6 25.41 15.7 15.7 25.41 6 38.81 0 53.62 0zm8.01 38.91a4.747 4.747 0 016.76-.02 4.868 4.868 0 01.02 6.83l-8.17 8.29 8.18 8.3c1.85 1.88 1.82 4.92-.05 6.79-1.88 1.87-4.9 1.87-6.74-.01l-8.13-8.24-8.14 8.26a4.747 4.747 0 01-6.76.02 4.868 4.868 0 01-.02-6.83l8.17-8.3-8.18-8.3c-1.85-1.88-1.82-4.92.06-6.79 1.88-1.87 4.9-1.87 6.74.01l8.13 8.24 8.13-8.25zM87.3 19.93C78.68 11.31 66.77 5.98 53.62 5.98c-13.15 0-25.06 5.33-33.68 13.95-8.63 8.62-13.96 20.53-13.96 33.69 0 13.15 5.33 25.06 13.95 33.68 8.62 8.62 20.53 13.95 33.68 13.95 13.16 0 25.06-5.33 33.68-13.95 8.62-8.62 13.95-20.53 13.95-33.68.01-13.16-5.32-25.07-13.94-33.69z" fill-rule="evenodd" clip-rule="evenodd"/>
        </svg>
        <h4 className="text-base font-medium text-gray-800">Aucune alternative trouvée</h4>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="absolute right-0 top-0 h-full w-80 md:w-96 bg-white shadow-2xl border-l border-gray-200 overflow-hidden flex flex-col"
    >
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
        <div>
          <div className="text-xs font-medium text-[#4AB07B]">AltMarket</div>
          <h3 className="text-sm font-medium">Alternatives d'occasion</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X size={18} className="text-gray-500" />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {loading ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
            
            {[1, 2, 3].map(i => (
              <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                <Skeleton className="w-full h-32" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="flex gap-1 mt-1">
                    <Skeleton className="h-5 w-12 rounded-full" />
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-8 w-16 rounded-md" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {products.length > 0 ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500">
                    {products.length} alternatives trouvées sur Leboncoin
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 text-xs border-gray-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                    </svg>
                  </Button>
                </div>
                
                {products.map((product) => {
                  const htmlData = product.html ? extractDataFromHTML(product.html) : null;
                  
                  return (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border border-gray-200 rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => window.open(product.url, '_blank')}
                    >
                      <div className="relative aspect-w-4 aspect-h-3 bg-gray-100">
                        <img 
                          src={product.image} 
                          alt={product.title} 
                          className="object-cover w-full h-full"
                        />
                        <div className="absolute bottom-2 left-2 bg-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">
                          {product.location}
                        </div>
                      </div>
                      <div className="p-3">
                        <h4 className="text-sm font-medium text-gray-900 line-clamp-2 h-10">
                          {product.title}
                        </h4>
                        
                        {htmlData && (
                          <div className="flex flex-wrap gap-1 mt-1 mb-2">
                            {/* Suppression du badge Pro */}
                            {htmlData.hasDelivery ? (
                              <span className="px-2 py-0.5 bg-green-50 text-[#4AB07B] rounded-full text-xs font-medium">
                                Livraison possible
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                                {product.location}
                              </span>
                            )}
                          </div>
                        )}
                        
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-[#4AB07B] font-medium">{product.price}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-gray-600 hover:text-[#4AB07B] p-1 h-auto"
                            onClick={(e) => {
                              e.stopPropagation(); // Empêcher le clic sur la carte de se déclencher
                              window.open(product.url, '_blank');
                            }}
                          >
                            <ExternalLink size={14} className="mr-1" />
                            Voir
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              renderNoResults()
            )}
          </>
        )}
      </div>

      <div className="border-t border-gray-100 p-3 bg-gray-50">
        <div className="text-xs text-gray-500 mb-2">Est-ce que cela vous a aidé ?</div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-8 text-xs border-gray-200"
          >
            <ThumbsUp size={14} className="mr-1" />
            Oui
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-8 text-xs border-gray-200"
          >
            <ThumbsDown size={14} className="mr-1" />
            Non
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default BrowserExtension;
