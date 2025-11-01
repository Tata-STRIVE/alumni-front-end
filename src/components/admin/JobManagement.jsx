import React, { useState, useEffect, useCallback } from 'react';
import {
    getJobs,
    getPendingJobs,
    getJobApplications,
    updateJobApplicationStatus,
    createJobByAdmin,
    updateJob,
    deleteJob,
    reviewAlumniJob
} from '../../services/apiService';
import toast from 'react-hot-toast';
import ApplicantsModal from './ApplicantsModal';
import AdminJobReviewModal from './AdminJobReviewModal'; // Import review modal
import apiClient from '../../services/apiService'; // Import apiClient for base URL

/**
 * Helper function to build the full, absolute URL for a file.
 */
const buildFileUrl = (relativePath) => {
    if (!relativePath) return null;
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
        return relativePath;
    }
    // Assumes apiClient.defaults.baseURL is 'http://localhost:8080/api'
    const baseUrl = apiClient.defaults.baseURL.replace('/api', '');
    return `${baseUrl}${relativePath}`;
};


/**
 * A reusable form for Posting or Editing a job by an Admin.
 */
const JobForm = ({ existingJob, onSave, onCancel, isSaving }) => {
    const [title, setTitle] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [hrContactEmail, setHrContactEmail] = useState('');
    const [hrContactPhone, setHrContactPhone] = useState('');

    const isEditMode = !!existingJob;

    useEffect(() => {
        if (isEditMode) {
            setTitle(existingJob.title || '');
            setCompanyName(existingJob.companyName || '');
            setLocation(existingJob.location || '');
            setDescription(existingJob.description || '');
            setHrContactEmail(existingJob.hrContactEmail || '');
            setHrContactPhone(existingJob.hrContactPhone || '');
        }
    }, [existingJob, isEditMode]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const jobData = { title, companyName, location, description, hrContactEmail, hrContactPhone };
        onSave(jobData);
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-gray-50 rounded-lg border max-w-3xl mx-auto shadow">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">
                {isEditMode ? 'Edit Job Opening' : 'Post a New Job Opening'}
            </h3>
            <div className="space-y-4">
                {/* Job Title */}
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">Job Title</label>
                    <input
                        type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    />
                </div>
                {/* Company Name */}
                <div>
                    <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Company Name</label>
                    <input
                        type="text" id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    />
                </div>
                {/* Location */}
                <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location (e.g., City, State)</label>
                    <input
                        type="text" id="location" value={location} onChange={(e) => setLocation(e.target.value)} required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    />
                </div>
                
                {/* HR Contact Email */}
                <div>
                    <label htmlFor="hrContactEmail" className="block text-sm font-medium text-gray-700">HR Contact Email <span className="text-red-500">*</span></label>
                    <input
                        type="email" id="hrContactEmail" value={hrContactEmail} onChange={(e) => setHrContactEmail(e.target.value)} required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    />
                </div>
                {/* HR Contact Phone */}
                <div>
                    <label htmlFor="hrContactPhone" className="block text-sm font-medium text-gray-700">HR Contact Phone <span className="text-red-500">*</span></label>
                    <input
                        type="tel" id="hrContactPhone" value={hrContactPhone} onChange={(e) => setHrContactPhone(e.target.value)} required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    />
                </div>
                
                {/* Description */}
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Job Description</label>
                    <textarea
                        id="description" rows="6" value={description} onChange={(e) => setDescription(e.target.value)} required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    ></textarea>
                </div>
                {/* Buttons */}
                <div className="text-right pt-2 flex justify-end space-x-3">
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="inline-flex justify-center py-2 px-6 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-strive-blue hover:bg-opacity-90 disabled:bg-gray-400"
                    >
                        {isSaving ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Post Job')}
                    </button>
                </div>
            </div>
        </form>
    );
};


/**
 * The main Job Management Hub component.
 */
const JobManagement = () => {
    const [activeTab, setActiveTab] = useState('manage');
    const [activeJobs, setActiveJobs] = useState([]);
    const [pendingJobs, setPendingJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Modal States
    const [isApplicantsModalOpen, setIsApplicantsModalOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null); // For View Applicants
    const [applicants, setApplicants] = useState([]);
    const [modalLoading, setModalLoading] = useState(false);

    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [selectedReviewJob, setSelectedReviewJob] = useState(null); // For Review

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedEditJob, setSelectedEditJob] = useState(null); // For Edit

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            // Use the new status-based admin endpoints
            const [jobsRes, pendingJobsRes] = await Promise.all([
                getJobs(), // Fetches ACTIVE jobs
                getPendingJobs(), // Fetches PENDING_APPROVAL jobs
            ]);
            setActiveJobs(jobsRes.data || []);
            setPendingJobs(pendingJobsRes.data || []);
        } catch (err) {
            setError('Failed to load job data.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- Handlers ---
    const handleViewApplicants = async (job) => {
        setSelectedJob(job);
        setIsApplicantsModalOpen(true);
        setModalLoading(true);
        try {
            const response = await getJobApplications(job.jobId);
            setApplicants(response.data);
        } catch (err) {
            toast.error('Failed to load applicants for this job.');
        } finally {
            setModalLoading(false);
        }
    };

    const handleUpdateApplicantStatus = async (applicationId, newStatus) => {
        try {
            console.log('Updating applicant status:==>>>', applicationId, newStatus);
            await updateJobApplicationStatus(applicationId, { status: newStatus });
                        console.log('Updating applicant status : updateJobApplicationStatus==>>>', applicationId, newStatus);

            setApplicants(prev => prev.map(app =>
                app.applicationId === applicationId ? { ...app, status: newStatus } : app
            ));
            toast.success(`Applicant status updated to ${newStatus}.`);
        } catch (err) {
            toast.error('Failed to update applicant status.',err);
        }
    };

    const handleSubmitReview = async (jobId, reviewData) => {
        setIsSaving(true);
        try {
            await reviewAlumniJob(jobId, reviewData);
            toast.success(`Job ${reviewData.status.toLowerCase()} successfully.`);
            setIsReviewModalOpen(false);
            setSelectedReviewJob(null);
            fetchData(); // Refresh lists
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to submit review.');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePostJob = async (jobData) => {
        setIsSaving(true);
        try {
            await createJobByAdmin(jobData);
            toast.success('Job posted successfully!');
            fetchData(); // Refresh lists
            setActiveTab('manage'); // Switch to manage tab
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to post job.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleEditJob = async (jobData) => {
        if (!selectedEditJob) return;
        setIsSaving(true);
        try {
            await updateJob(selectedEditJob.jobId, jobData);
            toast.success('Job updated successfully!');
            setIsEditModalOpen(false);
            setSelectedEditJob(null);
            fetchData(); // Refresh lists
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to update job.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteJob = async (job) => {
        if (window.confirm(`Are you sure you want to delete the job: "${job.title}"? This action cannot be undone.`)) {
            try {
                await deleteJob(job.jobId);
                toast.success('Job deleted successfully.');
                fetchData(); // Refresh lists
            } catch (err) {
                toast.error(err.response?.data?.error || 'Failed to delete job.');
            }
        }
    };

    // --- Render Logic ---
    const renderSubContent = () => {
        if (loading) return <div className="p-8 text-center text-gray-500">Loading job data...</div>;
        if (error) return <div className="p-4 bg-red-100 text-red-700 rounded-md">{error}</div>;

        switch (activeTab) {
            case 'manage':
                return (
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Job Title / Company</th>
                                <th scope="col" className="px-6 py-3">HR Contact</th>
                                <th scope="col" className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activeJobs.length > 0 ? activeJobs.map(job => (
                                <tr key={job.jobId} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{job.title}</div>
                                        <div className="text-sm text-gray-500">{job.companyName} - {job.location}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{job.hrContactEmail}</div>
                                        <div className="text-sm text-gray-500">{job.hrContactPhone}</div>
                                    </td>
                                    <td className="px-6 py-4 space-x-2 whitespace-nowrap">
                                        <button onClick={() => handleViewApplicants(job)} className="text-strive-blue hover:underline text-xs font-semibold">Applicants</button>
                                        <button onClick={() => { setSelectedEditJob(job); setIsEditModalOpen(true); }} className="text-strive-orange hover:underline text-xs font-semibold">Edit</button>
                                        <button onClick={() => handleDeleteJob(job)} className="text-red-600 hover:underline text-xs font-semibold">Delete</button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="3" className="text-center py-8 text-gray-500">No active jobs found.</td></tr>
                            )}
                        </tbody>
                    </table>
                );
            case 'verify':
                return (
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Job Title / Company</th>
                                <th scope="col" className="px-6 py-3">Submitted By</th>
                                <th scope="col" className="px-6 py-3">HR Contact</th>
                                <th scope="col" className="px-6 py-3">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingJobs.length > 0 ? pendingJobs.map(job => (
                                <tr key={job.jobId} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-gray-900">{job.title}</div>
                                        <div className="text-sm text-gray-500">{job.companyName}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{job.authorName}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{job.hrContactEmail}</div>
                                        <div className="text-sm text-gray-500">{job.hrContactPhone}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => { setSelectedReviewJob(job); setIsReviewModalOpen(true); }} className="bg-strive-blue text-white px-4 py-2 rounded-md text-xs font-semibold hover:bg-opacity-90">
                                            Review
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="4" className="text-center py-8 text-gray-500">No jobs are pending verification.</td></tr>
                            )}
                        </tbody>
                    </table>
                );
            case 'post':
                return <JobForm onSave={handlePostJob} isSaving={isSaving} />;
            default:
                return null;
        }
    };

    const getTabClassName = (tabName) => {
        return `${activeTab === tabName ? 'border-strive-blue text-strive-blue' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`;
    };

    return (
        <div>
            {/* Sub-navigation */}
            <div className="mb-6 border-b border-gray-300">
                <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Job Tabs">
                    <button onClick={() => setActiveTab('manage')} className={getTabClassName('manage')}>Manage Jobs</button>
                    <button onClick={() => setActiveTab('verify')} className={getTabClassName('verify')}>Verify Alumni Jobs</button>
                    <button onClick={() => setActiveTab('post')} className={getTabClassName('post')}>Post New Job</button>
                </nav>
            </div>

            {renderSubContent()}

            {/* Modal for viewing applicants */}
            {isApplicantsModalOpen && (
                <ApplicantsModal
                    job={selectedJob}
                    applicants={applicants}
                    isLoading={modalLoading}
                    onClose={() => setIsApplicantsModalOpen(false)}
                    onUpdateStatus={handleUpdateApplicantStatus}
                />
            )}

            {/* Modal for reviewing alumni jobs */}
            {isReviewModalOpen && (
                <AdminJobReviewModal
                    job={selectedReviewJob}
                    onClose={() => setIsReviewModalOpen(false)}
                    onSubmitReview={handleSubmitReview}
                    isSaving={isSaving}
                />
            )}

            {/* Modal for editing an existing job */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-xl">
                        <JobForm
                            existingJob={selectedEditJob}
                            onSave={handleEditJob}
                            onCancel={() => setIsEditModalOpen(false)}
                            isSaving={isSaving}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobManagement;

