
import React from 'react';

interface ProductPreviewProps {
  title: string;
  image: string;
  price: string;
  original?: boolean;
}

const ProductPreview = ({ title, image, price, original = false }: ProductPreviewProps) => {
  return (
    <div className={`rounded-xl overflow-hidden border ${original ? 'border-green-200 bg-green-50' : 'border-gray-200'} transition-all duration-300 hover:shadow-md`}>
      <div className="relative aspect-square bg-white p-4 flex items-center justify-center">
        <img 
          src={image} 
          alt={title}
          className="max-h-full max-w-full object-contain"
        />
        {original && (
          <div className="absolute top-2 left-2 bg-[#4AB07B] text-white text-xs px-2 py-1 rounded-full">
            Amazon
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-sm font-medium line-clamp-2 h-10 mb-2">{title}</h3>
        <div className="flex justify-between items-center">
          <span className={`font-semibold ${original ? 'text-gray-900' : 'text-[#4AB07B]'}`}>
            {price}
          </span>
          <span className="text-xs text-gray-500">
            {original ? 'New' : 'Second-hand'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductPreview;
