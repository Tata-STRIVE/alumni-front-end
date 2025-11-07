import React, { useState, useEffect } from 'react';
import {
    getPendingApprovals, 
    approveUser,
    getPendingEmploymentHistory, 
    reviewEmploymentRecord,
    getTotalAlumniCount
} from '../services/apiService';
import StatCard from '../components/admin/StatCard';
import ContentManagement from '../components/admin/ContentManagement';
import AdminHistoryReviewModal from '../components/admin/AdminHistoryReviewModal';
import JobManagement from '../components/admin/JobManagement'; // --- 1. IMPORT THE NEW HUB ---
import UpskillingManagement from '../components/admin/UpskillingManagement';
import toast from 'react-hot-toast'; 

const AdminDashboard = ({ role }) => {
    const [activeTab, setActiveTab] = useState('approvals');
    
    // --- All Job State has been removed ---
    
    const [pendingUsers, setPendingUsers] = useState([]);
    const [pendingHistory, setPendingHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [alumniCount, setAlumniCount] = useState(0);

    // State for History Review Modal
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            // --- All Job API calls have been removed ---
            const [usersRes, pendingHistoryRes, countRes] = await Promise.all([
                getPendingApprovals(),
                getPendingEmploymentHistory(),
                getTotalAlumniCount()
            ]);
            setPendingUsers(usersRes.data);
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

    // --- Handler functions ---
    const handleApproveUser = async (userId) => {
        try {
            await approveUser(userId);
            toast.success('User approved successfully!'); 
            fetchData(); 
        } catch (err) { toast.error('Failed to approve user.'); }
    };

    // --- All Job Handlers have been removed ---

    const handleViewHistoryItem = (historyItem) => {
        setSelectedHistoryItem(historyItem);
        setIsHistoryModalOpen(true);
    };

    const handleReviewHistory = async (historyId, reviewData) => {
        try {
            await reviewEmploymentRecord(historyId, reviewData);
            toast.success(`Record ${reviewData.status.toLowerCase()} successfully.`);
            setIsHistoryModalOpen(false);
            setSelectedHistoryItem(null);
            fetchData(); 
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to submit review.');
        }
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
            case 'employment_verification':
                 return (
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Alumnus Name</th>
                                <th scope="col" className="px-6 py-3">Company & Role</th>
                                <th scope="col" className="px-6 py-3">Attachment Type</th>
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
                                    <td className="px-6 py-4 text-gray-600">{hist.attachmentType || 'N/A'}</td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => handleViewHistoryItem(hist)} className="bg-strive-blue text-white px-4 py-2 rounded-md text-xs font-semibold hover:bg-opacity-90">
                                            Review
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="4" className="text-center py-8 text-gray-500">No employment records are pending verification.</td></tr>
                            )}
                        </tbody>
                    </table>
                );
            case 'jobs':
                // --- 2. RENDER THE NEW HUB ---
                return <JobManagement />;
            case 'content_management':
                return <ContentManagement />;
                case 'upskilling':
  return <UpskillingManagement />;

  
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <main className="container mx-auto px-6 py-8">
                {/* Stat Card Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"> {/* Updated to 3 cols */}
                   <StatCard icon="fa-users" title="Total Alumni" value={loading ? '...' : alumniCount} />
                   <StatCard icon="fa-user-plus" title="User Approvals" value={loading ? '...' : pendingUsers.length} />
                   <StatCard icon="fa-id-card-clip" title="Pending History" value={loading ? '...' : pendingHistory.length} />
                   {/* Removed Pending Jobs & Active Jobs from here */}
                </div>

                {/* Tab Navigation */}
                <div className="bg-white rounded-lg shadow-md">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-6 px-6 overflow-x-auto" aria-label="Tabs">
                            <button onClick={() => setActiveTab('approvals')} className={`${activeTab === 'approvals' ? 'border-strive-blue text-strive-blue' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>User Approvals</button>
                            {/* --- 3. REMOVED JOB VERIFICATIONS TAB --- */}
                            <button onClick={() => setActiveTab('employment_verification')} className={`${activeTab === 'employment_verification' ? 'border-strive-blue text-strive-blue' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>History Verifications</button>
                            <button onClick={() => setActiveTab('jobs')} className={`${activeTab === 'jobs' ? 'border-strive-blue text-strive-blue' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Job Management</button>
                            <button onClick={() => setActiveTab('content_management')} className={`${activeTab === 'content_management' ? 'border-strive-blue text-strive-blue' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Content Management</button>
                            <button onClick={() => setActiveTab('upskilling')}  className={`${activeTab === 'upskilling'  ? 'border-strive-blue text-strive-blue'  : 'border-transparent text-gray-500 hover:text-gray-700'}     whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`} > Upskilling Management </button>

                        </nav>
                    </div>
                    <div className="p-6">
                        {renderContent()}
                    </div>
                </div>
            </main>
            
            {/* --- All Job Modals have been removed --- */}

            {/* History Review Modal */}
            {isHistoryModalOpen && (
                <AdminHistoryReviewModal
                    historyItem={selectedHistoryItem}
                    onClose={() => setIsHistoryModalOpen(false)}
                    onSubmitReview={handleReviewHistory}
                />
            )}
        </div>
    );
};

export default AdminDashboard;

