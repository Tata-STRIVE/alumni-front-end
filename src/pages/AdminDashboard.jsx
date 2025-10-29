import React, { useState, useEffect } from 'react';
import {
    getPendingApprovals, approveUser,
    getJobs, getJobApplications, updateJobApplicationStatus,
    getPendingJobs, approveJob,
    getPendingEmploymentHistory, verifyEmploymentRecord,
    getTotalAlumniCount
} from '../services/apiService';
// AdminHeader import is removed as confirmed
import StatCard from '../components/admin/StatCard';
import ApplicantsModal from '../components/admin/ApplicantsModal';
import ContentManagement from '../components/admin/ContentManagement'; // Import the ContentManagement component

const AdminDashboard = ({ role }) => {
    // Add 'content_management' to the possible states
    const [activeTab, setActiveTab] = useState('approvals');
    const [pendingUsers, setPendingUsers] = useState([]);
    const [pendingJobs, setPendingJobs] = useState([]);
    const [pendingHistory, setPendingHistory] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const [alumniCount, setAlumniCount] = useState(0);

    // State for the applicants modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [applicants, setApplicants] = useState([]);
    const [modalLoading, setModalLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const [usersRes, jobsRes, pendingJobsRes, pendingHistoryRes, countRes] = await Promise.all([
                getPendingApprovals(),
                getJobs(), // Using getJobs as per your apiService.jsx
                getPendingJobs(),
                getPendingEmploymentHistory(),
                getTotalAlumniCount()
            ]);
            setPendingUsers(usersRes.data);
            setJobs(jobsRes.data);
            setPendingJobs(pendingJobsRes.data);
            setPendingHistory(pendingHistoryRes.data);
            setAlumniCount(countRes.data.count);
        } catch (err) {
            setError('Failed to load dashboard data.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // --- Handler functions (handleApproveUser, handleApproveJob, handleApproveHistory, handleViewApplicants, handleUpdateApplicantStatus) remain the same ---
     const handleApproveUser = async (userId) => {
        try {
            await approveUser(userId);
            setMessage('User approved successfully!');
            fetchData(); // Refetch all data to update the lists
            setTimeout(() => setMessage(''), 3000);
        } catch (err) { setError('Failed to approve user.'); }
    };

    // Handler for approving a pending job
    const handleApproveJob = async (jobId) => {
        try {
            await approveJob(jobId);
            setMessage('Job approved successfully and is now live!');
            fetchData(); // Refetch all data
            setTimeout(() => setMessage(''), 3000);
        } catch (err) { setError('Failed to approve job.'); }
    };

    // Handler for approving pending employment history
    const handleApproveHistory = async (historyId) => {
        try {
            await verifyEmploymentRecord(historyId);
            setMessage('Employment record verified successfully!');
            fetchData(); // Refetch all data
            setTimeout(() => setMessage(''), 3000);
        } catch (err) { setError('Failed to verify record.'); }
    };

    // Handler for opening the applicants modal
    const handleViewApplicants = async (job) => {
        setSelectedJob(job);
        setIsModalOpen(true);
        setModalLoading(true);
        try {
            const response = await getJobApplications(job.jobId);
            setApplicants(response.data);
        } catch (err) { setError('Failed to load applicants for this job.'); }
        finally { setModalLoading(false); }
    };

    // Handler for updating an applicant's status from the modal
    const handleUpdateApplicantStatus = async (applicationId, newStatus) => {
        try {
            // Pass status in the expected object format based on API doc
            await updateJobApplicationStatus(applicationId, { status: newStatus });
            setApplicants(prev => prev.map(app => app.applicationId === applicationId ? { ...app, status: newStatus } : app));
             setMessage(`Applicant status updated to ${newStatus}.`); // Provide feedback
             setTimeout(() => setMessage(''), 3000);
        } catch (err) { setError('Failed to update applicant status.'); }
    };


    // Renders the content for the currently active tab
    const renderContent = () => {
        if (loading) return <div className="p-8 text-center text-gray-500">Loading content...</div>;
        if (error) return <div className="p-4 bg-red-100 text-red-700 rounded-md">{error}</div>;

        switch (activeTab) {
            case 'approvals':
                return (
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Full Name</th>
                                <th scope="col" className="px-6 py-3">Mobile Number</th>
                                <th scope="col" className="px-6 py-3">Email</th>
                                <th scope="col" className="px-6 py-3">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingUsers.length > 0 ? pendingUsers.map(pUser => (
                                <tr key={pUser.userId} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{pUser.fullName}</td>
                                    <td className="px-6 py-4">{pUser.mobileNumber}</td>
                                    <td className="px-6 py-4">{pUser.email}</td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => handleApproveUser(pUser.userId)} className="bg-strive-green text-white px-3 py-1 rounded-md text-xs font-medium hover:bg-opacity-90">Approve</button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="4" className="text-center py-8 text-gray-500">No pending user approvals.</td></tr>
                            )}
                        </tbody>
                    </table>
                );
            case 'job_verifications':
                 return (
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Job Title & Company</th>
                                <th scope="col" className="px-6 py-3">Submitted By</th>
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
                                        <button onClick={() => handleApproveJob(job.jobId)} className="bg-strive-green text-white px-4 py-2 rounded-md text-xs font-semibold hover:bg-opacity-90">Approve Job</button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="3" className="text-center py-8 text-gray-500">No jobs are pending verification.</td></tr>
                            )}
                        </tbody>
                    </table>
                );
            case 'employment_verification':
                 return (
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Alumnus Name</th>
                                <th scope="col" className="px-6 py-3">Company & Role</th>
                                <th scope="col" className="px-6 py-3">Date</th>
                                <th scope="col" className="px-6 py-3">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingHistory.length > 0 ? pendingHistory.map(hist => (
                                <tr key={hist.employmentId} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{hist.authorName}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-gray-900">{hist.jobTitle}</div>
                                        <div className="text-sm text-gray-500">{hist.companyName}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{hist.startDate}</td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => handleApproveHistory(hist.employmentId)} className="bg-strive-green text-white px-4 py-2 rounded-md text-xs font-semibold hover:bg-opacity-90">Verify</button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="4" className="text-center py-8 text-gray-500">No employment records are pending verification.</td></tr>
                            )}
                        </tbody>
                    </table>
                );
            case 'jobs':
                return (
                     <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Job Title</th>
                                <th scope="col" className="px-6 py-3">Company</th>
                                <th scope="col" className="px-6 py-3">Location</th>
                                <th scope="col" className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {jobs.map(job => (
                                <tr key={job.jobId} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{job.title}</td>
                                    <td className="px-6 py-4">{job.companyName}</td>
                                    <td className="px-6 py-4">{job.location}</td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => handleViewApplicants(job)} className="text-strive-blue hover:underline text-xs font-semibold">View Applicants</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            // --- NEW CASE ---
            case 'content_management':
                return <ContentManagement />; // Render the imported component
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* AdminHeader component is removed */}
            <main className="container mx-auto px-6 py-8">
                {/* Stat Card Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                   <StatCard icon="fa-users" title="Total Alumni" value={loading ? '...' : alumniCount} />
                   <StatCard icon="fa-user-plus" title="User Approvals" value={loading ? '...' : pendingUsers.length} />
                   <StatCard icon="fa-hourglass-half" title="Pending Jobs" value={loading ? '...' : pendingJobs.length} />
                   <StatCard icon="fa-id-card-clip" title="Pending History" value={loading ? '...' : pendingHistory.length} />
                   <StatCard icon="fa-check-double" title="Active Jobs" value={loading ? '...' : jobs.length} />
                </div>

                {message && <div className="bg-green-100 text-green-700 p-3 rounded-md mb-6">{message}</div>}

                {/* Tab Navigation */}
                <div className="bg-white rounded-lg shadow-md">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-6 px-6 overflow-x-auto" aria-label="Tabs">
                            <button onClick={() => setActiveTab('approvals')} className={`${activeTab === 'approvals' ? 'border-strive-blue text-strive-blue' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>User Approvals</button>
                            <button onClick={() => setActiveTab('job_verifications')} className={`${activeTab === 'job_verifications' ? 'border-strive-blue text-strive-blue' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Job Verifications</button>
                            <button onClick={() => setActiveTab('employment_verification')} className={`${activeTab === 'employment_verification' ? 'border-strive-blue text-strive-blue' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>History Verifications</button>
                            <button onClick={() => setActiveTab('jobs')} className={`${activeTab === 'jobs' ? 'border-strive-blue text-strive-blue' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Job Management</button>
                            {/* --- NEW TAB BUTTON --- */}
                            <button onClick={() => setActiveTab('content_management')} className={`${activeTab === 'content_management' ? 'border-strive-blue text-strive-blue' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Content Management</button>
                        </nav>
                    </div>
                    <div className="p-6">
                        {renderContent()}
                    </div>
                </div>
            </main>
            {isModalOpen && (
                <ApplicantsModal
                    job={selectedJob}
                    applicants={applicants}
                    isLoading={modalLoading}
                    onClose={() => setIsModalOpen(false)}
                    onUpdateStatus={handleUpdateApplicantStatus}
                />
            )}
        </div>
    );
};

export default AdminDashboard;

