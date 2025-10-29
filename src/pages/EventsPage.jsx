import React, { useState, useEffect } from 'react';
import { getContentPosts } from '../services/apiService';
import toast from 'react-hot-toast';

const EventsPage = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            setError('');
            try {
                // Fetch posts of type 'EVENT' from the backend API
                const response = await getContentPosts('EVENT');
                setEvents(response.data.sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate))); // Sort by eventDate descending
            } catch (err) {
                setError('Failed to load events and announcements.');
                toast.error('Failed to load events.');
                console.error("API Error fetching Events:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    // Helper to format date/time
    const formatEventDateTime = (dateTimeString) => {
        if (!dateTimeString) return 'Date/Time TBD';
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        };
        return new Date(dateTimeString).toLocaleDateString(undefined, options);
    };

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
                                {events.length > 0 ? events.map((event) => (
                                    <div key={event.postId} className="bg-white rounded-lg shadow-lg p-8 border-l-4 border-strive-green">
                                        <p className="text-sm font-semibold text-strive-orange">
                                            {formatEventDateTime(event.eventDate)}
                                        </p>
                                        <h3 className="mt-2 text-2xl font-bold text-strive-blue">{event.title}</h3>
                                        <p className="mt-4 text-gray-600">{event.content}</p>
                                        {event.authorName && (
                                            <p className="mt-4 text-sm text-gray-500 font-medium">Posted by: {event.authorName}</p>
                                        )}
                                    </div>
                                )) : (
                                    <div className="text-center text-gray-500 p-8 border rounded-md">
                                        No upcoming events or announcements at this time.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default EventsPage;
