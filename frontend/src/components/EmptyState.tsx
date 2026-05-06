import { motion } from 'framer-motion';
import { PlusCircle } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export default function EmptyState({ title, description, actionText, onAction }: EmptyStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-12 text-center h-full w-full"
    >
      <div className="w-48 h-48 mb-6 relative">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xl opacity-80">
          <path fill="#6366f1" d="M42.7,-73.4C55.9,-67.5,67.6,-56.3,76.5,-42.6C85.4,-28.9,91.4,-12.7,89.5,2.6C87.6,17.9,77.7,32.3,66.8,44.2C55.9,56.1,43.9,65.5,29.9,71.7C15.9,77.9,-0.1,80.9,-15.8,78.5C-31.5,76.1,-46.9,68.3,-58.5,56.8C-70.1,45.3,-77.9,30.1,-82.1,13.7C-86.3,-2.7,-86.9,-20.3,-79.8,-35.1C-72.7,-49.9,-57.9,-61.9,-43.3,-67.3C-28.7,-72.7,-14.4,-71.5,1.1,-73.1C16.6,-74.7,33.2,-79.1,42.7,-73.4Z" transform="translate(100 100)" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-white/50">
          <svg className="w-24 h-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
      </div>
      <h3 className="text-2xl font-bold text-slate-100 mb-2">{title}</h3>
      <p className="text-slate-400 max-w-md mb-8">{description}</p>
      
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white rounded-xl shadow-lg shadow-indigo-500/20 transition-all transform hover:scale-105 active:scale-95 font-medium"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          {actionText}
        </button>
      )}
    </motion.div>
  );
}
