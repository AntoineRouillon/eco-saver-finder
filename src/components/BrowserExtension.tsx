
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, ExternalLink, ThumbsUp, ThumbsDown, Search } from 'lucide-react';
import { Button } from "@/components/ui/button";

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
  const [hasAlternatives, setHasAlternatives] = useState(true);

  useEffect(() => {
    // Simulate API call to get second-hand products
    const timer = setTimeout(() => {
      // You can change this to simulate "no results" case
      const simulateNoResults = false;
      
      if (simulateNoResults) {
        setProducts([]);
        setHasAlternatives(false);
      } else {
        setProducts([
          {
            id: '1',
            title: 'Echo Dot (4ème génération) - Très bon état',
            price: '29,00 €',
            image: 'https://m.media-amazon.com/images/I/61MbLLagiVL._AC_SX679_.jpg',
            location: 'Paris',
            url: '#'
          },
          {
            id: '2',
            title: 'Enceinte Echo Dot comme neuve',
            price: '25,50 €',
            image: 'https://m.media-amazon.com/images/I/61MbLLagiVL._AC_SX679_.jpg',
            location: 'Lyon',
            url: '#'
          },
          {
            id: '3',
            title: 'Amazon Echo Dot 4 - Bon état',
            price: '32,00 €',
            image: 'https://m.media-amazon.com/images/I/61MbLLagiVL._AC_SX679_.jpg',
            location: 'Marseille',
            url: '#'
          }
        ]);
        setHasAlternatives(true);
      }
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

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
        ) : !hasAlternatives ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <Search size={40} className="text-gray-300 mb-4" />
            <p className="text-sm font-medium text-gray-700">No second-hand alternatives found</p>
            <p className="text-xs text-gray-500 mt-2">Try again later or check other products</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-gray-500 mb-4">
              Found {products.length} alternatives on Leboncoin
            </p>
            
            {products.map((product) => (
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
            ))}
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
