import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

/**
 * NEW: Modal form for Admins to create or edit a Course.
 * This component demonstrates the multilingual input fields.
 */
const CourseEditModal = ({ onClose, onSave, existingCourse }) => {
    const { t } = useTranslation();
    const [activeLang, setActiveLang] = useState('en');
    const [iconUrl, setIconUrl] = useState('');

    // State to hold the translations
    const [translations, setTranslations] = useState({
        en: { name: '', description: '', eligibilityCriteria: '', careerPath: '' },
        hi: { name: '', description: '', eligibilityCriteria: '', careerPath: '' },
        te: { name: '', description: '', eligibilityCriteria: '', careerPath: '' },
    });

    // Handle form field changes for the currently active language
    const handleLangChange = (e) => {
        const { name, value } = e.target;
        setTranslations(prev => ({
            ...prev,
            [activeLang]: {
                ...prev[activeLang],
                [name]: value
            }
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        toast.success("Save logic not implemented yet.");
        // onSave({ iconUrl, translations });
    };

    const langTabs = [
        { code: 'en', name: t('admin.content.english') },
        { code: 'hi', name: t('admin.content.hindi') },
        { code: 'te', name: t('admin.content.telugu') },
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b">
                        <h3 className="text-lg font-semibold text-gray-800">{t('admin.content.edit_course')}</h3>
                    </div>

                    {/* Language TABS */}
                    <div className="p-6 border-b">
                        <nav className="flex space-x-4">
                            {langTabs.map(tab => (
                                <button
                                    type="button"
                                    key={tab.code}
                                    onClick={() => setActiveLang(tab.code)}
                                    className={`px-3 py-2 font-medium text-sm rounded-md ${activeLang === tab.code ? 'bg-strive-blue text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                                >
                                    {tab.name}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Form Fields for the active language */}
                    <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                        <p className="text-sm font-semibold">Editing content for: <span className="uppercase font-bold text-strive-orange">{activeLang}</span></p>
                        <div>
                            <label className="block text-sm font-medium">{t('admin.content.course_name')}</label>
                            <input type="text" name="name" value={translations[activeLang].name} onChange={handleLangChange} className="mt-1 block w-full border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">{t('admin.content.description')}</label>
                            <textarea name="description" rows="3" value={translations[activeLang].description} onChange={handleLangChange} className="mt-1 block w-full border border-gray-300 rounded-md"></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">{t('admin.content.eligibility')}</label>
                            <textarea name="eligibilityCriteria" rows="2" value={translations[activeLang].eligibilityCriteria} onChange={handleLangChange} className="mt-1 block w-full border border-gray-300 rounded-md"></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">{t('admin.content.career_path')}</label>
                            <textarea name="careerPath" rows="2" value={translations[activeLang].careerPath} onChange={handleLangChange} className="mt-1 block w-full border border-gray-300 rounded-md"></textarea>
                        </div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 border-t flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-strive-blue text-white rounded-md">Save Course</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CourseEditModal;
