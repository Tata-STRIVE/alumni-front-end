import React from 'react';

/**
 * Reusable modal component to display the full details of a ContentPost (Success Story or Event).
 */
const StoryModal = ({ post, onClose }) => {
    if (!post) return null;

    // Helper to format date/time for Events
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

    const isStory = post.postType === 'SUCCESS_STORY';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden animate-fade-in-up">
                
                {/* Header */}
                <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
                    <h3 className="text-2xl font-bold text-strive-blue">{post.title}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition-colors">
                        <i className="fa fa-times fa-lg"></i>
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
                    
                    {isStory && post.alumnusName && (
                        <div className="flex items-center space-x-4 pb-4 border-b">
                            {/* Alumnus Photo/Avatar */}
                            <img 
                                src={post.studentPhotoUrl || `https://placehold.co/64x64/005A9E/F47B20?text=${post.alumnusName.charAt(0)}`} 
                                alt={`${post.alumnusName} profile`} 
                                className="w-16 h-16 rounded-full object-cover border-2 border-strive-orange"
                                onError={(e) => {
                                    e.target.onerror = null; 
                                    e.target.src=`https://placehold.co/64x64/005A9E/F47B20?text=${post.alumnusName.charAt(0)}`;
                                }}
                            />
                            <div>
                                <p className="text-lg font-semibold text-strive-orange">{post.alumnusName}</p>
                                <p className="text-sm text-gray-600">
                                    {post.alumnusBatchName} {post.alumnusCenterName && `| ${post.alumnusCenterName}`}
                                </p>
                            </div>
                        </div>
                    )}

                    {!isStory && post.eventDate && (
                        <p className="text-base font-semibold text-strive-orange">
                            Event Date: {formatEventDateTime(post.eventDate)}
                        </p>
                    )}

                    {/* Main Content */}
                    <div className="text-gray-800 whitespace-pre-line">
                        {post.content}
                    </div>

                    <p className="text-xs text-gray-500 pt-4 border-t">
                        Posted on: {new Date(post.createdAt).toLocaleDateString()} by {post.authorName || 'Admin'}
                    </p>
                </div>
                
                {/* Footer */}
                <div className="p-4 bg-gray-100 border-t flex justify-end">
                    <button onClick={onClose} className="px-6 py-2 bg-strive-blue text-white rounded-lg font-medium hover:bg-opacity-90 transition-colors">
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

export default StoryModal;
