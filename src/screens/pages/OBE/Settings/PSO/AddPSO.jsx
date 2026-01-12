import React, { useState, useEffect } from "react";
import { Formik, Form, FieldArray } from "formik";
import { collegeService } from "../../../Academics/Services/college.service";
import { PSOService } from "../Services/pso.service";
import * as Yup from "yup";
import SweetAlert from "react-bootstrap-sweetalert";
import { Link, useLocation } from "react-router-dom";

const AddPSO = () => {
  const location = useLocation();
  const isEdit = location.state?.isEdit || false;
  const psoData = location.state?.psoData || null;

  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState("");
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load Programs
  useEffect(() => {
    fetchPrograms();
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
  
    if (storedProgram && programs.length > 0 && !isEdit) {
      setSelectedProgram(storedProgram); 
      console.log("Loaded stored program:", storedProgram);
    }
  }, [programs]);  // programs load 

  const submitPSO = async (values) => {
    try {
      const payload = {
        pso_id: values.visions[0].pso_id || null,   // existing ID if editing
        pso_code: values.visions[0].pso_code,
        pso_statement: values.visions[0].pso_statement,
        program_id: values.program_id,
      };

      const existingMissions = await PSOService.getPSOByProgramId(values.program_id);
      const existingCodes = (existingMissions || []).map((m) => m.pso_code);
      
      const isDuplicate =
  existingCodes.includes(values.visions[0].pso_code) &&
  values.visions[0].pso_code !== psoData?.pso_code;

      if (isDuplicate) {
        setAlert(
          <SweetAlert
            error
            title="Error!"
            confirmBtnCssClass="btn-confirm"
            onConfirm={() => setAlert(null)}
          >
            pso Code already exists. Please use a different code.
          </SweetAlert>);
        return;
      }

      console.log("Payload sent:", payload);

      await PSOService.saveupdatePSO(payload); // send single payload

      setAlert(
        <SweetAlert
          success
          title={isEdit ? "Updated!" : "Saved!"}
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => {
            setAlert(null);
            window.location.href = "/obe/settings/PSO"; // redirect after OK
          }}
        >
          PSO has been {isEdit ? "updated" : "saved"} successfully.
        </SweetAlert>
      );
    } catch (err) {
      console.error("Failed to save/update PSO:", err);
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
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="pageheading text-xl font-semibold">
          {isEdit ? "Edit" : "Add"} PSO
        </h2>
        <Link
          to="/obe/settings/PSO"
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm"
        >
          Close
        </Link>
      </div>

      {/* FORM */}
      <Formik
        enableReinitialize={true}
        initialValues={{
          program_id: selectedProgram || psoData?.program?.program_id || "",
          visions: isEdit
            ? [
              {
                pso_id: psoData?.pso_id || null,
                pso_code: psoData?.pso_code || "PSO1",
                pso_statement: psoData?.pso_statement || "",
              },
            ]
            : [{ pso_id: null, pso_code: "PSO1", pso_statement: "" }],
        }}
        validationSchema={Yup.object({
          program_id: Yup.string().required("Program is required"),
          visions: Yup.array().of(
            Yup.object({
              pso_code: Yup.string().required("PSO Code is required"),
              pso_statement: Yup.string().required("PSO Statement is required"),
            })
          ),
        })}
        onSubmit={submitPSO}
      >
        {({ values, errors, touched, setFieldValue }) => (
          <Form>
            {/* PROGRAM DROPDOWN */}
            <div className="mb-4 w-64">
              <label className="block font-medium mb-1">
                Program <span className="text-red-500">*</span>
              </label>

              <select
                name="program_id"
                value={values.program_id}
                onChange={(e) => setFieldValue("program_id", e.target.value)}
                className="w-full border border-gray-300 rounded p-2"
              >
                <option value="">Select Program</option>
                {programs.map((p) => (
                  <option key={p.program_id} value={p.program_id}>
                    {p.program_name}
                  </option>
                ))}
              </select>

              {errors.program_id && touched.program_id && (
                <div className="text-red-500 text-sm mt-1">{errors.program_id}</div>
              )}
            </div>

            {/* VISION TABLE */}
            <FieldArray name="visions">
              {(arrayHelpers) => (
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-300 rounded-lg mb-4">
                    <thead className="bg-primary-600">
                      <tr>
                        <th className="px-6 py-3 w-40 text-left text-xs font-large text-gray-50 uppercase tracking-wider">PSO Code</th>
                        <th className="px-6 py-3 text-left text-xs font-large text-gray-50 uppercase tracking-wider">PSO Statement</th>
                        {/* {!isEdit && <th className="px-4 py-2">Action</th>} */}
                      </tr>
                    </thead>

                    <tbody>
                      {values.visions.map((vision, index) => (
                        <tr key={index} className="border-t hover:bg-gray-50">
                          <td className="px-4 py-2 w-40">
                            <input
                              type="text"
                              className="border border-gray-300 rounded p-1 w-full"
                              value={vision.pso_code}
                              onChange={(e) =>
                                setFieldValue(`visions[${index}].pso_code`, e.target.value)
                              }
                            />
                            {errors.visions &&
                              errors.visions[index] &&
                              errors.visions[index].pso_code && (
                                <div className="text-red-500 text-sm mt-1">
                                  {errors.visions[index].pso_code}
                                </div>
                              )}
                          </td>

                          <td className="px-4 py-2">
                            <input
                              type="text"
                              className="border border-gray-300 rounded p-1 w-full"
                              value={vision.pso_statement}
                              onChange={(e) =>
                                setFieldValue(`visions[${index}].pso_statement`, e.target.value)
                              }
                            />

                            {errors.visions &&
                              errors.visions[index] &&
                              errors.visions[index].pso_statement && (
                                <div className="text-red-500 text-sm mt-1">
                                  {errors.visions[index].pso_statement}
                                </div>
                              )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </FieldArray>

            {/* BUTTONS */}
            <div className="flex justify-center gap-4">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded"
              >
                {isEdit ? "Update" : "Submit"}
              </button>

              <Link to="/obe/settings/VISION">
                <button
                  type="button"
                  className="bg-gray-300 hover:bg-gray-400 text-black px-6 py-2 rounded"
                >
                  Cancel
                </button>
              </Link>
            </div>
          </Form>
        )}
      </Formik>
      {alert}
    </div>
  );
};

export default AddPSO;
