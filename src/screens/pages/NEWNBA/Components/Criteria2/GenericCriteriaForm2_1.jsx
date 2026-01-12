// src/screens/pages/NEWNBA/Components/GenericCriteriaForm2_1.jsx

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Editor } from "react-editor";
import Modal from "react-modal";
import MergePdfModal from "../MergePdfModal";
import { toast } from "react-toastify";
import { nbaDashboardService } from "../../Services/NBA-dashboard.service";
import {
  GripVertical, Trash2, Plus, FileText, Save, CheckCircle,
  Upload, X, Edit
} from "lucide-react";

// Custom Table with Auto-calculation for 1.2.1
const CurriculumTable = ({ columns, data = [], onChange, disabled, fieldId = "default" }) => {
  const safeData = useMemo(() => {
    if (data.length > 0) {
      return data.map((r, i) => ({ 
        ...r, 
        id: r.id || `${fieldId}-row-${i}` 
      }));
    }
    return [{ 
      id: `${fieldId}-row-0`, 
      ...columns.reduce((acc, c) => ({ ...acc, [c.field]: "" }), {}) 
    }];
  }, [data, fieldId, columns]);

  const calculateRow = useCallback((row) => {
    const L = parseInt(row.L) || 0;
    const T = parseInt(row.T) || 0;
    const P = parseInt(row.P) || 0;
    const SL = parseInt(row.SL) || 0;
    const totalHours = L + T + P + SL;
    const credits = totalHours / 30;

    return {
      ...row,
      total_hours: totalHours.toString(),
      credits: credits.toString()
    };
  }, []);

  const handleChange = useCallback((i, field, val) => {
    const updated = [...safeData];
    updated[i][field] = val;
    
    if (["L", "T", "P", "SL"].includes(field)) {
      updated[i] = calculateRow(updated[i]);
    }
    
    onChange(updated);
  }, [safeData, onChange, calculateRow]);

  const addRow = useCallback(() => {
    const newRow = calculateRow({
      id: `${fieldId}-row-${safeData.length}`,
      ...columns.reduce((acc, c) => ({ ...acc, [c.field]: "" }), {})
    });
    onChange([...safeData, newRow]);
  }, [safeData, fieldId, columns, onChange, calculateRow]);

  const removeRow = useCallback((i) => {
    if (safeData.length <= 1) return;
    onChange(safeData.filter((_, idx) => idx !== i));
  }, [safeData, onChange]);

  const onDragEnd = useCallback((result) => {
    if (!result.destination) return;
    const items = Array.from(safeData);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    onChange(items);
  }, [safeData, onChange]);

  return (
    <div className="space-y-6">
      <DragDropContext onDragEnd={onDragEnd}>
        <table className="w-full table-auto border-collapse bg-white shadow-lg">
          <thead>
            <tr className="bg-[#2163c1] text-white">
              <th className="p-3 w-12" rowSpan="3"></th>
              <th className="p-3 border border-gray-300" rowSpan="3">Course Code</th>
              <th className="p-3 border border-gray-300" rowSpan="3">Course Title</th>
              <th className="p-3 border border-gray-300" colSpan="4">Teaching & Learning Scheme</th>
              <th className="p-3 border border-gray-300" rowSpan="3">Total no. of Hours per semester</th>
              <th className="p-3 text-center font-medium" rowSpan="3">Total Credits (C)<br/>(Total Hours / 30)</th>
              {!disabled && <th className="w-20" rowSpan="3"></th>}
            </tr>
            <tr className="bg-[#2163c1] text-white">
              <th className="p-2 text-center font-medium border-r border-white" colSpan="2">Classroom Instruction (CI)<br/>(in hours per semester)</th>
              <th className="p-2 text-center font-medium border-r border-white" colSpan="1">Lab Instruction (LI)<br/>(in hours per semester)</th>
              <th className="p-2 text-center font-medium" colSpan="1">Term Work (TW) and Self Learning (SL)<br/>(TW + SL) (in hours per semester)</th>
            </tr>
            <tr className="bg-[#2163c1] text-white">
              <th className="p-2 text-center font-medium border-r border-white">L</th>
              <th className="p-2 text-center font-medium border-r border-white">T</th>
              <th className="p-2 text-center font-medium border-r border-white">P</th>
              <th className="p-2 text-center font-medium">SL</th>
            </tr>
          </thead>
          <Droppable droppableId={`table-rows-${fieldId}`}>
            {(provided) => (
              <tbody {...provided.droppableProps} ref={provided.innerRef}>
                {safeData.map((row, i) => (
                  <Draggable key={row.id} draggableId={row.id.toString()} index={i} isDragDisabled={disabled}>
                    {(provided, snapshot) => (
                      <tr
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`border-b transition-all ${snapshot.isDragging ? "bg-indigo-50 shadow-2xl" : "hover:bg-gray-50"}`}
                      >
                        <td className="p-3">
                          <div {...provided.dragHandleProps} className="cursor-grab">
                            <GripVertical className="w-6 h-6 text-gray-500" />
                          </div>
                        </td>
                        {columns.map((col) => (
                          <td key={col.field} className="p-3">
                            <input
                              type={col.type === "number" ? "number" : "text"}
                              value={row[col.field] || ""}
                              onChange={(e) => handleChange(i, col.field, e.target.value)}
                              disabled={disabled || col.field === "total_hours" || col.field === "credits"}
                              readOnly={col.field === "total_hours" || col.field === "credits"}
                              placeholder={col.placeholder || ""}
                              className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                col.field === "total_hours" || col.field === "credits" ? "bg-gray-100 cursor-not-allowed" : ""
                              }`}
                            />
                          </td>
                        ))}
                        {!disabled && safeData.length > 1 && (
                          <td className="text-center">
                            <button
                              onClick={() => removeRow(i)}
                              className="text-red-600 hover:bg-red-50 p-3 rounded-full transition"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </tbody>
            )}
          </Droppable>
        </table>
      </DragDropContext>
      {!disabled && (
        <button
          onClick={addRow}
          className="flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:shadow-xl transition"
        >
          <Plus className="w-5 h-5" /> Add Row
        </button>
      )}
    </div>
  );
};

// Generic Table for non-curriculum sections
const GenericTable = ({ columns, data = [], onChange, disabled, fieldId = "default", tableConfig, allowInlineAdd = false,allowAddRow = false, }) => {
  const safeData = useMemo(() => {
    if (data.length > 0) {
      return data.map((r, i) => ({ 
        ...r, 
        id: r.id || `${fieldId}-row-${i}` 
      }));
    }
    if (tableConfig?.presetRows) {
      return tableConfig.presetRows.map((row, i) => ({ 
        ...row, 
        id: `${fieldId}-preset-${i}` 
      }));
    }
    return [{ 
      id: `${fieldId}-row-0`, 
      ...columns.reduce((acc, c) => ({ ...acc, [c.field]: c.type === "select" ? "3" : "" }), {}) 
    }];
  }, [data, fieldId, tableConfig, columns]);

  const calculateTotalCredits = useCallback((allRows) => {
    if (tableConfig?.autoCalculate) {
      const totalCredits = allRows
        .filter(row => !row.component?.includes("Total number of credits"))
        .reduce((sum, row) => {
          const credits = parseFloat(row.credits) || 0;
          return sum + credits;
        }, 0);
      
      return allRows.map(row => 
        row.component?.includes("Total number of credits")
          ? { ...row, credits: totalCredits.toString() }
          : row
      );
    }
    return allRows;
  }, [tableConfig]);

  const handleChange = useCallback((i, field, val) => {
    const updated = [...safeData];
    updated[i][field] = val;
    
    if (tableConfig?.autoCalculate && field === "credits") {
      const finalUpdated = calculateTotalCredits(updated);
      onChange(finalUpdated);
    } else {
      onChange(updated);
    }
  }, [safeData, tableConfig, onChange, calculateTotalCredits]);

  const addRow = useCallback(() => {
  const newRow = {
    id: `${fieldId}-row-new-${Date.now()}`, // Unique ID
    ...columns.reduce((acc, c) => ({ ...acc, [c.field]: c.type === "select" ? "3" : "" }), {})
  };

  // Find the index where the "Total number of credits" row is
  const totalRowIndex = safeData.findIndex(row => 
    row.component?.includes("Total number of credits")
  );

  let updatedData;
  if (totalRowIndex !== -1) {
    // Insert new row just BEFORE the total row
    updatedData = [
      ...safeData.slice(0, totalRowIndex),
      newRow,
      ...safeData.slice(totalRowIndex)
    ];
  } else {
    // If no total row exists, just add at the end
    updatedData = [...safeData, newRow];
  }

  onChange(updatedData);
}, [safeData, fieldId, columns, onChange]);

  const removeRow = useCallback((i) => {
    if (safeData.length <= 1) return;
    onChange(safeData.filter((_, idx) => idx !== i));
  }, [safeData, onChange]);

  return (
    <div className="space-y-6">
      <table className="w-full table-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-300">
        <thead>
          <tr className="bg-[#2163c1] text-white">
            <th className="p-4 w-12"></th>
            {columns.map((c) => (
              <th key={c.field} className="p-4 text-left font-medium">{c.header}</th>
            ))}
            {!disabled && <th className="w-20"></th>}
          </tr>
        </thead>
        <tbody>
          {safeData.map((row, i) => (
            <tr key={row.id} className="border-b hover:bg-gray-50">
              <td className="p-3">
                <GripVertical className="w-6 h-6 text-gray-500" />
              </td>
              {row.component?.includes("Total number of credits") ? (
                <>
                  <td colSpan="3" className="p-3">
                    <div className="font-bold text-lg">{row.component}</div>
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={row.credits || ""}
                      readOnly
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed font-bold"
                    />
                  </td>
                </>
              ) : (
                columns.map((col) => (
                  <td key={col.field} className="p-3">
                    <input
                      type={col.type || "text"}
                      value={row[col.field] || ""}
                      onChange={(e) => handleChange(i, col.field, e.target.value)}
                      disabled={disabled}
                      placeholder={col.placeholder || ""}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                ))
              )}
            {!disabled && !row.component?.includes("Total number of credits") && (
              <td className="text-center p-4">
                <div className="flex justify-center items-center gap-3">
                  {/* Plus button - adds new row just above the Total row */}
                  {allowInlineAdd && (
                    <button
                      onClick={addRow}
                      className="text-green-600 hover:bg-green-50 p-3 rounded-full"
                      title="Add new row"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  )}


                  {/* Delete button */}
                  <button
                    onClick={() => removeRow(i)}
                    disabled={safeData.length <= 2 && safeData.some(r => r.component?.includes("Total number of credits"))}
                    className={`p-3 rounded-full transition shadow-sm ${
                      (safeData.length <= 2 && safeData.some(r => r.component?.includes("Total number of credits")))
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-red-600 hover:bg-red-50"
                    }`}
                    title={
                      (safeData.length <= 2 && safeData.some(r => r.component?.includes("Total number of credits")))
                        ? "Cannot delete: at least one data row required"
                        : "Delete this row"
                    }
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </td>
            )}
            </tr>
          ))}
        </tbody>
      </table>
      {!disabled && !tableConfig?.presetRows && (
        <button
          onClick={addRow}
          className="flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:shadow-xl transition"
        >
          <Plus className="w-5 h-5" /> Add Row
        </button>
      )}
    </div>
  );
};

const GenericCriteriaForm2_1 = (props) => {
  const [isEditMode, setIsEditMode] = useState(!props.isCompleted && !props.hasExistingData);
  const [formValues, setFormValues] = useState(props.initialData?.content || {});
  const [tableData, setTableData] = useState(() => {
    const initial = props.initialData?.tableData || {};
    if (!initial["2.1.3"] || initial["2.1.3"].length === 0) {
      const field1_2_2 = props.fields?.find(f => f.name === "2.1.3");
      if (field1_2_2?.tableConfig?.presetRows) {
        initial["2.1.3"] = field1_2_2.tableConfig.presetRows.map((row, i) => ({
          ...row,
          id: `preset-2.1.3-${i}`,
          contact_hours: "",
          percentage: "",
          credits: ""
        }));
      }
    }
    return initial;
  });
  const [filesByField, setFilesByField] = useState(() => {
    if (props.initialData?.filesByField) {
      return props.initialData.filesByField;
    }
    const init = {};
    props.fields.forEach((field) => {
      init[field.name] = [
        { id: `file-${field.name}-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }
      ];
    });
    return init;
  });
  const [previewModal, setPreviewModal] = useState({ isOpen: false, file: null });
  const [mergeModal, setMergeModal] = useState({ isOpen: false, fieldName: null });

  useEffect(() => {
    if (props.initialData?.content) {
      setFormValues(props.initialData.content);
    }
    if (props.initialData?.tableData) {
      setTableData(props.initialData.tableData);
    }
    if (props.initialData?.filesByField) {
      setFilesByField(props.initialData.filesByField);
    }
  }, [props.initialData]);

  const updateTableData = useCallback((fieldName, newData) => {
    setTableData(prev => ({ ...prev, [fieldName]: newData }));
  }, []);

  const updateFormValue = useCallback((fieldName, value) => {
    setFormValues(prev => ({ ...prev, [fieldName]: value }));
  }, []);

  const addFileRow = useCallback((fieldName) => {
    setFilesByField(prev => ({
      ...prev,
      [fieldName]: [
        ...(prev[fieldName] || []),
        { id: `file-${fieldName}-${Date.now()}`, description: "", file: null, filename: "", s3Url: "", uploading: false }
      ]
    }));
  }, []);

  const updateFileDescription = useCallback((fieldName, index, value) => {
    setFilesByField(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].map((f, i) => (i === index ? { ...f, description: value } : f))
    }));
  }, []);

  const removeFileRow = useCallback((fieldName, index) => {
    setFilesByField(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((_, i) => i !== index)
    }));
  }, []);

    const handleDrop = (e, fieldName, index) => {
  e.preventDefault();
  e.stopPropagation();

  const droppedFile = e.dataTransfer.files?.[0];
  if (droppedFile) {
    handleFileChange(fieldName, index, droppedFile);
  }
};

const handleDragOver = (e) => {
  e.preventDefault();
  e.stopPropagation();
};

const handleFileDragEnd = (fieldName, result) => {
  if (!result.destination) return;

  setFilesByField((prev) => {
    const items = Array.from(prev[fieldName] || []);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);

    return {
      ...prev,
      [fieldName]: items,
    };
  });
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
      const s3Url = resData || resData?.url || "";

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
      toast.error("Upload failed");
      setFilesByField(prev => ({
        ...prev,
        [fieldName]: prev[fieldName].map((f, i) =>
          i === index ? { ...f, uploading: false, file: null, filename: "", s3Url: "" } : f
        )
      }));
    }
  };

  const handleSave = useCallback(() => {
    props.onSave({
      content: formValues,
      tableData,
      filesByField,
    });
    setIsEditMode(false);
  }, [formValues, tableData, filesByField, props.onSave]);

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
      <div className="bg-[#2163c1] text-white p-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold flex items-center gap-4">
            <FileText className="w-10 h-10" />
            {props.title}
            <span className="text-xl font-medium text-indigo-200">({props.marks} Marks)</span>
          </h2>
          {!props.isCompleted && (
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
        {props.fields.map((field) => (
          <div key={field.name} className="space-y-6">
            {field.type === "heading" ? (
              <div className="bg-gradient-to-r from-blue-100 to-indigo-100 border-2 border-blue-400 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-blue-700 flex justify-between items-center">
                  <span>{field.label}</span>
                  {field.marks && <span className="text-gray-600 font-medium">({field.marks} Marks)</span>}
                </h2>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold text-blue-700 flex justify-between items-center">
                  <span>{field.label}</span>
                  {field.marks && <span className="text-gray-600 font-medium">({field.marks} Marks)</span>}
                </h3>

                {field.hasTable ? (
                  field.name === "1.2.1" ? (
                    <CurriculumTable
                      columns={field.tableConfig.columns}
                      data={tableData[field.name] || []}
                      onChange={(newData) => updateTableData(field.name, newData)}
                      disabled={!isEditMode}
                      fieldId={field.name}
                    />
                  ) : (
                    <GenericTable
                      columns={field.tableConfig.columns}
                      data={tableData[field.name] || []}
                      onChange={(newData) => updateTableData(field.name, newData)}
                      disabled={!isEditMode}
                      fieldId={field.name}
                      tableConfig={field.tableConfig}
                       allowInlineAdd={field.addInlineRow === true}
                      allowAddRow={field.addRow === true}
                    />
                  )
                ) : (
                  <div className="border-2 border-gray-300 rounded-b-lg bg-white">
                    <Editor
                      value={formValues[field.name] || ""}
                      onChange={(val) => updateFormValue(field.name, val)}
                      disabled={!isEditMode || props.isCompleted}
                      style={{ minHeight: 240, padding: 16, fontSize: 16 }}
                      className="focus:outline-none"
                    />
                  </div>
                )}

               {/* Supporting Documents */}
{/* Supporting Documents */}
{!props.isCompleted && (
  <div className="mt-6 p-6 bg-gray-50 rounded-xl border border-gray-200">
    <div className="flex justify-between items-center mb-4">
      <h4 className="text-lg font-bold text-blue-700 flex items-center gap-2">
        <Upload className="w-6 h-6" /> Supporting Documents
      </h4>

      {isEditMode && filesByField[field.name]?.length > 1 && (
        <button
          onClick={() => setMergeModal({ isOpen: true, fieldName: field.name })}
          className="px-5 py-2.5 bg-[#2163c1] text-white font-medium rounded-lg
                     hover:bg-[#1d57a8] transition flex items-center gap-2 shadow"
        >
          <FileText className="w-5 h-5" /> Merge PDFs
        </button>
      )}
    </div>

    {isEditMode ? (
      <DragDropContext onDragEnd={(result) => handleFileDragEnd(field.name, result)}>
        <Droppable droppableId={`files-${field.name}`}>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="space-y-3"
            >
              {(filesByField[field.name] || []).map((file, index) => {
                const isOnlyOneRow = (filesByField[field.name] || []).length === 1;

                return (
                  <Draggable key={file.id} draggableId={file.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`flex items-center gap-4 p-4 bg-white rounded-lg border transition-all
                          ${
                            snapshot.isDragging
                              ? "border-indigo-500 shadow-lg"
                              : "border-gray-300"
                          }`}
                      >
                        {/* Drag Handle */}
                        <div {...provided.dragHandleProps} className="cursor-grab">
                          <GripVertical className="w-5 h-5 text-gray-400" />
                        </div>

                        {/* Description */}
                        <input
                          type="text"
                          value={file.description || ""}
                          onChange={(e) =>
                            updateFileDescription(field.name, index, e.target.value)
                          }
                          placeholder="Description"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded
                                     focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        {/* Upload Section */}
                        <div className="w-64 space-y-2">
                          {file.filename && !file.uploading && (
                            <button
                              onClick={() =>
                                setPreviewModal({ isOpen: true, file })
                              }
                              className="w-full text-left text-blue-600 font-medium
                                         hover:underline flex items-center gap-2 py-1"
                              title={file.filename}
                            >
                              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                              <span className="truncate block">
                                {file.filename}
                              </span>
                            </button>
                          )}

                          {file.uploading && (
                            <div className="text-gray-500 italic text-sm flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                              Uploading…
                            </div>
                          )}

                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            onChange={(e) =>
                              handleFileChange(
                                field.name,
                                index,
                                e.target.files?.[0]
                              )
                            }
                            disabled={file.uploading}
                            className="block w-full text-sm text-gray-700
                                       file:mr-4 file:py-2.5 file:px-5
                                       file:rounded-lg file:border-0
                                       file:text-sm file:font-medium
                                       file:bg-[#2163c1] file:text-white
                                       file:hover:bg-[#1d57a8]
                                       file:cursor-pointer cursor-pointer"
                          />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => addFileRow(field.name)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded transition"
                            title="Add another document"
                          >
                            <Plus className="w-5 h-5" />
                          </button>

                          <button
                            onClick={isOnlyOneRow ? undefined : () => removeFileRow(field.name, index)}
                            disabled={isOnlyOneRow}
                            className={`p-2 rounded transition ${
                              isOnlyOneRow
                                ? "text-gray-300 cursor-not-allowed"
                                : "text-red-500 hover:bg-red-50"
                            }`}
                            title={
                              isOnlyOneRow
                                ? "At least one document is required"
                                : "Remove document"
                            }
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
    ) : null}
  </div>
)}


              </>
            )}
          </div>
        ))}

        {isEditMode && !props.isCompleted && (
          <div className="text-center pt-10 flex gap-4 justify-center">
            <button
              onClick={handleSave}
              className="inline-flex items-center justify-center w-12 h-12 bg-[#2163c1] hover:bg-[#1d57a8] text-white rounded-lg transition shadow-lg"
              title="Save"
            >
              <Save className="w-6 h-6" />
            </button>
            <button
              onClick={() => setIsEditMode(false)}
              className="inline-flex items-center justify-center w-12 h-12 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition shadow-lg"
              title="Cancel"
            >
              <X className="w-6 h-6" />
            </button>
            <button
              onClick={props.onDelete}
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
              src={previewModal.file.s3Url || previewModal.file.url}
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

export default GenericCriteriaForm2_1;