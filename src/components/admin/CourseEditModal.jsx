import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { createCourse, updateCourse } from '../../services/apiService';

/**
 * Modal for creating or editing a Course.
 * - Supports multilingual tabs (English, Hindi, Telugu)
 * - Works with new CourseDto / CourseTranslationDto structure
 */
const CourseEditModal = ({ onClose, onCourseSaved, existingCourse }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [activeLang, setActiveLang] = useState('en');
  const [iconUrl, setIconUrl] = useState(existingCourse?.iconUrl || '');

  // Initialize multilingual form fields
  const [translations, setTranslations] = useState({
    en: { name: '', description: '', eligibilityCriteria: '', careerPath: '' },
    hi: { name: '', description: '', eligibilityCriteria: '', careerPath: '' },
    te: { name: '', description: '', eligibilityCriteria: '', careerPath: '' },
  });

  /** 🔹 Pre-fill data when editing an existing course */
  useEffect(() => {
    if (existingCourse?.translations?.length > 0) {
      const initialTranslations = { ...translations };
      existingCourse.translations.forEach((t) => {
        const lang = t.languageCode?.toLowerCase();
        if (initialTranslations[lang]) {
          initialTranslations[lang] = {
            name: t.name || '',
            description: t.description || '',
            eligibilityCriteria: t.eligibilityCriteria || '',
            careerPath: t.careerPath || '',
          };
        }
      });
      setTranslations(initialTranslations);
    }
  }, [existingCourse]);

  /** 🔹 Update text fields for current active language */
  const handleLangChange = (e) => {
    const { name, value } = e.target;
    setTranslations((prev) => ({
      ...prev,
      [activeLang]: {
        ...prev[activeLang],
        [name]: value,
      },
    }));
  };

  /** 🔹 Submit new or edited course */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const toastId = toast.loading(existingCourse ? 'Updating Course...' : 'Creating Course...');

    const translationList = Object.keys(translations).map((langCode) => ({
      languageCode: langCode.toUpperCase(),
      ...translations[langCode],
    }));

    const courseData = {
      iconUrl,
      tenantId: 'STRIVE', // ✅ Adjust this if tenant is dynamic
      translations: translationList,
    };

    try {
      if (existingCourse) {
        await updateCourse(existingCourse.courseId, courseData);
        toast.success('Course updated successfully!', { id: toastId });
      } else {
        await createCourse(courseData);
        toast.success('New Course created successfully!', { id: toastId });
      }

      if (onCourseSaved) onCourseSaved();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save course.';
      toast.error(msg, { id: toastId });
      console.error('Course Save Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const langTabs = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' },
    { code: 'te', name: 'Telugu' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">
              {existingCourse ? 'Edit Course' : 'Add New Course'}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-800 text-2xl font-bold leading-none"
            >
              &times;
            </button>
          </div>

          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Icon URL */}
            <div>
              <label className="block text-sm font-medium">Icon URL</label>
              <input
                type="text"
                value={iconUrl}
                onChange={(e) => setIconUrl(e.target.value)}
                placeholder="fa-briefcase or image URL"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
            </div>

            {/* Language Tabs */}
            <div className="border-b pt-4">
              <nav className="flex space-x-4">
                {langTabs.map((tab) => (
                  <button
                    type="button"
                    key={tab.code}
                    onClick={() => setActiveLang(tab.code)}
                    className={`px-3 py-2 font-medium text-sm rounded-t-md border-b-2 transition-all ${
                      activeLang === tab.code
                        ? 'border-strive-blue text-strive-blue'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>

            <p className="text-sm font-semibold pt-4">
              Editing content for:{' '}
              <span className="uppercase font-bold text-strive-orange">{activeLang}</span>
            </p>

            {/* Dynamic Language Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Course Name</label>
                <input
                  type="text"
                  name="name"
                  value={translations[activeLang].name}
                  onChange={handleLangChange}
                  required={activeLang === 'en'}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Description</label>
                <textarea
                  name="description"
                  rows="3"
                  value={translations[activeLang].description}
                  onChange={handleLangChange}
                  required={activeLang === 'en'}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium">Eligibility Criteria</label>
                <textarea
                  name="eligibilityCriteria"
                  rows="2"
                  value={translations[activeLang].eligibilityCriteria}
                  onChange={handleLangChange}
                  required={activeLang === 'en'}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium">Career Path</label>
                <textarea
                  name="careerPath"
                  rows="2"
                  value={translations[activeLang].careerPath}
                  onChange={handleLangChange}
                  required={activeLang === 'en'}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                ></textarea>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-50 border-t flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-strive-blue text-white rounded-md hover:bg-opacity-90 disabled:bg-gray-400"
            >
              {loading ? 'Saving...' : 'Save Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseEditModal;
