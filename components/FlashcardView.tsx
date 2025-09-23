import React, { useState, useEffect } from 'react';
import { Category, Language, FlashcardData, ImageStyle } from '../types';
import { generateFlashcardImage, getCategoryTextData } from '../services/geminiService';
import { playClickSound, playFlipSound, speak } from '../services/audioService';
import Spinner from './Spinner';
import { ArrowLeftIcon, ArrowRightIcon, BackIcon, SpeakerIcon } from './icons';

interface FlashcardViewProps {
  category: Category;
  selectedLanguages: Language[];
  onBack: () => void;
  imageStyle: ImageStyle;
}

const FlashcardView: React.FC<FlashcardViewProps> = ({ category, selectedLanguages, onBack, imageStyle }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cards, setCards] = useState<FlashcardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    const loadCategoryData = async () => {
      setIsLoading(true);
      setCards([]);
      setCurrentIndex(0);

      try {
        const textDataArray = await getCategoryTextData(category, selectedLanguages);
        
        const initialCards = textDataArray.map(data => ({
          ...data,
          imageSrc: '', // Placeholder, indicates image needs to be loaded
        }));
        setCards(initialCards);

        if (initialCards.length > 0) {
            const firstItemName = initialCards[0].itemName;
            const imageSrc = await generateFlashcardImage(firstItemName, imageStyle);
            setCards(prev => {
                const newCards = [...prev];
                if (newCards[0]) {
                    newCards[0].imageSrc = imageSrc;
                }
                return newCards;
            });
        }
      } catch (error) {
        console.error(`Failed to load data for category ${category.name}`, error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategoryData();
  }, [category, selectedLanguages, imageStyle]);

  useEffect(() => {
    const loadImageForCurrentCard = async () => {
      const currentCard = cards[currentIndex];
      if (currentCard && !currentCard.imageSrc) {
        setIsLoading(true);
        try {
          const imageSrc = await generateFlashcardImage(currentCard.itemName, imageStyle);
          setCards(prev => {
            const newCards = [...prev];
            if (newCards[currentIndex]) {
              newCards[currentIndex].imageSrc = imageSrc;
            }
            return newCards;
          });
        } catch (error) {
          console.error(`Failed to load image for ${currentCard.itemName}`, error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadImageForCurrentCard();
  }, [currentIndex, cards, imageStyle]);


  const navigate = (direction: 'next' | 'prev') => {
    if (isFlipping) return;
    playFlipSound();
    setIsFlipping(true);
    
    setTimeout(() => {
      if (direction === 'next') {
        setCurrentIndex(prev => (prev + 1) % category.items.length);
      } else {
        setCurrentIndex(prev => (prev - 1 + category.items.length) % category.items.length);
      }
      setIsFlipping(false);
    }, 150);
  };

  const handleBack = () => {
    playClickSound();
    onBack();
  };

  const handleSpeak = (text: string, langCode: string) => {
    playClickSound();
    speak(text, langCode);
  };
  
  const currentCard = cards[currentIndex];
  const showSpinner = isLoading || !currentCard || !currentCard.imageSrc;

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <button onClick={handleBack} className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md hover:bg-slate-100 transition">
          <BackIcon />
          Categories
        </button>
        <div className="text-slate-500 font-medium">
          {currentIndex + 1} / {category.items.length}
        </div>
      </div>

      <div className="relative aspect-square">
        <div className={`transition-transform duration-300 w-full h-full ${isFlipping ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}>
          <div className="bg-white rounded-2xl shadow-xl w-full h-full p-4 flex flex-col justify-between overflow-hidden border-4 border-white">
            {showSpinner ? (
              <div className="flex items-center justify-center h-full">
                <Spinner />
              </div>
            ) : (
              <>
                <div className="w-full h-3/5 sm:h-2/3 flex items-center justify-center bg-slate-100 rounded-lg overflow-hidden">
                  <img src={currentCard.imageSrc} alt={currentCard.itemName} className="object-cover w-full h-full" />
                </div>
                <div className="text-center pt-4 flex-1 flex flex-col justify-around items-center">
                    <div>
                        {Object.entries(currentCard.translations).map(([langName, word]) => {
                            const lang = selectedLanguages.find(l => l.name === langName);
                            return (
                                <div key={langName} className="mb-1 last:mb-0 flex items-center gap-3 justify-center">
                                    <div className="text-right w-48">
                                        <p className="text-2xl sm:text-3xl font-bold text-slate-800">{word}</p>
                                        <p className="text-sm text-slate-400">{langName}</p>
                                    </div>
                                    {lang && (
                                        <button onClick={() => handleSpeak(word, lang.code)} className="p-2 rounded-full hover:bg-slate-200 transition">
                                            <SpeakerIcon />
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex justify-between mt-6">
        <button onClick={() => navigate('prev')} className="p-4 bg-white rounded-full shadow-lg hover:bg-sky-100 transition transform hover:scale-110" aria-label="Previous card">
          <ArrowLeftIcon />
        </button>
        <button onClick={() => navigate('next')} className="p-4 bg-white rounded-full shadow-lg hover:bg-sky-100 transition transform hover:scale-110" aria-label="Next card">
          <ArrowRightIcon />
        </button>
      </div>
    </div>
  );
};

export default FlashcardView;