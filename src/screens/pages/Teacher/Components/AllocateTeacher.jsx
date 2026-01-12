'use client';
import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
import SweetAlert from 'react-bootstrap-sweetalert';
import { fetchClassesByprogram } from '../../Student/Services/student.service.js';
import { collegeService } from '../../Academics/Services/college.service';
import { batchService } from '../../Academics/Services/batch.Service';
import {
  allocateTeacher,
  getTeacherAllocationsByTeacherId,
  updateTeacherAllocation,
  softDeleteTeacherAllocation,
  hardDeleteTeacherAllocation
} from '../../Teacher/Services/teacher.service';

// 🔹 Custom Select Component
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

// 🔹 Multi-Select Component for Subjects
const MultiSelectSubjects = ({ label, selectedSubjects, options, onChange, onRemove, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const availableOptions = options.filter(opt => !selectedSubjects.some(s => s.value === opt.value));

  const handleSelect = (option) => {
    onChange(option);
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
        <span className="text-xs text-gray-500 ml-2">
          (Selected: {selectedSubjects.length})
        </span>
      </label>
      <div
        className={`flex flex-wrap items-center gap-2 p-2 border ${disabled
            ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed'
            : 'bg-white border-gray-300 cursor-pointer hover:border-blue-400'
          } rounded-md min-h-[44px] transition-all duration-150`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        {selectedSubjects.length > 0 ? (
          selectedSubjects.map(subject => (
            <span
              key={subject.value}
              className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium"
              onClick={(e) => e.stopPropagation()}
            >
              {subject.label}
              <button
                onClick={() => onRemove(subject)}
                className="hover:bg-blue-200 rounded-full p-0.5 ml-0.5 transition-colors"
                title="Remove Subject"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))
        ) : (
          <span className="text-gray-400 text-sm ml-1">Select Subjects</span>
        )}
        <ChevronDown
          className={`w-4 h-4 text-gray-400 ml-auto transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'
            }`}
        />
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {availableOptions.length > 0 ? (
            availableOptions.map((option, i) => (
              <div
                key={i}
                className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
                onClick={() => handleSelect(option)}
              >
                {option.label}
              </div>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500">All subjects selected.</div>
          )}
        </div>
      )}
    </div>
  );
};

// 🔹 Main Modal Component
export default function AllocateTeacher({ onClose, teacherData }) {
  const [formData, setFormData] = useState({
    program: '',
    class: '',
    semester: '',
    division: '',
    batch: '',
    subjects: [],
  });

  const [programOptions, setProgramOptions] = useState([]);
  const [classOptions, setClassOptions] = useState([]);
  const [semesterOptions, setSemesterOptions] = useState([]);
  const [divisionOptions, setDivisionOptions] = useState([]);
  const [batchOptions, setBatchOptions] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);

  const [alert, setAlert] = useState(null);
  const [existingAllocations, setExistingAllocations] = useState([]);
  const [currentAllocationId, setCurrentAllocationId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Dummy subjects data (will be replaced with API)
  const dummySubjects = [
    { label: 'Mathematics', value: 1 },
    { label: 'Physics', value: 2 },
    { label: 'Chemistry', value: 3 },
    { label: 'Biology', value: 4 },
    { label: 'Computer Science', value: 5 },
    { label: 'English', value: 6 },
    { label: 'Hindi', value: 7 },
    { label: 'History', value: 8 },
    { label: 'Geography', value: 9 },
    { label: 'Economics', value: 10 },
    { label: 'Political Science', value: 11 },
    { label: 'Sociology', value: 12 },
    { label: 'Psychology', value: 13 },
    { label: 'Business Studies', value: 14 },
    { label: 'Accountancy', value: 15 },
  ];

  // 🔹 Fetch Programs on mount
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const res = await collegeService.getAllprogram();
        const data = res.map((program) => ({
          label: program.program_name,
          value: program.program_id,
          full: program,
        }));
        setProgramOptions(data);
      } catch (err) {
        console.error('Failed to fetch programs', err);
      }
    };
    fetchPrograms();
  }, []);

  // 🔹 Fetch existing teacher allocations on mount
  useEffect(() => {
    const fetchExistingAllocations = async () => {
      if (!teacherData?.teacherId && !teacherData?.id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const teacherId = teacherData?.teacherId || teacherData?.id;
        const allocations = await getTeacherAllocationsByTeacherId(teacherId);
        
        console.log('📚 Existing Allocations:', allocations);
        
        if (allocations && allocations.length > 0) {
          setExistingAllocations(allocations);
          // Use the first allocation for pre-population
          const firstAllocation = allocations[0];
          setCurrentAllocationId(firstAllocation.allocation_id || firstAllocation.id);
          setIsEditMode(true);
          
          // Pre-populate form with existing data
          // Note: We'll need to wait for options to be loaded before setting values
          // This will be handled by the other useEffects
        } else {
          setIsEditMode(false);
        }
      } catch (error) {
        console.error('Error fetching teacher allocations:', error);
        setIsEditMode(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExistingAllocations();
  }, [teacherData]);

  // 🔹 Pre-populate form when we have both allocations and options loaded
  useEffect(() => {
    if (!isEditMode || existingAllocations.length === 0 || programOptions.length === 0) return;

    const firstAllocation = existingAllocations[0];
    
    // Find and set program
    const programOption = programOptions.find(p => p.value === firstAllocation.program_id);
    if (programOption) {
      setFormData(prev => ({
        ...prev,
        program: programOption,
      }));
    }
  }, [isEditMode, existingAllocations, programOptions]);

  // 🔹 Fetch Classes and Batches when program changes
  useEffect(() => {
    const loadClasses = async () => {
      if (!formData.program?.value) return;

      try {
        const res = await fetchClassesByprogram(formData.program.value);
        const batchResponse = await batchService.getBatchByProgramId(formData.program.value);
        const batchData = Array.isArray(batchResponse) ? batchResponse : batchResponse?.data || [];

        if (!Array.isArray(res)) {
          console.error('Expected array but got:', res);
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

        // Pre-populate class and batch when in edit mode
        if (isEditMode && existingAllocations.length > 0) {
          const firstAllocation = existingAllocations[0];
          const classOption = formattedClasses.find(c => c.value === firstAllocation.class_year_id);
          const batchOption = formattedBatches.find(b => b.value === firstAllocation.batch_id);
          
          if (classOption) {
            setFormData(prev => ({ ...prev, class: classOption }));
          }
          if (batchOption) {
            setFormData(prev => ({ ...prev, batch: batchOption }));
          }
        } else if (formattedBatches.length > 0 && !isEditMode) {
          setFormData((prev) => ({ ...prev, batch: formattedBatches[0] }));
        }
      } catch (err) {
        console.error('Failed to fetch classes', err);
        setClassOptions([]);
        setBatchOptions([]);
      }
    };

    loadClasses();
  }, [formData.program, isEditMode, existingAllocations]);

  // 🔹 Fetch Semesters when class changes
  useEffect(() => {
    if (!formData.class?.value) return;

    const selectedClass = classOptions.find((cls) => cls.value === formData.class.value);
    const semesters =
      selectedClass?.full?.semester_divisions?.map((sem) => ({
        label: sem.semester_name,
        value: sem.semester_id,
        full: sem,
      })) || [];

    setSemesterOptions(semesters);
    
    // Pre-populate semester when in edit mode
    if (isEditMode && existingAllocations.length > 0) {
      const firstAllocation = existingAllocations[0];
      const semesterOption = semesters.find(s => s.value === firstAllocation.semester_id);
      if (semesterOption) {
        setFormData(prev => ({ ...prev, semester: semesterOption }));
      }
    } else if (!isEditMode) {
      setFormData((prev) => ({ ...prev, semester: '', division: '' }));
    }
  }, [formData.class, classOptions, isEditMode, existingAllocations]);

  // 🔹 Fetch Divisions when semester changes
  useEffect(() => {
    if (!formData.semester?.value || !formData.class?.value) return;

    const selectedClass = classOptions.find((cls) => cls.value === formData.class.value);
    const divisions =
      selectedClass?.full?.semester_divisions
        ?.filter((div) => div.semester_id === formData.semester.value)
        .map((div) => ({
          label: div.division_name,
          value: div.division_id,
          full: div,
        })) || [];

    setDivisionOptions(divisions);
    
    // Pre-populate division when in edit mode
    if (isEditMode && existingAllocations.length > 0) {
      const firstAllocation = existingAllocations[0];
      const divisionOption = divisions.find(d => d.value === firstAllocation.division_id);
      if (divisionOption) {
        setFormData(prev => ({ ...prev, division: divisionOption }));
      }
    } else if (!isEditMode) {
      setFormData((prev) => ({ ...prev, division: '' }));
    }
  }, [formData.semester, formData.class, classOptions, isEditMode, existingAllocations]);

  // 🔹 Fetch Subjects when program changes
  useEffect(() => {
    const loadSubjects = async () => {
      if (!formData.program?.value) {
        // Use dummy data when no program selected
        setSubjectOptions(dummySubjects);
        return;
      }

      try {
        const subjects = await collegeService.getSUbjectbyProgramID(formData.program.value);

        const subjectOpts = Array.isArray(subjects)
          ? subjects.map((subject) => ({
            label: subject.name || 'Unnamed Subject',
            value: subject.subject_id,
            full: subject,
          }))
          : [];

        console.log("subjectOpts", subjectOpts);

        // Fallback to dummy data if API returns empty
        const finalSubjectOptions = subjectOpts.length > 0 ? subjectOpts : dummySubjects;
        setSubjectOptions(finalSubjectOptions);

        // Pre-populate subjects when in edit mode
        if (isEditMode && existingAllocations.length > 0) {
          const firstAllocation = existingAllocations[0];
          
          // Parse subject_ids_json field from API
          let subjectIds = [];
          if (firstAllocation.subject_ids_json) {
            try {
              subjectIds = JSON.parse(firstAllocation.subject_ids_json);
            } catch (error) {
              console.error('Error parsing subject_ids_json:', error);
              subjectIds = [];
            }
          } else if (firstAllocation.subject_ids && Array.isArray(firstAllocation.subject_ids)) {
            // Fallback for direct array format
            subjectIds = firstAllocation.subject_ids;
          }
          
          if (Array.isArray(subjectIds) && subjectIds.length > 0) {
            const selectedSubjects = subjectIds
              .map(subjectId => finalSubjectOptions.find(s => s.value === subjectId))
              .filter(Boolean);
            
            if (selectedSubjects.length > 0) {
              setFormData(prev => ({ ...prev, subjects: selectedSubjects }));
            }
          }
        }
      } catch (error) {
        console.error('Error fetching subjects:', error);
        // Fallback to dummy data on error
        setSubjectOptions(dummySubjects);
      }
    };

    loadSubjects();
  }, [formData.program, isEditMode, existingAllocations]);


  const closeModal = () => {
    if (onClose) onClose();
  };
  console.log("subjectOptions", subjectOptions)
  const handleAllocate = async () => {
    try {
      if (!formData.semester?.value) {
        setAlert(
          <SweetAlert
            warning
            title="Missing Semester"
            onConfirm={() => setAlert(null)}
            confirmBtnCssClass="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Please select a Semester before allocating.
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
            Please select a Division before allocating.
          </SweetAlert>
        );
        return;
      }

      if (formData.subjects.length === 0) {
        setAlert(
          <SweetAlert
            warning
            title="Missing Subjects"
            onConfirm={() => setAlert(null)}
            confirmBtnCssClass="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Please select at least one subject before allocating.
          </SweetAlert>
        );
        return;
      }

      const allocationData = {
        teacher_id: Number(teacherData?.teacherId || teacherData?.id),
        program_id: formData.program?.value,
        class_year_id: formData.class?.value,
        division_id: formData.division?.value,
        subject_ids: formData.subjects.map(s => s.value),
      };

      console.log('📦 Teacher Allocation Data:', allocationData);

      // Call the API to allocate teacher
      const response = await allocateTeacher(allocationData);
      console.log('✅ Allocation Response:', response);

      setAlert(
        <SweetAlert
          success
          title="Success!"
          onConfirm={() => {
            setAlert(null);
            if (onClose) onClose();
          }}
          confirmBtnCssClass="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          Teacher {teacherData?.firstname || teacherData?.name} allocated successfully to {formData.subjects.length} subject(s)!
        </SweetAlert>
      );
    } catch (error) {
      console.error('❌ Allocation failed:', error);
      
      // Extract error message from different error formats
      let errorMessage = 'An unexpected error occurred while allocating teacher.';
      if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
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
const handleUpdate = async () => {
    try {
      if (!currentAllocationId) {
        setAlert(
          <SweetAlert
            warning
            title="No Allocation Found"
            onConfirm={() => setAlert(null)}
            confirmBtnCssClass="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            No existing allocation found to update.
          </SweetAlert>
        );
        return;
      }

      if (!formData.semester?.value || !formData.division?.value || formData.subjects.length === 0) {
        setAlert(
          <SweetAlert
            warning
            title="Missing Fields"
            onConfirm={() => setAlert(null)}
            confirmBtnCssClass="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Please fill all required fields before updating.
          </SweetAlert>
        );
        return;
      }

      const updateData = {
        teacher_id: Number(teacherData?.teacherId || teacherData?.id),
        program_id: formData.program?.value,
        class_year_id: formData.class?.value,
        division_id: formData.division?.value,
        subject_ids: formData.subjects.map(s => s.value),
      };

      console.log('🔄 Teacher Update Data:', updateData);

      const response = await updateTeacherAllocation(currentAllocationId, updateData);
      console.log('✅ Update Response:', response);

      setAlert(
        <SweetAlert
          success
          title="Updated Successfully!"
          onConfirm={() => {
            setAlert(null);
            if (onClose) onClose();
          }}
          confirmBtnCssClass="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          Teacher allocation updated successfully!
        </SweetAlert>
      );
    } catch (error) {
      console.error('❌ Update failed:', error);
      
      let errorMessage = 'An unexpected error occurred while updating teacher allocation.';
      if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      setAlert(
        <SweetAlert
          danger
          title="Update Failed"
          onConfirm={() => setAlert(null)}
          confirmBtnCssClass="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          {errorMessage}
        </SweetAlert>
      );
    }
  };

  const handleDelete = (deleteType = 'soft') => {
    setAlert(
      <SweetAlert
        warning
        showCancel
        confirmBtnText={deleteType === 'soft' ? 'Soft Delete' : 'Hard Delete'}
        cancelBtnText="Cancel"
        title="Confirm Delete"
        onConfirm={async () => {
          try {
            if (!currentAllocationId) {
              setAlert(
                <SweetAlert
                  warning
                  title="No Allocation Found"
                  onConfirm={() => setAlert(null)}
                  confirmBtnCssClass="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  No existing allocation found to delete.
                </SweetAlert>
              );
              return;
            }

            console.log(`🗑️ Deleting allocation (${deleteType}):`, currentAllocationId);

            if (deleteType === 'soft') {
              await softDeleteTeacherAllocation(currentAllocationId);
            } else {
              await hardDeleteTeacherAllocation(currentAllocationId);
            }

            setAlert(
              <SweetAlert
                success
                title="Deleted Successfully!"
                onConfirm={() => {
                  setAlert(null);
                  if (onClose) onClose();
                }}
                confirmBtnCssClass="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Teacher allocation deleted successfully!
              </SweetAlert>
            );
          } catch (error) {
            console.error('❌ Delete failed:', error);
            
            let errorMessage = 'An unexpected error occurred while deleting teacher allocation.';
            if (error?.message) {
              errorMessage = error.message;
            } else if (typeof error === 'string') {
              errorMessage = error;
            }

            setAlert(
              <SweetAlert
                danger
                title="Delete Failed"
                onConfirm={() => setAlert(null)}
                confirmBtnCssClass="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                {errorMessage}
              </SweetAlert>
            );
          }
        }}
        onCancel={() => setAlert(null)}
        confirmBtnCssClass="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium"
        cancelBtnCssClass="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg font-medium"
      >
        Are you sure you want to {deleteType === 'soft' ? 'soft' : 'permanently'} delete this teacher allocation?
        {deleteType === 'hard' && ' This action cannot be undone!'}
      </SweetAlert>
    );
  };

  const isFormValid = () =>
    formData.program &&
    formData.class &&
    formData.semester &&
    formData.division &&
    formData.batch &&
    formData.subjects.length > 0;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/50 p-4">
      <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-blue-600 text-white">
          <h2 className="text-lg font-bold">
            Allocate Teacher: {teacherData?.name}
          </h2>
          <button
            onClick={closeModal}
            className="text-white hover:bg-blue-700 p-1 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Teacher Info Section */}
        {teacherData && (
          <div className="px-6 py-4 bg-blue-50 border-b">
            <div className="grid grid-cols-3 md:grid-cols-[2fr_1fr_1fr_0.5fr] gap-3 text-sm">
              {/* Email - larger column with wrapping */}
              <div className="break-words min-w-0">
                <span className="text-gray-600">Email:</span>
                <p className="font-medium text-gray-900 break-all">{teacherData.email || 'N/A'}</p>
              </div>

              {/* Mobile */}
              <div>
                <span className="text-gray-600">Mobile:</span>
                <p className="font-medium text-gray-900">{teacherData.mobile || 'N/A'}</p>
              </div>

              {/* Designation */}
              <div>
                <span className="text-gray-600">Designation:</span>
                <p className="font-medium text-gray-900">{teacherData.designation || 'N/A'}</p>
              </div>

              {/* Status - smaller column */}
              <div className="text-right md:text-center">
                <span className="text-gray-600">Status:</span>
                <p
                  className={`font-medium ${teacherData.active ? 'text-green-600' : 'text-red-600'
                    }`}
                >
                  {teacherData.active ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
          </div>

        )}

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
                  semester: '',
                  division: '',
                  batch: '',
                  subjects: [],
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
                  semester: '',
                  division: '',
                  subjects: [],
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


            {/* Subjects - Multi-Select spanning 2 columns */}
            <div className="md:col-span-2">
              <MultiSelectSubjects
                label="Select Subjects"
                selectedSubjects={formData.subjects}
                options={subjectOptions}
                onChange={(subject) =>
                  setFormData((prev) => ({
                    ...prev,
                    subjects: [...prev.subjects, subject],
                  }))
                }
                onRemove={(subject) =>
                  setFormData((prev) => ({
                    ...prev,
                    subjects: prev.subjects.filter(s => s.value !== subject.value),
                  }))
                }
                disabled={!formData.program}
              />
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
          
          {isEditMode ? (
            <>
              {/* Delete Button with Dropdown */}
              <button
                onClick={() => handleDelete('soft')}
                disabled={!currentAllocationId}
                className={`px-6 py-2 rounded-md font-medium transition ${
                  currentAllocationId
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Delete
              </button>
              
              {/* Update Button */}
              <button
                onClick={handleUpdate}
                disabled={!isFormValid()}
                className={`px-6 py-2 rounded-md font-medium transition ${
                  isFormValid()
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Update Allocation
              </button>
            </>
          ) : (
            <button
              onClick={handleAllocate}
              disabled={!isFormValid()}
              className={`px-6 py-2 rounded-md font-medium transition ${
                isFormValid()
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Allocate Teacher
            </button>
          )}
        </div>
      </div>

      {/* Alert Component */}
      {alert}
    </div>
  );
}
