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
import { uploadFileToS3 } from "../S3UploadHelper";
Modal.setAppElement("#root");

// Generic Table
const GenericTable = ({ columns, data = [], onChange, disabled, tableConfig }) => {

  const safeData =
  data.length > 0
    ? data
    : tableConfig?.predefinedRows
    ? tableConfig.predefinedRows.map((r, i) => ({
        id: `row-${Date.now()}-${i}`,
        ...r,
      }))
    : [];

  const handleChange = (i, field, val) => {
  const updated = [...safeData];

  updated[i][field] = val;

  // ER row update (row 3)
  // ["caym1", "caym2", "caym3"].forEach(col => {
  //   const N = parseFloat(updated[0][col]) || 0;
  //   const N1 = parseFloat(updated[1][col]) || 0;
  //   const N4 = parseFloat(updated[2][col]) || 0;

  //   updated[3][col] = N > 0 ? (N * (N1/N4)).toFixed(2) : "0.00";
  // });

  ["caym1", "caym2", "caym3"].forEach(col => {
  const X = parseFloat(updated[0][col]) || 0;
  const Y = parseFloat(updated[1][col]) || 0;
  const Z = parseFloat(updated[2][col]) || 0;

  // Prevent Infinity / NaN
  if (Z === 0 || isNaN(Z) || Z === null || Z === undefined) {
    updated[3][col] = "0.00";   // API should not be calculated
  } else {
    const api = X * (Y / Z);
    updated[3][col] = isFinite(api) ? api.toFixed(2) : "0.00";
  }
});


  // Average API row update (row 4)
  const avg =
    (parseFloat(updated[3].caym1) +
      parseFloat(updated[3].caym2) +
      parseFloat(updated[3].caym3)) /
      3 || 0;

  const averageER = avg.toFixed(2);

  updated[4] = {
    ...updated[4],
    caym1: averageER,
    caym2: averageER,
    caym3: averageER,
    averageER,
  };

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
      <DragDropContext onDragEnd={onDragEnd}>
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
          <Droppable droppableId="table-rows">
            {(provided) => (
              <tbody {...provided.droppableProps} ref={provided.innerRef}>
                {safeData.map((row, i) => (
                  <Draggable key={row.id} draggableId={row.id.toString()} index={i} isDragDisabled={disabled || i === 4}>
                    {(provided, snapshot) => (
                      <tr
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`border-b transition-all ${snapshot.isDragging ? "bg-indigo-50 shadow-2xl" : "hover:bg-gray-50"}`}
                      >
                        <td className="p-3">
                          {i !== 4 && (
                            <div {...provided.dragHandleProps} className="cursor-grab">
                              <GripVertical className="w-6 h-6 text-gray-500" />
                            </div>
                          )}
                        </td>

                        {/* Item Column */}
                        <td className="p-3 font-medium text-gray-800">
                          {row.item}
                        </td>

                        {/* Special Handling for Average Row (i === 4) */}
                        {i === 4 ? (
                          <td colSpan={3} className="p-6 text-center bg-gradient-to-r from-indigo-100 to-blue-100">
                            {row.averageER || row.caym1 || "0.00"}
                          </td>
                        ) : (
                          /* Normal 3 columns for other rows */
                          columns.slice(1).map((col) => (  // slice(1) because first is "item"
                            <td key={col.field} className="p-3">
                              {col.readOnly || i === 3 ? (
                                <div className="text-center font-semibold text-indigo-600 bg-indigo-50 px-4 py-2.5 rounded-lg">
                                  {row[col.field] || "0.00"}
                                </div>
                              ) : (
                                <input
                                  type="number"
                                  step="1"
                                  value={row[col.field] || ""}
                                  onChange={(e) => handleChange(i, col.field, e.target.value)}
                                  disabled={disabled}
                                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-center font-medium"
                                  placeholder="0"
                                />
                              )}
                            </td>
                          ))
                        )}

                        {/* Delete button (only for non-average rows) */}
                        {/* {!disabled && i !== 4 && (
            <td className="p-3 text-right">
            </td>
          )} */}
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
    </div>
  );
};

// Main Component
const GenericCriteriaForm4_3 = ({
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
  const safeTableData = initialData?.tableData || [];

  const [filesByField, setFilesByField] = useState(() => {
    // If initialData has filesByField, use it; otherwise initialize with empty slots
    if (initialData?.filesByField) {
      console.log("Initializing filesByField from initialData:", initialData.filesByField);
      return initialData.filesByField;
    }

    // Default initialization with empty file slots
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
    setFilesByField(prev => ({
      ...prev,
      [fieldName]: [...(prev[fieldName] || []), { id: `file-${Date.now()}-${fieldName}-${Math.random()}`, description: "", file: null, filename: "", s3Url: "", uploading: false }]
    }));
  };

  const updateFileDescription = (fieldName, index, value) => {
    setFilesByField(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].map((f, i) => i === index ? { ...f, description: value } : f)
    }));
  };

  const handleFileChange = async (fieldName, index, newFile) => {
    if (!newFile || !(newFile instanceof File)) return toast.error("Invalid file");

    setFilesByField(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].map((f, i) => i === index ? { ...f, file: newFile, filename: newFile.name, uploading: true } : f)
    }));

    try {
      const formData = new FormData();
      formData.append("file", newFile);
      if (filesByField[fieldName][index].description?.trim())
        formData.append("description", filesByField[fieldName][index].description.trim());

      const resData = await nbaDashboardService.uploadFile(formData);
      const s3Url = resData?.downloadPath || resData?.url || resData || "";
      
      console.log("✅ File uploaded, response:", resData);
      console.log("✅ Extracted s3Url:", s3Url);

      setFilesByField(prev => ({
        ...prev,
        [fieldName]: prev[fieldName].map((f, i) => i === index ? { ...f, s3Url, uploading: false } : f)
      }));
      toast.success("Uploaded successfully!");
    } catch (err) {
      console.error("❌ Upload failed:", err);
      toast.error("Upload failed");
      setFilesByField(prev => ({
        ...prev,
        [fieldName]: prev[fieldName].map((f, i) => i === index ? { ...f, uploading: false, file: null, filename: "", s3Url: "" } : f)
      }));
    }
  };

  const removeFileRow = (fieldName, index) => {
    setFilesByField(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((_, i) => i !== index)
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

            <div className="mt-6 p-6 bg-gray-50 rounded-xl border">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="text-lg font-bold text-blue-700 flex items-center gap-2"><Upload className="w-6 h-6" /> Supporting Documents</h4>
                            {isEditMode && filesByField[field.name]?.length > 1 && (
                              <button onClick={() => setMergeModal({ isOpen: true, fieldName: field.name })} className="px-5 py-2.5 bg-[#2163c1] text-white font-medium rounded-lg hover:bg-[#1d57a8] transition flex items-center gap-2">
                                <FileText className="w-5 h-5" /> Merge PDFs
                              </button>
                            )}
                          </div>
            
                          {isEditMode ? (
                            <DragDropContext onDragEnd={result => {
                              if (!result.destination) return;
                              const items = Array.from(filesByField[field.name] || []);
                              const [moved] = items.splice(result.source.index, 1);
                              items.splice(result.destination.index, 0, moved);
                              setFilesByField(prev => ({ ...prev, [field.name]: items }));
                            }}>
                              <Droppable droppableId={`files-${field.name}`}>
                                {(provided) => (
                                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                                    {(filesByField[field.name] || []).map((file, index) => {
                                      if (!file.id) file.id = `file-${Date.now()}-${field.name}-${index}-${Math.random().toString(36).substr(2, 9)}`;
                                      return (
                                        <Draggable key={file.id} draggableId={file.id.toString()} index={index}>
                                          {(provided, snapshot) => (
                                            <div ref={provided.innerRef} {...provided.draggableProps} className={`flex items-center gap-3 p-4 bg-white rounded-lg border transition-all ${snapshot.isDragging ? "border-indigo-500 shadow-lg" : "border-gray-300"}`}>
                                              <div {...provided.dragHandleProps} className="cursor-grab"><GripVertical className="w-5 h-5 text-gray-400" /></div>
                                              <input type="text" value={file.description || ""} onChange={e => updateFileDescription(field.name, index, e.target.value)} placeholder="Description" className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                              <div className="w-64">
                                                {file.uploading ? (
                                                  <span className="text-gray-500 italic">Uploading...</span>
                                                ) : file.filename ? (
                                                  <button onClick={() => setPreviewModal({ isOpen: true, file })} className="text-blue-600 font-medium hover:underline flex items-center gap-2">
                                                    <CheckCircle className="w-4 h-4" /> {file.filename}
                                                  </button>
                                                ) : (
                                                  <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={e => handleFileChange(field.name, index, e.target.files?.[0])} className="block w-full text-sm border-0 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:bg-[#2163c1] file:text-white" />
                                                )}
                                              </div>
                                              <div className="flex gap-2">
                                                <button onClick={() => addFileRow(field.name)} className="text-green-600 hover:bg-green-50 p-2 rounded transition" title="Add another document"><Plus className="w-5 h-5" /></button>
                                                <button
  onClick={() => removeFileRow(field.name, index)}
  disabled={ (filesByField[field.name] || []).length === 1}
  className={`p-2 rounded transition
    ${ (filesByField[field.name] || []).length === 1
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
                                <div key={file.id || `view-file-${field.name}-${index}`} className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-300">
                                  <div className="flex-1">
                                    <span className="text-gray-700 font-medium">{file.description || `Document ${index + 1}`}</span>
                                  </div>
                                  <div className="w-64">
                                    {file.filename && (file.s3Url || file.url) ? (
                                      <button onClick={() => setPreviewModal({ isOpen: true, file })} className="text-blue-600 font-medium hover:underline flex items-center gap-2">
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
          // Add merged document to the field's file list
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

export default GenericCriteriaForm4_3;
