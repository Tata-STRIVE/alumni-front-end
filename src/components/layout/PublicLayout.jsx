import React from 'react';
import { Outlet } from 'react-router-dom';
import PublicHeader from './PublicHeader';
import Footer from './Footer';

/**
 * This component acts as a layout wrapper for all public-facing pages.
 * It renders the header and footer once, and all other pages are rendered
 * inside the <Outlet /> component. This solves the duplicate header issue.
 */
const PublicLayout = () => {
    return (
        <div className="bg-gray-100">
            <PublicHeader />
            <main>
                {/* The Outlet component renders the active child route (e.g., HomePage, SuccessStoriesPage) */}
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default PublicLayout;
