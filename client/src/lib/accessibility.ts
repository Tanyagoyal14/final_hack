import { useState, useEffect, useCallback } from 'react';

interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  audioEnabled: boolean;
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  highContrast: false,
  largeText: false,
  audioEnabled: false,
};

const STORAGE_KEY = 'magilearn-accessibility';

export function useAccessibility() {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    if (typeof window === 'undefined') {
      return DEFAULT_SETTINGS;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (error) {
      console.warn('Failed to load accessibility settings from localStorage:', error);
    }

    return DEFAULT_SETTINGS;
  });

  // Apply accessibility settings to the document
  useEffect(() => {
    const body = document.body;
    const html = document.documentElement;

    // High contrast mode
    if (settings.highContrast) {
      body.classList.add('high-contrast');
    } else {
      body.classList.remove('high-contrast');
    }

    // Large text mode
    if (settings.largeText) {
      body.classList.add('large-text');
    } else {
      body.classList.remove('large-text');
    }

    // Audio enabled (for future text-to-speech implementation)
    if (settings.audioEnabled) {
      html.setAttribute('data-audio-enabled', 'true');
    } else {
      html.removeAttribute('data-audio-enabled');
    }
  }, [settings]);

  // Save settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.warn('Failed to save accessibility settings to localStorage:', error);
    }
  }, [settings]);

  const updateSettings = useCallback((updates: Partial<AccessibilitySettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const toggleHighContrast = useCallback(() => {
    updateSettings({ highContrast: !settings.highContrast });
  }, [settings.highContrast, updateSettings]);

  const toggleLargeText = useCallback(() => {
    updateSettings({ largeText: !settings.largeText });
  }, [settings.largeText, updateSettings]);

  const toggleAudio = useCallback(() => {
    updateSettings({ audioEnabled: !settings.audioEnabled });
  }, [settings.audioEnabled, updateSettings]);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  // Text-to-speech function (basic implementation)
  const speak = useCallback((text: string) => {
    if (!settings.audioEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    try {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8; // Slightly slower for clarity
      utterance.pitch = 1.1; // Slightly higher pitch for friendliness
      utterance.volume = 0.8;

      // Try to use a child-friendly voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.toLowerCase().includes('female') || 
        voice.name.toLowerCase().includes('woman') ||
        voice.name.toLowerCase().includes('girl')
      );

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.warn('Text-to-speech failed:', error);
    }
  }, [settings.audioEnabled]);

  // Read element content aloud
  const readElement = useCallback((element: HTMLElement | string) => {
    if (!settings.audioEnabled) return;

    let text: string;
    if (typeof element === 'string') {
      text = element;
    } else {
      text = element.textContent || element.innerText || '';
    }

    speak(text);
  }, [settings.audioEnabled, speak]);

  return {
    // Current settings
    highContrast: settings.highContrast,
    largeText: settings.largeText,
    audioEnabled: settings.audioEnabled,
    
    // Toggle functions
    toggleHighContrast,
    toggleLargeText,
    toggleAudio,
    
    // Utility functions
    updateSettings,
    resetSettings,
    speak,
    readElement,
    
    // Full settings object
    settings,
  };
}

// Helper hook for components that need to respond to accessibility changes
export function useAccessibilityAnnouncements() {
  const { audioEnabled, speak } = useAccessibility();

  const announceSuccess = useCallback((message: string) => {
    if (audioEnabled) {
      speak(`Success! ${message}`);
    }
  }, [audioEnabled, speak]);

  const announceError = useCallback((message: string) => {
    if (audioEnabled) {
      speak(`Error! ${message}`);
    }
  }, [audioEnabled, speak]);

  const announceInfo = useCallback((message: string) => {
    if (audioEnabled) {
      speak(message);
    }
  }, [audioEnabled, speak]);

  return {
    announceSuccess,
    announceError,
    announceInfo,
  };
}

// Keyboard navigation helper
export function useKeyboardNavigation() {
  const handleKeyDown = useCallback((event: KeyboardEvent, onActivate: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onActivate();
    }
  }, []);

  const makeAccessible = useCallback((element: HTMLElement, onActivate: () => void) => {
    element.setAttribute('tabindex', '0');
    element.setAttribute('role', 'button');
    element.addEventListener('keydown', (e) => handleKeyDown(e, onActivate));
    
    return () => {
      element.removeEventListener('keydown', (e) => handleKeyDown(e, onActivate));
    };
  }, [handleKeyDown]);

  return {
    handleKeyDown,
    makeAccessible,
  };
}
