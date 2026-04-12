import i18n from '@/i18n';

// Cache for translated terms to improve performance
const translationCache: Record<string, Record<string, string>> = {};
let globalSortedTerms: string[] | null = null;

/**
 * A utility to "auto-translate" dynamic content like product names, 
 * brand names, etc., based on known keywords.
 */
export const translateDynamic = (text: string | undefined | null): string => {
  try {
    if (!text) return '';
    
    // If i18n is not initialized or we're in English, return the original text
    if (!i18n.isInitialized) return text;

    // Get current language (handling cases like 'en-US' by taking the first part)
    const lang = i18n.language?.split('-')[0] || 'en';
    if (lang === 'en') return text; 

    // Initialize cache for current language if it doesn't exist
    if (!translationCache[lang]) {
      translationCache[lang] = {};
    }

    let translated = String(text);

    // If we've already translated this exact string, return it from cache
    if (translationCache[lang][translated]) {
      return translationCache[lang][translated];
    }

    const originalText = translated;

    // We'll use the 'dynamic' namespace from i18n for translations.
    // Static terms are pre-compiled for speed
    const terms = [
      'Used Engines', 'Used Engine', 'Engines', 'Engine',
      'Gearboxes', 'Gearbox',
      'Turbos', 'Turbo',
      'Used', 'New', 'Reconditioned',
      'Diesel', 'Petrol', 'Electric', 'Hybrid',
      'Manual', 'Automatic',
      'All Products', 'Search', 'Category', 'Brand',
      'In Stock', 'Out of Stock',
      'Volkswagen', 'Mercedes', 'Mercedes-Benz', 'Audi', 'BMW', 'Renault', 'Nissan', 'Volvo',
      'Toyota', 'Honda', 'Ford', 'Peugeot', 'Citroen', 'Opel', 'Fiat', 'Jeep', 'Smart', 'Land Rover'
    ];

    // Cache the sorted terms globally once
    if (!globalSortedTerms) {
      globalSortedTerms = [...terms].sort((a, b) => b.length - a.length);
    }

    globalSortedTerms.forEach((en) => {
      // We create a key based on the English term (lowercase, spaces replaced by underscores)
      const key = en.toLowerCase().replace(/ /g, '_');
      
      // Use t() to get the translation. If it's the same as key (meaning not found), 
      // it will return the key itself or the defaultValue.
      const translation = i18n.t(`dynamic.${key}`, { defaultValue: en });
      
      if (translation && translation !== en) {
        // Use a safe regex escape for the English term
        const escapedEn = en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escapedEn}\\b`, 'gi');
        translated = translated.replace(regex, translation);
      }
    });

    // Store in cache for future use
    translationCache[lang][originalText] = translated;

    return translated;
  } catch (err) {
    console.error('[translateDynamic] Error:', err);
    return text || '';
  }
};
