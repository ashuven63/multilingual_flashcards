export interface Language {
  code: string;
  name: string;
}

export interface Category {
  name: string;
  emoji: string;
  items: string[];
}

export type ImageStyle = 'illustration' | 'realistic';

export type Translations = Record<string, string>;

export interface FlashcardData {
  itemName: string;
  translations: Translations;
  imageSrc: string;
}