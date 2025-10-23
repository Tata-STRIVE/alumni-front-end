import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { registerAlumnus, getCourses, getCenters, getBatches } from '../services/apiService';
import { useTranslation } from 'react-i18next';

/**
 * The final, complete RegistrationPage.
 * Now fetches master data (courses, centers, batches) from the backend
 * and displays them as dependent dropdowns for selection.
 */
const RegistrationPage = () => {
    const { t } = useTranslation();
    
    // Form fields
    const [fullName, setFullName] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [email, setEmail] = useState('');
    const [batchId, setBatchId] = useState(''); // Store the selected batch ID

    // Data for dropdowns
    const [courses, setCourses] = useState([]);
    const [centers, setCenters] = useState([]);
    const [batches, setBatches] = useState([]);
    
    // State for filtering
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedCenter, setSelectedCenter] = useState('');

    // Tenant and UI state
    const [tenantId, setTenantId] = useState(null);
    const [tenantName, setTenantName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    
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

    // Effect to fetch master data (courses, centers, batches)
    useEffect(() => {
        if (!tenantId) return; // Don't fetch until tenant is known
        
        const fetchMasterData = async () => {
            try {
                // Fetch all data concurrently
                const [coursesRes, centersRes, batchesRes] = await Promise.all([
                    getCourses(),
                    getCenters(),
                    getBatches()
                ]);
                setCourses(coursesRes.data);
                setCenters(centersRes.data);
                setBatches(batchesRes.data);
            } catch (err) {
                setError("Failed to load registration data. Please try again later.");
            }
        };
        fetchMasterData();
    }, [tenantId]); // Re-run if tenantId changes


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!tenantId || !batchId) {
            setError("Please select your course, center, and batch.");
            return;
        }
        
        setLoading(true);
        setError('');
        try {
            const registrationData = { 
                fullName, 
                mobileNumber, 
                email, 
                tenantId: tenantId.toUpperCase(),
                batchId: parseInt(batchId)
            };
            await registerAlumnus(registrationData);
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    
    // Filter batches based on selected course and center
    const filteredBatches = batches.filter(batch => {
        // Find the full course and center objects to get their names
        const course = courses.find(c => c.courseId === batch.courseId);
        const center = centers.find(c => c.centerId === batch.centerId);

        const courseMatch = !selectedCourse || (course && course.name === selectedCourse);
        const centerMatch = !selectedCenter || (center && center.name === selectedCenter);
        return courseMatch && centerMatch;
    });

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
            {/* Note: This page does not use the MainLayout, so it needs its own Header/Footer */}
            {/* Or, if you moved it inside the layout in App.jsx, you can remove these. */}
            
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
                        
                        {/* --- Course, Center, and Batch Selection --- */}
                        <div>
                            <label htmlFor="course" className="block text-sm font-medium text-gray-700">Course</label>
                            <select id="course" value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
                                <option value="">Select your course</option>
                                {courses.map(course => (
                                    <option key={course.courseId} value={course.name}>{course.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="center" className="block text-sm font-medium text-gray-700">Center</label>
                            <select id="center" value={selectedCenter} onChange={e => setSelectedCenter(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
                                <option value="">Select your center</option>
                                {centers.map(center => (
                                    <option key={center.centerId} value={center.name}>{center.name} - {center.city}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="batch" className="block text-sm font-medium text-gray-700">Batch</label>
                            <select id="batch" value={batchId} onChange={e => setBatchId(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" disabled={!selectedCourse || !selectedCenter}>
                                <option value="">Select your batch</option>
                                {filteredBatches.map(batch => (
                                    <option key={batch.batchId} value={batch.batchId}>
                                        {/* We assume batch DTO has these names, we may need to adjust BatchDto/Service */}
                                        {courses.find(c => c.courseId === batch.courseId)?.name} - {centers.find(c => c.centerId === batch.centerId)?.name} ({batch.startYear})
                                    </option>
                                ))}
                            </select>
                            {selectedCourse && selectedCenter && filteredBatches.length === 0 && (
                                <p className="mt-2 text-xs text-red-600">No matching batches found. Please check your course and center selection.</p>
                            )}
                        </div>

                        <div>
                            <button type="submit" disabled={loading || !tenantId || !batchId} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-strive-orange hover:bg-opacity-90 disabled:bg-gray-400">
                                {loading ? t('register.loading_button') : t('register.submit_button')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            {/* <Footer /> */}
        </div>
    );
};

export default RegistrationPage;

