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
import AdminJobReviewModal from './AdminJobReviewModal';
import apiClient from '../../services/apiService';

/**
 * Helper function to build the full, absolute URL for a file.
 */
const buildFileUrl = (relativePath) => {
    if (!relativePath) return null;
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
        return relativePath;
    }
    const baseUrl = apiClient.defaults.baseURL.replace('/api', '');
    return `${baseUrl}${relativePath}`;
};

/**
 * Reusable Form for Posting or Editing a Job by an Admin (2-column layout)
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
        if (isEditMode && existingJob) {
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
        <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-xl max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {isEditMode ? 'Edit Job Opening' : 'Post a New Job Opening'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">Job Title</label>
                    <input
                        type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    />
                </div>

                <div>
                    <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Company Name</label>
                    <input
                        type="text" id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    />
                </div>

                <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                    <input
                        type="text" id="location" value={location} onChange={(e) => setLocation(e.target.value)} required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    />
                </div>

                <div>
                    <label htmlFor="hrContactEmail" className="block text-sm font-medium text-gray-700">
                        HR Contact Email <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email" id="hrContactEmail" value={hrContactEmail} onChange={(e) => setHrContactEmail(e.target.value)} required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    />
                </div>

                <div>
                    <label htmlFor="hrContactPhone" className="block text-sm font-medium text-gray-700">
                        HR Contact Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="tel" id="hrContactPhone" value={hrContactPhone} onChange={(e) => setHrContactPhone(e.target.value)} required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    />
                </div>

                <div className="md:col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Job Description</label>
                    <textarea
                        id="description" rows="4" value={description} onChange={(e) => setDescription(e.target.value)} required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    ></textarea>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-2 bg-strive-blue text-white text-sm font-medium rounded-md hover:bg-opacity-90 disabled:bg-gray-400"
                >
                    {isSaving ? 'Saving...' : isEditMode ? 'Save Changes' : 'Post Job'}
                </button>
            </div>
        </form>
    );
};

/**
 * Main Job Management Component
 */
const JobManagement = () => {
    const [activeTab, setActiveTab] = useState('manage');
    const [activeJobs, setActiveJobs] = useState([]);
    const [pendingJobs, setPendingJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Modals
    const [isApplicantsModalOpen, setIsApplicantsModalOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [applicants, setApplicants] = useState([]);
    const [modalLoading, setModalLoading] = useState(false);

    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [selectedReviewJob, setSelectedReviewJob] = useState(null);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedEditJob, setSelectedEditJob] = useState(null);

    // Fetch Data
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [jobsRes, pendingJobsRes] = await Promise.all([
                getJobs(),
                getPendingJobs(),
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
            await updateJobApplicationStatus(applicationId, { status: newStatus });
            setApplicants((prev) =>
                prev.map((app) =>
                    app.applicationId === applicationId ? { ...app, status: newStatus } : app
                )
            );
            toast.success(`Applicant status updated to ${newStatus}.`);
        } catch (err) {
            toast.error('Failed to update applicant status.');
        }
    };

    const handleSubmitReview = async (jobId, reviewData) => {
        setIsSaving(true);
        try {
            await reviewAlumniJob(jobId, reviewData);
            toast.success(`Job ${reviewData.status.toLowerCase()} successfully.`);
            setIsReviewModalOpen(false);
            setSelectedReviewJob(null);
            fetchData();
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
            fetchData();
            setActiveTab('manage');
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
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to update job.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteJob = async (job) => {
        if (window.confirm(`Are you sure you want to delete "${job.title}"?`)) {
            try {
                await deleteJob(job.jobId);
                toast.success('Job deleted successfully.');
                fetchData();
            } catch (err) {
                toast.error(err.response?.data?.error || 'Failed to delete job.');
            }
        }
    };

    // --- Tabs ---
    const getTabClassName = (tabName) => {
        return `${activeTab === tabName
            ? 'border-strive-blue text-strive-blue'
            : 'border-transparent text-gray-500 hover:text-gray-700'
            } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`;
    };

    // --- Table Render ---
    const renderSubContent = () => {
        if (loading) return <div className="p-8 text-center text-gray-500">Loading job data...</div>;
        if (error) return <div className="p-4 bg-red-100 text-red-700 rounded-md">{error}</div>;

        switch (activeTab) {
            case 'manage':
                return (
                    <div className="overflow-x-auto bg-white shadow rounded-lg">
                        <table className="w-full table-fixed text-sm text-left text-gray-600">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th className="w-1/3 px-6 py-3 font-semibold">Job Title / Company</th>
                                    <th className="w-1/3 px-6 py-3 font-semibold">HR Contact</th>
                                    <th className="w-1/3 px-6 py-3 font-semibold text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activeJobs.length > 0 ? (
                                    activeJobs.map((job) => (
                                        <tr key={job.jobId} className="bg-white border-b hover:bg-gray-50">
                                            <td className="px-6 py-4 align-top">
                                                <div className="font-medium text-gray-900">{job.title}</div>
                                                <div className="text-sm text-gray-500">{job.companyName} — {job.location}</div>
                                            </td>
                                            <td className="px-6 py-4 align-top">
                                                <div className="font-medium text-gray-900">{job.hrContactEmail}</div>
                                                <div className="text-sm text-gray-500">{job.hrContactPhone}</div>
                                            </td>
                                            <td className="px-6 py-4 align-top text-center">
                                                <button onClick={() => handleViewApplicants(job)} className="text-strive-blue hover:underline text-xs font-semibold mx-2">Applicants</button>
                                                <button onClick={() => { setSelectedEditJob(job); setIsEditModalOpen(true); }} className="text-strive-orange hover:underline text-xs font-semibold mx-2">Edit</button>
                                                <button onClick={() => handleDeleteJob(job)} className="text-red-600 hover:underline text-xs font-semibold mx-2">Delete</button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="3" className="text-center py-8 text-gray-500">No active jobs found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                );

            case 'verify':
                return (
                    <div className="overflow-x-auto bg-white shadow rounded-lg">
                        <table className="w-full table-fixed text-sm text-left text-gray-600">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th className="w-1/4 px-6 py-3 font-semibold">Job Title / Company</th>
                                    <th className="w-1/4 px-6 py-3 font-semibold">Submitted By</th>
                                    <th className="w-1/4 px-6 py-3 font-semibold">HR Contact</th>
                                    <th className="w-1/4 px-6 py-3 font-semibold text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingJobs.length > 0 ? (
                                    pendingJobs.map((job) => (
                                        <tr key={job.jobId} className="bg-white border-b hover:bg-gray-50">
                                            <td className="px-6 py-4 align-top">
                                                <div className="font-semibold text-gray-900">{job.title}</div>
                                                <div className="text-sm text-gray-500">{job.companyName} — {job.location}</div>
                                            </td>
                                            <td className="px-6 py-4 align-top text-gray-700">{job.authorName || <span className="italic text-gray-400">Unknown</span>}</td>
                                            <td className="px-6 py-4 align-top">
                                                <div className="font-medium text-gray-900">{job.hrContactEmail}</div>
                                                <div className="text-sm text-gray-500">{job.hrContactPhone}</div>
                                            </td>
                                            <td className="px-6 py-4 align-top text-center">
                                                <button
                                                    onClick={() => { setSelectedReviewJob(job); setIsReviewModalOpen(true); }}
                                                    className="bg-strive-blue text-white px-4 py-2 rounded-md text-xs font-semibold hover:bg-opacity-90"
                                                >
                                                    Review
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="4" className="text-center py-8 text-gray-500">No jobs are pending verification.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                );

            case 'post':
                return <JobForm onSave={handlePostJob} isSaving={isSaving} />;

            default:
                return null;
        }
    };

    // --- Render ---
    return (
        <div>
            <div className="mb-6 border-b border-gray-300">
                <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Job Tabs">
                    <button onClick={() => setActiveTab('manage')} className={getTabClassName('manage')}>Manage Jobs</button>
                    <button onClick={() => setActiveTab('verify')} className={getTabClassName('verify')}>Verify Alumni Jobs</button>
                    <button onClick={() => setActiveTab('post')} className={getTabClassName('post')}>Post New Job</button>
                </nav>
            </div>

            {renderSubContent()}

            {isApplicantsModalOpen && (
                <ApplicantsModal
                    job={selectedJob}
                    applicants={applicants}
                    isLoading={modalLoading}
                    onClose={() => setIsApplicantsModalOpen(false)}
                    onUpdateStatus={handleUpdateApplicantStatus}
                />
            )}

            {isReviewModalOpen && (
                <AdminJobReviewModal
                    job={selectedReviewJob}
                    onClose={() => setIsReviewModalOpen(false)}
                    onSubmitReview={handleSubmitReview}
                    isSaving={isSaving}
                />
            )}

            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
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
