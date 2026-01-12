'use client';
import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
import SweetAlert from 'react-bootstrap-sweetalert';
import { fetchClassesByprogram, allocateStudents } from '../Services/student.service.js';

// Import Academic services for dynamic data
import { collegeService } from '../../Academics/Services/college.service';
import { DivisionService } from '../../Academics/Services/Division.service';
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

/* --------------------- Main Modal Component --------------------- */
export default function AllocateStudent({ selectedStudents = [], onClose, onAllocateSuccess }) {
  const [formData, setFormData] = useState({
    program: '',
    class: '',
    division: '',
    batch: '',
    academicYear: '',
  });

  const [rollNumbers, setRollNumbers] = useState({});
  const [programOptions, setProgramOptions] = useState([]);
  const [classOptions, setClassOptions] = useState([]);
  const [semesterOptions, setSemesterOptions] = useState([]);

  // Dynamic filter options states
  const [divisionOptions, setDivisionOptions] = useState([]);
  const [batchOptions, setBatchOptions] = useState([]);
  const [academicYearOptions, setAcademicYearOptions] = useState([]);

  // Loading states for filter data
  const [filterLoading, setFilterLoading] = useState({
    programs: false,
    divisions: false,
    batches: false
  });

  // Alert states
  const [alert, setAlert] = useState(null);

  /* ---- Load Programs from localStorage ---- */
  useEffect(() => {
    const stored = localStorage.getItem('college_programs');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Convert to { label, value, id } format for easier use
          const formatted = parsed.map((p) => ({
            label: p.program_name || p,
            value: p.program_id || p,
            full: p,
          }));
          setProgramOptions(formatted);
        }
      } catch (e) {
        console.error('Failed to parse college_programs', e);
      }
    }
  }, []);

  /* ---- Fetch classes when a program is selected ---- */
useEffect(() => {
  const loadClasses = async () => {
    if (!formData.program?.value) return;

    try {
      const res = await fetchClassesByprogram(formData.program.value);

      const batchResponse = await batchService.getBatchByProgramId(formData.program.value);
      const batchData = Array.isArray(batchResponse)
        ? batchResponse
        : batchResponse?.data || [];

      if (!Array.isArray(res)) {
        console.error("Expected array but got:", res);
        return;
      }

      const formattedClasses = res.map((cls) => ({
        label: cls.class_year_name,
        value: cls.program_class_year_id,
        full: cls,
      }));

      const formattedBatches = batchData.map((b) => ({
        label: b.batch_name,
        value: b.batch_id,
        full: b,
      }));

      setClassOptions(formattedClasses);
      setBatchOptions(formattedBatches);

      // Auto-select first batch if available
      if (formattedBatches.length > 0) {
        setFormData((prev) => ({
          ...prev,
          batch: formattedBatches[0],
        }));
      }
    } catch (err) {
      console.error("Failed to fetch classes", err);
      setClassOptions([]);
      setBatchOptions([]);
    }
  };

  loadClasses();
}, [formData.program]);


  useEffect(() => {
    if (!formData.class?.value) return;

    const selectedClass = classOptions.find(
      (cls) => cls.value === formData.class.value
    );

    const semesters =
      selectedClass?.full?.semester_divisions?.map((sem) => ({
        label: sem.semester_name,
        value: sem.semester_id,
        full: sem,
      })) || [];

    setSemesterOptions(semesters);
    setFormData((prev) => ({
      ...prev,
      semester: "",
      division: "",
    }));
  }, [formData.class]);

  useEffect(() => {
    if (!formData.semester?.value || !formData.class?.value) return;

    const selectedClass = classOptions.find(
      (cls) => cls.value === formData.class.value
    );

    const divisions =
      selectedClass?.full?.semester_divisions
        ?.filter((div) => div.semester_id === formData.semester.value)
        .map((div) => ({
          label: div.division_name,
          value: div.division_id,
          full: div,
        })) || [];

    setDivisionOptions(divisions);
    setFormData((prev) => ({
      ...prev,
      division: "",
    }));
  }, [formData.semester]);




  // Filter and set academic years based on selected class and batch
  useEffect(() => {
    if (!formData.class?.value || !formData.batch?.value) {
      setAcademicYearOptions([]);
      return;
    }

    const selectedBatch = batchOptions.find(
      (b) => b.value === formData.batch.value
    );

    if (!selectedBatch?.full?.academic_years) {
      setAcademicYearOptions([]);
      return;
    }

    // Filter academic years based on selected class year_number
    const selectedClass = classOptions.find(
      (cls) => cls.value === formData.class.value
    );

    const classYearNumber = selectedClass?.full?.class_year_number ||
                           selectedClass?.full?.year_number;

    const filteredAcademicYears = selectedBatch.full.academic_years
      .filter((ay) => {
        const ayYearNumber = ay.program_class_year?.class_year?.year_number ||
                            ay.year_number;
        return ayYearNumber === classYearNumber;
      })
      .map((ay) => ({
        label: ay.name,
        value: ay.academic_year_id,
        full: ay,
      }));

    setAcademicYearOptions(filteredAcademicYears);

    // Auto-select first academic year if available
    if (filteredAcademicYears.length > 0) {
      setFormData((prev) => ({
        ...prev,
        academicYear: filteredAcademicYears[0],
      }));
    }
  }, [formData.class, formData.batch, batchOptions, classOptions]);

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const res = await collegeService.getAllprogram();

        // ✅ FIX: convert each object to { label, value, full }
        const data = res.map((college) => ({
          label: college.program_name,
          value: college.program_id,
          full: college,
        }));

        setProgramOptions(data);
      } catch (err) {
        console.error("Failed to fetch colleges", err);
        setProgramOptions([]); // fixed from setClassOptions([])
      }
    };

    fetchColleges();
  }, []);


  const closeModal = () => {
    if (onClose) onClose();
  };


  const handleRollNumberChange = (studentId, value) => {
    setRollNumbers((prev) => ({
      ...prev,
      [studentId]: value,
    }));
  };

  const handleAllocate = async () => {
    try {
      // Validate required fields
      if (!formData.academicYear?.value) {
        setAlert(
          <SweetAlert
            warning
            title="Missing Academic Year"
            onConfirm={() => setAlert(null)}
            confirmBtnCssClass="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Please select an Academic Year before allocating students.
          </SweetAlert>
        );
        return;
      }

      if (!formData.semester?.value) {
        setAlert(
          <SweetAlert
            warning
            title="Missing Semester"
            onConfirm={() => setAlert(null)}
            confirmBtnCssClass="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Please select a Semester before allocating students.
          </SweetAlert>
        );
        return;
      }

      if (!formData.division?.value) {
        setAlert(
          <SweetAlert
            warning
            title="Missing Division"
            onConfirm={() => setAlert(null)}
            confirmBtnCssClass="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Please select a Division before allocating students.
          </SweetAlert>
        );
        return;
      }

      // Check if all students have roll numbers
      const studentsWithoutRollNumbers = selectedStudents.filter(
        (student) => !rollNumbers[student.student_id] || rollNumbers[student.student_id].trim() === ''
      );

      if (studentsWithoutRollNumbers.length > 0) {
        setAlert(
          <SweetAlert
            warning
            title="Missing Roll Numbers"
            onConfirm={() => setAlert(null)}
            confirmBtnCssClass="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            {studentsWithoutRollNumbers.length} student(s) do not have roll numbers assigned. Please assign roll numbers to all students.
          </SweetAlert>
        );
        return;
      }

      // Build payload for API - array of StudentAllocationRequest objects
      const allocationData = selectedStudents.map((student) => ({
        student_id: student.student_id,
        academic_year_id: formData.academicYear?.value || null,
        semester_id: formData.semester?.value || null,
        division_id: formData.division?.value || null,
        roll_number: rollNumbers[student.student_id] || '',
      }));

      console.log('📦 Sending allocation data:', allocationData);

      // 🔥 Call API
      const response = await allocateStudents(allocationData);

      console.log('✅ API Response:', response);

      // Handle response based on structure
      if (Array.isArray(response) && response.length > 0) {
        // Success - response is array of allocated students
        const allocatedCount = response.length;
        const successfulAllocations = response.filter(item => item.is_active);
        
        if (successfulAllocations.length === allocatedCount) {
          setAlert(
            <SweetAlert
              success
              title="Success!"
              onConfirm={() => {
                setAlert(null);
                if (onAllocateSuccess) onAllocateSuccess(response);
                onClose();
              }}
              confirmBtnCssClass="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              {allocatedCount} student(s) allocated successfully.
            </SweetAlert>
          );
        } else {
          setAlert(
            <SweetAlert
              warning
              title="Partial Success"
              onConfirm={() => {
                setAlert(null);
                if (onAllocateSuccess) onAllocateSuccess(response);
                onClose();
              }}
              confirmBtnCssClass="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              {successfulAllocations.length} of {allocatedCount} student(s) allocated. Some allocations may have issues.
            </SweetAlert>
          );
        }
      } else if (response?.success) {
        // Alternative success response format
        setAlert(
          <SweetAlert
            success
            title="Success!"
            onConfirm={() => {
              setAlert(null);
              if (onAllocateSuccess) onAllocateSuccess(response);
              onClose();
            }}
            confirmBtnCssClass="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Students allocated successfully.
          </SweetAlert>
        );
      } else if (response?.message) {
        // API returned error message
        setAlert(
          <SweetAlert
            danger
            title="Error"
            onConfirm={() => setAlert(null)}
            confirmBtnCssClass="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            {response.message}
          </SweetAlert>
        );
      } else {
        // Unknown response format
        setAlert(
          <SweetAlert
            warning
            title="Unexpected Response"
            onConfirm={() => {
              setAlert(null);
              onClose();
            }}
            confirmBtnCssClass="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Allocation completed but response format is unexpected. Please verify the allocations.
          </SweetAlert>
        );
      }
    } catch (error) {
      console.error('❌ Allocation failed:', error);
      
      // Handle different error types
      let errorMessage = 'An unexpected error occurred while allocating students.';
      
      if (error.response) {
        // API returned error response
        errorMessage = error.response.data?.message || error.response.data?.error || 'Unknown error occurred';
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'No response from server. Please check your internet connection and try again.';
      } else {
        // Something else went wrong
        errorMessage = error.message || 'An unexpected error occurred while allocating students.';
      }

      setAlert(
        <SweetAlert
          danger
          title="Allocation Failed"
          onConfirm={() => setAlert(null)}
          confirmBtnCssClass="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          {errorMessage}
        </SweetAlert>
      );
    }
  };


  const isFormValid = () =>
    formData.program &&
    formData.class &&
    formData.division &&
    formData.batch &&
    formData.academicYear &&
    selectedStudents.length > 0;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/50 p-4">
      <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-blue-600 text-white">
          <h2 className="text-lg font-bold">
            Allocate Students ({selectedStudents.length})
          </h2>
          <button
            onClick={closeModal}
            className="text-white hover:bg-blue-700 p-1 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Program */}
            <CustomSelect
              label="Select Program"
              value={formData.program}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  program: value,
                  class: '',
                  division: '',
                  batch: '',
                  academicYear: '',
                }))
              }
              options={programOptions}
              placeholder="Select Program"
            />

            {/* Class */}
            <CustomSelect
              label="Select Class"
              value={formData.class}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  class: value,
                  division: '',
                  academicYear: '',
                }))
              }
              options={classOptions}
              placeholder="Select Class"
              disabled={!formData.program}
            />

            {/* Semester */}
            <CustomSelect
              label="Select Semester"
              value={formData.semester}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  semester: value,
                  division: "",
                }))
              }
              options={semesterOptions}
              placeholder="Select Semester"
              disabled={!formData.class}
            />

            {/* Division */}
            <CustomSelect
              label="Select Division"
              value={formData.division}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  division: value,
                }))
              }
              options={divisionOptions}
              placeholder="Select Division"
              disabled={!formData.class}
            />

            {/* Batch */}
            <CustomSelect
              label="Select Batch"
              value={formData.batch}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  batch: value,
                  academicYear: '',
                }))
              }
              options={batchOptions}
              placeholder="Select Batch"
            />

            {/* Academic Year */}
            <CustomSelect
              label="Academic Year"
              value={formData.academicYear}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, academicYear: value }))
              }
              options={academicYearOptions}
              placeholder="Select Academic Year"
              disabled={!formData.batch}
            />
          </div>

          {/* Students */}
          <div className="border-t pt-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Assign Roll Numbers
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {selectedStudents.length === 0 ? (
                <p className="text-gray-500 text-sm italic">
                  No students selected.
                </p>
              ) : (
                selectedStudents.map((student) => (
                  <div
                    key={student.student_id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{student.firstname}<span></span> {student.lastname}</p>
                      <p className="text-xs text-gray-500">
                        {student.grade} • {student.className}
                      </p>
                    </div>
                    <div className="w-32">
                      <input
                        type="text"
                        placeholder="Roll No."
                        value={rollNumbers[student.student_id] || ''}
                        onChange={(e) =>
                          handleRollNumberChange(student.student_id, e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
          <button
            onClick={closeModal}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleAllocate}
            disabled={!isFormValid()}
            className={`px-6 py-2 rounded-md font-medium transition ${isFormValid()
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
          >
            Allocate Students
          </button>
        </div>
      </div>

      {/* Alert Component */}
      {alert}
    </div>
  );
}
