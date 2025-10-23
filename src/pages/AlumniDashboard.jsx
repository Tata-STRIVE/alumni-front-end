import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { getJobs, getUpskillingOpportunities, applyForJob, applyForUpskilling, submitJobForVerification } from '../services/apiService';
import PostJobModal from '../components/alumni/PostJobModal';
import toast from 'react-hot-toast'; // Import the toast function
import { useTranslation } from 'react-i18next'; // Import the hook

const AlumniDashboard = () => {
    const { user } = useAuth();
    const { t } = useTranslation(); // Initialize the translation function
    const [jobs, setJobs] = useState([]);
    const [upskilling, setUpskilling] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError('');
            try {
                const [jobsResponse, upskillingResponse] = await Promise.all([ getJobs(), getUpskillingOpportunities() ]);
                setJobs(jobsResponse.data);
                setUpskilling(upskillingResponse.data);
            } catch (err) {
                setError('Failed to load dashboard data.');
                toast.error('Failed to load dashboard data. Please refresh.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleApplyJob = async (jobId) => {
        const toastId = toast.loading(t('toasts.apply_job_loading'));
        try {
            await applyForJob(jobId);
            toast.success(t('toasts.apply_job_success'), { id: toastId });
        } catch (err) {
            const errorMsg = err.response?.data?.error || t('toasts.apply_job_error');
            toast.error(errorMsg, { id: toastId });
        }
    };

    const handleEnrollUpskilling = async (opportunityId) => {
        const toastId = toast.loading(t('toasts.enroll_course_loading'));
        try {
            await applyForUpskilling(opportunityId);
            toast.success(t('toasts.enroll_course_success'), { id: toastId });
        } catch (err) {
            const errorMsg = err.response?.data?.error || t('toasts.enroll_course_error');
            toast.error(errorMsg, { id: toastId });
        }
    };
    
    const handlePostJob = async (jobData) => {
         const toastId = toast.loading(t('toasts.submit_job_loading'));
        try {
            await submitJobForVerification(jobData);
            toast.success(t('toasts.submit_job_success'), { id: toastId });
            setIsPostJobModalOpen(false);
        } catch (err) {
            const errorMsg = err.response?.data?.error || t('toasts.submit_job_error');
            toast.error(errorMsg, { id: toastId });
        }
    };

    if (loading) { /* ... */ }
    if (error && jobs.length === 0) { /* ... */ }

    return (
        <>
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-gradient-to-r from-strive-blue to-blue-700 text-white rounded-lg shadow-lg p-8 mb-8">
                    <h1 className="text-3xl font-bold">{t('alumni_dashboard.welcome_title', { name: user.fullName })}</h1>
                    <p className="mt-2 text-blue-200">{t('alumni_dashboard.welcome_subtitle')}</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                   <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="flex justify-between items-center mb-4 border-b pb-2">
                                <h2 className="text-xl font-semibold text-gray-700">{t('alumni_dashboard.jobs_title')}</h2>
                                <button onClick={() => setIsPostJobModalOpen(true)} className="text-sm bg-strive-blue text-white px-4 py-2 rounded-md font-semibold">
                                    {t('alumni_dashboard.post_job')}
                                </button>
                            </div>
                            <div className="space-y-4">
                                {jobs.length > 0 ? jobs.map(job => (
                                    <div key={job.jobId} className="p-4 border-l-4 border-strive-orange bg-orange-50 rounded-r-lg">
                                        <h3 className="font-bold text-strive-blue">{job.title}</h3>
                                        <p className="text-sm text-gray-600">{job.companyName} - {job.location}</p>
                                        <button onClick={() => handleApplyJob(job.jobId)} className="mt-2 text-sm bg-strive-orange text-white px-4 py-2 rounded-md">{t('alumni_dashboard.apply_now')}</button>
                                    </div>
                                )) : <p className="text-gray-500">{t('alumni_dashboard.no_jobs')}</p>}
                            </div>
                        </div>
                         <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold text-gray-700 mb-4">{t('alumni_dashboard.upskilling_title')}</h2>
                            <div className="space-y-4">
                               {upskilling.length > 0 ? upskilling.map(course => (
                                    <div key={course.opportunityId} className="p-4 border-l-4 border-strive-green bg-green-50 rounded-r-lg">
                                        <h3 className="font-bold text-strive-blue">{course.title}</h3>
                                        <p className="text-sm text-gray-600">{course.description}</p>
                                        <button onClick={() => handleEnrollUpskilling(course.opportunityId)} className="mt-2 text-sm bg-strive-green text-white px-4 py-2 rounded-md">{t('alumni_dashboard.enroll_now')}</button>
                                    </div>
                                )) : <p className="text-gray-500">{t('alumni_dashboard.no_upskilling')}</p>}
                            </div>
                        </div>
                   </div>
                   
                   <div className="space-y-8">
                        <div className="bg-white p-6 rounded-lg shadow-md text-center">
                             <div className="w-24 h-24 rounded-full bg-strive-orange text-white mx-auto mb-4 flex items-center justify-center">
                                <span className="text-4xl font-bold">{user.fullName ? user.fullName.charAt(0) : '?'}</span>
                            </div>
                            <h3 className="font-bold text-xl text-gray-800">{user.fullName || 'Alumnus'}</h3>
                            <p className="text-sm text-gray-500">{user.mobileNumber}</p>
                            <Link to="/dashboard/profile" className="mt-4 w-full block text-center bg-strive-blue text-white py-2 rounded-md text-sm font-semibold">{t('alumni_dashboard.view_profile')}</Link>
                        </div>


                         {/* NEW: My Applications Card */}
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                                <i className="fa fa-file-alt text-gray-500 mr-3"></i>
                                My Applications
                            </h2>
                             <div className="text-sm text-gray-600">Track the status of your job and course applications.</div>
                             <Link to="/dashboard/my-applications" className="mt-4 w-full block text-center bg-strive-green text-white py-2 rounded-md text-sm font-semibold hover:bg-opacity-90">
                                 View My Applications
                             </Link>
                        </div>
                        
                         <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold text-gray-700 mb-4">{t('alumni_dashboard.connections_title')}</h2>
                             <div className="text-sm text-gray-600">{t('alumni_dashboard.pending_requests', { count: 1 })}</div>
                             <Link to="/dashboard/connections" className="mt-4 w-full block text-center bg-strive-blue text-white py-2 rounded-md text-sm font-semibold">{t('alumni_dashboard.manage_connections')}</Link>
                        </div>
                   </div>
                </div>
            </main>
            {isPostJobModalOpen && (
                <PostJobModal 
                    onClose={() => setIsPostJobModalOpen(false)} 
                    onSubmit={handlePostJob} 
                />
            )}
        </>
    );
};

export default AlumniDashboard;

