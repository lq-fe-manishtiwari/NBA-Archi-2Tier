// GenericCriteriaForm5_2.jsx
import React, { useState, useEffect } from "react";
import { Editor } from "react-editor";
import Modal from "react-modal";
import MergePdfModal from "../MergePdfModal";
import { toast } from "react-toastify";
import { nbaDashboardService } from "../../Services/NBA-dashboard.service";
import {
  Trash2, Plus, FileText, Save, CheckCircle,
  Upload, X, Edit, Calculator, Eye, Clock, Check,
  Download, ExternalLink
} from "lucide-react";
Modal.setAppElement("#root");

// Faculty Qualification Table Component
const FacultyQualificationTable = ({ columns, data = [], onChange, disabled, tableConfig, approvalStatus }) => {
  const [rows, setRows] = useState(() => {
    if (data && data.length > 0) return data;
    
    // Initialize with empty data for each year
    return (tableConfig?.years || ["CAY", "CAYm1", "CAYm2"]).map((year, index) => ({
      id: `row-${index}`,
      year: year,
      X: "",
      Y: "",
      RF: "",
      FQI: ""
    }));
  });

  // Calculate FQI for a given row
  const calculateFQI = (X, Y, RF) => {
    const xNum = parseFloat(X) || 0;
    const yNum = parseFloat(Y) || 0;
    const rfNum = parseFloat(RF) || 1;
    
    if (rfNum === 0) return "0.00";
    
    // FQI = 2.5 * [(10X + 4Y)/RF]
    const fqi = 2.5 * ((10 * xNum + 4 * yNum) / rfNum);
    return fqi.toFixed(2);
  };

  const handleChange = (rowId, field, value) => {
    const updatedRows = rows.map(row => {
      if (row.id === rowId) {
        const updatedRow = { ...row, [field]: value };
        
        // If X, Y, or RF changed, recalculate FQI
        if (field === 'X' || field === 'Y' || field === 'RF') {
          updatedRow.FQI = calculateFQI(
            field === 'X' ? value : row.X,
            field === 'Y' ? value : row.Y,
            field === 'RF' ? value : row.RF
          );
        }
        
        return updatedRow;
      }
      return row;
    });
    
    setRows(updatedRows);
    onChange(updatedRows);
  };

  // Initialize rows when data prop changes
  useEffect(() => {
    if (data && data.length > 0) {
      setRows(data);
    }
  }, [data]);

  // Calculate average row
  const calculateAverage = () => {
    const numericRows = rows.filter(row => {
      const hasData = row.X !== "" || row.Y !== "" || row.RF !== "";
      const hasFQI = parseFloat(row.FQI) >= 0;
      return hasData && hasFQI;
    });
    
    if (numericRows.length === 0) return null;
    
    const average = {
      id: "average",
      year: "Average Assessment",
      X: (numericRows.reduce((sum, row) => sum + parseFloat(row.X || 0), 0) / numericRows.length).toFixed(2),
      Y: (numericRows.reduce((sum, row) => sum + parseFloat(row.Y || 0), 0) / numericRows.length).toFixed(2),
      RF: (numericRows.reduce((sum, row) => sum + parseFloat(row.RF || 0), 0) / numericRows.length).toFixed(2),
      FQI: (numericRows.reduce((sum, row) => sum + parseFloat(row.FQI || 0), 0) / numericRows.length).toFixed(2),
    };
    
    return average;
  };

  // Calculate marks based on average FQI
  const calculateMarks = (averageRow) => {
    if (!averageRow || !averageRow.FQI) return 0;
    
    const fqi = parseFloat(averageRow.FQI);
    // Marks = FQI (capped at 25)
    return Math.min(fqi, 25);
  };

  const averageRow = calculateAverage();
  const marks = calculateMarks(averageRow);

  // Handle download template
  const handleDownloadTemplate = () => {
    // Create CSV template
    const headers = ["Year", "X (Ph.D Faculty)", "Y (M.Tech/M.E Faculty)", "RF (Required Faculty)", "FQI"];
    const years = ["CAY", "CAYm1", "CAYm2"];
    const templateData = years.map(year => [year, "", "", "", ""]);
    
    const csvContent = [
      headers.join(","),
      ...templateData.map(row => row.join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'faculty_qualification_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success("Template downloaded!");
  };

  return (
    <div className="space-y-6">
      {/* Approval status badge */}
      {approvalStatus && (
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          approvalStatus === 'APPROVED' ? 'bg-green-100 text-green-800' :
          approvalStatus === 'REJECTED' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {approvalStatus === 'APPROVED' ? <Check className="w-4 h-4 mr-1" /> :
           approvalStatus === 'REJECTED' ? <X className="w-4 h-4 mr-1" /> :
           <Clock className="w-4 h-4 mr-1" />}
          {approvalStatus}
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          <strong>Formula:</strong> {tableConfig?.description || "FQI = 2.5 × [(10X + 4Y)/RF]"}
        </div>
        {!disabled && (
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
          >
            <Download className="w-4 h-4" />
            Download CSV Template
          </button>
        )}
      </div>
      
      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto bg-white rounded-lg shadow border border-gray-300">
          <thead>
            <tr className="bg-[#2163c1] text-white">
              {columns.map((col) => (
                <th key={col.field} className="p-3 text-center font-medium whitespace-pre-line align-middle">
                  {col.header}
                  {col.tooltip && (
                    <div className="text-xs font-normal opacity-90 mt-1">{col.tooltip}</div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Data Rows */}
            {rows.map((row) => (
              <tr key={row.id} className="border-b hover:bg-gray-50">
                <td className="p-3 text-center font-bold bg-gray-100">
                  {row.year}
                </td>
                <td className="p-3">
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={row.X || ""}
                    onChange={(e) => handleChange(row.id, "X", e.target.value)}
                    disabled={disabled}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    placeholder="0"
                  />
                </td>
                <td className="p-3">
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={row.Y || ""}
                    onChange={(e) => handleChange(row.id, "Y", e.target.value)}
                    disabled={disabled}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    placeholder="0"
                  />
                </td>
                <td className="p-3">
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={row.RF || ""}
                    onChange={(e) => handleChange(row.id, "RF", e.target.value)}
                    disabled={disabled}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    placeholder="0"
                  />
                </td>
                <td className="p-3 text-center font-bold text-blue-700 bg-blue-50">
                  {row.FQI || "0.00"}
                </td>
              </tr>
            ))}
            
            {/* Average Row */}
            {averageRow && (
              <tr className="border-b bg-green-50 font-bold">
                <td className="p-3 text-center text-green-700">
                  {averageRow.year}
                </td>
                <td className="p-3 text-center text-green-700">
                  {averageRow.X}
                </td>
                <td className="p-3 text-center text-green-700">
                  {averageRow.Y}
                </td>
                <td className="p-3 text-center text-green-700">
                  {averageRow.RF}
                </td>
                <td className="p-3 text-center text-green-700">
                  {averageRow.FQI}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Formula Explanation */}
      <div className="bg-gray-50 p-4 rounded-lg border">
        <h4 className="font-bold text-blue-700 mb-2">Formula Explanation:</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <strong>X (Ph.D. Faculty):</strong>
            <div className="mt-1">Number of faculty members with Ph.D. degree or equivalent as per AICTE/UGC norms.</div>
          </div>
          <div>
            <strong>Y (PG Faculty):</strong>
            <div className="mt-1">Number of faculty members with M.Tech or M.E. degree or equivalent as per AICTE/UGC norms.</div>
          </div>
          <div>
            <strong>RF (Required Faculty):</strong>
            <div className="mt-1">RF = S/20, where S = Total number of students (as per section 5.1)</div>
          </div>
        </div>
      </div>

      {/* Detailed Calculation for each year */}
      <div className="space-y-4">
        <h4 className="text-lg font-bold text-blue-700 flex items-center gap-2">
          <Calculator className="w-5 h-5" /> Detailed FQI Calculation for Each Year
        </h4>
        
        {rows.map((row) => {
          const X = parseFloat(row.X) || 0;
          const Y = parseFloat(row.Y) || 0;
          const RF = parseFloat(row.RF) || 1;
          const FQI = parseFloat(row.FQI) || 0;
          
          return (
            <div key={row.id} className="bg-white p-4 rounded-lg border">
              <div className="font-bold mb-2">{row.year}:</div>
              <div className="text-sm font-mono bg-gray-100 p-3 rounded">
                <div>FQI = 2.5 × [ (10×{X}) + (4×{Y}) ] / {RF}</div>
                <div>    = 2.5 × [ {10*X} + {4*Y} ] / {RF}</div>
                <div>    = 2.5 × [ {10*X + 4*Y} ] / {RF}</div>
                <div>    = 2.5 × {RF === 0 ? "Undefined" : ((10*X + 4*Y)/RF).toFixed(2)}</div>
                <div className="font-bold text-green-600 mt-1">
                  = {FQI.toFixed(2)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Marks Calculation */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-300 rounded-lg">
        <h4 className="text-lg font-bold text-blue-700 mb-3">Marks Calculation</h4>
        
        {averageRow && (
          <div className="space-y-4">
            {/* Final Marks */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-100 p-4 rounded-lg border border-green-300">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-bold text-lg">Average FQI: {averageRow.FQI}</div>
                  <div className="text-sm text-gray-600">Average of {rows.map(r => r.year).join(", ")}</div>
                </div>
                <div className="text-3xl font-bold text-green-700">
                  {marks.toFixed(2)} / 25
                </div>
              </div>
              
              <div className="mt-3 text-sm">
                <strong>Note:</strong> Marks = Average FQI (capped at maximum 25 marks)
              </div>
            </div>

            {/* Average Calculation */}
            <div className="bg-white p-4 rounded-lg border">
              <div className="font-bold mb-2">Average Calculation:</div>
              <div className="text-sm font-mono bg-gray-100 p-3 rounded">
                <div>Average FQI = ( {rows.map(r => r.FQI || "0.00").join(" + ")} ) / {rows.length}</div>
                <div>              = {rows.reduce((sum, row) => sum + parseFloat(row.FQI || 0), 0).toFixed(2)} / {rows.length}</div>
                <div>              = {averageRow.FQI}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Main Component for 5.2
const GenericCriteriaForm5_2 = ({
  title = "NBA Section",
  marks = 25,
  fields = [],
  initialData = null,
  onSave,
  onDelete,
  approvalStatus = null,
  isContributorEditable = true,
  saving = false,
}) => {
  const [isEditMode, setIsEditMode] = useState(false);

  const safeContent = initialData?.content || {};
  const safeTableData = initialData?.tableData || [];
  const safeFilesByField = initialData?.filesByField || {};

  const [filesByField, setFilesByField] = useState(() => {
    // Initialize with existing files
    const init = {};
    
    // Initialize for all fields
    fields.forEach((field) => {
      if (safeFilesByField[field.name]) {
        // Use existing files for this field
        init[field.name] = safeFilesByField[field.name].map((file, index) => ({
          id: file.id || `file-${field.name}-${index}`,
          description: file.description || "",
          filename: file.filename || "",
          url: file.url || file.s3Url || "",
          uploading: false,
          file: null
        }));
      } else {
        // Start with empty array for this field
        init[field.name] = [];
      }
    });
    
    return init;
  });

  const [formValues, setFormValues] = useState(safeContent);
  const [tableData, setTableData] = useState(safeTableData);
  const [previewModal, setPreviewModal] = useState({ isOpen: false, file: null });
  const [mergeModal, setMergeModal] = useState({ isOpen: false, fieldName: null });

  // Initialize when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormValues(initialData.content || {});
      setTableData(initialData.tableData || []);
      
      // Update filesByField
      const updatedFiles = {};
      fields.forEach((field) => {
        if (initialData.filesByField?.[field.name]) {
          updatedFiles[field.name] = initialData.filesByField[field.name].map((file, index) => ({
            id: file.id || `file-${field.name}-${index}`,
            description: file.description || "",
            filename: file.filename || "",
            url: file.url || file.s3Url || "",
            uploading: false,
            file: null
          }));
        } else {
          updatedFiles[field.name] = [];
        }
      });
      setFilesByField(updatedFiles);
    }
  }, [initialData]);

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
          url: "", 
          uploading: false 
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
      toast.error("Invalid file");
      return;
    }

    const currentRow = filesByField[fieldName][index];

    // Optimistic UI update
    setFilesByField(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].map((f, i) =>
        i === index ? { 
          ...f, 
          file: newFile, 
          filename: newFile.name, 
          uploading: true 
        } : f
      )
    }));

    try {
      const formData = new FormData();
      formData.append("file", newFile);
      
      if (currentRow.description?.trim()) {
        formData.append("description", currentRow.description.trim());
      }

      const resData = await nbaDashboardService.uploadFile(formData);
      
      // Handle response based on API structure
      let fileUrl = "";
      if (typeof resData === 'string') {
        // If response is a direct URL string
        fileUrl = resData;
      } else if (resData?.url) {
        // If response has url property
        fileUrl = resData.url;
      } else if (resData?.file_url) {
        // If response has file_url property (snake_case)
        fileUrl = resData.file_url;
      } else if (resData?.downloadPath) {
        // If response has downloadPath property
        fileUrl = resData.downloadPath;
      } else if (resData?.data?.url) {
        // If response is wrapped in data object
        fileUrl = resData.data.url;
      } else if (resData?.data?.file_url) {
        // If response is wrapped in data object with snake_case
        fileUrl = resData.data.file_url;
      }

      console.log("📤 Upload response:", resData);
      console.log("🔗 Extracted URL:", fileUrl);

      setFilesByField(prev => ({
        ...prev,
        [fieldName]: prev[fieldName].map((f, i) =>
          i === index
            ? { 
                ...f, 
                url: fileUrl,
                filename: newFile.name, 
                uploading: false 
              }
            : f
        )
      }));

      toast.success("Uploaded successfully!");
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error("Upload failed. Please try again.");

      setFilesByField(prev => ({
        ...prev,
        [fieldName]: prev[fieldName].map((f, i) =>
          i === index ? { 
            ...f, 
            uploading: false, 
            file: null, 
            filename: "", 
            url: "" 
          } : f
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

  const handleTableChange = (newTableData) => {
    setTableData(newTableData);
  };

  const handleSave = () => {
    // Prepare data for save
    const saveData = {
      content: formValues,
      tableData: tableData,
      filesByField: filesByField
    };
    
    console.log("💾 Saving data:", saveData);
    onSave(saveData);
    setIsEditMode(false);
  };

  const handleDownloadFile = (fileUrl, filename) => {
    if (!fileUrl) {
      toast.error("No file available to download");
      return;
    }
    
    // Create a temporary link to trigger download
    const link = document.createElement('a');
    link.href = fileUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Determine if editing should be disabled
  const isEditingDisabled = approvalStatus === 'APPROVED' || approvalStatus === 'REJECTED' || !isContributorEditable;

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
      <div className="bg-[#2163c1] text-white p-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold flex items-center gap-4">
            <FileText className="w-10 h-10" />
            {title}
            <span className="text-xl font-medium text-indigo-200">({marks} Marks)</span>
          </h2>
          {!isEditingDisabled && (
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`p-4 rounded-xl transition-all shadow-lg flex items-center justify-center ${
                isEditMode ? "bg-red-500 hover:bg-red-600 text-white" : "bg-white hover:bg-gray-100 text-[#2163c1]"
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
              <FacultyQualificationTable
                columns={field.tableConfig.columns}
                data={tableData}
                onChange={handleTableChange}
                disabled={!isEditMode || isEditingDisabled}
                tableConfig={field.tableConfig}
                approvalStatus={approvalStatus}
              />
            ) : (
              <div className="border-2 border-gray-300 rounded-b-lg bg-white">
                <Editor
                  value={formValues[field.name] || ""}
                  onChange={(val) => setFormValues((prev) => ({ ...prev, [field.name]: val }))}
                  disabled={!isEditMode || isEditingDisabled}
                  style={{ minHeight: 240, padding: 16, fontSize: 16 }}
                  className="focus:outline-none"
                />
              </div>
            )}

            {/* Supporting Documents Section */}
            <div className="mt-6 p-6 bg-gray-50 rounded-xl border">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-bold text-blue-700 flex items-center gap-2">
                  <Upload className="w-6 h-6" /> Supporting Documents
                </h4>
                {isEditMode && !isEditingDisabled && filesByField[field.name]?.some((f) => f.filename?.toLowerCase().endsWith(".pdf")) && (
                  <button
                    onClick={() => setMergeModal({ isOpen: true, fieldName: field.name })}
                    className="px-5 py-2.5 bg-[#2163c1] text-white font-medium rounded-lg hover:bg-[#1d57a8] transition flex items-center gap-2"
                  >
                    <FileText className="w-5 h-5" /> Merge PDFs
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {/* Show existing files even in view mode */}
                {(filesByField[field.name] || []).map((file, index) => {
                  const hasFile = file.url || file.filename;
                  
                  return (
                    <div key={file.id || index} className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-300">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={file.description || ""}
                          onChange={(e) => updateFileDescription(field.name, index, e.target.value)}
                          placeholder="Document description"
                          disabled={!isEditMode || isEditingDisabled}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        />
                      </div>

                      <div className="w-64">
                        {file.uploading ? (
                          <div className="flex items-center gap-2 text-gray-500">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                            <span>Uploading...</span>
                          </div>
                        ) : hasFile ? (
                          <div className="flex items-center gap-2">
                            <div className="flex flex-col">
                              <button
                                onClick={() => setPreviewModal({ isOpen: true, file })}
                                className="text-blue-600 font-medium hover:underline flex items-center gap-2 text-left"
                                title="Preview"
                              >
                                <Eye className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate max-w-32">{file.filename}</span>
                              </button>
                             
                            </div>
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          </div>
                        ) : (
                          isEditMode && !isEditingDisabled && (
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                              onChange={(e) => handleFileChange(field.name, index, e.target.files?.[0])}
                              className="block w-full text-sm border-0 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:bg-[#2163c1] file:text-white"
                            />
                          )
                        )}
                      </div>

                      {isEditMode && !isEditingDisabled && (
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
                      )}
                    </div>
                  );
                })}

                {/* Add first file row if none exists */}
                {(!filesByField[field.name] || filesByField[field.name].length === 0) && isEditMode && !isEditingDisabled && (
                  <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-300">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Document description"
                        value=""
                        onChange={(e) => {
                          addFileRow(field.name);
                          updateFileDescription(field.name, 0, e.target.value);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="w-64">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          addFileRow(field.name);
                          handleFileChange(field.name, 0, e.target.files?.[0]);
                        }}
                        className="block w-full text-sm border-0 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:bg-[#2163c1] file:text-white"
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
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {isEditMode && !isEditingDisabled && (
          <div className="text-center pt-10 flex gap-4 justify-center">
            <button
              onClick={handleSave}
              disabled={saving}
              className={`inline-flex items-center justify-center w-12 h-12 rounded-lg transition-all ${
                saving
                  ? "bg-[#2163c1] opacity-60 cursor-not-allowed"
                  : "bg-[#2163c1] hover:bg-[#1d57a8] text-white shadow-lg hover:shadow-xl"
              }`}
              title={saving ? "Saving..." : "Save"}
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
              disabled={saving}
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
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6" />
                <h3 className="text-xl font-bold truncate">{previewModal.file.filename}</h3>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleDownloadFile(previewModal.file.url, previewModal.file.filename)}
                  className="p-2 hover:bg-white/20 rounded-lg transition"
                  title="Download"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setPreviewModal({ isOpen: false, file: null })}
                  className="p-2 hover:bg-white/20 rounded-lg transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 p-4">
              {previewModal.file.filename?.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={previewModal.file.url}
                  title={previewModal.file.filename}
                  className="w-full h-full border-0"
                  style={{ minHeight: 'calc(100vh - 200px)' }}
                />
              ) : previewModal.file.filename?.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i) ? (
                <div className="flex items-center justify-center h-full">
                  <img
                    src={previewModal.file.url}
                    alt={previewModal.file.filename}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <FileText className="w-20 h-20 mb-4" />
                  <p className="text-lg">Preview not available for this file type</p>
                  <a
                    href={previewModal.file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open in new tab
                  </a>
                </div>
              )}
            </div>
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
            url: mergedDocument.url,
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

export default GenericCriteriaForm5_2;