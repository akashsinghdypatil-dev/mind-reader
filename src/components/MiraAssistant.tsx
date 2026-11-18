import { FormEvent, useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  Mic,
  MicOff,
  RotateCcw,
  Send,
  Square,
  Trash2,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { MiraMessage } from '../types/app';
import { soundEngine } from '../lib/sound';

const MIRA_ORB_IMG = '/src/assets/images/mira_voice_orb_1794982972338.jpg';

const SUGGESTED_PROMPTS = [
  'Can you guess my favourite colour?',
  'Can you guess what animal I am thinking of?',
  'Can you surprise me?',
  'Can you challenge my memory?',
  'Can you predict my next choice?',
  'Give me a difficult mind-reading challenge.',
];

interface MiraVoiceControls {
  isListening: boolean;
  isSpeaking: boolean;
  interimTranscript: string;
  micError: string | null;
  lastSpoken: string;
  micSupported: boolean;
  startListening: (onFinalTranscript: (transcript: string) => void) => void;
  stopListening: () => void;
  speak: (text: string) => void;
  stopSpeaking: () => void;
  replayLast: () => void;
  clearMicError: () => void;
}

interface MiraAssistantProps {
  mode: 'page' | 'drawer';
  messages: MiraMessage[];
  onUpdateMessages: (next: MiraMessage[]) => void;
  voice: MiraVoiceControls;
  voiceMuted: boolean;
  onToggleVoiceMute: () => void;
  screenContext: string;
  onCloseDrawer?: () => void;
}

export function MiraAssistant({
  mode,
  messages,
  onUpdateMessages,
  voice,
  voiceMuted,
  onToggleVoiceMute,
  screenContext,
  onCloseDrawer,
}: MiraAssistantProps) {
  const [inputMode, setInputMode] = useState<'voice' | 'text'>(
    voice.micSupported ? 'voice' : 'text'
  );
  const [textInput, setTextInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking, voice.interimTranscript]);

  const sendMessage = async (rawText: string) => {
    const trimmed = rawText.trim();
    if (!trimmed || isThinking) return;

    setApiError(null);
    voice.clearMicError();
    soundEngine.playClick();

    const userMsg: MiraMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const nextHistory = [...messages, userMsg];
    onUpdateMessages(nextHistory);
    setTextInput('');
    setIsThinking(true);

    try {
      const res = await fetch('/api/mira/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextHistory.map((m) => ({ role: m.role, content: m.content })),
          context: screenContext,
        }),
      });

      const data = (await res.json()) as { reply?: string; error?: string };
      if (!res.ok || !data.reply) {
        throw new Error(data.error || 'MIRA could not respond right now.');
      }

      const aiMsg: MiraMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      onUpdateMessages([...nextHistory, aiMsg]);
      voice.speak(data.reply);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to reach MIRA.';
      setApiError(msg);
      soundEngine.playError();
    } finally {
      setIsThinking(false);
    }
  };

  const handleMicToggle = () => {
    soundEngine.playClick();
    if (voice.isListening) {
      voice.stopListening();
    } else {
      voice.startListening((transcript) => {
        sendMessage(transcript);
      });
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage(textInput);
  };

  const handleClear = () => {
    voice.stopListening();
    voice.stopSpeaking();
    soundEngine.playClick();
    onUpdateMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content:
          "Hello! Welcome to Mind Reader. I'm MIRA. Are you ready for a mind experiment? Think of a secret, or ask me to test your logic.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const statusLabel = voice.isListening
    ? 'Listening to your voice'
    : isThinking
    ? 'Analyzing your response'
    : voice.isSpeaking
    ? 'MIRA is speaking'
    : 'Ready for voice or text';

  const waveActive = voice.isListening || voice.isSpeaking;

  return (
    <div
      className={
        mode === 'page'
          ? 'max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch'
          : 'flex flex-col h-full'
      }
    >
      {/* Left Presence Panel (Page Mode) OR Compact Header (Drawer Mode) */}
      {mode === 'page' ? (
        <div className="lg:col-span-4 rounded-2xl border border-slate-200 dark:border-cyan-500/20 glass-surface p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white">
                MIRA Voice Agent
              </h2>
              <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400">
                Voice + Text
              </span>
            </div>
            <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300">
              Speak directly with MIRA using your microphone, or switch to text chat anytime.
            </p>

            {/* MIRA Holographic Orb */}
            <div className="mt-6 flex flex-col items-center">
              <div
                className={`relative w-40 h-40 rounded-full overflow-hidden border transition-transform duration-300 ${
                  voice.isListening
                    ? 'border-cyan-400 scale-105 shadow-[0_0_55px_rgba(6,182,212,0.55)]'
                    : voice.isSpeaking
                    ? 'border-blue-400 scale-102 shadow-[0_0_45px_rgba(59,130,246,0.45)]'
                    : 'border-slate-300 dark:border-cyan-500/30'
                }`}
              >
                <img
                  src={MIRA_ORB_IMG}
                  alt="MIRA neural voice core"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Real Sound Waveform (only animates when truly listening or speaking) */}
              <div
                className="mt-5 h-9 flex items-center justify-center gap-1.5"
                aria-label="Audio activity indicator"
              >
                {Array.from({ length: 11 }).map((_, idx) => (
                  <span
                    key={idx}
                    className={`w-1 rounded-full transition-all duration-200 ${
                      voice.isListening
                        ? 'bg-cyan-400 animate-wave-bar'
                        : voice.isSpeaking
                        ? 'bg-blue-400 animate-wave-bar'
                        : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                    style={{
                      height: waveActive ? `${16 + ((idx * 7) % 18)}px` : '6px',
                      animationDelay: `${idx * 0.08}s`,
                    }}
                  />
                ))}
              </div>

              <p className="mt-2 text-xs font-medium text-slate-600 dark:text-cyan-300">
                {statusLabel}
              </p>
            </div>
          </div>

          {/* Voice Controls */}
          <div className="mt-6 pt-5 border-t border-slate-200 dark:border-white/10 space-y-3">
            <button
              type="button"
              onClick={handleMicToggle}
              disabled={!voice.micSupported || isThinking}
              className={`w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                voice.isListening
                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              {voice.isListening ? (
                <>
                  <MicOff className="w-4 h-4" />
                  Stop Listening
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" />
                  {voice.micSupported ? 'Speak to MIRA' : 'Microphone Unavailable'}
                </>
              )}
            </button>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={onToggleVoiceMute}
                className="py-2 px-2.5 rounded-lg border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 flex items-center justify-center gap-1.5 cursor-pointer"
                title={voiceMuted ? 'Unmute MIRA voice' : 'Mute MIRA voice'}
              >
                {voiceMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                {voiceMuted ? 'Muted' : 'Mute'}
              </button>
              <button
                type="button"
                onClick={() => voice.stopSpeaking()}
                disabled={!voice.isSpeaking}
                className="py-2 px-2.5 rounded-lg border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-40 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Square className="w-3.5 h-3.5" />
                Stop
              </button>
              <button
                type="button"
                onClick={() => voice.replayLast()}
                disabled={!voice.lastSpoken}
                className="py-2 px-2.5 rounded-lg border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-40 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Replay
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="px-5 py-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={MIRA_ORB_IMG}
              alt="MIRA"
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full object-cover border border-cyan-400/40 shrink-0"
            />
            <div className="min-w-0">
              <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white truncate">
                MIRA Voice Assistant
              </h3>
              <p className="text-xs text-slate-500 dark:text-cyan-300 truncate">{statusLabel}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={onToggleVoiceMute}
              aria-label={voiceMuted ? 'Unmute MIRA' : 'Mute MIRA'}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer"
            >
              {voiceMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            {voice.isSpeaking && (
              <button
                type="button"
                onClick={() => voice.stopSpeaking()}
                aria-label="Stop speaking"
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer"
              >
                <Square className="w-4 h-4" />
              </button>
            )}
            {onCloseDrawer && (
              <button
                type="button"
                onClick={onCloseDrawer}
                aria-label="Close MIRA drawer"
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Right / Main Conversation Area */}
      <div
        className={
          mode === 'page'
            ? 'lg:col-span-8 rounded-2xl border border-slate-200 dark:border-cyan-500/20 glass-surface flex flex-col min-h-[540px] max-h-[680px]'
            : 'flex-1 flex flex-col min-h-0'
        }
      >
        {/* Top Toolbar */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-white/5">
            <button
              type="button"
              onClick={() => setInputMode('voice')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer inline-flex items-center gap-1.5 ${
                inputMode === 'voice'
                  ? 'bg-white dark:bg-blue-600 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              Voice
            </button>
            <button
              type="button"
              onClick={() => setInputMode('text')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer inline-flex items-center gap-1.5 ${
                inputMode === 'text'
                  ? 'bg-white dark:bg-blue-600 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              <Keyboard className="w-3.5 h-3.5" />
              Text
            </button>
          </div>

          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Chat
          </button>
        </div>

        {/* Transcript */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-slate-100 dark:bg-[#0D1A35] text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-cyan-500/20 rounded-bl-sm'
                }`}
              >
                {msg.content}
              </div>
              <span className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                {msg.role === 'user' ? 'You' : 'MIRA'} · {msg.timestamp}
              </span>
            </div>
          ))}

          {voice.interimTranscript && (
            <div className="flex justify-end">
              <div className="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm italic bg-blue-600/20 text-blue-700 dark:text-cyan-200 border border-blue-500/30">
                {voice.interimTranscript}...
              </div>
            </div>
          )}

          {isThinking && (
            <div className="flex items-start">
              <div className="rounded-2xl px-4 py-3 text-sm bg-slate-100 dark:bg-[#0D1A35] border border-slate-200 dark:border-cyan-500/20 text-slate-600 dark:text-cyan-300 flex items-center gap-2">
                <span className="inline-flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce"
                    style={{ animationDelay: '0.15s' }}
                  />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce"
                    style={{ animationDelay: '0.3s' }}
                  />
                </span>
                <span>MIRA is thinking...</span>
              </div>
            </div>
          )}

          {(voice.micError || apiError) && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-800 dark:text-amber-200">
              {voice.micError || apiError}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts */}
        <div className="px-5 py-2.5 border-t border-slate-200 dark:border-white/10 overflow-x-auto">
          <div className="flex items-center gap-2">
            {SUGGESTED_PROMPTS.slice(0, mode === 'page' ? 6 : 3).map((prompt) => (
              <button
                key={prompt}
                type="button"
                disabled={isThinking}
                onClick={() => sendMessage(prompt)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 hover:border-cyan-500/50 text-xs text-slate-700 dark:text-slate-200 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200 dark:border-white/10">
          {inputMode === 'voice' && voice.micSupported ? (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleMicToggle}
                disabled={isThinking}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                  voice.isListening
                    ? 'bg-rose-600 hover:bg-rose-500 text-white'
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
              >
                {voice.isListening ? (
                  <>
                    <MicOff className="w-4 h-4" />
                    Listening... Tap to Stop
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    Tap Microphone & Speak to MIRA
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setInputMode('text')}
                className="px-3.5 py-3 rounded-xl border border-slate-200 dark:border-white/15 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 whitespace-nowrap shrink-0 cursor-pointer"
              >
                Type Instead
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex items-center gap-2.5">
              {voice.micSupported && (
                <button
                  type="button"
                  onClick={handleMicToggle}
                  aria-label={voice.isListening ? 'Stop voice input' : 'Start voice input'}
                  className={`p-3 rounded-xl border transition-colors shrink-0 cursor-pointer ${
                    voice.isListening
                      ? 'bg-rose-600 border-rose-500 text-white'
                      : 'border-slate-200 dark:border-white/15 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10'
                  }`}
                >
                  {voice.isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              )}
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Ask MIRA anything or answer her question..."
                className="flex-1 min-w-0 rounded-xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#060D1E] px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                disabled={!textInput.trim() || isThinking}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
