import React, { useState, useEffect } from 'react';
import { getContentPosts } from '../services/apiService';

const EventsPage = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            try {
                // In a real app, this fetches 'EVENT' posts
                const mockData = [
                    { postId: 1, title: 'Annual Alumni Meet 2025', content: 'Join us for our annual alumni gathering to reconnect and network.', createdAt: '2025-10-20T10:00:00Z' },
                    { postId: 2, title: 'STRIVE Receives National Skill Development Award', content: 'We are proud to announce our recognition for excellence in vocational training.', createdAt: '2025-09-15T10:00:00Z' },
                ];
                setEvents(mockData);
            } catch (err) {
                setError('Failed to load events.');
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    return (
        <div className="bg-white min-h-screen">
            <main>
                {/* Colorful Page Header */}
                <div className="bg-gradient-to-r from-strive-green to-green-500 py-20 text-white text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Events & Announcements</h1>
                    <p className="mt-4 max-w-2xl mx-auto text-xl text-green-100">
                        Stay up-to-date with the latest happenings at STRIVE.
                    </p>
                </div>

                {/* Content List */}
                <div className="bg-gray-100 py-16">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        {loading ? <div className="text-center">Loading...</div> : error ? <div className="text-center text-red-500">{error}</div> : (
                            <div className="space-y-8">
                                {events.map((event) => (
                                    <div key={event.postId} className="bg-white rounded-lg shadow-lg p-8 border-l-4 border-strive-green">
                                        <p className="text-sm text-gray-500">{new Date(event.createdAt).toLocaleDateString()}</p>
                                        <h3 className="mt-2 text-2xl font-bold text-strive-blue">{event.title}</h3>
                                        <p className="mt-4 text-gray-600">{event.content}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default EventsPage;

