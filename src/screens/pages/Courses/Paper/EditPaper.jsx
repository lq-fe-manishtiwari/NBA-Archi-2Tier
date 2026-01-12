import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { useNavigate, useParams } from "react-router-dom";
import SweetAlert from "react-bootstrap-sweetalert";
import Select from "react-select";
import { SketchPicker } from "react-color";
import { courseService } from "../Services/courses.service";
import { fetchClassesByprogram } from "../../Student/Services/student.service.js";
import { collegeService } from "../../Academics/Services/college.service.js";
import { batchService } from '../../Academics/Services/batch.Service';

/* --------------------- Custom Select Component --------------------- */
const CustomSelect = ({ label, value, onChange, options, placeholder, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        <span className="text-red-500">*</span>
      </label>
      <div
        className={`w-full px-3 py-2 border ${disabled
          ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed'
          : 'bg-white border-gray-300 cursor-pointer hover:border-blue-400'
          } rounded-md min-h-[40px] flex items-center justify-between transition-all duration-150`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={value ? 'text-gray-900' : 'text-gray-400'}>
          {value ? value.label || value : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'
            }`}
        />
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          <div
            className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
            onClick={() => handleSelect('')}
          >
            {placeholder}
          </div>
          {options.map((option, i) => (
            <div
              key={i}
              className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
              onClick={() => handleSelect(option)}
            >
              {option.label || option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const EditPaper = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [alert, setAlert] = useState(null);
  const [isDirty, setIsDirty] = useState(false);

  const [paperTypes, setPaperTypes] = useState([]);
  const [verticalNumbers, setVerticalNumbers] = useState([]);
  const [subjectModes, setSubjectModes] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [programOptions, setProgramOptions] = useState([]);
    const [classOptions, setClassOptions] = useState([]);
    const [semesterOptions, setSemesterOptions] = useState([]);
    const [batchOptions, setBatchOptions] = useState([]);

  const [formData, setFormData] = useState({
    program: null,
  class: null,
  semester: null,
  batch: null,
    paperType: "",
    vertical: "",
    openElective: "",
    paperName: "",
    studentLimit: 0,
    startDateTime: "",
    endDateTime: "",
    paperCode: "",
    credits: "",
    subjectMode: [],
    specialization: "",
    colorCode: "#000000",
  });

  const [errors, setErrors] = useState({});
  const [showCancelAlert, setShowCancelAlert] = useState(false);
  const isFetchedRef = React.useRef(false);

  useEffect(() => setAnimate(true), []);

  // Helper for date formatting
  const formatDateTime = (isoString) => {
    if (!isoString) return "";
    return isoString.slice(0, 16); // for datetime-local input
  };

  // Fetch all dropdown data + paper details
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [paperRes, verticalRes, modeRes, specRes, paperData] = await Promise.all([
          courseService.getCoursesPaperTypes(),
          courseService.getCoursesVerticalNumbers(),
          courseService.getCoursesSubjectMode(),
          courseService.getCoursesSpecialization(),
          courseService.getCourseById(id),
        ]);
  
        // 🛠 Normalize each response
        const normalize = (data) =>
          Array.isArray(data)
            ? data
            : typeof data === "object" && data !== null
            ? Object.values(data).flat()
            : [];
  
        const paperTypesArr = normalize(paperRes);
        const verticalsArr = normalize(verticalRes);
        const modesArr = normalize(modeRes);
        const specsArr = normalize(specRes);
  
        setPaperTypes(paperTypesArr);
        setVerticalNumbers(verticalsArr);
        setSubjectModes(modesArr);
        setSpecializations(specsArr);
  
        if (paperData) {

          const foundSpecialization = specsArr.find((s) => 
          s.specialization_id === paperData.specialization_id ||
          s.id === paperData.specialization_id ||
          s.name === paperData.specialization ||
          s.specialization_id === paperData.specialization
        );
        
          setFormData({
            program_id: paperData.program?.program_id || "",        
            class_year_id: paperData.class_year?.class_year_id || "",  
            paperName: paperData.name || "",
            paperType: paperData.types?.[0]?.type_id || "",
            vertical: paperData.verticals?.[0]?.vertical_id || "",
            paperCode: paperData.paper_code || "",
            studentLimit: paperData.student_limit || 0,
            startDateTime: formatDateTime(paperData.start_date_time),
            endDateTime: formatDateTime(paperData.end_date_time),
            credits: paperData.credits || "",
            subjectMode: paperData.modes?.map((m) => m.mode_id) || [],
            specialization: foundSpecialization?.specialization_id || foundSpecialization?.id || "",
            colorCode: paperData.color_code || "#000000",
          });
        }
      } catch (error) {
        console.error("Error fetching edit paper data:", error);
        setAlert(
          <SweetAlert danger title="Failed to Load Data" onConfirm={() => setAlert(null)}>
            Could not load paper details. Please try again.
          </SweetAlert>
        );
      }
    };
  
    if (!isFetchedRef.current) {
      fetchAllData();
      isFetchedRef.current = true;
    }
  }, [id]);

  useEffect(() => {
    const fetchPrograms = async () => {
      const res = await collegeService.getAllprogram();
      const formatted = res.map(p => ({
        label: p.program_name,
        value: p.program_id,
        full: p,
      }));
      setProgramOptions(formatted);
    };
    fetchPrograms();
  }, []);

  useEffect(() => {
    const loadClasses = async () => {
      if (!formData.program?.value) return;
  
      const classesRes = await fetchClassesByprogram(formData.program.value);
      const formattedClasses = classesRes.map(c => ({
        label: c.class_year_name,
        value: c.program_class_year_id,
        full: c,
      }));
      setClassOptions(formattedClasses);
  
      const batchesRes = await batchService.getBatchByProgramId(formData.program.value);
      const formattedBatches = batchesRes.map(b => ({
        label: b.batch_name,
        value: b.batch_id,
        full: b,
      }));
      setBatchOptions(formattedBatches);
    };
    loadClasses();
  }, [formData.program]);

  useEffect(() => {
    if (!formData.class?.value) return;
  
    const selectedClass = classOptions.find(cls => cls.value === formData.class.value);
    const semesters = selectedClass?.full?.semester_divisions?.map(sem => ({
      label: sem.semester_name,
      value: sem.semester_id,
      full: sem,
    })) || [];
    setSemesterOptions(semesters);
  }, [formData.class]);

  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setIsDirty(true);
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.program) errors.program = "Program is required";
if (!formData.class) errors.class = "Class is required";
if (!formData.semester) errors.semester = "Semester is required";
if (!formData.batch) errors.batch = "Batch is required";
    if (!formData.paperType) newErrors.paperType = "Paper Type is required";
    if (!formData.vertical) newErrors.vertical = "Vertical is required";
    if (!formData.paperName.trim()) newErrors.paperName = "Paper Name is required";
    if (!formData.specialization) newErrors.specialization = "Specialization is required";
    if (formData.subjectMode.length === 0) newErrors.subjectMode = "At least one Subject Mode is required";
    if (!formData.colorCode.trim()) newErrors.colorCode = "Color Code is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {

      const payload = {
        subject_id: id,
        program_id: formData.program?.value,
  class_year_id: formData.class?.value,
  semester_id: formData.semester?.value,
  batch_id: formData.batch?.value,
        subject_code: "MATH102",
        name: formData.paperName,
        color_code: formData.colorCode,
        // student_limit: formData.studentLimit.toString(),
        paper_code: formData.paperCode,
        specialization_ids: [formData.specialization],
        credits: formData.credits.toString(),
        // start_date_time: formData.startDateTime,
        // end_date_time: formData.endDateTime,
        mode_ids: formData.subjectMode,
        type_ids: [formData.paperType],
        vertical_ids: [formData.vertical],

      };

      const res = await courseService.updateCourse(id,payload);

      setAlert(
        <SweetAlert
          success
          title="Paper Updated!"
          onConfirm={() => {
            setAlert(null);
            navigate("/courses/paper");
          }}
        >
          {`${formData.paperName} has been updated successfully.`}
        </SweetAlert>
      );
    } catch (error) {
      console.error("Update Course Error:", error);
      setAlert(
        <SweetAlert
          danger
          title="Error"
          onConfirm={() => setAlert(null)}
        >
          Failed to update paper. Please try again.
        </SweetAlert>
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (isDirty) setShowCancelAlert(true);
    else navigate("/courses/paper");
  };

  return (
    <div className="w-full min-h-screen bg-white p-3 sm:p-6 flex justify-center">
      <div
        className={`w-full sm:max-w-4xl bg-white rounded-2xl shadow-md border border-gray-100 p-6 transform transition-all duration-500 ease-out ${
          animate ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"
        }`}
      >
        {/* Close Button */}
        <button
          onClick={() => navigate("/courses/paper")}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl font-bold"
        >
          ×
        </button>

        <h2 className="text-2xl font-semibold mb-6 text-blue-700">
          Edit Paper
        </h2>

        {/* FORM START */}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6"
        >
           {/* Program */}
           <div>
                    <CustomSelect
  label="Program"
  value={formData.program}
  onChange={(value) =>
    setFormData((prev) => ({
      ...prev,
      program: value,
      class: '',
      semester: '',
      batch: '',
    }))
  }
  options={programOptions}
  placeholder="Select Program"
/>
                    </div>

                     {/* Class */}
                     <div>
                     <CustomSelect
  label="Class"
  value={formData.class}
  onChange={(value) =>
    setFormData((prev) => ({
      ...prev,
      class: value,
      semester: '',
    }))
  }
  options={classOptions}
  placeholder="Select Class"
  disabled={!formData.program}
/>
                    </div>

                      <div>
                      <CustomSelect
  label="Semester"
  value={formData.semester}
  onChange={(value) =>
    setFormData((prev) => ({
      ...prev,
      semester: value,
    }))
  }
  options={semesterOptions}
  placeholder="Select Semester"
  disabled={!formData.class}
/>
                    </div>

                     {/* batch */}
                     <div>
                     <CustomSelect
  label="Batch"
  value={formData.batch}
  onChange={(value) =>
    setFormData((prev) => ({
      ...prev,
      batch: value,
    }))
  }
  options={batchOptions}
  placeholder="Select Batch"
/>
                    </div>
                    
          {/* Paper Name */}
          <div>
            <label className="block font-medium mb-1">Paper Name*</label>
            <input
              type="text"
              name="paperName"
              value={formData.paperName}
              onChange={handleChange}
              placeholder="Enter Paper Name"
              className={`w-full border rounded px-3 py-2 focus:outline-none ${
                errors.paperName ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.paperName && (
              <p className="text-red-500 text-sm mt-1">{errors.paperName}</p>
            )}
          </div>

          {/* Paper Type */}
          <div>
            <label className="block font-medium mb-1">Paper Type*</label>
            <select
              name="paperType"
              value={formData.paperType}
              onChange={handleChange}
              className={`w-full border rounded px-3 py-2 focus:outline-none ${
                errors.paperType ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select Paper Type</option>
              {paperTypes.map((v) => (
                <option key={v.type_id} value={v.type_id}>
                  {v.name}
                </option>
              ))}
            </select>
            {errors.paperType && (
              <p className="text-red-500 text-sm mt-1">{errors.paperType}</p>
            )}
          </div>

          {/* Vertical */}
          <div>
            <label className="block font-medium mb-1">Vertical Number*</label>
            <select
              name="vertical"
              value={formData.vertical}
              onChange={handleChange}
              className={`w-full border rounded px-3 py-2 focus:outline-none ${
                errors.vertical ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select Vertical</option>
              {verticalNumbers.map((v) => (
                <option key={v.vertical_id} value={v.vertical_id}>
                  {v.name}
                </option>
              ))}
            </select>
            {errors.vertical && (
              <p className="text-red-500 text-sm mt-1">{errors.vertical}</p>
            )}
          </div>

          {/* Paper Code */}
          <div>
            <label className="block font-medium mb-1">Paper Code</label>
            <input
              type="text"
              name="paperCode"
              value={formData.paperCode}
              onChange={handleChange}
              placeholder="Enter Paper Code"
              className="w-full border rounded px-3 py-2 focus:outline-none border-gray-300"
            />
          </div>

          {/* Student Limit */}
          {/* <div>
            <label className="block font-medium mb-1">Student Limit</label>
            <input
              type="number"
              name="studentLimit"
              min="0"
              value={formData.studentLimit}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:outline-none border-gray-300"
            />
          </div> */}

          {/* Start Date */}
          {/* <div>
            <label className="block font-medium mb-1">Start Date & Time</label>
            <input
              type="datetime-local"
              name="startDateTime"
              value={formData.startDateTime}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:outline-none border-gray-300"
            />
          </div> */}

          {/* End Date */}
          {/* <div>
            <label className="block font-medium mb-1">End Date & Time</label>
            <input
              type="datetime-local"
              name="endDateTime"
              value={formData.endDateTime}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:outline-none border-gray-300"
            />
          </div> */}

          {/* Credits */}
          <div>
            <label className="block font-medium mb-1">Credits</label>
            <input
              type="number"
              name="credits"
              value={formData.credits}
              onChange={handleChange}
              placeholder="Enter Credits"
              className="w-full border rounded px-3 py-2 focus:outline-none border-gray-300"
            />
          </div>

          {/* Subject Mode */}
          <div>
            <label className="block font-medium mb-1">
              Subject Mode <span className="text-red-500">*</span>
            </label>
            <Select
              isMulti
              name="subjectMode"
              options={subjectModes.map((m) => ({
                value: m.mode_id,
                label: m.name,
              }))}
              value={formData.subjectMode.map((id) => {
                const mode = subjectModes.find((m) => m.mode_id === id);
                return mode ? { value: mode.mode_id, label: mode.name } : null;
              }).filter(Boolean)}
              onChange={(selected) => {
                const ids = selected.map((s) => s.value);
                setFormData({ ...formData, subjectMode: ids });
                setIsDirty(true);
              }}
            />
            {errors.subjectMode && (
              <p className="text-red-500 text-sm mt-1">{errors.subjectMode}</p>
            )}
          </div>

          {/* Specialization */}
          <div>
            <label className="block font-medium mb-1">Specialization*</label>
            <select
              name="specialization"
              value={formData.specialization}
              onChange={(e) => {
                setFormData({ ...formData, specialization: Number(e.target.value) });
                setIsDirty(true);
              }}
              className={`w-full border rounded px-3 py-2 focus:outline-none ${
                errors.specialization ? "border-red-500" : "border-gray-300"
              }`}
            >
               <option value="">Select Specialization</option>
  {specializations?.map((s) => (
    <option key={s.specialization_id} value={s.specialization_id}>
      {s.name}
    </option>
  ))}
</select>
            {errors.specialization && (
              <p className="text-red-500 text-sm mt-1">{errors.specialization}</p>
            )}
          </div>

          {/* Color Picker */}
          <div className="sm:col-span-2">
            <label className="block font-medium mb-1">
              Color Code <span className="text-red-500">*</span>
            </label>
            <SketchPicker
              color={formData.colorCode || "#000000"}
              onChangeComplete={(color) =>
                setFormData({ ...formData, colorCode: color.hex })
              }
            />
          </div>

          {/* Buttons */}
          <div className="col-span-2 flex flex-col sm:flex-row justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={handleCancel}
              className="w-full sm:w-auto bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              {loading ? "Saving..." : "Update"}
            </button>
          </div>
        </form>
      </div>

      {/* Cancel Alert */}
      {showCancelAlert && (
        <SweetAlert
          warning
          showCancel
          title="Are you sure?"
          onConfirm={() => navigate("/courses/paper")}
          onCancel={() => setShowCancelAlert(false)}
        >
          Your changes will be lost if you leave this page.
        </SweetAlert>
      )}

      {alert}
    </div>
  );
};

export default EditPaper;
