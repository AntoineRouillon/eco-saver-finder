
import React from 'react';
import { Search } from 'lucide-react';

const EmptyState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4">
      <Search size={40} className="text-gray-300 mb-4" />
      <p className="text-sm font-medium text-gray-700">No second-hand alternatives found</p>
      <p className="text-xs text-gray-500 mt-2">Try again later or check other products</p>
    </div>
  );
};

export default EmptyState;
