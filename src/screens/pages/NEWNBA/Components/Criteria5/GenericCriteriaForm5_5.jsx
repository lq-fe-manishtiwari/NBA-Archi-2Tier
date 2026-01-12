// GenericCriteriaForm5_5.jsx
import React, { useState } from "react";
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
Modal.setAppElement("#root");

// Generic Table for 5.5 Faculty Retention
// In GenericCriteriaForm5_5.jsx, update the GenericTable component:
// GenericTable component inside GenericCriteriaForm5_5.jsx - UPDATED VERSION
const GenericTable = ({ columns, data = [], onChange, disabled, tableConfig }) => {

    const safeData = data.length > 0
      ? data
      : (columns.some(c => c.readOnly) && tableConfig?.predefinedRows)
        ? tableConfig.predefinedRows.map((r, i) => ({
          id: `row-${Date.now()}-${i}`,
          ...r,
          caym1: i === 0 ? "117" : i === 1 ? "120" : i === 2 ? "1" : i === 3 ? "2" : i === 4 ? "1" : i === 5 ? "1" : i === 6 ? "115" : "",
          caym2: i === 0 ? "117" : i === 1 ? "124" : i === 2 ? "0" : i === 3 ? "3" : i === 4 ? "2" : i === 5 ? "0" : i === 6 ? "119" : "",
          caym3: i === 0 ? "115" : i === 1 ? "125" : i === 2 ? "2" : i === 3 ? "10" : i === 4 ? "2" : i === 5 ? "1" : i === 6 ? "110" : "",
        }))
        : Array.from({ length: 9 }).map((_, i) => ({
          id: `row-${Date.now()}-${i}`,
          ...columns.reduce((acc, c) => ({ ...acc, [c.field]: "" }), {}),
        }));
  
    // Function to calculate FR for a specific year
    const calculateFRForYear = (year, updatedData) => {
      try {
        // Get indices based on the table structure
        const RF = parseFloat(updatedData[0]?.[year] || 0);
        const A = parseFloat(updatedData[2]?.[year] || 0);
        const B = parseFloat(updatedData[3]?.[year] || 0);
        const C = parseFloat(updatedData[4]?.[year] || 0);
        const D = parseFloat(updatedData[5]?.[year] || 0);
        const E = parseFloat(updatedData[6]?.[year] || 0);
  
        if (RF > 0) {
          // FR = ((A*0)+(B*1)+(C*2)+(D*3)+(E*4))/RF * 2.5
          const numerator = (A * 0) + (B * 1) + (C * 2) + (D * 3) + (E * 4);
          const FR = (numerator / RF) * 2.5;
          
          // Cap at 10 as per NBA guidelines
          const cappedFR = Math.min(FR, 10);
          
          // Format to 2 decimal places
          return cappedFR.toFixed(2);
        }
        return "0.00";
      } catch (error) {
        console.error("Error calculating FR:", error);
        return "0.00";
      }
    };
  
    // Function to calculate average FR
    const calculateAverageFR = (fr1, fr2, fr3) => {
      try {
        const sum = (parseFloat(fr1) || 0) + (parseFloat(fr2) || 0) + (parseFloat(fr3) || 0);
        const average = sum / 3;
        const cappedAverage = Math.min(average, 10); // Cap at 10
        return cappedAverage.toFixed(2);
      } catch (error) {
        return "0.00";
      }
    };
  
    // Function to update all FR calculations
    const updateAllFRCalculations = (updatedData) => {
      const updated = [...updatedData];
      
      try {
        // Calculate FR for each year separately
        const FR_CAYm1 = calculateFRForYear('caym1', updated);
        const FR_CAYm2 = calculateFRForYear('caym2', updated);
        const FR_CAYm3 = calculateFRForYear('caym3', updated);
        
        // Update FR row (index 7)
        updated[7] = {
          ...updated[7],
          item: "FR = ((A×0)+(B×1)+(C×2)+(D×3)+(E×4))/RF × 2.5",
          caym1: FR_CAYm1,
          caym2: FR_CAYm2,
          caym3: FR_CAYm3
        };
  
        // Calculate average FR
        const averageFR = calculateAverageFR(FR_CAYm1, FR_CAYm2, FR_CAYm3);
  
        // Update Average FR row (index 8)
        updated[8] = {
          ...updated[8],
          item: "Average FR = (FR_1 + FR_2 + FR_3)/3",
          caym1: averageFR,
          caym2: averageFR,
          caym3: averageFR,
          averageFR: averageFR,
        };
      } catch (error) {
        console.error("Error updating calculations:", error);
      }
  
      return updated;
    };
  
    const handleChange = (i, field, val) => {
      let updated = [...safeData];
  
      // Update cell value - ensure it's a valid number
      const numericValue = val === "" ? "" : parseFloat(val) || 0;
      updated[i][field] = numericValue;
  
      // If any of the input values changed (RF, A, B, C, D, E rows), recalculate FR
      const inputRowIndices = [0, 1, 2, 3, 4, 5, 6]; // RF, AF, A, B, C, D, E
      
      if (inputRowIndices.includes(i)) {
        // Recalculate all FR values
        updated = updateAllFRCalculations(updated);
      }
  
      onChange(updated);
    };
  
    const onDragEnd = (result) => {
      if (!result.destination) return;
      const items = Array.from(safeData);
      const [moved] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, moved);
      onChange(items);
    };
  
    return (
      <div className="space-y-6">
        <div className="text-sm text-gray-600 mb-4">
          <strong>Note:</strong> FR = ((A×0)+(B×1)+(C×2)+(D×3)+(E×4))/RF × 2.5 (Maximum 10 points)
        </div>
        
        <DragDropContext onDragEnd={onDragEnd}>
          <table className="w-full table-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-300">
            <thead>
              <tr className="bg-[#2163c1] text-white">
                <th className="p-4 w-12"></th>
                {columns.map((c) => (
                  <th key={c.field} className="p-4 text-left font-medium">{c.header}</th>
                ))}
              </tr>
            </thead>
            <Droppable droppableId="table-rows">
              {(provided) => (
                <tbody {...provided.droppableProps} ref={provided.innerRef}>
                  {safeData.map((row, i) => (
                    <Draggable key={row.id} draggableId={row.id.toString()} index={i} isDragDisabled={disabled || i >= 7}>
                      {(provided, snapshot) => (
                        <tr
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`border-b transition-all ${snapshot.isDragging ? "bg-indigo-50 shadow-2xl" : "hover:bg-gray-50"} ${i >= 7 ? 'bg-blue-50' : ''}`}
                        >
                          <td className="p-3">
                            {i < 7 && (
                              <div {...provided.dragHandleProps} className="cursor-grab">
                                <GripVertical className="w-6 h-6 text-gray-500" />
                              </div>
                            )}
                          </td>
  
                          {/* Item Column - Always visible */}
                          <td className="p-3 font-medium text-gray-800 whitespace-normal">
                            {row.item}
                          </td>
  
                          {/* For RF, AF, A, B, C, D, E rows (indices 0-6) */}
                          {i >= 0 && i <= 6 ? (
                            columns.slice(1).map((col) => (
                              <td key={col.field} className="p-3">
                                <input
                                  type="number"
                                  step="1"
                                  min="0"
                                  value={row[col.field] || ""}
                                  onChange={(e) => handleChange(i, col.field, e.target.value)}
                                  disabled={disabled}
                                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-center font-medium"
                                  placeholder="0"
                                />
                              </td>
                            ))
                          ) : 
                          /* For FR row (index 7) - Read only, shows 3 columns */
                          i === 7 ? (
                            columns.slice(1).map((col) => (
                              <td key={col.field} className="p-3 text-center">
                                <div className="font-bold text-green-600 bg-green-50 px-4 py-2.5 rounded-lg">
                                  {row[col.field] || "0.00"}
                                </div>
                              </td>
                            ))
                          ) : 
                          /* For Average FR row (index 8) - Shows average in all 3 columns */
                          i === 8 ? (
                            <td colSpan={3} className="p-6 text-center">
                              <div className="font-bold text-indigo-700 text-lg bg-gradient-to-r from-indigo-100 to-blue-100 px-6 py-4 rounded-xl">
                                {row.averageFR || "0.00"}
                              </div>
                            </td>
                          ) : null}
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
        
        {/* Explanation of calculation with actual values */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-bold text-blue-700 mb-2">Calculation Formula with Values:</h4>
          
          {/* CAYm1 Calculation */}
          <div className="mb-3 p-3 bg-white rounded-lg">
            <strong>CAYm1 Calculation:</strong>
            <div className="text-sm font-mono">
              FR = (({safeData[2]?.caym1 || "A"}×0) + ({safeData[3]?.caym1 || "B"}×1) + ({safeData[4]?.caym1 || "C"}×2) + ({safeData[5]?.caym1 || "D"}×3) + ({safeData[6]?.caym1 || "E"}×4)) / {safeData[0]?.caym1 || "RF"} × 2.5
            </div>
            <div className="text-sm font-mono mt-1">
              = (({safeData[2]?.caym1 || "0"}×0) + ({safeData[3]?.caym1 || "0"}×1) + ({safeData[4]?.caym1 || "0"}×2) + ({safeData[5]?.caym1 || "0"}×3) + ({safeData[6]?.caym1 || "0"}×4)) / {safeData[0]?.caym1 || "0"} × 2.5
            </div>
            <div className="text-sm font-mono mt-1">
              = ({(safeData[2]?.caym1 || 0) * 0} + {(safeData[3]?.caym1 || 0) * 1} + {(safeData[4]?.caym1 || 0) * 2} + {(safeData[5]?.caym1 || 0) * 3} + {(safeData[6]?.caym1 || 0) * 4}) / {safeData[0]?.caym1 || "0"} × 2.5
            </div>
            <div className="text-sm font-bold text-green-600 mt-1">
              FR_1 = {safeData[7]?.caym1 || "0.00"}
            </div>
          </div>
  
          {/* CAYm2 Calculation */}
          <div className="mb-3 p-3 bg-white rounded-lg">
            <strong>CAYm2 Calculation:</strong>
            <div className="text-sm font-mono">
              FR = (({safeData[2]?.caym2 || "A"}×0) + ({safeData[3]?.caym2 || "B"}×1) + ({safeData[4]?.caym2 || "C"}×2) + ({safeData[5]?.caym2 || "D"}×3) + ({safeData[6]?.caym2 || "E"}×4)) / {safeData[0]?.caym2 || "RF"} × 2.5
            </div>
            <div className="text-sm font-mono mt-1">
              = ({(safeData[2]?.caym2 || 0) * 0} + {(safeData[3]?.caym2 || 0) * 1} + {(safeData[4]?.caym2 || 0) * 2} + {(safeData[5]?.caym2 || 0) * 3} + {(safeData[6]?.caym2 || 0) * 4}) / {safeData[0]?.caym2 || "0"} × 2.5
            </div>
            <div className="text-sm font-bold text-green-600 mt-1">
              FR_2 = {safeData[7]?.caym2 || "0.00"}
            </div>
          </div>
  
          {/* CAYm3 Calculation */}
          <div className="mb-3 p-3 bg-white rounded-lg">
            <strong>CAYm3 Calculation:</strong>
            <div className="text-sm font-mono">
              FR = (({safeData[2]?.caym3 || "A"}×0) + ({safeData[3]?.caym3 || "B"}×1) + ({safeData[4]?.caym3 || "C"}×2) + ({safeData[5]?.caym3 || "D"}×3) + ({safeData[6]?.caym3 || "E"}×4)) / {safeData[0]?.caym3 || "RF"} × 2.5
            </div>
            <div className="text-sm font-mono mt-1">
              = ({(safeData[2]?.caym3 || 0) * 0} + {(safeData[3]?.caym3 || 0) * 1} + {(safeData[4]?.caym3 || 0) * 2} + {(safeData[5]?.caym3 || 0) * 3} + {(safeData[6]?.caym3 || 0) * 4}) / {safeData[0]?.caym3 || "0"} × 2.5
            </div>
            <div className="text-sm font-bold text-green-600 mt-1">
              FR_3 = {safeData[7]?.caym3 || "0.00"}
            </div>
          </div>
  
          {/* Average Calculation */}
          <div className="mt-3 pt-3 border-t p-3 bg-indigo-50 rounded-lg">
            <strong>Average FR Calculation:</strong>
            <div className="text-sm font-mono">
              Average FR = ({safeData[7]?.caym1 || "FR_1"} + {safeData[7]?.caym2 || "FR_2"} + {safeData[7]?.caym3 || "FR_3"}) / 3
            </div>
            <div className="text-sm font-mono mt-1">
              = ({parseFloat(safeData[7]?.caym1) || 0} + {parseFloat(safeData[7]?.caym2) || 0} + {parseFloat(safeData[7]?.caym3) || 0}) / 3
            </div>
            <div className="text-lg font-bold text-indigo-700 mt-2">
              Final Average FR = {safeData[8]?.averageFR || "0.00"}
            </div>
          </div>
        </div>
      </div>
    );
  };

// Main Component for 5.5
const GenericCriteriaForm5_5 = ({
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

  const [filesByField, setFilesByField] = useState(() => {
    const init = {};
    fields.forEach((field) => {
      // Always ensure at least one row exists
      const existingFiles = initialData?.filesByField?.[field.name] || [];
      if (existingFiles.length === 0) {
        init[field.name] = [
          { id: `file-${Date.now()}-${field.name}-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }
        ];
      } else {
        init[field.name] = existingFiles;
      }
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

    // Optimistic UI update
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
      const s3Url = typeof resData === 'string' ? resData : (resData?.downloadPath || resData?.url || "");

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
    setFilesByField((prev) => {
      const currentFiles = prev[fieldName] || [];
      // Don't allow removing the last row if it's the only one
      if (currentFiles.length <= 1) {
        // Reset the single row instead of removing it
        return {
          ...prev,
          [fieldName]: [{ id: `file-${Date.now()}-${fieldName}-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }]
        };
      }
      // Remove the row if there are multiple rows
      return {
        ...prev,
        [fieldName]: currentFiles.filter((_, i) => i !== index),
      };
    });
  };

  const handleSave = () => {
    onSave({
      content: formValues,
      tableData,
      filesByField,
    });
    setIsEditMode(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
      <div className="bg-[#2163c1] text-white p-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold flex items-center gap-4">
            <FileText className="w-10 h-10" />
            {title}
            <span className="text-xl font-medium text-indigo-200">({marks} Marks)</span>
          </h2>
          {!isCompleted && (
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
              <GenericTable
                columns={field.tableConfig.columns}
                data={tableData}
                onChange={setTableData}
                disabled={!isEditMode}
                tableConfig={field.tableConfig}
              />
            ) : (
              <div className="border-2 border-gray-300 rounded-b-lg bg-white">
                <Editor
                  value={formValues[field.name] || ""}
                  onChange={(val) => setFormValues((prev) => ({ ...prev, [field.name]: val }))}
                  disabled={!isEditMode || isCompleted}
                  style={{ minHeight: 240, padding: 16, fontSize: 16 }}
                  className="focus:outline-none"
                />
              </div>
            )}

            {isEditMode && !isCompleted && (
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
                          if (!file.id) {
                            file.id = `file-${Date.now()}-${field.name}-${Math.random()}`;
                          }
                          return (
                            <Draggable key={file.id} draggableId={file.id.toString()} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`flex items-center gap-3 p-4 bg-white rounded-lg border transition-all ${snapshot.isDragging ? "border-indigo-500 shadow-lg" : "border-gray-300"}`}
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
                                      >
                                        <CheckCircle className="w-4 h-4" /> {file.filename}
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
              </div>
            )}
          </div>
        ))}

        {isEditMode && !isCompleted && (
          <div className="text-center pt-10 flex gap-4 justify-center">
            <button
              onClick={handleSave}
              className={`inline-flex items-center justify-center w-12 h-12 rounded-lg transition-all ${saving || !isContributorEditable
                ? "bg-[#2163c1] cursor-pointer opacity-60"
                : "bg-[#2163c1] hover:bg-[#1d57a8] text-white shadow-lg hover:shadow-xl"
                }`}
              title={saving ? "Saving..." : !isContributorEditable ? "Not allowed to save" : "Save"}
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

export default GenericCriteriaForm5_5;