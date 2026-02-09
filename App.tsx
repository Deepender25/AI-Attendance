
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './Dashboard';
import { Schedule } from './pages/Schedule';
import { AppShell } from './components/layout/AppShell';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return <div className="p-10 text-center">Loading session...</div>;
    return isAuthenticated ? children : <Navigate to="/login" />;
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <ThemeProvider>
                <Router>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/schedule" element={
                            <PrivateRoute>
                                <AppShell>
                                    <Schedule />
                                </AppShell>
                            </PrivateRoute>
                        } />
                        <Route path="/" element={
                            <PrivateRoute>
                                <AppShell>
                                    <Dashboard />
                                </AppShell>
                            </PrivateRoute>
                        } />
                    </Routes>
                </Router>
            </ThemeProvider>
        </AuthProvider>
    );
};

export default App;
