import React, { useState, useEffect, useCallback } from "react";
import { Editor } from "react-editor";
import Modal from "react-modal";
import MergePdfModal from "../MergePdfModal";
import { toast } from "react-toastify";
import { nbaDashboardService } from "../../Services/NBA-dashboard.service";
import {
  Trash2, Plus, FileText, Save, CheckCircle,
  Upload, X, Edit, Calculator, Users, Hash,
  UserPlus, Award, Calendar, Clock
} from "lucide-react";

Modal.setAppElement("#root");

// Faculty Development Table Component
const FacultyDevelopmentTable = ({ data, onChange, disabled, rfValue, setRfValue }) => {
  const [rows, setRows] = useState(() => {
    if (data && data.length > 0) {
      return data;
    }
    return [
      { 
        id: "faculty_1", 
        name: "", 
        CAYm1: "", 
        CAYm2: "", 
        CAYm3: "",
        maxPerYear: 5
      }
    ];
  });

  // Calculate sums for each year
  const calculateSums = () => {
    const sums = { CAYm1: 0, CAYm2: 0, CAYm3: 0 };
    rows.forEach(row => {
      sums.CAYm1 += parseFloat(row.CAYm1) || 0;
      sums.CAYm2 += parseFloat(row.CAYm2) || 0;
      sums.CAYm3 += parseFloat(row.CAYm3) || 0;
    });
    return sums;
  };

  // Calculate assessment for a year
  const calculateAssessment = (yearSum) => {
    if (rfValue <= 0) return 0;
    const assessment = 3 * yearSum / (0.5 * rfValue);
    return Math.min(assessment, 15); // Limit to 15 marks
  };

  // Calculate average assessment
  const calculateAverageAssessment = () => {
    const sums = calculateSums();
    const assessments = {
      CAYm1: calculateAssessment(sums.CAYm1),
      CAYm2: calculateAssessment(sums.CAYm2),
      CAYm3: calculateAssessment(sums.CAYm3)
    };
    const average = (assessments.CAYm1 + assessments.CAYm2 + assessments.CAYm3) / 3;
    return Math.min(average, 15);
  };

  const sums = calculateSums();
  const assessments = {
    CAYm1: calculateAssessment(sums.CAYm1),
    CAYm2: calculateAssessment(sums.CAYm2),
    CAYm3: calculateAssessment(sums.CAYm3)
  };
  const averageAssessment = calculateAverageAssessment();

  // Update rows when data prop changes
  useEffect(() => {
    if (data && data.length > 0) {
      setRows(data);
    }
  }, [data]);

  const handleChange = useCallback((id, field, value) => {
    setRows(prevRows => {
      const updatedRows = prevRows.map(row => {
        if (row.id === id) {
          // Validate max 5 points per year
          if (field.startsWith("CAY") && parseFloat(value) > 5) {
            toast.warning("Maximum 5 points per faculty per year");
            return { ...row, [field]: "5" };
          }
          return { ...row, [field]: value };
        }
        return row;
      });
      
      // Notify parent component
      setTimeout(() => {
        onChange(updatedRows);
      }, 0);
      
      return updatedRows;
    });
  }, [onChange]);

  const addRow = () => {
    const newRow = {
      id: `faculty_${Date.now()}`,
      name: "",
      CAYm1: "",
      CAYm2: "",
      CAYm3: "",
      maxPerYear: 5
    };
    const newRows = [...rows, newRow];
    setRows(newRows);
    onChange(newRows);
  };

  const removeRow = (id) => {
    if (rows.length <= 1) {
      toast.warning("At least one faculty member is required");
      return;
    }
    const newRows = rows.filter(row => row.id !== id);
    setRows(newRows);
    onChange(newRows);
  };

  return (
    <div className="space-y-6">
      {/* Information Panel */}
      <div className="p-4 bg-[#2163c1] rounded-lg border border-indigo-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg">
            <Award className="w-5 h-5 text-[#2163c1]" />
          </div>
          <div>
            <h4 className="font-bold text-white">Faculty Development Points Calculation</h4>
            <p className="text-sm text-white mt-1">
              <strong>Workshop/FDP lasting 2-5 days:</strong> 3 points<br />
              <strong>Workshop/FDP lasting more than 5 days:</strong> 5 points<br />
              <strong>Maximum per faculty per year:</strong> 5 points
            </p>
          </div>
        </div>
      </div>
      
      {/* Faculty Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-lg">
        <table className="w-full bg-white">
          <thead>
            <tr className="bg-[#2163c1] text-white">
              <th className="p-4 text-left font-semibold w-12">SN.</th>
              <th className="p-4 text-left font-semibold">Name of the Faculty</th>
              <th className="p-4 text-center font-semibold">Max. 5 per Faculty</th>
              <th className="p-4 text-center font-semibold">CAYm1</th>
              <th className="p-4 text-center font-semibold">CAYm2</th>
              <th className="p-4 text-center font-semibold">CAYm3</th>
              {!disabled && (
                <th className="p-4 text-center font-semibold">Action</th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id} className="border-b hover:bg-gray-50">
                <td className="p-4 text-center font-medium text-gray-600">
                  {String.fromCharCode(65 + index)}
                </td>
                <td className="p-4">
                  <input
                    type="text"
                    value={row.name || ""}
                    onChange={(e) => handleChange(row.id, 'name', e.target.value)}
                    disabled={disabled}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter faculty name"
                  />
                </td>
                <td className="p-4 text-center">
                  <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    5
                  </div>
                </td>
                <td className="p-4">
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.5"
                    value={row.CAYm1 || ""}
                    onChange={(e) => handleChange(row.id, 'CAYm1', e.target.value)}
                    disabled={disabled}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0-5"
                  />
                </td>
                <td className="p-4">
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.5"
                    value={row.CAYm2 || ""}
                    onChange={(e) => handleChange(row.id, 'CAYm2', e.target.value)}
                    disabled={disabled}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0-5"
                  />
                </td>
                <td className="p-4">
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.5"
                    value={row.CAYm3 || ""}
                    onChange={(e) => handleChange(row.id, 'CAYm3', e.target.value)}
                    disabled={disabled}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0-5"
                  />
                </td>
                {!disabled && (
                  <td className="p-4 text-center">
                    <button
                      onClick={() => removeRow(row.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Remove faculty"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
            
            {/* Sum Row */}
            <tr className="bg-blue-50 font-semibold">
              <td className="p-4 text-center">Sum</td>
              <td className="p-4 text-center">-</td>
              <td className="p-4 text-center">-</td>
              <td className="p-4 text-center text-blue-700">
                {sums.CAYm1.toFixed(1)}
              </td>
              <td className="p-4 text-center text-blue-700">
                {sums.CAYm2.toFixed(1)}
              </td>
              <td className="p-4 text-center text-blue-700">
                {sums.CAYm3.toFixed(1)}
              </td>
              {!disabled && (
                <td className="p-4 text-center">
                  <button
                    onClick={addRow}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                    title="Add faculty"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </td>
              )}
            </tr>
          </tbody>
        </table>
      </div>
      
      {/* Calculation Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* RF Input */}
        <div className="p-6 bg-[#2163c1] rounded-lg border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white rounded-lg">
              <Calculator className="w-5 h-5 text-[#2163c1]" />
            </div>
            <h4 className="font-bold text-white">RF Calculation</h4>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                RF = Number of Faculty required to comply with 15:1 Student-Faculty ratio as per 5.1
              </label>
              <input
                type="number"
                min="1"
                value={rfValue || ""}
                onChange={(e) => setRfValue(parseFloat(e.target.value) || 1)}
                disabled={disabled}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter RF value"
              />
            </div>
          </div>
        </div>
        
        {/* Assessment Results */}
        <div className="p-6 bg-[#2163c1] rounded-lg border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white rounded-lg">
              <Award className="w-5 h-5 text-[#2163c1]" />
            </div>
            <h4 className="font-bold text-white">Assessment Results</h4>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-white rounded-lg border">
                <div className="text-xs text-gray-500 mb-1">CAYm1</div>
                <div className="text-lg font-bold text-[#2163c1]">
                  {assessments.CAYm1.toFixed(2)}
                </div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border">
                <div className="text-xs text-gray-500 mb-1">CAYm2</div>
                <div className="text-lg font-bold text-[#2163c1]">
                  {assessments.CAYm2.toFixed(2)}
                </div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border">
                <div className="text-xs text-gray-500 mb-1">CAYm3</div>
                <div className="text-lg font-bold text-[#2163c1]">
                  {assessments.CAYm3.toFixed(2)}
                </div>
              </div>
            </div>
            
            {/* Average Assessment */}
            <div className="mt-4 p-4 bg-white rounded-lg border border-purple-200">
              <div className="text-center">
                <div className="text-sm text-[#2163c1] font-medium mb-1">
                  Average assessment over three years (Marks limited to 15)
                </div>
                <div className="text-2xl font-bold text-[#2163c1]">
                  {averageAssessment.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Formula Explanation */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-start gap-2">
          <div className="text-amber-600 font-bold mt-0.5">📝 Formula:</div>
          <div className="text-sm text-amber-800">
            <p><strong>Assessment = 3 × Sum / (0.5 × RF)</strong> (Marks limited to 15)</p>
            <p className="mt-1 text-xs">Where Sum = Total points earned by all faculty in that year</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component - Generic Criteria Form 5.6
const GenericCriteriaForm5_6 = ({
  title = "5.6 Faculty as Participants in Faculty Development/Training Activities/STTPs (15)",
  marks = 15,
  fields = [],
  initialData = null,
  onSave,
  onDelete,
  isCompleted = false,
  isContributorEditable = true,
  saving = false,
}) => {
  const [isEditMode, setIsEditMode] = useState(!isCompleted);

  const safeContent = initialData?.content || {};
  const safeTableData = initialData?.tableData || {};
  
  const [filesByField, setFilesByField] = useState(() => {
    if (initialData?.filesByField) {
      return initialData.filesByField;
    }

    const init = {};
    fields.forEach((field) => {
      init[field.name] = [];
    });
    return init;
  });

  const [formValues, setFormValues] = useState(safeContent);
  const [tableData, setTableData] = useState(safeTableData);
  const [rfValue, setRfValue] = useState(initialData?.rfValue || 10);
  const [previewModal, setPreviewModal] = useState({ isOpen: false, file: null });
  const [mergeModal, setMergeModal] = useState({ isOpen: false, fieldName: null });

  // Update state when initialData changes
  useEffect(() => {
    if (initialData?.content) {
      setFormValues(initialData.content);
    }
    if (initialData?.tableData) {
      setTableData(initialData.tableData);
    }
    if (initialData?.filesByField) {
      setFilesByField(initialData.filesByField);
    }
    if (initialData?.rfValue) {
      setRfValue(initialData.rfValue);
    }
  }, [initialData]);

  const handleTableChange = (tableKey, newData) => {
    setTableData(prev => ({ ...prev, [tableKey]: newData }));
  };

  const addFileRow = (fieldName) => {
    setFilesByField((prev) => ({
      ...prev,
      [fieldName]: [
        ...(prev[fieldName] || []),
        { id: `file-${Date.now()}-${fieldName}-${Math.random()}`, description: "", file: null, filename: "", s3Url: "", uploading: false },
      ],
    }));
  };

  const updateFileDescription = (fieldName, index, value) => {
    setFilesByField((prev) => ({
      ...prev,
      [fieldName]: prev[fieldName].map((f, i) => (i === index ? { ...f, description: value } : f)),
    }));
  };

  const handleFileChange = async (fieldName, index, newFile) => {
    if (!newFile || !(newFile instanceof File)) {
      toast.error("Invalid file");
      return;
    }

    const currentRow = filesByField[fieldName][index];

    setFilesByField(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].map((f, i) =>
        i === index ? { ...f, file: newFile, filename: newFile.name, uploading: true } : f
      )
    }));

    try {
      const formData = new FormData();
      formData.append("file", newFile);
      
      if (currentRow.description?.trim()) {
        formData.append("description", currentRow.description.trim());
      }

      const resData = await nbaDashboardService.uploadFile(formData);
      const s3Url = typeof resData === 'string' ? resData : (resData || resData || "");

      setFilesByField(prev => ({
        ...prev,
        [fieldName]: prev[fieldName].map((f, i) =>
          i === index
            ? { ...f, s3Url: s3Url, filename: newFile.name, uploading: false }
            : f
        )
      }));

      toast.success("Uploaded successfully!");
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error("Upload failed");

      setFilesByField(prev => ({
        ...prev,
        [fieldName]: prev[fieldName].map((f, i) =>
          i === index ? { ...f, uploading: false, file: null, filename: "", s3Url: "" } : f
        )
      }));
    }
  };

  const removeFileRow = (fieldName, index) => {
    setFilesByField((prev) => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((_, i) => i !== index),
    }));
  };

  const handleSave = () => {
    onSave({
      content: formValues,
      tableData,
      rfValue,
      filesByField,
    });
    setIsEditMode(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-[#2163c1] text-white p-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <UserPlus className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{title}</h2>
              <div className="flex items-center gap-2 mt-2">
                <div className="px-3 py-1 bg-white/20 rounded-full text-sm">
                  {marks} Marks
                </div>
                <div className="text-sm opacity-90">Criterion 5.6 - Faculty Development Activities</div>
              </div>
            </div>
          </div>
          {!isCompleted && (
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`p-3 rounded-xl transition-all shadow-lg flex items-center justify-center ${
                isEditMode ? "bg-red-500 hover:bg-red-600 text-white" : "bg-white hover:bg-gray-100 text-[#2163c1]"
              }`}
              title={isEditMode ? "Cancel Editing" : "Edit Section"}
            >
              {isEditMode ? <X className="w-5 h-5" /> : <Edit className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      <div className="p-8 space-y-12">
        {fields.map((field) => (
          <div key={field.name} className="space-y-6">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-[#2163c1]" />
                <h3 className="text-xl font-bold text-gray-800">{field.label}</h3>
              </div>
              {field.marks && (
                <div className="px-3 py-1 bg-[#2163c1] text-white rounded-full text-sm font-medium">
                  {field.marks} Marks
                </div>
              )}
            </div>

            {field.hasTable ? (
              <FacultyDevelopmentTable
                data={tableData[field.tableKey] || []}
                onChange={(newData) => handleTableChange(field.tableKey, newData)}
                disabled={!isEditMode}
                rfValue={rfValue}
                setRfValue={setRfValue}
              />
            ) : (
              <div className="border-2 border-gray-300 rounded-b-lg bg-white">
                <Editor
                  value={formValues[field.name] || ""}
                  onChange={(val) => setFormValues(prev => ({ ...prev, [field.name]: val }))}
                  disabled={!isEditMode || isCompleted}
                  style={{ minHeight: 240, padding: 16, fontSize: 16 }}
                  className="focus:outline-none"
                />
              </div>
            )}

            {/* Supporting Documents Section */}
            {isEditMode && !isCompleted && (
              <div className="mt-6 p-6 bg-gray-50 rounded-xl border">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-bold text-[#2163c1] flex items-center gap-2">
                    <Upload className="w-6 h-6" /> Supporting Documents
                  </h4>
                  {filesByField[field.name]?.some((f) => f.filename?.toLowerCase().endsWith(".pdf")) && (
                    <button
                      onClick={() => setMergeModal({ isOpen: true, fieldName: field.name })}
                        className="px-5 py-2.5 bg-[#2163c1] text-white font-medium rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                    >
                      <FileText className="w-5 h-5" /> Merge PDFs
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Always show the first file upload row */}
                  <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-300">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Document description (e.g., FDP certificates, STTP records)"
                        value={(filesByField[field.name]?.[0]?.description) || ""}
                        onChange={(e) => {
                          if (!filesByField[field.name]?.[0]) {
                            addFileRow(field.name);
                          }
                          updateFileDescription(field.name, 0, e.target.value);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="w-64">
                      {filesByField[field.name]?.[0]?.uploading ? (
                        <div className="flex items-center gap-2 text-gray-500">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                          <span>Uploading...</span>
                        </div>
                      ) : filesByField[field.name]?.[0]?.filename ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <button
                            onClick={() => setPreviewModal({ isOpen: true, file: filesByField[field.name][0] })}
                            className="text-blue-600 font-medium hover:underline truncate max-w-48"
                            title={filesByField[field.name][0].filename}
                          >
                            {filesByField[field.name][0].filename}
                          </button>
                        </div>
                      ) : (
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            if (!filesByField[field.name]?.[0]) {
                              addFileRow(field.name);
                            }
                            handleFileChange(field.name, 0, e.target.files?.[0]);
                          }}
                          className="block w-full text-sm border-0 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:bg-[#2163c1] file:text-white"
                        />
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => addFileRow(field.name)}
                        className="text-green-600 hover:bg-green-50 p-2 rounded transition"
                        title="Add another document"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                      {filesByField[field.name]?.[0] && (
                        <button
                          onClick={() => removeFileRow(field.name, 0)}
                          className="text-red-500 hover:bg-red-50 p-2 rounded transition"
                          title="Remove document"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Show additional document rows if any */}
                  {(filesByField[field.name] || []).slice(1).map((file, index) => {
                    const actualIndex = index + 1;
                    return (
                      <div key={file.id || `file-${actualIndex}`} className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-300">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={file.description || ""}
                            onChange={(e) => updateFileDescription(field.name, actualIndex, e.target.value)}
                            placeholder="Document description"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div className="w-64">
                          {file.uploading ? (
                            <div className="flex items-center gap-2 text-gray-500">
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                              <span>Uploading...</span>
                            </div>
                          ) : file.filename ? (
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <button
                                onClick={() => setPreviewModal({ isOpen: true, file })}
                                className="text-blue-600 font-medium hover:underline truncate max-w-48"
                                title={file.filename}
                              >
                                {file.filename}
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <input
                                type="file"
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                onChange={(e) => handleFileChange(field.name, actualIndex, e.target.files?.[0])}
                                className="block w-full text-sm border-0 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:bg-indigo-600 file:text-white"
                              />
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => addFileRow(field.name)}
                            className="text-green-600 hover:bg-green-50 p-2 rounded transition"
                            title="Add another document"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => removeFileRow(field.name, actualIndex)}
                            className="text-red-500 hover:bg-red-50 p-2 rounded transition"
                            title="Remove document"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}

        {isEditMode && !isCompleted && (
          <div className="text-center pt-10 flex gap-4 justify-center">
            <button
              onClick={handleSave}
              disabled={saving || !isContributorEditable}
              className={`inline-flex items-center justify-center w-12 h-12 rounded-lg transition-all ${
                saving || !isContributorEditable
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl"
              }`}
              title={saving ? "Saving..." : !isContributorEditable ? "Not allowed to save" : "Save"}
            >
              {saving ? (
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
              ) : (
                <Save className="w-6 h-6" />
              )}
            </button>

            <button
              onClick={() => setIsEditMode(false)}
              disabled={saving}
              className="inline-flex items-center justify-center w-12 h-12 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition shadow-lg"
              title="Cancel"
            >
              <X className="w-6 h-6" />
            </button>

            <button
              onClick={onDelete}
              className="inline-flex items-center justify-center w-12 h-12 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow-lg"
              title="Delete Section Data"
            >
              <Trash2 className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>

      {/* Preview & Merge Modals */}
      <Modal
        isOpen={previewModal.isOpen}
        onRequestClose={() => setPreviewModal({ isOpen: false, file: null })}
        className="fixed inset-4 bg-white rounded-2xl shadow-2xl overflow-hidden outline-none"
        overlayClassName="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
      >
        {previewModal.file && (
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center p-6 bg-[#2163c1] text-white">
              <h3 className="text-xl font-bold">{previewModal.file.filename}</h3>
              <button onClick={() => setPreviewModal({ isOpen: false, file: null })}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <iframe
              src={previewModal.file.s3Url}
              title={previewModal.file.filename}
              className="flex-1 w-full"
            />
          </div>
        )}
      </Modal>

      <MergePdfModal
        isOpen={mergeModal.isOpen}
        pdfFiles={filesByField[mergeModal.fieldName] || []}
        onClose={() => setMergeModal({ isOpen: false, fieldName: null })}
        onFileAdd={(mergedDocument) => {
          const mergedFile = {
            id: mergedDocument.id,
            filename: mergedDocument.filename,
            description: mergedDocument.description,
            s3Url: mergedDocument.s3Url,
            uploading: false,
            isMerged: true,
          };
          setFilesByField((prev) => ({
            ...prev,
            [mergeModal.fieldName]: [...(prev[mergeModal.fieldName] || []), mergedFile],
          }));
          setMergeModal({ isOpen: false, fieldName: null });
        }}
      />
    </div>
  );
};

export default GenericCriteriaForm5_6;