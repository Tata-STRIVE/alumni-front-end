import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import HomePage from './pages/HomePage';
import SuccessStoriesPage from './pages/SuccessStoriesPage';
import EventsPage from './pages/EventsPage';
import CoursesPage from './pages/CoursesPage';
import RegistrationPage from './pages/RegistrationPage';
import MainLayout from './components/layout/MainLayout'; // Import the main layout

function AppContent() {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return (
        <Routes>
            {/* --- THE ROUTING FIX IS HERE --- */}
            {/* All routes are now nested inside the MainLayout, 
                so the Header and Footer are always present. */}
            <Route element={<MainLayout />}> 
                
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/success-stories" element={<SuccessStoriesPage />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/courses" element={<CoursesPage />} />

                {/* Auth Routes */}
                <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" />} />
                <Route path="/register" element={!user ? <RegistrationPage /> : <Navigate to="/dashboard" />} />

                {/* Protected Dashboard Routes */}
                <Route path="/dashboard/*" element={user ? <Dashboard /> : <Navigate to="/login" />} />
                
                {/* Fallback Redirect */}
                <Route path="*" element={<Navigate to="/" />} />
            </Route>
        </Routes>
    );
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </Router>
    );
}

export default App;

