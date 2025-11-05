import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";

/**
 * EditJobModal — Admin/Alumnus modal for editing an existing job posting.
 * Reuses the same design as PostJobModal for consistency.
 */
const EditJobModal = ({ existingJob, onClose, onSave }) => {
  const [title, setTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [hrContactEmail, setHrContactEmail] = useState("");
  const [hrContactPhone, setHrContactPhone] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (existingJob) {
      setTitle(existingJob.title || "");
      setCompanyName(existingJob.companyName || "");
      setLocation(existingJob.location || "");
      setDescription(existingJob.description || "");
      setHrContactEmail(existingJob.hrContactEmail || "");
      setHrContactPhone(existingJob.hrContactPhone || "");
    }
  }, [existingJob]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const updatedJob = {
      title,
      companyName,
      location,
      description,
      hrContactEmail,
      hrContactPhone,
    };
    await onSave(existingJob.jobId, updatedJob);
    setLoading(false);
  };

  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">Edit Job</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-800"
            aria-label="Close modal"
          >
            <i className="fa fa-times fa-lg"></i>
          </button>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Job Title */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700"
                >
                  Job Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-strive-blue focus:border-strive-blue"
                />
              </div>

              {/* Company Name */}
              <div>
                <label
                  htmlFor="companyName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Company Name
                </label>
                <input
                  type="text"
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-strive-blue focus:border-strive-blue"
                />
              </div>

              {/* Location */}
              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-700"
                >
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-strive-blue focus:border-strive-blue"
                />
              </div>

              {/* HR Contact Email */}
              <div>
                <label
                  htmlFor="hrContactEmail"
                  className="block text-sm font-medium text-gray-700"
                >
                  HR Contact Email
                </label>
                <input
                  type="email"
                  id="hrContactEmail"
                  value={hrContactEmail}
                  onChange={(e) => setHrContactEmail(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-strive-blue focus:border-strive-blue"
                />
              </div>

              {/* HR Contact Phone */}
              <div>
                <label
                  htmlFor="hrContactPhone"
                  className="block text-sm font-medium text-gray-700"
                >
                  HR Contact Phone
                </label>
                <input
                  type="text"
                  id="hrContactPhone"
                  value={hrContactPhone}
                  onChange={(e) => setHrContactPhone(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-strive-blue focus:border-strive-blue"
                />
              </div>

              {/* Job Description */}
              <div className="md:col-span-2">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Job Description
                </label>
                <textarea
                  id="description"
                  rows="4"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-strive-blue focus:border-strive-blue"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-gray-50 border-t flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-strive-blue text-white text-sm font-medium rounded-md hover:bg-opacity-90 disabled:bg-gray-400"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.getElementById("modal-root"));
};

export default EditJobModal;
