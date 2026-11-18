import { useCallback, useEffect, useRef, useState } from 'react';

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionErrorEventLike {
  error: string;
}

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const win = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return win.SpeechRecognition || win.webkitSpeechRecognition || null;
}

export function useMiraVoice(voiceMuted: boolean) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [micError, setMicError] = useState<string | null>(null);
  const [lastSpoken, setLastSpoken] = useState<string>('');

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const voiceMutedRef = useRef(voiceMuted);

  const micSupported = typeof window !== 'undefined' && Boolean(getSpeechRecognitionCtor());
  const speechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  useEffect(() => {
    voiceMutedRef.current = voiceMuted;
    if (voiceMuted && speechSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [voiceMuted, speechSupported]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const stopSpeaking = useCallback(() => {
    if (!speechSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [speechSupported]);

  const speak = useCallback(
    (text: string, onEnd?: () => void) => {
      const clean = text.replace(/[*_`#]/g, '').trim();
      if (!clean) return;
      setLastSpoken(clean);

      if (!speechSupported || voiceMutedRef.current) {
        onEnd?.();
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.rate = 1.02;
      utterance.pitch = 1.04;

      const voices = window.speechSynthesis.getVoices();
      const preferred =
        voices.find(
          (v) =>
            v.lang.startsWith('en') &&
            (v.name.includes('Google') ||
              v.name.includes('Samantha') ||
              v.name.includes('Natural') ||
              v.name.includes('Aria'))
        ) || voices.find((v) => v.lang.startsWith('en'));

      if (preferred) {
        utterance.voice = preferred;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        onEnd?.();
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        onEnd?.();
      };

      window.speechSynthesis.speak(utterance);
    },
    [speechSupported]
  );

  const replayLast = useCallback(() => {
    if (lastSpoken) {
      speak(lastSpoken);
    }
  }, [lastSpoken, speak]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimTranscript('');
  }, []);

  const startListening = useCallback(
    (onFinalTranscript: (transcript: string) => void) => {
      setMicError(null);
      const Ctor = getSpeechRecognitionCtor();
      if (!Ctor) {
        setMicError(
          'Voice recognition is not supported in this browser. Switch to text input to talk with MIRA.'
        );
        return;
      }

      // Stop MIRA speaking before listening so she does not hear herself
      stopSpeaking();

      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }

      const recognition = new Ctor();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setInterimTranscript('');
      };

      recognition.onresult = (event: SpeechRecognitionEventLike) => {
        let interim = '';
        let finalText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const text = result[0]?.transcript || '';
          if (result.isFinal) {
            finalText += text;
          } else {
            interim += text;
          }
        }
        setInterimTranscript(interim);
        if (finalText.trim()) {
          setInterimTranscript('');
          onFinalTranscript(finalText.trim());
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
        setIsListening(false);
        setInterimTranscript('');
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setMicError(
            'Microphone permission was denied. Allow microphone access or use text input below.'
          );
        } else if (event.error === 'no-speech') {
          setMicError('No speech detected. Tap the microphone and try speaking again.');
        } else if (event.error !== 'aborted') {
          setMicError(`Microphone error (${event.error}). You can use text input anytime.`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
        recognitionRef.current = null;
      };

      recognitionRef.current = recognition;
      try {
        recognition.start();
      } catch {
        setIsListening(false);
        setMicError('Unable to start microphone right now. Please try again or type below.');
      }
    },
    [stopSpeaking]
  );

  return {
    isListening,
    isSpeaking,
    interimTranscript,
    micError,
    lastSpoken,
    micSupported,
    speechSupported,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    replayLast,
    clearMicError: () => setMicError(null),
  };
}
