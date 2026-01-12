import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaPlus, FaTrash, FaUpload, FaDownload, FaEye, FaEdit, FaSave } from "react-icons/fa";

const GenericCriteriaForm = ({
  title,
  marks,
  fields = [],
  tableConfig = null,
  initialData,
  onSave,
  isCompleted = false,
  isContributorEditable = true,
  saving = false,
}) => {
  const [content, setContent] = useState({});
  const [tableData, setTableData] = useState([]);
  const [files, setFiles] = useState([]);
  const [newFile, setNewFile] = useState({ description: "", file: null });
  const [editMode, setEditMode] = useState(false);

  // Initialize form data
  useEffect(() => {
    if (initialData) {
      setContent(initialData.content || {});
      setTableData(initialData.tableData || []);
      setFiles(initialData.files || []);
      setEditMode(!initialData.content && isContributorEditable);
    }
  }, [initialData, isContributorEditable]);

  // Handle text input changes
  const handleContentChange = (fieldName, value) => {
    setContent((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  // Handle table row changes
  const handleTableRowChange = (index, field, value) => {
    const updatedData = [...tableData];
    if (!updatedData[index]) {
      updatedData[index] = {};
    }
    updatedData[index][field] = value;
    setTableData(updatedData);
  };

  // Add new table row
  const addTableRow = () => {
    const newRow = {};
    if (tableConfig?.columns) {
      tableConfig.columns.forEach((col) => {
        newRow[col.field] = "";
      });
    }
    setTableData([...tableData, newRow]);
  };

  // Remove table row
  const removeTableRow = (index) => {
    const updatedData = [...tableData];
    updatedData.splice(index, 1);
    setTableData(updatedData);
  };

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewFile((prev) => ({
        ...prev,
        file,
        filename: file.name,
      }));
    }
  };

  const addFile = () => {
    if (!newFile.description.trim() || !newFile.file) {
      toast.error("Please provide file description and select a file");
      return;
    }

    const fileWithId = {
      id: `file-${Date.now()}`,
      description: newFile.description,
      filename: newFile.filename,
      file: newFile.file,
      url: URL.createObjectURL(newFile.file),
      isNew: true,
    };

    setFiles([...files, fileWithId]);
    setNewFile({ description: "", file: null, filename: "" });
  };

  const removeFile = (index) => {
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    setFiles(updatedFiles);
  };

  // Calculate total marks
  const calculateMarks = () => {
    let total = 0;
    
    // Calculate from content fields
    fields.forEach((field) => {
      if (!field.hasTable && content[field.name]) {
        const contentValue = content[field.name].toString().trim();
        if (contentValue.length > 0) {
          total += field.marks || 0;
        }
      }
    });
    
    // Calculate from table data (if any table exists)
    if (tableData.length > 0) {
      // Add marks for fields that have tables
      fields.forEach((field) => {
        if (field.hasTable && tableData.length > 0) {
          total += field.marks || 0;
        }
      });
    }
    
    return total;
  };

  const currentMarks = calculateMarks();

  // Handle form submission
  const handleSubmit = () => {
    if (!isContributorEditable) {
      toast.error("You don't have permission to save");
      return;
    }

    const formData = {
      content,
      tableData,
      files: files.map((f) => ({
        description: f.description,
        filename: f.filename,
        url: f.url || "",
        file: f.file,
      })),
    };

    onSave(formData);
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    if (!isContributorEditable) {
      toast.error("You don't have permission to edit");
      return;
    }
    setEditMode(!editMode);
  };

  // If form is completed and not in edit mode, show read-only view
  if (isCompleted && !editMode) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-lg font-semibold text-gray-600">
                Total Marks: {marks}
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Completed
              </span>
            </div>
          </div>
          {isContributorEditable && (
            <button
              onClick={toggleEditMode}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <FaEdit /> Edit
            </button>
          )}
        </div>

        {/* Content Fields (Read-only) */}
        <div className="space-y-6 mb-8">
          {fields.map((field) => (
            <div key={field.name} className="border-b border-gray-100 pb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium text-gray-700">{field.label}</h3>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  Marks: {field.marks}
                </span>
              </div>
              
              {field.hasTable ? (
                <div className="mt-4">
                  <h4 className="text-md font-medium text-gray-600 mb-3">
                    {field.tableConfig?.title || "Table Data"}
                  </h4>
                  {tableData.length > 0 ? (
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            {field.tableConfig?.columns.map((col, idx) => (
                              <th
                                key={idx}
                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                {col.header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {tableData.map((row, rowIndex) => (
                            <tr key={rowIndex} className="hover:bg-gray-50">
                              {field.tableConfig?.columns.map((col, colIndex) => (
                                <td
                                  key={colIndex}
                                  className="px-4 py-3 text-sm text-gray-700"
                                >
                                  {row[col.field] || "-"}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No data available</p>
                  )}
                </div>
              ) : (
                <div className="mt-3">
                  <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                    {content[field.name] || "No content provided"}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Attachments (Read-only) */}
        {files.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Attachments</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {files.map((file, index) => (
                <div
                  key={file.id || index}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-800">{file.description}</h4>
                      <p className="text-sm text-gray-500 mt-1">{file.filename}</p>
                    </div>
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                      title="View file"
                    >
                      <FaEye />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Marks Summary */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-lg font-medium text-gray-700">Marks Summary</h4>
              <p className="text-gray-600">Obtained marks out of {marks}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                {currentMarks}/{marks}
              </div>
              <div className="text-sm text-gray-500">
                {((currentMarks / marks) * 100).toFixed(1)}%
              </div>
            </div>
          </div>
          <div className="mt-4 bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-green-600 h-2.5 rounded-full"
              style={{ width: `${(currentMarks / marks) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  // Edit mode or new form
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-lg font-semibold text-gray-600">
              Total Marks: {marks}
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              Current: {currentMarks}/{marks}
            </span>
            {isCompleted && (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Previously Completed
              </span>
            )}
          </div>
        </div>
        {isContributorEditable && editMode && (
          <button
            onClick={() => setEditMode(false)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            Cancel Edit
          </button>
        )}
      </div>

      {/* Form Fields */}
      <div className="space-y-8">
        {fields.map((field) => (
          <div key={field.name} className="border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-700">{field.label}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {field.hasTable ? "Table input required" : "Text input required"}
                </p>
              </div>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                Marks: {field.marks}
              </span>
            </div>

            {field.hasTable ? (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-md font-medium text-gray-600">
                    {field.tableConfig?.title || "Table Data"}
                  </h4>
                  {isContributorEditable && editMode && (
                    <button
                      type="button"
                      onClick={addTableRow}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      <FaPlus /> Add Row
                    </button>
                  )}
                </div>

                {tableData.length > 0 ? (
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {field.tableConfig?.columns.map((col, idx) => (
                            <th
                              key={idx}
                              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              {col.header}
                            </th>
                          ))}
                          {isContributorEditable && editMode && (
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {tableData.map((row, rowIndex) => (
                          <tr key={rowIndex} className="hover:bg-gray-50">
                            {field.tableConfig?.columns.map((col, colIndex) => (
                              <td key={colIndex} className="px-4 py-3">
                                {isContributorEditable && editMode ? (
                                  <input
                                    type="text"
                                    value={row[col.field] || ""}
                                    onChange={(e) =>
                                      handleTableRowChange(rowIndex, col.field, e.target.value)
                                    }
                                    placeholder={col.placeholder}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                ) : (
                                  <span className="text-gray-700">
                                    {row[col.field] || "-"}
                                  </span>
                                )}
                              </td>
                            ))}
                            {isContributorEditable && editMode && (
                              <td className="px-4 py-3">
                                <button
                                  type="button"
                                  onClick={() => removeTableRow(rowIndex)}
                                  className="text-red-600 hover:text-red-800"
                                  title="Delete row"
                                >
                                  <FaTrash />
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-gray-500">No data added yet</p>
                    {isContributorEditable && editMode && (
                      <button
                        type="button"
                        onClick={addTableRow}
                        className="mt-3 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                      >
                        Add your first row
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div>
                {isContributorEditable && editMode ? (
                  <textarea
                    value={content[field.name] || ""}
                    onChange={(e) => handleContentChange(field.name, e.target.value)}
                    placeholder={field.placeholder || `Enter details for ${field.label}`}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {content[field.name] || "No content provided"}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* File Upload Section */}
      {isContributorEditable && editMode && (
        <div className="mt-8 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Upload Supporting Documents</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* File Input */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File Description
                </label>
                <input
                  type="text"
                  value={newFile.description}
                  onChange={(e) =>
                    setNewFile({ ...newFile, description: e.target.value })
                  }
                  placeholder="E.g., Faculty certificates, Attendance sheets"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select File
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <button
                    type="button"
                    onClick={addFile}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    <FaUpload /> Upload
                  </button>
                </div>
              </div>
            </div>

            {/* File List */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Uploaded Files ({files.length})
              </label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {files.map((file, index) => (
                  <div
                    key={file.id || index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">
                        {file.description}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{file.filename}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {file.url && (
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                          title="View file"
                        >
                          <FaEye />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-600 hover:text-red-800"
                        title="Remove file"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
                {files.length === 0 && (
                  <p className="text-gray-500 text-sm italic p-3 bg-gray-50 rounded-lg">
                    No files uploaded yet
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-lg font-medium text-gray-700">Progress Summary</h4>
            <div className="flex items-center gap-4 mt-2">
              <div className="text-lg font-bold text-blue-600">
                {currentMarks}/{marks} marks
              </div>
              <div className="text-sm text-gray-600">
                {fields.filter(f => f.hasTable ? tableData.length > 0 : content[f.name]).length}/{fields.length} sections filled
              </div>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${(currentMarks / marks) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <div className="flex gap-4">
            {isContributorEditable && !editMode && (
              <button
                type="button"
                onClick={toggleEditMode}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                <FaEdit /> Edit Form
              </button>
            )}
            
            {isContributorEditable && editMode && (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave /> Save Changes
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenericCriteriaForm;