import React, { useState } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../../services/apiService'; // For building URL

/**
 * NEW: Modal for Admins to review a pending Employment History record.
 */
const AdminHistoryReviewModal = ({ historyItem, onClose, onSubmitReview }) => {
    const [remarks, setRemarks] = useState('');
    const [loading, setLoading] = useState(false);

    // Helper to build full download URL
    const buildFileUrl = (relativePath) => {
        if (!relativePath) return null;
        // The URL from the backend is /api/files/download/TENANT/USER/file.ext
        // apiClient.defaults.baseURL is http://localhost:8080
        // We must remove the /api from the relative path
        if (relativePath.startsWith('/api')) {
             return `${apiClient.defaults.baseURL}${relativePath.substring(4)}`;
        }
        return `${apiClient.defaults.baseURL}/files/download/${relativePath}`;
    };

    const handleSubmit = async (status) => {
        if (status === 'REJECTED' && remarks.trim() === '') {
            toast.error("Rejection remarks are required.");
            return;
        }

        setLoading(true);
        const reviewData = {
            status,
            remarks: status === 'REJECTED' ? remarks : null
        };
        
        // This function is (historyId, reviewData)
        await onSubmitReview(historyItem.employmentId, reviewData);
        setLoading(false);
    };

    const attachmentUrl = buildFileUrl(historyItem.attachmentUrl);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
                <div className="p-6 border-b flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800">Review Employment Record</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-800">&times;</button>
                </div>
                
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    {/* Display all details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <label className="font-medium text-gray-500">Alumnus Name</label>
                            <p className="text-gray-900">{historyItem.authorName}</p>
                        </div>
                        <div>
                            <label className="font-medium text-gray-500">Company Name</label>
                            <p className="text-gray-900">{historyItem.companyName}</p>
                        </div>
                        <div>
                            <label className="font-medium text-gray-500">Job Title</label>
                            <p className="text-gray-900">{historyItem.jobTitle}</p>
                        </div>
                         <div>
                            <label className="font-medium text-gray-500">Location</label>
                            <p className="text-gray-900">{historyItem.location || 'N/A'}</p>
                        </div>
                        <div>
                            <label className="font-medium text-gray-500">Start Date</label>
                            <p className="text-gray-900">{new Date(historyItem.startDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <label className="font-medium text-gray-500">End Date</label>
                            <p className="text-gray-900">{historyItem.endDate ? new Date(historyItem.endDate).toLocaleDateString() : 'Present'}</p>
                        </div>
                    </div>

                    <hr />

                    {/* Attachment Section */}
                    <div>
                        <label className="font-medium text-gray-500">Attachment ({historyItem.attachmentType})</label>
                        {attachmentUrl ? (
                            <a 
                                href={attachmentUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="mt-1 block text-sm text-strive-blue font-semibold hover:underline"
                            >
                                View Attached Document
                            </a>
                        ) : (
                            <p className="text-sm text-gray-500">No attachment provided.</p>
                        )}
                    </div>

                    <hr />

                    {/* Admin Action Section */}
                    <div>
                        <label htmlFor="adminRemarks" className="block text-sm font-medium text-gray-700">Admin Remarks (Required if rejecting)</label>
                        <textarea
                            id="adminRemarks"
                            rows="3"
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                            placeholder="Provide a clear reason for rejection..."
                        ></textarea>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 border-t flex justify-end space-x-3">
                    <button 
                        type="button" 
                        onClick={() => handleSubmit('REJECTED')} 
                        disabled={loading}
                        className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:bg-gray-400"
                    >
                        {loading ? '...' : 'Reject'}
                    </button>
                    <button 
                        type="button" 
                        onClick={() => handleSubmit('VERIFIED')} 
                        disabled={loading}
                        className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:bg-gray-400"
                    >
                        {loading ? '...' : 'Approve'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminHistoryReviewModal;

