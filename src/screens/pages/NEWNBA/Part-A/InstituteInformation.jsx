import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, FieldArray } from 'formik';
import Modal from "react-modal";
import { Edit, Save, Trash2, Plus, Minus, X } from 'lucide-react';
import SweetAlert from 'react-bootstrap-sweetalert';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { partAService } from '../Services/PartA.service';
import { ReportService } from "../Services/Report.Service";

// Reusable Section Component
const Section = ({ title, children, className = "" }) => (
  <div className={`bg-gray-50 rounded-3xl p-8 shadow-xl mb-8 ${className}`}>
    <h3 className="text-2xl font-bold text-blue-700 mb-6 border-b-4 border-blue-300 pb-4">
      {title}
    </h3>
    {children}
  </div>
);

// Reusable Input Field Component
const InputField = ({ label, name, type = "text", disabled = false, placeholder = "", className = "" }) => (
  <div className={className}>
    <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
    <Field
      name={name}
      type={type}
      disabled={disabled}
      placeholder={placeholder}
      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
    />
  </div>
);

// Reusable Select Field Component
const SelectField = ({ label, name, options, disabled = false, className = "" }) => (
  <div className={className}>
    <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
    <Field
      as="select"
      name={name}
      disabled={disabled}
      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
    >
      {options.map((option, index) => (
        <option key={index} value={option.value || option}>
          {option.label || option}
        </option>
      ))}
    </Field>
  </div>
);

// Reusable Number Field Component (prevents negative numbers)
const NumberField = ({ name, disabled, className = "", placeholder = "0" }) => (
  <Field
    name={name}
    type="number"
    min="0"
    onKeyDown={(e) => {
      if (e.key === '-' || e.key === 'e' || e.key === 'E') e.preventDefault();
    }}
    disabled={disabled}
    className={className}
    placeholder={placeholder}
  />
);

export default function InstituteInformation() {
  const location = useLocation();
  const navigate = useNavigate();
  const stateFromRoute = location.state || {};

  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(null);

  // Extract parameters from route state
  const partAId = stateFromRoute.nba_accredited_program_id || stateFromRoute.cycleId;
  const collegeId = stateFromRoute.collegeId;
  const programId = stateFromRoute.programId;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const s3DocumentUrl =
    "https://wccdm.s3.ap-south-1.amazonaws.com/nba/1765291566-merged_vertical_aligned.png";

  console.log("🔍 InstituteInformation - Route state:", stateFromRoute);
  console.log("🔍 InstituteInformation - Parameters:", { partAId, collegeId, programId });

  // Function to map API response to form structure
  const mapApiDataToForm = (apiData) => {
    console.log("🔍 Determining API format for data:", apiData);

    // Check if this is the new API format (flat structure) or legacy format (part_a/part_b)
    const isNewApiFormat = !apiData.part_a && !apiData.part_b && (apiData.cycle_id !== undefined || apiData.college_id !== undefined);

    console.log("🔍 Is new API format:", isNewApiFormat);

    if (isNewApiFormat) {
      // Handle new API format (flat structure)
      return mapNewApiFormat(apiData);
    } else {
      // Handle legacy API format (part_a/part_b structure)
      return mapLegacyApiFormat(apiData);
    }
  };

  // Function to map new API format (flat structure)
  const mapNewApiFormat = (apiData) => {
    console.log("🔍 Mapping new API data:", apiData);

    const mappedData = {
      // Basic information - mapping from snake_case API response
      programId: apiData.program_id || "",
      programName: apiData.program_name || "",
      instituteName: apiData.institute_name || apiData.college_name || "",
      year_of_establishment: apiData.year_of_establishment || "",

      // Address details
      location: apiData.location || "",
      city: apiData.city || "",
      state: apiData.state || "",
      pinCode: apiData.pin_code || "",
      website: apiData.website || "",
      email: apiData.email || "",
      phone: apiData.phone || "",

      // Head details
      headName: apiData.head_name || "",
      headDesignation: apiData.head_designation || "",
      headStatus: apiData.head_status || "",
      headMobile: apiData.head_mobile || "",
      headEmail: apiData.head_email || "",

      // University details
      university_name: apiData.university_name || "",
      university_address: apiData.university_address || "",
      institution_types: apiData.institution_types || "University",
      ownership_types: apiData.ownership_types || "Grant-in-Aid",

      // Programs
      numUGPrograms: apiData.num_ugprograms || 0,
      numPGPrograms: apiData.num_pgprograms || 0,

      // Program information
      b1_program_information: apiData.b1_program_information || {
        program_name: "",
        year_of_start: "",
        sanctioned_intake: "",
        increase_decrease: "",
        increase_decrease_year: "",
        aicte_approval_letter: "",
        accreditation_status: "Not accredited",
        accreditation_details: "",
      },

      // Faculty Details
      b2a_faculty_details: apiData.b2a_faculty_details || [],

      // Department Information
      b21_department_name: apiData.b21_department_name || "",
      b21_no_of_allied_departments: apiData.b21_no_of_allied_departments || "",
      b21_no_of_ug_programs: apiData.b21_no_of_ug_programs || "",
      b21_no_of_pg_programs: apiData.b21_no_of_pg_programs || "",

      // Faculty Cadre Table
      b21_faculty_cadre_table: apiData.b21_faculty_cadre_table || {
        cay: {
          professors_phd_regular: "",
          professors_phd_contract: "",
          assoc_prof_phd_regular: "",
          assoc_prof_phd_contract: "",
          assistant_professors_regular: "",
          assistant_professors_contract: "",
          total_phd_faculty: 0,
        },
        caym1: {
          professors_phd_regular: "",
          professors_phd_contract: "",
          assoc_prof_phd_regular: "",
          assoc_prof_phd_contract: "",
          assistant_professors_regular: "",
          assistant_professors_contract: "",
          total_phd_faculty: 0,
        },
      },

      // HOD Details
      b22_hod_details: apiData.b22_hod_details || {
        name: "",
        nature_of_appointment: "Regular",
        qualification: "Ph.D.",
        qualification_other: "",
      },

      // SFR Information
      b3_sfr_list: apiData.b3_sfr_list || [
        { type: "UG", name: "", b: "", c: "", d: "" },
        { type: "PG", name: "", a: "", b: "" },
      ],

      sfr_summary: apiData.sfr_summary || [
        { year: "cay", students: "", faculty: "", sfr: "" },
        { year: "caym1", students: "", faculty: "", sfr: "" },
        { year: "caym2", students: "", faculty: "", sfr: "" },
      ],

      pre_visit_qualifiers: apiData.pre_visit_qualifiers || [
        { sn: 1, description: "AICTE approval for last 5 years", status: "Complied" },
        { sn: 2, description: "Average SFR ≤ 25:1 over 3 years", status: "Not Complied" },
        { sn: 3, description: "Required Professor/Assoc Prof with Ph.D (Case 1/2)", status: "Not Complied" },
        { sn: 4, description: "≥10% faculty with Ph.D (avg over CAY & CAYm1)", status: "Not Complied" },
        { sn: 5, description: "At least two batches passed out", status: "Not Complied" },
      ],

      remarks: apiData.remarks || "",

      // Dynamic sections
      other_academic_institutions: apiData.other_academic_institutions || [],
      programs_offered_details: apiData.programs_offered_details || [],
      programs_for_accreditation: apiData.programs_for_accreditation || [],
      allied_departments_accreditation: apiData.allied_departments_accreditation || [],
      faculty_members_departments: apiData.faculty_members_departments || [],
      engineering_students_departments: apiData.engineering_students_departments || [],

      // Vision and Mission
      vision_of_institution: apiData.vision_of_institution || "",
      mission_of_institution: apiData.mission_of_institution || "",

      // Contact Information
      head_of_institution: apiData.head_of_institution || {
        name: "",
        designation: "",
        mobile_number: "",
        email_id: ""
      },
      nba_coordinator: apiData.nba_coordinator || {
        name: "",
        designation: "",
        mobile_number: "",
        email_id: ""
      },
    };

    console.log("🔄 Mapped data result:", mappedData);
    return mappedData;
  };

  // Function to map legacy API format (part_a/part_b structure)
  const mapLegacyApiFormat = (apiData) => {
    const partA = apiData.part_a || {};
    const partB = apiData.part_b || {};

    // Helper function to get value from label-value array
    const getValueByLabel = (array, label) => {
      if (!Array.isArray(array)) return "";
      const item = array.find(item => item.label === label);
      return item ? item.value : "";
    };

    // Helper function to get first item from array
    const getFirstItem = (array, key = null) => {
      if (!Array.isArray(array) || array.length === 0) return key ? "" : {};
      return key ? array[0][key] || "" : array[0];
    };

    return {
      // Part A - Institute Information from API
      programId: partA.program_id || "",
      programName: partA.program_name || "",
      instituteName: getValueByLabel(partA.name_of_institute, "institute_name"),
      year_of_establishment: getValueByLabel(partA.name_of_institute, "year_of_establishment"),

      // Address details
      location: getFirstItem(partA.institute_address, "address_line"),
      city: getFirstItem(partA.institute_address, "city"),
      state: getFirstItem(partA.institute_address, "state"),
      pinCode: getFirstItem(partA.institute_address, "pincode"),
      website: getFirstItem(partA.institute_address, "website"),
      email: getFirstItem(partA.institute_address, "email"),
      phone: getFirstItem(partA.institute_address, "phone"),

      // Head details
      headName: getFirstItem(partA.institution_head_details, "name"),
      headDesignation: getFirstItem(partA.institution_head_details, "designation"),
      headStatus: getFirstItem(partA.institution_head_details, "status"),
      headMobile: getFirstItem(partA.institution_head_contact_details, "phone"),
      headEmail: getFirstItem(partA.institution_head_contact_details, "email"),

      // University and institution type
      university_name: "",
      university_address: "",
      institution_types: getFirstItem(partA.institution_types, "type") || "University",
      ownership_types: getFirstItem(partA.ownership_types, "type") || "Grant-in-Aid",

      // Programs
      numUGPrograms: parseInt(partA.no_ug_programs) || 0,
      numPGPrograms: parseInt(partA.no_pg_programs) || 0,
      programs_offered: partA.programs_offered || [],
      programs_applied: partA.programs_applied || [],
      allied_departments: partA.allied_departments || [],

      // Part B data mapping
      b1_program_information: partB.b1_program_table && partB.b1_program_table[0] ? {
        program_name: partB.b1_program_table[0].program_name || "",
        year_of_start: partB.b1_program_table[0].year_of_start || "",
        sanctioned_intake: partB.b1_program_table[0].sanctioned_intake || "",
        increase_decrease: partB.b1_program_table[0].increase_decrease || "",
        increase_decrease_year: partB.b1_program_table[0].increase_decrease_year || "",
        aicte_approval_letter: partB.b1_program_table[0].aicte_approval_letter || "",
        accreditation_status: partB.b1_program_table[0].accreditation_status || "Not accredited",
        accreditation_details: partB.b1_program_table[0].accreditation_details || "",
      } : {
        program_name: "",
        year_of_start: "",
        sanctioned_intake: "",
        increase_decrease: "",
        increase_decrease_year: "",
        aicte_approval_letter: "",
        accreditation_status: "Not accredited",
        accreditation_details: "",
      },

      // Faculty Details
      b2a_faculty_details: partB.b2_faculty_details_table || [],

      // Department Information
      b21_department_name: partB.department_name || "",
      b21_no_of_allied_departments: partB.no_allied_departments || "",
      b21_no_of_ug_programs: partB.no_ug_programs || "",
      b21_no_of_pg_programs: partB.no_pg_programs || "",

      // Faculty Cadre Table
      b21_faculty_cadre_table: {
        cay: partB.b21_faculty_cadre_table && partB.b21_faculty_cadre_table[0] ? {
          professors_phd_regular: partB.b21_faculty_cadre_table[0].professors_phd_regular || "",
          professors_phd_contract: partB.b21_faculty_cadre_table[0].professors_phd_contract || "",
          assoc_prof_phd_regular: partB.b21_faculty_cadre_table[0].assoc_prof_phd_regular || "",
          assoc_prof_phd_contract: partB.b21_faculty_cadre_table[0].assoc_prof_phd_contract || "",
          assistant_professors_regular: partB.b21_faculty_cadre_table[0].assistant_professors_regular || "",
          assistant_professors_contract: partB.b21_faculty_cadre_table[0].assistant_professors_contract || "",
          total_phd_faculty: partB.b21_faculty_cadre_table[0].total_phd_faculty || 0,
        } : {
          professors_phd_regular: "",
          professors_phd_contract: "",
          assoc_prof_phd_regular: "",
          assoc_prof_phd_contract: "",
          assistant_professors_regular: "",
          assistant_professors_contract: "",
          total_phd_faculty: 0,
        },
        caym1: partB.b21_faculty_cadre_table && partB.b21_faculty_cadre_table[1] ? {
          professors_phd_regular: partB.b21_faculty_cadre_table[1].professors_phd_regular || "",
          professors_phd_contract: partB.b21_faculty_cadre_table[1].professors_phd_contract || "",
          assoc_prof_phd_regular: partB.b21_faculty_cadre_table[1].assoc_prof_phd_regular || "",
          assoc_prof_phd_contract: partB.b21_faculty_cadre_table[1].assoc_prof_phd_contract || "",
          assistant_professors_regular: partB.b21_faculty_cadre_table[1].assistant_professors_regular || "",
          assistant_professors_contract: partB.b21_faculty_cadre_table[1].assistant_professors_contract || "",
          total_phd_faculty: partB.b21_faculty_cadre_table[1].total_phd_faculty || 0,
        } : {
          professors_phd_regular: "",
          professors_phd_contract: "",
          assoc_prof_phd_regular: "",
          assoc_prof_phd_contract: "",
          assistant_professors_regular: "",
          assistant_professors_contract: "",
          total_phd_faculty: 0,
        },
      },

      // HOD Details
      b22_hod_details: {
        name: partB.hod_name || "",
        nature_of_appointment: partB.hod_nature_of_appointment || "Regular",
        qualification: partB.hod_qualification || "Ph.D.",
        qualification_other: "",
      },

      // SFR Information
      b3_sfr_list: partB.b3_sfr_table || [
        { type: "UG", name: "", b: "", c: "", d: "" },
        { type: "PG", name: "", a: "", b: "" },
      ],

      sfr_summary: partB.sfr_summary || [
        { year: "cay", students: "", faculty: "", sfr: "" },
        { year: "caym1", students: "", faculty: "", sfr: "" },
        { year: "caym2", students: "", faculty: "", sfr: "" },
      ],

      pre_visit_qualifiers: partB.pre_visit_qualifiers || [
        { sn: 1, description: "AICTE approval for last 5 years", status: "Complied" },
        { sn: 2, description: "Average SFR ≤ 25:1 over 3 years", status: "Not Complied" },
        { sn: 3, description: "Required Professor/Assoc Prof with Ph.D (Case 1/2)", status: "Not Complied" },
        { sn: 4, description: "≥10% faculty with Ph.D (avg over CAY & CAYm1)", status: "Not Complied" },
        { sn: 5, description: "At least two batches passed out", status: "Not Complied" },
      ],

      remarks: partB.remarks || "",

      // Map dynamic sections from API data
      other_academic_institutions: [],
      programs_offered_details: partA.programs_offered ? partA.programs_offered.map(program => ({
        program_name: program.program_name || "",
        year_of_start: program.year_of_start || "",
        sanctioned_intake: "",
        intake_change: "",
        year_of_change: "",
        approval_details: "",
        accreditation_status: "",
        times_accredited: ""
      })) : [],
      programs_for_accreditation: partA.programs_applied ? partA.programs_applied.map(program => ({
        cluster_id: program.cluster_id || "",
        department_name: program.department || "",
        program_name: program.program_name || ""
      })) : [],
      allied_departments_accreditation: partA.allied_departments ? partA.allied_departments.map(dept => ({
        cluster_id: dept.cluster_id || "",
        department_name: "",
        allied_departments: dept.departments || ""
      })) : [],
      faculty_members_departments: [],
      engineering_students_departments: [],
      faculty_cadre_rows: [],

      // Vision and Mission (empty as not in API)
      vision_of_institution: "",
      mission_of_institution: "",

      // Contact Information (using head details from Part A)
      head_of_institution: {
        name: getFirstItem(partA.institution_head_details, "name"),
        designation: getFirstItem(partA.institution_head_details, "designation"),
        mobile_number: getFirstItem(partA.institution_head_contact_details, "phone"),
        email_id: getFirstItem(partA.institution_head_contact_details, "email")
      },
      nba_coordinator: {
        name: "",
        designation: "",
        mobile_number: "",
        email_id: ""
      },
    };
  };

  // Fetch data when component mounts
  useEffect(() => {
    if (partAId && collegeId && programId) {
      fetchInstituteData();
    } else {
      console.warn("🚨 Missing required parameters:", { partAId, collegeId, programId });
      setLoading(false);
    }
  }, [partAId, collegeId, programId]);

  // Function to fetch institute data from API
  const fetchInstituteData = async () => {
    try {
      setLoading(true);
      console.log("🔍 Fetching institute data with params:", { partAId, collegeId, programId });

      // Try new API first, fallback to legacy API if response is empty
      let response;
      try {
        response = await partAService.getInstituteInformation(partAId, collegeId, programId);
        console.log("✅ Institute data fetched successfully (new API):", response);

        // Check if response has meaningful data or just null values
        // If most important fields are null, consider it as empty and use legacy API
        const hasNullData = response.institute_name === null &&
          response.location === null &&
          response.city === null &&
          response.state === null &&
          response.email === null &&
          response.phone === null &&
          response.b1_program_information === null &&
          response.other_academic_institutions === null &&
          response.vision_of_institution === null &&
          response.mission_of_institution === null;

        console.log("🔍 Checking if data is empty - hasNullData:", hasNullData);

        const isEmpty = !response ||
          Object.keys(response).length === 0 ||
          (response.cycle_id === undefined && response.college_id === undefined && !response.part_a && !response.part_b) ||
          hasNullData;

        console.log("🔍 Final isEmpty result:", isEmpty);

        if (isEmpty) {
          console.warn("⚠️ New API returned empty data, trying legacy API");
          response = await partAService.getPrequalifierCombinedData(partAId, collegeId, programId);
          console.log("✅ Institute data fetched successfully (legacy API):", response);
        }
      } catch (newApiError) {
        console.warn("⚠️ New API failed, trying legacy API:", newApiError);
        response = await partAService.getPrequalifierCombinedData(partAId, collegeId, programId);
        console.log("✅ Institute data fetched successfully (legacy API):", response);
      }

      if (response) {
        // Map API response to form structure
        const mappedData = mapApiDataToForm(response);
        console.log("🔄 Mapped form data:", mappedData);
        setFormData(mappedData);
      } else {
        console.warn("⚠️ No data received from API");
        setFormData(getInitialValues());
      }
    } catch (error) {
      console.error("❌ Error fetching institute data:", error);
      setAlert(
        <SweetAlert
          danger
          title="Error!"
          onConfirm={() => setAlert(null)}
          confirmBtnCssClass="btn-confirm"
        >
          Failed to load institute information. Please try again.
        </SweetAlert>
      );
      setFormData(getInitialValues());
    } finally {
      setLoading(false);
    }
  };

  // Initial form values combining both Part A and Part B structures
  const getInitialValues = () => ({
    // Part A - Institute Information
    programId: "",
    programName: "",
    instituteName: "",
    year_of_establishment: "",
    location: "",
    city: "",
    state: "",
    pinCode: "",
    website: "",
    email: "",
    phone: "",
    headName: "",
    headDesignation: "",
    headStatus: "",
    headMobile: "",
    headEmail: "",
    university_name: "",
    university_address: "",
    institution_types: "University",
    ownership_types: "Grant-in-Aid",
    numUGPrograms: 0,
    numPGPrograms: 0,

    // Programs offered and applied
    programs_offered: [],
    programs_applied: [],
    allied_departments: [{ cluster_id: "", departments: "" }],

    // Part B - Program Information
    b1_program_information: {
      program_name: "",
      year_of_start: "",
      sanctioned_intake: "",
      increase_decrease: "",
      increase_decrease_year: "",
      aicte_approval_letter: "",
      accreditation_status: "Not accredited",
      accreditation_details: "",
    },

    // Faculty Details
    b2a_faculty_details: [],

    // Department Information
    b21_department_name: "",
    b21_no_of_allied_departments: "",
    b21_no_of_ug_programs: "",
    b21_no_of_pg_programs: "",

    // Faculty Cadre Table
    b21_faculty_cadre_table: {
      cay: {
        professors_phd_regular: "",
        professors_phd_contract: "",
        assoc_prof_phd_regular: "",
        assoc_prof_phd_contract: "",
        assistant_professors_regular: "",
        assistant_professors_contract: "",
        total_phd_faculty: 0,
      },
      caym1: {
        professors_phd_regular: "",
        professors_phd_contract: "",
        assoc_prof_phd_regular: "",
        assoc_prof_phd_contract: "",
        assistant_professors_regular: "",
        assistant_professors_contract: "",
        total_phd_faculty: 0,
      },
    },

    // Dynamic Faculty Cadre Rows
    faculty_cadre_rows: [],

    // Other Academic Institutions Run by Trust/Society
    other_academic_institutions: [],

    // Programs being offered by the institution
    programs_offered_details: [],

    // Programs to be considered for accreditation (Table A8.1)
    programs_for_accreditation: [],

    // Allied departments (Table A8.2)
    allied_departments_accreditation: [],

    // Faculty members in various departments (Table A9)
    faculty_members_departments: [],

    // Engineering students in various departments (Table A10)
    engineering_students_departments: [],

    // Vision and Mission
    vision_of_institution: "",
    mission_of_institution: "",

    // Contact Information
    head_of_institution: {
      name: "",
      designation: "",
      mobile_number: "",
      email_id: ""
    },
    nba_coordinator: {
      name: "",
      designation: "",
      mobile_number: "",
      email_id: ""
    },

    // HOD Details
    b22_hod_details: {
      name: "",
      nature_of_appointment: "Regular",
      qualification: "Ph.D.",
      qualification_other: "",
    },

    // SFR Information
    b3_sfr_list: [
      { type: "UG", name: "", b: "", c: "", d: "" },
      { type: "PG", name: "", a: "", b: "" },
    ],

    sfr_summary: [
      { year: "cay", students: "", faculty: "", sfr: "" },
      { year: "caym1", students: "", faculty: "", sfr: "" },
      { year: "caym2", students: "", faculty: "", sfr: "" },
    ],

    pre_visit_qualifiers: [
      { sn: 1, description: "AICTE approval for last 5 years", status: "Complied" },
      { sn: 2, description: "Average SFR ≤ 25:1 over 3 years", status: "Not Complied" },
      { sn: 3, description: "Required Professor/Assoc Prof with Ph.D (Case 1/2)", status: "Not Complied" },
      { sn: 4, description: "≥10% faculty with Ph.D (avg over CAY & CAYm1)", status: "Not Complied" },
      { sn: 5, description: "At least two batches passed out", status: "Not Complied" },
    ],

    remarks: "",
  });

  const handleSubmit = async (values) => {
    setIsSaving(true);
    try {
      console.log("📤 Submitting form with values:", values);

      // Prepare the payload for the new API
      const payload = {
        partAId: partAId,
        collegeId: collegeId,
        programId: programId || values.programId,
        ...values
      };

      let response;

      // Check if this is an update (data already exists) or create (new data)
      if (formData && Object.keys(formData).length > 0 && formData.instituteName) {
        // Update existing data
        response = await partAService.updateInstituteInformation(partAId, collegeId, programId, payload);
        console.log("✅ Institute information updated successfully:", response);
      } else {
        // Create new data
        response = await partAService.saveInstituteInformation(payload);
        console.log("✅ Institute information saved successfully:", response);
      }

      setIsEditMode(false);
      setAlert(
        <SweetAlert
          success
          title="Success!"
          onConfirm={() => setAlert(null)}
          confirmBtnCssClass="btn-confirm"
        >
          Institute information saved successfully!
        </SweetAlert>
      );

      // Refresh the data after successful save
      await fetchInstituteData();

    } catch (error) {
      console.error("❌ Error saving institute information:", error);
      setAlert(
        <SweetAlert
          danger
          title="Error!"
          onConfirm={() => setAlert(null)}
          confirmBtnCssClass="btn-confirm"
        >
          Failed to save institute information. Please try again.
        </SweetAlert>
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Function to handle delete institute information
  const handleDelete = async () => {
    setAlert(
      <SweetAlert
        warning
        showCancel
        confirmBtnText="Yes, Delete!"
        cancelBtnText="Cancel"
        confirmBtnBsStyle="danger"
        title="Are you sure?"
        onConfirm={confirmDelete}
        onCancel={() => setAlert(null)}
        focusCancelBtn
        confirmBtnCssClass="btn-confirm"
        cancelBtnCssClass="btn-cancel"
      >
        This will permanently delete all institute information. This action cannot be undone!
      </SweetAlert>
    );
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      console.log("🗑️ Deleting institute information with params:", { partAId, collegeId, programId });

      const response = await partAService.deleteInstituteInformation(partAId, collegeId, programId);
      console.log("✅ Delete API response:", response);

      // Handle plain text response from API
      const message = typeof response === 'string' ? response : 'Institute information deleted successfully!';

      setAlert(
        <SweetAlert
          success
          title="Deleted!"
          onConfirm={() => {
            setAlert(null);
            // Navigate back to the previous page or dashboard
            navigate(-1);
          }}
          confirmBtnCssClass="btn-confirm"
        >
          {message}
        </SweetAlert>
      );

    } catch (error) {
      console.error("❌ Error deleting institute information:", error);

      // Handle error response - could be plain text or JSON
      let errorMessage = "Failed to delete institute information. Please try again.";
      if (typeof error === 'string') {
        errorMessage = error;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.response && typeof error.response === 'string') {
        errorMessage = error.response;
      }

      setAlert(
        <SweetAlert
          danger
          title="Error!"
          onConfirm={() => setAlert(null)}
          confirmBtnCssClass="btn-confirm"
        >
          {errorMessage}
        </SweetAlert>
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      // Collect all cycleSubCategoryId values from keyIndicators
      // const cycleSubCategoryIds = keyIndicators.map(indicator => indicator.subLevel2Id);

      // if (cycleSubCategoryIds.length === 0) {
      //   alert("No criteria sections available to generate report.");
      //   return;
      // }

      // console.log("🔍 Generating report for cycleSubCategoryIds:", cycleSubCategoryIds);

      // Call the report service with the collected IDs
      const response = await ReportService.getReportPARTAInstiInfo(partAId);

      // Handle the blob response for file download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `PARTAInstitutionalInformation_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Error generating report:", error);
      alert("Failed to generate report. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-3xl font-bold text-blue-700">Loading Institute Information...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-6 py-10">

        <div className="mb-6 max-w-[1200px] mx-auto flex justify-end">
          <div className="flex flex-col items-end gap-4">

            <div className="flex items-center gap-3">
              <button
                onClick={handleGenerateReport}
                className="bg-[#2163c1] hover:bg-[#1a4f9a] text-white font-medium px-4 py-2 rounded-md shadow-md transition-all hover:shadow-lg"
              >
                PART - A. R
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-md shadow-md transition-all hover:shadow-lg"
              >
                ER
              </button>
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-3 bg-[#2163c1] text-white rounded-xl font-medium shadow-lg hover:bg-[#1a4f9a] transition flex items-center gap-2"
              >
                ← Back
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={isEditMode || isDeleting || !formData || Object.keys(formData).length === 0}
                className={`
                  w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white transition-all
                  ${isEditMode || isDeleting || !formData || Object.keys(formData).length === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700"}`}
                title={isDeleting ? "Deleting..." : "Delete Institute Information"}
              >
                <Trash2 size={20} strokeWidth={2.5} />
              </button>

              {isEditMode ? (
                <button
                  onClick={() => setIsEditMode(false)}
                  className="w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white bg-gray-600 hover:bg-gray-700 transition-all"
                  title="Cancel Editing"
                >
                  <X size={22} strokeWidth={2.5} />
                </button>
              ) : (
                <button
                  onClick={() => setIsEditMode(true)}
                  className="w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white bg-blue-600 hover:bg-blue-700 transition-all"
                  title="Edit Institute Information"
                >
                  <Edit size={22} strokeWidth={2.5} />
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Main Form Container */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden relative max-w-[1200px] mx-auto">
          <div className="p-6 md:p-12">
            <Formik
              initialValues={formData || getInitialValues()}
              enableReinitialize={true}
              onSubmit={handleSubmit}
            >
              {({ values, setFieldValue }) => {

                // Auto-calculate Total PhD Faculty
                const calculateTotalPhd = (year) => {
                  const data = values.b21_faculty_cadre_table?.[year];
                  if (!data) return 0;

                  const regProf = parseInt(data.professors_phd_regular) || 0;
                  const conProf = parseInt(data.professors_phd_contract) || 0;
                  const regAssoc = parseInt(data.assoc_prof_phd_regular) || 0;
                  const conAssoc = parseInt(data.assoc_prof_phd_contract) || 0;

                  return regProf + conProf + regAssoc + conAssoc;
                };

                const totalPhdCAY = calculateTotalPhd("cay");
                const totalPhdCAYm1 = calculateTotalPhd("caym1");

                // Auto-calculate faculty totals for each department
                React.useEffect(() => {
                  values.faculty_members_departments?.forEach((dept, index) => {
                    const cayTotal = (parseInt(dept.cay_professors) || 0) + (parseInt(dept.cay_associate_professors) || 0) + (parseInt(dept.cay_assistant_professors) || 0);
                    const caym1Total = (parseInt(dept.caym1_professors) || 0) + (parseInt(dept.caym1_associate_professors) || 0) + (parseInt(dept.caym1_assistant_professors) || 0);
                    const caym2Total = (parseInt(dept.caym2_professors) || 0) + (parseInt(dept.caym2_associate_professors) || 0) + (parseInt(dept.caym2_assistant_professors) || 0);

                    if (dept.cay_total !== cayTotal) setFieldValue(`faculty_members_departments.${index}.cay_total`, cayTotal);
                    if (dept.caym1_total !== caym1Total) setFieldValue(`faculty_members_departments.${index}.caym1_total`, caym1Total);
                    if (dept.caym2_total !== caym2Total) setFieldValue(`faculty_members_departments.${index}.caym2_total`, caym2Total);
                  });
                }, [values.faculty_members_departments]);

                return (
                  <Form className="space-y-8">

                    {/* PART A - INSTITUTE PROFILE */}
                    <div className="bg-gradient-to-r from-blue-50 to-blue-50 rounded-3xl p-8 border-2 border-blue-200">
                      <h2 className="text-3xl font-bold text-center text-primary-600 mb-8">
                        PART A - Institutional Information
                      </h2>

                      {/* A1 - Institute Basic Information */}
                      <Section title="1. Name and Address of the  Institution">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <InputField label="Name of  Institution" name="instituteName" disabled={!isEditMode} />
                          <InputField label="Year of Establishment" name="year_of_establishment" disabled={!isEditMode} />
                          <InputField label="Location" name="location" disabled={!isEditMode} />
                        </div>
                      </Section>

                      {/* A2 - Institution Type */}
                      <Section title="2. Type of Institution & Ownership Status">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">

                          <div>
                            <SelectField
                              label="Type of Institution"
                              name="institution_types"
                              options={[
                                "Institute of National Importance",
                                "Deemed to be University",
                                "University",
                                "Autonomous",
                                "Non-Autonomous (Affiliated)",
                                "Any Other (Please specify*)"
                              ]}
                              disabled={!isEditMode}
                            />
                            {values.institution_types === "Any Other (Please specify*)" && (
                              <div className="mt-4">
                                <InputField
                                  label="Please specify Institution Type"
                                  name="institution_type_other"
                                  placeholder="Enter institution type"
                                  disabled={!isEditMode}
                                />
                              </div>
                            )}
                          </div>
                          <div>
                            <SelectField
                              label="Ownership Status"
                              name="ownership_types"
                              options={[
                                "Central Government",
                                "State Government",
                                "Grant-in-Aid",
                                "Self-financing Trust",
                                "Any Other (Please specify*)"
                              ]}
                              disabled={!isEditMode}
                            />
                            {values.ownership_types === "Any Other (Please specify*)" && (
                              <div className="mt-4">
                                <InputField
                                  label="Please specify Ownership Status"
                                  name="ownership_type_other"
                                  placeholder="Enter ownership status"
                                  disabled={!isEditMode}
                                />
                              </div>
                            )}
                          </div>

                        </div>
                      </Section>

                      {/* 3 - Address Details */}
                      <Section title="3. Name and Address of the Affiliating University">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          <InputField label="Name" name="university_name" disabled={!isEditMode} />
                          <InputField label="Address" name="university_address" disabled={!isEditMode} />
                        </div>
                      </Section>

                      <Section title="4. Other Academic Institutions Run by Trust/Society/etc, if any:">
                        <FieldArray name="other_academic_institutions">
                          {({ push, remove }) => (
                            <div className="space-y-4">
                              <div className="overflow-x-auto">
                                <table className="min-w-full border-collapse border border-gray-300 text-sm table-fixed">
                                  <thead className="bg-blue-100">
                                    <tr>
                                      <th className="border px-4 py-3 w-16">S.N.</th>
                                      <th className="border px-4 py-3">Name of the Institution(s)</th>
                                      <th className="border px-4 py-3">Year of Establishment</th>
                                      <th className="border px-4 py-3">Programs of Study</th>
                                      <th className="border px-4 py-3">Location</th>
                                      <th className={`border px-4 py-3 w-20 ${!isEditMode ? 'hidden' : ''}`}>Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {values.other_academic_institutions?.length > 0 ? (
                                      values.other_academic_institutions.map((institution, index) => (
                                        <tr key={index} className="bg-gray-50">
                                          <td className="border px-4 py-3 text-center font-medium">{index + 1}</td>
                                          <td className="border px-4 py-3">
                                            <Field
                                              name={`other_academic_institutions.${index}.institution_name`}
                                              disabled={!isEditMode}
                                              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                              placeholder="Enter institution name"
                                            />
                                          </td>
                                          <td className="border px-4 py-3">
                                            <Field
                                              name={`other_academic_institutions.${index}.year_of_establishment`}
                                              disabled={!isEditMode}
                                              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                              placeholder="e.g., 2010"
                                            />
                                          </td>
                                          <td className="border px-4 py-3">
                                            <Field
                                              name={`other_academic_institutions.${index}.programs_of_study`}
                                              disabled={!isEditMode}
                                              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                              placeholder="e.g., Engineering, Management"
                                            />
                                          </td>
                                          <td className="border px-4 py-3">
                                            <Field
                                              name={`other_academic_institutions.${index}.location`}
                                              disabled={!isEditMode}
                                              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                              placeholder="Enter location"
                                            />
                                          </td>
                                          <td className={`border px-4 py-3 text-center ${!isEditMode ? 'hidden' : ''}`}>
                                            <button
                                              type="button"
                                              onClick={() => remove(index)}
                                              className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                                              title="Remove Institution"
                                              disabled={!isEditMode}
                                            >
                                              <Minus size={16} />
                                            </button>
                                          </td>
                                        </tr>
                                      ))
                                    ) : (
                                      <tr>
                                        <td colSpan={6} className="border px-4 py-8 text-center text-gray-500 italic">
                                          No other academic institutions added yet.
                                          {isEditMode && " Click the + button below to add institutions."}
                                        </td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>

                              {isEditMode && (
                                <div className="flex justify-center mt-4">
                                  <button
                                    type="button"
                                    onClick={() => push({
                                      institution_name: "",
                                      year_of_establishment: "",
                                      programs_of_study: "",
                                      location: ""
                                    })}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                                  >
                                    <Plus size={16} />
                                    Add Institution
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </FieldArray>
                      </Section>


                      <Section title="5. Details of all the Programs being Offered by the Institution">
                        <FieldArray name="programs_offered_details">
                          {({ push, remove }) => (
                            <div className="space-y-4">
                              <div className="w-full overflow-x-scroll pb-2">
                                <table className="min-w-[1600px] border-collapse border border-gray-300 text-sm">
                                  <thead className="bg-blue-100 sticky top-0 z-10">
                                    <tr>
                                      <th className="border px-4 py-3">S.N.</th>
                                      <th className="border px-10 py-3">Program Name</th>
                                      <th className="border px-10 py-3">Year of start</th>
                                      <th className="border px-4 py-3">Sanctioned Intake</th>
                                      <th className="border px-4 py-3">Increase/decrease in intake, if any</th>
                                      <th className="border px-4 py-3">Year of increase/decrease</th>
                                      <th className="border px-4 py-3">AICTE/Approval details</th>
                                      <th className="border px-4 py-3">Accreditation Status*</th>
                                      <th className="border px-4 py-3">No. of times program accredited</th>
                                      {isEditMode && <th className="border px-4 py-3">Actions</th>}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {values.programs_offered_details?.length > 0 ? (
                                      values.programs_offered_details.map((program, index) => (
                                        <tr key={index} className="bg-gray-50">
                                          <td className="border px-4 py-3 text-center font-medium">{index + 1}</td>
                                          <td className="border px-4 py-3">
                                            <Field
                                              name={`programs_offered_details.${index}.program_name`}
                                              disabled={!isEditMode}
                                              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                              placeholder="e.g., B.Tech CSE"
                                            />
                                          </td>
                                          <td className="border px-4 py-3">
                                            <Field
                                              name={`programs_offered_details.${index}.year_of_start`}
                                              disabled={!isEditMode}
                                              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                              placeholder="e.g., 2010"
                                            />
                                          </td>
                                          <td className="border px-4 py-3">
                                            <Field
                                              name={`programs_offered_details.${index}.sanctioned_intake`}
                                              type="number"
                                              disabled={!isEditMode}
                                              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                              placeholder="e.g., 60"
                                            />
                                          </td>
                                          <td className="border px-4 py-3">
                                            <Field
                                              name={`programs_offered_details.${index}.intake_change`}
                                              disabled={!isEditMode}
                                              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                              placeholder="e.g., +30 or -10"
                                            />
                                          </td>
                                          <td className="border px-4 py-3">
                                            <Field
                                              name={`programs_offered_details.${index}.year_of_change`}
                                              disabled={!isEditMode}
                                              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                              placeholder="e.g., 2015"
                                            />
                                          </td>
                                          <td className="border px-4 py-3">
                                            <Field
                                              name={`programs_offered_details.${index}.approval_details`}
                                              disabled={!isEditMode}
                                              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                              placeholder="AICTE approval details"
                                            />
                                          </td>
                                          <td className="border px-4 py-3">
                                            <Field

                                              name={`programs_offered_details.${index}.accreditation_status`}
                                              disabled={!isEditMode}
                                              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                            >
                                            </Field>
                                          </td>
                                          <td className="border px-4 py-3">
                                            <Field
                                              name={`programs_offered_details.${index}.times_accredited`}
                                              type="number"
                                              disabled={!isEditMode}
                                              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                              placeholder="e.g., 2"
                                            />
                                          </td>
                                          {isEditMode && (
                                            <td className="border px-4 py-3 text-center">
                                              <button
                                                type="button"
                                                onClick={() => remove(index)}
                                                className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                                                title="Remove Program"
                                              >
                                                <Minus size={16} />
                                              </button>
                                            </td>
                                          )}
                                        </tr>
                                      ))
                                    ) : (
                                      <tr>
                                        <td colSpan={isEditMode ? 10 : 9} className="border px-4 py-8 text-center text-gray-500 italic">
                                          No programs added yet.
                                          {isEditMode && " Click the + button below to add programs."}
                                        </td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>

                              {isEditMode && (
                                <div className="flex justify-center mt-4">
                                  <button
                                    type="button"
                                    onClick={() => push({
                                      program_name: "",
                                      year_of_start: "",
                                      sanctioned_intake: "",
                                      intake_change: "",
                                      year_of_change: "",
                                      approval_details: "",
                                      accreditation_status: "",
                                      times_accredited: ""
                                    })}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                                  >
                                    <Plus size={16} />
                                    Add Program
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </FieldArray>
                      </Section>
                      {/* Section 6 - Programs to be Considered for Accreditation */}
                      <Section title="6. Programs to be Considered for Accreditation vide this Application:">



                        {/* Table A6.1 - List of programs to be considered for accreditation */}
                        <div className="mb-8">
                          <h4 className="text-lg font-bold text-blue-700 mb-4">Table No. A6.1: List of programs to be considered for accreditation.</h4>
                          <FieldArray name="programs_for_accreditation">
                            {({ push, remove }) => (
                              <div className="space-y-4">
                                <div className="overflow-x-auto">
                                  <table className="min-w-full border-collapse border border-gray-300 text-sm">
                                    <thead className="bg-blue-100">
                                      <tr>
                                        <th className="border px-4 py-3">Cluster ID</th>
                                        <th className="border px-4 py-3">Name of the Department</th>
                                        <th className="border px-4 py-3">Name of the Program</th>
                                        {isEditMode && <th className="border px-4 py-3">Actions</th>}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {values.programs_for_accreditation?.length > 0 ? (
                                        values.programs_for_accreditation.map((program, index) => (
                                          <tr key={index} className="bg-gray-50">
                                            <td className="border px-4 py-3">
                                              <Field
                                                name={`programs_for_accreditation.${index}.cluster_id`}
                                                disabled={!isEditMode}
                                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                                placeholder="e.g., 1"
                                              />
                                            </td>
                                            <td className="border px-4 py-3">
                                              <Field
                                                name={`programs_for_accreditation.${index}.department_name`}
                                                disabled={!isEditMode}
                                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                                placeholder="e.g., Computer Science & Engineering"
                                              />
                                            </td>
                                            <td className="border px-4 py-3">
                                              <Field
                                                name={`programs_for_accreditation.${index}.program_name`}
                                                disabled={!isEditMode}
                                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                                placeholder="e.g., B.Tech Computer Science & Engineering"
                                              />
                                            </td>
                                            {isEditMode && (
                                              <td className="border px-4 py-3 text-center">
                                                <button
                                                  type="button"
                                                  onClick={() => remove(index)}
                                                  className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                                                  title="Remove Program"
                                                >
                                                  <Minus size={16} />
                                                </button>
                                              </td>
                                            )}
                                          </tr>
                                        ))
                                      ) : (
                                        <tr>
                                          <td colSpan={isEditMode ? 4 : 3} className="border px-4 py-8 text-center text-gray-500 italic">
                                            No programs added yet.
                                            {isEditMode && " Click the + button below to add programs."}
                                          </td>
                                        </tr>
                                      )}
                                    </tbody>
                                  </table>
                                </div>

                                {isEditMode && (
                                  <div className="flex justify-center mt-4">
                                    <button
                                      type="button"
                                      onClick={() => push({
                                        cluster_id: "",
                                        department_name: "",
                                        program_name: ""
                                      })}
                                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                                    >
                                      <Plus size={16} />
                                      Add Program for Accreditation
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </FieldArray>


                        </div>

                        {/* Table A6.2 - Allied Department(s) */}
                        <div className="mb-8">
                          <h4 className="text-lg font-bold text-blue-700 mb-4">Table No. A6.2: Allied Department(s) to the Department of the programs considered for accreditation as above.</h4>
                          <FieldArray name="allied_departments_accreditation">
                            {({ push, remove }) => (
                              <div className="space-y-4">
                                <div className="overflow-x-auto">
                                  <table className="min-w-full border-collapse border border-gray-300 text-sm">
                                    <thead className="bg-blue-100">
                                      <tr>
                                        <th className="border px-4 py-3">Cluster ID.</th>
                                        <th className="border px-4 py-3">Name of the Department (in table no. A6.1)</th>
                                        <th className="border px-4 py-3">Name of allied Departments/Cluster (for table no. A6.1)</th>
                                        {isEditMode && <th className="border px-4 py-3">Actions</th>}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {values.allied_departments_accreditation?.length > 0 ? (
                                        values.allied_departments_accreditation.map((dept, index) => (
                                          <tr key={index} className="bg-gray-50">
                                            <td className="border px-4 py-3">
                                              <Field
                                                name={`allied_departments_accreditation.${index}.cluster_id`}
                                                disabled={!isEditMode}
                                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                                placeholder="e.g., 1"
                                              />
                                            </td>
                                            <td className="border px-4 py-3">
                                              <Field
                                                name={`allied_departments_accreditation.${index}.department_name`}
                                                disabled={!isEditMode}
                                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                                placeholder="e.g., Computer Science & Engineering"
                                              />
                                            </td>
                                            <td className="border px-4 py-3">
                                              <Field
                                                name={`allied_departments_accreditation.${index}.allied_departments`}
                                                disabled={!isEditMode}
                                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                                placeholder="e.g., Mathematics, Physics, Chemistry"
                                              />
                                            </td>
                                            {isEditMode && (
                                              <td className="border px-4 py-3 text-center">
                                                <button
                                                  type="button"
                                                  onClick={() => remove(index)}
                                                  className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                                                  title="Remove Department"
                                                >
                                                  <Minus size={16} />
                                                </button>
                                              </td>
                                            )}
                                          </tr>
                                        ))
                                      ) : (
                                        <tr>
                                          <td colSpan={isEditMode ? 4 : 3} className="border px-4 py-8 text-center text-gray-500 italic">
                                            No allied departments added yet.
                                            {isEditMode && " Click the + button below to add departments."}
                                          </td>
                                        </tr>
                                      )}
                                    </tbody>
                                  </table>
                                </div>

                                {isEditMode && (
                                  <div className="flex justify-center mt-4">
                                    <button
                                      type="button"
                                      onClick={() => push({
                                        cluster_id: "",
                                        department_name: "",
                                        allied_departments: ""
                                      })}
                                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                                    >
                                      <Plus size={16} />
                                      Add Allied Department
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </FieldArray>

                        </div>
                      </Section>

                      {/* Section 7 - Total Number of Faculty Members in Various Departments */}
                      <Section title="7. Total Number of Faculty Members in Various Departments:">

                        {/* Table A7 - No. of faculty members in various departments */}
                        <div className="mb-8">
                          <h4 className="text-lg font-bold text-blue-700 mb-4">Table No. A7: No. of faculty members in various departments.</h4>
                          <FieldArray name="faculty_members_departments">
                            {({ push, remove }) => (
                              <div className="space-y-4">
                                <div className="overflow-x-auto">
                                  <table className="min-w-full border-collapse border border-gray-300 text-sm">
                                    <thead className="bg-blue-100">
                                      <tr>
                                        <th rowSpan={3} className="border px-2 py-3 text-center">S. N.</th>
                                        <th rowSpan={3} className="border px-2 py-3 text-center">Name of the Department</th>
                                        <th colSpan={12} className="border px-2 py-3 text-center">Number of faculty members in the Department (UG and PG)</th>
                                        {isEditMode && <th rowSpan={3} className="border px-2 py-3 text-center">Actions</th>}
                                      </tr>
                                      <tr>
                                        <th colSpan={4} className="border px-2 py-3 text-center">CAY</th>
                                        <th colSpan={4} className="border px-2 py-3 text-center">CAYm1</th>
                                        <th colSpan={4} className="border px-2 py-3 text-center">CAYm2</th>
                                      </tr>
                                      <tr>
                                        <th className="border px-1 py-2 text-xs text-center" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>No. of Professors</th>
                                        <th className="border px-1 py-2 text-xs text-center" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>No. of Associate Professors</th>
                                        <th className="border px-1 py-2 text-xs text-center" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>No. of Assistant Professors</th>
                                        <th className="border px-1 py-2 text-xs text-center" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>Total faculty members</th>
                                        <th className="border px-1 py-2 text-xs text-center" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>No. of Professors</th>
                                        <th className="border px-1 py-2 text-xs text-center" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>No. of Associate Professors</th>
                                        <th className="border px-1 py-2 text-xs text-center" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>No. of Assistant Professors</th>
                                        <th className="border px-1 py-2 text-xs text-center" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>Total faculty members</th>
                                        <th className="border px-1 py-2 text-xs text-center" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>No. of Professors</th>
                                        <th className="border px-1 py-2 text-xs text-center" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>No. of Associate Professors</th>
                                        <th className="border px-1 py-2 text-xs text-center" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>No. of Assistant Professors</th>
                                        <th className="border px-1 py-2 text-xs text-center" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>Total faculty members</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {values.faculty_members_departments?.length > 0 ? (
                                        values.faculty_members_departments.map((dept, index) => (
                                          <tr key={index} className="bg-gray-50">
                                            <td className="border px-2 py-3 text-center font-medium">{index + 1}</td>
                                            <td className="border px-2 py-3">
                                              <Field
                                                name={`faculty_members_departments.${index}.department_name`}
                                                disabled={!isEditMode}
                                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                                placeholder="e.g., Computer Science & Engineering"
                                              />
                                            </td>
                                            {/* CAY columns */}
                                            <td className="border px-1 py-3">
                                              <NumberField name={`faculty_members_departments.${index}.cay_professors`} disabled={!isEditMode} className="w-full p-1 border rounded focus:ring-2 focus:ring-blue-500 text-center" />
                                            </td>
                                            <td className="border px-1 py-3">
                                              <NumberField name={`faculty_members_departments.${index}.cay_associate_professors`} disabled={!isEditMode} className="w-full p-1 border rounded focus:ring-2 focus:ring-blue-500 text-center" />
                                            </td>
                                            <td className="border px-1 py-3">
                                              <NumberField name={`faculty_members_departments.${index}.cay_assistant_professors`} disabled={!isEditMode} className="w-full p-1 border rounded focus:ring-2 focus:ring-blue-500 text-center" />
                                            </td>
                                            <td className="border px-1 py-3">
                                              <input
                                                type="number"
                                                value={(parseInt(dept.cay_professors) || 0) + (parseInt(dept.cay_associate_professors) || 0) + (parseInt(dept.cay_assistant_professors) || 0)}
                                                disabled
                                                className="w-full p-1 border rounded focus:ring-2 focus:ring-blue-500 text-center bg-blue-50 font-bold"
                                                readOnly
                                              />
                                            </td>
                                            {/* CAYm1 columns */}
                                            <td className="border px-1 py-3">
                                              <NumberField name={`faculty_members_departments.${index}.caym1_professors`} disabled={!isEditMode} className="w-full p-1 border rounded focus:ring-2 focus:ring-blue-500 text-center" />
                                            </td>
                                            <td className="border px-1 py-3">
                                              <NumberField name={`faculty_members_departments.${index}.caym1_associate_professors`} disabled={!isEditMode} className="w-full p-1 border rounded focus:ring-2 focus:ring-blue-500 text-center" />
                                            </td>
                                            <td className="border px-1 py-3">
                                              <NumberField name={`faculty_members_departments.${index}.caym1_assistant_professors`} disabled={!isEditMode} className="w-full p-1 border rounded focus:ring-2 focus:ring-blue-500 text-center" />
                                            </td>
                                            <td className="border px-1 py-3">
                                              <input
                                                type="number"
                                                value={(parseInt(dept.caym1_professors) || 0) + (parseInt(dept.caym1_associate_professors) || 0) + (parseInt(dept.caym1_assistant_professors) || 0)}
                                                disabled
                                                className="w-full p-1 border rounded focus:ring-2 focus:ring-blue-500 text-center bg-blue-50 font-bold"
                                                readOnly
                                              />
                                            </td>
                                            {/* CAYm2 columns */}
                                            <td className="border px-1 py-3">
                                              <NumberField name={`faculty_members_departments.${index}.caym2_professors`} disabled={!isEditMode} className="w-full p-1 border rounded focus:ring-2 focus:ring-blue-500 text-center" />
                                            </td>
                                            <td className="border px-1 py-3">
                                              <NumberField name={`faculty_members_departments.${index}.caym2_associate_professors`} disabled={!isEditMode} className="w-full p-1 border rounded focus:ring-2 focus:ring-blue-500 text-center" />
                                            </td>
                                            <td className="border px-1 py-3">
                                              <NumberField name={`faculty_members_departments.${index}.caym2_assistant_professors`} disabled={!isEditMode} className="w-full p-1 border rounded focus:ring-2 focus:ring-blue-500 text-center" />
                                            </td>
                                            <td className="border px-1 py-3">
                                              <input
                                                type="number"
                                                value={(parseInt(dept.caym2_professors) || 0) + (parseInt(dept.caym2_associate_professors) || 0) + (parseInt(dept.caym2_assistant_professors) || 0)}
                                                disabled
                                                className="w-full p-1 border rounded focus:ring-2 focus:ring-blue-500 text-center bg-blue-50 font-bold"
                                                readOnly
                                              />
                                            </td>
                                            {isEditMode && (
                                              <td className="border px-2 py-3 text-center">
                                                <button
                                                  type="button"
                                                  onClick={() => remove(index)}
                                                  className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                                                  title="Remove Department"
                                                >
                                                  <Minus size={16} />
                                                </button>
                                              </td>
                                            )}
                                          </tr>
                                        ))
                                      ) : (
                                        <tr>
                                          <td colSpan={isEditMode ? 15 : 14} className="border px-4 py-8 text-center text-gray-500 italic">
                                            No departments added yet.
                                            {isEditMode && " Click the + button below to add departments."}
                                          </td>
                                        </tr>
                                      )}
                                    </tbody>
                                  </table>
                                </div>

                                {isEditMode && (
                                  <div className="flex justify-center mt-4">
                                    <button
                                      type="button"
                                      onClick={() => push({
                                        department_name: "",
                                        cay_professors: "",
                                        cay_associate_professors: "",
                                        cay_assistant_professors: "",
                                        cay_total: "",
                                        caym1_professors: "",
                                        caym1_associate_professors: "",
                                        caym1_assistant_professors: "",
                                        caym1_total: "",
                                        caym2_professors: "",
                                        caym2_associate_professors: "",
                                        caym2_assistant_professors: "",
                                        caym2_total: ""
                                      })}
                                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                                    >
                                      <Plus size={16} />
                                      Add Department
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </FieldArray>



                        </div>
                      </Section>

                      {/* Section 8 - Total Number of Engineering Students in Various Departments */}
                      <Section title="8. Total Number of Engineering Students in Various Departments:">

                        {/* Table A8 - No. of engineering students in various departments */}
                        <div className="mb-8">
                          <h4 className="text-lg font-bold text-blue-700 mb-4">Table No. A8: No. of engineering students in various departments.</h4>
                          <FieldArray name="engineering_students_departments">
                            {({ push, remove }) => (
                              <div className="space-y-4">
                                <div className="overflow-x-auto">
                                  <table className="min-w-full border-collapse border border-gray-300 text-sm">
                                    <thead className="bg-blue-100">
                                      <tr>
                                        <th rowSpan={2} className="border px-4 py-3 text-center">S. N.</th>
                                        <th rowSpan={2} className="border px-4 py-3 text-center">Name of the Department</th>
                                        <th colSpan={3} className="border px-4 py-3 text-center">Number of students in the Department (UG and PG)</th>
                                        {isEditMode && <th rowSpan={2} className="border px-4 py-3 text-center">Actions</th>}
                                      </tr>
                                      <tr>
                                        <th className="border px-4 py-3 text-center">CAY</th>
                                        <th className="border px-4 py-3 text-center">CAYm1</th>
                                        <th className="border px-4 py-3 text-center">CAYm2</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {values.engineering_students_departments?.length > 0 ? (
                                        values.engineering_students_departments.map((dept, index) => (
                                          <tr key={index} className="bg-gray-50">
                                            <td className="border px-4 py-3 text-center font-medium">{index + 1}</td>
                                            <td className="border px-4 py-3">
                                              <Field
                                                name={`engineering_students_departments.${index}.department_name`}
                                                disabled={!isEditMode}
                                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                                placeholder="e.g., Computer Science & Engineering"
                                              />
                                            </td>
                                            <td className="border px-4 py-3">
                                              <NumberField name={`engineering_students_departments.${index}.cay_students`} disabled={!isEditMode} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 text-center" />
                                            </td>
                                            <td className="border px-4 py-3">
                                              <NumberField name={`engineering_students_departments.${index}.caym1_students`} disabled={!isEditMode} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 text-center" />
                                            </td>
                                            <td className="border px-4 py-3">
                                              <NumberField name={`engineering_students_departments.${index}.caym2_students`} disabled={!isEditMode} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 text-center" />
                                            </td>
                                            {isEditMode && (
                                              <td className="border px-4 py-3 text-center">
                                                <button
                                                  type="button"
                                                  onClick={() => remove(index)}
                                                  className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                                                  title="Remove Department"
                                                >
                                                  <Minus size={16} />
                                                </button>
                                              </td>
                                            )}
                                          </tr>
                                        ))
                                      ) : (
                                        <tr>
                                          <td colSpan={isEditMode ? 6 : 5} className="border px-4 py-8 text-center text-gray-500 italic">
                                            No departments added yet.
                                            {isEditMode && " Click the + button below to add departments."}
                                          </td>
                                        </tr>
                                      )}
                                    </tbody>
                                  </table>
                                </div>

                                {isEditMode && (
                                  <div className="flex justify-center mt-4">
                                    <button
                                      type="button"
                                      onClick={() => push({
                                        department_name: "",
                                        cay_students: "",
                                        caym1_students: "",
                                        caym2_students: ""
                                      })}
                                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                                    >
                                      <Plus size={16} />
                                      Add Department
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </FieldArray>

                          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-800">
                              <strong>Note:</strong><br />
                              In case the institution is running programs other than engineering programs (UG and PG), a separate table giving similar details is to be included.
                            </p>
                          </div>
                        </div>
                      </Section>

                      {/* Section 9 - Vision of the Institution */}
                      <Section title="9. Vision of the Institution:">
                        <div className="mb-6">
                          <Field
                            as="textarea"
                            name="vision_of_institution"
                            disabled={!isEditMode}
                            rows={4}
                            className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 resize-vertical"
                            placeholder="Enter the vision statement of the institution..."
                          />
                        </div>
                      </Section>

                      {/* Section 10 - Mission of the Institution */}
                      <Section title="10. Mission of the Institution:">
                        <div className="mb-6">
                          <Field
                            as="textarea"
                            name="mission_of_institution"
                            disabled={!isEditMode}
                            rows={4}
                            className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 resize-vertical"
                            placeholder="Enter the mission statement of the institution..."
                          />
                        </div>
                      </Section>

                      {/* Section 11 - Contact Information */}
                      <Section title="11. Contact Information of the Head of the Institution and NBA Coordinator:">

                        {/* A. Head of the Institution */}
                        <div className="mb-8">
                          <h4 className="text-xl font-bold text-blue-700 mb-4">A. Head of the Institution</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">

                                <label className="font-medium text-gray-700">Name:</label>
                              </div>
                              <Field
                                name="head_of_institution.name"
                                disabled={!isEditMode}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter full name"
                              />
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center gap-2">

                                <label className="font-medium text-gray-700">Designation:</label>
                              </div>
                              <Field
                                name="head_of_institution.designation"
                                disabled={!isEditMode}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., Principal, Director"
                              />
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center gap-2">

                                <label className="font-medium text-gray-700">Mobile Number:</label>
                              </div>
                              <Field
                                name="head_of_institution.mobile_number"
                                disabled={!isEditMode}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., +91-9876543210"
                              />
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center gap-2">

                                <label className="font-medium text-gray-700">Email id:</label>
                              </div>
                              <Field
                                name="head_of_institution.email_id"
                                type="email"
                                disabled={!isEditMode}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., principal@institution.edu"
                              />
                            </div>
                          </div>
                        </div>

                        {/* B. NBA Coordinator */}
                        <div className="mb-8">
                          <h4 className="text-xl font-bold text-blue-700 mb-4">B. NBA Coordinator:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">

                                <label className="font-medium text-gray-700">Name:</label>
                              </div>
                              <Field
                                name="nba_coordinator.name"
                                disabled={!isEditMode}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter full name"
                              />
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center gap-2">

                                <label className="font-medium text-gray-700">Designation:</label>
                              </div>
                              <Field
                                name="nba_coordinator.designation"
                                disabled={!isEditMode}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., Professor, Associate Professor"
                              />
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center gap-2">

                                <label className="font-medium text-gray-700">Mobile Number:</label>
                              </div>
                              <Field
                                name="nba_coordinator.mobile_number"
                                disabled={!isEditMode}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., +91-9876543210"
                              />
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center gap-2">

                                <label className="font-medium text-gray-700">Email id:</label>
                              </div>
                              <Field
                                name="nba_coordinator.email_id"
                                type="email"
                                disabled={!isEditMode}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., coordinator@institution.edu"
                              />
                            </div>
                          </div>
                        </div>
                      </Section>

                    </div>


                    {/* Save Button */}
                    {isEditMode && (
                      <div className="text-center pt-10">
                        <button
                          type="submit"
                          disabled={isSaving}
                          className="px-16 py-4 bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white font-bold text-xl rounded-xl shadow-xl transition disabled:opacity-70"
                        >
                          {isSaving ? "Saving..." : "Save Institute Information"}
                        </button>
                      </div>
                    )}
                  </Form>
                );
              }}
            </Formik>
          </div>
        </div>
      </div>
      {alert}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        className="bg-white rounded-xl shadow-2xl w-[95vw] max-w-6xl h-[95vh] mx-auto outline-none border-0 relative"
        overlayClassName="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center p-2 z-50"
        ariaHideApp={false}
      >
        {/* Fixed Close Button - Always Visible */}
        <button
          onClick={() => setIsModalOpen(false)}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg"
          title="Close"
        >
          X
        </button>

        <div className="flex flex-col h-full">
          {/* Modal Header - Fixed */}
          <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-gradient-to-r from-[#2163c1] to-[#1a4f9a] text-white rounded-t-xl">
            <div className="flex items-center gap-3 pr-12">

              <div>
                <h2 className="text-xl font-bold">ER Guidelines</h2>
                <p className="text-sm opacity-90">Evidence Requirements Documentation</p>
              </div>
            </div>
          </div>

          {/* Modal Body - Scrollable */}
          <div className="flex-1 overflow-auto bg-gray-50">
            <div className="p-4">
              <div className="bg-white rounded-lg shadow-inner border border-gray-200 overflow-auto max-h-full">
                <img
                  src={s3DocumentUrl}
                  alt="ER Guidelines Document"
                  className="w-full h-auto block"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div
                  className="hidden h-96 flex-col items-center justify-center text-gray-500"
                >
                  <i className="fa-solid fa-exclamation-triangle text-4xl mb-4"></i>
                  <p className="text-lg font-medium">Unable to load document</p>
                  <p className="text-sm">Please check your internet connection</p>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer - Fixed */}
          <div className="flex-shrink-0 flex justify-between items-center p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <i className="fa-solid fa-info-circle"></i>
              <span>Scroll to view the complete document</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => window.open(s3DocumentUrl, '_blank')}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
              >
                <i className="fa-solid fa-external-link-alt"></i>
                Open in New Tab
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
