// src/screens/pages/NEWNBA/Components/Criteria4/GenericCriteriaForm4_9.jsx
import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Editor } from "react-editor";
import Modal from "react-modal";
import MergePdfModal from "../MergePdfModal";
import { toast } from "react-toastify";
import { nbaDashboardService } from "../../Services/NBA-dashboard.service";
import {
  GripVertical, Trash2, Plus, FileText, Save,
  Upload, X, Edit, Check, Eye, Users, BookOpen,
  Calendar, Award, Building, Globe, Newspaper
} from "lucide-react";

Modal.setAppElement("#root");

// Participation Table Component for 4.9.3
const ParticipationTable = ({ columns, data = [], onChange, disabled, tableConfig, approvalStatus }) => {
  const [yearRows, setYearRows] = useState(() => {
    // Group data by year
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
        event_name: "",
        organizing_institute: "",
        level: "",
        date: "",
        no_of_participants: "",
        achievements: "",
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

  const calculateTotalParticipants = () => {
    let total = 0;
    yearRows.forEach(yearSection => {
      yearSection.rows.forEach(row => {
        total += parseInt(row.no_of_participants) || 0;
      });
    });
    return total;
  };

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
          {approvalStatus === "APPROVED" ? <Check className="w-4 h-4 mr-1" /> : <Edit className="w-4 h-4 mr-1" />}
          {approvalStatus.replace(/_/g, ' ')}
        </div>
      )}

      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h4 className="text-lg font-bold text-blue-700 mb-2">{tableConfig.title}</h4>
        <p className="text-sm text-gray-600">
          Record participation of students in inter-institute events at National/International level.
        </p>
      </div>

      {yearRows.map((yearSection) => (
        <div key={yearSection.id} className="space-y-4">
          {/* Year Header */}
          <div className="bg-[#2163c1] text-white p-4 rounded-lg">
            <h4 className="text-lg font-bold flex items-center gap-2">
              <Calendar className="w-5 h-5" /> {yearSection.label}
            </h4>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full table-auto bg-white rounded-lg shadow border border-gray-300">
              <thead>
                <tr className="bg-[#2163c1] text-white">
                  {columns.map((col) => (
                    <th key={col.field} className="p-3 text-left font-medium whitespace-nowrap">
                      {col.header}
                    </th>
                  ))}
                  {!disabled && <th className="w-20">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {yearSection.rows.length > 0 ? (
                  yearSection.rows.map((row) => (
                    <tr key={row.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 text-center font-medium">{row.sn}</td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={row.event_name || ""}
                          onChange={(e) => handleRowChange(yearSection.year, row.id, "event_name", e.target.value)}
                          disabled={disabled}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., National Tech Fest"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={row.organizing_institute || ""}
                          onChange={(e) => handleRowChange(yearSection.year, row.id, "organizing_institute", e.target.value)}
                          disabled={disabled}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., IIT Delhi"
                        />
                      </td>
                      <td className="p-3">
                        <select
                          value={row.level || ""}
                          onChange={(e) => handleRowChange(yearSection.year, row.id, "level", e.target.value)}
                          disabled={disabled}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Level</option>
                          <option value="National">National</option>
                          <option value="International">International</option>
                          <option value="State">State</option>
                          <option value="Regional">Regional</option>
                        </select>
                      </td>
                      <td className="p-3">
                        <input
                          type="date"
                          value={row.date || ""}
                          onChange={(e) => handleRowChange(yearSection.year, row.id, "date", e.target.value)}
                          disabled={disabled}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={row.no_of_participants || ""}
                          onChange={(e) => handleRowChange(yearSection.year, row.id, "no_of_participants", e.target.value)}
                          disabled={disabled}
                          className="w-full px-3 py-2 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={row.achievements || ""}
                          onChange={(e) => handleRowChange(yearSection.year, row.id, "achievements", e.target.value)}
                          disabled={disabled}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., 1st Prize, Special Recognition"
                        />
                      </td>
                      {!disabled && (
                        <td className="p-3">
                          <button
                            onClick={() => handleRemoveRow(yearSection.year, row.id)}
                            className="text-red-500 hover:text-red-700 p-1 transition"
                            title="Remove row"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length + (disabled ? 0 : 1)} className="p-6 text-center text-gray-500">
                      No events added for {yearSection.label}. Click "Add Event" below to add one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Add Row Button */}
          {!disabled && (
            <div className="text-center">
              <button
                onClick={() => handleAddRow(yearSection.year)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 mx-auto shadow-md"
              >
                <Plus className="w-4 h-4" /> Add Event for {yearSection.label}
              </button>
            </div>
          )}

          {/* Year Summary */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-medium text-blue-700">
                  {yearSection.label} Summary:
                </span>
                <div className="text-sm text-white mt-1">
                  Total Events: <span className="font-bold">{yearSection.rows.length}</span>
                  <span className="mx-2">•</span>
                  Total Participants: <span className="font-bold">
                    {yearSection.rows.reduce((sum, row) => sum + (parseInt(row.no_of_participants) || 0), 0)}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium text-blue-700">Marks: </span>
                <span className="text-lg font-bold text-green-600">
                  {Math.min(yearSection.rows.length * 2, 10)} / 10
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Overall Summary */}
      <div className="mt-8 p-6  bg-[#2163c1] border  rounded-lg">
        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Award className="w-5 h-5" /> Overall Participation Summary
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {yearRows.map((yearSection) => {
            const totalEvents = yearSection.rows.length;
            const totalParticipants = yearSection.rows.reduce((sum, row) => sum + (parseInt(row.no_of_participants) || 0), 0);
            const marks = Math.min(totalEvents * 2, 10);

            return (
              <div key={yearSection.year} className="bg-white p-4 rounded-lg border shadow-sm">
                <div className="font-bold text-blue-800 text-center">{yearSection.label}</div>
                <div className="text-center mt-2">
                  <div className="text-2xl font-bold text-blue-600">{totalEvents}</div>
                  <div className="text-sm text-gray-600">Events</div>
                </div>
                <div className="text-center mt-2">
                  <div className="text-xl font-bold text-green-600">{totalParticipants}</div>
                  <div className="text-sm text-gray-600">Participants</div>
                </div>
                <div className="text-center mt-3">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    marks >= 8 ? 'bg-green-100 text-green-800' :
                    marks >= 4 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {marks} / 10 marks
                  </div>
                </div>
              </div>
            );
          })}

          <div className=" bg-[#2163c1] p-4 rounded-lg border ">
            <div className="font-bold text-white text-center">Overall</div>
            <div className="text-center mt-2">
              <div className="text-3xl font-bold text-white">
                {calculateTotalParticipants()}
              </div>
              <div className="text-sm text-gray-600">Total Participants</div>
            </div>
            <div className="text-center mt-3">
              <div className="text-lg font-bold text-white">
                Total Marks: {yearRows.reduce((sum, ys) => sum + Math.min(ys.rows.length * 2, 10), 0)} / 10
              </div>
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-600 bg-white p-4 rounded border">
          <strong>Marks Calculation:</strong> Each event participation = 2 marks (Max 10 marks per year)
          <div className="mt-1">
            • Minimum 5 events per year for full marks (10)
            <br />
            • Quality and level of events (National/International) also considered
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component
const GenericCriteriaForm4_9 = ({
  title = "4.9 Professional Activities",
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
  const safeTableData = initialData?.tableData || {};
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

  const handleTableChange = (fieldName, data) => {
    setTableData(prev => ({
      ...prev,
      [fieldName]: data
    }));
  };

  const handleSave = () => {
    onSave({
      content: formValues,
      tableData: tableData,
      filesByField
    });
    setIsEditMode(false);
  };

  const isEditingDisabled = approvalStatus === "APPROVED" || approvalStatus === "REJECTED" || !isContributorEditable;

  // Get icon for field
  const getFieldIcon = (fieldName) => {
    switch (fieldName) {
      case "4.9.1": return <Building className="w-5 h-5" />;
      case "4.9.2": return <Newspaper className="w-5 h-5" />;
      case "4.9.3": return <Users className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-full overflow-x-hidden">
      <div className="  bg-[#2163c1] text-white p-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-4">
              <BookOpen className="w-10 h-10" />
              {title}
            </h2>
            <p className="text-white mt-2">
              Professional Societies, Publications, and Student Participation in Inter-Institute Events
            </p>
          </div>

          {!isEditingDisabled && (
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`p-4 rounded-xl transition-all shadow-lg flex items-center justify-center ${
                isEditMode ? "bg-white hover:bg-gray-200 text-blue-600" : "bg-white hover:bg-gray-100 text-blue-600"
              }`}
              title={isEditMode ? "Cancel Editing" : "Edit Section"}
            >
              {isEditMode ? <X className="w-7 h-7" /> : <Edit className="w-7 h-7" />}
            </button>
          )}
        </div>
        <div className="mt-4 flex items-center gap-4">
          <div className="bg-white bg-opacity-20 px-4 py-2 rounded-lg">
            <span className="text-xl font-bold text-white">{marks} Marks</span>
          </div>
          <div className="text-sm text-blue-100">
            4.9.1 (5) + 4.9.2 (5) + 4.9.3 (10) = {marks} Marks
          </div>
        </div>
      </div>

      <div className="p-8 space-y-12">
        {fields.map((field) => (
          <div key={field.name} className="space-y-6">
            {/* Field Header */}
            <div className="border-l-4 border-blue-500 pl-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    {getFieldIcon(field.name)} {field.label}
                  </h3>
                  {field.marks && (
                    <span className="inline-block mt-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {field.marks} Marks
                    </span>
                  )}
                </div>
                {field.marks && (
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Maximum</div>
                    <div className="text-lg font-bold text-blue-700">{field.marks} marks</div>
                  </div>
                )}
              </div>
              
              {field.description && (
                <div className="mt-2 text-gray-600 text-sm bg-gray-50 p-3 rounded border">
                  <strong>Guidelines:</strong> {field.description}
                </div>
              )}
            </div>

            {/* Content Area - Table or Text Editor */}
            {field.hasTable ? (
              <ParticipationTable
                columns={field.tableConfig.columns}
                data={tableData[field.name] || []}
                onChange={(data) => handleTableChange(field.name, data)}
                disabled={!isEditMode || isEditingDisabled}
                tableConfig={field.tableConfig}
                approvalStatus={approvalStatus}
              />
            ) : (
              <div className="border-2 border-gray-300 rounded-b-lg bg-white shadow-sm">
                <div className="bg-gray-50 px-4 py-2 border-b text-sm text-gray-600">
                  Rich Text Editor - Describe in detail
                </div>
                <Editor
                  value={formValues[field.name] || ""}
                  onChange={(val) => setFormValues((prev) => ({ ...prev, [field.name]: val }))}
                  disabled={!isEditMode || isEditingDisabled}
                  style={{ minHeight: 200, padding: 16, fontSize: 16, maxHeight: "70vh", overflowY: "auto",
                 }}
                  className="focus:outline-none"
                />
                <div className="bg-gray-50 px-4 py-2 border-t text-xs text-gray-500">
                  Include all relevant details, positions held, publication names, editors, publishers, etc.
                </div>
              </div>
            )}

            {/* Supporting Documents Section */}
            <div className="mt-6 p-6 bg-gray-50 rounded-xl border">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-bold text-gray-700 flex items-center gap-2">
                  <Upload className="w-6 h-6" /> Supporting Documents
                </h4>
                {isEditMode && filesByField[field.name]?.some((f) => f.filename?.toLowerCase().endsWith(".pdf")) && (
                  <button
                    onClick={() => setMergeModal({ isOpen: true, fieldName: field.name })}
                    className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow"
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
                                    snapshot.isDragging ? "border-blue-500 shadow-lg" : "border-gray-300"
                                  }`}
                                >
                                  <div {...provided.dragHandleProps} className="cursor-grab">
                                    <GripVertical className="w-5 h-5 text-gray-400" />
                                  </div>

                                  <input
                                    type="text"
                                    value={file.description || ""}
                                    onChange={(e) => updateFileDescription(field.name, index, e.target.value)}
                                    placeholder="Document description"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />

                                  <div className="w-64">
                                    {file.uploading ? (
                                      <div className="flex items-center gap-2 text-blue-600">
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                                        Uploading...
                                      </div>
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
                                        className="block w-full text-sm border-0 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:bg-blue-600 file:text-white file:hover:bg-blue-700"
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
                        <div key={file.id || idx} className="flex items-center gap-3 p-4 bg-white rounded-lg border hover:bg-gray-50 transition">
                          <div className="flex-1">
                            <div className="font-medium text-gray-800">{file.description || "No description"}</div>
                            <div className="text-sm text-gray-500">Click to preview</div>
                          </div>
                          <button
                            onClick={() => setPreviewModal({ isOpen: true, file })}
                            className="text-blue-600 font-medium hover:underline flex items-center gap-2 px-4 py-2 border border-blue-300 rounded-lg hover:bg-blue-50 transition"
                          >
                            <Eye className="w-4 h-4" /> {file.filename}
                          </button>
                        </div>
                      ))
                  ) : (
                    <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                      <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No supporting documents uploaded</p>
                      <p className="text-sm mt-1">Upload certificates, photos, publications, etc.</p>
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
              disabled={saving}
              className={`inline-flex items-center justify-center gap-3 px-8 py-3 rounded-lg transition-all shadow-lg ${
                saving
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-green-600 hover:bg-green-700 text-white hover:shadow-xl"
              }`}
              title={saving ? "Saving..." : "Save all data"}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" /> Save Criterion 4.9
                </>
              )}
            </button>

            <button
              onClick={() => setIsEditMode(false)}
              disabled={saving}
              className="inline-flex items-center justify-center gap-3 px-8 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition shadow-lg"
              title="Cancel editing"
            >
              <X className="w-5 h-5" /> Cancel
            </button>

            {onDelete && (
              <button
                onClick={onDelete}
                disabled={saving}
                className="inline-flex items-center justify-center gap-3 px-8 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow-lg"
                title="Delete all data"
              >
                <Trash2 className="w-5 h-5" /> Delete
              </button>
            )}
          </div>
        )}

        {/* Overall Marks Summary */}
        <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-teal-50 border border-green-300 rounded-lg">
          <h4 className="text-lg font-bold text-green-700 mb-4">Overall Marks Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {fields.map((field) => (
              <div key={field.name} className="bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-gray-700">{field.name}</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {field.marks} marks
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-3">
                  {field.description?.substring(0, 80)}...
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-green-600">
                    {field.hasTable ? "Based on table data" : "Based on description"}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t border-green-300">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-gray-600">Total Possible Marks</div>
                <div className="text-3xl font-bold text-green-700">{marks} marks</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Professional Activities (20)</div>
                <div className="text-2xl font-bold text-blue-700">4.9.1 (5) + 4.9.2 (5) + 4.9.3 (10)</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <Modal
        isOpen={previewModal.isOpen}
        onRequestClose={() => setPreviewModal({ isOpen: false, file: null })}
        className="fixed inset-4 bg-white rounded-2xl shadow-2xl outline-none overflow-auto"
        overlayClassName="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 overflow-auto"

      >
        {previewModal.file && (
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center p-6 bg-[#2163c1] text-white">
              <h3 className="text-xl font-bold">{previewModal.file.filename}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => window.open(previewModal.file.s3Url, "_blank")}
                  className="px-3 py-1 bg-white bg-opacity-20 rounded hover:bg-opacity-30 transition"
                  title="Open in new tab"
                >
                  Open in New Tab
                </button>
                <button 
                  onClick={() => setPreviewModal({ isOpen: false, file: null })}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded transition"
                >
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

export default GenericCriteriaForm4_9;