import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await login(email, password);
            navigate('/');
        } catch {
            setError('Invalid email or password. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-screen w-full">
            {/* Left branding panel */}
            <div className="hidden lg:flex lg:w-2/5 flex-col justify-between p-12 bg-primary relative overflow-hidden">
                {/* Background geometric decoration */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-accent rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent rounded-full translate-y-1/2 -translate-x-1/2" />
                </div>

                <div className="relative z-10">
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-16">
                        <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <span className="text-white font-bold text-2xl tracking-tight">TalentLens</span>
                    </div>

                    <h1 className="text-white text-4xl font-bold leading-tight mb-4">
                        AI-Powered Hiring,<br />Simplified.
                    </h1>
                    <p className="text-slate-400 text-lg leading-relaxed">
                        Screen candidates smarter, faster, and with confidence using Gemini-powered AI scoring.
                    </p>
                </div>

                {/* Bottom stats */}
                <div className="relative z-10 grid grid-cols-2 gap-6">
                    {[
                        { value: '10x', label: 'Faster screening' },
                        { value: '94%', label: 'Accuracy rate' },
                    ].map((stat) => (
                        <div key={stat.label} className="bg-white/5 rounded-xl p-4 border border-white/10">
                            <p className="text-accent font-bold text-2xl">{stat.value}</p>
                            <p className="text-slate-400 text-sm mt-1">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right form panel */}
            <div className="flex-1 flex items-center justify-center p-8 bg-background-light">
                <div className="w-full max-w-md">
                    {/* Mobile logo */}
                    <div className="flex lg:hidden items-center gap-2 mb-8">
                        <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <span className="text-primary font-bold text-xl">TalentLens</span>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
                            <p className="text-slate-500 mt-1">Sign in to your TalentLens account</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Error alert */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm flex items-center gap-2">
                                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
                                    </svg>
                                    {error}
                                </div>
                            )}

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="email">
                                    Email address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@company.com"
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition"
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-sm font-medium text-slate-700" htmlFor="password">
                                        Password
                                    </label>
                                    <Link to="/forgot-password" className="text-sm text-accent hover:text-indigo-700 font-medium transition">
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                                    >
                                        {showPassword ? (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-primary text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    'Sign In'
                                )}
                            </button>
                        </form>

                        <p className="text-center text-sm text-slate-500 mt-6">
                            Don&apos;t have an account?{' '}
                            <Link to="/signup" className="text-accent hover:text-indigo-700 font-semibold transition">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
