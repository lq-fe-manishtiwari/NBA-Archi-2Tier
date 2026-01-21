// src/screens/pages/NEWNBA/Components/Criteria3/GenericCriteriaForm5_4.jsx
import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Editor } from "react-editor";
import Modal from "react-modal";
import MergePdfModal from "../MergePdfModal";
import { toast } from "react-toastify";
import { nbaDashboardService } from "../../Services/NBA-dashboard.service";
import {
  GripVertical, Trash2, Plus, FileText, Save, CheckCircle,
  Upload, X, Edit, Clock, Check, Eye, AlertCircle, Percent, Users
} from "lucide-react";

Modal.setAppElement("#root");

// Faculty Retention Table Component
const FacultyRetentionTable = ({ columns, data = [], onChange, disabled, tableConfig, approvalStatus }) => {
  const [tableRows, setTableRows] = useState(() => {
    if (data.length > 0) {
      return data;
    }
    
    // Default rows based on the image
    return [
      {
        id: "retained-row",
        item: "No of Faculty Retained",
        cay: "",
        caym1: ""
      },
      {
        id: "total-row", 
        item: "Total No. of Required Faculty in CAYm2",
        cay: "",
        caym1: ""
      }
    ];
  });

  const handleRowChange = (rowId, field, value) => {
    const updatedRows = tableRows.map(row => 
      row.id === rowId ? { ...row, [field]: value } : row
    );
    setTableRows(updatedRows);
    onChange(updatedRows);
  };

  // Calculate percentages based on the image formula
  const calculatePercentages = () => {
    const retainedRow = tableRows.find(row => row.item === "No of Faculty Retained");
    const totalRow = tableRows.find(row => row.item === "Total No. of Required Faculty in CAYm2");
    
    const cayRetained = parseInt(retainedRow?.cay) || 0;
    const caym1Retained = parseInt(retainedRow?.caym1) || 0;
    const totalRequired = parseInt(totalRow?.cay) || 1; // Avoid division by zero
    
    const cayPercentage = totalRequired > 0 ? (cayRetained / totalRequired * 100) : 0;
    const caym1Percentage = totalRequired > 0 ? (caym1Retained / totalRequired * 100) : 0;
    const overallPercentage = (cayPercentage + caym1Percentage) / 2;
    
    return {
      cayPercentage: Math.round(cayPercentage * 10) / 10,
      caym1Percentage: Math.round(caym1Percentage * 10) / 10,
      overallPercentage: Math.round(overallPercentage * 10) / 10
    };
  };

  // Calculate marks based on overall percentage
  const calculateMarks = (percentage) => {
    if (percentage >= 90) return 20;
    if (percentage >= 75) return 16;
    if (percentage >= 60) return 12;
    if (percentage >= 50) return 8;
    return 0;
  };

  const percentages = calculatePercentages();
  const marks = calculateMarks(percentages.overallPercentage);

  return (
    <div className="space-y-6">
      {/* Approval status badge */}
      {approvalStatus && (
        <div
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            approvalStatus === "APPROVED"
              ? "bg-green-100 text-green-800"
              : approvalStatus === "REJECTED"
              ? "bg-red-100 text-red-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {approvalStatus === "APPROVED" ? <Check className="w-4 h-4 mr-1" /> :
           approvalStatus === "REJECTED" ? <X className="w-4 h-4 mr-1" /> :
           <Clock className="w-4 h-4 mr-1" />}
          {approvalStatus}
        </div>
      )}

      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h4 className="text-lg font-bold text-blue-700 mb-2">{tableConfig.title}</h4>
        <p className="text-sm text-gray-600 mb-4">
          <strong>Note:</strong> Calculate the percentage of required full-time faculty members retained during the assessment period keeping CAYm2 as base year.
        </p>
      </div>

      {/* Input Table */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto bg-white rounded-lg shadow border border-gray-300">
          <thead>
            <tr className="bg-[#2163c1] text-white">
              {columns.map((col) => (
                <th key={col.field} className="p-3 text-left font-medium">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row) => (
              <tr key={row.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium bg-gray-50">{row.item}</td>
                <td className="p-3">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={row.cay || ""}
                    onChange={(e) => handleRowChange(row.id, "cay", e.target.value)}
                    disabled={disabled}
                    className={`w-full px-3 py-2 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      row.item === "Total No. of Required Faculty in CAYm2" ? "font-bold" : ""
                    }`}
                    placeholder="Enter number"
                  />
                </td>
                <td className="p-3">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={row.item === "Total No. of Required Faculty in CAYm2" ? row.cay || "" : row.caym1 || ""}
                    onChange={(e) => {
                      if (row.item === "Total No. of Required Faculty in CAYm2") {
                        // For total row, update both columns
                        handleRowChange(row.id, "cay", e.target.value);
                        handleRowChange(row.id, "caym1", e.target.value);
                      } else {
                        handleRowChange(row.id, "caym1", e.target.value);
                      }
                    }}
                    disabled={disabled}
                    className={`w-full px-3 py-2 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      row.item === "Total No. of Required Faculty in CAYm2" ? "text-gray-400 bg-gray-100" : ""
                    }`}
                    placeholder="Enter number"
                    readOnly={row.item === "Total No. of Required Faculty in CAYm2"}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Calculated Results Table */}
      <div className="overflow-x-auto mt-6">
        <table className="w-full table-auto bg-white rounded-lg shadow border border-gray-300">
          <thead>
            <tr className="bg-green-600 text-white">
              <th className="p-3 text-left font-medium">Item</th>
              <th className="p-3 text-left font-medium">CAY</th>
              <th className="p-3 text-left font-medium">CAYm1</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b hover:bg-gray-50">
              <td className="p-3 font-medium bg-gray-50">% of Faculty Retained</td>
              <td className="p-3 text-center font-bold text-blue-700">
                {percentages.cayPercentage}%
              </td>
              <td className="p-3 text-center font-bold text-blue-700">
                {percentages.caym1Percentage}%
              </td>
            </tr>
            <tr className="bg-green-50 hover:bg-green-100">
              <td className="p-3 font-medium">Faculty Retained (overall)</td>
              <td colSpan="2" className="p-3 text-center font-bold text-green-700 text-lg">
                {percentages.overallPercentage}% = ({percentages.cayPercentage} + {percentages.caym1Percentage}) / 2
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Marks Calculation Section */}
      <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-300 rounded-lg">
        <h4 className="text-lg font-bold text-blue-700 mb-4 flex items-center gap-2">
          <Percent className="w-5 h-5" /> Marks Calculation
        </h4>

        {/* Marks Distribution Table */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full table-auto bg-white rounded-lg shadow border border-gray-300">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="p-3 text-left font-medium">Retention Percentage</th>
                <th className="p-3 text-left font-medium">Marks</th>
                <th className="p-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { min: 90, max: 100, marks: 20 },
                { min: 75, max: 90, marks: 16 },
                { min: 60, max: 75, marks: 12 },
                { min: 50, max: 60, marks: 8 },
                { min: 0, max: 50, marks: 0 }
              ].map((range, index) => {
                const isActive = percentages.overallPercentage >= range.min && 
                                percentages.overallPercentage < (range.max === 100 ? 101 : range.max);
                
                return (
                  <tr 
                    key={index} 
                    className={`border-b hover:bg-gray-50 ${isActive ? 'bg-yellow-50 border-l-4 border-yellow-500' : ''}`}
                  >
                    <td className="p-3 font-medium">
                      {range.min === 90 ? '≥90%' : 
                       range.min === 0 ? '<50%' : 
                       `≥${range.min}%`}
                    </td>
                    <td className="p-3 font-bold">{range.marks} marks</td>
                    <td className="p-3">
                      {isActive ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          <Check className="w-4 h-4 mr-1" /> Selected
                        </span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Current Calculation */}
        <div className="bg-white p-4 rounded-lg border border-blue-300">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h5 className="font-bold text-gray-700">Current Calculation:</h5>
              <div className="text-sm text-gray-600 mt-1">
                <div>CAY: {percentages.cayPercentage}% = ({tableRows[0]?.cay || 0} / {tableRows[1]?.cay || 1}) × 100</div>
                <div>CAYm1: {percentages.caym1Percentage}% = ({tableRows[0]?.caym1 || 0} / {tableRows[1]?.cay || 1}) × 100</div>
                <div>Overall: ({percentages.cayPercentage} + {percentages.caym1Percentage}) / 2 = {percentages.overallPercentage}%</div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Awarded Marks</div>
              <div className="text-3xl font-bold text-indigo-700">{marks} / 20</div>
            </div>
          </div>
        </div>
      </div>

      {/* Example from image */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h5 className="font-bold text-yellow-700 mb-2 flex items-center gap-2">
          <Users className="w-5 h-5" /> Example from NBA Guidelines:
        </h5>
        <div className="text-sm overflow-x-auto">
          <table className="w-full border-collapse min-w-full">
            <thead>
              <tr className="bg-yellow-100">
                <th className="border border-yellow-300 p-2 text-left">Item</th>
                <th className="border border-yellow-300 p-2 text-center">CAY</th>
                <th className="border border-yellow-300 p-2 text-center">CAYm1</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-yellow-300 p-2">No of Faculty Retained</td>
                <td className="border border-yellow-300 p-2 text-center font-bold">28</td>
                <td className="border border-yellow-300 p-2 text-center font-bold">29</td>
              </tr>
              <tr>
                <td className="border border-yellow-300 p-2">Total No. of Required Faculty in CAYm2</td>
                <td className="border border-yellow-300 p-2 text-center font-bold">33</td>
                <td className="border border-yellow-300 p-2 text-center">33</td>
              </tr>
              <tr>
                <td className="border border-yellow-300 p-2 font-medium">% of Faculty Retained</td>
                <td className="border border-yellow-300 p-2 text-center font-bold text-blue-600">85%</td>
                <td className="border border-yellow-300 p-2 text-center font-bold text-blue-600">88%</td>
              </tr>
              <tr className="bg-yellow-100">
                <td className="border border-yellow-300 p-2 font-bold">Faculty Retained (overall)</td>
                <td colSpan="2" className="border border-yellow-300 p-2 text-center font-bold text-green-700">
                  86.5% = (85 + 88) / 2
                </td>
              </tr>
            </tbody>
          </table>
          <div className="mt-3 p-3 bg-yellow-100 rounded border border-yellow-300">
            <div className="font-bold text-yellow-800">Calculation:</div>
            <div className="text-yellow-700 text-sm mt-1">
              <div>• CAY: (28 ÷ 33) × 100 = 84.85% ≈ 85%</div>
              <div>• CAYm1: (29 ÷ 33) × 100 = 87.88% ≈ 88%</div>
              <div>• Overall: (85% + 88%) ÷ 2 = 86.5%</div>
              <div className="mt-2 font-bold">
                <span className="text-green-700">Result:</span> 86.5% ≥ 75% → <strong className="text-green-700">Awarded 16 marks</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component
const GenericCriteriaForm5_4 = ({
  title = "NBA Section",
  marks = 20,
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
  const safeTableData = initialData?.tableData || [];
  const approvalStatus = initialData?.approval_status;

  const [filesByField, setFilesByField] = useState(() => {
    if (initialData?.filesByField) {
      const updatedFiles = { ...initialData.filesByField };
      fields.forEach((field) => {
        if (!updatedFiles[field.name] || updatedFiles[field.name].length === 0) {
          updatedFiles[field.name] = [
            { id: `file-${Date.now()}-${field.name}-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }
          ];
        }
      });
      return updatedFiles;
    }

    const init = {};
    fields.forEach((field) => {
      init[field.name] = [
        { id: `file-${Date.now()}-${field.name}-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }
      ];
    });
    return init;
  });

  const [formValues, setFormValues] = useState(safeContent);
  const [tableData, setTableData] = useState(safeTableData);
  const [previewModal, setPreviewModal] = useState({ isOpen: false, file: null });
  const [mergeModal, setMergeModal] = useState({ isOpen: false, fieldName: null });

  const addFileRow = (fieldName) => {
    setFilesByField((prev) => ({
      ...prev,
      [fieldName]: [
        ...(prev[fieldName] || []),
        { id: `file-${Date.now()}-${fieldName}-${Math.random()}`, description: "", file: null, filename: "", s3Url: "", uploading: false }
      ]
    }));
  };

  const updateFileDescription = (fieldName, index, value) => {
    setFilesByField((prev) => ({
      ...prev,
      [fieldName]: prev[fieldName].map((f, i) => (i === index ? { ...f, description: value } : f))
    }));
  };

  const handleFileChange = async (fieldName, index, newFile) => {
    if (!newFile || !(newFile instanceof File)) {
      toast.error("Invalid file");
      return;
    }

    const currentRow = filesByField[fieldName][index];

    // Optimistic UI
    setFilesByField((prev) => ({
      ...prev,
      [fieldName]: prev[fieldName].map((f, i) =>
        i === index ? { ...f, file: newFile, filename: newFile.name, uploading: true } : f
      )
    }));

    try {
      const formData = new FormData();
      formData.append("file", newFile);
      if (currentRow.description?.trim()) formData.append("description", currentRow.description.trim());

      const resData = await nbaDashboardService.uploadFile(formData);
      const s3Url = resData?.url || resData || "";

      const updatedFile = { ...currentRow, s3Url, filename: newFile.name, uploading: false };

      setFilesByField((prev) => ({
        ...prev,
        [fieldName]: prev[fieldName].map((f, i) => (i === index ? updatedFile : f))
      }));

      toast.success("Uploaded successfully!");
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error("Upload failed");
      setFilesByField((prev) => ({
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
      [fieldName]: prev[fieldName].filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    onSave({
      content: formValues,
      tableData,
      filesByField
    });
    setIsEditMode(false);
  };

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
              className={`p-4 rounded-xl transition-all shadow-lg flex items-center justify-center ${
                isEditMode ? "bg-white hover:bg-gray-200 text-[#2163c1]" : "bg-white hover:bg-gray-100 text-[#2163c1]"
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
              field.tableConfig.type === "faculty_retention" ? (
                <FacultyRetentionTable
                  columns={field.tableConfig.columns}
                  data={tableData}
                  onChange={setTableData}
                  disabled={!isEditMode || isEditingDisabled}
                  tableConfig={field.tableConfig}
                  approvalStatus={approvalStatus}
                />
              ) : (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2 text-yellow-700">
                    <AlertCircle className="w-5 h-5" />
                    <span>Table configuration not found for this criteria.</span>
                  </div>
                </div>
              )
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

            {/* Supporting Documents Section */}
            <div className="mt-6 p-6 bg-gray-50 rounded-xl border">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-bold text-blue-700 flex items-center gap-2">
                  <Upload className="w-6 h-6" /> Supporting Documents
                </h4>
                {isEditMode && filesByField[field.name]?.some((f) => f.filename?.toLowerCase().endsWith(".pdf")) && (
                  <button
                    onClick={() => setMergeModal({ isOpen: true, fieldName: field.name })}
                    className="px-5 py-2.5 bg-[#2163c1] text-white font-medium rounded-lg hover:bg-[#1d57a8] transition flex items-center gap-2"
                  >
                    <FileText className="w-5 h-5" /> Merge PDFs
                  </button>
                )}
              </div>

              {isEditMode && !isEditingDisabled ? (
                <DragDropContext
                  onDragEnd={(result) => {
                    if (!result.destination) return;
                    const items = Array.from(filesByField[field.name] || []);
                    const [moved] = items.splice(result.source.index, 1);
                    items.splice(result.destination.index, 0, moved);
                    setFilesByField((prev) => ({ ...prev, [field.name]: items }));
                  }}
                >
                  <Droppable droppableId={`files-${field.name}`}>
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                        {(filesByField[field.name] || []).map((file, index) => {
                          if (!file.id) file.id = `file-${Date.now()}-${field.name}-${Math.random()}`;
                          return (
                            <Draggable key={file.id} draggableId={file.id.toString()} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`flex items-center gap-3 p-4 bg-white rounded-lg border transition-all ${
                                    snapshot.isDragging ? "border-indigo-500 shadow-lg" : "border-gray-300"
                                  }`}
                                >
                                  <div {...provided.dragHandleProps} className="cursor-grab">
                                    <GripVertical className="w-5 h-5 text-gray-400" />
                                  </div>

                                  <input
                                    type="text"
                                    value={file.description || ""}
                                    onChange={(e) => updateFileDescription(field.name, index, e.target.value)}
                                    placeholder="Description"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />

                                  <div className="w-64">
                                    {file.uploading ? (
                                      <span className="text-gray-500 italic">Uploading...</span>
                                    ) : file.filename ? (
                                      <button
                                        onClick={() => setPreviewModal({ isOpen: true, file })}
                                        className="text-blue-600 font-medium hover:underline flex items-center gap-2"
                                        title="View file"
                                      >
                                        <Eye className="w-4 h-4" /> {file.filename}
                                      </button>
                                    ) : (
                                      <input
                                        type="file"
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                        onChange={(e) => handleFileChange(field.name, index, e.target.files?.[0])}
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
                                    <button
                                      onClick={() => removeFileRow(field.name, index)}
                                      className="text-red-500 hover:bg-red-50 p-2 rounded transition"
                                      title="Remove document"
                                    >
                                      <Trash2 className="w-5 h-5" />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              ) : (
                <div className="space-y-3">
                  {filesByField[field.name]?.filter(f => f.filename).length > 0 ? (
                    filesByField[field.name]
                      .filter((f) => f.filename)
                      .map((file, idx) => (
                        <div key={file.id || idx} className="flex items-center gap-3 p-4 bg-white rounded-lg border">
                          <div className="flex-1 font-medium text-gray-700">
                            {file.description || "No description"}
                          </div>
                          <button
                            onClick={() => setPreviewModal({ isOpen: true, file })}
                            className="text-blue-600 font-medium hover:underline flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" /> {file.filename}
                          </button>
                        </div>
                      ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No supporting documents uploaded</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Save / Cancel / Delete buttons */}
        {isEditMode && !isEditingDisabled && (
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

            {onDelete && (
              <button
                onClick={onDelete}
                disabled={saving}
                className="inline-flex items-center justify-center w-12 h-12 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow-lg"
                title="Delete Section Data"
              >
                <Trash2 className="w-6 h-6" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Preview Modal */}
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
              <div className="flex gap-2">
                <button
                  onClick={() => window.open(previewModal.file.s3Url, "_blank")}
                  className="px-3 py-1 bg-white bg-opacity-20 rounded hover:bg-opacity-30 transition"
                  title="Open in new tab"
                >
                  Open in New Tab
                </button>
                <button onClick={() => setPreviewModal({ isOpen: false, file: null })}>
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="flex-1 p-4">
              {previewModal.file.filename?.toLowerCase().endsWith(".pdf") ? (
                <iframe 
                  src={previewModal.file.s3Url} 
                  title={previewModal.file.filename} 
                  className="w-full h-full border-0" 
                  style={{ minHeight: '500px' }}
                />
              ) : previewModal.file.filename?.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/i) ? (
                <img 
                  src={previewModal.file.s3Url} 
                  alt={previewModal.file.filename} 
                  className="max-w-full max-h-full object-contain mx-auto" 
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <FileText className="w-16 h-16 mb-4" />
                  <p className="text-lg mb-2">Cannot preview this file type</p>
                  <p className="text-sm mb-4">{previewModal.file.filename}</p>
                  <button
                    onClick={() => window.open(previewModal.file.s3Url, "_blank")}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    Download File
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Merge PDF Modal */}
      <MergePdfModal
        isOpen={mergeModal.isOpen}
        pdfFiles={filesByField[mergeModal.fieldName] || []}
        onClose={() => setMergeModal({ isOpen: false, fieldName: null })}
        onFileAdd={(mergedDocument) => {
          const mergedFile = {
            id: mergedDocument.id,
            filename: mergedDocument.filename,
            description: mergedDocument.description || "Merged PDF",
            s3Url: mergedDocument.s3Url,
            uploading: false,
            isMerged: true
          };
          setFilesByField((prev) => ({
            ...prev,
            [mergeModal.fieldName]: [...(prev[mergeModal.fieldName] || []), mergedFile]
          }));
          setMergeModal({ isOpen: false, fieldName: null });
        }}
      />
    </div>
  );
};

export default GenericCriteriaForm5_4;