
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, ExternalLink, ThumbsUp, ThumbsDown, SearchX } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface Product {
  id: string;
  title: string;
  price: string;
  image: string;
  location: string;
  url: string;
  html?: string;  // Add HTML field
}

interface BrowserExtensionProps {
  onClose: () => void;
}

const BrowserExtension = ({ onClose }: BrowserExtensionProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to get second-hand products
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

  // Extract data from HTML for display
  const extractDataFromHTML = (html: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const article = doc.querySelector('article');
    
    if (!article) return null;
    
    // Extract badges
    const proBadge = article.querySelector('.text-support') !== null;
    const deliveryBadge = article.querySelector('.text-on-support-container') !== null;
    
    return {
      isPro: proBadge,
      hasDelivery: deliveryBadge
    };
  };

  // No Results UI component
  const NoResultsUI = () => (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      <div className="relative w-24 h-24 mb-6">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-teal-500 flex items-center justify-center">
            <div className="w-10 h-10">
              <div className="relative">
                {/* Sleeping face */}
                <div className="absolute top-1/2 left-1/4 w-1 h-1 bg-white rounded-full"></div>
                <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-white rounded-full"></div>
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full"></div>
                {/* Arc lines for closed eyes */}
                <div className="absolute top-[40%] left-[25%] w-2 h-1 border-t-2 border-white rounded"></div>
                <div className="absolute top-[40%] right-[25%] w-2 h-1 border-t-2 border-white rounded"></div>
              </div>
            </div>
          </div>
          {/* Handle */}
          <div className="absolute bottom-1 right-1 w-3 h-10 bg-teal-500 rounded-full transform rotate-45"></div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-2 h-2 bg-yellow-300 rounded-full"></div>
        <div className="absolute top-1/4 right-1/4 w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
        <div className="absolute bottom-1/3 left-1/5 w-2 h-2 bg-green-400 rounded-full"></div>
        <div className="absolute top-1/2 right-0 w-1 h-1 bg-pink-300 rounded-full"></div>
        <div className="absolute bottom-0 left-1/3 w-1.5 h-1.5 bg-purple-300 rounded-full"></div>
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">No Result Found</h3>
      <p className="text-gray-500 text-sm max-w-[200px]">
        We can't find any item matching your search
      </p>
    </div>
  );

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
          <div className="text-xs font-medium text-blue-600">Amazon Alternative Finder</div>
          <h3 className="text-sm font-medium">Second-hand alternatives</h3>
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
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-gray-500">Finding alternatives...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {products.length > 0 ? (
              <>
                <p className="text-xs text-gray-500 mb-4">
                  Found {products.length} alternatives on Leboncoin
                </p>
                
                {products.map((product) => {
                  // Extract badges from HTML
                  const htmlData = product.html ? extractDataFromHTML(product.html) : null;
                  
                  return (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border border-gray-200 rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow"
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
                        
                        {/* Display badges based on HTML data */}
                        {htmlData && (
                          <div className="flex flex-wrap gap-1 mt-1 mb-2">
                            {htmlData.isPro && (
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                                Pro
                              </span>
                            )}
                            {htmlData.hasDelivery && (
                              <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                                Livraison possible
                              </span>
                            )}
                          </div>
                        )}
                        
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-blue-600 font-medium">{product.price}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-gray-600 hover:text-blue-600 p-1 h-auto"
                          >
                            <ExternalLink size={14} className="mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </>
            ) : (
              <NoResultsUI />
            )}
          </div>
        )}
      </div>

      <div className="border-t border-gray-100 p-3 bg-gray-50">
        <div className="text-xs text-gray-500 mb-2">Was this helpful?</div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-8 text-xs border-gray-200"
          >
            <ThumbsUp size={14} className="mr-1" />
            Yes
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-8 text-xs border-gray-200"
          >
            <ThumbsDown size={14} className="mr-1" />
            No
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default BrowserExtension;
