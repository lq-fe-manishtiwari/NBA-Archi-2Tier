// GenericCriteriaForm5_4.jsx
import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Editor } from "react-editor";
import Modal from "react-modal";
import MergePdfModal from "../MergePdfModal";
import { toast } from "react-toastify";
import { nbaDashboardService } from "../../Services/NBA-dashboard.service";
import {
  GripVertical, Trash2, Plus, FileText, Save, CheckCircle,
  Upload, X, Edit, Clock, Check, Eye, AlertCircle
} from "lucide-react";

Modal.setAppElement("#root");

// Visiting/Adjunct Faculty Table Component
const VisitingFacultyTable = ({ columns, data = [], onChange, disabled, tableConfig, approvalStatus }) => {
  const [yearRows, setYearRows] = useState(() => {
    if (data.length > 0) {
      const groupedData = {};
      data.forEach(item => {
        const year = item.year || "CAYm1";
        if (!groupedData[year]) groupedData[year] = [];
        groupedData[year].push(item);
      });

      return (tableConfig?.yearSections || []).map(yearSection => ({
        id: `year-${yearSection.year}`,
        type: "yearHeader",
        year: yearSection.year,
        label: yearSection.label,
        rows: groupedData[yearSection.year] || []
      }));
    }

    return (tableConfig?.yearSections || []).map(yearSection => ({
      id: `year-${yearSection.year}`,
      type: "yearHeader",
      year: yearSection.year,
      label: yearSection.label,
      rows: []
    }));
  });

  const handleAddRow = (year) => {
    const updated = [...yearRows];
    const yearIndex = updated.findIndex(y => y.year === year);

    if (yearIndex !== -1) {
      const newRow = {
        id: `row-${Date.now()}-${Math.random()}`,
        sn: updated[yearIndex].rows.length + 1,
        name: "",
        designation: "",
        course: "",
        hours: "",
        year
      };

      updated[yearIndex].rows = [...updated[yearIndex].rows, newRow];
      setYearRows(updated);
      onChange(flattenData(updated));
    }
  };

  const handleRemoveRow = (year, rowId) => {
    const updated = [...yearRows];
    const yearIndex = updated.findIndex(y => y.year === year);

    if (yearIndex !== -1) {
      updated[yearIndex].rows = updated[yearIndex].rows
        .filter(row => row.id !== rowId)
        .map((row, idx) => ({ ...row, sn: idx + 1 }));

      setYearRows(updated);
      onChange(flattenData(updated));
    }
  };

  const handleRowChange = (year, rowId, field, value) => {
    const updated = [...yearRows];
    const yearIndex = updated.findIndex(y => y.year === year);

    if (yearIndex !== -1) {
      const rowIndex = updated[yearIndex].rows.findIndex(row => row.id === rowId);
      if (rowIndex !== -1) {
        updated[yearIndex].rows[rowIndex] = {
          ...updated[yearIndex].rows[rowIndex],
          [field]: value
        };
        setYearRows(updated);
        onChange(flattenData(updated));
      }
    }
  };

  const flattenData = (yearData) =>
    yearData.flatMap(yearSection =>
      yearSection.rows.map(row => ({ ...row, year: yearSection.year }))
    );

  const calculateTotalHours = (rows) =>
    rows.reduce((sum, row) => sum + (parseInt(row.hours) || 0), 0);

  return (
    <div className="space-y-8">
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

      <div className="text-sm text-gray-600 mb-4">
        <strong>Note:</strong> Marks calculation: Provision of visiting faculty (1 mark) + Minimum 50 hours/year interaction (9 marks, 3 marks per year)
      </div>

      {yearRows.map((yearSection) => (
        <div key={yearSection.id} className="space-y-4">
          {/* Year Header */}
          <div className="bg-blue-100 border border-blue-300 rounded-lg p-4">
            <h4 className="text-lg font-bold text-blue-700">{yearSection.label}</h4>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full table-auto bg-white rounded-lg shadow border border-gray-300">
              <thead>
                <tr className="bg-[#2163c1] text-white">
                  {columns.map((col) => (
                    <th key={col.field} className="p-3 text-left font-medium">
                      {col.header}
                    </th>
                  ))}
                  {!disabled && <th className="w-20">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {yearSection.rows.map((row) => (
                  <tr key={row.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 text-center font-medium">{row.sn}</td>
                    <td className="p-3">
                      <input
                        type="text"
                        value={row.name || ""}
                        onChange={(e) => handleRowChange(yearSection.year, row.id, "name", e.target.value)}
                        disabled={disabled}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter name"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        value={row.designation || ""}
                        onChange={(e) => handleRowChange(yearSection.year, row.id, "designation", e.target.value)}
                        disabled={disabled}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Designation & Organization"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        value={row.course || ""}
                        onChange={(e) => handleRowChange(yearSection.year, row.id, "course", e.target.value)}
                        disabled={disabled}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Course name"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={row.hours || ""}
                        onChange={(e) => handleRowChange(yearSection.year, row.id, "hours", e.target.value)}
                        disabled={disabled}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Hours"
                      />
                    </td>
                    {!disabled && (
                      <td className="p-3">
                        <button
                          onClick={() => handleRemoveRow(yearSection.year, row.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Remove row"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}

                {/* Total Hours Row */}
                <tr className="bg-gray-100 font-bold">
                  <td colSpan={4} className="p-3 text-right">
                    Total no. of hours:
                  </td>
                  <td className="p-3 text-center font-bold text-blue-700">
                    {calculateTotalHours(yearSection.rows)}
                  </td>
                  {!disabled && <td></td>}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Add Row Button */}
          {!disabled && (
            <div className="text-center">
              <button
                onClick={() => handleAddRow(yearSection.year)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" /> Add Row for {yearSection.label}
              </button>
            </div>
          )}

          {/* Marks Calculation for this year */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="text-sm">
              <strong>{yearSection.label} Marks Calculation:</strong>
              <div className="mt-1">
                Total Hours: <span className="font-bold">{calculateTotalHours(yearSection.rows)}</span> hours
                {calculateTotalHours(yearSection.rows) >= 50 ? (
                  <span className="ml-2 text-green-600 font-bold flex items-center gap-1">
                    <Check className="w-4 h-4" /> Eligible for 3 marks
                  </span>
                ) : (
                  <span className="ml-2 text-red-600 font-bold flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> Needs minimum 50 hours for marks
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Overall Marks Calculation */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-300 rounded-lg">
        <h4 className="text-lg font-bold text-blue-700 mb-2">Overall Marks Calculation</h4>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {yearRows.map((yearSection) => {
            const totalHours = calculateTotalHours(yearSection.rows);
            const marks = totalHours >= 50 ? 3 : 0;

            return (
              <div key={yearSection.year} className="text-center p-3 bg-white rounded-lg border">
                <div className="font-bold">{yearSection.label}</div>
                <div className="text-sm">Total Hours: {totalHours}</div>
                <div className={`text-lg font-bold ${marks > 0 ? "text-green-600" : "text-red-600"}`}>
                  {marks} / 3 marks
                </div>
              </div>
            );
          })}

          <div className="text-center p-3 bg-blue-100 rounded-lg border border-blue-300">
            <div className="font-bold">Provision of Faculty</div>
            <div className="text-sm">Basic provision</div>
            <div className="text-lg font-bold text-blue-600">1 / 1 mark</div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-blue-300">
          <div className="flex justify-between items-center">
            <div>
              <strong>Total Marks Breakdown:</strong>
              <div className="text-sm">
                • Provision of visiting faculty: 1 mark
                <br />
                • Yearly interaction (3 years × 3 marks each):{" "}
                {yearRows.reduce(
                  (sum, ys) => sum + (calculateTotalHours(ys.rows) >= 50 ? 3 : 0),
                  0
                )}{" "}
                marks
              </div>
            </div>
            <div className="text-2xl font-bold text-indigo-700">
              Total:{" "}
              {1 +
                yearRows.reduce(
                  (sum, ys) => sum + (calculateTotalHours(ys.rows) >= 50 ? 3 : 0),
                  0
                )}{" "}
              / 10 marks
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
  marks = 10,
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
      // Ensure each field has at least one empty row for new uploads
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
      const s3Url = resData || resData?.url || "";

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

  const isEditingDisabled = approvalStatus === "APPROVED" || approvalStatus === "REJECTED" || !isContributorEditable;

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
              <VisitingFacultyTable
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

            {/* Supporting Documents Section - Always Display */}
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
                <iframe src={previewModal.file.s3Url} title={previewModal.file.filename} className="w-full h-full border-0" />
              ) : previewModal.file.filename?.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/i) ? (
                <img src={previewModal.file.s3Url} alt={previewModal.file.filename} className="max-w-full max-h-full object-contain mx-auto" />
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