// src/screens/pages/NEWNBA/Components/GenericCriteriaForm1_3.jsx

import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import Modal from "react-modal";
import MergePdfModal from "./MergePdfModal";
import { toast } from "react-toastify";
import { nbaDashboardService } from "../Services/NBA-dashboard.service";
import {
  GripVertical, Trash2, Plus, FileText, Save, CheckCircle,
  Upload, X, Edit
} from "lucide-react";

const GenericCriteriaForm1_3 = (props) => {
  const [isEditMode, setIsEditMode] = useState(!props.isCompleted && !props.hasExistingData);
  const [formValues, setFormValues] = useState(props.initialData?.content || {});
  const [tableData, setTableData] = useState(props.initialData?.tableData || {});
  const [filesByField, setFilesByField] = useState(() => {
    if (props.initialData?.filesByField) return props.initialData.filesByField;
    const init = {};
    props.fields.forEach((field) => {
      init[field.name] = [
        { id: `file-${Date.now()}-${field.name}-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }
      ];
    });
    return init;
  });
  const [previewModal, setPreviewModal] = useState({ isOpen: false, file: null });
  const [mergeModal, setMergeModal] = useState({ isOpen: false, fieldName: null });

  useEffect(() => {
    if (props.initialData?.content) setFormValues(props.initialData.content);
    if (props.initialData?.tableData) setTableData(props.initialData.tableData);
    if (props.initialData?.filesByField) setFilesByField(props.initialData.filesByField);
  }, [props.initialData]);

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

  const removeFileRow = (fieldName, index) => {
    setFilesByField((prev) => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((_, i) => i !== index),
    }));
  };

  const handleSave = () => {
    props.onSave({
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

                {/* Custom Content */}
                {field.type === "custom" && props.customContent?.[field.name] && (
                  <div className="space-y-6">{props.customContent[field.name]}</div>
                )}

                {/* Supporting Documents */}
                {field.hasFile && !props.isCompleted && (
                  <div className="mt-6 p-6 bg-gray-50 rounded-xl border">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-bold text-blue-700 flex items-center gap-2">
                        <Upload className="w-6 h-6" /> Supporting Documents
                      </h4>
                      {isEditMode && filesByField[field.name]?.length > 1 && (
                        <button
                          onClick={() => setMergeModal({ isOpen: true, fieldName: field.name })}
                          className="px-5 py-2.5 bg-[#2163c1] text-white font-medium rounded-lg hover:bg-[#1d57a8] transition flex items-center gap-2"
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
                          setFilesByField((prev) => ({ ...prev, [field.name]: items }));
                        }}
                      >
                        <Droppable droppableId={`files-${field.name}`}>
                          {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                              {(filesByField[field.name] || []).map((file, index) => {
                                if (!file.id) {
                                  file.id = `file-${Date.now()}-${field.name}-${index}-${Math.random().toString(36).substr(2, 9)}`;
                                }
                                const isOnlyOneRow = (filesByField[field.name] || []).length <= 1;
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

                                       <div className="w-64 space-y-2">
  {/* Uploaded Filename Display (on top) */}
  {file.filename && !file.uploading && (
    <button
      onClick={() => setPreviewModal({ isOpen: true, file })}
      className="w-full text-left text-blue-600 font-medium hover:underline flex items-center gap-2 py-1"
      title={file.filename}
    >
      <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-600" />
      <span className="truncate block">{file.filename}</span>
    </button>
  )}

  {file.uploading && (
    <div className="text-gray-500 italic text-sm py-1 flex items-center gap-2">
      <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
      <span>Uploading...</span>
    </div>
  )}

  {/* Choose File Input (below) */}
  <input
    type="file"
    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
    onChange={(e) => {
      const newFile = e.target.files?.[0];
      if (newFile) {
        handleFileChange(field.name, index, newFile);
      }
    }}
    className="block w-full text-sm text-gray-700
               file:mr-4 file:py-2.5 file:px-5 
               file:rounded-lg file:border-0
               file:text-sm file:font-medium
               file:bg-[#2163c1] file:text-white
               file:hover:bg-[#1d57a8] file:cursor-pointer
               cursor-pointer"
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
                                                                                    onClick={
                                                                                      isOnlyOneRow
                                                                                        ? undefined
                                                                                        : () => removeFileRow(field.name, index)
                                                                                    }
                                                                                    disabled={isOnlyOneRow}
                                                                                    className={`p-2 rounded transition ${isOnlyOneRow
                                                                                        ? "text-gray-300 cursor-not-allowed"
                                                                                        : "text-red-500 hover:bg-red-50"
                                                                                      }`}
                                                                                    title={isOnlyOneRow ? "At least one document is required" : "Remove document"}
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
                        {(filesByField[field.name] || []).map((file, index) => (
                          <div
                            key={file.id || `view-file-${field.name}-${index}`}
                            className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-300"
                          >
                            <div className="flex-1">
                              <span className="text-gray-700 font-medium">
                                {file.description || `Document ${index + 1}`}
                              </span>
                            </div>
                            <div className="w-64">
                              {file.filename && (file.s3Url || file.url) ? (
                                <button
                                  onClick={() => setPreviewModal({ isOpen: true, file })}
                                  className="text-blue-600 font-medium hover:underline flex items-center gap-2"
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

export default GenericCriteriaForm1_3;