import React, { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Link } from "react-router-dom";
import { courseService } from "../../../Courses/Services/courses.service.js";
import { BloomService } from "../Services/bloom.service.js";
import SweetAlert from "react-bootstrap-sweetalert";

const AddBloomLevel = () => {
  const [papers, setPapers] = useState([]);
  const [BloomsList, setBloomsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        setLoading(true);
        const res = await courseService.getAllCourses();
        setPapers(res || []);
      } catch (err) {
        console.error(err);
        setPapers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPapers();
  }, []);

  useEffect(() => {
    const fetchBloomLevelDefine = async () => {
      try {
        setLoading(true);
        const res = await BloomService.fetchBloomLevelDefine();
        setBloomsList(res || []);
      } catch (err) {
        console.error(err);
        setBloomsList([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBloomLevelDefine();
  }, []);

  const initialValues = {
    subject_id: "",
    bloomsLevelIds: [],
  };

  const validationSchema = Yup.object().shape({
    subject_id: Yup.string().required("Course is required"),
    bloomsLevelIds: Yup.array()
      .min(1, "Select at least one Bloom Level")
      .required("Required"),
  });

  const handleSubmit = async (values, { resetForm }) => {
    if (!values.subject_id) {
      alert("Please select a course");
      return;
    }

    // Payload is just the array of selected Bloom level IDs
    const payload = values.bloomsLevelIds;

    try {
      setLoading(true);

      // Get existing mappings for this course
    const existingMappings = await BloomService.getMappedDataOfBlooms(values.subject_id);

    if (existingMappings && existingMappings.length > 0) {
      // Already mapped → show error
      setAlert(
        <SweetAlert
          error
          title="Error!"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => setAlert(null)}
        >
          Bloom Level already saved for this course.
        </SweetAlert>
      );
      return;
    }

      // Pass subject_id as URL param, payload as request body
      await BloomService.saveMappingBloomsWithSubject(values.subject_id, payload);
      setAlert(
        <SweetAlert
          success
          title="Saved!"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => {
            setAlert(null);
            window.location.href = "/obe/settings/BLOOM_LEVEL"; // redirect after OK
          }}
        >
          Bloom Level has been saved successfully.
        </SweetAlert>
      );
      resetForm();
    } catch (err) {
      console.error(err);
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
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="pageheading text-xl font-semibold">
          Add Bloom Levels
        </h1>
        <Link
          to="/obe/settings/BLOOM_LEVEL"
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm"
        >
          Close
        </Link>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, setFieldValue }) => (
          <Form>
            {/* Course Selection */}
            <div className="mb-4">
              <label className="block mb-1 font-medium">
                Course <span className="text-red-500">*</span>
              </label>
              <select
                className="border p-2 rounded w-full"
                value={values.subject_id}
                onChange={(e) => setFieldValue("subject_id", e.target.value)}
              >
                <option value="">Select Course</option>
                {papers.map((c) => (
                  <option key={c.subject_id} value={c.subject_id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ErrorMessage
                name="subject_id"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            {/* Bloom Levels Table */}
            <div className="mb-4">
              <label className="block mb-2 font-medium">
                Select Bloom Levels <span className="text-red-500">*</span>
              </label>
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto border border-primary-700">
                  <thead>
                    <tr className="bg-primary-600 text-left">
                      <th className="px-4 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={
                            values.bloomsLevelIds.length === BloomsList.length &&
                            BloomsList.length > 0
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFieldValue(
                                "bloomsLevelIds",
                                BloomsList.map((bl) => bl.nba_blooms_level_id)
                              );
                            } else {
                              setFieldValue("bloomsLevelIds", []);
                            }
                          }}
                        />
                      </th>
                      <th className="px-4 py-2 text-white">BL No.</th>
                      <th className="px-4 py-2 text-white">Bloom Level Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {BloomsList.map((bl) => (
                      <tr key={bl.nba_blooms_level_id}>
                        <td className="text-center px-4 py-2">
                          <input
                            type="checkbox"
                            checked={values.bloomsLevelIds.includes(
                              bl.nba_blooms_level_id
                            )}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFieldValue("bloomsLevelIds", [
                                  ...values.bloomsLevelIds,
                                  bl.nba_blooms_level_id,
                                ]);
                              } else {
                                setFieldValue(
                                  "bloomsLevelIds",
                                  values.bloomsLevelIds.filter(
                                    (id) => id !== bl.nba_blooms_level_id
                                  )
                                );
                              }
                            }}
                          />
                        </td>
                        <td className="px-4 py-2">{bl.blooms_level_no}</td>
                        <td className="px-4 py-2">{bl.blooms_level}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <ErrorMessage
                  name="bloomsLevelIds"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-center gap-4 mt-6">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                Submit
              </button>
              <button
                type="reset"
                className="bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </Form>
        )}
      </Formik>
      {alert}
    </div>
  );
};

export default AddBloomLevel;
