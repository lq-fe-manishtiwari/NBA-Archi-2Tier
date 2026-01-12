import React, { useState, useEffect } from "react";
import Select from "react-select";
import { Formik, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { collegeService } from "../../../Academics/Services/college.service.js";
import { classService } from "../../../Academics/Services/class.service.js";
import { POService } from "../../Settings/Services/po.service";
import { PSOService } from "../../Settings/Services/pso.service";
import { AcademicService } from "../../../Academics/Services/Academic.service.js";
import { AttainmentConfigService } from "../../Services/attainment-config.service.js";
import SweetAlert from "react-bootstrap-sweetalert";

const customSelectStyles = {
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  menu: (provided) => ({ ...provided, zIndex: 9999 }),
  container: (provided) => ({ ...provided, zIndex: 9999 }),
};

const BulkUploadIndirect = () => {
  const [showModal, setShowModal] = useState(false);
  const [programs, setPrograms] = useState([]);
  const [classOptions, setClassOptions] = useState([]);
  const [semesterOptions, setSemesterOptions] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [poList, setPoList] = useState([]);
  const [psoList, setPsoList] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [alert, setAlert] = useState(null);

  const [modalHeading, setModalHeading] = useState("");
  const [modalContent, setModalContent] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [nbaCoReq, setNbaCoReq] = useState({
    program_id: "",
    class_id: "",
    semester_id: "",
    academic_year_id: "",
    po_id: "",
    pso_id: "",
    mapping_type: "po",
  });

  useEffect(() => {
    fetchPrograms();
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
    const storedProgramId = localStorage.getItem("selectedOBEprogram");
    if (storedProgramId && programs.length > 0) {
      const selectedProgram = programs
        .map((p) => ({ label: p.program_name, value: p.program_id }))
        .find((p) => p.value.toString() === storedProgramId.toString());

      if (selectedProgram) {
        setNbaCoReq(prev => ({ ...prev, program_id: selectedProgram.value }));
        fetchClasses(selectedProgram.value);
        fetchPOsPSOs(selectedProgram.value);
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

  const fetchAcademicYears = async () => {
    try {
      const response = await AcademicService.getAcademic();
      setAcademicYears(response || []);
    } catch (err) {
      console.error("Failed to fetch academic years:", err);
    }
  };

  const fetchPOsPSOs = async (programId) => {
    try {
      const [poData, psoData] = await Promise.all([
        POService.getPObyProgramId(programId),
        PSOService.getPSOByProgramId(programId)
      ]);
      setPoList(poData || []);
      setPsoList(psoData || []);
    } catch (err) {
      console.error("Failed to fetch POs/PSOs:", err);
    }
  };

  const handleProgramChange = (selectedOption, setFieldValue) => {
    const programId = selectedOption ? selectedOption.value : "";
    setFieldValue("program_id", programId);
    setFieldValue("class_id", "");
    setFieldValue("semester_id", "");
    setFieldValue("po_id", "");
    setFieldValue("pso_id", "");
    setNbaCoReq({ ...nbaCoReq, program_id: programId, class_id: "", semester_id: "", po_id: "", pso_id: "" });
    if (programId) {
      fetchClasses(programId);
      fetchPOsPSOs(programId);
    }
  };

  const handleMappingTypeChange = (e, setFieldValue) => {
    const mappingType = e.target.value;
    setFieldValue("mapping_type", mappingType);
    setFieldValue("po_id", "");
    setFieldValue("pso_id", "");
    setNbaCoReq({ ...nbaCoReq, mapping_type: mappingType, po_id: "", pso_id: "" });
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await AttainmentConfigService.downloadSurveyTemplate();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Program_Exit_Survey_Template.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download template:", err);
      setModalHeading("Error");
      setModalContent("Failed to download template. Please try again.");
      setShowSuccessModal(true);
    }
  };

  const handleBulkUpload = async (values) => {
    if (!selectedFile) {
      setModalHeading("Error");
      setModalContent("Please select a file to upload.");
      setShowSuccessModal(true);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('programId', values.program_id);
      formData.append('academicYearId', values.academic_year_id);
      if (values.mapping_type === "po" || values.mapping_type === "all") {
        if (values.po_id) formData.append('poId', values.po_id);
      }
      if (values.mapping_type === "pso" || values.mapping_type === "all") {
        if (values.pso_id) formData.append('psoId', values.pso_id);
      }

      await AttainmentConfigService.uploadSurveyExcel(formData);
      setAlert(
        <SweetAlert
          success
          title="Success!"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => {
            setAlert(null);
            setSelectedFile(null);
            setShowModal(false);
          }}
        >
          File "{selectedFile.name}" uploaded successfully!
        </SweetAlert>
      );
    } catch (err) {
      console.error("Upload failed:", err);
      setModalHeading("Error");
      setModalContent("Failed to upload file. Please try again.");
      setShowSuccessModal(true);
    }
  };

  const generateProgramOptions = () => programs.map((p) => ({ label: p.program_name, value: p.program_id }));
  const generateClassOptions = () => classOptions.map((c) => ({ label: c.name, value: c.class_year_id }));
  const generateSemesterOptions = () => semesterOptions.map((s) => ({ label: s.name, value: s.semester_id }));
  const generateAcademicYearOptions = () => academicYears.map((ay) => ({ label: ay.year, value: ay.id }));
  const generatePOOptions = () => poList.map((po) => ({ label: po.po_code, value: po.po_id }));
  const generatePSOOptions = () => psoList.map((pso) => ({ label: pso.pso_code, value: pso.pso_id }));

  return (
    <div>
      <button
        className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
        onClick={() => setShowModal(true)}
      >
        Bulk Upload
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white w-full max-w-3xl relative shadow-xl">

            {/* HEADER — full blue, no rounded edges */}
            <div className="bg-[#2563EB] w-full rounded flex items-center justify-between px-6 py-3">
              <h3 className="text-xl font-semibold text-white">Bulk Upload</h3>

              <button
                className="text-white text-xl hover:text-gray-200"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>

            {/* BODY — rounded only at bottom */}
            <div className="p-6 bg-white rounded-b-lg">
              <Formik
                enableReinitialize
                initialValues={{
                  program_id: "",
                  class_id: "",
                  semester_id: "",
                  academic_year_id: "",
                  po_id: "",
                  pso_id: "",
                  mapping_type: "po",
                  file: null,    // <-- Add this
                }}
                validationSchema={Yup.object().shape({
                  program_id: Yup.string().required("Program is required"),
                  class_id: Yup.string().required("Class is required"),
                  semester_id: Yup.string().required("Semester is required"),
                  academic_year_id: Yup.string().required("Academic Year is required"),
                  // file: Yup.mixed().required("Please upload a file"),
                })}
                onSubmit={handleBulkUpload}
              >
                {({ values, setFieldValue }) => (
                  <Form className="space-y-4">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-medium mb-1">Program <span className="text-red-500">*</span></label>
                        <Select
                          options={generateProgramOptions()}
                          value={generateProgramOptions().find(
                            (o) => o.value.toString() === nbaCoReq.program_id.toString()
                          ) || null}
                          onChange={(option) => handleProgramChange(option, setFieldValue)}
                          placeholder="Select Program"
                          styles={customSelectStyles}
                          menuPortalTarget={document.body}
                          isClearable
                        />
                        <ErrorMessage name="program_id" component="div" className="text-red-600 text-sm" />
                      </div>

                      <div>
                        <label className="block font-medium mb-1">Class <span className="text-red-500">*</span></label>
                        <Select
                          options={generateClassOptions()}
                          value={generateClassOptions().find((o) => o.value === values.class_id) || null}
                          onChange={(option) => {
                            setFieldValue("class_id", option?.value || "");
                            setFieldValue("semester_id", "");
                            const classObj = classOptions.find(c => c.class_year_id === option?.value);
                            setSemesterOptions(classObj?.semesters || []);
                          }}
                          placeholder="Select Class"
                          isDisabled={!values.program_id}
                          isClearable
                        />
                        <ErrorMessage name="class_id" component="div" className="text-red-600 text-sm" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-medium mb-1">Semester <span className="text-red-500">*</span></label>
                        <Select
                          options={generateSemesterOptions()}
                          value={generateSemesterOptions().find((o) => o.value === values.semester_id) || null}
                          onChange={(option) => setFieldValue("semester_id", option?.value || "")}
                          placeholder="Select Semester"
                          isDisabled={!values.class_id}
                          isClearable
                        />
                        <ErrorMessage name="semester_id" component="div" className="text-red-600 text-sm" />
                      </div>

                      <div>
                        <label className="block font-medium mb-1">Academic Year</label>
                        <Select
                          options={generateAcademicYearOptions()}
                          value={generateAcademicYearOptions().find((o) => o.value === values.academic_year_id) || null}
                          onChange={(option) => setFieldValue("academic_year_id", option?.value || "")}
                          placeholder="Select Academic Year"
                          isClearable
                        />
                        <ErrorMessage name="academic_year_id" component="div" className="text-red-600 text-sm" />
                      </div>
                    </div>

                    <div>
                      <label className="block font-medium mb-1">Mapping Type</label>
                      <select
                        className="w-full border rounded px-2 py-1 bg-gray-50"
                        value={values.mapping_type}
                        onChange={(e) => handleMappingTypeChange(e, setFieldValue)}
                      >
                        <option value="po">PO</option>
                        <option value="pso">PSO</option>
                        <option value="all">All</option>
                      </select>
                    </div>

                    {values.mapping_type !== "all" && (
                      <div>
                        <label className="block font-medium mb-1">
                          {values.mapping_type === "po" ? "PO" : "PSO"}
                        </label>
                        <Select
                          options={values.mapping_type === "po" ? generatePOOptions() : generatePSOOptions()}
                          value={
                            (values.mapping_type === "po"
                              ? generatePOOptions().find((o) => o.value === values.po_id)
                              : generatePSOOptions().find((o) => o.value === values.pso_id)) || null
                          }
                          onChange={(option) =>
                            setFieldValue(values.mapping_type === "po" ? "po_id" : "pso_id", option?.value || "")
                          }
                          placeholder={`Select ${values.mapping_type.toUpperCase()}`}
                          isDisabled={!values.program_id}
                          isClearable
                        />
                      </div>
                    )}

                    <div>
                      <label className="block font-medium mb-1">Upload File <span className="text-red-500">*</span></label>
                      <input
                        type="file"
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                        className="block w-full border border-gray-300 rounded p-2"
                      />
                      {selectedFile && (
                        <div className="mt-1 text-sm text-gray-600">
                          Selected File: {selectedFile.name}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                      <button
                        type="button"
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                        onClick={handleDownloadTemplate}
                      >
                        Download Template
                      </button>
                      <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                      >
                        Submit
                      </button>
                    </div>

                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      )}


      {/* Success/Error Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
            <h3 className="text-xl font-bold mb-4">{modalHeading}</h3>
            <p className="mb-4">{modalContent}</p>
            <div className="flex justify-end">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={() => setShowSuccessModal(false)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
      {alert}
    </div>
  );
};

export default BulkUploadIndirect;
