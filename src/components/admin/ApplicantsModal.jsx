import React from 'react';

/**
 * A modal component to display the list of applicants for a specific job,
 * now with interactive buttons to update application status.
 */
const ApplicantsModal = ({ job, applicants, isLoading, onClose, onUpdateStatus }) => {
    
    const getStatusColor = (status) => {
        switch(status) {
            case 'SHORTLISTED': return 'bg-yellow-100 text-yellow-800';
            case 'SELECTED': return 'bg-green-100 text-green-800';
            case 'REJECTED': return 'bg-red-100 text-red-800';
            case 'APPLIED':
            default:
                return 'bg-blue-100 text-blue-800';
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 transition-opacity duration-300">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl transform transition-all duration-300 scale-95 animate-fade-in-up">
                <div className="p-6 border-b flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800">Applicants for: <span className="text-strive-blue">{job.title}</span></h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-800">
                        <i className="fa fa-times fa-lg"></i>
                    </button>
                </div>
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {isLoading ? (
                        <div className="text-center text-gray-500 py-8">Loading applicants...</div>
                    ) : (
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Applicant Name</th>
                                    <th scope="col" className="px-6 py-3">Mobile</th>
                                    <th scope="col" className="px-6 py-3">Status</th>
                                    <th scope="col" className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {applicants.length > 0 ? applicants.map(app => (
                                    <tr key={app.applicationId} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{app.applicantName}</td>
                                        <td className="px-6 py-4">{app.applicantMobile}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(app.status)}`}>
                                                {app.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 space-x-2">
                                            <button onClick={() => onUpdateStatus(app.applicationId, 'SHORTLISTED')} className="text-yellow-600 hover:underline text-xs disabled:text-gray-400" disabled={app.status !== 'APPLIED'}>Shortlist</button>
                                            <button onClick={() => onUpdateStatus(app.applicationId, 'REJECTED')} className="text-red-600 hover:underline text-xs">Reject</button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="text-center py-8 text-gray-500">No applicants for this job yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
                <div className="p-4 bg-gray-50 border-t rounded-b-lg text-right">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-300">
                        Close
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes fade-in-up {
                    0% {
                        opacity: 0;
                        transform: scale(.95) translateY(10px);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default ApplicantsModal;

