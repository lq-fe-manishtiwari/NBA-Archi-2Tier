import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import SweetAlert from "react-bootstrap-sweetalert";
import Select from "react-select";
import { SketchPicker } from "react-color";
import { courseService } from "../Services/courses.service";
import { collegeService } from "../../Academics/Services/college.service.js";
import { batchService } from '../../Academics/Services/batch.Service';
import { classService } from '../../Academics/Services/class.service.js'

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
                    className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`}
                />
            </div>

            {isOpen && !disabled && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    <div
                        className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
                        onClick={() => handleSelect(null)}
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

const AddPaper = () => {
    const navigate = useNavigate();
    const [animate, setAnimate] = useState(false);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null);
    const [isDirty, setIsDirty] = useState(false);
    const [isGlobal, setIsGlobal] = useState(false);

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
    const isFetchedRef = useRef(false);

    useEffect(() => setAnimate(true), []);

    // Fetch static dropdowns
    useEffect(() => {
        const fetchAllDropdownData = async () => {
            try {
                const [paperRes, verticalRes, modeRes, specRes] = await Promise.all([
                    courseService.getCoursesPaperTypes(),
                    courseService.getCoursesVerticalNumbers(),
                    courseService.getCoursesSubjectMode(),
                    courseService.getCoursesSpecialization(),
                ]);

                if (paperRes) setPaperTypes(paperRes);
                if (verticalRes) setVerticalNumbers(verticalRes);
                if (modeRes) setSubjectModes(modeRes);
                if (specRes) setSpecializations(specRes);
            } catch (error) {
                console.error("Error fetching dropdown data:", error);
            }
        };

        if (!isFetchedRef.current) {
            fetchAllDropdownData();
            isFetchedRef.current = true;
        }
    }, []);

    // Fetch Programs
    useEffect(() => {
        const fetchPrograms = async () => {
            try {
                const res = await collegeService.getAllprogram();
                console.log("Programs response:", res);
                const formatted = res.map(p => ({
                    label: p.program_name,
                    value: p.program_id,
                    full: p,
                }));
                setProgramOptions(formatted);
            } catch (error) {
                console.error("Error fetching programs:", error);
            }
        };
        fetchPrograms();
    }, []);

    // Fetch Classes & Batches when Program changes - FIXED
    useEffect(() => {
        const loadClasses = async () => {
            if (!formData.program?.value) {
                setClassOptions([]);
                setBatchOptions([]);
                setSemesterOptions([]);
                return;
            }

            try {
                console.log("Fetching classes for program:", formData.program.value);
                
                // Fetch Classes
                const classesRes = await classService.getAllClasses(formData.program.value);
                console.log("Classes API response:", classesRes);

                // Handle the response structure - it seems to be a single object, not array
                let formattedClasses = [];
                
                if (Array.isArray(classesRes)) {
                    formattedClasses = classesRes.map(c => ({
                        label: c.name || `Class ${c.class_year_id}`,
                        value: c.class_year_id,
                        full: c,
                    }));
                } else if (classesRes && typeof classesRes === 'object') {
                    // If it's a single class object (like your example)
                    formattedClasses = [{
                        label: classesRes.name || `Class ${classesRes.class_year_id}`,
                        value: classesRes.class_year_id,
                        full: classesRes,
                    }];
                }
                
                console.log("Formatted classes:", formattedClasses);
                setClassOptions(formattedClasses);

                // Fetch Batches
                try {
                    const batchesRes = await batchService.getBatchByProgramId(formData.program.value);
                    console.log("Batches response:", batchesRes);
                    
                    const formattedBatches = Array.isArray(batchesRes) 
                        ? batchesRes.map(b => ({
                            label: b.batch_name || b.name,
                            value: b.batch_id || b.id,
                            full: b,
                        }))
                        : [];
                    setBatchOptions(formattedBatches);
                } catch (batchError) {
                    console.error("Error fetching batches:", batchError);
                    setBatchOptions([]);
                }

            } catch (error) {
                console.error("Error in loadClasses:", error);
                setClassOptions([]);
                setBatchOptions([]);
                setSemesterOptions([]);
            }
        };
        
        loadClasses();
    }, [formData.program]);

    // Fetch Semesters when Class changes - FIXED based on your API structure
    useEffect(() => {
        if (!formData.class?.value) {
            setSemesterOptions([]);
            return;
        }

        try {
            console.log("Selected class for semesters:", formData.class);
            
            // Use the semesters from the selected class object
            const semesters = formData.class.full?.semesters?.map(sem => ({
                label: sem.name, // "fisrt year" from your example
                value: sem.semester_id, // 128 from your example
                full: sem,
            })) || [];
            
            console.log("Extracted semesters:", semesters);
            setSemesterOptions(semesters);
        } catch (error) {
            console.error("Error setting semesters:", error);
            setSemesterOptions([]);
        }
    }, [formData.class]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setIsDirty(true);
    };

    // Handle custom select changes
    const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        setIsDirty(true);
    };

    const validate = () => {
        const newErrors = {};

        // Only validate these if NOT global
        if (!isGlobal) {
            if (!formData.program) newErrors.program = "Program is required";
            if (!formData.class) newErrors.class = "Class is required";
            if (!formData.semester) newErrors.semester = "Semester is required";
            // if (!formData.batch) newErrors.batch = "Batch is required";
        }

        if (!formData.paperType.trim()) newErrors.paperType = "Paper Type is required";
        if (!formData.vertical.trim()) newErrors.vertical = "Vertical is required";
        if (!formData.paperName.trim()) newErrors.paperName = "Paper Name is required";
        if (!formData.specialization.trim()) newErrors.specialization = "Specialization is required";
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
                // Only include these if NOT global
                ...( !isGlobal && {
                    program_id: formData.program?.value,
                    class_year_id: formData.class?.value,
                    semester_id: formData.semester?.value,
                    batch_id: formData.batch?.value,
                }),
                subject_code: "MATH109",
                name: formData.paperName,
                color_code: formData.colorCode,
                paper_code: formData.paperCode,
                specialization_ids: [parseInt(formData.specialization)],
                credits: formData.credits.toString(),
                mode_ids: formData.subjectMode,
                type_ids: [formData.paperType],
                vertical_ids: [formData.vertical],
            };

            console.log("Submitting Payload →", payload);

            const res = await courseService.saveCourse(payload);

            setAlert(
                <SweetAlert
                    success
                    title="Paper Added!"
                    onConfirm={() => {
                        setAlert(null);
                        navigate("/courses/paper");
                    }}
                    confirmBtnCssClass="btn-confirm"
                >
                    {`${formData.paperName} has been added successfully.`}
                </SweetAlert>
            );
        } catch (error) {
            console.error("Save Course Error:", error);
            setAlert(
                <SweetAlert
                    danger
                    title="Error"
                    onConfirm={() => setAlert(null)}
                    confirmBtnCssClass="btn-confirm"
                >
                    Failed to save paper. Please try again.
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

    const handleConfirmCancel = () => {
        setShowCancelAlert(false);
        navigate("/courses/paper");
    };

    const handleCancelAlert = () => setShowCancelAlert(false);

    return (
        <div className="w-full min-h-screen bg-white p-3 sm:p-6 flex justify-center">
            <div
                className={`w-full sm:max-w-4xl bg-white rounded-2xl shadow-md border border-gray-100 p-6 transform transition-all duration-500 ease-out ${animate ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"
                    }`}
            >
                {/* Close Button */}
                <button
                    onClick={() => navigate("/courses/paper")}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl font-bold"
                >
                    ×
                </button>

                {/* Heading + Global Toggle */}
                <h2 className="text-2xl font-semibold mb-6 text-blue-700 flex items-center gap-4">
                    Add New Paper
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={isGlobal}
                            onChange={(e) => {
                                const checked = e.target.checked;
                                setIsGlobal(checked);
                                if (checked) {
                                    setFormData(prev => ({
                                        ...prev,
                                        program: null,
                                        class: null,
                                        semester: null,
                                        batch: null,
                                    }));
                                }
                                setIsDirty(true);
                            }}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Global Paper</span>
                    </label>
                </h2>

                {/* FORM START */}
                <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">

                    {/* PROGRAM */}
                    {!isGlobal && (
                        <div>
                            <CustomSelect
                                label="Program"
                                value={formData.program}
                                onChange={(value) => handleSelectChange('program', value)}
                                options={programOptions}
                                placeholder="Select Program"
                            />
                            {errors.program && <p className="text-red-500 text-sm mt-1">{errors.program}</p>}
                        </div>
                    )}

                    {/* CLASS */}
                    {!isGlobal && (
                        <div>
                            <CustomSelect
                                label="Class"
                                value={formData.class}
                                onChange={(value) => handleSelectChange('class', value)}
                                options={classOptions}
                                placeholder={classOptions.length === 0 ? "No classes available" : "Select Class"}
                                disabled={!formData.program || classOptions.length === 0}
                            />
                            {errors.class && <p className="text-red-500 text-sm mt-1">{errors.class}</p>}
                        </div>
                    )}

                    {/* SEMESTER */}
                    {!isGlobal && (
                        <div>
                            <CustomSelect
                                label="Semester"
                                value={formData.semester}
                                onChange={(value) => handleSelectChange('semester', value)}
                                options={semesterOptions}
                                placeholder={semesterOptions.length === 0 ? "No semesters available" : "Select Semester"}
                                disabled={!formData.class || semesterOptions.length === 0}
                            />
                            {errors.semester && <p className="text-red-500 text-sm mt-1">{errors.semester}</p>}
                        </div>
                    )}

                    {/* BATCH */}
                    {/* {!isGlobal && (
                        <div>
                            <CustomSelect
                                label="Batch"
                                value={formData.batch}
                                onChange={(value) => handleSelectChange('batch', value)}
                                options={batchOptions}
                                placeholder={batchOptions.length === 0 ? "No batches available" : "Select Batch"}
                                disabled={!formData.program || batchOptions.length === 0}
                            />
                            {errors.batch && <p className="text-red-500 text-sm mt-1">{errors.batch}</p>}
                        </div>
                    )} */}

                    {/* Paper Name */}
                    <div className="sm:col-span-1">
                        <label className="block font-medium mb-1">Paper Name*</label>
                        <input
                            type="text"
                            name="paperName"
                            value={formData.paperName}
                            onChange={handleChange}
                            placeholder="Enter Paper Name"
                            className={`w-full border rounded px-3 py-2 focus:outline-none ${errors.paperName ? "border-red-500" : "border-gray-300"
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
                            className={`w-full border rounded px-3 py-2 focus:outline-none ${errors.paperType ? "border-red-500" : "border-gray-300"
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
                        {verticalNumbers.length > 0 ? (
                            <select
                                name="vertical"
                                value={formData.vertical}
                                onChange={handleChange}
                                className={`w-full border rounded px-3 py-2 focus:outline-none ${errors.vertical ? "border-red-500" : "border-gray-300"}`}
                            >
                                <option value="">Select Vertical</option>
                                {verticalNumbers.map((v) => (
                                    <option key={v.vertical_id} value={v.vertical_id}>
                                        {v.name}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type="text"
                                name="vertical"
                                value={formData.vertical}
                                onChange={handleChange}
                                placeholder="Enter Vertical"
                                className={`w-full border rounded px-3 py-2 focus:outline-none ${errors.vertical ? "border-red-500" : "border-gray-300"}`}
                            />
                        )}
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
                    <div className="sm:col-span-1">
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
                    <div className="sm:col-span-1">
                        <label className="block font-medium mb-1">Specialization*</label>
                        <select
                            name="specialization"
                            value={formData.specialization}
                            onChange={handleChange}
                            className={`w-full border rounded px-3 py-2 focus:outline-none ${errors.specialization ? "border-red-500" : "border-gray-300"
                                }`}
                        >
                            <option value="">Select Specialization</option>
                            {specializations.map((s) => (
                                <option key={s.specialization_id} value={s.specialization_id}>
                                    {s.name}
                                </option>
                            ))}
                        </select>
                        {errors.specialization && (
                            <p className="text-red-500 text-sm mt-1">{errors.specialization}</p>
                        )}
                    </div>

                    {/* Color Code */}
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
                        {errors.colorCode && (
                            <p className="text-red-500 text-sm mt-1">{errors.colorCode}</p>
                        )}
                    </div>

                    {/* Buttons */}
                    <div className="col-span-1 sm:col-span-2 flex flex-col sm:flex-row justify-end gap-3 mt-6">
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
                            {loading ? "Saving..." : "Save"}
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
                    onConfirm={handleConfirmCancel}
                    onCancel={handleCancelAlert}
                    confirmBtnText="OK"
                    cancelBtnText="Cancel"
                    confirmBtnCssClass="btn-confirm"
                    cancelBtnCssClass="btn-cancel"
                >
                    Your data will be lost if you leave this page.
                </SweetAlert>
            )}

            {alert}
        </div>
    );
};

export default AddPaper;