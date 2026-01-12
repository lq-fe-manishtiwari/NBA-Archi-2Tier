import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Formik, Field, Form, ErrorMessage } from "formik";
import { MappingService } from "../../Services/mapping.service";
import { collegeService } from "../../../Academics/Services/college.service";
import { courseService } from "../../../Courses/Services/courses.service.js";
import * as Yup from "yup";

const CO_PO = () => {
    const [programs, setPrograms] = useState([]);
    const [courseOptions, setCourseOptions] = useState([]);
    const [selectedProgramId, setSelectedProgramId] = useState("");
    const [selectedCourse, setSelectedCourse] = useState("");
    const [loading, setLoading] = useState(false);
    const [missions, setMissions] = useState([]);
    const [coPoMappingData, setCoPoMappingData] = useState([]);
    const [pos, setPos] = useState([]);
    const [psos, setPsos] = useState([]);

    useEffect(() => {
        fetchPrograms();
        fetchCourses();
    }, []);


    const fetchPrograms = async () => {
        try {
            setLoading(true);
            const data = await collegeService.getAllprogram();
            setPrograms(data);
        } catch (err) {
            setError("Failed to fetch programs. Please try again later.");
            console.error("Failed to fetch programs:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCourses = async () => {
        try {
            const res = await courseService.getAllCourses();
            setCourseOptions(res || []);
        } catch (err) {
            console.error(err);
            setCourseOptions([]);
        }
    };


    // const onProgramChange = async (program_id) => {
    //     setSelectedProgramId(program_id);

    //     if (!program_id) {
    //         // if no program selected, show all visions
    //         setMissionData(allMissionData);
    //         return;
    //     }
    //     try {
    //         setLoading(true);
    //         // Call API to get filtered vision data by program_id
    //         const response = await MappingService.getPEOMissionMapping(program_id);
    //         setMissionData(response);
    //     } catch (err) {
    //         console.error("Error fetching vision by program:", err);
    //         setMissionData([]);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const handleCourseChange = async (courseId) => {
        setSelectedCourse(courseId);

        if (!courseId) return;

        try {
            setLoading(true);

            // Call API
            const response = await MappingService.getCOPOMapping(courseId);

            console.log("CO-PO Mapping Response:", response);
            setCoPoMappingData(response || []);

            // Extract unique POs from the response
            if (response && response.length > 0) {
                const poMap = new Map();
                const psoMap = new Map();

                response.forEach(item => {
                    // POs
                    if (item.po && !poMap.has(item.po.po_id)) {
                        poMap.set(item.po.po_id, {
                            po_id: item.po.po_id,
                            po_code: item.po.po_code,
                        });
                    }
                    // PSOs
                    if (item.pso && !psoMap.has(item.pso.pso_id)) {
                        psoMap.set(item.pso.pso_id, {
                            pso_id: item.pso.pso_id,
                            pso_code: item.pso.pso_code,
                        });
                    }
                });

                setPos(Array.from(poMap.values()));
                setPsos(Array.from(psoMap.values()));
            }


        } catch (err) {
            console.error("Error fetching CO-PO mapping:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-2">

            <div className="flex justify-between items-center mb-6">
                <h2 className="pageheading text-xl font-semibold">CO-PO Mapping Dashboard</h2>
                <Link
                    to="/obe/Mapping/Add-CO-PO"
                    className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded text-sm"
                >
                    Add CO-PO Mapping
                </Link>
            </div>

            <Formik
                enableReinitialize={true}
                initialValues={{
                    grade_id: "",
                }}
                validationSchema={Yup.object().shape({
                    grade_id: Yup.string().required("Required"),
                })}
                onSubmit={(values) => {
                    console.log("Final Form Values:", values);
                    alert("Mapping saved! (dummy)");
                }}
            >
                {({ values, handleChange, setFieldValue }) => (
                    <Form>
                        {/* Course Dropdown and Button */}
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end mb-6">
                            <div className="flex-1 max-w-xs">
                                <label className="block font-medium mb-1">
                                    Course
                                </label>
                                <select
                                    value={selectedCourse}
                                    onChange={(e) => handleCourseChange(e.target.value)}
                                    className="w-full border p-2 rounded"
                                >
                                    <option value="">Select Course</option>
                                    {courseOptions.map(c => (
                                        <option key={c.subject_id} value={c.subject_id}>
                                            {c.name || c.subject_name}
                                        </option>
                                    ))}
                                </select>
                                <ErrorMessage
                                    name="grade_id"
                                    component="div"
                                    className="text-red-500 text-sm"
                                />
                            </div>
                            {/* <Link to="/obe/Mapping/Add-CO-PO" className="flex-shrink-0">
                                <button
                                    type="button"
                                    className="bg-primary-600 text-white px-3 py-2 text-sm rounded shadow hover:bg-primary-700 whitespace-nowrap"
                                >
                                    Add CO-PO Mapping
                                </button>
                            </Link> */}
                        </div>

                        {/* CO-PO Mapping Table */}
                         {coPoMappingData.length > 0 && (
                        <div className="relative border rounded bg-white shadow-sm">
                            <div className="overflow-x-auto overflow-y-auto max-h-[70vh]">
                                <table className="table-fixed border-collapse min-w-[1200px] w-full text-xs">
                                    <thead className="sticky top-0 z-30 bg-primary-600">
                                        <tr>
                                            <th className="sticky left-0 z-40 bg-primary-600 text-white px-4 py-2 w-16">CO</th>
                                            <th className="sticky left-16 z-40 bg-primary-600 text-white px-4 py-2 w-48">CO Statement</th>
                                            <th className="sticky left-64 z-40 bg-primary-600 text-white px-4 py-2 w-20">Blooms</th>
                                            <th className="sticky left-84 z-40 bg-primary-600 text-white px-4 py-2 w-20">Avg</th>

                                            {pos.map(po => (
                                                <th key={po.po_id} className="px-4 py-2 text-white">
                                                    {po.po_code}
                                                </th>
                                            ))}

                                            {psos.map(pso => (
                                                <th key={pso.pso_id} className="px-4 py-2 text-white">
                                                    {pso.pso_code}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {coPoMappingData.map((item, idx) => (
                                            <tr key={idx} className="text-center">
                                                <td className="sticky left-0 bg-white z-20 border px-4 py-2">
                                                    {item.co?.co_code}
                                                </td>

                                                <td className="sticky left-16 bg-white z-20 border px-4 py-2 text-left truncate">
                                                    {item.co?.co_statement}
                                                </td>

                                                <td className="sticky left-64 bg-white z-20 border px-4 py-2">
                                                    {item.blooms_levels?.[0]?.blooms_level_no || "-"}
                                                </td>

                                                <td className="sticky left-84 bg-white z-20 border px-4 py-2">
                                                    {item.average_correlation || "-"}
                                                </td>

                                                {pos.map(po => (
                                                    <td key={po.po_id} className="border px-4 py-2">
                                                        {item.po?.po_id === po.po_id ? item.correlation_level : "-"}
                                                    </td>
                                                ))}

                                                {psos.map(pso => (
                                                    <td key={pso.pso_id} className="border px-4 py-2">
                                                        {item.pso?.pso_id === pso.pso_id ? item.correlation_level : "-"}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default CO_PO;
