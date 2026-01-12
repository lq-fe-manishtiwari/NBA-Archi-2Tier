import React, { useEffect, useState } from "react";
import { X, Upload, FileDown } from "lucide-react";
import * as XLSX from "xlsx";
import { OtherStaffService } from "../Service/OtherStaff.service"; // ✅ ensure correct import path
import { DepartmentService } from "../../Academics/Services/Department.service";
import SweetAlert from "react-bootstrap-sweetalert";

export default function BulkUploadModal({ onClose, onSuccess, setAlert }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [parsedData, setParsedData] = useState([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🧾 Excel Template Headers
  const headers = [
    "EMPLOYEE ID",
    "PAN NUM",
    "DEPARTMENT NAME",
    "DATE OF JOINING",
    "EMAIL",
    "GENDER",
    "FIRSTNAME",
    "LASTNAME",
    "MOBILE",
  ];


  // 📥 Download Excel Template
  const handleDownloadTemplate = () => {
    const worksheet = XLSX.utils.aoa_to_sheet([headers]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    XLSX.writeFile(workbook, "OtherStaff_BulkUpload_Template.xlsx");
  };

  // 🗂️ File Upload + Parse Excel
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const bstr = event.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

        if (!data.length) {
          setError("Empty or invalid file.");
          return;
        }

        const firstRow = Array.isArray(data[0]) ? data[0] : [];
        const headers = firstRow.map((h) => (h ? String(h).trim() : ""));
        const expectedHeaders = [
          "EMPLOYEE ID",
          "PAN NUM",
          "DEPARTMENT NAME",
          "DATE OF JOINING",
          "EMAIL",
          "GENDER",
          "FIRSTNAME",
          "LASTNAME",
          "MOBILE",
        ];

        const isHeaderMatch =
          headers.length === expectedHeaders.length &&
          headers.every(
            (h, i) => h.toLowerCase() === expectedHeaders[i].toLowerCase()
          );

        if (!isHeaderMatch) {
          setError("Invalid template. Please use the latest template.");
          return;
        }

        // ✅ Fetch department list safely
        let departmentList = departments;
        if (!departmentList.length) {
          departmentList = await DepartmentService.getDepartment();
          setDepartments(departmentList);
        }

        const parsed = data.slice(1).map((row, index) => {
          const deptName = row[2] ? String(row[2]).trim().toLowerCase() : "";

          const matchedDept = departmentList.find(
            (d) =>
              d &&
              typeof d.department_name === "string" &&
              d.department_name.trim().toLowerCase() === deptName
          );
          console.log("matchedDept", matchedDept);

          return {
            id: index,

            // Original Excel headers (for display)
            "EMPLOYEE ID": row[0] || "",
            "PAN NUM": row[1] || "",
            "DEPARTMENT NAME": row[2] || "",
            "DATE OF JOINING": row[3] || "",
            EMAIL: row[4] || "",
            GENDER: row[5] || "",
            FIRSTNAME: row[6] || "",
            LASTNAME: row[7] || "",
            MOBILE: row[8] || "",

            // Lowercase field keys (for validation + API)
            employee_id: row[0] || "",
            pan: row[1] || "",
            department_name: row[2] || "",
            doj: row[3] || "",
            email: row[4] || "",
            gender: row[5] || "",
            firstname: row[6] || "",
            lastname: row[7] || "",
            mobile: row[8] || "",
            department_id: matchedDept ? matchedDept.department_id : null,

            _error: null, // We'll set this in validation step next
          };

        });

        console.log("✅ Parsed Rows:", parsed);

        const validatedRows = parsed.map((row) => ({
          ...row,
          _error: validateRow(row),
        }));

        setParsedData(validatedRows);
        setError("");
      } catch (err) {
        console.error("❌ Parsing error:", err);
        setError("Failed to parse file. Please check the format.");
      }
    };

    reader.readAsBinaryString(file);
  };



  // ✅ Validation Logic
  const validateRow = (row) => {
    const getString = (value) => (value ? String(value).trim() : "");

    // 1️⃣ Employee ID
    if (!getString(row["EMPLOYEE ID"])) {
      return "Employee ID is required.";
    }

    // 2️⃣ Department
    if (!row.department_id || !getString(row["DEPARTMENT NAME"])) {
      return "Department is required or invalid.";
    }

    // 3️⃣ Email
    const email = getString(row["EMAIL"]);
    if (!email) {
      return "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Invalid email format.";
    }

    // 4️⃣ Firstname
    if (!getString(row["FIRSTNAME"])) {
      return "First name is required.";
    }

    // 5️⃣ Mobile
    const mobile = getString(row["MOBILE"]);
    if (!mobile) {
      return "Mobile number is required.";
    } else if (!/^\d{10}$/.test(mobile)) {
      return "Mobile number must be 10 digits.";
    }

    return null; // ✅ valid
  };




  // ✏️ Handle Cell Edit
  const handleEdit = (id, key, value) => {
    setParsedData((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;

        const updatedRow = { ...row, [key]: value };

        // 🔍 If department name changed → re-match it
        if (key === "DEPARTMENT NAME") {
          const deptName = String(value).trim().toLowerCase();
          const matchedDept = departments.find(
            (d) =>
              d &&
              typeof d.department_name === "string" &&
              d.department_name.trim().toLowerCase() === deptName
          );
          updatedRow.department_id = matchedDept ? matchedDept.department_id : null;
        }

        updatedRow._error = validateRow(updatedRow);
        return updatedRow;
      })
    );
  };



  // 🗑️ Drop invalid row
  const handleDropRow = (id) => {
    setParsedData((prev) => prev.filter((row) => row.id !== id));
  };

  // 🚀 Submit Handler (API integrated)
  const handleSubmit = async () => {
    const validRows = parsedData.filter((r) => !r._error);
    if (!validRows.length) {
      setError("No valid rows to upload.");
      return;
    }

    const payload = validRows.map((r) => ({
      employee_id: r["EMPLOYEE ID"],
      pan: r["PAN NUM"],
      doj: r["DATE OF JOINING"],
      email: r["EMAIL"],
      gender: r["GENDER"],
      firstname: r["FIRSTNAME"],
      lastname: r["LASTNAME"],
      mobile: r["MOBILE"],
      department_id: r.department_id,
    }));

    setIsSubmitting(true);
    try {
      const res = await OtherStaffService.submitOtherStaffRequest(payload);

      if (res?.status === "partial_success" && res?.failed?.length > 0) {
        const failedList = res.failed
          .map((f) => {
            const emp = f.failed_request || {};
            const name = emp.firstname || "Unknown";
            const id = emp.employee_id || "N/A";
            const errorMsg =
              typeof f.errors === "object"
                ? Object.values(f.errors).join(", ")
                : f.errors;
            return `• ${name} (ID: ${id}) - ${errorMsg}`;
          })
          .join("\n");

        setAlert(
          <SweetAlert
            warning
            title="Partial Success ⚠️"
            onConfirm={() => setAlert(null)}
            confirmBtnCssClass="btn-confirm"
          >
            <div
              style={{
                whiteSpace: "pre-line",
                textAlign: "left",
                maxHeight: "300px",
                overflowY: "auto",
              }}
            >
              {failedList}
            </div>
          </SweetAlert>
        );
      } else if (res?.status === "success") {
        onSuccess && onSuccess();
        onClose && onClose();
        setAlert(
          <SweetAlert
            success
            title="Success!"
            onConfirm={() => setAlert(null)}
            confirmBtnCssClass="btn-confirm"
          >
            {res?.message || "All staff uploaded successfully."}
          </SweetAlert>
        );
      }
    } catch (err) {
      console.error(err);
      setAlert(
        <SweetAlert
          danger
          title="Upload Failed ❌"
          onConfirm={() => setAlert(null)}
          confirmBtnCssClass="btn-confirm"
        >
          Failed to upload data. Please try again.
        </SweetAlert>
      );
    } finally {
      setIsSubmitting(false);
    }

  };



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-[90%] max-w-6xl animate-slideUp">
        {/* ---------- Header ---------- */}
        <div className="flex justify-between items-center border-b border-gray-200 p-5">
          <h2 className="text-xl font-semibold text-gray-800">
            Bulk Upload Data
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* ---------- Body ---------- */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Upload Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Excel File
            </label>
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {selectedFile && (
              <p className="text-sm text-green-700 mt-2">
                📁 Selected File: <strong>{selectedFile.name}</strong>
              </p>
            )}
          </div>

          {/* Info */}
          <div className="flex items-start bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-700 text-sm">
            <i className="fas fa-info-circle mr-2 mt-0.5"></i>
            Please upload only Excel files (.xlsx, .xls) with correct column
            names. You can also download the template below.
          </div>

          {/* Download Template */}
          <div className="flex justify-start">
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium shadow transition-all"
            >
              <FileDown className="w-4 h-4" />
              Download Template
            </button>
          </div>

          {/* Data Preview Table */}
          {parsedData.length > 0 && (
            <div className="overflow-x-auto border rounded-lg mt-6">
              <table className="min-w-full text-sm divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    {headers.map((head) => (
                      <th
                        key={head}
                        className="px-3 py-2 text-left font-semibold text-gray-600"
                      >
                        {head}
                      </th>
                    ))}
                    <th className="px-3 py-2 text-center font-semibold text-gray-600">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.map((row) => (
                    <tr
                      key={row.id}
                      className={row._error ? "bg-red-50" : "bg-white"}
                    >
                      {headers.map((key) => (
                        <td key={key} className="px-3 py-2 border-t">
                          <input
                            type="text"
                            value={row[key]}
                            onChange={(e) =>
                              handleEdit(row.id, key, e.target.value)
                            }
                            className={`w-full border rounded px-2 py-1 text-xs ${row._error ? "border-red-400" : "border-gray-300"
                              }`}
                          />
                        </td>
                      ))}
                      <td className="text-center border-t">
                        {row._error && (
                          <button
                            onClick={() => handleDropRow(row.id)}
                            className="bg-red-500 hover:bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded"
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
          )}

          {/* Error summary */}
          {parsedData.some((r) => r._error) && (
            <div className="mt-4 text-red-600 text-sm">
              <p>Please fix the highlighted rows:</p>
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

        {/* ---------- Footer ---------- */}
        <div className="flex justify-end border-t border-gray-200 p-5 space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-all"
          >
            Cancel
          </button>
          <button
            disabled={isSubmitting || parsedData.length === 0}
            onClick={handleSubmit}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium shadow-md transition-all ${isSubmitting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            <Upload className="w-4 h-4" />
            {isSubmitting ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}
