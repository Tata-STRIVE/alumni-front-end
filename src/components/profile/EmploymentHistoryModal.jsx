import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { uploadProfilePhoto } from '../../services/apiService'; // Re-using the file upload service
import apiClient from '../../services/apiService'; // For building URL

/**
 * Modal for ADDING or EDITING an employment history record.
 * Now includes file upload, attachment type, and displays rejection remarks.
 */
const EmploymentHistoryModal = ({ onClose, onSubmit, hasPresentJob, existingHistory }) => {
    // Form fields
    const [companyName, setCompanyName] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [location, setLocation] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isCurrentJob, setIsCurrentJob] = useState(false);
    
    // --- NEW FIELDS ---
    const [attachmentType, setAttachmentType] = useState('OFFER_LETTER');
    const [attachmentUrl, setAttachmentUrl] = useState(null); // The URL from the backend
    const [selectedFile, setSelectedFile] = useState(null); // The new file object
    const [adminRemarks, setAdminRemarks] = useState(null); // Rejection remarks
    const [status, setStatus] = useState('PENDING_VERIFICATION');
    // --- END NEW FIELDS ---
    
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    const isEditMode = !!existingHistory;
    const isRejected = isEditMode && existingHistory.status === 'REJECTED';
    const isVerified = isEditMode && existingHistory.status === 'VERIFIED';

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

    // Pre-fill the form if we are editing
    useEffect(() => {
        if (isEditMode) {
            setCompanyName(existingHistory.companyName);
            setJobTitle(existingHistory.jobTitle);
            setLocation(existingHistory.location || '');
            setStartDate(existingHistory.startDate);
            setEndDate(existingHistory.endDate || '');
            setIsCurrentJob(existingHistory.endDate === null);
            
            // Set new fields
            setAttachmentType(existingHistory.attachmentType || 'OFFER_LETTER');
            setAttachmentUrl(existingHistory.attachmentUrl || null);
            setAdminRemarks(existingHistory.adminRemarks || null);
            setStatus(existingHistory.status);
        }
    }, [existingHistory, isEditMode]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setSelectedFile(file);
        // Clear old URL if a new file is chosen
        setAttachmentUrl(null); 
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (isCurrentJob && hasPresentJob && !(isEditMode && existingHistory.endDate === null)) {
            toast.error("You already have a job marked as 'Present'. Please edit that entry first.");
            return;
        }

        setLoading(true);
        let finalAttachmentUrl = attachmentUrl; // Use existing URL by default

        try {
            // 1. If a new file was selected, upload it first
            if (selectedFile) {
                const toastId = toast.loading('Uploading attachment...');
                const response = await uploadProfilePhoto(selectedFile); // Re-using this service
                // The service now returns the relative path, e.g., TENANT/USER/file.ext
                finalAttachmentUrl = response.data.fileUrl; 
                toast.success('Attachment uploaded.', { id: toastId });
            }

            if (!finalAttachmentUrl && !isVerified) { // Verified records might not need a new attachment
                toast.error("Please attach a proof document.");
                setLoading(false);
                return;
            }

            // 2. Construct the final payload
            const historyData = {
                companyName,
                jobTitle,
                location,
                startDate,
                endDate: isCurrentJob ? null : endDate,
                attachmentType,
                attachmentUrl: finalAttachmentUrl,
                adminRemarks: null, // Always clear remarks on re-submit
                status: 'PENDING_VERIFICATION' // Always reset to pending on save/update
            };

            // 3. Call the onSubmit (which is addHistory or updateHistory)
            await onSubmit(historyData);
            
        } catch(err) {
            toast.error(err.response?.data?.error || 'Failed to save record.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-6 border-b flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800">
                        {isEditMode ? 'Edit Employment Record' : 'Add New Employment'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-800">&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        
                        {/* --- REJECTION REMARKS --- */}
                        {isRejected && adminRemarks && (
                            <div className="p-3 bg-red-100 text-red-800 rounded-md">
                                <p className="font-semibold">Rejected by Admin:</p>
                                <p className="text-sm">{adminRemarks}</p>
                                <p className="text-sm font-semibold mt-2">Please update the details and re-submit.</p>
                            </div>
                        )}
                        
                        {/* --- VERIFIED NOTICE --- */}
                        {isVerified && (
                             <div className="p-3 bg-green-100 text-green-800 rounded-md text-sm">
                                This record is **VERIFIED**. You can only update the end date.
                            </div>
                        )}

                        <div>
                            <label htmlFor="companyName" className="block text-sm font-medium">Company Name</label>
                            <input type="text" id="companyName" value={companyName} onChange={e => setCompanyName(e.target.value)} required 
                                   disabled={isVerified}
                                   className="mt-1 block w-full border border-gray-300 rounded-md p-2 disabled:bg-gray-100" />
                        </div>
                        <div>
                            <label htmlFor="jobTitle" className="block text-sm font-medium">Job Title</label>
                            <input type="text" id="jobTitle" value={jobTitle} onChange={e => setJobTitle(e.target.value)} required 
                                   disabled={isVerified}
                                   className="mt-1 block w-full border border-gray-300 rounded-md p-2 disabled:bg-gray-100" />
                        </div>
                        <div>
                            <label htmlFor="location" className="block text-sm font-medium">Location (e.g., City, State)</label>
                            <input type="text" id="location" value={location} onChange={e => setLocation(e.target.value)}
                                   disabled={isVerified}
                                   className="mt-1 block w-full border border-gray-300 rounded-md p-2 disabled:bg-gray-100" />
                        </div>
                        <div>
                            <label htmlFor="startDate" className="block text-sm font-medium">Start Date</label>
                            <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} required 
                                   disabled={isVerified}
                                   className="mt-1 block w-full border border-gray-300 rounded-md p-2 disabled:bg-gray-100" />
                        </div>
                        <div className="flex items-center">
                            <input id="currentJob" type="checkbox" checked={isCurrentJob} onChange={e => setIsCurrentJob(e.target.checked)} 
                                   disabled={isVerified && !isCurrentJob} // Can't mark a finished, verified job as "Present"
                                   className="h-4 w-4 text-strive-blue border-gray-300 rounded" />
                            <label htmlFor="currentJob" className="ml-2 block text-sm">I currently work here</label>
                        </div>
                        {!isCurrentJob && (
                            <div>
                                <label htmlFor="endDate" className="block text-sm font-medium">End Date</label>
                                <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} 
                                       disabled={isVerified && isCurrentJob} // Cannot edit end date if it was verified as "Present"
                                       className="mt-1 block w-full border border-gray-300 rounded-md p-2 disabled:bg-gray-100" />
                            </div>
                        )}

                        <hr className="my-4" />

                        {/* --- ATTACHMENT FIELDS --- */}
                        <div className={isVerified ? "hidden" : ""}> {/* Hide if verified */}
                            <label htmlFor="attachmentType" className="block text-sm font-medium">Attachment Type</label>
                            <select 
                                id="attachmentType" 
                                value={attachmentType} 
                                onChange={e => setAttachmentType(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                            >
                                <option value="OFFER_LETTER">Offer Letter</option>
                                <option value="SALARY_SLIP">Latest Salary Slip</option>
                                <option value="EXPERIENCE_LETTER">Experience Letter</option>
                                <option value="OTHER">Other Proof</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium">Proof Document</label>
                            {/* Show current attachment if no new file is selected */}
                            {!selectedFile && attachmentUrl && (
                                <div className="mt-2">
                                    <a 
                                        href={buildFileUrl(attachmentUrl)} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-sm text-green-600 font-semibold hover:underline"
                                    >
                                        View Current Attachment
                                    </a>
                                </div>
                            )}
                            
                            {/* Hide upload button if verified */}
                            {!isVerified && (
                                <>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="hidden"
                                        accept="image/png, image/jpeg, application/pdf"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="mt-1 text-sm text-strive-blue font-semibold hover:underline"
                                    >
                                        {selectedFile ? `Change file... (${selectedFile.name})` : (attachmentUrl ? 'Replace attachment...' : 'Upload attachment...')}
                                    </button>
                                </>
                            )}
                        </div>

                    </div>
                    <div className="p-4 bg-gray-50 border-t flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 bg-strive-blue text-white rounded-md disabled:bg-gray-400">
                            {loading ? 'Saving...' : (isRejected ? 'Re-submit for Verification' : 'Submit for Verification')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EmploymentHistoryModal;

