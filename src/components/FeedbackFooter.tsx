
import React from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from "@/components/ui/button";

const FeedbackFooter: React.FC = () => {
  return (
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
  );
};

export default FeedbackFooter;
