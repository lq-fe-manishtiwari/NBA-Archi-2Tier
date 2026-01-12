import React, { useEffect, useState } from "react";
import { MDBDataTable } from "mdbreact";
import Select from "react-select";
import { collegeService } from "../../../Academics/Services/college.service.js";
import { classService } from "../../../Academics/Services/class.service.js";
import { courseService } from "../../../Courses/Services/courses.service";
import { AttainmentConfigService } from "../../Services/attainment-config.service.js";

const CoursePOPSOAttainment = () => {
  const [data, setData] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [classOptions, setClassOptions] = useState([]);
  const [semesterOptions, setSemesterOptions] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPrograms();
    fetchCourses();
  }, []);

  const fetchPrograms = async () => {
    try {
      const data = await collegeService.getAllprogram();
      setPrograms(data || []);
    } catch (err) {
      console.error("Failed to fetch programs:", err);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await courseService.getAllCourses();
      setCourseOptions(res?.data || res || []);
    } catch (err) {
      console.error("Failed to fetch courses:", err);
    }
  };

  useEffect(() => {
    if (selectedCourses.length > 0) {
      fetchAttainmentData();
    } else {
      setData([]);
    }
  }, [selectedCourses]);

  const fetchAttainmentData = async () => {
    setLoading(true);
    try {
      const attainmentData = [];
      for (const courseId of selectedCourses) {
        const courseObj = courseOptions.find(c => c.subject_id === courseId);
        const configs = await AttainmentConfigService.getAllForSubject(courseId);
        
        const poAverages = {};
        const psoAverages = {};
        let coAttainmentAvg = 0;
        
        if (configs && configs.length > 0) {
          configs.forEach(config => {
            if (config.po_id) poAverages[`PO${config.po_id}`] = config.target || 0;
            if (config.pso_id) psoAverages[`PSO${config.pso_id}`] = config.target || 0;
            coAttainmentAvg += config.target || 0;
          });
          coAttainmentAvg = coAttainmentAvg / configs.length;
        }
        
        attainmentData.push({
          course_code: courseObj?.subject_code || courseObj?.code || courseId,
          course_name: courseObj?.name || courseObj?.subject_name || "Unknown",
          co_attainment_avg: coAttainmentAvg.toFixed(2),
          po_averages: poAverages,
          pso_averages: psoAverages
        });
      }
      setData(attainmentData);
    } catch (error) {
      console.error("Error fetching attainment data:", error);
    } finally {
      setLoading(false);
    }
  };

  const ProgressBar = ({ value }) => {
    const percent = (value / 3) * 100;
    let color = "bg-red-500";
    if (value >= 2.5) color = "bg-green-500";
    else if (value >= 1.5) color = "bg-yellow-500";

    return (
      <div className="w-full bg-gray-200 rounded h-4">
        <div className={`${color} h-4 rounded`} style={{ width: `${percent}%` }} />
      </div>
    );
  };

  // Prepare data for MDBDataTable
  const columns = [
    { label: "Course Code", field: "course_code", sort: "disabled" },
    { label: "Course Name", field: "course_name", sort: "disabled" },
    { label: "CO Attainment", field: "co_avg", sort: "disabled" },
  ];

  // Add PO columns (PO1 to PO11 based on data)
  const poKeys = Array.from(
    new Set(
      data.flatMap((course) => Object.keys(course.po_averages)).sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true })
      )
    )
  );
  poKeys.forEach((po, i) => {
    columns.push({ label: po, field: `po${i}`, sort: "disabled" });
  });

  // Add PSO columns dynamically
  const psoKeys = Array.from(
    new Set(
      data.flatMap((course) => Object.keys(course.pso_averages)).sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true })
      )
    )
  );
  psoKeys.forEach((pso, i) => {
    columns.push({ label: pso, field: `pso${i}`, sort: "disabled" });
  });

  // Rows
  const rows = data.map((course) => {
    const row = {
      course_code: course.course_code,
      course_name: course.course_name,
      co_avg: course.co_attainment_avg || "",
    };

    // PO values with progress bar
    poKeys.forEach((po, i) => {
      const value = course.po_averages[po];
      row[`po${i}`] =
        value && value !== 0 ? (
          <div>
            <ProgressBar value={value} />
            <div className="text-xs">{value}</div>
          </div>
        ) : (
          ""
        );
    });

    // PSO values with progress bar
    psoKeys.forEach((pso, i) => {
      const value = course.pso_averages[pso];
      row[`pso${i}`] =
        value && value !== 0 ? (
          <div>
            <ProgressBar value={value} />
            <div className="text-xs">{value}</div>
          </div>
        ) : (
          ""
        );
    });

    return row;
  });

  const tableData = { columns, rows };

  return (
    <div className="space-y-6 p-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4" style={{ color: "#2f6cc5" }}>OBE Attainment Dashboard</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
          <div>
            <label className="block font-medium mb-1">Program</label>
            <select className="w-full border p-2 rounded" value={selectedProgram} onChange={(e) => setSelectedProgram(e.target.value)}>
              <option value="">Select Program</option>
              {programs.map(p => <option key={p.program_id} value={p.program_id}>{p.program_name}</option>)}
            </select>
          </div>
          
          <div>
            <label className="block font-medium mb-1">Courses</label>
            <Select isMulti options={courseOptions.map(c => ({ value: c.subject_id, label: c.name || c.subject_name }))} onChange={(opts) => setSelectedCourses((opts || []).map(o => o.value))} className="text-sm" />
          </div>
          
          <div>
            <label className="block font-medium mb-1">Batch</label>
            <input type="text" className="w-full border p-2 rounded" placeholder="Enter batch" value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <style>{`
          .dataTables_wrapper .dataTables_paginate {
            display: flex;
            justify-content: flex-end !important;
          }
        `}</style>

        <h3 className="text-lg font-semibold mb-4" style={{ color: "#2f6cc5" }}>Course PO-PSO Attainment Summary</h3>
        
        {loading ? (
          <div className="text-center py-8 text-blue-600">Loading attainment data...</div>
        ) : data.length > 0 ? (
          <MDBDataTable striped bordered hover responsive small data={tableData} />
        ) : (
          <div className="text-center py-8 text-gray-500">Please select courses to view attainment data</div>
        )}
      </div>
    </div>
  );
};

export default CoursePOPSOAttainment;
