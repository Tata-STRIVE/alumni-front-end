import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

/**
 * A modal form for ADDING or EDITING an employment history record.
 * This version pre-fills the form for editing and enforces business rules.
 */
const EmploymentHistoryModal = ({ onClose, onSubmit, hasPresentJob, existingHistory }) => {
    const [companyName, setCompanyName] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [location, setLocation] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isCurrentJob, setIsCurrentJob] = useState(false);
    const [loading, setLoading] = useState(false);

    // Check if we are in "Edit" mode and if the record is verified
    const isEditMode = !!existingHistory;
    const isVerified = isEditMode && existingHistory.status === 'VERIFIED';

    // Pre-fill the form if we are editing
    useEffect(() => {
        if (isEditMode) {
            setCompanyName(existingHistory.companyName);
            setJobTitle(existingHistory.jobTitle);
            setLocation(existingHistory.location || '');
            setStartDate(existingHistory.startDate);
            setEndDate(existingHistory.endDate || '');
            setIsCurrentJob(existingHistory.endDate === null);
        }
    }, [existingHistory, isEditMode]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation for "Present" job conflict
        // Only run this check if:
        // 1. The user is ticking "I currently work here"
        // 2. The user *already* has a *different* job marked as "Present"
        const isEditingThisPresentJob = isEditMode && existingHistory.endDate === null;
        if (isCurrentJob && hasPresentJob && !isEditingThisPresentJob) {
            toast.error("You already have a job marked as 'Present'. Please edit that entry first.");
            return;
        }

        setLoading(true);
        const historyData = {
            companyName,
            jobTitle,
            location,
            startDate,
            endDate: isCurrentJob ? null : endDate,
        };
        await onSubmit(historyData);
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold text-gray-800">
                        {isEditMode ? 'Edit Employment Record' : 'Add New Employment'}
                    </h3>
                    <button onClick={onClose} className="absolute top-4 right-4 text-gray-500">&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        {isVerified && (
                            <div className="p-3 bg-yellow-100 text-yellow-800 rounded-md text-sm">
                                This record is **VERIFIED**. You can only update the end date.
                            </div>
                        )}
                        <div>
                            <label htmlFor="companyName" className="block text-sm font-medium">Company Name</label>
                            <input type="text" id="companyName" value={companyName} onChange={e => setCompanyName(e.target.value)} required 
                                   disabled={isVerified} className="mt-1 block w-full border border-gray-300 rounded-md disabled:bg-gray-100" />
                        </div>
                        <div>
                            <label htmlFor="jobTitle" className="block text-sm font-medium">Job Title</label>
                            <input type="text" id="jobTitle" value={jobTitle} onChange={e => setJobTitle(e.target.value)} required 
                                   disabled={isVerified} className="mt-1 block w-full border border-gray-300 rounded-md disabled:bg-gray-100" />
                        </div>
                        <div>
                            <label htmlFor="location" className="block text-sm font-medium">Location</label>
                            <input type="text" id="location" value={location} onChange={e => setLocation(e.target.value)} required 
                                   disabled={isVerified} className="mt-1 block w-full border border-gray-300 rounded-md disabled:bg-gray-100" />
                        </div>
                        <div>
                            <label htmlFor="startDate" className="block text-sm font-medium">Start Date</label>
                            <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} required 
                                   disabled={isVerified} className="mt-1 block w-full border border-gray-300 rounded-md disabled:bg-gray-100" />
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
                                       className="mt-1 block w-full border border-gray-300 rounded-md" />
                            </div>
                        )}
                    </div>
                    <div className="p-4 bg-gray-50 border-t flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 bg-strive-blue text-white rounded-md disabled:bg-gray-400">
                            {loading ? 'Saving...' : 'Save Record'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EmploymentHistoryModal;

