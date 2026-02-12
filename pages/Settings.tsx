import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import {
    User,
    Shield,
    Mail,
    Loader2,
    CheckCircle2,
    Lock,
    KeyRound,
    AtSign,
    AlertCircle,
    ChevronRight,
    Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type SettingsTab = 'general' | 'security' | 'email';

export const Settings = () => {
    const { user, updateProfile, updatePassword, requestEmailUpdate, verifyEmailUpdate } = useAuth();
    const [activeTab, setActiveTab] = useState<SettingsTab>('general');
    const [isLoading, setIsLoading] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    // Form States
    const [name, setName] = useState(user?.name || '');
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [emailState, setEmailState] = useState({
        newEmail: '',
        otp: '',
        step: 'input' as 'input' | 'verify'
    });

    const clearFeedback = () => setTimeout(() => setFeedback(null), 3000);

    const handleUpdateName = async () => {
        if (!name.trim()) return;
        setIsLoading(true);
        setFeedback(null);
        try {
            await updateProfile(name);
            setFeedback({ type: 'success', message: 'Name updated successfully' });
            clearFeedback();
        } catch (err: any) {
            setFeedback({ type: 'error', message: err.message || 'Failed to update name' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (!passwords.current || !passwords.new || !passwords.confirm) {
            setFeedback({ type: 'error', message: 'Please fill all fields' });
            return;
        }
        if (passwords.new !== passwords.confirm) {
            setFeedback({ type: 'error', message: 'New passwords do not match' });
            return;
        }
        setIsLoading(true);
        setFeedback(null);
        try {
            await updatePassword(passwords.current, passwords.new);
            setFeedback({ type: 'success', message: 'Password updated successfully' });
            setPasswords({ current: '', new: '', confirm: '' });
            clearFeedback();
        } catch (err: any) {
            setFeedback({ type: 'error', message: err.message || 'Failed to update password' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRequestEmailUpdate = async () => {
        if (!emailState.newEmail || !emailState.newEmail.includes('@')) {
            setFeedback({ type: 'error', message: 'Invalid email address' });
            return;
        }
        setIsLoading(true);
        setFeedback(null);
        try {
            await requestEmailUpdate(emailState.newEmail);
            setEmailState(prev => ({ ...prev, step: 'verify' }));
            setFeedback({ type: 'success', message: 'Verification code sent.' });
        } catch (err: any) {
            setFeedback({ type: 'error', message: err.message || 'Failed to send code' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyEmailUpdate = async () => {
        if (!emailState.otp) {
            setFeedback({ type: 'error', message: 'Please enter verification code' });
            return;
        }
        setIsLoading(true);
        setFeedback(null);
        try {
            await verifyEmailUpdate(emailState.otp);
            setEmailState({ newEmail: '', otp: '', step: 'input' });
            setFeedback({ type: 'success', message: 'Email updated successfully' });
            clearFeedback();
        } catch (err: any) {
            setFeedback({ type: 'error', message: err.message || 'Failed to verify email' });
        } finally {
            setIsLoading(false);
        }
    };

    const tabs = [
        { id: 'general', label: 'General', icon: User, desc: 'Profile details' },
        { id: 'security', label: 'Security', icon: Shield, desc: 'Password & protection' },
        { id: 'email', label: 'Email', icon: Mail, desc: 'Contact updates' },
    ];

    return (
        <div className="h-full flex flex-col px-1 pt-1 md:p-8 max-w-6xl mx-auto w-full gap-4 md:gap-8 overflow-hidden">
            <h1 className="text-xl md:text-3xl font-bold text-text tracking-tight shrink-0 px-1">Account Settings</h1>

            <div className="flex flex-col md:flex-row gap-4 md:gap-8 flex-1 min-h-0">
                {/* Mobile: Horizontal Pill Tabs */}
                <div className="md:hidden flex gap-2 overflow-x-auto scrollbar-hide px-1 pb-1 shrink-0">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id as SettingsTab); setFeedback(null); }}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all shrink-0 ${activeTab === tab.id
                                ? 'bg-primary text-background shadow-md'
                                : 'bg-black/5 dark:bg-white/5 text-zinc-500 active:bg-black/10 dark:active:bg-white/10'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Desktop: Sidebar Navigation */}
                <div className="hidden md:flex w-64 flex-col gap-2 shrink-0">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id as SettingsTab); setFeedback(null); }}
                            className={`group w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 border ${activeTab === tab.id
                                ? 'bg-surface border-primary/50 shadow-lg shadow-primary/5'
                                : 'border-transparent hover:bg-white/5 hover:border-white/10'
                                }`}
                        >
                            <div className={`p-2.5 rounded-lg transition-colors ${activeTab === tab.id ? 'bg-primary text-black' : 'bg-surface text-zinc-400 group-hover:text-text'
                                }`}>
                                <tab.icon className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <span className={`block font-semibold text-sm ${activeTab === tab.id ? 'text-text' : 'text-zinc-400 group-hover:text-text'}`}>
                                    {tab.label}
                                </span>
                                <span className="text-xs text-zinc-500">{tab.desc}</span>
                            </div>
                            {activeTab === tab.id && (
                                <ChevronRight className="w-4 h-4 text-primary ml-auto" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 min-w-0 min-h-0 overflow-y-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                            className="h-full"
                        >
                            <GlassCard className="h-fit min-h-[300px] md:min-h-[400px] relative overflow-hidden ring-1 ring-white/10 shadow-2xl">
                                {/* Feedback Toast */}
                                {feedback && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -20, x: "-50%" }}
                                        animate={{ opacity: 1, y: 0, x: "-50%" }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className={`absolute top-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full border flex items-center gap-2 backdrop-blur-xl z-50 shadow-xl max-w-[90%] whitespace-nowrap ${feedback.type === 'success'
                                            ? 'bg-green-500/20 border-green-500/30 text-green-500'
                                            : 'bg-red-500/20 border-red-500/30 text-red-500'
                                            }`}
                                    >
                                        {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                        <span className="text-sm font-medium">{feedback.message}</span>
                                    </motion.div>
                                )}

                                <div className="p-8 md:p-10 max-w-lg mx-auto">
                                    {activeTab === 'general' && (
                                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="relative group cursor-pointer">
                                                    <div className="w-28 h-28 rounded-full bg-surface border-4 border-surface shadow-2xl flex items-center justify-center text-primary overflow-hidden">
                                                        <User className="w-12 h-12" />
                                                    </div>
                                                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Camera className="w-8 h-8 text-white" />
                                                    </div>
                                                </div>
                                                <div className="text-center">
                                                    <h2 className="text-2xl font-bold text-text">{user?.name}</h2>
                                                    <p className="text-zinc-500 mt-1">{user?.email}</p>
                                                    <span className="inline-block mt-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                                                        {user?.role || 'Student'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="space-y-4 pt-4 border-t border-white/5">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Display Name</label>
                                                    <input
                                                        type="text"
                                                        value={name}
                                                        onChange={(e) => setName(e.target.value)}
                                                        className="w-full bg-black/5 dark:bg-white/5 border border-white/10 rounded-xl px-4 py-3 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-black/10 transition-all font-medium"
                                                        placeholder="Enter your name"
                                                    />
                                                </div>

                                                <Button
                                                    className="w-full py-6 text-base shadow-lg shadow-primary/20"
                                                    onClick={handleUpdateName}
                                                    disabled={isLoading || name === user?.name}
                                                >
                                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'security' && (
                                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                            <div>
                                                <h2 className="text-xl font-bold text-text mb-2">Password Settings</h2>
                                                <p className="text-zinc-500 text-sm">Update your password to keep your account secure.</p>
                                            </div>

                                            <div className="space-y-5">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Current Password</label>
                                                    <div className="relative">
                                                        <Lock className="absolute left-4 top-3.5 w-4 h-4 text-zinc-500" />
                                                        <input
                                                            type="password"
                                                            value={passwords.current}
                                                            onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                                            className="w-full bg-black/5 dark:bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-black/10 transition-all"
                                                            placeholder="••••••••"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">New Password</label>
                                                    <div className="relative">
                                                        <KeyRound className="absolute left-4 top-3.5 w-4 h-4 text-zinc-500" />
                                                        <input
                                                            type="password"
                                                            value={passwords.new}
                                                            onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                                            className="w-full bg-black/5 dark:bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-black/10 transition-all"
                                                            placeholder="••••••••"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Confirm Password</label>
                                                    <div className="relative">
                                                        <KeyRound className="absolute left-4 top-3.5 w-4 h-4 text-zinc-500" />
                                                        <input
                                                            type="password"
                                                            value={passwords.confirm}
                                                            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                                            className="w-full bg-black/5 dark:bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-black/10 transition-all"
                                                            placeholder="••••••••"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <Button
                                                className="w-full py-6 shadow-lg shadow-primary/20"
                                                onClick={handleUpdatePassword}
                                                disabled={isLoading}
                                            >
                                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Password'}
                                            </Button>
                                        </div>
                                    )}

                                    {activeTab === 'email' && (
                                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                            <div>
                                                <h2 className="text-xl font-bold text-text mb-2">Email Address</h2>
                                                <p className="text-zinc-500 text-sm">Manage the email address associated with your account.</p>
                                            </div>

                                            {emailState.step === 'input' ? (
                                                <div className="space-y-6">
                                                    <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 flex items-start gap-3">
                                                        <div className="p-2 bg-primary/10 rounded-lg text-primary shrink-0">
                                                            <Mail className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold text-text text-sm">Current Email</h4>
                                                            <p className="text-zinc-500 text-sm mt-0.5">{user?.email}</p>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">New Email Address</label>
                                                        <div className="relative">
                                                            <AtSign className="absolute left-4 top-3.5 w-4 h-4 text-zinc-500" />
                                                            <input
                                                                type="email"
                                                                value={emailState.newEmail}
                                                                onChange={(e) => setEmailState({ ...emailState, newEmail: e.target.value })}
                                                                className="w-full bg-black/5 dark:bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-black/10 transition-all"
                                                                placeholder="name@example.com"
                                                            />
                                                        </div>
                                                    </div>
                                                    <Button
                                                        className="w-full py-6 shadow-lg shadow-primary/20"
                                                        onClick={handleRequestEmailUpdate}
                                                        disabled={isLoading}
                                                    >
                                                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Verification Code'}
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    <div className="text-center space-y-4 p-6 bg-surface/50 rounded-2xl border border-white/5">
                                                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-4 animate-bounce">
                                                            <Mail className="w-8 h-8" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-lg text-text">Verify your email</h3>
                                                            <p className="text-zinc-500 text-sm mt-1">
                                                                Enter the code we sent to <br />
                                                                <span className="font-semibold text-text">{emailState.newEmail}</span>
                                                            </p>
                                                        </div>

                                                        <input
                                                            type="text"
                                                            value={emailState.otp}
                                                            onChange={(e) => setEmailState({ ...emailState, otp: e.target.value })}
                                                            className="w-full bg-black/5 dark:bg-white/10 border border-white/10 rounded-xl px-4 py-4 text-center text-3xl tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                                            placeholder="••••••"
                                                            maxLength={6}
                                                            autoFocus
                                                        />
                                                    </div>

                                                    <div className="flex gap-3">
                                                        <Button
                                                            variant="secondary"
                                                            onClick={() => setEmailState({ ...emailState, step: 'input' })}
                                                            disabled={isLoading}
                                                            className="flex-1 py-4"
                                                        >
                                                            Back
                                                        </Button>
                                                        <Button
                                                            onClick={handleVerifyEmailUpdate}
                                                            disabled={isLoading}
                                                            className="flex-[2] py-4 shadow-lg shadow-primary/20"
                                                        >
                                                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Update'}
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </GlassCard>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
