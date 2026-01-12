// src/screens/pages/NEWNBA/Components/Criteria3/GenericCriteriaForm3_8.jsx

import React, { useState, useEffect, useMemo } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import Modal from "react-modal";
import MergePdfModal from "../MergePdfModal";
import { FileText, Save, X, Trash2, Edit, Upload, Plus, GripVertical, CheckCircle } from "lucide-react";
import { AttainmentConfigService } from "../../../OBE/Services/attainment-config.service";
import { collegeService } from "../../../Academics/Services/college.service";
import { AcademicService } from "../../../Academics/Services/Academic.service";
import { nbaDashboardService } from "../../Services/NBA-dashboard.service";
import { toast } from "react-toastify";

// Component for the old 3.8 content
const Criterion3_8Content = ({ cycle_sub_category_id, programId, isEditable, onFormChange }) => {
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
          // Notify parent of form changes
          if (onFormChange) {
            onFormChange({ selectedProgram, selectedYear, attainmentData: response });
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
    <div className="space-y-6">
      {/* Selection */}
      {!programId ? (
        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-1">Program</label>
            <select
              value={selectedProgram}
              onChange={(e) => {
                setSelectedProgram(e.target.value);
                setSelectedYear("");
              }}
              className="border rounded px-3 py-2 w-full"
              disabled={!isEditable}
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
            <label className="block font-semibold mb-1">Academic Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="border rounded px-3 py-2 w-full"
              disabled={!isEditable}
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
        <div className="mb-4">
          <label className="block font-semibold mb-1">Academic Year</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="border rounded px-3 py-2 w-full"
            disabled={!isEditable}
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
        <div className="space-y-10">
          {/* Direct */}
          <div>
            <h4 className="text-lg font-semibold text-blue-700 mb-3">
              Direct Attainment
            </h4>
            <div className="overflow-auto">
              <table className="table-auto border-collapse border border-gray-300 w-full text-center">
                <thead className="bg-blue-500 text-white">
                  <tr>
                    <th className="border px-3 py-2">PO/PSO</th>
                    {Object.keys(attainmentData.direct_attainments).map(
                      (key) => (
                        <th key={key} className="border px-3 py-2">
                          {key}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border px-3 py-2 font-semibold">
                      Attainment Value
                    </td>
                    {Object.values(
                      attainmentData.direct_attainments
                    ).map((val, i) => (
                      <td key={i} className="border px-3 py-2">
                        {val.toFixed(2)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Indirect */}
          <div>
            <h4 className="text-lg font-semibold text-green-700 mb-3">
              Indirect Attainment
            </h4>
            <div className="overflow-auto">
              <table className="table-auto border-collapse border border-gray-300 w-full text-center">
                <thead className="bg-green-500 text-white">
                  <tr>
                    <th className="border px-3 py-2">PO/PSO</th>
                    {Object.keys(attainmentData.indirect_attainments).map(
                      (key) => (
                        <th key={key} className="border px-3 py-2">
                          {key}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border px-3 py-2 font-semibold">
                      Attainment Value
                    </td>
                    {Object.values(
                      attainmentData.indirect_attainments
                    ).map((val, i) => (
                      <td key={i} className="border px-3 py-2">
                        {val.toFixed(2)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Overall */}
          <div>
            <h4 className="text-lg font-semibold text-purple-700 mb-3">
              Overall Attainment
            </h4>
            <div className="overflow-auto">
              <table className="table-auto border-collapse border border-gray-300 w-full text-center">
                <thead className="bg-purple-500 text-white">
                  <tr>
                    <th className="border px-3 py-2">PO/PSO</th>
                    {Object.keys(attainmentData.overall_attainments).map(
                      (key) => (
                        <th key={key} className="border px-3 py-2">
                          {key}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border px-3 py-2 font-semibold">
                      Attainment Value
                    </td>
                    {Object.values(
                      attainmentData.overall_attainments
                    ).map((val, i) => (
                      <td key={i} className="border px-3 py-2">
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
        <div className="text-center py-8 text-gray-500">
          No attainment data available for the selected program and academic year.
        </div>
      ) : programId ? (
        <div className="text-center py-8 text-gray-500">
          Please select academic year to view attainment data.
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          Please select program and academic year to view attainment data.
        </div>
      )}
    </div>
  );
};

const GenericCriteriaForm3_8 = ({
  cycle_sub_category_id,
  programId,
  isEditable = true,
  onSaveSuccess,
  saving = false,
  onSave,
  onDelete,
  hasData = false,
  initialData = null,
  ...props
}) => {
  const [isEditMode, setIsEditMode] = useState(!hasData);
  const [formValues, setFormValues] = useState({});
  const [filesByField, setFilesByField] = useState(
    initialData?.filesByField || {
      "3.8": [{ id: `file-3.8-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }]
    }
  );
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

  // Update filesByField when initialData changes
  useEffect(() => {
    if (initialData?.filesByField) {
      setFilesByField(initialData.filesByField);
    }
  }, [initialData]);

  const handleSave = () => {
    if (onSave) {
      console.log("🔵 GenericCriteriaForm3_8 - formValues:", formValues);
      const formData = {
        content: {
          "3.8.1": ""
        },
        tableData: initialData?.tableData || {
          "3.8.2": [{
            po_code: "PO1",
            direct_attainment: "75",
            indirect_attainment: "80",
            overall_attainment: "77.5",
            attainment_level: "3"
          }]
        },
        filesByField,
        selectedProgram: formValues.selectedProgram,
        selectedYear: formValues.selectedYear,
        attainmentData: formValues.attainmentData
      };
      console.log("🔵 GenericCriteriaForm3_8 - sending formData:", formData);
      onSave(formData);
    }
    setIsEditMode(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
      <div className="bg-[#2163c1] text-white p-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold flex items-center gap-4">
            <FileText className="w-10 h-10" />
            3.8. Attainment of Program Outcomes and Program Specific Outcomes
            <span className="text-xl font-medium text-indigo-200">(25 Marks)</span>
          </h2>
          {isEditable && (
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
        {/* Import and render the old 3.8 content */}
        <Criterion3_8Content 
          cycle_sub_category_id={cycle_sub_category_id}
          programId={programId}
          isEditable={isEditMode}
          onFormChange={setFormValues}
        />

        {/* Supporting Documents */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-blue-700">Supporting Documents</h3>
          <div className="mt-6 p-6 bg-gray-50 rounded-xl border">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-bold text-blue-700 flex items-center gap-2">
                <Upload className="w-6 h-6" /> Supporting Documents
              </h4>
              {isEditMode && filesByField["3.8"]?.length > 1 && (
                <button
                  onClick={() => setMergeModal({ isOpen: true, fieldName: "3.8" })}
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
                  const items = Array.from(filesByField["3.8"] || []);
                  const [moved] = items.splice(result.source.index, 1);
                  items.splice(result.destination.index, 0, moved);
                  setFilesByField((prev) => ({ ...prev, "3.8": items }));
                }}
              >
                <Droppable droppableId="files-3.8">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                      {(filesByField["3.8"] || []).map((file, index) => {
                        if (!file.id) {
                          file.id = `file-${Date.now()}-3.8-${index}-${Math.random().toString(36).substr(2, 9)}`;
                        }
                        const isOnlyOneRow = (filesByField["3.8"] || []).length <= 1;
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
                                  onChange={(e) => updateFileDescription("3.8", index, e.target.value)}
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
         handleFileChange("3.8", index, newFile);
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
                                    onClick={() => addFileRow("3.8")}
                                    className="text-green-600 hover:bg-green-50 p-2 rounded transition"
                                    title="Add another document"
                                  >
                                    <Plus className="w-5 h-5" />
                                  </button>
                                 <button
                                            onClick={
                                              isOnlyOneRow
                                                ? undefined
                                                : () => removeFileRow("3.8", index)
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
                {(filesByField["3.8"] || []).map((file, index) => (
                  <div
                    key={file.id || `view-file-3.8-${index}`}
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



        {/* Action Buttons - Same style as other sections */}
        {isEditMode && isEditable && (
          <div className="text-center pt-10 flex gap-4 justify-center">
            <button
              onClick={handleSave}
              disabled={saving}
              className={`inline-flex items-center justify-center w-12 h-12 rounded-lg transition-all ${
                saving
                  ? "bg-[#2163c1] cursor-pointer opacity-60"
                  : "bg-[#2163c1] hover:bg-[#1d57a8] text-white shadow-lg hover:shadow-xl"
              }`}
              title={saving ? "Saving..." : "Save"}
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

            {hasData && onDelete && (
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

export default GenericCriteriaForm3_8;
export { Criterion3_8Content };
