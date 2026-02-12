import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';

export const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Invalid credentials');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-text flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
            {/* Minimalist Background - No Blobs */}

            <GlassCard className="w-full max-w-md relative z-10 border-border bg-surface" noPadding>
                <div className="p-6 md:p-8 text-center border-b border-border">
                    <div className="w-12 h-12 bg-primary text-background rounded-xl mx-auto flex items-center justify-center shadow-none mb-4 md:mb-6">
                        <Lock className="w-6 h-6" />
                    </div>
                    <h2 className="text-lg md:text-xl font-bold text-text">Welcome Back</h2>
                    <p className="text-zinc-500 text-sm mt-1.5">Sign in to access your attendance.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5">
                    {error && (
                        <div className="p-3 bg-red-500/10 text-red-500 text-sm rounded-lg border border-red-500/20">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5 ml-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-black/5 dark:bg-white/5 border border-border rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none text-text placeholder-zinc-400"
                                    placeholder="name@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5 ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-black/5 dark:bg-white/5 border border-border rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none text-text placeholder-zinc-400"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        isLoading={isLoading}
                        className="w-full"
                        size="lg"
                    >
                        Sign In <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </form>

                <div className="p-6 bg-black/5 dark:bg-black/20 border-t border-border text-center text-sm text-zinc-500">
                    Don't have an account?{' '}
                    <Link to="/register" className="font-medium text-text hover:underline">
                        Create Account
                    </Link>
                </div>
            </GlassCard>

            <div className="mt-8 text-zinc-600 text-xs">
                © 2024 Attend Sight. Secure System.
            </div>
        </div>
    );
};
