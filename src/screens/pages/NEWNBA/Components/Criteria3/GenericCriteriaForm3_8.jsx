// src/screens/pages/NEWNBA/Components/Criteria3/GenericCriteriaForm3_8.jsx

import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Editor } from "react-editor";
import Modal from "react-modal";
import MergePdfModal from "../MergePdfModal";
import { toast } from "react-toastify";
import {
  FileText,
  Save,
  X,
  Trash2,
  Edit,
  Upload,
  Plus,
  GripVertical,
  CheckCircle,
} from "lucide-react";
import { AttainmentConfigService } from "../../../OBE/Services/attainment-config.service";
import { collegeService } from "../../../Academics/Services/college.service";
import { AcademicService } from "../../../Academics/Services/Academic.service";
import { nbaDashboardService } from "../../Services/NBA-dashboard.service";

// ──────────────────────────────────────────────────────────────
// Component to display attainment tables (read-only visualization)
// ──────────────────────────────────────────────────────────────
const Criterion3_8Content = ({ programId, isEditable, onFormChange }) => {
  const [programs, setPrograms] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [attainmentData, setAttainmentData] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(programId || "");
  const [selectedYear, setSelectedYear] = useState("");

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const data = await collegeService.getAllprogram();
        setPrograms(data || []);
      } catch (err) {
        console.error("Failed to fetch programs:", err);
      }
    };

    const fetchAcademicYears = async () => {
      try {
        const response = await AcademicService.getAcademic();
        setAcademicYears(response || []);
      } catch (err) {
        console.error("Failed to fetch academic years:", err);
      }
    };

    fetchPrograms();
    fetchAcademicYears();
  }, []);

  useEffect(() => {
    if (programId) {
      setSelectedProgram(programId);
    }
  }, [programId]);

  useEffect(() => {
    const fetchAttainmentData = async () => {
      if (selectedProgram && selectedYear) {
        try {
          const response = await AttainmentConfigService.getOverallAttainment(
            selectedProgram,
            selectedYear
          );
          setAttainmentData(response || null);
          if (onFormChange) {
            onFormChange({
              selectedProgram,
              selectedYear,
              attainmentData: response,
            });
          }
        } catch (err) {
          console.error("Failed to fetch attainment data:", err);
          setAttainmentData(null);
        }
      } else {
        setAttainmentData(null);
      }
    };

    fetchAttainmentData();
  }, [selectedProgram, selectedYear, onFormChange]);

  return (
    <div className="space-y-8">
      {/* Selection Controls */}
      {!programId ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Program
            </label>
            <select
              value={selectedProgram}
              onChange={(e) => {
                setSelectedProgram(e.target.value);
                setSelectedYear("");
              }}
              // disabled={!isEditable}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Program</option>
              {programs.map((p) => (
                <option key={p.program_id} value={p.program_id}>
                  {p.program_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Academic Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              // disabled={!isEditable || !selectedProgram}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Academic Year</option>
              {academicYears.map((ay) => (
                <option key={ay.id} value={ay.id}>
                  {ay.year}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : (
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Academic Year
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            disabled={!isEditable}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Academic Year</option>
            {academicYears.map((ay) => (
              <option key={ay.id} value={ay.id}>
                {ay.year}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Attainment Tables */}
      {attainmentData ? (
        <div className="space-y-12">
          {/* Direct Attainment */}
          <div>
            <h4 className="text-xl font-semibold text-blue-700 mb-4">
              Direct Attainment
            </h4>
            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-blue-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-medium">PO/PSO</th>
                    {Object.keys(attainmentData.direct_attainments).map((key) => (
                      <th key={key} className="px-6 py-4 text-center font-medium">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      Attainment Value
                    </td>
                    {Object.values(attainmentData.direct_attainments).map((val, i) => (
                      <td key={i} className="px-6 py-4 text-center text-gray-700">
                        {val.toFixed(2)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Indirect Attainment */}
          <div>
            <h4 className="text-xl font-semibold text-green-700 mb-4">
              Indirect Attainment
            </h4>
            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-green-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-medium">PO/PSO</th>
                    {Object.keys(attainmentData.indirect_attainments).map((key) => (
                      <th key={key} className="px-6 py-4 text-center font-medium">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      Attainment Value
                    </td>
                    {Object.values(attainmentData.indirect_attainments).map((val, i) => (
                      <td key={i} className="px-6 py-4 text-center text-gray-700">
                        {val.toFixed(2)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Overall Attainment */}
          <div>
            <h4 className="text-xl font-semibold text-purple-700 mb-4">
              Overall Attainment
            </h4>
            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-purple-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-medium">PO/PSO</th>
                    {Object.keys(attainmentData.overall_attainments).map((key) => (
                      <th key={key} className="px-6 py-4 text-center font-medium">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      Attainment Value
                    </td>
                    {Object.values(attainmentData.overall_attainments).map((val, i) => (
                      <td key={i} className="px-6 py-4 text-center text-gray-700">
                        {val.toFixed(2)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : selectedProgram && selectedYear ? (
        <div className="text-center py-12 text-gray-500 italic bg-gray-50 rounded-xl border border-dashed">
          No attainment data available for the selected program and academic year.
        </div>
      ) : programId ? (
        <div className="text-center py-12 text-gray-500 italic bg-gray-50 rounded-xl border border-dashed">
          Please select academic year to view attainment data.
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500 italic bg-gray-50 rounded-xl border border-dashed">
          Please select program and academic year to view attainment data.
        </div>
      )}
    </div>
  );
};

const GenericCriteriaForm3_8 = ({
  cycle_sub_category_id,
  programId,
  title = "3.8. Attainment of Program Outcomes and Program Specific Outcomes",
  marks = 25,
  isEditable = true,
  onSave,
  onDelete,
  saving = false,
  hasData = false,
  initialData = null,
}) => {
  const [isEditMode, setIsEditMode] = useState(isEditable && !hasData);
  const [formValues, setFormValues] = useState(
    initialData?.content || { "3.8.1": "" }
  );
  const [filesByField, setFilesByField] = useState(
    initialData?.filesByField || {
      "3.8": [
        {
          id: `file-3.8-${Date.now()}`,
          description: "",
          file: null,
          filename: "",
          s3Url: "",
          uploading: false,
        },
      ],
    }
  );

  const [previewModal, setPreviewModal] = useState({ isOpen: false, file: null });
  const [mergeModal, setMergeModal] = useState({ isOpen: false, fieldName: null });

  // Sync with initial data
  useEffect(() => {
    if (initialData?.content) {
      setFormValues(initialData.content);
    }
    if (initialData?.filesByField) {
      setFilesByField(initialData.filesByField);
    }
  }, [initialData]);

  const addFileRow = (fieldName) => {
    setFilesByField((prev) => ({
      ...prev,
      [fieldName]: [
        ...(prev[fieldName] || []),
        {
          id: `file-${Date.now()}-${fieldName}-${Math.random()
            .toString(36)
            .substr(2, 9)}`,
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
      [fieldName]: prev[fieldName].map((f, i) =>
        i === index ? { ...f, description: value } : f
      ),
    }));
  };

  const handleFileChange = async (fieldName, index, newFile) => {
    if (!newFile || !(newFile instanceof File)) {
      toast.error("Invalid file selected");
      return;
    }

    const currentRow = filesByField[fieldName]?.[index] || {};

    setFilesByField((prev) => ({
      ...prev,
      [fieldName]: prev[fieldName]?.map((f, i) =>
        i === index ? { ...f, file: newFile, filename: newFile.name, uploading: true } : f
      ) || [],
    }));

    try {
      const formData = new FormData();
      formData.append("file", newFile);
      if (currentRow.description?.trim()) {
        formData.append("description", currentRow.description.trim());
      }

      const resData = await nbaDashboardService.uploadFile(formData);
      const s3Url = resData?.url || resData || "";

      setFilesByField((prev) => ({
        ...prev,
        [fieldName]: prev[fieldName]?.map((f, i) =>
          i === index ? { ...f, s3Url, filename: newFile.name, uploading: false } : f
        ) || [],
      }));

      toast.success("File uploaded successfully!");
    } catch (err) {
      toast.error("File upload failed");
      setFilesByField((prev) => ({
        ...prev,
        [fieldName]: prev[fieldName]?.map((f, i) =>
          i === index ? { ...f, uploading: false, file: null, filename: "" } : f
        ) || [],
      }));
    }
  };

  const removeFileRow = (fieldName, index) => {
    setFilesByField((prev) => ({
      ...prev,
      [fieldName]: prev[fieldName]?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleSave = () => {
    if (onSave) {
      onSave({
        content: formValues,
        filesByField,
      });
    }
    setIsEditMode(false);
    toast.success("Section saved successfully");
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-[#2163c5] text-white p-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold flex items-center gap-4">
            <FileText className="w-10 h-10" />
            {title}
            <span className="text-xl font-medium text-indigo-200">
              ({marks} Marks)
            </span>
          </h2>

          {isEditable && (
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`p-4 rounded-xl transition-all shadow-lg flex items-center justify-center ${
                isEditMode
                  ? "bg-white hover:bg-gray-200 text-[#2163c5]"
                  : "bg-white hover:bg-gray-100 text-[#2163c5]"
              }`}
              title={isEditMode ? "Cancel Edit" : "Edit Section"}
            >
              {isEditMode ? <X className="w-7 h-7" /> : <Edit className="w-7 h-7" />}
            </button>
          )}
        </div>
      </div>

      <div className="p-8 space-y-12">
        {/* 3.8.1 - Rich Text Description */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-blue-700">
            3.8.1 Describe the assessment tools and processes used to gather the data upon which the evaluation of each of the PO is based indicating the frequency with which these processes are carried out. Describe the assessment processes that demonstrate the degree to which the Program Outcomes are attained and document the attainment levels.
          </h3>

          <div className="border-2 border-gray-300 rounded-lg bg-white overflow-hidden">
            <Editor
              value={formValues["3.8.1"] || ""}
              onChange={(val) =>
                setFormValues((prev) => ({ ...prev, "3.8.1": val }))
              }
              disabled={!isEditMode}
              style={{ minHeight: 360, padding: 20, fontSize: 16 }}
              placeholder="Describe the assessment tools, processes, frequency, attainment evaluation methods..."
            />
          </div>
        </div>

        {/* Attainment Visualization Section */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-blue-700">
            Attainment of Program Outcomes & Program Specific Outcomes
          </h3>

          <Criterion3_8Content
            programId={programId}
            isEditable={false}
            // onFormChange={(data) => setFormValues(prev => ({ ...prev, ...data }))}
          />
        </div>

        {/* Supporting Documents Section */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-blue-700">Supporting Documents</h3>

          <div className="mt-6 p-6 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-lg font-bold text-blue-700 flex items-center gap-2">
                <Upload className="w-6 h-6" /> Supporting Documents
              </h4>

              {isEditMode && (filesByField["3.8"]?.length || 0) > 1 && (
                <button
                  onClick={() => setMergeModal({ isOpen: true, fieldName: "3.8" })}
                  className="px-5 py-2.5 bg-[#2163c5] text-white font-medium rounded-lg hover:bg-[#1d57a8] transition flex items-center gap-2 shadow-sm"
                >
                  <FileText className="w-5 h-5" /> Merge PDFs
                </button>
              )}
            </div>

            {isEditMode ? (
              <DragDropContext
                onDragEnd={(result) => {
                  if (!result.destination) return;
                  const items = Array.from(filesByField["3.8"] || []);
                  const [moved] = items.splice(result.source.index, 1);
                  items.splice(result.destination.index, 0, moved);
                  setFilesByField((prev) => ({ ...prev, "3.8": items }));
                }}
              >
                <Droppable droppableId="files-3.8">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-4"
                    >
                      {(filesByField["3.8"] || []).map((file, index) => {
                        const isOnlyOne = (filesByField["3.8"]?.length || 0) <= 1;

                        return (
                          <Draggable
                            key={file.id}
                            draggableId={file.id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 bg-white rounded-xl border transition-all ${
                                  snapshot.isDragging
                                    ? "border-blue-500 shadow-xl"
                                    : "border-gray-300 hover:border-blue-300"
                                }`}
                              >
                                <div
                                  {...provided.dragHandleProps}
                                  className="cursor-grab self-center sm:self-start mt-1 sm:mt-0"
                                >
                                  <GripVertical className="w-6 h-6 text-gray-400" />
                                </div>

                                <input
                                  type="text"
                                  value={file.description || ""}
                                  onChange={(e) =>
                                    updateFileDescription("3.8", index, e.target.value)
                                  }
                                  placeholder="Document description (optional)"
                                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />

                                <div className="w-full sm:w-72 space-y-3">
                                  {file.filename && !file.uploading && (
                                    <button
                                      onClick={() =>
                                        setPreviewModal({ isOpen: true, file })
                                      }
                                      className="w-full text-left text-blue-600 hover:underline flex items-center gap-2 py-1 truncate"
                                    >
                                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                      <span className="truncate font-medium">
                                        {file.filename}
                                      </span>
                                    </button>
                                  )}

                                  {file.uploading && (
                                    <div className="text-sm text-gray-500 italic flex items-center gap-2 py-1">
                                      <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                                      Uploading...
                                    </div>
                                  )}

                                  <input
                                    type="file"
                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                    onChange={(e) => {
                                      const newFile = e.target.files?.[0];
                                      if (newFile)
                                        handleFileChange("3.8", index, newFile);
                                    }}
                                    className="block w-full text-sm text-gray-700 file:mr-4 file:py-2.5 file:px-5 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#2163c5] file:text-white file:hover:bg-[#1d57a8] cursor-pointer"
                                    disabled={file.uploading}
                                  />
                                </div>

                                <div className="flex gap-2 self-start sm:self-center">
                                  <button
                                    onClick={() => addFileRow("3.8")}
                                    className="text-green-600 hover:bg-green-50 p-2 rounded-full transition"
                                    title="Add another document"
                                  >
                                    <Plus className="w-5 h-5" />
                                  </button>

                                  <button
                                    onClick={
                                      isOnlyOne ? undefined : () => removeFileRow("3.8", index)
                                    }
                                    disabled={isOnlyOne}
                                    className={`p-2 rounded-full transition ${
                                      isOnlyOne
                                        ? "text-gray-300 cursor-not-allowed"
                                        : "text-red-600 hover:bg-red-50"
                                    }`}
                                    title={
                                      isOnlyOne
                                        ? "At least one document required"
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
              <div className="space-y-4">
                {(filesByField["3.8"] || []).map((file, idx) => (
                  <div
                    key={file.id}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5 bg-white rounded-xl border border-gray-200"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">
                        {file.description || `Supporting Document ${idx + 1}`}
                      </p>
                    </div>
                    <div>
                      {file.filename && (file.s3Url || file.url) ? (
                        <button
                          onClick={() => setPreviewModal({ isOpen: true, file })}
                          className="text-blue-600 hover:underline flex items-center gap-2 font-medium"
                        >
                          <CheckCircle className="w-5 h-5" /> {file.filename}
                        </button>
                      ) : (
                        <span className="text-gray-400 italic">
                          No file uploaded
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {isEditMode && isEditable && (
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

            {hasData && onDelete && (
              <button
                onClick={onDelete}
                className="w-14 h-14 bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-lg transition flex items-center justify-center"
                title="Delete Section Data"
              >
                <Trash2 className="w-7 h-7" />
              </button>
            )}
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
              <h3 className="text-xl font-bold truncate max-w-[80%]">
                {previewModal.file.filename}
              </h3>
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

      {/* Merge PDFs Modal */}
      <MergePdfModal
        isOpen={mergeModal.isOpen}
        pdfFiles={filesByField[mergeModal.fieldName] || []}
        onClose={() => setMergeModal({ isOpen: false, fieldName: null })}
        onFileAdd={(mergedDocument) => {
          setFilesByField((prev) => ({
            ...prev,
            [mergeModal.fieldName]: [
              ...(prev[mergeModal.fieldName] || []),
              mergedDocument,
            ],
          }));
          setMergeModal({ isOpen: false, fieldName: null });
        }}
      />
    </div>
  );
};

export default GenericCriteriaForm3_8;