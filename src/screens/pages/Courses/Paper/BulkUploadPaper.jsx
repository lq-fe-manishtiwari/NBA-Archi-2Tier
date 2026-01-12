import React, { useState, useEffect, useRef } from "react";
import { X, Upload, FileDown, ChevronDown } from "lucide-react";
import * as XLSX from "xlsx";
import SweetAlert from "react-bootstrap-sweetalert";
import { courseService } from "../../Courses/Services/courses.service";
import { fetchClassesByprogram } from "../../Student/Services/student.service.js";
import { useNavigate } from "react-router-dom";

export default function BulkUploadPaperModal({ onClose, onSuccess, setAlert }) {
  // Debug props on mount
  useEffect(() => {
    console.log("Modal props:", {
      onClose: typeof onClose,
      onSuccess: typeof onSuccess,
      setAlert: typeof setAlert,
    });
  }, [onClose, onSuccess, setAlert]);

  const navigate = useNavigate();

  // --- Global Upload Mode ---
  const [isGlobal, setIsGlobal] = useState(false);

  const [parsedData, setParsedData] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // --- Program dropdown ---
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState("");
  const [isProgramOpen, setIsProgramOpen] = useState(false);
  const programRef = useRef(null);

  // --- Class dropdown ---
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [isClassOpen, setIsClassOpen] = useState(false);
  const classRef = useRef(null);

  // --- Semester dropdown ---
  const [semesterOptions, setSemesterOptions] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState("");
  const [isSemesterOpen, setIsSemesterOpen] = useState(false);
  const semesterRef = useRef(null);

  // --- Lookup data ---
  const [paperModes, setPaperModes] = useState([]);
  const [paperTypes, setPaperTypes] = useState([]);
  const [verticals, setVerticals] = useState([]);
  const [specializations, setSpecializations] = useState([]);

  const primaryBlue = "rgb(33 98 193)";

  useEffect(() => {
    fetchPrograms();
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (programRef.current && !programRef.current.contains(event.target)) {
        setIsProgramOpen(false);
      }
      if (classRef.current && !classRef.current.contains(event.target)) {
        setIsClassOpen(false);
      }
      if (semesterRef.current && !semesterRef.current.contains(event.target)) {
        setIsSemesterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch classes when program changes
  useEffect(() => {
    const loadProgramDeps = async () => {
      if (!selectedProgram) {
        setFilteredClasses([]);
        setSelectedClass("");
        setSemesterOptions([]);
        setSelectedSemester("");
        return;
      }
      try {
        const res = await fetchClassesByprogram(Number(selectedProgram));
        if (!Array.isArray(res)) {
          console.error("Expected array but got:", res);
          setFilteredClasses([]);
          setError("Failed to load classes for this program.");
        } else {
          const formattedClasses = res.map((cls) => ({
            label:
              cls.class_year_name ||
              cls.class_name ||
              cls.name ||
              `Class ${cls.id || cls.class_id}`,
            value:
              cls.class_year_id ||
              cls.program_class_year_id ||
              cls.class_id ||
              cls.id,
            full: cls,
          }));
          setFilteredClasses(formattedClasses);
          setError("");
        }

        setSelectedClass("");
        setSemesterOptions([]);
        setSelectedSemester("");
      } catch (err) {
        console.error("Failed to fetch program dependencies", err);
        setFilteredClasses([]);
        setSelectedClass("");
        setSemesterOptions([]);
        setSelectedSemester("");
        setError("Failed to load data for this program. Please try again.");
      }
    };
    loadProgramDeps();
  }, [selectedProgram]);

  // Compute semesters from selected class
  useEffect(() => {
    if (!selectedClass) {
      setSemesterOptions([]);
      setSelectedSemester("");
      return;
    }
    const cls = filteredClasses.find((c) => c.value === Number(selectedClass));
    const semesters =
      cls?.full?.semester_divisions?.map((sem) => ({
        label: sem.semester_name,
        value: sem.semester_id,
        full: sem,
      })) || [];
    setSemesterOptions(semesters);
    setSelectedSemester("");
  }, [selectedClass, filteredClasses]);

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

  // ---------- Generic resolvers ----------
  const _norm = (v) => String(v ?? "").trim().toLowerCase();
  const _numOrNull = (v) => {
    const n = Number(v);
    return Number.isInteger(n) ? n : null;
  };

  const getEntityId = (entity, idKeys = []) => {
    for (const k of idKeys) {
      const val = entity?.[k];
      if (val !== undefined && val !== null) {
        const n = Number(val);
        if (Number.isInteger(n)) return n;
      }
    }
    if (entity?.id != null && Number.isInteger(Number(entity.id))) {
      return Number(entity.id);
    }
    return null;
  };

  const resolveTokenToId = (token, list, { idKeys = [], codeKey = "code", nameKey = "name" } = {}) => {
    const t = _norm(token);
    if (!t) return null;

    const asNum = _numOrNull(t);
    if (asNum !== null) {
      const byId = list.find((it) => getEntityId(it, idKeys) === asNum);
      if (byId) return getEntityId(byId, idKeys);
    }

    if (codeKey) {
      const byCode = list.find((it) => _norm(it?.[codeKey]) === t);
      if (byCode) return getEntityId(byCode, idKeys);
    }

    if (nameKey) {
      const byName = list.find((it) => _norm(it?.[nameKey]) === t);
      if (byName) return getEntityId(byName, idKeys);
    }

    return null;
  };

  const fetchLookupData = async () => {
    try {
      const [modesRes, typesRes, verticalsRes, specsRes] = await Promise.all([
        courseService.getCoursesSubjectMode(),
        courseService.getCoursesPaperTypes(),
        courseService.getCoursesVerticalNumbers(),
        courseService.getCoursesSpecialization(),
      ]);
      setPaperModes(Array.isArray(modesRes) ? modesRes : []);
      setPaperTypes(Array.isArray(typesRes) ? typesRes : []);
      setVerticals(Array.isArray(verticalsRes) ? verticalsRes : []);
      setSpecializations(Array.isArray(specsRes) ? specsRes : []);
      return {
        modes: Array.isArray(modesRes) ? modesRes : [],
        types: Array.isArray(typesRes) ? typesRes : [],
        verticals: Array.isArray(verticalsRes) ? verticalsRes : [],
        specializations: Array.isArray(specsRes) ? specsRes : [],
      };
    } catch (err) {
      console.error("Failed to fetch lookup data:", err);
      setError("Failed to load reference data for modes/types/etc.");
      return { modes: [], types: [], verticals: [], specializations: [] };
    }
  };

  const headers = [
    "PAPER CODE",
    "NAME",
    "PAPER MODE",
    "PAPER TYPE",
    "VERTICAL NUMBER",
    "CREDITS",
    "COLOUR CODE",
    "SPECIALIZATION",
  ];

  // Download Template
  const handleDownloadTemplate = () => {
    let fileName = "Paper_BulkUpload_Template.xlsx";

    if (!isGlobal && selectedProgram) {
      const selectedProgramObj = programs.find(
        (p) => (p.program_id || p.id) === Number(selectedProgram)
      );
      const selectedProgramName = selectedProgramObj?.program_name || "";
      fileName = selectedProgramName
        ? `${selectedProgramName}_Paper_BulkUpload_Template.xlsx`
        : fileName;
    }

    const sampleData = [headers];
    const worksheet = XLSX.utils.aoa_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    XLSX.writeFile(workbook, fileName);
  };

  // File Upload + Parse
  const handleFileChange = async (e) => {
    setError("");
    const file = e.target.files[0];
    if (!file) return;

    if (!isGlobal && !selectedProgram) {
      setError("Please select a Program or enable Global Upload before uploading.");
      e.target.value = null;
      return;
    }

    let modes = paperModes;
    let types = paperTypes;
    let verts = verticals;
    let specs = specializations;
    if (!modes.length || !types.length || !verts.length || !specs.length) {
      const lookup = await fetchLookupData();
      modes = lookup.modes;
      types = lookup.types;
      verts = lookup.verticals;
      specs = lookup.specializations;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const bstr = event.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
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
        const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
        if (!data.length) {
          setError("Empty or invalid file.");
          return;
        }

        const firstRow = Array.isArray(data[0]) ? data[0] : [];
        const fileHeaders = firstRow.map((h) => {
          if (!h) return "";
          const str = String(h).trim();
          return str.replace(/\s+/g, " ").toLowerCase();
        });

        const isHeaderMatch =
          headers.length === fileHeaders.length &&
          headers.every((h, i) => {
            const expected = h.toLowerCase().replace(/\s+/g, " ");
            const actual = (fileHeaders[i] || "").replace(/\s+/g, " ");
            return expected === actual;
          });

        if (!isHeaderMatch) {
          setError(
            `Invalid template. Expected: ${headers
              .slice(0, 4)
              .join(", ")}... Found: ${fileHeaders.slice(0, 4).join(", ") || "No headers"}...`
          );
          return;
        }

        const parsed = data.slice(1).map((row, index) => {
          const paperTypeToken = row[3] ? String(row[3]).trim() : "";
          const verticalToken = row[4] ? String(row[4]).trim() : "";
          const specToken = row[7] ? String(row[7]).trim() : "";
          const rawModeTokens = row[2]
            ? String(row[2])
                .split(",")
                .map((v) => v.trim())
                .filter(Boolean)
            : [];

          const resolvedModeIds = rawModeTokens
            .map((tok) =>
              resolveTokenToId(tok, modes, {
                idKeys: ["mode_id", "id"],
                codeKey: "code",
                nameKey: "name",
              })
            )
            .filter((id) => id !== null);

          const unresolvedModes = rawModeTokens.filter(
            (tok, i) =>
              resolveTokenToId(tok, modes, {
                idKeys: ["mode_id", "id"],
                codeKey: "code",
                nameKey: "name",
              }) === null
          );

          const resolvedTypeId =
            resolveTokenToId(paperTypeToken, types, {
              idKeys: ["paper_type_id", "type_id", "id"],
              codeKey: "code",
              nameKey: "name",
            }) ?? null;

          const resolvedVerticalId =
            resolveTokenToId(verticalToken, verts, {
              idKeys: ["vertical_id", "id"],
              codeKey: "code",
              nameKey: "name",
            }) ?? null;

          const resolvedSpecId =
            resolveTokenToId(specToken, specs, {
              idKeys: ["specialization_id", "id"],
              codeKey: "code",
              nameKey: "name",
            }) ?? null;

          const rowObj = {
            id: index,
            "PAPER CODE": row[0] || "",
            NAME: row[1] || "",
            "PAPER MODE": row[2] || "",
            "PAPER TYPE": row[3] || "",
            "VERTICAL NUMBER": row[4] || "",
            CREDITS: row[5] || "",
            "COLOUR CODE": row[6] || "",
            "SPECIALIZATION": row[7] || "",

            paper_code: row[0] || "",
            name: row[1] || "",
            mode_ids: resolvedModeIds,
            _unresolvedModes: unresolvedModes,

            type_id_resolved: resolvedTypeId,
            vertical_id_resolved: resolvedVerticalId,
            specialization_id_resolved: resolvedSpecId,

            credits: row[5] || "",
            color_code: row[6] || "",
            student_limit: row[8] || "",
            _error: null,
          };

          return rowObj;
        });

        const validated = parsed.map((row) => ({
          ...row,
          _error: validateRow(row),
        }));

        setParsedData(validated);
        setError("");
      } catch (err) {
        console.error("Parsing error:", err);
        setError("Failed to parse file. Please check the format.");
      } finally {
        e.target.value = null;
      }
    };
    reader.onerror = () => {
      setError("Failed to read the file. Please try again.");
      e.target.value = null;
    };
    reader.readAsBinaryString(file);
  };

  const validateRow = (row) => {
    const get = (v) => (v ? String(v).trim() : "");
    if (!get(row["PAPER CODE"])) return "Paper code is required.";
    if (!get(row["NAME"])) return "Paper name is required.";
    if (!row["PAPER MODE"]) return "Paper mode(s) are required.";

    if (row._unresolvedModes && row._unresolvedModes.length > 0) {
      return `Unknown paper mode(s): ${row._unresolvedModes.join(", ")}`;
    }
    if (!Array.isArray(row.mode_ids) || row.mode_ids.length === 0) {
      return "At least one valid paper mode is required.";
    }

    if (!get(row["PAPER TYPE"])) return "Paper type is required.";
    if (
      _norm(row["PAPER TYPE"]) === "vertical" &&
      !get(row["VERTICAL NUMBER"])
    ) {
      return "Vertical number is required for vertical type.";
    }
    if (!get(row["CREDITS"])) return "Credits are required.";
    return null;
  };

  const handleEdit = (id, key, value) => {
    setParsedData((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        const updated = { ...row, [key]: value };

        if (key === "PAPER TYPE") {
          updated.type_id_resolved = resolveTokenToId(value, paperTypes, {
            idKeys: ["paper_type_id", "type_id", "id"],
            codeKey: "code",
            nameKey: "name",
          });
        } else if (key === "VERTICAL NUMBER") {
          updated.vertical_id_resolved = resolveTokenToId(value, verticals, {
            idKeys: ["vertical_id", "id"],
            codeKey: "code",
            nameKey: "name",
          });
        } else if (key === "SPECIALIZATION") {
          updated.specialization_id_resolved = resolveTokenToId(value, specializations, {
            idKeys: ["specialization_id", "id"],
            codeKey: "code",
            nameKey: "name",
          });
        } else if (key === "PAPER MODE") {
          const tokens = String(value)
            .split(",")
            .map((m) => m.trim())
            .filter(Boolean);
          const ids = tokens.map((t) =>
            resolveTokenToId(t, paperModes, {
              idKeys: ["mode_id", "id"],
              codeKey: "code",
              nameKey: "name",
            })
          );
          const unresolved = tokens.filter((t, i) => ids[i] == null);
          updated.mode_ids = ids.filter((id) => id != null);
          updated._unresolvedModes = unresolved;
        }

        updated._error = validateRow(updated);
        return updated;
      })
    );
  };

  const handleDropRow = (id) =>
    setParsedData((prev) => prev.filter((r) => r.id !== id));

  const handleSubmit = async () => {
    if (!isGlobal && !selectedProgram) {
      setAlert?.(
        <SweetAlert
          danger
          title="Missing Program"
          onConfirm={() => setAlert(null)}
          confirmBtnCssClass="btn-confirm"
        >
          Please select a Program or enable Global Upload.
        </SweetAlert>
      );
      return;
    }

    const validRows = parsedData.filter(
      (r) => !r._error && Array.isArray(r.mode_ids) && r.mode_ids.length > 0
    );

    if (!validRows.length) {
      setAlert?.(
        <SweetAlert
          warning
          title="No Valid Rows"
          onConfirm={() => setAlert(null)}
          confirmBtnCssClass="btn-confirm"
        >
          No valid rows found for upload. Please fix the errors and try again.
        </SweetAlert>
      );
      return;
    }

    const payload = validRows.map((r) => {
      const base = {
        subject_code: r["PAPER CODE"],
        name: r["NAME"],
        paper_code: r["PAPER CODE"],
        color_code: r["COLOUR CODE"] || "#1E90FF",
        is_nba: true,
        credits: r["CREDITS"] || "4",
        mode_ids: r.mode_ids,
        type_ids: r.type_id_resolved != null ? [Number(r.type_id_resolved)] : [],
        vertical_ids:
          r.vertical_id_resolved != null ? [Number(r.vertical_id_resolved)] : [],
        specialization_ids:
          r.specialization_id_resolved != null
            ? [Number(r.specialization_id_resolved)]
            : [],
      };

      if (!isGlobal) {
        base.program_id = Number(selectedProgram);
        base.class_year_id = selectedClass ? Number(selectedClass) : null;
        base.semester_id = selectedSemester ? Number(selectedSemester) : null;
      }

      return base;
    });

    setIsSubmitting(true);
    try {
      const res = await courseService.bulkUploadPapers(payload);
      console.log("API Response:", res);

      if (res?.status === "partial_success" && res?.failed?.length > 0) {
        const failedList = res.failed
          .map((f) => {
            const paper = f.failed_request || {};
            const name = paper.name || "Unknown";
            const code = paper.paper_code || "N/A";
            const errorMsg =
              typeof f.errors === "object"
                ? Object.values(f.errors).join(", ")
                : f.errors;
            return `• ${name} (${code}) - ${errorMsg}`;
          })
          .join("\n");

        setAlert?.(
          <SweetAlert
            warning
            title="Partial Success"
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
        onSuccess?.();
        onClose?.();
        setAlert?.(
          <SweetAlert
            success
            title="Success!"
            onConfirm={() => setAlert(null)}
            confirmBtnCssClass="btn-confirm"
          >
            {res?.message || "Papers uploaded successfully."}
          </SweetAlert>
        );
      } else {
        setAlert?.(
          <SweetAlert
            info
            title="Upload Result"
            onConfirm={() => setAlert(null)}
            confirmBtnCssClass="btn-confirm"
          >
            {JSON.stringify(res, null, 2)}
          </SweetAlert>
        );
      }
    } catch (err) {
      console.error("Submit error:", err);
      setAlert?.(
        <SweetAlert
          danger
          title="Upload Failed"
          onConfirm={() => setAlert(null)}
          confirmBtnCssClass="btn-confirm"
        >
          Failed to upload data. Please try again.
          <br />
          <br />
          <b>Error:</b> {err.message || "Unknown error"}
        </SweetAlert>
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedProgramName =
    programs.find((p) => (p.program_id || p.id) === Number(selectedProgram))
      ?.program_name || "";
  const selectedClassName =
    filteredClasses.find((c) => c.value === Number(selectedClass))?.label || "";
  const selectedSemesterName =
    semesterOptions.find((s) => s.value === Number(selectedSemester))?.label || "";

  const classDisabled = !selectedProgram || filteredClasses.length === 0;
  const semesterDisabled = !selectedClass || semesterOptions.length === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-[85%] max-w-4xl animate-slideUp">
        {/* Header */}
        <div
          className="p-6 border-b border-gray-200 flex justify-between items-center text-white rounded-t-xl"
          style={{ backgroundColor: primaryBlue }}
        >
          <h2 className="text-2xl font-bold">Bulk Upload Papers</h2>
          <button
            onClick={() => navigate("/courses/paper")}
            className="text-white hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              <div className="whitespace-pre-line">{error}</div>
            </div>
          )}

          {/* Global Upload Checkbox */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="globalUpload"
              checked={isGlobal}
              onChange={(e) => {
                const checked = e.target.checked;
                setIsGlobal(checked);
                if (checked) {
                  setSelectedProgram("");
                  setSelectedClass("");
                  setSelectedSemester("");
                  setParsedData([]);
                }
              }}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="globalUpload" className="text-sm font-medium text-gray-700">
              Global Paper
            </label>
          </div>

          {/* Program / Class / Semester (only if NOT global) */}
          {!isGlobal && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Program */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Select Program
                </label>
                <div ref={programRef} className="relative">
                  <div
                    className={`w-full px-4 py-3 border ${
                      programs.length === 0
                        ? "bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed"
                        : "bg-white border-gray-300 cursor-pointer hover:border-blue-400"
                    } rounded-xl min-h-[48px] flex items-center justify-between transition-all duration-200 focus:ring-2 focus:ring-blue-400 shadow-sm`}
                    onClick={() =>
                      programs.length > 0 && setIsProgramOpen(!isProgramOpen)
                    }
                  >
                    <span
                      className={
                        selectedProgram ? "text-gray-900" : "text-gray-400"
                      }
                    >
                      {selectedProgram
                        ? selectedProgramName
                        : programs.length > 0
                        ? "Select a Program"
                        : "Loading programs..."}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 transition-transform ${
                        isProgramOpen ? "rotate-180" : "rotate-0"
                      }`}
                    />
                  </div>
                  {isProgramOpen && programs.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      <div
                        className="px-4 py-3 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
                        onClick={() => {
                          setSelectedProgram("");
                          setIsProgramOpen(false);
                          setParsedData([]);
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
                            setIsProgramOpen(false);
                            setParsedData([]);
                          }}
                        >
                          {program.program_name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {selectedProgram && (
                  <p className="text-xs text-gray-600">
                    Selected: <span className="font-medium">{selectedProgramName}</span>
                  </p>
                )}
              </div>

              {/* Class */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Select Class
                </label>
                <div ref={classRef} className="relative">
                  <div
                    className={`w-full px-4 py-3 border ${
                      !selectedProgram
                        ? "bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed"
                        : filteredClasses.length === 0
                        ? "bg-gray-50 text-gray-500 border-gray-200"
                        : "bg-white border-gray-300 cursor-pointer hover:border-blue-400"
                    } rounded-xl min-h-[48px] flex items-center justify-between transition-all duration-200 focus:ring-2 focus:ring-blue-400 shadow-sm`}
                    onClick={() => {
                      if (!selectedProgram || filteredClasses.length === 0) return;
                      setIsClassOpen(!isClassOpen);
                    }}
                  >
                    <span
                      className={selectedClass ? "text-gray-900" : "text-gray-400"}
                    >
                      {!selectedProgram
                        ? "Select program first"
                        : filteredClasses.length === 0
                        ? "No classes found"
                        : selectedClass
                        ? selectedClassName
                        : "Select a Class"}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 transition-transform ${
                        isClassOpen ? "rotate-180" : "rotate-0"
                      }`}
                    />
                  </div>
                  {isClassOpen && filteredClasses.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      <div
                        className="px-4 py-3 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
                        onClick={() => {
                          setSelectedClass("");
                          setIsClassOpen(false);
                          setSemesterOptions([]);
                          setSelectedSemester("");
                        }}
                      >
                        (None)
                      </div>
                      {filteredClasses.map((c) => (
                        <div
                          key={c.value}
                          className="px-4 py-3 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
                          onClick={() => {
                            setSelectedClass(c.value);
                            setIsClassOpen(false);
                            setSemesterOptions([]);
                            setSelectedSemester("");
                          }}
                        >
                          {c.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {selectedClass && (
                  <p className="text-xs text-gray-600">
                    Selected: <span className="font-medium">{selectedClassName}</span>
                  </p>
                )}
              </div>

              {/* Semester */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Select Semester
                </label>
                <div ref={semesterRef} className="relative">
                  <div
                    className={`w-full px-4 py-3 border ${
                      semesterDisabled
                        ? "bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed"
                        : "bg-white border-gray-300 cursor-pointer hover:border-blue-400"
                    } rounded-xl min-h-[48px] flex items-center justify-between transition-all duration-200 focus:ring-2 focus:ring-blue-400 shadow-sm`}
                    onClick={() => {
                      if (semesterDisabled) return;
                      setIsSemesterOpen(!isSemesterOpen);
                    }}
                  >
                    <span
                      className={selectedSemester ? "text-gray-900" : "text-gray-400"}
                    >
                      {!selectedClass
                        ? "Select class first"
                        : semesterOptions.length === 0
                        ? "No semesters"
                        : selectedSemester
                        ? selectedSemesterName
                        : "Select a Semester"}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 transition-transform ${
                        isSemesterOpen ? "rotate-180" : "rotate-0"
                      }`}
                    />
                  </div>
                  {isSemesterOpen && semesterOptions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      <div
                        className="px-4 py-3 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
                        onClick={() => {
                          setSelectedSemester("");
                          setIsSemesterOpen(false);
                        }}
                      >
                        (None)
                      </div>
                      {semesterOptions.map((s) => (
                        <div
                          key={s.value}
                          className="px-4 py-3 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
                          onClick={() => {
                            setSelectedSemester(s.value);
                            setIsSemesterOpen(false);
                          }}
                        >
                          {s.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {selectedSemester && (
                  <p className="text-xs text-gray-600">
                    Selected: <span className="font-medium">{selectedSemesterName}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Upload Input */}
          <div
            className={`transition-opacity ${
              isGlobal || selectedProgram ? "opacity-100" : "opacity-60 pointer-events-none"
            }`}
          >
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Excel File
            </label>
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              disabled={!(isGlobal || selectedProgram)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            {!(isGlobal || selectedProgram) && (
              <p className="text-sm text-gray-500 mt-1">
                Select a program or enable Global Upload to enable file upload.
              </p>
            )}
          </div>

          {/* Info */}
          <div className="flex items-start bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-700 text-sm">
            Please upload only Excel files (.xlsx, .xls) with correct column names. You can also download the template below.
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

          {/* Table */}
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
                    <tr key={row.id} className={row._error ? "bg-red-50" : "bg-white"}>
                      {headers.map((key) => (
                        <td key={key} className="px-3 py-2 border-t">
                          <input
                            type="text"
                            value={row[key]}
                            onChange={(e) => handleEdit(row.id, key, e.target.value)}
                            className={`w-full border rounded px-2 py-1 text-xs ${
                              row._error ? "border-red-400" : "border-gray-300"
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

          {/* Error Summary */}
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

        {/* Footer */}
        <div className="flex justify-end border-t border-gray-200 p-5 space-x-3">
          <button
           onClick={() => navigate("/courses/paper")}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-all"
          >
            Cancel
          </button>
          <button
            disabled={
              isSubmitting ||
              parsedData.length === 0 ||
              (!isGlobal && !selectedProgram)
            }
            onClick={handleSubmit}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium shadow-md transition-all ${
              isSubmitting ||
              parsedData.length === 0 ||
              (!isGlobal && !selectedProgram)
                ? "opacity-50 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
    </div>
  );
}