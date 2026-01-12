import React, { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import SweetAlert from 'react-bootstrap-sweetalert';

import { bulkOnboardStudents } from "../Services/student.service";
import { AlertTriangle, Download, Upload, ChevronDown } from "lucide-react";

export default function BulkUploadModal({ onClose, onSuccess = () => { } }) {
  const [step, setStep] = useState(1);
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState("");
  const [parsedData, setParsedData] = useState([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [userNameType, setUserNameType] = useState("ROLLNUMBER");
  const [prefix, setPrefix] = useState("");
  const [suffix, setSuffix] = useState("");

  // SweetAlert state
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const primaryBlue = 'rgb(33 98 193)';

  // Utility function to convert Excel date serial number to readable date
  const convertExcelDate = (excelDate) => {
    if (!excelDate) return "";

    // Convert to string first to safely check
    const dateStr = String(excelDate);

    // If it's already a string date, return as is
    if (typeof excelDate === 'string' && (dateStr.includes('/') || dateStr.includes('-'))) {
      return excelDate;
    }

    // If it's a number (Excel serial date)
    if (typeof excelDate === 'number' && excelDate > 0) {
      try {
        const date = XLSX.SSF.parse_date_code(excelDate);
        if (date && date.d && date.m && date.y) {
          return `${date.d.toString().padStart(2, '0')}/${date.m.toString().padStart(2, '0')}/${date.y}`;
        }
      } catch (err) {
        console.warn('Date conversion error:', err);
      }
    }

    return dateStr;
  };

  // Format date for input field (YYYY-MM-DD)
  const formatDateForInput = (dateStr) => {
    if (!dateStr) return "";

    const str = String(dateStr);

    // If already in YYYY-MM-DD format
    if (str.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return str;
    }

    // Convert DD/MM/YYYY to YYYY-MM-DD
    if (str.includes('/')) {
      const parts = str.split('/');
      if (parts.length === 3) {
        const [day, month, year] = parts;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    }

    return str;
  };

  // Format date for display (DD/MM/YYYY)
  const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return "";

    const str = String(dateStr);

    // If in YYYY-MM-DD format, convert to DD/MM/YYYY
    if (str.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = str.split('-');
      return `${day}/${month}/${year}`;
    }

    return str;
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (step === 2) {
      handleDataChange(-1, null, null);
    }
  }, [step]);

  const fetchPrograms = () => {
    try {
      const storedPrograms = localStorage.getItem("college_programs");
      if (storedPrograms) {
        const parsedPrograms = JSON.parse(storedPrograms);
        setPrograms(parsedPrograms);
        setError("");
      } else {
        setPrograms([]);
        setError("No programs found. Please set an active college first.");
      }
    } catch (err) {
      console.error("Error reading college_programs from localStorage:", err);
      setError("Failed to load programs from local storage.");
    }
  };

  const templateHeaders = [
    "First Name", "Middle Name", "Last Name", "Program", "Phone", "E-mail Id",
    "Date of Admission", "Date of Birth", "Gender", "Blood Group", "Mother Tongue",
    "Birth Place", "Caste", "Sub Caste", "Caste Category", "Aadhaar Card",
    "Religion", "Class House", "Weight (kg)", "Native Place", "Permanent Registration No","Roll Number",
    "Admission Number", "Saral ID", "Name as per Aadhaar", "Name as per 12th Marksheet",
    "ABC ID", "University Application Number", "Primary Mobile", "Primary Relation",
    "Father First Name", "Father Last Name", "Father Mobile", "Mother First Name",
    "Mother Last Name", "Mother Mobile", "Nationality", "Address Line 1",
    "Country", "State", "City", "Pincode",
  ];

  const previewHeaders = templateHeaders;

  const handleDownloadTemplate = () => {
    const selectedProgramObj = programs.find(p => (p.program_id || p.id) === Number(selectedProgram));
    const selectedProgramName = selectedProgramObj?.program_name || "";
    const fileName = selectedProgramName ? `${selectedProgramName}_Student_BulkUpload_Template.xlsx` : "Student_BulkUpload_Template.xlsx";

    const templateData = [
      templateHeaders,
      ["", "", "", selectedProgramName, "", "", "", "", "", "", "", "", "", "", "", "", "","", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""]
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Student Template");
    XLSX.writeFile(workbook, fileName);
  };

  const handleFileChange = (e) => {
    setError("");
    const file = e.target.files[0];
    if (!file) return;

    if (!selectedProgram) {
      setError("Please select a Program before uploading a file.");
      e.target.value = null;
      return;
    }

    // Check file type
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls'].includes(fileExtension)) {
      setError("Please upload a valid Excel file (.xlsx or .xls)");
      e.target.value = null;
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const wb = XLSX.read(data, { type: "array" });

        if (!wb.SheetNames || wb.SheetNames.length === 0) {
          setError("The Excel file appears to be empty or corrupted.");
          return;
        }

        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];

        if (!ws) {
          setError("Unable to read the worksheet. Please check the file format.");
          return;
        }

        const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });

        if (!jsonData || jsonData.length === 0) {
          setError("The Excel file is empty or contains no data.");
          return;
        }

        const expectedHeaders = templateHeaders;
        const actualHeaders = jsonData[0];

        if (!actualHeaders || actualHeaders.length === 0) {
          setError("The Excel file is missing headers. Please use the official template.");
          return;
        }

        // More flexible header validation
        const headerMismatch = expectedHeaders.some((expectedHeader, index) => {
          const actualHeader = actualHeaders[index];
          return !actualHeader || actualHeader.toString().trim() !== expectedHeader.trim();
        });

        if (headerMismatch) {
          setError(`Invalid Excel template headers. Expected: ${expectedHeaders.slice(0, 5).join(', ')}... Please download and use the official template.`);
          return;
        }

        const initialParsedData = jsonData.slice(1).map((row, index) => {
          const rowData = {
            id: index,
            program_id: Number(selectedProgram),
            _error: null,
            _rawData: row
          };

          templateHeaders.forEach((header, idx) => {
            const cellValue = row[idx];

            // Handle date fields specially
            if (header === "Date of Birth" || header === "Date of Admission") {
              rowData[header] = convertExcelDate(cellValue);
            } else {
              rowData[header] = cellValue !== null && cellValue !== undefined ? String(cellValue).trim() : "";
            }
          });

          // Match program name from Excel with program ID from programs list
          const programNameFromSheet = String(rowData["Program"] || "").trim();
          const matchedProgram = programs.find(p =>
            p.program_name.trim().toLowerCase() === programNameFromSheet.toLowerCase()
          );

          // Set program_id from matched program, fallback to selectedProgram if no match
          rowData.program_id = matchedProgram
            ? (matchedProgram.program_id || matchedProgram.id)
            : Number(selectedProgram);

          rowData.name = `${rowData["First Name"] || ''} ${rowData["Middle Name"] || ''} ${rowData["Last Name"] || ''}`.trim();
          rowData.email = rowData["E-mail Id"] || "";
          rowData.mobile = rowData["Phone"] || "";
          rowData.roll_number = rowData["Roll Number"] || ""; 

          return rowData;
        }).filter(row => row.name || row.email || row.mobile);

        if (initialParsedData.length === 0) {
          setError("The uploaded file contains no valid student data.");
          return;
        }

        const emailCounts = new Map();
        const mobileCounts = new Map();
        initialParsedData.forEach(row => {
          if (row.email) emailCounts.set(String(row.email).trim().toLowerCase(), (emailCounts.get(String(row.email).trim().toLowerCase()) || 0) + 1);
          if (row.mobile) mobileCounts.set(String(row.mobile).trim(), (mobileCounts.get(String(row.mobile).trim()) || 0) + 1);
        });

        const validatedData = initialParsedData.map(row => ({
          ...row,
          _error: getRowError(row, emailCounts, mobileCounts),
        }));

        setParsedData(validatedData);
        setError("");
        setStep(2);
      } catch (err) {
        console.error("File Parsing Error:", err);
        setError(`Failed to parse the Excel file: ${err.message || 'Unknown error'}. Please ensure it's a valid .xlsx file and try downloading the template again.`);
      } finally {
        e.target.value = null;
      }
    };

    reader.onerror = () => {
      setError("Failed to read the file. Please try again.");
      e.target.value = null;
    };

    reader.readAsArrayBuffer(file);
  };

  const getRowError = (row, emailCounts, mobileCounts) => {
    const selectedProgramObject = programs.find(p => (p.program_id || p.id) === Number(selectedProgram));
    const missingFields = [];

    // Check required fields
    if (!row["First Name"]?.trim()) missingFields.push("First Name");
    if (!row["Last Name"]?.trim()) missingFields.push("Last Name");
    if (!row["E-mail Id"]?.trim()) missingFields.push("E-mail Id");
    if (!row["Phone"]?.trim()) missingFields.push("Phone");
    if (!row["Date of Birth"]?.trim()) missingFields.push("Date of Birth");
    if (!row["Gender"]?.trim()) missingFields.push("Gender");
    if (!row["Permanent Registration No"]?.trim()) missingFields.push("Permanent Registration No");
    if (!row["Admission Number"]?.trim()) missingFields.push("Admission Number");
    if (!row["Address Line 1"]?.trim()) missingFields.push("Address Line 1");
    if (!row["Country"]?.trim()) missingFields.push("Country");
    if (!row["State"]?.trim()) missingFields.push("State");
    if (!row["City"]?.trim()) missingFields.push("City");
    if (!row["Pincode"]?.trim()) missingFields.push("Pincode");
    if (!row["Aadhaar Card"]?.trim()) missingFields.push("Aadhaar Card");
    if (!row["Gender"]?.trim()) missingFields.push("Gender");

    // Show missing fields error first
    if (missingFields.length > 0) {
      return `Missing required fields: ${missingFields.join(", ")}`;
    }

    // Program validation
    if (selectedProgramObject && row["Program"]) {
      const expectedProgramName = selectedProgramObject.program_name.trim().toLowerCase();
      const rowProgramName = String(row["Program"]).trim().toLowerCase();
      if (rowProgramName && rowProgramName !== expectedProgramName) {
        return `Invalid Program. Expected '${selectedProgramObject.program_name}', but found '${row["Program"]}'.`;
      }
    }

    // Email validation
    if (row.email && !/\S+@\S+\.\S+/.test(row.email)) {
      return "Invalid email format.";
    }

    // Duplicate validation
    if (row.email && emailCounts.get(String(row.email).trim().toLowerCase()) > 1) {
      return `Duplicate Email: "${row.email}" exists multiple times in the file.`;
    }
    if (row.mobile && mobileCounts.get(String(row.mobile).trim()) > 1) {
      return `Duplicate Mobile: "${row.mobile}" exists multiple times in the file.`;
    }
    const gender = row["Gender"].toString().trim().toUpperCase();
    if (!["MALE", "FEMALE", "OTHER"].includes(gender)) {
      return `Invalid Gender '${row["Gender"]}'. Allowed: MALE, FEMALE, OTHER.`;
    }

    return null;
  };

  const handleDataChange = (id, field, value) => {
    setParsedData(prevData => {
      const newData = id === -1
        ? [...prevData]
        : prevData.map(row => {
          if (row.id === id) {
            const updatedRow = { ...row, [field]: value };
            if (field === "Gender" && value) { updatedRow[field] = value.toString().toUpperCase(); }
            updatedRow.name = `${updatedRow["First Name"] || ''} ${updatedRow["Middle Name"] || ''} ${updatedRow["Last Name"] || ''}`.trim();
            updatedRow.email = updatedRow["E-mail Id"] || "";
            updatedRow.mobile = updatedRow["Phone"] || "";
            return updatedRow;
          }
          return row;
        });

      const emailCounts = new Map();
      const mobileCounts = new Map();
      newData.forEach(row => {
        if (row.email) {
          const email = String(row.email).trim().toLowerCase();
          emailCounts.set(email, (emailCounts.get(email) || 0) + 1);
        }
        if (row.mobile) {
          const mobile = String(row.mobile).trim();
          mobileCounts.set(mobile, (mobileCounts.get(mobile) || 0) + 1);
        }
      });

      return newData.map(row => ({
        ...row,
        _error: getRowError(row, emailCounts, mobileCounts),
      }));
    });
  };


  const handleDropRow = (id) => {
    setParsedData(prevData => {
      const newParsedData = prevData.filter(row => row.id !== id);
      const emailCounts = new Map();
      const mobileCounts = new Map();
      newParsedData.forEach(row => {
        if (row.email) emailCounts.set(String(row.email).trim().toLowerCase(), (emailCounts.get(String(row.email).trim().toLowerCase()) || 0) + 1);
        if (row.mobile) mobileCounts.set(String(row.mobile).trim(), (mobileCounts.get(String(row.mobile).trim()) || 0) + 1);
      });

      return newParsedData.map(row => ({
        ...row,
        _error: getRowError(row, emailCounts, mobileCounts),
      }));
    });
  };

  // Validate payload data
  const validatePayload = (data, index) => {
    const errors = [];
    const studentName = `${data["First Name"]} ${data["Last Name"]}`.trim();

    // Required field validation
    if (!data["First Name"]?.trim()) errors.push("First Name is required");
    if (!data["Last Name"]?.trim()) errors.push("Last Name is required");
    if (!data["E-mail Id"]?.trim()) errors.push("Email is required");
    if (!data["Phone"]?.trim()) errors.push("Phone is required");
    if (!data["Date of Birth"]?.trim()) errors.push("Date of Birth is required");
    if (!data["Gender"]?.trim()) errors.push("Gender is required");
    if (!data["Permanent Registration No"]?.trim()) errors.push("Permanent Registration Number is required");
    if (!data["Admission Number"]?.trim()) errors.push("Admission Number is required");

    // Date validation
    if (data["Date of Birth"]) {
      const dobStr = String(data["Date of Birth"]).trim();
      const dobParts = dobStr.includes('/') ? dobStr.split('/') : dobStr.split('-');
      let day, month, year;
      if (dobParts.length === 3) {
        if (dobParts[0].length <= 2 && dobParts[1].length <= 2) {
          [day, month, year] = dobParts;
        } else {
          [year, month, day] = dobParts;
        }
        const dob = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
        if (isNaN(dob.getTime())) {
          errors.push("Invalid Date of Birth format");
        }
      } else {
        errors.push("Invalid Date of Birth format");
      }
    }

    if (data["Date of Admission"]) {
      try {
        const doa = new Date(data["Date of Admission"]);
        if (isNaN(doa.getTime())) {
          errors.push("Invalid Date of Admission format");
        }
      } catch (e) {
        errors.push("Invalid Date of Admission format");
      }
    }

    // Email format validation
    if (data["E-mail Id"] && !/\S+@\S+\.\S+/.test(data["E-mail Id"])) {
      errors.push("Invalid email format");
    }

    return {
      isValid: errors.length === 0,
      errors,
      studentName,
      rowIndex: index + 1
    };
  };

  const parseToISO = (dateStr) => {
    if (!dateStr) return "";
    const str = String(dateStr).trim();
    if (!str) return "";

    if (str.includes('/')) {
      const [day, month, year] = str.split('/');
      if (!year || !month || !day) return "";
      const iso = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      const d = new Date(iso);
      return isNaN(d.getTime()) ? "" : d.toISOString();
    }
    if (str.includes('-') && /^\d{2}-\d{2}-\d{4}$/.test(str)) {
      const [day, month, year] = str.split('-');
      if (!year || !month || !day) return "";
      const iso = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      const d = new Date(iso);
      return isNaN(d.getTime()) ? "" : d.toISOString();
    }

    const d = new Date(str);
    return isNaN(d.getTime()) ? "" : d.toISOString();
  };

  // FINAL handleSubmit with enhanced error handling
  const handleSubmit = async () => {
    const validData = parsedData.filter(d => !d._error);

    if (validData.length === 0) {
      setError("No valid data to submit. Please correct the errors or upload a new file.");
      return;
    }

    // Validate all payloads before submission
    const validationResults = validData.map((d, index) => validatePayload(d, index));
    const invalidPayloads = validationResults.filter(result => !result.isValid);

    if (invalidPayloads.length > 0) {
      const errorMessages = invalidPayloads.map(result =>
        `Row ${result.rowIndex} (${result.studentName}): ${result.errors.join(", ")}`
      ).join("\n");

      setError(`Validation failed for ${invalidPayloads.length} record(s):\n\n${errorMessages}`);
      return;
    }

    try {
      const payloads = validData.map(d => ({
        id: null,
        program_id: d.program_id,
        userNameType: "ROLLNUMBER",
        admission_number: d["Admission Number"] || "",
        permanent_registration_number: d["Permanent Registration No"] || "",
        roll_number: d["Roll Number"] || "",
        avatar: "",
        firstname: d["First Name"] || "",
        middlename: d["Middle Name"] || "",
        lastname: d["Last Name"] || "",
        email: d["E-mail Id"] || "",
        phone: d["Primary Mobile"] || "",
        mobile: d["Phone"] || "",
        gender: d["Gender"] || "",
        height: "",
        weight: d["Weight (kg)"] ? `${d["Weight (kg)"]} kg` : "",
        previous_school_name: "",
        aadhar_number: d["Aadhaar Card"] || "",
        date_of_admission: parseToISO(d["Date of Admission"]),
        date_of_birth: parseToISO(d["Date of Birth"]),

        birthplace: d["Birth Place"] || "",
        mother_tongue: d["Mother Tongue"] || "",
        school_house: d["Class House"] || "",
        blood_group: d["Blood Group"] || "",
        nationality: d["Nationality"] || "",
        religion: d["Religion"] || "",
        caste: d["Caste"] || "",
        address_line1: d["Address Line 1"] || "",
        country: d["Country"] || "",
        state: d["State"] || "",
        city: d["City"] || "",
        pincode: d["Pincode"] || "",
        mode_of_transport: "",
        bus_number: "",
        bus_stop: "",
        driver_name: "",
        driver_phone_number: "",
        driver_avatar: "",
        batch_id: null,
        user_id: null,
        is_academic_enabled: true,
        is_vocational_enabled: false,
        is_coding_enabled: false,
        is_sport_enabled: false,
        vertical1_4_enabled: false,
        vertical2_enabled: false,
        vertical3_enabled: false,
        vertical5_enabled: false,
        vertical6_enabled: false,
        can_search_by_tag: true,
        coding_count: 0,
        saral_id: d["Saral ID"] || "",
        sub_cast: d["Sub Caste"] || "",
        cast_category: d["Caste Category"] || "",
        gr_number: "",
        name_as_per_aadhaar_card: d["Name as per Aadhaar"] || "",
        name_as_per_marksheet: d["Name as per 12th Marksheet"] || "",
        abc_id: d["ABC ID"] || "",
        university_application_form: d["University Application Number"] || "",
        native_place: d["Native Place"] || "",
        class_year: "",
        father_first_name: d["Father First Name"] || "",
        father_last_name: d["Father Last Name"] || "",
        father_contact: d["Father Mobile"] || "",
        father_email: "",
        mother_first_name: d["Mother First Name"] || "",
        mother_last_name: d["Mother Last Name"] || "",
        mother_contact: d["Mother Mobile"] || "",
        mother_email: "",
        aadhaar_card: "",
        address: d["Address Line 1"] || "",
        parents_mobile: d["Primary Mobile"] || d["Phone"] || "",
        father_occupation: "",
        mother_occupation: "",
        access_attributes: [],
        education_details: []
      }));
      const options = {
        userNameType,
        ...(prefix && { prefix }),
        ...(suffix && { suffix })
      };

      // Log payloads to verify program_id is included with each entry
      console.log('Payloads with program_id:', payloads.map(p => ({
        name: `${p.firstname} ${p.lastname}`,
        program_id: p.program_id,
        email: p.email
      })));

      setIsSubmitting(true);
      setError("");

      await bulkOnboardStudents(payloads, options);

      // Show Success Alert
      setAlertMessage(`Successfully uploaded ${validData.length} student(s)!`);
      setShowSuccess(true);
    } catch (err) {
      console.error("Submission Error:", err);

      let errorMessage = "Failed to save students. Please try again.";

      // Parse API error response
      if (err.response?.data) {
        const apiError = err.response.data;
        const status = err.response.status;

        // Handle server errors (500, 502, 503, etc.)
        if (status >= 500) {
          if (apiError.message && apiError.message.includes('bean')) {
            errorMessage = `Server Error (${status}): The server is currently experiencing issues.\n\nThis appears to be a temporary server problem. Please try again in a few moments.\n\nIf the problem persists, contact your system administrator.`;
          } else {
            errorMessage = `Server Error (${status}): ${apiError.error || 'Internal Server Error'}\n\nThe server encountered an unexpected error while processing your request.\n\nPlease try again later or contact support if the issue continues.`;
          }
        }
        // Handle duplicate/existing record errors
        else if (apiError.message && (apiError.message.includes('already exists') || apiError.message.includes('duplicate') || apiError.message.includes('UNIQUE constraint'))) {
          errorMessage = `Duplicate record found: ${apiError.message}\n\nPlease check for existing students with the same:\n• Email address\n• Phone number\n• Admission number\n• Permanent registration number`;
        }
        // Handle validation errors object
        else if (apiError.errors && typeof apiError.errors === 'object' && !Array.isArray(apiError.errors)) {
          const errorList = Object.entries(apiError.errors).map(([field, message]) => {
            // Format field names to be more user-friendly
            const friendlyField = field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            return `• ${friendlyField}: ${message}`;
          });
          errorMessage = `Validation errors:\n${errorList.join('\n')}`;
        }
        // Handle array of errors
        else if (apiError.errors && Array.isArray(apiError.errors)) {
          errorMessage = `Multiple errors found:\n${apiError.errors.map(err => `• ${err}`).join('\n')}`;
        }
        // Handle failed request with details
        else if (apiError.failed_request) {
          const failedData = apiError.failed_request;
          const studentName = `${failedData.firstname || ''} ${failedData.lastname || ''}`.trim();
          errorMessage = `Failed to create student record${studentName ? ` for ${studentName}` : ''}:\n\nThis could be due to:\n• Duplicate email: ${failedData.email || 'N/A'}\n• Duplicate phone: ${failedData.mobile || 'N/A'}\n• Duplicate admission number: ${failedData.admission_number || 'N/A'}\n• Duplicate registration number: ${failedData.permanent_registration_number || 'N/A'}\n\nPlease check if this student already exists in the system.`;
        }
        // Handle simple string messages
        else if (typeof apiError === 'string') {
          errorMessage = apiError;
        }
        // Handle message field
        else if (apiError.message) {
          errorMessage = apiError.message;
        }
        // Handle error field
        else if (apiError.error) {
          errorMessage = apiError.error;
        }
      }
      // Handle network errors
      else if (err.code === 'NETWORK_ERROR' || err.message.includes('Network Error')) {
        errorMessage = "Network Error: Unable to connect to the server.\n\nPlease check your internet connection and try again.";
      }
      // Handle timeout errors
      else if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        errorMessage = "Request Timeout: The server took too long to respond.\n\nThis might be due to a large file or server load. Please try again.";
      }
      // Handle other errors
      else if (err.message) {
        errorMessage = err.message;
      }

      setAlertMessage(errorMessage);
      setShowError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const validRecordCount = parsedData.filter(row => !row._error).length;

  return (
    <>
      {/* SweetAlert Success */}
      {showSuccess && (
        <SweetAlert
          success
          title="Upload Successful!"
          onConfirm={() => {
            setShowSuccess(false);
            onSuccess();        // Refresh parent
            onClose();          // Close modal
          }}
          confirmBtnText="OK"
          confirmBtnBsStyle="success"
          confirmBtnCssClass="btn-confirm"
        >
          {alertMessage}
        </SweetAlert>
      )}

      {/* SweetAlert Error */}
      {showError && (
        <SweetAlert
          error
          title="Upload Failed"
          onConfirm={() => setShowError(false)}
          confirmBtnText="Try Again"
          confirmBtnBsStyle="danger"
          confirmBtnCssClass="btn-confirm"
        >
          {alertMessage}
        </SweetAlert>
      )}

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
        <div className={`bg-white rounded-2xl shadow-2xl animate-slideUp ${step === 2 || step === 3 ? 'w-[95%] max-w-7xl' :
            step === 4 ? 'w-[90%] max-w-4xl' :
              'w-[90%] max-w-2xl'
          }`}>
          {/* Header */}
          <div className="p-6 border-b border-gray-200 flex justify-between items-center text-white rounded-t-xl" style={{ backgroundColor: primaryBlue }}>
            <h2 className="text-2xl font-bold">Bulk Upload Students</h2>
            <button onClick={onClose} className="text-white/80 hover:text-white text-2xl font-bold transition-colors">×</button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[80vh]">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative mb-4 flex items-start" role="alert">
                <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                <div className="whitespace-pre-line">{error}</div>
              </div>
            )}

            {/* Step 1 */}
            {step === 1 && (
              <div className="space-y-8">
                <div className="max-w-md mx-auto">
                  <h3 className="text-xl font-semibold mb-3 text-center text-gray-800">Step 1: Select Program</h3>
                  <p className="text-gray-600 mb-4 text-center">Choose the Program for the students you are uploading.</p>

                  {/* Custom Dropdown */}
                  <div ref={dropdownRef} className="relative">
                    <div
                      className={`w-full px-4 py-3 border ${programs.length === 0
                          ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed'
                          : 'bg-white border-gray-300 cursor-pointer hover:border-blue-400'
                        } rounded-xl min-h-[48px] flex items-center justify-between transition-all duration-200 focus:ring-2 focus:ring-blue-400 shadow-sm`}
                      onClick={() => programs.length > 0 && setIsDropdownOpen(!isDropdownOpen)}
                    >
                      <span className={selectedProgram ? 'text-gray-900' : 'text-gray-400'}>
                        {selectedProgram ? programs.find(p => (p.program_id || p.id) === Number(selectedProgram))?.program_name : (programs.length > 0 ? "Select a Program" : "Loading programs...")}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : 'rotate-0'}`}
                      />
                    </div>

                    {isDropdownOpen && programs.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                        <div
                          className="px-4 py-3 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
                          onClick={() => {
                            setSelectedProgram("");
                            setIsDropdownOpen(false);
                          }}
                        >
                          Select a Program
                        </div>
                        {programs.map((program) => (
                          <div
                            key={program.program_id || program.id}
                            className="px-4 py-3 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
                            onClick={() => {
                              setSelectedProgram(program.program_id || program.id);
                              setIsDropdownOpen(false);
                            }}
                          >
                            {program.program_name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className={`text-center transition-opacity duration-300 ${selectedProgram ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">Step 2: Download & Upload</h3>
                  <p className="text-gray-600 mb-6">Download the required template, fill it completely, and then upload it here.</p>

                  <button onClick={handleDownloadTemplate} className="bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium shadow transition-all py-3 px-6 inline-flex items-center gap-2 mr-4">
                    <Download className="w-5 h-5" /> Download Template
                  </button>

                  <input id="file-upload" type="file" className="hidden" accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel" onChange={handleFileChange} disabled={!selectedProgram} />
                  <label htmlFor="file-upload" className={`cursor-pointer rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md transition-all py-3 px-6 inline-flex items-center gap-2 ${!selectedProgram ? 'bg-gray-400 hover:bg-gray-400 cursor-not-allowed' : ''}`}>
                    <Upload className="w-5 h-5" /> Upload File
                  </label>
                </div>
              </div>
            )}

            {/* Step 2 & 3: Same as before */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">Step 2: Preview Uploaded Data</h3>
                    <p className="text-gray-600">Review the data. You can edit fields directly. Rows highlighted in red will not be uploaded unless corrected or dropped.</p>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-sm max-h-[60vh] overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10 shadow-sm">
                      <tr>
                        {previewHeaders.map((header, index) => (
                          <th key={index} className="px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider min-w-[120px]">{header}</th>
                        ))}
                        <th className="px-3 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider min-w-[60px]">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {parsedData.map((row) => (
                        <React.Fragment key={row.id}>
                          <tr className={row._error ? "bg-red-50" : "hover:bg-gray-50 transition-colors"}>
                            {previewHeaders.map((header, index) => (
                              <td key={index} className="px-3 py-2 whitespace-nowrap text-sm">
                                {header === "Program" ? (
                                  <input type="text" value={row[header] || ""} readOnly className="w-full bg-gray-100 border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-600" />
                                ) : header === "Date of Birth" || header === "Date of Admission" ? (
                                  <div className="relative">
                                    <input
                                      type="date"
                                      value={formatDateForInput(row[header] || "")}
                                      onChange={(e) => handleDataChange(row.id, header, formatDateForDisplay(e.target.value))}
                                      className={`w-full border rounded-lg px-3 py-2 text-sm transition-all duration-200 ${row._error ? 'border-red-400 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} focus:outline-none focus:ring-2`}
                                    />
                                    {/* <Calendar className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" /> */}
                                  </div>
                                ) : (
                                  <input
                                    type="text"
                                    value={row[header] || ""}
                                    onChange={(e) => handleDataChange(row.id, header, e.target.value)}
                                    className={`w-full border rounded-lg px-3 py-2 text-sm transition-all duration-200 ${row._error ? 'border-red-400 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} focus:outline-none focus:ring-2`}
                                  />
                                )}
                              </td>
                            ))}
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-center">
                              <button
                                type="button"
                                onClick={() => handleDropRow(row.id)}
                                className="bg-red-500 hover:bg-red-600 text-white text-xs font-semibold py-2 px-3 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                              >
                                Drop
                              </button>
                            </td>
                          </tr>
                          {row._error && (
                            <tr className="bg-red-100/50">
                              <td colSpan={previewHeaders.length + 1} className="px-3 py-1 text-xs text-red-700 italic border-t border-red-200">
                                Error: {row._error}
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">Step 3: Final Review</h3>
                    <p className="text-gray-600">Review the final **{validRecordCount} valid records** before configuring username settings.</p>
                  </div>
                  <button onClick={() => setStep(2)} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-all">
                    Back to Edit
                  </button>
                </div>

                <div className="bg-blue-50 p-4 rounded-xl mb-4 shadow-inner">
                  <h4 className="font-bold text-blue-800 mb-3 text-lg">Upload Summary</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div><span className="text-gray-600 font-medium">Total Records:</span><span className="font-semibold text-gray-800 block">{parsedData.length}</span></div>
                    <div><span className="text-gray-600 font-medium">Valid Records:</span><span className="font-bold block text-green-600">{validRecordCount}</span></div>
                    <div><span className="text-gray-600 font-medium">Error/Skipped:</span><span className="font-bold block text-red-600">{parsedData.filter(row => row._error).length}</span></div>
                    <div><span className="text-gray-600 font-medium">Program:</span><span className="font-semibold text-blue-800 block">{programs.find(p => (p.program_id || p.id) === Number(selectedProgram))?.program_name}</span></div>
                  </div>
                </div>

                {/* Final Table */}
                <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-sm max-h-[60vh] overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0">
                      <tr>
                        {previewHeaders.map((header, index) => (
                          <th key={index} className="px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">{header}</th>
                        ))}
                        <th className="px-3 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {parsedData.map((row) => (
                        <tr key={row.id} className={row._error ? "bg-red-50" : "hover:bg-gray-50 transition-colors"}>
                          {previewHeaders.map((header, index) => (
                            <td key={index} className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                              {row[header] || ""}
                            </td>
                          ))}
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-center">
                            {row._error ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Skipped</span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Ready</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {step === 4 && (
              <div className="space-y-8 text-center">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">Step 4: Configure Username Settings</h3>
                  <p className="text-gray-600 mt-2">Configure how usernames will be generated for students</p>
                </div>

                <div className="bg-gray-50 p-8 rounded-xl border-2 border-dashed border-gray-300 max-w-2xl mx-auto">
                  <h4 className="font-bold mb-6 text-center text-xl">Username Generation</h4>

                  <div className={`grid gap-6 mb-6 ${userNameType === "FULLNAME"
                      ? "grid-cols-1 max-w-sm mx-auto"
                      : "grid-cols-1 md:grid-cols-3"
                    }`}>
                    <div className="text-center">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Username Type</label>
                      <select
                        value={userNameType}
                        onChange={(e) => setUserNameType(e.target.value)}
                        className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="FULLNAME">Full Name</option>
                        <option value="ROLLNUMBER">Roll Number</option>
                      </select>
                    </div>

                    {/* Show prefix input only when ROLLNUMBER is selected */}
                    {userNameType === "ROLLNUMBER" && (
                      <div className="text-left">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Prefix (Optional)</label>
                        <input
                          placeholder="e.g., STU_"
                          value={prefix}
                          onChange={(e) => setPrefix(e.target.value)}
                          className="w-full px-4 py-3 border rounded-xl"
                        />
                      </div>
                    )}

                    {/* Show suffix input only when ROLLNUMBER is selected */}
                    {userNameType === "ROLLNUMBER" && (
                      <div className="text-left">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Suffix (Optional)</label>
                        <input
                          placeholder="e.g., _2025"
                          value={suffix}
                          onChange={(e) => setSuffix(e.target.value)}
                          className="w-full px-4 py-3 border rounded-xl"
                        />
                      </div>
                    )}
                  </div>

                </div>

              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 flex justify-center gap-3 rounded-b-xl">
            <button onClick={onClose} className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-200 transition-all font-medium">Cancel</button>

            {step === 2 && (
              <button
                onClick={() => setStep(3)}
                disabled={parsedData.length === 0}
                style={{ backgroundColor: parsedData.length === 0 ? undefined : primaryBlue }}
                className={`font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg inline-flex items-center gap-2 text-white ${parsedData.length === 0
                    ? "bg-gray-400 cursor-not-allowed text-gray-700"
                    : "hover:bg-[rgb(29_88_173)]"
                  }`}
              >
                Continue to Review ({validRecordCount} valid)
              </button>
            )}

            {step === 3 && (
              <button
                onClick={() => setStep(4)}
                disabled={validRecordCount === 0}
                style={{ backgroundColor: validRecordCount === 0 ? undefined : primaryBlue }}
                className={`font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg inline-flex items-center gap-2 text-white ${validRecordCount === 0
                    ? "bg-gray-400 cursor-not-allowed text-gray-700"
                    : "hover:bg-[rgb(29_88_173)]"
                  }`}
              >
                Configure Username Settings
              </button>
            )}

            {step === 4 && (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || validRecordCount === 0}
                style={{ backgroundColor: isSubmitting || validRecordCount === 0 ? undefined : primaryBlue }}
                className={`font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg inline-flex items-center gap-2 text-white ${isSubmitting || validRecordCount === 0
                    ? "bg-gray-400 cursor-not-allowed text-gray-700"
                    : "hover:bg-[rgb(29_88_173)]"
                  }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  `Submit ${validRecordCount} Students`
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}