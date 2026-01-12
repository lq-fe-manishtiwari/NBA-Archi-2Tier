import React, { useState } from "react";
import { Link } from "react-router-dom";

const AddAssignTeacher = () => {
  // Dummy data
  const dummyGrades = [
    { id: 1, name: "BS Computer Science" },
    { id: 2, name: "BS Software Engineering" },
  ];

  const dummySemesters = {
    1: [
      { id: 1, name: "Fall 2024" },
      { id: 2, name: "Spring 2025" },
    ],
    2: [
      { id: 3, name: "Fall 2024" },
      { id: 4, name: "Spring 2025" },
    ],
  };

  const dummyCourses = {
    1: [
      { id: 11, name: "Data Structures" },
      { id: 12, name: "Operating Systems" },
    ],
    2: [
      { id: 13, name: "Database Systems" },
      { id: 14, name: "Mobile App Dev" },
    ],
    3: [
      { id: 15, name: "Web Engineering" },
    ],
    4: [
      { id: 16, name: "Software Design" },
    ],
  };

  const dummyTeachers = [
    { id: 101, name: "Ali Khan" },
    { id: 102, name: "Sara Malik" },
    { id: 103, name: "Hamza Ahmed" },
  ];

  // Form state
  const [assignments, setAssignments] = useState([
    {
      grade_id: "",
      semester_id: "",
      course_id: "",
      teacher_id: "",
      start_date: "",
      end_date: "",
      tasks: {
        marksEntry: false,
        mapping: false,
        poPso: false,
      },
    },
  ]);

  const [errors, setErrors] = useState([{}]);

  // Handle input change
  const handleChange = (index, field, value) => {
    setAssignments((prev) => {
      const list = [...prev];
      list[index][field] = value;

      if (field === "grade_id") {
        list[index].semester_id = "";
        list[index].course_id = "";
      }

      if (field === "semester_id") {
        list[index].course_id = "";
      }

      return list;
    });
  };

  // Handle checkbox task change
  const handleTaskChange = (index, task) => {
    setAssignments((prev) => {
      const list = [...prev];
      list[index].tasks[task] = !list[index].tasks[task];
      return list;
    });
  };

  // Add another row
  const addRow = () => {
    setAssignments((prev) => [
      ...prev,
      {
        grade_id: "",
        semester_id: "",
        course_id: "",
        teacher_id: "",
        start_date: "",
        end_date: "",
        tasks: { marksEntry: false, mapping: false, poPso: false },
      },
    ]);
    setErrors((prev) => [...prev, {}]);
  };

  // Remove row
  const removeRow = (index) => {
    if (assignments.length === 1) return;
    setAssignments(assignments.filter((_, i) => i !== index));
    setErrors(errors.filter((_, i) => i !== index));
  };

  // Validation
  const validate = () => {
    const newErrors = assignments.map(() => ({}));
    let valid = true;

    assignments.forEach((form, index) => {
      const err = {};

      if (!form.grade_id) err.grade = "Required";
      if (!form.semester_id) err.semester = "Required";
      if (!form.course_id) err.course = "Required";
      if (!form.teacher_id) err.teacher = "Required";
      if (!form.start_date) err.start = "Required";
      if (!form.end_date) err.end = "Required";

      if (
        !form.tasks.marksEntry &&
        !form.tasks.mapping &&
        !form.tasks.poPso
      ) {
        err.tasks = "Select at least one task";
      }

      newErrors[index] = err;

      if (Object.keys(err).length > 0) valid = false;
    });

    setErrors(newErrors);
    return valid;
  };

  // Submit handler
  const handleSubmit = () => {
    if (!validate()) return;

    console.log("FINAL PAYLOAD:", assignments);
    alert("Tasks Assigned Successfully (Dummy)");
  };

  return (
    <div className="p-4">

       <div className="flex justify-between items-center mb-6">
        <h2 className="pageheading text-xl font-semibold">Assign Teacher (OBE)</h2>
        <Link
          to="/obe/Assign-Teacher"
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded text-sm"
        >
          X
        </Link>
      </div>

        {assignments.map((form, index) => (
          <div key={index} className="border p-4 rounded-lg mb-6 shadow-sm bg-gray-50">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg">Assignment {index + 1}</h2>

              <div className="space-x-2">
                {index === assignments.length - 1 && (
                  <button
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    onClick={addRow}
                  >
                    + Add
                  </button>
                )}

                {assignments.length > 1 && (
                  <button
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    onClick={() => removeRow(index)}
                  >
                    – Remove
                  </button>
                )}
              </div>
            </div>

            {/* Form Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Program */}
              <div>
                <label className="font-medium">Program *</label>
                <select
                  value={form.grade_id}
                  onChange={(e) => handleChange(index, "grade_id", e.target.value)}
                  className="w-full border p-2 rounded"
                >
                  <option value="">Select Program</option>
                  {dummyGrades.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
                {errors[index]?.grade && <p className="text-red-600 text-sm">{errors[index].grade}</p>}
              </div>

              {/* Semester */}
              <div>
                <label className="font-medium">Semester *</label>
                <select
                  value={form.semester_id}
                  onChange={(e) => handleChange(index, "semester_id", e.target.value)}
                  className="w-full border p-2 rounded"
                  disabled={!form.grade_id}
                >
                  <option value="">Select Semester</option>
                  {(dummySemesters[form.grade_id] || []).map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                {errors[index]?.semester && <p className="text-red-600 text-sm">{errors[index].semester}</p>}
              </div>

              {/* Courses */}
              <div>
                <label className="font-medium">Course *</label>
                <select
                  value={form.course_id}
                  onChange={(e) => handleChange(index, "course_id", e.target.value)}
                  className="w-full border p-2 rounded"
                  disabled={!form.semester_id}
                >
                  <option value="">Select Course</option>
                  {(dummyCourses[form.semester_id] || []).map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {errors[index]?.course && <p className="text-red-600 text-sm">{errors[index].course}</p>}
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">

              {/* Teacher */}
              <div>
                <label className="font-medium">Teacher *</label>
                <select
                  value={form.teacher_id}
                  onChange={(e) => handleChange(index, "teacher_id", e.target.value)}
                  className="w-full border p-2 rounded"
                >
                  <option value="">Select Teacher</option>
                  {dummyTeachers.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                {errors[index]?.teacher && <p className="text-red-600 text-sm">{errors[index].teacher}</p>}
              </div>

              {/* Start Date */}
              <div>
                <label className="font-medium">Start Date *</label>
                <input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => handleChange(index, "start_date", e.target.value)}
                  className="w-full border p-2 rounded"
                />
                {errors[index]?.start && <p className="text-red-600 text-sm">{errors[index].start}</p>}
              </div>

              {/* End Date */}
              <div>
                <label className="font-medium">End Date *</label>
                <input
                  type="date"
                  value={form.end_date}
                  onChange={(e) => handleChange(index, "end_date", e.target.value)}
                  className="w-full border p-2 rounded"
                />
                {errors[index]?.end && <p className="text-red-600 text-sm">{errors[index].end}</p>}
              </div>
            </div>

            {/* Tasks */}
            <div className="mt-4">
              <p className="font-medium">Select Tasks *</p>

              <div className="flex flex-wrap gap-6 mt-2">

                <label className="flex gap-2 items-center">
                  <input
                    type="checkbox"
                    checked={form.tasks.marksEntry}
                    onChange={() => handleTaskChange(index, "marksEntry")}
                  />
                  Marks Entry
                </label>

                <label className="flex gap-2 items-center">
                  <input
                    type="checkbox"
                    checked={form.tasks.mapping}
                    onChange={() => handleTaskChange(index, "mapping")}
                  />
                  Mapping
                </label>

                <label className="flex gap-2 items-center">
                  <input
                    type="checkbox"
                    checked={form.tasks.poPso}
                    onChange={() => handleTaskChange(index, "poPso")}
                  />
                  PO/PSO Attainment
                </label>
              </div>

              {errors[index]?.tasks && (
                <p className="text-red-600 text-sm mt-1">{errors[index].tasks}</p>
              )}
            </div>

          </div>
        ))}

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700"
          >
            Assign Tasks
          </button>
        </div>

 
    </div>
  );
};

export default AddAssignTeacher;
