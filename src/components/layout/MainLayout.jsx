import React from 'react';
import { Outlet } from 'react-router-dom';
import PublicHeader from './PublicHeader';
import Header from './Header';
import Footer from './Footer';
import { useAuth } from '../../context/AuthContext';
import { Toaster } from 'react-hot-toast'; // Import the Toaster component

/**
 * This component provides the main layout for the entire application.
 * It now includes the Toaster component to enable toast notifications globally.
 */
const MainLayout = () => {
    const { user } = useAuth();

    return (
        <div className="bg-gray-100 min-h-screen flex flex-col">
            {/* Conditionally render the correct header based on login status */}
            {user ? <Header /> : <PublicHeader />}
            
            <main className="flex-grow">
                <Outlet /> 
            </main>
            
            <Footer />
            
            {/* --- NEW: Add the Toaster component here --- */}
            <Toaster 
                position="bottom-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#333',
                        color: '#fff',
                    },
                    success: { iconTheme: { primary: '#28A745', secondary: '#fff' } },
                    error: { iconTheme: { primary: '#DC2626', secondary: '#fff' } },
                }}
            />
        </div>
    );
};

export default MainLayout;

