'use client';
import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, ArrowRight } from 'lucide-react';
import SweetAlert from 'react-bootstrap-sweetalert';
import { PromoteStudents } from '../Services/student.service.js';
import { useNavigate } from "react-router-dom";


// Import Academic services for dynamic data
import { collegeService } from '../../Academics/Services/college.service';
import { DivisionService } from '../../Academics/Services/Division.service';
import { batchService } from '../../Academics/Services/batch.Service';
import { classService } from '../../Academics/Services/class.service';

/* --------------------- Custom Select Component --------------------- */
const CustomSelect = ({ label, value, onChange, options, placeholder, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

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

/* --------------------- Main Promotion Modal Component --------------------- */
export default function PromoteStudent({ selectedStudents = [], onClose, onPromotionSuccess }) {
  const [formData, setFormData] = useState({
    program: '',
    class: '',
    division: '',
    batch: '',
    academicYear: '',
    semester: '',
  });

  const [rollNumbers, setRollNumbers] = useState({});
  const [programOptions, setProgramOptions] = useState([]);
  const [classOptions, setClassOptions] = useState([]);
  const [semesterOptions, setSemesterOptions] = useState([]);
  const [divisionOptions, setDivisionOptions] = useState([]);
  const [batchOptions, setBatchOptions] = useState([]);
  const [academicYearOptions, setAcademicYearOptions] = useState([]);

  // Alert states
  const [alert, setAlert] = useState(null);

  /* ---- Fetch Programs ---- */
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const res = await collegeService.getAllprogram();
        const data = res.map((college) => ({
          label: college.program_name,
          value: college.program_id,
          full: college,
        }));
        setProgramOptions(data);
      } catch (err) {
        console.error("Failed to fetch programs", err);
        setProgramOptions([]);
      }
    };

    fetchColleges();
  }, []);

  /* ---- Fetch batches when program is selected ---- */
  useEffect(() => {
    const loadBatches = async () => {
      if (!formData.program?.value) {
        setBatchOptions([]);
        setClassOptions([]);
        return;
      }

      try {
        const batchResponse = await batchService.getBatchByProgramId(formData.program.value);

        const batchData = Array.isArray(batchResponse)
          ? batchResponse
          : batchResponse?.data || [];

        const formattedBatches = batchData.map((b) => ({
          label: b.batch_name,
          value: b.batch_id,
          full: b,
        }));

        setBatchOptions(formattedBatches);

        // Clear class and dependent fields when program changes
        setClassOptions([]);
        setFormData((prev) => ({
          ...prev,
          class: '',
          semester: '',
          division: '',
          academicYear: '',
        }));
      } catch (err) {
        console.error("Failed to fetch batches", err);
        setBatchOptions([]);
      }
    };

    loadBatches();
  }, [formData.program]);

  /* ---- Fetch classes when batch is selected ---- */
  useEffect(() => {
    const loadClasses = async () => {
      if (!formData.batch?.value || !formData.batch?.full?.academic_years) {
        setClassOptions([]);
        return;
      }

      try {
        // Extract unique classes from batch's academic years
        const academicYears = formData.batch.full.academic_years;
        const classMap = new Map();

        academicYears.forEach(ay => {
          if (ay.program_class_year?.class_year) {
            const classYear = ay.program_class_year.class_year;
            if (!classMap.has(classYear.class_year_id)) {
              classMap.set(classYear.class_year_id, {
                label: classYear.name,
                value: classYear.class_year_id,
                full: classYear,
              });
            }
          }
        });

        const formattedClasses = Array.from(classMap.values());
        setClassOptions(formattedClasses);

        // Clear class and dependent fields when batch changes
        setFormData((prev) => ({
          ...prev,
          class: '',
          semester: '',
          division: '',
          academicYear: '',
        }));
      } catch (err) {
        console.error("Failed to fetch classes", err);
        setClassOptions([]);
      }
    };

    loadClasses();
  }, [formData.batch]);

  /* ---- Fetch semesters when class is selected ---- */
  useEffect(() => {
    const loadSemesters = async () => {
      if (!formData.class?.value) {
        setSemesterOptions([]);
        setFormData((prev) => ({ ...prev, semester: '', division: '' }));
        return;
      }

      try {
        const response = await classService.getClassById(formData.class.value);

        if (response && response.semesters && response.semesters.length > 0) {
          const semesterList = response.semesters.map(sem => ({
            label: sem.name,
            value: sem.semester_id,
            full: sem
          }));
          setSemesterOptions(semesterList);
        } else {
          setSemesterOptions([]);
        }
      } catch (error) {
        console.error("Failed to load semesters:", error);
        setSemesterOptions([]);
      }
    };

    loadSemesters();
  }, [formData.class]);

  /* ---- Fetch divisions when semester is selected ---- */
  useEffect(() => {
    const loadDivisions = async () => {
      if (!formData.semester?.value || !formData.class?.value) {
        setDivisionOptions([]);
        return;
      }

      try {
        const response = await DivisionService.getDivision();

        if (response && response.length > 0) {
          const formattedDivisions = response.map(d => ({
            label: d.division_name,
            value: d.division_id,
            full: d
          }));
          setDivisionOptions(formattedDivisions);
        }
      } catch (error) {
        console.error("Failed to load divisions:", error);
        setDivisionOptions([]);
      }
    };

    loadDivisions();
  }, [formData.semester]);

  /* ---- Filter academic years based on selected class and batch ---- */
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

  const closeModal = () => {
    if (onClose) onClose();
  };

  const handleRollNumberChange = (studentId, value) => {
    setRollNumbers((prev) => ({
      ...prev,
      [studentId]: value,
    }));
  };

  const handlePromote = async () => {
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
            Please select an Academic Year before promoting students.
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
            Please select a Semester before promoting students.
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
            Please select a Division before promoting students.
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

      // Build payload for API
      const student = selectedStudents[0];
      const promotionData = {
        student_id: student.student_id,
        allocation_id: student.allocationId,
        academic_year_id: formData.academicYear?.value || null,
        semester_id: formData.semester?.value || null,
        division_id: formData.division?.value || null,
        roll_number: rollNumbers[student.student_id] || '',
      };


      console.log('📦 Sending promotion data:', promotionData);

      // Call API (using same PromoteStudents API as it handles both allocation and promotion)
      const response = await PromoteStudents(promotionData);

      console.log('✅ API Response:', response);

      // Handle response
      if (Array.isArray(response) && response.length > 0) {
        const promotedCount = response.length;
        const successfulPromotions = response.filter(item => item.is_active);

        if (successfulPromotions.length === promotedCount) {
          setAlert(
            <SweetAlert
              success
              title="Success!"
              onConfirm={() => {
                setAlert(null);
                if (onPromotionSuccess) onPromotionSuccess(response);
                onClose();
              }}
              confirmBtnCssClass="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              {promotedCount} student(s) promoted successfully.
            </SweetAlert>
          );
        } else {
          setAlert(
            <SweetAlert
              warning
              title="Partial Success"
              onConfirm={() => {
                setAlert(null);
                if (onPromotionSuccess) onPromotionSuccess(response);
                onClose();
              }}
              confirmBtnCssClass="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              {successfulPromotions.length} of {promotedCount} student(s) promoted. Some promotions may have issues.
            </SweetAlert>
          );
        }
      } else if (response?.success) {
        setAlert(
          <SweetAlert
            success
            title="Success!"
            onConfirm={() => {
              setAlert(null);
              if (onPromotionSuccess) onPromotionSuccess(response);
              onClose();
            }}
            confirmBtnCssClass="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Students promoted successfully.
          </SweetAlert>
        );
      } else if (response?.id && response?.student_id && typeof response?.is_active !== 'undefined') {
        // Handle single promotion record response
        setAlert(
          <SweetAlert
            success
            title="Success!"
            onConfirm={() => {
              setAlert(null);
              if (onPromotionSuccess) onPromotionSuccess(response);
              onClose();
            }}
            confirmBtnCssClass="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Student promoted successfully.
          </SweetAlert>
        );
      } else {
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
            Promotion completed but response format is unexpected. Please verify the promotions.
          </SweetAlert>
        );
      }
    } catch (error) {
      console.error('❌ Promotion failed:', error);

      let errorMessage = 'An unexpected error occurred while promoting students.';

      if (error.response) {
        errorMessage = error.response.data?.message || error.response.data?.error || 'Unknown error occurred';
      } else if (error.request) {
        errorMessage = 'No response from server. Please check your internet connection and try again.';
      } else {
        errorMessage = error.message || 'An unexpected error occurred while promoting students.';
      }

      setAlert(
        <SweetAlert
          danger
          title="Promotion Failed"
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
    formData.semester &&
    selectedStudents.length > 0;

  return (
    <>
      <div className="page-header flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
        <div className="bg-white w-full h-full rounded-none shadow-2xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-blue-600 text-white">
            <h2 className="text-lg font-bold">
              Promote Students ({selectedStudents.length})
            </h2>
            <button
              onClick={closeModal}
              className="text-white hover:bg-blue-700 p-1 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Current and New Allocation Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-200">
              <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <ArrowRight className="w-5 h-5 text-blue-600" />
                Promotion Overview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Current Allocation */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-600 mb-3">Current Allocation</h4>
                  <div className="space-y-2 text-sm">
                    {selectedStudents.length > 0 && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Batch:</span>
                          <span className="font-medium text-gray-900">{selectedStudents[0].batchYear || '—'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Academic Year:</span>
                          <span className="font-medium text-gray-900">{selectedStudents[0].academicYear || '—'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Class:</span>
                          <span className="font-medium text-gray-900">{selectedStudents[0].className || '—'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Division:</span>
                          <span className="font-medium text-gray-900">{selectedStudents[0].division || '—'}</span>
                        </div>

                      </>
                    )}
                  </div>
                </div>

                {/* New Allocation */}
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <h4 className="text-sm font-semibold text-green-600 mb-3">New Allocation (Target)</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Batch:</span>
                      <span className="font-medium text-gray-900">{formData.batch?.label || 'Not selected'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Academic Year:</span>
                      <span className="font-medium text-gray-900">{formData.academicYear?.label || 'Not selected'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Class:</span>
                      <span className="font-medium text-gray-900">
                        {formData.class?.label || formData.semester?.label
                          ? `${formData.class?.label || ''}${formData.class?.label && formData.semester?.label ? ' / ' : ''}${formData.semester?.label || ''}`
                          : 'Not selected'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Division:</span>
                      <span className="font-medium text-gray-900">{formData.division?.label || 'Not selected'}</span>
                    </div>

                  </div>
                </div>
              </div>
            </div>

            {/* Form Section */}
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
                    semester: '',
                  }))
                }
                options={programOptions}
                placeholder="Select Program"
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
                disabled={!formData.program}
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
                    semester: '',
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
                    division: '',
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
                disabled={!formData.semester}
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

            {/* Students with Roll Numbers */}
            <div className="border-t pt-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Students to Promote - Assign Roll Numbers
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
                        <p className="font-medium text-gray-900">{student.name}</p>
                        <p className="text-xs text-gray-500">
                          Current: {student.className} • Division {student.division || '—'} • Roll: {student.rollNumber || '—'}
                        </p>
                      </div>
                      <div className="w-32">
                        <input
                          type="text"
                          placeholder="New Roll No."
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
              onClick={() => {
                if (onClose) onClose();
                navigate("/student/Allocated");
              }}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition"
            >
              Cancel
            </button>

            <button
              onClick={handlePromote}
              disabled={!isFormValid()}
              className={`px-6 py-2 rounded-md font-medium transition ${isFormValid()
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
            >
              Promote Students
            </button>
          </div>
        </div>

        {/* Alert Component */}
        {alert}
      </div>
    </>
  );
}