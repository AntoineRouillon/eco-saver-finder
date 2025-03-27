
import React from 'react';

const LoadingState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-4">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-sm text-gray-500">Finding alternatives...</p>
    </div>
  );
};

export default LoadingState;
