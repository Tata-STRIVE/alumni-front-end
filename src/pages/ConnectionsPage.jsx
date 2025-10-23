import React, { useState, useEffect } from 'react';
import { getPendingRequests, acceptConnectionRequest, declineConnectionRequest, getConnections } from '../services/apiService';

/**
 * The main page for managing all alumni connections.
 */
const ConnectionsPage = () => {
    const [pending, setPending] = useState([]);
    const [accepted, setAccepted] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const [pendingRes, acceptedRes] = await Promise.all([
                getPendingRequests(),
                getConnections()
            ]);
            setPending(pendingRes.data);
            setAccepted(acceptedRes.data);
        } catch (err) {
            setError('Failed to load connections.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRespond = async (connectionId, isAccepted) => {
        try {
            if (isAccepted) {
                await acceptConnectionRequest(connectionId);
            } else {
                await declineConnectionRequest(connectionId);
            }
            // Refresh data after responding
            fetchData();
        } catch (err) {
            setError('Failed to respond to request.');
        }
    };

    return (
        <main className="container mx-auto px-6 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Connections</h1>
            {error && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-6">{error}</p>}

            <div className="space-y-8">
                {/* Pending Requests Section */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Pending Requests ({pending.length})</h2>
                    {loading ? <p>Loading...</p> : (
                        <div className="space-y-3">
                            {pending.length > 0 ? pending.map(req => (
                                <div key={req.connectionId} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                                    <p className="font-semibold text-gray-800">{req.userName}</p>
                                    <div className="space-x-2">
                                        <button onClick={() => handleRespond(req.connectionId, true)} className="text-xs bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600">Accept</button>
                                        <button onClick={() => handleRespond(req.connectionId, false)} className="text-xs bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600">Decline</button>
                                    </div>
                                </div>
                            )) : <p className="text-gray-500">No new connection requests.</p>}
                        </div>
                    )}
                </div>

                {/* Accepted Connections Section */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">My Connections ({accepted.length})</h2>
                    {loading ? <p>Loading...</p> : (
                         <div className="space-y-3">
                            {accepted.length > 0 ? accepted.map(conn => (
                                <div key={conn.connectionId} className="flex items-center justify-between p-3 border-b">
                                    <p className="font-semibold text-gray-800">{conn.userName}</p>
                                    <button className="text-xs bg-gray-200 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-300">Message</button>
                                </div>
                            )) : <p className="text-gray-500">You haven't made any connections yet.</p>}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
};

export default ConnectionsPage;
