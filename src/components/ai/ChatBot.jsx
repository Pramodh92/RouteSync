/**
 * src/components/ai/ChatBot.jsx
 * Floating AI travel assistant chatbot — appears on ALL pages.
 * Supports streaming responses via SSE.
 */
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Mic, MicOff, Loader, Bot, User, Sparkles } from 'lucide-react';
import { useAI } from '../../context/AIContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useBooking } from '../../context/BookingContext.jsx';
import { chatStream } from '../../services/api.js';
import { useLocation } from 'react-router-dom';

const SUGGESTED = [
    '🏖️ Plan a Goa trip for 3 days under ₹15,000',
    '✈️ Find cheapest flights from Mumbai to Delhi',
    '🏨 Best hotels in Jaipur under ₹3,000/night',
    '📦 What holiday packages are available?',
    '🎁 Show me active offers and deals',
];

export default function ChatBot() {
    const { chatOpen, setChatOpen, chatHistory, setChatHistory } = useAI();
    const { user } = useAuth();
    const { bookings } = useBooking();
    const location = useLocation();

    const [input, setInput] = useState('');
    const [streaming, setStreaming] = useState(false);
    const [currentStream, setCurrentStream] = useState('');
    const [listening, setListening] = useState(false);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);
    const recognitionRef = useRef(null);

    // Auto-scroll to bottom
    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatHistory, currentStream]);

    // Focus input when opened
    useEffect(() => { if (chatOpen) setTimeout(() => inputRef.current?.focus(), 100); }, [chatOpen]);

    // Voice recognition setup
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SR = window.webkitSpeechRecognition || window.SpeechRecognition;
            recognitionRef.current = new SR();
            recognitionRef.current.continuous = false;
            recognitionRef.current.lang = 'en-IN';
            recognitionRef.current.onresult = (e) => setInput(e.results[0][0].transcript);
            recognitionRef.current.onend = () => setListening(false);
        }
    }, []);

    const toggleVoice = () => {
        if (!recognitionRef.current) return;
        if (listening) { recognitionRef.current.stop(); setListening(false); }
        else { recognitionRef.current.start(); setListening(true); }
    };

    const sendMessage = async (text = input.trim()) => {
        if (!text || streaming) return;
        setInput('');
        const userMsg = { role: 'user', content: text };
        const newHistory = [...chatHistory, userMsg];
        setChatHistory(newHistory);
        setStreaming(true);
        setCurrentStream('');

        let fullResponse = '';
        chatStream(
            {
                messages: newHistory,
                page: location.pathname,
                userBookings: bookings.slice(0, 5),
            },
            (token) => { fullResponse += token; setCurrentStream(fullResponse); },
            () => {
                setChatHistory(prev => [...prev, { role: 'assistant', content: fullResponse }]);
                setCurrentStream('');
                setStreaming(false);
            },
            (err) => {
                setChatHistory(prev => [...prev, { role: 'assistant', content: `⚠️ ${err || 'Something went wrong. Please try again.'}` }]);
                setCurrentStream('');
                setStreaming(false);
            }
        );
    };

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setChatOpen(o => !o)}
                className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center transition-all duration-300 ${chatOpen ? 'bg-charcoal' : 'bg-orange'} text-white hover:scale-105`}
                aria-label="Open AI Chat"
            >
                {chatOpen
                    ? <X className="w-6 h-6" />
                    : <MessageCircle className="w-6 h-6" />}
                {!chatOpen && chatHistory.length === 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold rounded-full animate-ping" />
                )}
            </button>

            {/* Chat Panel */}
            {chatOpen && (
                <div className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] bg-white rounded-3xl shadow-2xl border border-sand/60 flex flex-col overflow-hidden animate-fade-in"
                    style={{ height: '520px' }}>

                    {/* Header */}
                    <div className="bg-gradient-to-r from-charcoal to-charcoal/90 text-white px-5 py-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-orange flex items-center justify-center">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-semibold text-sm">RouteSync AI</p>
                            <p className="text-xs text-sand/60">Your smart travel assistant</p>
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            <span className="text-xs text-sand/60">Online</span>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-ivory/30">
                        {chatHistory.length === 0 && (
                            <div className="space-y-3">
                                <div className="flex items-start gap-2">
                                    <div className="w-7 h-7 rounded-xl bg-orange flex items-center justify-center flex-shrink-0">
                                        <Bot className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 text-sm text-charcoal shadow-sm max-w-[85%]">
                                        Hi{user ? ` ${user.name?.split(' ')[0]}` : ''}! 👋 I'm your RouteSync AI assistant. Ask me anything about travel — flights, hotels, destinations, or let me plan your next trip!
                                    </div>
                                </div>
                                <p className="text-xs text-warmgray text-center">Try asking:</p>
                                {SUGGESTED.map(s => (
                                    <button key={s} onClick={() => sendMessage(s)}
                                        className="w-full text-left text-xs text-charcoal bg-white hover:bg-orange/5 border border-sand hover:border-orange/40 rounded-xl px-3 py-2.5 transition-all">
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}

                        {chatHistory.map((msg, i) => (
                            <div key={i} className={`flex items-start gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-orange/20' : 'bg-orange'}`}>
                                    {msg.role === 'user'
                                        ? <User className="w-4 h-4 text-orange" />
                                        : <Bot className="w-4 h-4 text-white" />}
                                </div>
                                <div className={`rounded-2xl px-4 py-3 text-sm max-w-[85%] shadow-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user'
                                    ? 'bg-orange text-white rounded-tr-none'
                                    : 'bg-white text-charcoal rounded-tl-none'}`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}

                        {/* Streaming response */}
                        {streaming && (
                            <div className="flex items-start gap-2">
                                <div className="w-7 h-7 rounded-xl bg-orange flex items-center justify-center flex-shrink-0">
                                    <Bot className="w-4 h-4 text-white" />
                                </div>
                                <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 text-sm text-charcoal shadow-sm max-w-[85%] leading-relaxed">
                                    {currentStream || <span className="flex gap-1 items-center"><span className="w-2 h-2 bg-orange rounded-full animate-bounce" /><span className="w-2 h-2 bg-orange rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} /><span className="w-2 h-2 bg-orange rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} /></span>}
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input */}
                    <div className="px-4 py-3 bg-white border-t border-sand/50 flex items-center gap-2">
                        <button onClick={toggleVoice}
                            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${listening ? 'bg-red-100 text-red-500 animate-pulse' : 'bg-sand/40 text-warmgray hover:bg-orange/10 hover:text-orange'}`}>
                            {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        </button>
                        <input
                            ref={inputRef}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                            placeholder="Ask about flights, hotels, destinations…"
                            className="flex-1 text-sm bg-ivory rounded-xl px-3 py-2.5 outline-none text-charcoal placeholder-warmgray"
                            disabled={streaming}
                        />
                        <button onClick={() => sendMessage()} disabled={!input.trim() || streaming}
                            className="w-9 h-9 rounded-xl bg-orange text-white flex items-center justify-center disabled:opacity-40 hover:bg-orange/90 transition-all">
                            {streaming ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
