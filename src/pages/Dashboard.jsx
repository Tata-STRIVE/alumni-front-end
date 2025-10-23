import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Routes, Route } from 'react-router-dom';
import AlumniDashboard from './AlumniDashboard';
import AdminDashboard from './AdminDashboard';
import ConnectionsPage from './ConnectionsPage';
import ProfilePage from './ProfilePage';
import MyApplicationsPage from './MyApplicationsPage'; // NEW: Import the new page
import Header from '../components/layout/Header';

/**
 * This component acts as a router for all pages after a user logs in.
 */
const Dashboard = () => {
    const { user } = useAuth();

    const renderDashboardByRole = () => {
        switch (user.role) {
            case 'ALUMNUS':
                return (
                    <div className="min-h-screen bg-gray-50">
                        <Routes>
                            <Route path="/" element={<AlumniDashboard />} />
                            <Route path="/connections" element={<ConnectionsPage />} />
                            <Route path="/profile" element={<ProfilePage />} />
                            <Route path="/my-applications" element={<MyApplicationsPage />} /> {/* NEW: Add the new route */}
                        </Routes>
                    </div>
                );
            case 'CENTER_ADMIN':
            case 'SUPER_ADMIN':
                return <AdminDashboard role={user.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Center Admin'} />;
            default:
                return <div>Error: Unrecognized user role.</div>;
        }
    };

    return renderDashboardByRole();
};

export default Dashboard;

