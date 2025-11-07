import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

import { 
    getJobs, 
    getUpskillingOpportunities, 
    applyForJob, 
    applyForUpskilling, 
    submitJobForVerification,
    getMyProfile,
    getMyPostedJobs 
} from '../services/apiService';
import PostJobModal from '../components/alumni/PostJobModal';
import toast from 'react-hot-toast'; 
import { useTranslation } from 'react-i18next'; 
import { buildFileUrl } from '../utils/fileUrl'; 
// import JobApplyModal from '../components/alumni/JobApplyModal'; // <-- REMOVED

const AlumniDashboard = () => {
    const { user } = useAuth();
    const { t } = useTranslation(); 
    const [jobs, setJobs] = useState([]);
    const [upskilling, setUpskilling] = useState([]);
    const [myPostedJobs, setMyPostedJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);
    const [profile, setProfile] = useState(null); 

    // --- REMOVED MODAL STATE ---
    // const [selectedJob, setSelectedJob] = useState(null);
    // const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError('');
            try {
                const [jobsResponse, profileRes, upskillingResponse, myPostsRes] = await Promise.all([ 
                    getJobs(),
                    getMyProfile(),
                    getUpskillingOpportunities(),
                    getMyPostedJobs()
                ]);
                
                setJobs(jobsResponse.data);
                setProfile(profileRes.data); 
                setUpskilling(upskillingResponse.data);
                setMyPostedJobs(myPostsRes.data);
            } catch (err) {
                setError('Failed to load dashboard data.');
                toast.error('Failed to load dashboard data. Please refresh.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // --- REVERTED TO SIMPLER APPLY JOB HANDLER ---
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
    
    // --- Other Handlers (Enroll, Post Job) ---
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
            // Refresh my posted jobs
            const myPostsRes = await getMyPostedJobs();
            setMyPostedJobs(myPostsRes.data);
        } catch (err) {
            const errorMsg = err.response?.data?.error || t('toasts.submit_job_error');
            toast.error(errorMsg, { id: toastId });
        }
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'ACTIVE': return 'text-green-600'; // Changed from OPEN
            case 'PENDING_APPROVAL': return 'text-yellow-600';
            case 'REJECTED': return 'text-red-600';
            case 'CLOSED': return 'text-gray-500';
            default: return 'text-gray-600';
        }
    };

    if (loading) return <div className="text-center py-10 text-gray-500">Loading dashboard...</div>;
    
    const photoSrc = profile ? buildFileUrl(profile.profilePictureUrl) : null;
    const initial = user.fullName ? user.fullName.charAt(0) : '?';

    return (
        <>
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                
                {/* Profile Completeness Card */}
                {profile && profile.completeness < 100 && (
                     <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 rounded-lg shadow-lg p-6 mb-8">
                        <h2 className="text-xl font-bold">Complete Your Profile!</h2>
                        <p className="mt-2 text-sm">Your profile is <strong>{profile.completeness}%</strong> complete. A complete profile helps you connect with more opportunities.</p>
                        <div className="w-full bg-yellow-200 rounded-full h-2.5 mt-3">
                            <div className="bg-strive-orange h-2.5 rounded-full" style={{ width: `${profile.completeness}%` }}></div>
                        </div>
                        <Link to="/dashboard/profile" className="mt-4 inline-block text-sm bg-strive-orange text-white px-4 py-2 rounded-md font-semibold hover:bg-opacity-90">
                            Update Profile Now
                        </Link>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                   <div className="lg:col-span-2 space-y-8">
                        {/* Job Opportunities */}
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="flex justify-between items-center mb-4 border-b pb-2">
                                <h2 className="text-xl font-semibold text-gray-700">{t('alumni_dashboard.jobs_title')}</h2>
                                <button onClick={() => setIsPostJobModalOpen(true)} className="text-sm bg-strive-blue text-white px-4 py-2 rounded-md font-semibold">
                                    {t('alumni_dashboard.post_job')}
                                </button>
                            </div>
                            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                                {error && <p className="text-red-500">{error}</p>}
                                {jobs.length > 0 ? jobs.map(job => (
                                    <div key={job.jobId} className="p-4 border-l-4 border-strive-orange bg-orange-50 rounded-r-lg">
                                        <h3 className="font-bold text-strive-blue">{job.title}</h3>
                                        <p className="text-sm text-gray-600">{job.companyName} - {job.location}</p>
                                        {/* --- UPDATED BUTTON onClick --- */}
                                        <button onClick={() => handleApplyJob(job.jobId)} className="mt-2 text-sm bg-strive-orange text-white px-4 py-2 rounded-md">{t('alumni_dashboard.apply_now')}</button>
                                    </div>
                                )) : <p className="text-gray-500">{t('alumni_dashboard.no_jobs')}</p>}
                            </div>
                        </div>

                        {/* My Job Posts */}
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">My Submitted Jobs</h2>
                            <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                                {myPostedJobs.length > 0 ? myPostedJobs.map(job => (
                                    <div key={job.jobId} className="p-4 border-l-4 border-gray-200 rounded-r-lg">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-gray-800">{job.title}</h3>
                                                <p className="text-sm text-gray-600">{job.companyName}</p>
                                            </div>
                                            <span className={`text-sm font-semibold ${getStatusColor(job.status)}`}>
                                                {job.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                        {job.status === 'REJECTED' && job.rejectionRemarks && (
                                            <p className="text-xs text-red-600 mt-2"><strong>Admin Remarks:</strong> {job.rejectionRemarks}</p>
                                        )}
                                    </div>
                                )) : <p className="text-gray-500">You have not posted any jobs for verification.</p>}
                            </div>
                        </div>
                        
                         {/* Upskilling Courses */}
                         <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold text-gray-700 mb-4">{t('alumni_dashboard.upskilling_title')}</h2>
                            <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
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
                   
                   {/* Profile & Navigation Column */}
                   <div className="space-y-8">
                        <div className="bg-white p-6 rounded-lg shadow-md text-center">
                             <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden bg-gray-200 text-gray-500 border border-gray-300">
                                {photoSrc ? (
                                    <img src={photoSrc} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-4xl font-bold">{initial}</span>
                                )}
                            </div>
                            <h3 className="font-bold text-xl text-gray-800">{user.fullName || 'Alumnus'}</h3>
                            <p className="text-sm text-gray-500">{user.mobileNumber}</p>
                            <Link to="/dashboard/profile" className="mt-4 w-full block text-center bg-strive-blue text-white py-2 rounded-md text-sm font-semibold">{t('alumni_dashboard.view_profile')}</Link>
                        </div>

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
            
            {/* --- Modals --- */}
            {isPostJobModalOpen && (
                <PostJobModal 
                    onClose={() => setIsPostJobModalOpen(false)} 
                    onSubmit={handlePostJob} 
                />
            )}
            
            {/* --- REMOVED JobApplyModal --- */}
        </>
    );
};

export default AlumniDashboard;

