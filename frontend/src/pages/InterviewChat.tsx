import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { apiService } from '../services/api';
import axios from 'axios';

// Directly talk to Rasa REST channel
// Talk to Rasa via Nginx proxy
const RASA_URL = '/rasa/webhooks/rest/webhook';


import type { InterviewMessage as Message } from '../types';

export function InterviewChat() {
    const { id } = useParams<{ id: string }>(); // This serves as the session_id
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Basic metrics for "typing test"
    const [keyPresses, setKeyPresses] = useState(0);
    const [startTime, setStartTime] = useState<number | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Handle typing tracking for metrics
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!startTime) setStartTime(Date.now());
        if (e.key.length === 1) { // count roughly valid keystrokes
            setKeyPresses(prev => prev + 1);
        }
    };

    const calculateVariables = () => {
        if (!startTime) return { wpm: 0, accuracy: 100 };
        const timeElapsedSec = (Date.now() - startTime) / 1000;
        const minutes = timeElapsedSec / 60;
        const wpm = minutes > 0 ? Math.round((keyPresses / 5) / minutes) : 0;
        return { wpm, accuracy: 98.5 }; // hard to measure accuracy precisely without a reference text, 98.5 is a proxy
    };

    const sendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!input.trim() || !id) return;

        const userMsg = input.trim();
        setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
        setInput('');
        setLoading(true);

        // Sync metrics
        const metrics = calculateVariables();
        try {
            if (id) {
                await apiService.submitTypingTest(
                    parseInt(id),
                    metrics.wpm,
                    metrics.accuracy
                );
            }
        } catch (e) {
            console.error("Failed to sync metrics", e);
        }

        try {
            const resp = await axios.post(RASA_URL, {
                sender: id, // user the session ID as the conversation ID for Rasa
                message: userMsg
            });

            const botMessages = resp.data.map((m: { text: string }) => ({
                sender: 'bot',
                text: m.text
            }));

            setMessages(prev => [...prev, ...botMessages]);
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, I am having trouble connecting to the server.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen max-h-screen bg-slate-50 dark:bg-slate-900 absolute inset-0 z-50">
            <header className="p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center shadow-sm">
                <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center mr-4">
                    <span className="material-symbols-outlined text-primary">smart_toy</span>
                </div>
                <div>
                    <h1 className="text-xl font-bold dark:text-white text-slate-900">TalentLens Interview</h1>
                    <p className="text-xs text-slate-500">Session ID: {id}</p>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4 max-w-md mx-auto">
                        <div className="size-20 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-4xl text-primary">forum</span>
                        </div>
                        <h2 className="text-2xl font-bold dark:text-white text-slate-900">Welcome!</h2>
                        <p className="text-slate-500">Say "Hello" to start your interview screening.</p>
                    </div>
                ) : (
                    messages.map((msg, i) => (
                        <div key={i} className={`flex gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`size-8 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'user' ? 'bg-slate-200 dark:bg-slate-700' : 'bg-primary/10'
                                }`}>
                                <span className={`material-symbols-outlined text-sm ${msg.sender === 'user' ? 'text-slate-600 dark:text-slate-300' : 'text-primary'}`}>
                                    {msg.sender === 'user' ? 'person' : 'smart_toy'}
                                </span>
                            </div>
                            <div className={`p-4 rounded-2xl max-w-[80%] ${msg.sender === 'user'
                                ? 'bg-primary text-white rounded-tr-none'
                                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white rounded-tl-none shadow-sm'
                                }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))
                )}
                {loading && (
                    <div className="flex gap-4">
                        <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-sm text-primary">smart_toy</span>
                        </div>
                        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-tl-none shadow-sm text-slate-400">
                            <span className="animate-pulse">typing...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </main>

            <footer className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shadow-lg relative z-10">
                <form onSubmit={sendMessage} className="max-w-4xl mx-auto relative flex items-center">
                    <input
                        type="text"
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-full py-4 pl-6 pr-16 focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="Type your answer here..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="absolute right-2 top-2 bottom-2 aspect-square bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary/90 disabled:opacity-50 disabled:hover:bg-primary transition-colors"
                    >
                        <span className="material-symbols-outlined">send</span>
                    </button>
                </form>
            </footer>
        </div>
    );
}
