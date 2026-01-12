import React, { useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import SweetAlert from "react-bootstrap-sweetalert";
import { bulkOnboardTeachers } from "../Services/teacher.service";
import { AlertTriangle, Download, Upload, X } from "lucide-react";
import { collegeService } from "../../Academics/Services/college.service"; // <-- added

export default function BulkUploadModal({ onClose, onSuccess = () => {} }) {
  const [step, setStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [userNameType, setUserNameType] = useState("FIRSTNAME");
  const [prefix, setPrefix] = useState("");
  const [suffix, setSuffix] = useState("");

  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const fileInputRef = useRef(null);
  const primaryBlue = "rgb(33 98 193)";

  // ---------- College fetch state (NEW) ----------
  const [colleges, setColleges] = useState([]);
  const [loadingColleges, setLoadingColleges] = useState(true);
  const [collegeError, setCollegeError] = useState(null);
  const [selectedCollegeId, setSelectedCollegeId] = useState("");
  const isFetchedRef = useRef(false);

  useEffect(() => {
    if (isFetchedRef.current) return;
    isFetchedRef.current = true;

    const fetchColleges = async () => {
      setCollegeError(null);
      setLoadingColleges(true);
      try {
        const data = await collegeService.getAllColleges();
        setColleges(data || []);
      } catch (err) {
        console.error("Failed to fetch colleges:", err);
        setCollegeError("Failed to load colleges");
      } finally {
        setLoadingColleges(false);
      }
    };

    fetchColleges();
  }, []);
  // ------------------------------------------------

  // Exact columns from your JSON
  const templateHeaders = [
    "firstname","middlename","lastname","email","mobile","phone","gender","avatar",
    "employee_id","designation","date_of_joining","date_of_birth","primary_subject",
    "secondary_subject_1","secondary_subject_2","address_line_1","address_line_2",
    "city","state","country","pincode","bank_name","bank_account_no","ifsc_code",
    "cost_to_company","deduction","net_pay","financial_year","pan_number",
    "aadhaar_number","marital_status","spouse_name","father_name","height",
    "weight","blood_group","uan_number"
  ];

  const displayHeaders = [
    "First Name*","Middle Name","Last Name*","Email*","Mobile*","Phone","Gender","Avatar URL",
    "Emp ID","Designation","Join Date","DOB*","Primary Sub","Sec Sub 1","Sec Sub 2",
    "Addr Line 1","Addr Line 2","City","State","Country","Pincode","Bank","A/c No","IFSC",
    "CTC","Deduction","Net Pay","FY","PAN","Aadhaar*","Marital","Spouse","Father",
    "Height","Weight","Blood","UAN"
  ];

  // Download Template
  const handleDownloadTemplate = () => {
    const sample = [
      "Rahul","Kumar","Sharma","rahul.sharma@school.edu","9876543210","011-23456789","MALE",
      "https://example.com/rahul.jpg","TCH001","Senior Math Teacher","15/08/2023","20/05/1985",
      "Mathematics","Physics","Computer Science","123 MG Road","Near Hospital","Mumbai",
      "Maharashtra","India","400001","SBI","123456789012","SBIN0001234","750000","50000",
      "700000","2023-2024","AXZPR5678K","123456789012","MARRIED","Priya Sharma","Mohan Sharma",
      "175","72","O+","100123456789"
    ];

    const ws = XLSX.utils.aoa_to_sheet([templateHeaders, sample]);
    ws["!cols"] = templateHeaders.map(() => ({ wch: 18 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Teachers");
    XLSX.writeFile(wb, "Teacher_BulkUpload_Template.xlsx");
  };

  // Upload & Parse
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const ext = file.name.split(".").pop().toLowerCase();
    if (!["xlsx", "xls"].includes(ext)) {
      setError("Only .xlsx or .xls files allowed");
      return;
    }

    setSelectedFile(file);
    setError("");
    parseExcelFile(file);
  };

  const parseExcelFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const wb = XLSX.read(data, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet, {
          header: templateHeaders,
          defval: "",
        });

        if (json.length <= 1) {
          setError("No data found. Add teachers below header row.");
          return;
        }

        const rows = json.slice(1).map((row, i) => ({
          id: i,
          ...row,
          _error: validateRow(row, i + 2),
        }));

        setParsedData(rows);
        setStep(2);
      } catch {
        setError("Invalid file. Use the downloaded template.");
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Validation
  const validateRow = (row, rowNum) => {
    const missing = [];
    const required = {
      firstname: "First Name",
      lastname: "Last Name",
      email: "Email",
      mobile: "Mobile",
      date_of_birth: "DOB",
      aadhaar_number: "Aadhaar",
    };

    Object.keys(required).forEach((key) => {
      if (!row[key] || !row[key].toString().trim()) {
        missing.push(required[key]);
      }
    });

    if (missing.length) return `Row ${rowNum}: Missing ${missing.join(", ")}`;
    if (row.email && !/^\S+@\S+\.\S+$/.test(row.email))
      return `Row ${rowNum}: Invalid email`;
    if (row.aadhaar_number && !/^\d{12}$/.test(row.aadhaar_number.replace(/\D/g, "")))
      return `Row ${rowNum}: Aadhaar must be 12 digits`;

    return null;
  };

  // Edit & Drop
  const handleCellChange = (id, field, value) => {
    setParsedData((prev) =>
      prev
        .map((r) => (r.id === id ? { ...r, [field]: value } : r))
        .map((r, i) => ({ ...r, _error: validateRow(r, i + 2) }))
    );
  };

  const handleDropRow = (id) => {
    setParsedData((prev) => prev.filter((r) => r.id !== id));
  };

  // Submit — Sends EXACT JSON you showed
  const handleSubmit = async () => {
    const valid = parsedData.filter((r) => !r._error);
    if (valid.length === 0) {
      setError("No valid rows to upload");
      return;
    }

    const payload = valid.map((r) => ({
      firstname: (r.firstname || "").trim(),
      middlename: (r.middlename || "").trim(),
      lastname: (r.lastname || "").trim(),
      email: (r.email || "").trim(),
      mobile: (r.mobile || "").trim(),
      phone: (r.phone || "").trim(),
      gender: (r.gender || "").trim(),
      avatar: (r.avatar || "").trim(),
      employee_id: (r.employee_id || "").trim(),
      designation: (r.designation || "").trim(),
      date_of_birth: r.date_of_birth
        ? new Date(r.date_of_birth.split("/").reverse().join("-") + "T00:00:00")
        : null,
      date_of_joining: r.date_of_joining
        ? new Date(r.date_of_joining.split("/").reverse().join("-") + "T00:00:00")
        : null,
      primary_subject: (r.primary_subject || "").trim(),
      secondary_subject_1: (r.secondary_subject_1 || "").trim(),
      secondary_subject_2: (r.secondary_subject_2 || "").trim(),
      address_line_1: (r.address_line_1 || "").trim(),
      address_line_2: (r.address_line_2 || "").trim(),
      city: (r.city || "").trim(),
      state: (r.state || "").trim(),
      country: (r.country || "").trim(),
      pincode: (r.pincode || "").trim(),
      bank_name: (r.bank_name || "").trim(),
      bank_account_no: Number(r.bank_account_no) || 0,
      ifsc_code: (r.ifsc_code || "").trim(),
      cost_to_company: (r.cost_to_company || "").trim(),
      deduction: (r.deduction || "").trim(),
      net_pay: (r.net_pay || "").trim(),
      financial_year: (r.financial_year || "").trim(),
      pan_number: (r.pan_number || "").trim(),
      aadhaar_number: (r.aadhaar_number || "").trim(),
      marital_status: (r.marital_status || "").trim(),
      spouse_name: (r.spouse_name || "").trim(),
      father_name: (r.father_name || "").trim(),
      height: (r.height || "").trim(),
      weight: (r.weight || "").trim(),
      blood_group: (r.blood_group || "").trim(),
      uan_number: (r.uan_number || "").trim(),
    }));

    const options = { userNameType, ...(prefix && { prefix }), ...(suffix && { suffix }) };

    // If you want to pass selectedCollegeId to backend, add it to options:
    if (selectedCollegeId) {
      options.college_id = selectedCollegeId;
    }

    try {
      setIsSubmitting(true);
      const result = await bulkOnboardTeachers(payload, options);

      if (typeof result === "string" && result.includes("successfully")) {
        setAlertMessage(`Success! ${valid.length} teacher(s) uploaded.`);
        setShowSuccess(true);
        onSuccess(valid.length);
      } else {
        setAlertMessage("Partial success. Check response.");
        setShowError(true);
      }
    } catch (err) {
      setAlertMessage(`Error: ${err.response?.data?.message || err.message}`);
      setShowError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const validCount = parsedData.filter((r) => !r._error).length;

  return (
    <>
      {showSuccess && (
        <SweetAlert
          success
          title="Uploaded!"
          onConfirm={() => { setShowSuccess(false); onClose(); }}
        >
          {alertMessage}
        </SweetAlert>
      )}
      {showError && (
        <SweetAlert error title="Error" onConfirm={() => setShowError(false)}>
          <pre className="text-left text-xs">{alertMessage}</pre>
        </SweetAlert>
      )}

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className={`bg-white rounded-2xl shadow-2xl ${step === 2 ? "w-[98%] max-w-7xl" : "w-[90%] max-w-2xl"}`}>
          <div className="p-6 border-b flex justify-between items-center text-white rounded-t-xl" style={{ backgroundColor: primaryBlue }}>
            <h2 className="text-2xl font-bold">Bulk Upload Teachers</h2>
            <button onClick={onClose}><X className="w-6 h-6" /></button>
          </div>

          <div className="p-6 max-h-[80vh] overflow-y-auto">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex gap-2">
                <AlertTriangle className="w-5 h-5 mt-0.5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* STEP 1 */}
            {step === 1 && (
              <div className="space-y-8 text-center">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">Step 1: Upload File</h3>
                  <p className="text-gray-600 mt-2">* = Required</p>
                </div>

                {/* College Select (NEW) */}
                <div className="max-w-xs mx-auto text-left">
                  <label className="block font-medium mb-1 text-gray-700">Select College</label>
                  {loadingColleges ? (
                    <div className="w-full border rounded px-3 py-2 bg-gray-50 text-gray-600">Loading colleges...</div>
                  ) : collegeError ? (
                    <div className="w-full border rounded px-3 py-2 bg-red-50 text-red-600">{collegeError}</div>
                  ) : (
                    <select
                      value={selectedCollegeId}
                      onChange={(e) => setSelectedCollegeId(e.target.value)}
                      className="w-full border rounded px-3 py-2 focus:outline-none transition-colors"
                    >
                      <option value="">Select college</option>
                      {colleges.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.college_name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="bg-gray-50 p-6 rounded-xl">
                  <h4 className="font-bold mb-4">Username Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <select value={userNameType} onChange={(e) => setUserNameType(e.target.value)}
                      className="px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500">
                      <option value="FIRSTNAME">First Name</option>
                      <option value="FULLNAME">Full Name</option>
                      <option value="EMAIL">Email</option>
                    </select>
                    <input placeholder="Prefix (TCH_)" value={prefix} onChange={(e) => setPrefix(e.target.value)}
                      className="px-4 py-3 border rounded-xl" />
                    <input placeholder="Suffix (_2025)" value={suffix} onChange={(e) => setSuffix(e.target.value)}
                      className="px-4 py-3 border rounded-xl" />
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <button onClick={handleDownloadTemplate}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium shadow">
                    <Download className="w-5 h-5" /> Download Template
                  </button>
                  <label className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow cursor-pointer">
                    <Upload className="w-5 h-5" /> Upload File
                    <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleFileChange} className="hidden" />
                  </label>
                </div>

                {selectedFile && <p className="text-green-700 font-medium">Selected: <strong>{selectedFile.name}</strong></p>}
              </div>
            )}

            {/* STEP 2 - PREVIEW */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">Step 2: Review & Edit</h3>
                    <p className="text-gray-600">Fix red rows</p>
                  </div>
                  <button onClick={() => setStep(3)} disabled={validCount === 0}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-xl font-medium">
                    Continue ({validCount} valid)
                  </button>
                </div>

                <p className="text-xs text-gray-500">Scroll to see all columns</p>

                <div className="border rounded-xl overflow-hidden shadow">
                  <div className="overflow-x-auto max-h-[60vh]">
                    <table className="w-full min-w-max">
                      <thead className="bg-blue-600 text-white sticky top-0">
                        <tr>
                          {displayHeaders.map((h, i) => (
                            <th key={i} className="px-3 py-3 text-left text-xs font-bold">{h}</th>
                          ))}
                          <th className="px-3 py-3 text-center text-xs font-bold">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedData.map((row, idx) => (
                          <React.Fragment key={row.id}>
                            <tr className={`${idx % 2 === 0 ? "bg-gray-50" : "bg-white"} ${row._error ? "bg-red-50" : "hover:bg-blue-50"}`}>
                              {templateHeaders.map((field) => (
                                <td key={field} className="px-2 py-2">
                                  {field.includes("date") ? (
                                    <input
                                      type="date"
                                      value={row[field]?.split("/").reverse().join("-") || ""}
                                      onChange={(e) => {
                                        const [y, m, d] = e.target.value.split("-");
                                        handleCellChange(row.id, field, `${d}/${m}/${y}`);
                                      }}
                                      className="w-full min-w-36 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-300"
                                    />
                                  ) : (
                                    <input
                                      type="text"
                                      value={row[field] || ""}
                                      onChange={(e) => handleCellChange(row.id, field, e.target.value)}
                                      className="w-full min-w-36 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-300"
                                    />
                                  )}
                                </td>
                              ))}
                              <td className="px-2 py-2 text-center">
                                <button onClick={() => handleDropRow(row.id)}
                                  className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs rounded">
                                  Drop
                                </button>
                              </td>
                            </tr>
                            {row._error && (
                              <tr>
                                <td colSpan={templateHeaders.length + 1} className="px-3 py-1 bg-red-100 text-xs text-red-700 italic">
                                  {row._error}
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div className="text-center space-y-8">
                <h3 className="text-2xl font-bold text-gray-800">Ready to Upload</h3>
                <div className="bg-blue-50 p-8 rounded-2xl max-w-xl mx-auto">
                  <div className="grid grid-cols-2 gap-6 text-lg">
                    <div>Total: <strong>{parsedData.length}</strong></div>
                    <div>Valid: <strong className="text-green-600">{validCount}</strong></div>
                    <div>Errors: <strong className="text-red-600">{parsedData.length - validCount}</strong></div>
                    <div>Username: <strong>{userNameType}</strong></div>
                  </div>
                </div>
                <button onClick={handleSubmit} disabled={isSubmitting || validCount === 0}
                  className="px-10 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold text-xl rounded-xl shadow">
                  {isSubmitting ? "Uploading..." : `Upload ${validCount} Teachers`}
                </button>
                <button onClick={() => setStep(2)} className="text-blue-600 hover:underline">Back to Edit</button>
              </div>
            )}
          </div>

          {step < 3 && (
            <div className="p-6 border-t bg-gray-50 rounded-b-xl flex justify-end">
              <button onClick={onClose} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-200">
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
