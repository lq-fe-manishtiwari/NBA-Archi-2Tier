import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { classService } from "../Services/class.service";

export default function BulkUploadClass({ onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [semesterCount, setSemesterCount] = useState("");
  const [parsedData, setParsedData] = useState([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 📥 Generate and download Excel Template
  const handleDownloadTemplate = () => {
    if (!semesterCount || isNaN(semesterCount) || semesterCount <= 0) {
      setError("Please enter a valid number of semesters.");
      return;
    }

    const baseHeaders = ["YEAR NUMBER", "CLASS NAME"];
    const dynamicHeaders = [];

    for (let i = 1; i <= semesterCount; i++) {
      dynamicHeaders.push(`SEMESTER ${i} NUMBER`, `SEMESTER ${i} NAME`);
    }

    const headers = [...baseHeaders, ...dynamicHeaders];

    const sampleRow = ["1", "Sample Class"];
    for (let i = 1; i <= semesterCount; i++) {
      sampleRow.push(`${i}`, `Sample Semester ${i}`);
    }

    const wsData = [headers, sampleRow];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    const colWidths = headers.map((header) => ({
      wch: Math.max(header.length * 1.2, 12),
    }));
    ws["!cols"] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Classes");

    XLSX.writeFile(wb, "Class_Upload_Template.xlsx");
    setError("");
  };

  // 📤 Parse Uploaded Excel File
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

        if (!data.length) {
          setError("The file is empty or invalid.");
          return;
        }

        const headers = data[0];
        const baseHeaders = ["YEAR NUMBER", "CLASS NAME"];
        const expectedHeaders = [...baseHeaders];
        for (let i = 1; i <= semesterCount; i++) {
          expectedHeaders.push(`SEMESTER ${i} NUMBER`, `SEMESTER ${i} NAME`);
        }

        const isHeaderMatch =
          JSON.stringify(headers.map((h) => h?.trim())) ===
          JSON.stringify(expectedHeaders);

        if (!isHeaderMatch) {
          setError(
            "Invalid template. Please download the template for the selected semester count."
          );
          return;
        }

        const parsed = data
          .slice(1)
          .map((row, index) => {
            const year = row[0];
            const className = row[1];
            const semesters = [];

            for (let i = 0; i < semesterCount; i++) {
              const semNum = row[2 + i * 2];
              const semName = row[3 + i * 2];
              if (semNum || semName) {
                semesters.push({
                  semester_number: semNum || "",
                  name: semName || "",
                });
              }
            }

            return {
              id: index,
              year_number: year || "",
              class_name: className || "",
              semesters,
              _error: null,
            };
          })
          .filter((r) => r.class_name || r.year_number || r.semesters.length);

        if (parsed.length === 0) {
          setError("The uploaded file contains no valid data.");
          return;
        }

        const validatedData = validateData(parsed);
        setParsedData(validatedData);
        setError("");
        setStep(2);
      } catch (err) {
        console.error(err);
        setError("Failed to parse the Excel file. Please ensure it's valid.");
      }
    };
    reader.readAsBinaryString(file);
  };

  // 🧮 Validation Logic
  const validateData = (data) => {
    const nameCounts = new Map();
    data.forEach((row) => {
      if (row.class_name) {
        const key = String(row.class_name).trim().toUpperCase();
        nameCounts.set(key, (nameCounts.get(key) || 0) + 1);
      }
    });

    return data.map((row) => ({
      ...row,
      _error: getRowError(row, nameCounts),
    }));
  };

  const getRowError = (row, nameCounts) => {
    if (!row.year_number || !row.class_name) {
      return "Year Number and Class Name are required.";
    }
    if (nameCounts.get(String(row.class_name).trim().toUpperCase()) > 1) {
      return `Duplicate Class Name: "${row.class_name}" exists multiple times.`;
    }
    return null;
  };

  // ✏️ Handle Edits
  const handleDataChange = (id, field, value, semIndex, semField) => {
    setParsedData((prevData) => {
      const newData = prevData.map((row) => {
        if (row.id === id) {
          if (field === "semesters") {
            const updatedSemesters = [...row.semesters];
            updatedSemesters[semIndex][semField] = value;
            return { ...row, semesters: updatedSemesters };
          }
          return { ...row, [field]: value };
        }
        return row;
      });

      return validateData(newData);
    });
  };

  // 🗑️ Drop invalid row
  const handleDropRow = (id) => {
    setParsedData((prevData) => prevData.filter((row) => row.id !== id));
  };

  // 🚀 Submit to API
  const handleSubmit = async () => {
    const validData = parsedData.filter((d) => !d._error);
    if (validData.length === 0) {
      setError("No valid data to submit. Please correct the errors and retry.");
      return;
    }

    const payloads = validData.map((d) => ({
      year_number: d.year_number,
      name: d.class_name,
      semesters: d.semesters,
    }));

    setIsSubmitting(true);
    setError("");
    try {
      await classService.saveBulkClass(payloads);
      onSuccess && onSuccess();
    } catch (err) {
      console.error(err);
      setError(err || "Failed to save class data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasErrors = parsedData.some((r) => r._error);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            Bulk Upload Classes
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-2xl font-bold"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2 text-center">
                  Step 1: Enter Maximum Semesters
                </h3>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g., 4"
                  value={semesterCount}
                  onChange={(e) => setSemesterCount(e.target.value)}
                  className="w-full max-w-md mx-auto block border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div
                className={`text-center transition-opacity duration-300 ${
                  semesterCount ? "opacity-100" : "opacity-50"
                }`}
              >
                <h3 className="text-lg font-medium mb-2">
                  Step 2: Download & Upload
                </h3>
                <button
                  onClick={handleDownloadTemplate}
                  disabled={!semesterCount}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition disabled:bg-gray-400"
                >
                  Download Template
                </button>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".xlsx, .xls"
                  onChange={handleFileChange}
                  disabled={!semesterCount}
                />
                <label
                  htmlFor="file-upload"
                  className={`cursor-pointer ml-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center ${
                    !semesterCount ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <span>Upload File</span>
                </label>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 className="text-lg font-medium mb-4">Step 2: Review Data</h3>
              <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Year Number
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Class Name
                      </th>
                      {[...Array(Number(semesterCount))].map((_, i) => (
                        <React.Fragment key={i}>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Semester {i + 1} Number
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Semester {i + 1} Name
                          </th>
                        </React.Fragment>
                      ))}
                      <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.map((row) => (
                      <tr key={row.id} className={row._error ? "bg-red-50" : ""}>
                        <td className="px-2 py-2">
                          <input
                            type="text"
                            value={row.year_number}
                            onChange={(e) =>
                              handleDataChange(row.id, "year_number", e.target.value)
                            }
                            className={`w-full border rounded px-2 py-1 text-sm ${
                              row._error ? "border-red-400" : "border-gray-300"
                            }`}
                          />
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="text"
                            value={row.class_name}
                            onChange={(e) =>
                              handleDataChange(row.id, "class_name", e.target.value)
                            }
                            className={`w-full border rounded px-2 py-1 text-sm ${
                              row._error ? "border-red-400" : "border-gray-300"
                            }`}
                          />
                        </td>
                        {[...Array(Number(semesterCount))].map((_, i) => {
                          const sem = row.semesters[i] || {
                            semester_number: "",
                            name: "",
                          };
                          return (
                            <React.Fragment key={i}>
                              <td className="px-2 py-2">
                                <input
                                  type="text"
                                  value={sem.semester_number}
                                  onChange={(e) =>
                                    handleDataChange(
                                      row.id,
                                      "semesters",
                                      e.target.value,
                                      i,
                                      "semester_number"
                                    )
                                  }
                                  className="w-full border rounded px-2 py-1 text-sm border-gray-300"
                                />
                              </td>
                              <td className="px-2 py-2">
                                <input
                                  type="text"
                                  value={sem.name}
                                  onChange={(e) =>
                                    handleDataChange(
                                      row.id,
                                      "semesters",
                                      e.target.value,
                                      i,
                                      "name"
                                    )
                                  }
                                  className="w-full border rounded px-2 py-1 text-sm border-gray-300"
                                />
                              </td>
                            </React.Fragment>
                          );
                        })}
                        <td className="px-2 py-2 text-center">
                          {row._error && (
                            <button
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

              {parsedData.some((r) => r._error) && (
                <div className="mt-4 text-red-600 text-sm">
                  <p>Please fix the highlighted errors:</p>
                  <ul className="list-disc list-inside">
                    {Array.from(
                      new Set(parsedData.filter((r) => r._error).map((r) => r._error))
                    ).map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition"
          >
            Cancel
          </button>
          {step === 2 && (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || hasErrors}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition disabled:bg-gray-400"
            >
              {isSubmitting ? "Submitting..." : "Submit Data"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
