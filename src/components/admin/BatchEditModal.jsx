    import React, { useState } from 'react';
    import { useTranslation } from 'react-i18next';
    import DatePicker from 'react-datepicker';
    import 'react-datepicker/dist/react-datepicker.css';

    /**
     * NEW: Modal form for Admins to create or edit a Batch.
     */
    const BatchEditModal = ({ onClose, onSave, existingBatch, courses, centers }) => {
        const { t } = useTranslation();
        const [batchName, setBatchName] = useState('');
        const [courseId, setCourseId] = useState('');
        const [centerId, setCenterId] = useState('');
        const [startDate, setStartDate] = useState(null);
        const [endDate, setEndDate] = useState(null);
        const [status, setStatus] = useState('UPCOMING');

        const handleSubmit = (e) => {
            e.preventDefault();
            // onSave({ ... });
        };

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                    <form onSubmit={handleSubmit}>
                        <div className="p-6 border-b">
                            <h3 className="text-lg font-semibold text-gray-800">{t('admin.content.edit_batch')}</h3>
                        </div>
                        
                        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                            <div>
                                <label className="block text-sm font-medium">{t('admin.content.batch_name')}</label>
                                <input type="text" value={batchName} onChange={e => setBatchName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">{t('admin.content.course')}</label>
                                <select value={courseId} onChange={e => setCourseId(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md">
                                    <option value="">Select a course...</option>
                                    {courses.map(c => <option key={c.courseId} value={c.courseId}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium">{t('admin.content.center')}</label>
                                <select value={centerId} onChange={e => setCenterId(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md">
                                    <option value="">Select a center...</option>
                                    {centers.map(c => <option key={c.centerId} value={c.centerId}>{c.name} ({c.city})</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium">{t('admin.content.start_date')}</label>
                                <DatePicker selected={startDate} onChange={date => setStartDate(date)} className="mt-1 block w-full border border-gray-300 rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">{t('admin.content.end_date')}</label>
                                <DatePicker selected={endDate} onChange={date => setEndDate(date)} className="mt-1 block w-full border border-gray-300 rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">{t('admin.content.status')}</label>
                                <select value={status} onChange={e => setStatus(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md">
                                    <option value="UPCOMING">Upcoming</option>
                                    <option value="IN_PROGRESS">In Progress</option>
                                    <option value="COMPLETED">Completed</option>
                                </select>
                            </div>
                        </div>
                        
                        <div className="p-4 bg-gray-50 border-t flex justify-end space-x-2">
                            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-strive-blue text-white rounded-md">Save Batch</button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    export default BatchEditModal;
