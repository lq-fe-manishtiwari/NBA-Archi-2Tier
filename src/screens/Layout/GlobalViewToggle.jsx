import React from 'react';
import { Grid3X3, List } from 'lucide-react';
import { useViewMode } from '../../contexts/ViewModeContext';

const GlobalViewToggle = () => {
  const { globalViewMode, setGlobalViewMode } = useViewMode();

  return (
    <div className="p-3">
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
        Default View Mode
      </p>
      <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        <button
          onClick={() => setGlobalViewMode("table")}
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all flex-1 justify-center ${
            globalViewMode === "table"
              ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
              : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
          }`}
        >
          <List className="w-4 h-4" />
          <span>Table</span>
        </button>
        <button
          onClick={() => setGlobalViewMode("card")}
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all flex-1 justify-center ${
            globalViewMode === "card"
              ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
              : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
          }`}
        >
          <Grid3X3 className="w-4 h-4" />
          <span>Cards</span>
        </button>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        This will be the default view for all Academics pages
      </p>
    </div>
  );
};

export default GlobalViewToggle;