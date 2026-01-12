import React, { useState, useEffect } from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';

const MIN_FONT_SIZE = 80;
const MAX_FONT_SIZE = 120;
const STEP = 5;

export default function FontSizeAdjuster() {
  const [fontSize, setFontSize] = useState(100);

  useEffect(() => {
    const savedSize = localStorage.getItem('globalFontSize');
    if (savedSize) {
      const newSize = parseInt(savedSize, 10);
      setFontSize(newSize);
      document.documentElement.style.fontSize = `${newSize}%`;
    }
  }, []);

  const updateFontSize = (newSize) => {
    if (newSize >= MIN_FONT_SIZE && newSize <= MAX_FONT_SIZE) {
      setFontSize(newSize);
      document.documentElement.style.fontSize = `${newSize}%`;
      localStorage.setItem('globalFontSize', newSize.toString());
    }
  };

  const increaseSize = () => updateFontSize(fontSize + STEP);
  const decreaseSize = () => updateFontSize(fontSize - STEP);

  return (
    <div className="flex items-center justify-between p-2">
       <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Font Size</span>
      <div className="flex items-center gap-2">
        <button
          onClick={decreaseSize}
          disabled={fontSize <= MIN_FONT_SIZE}
          className="p-1.5 rounded-full text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:text-gray-300 dark:hover:bg-gray-700/50"
          aria-label="Decrease font size"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <span className="text-sm font-medium text-gray-700 w-10 text-center dark:text-gray-200">{fontSize}%</span>
        <button
          onClick={increaseSize}
          disabled={fontSize >= MAX_FONT_SIZE}
          className="p-1.5 rounded-full text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:text-gray-300 dark:hover:bg-gray-700/50"
          aria-label="Increase font size"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}