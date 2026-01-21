// GenericCriteriaForm5_2.jsx
import React, { useState, useEffect } from "react";
import { Editor } from "react-editor";
import Modal from "react-modal";
import MergePdfModal from "../MergePdfModal";
import { toast } from "react-toastify";
import { nbaDashboardService } from "../../Services/NBA-dashboard.service";
import {
  Trash2, Plus, FileText, Save, CheckCircle,
  Upload, X, Edit, Calculator, Eye, Clock, Check, AlertCircle
} from "lucide-react";
Modal.setAppElement("#root");

// Faculty Cadre Proportion Table Component
const FacultyCadreTable = ({ columns, data = [], onChange, disabled, tableConfig, approvalStatus }) => {
  const [rows, setRows] = useState(() => {
    if (data.length > 0) return data;

    // Initialize with empty data for each year
    return (tableConfig?.years || ["CAY", "CAYm1", "CAYm2"]).map((year, index) => ({
      id: `row-${index}`,
      year: year,
      RF1: "",
      AF1: "",
      RF2: "",
      AF2: "",
      RF3: "",
      AF3: ""
    }));
  });

  const handleChange = (rowId, field, value) => {
    const updatedRows = rows.map(row => {
      if (row.id === rowId) {
        return { ...row, [field]: value };
      }
      return row;
    });

    setRows(updatedRows);
    onChange(updatedRows);
  };

  // Calculate average row
  const calculateAverage = () => {
    const numericRows = rows.filter(row =>
      parseFloat(row.RF1) >= 0 && parseFloat(row.RF2) >= 0 && parseFloat(row.RF3) >= 0
    );

    if (numericRows.length === 0) return null;

    const average = {
      id: "average",
      year: "Average Numbers",
      RF1: (numericRows.reduce((sum, row) => sum + parseFloat(row.RF1 || 0), 0) / numericRows.length).toFixed(2),
      AF1: (numericRows.reduce((sum, row) => sum + parseFloat(row.AF1 || 0), 0) / numericRows.length).toFixed(2),
      RF2: (numericRows.reduce((sum, row) => sum + parseFloat(row.RF2 || 0), 0) / numericRows.length).toFixed(2),
      AF2: (numericRows.reduce((sum, row) => sum + parseFloat(row.AF2 || 0), 0) / numericRows.length).toFixed(2),
      RF3: (numericRows.reduce((sum, row) => sum + parseFloat(row.RF3 || 0), 0) / numericRows.length).toFixed(2),
      AF3: (numericRows.reduce((sum, row) => sum + parseFloat(row.AF3 || 0), 0) / numericRows.length).toFixed(2),
    };

    return average;
  };

  // Calculate marks based on average values
  const calculateMarks = (averageRow) => {
    if (!averageRow) return 0;

    const AF1 = parseFloat(averageRow.AF1) || 0;
    const RF1 = parseFloat(averageRow.RF1) || 1;
    const AF2 = parseFloat(averageRow.AF2) || 0;
    const RF2 = parseFloat(averageRow.RF2) || 1;
    const AF3 = parseFloat(averageRow.AF3) || 0;
    const RF3 = parseFloat(averageRow.RF3) || 1;

    // If both AF1 and AF2 are 0, then zero marks
    if (AF1 === 0 && AF2 === 0) return 0;

    // Calculate marks based on formula: ⌈ AF1/RF1 + (AF2/RF2 × 0.6) + (AF3/RF3 × 0.4) ⌉ × 12.5
    const calculation = (AF1 / RF1) + (AF2 / RF2 * 0.6) + (AF3 / RF3 * 0.4);
    const marks = Math.ceil(calculation * 100) / 100 * 12.5;

    // Limit to maximum 25 marks
    return Math.min(Math.round(marks * 100) / 100, 25);
  };

  const averageRow = calculateAverage();
  const marks = calculateMarks(averageRow);

  return (
    <div className="space-y-6">
      {/* Approval status badge */}
      {approvalStatus && (
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${approvalStatus === 'APPROVED' || approvalStatus === 'APPROVED_BY_SUB_COORDINATOR' ? 'bg-green-100 text-green-800' :
          approvalStatus === 'REJECTED' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
          {approvalStatus === 'APPROVED' || approvalStatus === 'APPROVED_BY_SUB_COORDINATOR' ? <Check className="w-4 h-4 mr-1" /> :
            approvalStatus === 'REJECTED' ? <X className="w-4 h-4 mr-1" /> :
              <Clock className="w-4 h-4 mr-1" />}
          {approvalStatus}
        </div>
      )}

      <div className="text-sm text-gray-600 mb-4">
        <strong>Note:</strong> {tableConfig?.description || "Faculty Cadre Proportion is 1(RF1): 2(RF2): 6(RF3)"}
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto bg-white rounded-lg shadow border border-gray-300">
          <thead>
            <tr className="bg-[#2163c1] text-white">
              {columns.map((col) => (
                <th key={col.field} className="p-3 text-center font-medium whitespace-pre-line align-middle">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Data Rows */}
            {rows.map((row) => (
              <tr key={row.id} className="border-b hover:bg-gray-50">
                <td className="p-3 text-center font-bold bg-gray-100">
                  {row.year}
                </td>
                <td className="p-3">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={row.RF1 || ""}
                    onChange={(e) => handleChange(row.id, "RF1", e.target.value)}
                    disabled={disabled}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    placeholder="0.00"
                  />
                </td>
                <td className="p-3">
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={row.AF1 || ""}
                    onChange={(e) => handleChange(row.id, "AF1", e.target.value)}
                    disabled={disabled}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    placeholder="0"
                  />
                </td>
                <td className="p-3">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={row.RF2 || ""}
                    onChange={(e) => handleChange(row.id, "RF2", e.target.value)}
                    disabled={disabled}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    placeholder="0.00"
                  />
                </td>
                <td className="p-3">
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={row.AF2 || ""}
                    onChange={(e) => handleChange(row.id, "AF2", e.target.value)}
                    disabled={disabled}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    placeholder="0"
                  />
                </td>
                <td className="p-3">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={row.RF3 || ""}
                    onChange={(e) => handleChange(row.id, "RF3", e.target.value)}
                    disabled={disabled}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    placeholder="0.00"
                  />
                </td>
                <td className="p-3">
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={row.AF3 || ""}
                    onChange={(e) => handleChange(row.id, "AF3", e.target.value)}
                    disabled={disabled}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    placeholder="0"
                  />
                </td>
              </tr>
            ))}

            {/* Average Row */}
            {averageRow && (
              <tr className="border-b bg-blue-50 font-bold">
                <td className="p-3 text-center text-blue-700">
                  {averageRow.year}
                </td>
                <td className="p-3 text-center text-blue-700">
                  {averageRow.RF1}
                </td>
                <td className="p-3 text-center text-blue-700">
                  {averageRow.AF1}
                </td>
                <td className="p-3 text-center text-blue-700">
                  {averageRow.RF2}
                </td>
                <td className="p-3 text-center text-blue-700">
                  {averageRow.AF2}
                </td>
                <td className="p-3 text-center text-blue-700">
                  {averageRow.RF3}
                </td>
                <td className="p-3 text-center text-blue-700">
                  {averageRow.AF3}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Marks Calculation */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-300 rounded-lg">
        <h4 className="text-lg font-bold text-blue-700 mb-3 flex items-center gap-2">
          <Calculator className="w-5 h-5" /> Marks Calculation
        </h4>

        {averageRow && (
          <div className="space-y-4">
            {/* Formula Display */}
            <div className="bg-white p-4 rounded-lg border">
              <div className="font-mono text-sm bg-gray-100 p-3 rounded">
                <div className="font-bold mb-2">Formula:</div>
                <div>Marks = ⌈ AF1/RF1 + (AF2/RF2 × 0.6) + (AF3/RF3 × 0.4) ⌉ × 12.5</div>
                <div className="text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  Note: If AF1 = AF2 = 0, then zero mark
                </div>
              </div>
            </div>

            {/* Step-by-step Calculation */}
            <div className="bg-white p-4 rounded-lg border">
              <div className="font-bold mb-2">Step-by-step calculation:</div>
              <div className="space-y-2 text-sm">
                <div>1. AF1/RF1 = {averageRow.AF1} / {averageRow.RF1} = {(parseFloat(averageRow.AF1) / parseFloat(averageRow.RF1) || 0).toFixed(2)}</div>
                <div>2. AF2/RF2 × 0.6 = ({averageRow.AF2} / {averageRow.RF2}) × 0.6 = {((parseFloat(averageRow.AF2) / parseFloat(averageRow.RF2)) * 0.6 || 0).toFixed(2)}</div>
                <div>3. AF3/RF3 × 0.4 = ({averageRow.AF3} / {averageRow.RF3}) × 0.4 = {((parseFloat(averageRow.AF3) / parseFloat(averageRow.RF3)) * 0.4 || 0).toFixed(2)}</div>
                <div className="border-t pt-2 mt-2 font-bold">
                  4. Sum = {(parseFloat(averageRow.AF1) / parseFloat(averageRow.RF1) || 0).toFixed(2)} + {((parseFloat(averageRow.AF2) / parseFloat(averageRow.RF2)) * 0.6 || 0).toFixed(2)} + {((parseFloat(averageRow.AF3) / parseFloat(averageRow.RF3)) * 0.4 || 0).toFixed(2)} =
                  <span className="text-green-600 ml-2">
                    {(
                      (parseFloat(averageRow.AF1) / parseFloat(averageRow.RF1) || 0) +
                      ((parseFloat(averageRow.AF2) / parseFloat(averageRow.RF2)) * 0.6 || 0) +
                      ((parseFloat(averageRow.AF3) / parseFloat(averageRow.RF3)) * 0.4 || 0)
                    ).toFixed(2)}
                  </span>
                </div>
                <div className="font-bold">
                  5. Multiply by 12.5 =
                  <span className="text-green-600 ml-2">
                    {(
                      ((parseFloat(averageRow.AF1) / parseFloat(averageRow.RF1) || 0) +
                        ((parseFloat(averageRow.AF2) / parseFloat(averageRow.RF2)) * 0.6 || 0) +
                        ((parseFloat(averageRow.AF3) / parseFloat(averageRow.RF3)) * 0.4 || 0)) * 12.5
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Final Marks */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-100 p-4 rounded-lg border border-green-300">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-bold text-lg">Final Marks</div>
                  <div className="text-sm text-gray-600">Capped at maximum 25 marks</div>
                </div>
                <div className="text-3xl font-bold text-green-700">
                  {marks.toFixed(2)} / 25
                </div>
              </div>

              {/* Warning if AF1 and AF2 are both zero */}
              {parseFloat(averageRow.AF1) === 0 && parseFloat(averageRow.AF2) === 0 && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                  <div className="font-bold text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> Zero Marks Condition Met
                  </div>
                  <div className="text-sm text-red-600">
                    AF1 = {averageRow.AF1} and AF2 = {averageRow.AF2} are both zero. According to the formula, this results in zero marks.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Main Component for 5.3
const GenericCriteriaForm5_2 = ({
  title = "NBA Section",
  marks = 25,
  fields = [],
  initialData = null,
  onSave,
  onDelete,
  approvalStatus = null,
  isContributorEditable = true,
  saving = false,
}) => {
  const [isEditMode, setIsEditMode] = useState(false);

  const safeContent = initialData?.content || {};
  const safeTableData = initialData?.tableData || [];
  const safeFilesByField = initialData?.filesByField || {};

  const [filesByField, setFilesByField] = useState(() => {
    // Initialize with existing files
    const init = {};

    // Initialize for all fields
    fields.forEach((field) => {
      if (safeFilesByField[field.name]) {
        // Use existing files for this field
        init[field.name] = safeFilesByField[field.name].map((file, index) => ({
          id: file.id || `file-${field.name}-${index}`,
          description: file.description || "",
          filename: file.filename || "",
          url: file.url || file.s3Url || "",
          s3Url: file.s3Url || file.url || "",
          uploading: false,
          file: null
        }));
      } else {
        // Start with empty array for this field
        init[field.name] = [];
      }
    });

    return init;
  });

  const [formValues, setFormValues] = useState(safeContent);
  const [tableData, setTableData] = useState(safeTableData);
  const [previewModal, setPreviewModal] = useState({ isOpen: false, file: null });
  const [mergeModal, setMergeModal] = useState({ isOpen: false, fieldName: null });

  // Initialize when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormValues(initialData.content || {});
      setTableData(initialData.tableData || []);

      // Update filesByField
      const updatedFiles = {};
      fields.forEach((field) => {
        if (initialData.filesByField?.[field.name]) {
          updatedFiles[field.name] = initialData.filesByField[field.name].map((file, index) => ({
            id: file.id || `file-${field.name}-${index}`,
            description: file.description || "",
            filename: file.filename || "",
            url: file.url || file.s3Url || "",
            s3Url: file.s3Url || file.url || "",
            uploading: false,
            file: null
          }));
        } else {
          updatedFiles[field.name] = [];
        }
      });
      setFilesByField(updatedFiles);
    }
  }, [initialData]);

  const addFileRow = (fieldName) => {
    setFilesByField((prev) => ({
      ...prev,
      [fieldName]: [
        ...(prev[fieldName] || []),
        {
          id: `file-${Date.now()}-${fieldName}-${Math.random()}`,
          description: "",
          file: null,
          filename: "",
          s3Url: "",
          uploading: false
        },
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

    // Check if the row exists, if not we'll handle it differently
    const currentRow = filesByField[fieldName]?.[index];

    // If row doesn't exist yet, we need to ensure the array exists first
    if (!currentRow) {
      console.warn("File row doesn't exist yet, creating it first");
      // The row will be created by addFileRow, so we'll just proceed without description
    }

    // Optimistic UI update
    setFilesByField(prev => ({
      ...prev,
      [fieldName]: (prev[fieldName] || []).map((f, i) =>
        i === index ? { ...f, file: newFile, filename: newFile.name, uploading: true } : f
      )
    }));

    try {
      const formData = new FormData();
      formData.append("file", newFile);

      if (currentRow?.description?.trim()) {
        formData.append("description", currentRow.description.trim());
      }

      const resData = await nbaDashboardService.uploadFile(formData);
      const s3Url = resData?.downloadPath || resData || "";

      setFilesByField(prev => ({
        ...prev,
        [fieldName]: prev[fieldName].map((f, i) =>
          i === index
            ? { ...f, s3Url: s3Url, url: s3Url, filename: newFile.name, uploading: false }
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
      filesByField,
    });
    setIsEditMode(false);
  };

  // Determine if editing should be disabled
  const isEditingDisabled = false;

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
      <div className="bg-[#2163c1] text-white p-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold flex items-center gap-4">
            <FileText className="w-10 h-10" />
            {title}
            <span className="text-xl font-medium text-indigo-200">({marks} Marks)</span>
          </h2>
          {!isEditingDisabled && (
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`p-4 rounded-xl transition-all shadow-lg flex items-center justify-center ${isEditMode ? "bg-white hover:bg-gray-200 text-[#2163c1]" : "bg-white hover:bg-gray-100 text-[#2163c1]"
                }`}
              title={isEditMode ? "Cancel Editing" : "Edit Section"}
            >
              {isEditMode ? <X className="w-7 h-7" /> : <Edit className="w-7 h-7" />}
            </button>
          )}
        </div>
      </div>

      <div className="p-8 space-y-12">
        {fields.map((field) => (
          <div key={field.name} className="space-y-6">
            <h3 className="text-xl font-bold text-blue-700 flex justify-between items-center">
              <span>{field.label}</span>
              {field.marks && <span className="text-gray-600 font-medium">({field.marks} Marks)</span>}
            </h3>

            {field.hasTable ? (
              <FacultyCadreTable
                columns={field.tableConfig.columns}
                data={tableData}
                onChange={setTableData}
                disabled={!isEditMode || isEditingDisabled}
                tableConfig={field.tableConfig}
                approvalStatus={approvalStatus}
              />
            ) : (
              <div className="border-2 border-gray-300 rounded-b-lg bg-white">
                <Editor
                  value={formValues[field.name] || ""}
                  onChange={(val) => setFormValues((prev) => ({ ...prev, [field.name]: val }))}
                  disabled={!isEditMode || isEditingDisabled}
                  style={{ minHeight: 240, padding: 16, fontSize: 16 }}
                  className="focus:outline-none"
                />
              </div>
            )}

            {isEditMode && !isEditingDisabled && (
              <div className="mt-6 p-6 bg-gray-50 rounded-xl border">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-bold text-blue-700 flex items-center gap-2">
                    <Upload className="w-6 h-6" /> Supporting Documents
                  </h4>
                  {filesByField[field.name]?.some((f) => f.filename?.toLowerCase().endsWith(".pdf")) && (
                    <button
                      onClick={() => setMergeModal({ isOpen: true, fieldName: field.name })}
                      className="px-5 py-2.5 bg-[#2163c1] text-white font-medium rounded-lg hover:bg-[#1d57a8] transition flex items-center gap-2"
                    >
                      <FileText className="w-5 h-5" /> Merge PDFs
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {(filesByField[field.name] || []).map((file, index) => {
                    if (!file.id) {
                      file.id = `file-${Date.now()}-${field.name}-${Math.random()}`;
                    }
                    return (
                      <div key={file.id} className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-300">
                        <input
                          type="text"
                          value={file.description || ""}
                          onChange={(e) => updateFileDescription(field.name, index, e.target.value)}
                          placeholder="Description"
                          disabled={!isEditMode}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        />

                        <div className="w-64">
                          {file.uploading ? (
                            <span className="text-gray-500 italic">Uploading...</span>
                          ) : file.filename && file.s3Url ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setPreviewModal({ isOpen: true, file })}
                                className="text-blue-600 font-medium hover:underline flex items-center gap-2"
                                title="Preview"
                              >
                                <Eye className="w-4 h-4" /> {file.filename}
                              </button>
                              <span className="text-green-600">
                                <CheckCircle className="w-4 h-4" />
                              </span>
                            </div>
                          ) : (
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                              onChange={(e) => handleFileChange(field.name, index, e.target.files?.[0])}
                              disabled={!isEditMode}
                              className="block w-full text-sm border-0 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:bg-[#2163c1] file:text-white disabled:opacity-50"
                            />
                          )}
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => addFileRow(field.name)}
                            disabled={!isEditMode}
                            className="text-green-600 hover:bg-green-50 p-2 rounded transition disabled:opacity-50"
                            title="Add another document"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => removeFileRow(field.name, index)}
                            disabled={!isEditMode}
                            className="text-red-500 hover:bg-red-50 p-2 rounded transition disabled:opacity-50"
                            title="Remove document"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Add first file row if none exists */}
                  {(!filesByField[field.name] || filesByField[field.name].length === 0) && (
                    <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-300">
                      <input
                        type="text"
                        placeholder="Document description"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onFocus={() => {
                          // Add a row when user focuses on description field
                          if (!filesByField[field.name] || filesByField[field.name].length === 0) {
                            addFileRow(field.name);
                          }
                        }}
                        onChange={(e) => {
                          // Update description if row exists
                          if (filesByField[field.name] && filesByField[field.name].length > 0) {
                            updateFileDescription(field.name, 0, e.target.value);
                          }
                        }}
                      />
                      <div className="w-64">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            // Ensure row exists before uploading
                            if (!filesByField[field.name] || filesByField[field.name].length === 0) {
                              // Add the row first
                              addFileRow(field.name);
                              // Wait a tick for state to update, then upload
                              setTimeout(() => handleFileChange(field.name, 0, file), 100);
                            } else {
                              // Row already exists, upload directly
                              handleFileChange(field.name, 0, file);
                            }
                          }}
                          className="block w-full text-sm border-0 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:bg-[#2163c1] file:text-white"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => addFileRow(field.name)}
                          className="text-green-600 hover:bg-green-50 p-2 rounded transition"
                          title="Add another document"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {isEditMode && !isEditingDisabled && (
          <div className="text-center pt-10 flex gap-4 justify-center">
            <button
              onClick={handleSave}
              disabled={saving}
              className={`inline-flex items-center justify-center w-12 h-12 rounded-lg transition-all ${saving
                ? "bg-[#2163c1] opacity-60 cursor-not-allowed"
                : "bg-[#2163c1] hover:bg-[#1d57a8] text-white shadow-lg hover:shadow-xl"
                }`}
              title={saving ? "Saving..." : "Save"}
            >
              <Save className="w-6 h-6" />
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
              disabled={saving}
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
            <div className="flex justify-between items-center p-6 bg-gradient-to-r from-blue-600 to-blue-400 text-white">
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

export default GenericCriteriaForm5_2;