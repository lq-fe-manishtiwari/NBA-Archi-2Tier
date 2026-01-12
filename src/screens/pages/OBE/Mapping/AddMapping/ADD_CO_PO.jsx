import React, { useState, useEffect } from "react";
import Select from "react-select";
import SweetAlert from "react-bootstrap-sweetalert";
import { AcademicService } from "../../../Academics/Services/Academic.service";
import { collegeService } from "../../../Academics/Services/college.service";
import { classService } from '../../../Academics/Services/class.service.js'
import { courseService } from "../../../Courses/Services/courses.service.js";
import { MappingService } from "../../Services/mapping.service";
import { POService } from "../../Settings/Services/po.service.js";
import { PSOService } from "../../Settings/Services/pso.service.js";
import { BloomService } from "../../Settings/Services/bloom.service.js";
import { COService } from "../../Settings/Services/co.service.js";

export default function ADD_CO_PO() {

  const mappingLevels = [
    { value: "3", label: "3" },
    { value: "2", label: "2" },
    { value: "1", label: "1" },
    { value: "-", label: "-" },
  ];
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [academicyear, setAcademicyear] = useState([]);
  const [selectedAcademicyear, setSelectedAcademicyear] = useState(null);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [courses, setCourse] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [classOptions, setClassOptions] = useState([]);
  const [semesterOptions, setSemesterOptions] = useState([]);
  const [courseMappingData, setCourseMappingData] = useState({});

  const [poData, setPoData] = useState([]);
  const [psoData, setPsoData] = useState([]);
  const [bloomRows, setBloomRows] = useState({});
  const [coMaster, setCoMaster] = useState([]);

  // Load stored program AFTER programs are fetched
  useEffect(() => {
    const storedProgram = localStorage.getItem("selectedOBEprogram");

    if (storedProgram && programs.length > 0) {
      const foundProgram = programs.find(
        (p) => Number(p.value) === Number(storedProgram)
      );

      if (foundProgram) {
        setSelectedProgram(foundProgram.value);
        getPObyProgramIdYear(foundProgram.value, selectedAcademicyear?.value);
        getAllPSO(foundProgram.value);
      }
    }
  }, [programs]);

  useEffect(() => {
    const loadPrograms = async () => {
      try {
        const res = await collegeService.getAllprogram();
        const formatted = res.map((p) => ({
          label: p.program_name,
          value: p.program_id,
        }));
        setPrograms(formatted);
      } catch (err) {
        console.error("Failed to load programs:", err);
      }
    };
    loadPrograms();
  }, []);

  useEffect(() => {
    const fetchAcademicYears = async () => {
      try {
        const res = await AcademicService.getAcademic();

        // const years = res.data || res.data?.data || [];   // <-- FIXED

        const formatted = res.map((item) => ({
          value: item.id,
          label: item.year,
        }));

        setAcademicyear(formatted);
      } catch (err) {
        console.error("Failed to load academic years:", err);
      }
    };

    fetchAcademicYears();
  }, []);

  // Fetch Classes when program changes
  useEffect(() => {
    const loadClasses = async () => {
      if (!selectedProgram) {
        setClassOptions([]);
        return;
      }
      try {
        const res = await classService.getAllClasses(selectedProgram);
        let formattedClasses = [];
        if (Array.isArray(res)) {
          formattedClasses = res.map(c => ({
            label: c.name,
            value: c.class_year_id,
            full: c,
          }));
        } else if (res && typeof res === "object") {
          formattedClasses = [{ label: res.name, value: res.class_year_id, full: res }];
        }
        setClassOptions(formattedClasses);
      } catch (err) {
        console.error(err);
        setClassOptions([]);
      }
    };
    loadClasses();
  }, [selectedProgram]);

  // Fetch Semesters when class changes
  useEffect(() => {
    if (!selectedClass) {
      setSemesterOptions([]);
      setSelectedSemester("");
      return;
    }

    // Convert to string to avoid type mismatch
    const classObj = classOptions.find(c => String(c.value) === String(selectedClass));

    if (classObj && classObj.full?.semesters) {
      const formattedSemesters = classObj.full.semesters.map(s => ({
        label: s.name,        // "first sem", "third sem"
        value: s.semester_id,
      }));
      setSemesterOptions(formattedSemesters);
      setSelectedSemester("");  // reset semester when class changes
    } else {
      setSemesterOptions([]);
      setSelectedSemester("");
    }
  }, [selectedClass, classOptions]);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await courseService.getAllCourses();

        const courses = res.data || res;

        const formatted = courses.map((item) => ({
          value: item.subject_id,
          label: item.name,
          subject_code: item.subject_code || "",
        }));

        setSelectedCourses([]); // optional: clear previous selections
        setCourseMappingData({});
        setCourse(formatted);
      } catch (err) {
        console.error("Failed to load courses:", err);
      }
    };

    fetchCourse();
  }, []);

  const getCOBySemCourseId = async (semester_id, subject_id) => {
    try {
      setLoading(true);
      const response = await COService.getCOBySemCourseId(semester_id, subject_id);

      const data = response?.data || response || [];
      if (!Array.isArray(data) || data.length === 0) {
        console.log("No CO data found");
        return [];
      }

      const formatted = data.map(co => ({
        co_id: co.co_id,
        code: co.co_code,
        description: co.co_statement
      }));

      setCoMaster(formatted);
      return formatted;
    } catch (err) {
      console.error("Failed to load CO data:", err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getPObyProgramIdYear = async (program_id, year_id) => {
    try {
      setLoading(true);
      const response = await POService.getPObyProgramIdYear(program_id, year_id);
      const data = response?.data || response || [];

      if (!Array.isArray(data)) {
        console.log("PO data is not an array:", data);
        setPoData([]);
        return;
      }

      const formatted = data.map(po => ({
        id: po.po_id,
        code: po.po_code,
        statement: po.po_statement
      }));
      setPoData(formatted);
    } catch (err) {
      console.error("Failed to load PO data:", err);
      setPoData([]);
    } finally {
      setLoading(false);
    }
  };

  const getAllPSO = async (program_id) => {
    try {
      setLoading(true);
      const response = await PSOService.getPSOByProgramId(program_id);
      const data = response?.data || response || [];

      if (!Array.isArray(data)) {
        console.log("PSO data is not an array:", data);
        setPsoData([]);
        return;
      }

      const formatted = data.map(pso => ({
        id: pso.pso_id,
        code: pso.pso_code,
        statement: pso.pso_statement
      }));

      setPsoData(formatted);
    } catch (err) {
      console.error("Failed to fetch PSO data:", err);
      setPsoData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMappedBlooms = async (courseId) => {
    try {
      setLoading(true);
      const response = await BloomService.getMappedDataOfBlooms(courseId);
      const data = response?.data || response || [];

      if (!Array.isArray(data)) {
        console.log("Bloom data is not an array:", data);
        setBloomRows(prev => ({ ...prev, [courseId]: [] }));
        return;
      }

      const formatted = data.map(b => ({
        value: b.id,
        label: `${b.blooms_level_no}: ${b.blooms_level}`
      }));

      setBloomRows(prev => ({
        ...prev,
        [courseId]: formatted
      }));
    } catch (err) {
      console.error("Error loading blooms:", err);
      setBloomRows(prev => ({ ...prev, [courseId]: [] }));
    } finally {
      setLoading(false);
    }
  };


  const initializeCourseMapping = () => {
    return coMaster.map((co) => ({
      co_id: co.co_id,
      code: co.code,
      description: co.description,

      bloom_levels: [],

      po_mappings: Array(poData.length).fill("-"),
      pso_mappings: Array(psoData.length).fill("-"),
    }));
  };


  /** ---------------------------------
   * Handle Course Selection
   ----------------------------------*/
  const handleCourseChange = async (selected) => {
    if (!selected) {
      setSelectedCourses([]);
      setCourseMappingData({});
      return;
    }

    const selectedArr = Array.isArray(selected) ? selected : [selected];
    setSelectedCourses(selectedArr);

    if (!selectedSemester) {
      console.log("Please select semester first");
      return;
    }

    let updated = { ...courseMappingData };

    for (let course of selectedArr) {
      const courseId = course.value;

      const cos = await getCOBySemCourseId(selectedSemester, courseId);
      await fetchMappedBlooms(courseId);

      if (cos && cos.length > 0) {
        updated[courseId] = cos.map((co) => ({
          co_id: co.co_id,
          code: co.code,
          description: co.description,
          bloom_levels: [],
          po_mappings: Array(poData.length).fill("-"),
          pso_mappings: Array(psoData.length).fill("-"),
        }));
      }
    }

    setCourseMappingData(updated);
  };

  const handleBloomLevelChange = (courseId, coId, selectedOptions) => {
    setCourseMappingData((prev) => ({
      ...prev,
      [courseId]: prev[courseId].map((co) =>
        co.co_id === coId
          ? {
            ...co,
            bloom_levels: selectedOptions.map((o) => o.value),
          }
          : co
      ),
    }));
  };

  const handlePoChange = (courseId, coId, index, value) => {
    setCourseMappingData((prev) => ({
      ...prev,
      [courseId]: prev[courseId].map((co) =>
        co.co_id === coId
          ? {
            ...co,
            po_mappings: co.po_mappings.map((lvl, i) => (i === index ? value : lvl)),
          }
          : co
      ),
    }));
  };

  const handlePsoChange = (courseId, coId, index, value) => {
    setCourseMappingData((prev) => ({
      ...prev,
      [courseId]: prev[courseId].map((co) =>
        co.co_id === coId
          ? {
            ...co,
            pso_mappings: co.pso_mappings.map((lvl, i) => (i === index ? value : lvl)),
          }
          : co
      ),
    }));
  };

  const calculateAverages = (mappingRows) => {
    if (!mappingRows.length) return { poAverages: [], psoAverages: [] };

    const poAverages = poData.map((_, idx) => {
      const values = mappingRows.map(co => {
        const val = co.po_mappings[idx];
        return !isNaN(parseInt(val)) ? parseInt(val) : 0;
      });
      const sum = values.reduce((a, b) => a + b, 0);
      return values.length ? (sum / values.length).toFixed(2) : "0";
    });

    const psoAverages = psoData.map((_, idx) => {
      const values = mappingRows.map(co => {
        const val = co.pso_mappings[idx];
        return !isNaN(parseInt(val)) ? parseInt(val) : 0;
      });
      const sum = values.reduce((a, b) => a + b, 0);
      return values.length ? (sum / values.length).toFixed(2) : "0";
    });

    return { poAverages, psoAverages };
  };


  const SaveMapping = async () => {
    if (!selectedProgram || !selectedCourses.length) return;

    try {
      // Build cos array for each selected course
      const cosPayload = selectedCourses.flatMap((course) => {
        const courseId = course.value;
        const mappingRows = courseMappingData[courseId] || [];

        return mappingRows.map((co) => {
          const blooms_level_ids = co.bloom_levels || [];
          const mappings = [];

          // PO mappings
          co.po_mappings.forEach((val, idx) => {
            const po_id = poData[idx]?.id;
            if (po_id && val !== "-" && val !== undefined && val !== null) {
              mappings.push({ po_id, correlation_level: val });
            }
          });

          // PSO mappings
          co.pso_mappings.forEach((val, idx) => {
            const pso_id = psoData[idx]?.id;
            if (pso_id && val !== "-" && val !== undefined && val !== null) {
              mappings.push({ pso_id, correlation_level: val });
            }
          });

          return { co_id: co.co_id, blooms_level_ids, mappings };
        });
      });

      // Calculate averages safely
      const mergedAverages = selectedCourses.reduce(
        (acc, course) => {
          const mappingRows = courseMappingData[course.value] || [];
          const { poAverages, psoAverages } = calculateAverages(mappingRows);

          poAverages.forEach((v, i) => {
            if (v !== undefined && !isNaN(parseFloat(v))) {
              if (!acc.po[i]) acc.po[i] = [];
              acc.po[i].push(parseFloat(v));
            }
          });

          psoAverages.forEach((v, i) => {
            if (v !== undefined && !isNaN(parseFloat(v))) {
              if (!acc.pso[i]) acc.pso[i] = [];
              acc.pso[i].push(parseFloat(v));
            }
          });

          return acc;
        },
        { po: [], pso: [] }
      );

      const averages = [
        ...poData.map((po, idx) => ({
          po_id: po.id,
          average_correlation:
            mergedAverages.po[idx]?.length
              ? parseFloat(
                (
                  mergedAverages.po[idx].reduce((a, b) => a + b, 0) /
                  mergedAverages.po[idx].length
                ).toFixed(2)
              )
              : 0,
        })),
        ...psoData.map((pso, idx) => ({
          pso_id: pso.id,
          average_correlation:
            mergedAverages.pso[idx]?.length
              ? parseFloat(
                (
                  mergedAverages.pso[idx].reduce((a, b) => a + b, 0) /
                  mergedAverages.pso[idx].length
                ).toFixed(2)
              )
              : 0,
        })),
      ];

      const payload = {
        program_id: selectedProgram,
        // teacher_id: 34, // replace with dynamic ID if available
        subject_id: selectedCourses[0]?.value,
        cos: cosPayload,
        averages,
      };

      console.log("Payload to save:", payload);
      await MappingService.saveCOPOMapping(payload);
      setAlert(
        <SweetAlert
          success
          title="Saved!"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => {
            setAlert(null);
            window.location.href = "/obe/Mapping/CO-PO"; // redirect after OK
          }}
        >
          Mapping has been saved successfully.
        </SweetAlert>
      );
    } catch (err) {
      console.error("Error saving mapping:", err);
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
      <h4 className="pageheading text-xl font-semibold mb-6">
        CO-PO Mapping
      </h4>

      {/* -------------------- Filters Section ---------------------- */}
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Program */}
          <div>
            <label className="font-semibold">Program</label>
            <Select
              options={programs}
              value={programs.find(p => p.value === selectedProgram)} // find by value
              onChange={async (selected) => {
                setSelectedProgram(selected.value);
                localStorage.setItem("selectedOBEprogram", selected.value);
                setSelectedClass("");
                setSelectedSemester("");
                if (selected && selectedAcademicyear?.value) {
                  await getPObyProgramIdYear(selected.value, selectedAcademicyear.value);
                  await getAllPSO(selected.value);
                }
              }}
              placeholder="Select Program"
            />
          </div>

          <div>
            <label className="font-semibold">Academic Year</label>
            <Select
              options={academicyear}
              value={selectedAcademicyear}
              onChange={async (selected) => {
                setSelectedAcademicyear(selected);
                console.log("Selected Academic Year ID:", selected.value);
                if (selectedProgram && selected?.value) {
                  await getPObyProgramIdYear(selectedProgram, selected.value);
                }
              }}
              placeholder="Select Academic Year"
            />

          </div>

          <div>
            <label className="font-semibold">class</label>
            <Select
              options={classOptions}
              value={classOptions.find(c => c.value === selectedClass)}
              onChange={(selected) => setSelectedClass(selected.value)}
              placeholder="Select Class"
            />

          </div>

          {/* Semester */}
          <div>
            <label className="font-semibold">Semester</label>
            <Select
              options={semesterOptions}
              value={semesterOptions.find(s => s.value === selectedSemester)}
              onChange={async (selected) => {
                setSelectedSemester(selected.value);

                if (selected.value && selectedCourses.length === 0) {
                  // Load COs only by semester at first
                  await getCOBySemCourseId(selected.value, null);
                }
              }}
              placeholder="Select Semester"
            />
          </div>

          {/* Course */}
          <div>
            <label className="font-semibold">Courses</label>
            <Select
              // isMulti
              options={courses}        // <-- your real API data
              value={courses.find(c => c.value === selectedCourses[0]?.value)}
              onChange={handleCourseChange}
              placeholder="Select Courses"
            />

          </div>
        </div>
      </div>

      {/* -------------------- Mapping Cards ---------------------- */}
      {selectedCourses.map((course) => {
        const courseId = course.value;
        const mappingRows = courseMappingData[courseId] || [];

        return (
          <div key={courseId} className="w-full"
          >
            <h2 className="text-xl font-bold text-white bg-primary-600 px-4 py-2 rounded">
              {course.subject_code} — {course.label}
            </h2>

            {/* MAPPING TABLE */}
            <div className="overflow-x-auto overflow-y-visible border rounded bg-white shadow-sm mt-4 w-full">
              <table className="border-collapse text-sm w-full table-auto">
                <thead className="bg-primary-600 text-white">
                  <tr>
                    <th className="border px-2 py-2" style={{ width: '80px' }}>CO Code</th>
                    <th className="border px-2 py-2" style={{ width: '250px' }}>CO Statement</th>
                    <th className="border px-2 py-2" style={{ width: '220px' }}>Bloom's Level</th>
                    {poData.map((po) => (
                      <th key={po.id} className="border px-2 py-2" style={{ width: '70px', minWidth: '70px' }}>
                        {po.code}
                      </th>
                    ))}
                    {psoData.map((pso) => (
                      <th key={pso.id} className="border px-2 py-2" style={{ width: '70px', minWidth: '70px' }}>
                        {pso.code}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {mappingRows.map((co) => (
                    <tr key={co.co_id}>
                      <td className="border px-2 py-2" style={{ width: '80px' }}>{co.code}</td>
                      <td className="border px-2 py-2" style={{ width: '250px' }}>
                        <div className="truncate" title={co.description}>{co.description}</div>
                      </td>

                      {/* Bloom Levels */}
                      <td className="border px-2 py-2" style={{ width: '200px' }}>
                        <Select
                          /* 🔒 ABSOLUTE SCROLL FIX */
                          menuPosition="fixed"
                          menuPortalTarget={document.body}
                          menuShouldScrollIntoView={false}
                          menuShouldBlockScroll={true}
                          closeMenuOnScroll={false}
                          openMenuOnFocus={false}
                          blurInputOnSelect={true}

                          styles={{
                            container: (base) => ({
                              ...base,
                              width: '200px',
                            }),

                            control: (base) => ({
                              ...base,
                              minHeight: '28px',
                              height: 'auto',          
                              alignItems: 'flex-start', 
                            }),

                            valueContainer: (base) => ({
                              ...base,
                              display: 'flex',
                              flexDirection: 'column',  
                              padding: '2px 6px',
                              gap: '2px', 
                            }),

                            multiValue: (base) => ({
                              ...base,
                              width: '100%',       
                              margin: '2px 0',
                              minHeight: '22px',
                            }),

                            multiValueLabel: (base) => ({
                              ...base,
                              whiteSpace: 'normal',
                              fontSize: '12px',
                            }),

                            indicatorsContainer: (base) => ({
                              ...base,
                              height: '28px', 
                            }),

                            menuPortal: (base) => ({
                              ...base,
                              zIndex: 9999,
                            }),

                            menuList: (base) => ({
                              ...base,
                              maxHeight: '220px',
                            }),
                          }}
                          isMulti
                          options={bloomRows[courseId] || []}
                          value={(bloomRows[courseId] || []).filter(b => co.bloom_levels.includes(b.value))}
                          onChange={(opt) => handleBloomLevelChange(courseId, co.co_id, opt)}
                        />
                      </td>

                      {/* PO Mappings */}
                      {co.po_mappings.map((val, idx) => (
                        <td className="border px-2 py-2" key={idx} style={{ width: '80px' }}>
                          <select
                            className="border rounded px-1 py-1 w-full text-xs"
                            value={val}
                            onChange={(e) =>
                              handlePoChange(
                                courseId,
                                co.co_id,
                                idx,
                                e.target.value
                              )
                            }
                          >
                            {mappingLevels.map((lvl) => (
                              <option key={lvl.value} value={lvl.value}>
                                {lvl.label}
                              </option>
                            ))}
                          </select>
                        </td>
                      ))}

                      {/* PSO Mappings */}
                      {co.pso_mappings.map((val, idx) => (
                        <td className="border px-2 py-2" key={`pso-${idx}`} style={{ width: '80px' }}>
                          <select
                            className="border rounded px-1 py-1 w-full text-xs"
                            value={val}
                            onChange={(e) =>
                              handlePsoChange(
                                courseId,
                                co.co_id,
                                idx,
                                e.target.value
                              )
                            }
                          >
                            {mappingLevels.map((lvl) => (
                              <option key={lvl.value} value={lvl.value}>
                                {lvl.label}
                              </option>
                            ))}
                          </select>
                        </td>
                      ))}
                    </tr>
                  ))}

                  {/* Average Row */}
                  {mappingRows.length > 0 && (() => {
                    const { poAverages, psoAverages } = calculateAverages(mappingRows);
                    return (
                      <tr className="bg-gray-200 font-semibold">
                        <td colSpan={3} className="text-center">Average</td>
                        {poAverages.map((avg, idx) => <td key={idx} className="text-center">{avg}</td>)}
                        {psoAverages.map((avg, idx) => <td key={`pso-${idx}`} className="text-center">{avg}</td>)}
                      </tr>
                    )
                  })()}
                </tbody>
              </table>
            </div>

            {/* FOOTER BUTTONS */}
            <div className="flex justify-center gap-3 mt-4">
              <button className="bg-blue-600 text-white px-5 py-2 rounded shadow hover:bg-blue-700"
                onClick={SaveMapping}>
                Save Mapping
              </button>
              <button className="bg-gray-400 text-white px-5 py-2 rounded shadow hover:bg-gray-500">
                Cancel
              </button>
            </div>
          </div>
        );
      })}
      {alert}
    </div>
  );
}
