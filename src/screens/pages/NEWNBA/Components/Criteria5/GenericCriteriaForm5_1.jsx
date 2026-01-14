import React, { useState, useEffect, useCallback } from "react";
import { Editor } from "react-editor";
import Modal from "react-modal";
import MergePdfModal from "../MergePdfModal";
import { toast } from "react-toastify";
import { nbaDashboardService } from "../../Services/NBA-dashboard.service";
import {
  Trash2, Plus, FileText, Save, CheckCircle,
  Upload, X, Edit, Calculator, Users, Hash
} from "lucide-react";

Modal.setAppElement("#root");

// Student-Faculty Ratio Table as per image - FIXED VERSION
const SFRTable = ({ data, onChange, disabled }) => {
  const [rows, setRows] = useState(() => {
    if (data && data.length > 0) {
      return data;
    }
    return [
      { 
        id: "u1_1", 
        category: "u1.1", 
        label: "No. of Students in UG 1st Year = u1", 
        type: "ug",
        cay: "", caym1: "", caym2: "" 
      },
      { 
        id: "u1_2", 
        category: "u1.2", 
        label: "No. of Students in UG 2nd Year = u2", 
        type: "ug",
        cay: "", caym1: "", caym2: "" 
      },
      { 
        id: "u1_3", 
        category: "u1.3", 
        label: "No. of Students in UG 3rd Year = u3", 
        type: "ug",
        cay: "", caym1: "", caym2: "" 
      },
      { 
        id: "u1_4", 
        category: "u1.4", 
        label: "No. of Students in UG 4th Year = u4", 
        type: "ug",
        cay: "", caym1: "", caym2: "" 
      },
      { 
        id: "u1_5", 
        category: "u1.5", 
        label: "No. of Students in UG 5th Year = u5", 
        type: "ug",
        cay: "", caym1: "", caym2: "" 
      },
      { 
        id: "ug1_total", 
        category: "UG1", 
        label: "UG1 = u1.1+u1.2+u1.3+u1.4+u1.5", 
        type: "total",
        isCalculated: true,
        cay: "0", caym1: "0", caym2: "0" 
      },
      { 
        id: "pg_programs", 
        category: "p1.1", 
        label: "No. of PG Programs in the Department", 
        type: "pg",
        cay: "", caym1: "", caym2: "" 
      },
      { 
        id: "total_students", 
        category: "S", 
        label: "S = Number of Students in Department", 
        type: "total",
        isCalculated: true,
        cay: "0", caym1: "0", caym2: "0" 
      },
      { 
        id: "faculty_count", 
        category: "F", 
        label: "F = Total Faculty Members", 
        type: "faculty",
        cay: "", caym1: "", caym2: "" 
      },
      { 
        id: "sfr", 
        category: "SFR", 
        label: "Student Faculty Ratio (SFR) = S/F", 
        type: "sfr",
        isCalculated: true,
        cay: "0.00", caym1: "0.00", caym2: "0.00" 
      },
      { 
        id: "average_sfr", 
        category: "Average SFR", 
        label: "Average SFR (3 years)", 
        type: "average",
        isCalculated: true,
        cay: "0.00", caym1: "0.00", caym2: "0.00" 
      },
    ];
  });

  // 🔥 FIX: Update rows when data prop changes
  useEffect(() => {
    if (data && data.length > 0) {
      setRows(data);
    }
  }, [data]);

  // 🔥 FIX: Use useCallback for calculation functions
  const calculateUGTotal = useCallback(() => {
    const ugRows = rows.filter(r => r.type === "ug");
    const totals = { cay: 0, caym1: 0, caym2: 0 };
    
    ugRows.forEach(row => {
      totals.cay += parseInt(row.cay) || 0;
      totals.caym1 += parseInt(row.caym1) || 0;
      totals.caym2 += parseInt(row.caym2) || 0;
    });
    
    return totals;
  }, [rows]);

  // 🔥 FIX: Recalculate function that runs after state update
  const recalculateAll = useCallback((updatedRows) => {
    const rowsCopy = [...updatedRows];
    
    // Calculate UG Total
    const ugRows = rowsCopy.filter(r => r.type === "ug");
    const ugTotal = { cay: 0, caym1: 0, caym2: 0 };
    ugRows.forEach(row => {
      ugTotal.cay += parseInt(row.cay) || 0;
      ugTotal.caym1 += parseInt(row.caym1) || 0;
      ugTotal.caym2 += parseInt(row.caym2) || 0;
    });
    
    // Update UG Total row
    const ugTotalRow = rowsCopy.find(r => r.category === "UG1");
    if (ugTotalRow) {
      ugTotalRow.cay = ugTotal.cay.toString();
      ugTotalRow.caym1 = ugTotal.caym1.toString();
      ugTotalRow.caym2 = ugTotal.caym2.toString();
    }
    
    // Total Students (S) = UG Total
    const totalStudentsRow = rowsCopy.find(r => r.category === "S");
    if (totalStudentsRow) {
      totalStudentsRow.cay = ugTotal.cay.toString();
      totalStudentsRow.caym1 = ugTotal.caym1.toString();
      totalStudentsRow.caym2 = ugTotal.caym2.toString();
    }
    
    // Get Faculty Count
    const facultyRow = rowsCopy.find(r => r.category === "F");
    const facultyCount = {
      cay: parseInt(facultyRow?.cay) || 0,
      caym1: parseInt(facultyRow?.caym1) || 0,
      caym2: parseInt(facultyRow?.caym2) || 0
    };
    
    // Calculate SFR
    const sfrRow = rowsCopy.find(r => r.category === "SFR");
    if (sfrRow && facultyRow) {
      const calculateRatio = (students, faculty) => {
        if (!faculty || faculty === 0) return "0.00";
        return (students / faculty).toFixed(2);
      };
      
      sfrRow.cay = calculateRatio(ugTotal.cay, facultyCount.cay);
      sfrRow.caym1 = calculateRatio(ugTotal.caym1, facultyCount.caym1);
      sfrRow.caym2 = calculateRatio(ugTotal.caym2, facultyCount.caym2);
    }
    
    // Calculate Average SFR
    const sfrValues = {
      cay: parseFloat(sfrRow?.cay) || 0,
      caym1: parseFloat(sfrRow?.caym1) || 0,
      caym2: parseFloat(sfrRow?.caym2) || 0
    };
    
    const averageSFR = ((sfrValues.cay + sfrValues.caym1 + sfrValues.caym2) / 3).toFixed(2);
    
    // Add/Update Average SFR row
    let averageRow = rowsCopy.find(r => r.category === "Average SFR");
    if (!averageRow) {
      averageRow = {
        id: "average_sfr",
        category: "Average SFR",
        label: "Average SFR (3 years)",
        type: "average",
        isCalculated: true,
        cay: averageSFR,
        caym1: averageSFR,
        caym2: averageSFR
      };
      rowsCopy.push(averageRow);
    } else {
      averageRow.cay = averageSFR;
      averageRow.caym1 = averageSFR;
      averageRow.caym2 = averageSFR;
    }
    
    return rowsCopy;
  }, []);

  // 🔥 FIX: Handle change properly without causing re-render issues
  const handleChange = useCallback((id, field, value) => {
    setRows(prevRows => {
      // First, update the specific cell
      const updatedRows = prevRows.map(row => {
        if (row.id === id) {
          return { ...row, [field]: value };
        }
        return row;
      });
      
      // Then recalculate all calculated values
      const recalculatedRows = recalculateAll(updatedRows);
      
      // Notify parent component
      setTimeout(() => {
        onChange(recalculatedRows);
      }, 0);
      
      return recalculatedRows;
    });
  }, [onChange, recalculateAll]);

  const getRowStyle = (row) => {
    if (row.type === "total") {
      return "bg-blue-50 font-bold";
    }
    if (row.type === "faculty") {
      return "bg-green-50";
    }
    if (row.type === "sfr") {
      return "bg-yellow-50 font-bold";
    }
    if (row.type === "average") {
      return "bg-purple-50 font-bold text-purple-700";
    }
    return "bg-white";
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Calculator className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-bold text-blue-800">Student-Faculty Ratio Calculation</h4>
            <p className="text-sm text-gray-600 mt-1">
              <strong>S = Number of Students in Department</strong> (UG1 + PG1 + PG2...)<br />
              <strong>F = Total Number of regular faculty members</strong> (including contractual faculty)<br />
              <strong>SFR = S/F</strong>
            </p>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-lg">
        <table className="w-full bg-white">
          <thead>
            <tr className="bg-[#2163c1] text-white">
              <th className="p-4 text-left font-semibold w-48">Academic Performance</th>
              <th className="p-4 text-center font-semibold">CAY</th>
              <th className="p-4 text-center font-semibold">CAYm1</th>
              <th className="p-4 text-center font-semibold">CAYm2</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className={`border-b ${getRowStyle(row)}`}>
                <td className="p-4 font-medium text-gray-800">
                  {row.label}
                  {row.isCalculated && (
                    <span className="ml-2 text-xs text-gray-500">(Calculated)</span>
                  )}
                </td>
                
                {row.type === "average" ? (
                  // Average row shows same value in all columns
                  <td colSpan="3" className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-700">
                      {row.cay || "0.00"}:1
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Average Student-Faculty Ratio
                    </div>
                  </td>
                ) : row.isCalculated ? (
                  // Calculated rows (read-only)
                  <>
                    <td className="p-4 text-center">
                      <div className={`px-3 py-2 rounded-lg font-bold ${
                        row.type === "sfr" ? "text-blue-700 bg-blue-100" : ""
                      }`}>
                        {row.cay || "0"}
                        {row.type === "sfr" && ":1"}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className={`px-3 py-2 rounded-lg font-bold ${
                        row.type === "sfr" ? "text-blue-700 bg-blue-100" : ""
                      }`}>
                        {row.caym1 || "0"}
                        {row.type === "sfr" && ":1"}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className={`px-3 py-2 rounded-lg font-bold ${
                        row.type === "sfr" ? "text-blue-700 bg-blue-100" : ""
                      }`}>
                        {row.caym2 || "0"}
                        {row.type === "sfr" && ":1"}
                      </div>
                    </td>
                  </>
                ) : (
                  // Editable rows
                  <>
                    <td className="p-4">
                      <input
                        type="number"
                        min="0"
                        value={row.cay || ""}
                        onChange={(e) => handleChange(row.id, 'cay', e.target.value)}
                        disabled={disabled}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0"
                      />
                    </td>
                    <td className="p-4">
                      <input
                        type="number"
                        min="0"
                        value={row.caym1 || ""}
                        onChange={(e) => handleChange(row.id, 'caym1', e.target.value)}
                        disabled={disabled}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0"
                      />
                    </td>
                    <td className="p-4">
                      <input
                        type="number"
                        min="0"
                        value={row.caym2 || ""}
                        onChange={(e) => handleChange(row.id, 'caym2', e.target.value)}
                        disabled={disabled}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0"
                      />
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-start gap-2">
          <div className="text-amber-600 font-bold mt-0.5">📝 Notes:</div>
          <div className="text-sm text-amber-800 space-y-2">
            <p><strong>All faculty whether regular or contractual</strong> (except part-time or hourly based), will be considered.</p>
            <p><strong>Contractual faculty</strong> who have taught for 2 consecutive semesters with or without break between the 2 semesters in corresponding academic year on full-time basis shall be considered.</p>
            <p><strong>Requirements for contractual faculty:</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Shall have the CoA prescribed qualifications and experience</li>
              <li>Shall be appointed on full-time basis and worked for consecutive two semesters</li>
              <li>Should have gone through an appropriate process of selection</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component - FIXED
const GenericCriteriaForm5_1 = ({
  title = "NBA Section",
  marks = 20,
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
  const safeTableData = initialData?.tableData || {};
  
  const [filesByField, setFilesByField] = useState(() => {
    if (initialData?.filesByField) {
      return initialData.filesByField;
    }

    const init = {};
    fields.forEach((field) => {
      init[field.name] = [];
    });
    return init;
  });

  const [formValues, setFormValues] = useState(safeContent);
  const [tableData, setTableData] = useState(safeTableData);
  const [previewModal, setPreviewModal] = useState({ isOpen: false, file: null });
  const [mergeModal, setMergeModal] = useState({ isOpen: false, fieldName: null });

  // 🔥 FIX: Update state when initialData changes
  useEffect(() => {
    if (initialData?.content) {
      setFormValues(initialData.content);
    }
    if (initialData?.tableData) {
      setTableData(initialData.tableData);
    }
    if (initialData?.filesByField) {
      setFilesByField(initialData.filesByField);
    }
  }, [initialData]);

  const handleTableChange = (tableKey, newData) => {
    setTableData(prev => ({ ...prev, [tableKey]: newData }));
  };

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
      const s3Url = typeof resData === 'string' ? resData : (resData || resData || "");

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
    setFilesByField((prev) => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((_, i) => i !== index),
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
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{title}</h2>
              <div className="flex items-center gap-2 mt-2">
                <div className="px-3 py-1 bg-white/20 rounded-full text-sm">
                  {marks} Marks
                </div>
                <div className="text-sm opacity-90">Criterion 5.1 - Department Level Calculation</div>
              </div>
            </div>
          </div>
          {!isCompleted && (
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`p-3 rounded-xl transition-all shadow-lg flex items-center justify-center ${
                isEditMode ? "bg-red-500 hover:bg-red-600 text-white" : "bg-white hover:bg-gray-100 text-blue-700"
              }`}
              title={isEditMode ? "Cancel Editing" : "Edit Section"}
            >
              {isEditMode ? <X className="w-5 h-5" /> : <Edit className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      <div className="p-8 space-y-12">
        {fields.map((field) => (
          <div key={field.name} className="space-y-6">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-3">
                <Calculator className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-bold text-gray-800">{field.label}</h3>
              </div>
              {field.marks && (
                <div className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                  {field.marks} Marks
                </div>
              )}
            </div>

            {field.hasTable ? (
              <SFRTable
                data={tableData[field.tableKey] || []}
                onChange={(newData) => handleTableChange(field.tableKey, newData)}
                disabled={!isEditMode}
              />
            ) : (
              <div className="border-2 border-gray-300 rounded-b-lg bg-white">
                <Editor
                  value={formValues[field.name] || ""}
                  onChange={(val) => setFormValues(prev => ({ ...prev, [field.name]: val }))}
                  disabled={!isEditMode || isCompleted}
                  style={{ minHeight: 240, padding: 16, fontSize: 16 }}
                  className="focus:outline-none"
                />
              </div>
            )}

            {/* Supporting Documents Section */}
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

                <div className="space-y-4">
                  {/* Always show the first file upload row */}
                  <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-300">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Document description"
                        value={(filesByField[field.name]?.[0]?.description) || ""}
                        onChange={(e) => {
                          if (!filesByField[field.name]?.[0]) {
                            addFileRow(field.name);
                          }
                          updateFileDescription(field.name, 0, e.target.value);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="w-64">
                      {filesByField[field.name]?.[0]?.uploading ? (
                        <div className="flex items-center gap-2 text-gray-500">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                          <span>Uploading...</span>
                        </div>
                      ) : filesByField[field.name]?.[0]?.filename ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <button
                            onClick={() => setPreviewModal({ isOpen: true, file: filesByField[field.name][0] })}
                            className="text-blue-600 font-medium hover:underline truncate max-w-48"
                            title={filesByField[field.name][0].filename}
                          >
                            {filesByField[field.name][0].filename}
                          </button>
                        </div>
                      ) : (
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            if (!filesByField[field.name]?.[0]) {
                              addFileRow(field.name);
                            }
                            handleFileChange(field.name, 0, e.target.files?.[0]);
                          }}
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
                      {filesByField[field.name]?.[0] && (
                        <button
                          onClick={() => removeFileRow(field.name, 0)}
                          className="text-red-500 hover:bg-red-50 p-2 rounded transition"
                          title="Remove document"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Show additional document rows if any */}
                  {(filesByField[field.name] || []).slice(1).map((file, index) => {
                    const actualIndex = index + 1;
                    return (
                      <div key={file.id || `file-${actualIndex}`} className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-300">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={file.description || ""}
                            onChange={(e) => updateFileDescription(field.name, actualIndex, e.target.value)}
                            placeholder="Document description"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div className="w-64">
                          {file.uploading ? (
                            <div className="flex items-center gap-2 text-gray-500">
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                              <span>Uploading...</span>
                            </div>
                          ) : file.filename ? (
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <button
                                onClick={() => setPreviewModal({ isOpen: true, file })}
                                className="text-blue-600 font-medium hover:underline truncate max-w-48"
                                title={file.filename}
                              >
                                {file.filename}
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <input
                                type="file"
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                onChange={(e) => handleFileChange(field.name, actualIndex, e.target.files?.[0])}
                                className="block w-full text-sm border-0 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:bg-[#2163c1] file:text-white"
                              />
                            </div>
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
                            onClick={() => removeFileRow(field.name, actualIndex)}
                            className="text-red-500 hover:bg-red-50 p-2 rounded transition"
                            title="Remove document"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}

        {isEditMode && !isCompleted && (
          <div className="text-center pt-10 flex gap-4 justify-center">
            <button
              onClick={handleSave}
              disabled={saving || !isContributorEditable}
              className={`inline-flex items-center justify-center w-12 h-12 rounded-lg transition-all ${
                saving || !isContributorEditable
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl"
              }`}
              title={saving ? "Saving..." : !isContributorEditable ? "Not allowed to save" : "Save"}
            >
              {saving ? (
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
              ) : (
                <Save className="w-6 h-6" />
              )}
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

export default GenericCriteriaForm5_1;