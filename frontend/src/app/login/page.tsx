'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Terminal, Shield, AlertTriangle } from 'lucide-react';
import axios from 'axios';

interface AuthData {
    email: string;
    password: string;
    name: string;
    confirmPassword: string;
}

export default function LoginPage() {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [authData, setAuthData] = useState<AuthData>({
        email: '',
        password: '',
        name: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (!isLogin && authData.password !== authData.confirmPassword) {
            setError('CREDENTIAL MISMATCH');
            setIsLoading(false);
            return;
        }

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

            if (isLogin) {
                const response = await axios.post(`${apiUrl}/api/auth/login`, {
                    email: authData.email,
                    password: authData.password
                });

                if (response.data.access_token) {
                    localStorage.setItem('token', response.data.access_token);
                    router.push('/dashboard');
                }
            } else {
                await axios.post(`${apiUrl}/api/auth/signup`, {
                    email: authData.email,
                    password: authData.password,
                    full_name: authData.name
                });

                // Auto login after signup
                const loginResponse = await axios.post(`${apiUrl}/api/auth/login`, {
                    email: authData.email,
                    password: authData.password
                });

                if (loginResponse.data.access_token) {
                    localStorage.setItem('token', loginResponse.data.access_token);
                    router.push('/dashboard');
                }
            }
        } catch (err: any) {
            setError(err.response?.data?.detail || 'ACCESS DENIED');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#0B1120] relative overflow-hidden">
            {/* Ambient Backdrops */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-cyan-900/20 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[100px]"></div>
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,23,43,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(18,23,43,0.8)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>
            </div>

            <div className="max-w-md w-full bg-[#0F172A]/80 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-2xl relative z-10">
                {/* Header */}
                <div className="p-8 pb-0 text-center">
                    <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                        <Terminal className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-wider mb-2">PROJECT CHIMERA</h1>
                    <p className="text-xs text-cyan-400 font-mono tracking-[0.2em] uppercase">
                        {isLogin ? 'Secure Uplink Authorization' : 'New Personnel Registration'}
                    </p>
                </div>

                {/* Status Bar */}
                <div className="mt-8 mx-8 py-2 px-4 bg-slate-900/50 rounded-lg border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        <span className="text-[10px] text-slate-400 font-mono uppercase">Status: Code Red</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Shield className="w-3 h-3 text-slate-500" />
                        <span className="text-[10px] text-slate-500 font-mono">ENCRYPTED</span>
                    </div>
                </div>

                {/* Form */}
                <div className="p-8 pt-6">
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                            <p className="text-sm text-red-400 font-mono">{error.toUpperCase()}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Designation</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        type="text"
                                        value={authData.name}
                                        onChange={(e) => setAuthData({ ...authData, name: e.target.value })}
                                        placeholder="Enter Officer Name"
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 pl-10 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all font-mono"
                                        required={!isLogin}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Comms ID (Email)</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="email"
                                    value={authData.email}
                                    onChange={(e) => setAuthData({ ...authData, email: e.target.value })}
                                    placeholder="officer@chimera.space"
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 pl-10 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all font-mono"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Passcode</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="password"
                                    value={authData.password}
                                    onChange={(e) => setAuthData({ ...authData, password: e.target.value })}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 pl-10 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all font-mono"
                                    required
                                />
                            </div>
                        </div>

                        {!isLogin && (
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Confirm Passcode</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        type="password"
                                        value={authData.confirmPassword}
                                        onChange={(e) => setAuthData({ ...authData, confirmPassword: e.target.value })}
                                        placeholder="••••••••"
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 pl-10 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all font-mono"
                                        required={!isLogin}
                                    />
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full mt-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg shadow-cyan-900/20 transform transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide text-sm"
                        >
                            {isLoading ? 'Processing...' : (isLogin ? 'Authenticate' : 'Request Clearance')}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError('');
                                setAuthData({ email: '', password: '', name: '', confirmPassword: '' });
                            }}
                            className="text-xs text-slate-400 hover:text-cyan-400 transition-colors uppercase tracking-wider font-semibold"
                        >
                            {isLogin ? 'Request New Clearance Level' : 'Return to Authentication'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
