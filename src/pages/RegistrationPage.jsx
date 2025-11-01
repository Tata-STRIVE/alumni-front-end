import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { registerAlumnus } from '../services/apiService'; // Removed unused getCourses, getCenters, getBatches
import { useTranslation } from 'react-i18next';

/**
 * Simplified RegistrationPage.
 * Now only collects Full Name, Mobile, and Email.
 * Course/Batch selection is removed.
 */
const RegistrationPage = () => {
    const { t } = useTranslation();
    
    // Form fields
    const [fullName, setFullName] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [email, setEmail] = useState('');

    // Tenant and UI state
    const [tenantId, setTenantId] = useState(null);
    const [tenantName, setTenantName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    
    // This logic remains the same
    const tenants = { 'strive': 'STRIVE Organization', 'partnera': 'Partner A Foundation' };

    // Effect to detect tenant
    useEffect(() => {
        const hostname = window.location.hostname;
        const parts = hostname.split('.');
        let currentTenantId = 'strive'; // Default for localhost
        if (parts.length >= 2 && hostname !== 'localhost' && hostname !== '127.0.0.1') {
            currentTenantId = parts[0].toLowerCase();
        }
        if (tenants[currentTenantId]) {
            setTenantId(currentTenantId);
            setTenantName(tenants[currentTenantId]);
        } else {
            setError("This organization is not recognized.");
        }
    }, []);

    // Removed the useEffect that fetched master data

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Removed !batchId check
        if (!tenantId) {
            setError("Could not identify organization.");
            return;
        }
        
        setLoading(true);
        setError('');
        try {
            // --- UPDATED DATA OBJECT ---
            // Now only sends the required fields.
            // batchId is no longer sent.
            const registrationData = { 
                fullName, 
                mobileNumber, 
                email, 
                tenantId: tenantId.toUpperCase(),
                batchId: null // Send null explicitly
            };
            // --- END OF UPDATE ---

            await registerAlumnus(registrationData);
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    
    // Removed filteredBatches logic

    if (success) {
        return (
            <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
                <div className="text-center bg-white p-10 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold text-strive-green">{t('register.success_title')}</h2>
                    <p className="mt-4 text-gray-600">{t('register.success_message')}</p>
                    <Link to="/login" className="mt-6 inline-block bg-strive-blue text-white px-6 py-2 rounded-md font-semibold hover:bg-opacity-90">
                        {t('register.back_to_login')}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 min-h-screen">
            <div className="flex flex-col justify-center items-center py-12 px-4">
                 <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                    <h2 className="text-3xl font-extrabold text-strive-blue">{t('register.title')}</h2>
                    {tenantName && <p className="mt-2 text-md text-gray-700 font-semibold">{t('register.org_for', { name: tenantName })}</p>}
                </div>
                
                <div className="mt-8 w-full max-w-lg bg-white p-8 rounded-lg shadow-md">
                    {error && <p className="mb-4 text-center text-sm text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* --- Personal Details --- */}
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">{t('register.full_name')}</label>
                            <input type="text" id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700">{t('register.mobile_number')}</label>
                            <input type="tel" id="mobileNumber" value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">{t('register.email')}</label>
                            <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                        </div>
                        
                        {/* --- REMOVED Course, Center, and Batch Selection --- */}

                        <div>
                            {/* Removed !batchId from disabled check */}
                            <button type="submit" disabled={loading || !tenantId} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-strive-orange hover:bg-opacity-90 disabled:bg-gray-400">
                                {loading ? t('register.loading_button') : t('register.submit_button')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegistrationPage;

