import { Language, Category } from './types';

export const LANGUAGES: Language[] = [
  { code: 'bn', name: 'Bengali' },
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'kn', name: 'Kannada' },
  { code: 'mr', name: 'Marathi' },
  { code: 'or', name: 'Odia' },
  { code: 'sa', name: 'Sanskrit' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
].sort((a, b) => a.name.localeCompare(b.name));

export const CATEGORIES: Category[] = [
  {
    name: 'Fruits',
    emoji: '🥭',
    items: ['Mango', 'Banana', 'Guava', 'Jackfruit', 'Lychee', 'Pomegranate', 'Sapodilla', 'Watermelon', 'Mosambi', 'Strawberry'],
  },
  {
    name: 'Vegetables',
    emoji: '🍆',
    items: ['Okra', 'Eggplant', 'Bottle Gourd', 'Bitter Gourd', 'Cauliflower', 'Spinach', 'Potato', 'Tomato', 'Onion', 'Ginger'],
  },
  {
    name: 'Animals',
    emoji: '🐅',
    items: ['Bengal Tiger', 'Indian Elephant', 'Asiatic Lion', 'Langur', 'Indian Rhinoceros', 'Cow', 'Leopard', 'Sambar Deer', 'Sloth Bear', 'King Cobra'],
  },
  {
    name: 'Birds',
    emoji: '🦚',
    items: ['Peacock', 'Crow', 'Parrot', 'Sparrow', 'Indian Roller', 'Kingfisher', 'Myna', 'Koel', 'Great Hornbill', 'Parakeet'],
  },
  {
    name: 'Flowers',
    emoji: '🌸',
    items: ['Champa', 'Marigold', 'Kadamba', 'Jasmine', 'Lotus', 'Rose', 'Periwinkle', 'Bougainvillea'],
  },
  {
    name: 'Festivals',
    emoji: '🎉',
    items: ['Diwali', 'Holi', 'Rakhi', 'Ganesh Chaturthi', 'Christmas', 'Sankranti', 'Onam', 'Pongal', 'Navratri', 'Eid'],
  },
  {
    name: 'Indian Culture',
    emoji: '🛕',
    items: ['Saree', 'Tabla', 'Bindi', 'Turban', 'Namaste', 'Rickshaw', 'Yoga', 'Henna', 'Diya', 'Rangoli'],
  }
];