import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collegeService } from "../Services/college.service";
import { classService } from "../Services/class.service";
import { DivisionService } from "../Services/Division.service";
import { fetchAllTeachers } from "../../Teacher/Services/teacher.service";
import { allocationService } from "../Services/Allocation.service"; // SAVE + GET
import SweetAlert from "react-bootstrap-sweetalert";
import { ArrowLeft, PlusCircle, Trash2, X } from "lucide-react";

export default function AllocateProgram() {
  const { programId } = useParams();
  const navigate = useNavigate();

  const [program, setProgram] = useState(null);
  const [classYears, setClassYears] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [selectedClassYears, setSelectedClassYears] = useState([]);
  const [allocations, setAllocations] = useState({}); // {classYearId: {semesterId: [{divisionId, teacherId}]}}
  const [isClassYearDropdownOpen, setIsClassYearDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  /* --------------------------------------------------------------
     FETCH ALL DATA + LOAD EXISTING ALLOCATIONS
  -------------------------------------------------------------- */
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [prog, classes, divs, allocatedData, teachersData] = await Promise.all([
          collegeService.getProgrambyId(programId),
          classService.getAllClasses(),
          DivisionService.getDivision(),
          allocationService.getProgramAllocatedDetailsbyProgramId(programId).catch(() => ({ data: [] })),
          fetchAllTeachers(0, 1000), // Fetch all teachers (page 0, size 1000)
        ]);

        setProgram(prog);
        setClassYears(classes);
        setDivisions(divs);

        // Map program_class_year_id to classYears for easier lookup
        if (allocatedData && allocatedData.class_years) {
          const pcyMap = new Map(allocatedData.class_years.map(cy => [cy.class_year_id, cy.program_class_year_id]));
          setClassYears(prevClasses => prevClasses.map(c => ({
            ...c,
            program_class_year_id: pcyMap.get(c.class_year_id)
          })));
        }
        
        // Transform teachers data from GraphQL response
        if (teachersData && teachersData.content) {
          const transformedTeachers = teachersData.content.map(teacher => ({
            teacher_id: teacher.teacherId,
            firstname: teacher.firstname,
            lastname: teacher.lastname || '',
            name: `${teacher.firstname} ${teacher.lastname || ''}`.trim(),
          }));
          setTeachers(transformedTeachers);
        }
        
        console.log("allocatedData",allocatedData)
        // LOAD EXISTING ALLOCATIONS from API response
        if (allocatedData && allocatedData.class_years && allocatedData.class_years.length > 0) {
          const loadedAllocations = {};
          const loadedClassYearIds = [];

          allocatedData.class_years.forEach(classYearItem => {
            const classYearId = classYearItem.class_year_id;
            loadedClassYearIds.push(classYearId);

            if (!loadedAllocations[classYearId]) {
              loadedAllocations[classYearId] = {};
            }

            // Process semester_divisions
            if (classYearItem.semester_divisions && classYearItem.semester_divisions.length > 0) {
              classYearItem.semester_divisions.forEach(sd => {
                const semesterId = sd.semester_id;
                
                if (!loadedAllocations[classYearId][semesterId]) {
                  loadedAllocations[classYearId][semesterId] = [];
                }

                // Each semester_division is a separate row
                loadedAllocations[classYearId][semesterId].push({
                  pcysd_id: sd.pcysd_id,
                  divisionId: sd.division_id ? sd.division_id.toString() : "",
                  teacherId: sd.teacher_id ? sd.teacher_id.toString() : "",
                  studentLimit: sd.student_limit || "",
                });
              });
            }
          });

          setAllocations(loadedAllocations);
          setSelectedClassYears([...new Set(loadedClassYearIds)]); // Remove duplicates
        }
      } catch (err) {
        console.error("Failed to load data", err);
        setAlert(
          <SweetAlert
            danger
            title="Error"
            onConfirm={() => setAlert(null)}
          >
            Failed to load program details.
          </SweetAlert>
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [programId]);

  /* --------------------------------------------------------------
     CLASS YEAR SELECTION
  -------------------------------------------------------------- */
  const toggleClassYear = (id) => {
    setSelectedClassYears(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const removeClassYear = (id) => {
    setSelectedClassYears(prev => prev.filter(x => x !== id));
    setAllocations(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const selectedClassData = classYears.filter(c =>
    selectedClassYears.includes(c.class_year_id)
  );

  /* --------------------------------------------------------------
     ALLOCATION HELPERS
  -------------------------------------------------------------- */
  const addDivision = (classYearId, semesterId) => {
    setAllocations(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      if (!copy[classYearId]) copy[classYearId] = {};
      if (!copy[classYearId][semesterId]) copy[classYearId][semesterId] = [];
      copy[classYearId][semesterId].push({ divisionId: "", teacherId: "", studentLimit: "" });
      return copy;
    });
  };

  const removeDivision = async (classYearId, semesterId, idx) => {
    const allocationToRemove = allocations[classYearId]?.[semesterId]?.[idx];

    if (allocationToRemove && allocationToRemove.pcysd_id) {
      // This is an existing allocation, ask for confirmation and call API
      setAlert(
        <SweetAlert
          warning
          showCancel
          confirmBtnText="Yes, deallocate!"
          cancelBtnText="Cancel"
          confirmBtnCssClass="btn-confirm"
          cancelBtnCssClass="btn-cancel"
          title="Are you sure?"
          onConfirm={async () => {
            try {
              await allocationService.deleteProgramDivisionAllocationByPCYSD(allocationToRemove.pcysd_id);
              setAlert(<SweetAlert success title="Deallocated!" onConfirm={() => setAlert(null)}>Division has been deallocated.</SweetAlert>);
              // Remove from local state after successful API call
              setAllocations(prev => {
                const copy = JSON.parse(JSON.stringify(prev));
                copy[classYearId][semesterId].splice(idx, 1);
                if (copy[classYearId][semesterId].length === 0) delete copy[classYearId][semesterId];
                if (Object.keys(copy[classYearId]).length === 0) delete copy[classYearId];
                return copy;
              });
            } catch (err) {
              setAlert(<SweetAlert danger title="Failed" onConfirm={() => setAlert(null)}>{err.message || "Deallocation failed."}</SweetAlert>);
            }
          }}
          onCancel={() => setAlert(null)}
        >
          Do you want to deallocate this division?
        </SweetAlert>
      );
    } else {
      // This is a new, unsaved allocation, just remove from state
      setAllocations(prev => {
        const copy = JSON.parse(JSON.stringify(prev));
        if (copy[classYearId]?.[semesterId]) {
          copy[classYearId][semesterId].splice(idx, 1);
          if (copy[classYearId][semesterId].length === 0) {
            delete copy[classYearId][semesterId];
            if (Object.keys(copy[classYearId]).length === 0) delete copy[classYearId];
          }
        }
        return copy;
      });
    }
  };

  const updateAllocation = (classYearId, semesterId, idx, field, value) => {
    setAllocations(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      if (copy[classYearId]?.[semesterId]?.[idx]) {
        copy[classYearId][semesterId][idx][field] = value;
      }
      return copy;
    });
  };

  /* --------------------------------------------------------------
     BUILD PAYLOAD FOR SAVE
  -------------------------------------------------------------- */
  const buildPayload = () => {
    const payload = [];

    for (const classYearId in allocations) {
      const classYearAlloc = allocations[classYearId];
      const semesterDivisions = [];

      for (const semesterId in classYearAlloc) {
        const rows = classYearAlloc[semesterId];
        
        // Filter valid rows and create parallel arrays
        const validRows = rows.filter(r => r.divisionId && r.divisionId !== "");
        
        const divisionIds = validRows.map(r => Number(r.divisionId));
        const teacherIds = validRows.map(r => r.teacherId ? Number(r.teacherId) : null);
        const studentLimits = validRows.map(r => r.studentLimit ? Number(r.studentLimit) : null);

        if (divisionIds.length > 0) {
          semesterDivisions.push({
            semester_id: Number(semesterId),
            division_ids: divisionIds,
            teacher_ids: teacherIds,
            student_limits: studentLimits,
          });
        }
      }

      if (semesterDivisions.length > 0) {
        const classYearData = classYears.find(c => c.class_year_id === Number(classYearId));
        const pcyId = classYearData?.program_class_year_id;

        let entry = {};

        if (pcyId) {
          // This is an UPDATE, only send program_class_year_id
          entry = {
            program_class_year_id: pcyId,
            semester_divisions: semesterDivisions,
          };
        } else {
          // This is a CREATE, send program_id and class_year_id
          entry = {
            program_id: Number(programId),
            class_year_id: Number(classYearId),
            semester_divisions: semesterDivisions,
          };
        }
        payload.push(entry);
      }
    }

    return payload;
  };

  /* --------------------------------------------------------------
     SAVE
  -------------------------------------------------------------- */
  const handleSubmit = async () => {
    const payload = buildPayload();
    if (payload.length === 0) {
      setAlert(
        <SweetAlert warning title="Nothing to Save" onConfirm={() => setAlert(null)}>
          Please add divisions.
        </SweetAlert>
      );
      return;
    }

    setSaving(true);
    try {
      await allocationService.saveAllocation(payload);
      setAlert(
        <SweetAlert
          success
          title="Saved!"
          onConfirm={() => navigate("/academics/program")}
        >
          Program allocation updated successfully!
        </SweetAlert>
      );
    } catch (err) {
      setAlert(
        <SweetAlert danger title="Failed" onConfirm={() => setAlert(null)}>
          {err.message || "Save failed"}
        </SweetAlert>
      );
    } finally {
      setSaving(false);
    }
  };

  /* --------------------------------------------------------------
     RENDER
  -------------------------------------------------------------- */
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 bg-white rounded-xl shadow-xl">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-gray-800 ml-3">
          Allocate Program: <span className="text-blue-600">{program?.program_name}</span>
        </h2>
      </div>

      {/* Class Year Selector */}
      <div className="mb-8">
        <label className="block text-lg font-semibold mb-3">Class Years</label>
        <div className="relative">
          <div
            onClick={() => setIsClassYearDropdownOpen(v => !v)}
            className="border rounded-lg p-3 bg-gray-50 cursor-pointer flex flex-wrap gap-2 min-h-[44px] items-center"
          >
            {selectedClassData.length > 0 ? (
              selectedClassData.map(cy => (
                <span key={cy.class_year_id} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
                  {cy.name}
                  <button onClick={(e) => { e.stopPropagation(); removeClassYear(cy.class_year_id); }} className="ml-2">
                    <X size={14} />
                  </button>
                </span>
              ))
            ) : (
              <span className="text-gray-500">Select class years...</span>
            )}
          </div>

          {isClassYearDropdownOpen && (
            <div className="absolute z-10 w-full mt-2 bg-white border rounded-lg shadow-lg max-h-64 overflow-y-auto">
              {classYears.map(c => (
                <label key={c.class_year_id} className="flex items-center p-3 hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedClassYears.includes(c.class_year_id)}
                    onChange={() => toggleClassYear(c.class_year_id)}
                    className="mr-3"
                  />
                  <span>{c.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Allocations */}
      {selectedClassData.length === 0 ? (
        <p className="text-center text-gray-500 py-10">Select class years to allocate divisions.</p>
      ) : (
        <div className="space-y-8">
          {selectedClassData.map(classYear => (
            <div key={classYear.class_year_id} className="border rounded-xl bg-gray-50 p-5">
              <h3 className="text-xl font-bold text-blue-700 mb-4">{classYear.name}</h3>
              <div className="space-y-6">
                {classYear.semesters?.map(semester => (
                  <div key={semester.semester_id} className="bg-white rounded-lg border p-5">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-bold">{semester.name}</h4>
                      <button
                        onClick={() => addDivision(classYear.class_year_id, semester.semester_id)}
                        className="text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg flex items-center gap-2"
                      >
                        <PlusCircle size={18} /> Add Division
                      </button>
                    </div>

                    <div className="space-y-3">
                      {(allocations[classYear.class_year_id]?.[semester.semester_id] || []).length === 0 ? (
                        <p className="text-gray-500 italic text-center py-4">No divisions added</p>
                      ) : (
                        allocations[classYear.class_year_id][semester.semester_id].map((alloc, idx) => (
                          <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-4 bg-gray-50 p-4 rounded-lg border">
                            <div className="sm:col-span-3">
                              <label className="block text-sm font-medium mb-1">Division</label>
                              <select
                                value={alloc.divisionId}
                                onChange={e => updateAllocation(classYear.class_year_id, semester.semester_id, idx, "divisionId", e.target.value)}
                                className="w-full border rounded-md px-3 py-2"
                              >
                                <option value="">-- Select --</option>
                                {divisions.map(d => (
                                  <option key={d.division_id} value={d.division_id}>
                                    {d.division_name}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="sm:col-span-3">
                              <label className="block text-sm font-medium mb-1">Class Teacher</label>
                              <select
                                value={alloc.teacherId}
                                onChange={e => updateAllocation(classYear.class_year_id, semester.semester_id, idx, "teacherId", e.target.value)}
                                className="w-full border rounded-md px-3 py-2"
                              >
                                <option value="">-- Select --</option>
                                {teachers.map(t => (
                                  <option key={t.teacher_id} value={t.teacher_id}>
                                    {t.name}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="sm:col-span-4">
                              <label className="block text-sm font-medium mb-1">Student Limit</label>
                              <input
                                type="number"
                                value={alloc.studentLimit}
                                onChange={e => updateAllocation(classYear.class_year_id, semester.semester_id, idx, "studentLimit", e.target.value)}
                                className="w-full border rounded-md px-3 py-2"
                                placeholder="Enter student limit"
                                min="1"
                              />
                            </div>

                            <div className="sm:col-span-2 flex items-center justify-center">
                              <button
                                onClick={() => removeDivision(classYear.class_year_id, semester.semester_id, idx)}
                                className="text-red-600 hover:bg-red-50 p-2 rounded-full"
                              >
                                <Trash2 size={20} />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Buttons */}
      <div className="flex justify-end gap-4 mt-10">
        <button onClick={() => navigate(-1)} className="px-6 py-2 bg-gray-200 rounded-lg">
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving || selectedClassYears.length === 0}
          className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
        >
          {saving ? (
            <>Saving...</>
          ) : (
            "Save Allocation"
          )}
        </button>
      </div>

      {alert}
    </div>
  );
}