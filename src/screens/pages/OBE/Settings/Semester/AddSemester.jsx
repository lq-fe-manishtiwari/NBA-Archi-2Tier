import React, { useState, useEffect } from "react";
import { Formik, Form, Field, FieldArray } from "formik";
import * as Yup from "yup";
import { Link } from "react-router-dom";

// Dummy batches/programs
const dummyBatches = [
  { grade_id: 1, name: "Program 1" },
  { grade_id: 2, name: "Program 2" },
];

const AddSemester = ({ location }) => {
  const locationState = location?.state || {};
  const semesterId = locationState.semester_id || "";
  const isEdit = !!semesterId;

  const [semesters, setSemesters] = useState(
    locationState.semester_name
      ? [{ semesterName: locationState.semester_name }]
      : [{ semesterName: "" }]
  );

  const [gradeId, setGradeId] = useState(
    locationState.grade_id ||
      (localStorage.getItem("nba_program")
        ? JSON.parse(localStorage.getItem("nba_program")).grade_id
        : "")
  );

  const addSemesterRow = (arrayHelpers) => {
    arrayHelpers.push({ semesterName: "" });
  };

  const removeSemesterRow = (index, arrayHelpers) => {
    if (semesters.length > 1) arrayHelpers.remove(index);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">{isEdit ? "Edit" : "Add"} Semester</h2>
        <Link to="/obe/settings/SEMESTER">
          x
        </Link>
      </div>

      {/* Form Card */}
      <div className="bg-white p-6 rounded shadow">
        <Formik
          enableReinitialize
          initialValues={{ gradeId: gradeId, semesters: semesters }}
          validationSchema={Yup.object({
            gradeId: Yup.string().required("Program is required"),
            semesters: Yup.array()
              .of(
                Yup.object({
                  semesterName: Yup.string().required("Semester Name is required"),
                })
              )
              .min(1, "At least one semester is required"),
          })}
          onSubmit={(values, { resetForm }) => {
            console.log("Submitted values:", values);
            alert(`${isEdit ? "Updated" : "Added"} Successfully!`);
            resetForm();
          }}
        >
          {({ values, errors, touched, handleChange, isSubmitting }) => (
            <Form>
              {/* Program Dropdown */}
              <div className="mb-4">
                <label className="block mb-1 font-medium">Program <span className="text-red-500">*</span></label>
                <Field
                  as="select"
                  name="gradeId"
                  className="w-full border rounded p-2"
                  value={values.gradeId}
                  onChange={handleChange}
                >
                  <option value="">Select Program</option>
                  {dummyBatches.map((batch) => (
                    <option key={batch.grade_id} value={batch.grade_id}>
                      {batch.name}
                    </option>
                  ))}
                </Field>
                {errors.gradeId && touched.gradeId && (
                  <div className="text-red-500 text-sm mt-1">{errors.gradeId}</div>
                )}
              </div>

              {/* Semester Table */}
              <FieldArray name="semesters">
                {(arrayHelpers) => (
                  <div className="overflow-x-auto mb-4">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-800 text-white">
                          <th className="border px-2 py-1">Semester Name</th>
                          {!isEdit && <th className="border px-2 py-1">Actions</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {values.semesters.map((sem, index) => (
                          <tr key={index}>
                            <td className="border px-2 py-1">
                              <Field
                                type="text"
                                name={`semesters[${index}].semesterName`}
                                placeholder="Enter Semester Name"
                                className="w-full border rounded p-1"
                              />
                              {errors.semesters &&
                                errors.semesters[index]?.semesterName &&
                                touched.semesters &&
                                touched.semesters[index]?.semesterName && (
                                  <div className="text-red-500 text-sm mt-1">
                                    {errors.semesters[index].semesterName}
                                  </div>
                                )}
                            </td>
                            {!isEdit && (
                              <td className="border px-2 py-1 text-center">
                                <div className="flex justify-center gap-2">
                                  <button
                                    type="button"
                                    className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center"
                                    onClick={() => addSemesterRow(arrayHelpers)}
                                  >
                                    +
                                  </button>
                                  <button
                                    type="button"
                                    className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center"
                                    onClick={() => removeSemesterRow(index, arrayHelpers)}
                                    disabled={values.semesters.length <= 1}
                                  >
                                    -
                                  </button>
                                </div>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </FieldArray>

              {/* Submit / Cancel Buttons */}
              <div className="flex justify-center gap-2">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-6 py-2 rounded"
                  disabled={isSubmitting}
                >
                  {isEdit ? "Update" : "Submit"}
                </button>
                <Link to="/obe-setting" className="bg-gray-300 px-6 py-2 rounded flex items-center justify-center">
                  Cancel
                </Link>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default AddSemester ;
