// src/components/admin/PostUpskillingModal.jsx
import React, { useState } from 'react';
import {
  createUpskillingOpportunity,
  updateUpskillingOpportunity,
  deleteUpskillingOpportunity,
} from '../../services/apiService';
import toast from 'react-hot-toast';

/**
 * Modal for Admin to Create / Edit / Delete Upskilling Opportunities.
 */
const PostUpskillingModal = ({ onClose, onSaved, existingOpportunity }) => {
  const isEditMode = !!existingOpportunity;

  const [title, setTitle] = useState(existingOpportunity?.title || '');
  const [description, setDescription] = useState(existingOpportunity?.description || '');
  const [startDate, setStartDate] = useState(existingOpportunity?.startDate || '');
  const [endDate, setEndDate] = useState(existingOpportunity?.endDate || '');
  const [link, setLink] = useState(existingOpportunity?.link || '');
  const [loading, setLoading] = useState(false);

  /** CREATE or UPDATE Opportunity */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = { title, description, startDate, endDate, link };

    try {
      if (isEditMode) {
        await updateUpskillingOpportunity(existingOpportunity.opportunityId, data);
        toast.success('Opportunity updated successfully!');
      } else {
        await createUpskillingOpportunity(data);
        toast.success('Opportunity created successfully!');
      }
      onSaved?.();
      onClose();
    } catch (err) {
      console.error('Error saving opportunity:', err);
      toast.error('Failed to save opportunity');
    } finally {
      setLoading(false);
    }
  };

  /** DELETE Opportunity */
  const handleDelete = async () => {
    if (!existingOpportunity) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${existingOpportunity.title}"?`
    );
    if (!confirmDelete) return;

    setLoading(true);
    try {
      await deleteUpskillingOpportunity(existingOpportunity.opportunityId);
      toast.success('Opportunity deleted successfully!');
      onSaved?.();
      onClose();
    } catch (err) {
      console.error('Error deleting opportunity:', err);
      toast.error('Failed to delete opportunity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">
            {isEditMode ? 'Edit Upskilling Opportunity' : 'Post New Upskilling Opportunity'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-800 text-xl font-bold"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium">Title</label>
            <input
              type="text"
              className="mt-1 w-full border border-gray-300 rounded-md p-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              className="mt-1 w-full border border-gray-300 rounded-md p-2"
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Start Date</label>
              <input
                type="date"
                className="mt-1 w-full border border-gray-300 rounded-md p-2"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">End Date</label>
              <input
                type="date"
                className="mt-1 w-full border border-gray-300 rounded-md p-2"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Application Link</label>
            <input
              type="url"
              className="mt-1 w-full border border-gray-300 rounded-md p-2"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://example.com/apply"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            {isEditMode && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                disabled={loading}
              >
                Delete
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-strive-blue text-white rounded-md hover:bg-opacity-90 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Saving...' : isEditMode ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostUpskillingModal;
  