import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Editor } from "react-editor";
import Modal from "react-modal";
import MergePdfModal from "./MergePdfModal";
import { toast } from "react-toastify";
import { nbaDashboardService } from "../Services/NBA-dashboard.service";
import {
  GripVertical,
  Trash2,
  Plus,
  FileText,
  Save,
  CheckCircle,
  Upload,
  X,
  Edit,
} from "lucide-react";

Modal.setAppElement("#root");

const GenericCriteriaForm7_6 = ({
  title = "NBA Section",
  marks = 50,
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
  const [formValues, setFormValues] = useState(safeContent);

  const [filesByField, setFilesByField] = useState(() => {
    if (initialData?.filesByField) {
      return initialData.filesByField;
    }
    const init = {};
    fields.forEach((field) => {
      // Always initialize files for every field (including po_attainment)
      init[field.name] = [
        {
          id: `file-${Date.now()}-${field.name}-0`,
          description: "",
          file: null,
          filename: "",
          s3Url: "",
          uploading: false,
        },
      ];
    });
    return init;
  });

  const [previewModal, setPreviewModal] = useState({ isOpen: false, file: null });
  const [mergeModal, setMergeModal] = useState({ isOpen: false, fieldName: null });

  // Prepare structured data for saving
  const preparePoData = () => {
    const pos = ["PO1", "PO2", "PO3", "PO4", "PO5", "PO6", "PO7", "PO8", "PO9", "PO10", "PO11", "PO12"];
    const cays = ["caym1", "caym2", "caym3"];

    return cays.map((cay) => {
      const entry = { cay };
      pos.forEach((po) => {
        entry[po] = {
          target: formValues[`${po}_${cay}_target`] || "",
          attainment: formValues[`${po}_${cay}_attainment`] || "",
          observation: formValues[`${po}_${cay}_observation`] || "",
          actions: formValues[`${po}_${cay}_actions`] || ["", ""],
        };
      });
      return entry;
    });
  };

  const handleSave = () => {
    const poAttainmentData = preparePoData();

    // Debug: log exactly what will be sent
    console.log("Saving 7.6 → payload content:", {
      description: formValues.description || formValues["7.6"] || "",
      po_attainment_by_cay: poAttainmentData,
    });

    onSave({
      content: {
        description: formValues.description || formValues["7.6"] || "",
        po_attainment_by_cay: poAttainmentData,
      },
      filesByField,
    });

    setIsEditMode(false);
  };

  // File helpers
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
          uploading: false,
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
    if (!newFile || !(newFile instanceof File)) return toast.error("Invalid file");

    setFilesByField((prev) => ({
      ...prev,
      [fieldName]: prev[fieldName].map((f, i) =>
        i === index ? { ...f, file: newFile, filename: newFile.name, uploading: true } : f
      ),
    }));

    try {
      const formData = new FormData();
      formData.append("file", newFile);
      if (filesByField[fieldName]?.[index]?.description?.trim()) {
        formData.append("description", filesByField[fieldName][index].description.trim());
      }

      const resData = await nbaDashboardService.uploadFile(formData);
      const s3Url = resData?.downloadPath || resData?.url || resData || "";

      setFilesByField((prev) => ({
        ...prev,
        [fieldName]: prev[fieldName].map((f, i) =>
          i === index ? { ...f, s3Url, uploading: false } : f
        ),
      }));
      toast.success("Uploaded successfully!");
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error("Upload failed");
      setFilesByField((prev) => ({
        ...prev,
        [fieldName]: prev[fieldName].map((f, i) =>
          i === index ? { ...f, uploading: false, file: null, filename: "", s3Url: "" } : f
        ),
      }));
    }
  };

  const removeFileRow = (fieldName, index) => {
    setFilesByField((prev) => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((_, i) => i !== index),
    }));
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
          <div key={field.name} className="space-y-8 pb-10 border-b border-gray-200 last:border-0">
            <h3 className="text-xl font-bold text-blue-700 flex justify-between items-center">
              <span>{field.label}</span>
              {field.marks && <span className="text-gray-600 font-medium">({field.marks} Marks)</span>}
            </h3>

            {/* Description Editor – use key "description" */}
            {field.hasEditor && (
              <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm">
                <Editor
                  value={formValues.description || ""}
                  onChange={(val) => setFormValues((prev) => ({ ...prev, description: val }))}
                  disabled={!isEditMode || isCompleted}
                  style={{ minHeight: 280, padding: 20, fontSize: 16, lineHeight: 1.7 }}
                  className="focus:outline-none prose max-w-none"
                />
              </div>
            )}

            {/* PO Attainment Section */}
            {field.showPOTable && (
              <div className="mt-10 space-y-16">
                {["CAYm1", "CAYm2", "CAYm3"].map((cay) => (
                  <div key={cay} className="space-y-8">
                    <h4 className="text-xl font-bold text-gray-800 border-b-2 border-blue-200 pb-2">
                      POs Attainment Levels and Actions for improvement – {cay}
                    </h4>

                    {["PO1", "PO2", "PO3", "PO4", "PO5", "PO6", "PO7", "PO8", "PO9", "PO10", "PO11", "PO12"].map((po) => {
                      const targetKey = `${po}_${cay}_target`;
                      const attainmentKey = `${po}_${cay}_attainment`;
                      const obsKey = `${po}_${cay}_observation`;
                      const actionsKey = `${po}_${cay}_actions`;

                      const actions = formValues[actionsKey] || ["", ""];

                      const addAction = () => {
                        setFormValues((prev) => ({
                          ...prev,
                          [actionsKey]: [...actions, ""],
                        }));
                      };

                      const removeAction = (index) => {
                        if (actions.length <= 2) return;
                        setFormValues((prev) => ({
                          ...prev,
                          [actionsKey]: actions.filter((_, i) => i !== index),
                        }));
                      };

                      const updateAction = (index, value) => {
                        setFormValues((prev) => {
                          const newActions = [...(prev[actionsKey] || ["", ""])];
                          newActions[index] = value;
                          return { ...prev, [actionsKey]: newActions };
                        });
                      };

                      return (
                        <div
                          key={`${po}-${cay}`}
                          className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm"
                        >
                          <div className="bg-yellow-50 px-6 py-3 font-medium text-gray-800 border-b">
                            {po}: Statement as mentioned in Annexure I
                          </div>

                          <table className="w-full text-sm">
                            <thead className="bg-yellow-100 text-gray-800 text-xs uppercase">
                              <tr>
                                <th className="px-6 py-3 text-left w-32">POs</th>
                                <th className="px-6 py-3 text-center">Target Level</th>
                                <th className="px-6 py-3 text-center">Attainment Level</th>
                                <th className="px-6 py-3 text-center">Observations</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium">{po}</td>
                                <td className="px-4 py-3">
                                  <input
                                    type="text"
                                    disabled={!isEditMode}
                                    value={formValues[targetKey] || ""}
                                    onChange={(e) =>
                                      setFormValues((prev) => ({
                                        ...prev,
                                        [targetKey]: e.target.value,
                                      }))
                                    }
                                    className="w-full px-3 py-2 text-center border border-gray-300 rounded disabled:bg-gray-50"
                                    placeholder="---"
                                  />
                                </td>
                                <td className="px-4 py-3">
                                  <input
                                    type="text"
                                    disabled={!isEditMode}
                                    value={formValues[attainmentKey] || ""}
                                    onChange={(e) =>
                                      setFormValues((prev) => ({
                                        ...prev,
                                        [attainmentKey]: e.target.value,
                                      }))
                                    }
                                    className="w-full px-3 py-2 text-center border border-gray-300 rounded disabled:bg-gray-50"
                                    placeholder="---"
                                  />
                                </td>
                                <td className="px-4 py-3">
                                  <input
                                    type="text"
                                    disabled={!isEditMode}
                                    value={formValues[obsKey] || ""}
                                    onChange={(e) =>
                                      setFormValues((prev) => ({
                                        ...prev,
                                        [obsKey]: e.target.value,
                                      }))
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded disabled:bg-gray-50"
                                    placeholder="..."
                                  />
                                </td>
                              </tr>
                            </tbody>
                          </table>

                          <div className="px-6 py-4 space-y-3 bg-gray-50/70">
                            <div className="font-medium text-gray-700 mb-2">
                              Actions to be written as per table in 5.3.2:
                            </div>

                            {actions.map((action, idx) => (
                              <div key={idx} className="flex items-center gap-4">
                                <span className="font-medium min-w-[100px]">
                                  Action {idx + 1}:
                                </span>

                                {isEditMode ? (
                                  <div className="flex-1 flex items-center gap-2">
                                    <input
                                      type="text"
                                      value={action}
                                      onChange={(e) => updateAction(idx, e.target.value)}
                                      className="flex-1 px-3 py-2 border border-gray-300 rounded"
                                      placeholder="Write action here..."
                                    />
                                    {actions.length > 2 && (
                                      <button
                                        onClick={() => removeAction(idx)}
                                        className="text-red-600 hover:text-red-800 p-1"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    )}
                                  </div>
                                ) : (
                                  <div className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded">
                                    {action || "—"}
                                  </div>
                                )}
                              </div>
                            ))}

                            {isEditMode && (
                              <button
                                onClick={addAction}
                                className="mt-3 text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                              >
                                <Plus size={16} /> Add another action
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}

            {/* File upload – ALWAYS shown */}
            <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
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
                          if (!file.id) file.id = `file-${Date.now()}-${field.name}-${index}-${Math.random().toString(36).substr(2, 9)}`;
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
                                      disabled={(filesByField[field.name] || []).length === 1}
                                      className={`p-2 rounded transition ${
                                        (filesByField[field.name] || []).length === 1
                                          ? "text-gray-300 cursor-not-allowed"
                                          : "text-red-500 hover:bg-red-50"
                                      }`}
                                      title={
                                        (filesByField[field.name] || []).length === 1
                                          ? "At least one supporting document is required"
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
          </div>
        ))}

        {isEditMode && !isCompleted && (
          <div className="text-center pt-10 flex gap-4 justify-center">
            <button
              onClick={handleSave}
              className={`inline-flex items-center justify-center w-12 h-12 rounded-lg transition-all ${
                saving || !isContributorEditable
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

            {onDelete && (
              <button
                onClick={onDelete}
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
              <button onClick={() => setPreviewModal({ isOpen: false, file: null })}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <iframe src={previewModal.file.s3Url} title={previewModal.file.filename} className="flex-1 w-full" />
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

export default GenericCriteriaForm7_6;