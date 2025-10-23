import React, { useState, useEffect } from 'react';
import { getMyJobApplications, getMyUpskillingApplications } from '../services/apiService';
import toast from 'react-hot-toast';

/**
 * A new page for alumni to view the status of their applications.
 */
const MyApplicationsPage = () => {
    const [jobApps, setJobApps] = useState([]);
    const [upskillingApps, setUpskillingApps] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [jobAppsRes, upskillingAppsRes] = await Promise.all([
                    getMyJobApplications(),
                    getMyUpskillingApplications()
                ]);
                setJobApps(jobAppsRes.data);
                setUpskillingApps(upskillingAppsRes.data);
            } catch (err) {
                toast.error("Failed to load your applications.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

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
        <main className="container mx-auto px-6 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">My Applications</h1>
            
            {loading ? (
                <div className="text-center text-gray-500">Loading your applications...</div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Job Applications */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">Job Applications</h2>
                        <div className="space-y-4">
                            {jobApps.length > 0 ? jobApps.map(app => (
                                <div key={app.applicationId} className="p-4 border rounded-md">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-strive-blue">{app.jobTitle}</p>
                                            <p className="text-sm text-gray-600">{app.companyName}</p>
                                        </div>
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(app.status)}`}>
                                            {app.status}
                                        </span>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-gray-500">You have not applied for any jobs yet.</p>
                            )}
                        </div>
                    </div>

                    {/* Upskilling Applications */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">Upskilling Applications</h2>
                        <div className="space-y-4">
                            {upskillingApps.length > 0 ? upskillingApps.map(app => (
                                <div key={app.applicationId} className="p-4 border rounded-md">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-strive-blue">{app.opportunityTitle}</p>
                                        </div>
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(app.status)}`}>
                                            {app.status}
                                        </span>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-gray-500">You have not applied for any upskilling courses.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};

export default MyApplicationsPage;
