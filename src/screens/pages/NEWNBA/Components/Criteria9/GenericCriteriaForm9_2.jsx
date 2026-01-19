/** @format */
import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  Trash2,
  Plus,
  Save,
  X,
  Edit,
  Upload,
  GripVertical,
  CheckCircle,
  FileText,
} from "lucide-react";
import { toast } from "react-toastify";
import Modal from "react-modal";
import MergePdfModal from "../MergePdfModal";
import { nbaDashboardService } from "../../Services/NBA-dashboard.service";

Modal.setAppElement("#root");

const BUDGET_ITEMS = [
  "Infrastructure Built-Up",
  "Library",
  "Studio equipment",
  "Studio consumables",
  "Laboratory equipment",
  "Laboratory consumables",
  "Teaching and non-teaching staff salary",
  "Maintenance and spares",
  "R&D",
  "Training and Travel",
  "Miscellaneous expenses*",
  "Others (specify)",
  "Total",
];

const emptyIncomeRow = {
  fee: "",
  govtGrant: "",
  grants: "",
  otherSources: "",
  recurring: "",
  nonRecurring: "",
  specialOther: "",
  totalStudents: "",
  expPerStudent: "",
};

const emptyBudgetRow = (item) => ({
  item,
  cfyBudget: "",
  cfyActual: "",
  cfym1Budget: "",
  cfym1Actual: "",
  cfym2Budget: "",
  cfym2Actual: "",
  cfym3Budget: "",
  cfym3Actual: "",
});

// File row template
const createEmptyFileRow = () => ({
  id: `file-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  description: "",
  filename: "",
  s3Url: "",
  uploading: false,
  file: null,
});

const GenericCriteriaForm9_2 = ({
  config,
  initialData,
  onSave,
  onDelete,
  isEditable = true,
  loading = false,
  saving = false,
}) => {
  const [editMode, setEditMode] = useState(isEditable && !initialData?.isCompleted);

  // ── Tables ─────────────────────────────────────────────
  const [incomeRows, setIncomeRows] = useState(() => {
    const rows =
      initialData?.tableData?.income_table?.length > 0
        ? initialData.tableData.income_table.map((r, i) => ({ ...r, id: r.id || `row-income-${Date.now()}-${i}` }))
        : [{ ...emptyIncomeRow, id: `row-income-${Date.now()}` }];
    return rows;
  });

  const [budgetRows, setBudgetRows] = useState(() => {
    return (
      initialData?.tableData?.budget_expenditure_table?.length > 0
        ? initialData.tableData.budget_expenditure_table
        : BUDGET_ITEMS.map((item) => emptyBudgetRow(item))
    );
  });

  // ── Files ──────────────────────────────────────────────
  const [filesA, setFilesA] = useState(() =>
    initialData?.filesByField?.table9_2_a_files?.length > 0
      ? initialData.filesByField.table9_2_a_files
      : [createEmptyFileRow()]
  );

  const [filesB, setFilesB] = useState(() =>
    initialData?.filesByField?.table9_2_b_files?.length > 0
      ? initialData.filesByField.table9_2_b_files
      : [createEmptyFileRow()]
  );

  // Modals
  const [preview, setPreview] = useState({ isOpen: false, file: null });
  const [mergeModal, setMergeModal] = useState({ isOpen: false, table: null }); // 'A' or 'B'

  // Sync with initialData changes
  useEffect(() => {
    if (initialData?.tableData?.income_table?.length) {
      setIncomeRows(initialData.tableData.income_table.map((r, i) => ({ ...r, id: r.id || `row-income-${Date.now()}-${i}` })));
    }
    if (initialData?.tableData?.budget_expenditure_table?.length) {
      setBudgetRows(initialData.tableData.budget_expenditure_table);
    }
    if (initialData?.filesByField?.table9_2_a_files?.length) {
      setFilesA(initialData.filesByField.table9_2_a_files);
    }
    if (initialData?.filesByField?.table9_2_b_files?.length) {
      setFilesB(initialData.filesByField.table9_2_b_files);
    }
  }, [initialData]);

  // ── File Upload Handlers ───────────────────────────────
  const uploadFile = async (filesSetter, files, index, newFile) => {
    if (!newFile) return;

    const current = files[index];

    // Optimistic UI
    filesSetter((prev) =>
      prev.map((f, i) =>
        i === index ? { ...f, file: newFile, filename: newFile.name, uploading: true } : f
      )
    );

    try {
      const formData = new FormData();
      formData.append("file", newFile);
      if (current.description?.trim()) {
        formData.append("description", current.description.trim());
      }

      const response = await nbaDashboardService.uploadFile(formData);
      const s3Url = response?.url || response?.downloadPath || "";

      filesSetter((prev) =>
        prev.map((f, i) =>
          i === index ? { ...f, s3Url, filename: newFile.name, uploading: false } : f
        )
      );

      toast.success("File uploaded successfully!");
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload file");
      filesSetter((prev) =>
        prev.map((f, i) =>
          i === index ? { ...f, uploading: false, file: null, filename: "" } : f
        )
      );
    }
  };

  const addFileRow = (setter) => {
    setter((prev) => [...prev, createEmptyFileRow()]);
  };

  const updateDescription = (setter, index, value) => {
    setter((prev) =>
      prev.map((f, i) => (i === index ? { ...f, description: value } : f))
    );
  };

  const removeFileRow = (setter, index) => {
    setter((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleDragEnd = (result, setter, files) => {
    if (!result.destination) return;
    const items = Array.from(files);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setter(items);
  };

  // ── Income Table Handlers ──────────────────────────────
  const onIncomeDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(incomeRows);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setIncomeRows(items);
  };

  // ── Save ───────────────────────────────────────────────
  const handleSave = () => {
    onSave({
      tableData: {
        income_table: incomeRows,
        budget_expenditure_table: budgetRows,
      },
      filesByField: {
        table9_2_a_files: filesA,
        table9_2_b_files: filesB,
      },
    });
    setEditMode(false);
  };

  // ── Render ─────────────────────────────────────────────
  return (
    <div className="bg-white border rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-blue-700 text-white p-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <FileText className="w-8 h-8" />
            {config.title || "Criteria 9.2 - Financial Resources"}
          </h2>
          <p className="text-blue-100 mt-1">({config.totalMarks || 50} Marks)</p>
        </div>

        {isEditable && (
          <button
            onClick={() => setEditMode(!editMode)}
            className="bg-white text-blue-700 p-3 rounded-xl hover:bg-gray-100 transition"
          >
            {editMode ? <X size={24} /> : <Edit size={24} />}
          </button>
        )}
      </div>

      <div className="p-6 space-y-16">
        {/* ==================== TABLE 9.2.A ==================== */}
        <div>
          <h3 className="text-xl font-bold text-blue-700 mb-4">
            Table 9.2.A : Total income at Institute level (For CFY)
          </h3>

          <DragDropContext onDragEnd={onIncomeDragEnd}>
            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-blue-700 text-white text-center">
                    <th rowSpan={2} className="border p-3 w-12"></th>
                    <th colSpan={4} className="border p-3">Total Income</th>
                    <th colSpan={3} className="border p-3">Actual Expenditure (till ...)</th>
                    <th rowSpan={2} className="border p-3">Total No. of Students</th>
                    <th rowSpan={2} className="border p-3">Expenditure per Student</th>
                    {editMode && <th rowSpan={2} className="border p-3 w-16"></th>}
                  </tr>
                  <tr className="bg-blue-600 text-white text-center">
                    <th className="border p-2">Fee</th>
                    <th className="border p-2">Govt. Grant(s)</th>
                    <th className="border p-2">Grant(s)</th>
                    <th className="border p-2">Other Sources</th>
                    <th className="border p-2">Recurring incl. Salaries</th>
                    <th className="border p-2">Non-recurring</th>
                    <th className="border p-2">Special / Any other</th>
                  </tr>
                </thead>
                <Droppable droppableId="income-rows">
                  {(provided) => (
                    <tbody {...provided.droppableProps} ref={provided.innerRef}>
                      {incomeRows.map((row, idx) => (
                        <Draggable key={row.id} draggableId={row.id} index={idx}>
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
                              {Object.keys(emptyIncomeRow).map((field) => (
                                <td key={field} className="border p-2">
                                  <input
                                    className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={row[field] || ""}
                                    disabled={!editMode}
                                    onChange={(e) => {
                                      const newRows = [...incomeRows];
                                      newRows[idx] = { ...newRows[idx], [field]: e.target.value };
                                      setIncomeRows(newRows);
                                    }}
                                  />
                                </td>
                              ))}
                              {editMode && (
                                <td className="border text-center">
                                  <button
                                    onClick={() => {
                                      if (incomeRows.length > 1) {
                                        setIncomeRows(incomeRows.filter((_, i) => i !== idx));
                                      }
                                    }}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    <Trash2 size={18} />
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
            </div>
          </DragDropContext>

          {editMode && (
            <button
              onClick={() =>
                setIncomeRows([...incomeRows, { ...emptyIncomeRow, id: `row-income-${Date.now()}` }])
              }
              className="mt-4 flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg shadow transition"
            >
              <Plus size={18} /> Add Row
            </button>
          )}
        </div>

        {/* SUPPORTING DOCUMENTS - 9.2.A */}
        <div className="border rounded-xl bg-gray-50 p-6">
          <div className="flex justify-between items-center mb-5">
            <h4 className="text-lg font-bold text-blue-700 flex items-center gap-2">
              <Upload size={22} /> Supporting Documents – Table 9.2.A
            </h4>
            {editMode && filesA.length > 1 && (
              <button
                onClick={() => setMergeModal({ isOpen: true, table: "A" })}
                className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition"
              >
                <FileText size={18} /> Merge PDFs
              </button>
            )}
          </div>

          <DragDropContext onDragEnd={(result) => handleDragEnd(result, setFilesA, filesA)}>
            <Droppable droppableId="filesTableA">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                  {filesA.map((file, index) => (
                    <Draggable key={file.id} draggableId={file.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`flex items-center gap-4 p-4 bg-white rounded-lg border transition-all ${
                            snapshot.isDragging ? "border-blue-500 shadow-lg" : "border-gray-200"
                          }`}
                        >
                          <div {...provided.dragHandleProps} className="cursor-grab">
                            <GripVertical className="text-gray-400" size={20} />
                          </div>

                          <input
                            type="text"
                            value={file.description || ""}
                            onChange={(e) =>
                              updateDescription(setFilesA, index, e.target.value)
                            }
                            placeholder="Document description..."
                            disabled={!editMode}
                            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                          />

                          <div className="min-w-[240px] space-y-2">
                            {file.filename && !file.uploading && (
                              <button
                                onClick={() => setPreview({ isOpen: true, file })}
                                className="text-blue-600 hover:underline flex items-center gap-2 text-sm font-medium truncate max-w-full"
                                title={file.filename}
                              >
                                <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                                <span className="truncate">{file.filename}</span>
                              </button>
                            )}

                            {file.uploading && (
                              <div className="text-sm text-gray-500 italic flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                                Uploading...
                              </div>
                            )}

                            {editMode && (
                              <input
                                type="file"
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                onChange={(e) => {
                                  const newFile = e.target.files?.[0];
                                  if (newFile) uploadFile(setFilesA, filesA, index, newFile);
                                }}
                                disabled={file.uploading}
                                className="block w-full text-sm text-gray-600
                                  file:mr-4 file:py-2 file:px-4
                                  file:rounded file:border-0
                                  file:text-sm file:font-medium
                                  file:bg-blue-600 file:text-white
                                  hover:file:bg-blue-700 cursor-pointer disabled:opacity-50"
                              />
                            )}
                          </div>

                          {editMode && (
                            <div className="flex gap-1">
                              <button
                                onClick={() => addFileRow(setFilesA)}
                                className="text-green-600 hover:bg-green-50 p-2 rounded"
                                title="Add new document"
                              >
                                <Plus size={20} />
                              </button>
                              <button
                                onClick={() => removeFileRow(setFilesA, index)}
                                disabled={filesA.length <= 1}
                                className={`p-2 rounded ${
                                  filesA.length <= 1
                                    ? "text-gray-300 cursor-not-allowed"
                                    : "text-red-600 hover:bg-red-50"
                                }`}
                                title={filesA.length <= 1 ? "At least one document required" : "Remove document"}
                              >
                                <Trash2 size={20} />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        {/* ==================== TABLE 9.2.B ==================== */}
        <div>
          <h3 className="text-xl font-bold text-blue-700 mb-4">
            Table 9.2.B : Total income and expenditure at Institute level (4 years)
          </h3>

          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-blue-700 text-white text-center">
                  <th rowSpan={2} className="border p-3 min-w-[260px]">Items</th>
                  <th colSpan={2} className="border p-3">CFY</th>
                  <th colSpan={2} className="border p-3">CFY-1</th>
                  <th colSpan={2} className="border p-3">CFY-2</th>
                  <th colSpan={2} className="border p-3">CFY-3</th>
                </tr>
                <tr className="bg-blue-600 text-white text-center">
                  <th className="border p-2">Budget</th>
                  <th className="border p-2">Actual</th>
                  <th className="border p-2">Budget</th>
                  <th className="border p-2">Actual</th>
                  <th className="border p-2">Budget</th>
                  <th className="border p-2">Actual</th>
                  <th className="border p-2">Budget</th>
                  <th className="border p-2">Actual</th>
                </tr>
              </thead>
              <tbody>
                {budgetRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="border p-3 font-medium">{row.item}</td>
                    {Object.keys(row)
                      .filter((k) => k !== "item")
                      .map((field) => (
                        <td key={field} className="border p-2">
                          <input
                            className="w-full px-3 py-1.5 text-right border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={row[field] || ""}
                            disabled={!editMode || row.item === "Total"}
                            onChange={(e) => {
                              const newRows = [...budgetRows];
                              newRows[idx] = { ...newRows[idx], [field]: e.target.value };
                              setBudgetRows(newRows);
                            }}
                          />
                        </td>
                      ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SUPPORTING DOCUMENTS - 9.2.B */}
        <div className="border rounded-xl bg-gray-50 p-6">
          <div className="flex justify-between items-center mb-5">
            <h4 className="text-lg font-bold text-blue-700 flex items-center gap-2">
              <Upload size={22} /> Supporting Documents – Table 9.2.B
            </h4>
            {editMode && filesB.length > 1 && (
              <button
                onClick={() => setMergeModal({ isOpen: true, table: "B" })}
                className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition"
              >
                <FileText size={18} /> Merge PDFs
              </button>
            )}
          </div>

          <DragDropContext onDragEnd={(result) => handleDragEnd(result, setFilesB, filesB)}>
            <Droppable droppableId="filesTableB">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                  {filesB.map((file, index) => (
                    <Draggable key={file.id} draggableId={file.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`flex items-center gap-4 p-4 bg-white rounded-lg border transition-all ${
                            snapshot.isDragging ? "border-blue-500 shadow-lg" : "border-gray-200"
                          }`}
                        >
                          <div {...provided.dragHandleProps} className="cursor-grab">
                            <GripVertical className="text-gray-400" size={20} />
                          </div>

                          <input
                            type="text"
                            value={file.description || ""}
                            onChange={(e) =>
                              updateDescription(setFilesB, index, e.target.value)
                            }
                            placeholder="Document description..."
                            disabled={!editMode}
                            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                          />

                          <div className="min-w-[240px] space-y-2">
                            {file.filename && !file.uploading && (
                              <button
                                onClick={() => setPreview({ isOpen: true, file })}
                                className="text-blue-600 hover:underline flex items-center gap-2 text-sm font-medium truncate max-w-full"
                                title={file.filename}
                              >
                                <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                                <span className="truncate">{file.filename}</span>
                              </button>
                            )}

                            {file.uploading && (
                              <div className="text-sm text-gray-500 italic flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                                Uploading...
                              </div>
                            )}

                            {editMode && (
                              <input
                                type="file"
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                onChange={(e) => {
                                  const newFile = e.target.files?.[0];
                                  if (newFile) uploadFile(setFilesB, filesB, index, newFile);
                                }}
                                disabled={file.uploading}
                                className="block w-full text-sm text-gray-600
                                  file:mr-4 file:py-2 file:px-4
                                  file:rounded file:border-0
                                  file:text-sm file:font-medium
                                  file:bg-blue-600 file:text-white
                                  hover:file:bg-blue-700 cursor-pointer disabled:opacity-50"
                              />
                            )}
                          </div>

                          {editMode && (
                            <div className="flex gap-1">
                              <button
                                onClick={() => addFileRow(setFilesB)}
                                className="text-green-600 hover:bg-green-50 p-2 rounded"
                                title="Add new document"
                              >
                                <Plus size={20} />
                              </button>
                              <button
                                onClick={() => removeFileRow(setFilesB, index)}
                                disabled={filesB.length <= 1}
                                className={`p-2 rounded ${
                                  filesB.length <= 1
                                    ? "text-gray-300 cursor-not-allowed"
                                    : "text-red-600 hover:bg-red-50"
                                }`}
                                title={filesB.length <= 1 ? "At least one document required" : "Remove document"}
                              >
                                <Trash2 size={20} />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        {/* Action Buttons */}
        {editMode && (
          <div className="flex justify-center gap-8 pt-12 pb-6">
            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="bg-blue-700 text-white p-5 rounded-xl hover:bg-blue-800 transition shadow-lg disabled:opacity-60"
              title="Save changes"
            >
              <Save size={28} />
            </button>

            <button
              onClick={() => setEditMode(false)}
              className="bg-gray-600 text-white p-5 rounded-xl hover:bg-gray-700 transition shadow-lg"
              title="Cancel editing"
            >
              <X size={28} />
            </button>

            {onDelete && (
              <button
                onClick={onDelete}
                className="bg-red-500 text-white p-5 rounded-xl hover:bg-red-600 transition shadow-lg"
                title="Delete Section Data"
              >
                <Trash2 size={28} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <Modal
        isOpen={preview.isOpen}
        onRequestClose={() => setPreview({ isOpen: false, file: null })}
        className="fixed inset-4 bg-white rounded-2xl shadow-2xl overflow-hidden outline-none max-w-6xl mx-auto"
        overlayClassName="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
      >
        {preview.file && (
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center p-6 bg-gradient-to-r from-blue-700 to-blue-500 text-white">
              <h3 className="text-xl font-bold truncate max-w-[80%]">
                {preview.file.filename}
              </h3>
              <button onClick={() => setPreview({ isOpen: false, file: null })}>
                <X size={28} />
              </button>
            </div>
            <iframe
              src={preview.file.s3Url}
              title={preview.file.filename}
              className="flex-1 w-full"
            />
          </div>
        )}
      </Modal>

      {/* Merge PDF Modal */}
      <MergePdfModal
        isOpen={mergeModal.isOpen}
        pdfFiles={mergeModal.table === "A" ? filesA : filesB}
        onClose={() => setMergeModal({ isOpen: false, table: null })}
        onFileAdd={(mergedDoc) => {
          const setter = mergeModal.table === "A" ? setFilesA : setFilesB;
          setter((prev) => [...prev, { ...mergedDoc, id: `merged-${Date.now()}` }]);
          setMergeModal({ isOpen: false, table: null });
        }}
      />
    </div>
  );
};

export default GenericCriteriaForm9_2;