import React, { useState } from 'react';
import toast from 'react-hot-toast';

/**
 * Modal for Admins to Approve or Reject an alumni-submitted job.
 * Includes mandatory remarks for rejection.
 */
const AdminJobReviewModal = ({ job, onClose, onSubmitReview, isSaving }) => {
    // Guard clause to prevent crash if job is not ready
    if (!job) return null; 

    const [status, setStatus] = useState('OPEN'); // Default to 'Approve'
    const [rejectionRemarks, setRejectionRemarks] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validation: Remarks are mandatory if rejecting
        if (status === 'REJECTED' && !rejectionRemarks.trim()) {
            toast.error('Rejection remarks are mandatory.');
            return;
        }

        onSubmitReview(job.jobId, {
            status,
            rejectionRemarks: status === 'REJECTED' ? rejectionRemarks : null
        });
    };
    
    // Helper to build full URL for display
    const buildFileUrl = (relativePath) => {
        if (!relativePath) return null;
        // This is a simplified example; use your apiClient base URL in a real app
        return `http://localhost:8080${relativePath}`;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-800">Review Job Submission</h3>
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-800">&times;</button>
                    </div>

                    {/* Job Details Section */}
                    <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                        <h4 className="text-xl font-bold text-strive-blue">{job.title}</h4>
                        <p className="text-md font-semibold text-gray-700">{job.companyName} - <span className="font-normal">{job.location}</span></p>
                        <p className="text-sm text-gray-500">Submitted by: {job.authorName}</p>
                        
                        <div className="border-t pt-4">
                            <h5 className="font-semibold text-gray-700">Job Description</h5>
                            <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{job.description}</p>
                        </div>
                        
                        <div className="border-t pt-4">
                            <h5 className="font-semibold text-gray-700">HR Contact Information</h5>
                            <p className="text-sm text-gray-600 mt-1"><strong>Email:</strong> {job.hrContactEmail}</p>
                            <p className="text-sm text-gray-600"><strong>Phone:</strong> {job.hrContactPhone}</p>
                        </div>

                        {/* Admin Review Section */}
                        <div className="border-t pt-4">
                            <h5 className="font-semibold text-gray-700">Admin Action</h5>
                            <div className="mt-2 space-x-4">
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        name="status"
                                        value="OPEN"
                                        checked={status === 'OPEN'}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="form-radio text-strive-green"
                                    />
                                    <span className="ml-2">Approve</span>
                                </label>
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        name="status"
                                        value="REJECTED"
                                        checked={status === 'REJECTED'}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="form-radio text-red-600"
                                    />
                                    <span className="ml-2">Reject</span>
                                </label>
                            </div>
                        </div>

                        {/* Rejection Remarks (Conditional) */}
                        {status === 'REJECTED' && (
                            <div>
                                <label htmlFor="rejectionRemarks" className="block text-sm font-medium text-gray-700">
                                    Rejection Remarks <span className="text-red-500">(Mandatory)</span>
                                </label>
                                <textarea
                                    id="rejectionRemarks"
                                    rows="3"
                                    value={rejectionRemarks}
                                    onChange={(e) => setRejectionRemarks(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                                    required
                                ></textarea>
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-gray-50 border-t flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
                        <button type="submit" disabled={isSaving} className="px-4 py-2 bg-strive-blue text-white rounded-md disabled:bg-gray-400">
                            {isSaving ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminJobReviewModal;

