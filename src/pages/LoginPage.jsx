import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { requestOtp, verifyOtp } from '../services/apiService';
import { useTranslation } from 'react-i18next'; // Import the hook

/**
 * The final, complete LoginPage component with tenant detection and i18n.
 */
const LoginPage = () => {
    const { t } = useTranslation(); // Initialize the translation function
    const [mode, setMode] = useState('login'); // 'login' or 'otp'
    
    // --- State for tenant detection ---
    const [tenantId, setTenantId] = useState(null);
    const [tenantName, setTenantName] = useState('');
    
    const [mobileNumber, setMobileNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    
    // In a real app, you would fetch tenant details from a public API.
    const tenants = {
        'strive': 'STRIVE Organization',
        'partnera': 'Partner A Foundation'
    };

    // This effect runs once on component mount to determine the tenant from the URL.
    useEffect(() => {
        const hostname = window.location.hostname;
        const parts = hostname.split('.');
        
        let currentTenantId = null;

        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            currentTenantId = 'strive'; // Default for local development
        } else if (parts.length >= 2) {
            currentTenantId = parts[0].toLowerCase();
        }

        if (currentTenantId && tenants[currentTenantId]) {
            setTenantId(currentTenantId); // This will enable the button
            setTenantName(tenants[currentTenantId]);
        } else {
            setError("This organization is not recognized.");
        }
    }, []); // The empty array ensures this runs only on mount

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        if (!tenantId) return;
        setError('');
        setLoading(true);
        try {
            await requestOtp(mobileNumber, tenantId.toUpperCase());
            setMode('otp');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send OTP.');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        if (!tenantId) return;
        setError('');
        setLoading(true);
        try {
            const { data } = await verifyOtp(mobileNumber, tenantId.toUpperCase(), otp);
            login(data.jwt); 
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-strive-blue">
                    STRIVE <span className="text-strive-orange">Connect</span>
                </h2>
                {tenantName && <p className="mt-2 text-center text-md text-gray-700 font-semibold">{tenantName}</p>}
                <p className="mt-2 text-center text-sm text-gray-600">
                   {t('login.welcome')}
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {error && <p className="mb-4 text-center text-sm text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
                    
                    {mode === 'login' ? (
                         <form onSubmit={handleLoginSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">{t('login.mobile_number')}</label>
                                <input 
                                    type="tel" 
                                    id="mobile" 
                                    value={mobileNumber} 
                                    onChange={e => setMobileNumber(e.target.value)} 
                                    required 
                                    disabled={!tenantId} // Button is disabled if tenantId is not set
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-strive-blue focus:border-strive-blue disabled:bg-gray-200" 
                                    placeholder="9876543210" 
                                />
                            </div>
                            <div>
                                <button type="submit" disabled={loading || !tenantId} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-strive-blue hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-strive-blue disabled:bg-gray-400 disabled:cursor-not-allowed">
                                    {loading ? t('login.sending_otp') : t('login.get_otp')}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleOtpSubmit} className="space-y-6">
                             <p className="text-center text-sm text-gray-600">{t('login.otp_sent', { mobileNumber })}</p>
                            <div>
                                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">{t('login.otp_label')}</label>
                                <input type="text" id="otp" value={otp} onChange={e => setOtp(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" placeholder="123456" />
                            </div>
                             <div>
                                <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-strive-green hover:bg-opacity-90 disabled:bg-gray-400">
                                    {loading ? t('login.verifying') : t('login.verify_login')}
                                </button>
                            </div>
                            <button type="button" onClick={() => setMode('login')} className="w-full text-sm text-strive-blue hover:underline text-center">{t('login.back_to_login')}</button>
                        </form>
                    )}
                </div>
                
                <div className="mt-6 text-center text-sm text-gray-600">
                    {t('register.not_member')}{' '}
                    <Link to="/register" className="font-medium text-strive-blue hover:underline">
                        {t('register.register_now')}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;

