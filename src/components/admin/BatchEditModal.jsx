import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import toast from 'react-hot-toast';
import { createBatch, updateBatch } from '../../services/apiService';

/**
 * Modal form for Admins to create or edit a Batch.
 */
const BatchEditModal = ({ onClose, onBatchSaved, existingBatch, courses = [], centers = [] }) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    
    // State is initialized using existingBatch data if available
    const [batchName, setBatchName] = useState(existingBatch?.batchName || '');
    const [courseId, setCourseId] = useState(existingBatch?.courseId || '');
    const [centerId, setCenterId] = useState(existingBatch?.centerId || '');
    // Note: API returns date strings (YYYY-MM-DD), DatePicker needs Date objects
    const [startDate, setStartDate] = useState(existingBatch?.startDate ? new Date(existingBatch.startDate) : null);
    const [endDate, setEndDate] = useState(existingBatch?.endDate ? new Date(existingBatch.endDate) : null);
    const [status, setStatus] = useState(existingBatch?.status || 'UPCOMING');

    const isEditMode = !!existingBatch;

    // We can skip useEffect for pre-population since we are initializing state with existingBatch?.
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const toastId = toast.loading(isEditMode ? 'Updating Batch...' : 'Creating Batch...');

        // Construct DTO payload
        const batchData = {
            batchName,
            courseId: parseInt(courseId, 10), // Ensure IDs are integers if backend expects them
            centerId: parseInt(centerId, 10),
            status,
            // Format dates back to YYYY-MM-DD string as required by the backend API
            startDate: startDate ? startDate.toISOString().split('T')[0] : null,
            endDate: endDate ? endDate.toISOString().split('T')[0] : null,
        };

        try {
            if (isEditMode) {
                await updateBatch(existingBatch.batchId, batchData);
                toast.success('Batch updated successfully!', { id: toastId });
            } else {
                await createBatch(batchData);
                toast.success('New Batch created successfully!', { id: toastId });
            }
            
            if (onBatchSaved) onBatchSaved();
            onClose();

        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Failed to save batch details.';
            toast.error(errorMsg, { id: toastId });
            console.error('API Error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-800">{isEditMode ? 'Edit Batch' : 'Add New Batch'}</h3>
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-800">&times;</button>
                    </div>
                    
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div>
                            <label className="block text-sm font-medium">Batch Name</label>
                            <input 
                                type="text" 
                                value={batchName} 
                                onChange={e => setBatchName(e.target.value)} 
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Course</label>
                            <select 
                                value={courseId} 
                                onChange={e => setCourseId(e.target.value)} 
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                            >
                                <option value="">Select a course...</option>
                                {courses.map(c => <option key={c.courseId} value={c.courseId}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Center</label>
                            <select 
                                value={centerId} 
                                onChange={e => setCenterId(e.target.value)} 
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                            >
                                <option value="">Select a center...</option>
                                {centers.map(c => <option key={c.centerId} value={c.centerId}>{c.name} ({c.city})</option>)}
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium">Start Date</label>
                            <DatePicker 
                                selected={startDate} 
                                onChange={date => setStartDate(date)} 
                                required
                                dateFormat="yyyy/MM/dd"
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2" 
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-medium">End Date</label>
                            <DatePicker 
                                selected={endDate} 
                                onChange={date => setEndDate(date)} 
                                dateFormat="yyyy/MM/dd"
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Status</label>
                            <select 
                                value={status} 
                                onChange={e => setStatus(e.target.value)} 
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                            >
                                <option value="UPCOMING">Upcoming</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="COMPLETED">Completed</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 border-t flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 bg-strive-blue text-white rounded-md disabled:bg-gray-400">
                            {loading ? 'Saving...' : 'Save Batch'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BatchEditModal;
