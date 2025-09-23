import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { Language, Translations, Category, FlashcardData, ImageStyle } from '../types';
import { getImage, saveImage } from './db';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const categoryTextDataCache: Map<string, Omit<FlashcardData, 'imageSrc'>[]> = new Map();

const withRetry = async <T>(apiCall: () => Promise<T>, maxRetries = 3, initialDelay = 1000): Promise<T> => {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await apiCall();
    } catch (error: any) {
      const isRateLimitError = error.toString().includes('429') || (error.error && error.error.code === 429);
      if (isRateLimitError && attempt < maxRetries - 1) {
        attempt++;
        const delay = initialDelay * Math.pow(2, attempt - 1);
        console.warn(`Rate limit exceeded. Retrying in ${delay}ms... (Attempt ${attempt}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
  throw new Error('Max retries reached');
};


export const generateFlashcardImage = async (itemName: string, imageStyle: ImageStyle): Promise<string> => {
  const cacheKey = `${itemName.toLowerCase()}-${imageStyle}`;
  
  try {
    const cachedImage = await getImage(cacheKey);
    if (cachedImage) return cachedImage.imageSrc;
  } catch (error) {
    console.error("Error reading from IndexedDB, proceeding to generate image:", error);
  }

  const prompt = imageStyle === 'illustration'
    ? `A simple, cute, and colorful children's book illustration of a single "${itemName}", centered on a pure white background. The style should be friendly and simple, suitable for a baby's flashcard. No text, shadows, or complex details.`
    : `A high-resolution, photorealistic image of a "${itemName}", centered in its natural setting. The subject should be clear and easily recognizable.`;

  try {
    const response = await withRetry(() => ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: {
            parts: [
                {
                    text: prompt,
                },
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    }));
    
    const imagePart = response.candidates?.[0]?.content?.parts.find(part => part.inlineData);

    if (imagePart && imagePart.inlineData) {
        const base64ImageBytes: string = imagePart.inlineData.data;
        const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
        
        try {
          await saveImage(cacheKey, imageUrl);
        } catch (error) {
          console.error("Error saving image to IndexedDB:", error);
        }
        return imageUrl;
    } else {
        console.warn(`No image generated for ${itemName}, using fallback.`);
        return `https://picsum.photos/seed/${itemName}/500/500`;
    }

  } catch (error) {
    console.error(`Error generating image for ${itemName}:`, error);
    return `https://picsum.photos/seed/${itemName}/500/500`;
  }
};

export const getCategoryTextData = async (
  category: Category,
  languages: Language[]
): Promise<Omit<FlashcardData, 'imageSrc'>[]> => {
  const langNames = languages.map(l => l.name).sort().join(',');
  const cacheKey = `${category.name}-${langNames}`;

  if (categoryTextDataCache.has(cacheKey)) {
    return categoryTextDataCache.get(cacheKey)!;
  }

  const translationProperties = languages.reduce((acc, lang) => {
    acc[lang.name] = { type: Type.STRING, description: `Translation for ${lang.name}` };
    return acc;
  }, {} as Record<string, any>);

  const itemProperties: Record<string, any> = {
    itemName: { type: Type.STRING, description: "The original item name in English from the list." },
    translations: { type: Type.OBJECT, properties: translationProperties },
  };

  const prompt = `For each item in this list: [${category.items.map(i => `"${i}"`).join(', ')}], provide translations in the following languages: ${languages.map(l => l.name).join(', ')}. Return the data as a JSON array of objects, where each object corresponds to an item from the list.`;

  try {
    const response = await withRetry(() => ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: itemProperties
          }
        },
      },
    }));

    const parsedData = JSON.parse(response.text.trim());
    
    const results: Omit<FlashcardData, 'imageSrc'>[] = category.items.map(itemName => {
      const dataForItem = parsedData.find((d: any) => d.itemName?.toLowerCase() === itemName.toLowerCase());
      
      if (!dataForItem) {
        const fallbackTranslations: Translations = {};
        languages.forEach(lang => {
          fallbackTranslations[lang.name] = lang.code === 'en' ? itemName : 'Error';
        });
        return { itemName, translations: fallbackTranslations };
      }

      const translations: Translations = dataForItem.translations || {};

      return { itemName: dataForItem.itemName, translations };
    });
    
    categoryTextDataCache.set(cacheKey, results);
    return results;

  } catch (error) {
    console.error(`Error fetching text data for category ${category.name}:`, error);
    return category.items.map(itemName => {
       const fallbackTranslations: Translations = {};
        languages.forEach(lang => {
            fallbackTranslations[lang.name] = lang.code === 'en' ? itemName : 'Translation Error';
        });
        return { itemName, translations: fallbackTranslations };
    });
  }
};