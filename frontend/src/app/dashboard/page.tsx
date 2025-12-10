'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Image as ImageIcon, LogOut, Terminal, Cpu, Shield, Loader2, X } from 'lucide-react';
import axios from 'axios';

interface User {
    id: number;
    email: string;
    full_name: string;
}

interface ChatMessage {
    id?: number;
    role: 'user' | 'ai';
    content: string;
    image_id?: number | null;
    created_at?: string;
    annotated_image?: string; // For immediate functionality
}

export default function Dashboard() {
    const router = useRouter();
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [user, setUser] = useState<User | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        const fetchData = async () => {
            try {
                const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                const authConfig = { headers: { Authorization: `Bearer ${token}` } };

                const userRes = await axios.get(`${baseURL}/api/auth/me`, authConfig);
                setUser(userRes.data);

                const chatsRes = await axios.get(`${baseURL}/api/chats`, authConfig);
                setMessages(chatsRes.data);
            } catch (err) {
                console.error('Failed to load data', err);
                // router.push('/login'); // Optional: don't force logout on minor errors
            } finally {
                setIsInitializing(false);
            }
        };

        fetchData();
    }, [router]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, isLoading, previewUrl]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const clearFile = () => {
        setSelectedFile(null);
        setPreviewUrl('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/login');
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if ((!input.trim() && !selectedFile) || isLoading) return;

        const currentInput = input;
        const currentFile = selectedFile;
        // Optimistic update
        const tempId = Date.now();
        const userMsg: ChatMessage = {
            id: tempId,
            role: 'user',
            content: currentInput,
            annotated_image: currentFile ? previewUrl : undefined
        };
        
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        clearFile();
        setIsLoading(true);

        const formData = new FormData();
        formData.append('question', currentInput || (currentFile ? 'Visual Scan Initiated. Awaiting Analysis.' : ''));
        if (currentFile) {
            formData.append('file', currentFile);
        }

        try {
            const token = localStorage.getItem('token');
            const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            
            const response = await axios.post(`${baseURL}/api/chat`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Update user message with confirmed data if needed? 
            // Actually just append AI response
            const aiMsg: ChatMessage = {
                role: 'ai',
                content: response.data.response,
                annotated_image: undefined // No annotation
            };
            setMessages(prev => [...prev, aiMsg]);

        } catch (error) {
            console.error('Chat failed:', error);
            setMessages(prev => [...prev, { role: 'ai', content: 'SYSTEM ERROR: Communication link disrupted.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (isInitializing) {
        return (
            <div className="min-h-screen bg-[#0B1120] flex items-center justify-center text-cyan-400">
                <Loader2 className="w-10 h-10 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0B1120] text-slate-200 font-sans flex flex-col overflow-hidden relative">
            {/* Background elements for "tech" feel */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 opacity-70"></div>
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,23,43,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(18,23,43,0.8)_1px,transparent_1px)] bg-[size:30px_30px] opacity-20 pointer-events-none"></div>

            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 bg-[#0F172A]/80 backdrop-blur-md border-b border-slate-700/50 sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                        <Terminal className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white tracking-wide">CHIMERA<span className="text-cyan-400">01</span></h1>
                        <p className="text-[10px] text-cyan-500/80 uppercase tracking-widest font-semibold">Agent Module Active</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-xs text-slate-400 font-mono">SYSTEM_ONLINE</span>
                    </div>
                    <div className="flex items-center gap-3 pl-4 border-l border-slate-700/50">
                        <div className="text-right hidden sm:block">
                            <div className="text-sm font-medium text-slate-200">{user?.full_name}</div>
                            <div className="text-xs text-slate-500 font-mono">{user?.email}</div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 text-slate-400 hover:text-white hover:bg-red-500/20 hover:border-red-500/50 border border-transparent rounded-md transition-all duration-200"
                            title="Disconnect Session"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Chat Area */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 scroll-smooth" ref={chatContainerRef}>
                <div className="max-w-4xl mx-auto space-y-6">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 opacity-50">
                            <Cpu className="w-16 h-16 text-cyan-500 mb-4" />
                            <h2 className="text-xl font-bold text-slate-300">Awaiting Input</h2>
                            <p className="text-sm text-slate-500">Initiate Chimera Protocol for guidance.</p>
                        </div>
                    ) : (
                        messages.map((msg, idx) => (
                            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role === 'ai' && (
                                    <div className="w-8 h-8 rounded-full bg-cyan-900/50 flex items-center justify-center border border-cyan-500/30 flex-shrink-0 mt-1">
                                        <Shield className="w-4 h-4 text-cyan-400" />
                                    </div>
                                )}
                                <div className={`flex flex-col gap-2 max-w-[85%] sm:max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div className={`
                                        px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm
                                        ${msg.role === 'user' 
                                            ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-tr-sm' 
                                            : 'bg-slate-800/80 border border-slate-700/50 text-slate-200 rounded-tl-sm'
                                        }
                                    `}>
                                        {msg.content}
                                    </div>
                                    {/* Display uploaded or annotated image if exists */}
                                    {(msg.annotated_image) && (
                                        <div className="mt-2 rounded-lg overflow-hidden border border-slate-700/50 shadow-lg max-w-sm">
                                            <img src={msg.annotated_image} alt="Attachment" className="w-full h-auto" />
                                        </div>
                                    )}
                                </div>
                                {msg.role === 'user' && (
                                    <div className="w-8 h-8 rounded-full bg-indigo-900/50 flex items-center justify-center border border-indigo-500/30 flex-shrink-0 mt-1">
                                        <div className="text-xs font-bold text-indigo-400">YOU</div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                    {isLoading && (
                        <div className="flex gap-4 justify-start">
                            <div className="w-8 h-8 rounded-full bg-cyan-900/50 flex items-center justify-center border border-cyan-500/30 flex-shrink-0">
                                <Shield className="w-4 h-4 text-cyan-400" />
                            </div>
                            <div className="bg-slate-800/50 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-2">
                                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-75"></span>
                                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-150"></span>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Input Area */}
            <div className="p-4 bg-[#0B1120] border-t border-slate-700/50">
                <div className="max-w-4xl mx-auto">
                    {/* Preview URL */}
                    {previewUrl && (
                        <div className="mb-3 inline-flex relative group">
                            <div className="rounded-lg overflow-hidden border border-slate-600 w-24 h-24 relative">
                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                            <button 
                                onClick={clearFile}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex gap-2 sm:gap-3 relative">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-3 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-xl transition-all duration-200 border border-transparent hover:border-slate-700 disabled:opacity-50"
                            disabled={isLoading}
                        >
                            <ImageIcon className="w-6 h-6" />
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept="image/*"
                            className="hidden"
                        />
                        
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Transmit command or visual data query..."
                            className="flex-1 bg-slate-900/50 border border-slate-700 text-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 placeholder-slate-500 transition-all font-mono text-sm"
                            disabled={isLoading}
                        />

                        <button
                            type="submit"
                            disabled={(!input.trim() && !selectedFile) || isLoading}
                            className="bg-cyan-600 hover:bg-cyan-500 text-white p-3 rounded-xl transition-all duration-200 shadow-lg shadow-cyan-900/20 disabled:opacity-50 disabled:grayscale disabled:shadow-none bg-gradient-to-r from-cyan-600 to-blue-600"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </form>
                    <div className="text-[10px] text-slate-600 text-center mt-2 font-mono">
                        PROJECT CHIMERA v1.0 // SECURE CONNECTION
                    </div>
                </div>
            </div>
        </div>
    );
}
