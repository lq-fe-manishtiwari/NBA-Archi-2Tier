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

  // Columns
  ["lyg", "lygm1", "lygm2"].forEach(col => {
    
    // Extract numeric values from FS, X, Y, Z rows
    const FS = parseFloat(updated[0][col]) || 0;  // N = Sanctioned intake
    const X  = parseFloat(updated[1][col]) || 0;  // Students placed
    const Y  = parseFloat(updated[2][col]) || 0;  // Higher studies
    const Z  = parseFloat(updated[3][col]) || 0;  // Entrepreneurship

    // ---------------------------------------
    // 1️⃣  (X + Y + Z =) ROW → index = 4
    // ---------------------------------------
    const totalXYZ = X + Y + Z;
    updated[4][col] = totalXYZ.toString();   // show total automatically

    // ---------------------------------------
    // 2️⃣  Placement Index (P) row → index = 5
    //    (((X + Y + Z)/FS) * 100)
    // ---------------------------------------
    const P = FS > 0 ? ((totalXYZ / FS) * 100).toFixed(2) : "0.00";
    updated[5][col] = P;
  });

  // ---------------------------------------
  // 3️⃣ Average Placement Index row (index = 6)
  // ---------------------------------------
  const avg =
    ((parseFloat(updated[5].lyg) || 0) +
     (parseFloat(updated[5].lygm1) || 0) +
     (parseFloat(updated[5].lygm2) || 0)) / 3;

  updated[6].mergedAverage = avg.toFixed(2);

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
                  <Draggable
                    key={row.id}
                    draggableId={row.id.toString()}
                    index={i}
                    isDragDisabled={disabled}
                  >
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

                        {/* Item Column */}
                        <td className="p-3 font-medium text-gray-800">
                          {row.item}
                        </td>

                        {/* 🔥 SPECIAL: MERGED AVERAGE ROW (index = 6) */}
                        {i === 6 ? (
                          <td colSpan={3} className="p-5 text-center bg-indigo-50 text-indigo-700 font-bold text-lg rounded-lg">
                            {row.mergedAverage || "0.00"}
                          </td>
                        ) : (
                          // ✔ Normal 3 columns
                          columns.slice(1).map((col) => (
                            <td key={col.field} className="p-3">
                              <input
                                type="number"
                                step="1"
                                value={row[col.field] || ""}
                                onChange={(e) => handleChange(i, col.field, e.target.value)}
                                disabled={disabled}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-center"
                                placeholder="0"
                              />
                            </td>
                          ))
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
    </div>
  );
};


// Main Component
const GenericCriteriaForm4_8 = ({
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

  // Update state when initialData changes
  React.useEffect(() => {
    if (initialData?.content) {
      setFormValues(initialData.content);
    }
    if (initialData?.tableData) {
      setTableData(initialData.tableData);
    }
    if (initialData?.filesByField) {
      console.log("🔄 Updating filesByField from initialData:", initialData.filesByField);
      // Only update if current filesByField doesn't have uploaded files
      setFilesByField(prev => {
        const hasUploadedFiles = Object.values(prev).some(fieldFiles => 
          fieldFiles.some(file => file.s3Url || file.filename)
        );
        if (hasUploadedFiles) {
          console.log("Keeping existing filesByField with uploaded files");
          return prev;
        }
        return initialData.filesByField;
      });
    }
  }, [initialData]);

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
    console.log("handleFileChange() CALLED with:", { fieldName, index, newFile });

    if (!newFile || !(newFile instanceof File)) {
      console.error("❌ Invalid file passed:", newFile);
      toast.error("Invalid file");
      return;
    }

    const currentRow = filesByField[fieldName][index];
    console.log("Current row BEFORE updating:", currentRow);

    // Optimistic UI update
    setFilesByField(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].map((f, i) =>
        i === index ? { ...f, file: newFile, filename: newFile.name, uploading: true } : f
      )
    }));

    try {
      // Pure multipart/form-data
      const formData = new FormData();
      formData.append("file", newFile); // binary file content

      // Only append description if it exists
      if (currentRow.description?.trim()) {
        formData.append("description", currentRow.description.trim());
      }

      console.log("FormData entries:");
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      // Call backend using your service
      const resData = await nbaDashboardService.uploadFile(formData);

      console.log("Upload response:", resData);

      // Extract S3 URL from response - same as main GenericCriteriaForm
      const s3Url = resData || resData?.url || "";

      console.log("S3 URL extracted:", s3Url);

      // Update UI with uploaded file info
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
      console.error("❌ ERROR uploading file:", err);
      toast.error("Upload failed");

      // Revert optimistic UI update
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
    console.log("GenericCriteriaForm4_8 handleSave - filesByField:", filesByField);
    const saveData = {
      content: formValues,
      tableData,
      filesByField,
    };
    console.log("GenericCriteriaForm4_8 handleSave - complete data:", saveData);
    onSave(saveData);
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
  className={`text-red-500 p-2 rounded transition ${ (filesByField[field.name]?.length || 0) <= 1 ? 'opacity-50 cursor-not-allowed hover:bg-transparent' : 'hover:bg-red-50' }`}
  title={(filesByField[field.name]?.length || 0) <= 1 ? "Cannot delete the only document" : "Remove document"}
  disabled={(filesByField[field.name]?.length || 0) <= 1}
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

export default GenericCriteriaForm4_8;
