
import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface Product {
  id: string;
  title: string;
  price: string;
  image: string;
  location: string;
  url: string;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <motion.div
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
  );
};

export default ProductCard;
