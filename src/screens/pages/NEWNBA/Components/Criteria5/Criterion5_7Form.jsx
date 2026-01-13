import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import SweetAlert from 'react-bootstrap-sweetalert';

const Criterion5_7Form = ({
  cycle_sub_category_id,
  isEditable = true,
  onSaveSuccess,
  programId = null,
  otherStaffId = null,
  showCardView = false,
  onCardClick = null,
  onStatusChange = null,
  cardData = [],
}) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);
  
  // Form data states
  const [facultyData, setFacultyData] = useState([
    { id: 1, name: "", CAYm1: "", CAYm2: "", CAYm3: "" },
    { id: 2, name: "", CAYm1: "", CAYm2: "", CAYm3: "" },
  ]);
  
  const [rfValue, setRfValue] = useState(10); // Default RF value
  const [supportingFiles, setSupportingFiles] = useState([]);
  
  // Calculations
  const calculateSums = () => {
    const sums = { CAYm1: 0, CAYm2: 0, CAYm3: 0 };
    
    facultyData.forEach(faculty => {
      sums.CAYm1 += parseFloat(faculty.CAYm1) || 0;
      sums.CAYm2 += parseFloat(faculty.CAYm2) || 0;
      sums.CAYm3 += parseFloat(faculty.CAYm3) || 0;
    });
    
    return sums;
  };
  
  const calculateAssessment = (yearSum) => {
    const assessment = 3 * yearSum / (0.5 * rfValue);
    return Math.min(assessment, 15); // Limit to 15 marks
  };
  
  const calculateAverage = () => {
    const sums = calculateSums();
    const assessments = {
      CAYm1: calculateAssessment(sums.CAYm1),
      CAYm2: calculateAssessment(sums.CAYm2),
      CAYm3: calculateAssessment(sums.CAYm3),
    };
    
    const average = (assessments.CAYm1 + assessments.CAYm2 + assessments.CAYm3) / 3;
    return Math.min(average, 15); // Limit to 15 marks
  };
  
  const sums = calculateSums();
  const averageAssessment = calculateAverage();
  
  // Add new faculty row
  const addFacultyRow = () => {
    const newId = facultyData.length > 0 
      ? Math.max(...facultyData.map(f => f.id)) + 1 
      : 1;
    
    setFacultyData([
      ...facultyData,
      { id: newId, name: "", CAYm1: "", CAYm2: "", CAYm3: "" }
    ]);
  };
  
  // Remove faculty row
  const removeFacultyRow = (id) => {
    if (facultyData.length <= 1) {
      toast.warning("At least one faculty member is required");
      return;
    }
    
    setFacultyData(facultyData.filter(f => f.id !== id));
  };
  
  // Update faculty data
  const updateFacultyData = (id, field, value) => {
    setFacultyData(facultyData.map(faculty => {
      if (faculty.id === id) {
        // Validate max 5 points per year
        if (field.startsWith("CAY") && value > 5) {
          toast.warning("Maximum 5 points per faculty per year");
          return { ...faculty, [field]: 5 };
        }
        return { ...faculty, [field]: value };
      }
      return faculty;
    }));
  };
  
  // Handle file upload
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      file,
      type: file.type,
      size: file.size,
      uploading: false
    }));
    
    setSupportingFiles([...supportingFiles, ...newFiles]);
    
    // Simulate upload
    newFiles.forEach(file => {
      setTimeout(() => {
        setSupportingFiles(prev => 
          prev.map(f => f.id === file.id ? { ...f, uploading: false, uploaded: true } : f)
        );
      }, 1000);
    });
  };
  
  // Remove file
  const removeFile = (id) => {
    setSupportingFiles(supportingFiles.filter(f => f.id !== id));
  };
  
  // Save data
  const handleSave = async () => {
    setSaving(true);
    
    try {
      // Prepare payload
      const payload = {
        cycle_sub_category_id,
        faculty_data: facultyData,
        rf_value: rfValue,
        sums,
        average_assessment: averageAssessment,
        supporting_documents: supportingFiles.filter(f => f.uploaded).map(f => ({
          name: f.name,
          type: f.type,
          size: f.size
        }))
      };
      
      // TODO: Replace with actual API call
      console.log("Saving Criterion 5.6 data:", payload);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Criterion 5.6 data saved successfully!");
      onSaveSuccess?.();
      
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save data");
    } finally {
      setSaving(false);
    }
  };
  
  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // TODO: Load data from API
        // Simulate loading
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error("Load error:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (cycle_sub_category_id) {
      loadData();
    }
  }, [cycle_sub_category_id]);
  
  if (loading) {
    return (
      <div className="flex justify-center py-20 text-xl font-medium text-indigo-600">
        Loading Criterion 5.6...
      </div>
    );
  }
  
  // Show card view for coordinators
  if (showCardView) {
    return (
      <div className="space-y-4">
        {cardData && cardData.length > 0 ? (
          cardData.map((card, index) => (
            <div key={index} className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                 onClick={() => onCardClick?.(cycle_sub_category_id, card.other_staff_id, card)}>
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">{card.firstname} {card.lastname}</h4>
                  <p className="text-sm text-gray-600">Staff ID: {card.other_staff_id}</p>
                  <p className="text-sm text-gray-600">RF Value: {card.rf_value}</p>
                  <p className="text-sm text-gray-600">Average Assessment: {card.average_assessment?.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded text-xs ${
                    card.approval_status === 'APPROVED_BY_COORDINATOR' ? 'bg-green-100 text-green-800' :
                    card.approval_status === 'REJECTED_BY_COORDINATOR' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {card.approval_status || 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            No contributor submissions found
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">5.6 Faculty as Participants in Faculty Development/Training Activities/STTPs (15)</h2>
        <p className="text-gray-600 mt-2">
          Faculty members can score a maximum of five points per year for participation.
        </p>
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-4">
          <p className="text-sm text-gray-700">
            <strong>Note:</strong> If a faculty member participates in a workshop/FDP lasting 2 to 5 days, they receive 3 points.
            If a faculty member participates in a workshop/FDP lasting more than 5 days, they receive 5 points.
          </p>
        </div>
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto mb-8">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-3 text-center font-semibold">SN.</th>
              <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Name of the Faculty</th>
              <th className="border border-gray-300 px-4 py-3 text-center font-semibold">Max. 5 per Faculty</th>
              <th className="border border-gray-300 px-4 py-3 text-center font-semibold">CAYm1</th>
              <th className="border border-gray-300 px-4 py-3 text-center font-semibold">CAYm2</th>
              <th className="border border-gray-300 px-4 py-3 text-center font-semibold">CAYm3</th>
              {isEditable && (
                <th className="border border-gray-300 px-4 py-3 text-center font-semibold">Action</th>
              )}
            </tr>
          </thead>
          <tbody>
            {facultyData.map((faculty, index) => (
              <tr key={faculty.id} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-3 text-center">
                  {String.fromCharCode(65 + index)} {/* A, B, C... */}
                </td>
                <td className="border border-gray-300 px-4 py-3">
                  {isEditable ? (
                    <input
                      type="text"
                      value={faculty.name}
                      onChange={(e) => updateFacultyData(faculty.id, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter faculty name"
                    />
                  ) : (
                    <span>{faculty.name || "-"}</span>
                  )}
                </td>
                <td className="border border-gray-300 px-4 py-3 text-center text-blue-600 font-medium">
                  5
                </td>
                <td className="border border-gray-300 px-4 py-3">
                  {isEditable ? (
                    <input
                      type="number"
                      min="0"
                      max="5"
                      step="0.5"
                      value={faculty.CAYm1}
                      onChange={(e) => updateFacultyData(faculty.id, 'CAYm1', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0-5"
                    />
                  ) : (
                    <span className="block text-center">{faculty.CAYm1 || "0"}</span>
                  )}
                </td>
                <td className="border border-gray-300 px-4 py-3">
                  {isEditable ? (
                    <input
                      type="number"
                      min="0"
                      max="5"
                      step="0.5"
                      value={faculty.CAYm2}
                      onChange={(e) => updateFacultyData(faculty.id, 'CAYm2', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0-5"
                    />
                  ) : (
                    <span className="block text-center">{faculty.CAYm2 || "0"}</span>
                  )}
                </td>
                <td className="border border-gray-300 px-4 py-3">
                  {isEditable ? (
                    <input
                      type="number"
                      min="0"
                      max="5"
                      step="0.5"
                      value={faculty.CAYm3}
                      onChange={(e) => updateFacultyData(faculty.id, 'CAYm3', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0-5"
                    />
                  ) : (
                    <span className="block text-center">{faculty.CAYm3 || "0"}</span>
                  )}
                </td>
                {isEditable && (
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <button
                      onClick={() => removeFacultyRow(faculty.id)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 focus:outline-none text-sm"
                    >
                      Remove
                    </button>
                  </td>
                )}
              </tr>
            ))}
            
            {/* Sum Row */}
            <tr className="bg-gray-100 font-semibold">
              <td className="border border-gray-300 px-4 py-3 text-center">Sum</td>
              <td className="border border-gray-300 px-4 py-3 text-center">-</td>
              <td className="border border-gray-300 px-4 py-3 text-center">-</td>
              <td className="border border-gray-300 px-4 py-3 text-center bg-blue-50">
                {sums.CAYm1.toFixed(1)}
              </td>
              <td className="border border-gray-300 px-4 py-3 text-center bg-blue-50">
                {sums.CAYm2.toFixed(1)}
              </td>
              <td className="border border-gray-300 px-4 py-3 text-center bg-blue-50">
                {sums.CAYm3.toFixed(1)}
              </td>
              {isEditable && (
                <td className="border border-gray-300 px-4 py-3 text-center">-</td>
              )}
            </tr>
          </tbody>
        </table>
        
        {isEditable && (
          <div className="mt-4">
            <button
              onClick={addFacultyRow}
              className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 focus:outline-none flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Faculty
            </button>
          </div>
        )}
      </div>
      
      {/* Calculations Section */}
      <div className="mb-8 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Assessment Calculation</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                RF = Number of Faculty required to comply with 15:1 Student-Faculty ratio as per 5.1
              </label>
              {isEditable ? (
                <input
                  type="number"
                  value={rfValue}
                  onChange={(e) => setRfValue(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter RF value"
                />
              ) : (
                <div className="px-4 py-2 bg-white border border-gray-300 rounded-lg">
                  {rfValue}
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Assessment = 3 × Sum / (0.5 × RF) (Marks limited to 15)</p>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-white rounded border">
                  <div className="text-sm text-gray-500">CAYm1</div>
                  <div className="text-xl font-bold text-blue-600">
                    {calculateAssessment(sums.CAYm1).toFixed(2)}
                  </div>
                </div>
                <div className="text-center p-3 bg-white rounded border">
                  <div className="text-sm text-gray-500">CAYm2</div>
                  <div className="text-xl font-bold text-blue-600">
                    {calculateAssessment(sums.CAYm2).toFixed(2)}
                  </div>
                </div>
                <div className="text-center p-3 bg-white rounded border">
                  <div className="text-sm text-gray-500">CAYm3</div>
                  <div className="text-xl font-bold text-blue-600">
                    {calculateAssessment(sums.CAYm3).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-bold text-lg text-blue-800 mb-2">Average Assessment over Three Years</h4>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-700">
                  {averageAssessment.toFixed(2)}
                </div>
                <p className="text-sm text-blue-600 mt-1">(Marks limited to 15)</p>
              </div>
            </div>
            
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-bold text-lg text-green-800 mb-2">Formula</h4>
              <div className="text-sm text-gray-700 space-y-1">
                <p>For each year: Assessment = 3 × Sum / (0.5 × RF)</p>
                <p>Average = (CAYm1 + CAYm2 + CAYm3) ÷ 3</p>
                <p className="font-semibold">Maximum Marks: 15</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Supporting Documents */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Supporting Documents</h3>
        <p className="text-gray-600 mb-4">
          Table No.5.6.A list of faculty members who have participated in FDPs or STPs over the past 3 years
        </p>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <div className="text-center">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-gray-600 mb-2">Upload supporting documents (FDP certificates, STTP records, etc.)</p>
            {isEditable ? (
              <>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <span className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none inline-block">
                    Choose Files
                  </span>
                </label>
                <p className="text-sm text-gray-500 mt-2">Max file size: 10MB each</p>
              </>
            ) : (
              <p className="text-gray-500 italic">No files uploaded</p>
            )}
          </div>
          
          {supportingFiles.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium text-gray-700 mb-3">Uploaded Files:</h4>
              <div className="space-y-2">
                {supportingFiles.map(file => (
                  <div key={file.id} className="flex items-center justify-between bg-white p-3 rounded border">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded flex items-center justify-center ${
                        file.uploading ? 'bg-yellow-100' : 'bg-green-100'
                      }`}>
                        {file.uploading ? (
                          <svg className="w-5 h-5 text-yellow-600 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-gray-800">{file.name}</p>
                        <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                    {isEditable && !file.uploading && (
                      <button
                        onClick={() => removeFile(file.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Action Buttons */}
      {isEditable && (
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Criterion 5.6
              </>
            )}
          </button>
        </div>
      )}
      
      {alert}
    </div>
  );
};

export default Criterion5_7Form;