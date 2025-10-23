import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getCourses, getBatches, getCenters } from '../../services/apiService';
import CourseEditModal from './CourseEditModal';
import BatchEditModal from './BatchEditModal';

/**
 * NEW: A hub component for managing all tenant-specific content.
 * It contains its own sub-navigation for Courses, Batches, Stories, and Events.
 */
const ContentManagement = () => {
    const { t, i18n } = useTranslation();
    const [activeTab, setActiveTab] = useState('courses');
    
    // Data state
    const [courses, setCourses] = useState([]);
    const [batches, setBatches] = useState([]);
    const [centers, setCenters] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
    const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [coursesRes, batchesRes, centersRes] = await Promise.all([
                    getCourses(i18n.language),
                    getBatches(i18n.language),
                    getCenters()
                ]);
                setCourses(coursesRes.data);
                setBatches(batchesRes.data);
                setCenters(centersRes.data);
            } catch (err) {
                console.error("Failed to load content data", err);
            }
            setLoading(false);
        };
        loadData();
    }, [i18n.language]); // Reload data if language changes

    const renderSubContent = () => {
        if (loading) return <p>Loading content...</p>;

        if (activeTab === 'courses') {
            return (
                <div>
                    <div className="flex justify-end mb-4">
                        <button onClick={() => setIsCourseModalOpen(true)} className="bg-strive-blue text-white px-4 py-2 rounded-md text-sm font-medium">
                            + Add New Course
                        </button>
                    </div>
                    <div className="space-y-4">
                        {courses.map(course => (
                            <div key={course.courseId} className="p-4 bg-gray-50 rounded-md border">
                                <h3 className="font-semibold text-lg text-strive-blue">{course.name}</h3>
                                <p className="text-sm text-gray-600 mt-1">{course.description}</p>
                                <p className="text-sm text-gray-600 mt-2"><span className="font-semibold">Career Path:</span> {course.careerPath}</p>
                                <p className="text-sm text-gray-600 mt-1"><span className="font-semibold">Eligibility:</span> {course.eligibilityCriteria}</p>
                                <button className="text-sm text-strive-orange font-semibold mt-2 hover:underline">Edit Course</button>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        
        if (activeTab === 'batches') {
             return (
                <div>
                    <div className="flex justify-end mb-4">
                        <button onClick={() => setIsBatchModalOpen(true)} className="bg-strive-blue text-white px-4 py-2 rounded-md text-sm font-medium">
                            + Add New Batch
                        </button>
                    </div>
                    <div className="space-y-4">
                        {batches.map(batch => (
                            <div key={batch.batchId} className="p-4 bg-gray-50 rounded-md border">
                                <h3 className="font-semibold text-lg text-strive-blue">{batch.batchName}</h3>
                                <p className="text-sm text-gray-600">{batch.courseName} at {batch.centerName} ({batch.centerCity})</p>
                                <p className="text-sm text-gray-600">Dates: {batch.startDate} to {batch.endDate}</p>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${batch.status === 'UPCOMING' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                    {batch.status}
                                </span>
                                <button className="text-sm text-strive-orange font-semibold mt-2 hover:underline ml-4">Edit Batch</button>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        if (activeTab === 'stories') return <p>Success Story Management (Coming Soon)</p>;
        if (activeTab === 'events') return <p>Event Management (Coming Soon)</p>;
    };

    return (
        <div>
            {/* Sub-navigation for Content Management */}
            <div className="mb-6 border-b border-gray-300">
                <nav className="-mb-px flex space-x-6" aria-label="Content Tabs">
                    <button onClick={() => setActiveTab('courses')} className={`${activeTab === 'courses' ? 'border-strive-blue text-strive-blue' : 'border-transparent text-gray-500'} py-2 px-1 border-b-2 font-medium text-sm`}>Manage Courses</button>
                    <button onClick={() => setActiveTab('batches')} className={`${activeTab === 'batches' ? 'border-strive-blue text-strive-blue' : 'border-transparent text-gray-500'} py-2 px-1 border-b-2 font-medium text-sm`}>Manage Batches</button>
                    <button onClick={() => setActiveTab('stories')} className={`${activeTab === 'stories' ? 'border-strive-blue text-strive-blue' : 'border-transparent text-gray-500'} py-2 px-1 border-b-2 font-medium text-sm`}>Success Stories</button>
                    <button onClick={() => setActiveTab('events')} className={`${activeTab === 'events' ? 'border-strive-blue text-strive-blue' : 'border-transparent text-gray-500'} py-2 px-1 border-b-2 font-medium text-sm`}>Events</button>
                </nav>
            </div>
            
            {renderSubContent()}

            {isCourseModalOpen && (
                <CourseEditModal 
                    onClose={() => setIsCourseModalOpen(false)}
                    // onSave={handleSaveCourse} 
                />
            )}
            {isBatchModalOpen && (
                <BatchEditModal 
                    onClose={() => setIsBatchModalOpen(false)}
                    // onSave={handleSaveBatch}
                    courses={courses} // Pass lists for dropdowns
                    centers={centers} // Pass lists for dropdowns
                />
            )}
        </div>
    );
};

export default ContentManagement;
