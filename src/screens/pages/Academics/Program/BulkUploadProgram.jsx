import React, { useState, useEffect, useCallback } from "react";
import * as XLSX from "xlsx";
import { collegeService } from "../Services/college.service";

export default function BulkUploadProgram({ onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [colleges, setColleges] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState("");
  const [parsedData, setParsedData] = useState([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchColleges();
  }, []);

  // Re-validate data whenever it's edited by the user
  useEffect(() => {
    // This effect should only run when the step changes to 2, to avoid loops.
    // The validation logic is now primarily in handleFileChange and handleDataChange.
    if (step === 2) {
      handleDataChange(-1, null, null); // Trigger a re-validation
    }
  }, [step]);

  const fetchColleges = async () => {
    try {
      const data = await collegeService.getAllColleges();
      setColleges(data);
    } catch (err) {
      setError("Failed to fetch colleges for template.");
    }
  };

  const handleDownloadTemplate = () => {
    if (!selectedCollege) {
      setError("Please select a college first.");
      return;
    }
    const college = colleges.find(c => c.id === Number(selectedCollege));
    if (!college) {
      setError("Selected college not found.");
      return;
    }

    // Main sheet for program data
    const wsData = [
      ["College", "Program Name", "Program Code", "Program Level"],
      [college.college_name, "Sample Program Name", "SPN101", "UG"] // Example row
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Programs");

    XLSX.writeFile(wb, "Program_Upload_Template.xlsx");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const bstr = event.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

        // Validate headers
        const headers = data[0];
        if (
          headers[0] !== "College" ||
          headers[1] !== "Program Name" ||
          headers[2] !== "Program Code" ||
          headers[3] !== "Program Level"
        ) {
          setError("Invalid Excel template. Please download and use the provided template.");
          return;
        }

        const initialParsedData = data.slice(1).map((row, index) => ({
          id: index,
          college_name: row[0],
          program_name: row[1] || "",
          program_code: row[2] || "",
          program_level: row[3] || "",
          college_id: Number(selectedCollege),
          _error: null
        })).filter(row => row.program_name || row.program_code || row.program_level);

        if (initialParsedData.length === 0) {
          setError("The uploaded file is empty or contains no valid data.");
          return;
        }

        // Perform initial validation right after parsing
        const programCodeCounts = new Map();
        const programNameCounts = new Map();
        initialParsedData.forEach(row => {
          if (row.program_code) programCodeCounts.set(String(row.program_code).trim().toUpperCase(), (programCodeCounts.get(String(row.program_code).trim().toUpperCase()) || 0) + 1);
          if (row.program_name) programNameCounts.set(String(row.program_name).trim().toUpperCase(), (programNameCounts.get(String(row.program_name).trim().toUpperCase()) || 0) + 1);
        });

        const validatedData = initialParsedData.map(row => ({
          ...row,
          _error: getRowError(row, programCodeCounts, programNameCounts)
        }));
        setParsedData(validatedData);
        setError("");
        setStep(2);
      } catch (err) {
        setError("Failed to parse the Excel file. Please ensure it's a valid .xlsx file.");
        console.error(err);
      }
    };
    reader.readAsBinaryString(file);
  };

  const getRowError = (row, programCodeCounts, programNameCounts) => {
    const selectedCollegeObject = colleges.find(c => c.id === Number(selectedCollege));
    if (row.college_name && selectedCollegeObject && row.college_name !== selectedCollegeObject.college_name) {
      return `Invalid College. Expected '${selectedCollegeObject.college_name}', but found '${row.college_name}'.`;
    }
    if (row.program_code && programCodeCounts.get(String(row.program_code).trim().toUpperCase()) > 1) {
      return `Duplicate Program Code: "${row.program_code}" exists multiple times.`;
    }
    if (row.program_name && programNameCounts.get(String(row.program_name).trim().toUpperCase()) > 1) {
      return `Duplicate Program Name: "${row.program_name}" exists multiple times.`;
    }
    if (!row.program_name || !row.program_code) {
      return "Program Name and Program Code are required.";
    }
    return null;
  };

  const handleDataChange = (id, field, value) => {
    setParsedData(prevData => {
      // If id is -1, it's a signal to just re-validate without changing data.
      const newData = id === -1
        ? [...prevData]
        : prevData.map(row => (row.id === id ? { ...row, [field]: value } : row));

      const programCodeCounts = new Map();
      const programNameCounts = new Map();
      newData.forEach(row => {
        if (row.program_code) {
          const code = String(row.program_code).trim().toUpperCase();
          programCodeCounts.set(code, (programCodeCounts.get(code) || 0) + 1);
        }
        if (row.program_name) {
          const name = String(row.program_name).trim().toUpperCase();
          programNameCounts.set(name, (programNameCounts.get(name) || 0) + 1);
        }
      });

      return newData.map(row => ({
        ...row,
        _error: getRowError(row, programCodeCounts, programNameCounts)
      }));
    });
  };

  const handleDropRow = (id) => {
    setParsedData(prevData =>
      prevData.filter(row => row.id !== id)
    );
  };

  const handleSubmit = async () => {
    const hasErrors = parsedData.some(d => d._error);
    if (hasErrors) {
      setError("Please fix the errors before submitting.");
      return;
    }

    const validData = parsedData.filter(d => !d._error);
    if (validData.length === 0) {
      setError("No valid data to submit. Please correct the errors in your file and re-upload.");
      return;
    }

    const payloads = validData.map(d => ({
      program_name: d.program_name,
      program_code: d.program_code,
      college_id: d.college_id,
      program_level: d.program_level,
    }));

    setIsSubmitting(true);
    setError("");
    try {
      await collegeService.saveProgram(payloads);
      onSuccess();
    } catch (err) {
      const apiError = err.response?.data?.message || err.message || "Failed to save programs. Please try again.";
      setError(apiError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasErrors = parsedData.some(row => row._error);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Bulk Upload Programs</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl font-bold">&times;</button>
        </div>

        <div className="p-6 overflow-y-auto">
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}

          {step === 1 && (
            <div className="space-y-6">
              <div>

                <h3 className="text-lg font-medium mb-2 text-center">Step 1: Select College</h3>
                {/* NBA / NIRF / NAAC Checkboxes */}
                <div className="flex flex-col md:flex-row gap-6 mb-6 justify-center">

                  {/* NBA */}
                  <label className="flex items-center gap-2 text-gray-700 font-medium">
                    <input
                      type="checkbox"
                      className="w-4 h-4"
                    />
                    NBA
                  </label>

                  {/* NIRF */}
                  <label className="flex items-center gap-2 text-gray-700 font-medium">
                    <input
                      type="checkbox"
                      className="w-4 h-4"
                    />
                    NIRF
                  </label>

                  {/* NAAC */}
                  <label className="flex items-center gap-2 text-gray-700 font-medium">
                    <input
                      type="checkbox"
                      className="w-4 h-4"
                    />
                    NAAC
                  </label>

                </div>
                <p className="text-gray-600 mb-4 text-center">Choose the college for which you want to upload programs.</p>
                <select
                  value={selectedCollege}
                  onChange={(e) => setSelectedCollege(e.target.value)}
                  disabled={colleges.length === 0}
                  className="w-full max-w-md mx-auto block border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">{colleges.length > 0 ? "Select a College" : "Loading colleges..."}</option>
                  {colleges.map((college) => (
                    <option key={college.id} value={college.id}>
                      {college.college_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={`text-center transition-opacity duration-300 ${selectedCollege ? 'opacity-100' : 'opacity-50'}`}>
                <h3 className="text-lg font-medium mb-2">Step 2: Download & Upload</h3>
                <p className="text-gray-600 mb-4">Download the template, fill it, and then upload it.</p>
                <button
                  onClick={handleDownloadTemplate}
                  disabled={!selectedCollege}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Download Template
                </button>
                <input id="file-upload" type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileChange} disabled={!selectedCollege} />
                <label htmlFor="file-upload" className={`cursor-pointer ml-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center ${!selectedCollege ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <span>Upload File</span>
                </label>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 className="text-lg font-medium mb-4">Step 2: Review Data</h3>
              <p className="text-gray-600 mb-4">Please review the data parsed from your file. Rows with errors will be highlighted and will not be uploaded.</p>
              <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">College</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program Code</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program Level</th>
                      <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {parsedData.map((row) => (
                      <tr key={row.id} className={row._error ? "bg-red-50" : ""}>
                        <td className="px-2 py-2 whitespace-nowrap text-sm">
                          <input
                            type="text"
                            value={row.college_name}
                            readOnly
                            className="w-full bg-gray-100 border-gray-300 rounded px-2 py-1 text-sm"
                          />
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap text-sm">
                          <input type="text" value={row.program_name} onChange={(e) => handleDataChange(row.id, 'program_name', e.target.value)} className={`w-full border rounded px-2 py-1 text-sm ${row._error ? 'border-red-400' : 'border-gray-300'}`} />
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap text-sm">
                          <input type="text" value={row.program_code} onChange={(e) => handleDataChange(row.id, 'program_code', e.target.value)} className={`w-full border rounded px-2 py-1 text-sm ${row._error ? 'border-red-400' : 'border-gray-300'}`} />
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap text-sm">
                          <input type="text" value={row.program_level} onChange={(e) => handleDataChange(row.id, 'program_level', e.target.value)} className={`w-full border rounded px-2 py-1 text-sm ${row._error ? 'border-red-400' : 'border-gray-300'}`} />
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap text-sm text-center">
                          {row._error && (
                            <button
                              type="button"
                              onClick={() => handleDropRow(row.id)}
                              className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-1 px-2 rounded"
                            >
                              Drop
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedData.some(row => row._error) && (
                <div className="mt-4 text-red-600 text-sm">
                  <p>Please fix the highlighted errors:</p>
                  <ul className="list-disc list-inside">
                    {Array.from(new Set(parsedData.filter(r => r._error).map(r => r._error))).map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition">
            Cancel
          </button>
          {step === 2 && (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || hasErrors}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Submit Data"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}