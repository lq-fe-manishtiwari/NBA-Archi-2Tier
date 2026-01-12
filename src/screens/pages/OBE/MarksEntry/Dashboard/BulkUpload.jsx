import React, { useState, useEffect } from "react";
import Select from "react-select";
import * as XLSX from 'xlsx';
import { collegeService } from "../../../Academics/Services/college.service.js";
import { classService } from "../../../Academics/Services/class.service.js";
import { courseService } from "../../../Courses/Services/courses.service";
import { AttainmentConfigService } from "../../Services/attainment-config.service.js";
import { AcademicService } from "../../../Academics/Services/Academic.service.js";
import { COService } from "../../Settings/Services/co.service.js";
import { MarksEntryService } from "../../Services/marks-entry.service.js";
import { toast } from "react-toastify";
import Swal from 'sweetalert2';

const BulkUpload = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedExamType, setSelectedExamType] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [classOptions, setClassOptions] = useState([]);
  const [semesterOptions, setSemesterOptions] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [tools, setTools] = useState([]);
  const [coOptions, setCOOptions] = useState([]);
  const [selectedTool, setSelectedTool] = useState(null);
  const [selectedCO, setSelectedCO] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [parsedData, setParsedData] = useState([]);

  const [values, setValues] = useState({
    program_id: "",
    class_id: "",
    semester_id: "",
    course_id: "",
    tool_id: "",
    batch_id: "",
    co_id: "",
  });

  useEffect(() => {
    fetchPrograms();
    fetchCourses();
    fetchAcademicYears();
  }, []);

  const fetchPrograms = async () => {
    try {
      const data = await collegeService.getAllprogram();
      setPrograms(data || []);
    } catch (err) {
      console.error("Failed to fetch programs:", err);
    }
  };

  useEffect(() => {
  if (programs.length > 0) {
    const storedProgramId = localStorage.getItem("selectedOBEprogram");
    console.log("accept data from local storage", storedProgramId);

    if (storedProgramId) {
      // Compare as strings
      const programObj = programs.find(
        p => p.program_id.toString() === storedProgramId
      );

      if (programObj) {
        setSelectedProgram({
          label: programObj.program_name,
          value: programObj.program_id.toString(), // store as string
        });
        setValues(v => ({ ...v, program_id: programObj.program_id.toString() }));
        fetchClasses(programObj.program_id.toString());
      }
    }
  }
}, [programs]);


  const fetchClasses = async (programId) => {
    try {
      const res = await classService.getAllClasses(programId);
      setClassOptions(Array.isArray(res) ? res : [res].filter(Boolean));
    } catch (err) {
      console.error(err);
      setClassOptions([]);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await courseService.getAllCourses();
      setCourseOptions(res?.data || res || []);
    } catch (err) {
      console.error("Failed to fetch courses:", err);
    }
  };

  const fetchToolsByExamType = async (examType, subjectId) => {
    if (!subjectId) {
      setTools([]);
      return;
    }

    try {
      let toolsData;
      if (examType === "external") {
        toolsData = await AttainmentConfigService.getExternalConfigBySubject(subjectId);
      } else if (examType === "internal") {
        toolsData = await AttainmentConfigService.getInternalConfigBySubject(subjectId);
      }
      setTools(toolsData || []);
    } catch (err) {
      console.error("Failed to fetch tools:", err);
      setTools([]);
    }
  };

  const fetchAcademicYears = async () => {
    try {
      const response = await AcademicService.getAcademic();
      setAcademicYears(response || []);
    } catch (err) {
      console.error("Failed to fetch academic years:", err);
    }
  };

  const fetchCOsBySemesterAndCourse = async (semesterId, courseId) => {
    if (!semesterId || !courseId) {
      setCOOptions([]);
      return;
    }

    try {
      const coData = await COService.getCOBySemCourseId(semesterId, courseId);
      setCOOptions(coData || []);
    } catch (err) {
      console.error("Failed to fetch COs:", err);
      setCOOptions([]);
    }
  };

  const examTypeOptions = [
    { label: "Internal", value: "internal" },
    { label: "External", value: "external" },
  ];

  const validateForm = () => {
  let newErrors = {};

  if (!values.program_id) newErrors.program_id = "Program is required";
  if (!values.class_id) newErrors.class_id = "Class is required";
  if (!values.semester_id) newErrors.semester_id = "Semester is required";
  if (!values.course_id) newErrors.course_id = "Course is required";
  if (!selectedExamType) newErrors.examType = "Exam Type is required";
  if (!values.tool_id) newErrors.tool_id = "Tool is required";

  if (selectedExamType?.value === "internal" && !values.co_id) {
    newErrors.co_id = "CO is required for internal exam";
  }

  if (!selectedFile) newErrors.file = "File is required";
  if (selectedFile && parsedData.length === 0) newErrors.file = "Invalid file or no data found in the file";

  setErrors(newErrors);

  return Object.keys(newErrors).length === 0;
};


  /* -------------------------------------------
      HANDLERS
  ------------------------------------------- */

  const handleUpload = async () => {
    if (!validateForm()) {
      toast.error("Please fix the validation errors!");
      return;
    }

    if (parsedData.length === 0) {
      toast.error("No data to upload. Please select a valid Excel file.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        program_id: parseInt(values.program_id),
        subject_id: parseInt(values.course_id),
        academic_year_id: values.batch_id ? parseInt(values.batch_id) : null,
        class_year_id: parseInt(values.class_id),
        semester_id: parseInt(values.semester_id),
        exam_name: selectedTool?.label || 'Internal Assessment Exam',
        exam_type: selectedExamType.value.toUpperCase(),
        assessment_type: selectedTool?.assessment_tool || 'DIRECT',
        tool_name: selectedTool?.name || selectedTool?.tool_name || selectedTool?.assessment_tool || '',
        co_code: selectedExamType.value === "internal" ? selectedCO?.co_code : null,
        internal_config_id: selectedExamType.value === "internal" ? parseInt(values.tool_id) : null,
        students: parsedData
      };

      const response = await MarksEntryService.bulkSave(payload);

      Swal.fire('Success', `${response.message || 'Marks uploaded successfully'} (${parsedData.length} records processed)`, 'success');
      setShowModal(false);
      setSelectedFile(null);
      setParsedData([]);
      setValues({
        program_id: "",
        class_id: "",
        semester_id: "",
        course_id: "",
        tool_id: "",
        batch_id: "",
        co_id: "",
      });
      setSelectedExamType(null);
      setSelectedTool(null);
      setSelectedCO(null);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || "Failed to upload marks");
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = async () => {
    try {
      const response = await MarksEntryService.getMarksTemplate();

      // Backend returns a BLOB (Excel file)
      const blob = new Blob([response], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "marks_upload_template.xlsx";
      link.click();

      window.URL.revokeObjectURL(url);

      toast.success("Template downloaded successfully!");
    } catch (error) {
      console.error("Template download failed:", error);
      toast.error("Failed to download template");
    }
  };

  const parseExcel = async (file) => {
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Assuming first row is headers, skip it
      const headers = jsonData[0];
      const rows = jsonData.slice(1);

      const students = rows.map(row => ({
        student_name: row[1] || '',
        roll_number: row[2] || '',
        ern_number: row[3] || '',
        total_marks: parseFloat(row[4]) || 0,
        marks_obtained: parseFloat(row[5]) || 0,
        status: row[6] || 'P'
      }));

      setParsedData(students);
    } catch (error) {
      console.error('Error parsing Excel:', error);
      toast.error('Failed to parse Excel file');
      setParsedData([]);
    }
  };


  /* -------------------------------------------
      JSX UI
  ------------------------------------------- */
  return (
    <div className="w-full p-4">
      {/* Trigger Button */}
      <div className="flex justify-end">
        <button
          className="bg-primary-600 text-white px-4 py-2 rounded-md shadow"
          onClick={() => setShowModal(true)}
        >
          Bulk Upload
        </button>
      </div>

      {/* ====================== MODAL ====================== */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white w-full max-w-4xl relative shadow-2xl">

            {/* Full Blue Header (same as BulkUploadIndirect) */}
            <div className="bg-[#2563EB] w-full flex items-center justify-between px-6 py-3">
              <h3 className="text-xl font-semibold text-white">Bulk Upload</h3>
              <button
                className="text-white text-2xl hover:text-gray-200"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>

            {/* Body – rounded only at bottom */}
            <div className="p-6 bg-white rounded-b-lg max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                {/* Program */}
                <div>
                  <label className="block font-medium mb-1">Program <span className="text-red-500">*</span></label>
                  <Select
                    options={programs.map(p => ({ label: p.program_name, value: p.program_id }))}
                    value={selectedProgram}
                    onChange={(opt) => {
                      setSelectedProgram(opt);
                      setValues(v => ({ ...v, program_id: opt?.value || "", class_id: "", semester_id: "", course_id: "" }));
                      if (opt?.value) {
                        fetchClasses(opt.value);
                      }
                      setTools([]);
                    }}
                    placeholder="Select Program"
                    isClearable
                  />
                  {errors.program_id && (
  <p className="text-red-500 text-sm mt-1">{errors.program_id}</p>
)}
                </div>

                {/* Class */}
                <div>
                  <label className="block font-medium mb-1">Class <span className="text-red-500">*</span></label>
                  <Select
                    options={classOptions.map(c => ({ label: c.name, value: c.class_year_id }))}
                    onChange={(opt) => {
                      setValues(v => ({ ...v, class_id: opt?.value || "", semester_id: "", course_id: "" }));
                      const classObj = classOptions.find(c => c.class_year_id === opt?.value);
                      setSemesterOptions(classObj?.semesters || []);
                    }}
                    isDisabled={!values.program_id}
                    placeholder="Select Class"
                    isClearable
                  />
                  {errors.class_id && (
  <p className="text-red-500 text-sm mt-1">{errors.class_id}</p>
)}
                </div>

                {/* Academic Year */}
                <div>
                  <label className="block font-medium mb-1">Academic Year</label>
                  <Select
                    options={academicYears.map(ay => ({ label: ay.year, value: ay.id }))}
                    onChange={(opt) => setValues(v => ({ ...v, batch_id: opt?.value || "" }))}
                    placeholder="Select Academic Year"
                    isClearable
                  />
                </div>

                {/* Semester */}
                <div>
                  <label className="block font-medium mb-1">Semester <span className="text-red-500">*</span></label>
                  <Select
                    options={semesterOptions.map(s => ({ label: s.name, value: s.semester_id }))}
                    onChange={(opt) => {
                      setValues(v => ({ ...v, semester_id: opt?.value || "", course_id: "" }));
                      setTools([]);
                    }}
                    isDisabled={!values.class_id}
                    placeholder="Select Semester"
                    isClearable
                  />
                  {errors.semester_id && (
  <p className="text-red-500 text-sm mt-1">{errors.semester_id}</p>
)}
                </div>

                {/* Course */}
                <div>
                  <label className="block font-medium mb-1">Course <span className="text-red-500">*</span></label>
                  <Select
                    options={courseOptions.map(c => ({ label: c.name || c.subject_name, value: c.subject_id }))}
                    onChange={(opt) => {
                      setValues(v => ({ ...v, course_id: opt?.value || "", tool_id: "", co_id: "" }));
                      setTools([]);
                      setCOOptions([]);
                      if (selectedExamType?.value && opt?.value) {
                        fetchToolsByExamType(selectedExamType.value, opt.value);
                      }
                      if (values.semester_id && opt?.value) {
                        fetchCOsBySemesterAndCourse(values.semester_id, opt.value);
                      }
                    }}
                    isDisabled={!values.semester_id}
                    placeholder="Select Course"
                    isClearable
                  />
                  {errors.course_id && (
  <p className="text-red-500 text-sm mt-1">{errors.course_id}</p>
)}
                </div>

                {/* Exam Type */}
                <div>
                  <label className="block font-medium mb-1">Exam Type <span className="text-red-500">*</span></label>
                  <Select
                    options={examTypeOptions}
                    value={selectedExamType}
                    onChange={(opt) => {
                      setSelectedExamType(opt);
                      setValues(v => ({ ...v, tool_id: "" }));
                      if (opt?.value && values.course_id) {
                        fetchToolsByExamType(opt.value, values.course_id);
                      } else {
                        setTools([]);
                      }
                    }}
                    isDisabled={!values.course_id}
                    placeholder="Select Exam Type"
                    isClearable
                  />
                  {errors.examType && (
  <p className="text-red-500 text-sm mt-1">{errors.examType}</p>
)}
                </div>

                {/* Tool */}
                <div>
                  <label className="block font-medium mb-1">Select Tool <span className="text-red-500">*</span></label>
                  <Select
                    options={tools.map(t => ({
                      label: t.name || t.tool_name || t.assessment_tool,
                      value: t.nba_external_config_id || t.nba_internal_config_id || t.tool_id || t.id || t.config_id
                    }))}
                    onChange={(opt) => {
                      setValues(v => ({ ...v, tool_id: opt?.value || "" }));
                      const tool = tools.find(t => (t.nba_external_config_id || t.nba_internal_config_id || t.tool_id || t.id || t.config_id) === opt?.value);
                      setSelectedTool(tool);
                    }}
                    placeholder="Select Tool"
                    isClearable
                    isDisabled={!selectedExamType || !values.course_id}
                  />
                  {errors.tool_id && (
  <p className="text-red-500 text-sm mt-1">{errors.tool_id}</p>
)}
                </div>

                {/* CO – only for Internal */}
                {selectedExamType?.value === "internal" && (
                  <div>
                    <label className="block font-medium mb-1">Select CO <span className="text-red-500">*</span></label>
                    <Select
                      options={coOptions.map(co => ({
                        label: `${co.co_code} - ${co.co_statement}`,
                        value: co.co_id
                      }))}
                      onChange={(opt) => {
                        setValues(v => ({ ...v, co_id: opt?.value || "" }));
                        const co = coOptions.find(c => c.co_id === opt?.value);
                        setSelectedCO(co);
                      }}
                      isDisabled={!values.course_id || !values.semester_id}
                      placeholder="Select CO"
                      isClearable
                    />
                    {errors.co_id && (
  <p className="text-red-500 text-sm mt-1">{errors.co_id}</p>
)}
                  </div>
                )}
              </div>

              {/* Download Template & File Upload */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-3">
                  <label className="block font-medium">Upload Marks <span className="text-red-500">*</span></label>
                  <button
                    type="button"
                    onClick={downloadTemplate}
                    className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 flex items-center gap-2"
                  >
                    <i className="fa-solid fa-download"></i>
                    Download Template
                  </button>

                </div>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  className="block w-full border border-gray-300 rounded p-2"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setSelectedFile(file);
                    if (file) {
                      parseExcel(file);
                    } else {
                      setParsedData([]);
                    }
                  }}
                />
                {errors.file && (
  <p className="text-red-500 text-sm mt-1">{errors.file}</p>
)}
                {selectedFile && (
                  <div className="mt-2 flex items-center justify-between p-3 bg-gray-50 rounded border">
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-file-excel text-green-600"></i>
                      <span className="text-sm font-medium">{selectedFile.name}</span>
                      <span className="text-xs text-gray-500">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const url = URL.createObjectURL(selectedFile);
                        window.open(url, '_blank');
                      }}
                      className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 flex items-center gap-1"
                    >
                      <i className="fa-solid fa-eye"></i>
                      View
                    </button>
                  </div>
                )}
              </div>

              {/* Preview Table */}
              {parsedData.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold mb-3">Preview Data</h4>
                  <div className="overflow-x-auto max-h-64 border border-gray-300 rounded">
                    <table className="min-w-full bg-white">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll Number</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ERN Number</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Marks</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks Obtained</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {parsedData.map((student, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{student.roll_number}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{student.student_name}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{student.ern_number}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{student.total_marks}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{student.marks_obtained}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{student.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">Total records: {parsedData.length}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-8">
                <button
                  type="button"
                  className="px-5 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  onClick={handleUpload}
                  disabled={loading}
                >
                  {loading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkUpload;