import React, { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { POService }  from "../Services/po.service";
import { collegeService } from "../../../Academics/Services/college.service";
import { AcademicService } from "../../../Academics/Services/Academic.service";
import * as Yup from "yup";
import SweetAlert from "react-bootstrap-sweetalert";
import { Link, useLocation, useNavigate } from "react-router-dom";

const AddPO = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState("");
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const queryDetails = location?.state?.query_details || null;
  const selectedSubjectId = location?.state?.selectedSubjectId || "";
  const [pos, setPos] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);

  const initialValues = {
  program_id: "",
  academic_year_id: "",
  po_ids: [],
};

   // Load Programs
    useEffect(() => {
      fetchPrograms();
      getPOData();
      fetchAcademicYears();
    }, []);
  
    const fetchPrograms = async () => {
      try {
        setLoading(true);
        const data = await collegeService.getAllprogram();
        setPrograms(data);
      } catch (err) {
        console.error("Failed to fetch programs:", err);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      const storedProgram = localStorage.getItem("selectedOBEprogram");
    
      if (storedProgram && programs.length > 0 ) {
        setSelectedProgram(storedProgram); 
        console.log("Loaded stored program:", storedProgram);
      }
    }, [programs]);  // programs load

    const getPOData = async () => {
      try {
        setLoading(true);
        const data = await POService.getPOData();
        setPos(data);
      } catch (err) {
        console.error("Failed to fetch programs:", err);
      } finally {
        setLoading(false);
      }
    };

  const fetchAcademicYears = async () => {
      try {
        setLoading(true);
        const response = await AcademicService.getAcademic();
        setAcademicYears(response);
      } catch (err) {
        console.error("Failed to fetch academic years:", err);
        setError("Failed to load academic years. Please try again.");
      } finally {
        setLoading(false);
      }
    };


  // Validation Schema
  const validationSchema = Yup.object().shape({
    grade_id: Yup.string().required("Program is required"),
    academic_year_id: Yup.string().required("Academic Year is required"),
    po_ids: Yup.array().min(1, "Select at least one PO").required("Select at least one PO"),
  });

  const handleSubmit = async (values) => {
    try {
      const payload = {
        program_id: values.program_id,
        academic_year_id: values.academic_year_id,
        po_ids: values.po_ids,
      };
  
      console.log("Payload sent:", payload);
  
      await POService.savePO(payload); // send single payload
  
      setAlert(
            <SweetAlert
              success
              title={"Saved!"}
              confirmBtnCssClass="btn-confirm"
              onConfirm={() => {
                setAlert(null);
                window.location.href = "/obe/settings/PO"; // redirect after OK
              }}
            >
              PSO has been Saved successfully.
            </SweetAlert>
          );
    } catch (err) {
      console.error("Failed to save/update PO:", err);
      setAlert(
            <SweetAlert
              error
              title="Error!"
              confirmBtnCssClass="btn-confirm"
              onConfirm={() => setAlert(null)}
            >
              Something went wrong. Please try again.
            </SweetAlert>
          );
    }
  };


  return (
    <div>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="pageheading text-xl font-semibold">
            Add PO
          </h2>
          <Link
            to="/obe/settings/PO"
            // state={{ selectedTabIndex: 3, selectedSubjectId }}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Close
          </Link>
        </div>

        {/* Form Card */}
        <div className="p-6">
          <Formik
            enableReinitialize={true}
            initialValues={{
    program_id: selectedProgram,
    academic_year_id: "",
    po_ids: [],
  }}
             validationSchema={Yup.object({
                      program_id: Yup.string().required("Program is required"),
                      // missions: Yup.array().of(
                      //   Yup.object({
                      //     mission_statement: Yup.string().required("Mission Statement is required"),
                      //   })
                      // ),
                    })}
            onSubmit={handleSubmit}
          >
            {({ values,errors, setFieldValue, isSubmitting }) => (
              <Form>
                {/* Program Dropdown */}
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
  <div className="w-full">
    <label className="block font-semibold mb-1">Program</label>
    <select
      name="program_id"
      value={values.program_id}
      onChange={(e) => setFieldValue("program_id", e.target.value)}
      className="border rounded px-3 py-2 w-full"
    >
      <option value="">Select Program</option>
      {programs.map((p) => (
                  <option key={p.program_id} value={p.program_id}>
                    {p.program_name}
                  </option>
                ))}
    </select>
  </div>

  <div className="w-full">
  <label className="block font-semibold mb-1">Academic Year</label>
  <select
    name="academic_year_id"
    value={values.academic_year_id}
    onChange={(e) => setFieldValue("academic_year_id", e.target.value)}
    className="border rounded px-3 py-2 w-full"
  >
    <option value="">Select Academic Year</option>
    {academicYears.map((year) => (
      <option key={year.id} value={year.id}>
        {year.year}
      </option>
    ))}
  </select>
  {errors.academic_year_id && (
    <div className="text-red-500 text-sm">{errors.academic_year_id}</div>
  )}
</div>

</div>  


                {/* PO Checklist */}
                <div className="mb-6">
                  <label className="block font-medium mb-2">
                    Select Program Outcomes (POs) <span className="text-red-500">*</span>
                  </label>
                  <div className="overflow-x-auto border border-gray-300 rounded">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-blue-600 text-white">
                        <tr>
                          <th className="px-4 py-2 text-center">
                            <input
                              type="checkbox"
                              checked={values.po_ids.length === pos.length}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFieldValue("po_ids", pos.map((po) => po.po_id));
                                } else {
                                  setFieldValue("po_ids", []);
                                }
                              }}
                            />
                          </th>
                          <th className="px-4 py-2 text-center">PO No.</th>
                          <th className="px-4 py-2">PO Statement</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {pos.map((po) => (
                          <tr key={po.po_id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-center">
                              <input
  type="checkbox"
  checked={values.po_ids.includes(po.po_id)}
  onChange={(e) => {
    if (e.target.checked) {
      setFieldValue("po_ids", [...values.po_ids, po.po_id]);
    } else {
      setFieldValue(
        "po_ids",
        values.po_ids.filter((id) => id !== po.po_id)
      );
    }
  }}
/>

                            </td>
                            <td className="px-4 py-2 text-center font-bold">{po.po_code}</td>
                            <td className="px-4 py-2 break-words">{po.po_statement}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <ErrorMessage
                    name="po_ids"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {/* Buttons */}
                <div className="flex justify-center gap-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded"
                  >
                    Submit
                  </button>
                  <button
                    type="button"
                    // onClick={goBack}
                    className="bg-gray-300 hover:bg-gray-400 text-black px-6 py-2 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
      {alert}
    </div>
  );
};

export default AddPO;
