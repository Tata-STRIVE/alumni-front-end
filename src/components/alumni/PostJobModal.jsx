import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

/**
 * The final, correct version of the modal form for alumni to submit a job, using a React Portal.
 */
const PostJobModal = ({ onClose, onSubmit }) => {
    const [title, setTitle] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        console.log("PostJobModal: Component has successfully mounted inside a Portal.");
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const jobData = { title, companyName, location, description };
        await onSubmit(jobData);
        setLoading(false);
    };

    const modalContent = (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-6 border-b flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800">Post a Job Opportunity</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-800">
                        <i className="fa fa-times fa-lg"></i>
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Job Title</label>
                            <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                        </div>
                        <div>
                            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Company Name</label>
                            <input type="text" id="companyName" value={companyName} onChange={e => setCompanyName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                        </div>
                        <div>
                            <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location (e.g., City, State)</label>
                            <input type="text" id="location" value={location} onChange={e => setLocation(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Job Description</label>
                            <textarea id="description" rows="4" value={description} onChange={e => setDescription(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"></textarea>
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 border-t flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-300">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="px-4 py-2 bg-strive-blue text-white text-sm font-medium rounded-md hover:bg-opacity-90 disabled:bg-gray-400">
                            {loading ? 'Submitting...' : 'Submit for Verification'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    // Use ReactDOM.createPortal to render the modal content into the '#modal-root' div
    return ReactDOM.createPortal(
        modalContent,
        document.getElementById('modal-root')
    );
};

export default PostJobModal;

