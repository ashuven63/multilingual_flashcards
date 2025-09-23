// A browser-only service for sound effects and speech synthesis.
let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  if (typeof window !== 'undefined' && !audioContext) {
    // Standard AudioContext or fallback for Safari
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

// Generates a simple sound using the Web Audio API
const playTone = (type: OscillatorType, frequency: number, duration: number, volume: number) => {
  const context = getAudioContext();
  if (!context) return;

  // Resume context if it's suspended (e.g., due to browser autoplay policies)
  if (context.state === 'suspended') {
    context.resume();
  }

  const oscillator = context.createOscillator();
  const gainNode = context.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, context.currentTime);
  
  gainNode.gain.setValueAtTime(volume, context.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);

  oscillator.start(context.currentTime);
  oscillator.stop(context.currentTime + duration);
};

// A short, soft 'pop' for clicks and selections
export const playClickSound = () => {
  playTone('sine', 440, 0.1, 0.05);
};

// A 'swoosh' sound for card transitions
export const playFlipSound = () => {
  const context = getAudioContext();
  if (!context) return;
  if (context.state === 'suspended') {
    context.resume();
  }

  const oscillator = context.createOscillator();
  const gainNode = context.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);
  
  oscillator.type = 'sawtooth';
  gainNode.gain.setValueAtTime(0.1, context.currentTime);

  oscillator.frequency.setValueAtTime(800, context.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(200, context.currentTime + 0.15);
  
  gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.15);

  oscillator.start(context.currentTime);
  oscillator.stop(context.currentTime + 0.15);
};

/**
 * Speaks the given text using the browser's text-to-speech engine.
 * @param text The text to be spoken.
 * @param langCode The BCP 47 language code (e.g., 'en-US', 'hi-IN').
 */
export const speak = (text: string, langCode: string) => {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    console.warn('Speech synthesis not supported in this browser.');
    return;
  }

  // Cancel any currently playing utterance to prevent overlap
  window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = langCode;
  
  // Attempt to find a specific voice for the requested language for better quality
  const voices = window.speechSynthesis.getVoices();
  const voice = voices.find(v => v.lang.startsWith(langCode));
  if (voice) {
    utterance.voice = voice;
  } else {
    console.warn(`No voice found for language: ${langCode}. Using browser default.`);
  }

  window.speechSynthesis.speak(utterance);
};

// Preload voices to ensure they are available when `speak` is called.
if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
    };
}
