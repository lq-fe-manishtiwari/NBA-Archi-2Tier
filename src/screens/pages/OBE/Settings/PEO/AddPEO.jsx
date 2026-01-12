import React, { useState, useEffect } from "react";
import { Formik, Form, FieldArray } from "formik";
import { collegeService } from "../../../Academics/Services/college.service";
import { PEOService } from "../Services/peo.service"; // Correct service import
import * as Yup from "yup";
import SweetAlert from "react-bootstrap-sweetalert";
import { Link, useLocation } from "react-router-dom";

const AddPEO = () => {
  const location = useLocation();
  const isEdit = location.state?.isEdit || false;
  const peoData = location.state?.peoData || null;

  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState("");
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      console.log("Received peoData:", peoData);
    }
  }, [isEdit, peoData]);

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

  const submitPEO = async (values) => {
    try {
      const ProgramId = values.program_id;

      const payload = {
        program_id: ProgramId,
        peos: values.peos.map(peo => ({
          nba_peo_id: peo.nba_peo_id ?? null,
          peo_code: peo.peo_code,
          peo_statement: peo.peo_statement,
        }))
      };

      const existingMissions = await PEOService.getPEOByProgramId(values.program_id);
      const existingCodes = (existingMissions || []).map((m) => m.peo_code);
      const duplicate = payload.peos.find((m) => existingCodes.includes(m.peo_code) && !m.nba_peo_id);


      if (duplicate) {
        setAlert(
          <SweetAlert
            error
            title="Error!"
            confirmBtnCssClass="btn-confirm"
            onConfirm={() => setAlert(null)}
          >
            Mission Code "${duplicate.peo_code}" already exists. Please use a different code.
          </SweetAlert>);
        return;
      }

      console.log("Payload:", payload);

      // Use bulk save for multiple PEOs
      await PEOService.saveAllPEO(payload);

      setAlert(
        <SweetAlert
          success
          title={isEdit ? "Updated!" : "Saved!"}
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => {
            setAlert(null);
            window.location.href = "/obe/settings/PEO"; // redirect after OK
          }}
        >
          Mission has been {isEdit ? "updated" : "saved"} successfully.
        </SweetAlert>
      );

    } catch (err) {
      console.error("Failed to save/update PEO:", err);
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
          {isEdit ? "Edit" : "Add"} PEO
        </h2>
        <Link
          to="/obe/settings/PEO"
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm"
        >
          Close
        </Link>
      </div>

      {/* FORM */}
      <Formik
        enableReinitialize={true}
        initialValues={{
          program_id: selectedProgram || peoData?.program?.program_id || peoData?.program_id || "",
          peos: isEdit && peoData
            ? [{
              nba_peo_id: peoData.nba_peo_id || null,
              peo_code: peoData.peo_code || "PEO1",
              peo_statement: peoData.peo_statement || ""
            }]
            : [{
              nba_peo_id: null,
              peo_code: "PEO1",
              peo_statement: ""
            }]
        }}
        validationSchema={Yup.object({
          program_id: Yup.string().required("Program is required"),
          peos: Yup.array().of(
            Yup.object({
              peo_code: Yup.string().required("PEO Code is required"),
              peo_statement: Yup.string().required("PEO Statement is required"),
            })
          ),
        })}
        onSubmit={submitPEO}
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
                disabled={isEdit} // Disable in edit mode to prevent changing program
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

            {/* PEO TABLE */}
            <FieldArray name="peos">
              {(arrayHelpers) => (
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-300 rounded-lg mb-4">
                    <thead className="bg-primary-600">
                      <tr>
                        <th className="px-6 py-3 w-40 text-left text-xs font-large text-gray-50 uppercase tracking-wider">PEO Code</th>
                        <th className="px-6 py-3 text-left text-xs font-large text-gray-50 uppercase tracking-wider">PEO Statement</th>
                        <th className="px-6 py-3 w-32 text-left text-xs font-large text-gray-50 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {values.peos.map((peo, index) => (
                        <tr key={index} className="border-t hover:bg-gray-50">
                          <td className="px-4 py-2 w-40">
                            <input
                              type="text"
                              className="border border-gray-300 rounded p-1 w-full"
                              value={peo.peo_code}
                              onChange={(e) =>
                                setFieldValue(`peos[${index}].peo_code`, e.target.value)
                              }
                            />
                             {errors.peos &&
                              errors.peos[index] &&
                              errors.peos[index].peo_code && (
                                <div className="text-red-500 text-sm mt-1">
                                  {errors.peos[index].peo_code}
                                </div>
                              )}
                          </td>

                          <td className="px-4 py-2">
                            <input
                              type="text"
                              className="border border-gray-300 rounded p-1 w-full"
                              value={peo.peo_statement}
                              onChange={(e) =>
                                setFieldValue(`peos[${index}].peo_statement`, e.target.value)
                              }
                            />

                            {errors.peos &&
                              errors.peos[index] &&
                              errors.peos[index].peo_statement && (
                                <div className="text-red-500 text-sm mt-1">
                                  {errors.peos[index].peo_statement}
                                </div>
                              )}
                          </td>

                          {/* ADD / REMOVE BUTTONS */}
                          <td className="px-4 py-2 text-center">
                            <div className="flex justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  const newCode = `PEO${values.peos.length + 1}`;
                                  arrayHelpers.push({
                                    nba_peo_id: null,
                                    peo_code: newCode,
                                    peo_statement: ""
                                  });
                                }}
                                className="bg-green-500 hover:bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center"
                              >
                                +
                              </button>

                              <button
                                type="button"
                                onClick={() => arrayHelpers.remove(index)}
                                disabled={values.peos.length <= 1}
                                className={`rounded-full w-8 h-8 flex items-center justify-center text-white 
                                    ${values.peos.length <= 1 ? "bg-red-300" : "bg-red-500 hover:bg-red-600"}`}
                              >
                                -
                              </button>
                            </div>
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

              <Link to="/obe/settings/PEO">
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

export default AddPEO;