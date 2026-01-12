import React, { useState, useEffect } from "react";
import { X, Upload, FileDown, CheckCircle, AlertCircle } from "lucide-react";
import * as XLSX from "xlsx";
import SweetAlert from "react-bootstrap-sweetalert";
import { useNavigate } from "react-router-dom";
import { courseService } from "../../Courses/Services/courses.service";

export default function BulkUploadModuleUI() {
  const navigate = useNavigate();
  const primaryBlue = "rgb(33 98 193)";

  // UI state
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [inlineError, setInlineError] = useState("");
  const [alertElm, setAlertElm] = useState(null);

  // Subjects (fetched from API so we can match file values to subject_id)
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  // Parsing / preview
  const [parsedData, setParsedData] = useState([]); // each row: { id, "Paper", "Module Name", module_name, subject_id, _error }
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Expected template headers (order-sensitive)
  const headers = ["Paper", "Module Name"];

  // Helper: show any raw response JSON in a SweetAlert (pretty-printed + scrollable)
  const showRawResponseAlert = (response, title = "Response") => {
    const pretty = (() => {
      try {
        return JSON.stringify(response, null, 2);
      } catch {
        return String(response);
      }
    })();

    setAlertElm(
      <SweetAlert
        info
        title={title}
        onConfirm={() => setAlertElm(null)}
        confirmBtnCssClass="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
      >
        <div
          style={{
            whiteSpace: "pre-wrap",
            textAlign: "left",
            maxHeight: 360,
            overflowY: "auto",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, monospace",
            fontSize: 12,
            lineHeight: "1.4rem",
            padding: "6px 8px",
            borderRadius: 6,
            background: "#f7f9fc",
            border: "1px solid #e6eef8",
          }}
        >
          {pretty}
        </div>
      </SweetAlert>
    );
  };

  // Utility: normalize strings for comparison
  const normalize = (s) => {
    if (s == null) return "";
    return String(s).trim().replace(/\s+/g, " ").toLowerCase();
  };

  // Try to find a subjectOption by a user-provided subject string.
  // We compare against the formatted label and a few likely raw fields.
  const findSubjectByName = (subjectStr) => {
    const target = normalize(subjectStr);
    if (!target) return null;

    // exact match by normalized label
    const byLabel = subjectOptions.find((s) => normalize(s.label) === target);
    if (byLabel) return byLabel;

    // partial case-insensitive includes (prefer exact but fallback to includes)
    const byIncludes = subjectOptions.find((s) => normalize(s.label).includes(target) || target.includes(normalize(s.label)));
    if (byIncludes) return byIncludes;

    // try fields inside raw object (name, paper_name, subject_name, code)
    const byRaw = subjectOptions.find((s) => {
      const r = s.raw || {};
      const possible = [r.name, r.paper_name, r.subject_name, r.code, r.title];
      return possible.some((p) => p && normalize(p) === target);
    });
    if (byRaw) return byRaw;

    // if subjectStr is numeric, try matching id
    if (!Number.isNaN(Number(subjectStr))) {
      const idMatch = subjectOptions.find((s) => Number(s.value) === Number(subjectStr));
      if (idMatch) return idMatch;
    }

    return null;
  };

  // Fetch available subjects on mount (we still need them to map file Paper -> subject_id)
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoadingSubjects(true);
        const response = await courseService.getAllCourses();
        if (response && Array.isArray(response)) {
          const formatted = response.map((s) => ({
            label: s.name || s.paper_name || s.subject_name || `Paper ${s.id ?? s.subject_id ?? ""}`,
            value: s.subject_id ?? s.id,
            raw: s,
          }));
          setSubjectOptions(formatted);
          setInlineError("");
        } else {
          setSubjectOptions([]);
          setInlineError("No subjects found (unexpected response). See details.");
          showRawResponseAlert(response, "Subjects response");
          console.warn("courseService.getAllCourses returned non-array:", response);
        }
      } catch (err) {
        console.error("Failed to fetch subjects:", err);
        setSubjectOptions([]);
        setInlineError("Failed to load subjects. Please try again.");
        showRawResponseAlert(err?.message ? { error: err.message } : err, "Subjects error");
      } finally {
        setLoadingSubjects(false);
      }
    };

    fetchSubjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Template download — no subject prefill now (user will fill Paper in file)
  const handleDownloadTemplate = () => {
    // sample row: no subject, module name blank
    const sampleRow = ["", ""];
    const workbook = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, sampleRow]);
    ws["!cols"] = [{ wch: 30 }, { wch: 40 }];
    XLSX.utils.book_append_sheet(workbook, ws, "Template");
    const filename = "Module_Template.xlsx";
    XLSX.writeFile(workbook, filename);
  };

  // When user selects file -> parse
  const handleFileChange = (e) => {
    setInlineError("");
    setParsedData([]);
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const bstr = event.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        if (!wb.SheetNames || wb.SheetNames.length === 0) {
          setInlineError("The Excel file appears to be empty or corrupted.");
          e.target.value = null;
          return;
        }
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        if (!ws) {
          setInlineError("Unable to read the worksheet. Please check the file format.");
          e.target.value = null;
          return;
        }
        const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
        if (!data.length) {
          setInlineError("Empty or invalid file.");
          e.target.value = null;
          return;
        }

        // Normalize header row
        const firstRow = Array.isArray(data[0]) ? data[0] : [];
        const fileHeaders = firstRow.map((h) => {
          if (!h) return "";
          const str = String(h).trim();
          return str.replace(/\s+/g, " ").toLowerCase();
        });

        // Check header match (order-sensitive)
        const expectedLower = headers.map((h) => String(h).trim().toLowerCase().replace(/\s+/g, " "));
        const isHeaderMatch =
          expectedLower.length === fileHeaders.length &&
          expectedLower.every((exp, i) => exp === (fileHeaders[i] || "").replace(/\s+/g, " "));

        if (!isHeaderMatch) {
          const expectedPreview = headers.join(", ");
          const actualPreview = fileHeaders.join(", ") || "No headers found";
          setInlineError(
            `Invalid template. Expected: ${expectedPreview}. Found: ${actualPreview}. Please download and use the latest template.`
          );
          e.target.value = null;
          return;
        }

        // Parse rows to objects keyed by header names
        const rows = data.slice(1).map((rowArr, idx) => {
          const row = {};
          headers.forEach((h, i) => {
            row[h] = rowArr[i] != null ? String(rowArr[i]).trim() : "";
          });

          // Find subject mapping from Paper cell
          const matched = findSubjectByName(row["Paper"]);
          const subject_id = matched ? Number(matched.value) : null;

          return {
            id: idx,
            ...row,
            // normalized/API fields
            subject_id,
            module_name: row["Module Name"] || "",
            _error: null,
          };
        });

        const validated = rows.map((r) => ({ ...r, _error: validateRow(r) }));
        setParsedData(validated);
        setSelectedFile(file);
        setUploadResult(null);
      } catch (err) {
        console.error("Parsing error:", err);
        setInlineError("Failed to parse file. Please check the format.");
        showRawResponseAlert(err, "Parsing error");
      } finally {
        e.target.value = null;
      }
    };

    reader.onerror = () => {
      setInlineError("Failed to read the file. Please try again.");
      e.target.value = null;
    };

    reader.readAsBinaryString(file);
  };

  // Validate a single parsed row
  const validateRow = (row) => {
    const get = (v) => (v ? String(v).trim() : "");
    if (!get(row["Paper"])) return "Paper is required.";
    if (!row.subject_id) return `Paper not recognized: "${row["Paper"]}". Please use an existing subject name or ID.`;
    if (!get(row["Module Name"])) return "Module Name is required.";
    return null;
  };

  // Edit a cell in preview table
  const handleEdit = (id, key, value) => {
    setParsedData((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        const updated = { ...row, [key]: value };
        if (key === "Module Name") updated.module_name = value;
        if (key === "Paper") {
          // re-run subject matching for updated subject cell
          const matched = findSubjectByName(value);
          updated.subject_id = matched ? Number(matched.value) : null;
        }
        updated._error = validateRow(updated);
        return updated;
      })
    );
  };

  const handleDropRow = (id) => setParsedData((prev) => prev.filter((r) => r.id !== id));

  // Submit: build payload and call API
  const handleSubmit = async () => {
    setInlineError("");

    const validRows = parsedData.filter((r) => !r._error);
    if (!validRows.length) {
      setInlineError("No valid rows to upload.");
      return;
    }

    // Build payload array where each item matches the exact shape expected by API
    const payload = validRows.map((r) => ({
      subject_id: Number(r.subject_id),
      module_name: String(r.module_name).trim(),
    }));

    setIsSubmitting(true);
    try {
      const res = await courseService.bulkUploadModule(payload);
      console.log("API Response:", res);

      // Interpret response shapes
      if (res?.status === "partial_success" && Array.isArray(res.failed) && res.failed.length > 0) {
        const failedList = res.failed
          .map((f) => {
            const failedReq = f.failed_request || {};
            const name = failedReq.module_name || "Unknown";
            const errText = typeof f.errors === "object" ? Object.values(f.errors).join(", ") : f.errors;
            return `• ${name} - ${errText}`;
          })
          .join("\n");

        setAlertElm(
          <SweetAlert
            warning
            title="Partial Success ⚠️"
            onConfirm={() => setAlertElm(null)}
            confirmBtnCssClass="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg"
          >
            <div style={{ whiteSpace: "pre-line", textAlign: "left", maxHeight: 300, overflowY: "auto" }}>{failedList}</div>
          </SweetAlert>
        );
      } else if (res?.status === "success") {
        setAlertElm(
          <SweetAlert
            success
            title="Success!"
            onConfirm={() => {
              setAlertElm(null);
              setParsedData([]);
              setSelectedFile(null);
              setUploadResult({ success: true, message: res?.message || "Modules uploaded successfully." });
            }}
            confirmBtnCssClass="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            {res?.message || "Modules uploaded successfully."}
          </SweetAlert>
        );
      } else {
        // Fallback: show full raw response in a SweetAlert
        showRawResponseAlert(res, "API Response");
      }
    } catch (err) {
      console.error("Upload error:", err);
      showRawResponseAlert(err?.message ? { error: err.message } : err, "Upload Failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasValidRows = parsedData.some((r) => !r._error);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-[90%] max-w-4xl animate-slideUp">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center text-white rounded-t-xl" style={{ backgroundColor: primaryBlue }}>
          <h2 className="text-2xl font-bold">Bulk Upload Modules</h2>
          <button onClick={() => navigate("/courses/module")} className="text-white hover:text-gray-300">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Inline error */}
          {inlineError && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{inlineError}</div>}

          {/* Info Note */}
          {/* <div className="flex items-start bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-700 text-sm">
            Template columns: Paper, Module Name. <strong>Enter the Paper exactly as it exists in the system</strong> (name or numeric id). If a Paper in the file doesn't match any existing subject, that row will be flagged and must be fixed in the preview before uploading.
          </div> */}

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Excel File</label>
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              disabled={isSubmitting || loadingSubjects}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            {selectedFile && (
              <p className="text-sm text-green-700 mt-2">
                📁 Selected File: <strong>{selectedFile.name}</strong>
              </p>
            )}
            {loadingSubjects && <p className="text-xs text-gray-600 mt-2">Loading subjects for matching…</p>}
            {!loadingSubjects && subjectOptions.length === 0 && (
              <p className="text-red-500 text-xs mt-1">No subjects available to match. Upload will fail until subjects are available.</p>
            )}
          </div>

          {/* Download Template */}
          <div className="flex justify-start">
            <button onClick={handleDownloadTemplate} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium shadow transition-all">
              <FileDown className="w-4 h-4" />
              Download Template
            </button>
          </div>

          {/* Preview Table */}
          {parsedData.length > 0 && (
            <div className="overflow-x-auto border rounded-lg mt-6">
              <table className="min-w-full text-sm divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    {headers.map((head) => (
                      <th key={head} className="px-3 py-2 text-left font-semibold text-gray-600">
                        {head}
                      </th>
                    ))}
                    <th className="px-3 py-2 text-center font-semibold text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.map((row) => (
                    <tr key={row.id} className={row._error ? "bg-red-50" : "bg-white"}>
                      {headers.map((key) => (
                        <td key={key} className="px-3 py-2 border-t">
                          <input
                            type="text"
                            value={row[key] || ""}
                            onChange={(e) => handleEdit(row.id, key, e.target.value)}
                            className={`w-full border rounded px-2 py-1 text-xs ${row._error ? "border-red-400" : "border-gray-300"}`}
                          />
                        </td>
                      ))}
                      <td className="text-center border-t">
                        {row._error ? (
                          <button onClick={() => handleDropRow(row.id)} className="bg-red-500 hover:bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded">
                            Drop
                          </button>
                        ) : (
                          <span className="text-xs text-green-700">OK</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Error Summary */}
          {parsedData.some((r) => r._error) && (
            <div className="mt-4 text-red-600 text-sm">
              <p>Please fix the highlighted rows:</p>
              <ul className="list-disc list-inside">
                {Array.from(new Set(parsedData.filter((r) => r._error).map((r) => r._error))).map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-gray-200 p-5 space-x-3">
          <button onClick={() => navigate("/courses/module")} disabled={isSubmitting} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-all disabled:opacity-50">
            Cancel
          </button>

          <button
            disabled={!hasValidRows || isSubmitting || loadingSubjects || subjectOptions.length === 0}
            onClick={handleSubmit}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium shadow-md transition-all ${
              !hasValidRows || isSubmitting || loadingSubjects || subjectOptions.length === 0 ? "opacity-50 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload
              </>
            )}
          </button>
        </div>
      </div>

      {alertElm}
    </div>
  );
}
