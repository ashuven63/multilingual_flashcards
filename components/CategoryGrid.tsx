import React, { useState } from 'react';
import type { Category, ImageStyle } from '../types';
import { playClickSound } from '../services/audioService';
import ImageStyleModal from './ImageStyleModal';

interface CategoryGridProps {
  categories: Category[];
  onSelectCategory: (category: Category, style: ImageStyle) => void;
}

const CategoryGrid: React.FC<CategoryGridProps> = ({ categories, onSelectCategory }) => {
  const [modalCategory, setModalCategory] = useState<Category | null>(null);

  const handleOpenModal = (category: Category) => {
    playClickSound();
    setModalCategory(category);
  };

  const handleCloseModal = () => {
    setModalCategory(null);
  };

  const handleSelectStyle = (style: ImageStyle) => {
    if (modalCategory) {
      onSelectCategory(modalCategory, style);
    }
    handleCloseModal();
  };

  return (
    <>
      <section>
        <h2 className="text-2xl font-bold text-center text-slate-700 mb-6">Select a Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
          {categories.map(category => (
            <button
              key={category.name}
              onClick={() => handleOpenModal(category)}
              className="group flex flex-col items-center justify-center p-4 sm:p-6 bg-white rounded-2xl shadow-lg border border-transparent hover:border-sky-400 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <span className="text-5xl sm:text-6xl mb-3 transition-transform duration-300 group-hover:scale-110">{category.emoji}</span>
              <span className="font-semibold text-slate-700 text-center">{category.name}</span>
            </button>
          ))}
        </div>
      </section>

      {modalCategory && (
        <ImageStyleModal
          categoryName={modalCategory.name}
          onSelect={handleSelectStyle}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

export default CategoryGrid;