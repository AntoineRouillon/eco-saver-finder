
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import ProductCard from './ProductCard';
import LoadingState from './LoadingState';
import EmptyState from './EmptyState';
import FeedbackFooter from './FeedbackFooter';

interface Product {
  id: string;
  title: string;
  price: string;
  image: string;
  location: string;
  url: string;
}

interface BrowserExtensionProps {
  onClose: () => void;
}

const BrowserExtension = ({ onClose }: BrowserExtensionProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasAlternatives, setHasAlternatives] = useState(false);

  useEffect(() => {
    // Simulate API call to get scraped products
    const timer = setTimeout(() => {
      // For demo purposes, choose a fixed scenario
      const scenario = 'echo-dot';
      
      let scrapedProducts: Product[] = [];
      
      if (scenario === 'echo-dot') {
        scrapedProducts = [
          {
            id: '1',
            title: 'Echo Dot (4ème génération) - État parfait',
            price: '29,50 €',
            image: 'https://m.media-amazon.com/images/I/61MbLLagiVL._AC_SX679_.jpg',
            location: 'Paris 15e',
            url: '#'
          },
          {
            id: '2',
            title: 'Enceinte Amazon Echo Dot 4 neuve',
            price: '27,00 €',
            image: 'https://m.media-amazon.com/images/I/61MbLLagiVL._AC_SX679_.jpg',
            location: 'Lyon 6e',
            url: '#'
          },
          {
            id: '3',
            title: 'Enceinte connectée Echo Dot 4 avec Alexa',
            price: '31,90 €',
            image: 'https://m.media-amazon.com/images/I/61MbLLagiVL._AC_SX679_.jpg',
            location: 'Marseille 8e',
            url: '#'
          }
        ];
      }
      
      setProducts(scrapedProducts);
      setHasAlternatives(scrapedProducts.length > 0);
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // If no alternatives are found, don't display the extension at all
  if (!loading && !hasAlternatives) {
    return null; // Return null to not render anything when no alternatives are found
  }

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
          <LoadingState />
        ) : !hasAlternatives ? (
          <EmptyState />
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-gray-500 mb-4">
              Found {products.length} alternatives on Leboncoin
            </p>
            
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      <FeedbackFooter />
    </motion.div>
  );
};

export default BrowserExtension;
