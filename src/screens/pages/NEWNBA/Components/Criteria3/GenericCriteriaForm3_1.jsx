// src/screens/pages/NEWNBA/Components/Criteria3/GenericCriteriaForm3_1.jsx

import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Editor } from "react-editor";
import Modal from "react-modal";
import MergePdfModal from "../MergePdfModal"; // Adjust path according to your project structure
import { toast } from "react-toastify";
import { nbaDashboardService } from "../../Services/NBA-dashboard.service";
import {
  GripVertical, Trash2, Plus, FileText, Save, CheckCircle,
  Upload, X, Edit
} from "lucide-react";

// Reusable Generic Table Component (same logic as in GenericCriteriaForm1_4)
const GenericTable = ({ columns, data = [], onChange, disabled, fieldId = "default" }) => {
  const safeData = data.length > 0
    ? data.map((r, i) => ({ ...r, id: r.id || `row-${Date.now()}-${i}` }))
    : [{ id: `row-${Date.now()}-0`, ...columns.reduce((acc, c) => ({ ...acc, [c.field]: c.type === "select" ? "3" : "" }), {}) }];

  const handleChange = (i, field, val) => {
    const updated = [...safeData];
    updated[i][field] = val;
    onChange(updated);
  };

  const addRow = () => {
    const newRow = {
      id: `row-${Date.now()}`,
      ...columns.reduce((acc, c) => ({ ...acc, [c.field]: c.type === "select" ? "3" : "" }), {})
    };
    onChange([...safeData, newRow]);
  };

  const removeRow = (i) => {
    if (safeData.length <= 1) return;
    onChange(safeData.filter((_, idx) => idx !== i));
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
      <DragDropContext onDragEnd={onDragEnd}>
        <table className="w-full table-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-300">
          <thead>
            <tr className="bg-[#2163c5] text-white">
              <th className="p-4 w-12"></th>
              {columns.map((c) => (
                <th key={c.field} className="p-4 text-left font-medium">{c.header}</th>
              ))}
              {!disabled && <th className="w-20"></th>}
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
                            {col.type === "select" ? (
                              <select
                                value={row[col.field] || ""}
                                onChange={(e) => handleChange(i, col.field, e.target.value)}
                                disabled={disabled}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                {col.options?.map(opt => (
                                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type="text"
                                value={row[col.field] || ""}
                                onChange={(e) => handleChange(i, col.field, e.target.value)}
                                disabled={disabled}
                                placeholder={col.placeholder || ""}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            )}
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

const GenericCriteriaForm3_1 = ({
  title,
  marks,
  fields,
  initialData = {},
  saving = false,
  isCompleted = false,
  isContributorEditable = true,
  onSave,
  onDelete,
  customContent = {},
}) => {
  const [isEditMode, setIsEditMode] = useState(isContributorEditable && !isCompleted);
  const [formValues, setFormValues] = useState(initialData?.content || {});
  const [tableData, setTableData] = useState(initialData?.tableData || {});
  const [filesByField, setFilesByField] = useState(initialData?.filesByField || {});
  const [previewModal, setPreviewModal] = useState({ isOpen: false, file: null });
  const [mergeModal, setMergeModal] = useState({ isOpen: false, fieldName: null });

  useEffect(() => {
    if (initialData?.content) setFormValues(initialData.content);
    if (initialData?.tableData) setTableData(initialData.tableData);
    if (initialData?.filesByField) setFilesByField(initialData.filesByField);
  }, [initialData]);

  const handleFileChange = async (fieldName, index, newFile) => {
    if (!newFile || !(newFile instanceof File)) {
      toast.error("Invalid file selected");
      return;
    }

    const currentRow = filesByField[fieldName]?.[index] || {};
    setFilesByField(prev => ({
      ...prev,
      [fieldName]: prev[fieldName]?.map((f, i) =>
        i === index ? { ...f, file: newFile, filename: newFile.name, uploading: true } : f
      ) || []
    }));

    try {
      const formData = new FormData();
      formData.append("file", newFile);
      if (currentRow.description?.trim()) {
        formData.append("description", currentRow.description.trim());
      }

      const resData = await nbaDashboardService.uploadFile(formData);
      const s3Url = resData?.url || resData || "";

      setFilesByField(prev => ({
        ...prev,
        [fieldName]: prev[fieldName]?.map((f, i) =>
          i === index ? { ...f, s3Url, filename: newFile.name, uploading: false } : f
        ) || []
      }));

      toast.success("File uploaded successfully!");
    } catch (err) {
      toast.error("File upload failed");
      setFilesByField(prev => ({
        ...prev,
        [fieldName]: prev[fieldName]?.map((f, i) =>
          i === index ? { ...f, uploading: false, file: null, filename: "" } : f
        ) || []
      }));
    }
  };

  const addFileRow = (fieldName) => {
    setFilesByField(prev => ({
      ...prev,
      [fieldName]: [
        ...(prev[fieldName] || []),
        { id: `file-${Date.now()}-${fieldName}-${Math.random()}`, description: "", file: null, filename: "", s3Url: "", uploading: false }
      ]
    }));
  };

  const updateFileDescription = (fieldName, index, value) => {
    setFilesByField(prev => ({
      ...prev,
      [fieldName]: prev[fieldName]?.map((f, i) => i === index ? { ...f, description: value } : f) || []
    }));
  };

  const removeFileRow = (fieldName, index) => {
    setFilesByField(prev => ({
      ...prev,
      [fieldName]: prev[fieldName]?.filter((_, i) => i !== index) || []
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

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
      <div className="bg-[#2163c5] text-white p-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold flex items-center gap-4">
            <FileText className="w-10 h-10" />
            {title}
            <span className="text-xl font-medium text-indigo-200">({marks} Marks)</span>
          </h2>
          {isContributorEditable && !isCompleted && (
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`p-4 rounded-xl transition-all shadow-lg flex items-center justify-center ${
                isEditMode ? "bg-white hover:bg-gray-200 text-[#2163c5]" : "bg-white hover:bg-gray-100 text-[#2163c5]"
              }`}
              title={isEditMode ? "Cancel Edit" : "Edit Section"}
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

            {field.type === "custom" && customContent[field.name] && (
              <div className="space-y-6 border rounded-lg p-4 bg-gray-50">
                {customContent[field.name]}
              </div>
            )}

            {field.hasTable && (
              <GenericTable
                columns={field.tableConfig.columns}
                data={tableData[field.name] || []}
                onChange={(newData) => setTableData(prev => ({ ...prev, [field.name]: newData }))}
                disabled={!isEditMode}
                fieldId={field.name}
              />
            )}

            {field.type !== "custom" && !field.hasTable && (
              <div className="border-2 border-gray-300 rounded-b-lg bg-white">
                <Editor
                  value={formValues[field.name] || ""}
                  onChange={(val) => setFormValues(prev => ({ ...prev, [field.name]: val }))}
                  disabled={!isEditMode || isCompleted}
                  style={{ minHeight: 240, padding: 16, fontSize: 16 }}
                />
              </div>
            )}

            {field.hasFile && (
              <div className="mt-6 p-6 bg-gray-50 rounded-xl border">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-bold text-blue-700 flex items-center gap-2">
                    <Upload className="w-6 h-6" /> Supporting Documents
                  </h4>
                  {isEditMode && (filesByField[field.name]?.length || 0) > 1 && (
                    <button
                      onClick={() => setMergeModal({ isOpen: true, fieldName: field.name })}
                      className="px-5 py-2.5 bg-[#2163c5] text-white font-medium rounded-lg hover:bg-[#1d57a8] transition flex items-center gap-2"
                    >
                      <FileText className="w-5 h-5" /> Merge PDFs
                    </button>
                  )}
                </div>

                {isEditMode ? (
                  <DragDropContext
                    onDragEnd={(result) => {
                      if (!result.destination) return;
                      const items = Array.from(filesByField[field.name] || []);
                      const [moved] = items.splice(result.source.index, 1);
                      items.splice(result.destination.index, 0, moved);
                      setFilesByField(prev => ({ ...prev, [field.name]: items }));
                    }}
                  >
                    <Droppable droppableId={`files-${field.name}`}>
                      {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                          {(filesByField[field.name] || []).map((file, index) => {
                            const isOnlyOne = (filesByField[field.name]?.length || 0) <= 1;
                            return (
                              <Draggable key={file.id} draggableId={file.id} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className={`flex items-center gap-3 p-4 bg-white rounded-lg border transition-all ${
                                      snapshot.isDragging ? "border-indigo-500 shadow-lg" : "border-gray-300"
                                    }`}
                                  >
                                    <div {...provided.dragHandleProps}>
                                      <GripVertical className="w-5 h-5 text-gray-400" />
                                    </div>

                                    <input
                                      type="text"
                                      value={file.description || ""}
                                      onChange={(e) => updateFileDescription(field.name, index, e.target.value)}
                                      placeholder="Document description (optional)"
                                      className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />

                                    <div className="w-64 space-y-2">
                                      {file.filename && !file.uploading && (
                                        <button
                                          onClick={() => setPreviewModal({ isOpen: true, file })}
                                          className="w-full text-left text-blue-600 font-medium hover:underline flex items-center gap-2 py-1 truncate"
                                        >
                                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                          <span className="truncate">{file.filename}</span>
                                        </button>
                                      )}

                                      {file.uploading && (
                                        <div className="text-sm text-gray-500 italic flex items-center gap-2">
                                          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                                          Uploading...
                                        </div>
                                      )}

                                      <input
                                        type="file"
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                        onChange={(e) => {
                                          const newFile = e.target.files?.[0];
                                          if (newFile) handleFileChange(field.name, index, newFile);
                                        }}
                                        className="block w-full text-sm text-gray-700 file:mr-4 file:py-2.5 file:px-5 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#2163c5] file:text-white file:hover:bg-[#1d57a8] cursor-pointer"
                                        disabled={file.uploading}
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
                                      <button
                                        onClick={isOnlyOne ? undefined : () => removeFileRow(field.name, index)}
                                        disabled={isOnlyOne}
                                        className={`p-2 rounded transition ${
                                          isOnlyOne ? "text-gray-300 cursor-not-allowed" : "text-red-500 hover:bg-red-50"
                                        }`}
                                        title={isOnlyOne ? "At least one document required" : "Remove document"}
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
                    {(filesByField[field.name] || []).map((file, idx) => (
                      <div key={file.id} className="flex items-center gap-4 p-4 bg-white rounded-lg border">
                        <div className="flex-1">
                          <span className="font-medium text-gray-800">
                            {file.description || `Supporting Document ${idx + 1}`}
                          </span>
                        </div>
                        <div>
                          {file.filename && (file.s3Url || file.url) ? (
                            <button
                              onClick={() => setPreviewModal({ isOpen: true, file })}
                              className="text-blue-600 hover:underline flex items-center gap-2"
                            >
                              <CheckCircle className="w-4 h-4" /> {file.filename}
                            </button>
                          ) : (
                            <span className="text-gray-400 italic">No file uploaded</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {isEditMode && !isCompleted && (
          <div className="flex justify-center gap-6 pt-10">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-14 h-14 bg-[#2163c5] hover:bg-[#1d57a8] text-white rounded-xl shadow-lg transition flex items-center justify-center disabled:opacity-60"
              title="Save Changes"
            >
              <Save className="w-7 h-7" />
            </button>

            <button
              onClick={() => setIsEditMode(false)}
              className="w-14 h-14 bg-gray-500 hover:bg-gray-600 text-white rounded-xl shadow-lg transition flex items-center justify-center"
              title="Cancel"
            >
              <X className="w-7 h-7" />
            </button>

            <button
              onClick={onDelete}
              className="w-14 h-14 bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-lg transition flex items-center justify-center"
              title="Delete Section Data"
            >
              <Trash2 className="w-7 h-7" />
            </button>
          </div>
        )}
      </div>

      {/* Document Preview Modal */}
      <Modal
        isOpen={previewModal.isOpen}
        onRequestClose={() => setPreviewModal({ isOpen: false, file: null })}
        className="fixed inset-4 bg-white rounded-2xl shadow-2xl overflow-hidden outline-none"
        overlayClassName="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
      >
        {previewModal.file && (
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center p-6 bg-gradient-to-r from-blue-600 to-blue-400 text-white">
              <h3 className="text-xl font-bold truncate max-w-[80%]">{previewModal.file.filename}</h3>
              <button onClick={() => setPreviewModal({ isOpen: false, file: null })}>
                <X className="w-7 h-7" />
              </button>
            </div>
            <iframe
              src={previewModal.file.s3Url || previewModal.file.url}
              className="flex-1 w-full"
              title="Document Preview"
            />
          </div>
        )}
      </Modal>

      <MergePdfModal
        isOpen={mergeModal.isOpen}
        pdfFiles={filesByField[mergeModal.fieldName] || []}
        onClose={() => setMergeModal({ isOpen: false, fieldName: null })}
        onFileAdd={(mergedDocument) => {
          setFilesByField(prev => ({
            ...prev,
            [mergeModal.fieldName]: [...(prev[mergeModal.fieldName] || []), mergedDocument]
          }));
          setMergeModal({ isOpen: false, fieldName: null });
        }}
      />
    </div>
  );
};

export default GenericCriteriaForm3_1;