// GenericCriteriaForm5_1.jsx
import React, { useState, useEffect } from "react";
import { Editor } from "react-editor";
import Modal from "react-modal";
import MergePdfModal from "../MergePdfModal";
import { toast } from "react-toastify";
import { nbaDashboardService } from "../../Services/NBA-dashboard.service";
import {
  Trash2, Plus, FileText, Save, CheckCircle,
  Upload, X, Edit, Calculator, Users, Hash
} from "lucide-react";

Modal.setAppElement("#root");

// Special Table for 5.1.1 - Lateral Entry Calculation
const SpecialTable5_1_1 = ({ data, onChange, disabled }) => {
  const [rows, setRows] = useState(data.length > 0 ? data : [
    { 
      id: "case1", 
      case: "Case 1", 
      firstYear: "", 
      leftover: "", 
      secondYear: "", 
      considered: "" 
    }
  ]);

  const [sanctionedIntake, setSanctionedIntake] = useState("120");

  const calculateConsidered = (firstYear, secondYear) => {
    const SA = parseInt(sanctionedIntake) || 0;
    const FY = parseInt(firstYear) || 0;
    const L = parseInt(secondYear) || 0;
    
    if (SA === 0) return "0";
    
    let considered = 0;
    
    if (FY >= SA) {
      considered = SA + Math.min(L, SA * 0.10);
    } else {
      const availableSeats = SA - FY;
      considered = SA + Math.min(L, availableSeats);
    }
    
    const maxAllowed = SA * 1.10;
    considered = Math.min(considered, maxAllowed);
    
    return Math.round(considered).toString();
  };

  const handleChange = (rowIndex, field, value) => {
    const updatedRows = [...rows];
    updatedRows[rowIndex] = { ...updatedRows[rowIndex], [field]: value };
    
    if (field === 'firstYear' || field === 'secondYear') {
      const considered = calculateConsidered(
        field === 'firstYear' ? value : updatedRows[rowIndex].firstYear,
        field === 'secondYear' ? value : updatedRows[rowIndex].secondYear
      );
      updatedRows[rowIndex].considered = considered;
    }
    
    setRows(updatedRows);
    onChange(updatedRows);
  };

  const handleSanctionedIntakeChange = (value) => {
    setSanctionedIntake(value);
    const updatedRows = rows.map(row => ({
      ...row,
      considered: calculateConsidered(row.firstYear, row.secondYear)
    }));
    setRows(updatedRows);
    onChange(updatedRows);
  };

  const addRow = () => {
    const newRow = {
      id: `case-${Date.now()}-${Math.random()}`,
      case: `Case ${rows.length + 1}`,
      firstYear: "",
      leftover: "",
      secondYear: "",
      considered: ""
    };
    const newRows = [...rows, newRow];
    setRows(newRows);
    onChange(newRows);
  };

  const deleteRow = (index) => {
    if (rows.length <= 1) return;
    const updated = rows.filter((_, i) => i !== index);
    const renumbered = updated.map((row, idx) => ({
      ...row,
      case: `Case ${idx + 1}`
    }));
    setRows(renumbered);
    onChange(renumbered);
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Hash className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sanctioned Intake (SA)
              </label>
              <input
                type="number"
                min="0"
                value={sanctionedIntake}
                onChange={(e) => handleSanctionedIntakeChange(e.target.value)}
                disabled={disabled}
                className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-center font-bold text-blue-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="120"
              />
            </div>
          </div>
          
          <div className="text-sm text-gray-600 space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Lateral entry limited to <span className="font-bold">10%</span> of SA</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Total students limited to <span className="font-bold">110%</span> of SA</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-lg">
        <table className="w-full bg-white">
          <thead>
            <tr className="bg-[#2163c1] text-white">
              <th className="p-4 text-left font-semibold w-24">Case</th>
              <th className="p-4 text-left font-semibold">No. of students admitted in 1st year</th>
              <th className="p-4 text-left font-semibold">Leftover seats/Unfilled seats in 1st year</th>
              <th className="p-4 text-left font-semibold">
                <div className="flex flex-col">
                  <span>No. of students admitted in 2nd year</span>
                  <span className="text-sm font-normal opacity-90">L = Lateral entry + Leftover seats</span>
                </div>
              </th>
              <th className="p-4 text-left font-semibold">
                <div className="flex flex-col">
                  <span>No. of students considered for SFR (ST)</span>
                  <span className="text-sm font-normal opacity-90">(SA + L) limited to 110% of SA</span>
                </div>
              </th>
              {!disabled && <th className="p-4 text-left font-semibold w-20">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id} className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold">
                      {index + 1}
                    </div>
                    <span className="font-medium">{row.case}</span>
                  </div>
                </td>
                <td className="p-4">
                  <input
                    type="number"
                    min="0"
                    value={row.firstYear}
                    onChange={(e) => handleChange(index, 'firstYear', e.target.value)}
                    disabled={disabled}
                    className="w-full max-w-32 px-3 py-2 border border-gray-300 rounded-lg text-center font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter number"
                  />
                </td>
                <td className="p-4">
                  <input
                    type="number"
                    min="0"
                    value={row.leftover}
                    onChange={(e) => handleChange(index, 'leftover', e.target.value)}
                    disabled={disabled}
                    className="w-full max-w-32 px-3 py-2 border border-gray-300 rounded-lg text-center font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter number"
                  />
                </td>
                <td className="p-4">
                  <input
                    type="number"
                    min="0"
                    value={row.secondYear}
                    onChange={(e) => handleChange(index, 'secondYear', e.target.value)}
                    disabled={disabled}
                    className="w-full max-w-32 px-3 py-2 border border-gray-300 rounded-lg text-center font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter number"
                  />
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-center gap-2">
                    <div className={`px-4 py-2 rounded-lg border font-bold text-lg min-w-20 text-center ${
                      row.considered && parseInt(row.considered) > parseInt(sanctionedIntake) * 1.10
                        ? 'bg-red-100 text-red-800 border-red-300'
                        : 'bg-green-100 text-green-800 border-green-300'
                    }`}>
                      {row.considered || "0"}
                    </div>
                    {row.firstYear && row.secondYear && (
                      <div className="text-sm text-gray-500">
                        ({sanctionedIntake} + {row.secondYear || "0"})
                      </div>
                    )}
                  </div>
                </td>
                {!disabled && (
                  <td className="p-4">
                    <button
                      onClick={() => deleteRow(index)}
                      disabled={rows.length <= 1}
                      className={`p-2 rounded-lg transition-colors ${
                        rows.length <= 1 
                          ? 'text-gray-400 cursor-not-allowed' 
                          : 'text-red-600 hover:bg-red-50'
                      }`}
                      title={rows.length <= 1 ? "Cannot delete the last row" : "Delete this case"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {!disabled && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <button
              onClick={addRow}
              className="px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md"
            >
              <Plus className="w-4 h-4" /> Add Case
            </button>
            
            <div className="text-sm text-gray-600">
              <div className="font-medium mb-1">Current Status:</div>
              <div className="space-y-1">
                <div>Sanctioned Intake: <span className="font-bold">{sanctionedIntake}</span></div>
                <div>10% of SA: <span className="font-bold">{Math.round(parseInt(sanctionedIntake || 0) * 0.10)}</span></div>
                <div>110% of SA: <span className="font-bold">{Math.round(parseInt(sanctionedIntake || 0) * 1.10)}</span></div>
              </div>
            </div>
          </div>
          
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <div className="text-amber-600 font-bold mt-0.5">*</div>
              <div className="text-sm text-amber-800">
                <span className="font-semibold">Note:</span> If the number of students admitted in 2nd year via lateral entry including left over seats (L) is more than 10% of the sanctioned intake (SA), then ST = SA + (10% of SA). ST cannot exceed 110% of SA.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Complex Table for 5.1.2 - Student Faculty Ratio
const StudentFacultyRatioTable = ({ data, onChange, disabled, initialFacultyData = null }) => {
  const initialData = data.length > 0 ? data : [
    { 
      id: "ug1", 
      program: "UG Program 1", 
      type: "ug",
      year: "CAY",
      b: "", c: "", d: "", total: ""
    },
    { 
      id: "pg1", 
      program: "PG Program 1", 
      type: "pg", 
      year: "CAY",
      a: "", b: "", total: ""
    }
  ];

  const [rows, setRows] = useState(initialData);
  const [facultyData, setFacultyData] = useState(initialFacultyData || {
    df: { cay: "", caym1: "", caym2: "" },
    af: { cay: "", caym1: "", caym2: "" },
    ff: { cay: "", caym1: "", caym2: "" }
  });

  useEffect(() => {
    if (initialFacultyData) {
      setFacultyData(initialFacultyData);
    }
  }, [initialFacultyData]);

  const calculateTotal = (type, values) => {
    if (type === "ug") {
      const b = parseInt(values.b) || 0;
      const c = parseInt(values.c) || 0;
      const d = parseInt(values.d) || 0;
      return (b + c + d).toString();
    } else {
      const a = parseInt(values.a) || 0;
      const b = parseInt(values.b) || 0;
      return (a + b).toString();
    }
  };

  const handleProgramChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index] = { ...updatedRows[index], [field]: value };
    
    if (['a', 'b', 'c', 'd'].includes(field)) {
      const total = calculateTotal(updatedRows[index].type, {
        a: updatedRows[index].a || "0",
        b: updatedRows[index].b || "0",
        c: updatedRows[index].c || "0",
        d: updatedRows[index].d || "0"
      });
      updatedRows[index].total = total;
    }
    
    setRows(updatedRows);
    onChange(updatedRows, facultyData);
  };

  const handleFacultyChange = (category, year, value) => {
    const updated = { ...facultyData };
    updated[category][year] = value;
    setFacultyData(updated);
    onChange(rows, updated);
  };

  const addProgram = (type) => {
    const newId = `${type}-${Date.now()}-${Math.random()}`;
    const newProgram = {
      id: newId,
      program: type === "ug" ? `UG Program ${rows.filter(r => r.type === "ug").length + 1}` : `PG Program ${rows.filter(r => r.type === "pg").length + 1}`,
      type: type,
      year: "CAY",
      ...(type === "ug" ? { b: "", c: "", d: "", total: "" } : { a: "", b: "", total: "" })
    };
    const newRows = [...rows, newProgram];
    setRows(newRows);
    onChange(newRows, facultyData);
  };

  const deleteProgram = (index) => {
    if (rows.length <= 1) return;
    const updated = rows.filter((_, i) => i !== index);
    setRows(updated);
    onChange(updated, facultyData);
  };

  const calculateSummary = () => {
    let ds = { cay: 0, caym1: 0, caym2: 0 };
    let as = { cay: 0, caym1: 0, caym2: 0 };
    
    rows.forEach(row => {
      if (row.type === "ug") {
        ds.cay += parseInt(row.b || 0) + parseInt(row.c || 0) + parseInt(row.d || 0);
      } else {
        ds.cay += parseInt(row.a || 0) + parseInt(row.b || 0);
      }
    });
    
    ds.caym1 = ds.cay;
    ds.caym2 = ds.cay;
    as.cay = ds.cay * 0.5;
    as.caym1 = as.cay;
    as.caym2 = as.cay;
    
    const s = {
      cay: ds.cay + as.cay,
      caym1: ds.caym1 + as.caym1,
      caym2: ds.caym2 + as.caym2
    };
    
    const f = {
      cay: (parseInt(facultyData.df.cay) || 0) + (parseInt(facultyData.af.cay) || 0),
      caym1: (parseInt(facultyData.df.caym1) || 0) + (parseInt(facultyData.af.caym1) || 0),
      caym2: (parseInt(facultyData.df.caym2) || 0) + (parseInt(facultyData.af.caym2) || 0)
    };
    
    const ff = {
      cay: parseInt(facultyData.ff.cay) || 0,
      caym1: parseInt(facultyData.ff.caym1) || 0,
      caym2: parseInt(facultyData.ff.caym2) || 0
    };
    
    const sfr = {
      cay: f.cay - ff.cay > 0 ? (s.cay / (f.cay - ff.cay)).toFixed(2) : "N/A",
      caym1: f.caym1 - ff.caym1 > 0 ? (s.caym1 / (f.caym1 - ff.caym1)).toFixed(2) : "N/A",
      caym2: f.caym2 - ff.caym2 > 0 ? (s.caym2 / (f.caym2 - ff.caym2)).toFixed(2) : "N/A"
    };
    
    const avgSFR = sfr.cay !== "N/A" && sfr.caym1 !== "N/A" && sfr.caym2 !== "N/A" 
      ? ((parseFloat(sfr.cay) + parseFloat(sfr.caym1) + parseFloat(sfr.caym2)) / 3).toFixed(2)
      : "N/A";
    
    let marks = 0;
    if (avgSFR !== "N/A") {
      const sfrValue = parseFloat(avgSFR);
      if (sfrValue <= 15) marks = 30;
      else if (sfrValue <= 17) marks = 26;
      else if (sfrValue <= 19) marks = 22;
      else if (sfrValue <= 21) marks = 18;
      else if (sfrValue <= 23) marks = 14;
      else if (sfrValue <= 25) marks = 10;
    }
    
    return { ds, as, s, f, ff, sfr, avgSFR, marks };
  };

  const summary = calculateSummary();

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="text-lg font-bold text-gray-800">Programs Data</h4>
          {!disabled && (
            <div className="flex gap-2">
              <button
                onClick={() => addProgram("ug")}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="w-3 h-3" /> Add UG Program
              </button>
              <button
                onClick={() => addProgram("pg")}
                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Plus className="w-3 h-3" /> Add PG Program
              </button>
            </div>
          )}
        </div>
        
        <div className="overflow-x-auto rounded-lg border border-gray-300">
          <table className="w-full bg-white">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-left font-medium">Program</th>
                <th className="p-3 text-left font-medium">Type</th>
                <th className="p-3 text-left font-medium">Year</th>
                <th className="p-3 text-left font-medium">
                  <div>Students</div>
                  <div className="text-xs font-normal">(UG: B,C,D / PG: A,B)</div>
                </th>
                <th className="p-3 text-left font-medium">Total</th>
                {!disabled && <th className="p-3 text-left font-medium">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <input
                      type="text"
                      value={row.program}
                      onChange={(e) => handleProgramChange(index, 'program', e.target.value)}
                      disabled={disabled}
                      className="w-full px-2 py-1 border rounded"
                      placeholder="Program name"
                    />
                  </td>
                  <td className="p-3">
                    <select
                      value={row.type}
                      onChange={(e) => handleProgramChange(index, 'type', e.target.value)}
                      disabled={disabled}
                      className="w-full px-2 py-1 border rounded"
                    >
                      <option value="ug">UG</option>
                      <option value="pg">PG</option>
                    </select>
                  </td>
                  <td className="p-3">
                    <select
                      value={row.year}
                      onChange={(e) => handleProgramChange(index, 'year', e.target.value)}
                      disabled={disabled}
                      className="w-full px-2 py-1 border rounded"
                    >
                      <option value="CAY">CAY</option>
                      <option value="CAYm1">CAYm1</option>
                      <option value="CAYm2">CAYm2</option>
                    </select>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      {row.type === "ug" ? (
                        <>
                          <input
                            type="number"
                            placeholder="B"
                            value={row.b}
                            onChange={(e) => handleProgramChange(index, 'b', e.target.value)}
                            disabled={disabled}
                            className="w-16 px-2 py-1 border rounded text-center"
                          />
                          <input
                            type="number"
                            placeholder="C"
                            value={row.c}
                            onChange={(e) => handleProgramChange(index, 'c', e.target.value)}
                            disabled={disabled}
                            className="w-16 px-2 py-1 border rounded text-center"
                          />
                          <input
                            type="number"
                            placeholder="D"
                            value={row.d}
                            onChange={(e) => handleProgramChange(index, 'd', e.target.value)}
                            disabled={disabled}
                            className="w-16 px-2 py-1 border rounded text-center"
                          />
                        </>
                      ) : (
                        <>
                          <input
                            type="number"
                            placeholder="A"
                            value={row.a}
                            onChange={(e) => handleProgramChange(index, 'a', e.target.value)}
                            disabled={disabled}
                            className="w-16 px-2 py-1 border rounded text-center"
                          />
                          <input
                            type="number"
                            placeholder="B"
                            value={row.b}
                            onChange={(e) => handleProgramChange(index, 'b', e.target.value)}
                            disabled={disabled}
                            className="w-16 px-2 py-1 border rounded text-center"
                          />
                        </>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="px-3 py-1 bg-blue-50 text-blue-700 font-bold rounded text-center">
                      {row.total || "0"}
                    </div>
                  </td>
                  {!disabled && (
                    <td className="p-3">
                      <button
                        onClick={() => deleteProgram(index)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Delete program"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="space-y-4">
        <h4 className="text-lg font-bold text-gray-800">Faculty Data</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {["df", "af", "ff"].map((category) => (
            <div key={category} className="p-4 bg-white rounded-lg border border-gray-300 shadow-sm">
              <div className="font-medium text-gray-700 mb-3">
                {category === "df" ? "DF = Faculty in Department" : 
                 category === "af" ? "AF = Faculty in Allied Departments" : 
                 "FF = First Year Faculty"}
              </div>
              <div className="space-y-3">
                {["cay", "caym1", "caym2"].map((year) => (
                  <div key={year} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{year.toUpperCase()}:</span>
                    <input
                      type="number"
                      min="0"
                      value={facultyData[category][year]}
                      onChange={(e) => handleFacultyChange(category, year, e.target.value)}
                      disabled={disabled}
                      className="w-20 px-2 py-1 border rounded text-center"
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
        <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Calculator className="w-5 h-5" /> SFR Calculation Summary
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-3 bg-white rounded-lg border">
            <div className="text-sm text-gray-500 mb-1">Total Students (S)</div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>CAY:</span>
                <span className="font-bold">{summary.s.cay}</span>
              </div>
              <div className="flex justify-between">
                <span>CAYm1:</span>
                <span className="font-bold">{summary.s.caym1}</span>
              </div>
              <div className="flex justify-between">
                <span>CAYm2:</span>
                <span className="font-bold">{summary.s.caym2}</span>
              </div>
            </div>
          </div>
          
          <div className="p-3 bg-white rounded-lg border">
            <div className="text-sm text-gray-500 mb-1">Total Faculty (F-FF)</div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>CAY:</span>
                <span className="font-bold">{summary.f.cay - summary.ff.cay}</span>
              </div>
              <div className="flex justify-between">
                <span>CAYm1:</span>
                <span className="font-bold">{summary.f.caym1 - summary.ff.caym1}</span>
              </div>
              <div className="flex justify-between">
                <span>CAYm2:</span>
                <span className="font-bold">{summary.f.caym2 - summary.ff.caym2}</span>
              </div>
            </div>
          </div>
          
          <div className="p-3 bg-white rounded-lg border">
            <div className="text-sm text-gray-500 mb-1">Student-Faculty Ratio</div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>CAY:</span>
                <span className="font-bold">{summary.sfr.cay}:1</span>
              </div>
              <div className="flex justify-between">
                <span>CAYm1:</span>
                <span className="font-bold">{summary.sfr.caym1}:1</span>
              </div>
              <div className="flex justify-between">
                <span>CAYm2:</span>
                <span className="font-bold">{summary.sfr.caym2}:1</span>
              </div>
            </div>
          </div>
          
          <div className="p-3 bg-white rounded-lg border border-blue-300">
            <div className="text-2xl text-blue-800 mb-1">Average SFR (3 years)</div>
            <div className="text-2xl font-bold text-blue-800 mb-2">
              {summary.avgSFR}:1
            </div>
            <div className="text-sm">
              <div className="flex justify-between mb-1">
                <span>Marks:</span>
                <span className="font-bold">{summary.marks}/30</span>
              </div>
              <div className="text-xs text-gray-600">
                {summary.avgSFR !== "N/A" && (
                  <>
                    {summary.avgSFR <= 15 ? "≤ 15 = 30 marks" :
                     summary.avgSFR <= 17 ? "≤ 17 = 26 marks" :
                     summary.avgSFR <= 19 ? "≤ 19 = 22 marks" :
                     summary.avgSFR <= 21 ? "≤ 21 = 18 marks" :
                     summary.avgSFR <= 23 ? "≤ 23 = 14 marks" :
                     summary.avgSFR <= 25 ? "≤ 25 = 10 marks" :
                     "> 25 = 0 marks"}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component
const GenericCriteriaForm5_1 = ({
  title = "NBA Section",
  marks = 30,
  fields = [],
  initialData = null,
  onSave,
  onDelete,
  isCompleted = false,
  isContributorEditable = true,
  saving = false,
  facultyData = null,
  onFacultyDataChange = () => {}
}) => {
  const [isEditMode, setIsEditMode] = useState(!isCompleted);

  const safeContent = initialData?.content || {};
  const safeTableData = initialData?.tableData || {};
  
  const [filesByField, setFilesByField] = useState(() => {
    if (initialData?.filesByField) {
      return initialData.filesByField;
    }

    const init = {};
    fields.forEach((field) => {
      init[field.name] = [];
    });
    return init;
  });

  const [formValues, setFormValues] = useState(safeContent);
  const [tableData, setTableData] = useState(safeTableData);
  const [previewModal, setPreviewModal] = useState({ isOpen: false, file: null });
  const [mergeModal, setMergeModal] = useState({ isOpen: false, fieldName: null });
  
  const [localFacultyData, setLocalFacultyData] = useState(facultyData || {
    df: { cay: "", caym1: "", caym2: "" },
    af: { cay: "", caym1: "", caym2: "" },
    ff: { cay: "", caym1: "", caym2: "" }
  });

  useEffect(() => {
    if (facultyData) {
      setLocalFacultyData(facultyData);
    }
  }, [facultyData]);

  const handleTableChange = (tableKey, newData, facultyDataFromTable = null) => {
    setTableData(prev => ({ ...prev, [tableKey]: newData }));
    
    if (facultyDataFromTable) {
      setLocalFacultyData(facultyDataFromTable);
      onFacultyDataChange(facultyDataFromTable);
    }
  };

  const addFileRow = (fieldName) => {
    setFilesByField((prev) => ({
      ...prev,
      [fieldName]: [
        ...(prev[fieldName] || []),
        { id: `file-${Date.now()}-${fieldName}-${Math.random()}`, description: "", file: null, filename: "", s3Url: "", uploading: false },
      ],
    }));
  };

  const updateFileDescription = (fieldName, index, value) => {
    setFilesByField((prev) => ({
      ...prev,
      [fieldName]: prev[fieldName].map((f, i) => (i === index ? { ...f, description: value } : f)),
    }));
  };

  const handleFileChange = async (fieldName, index, newFile) => {
    if (!newFile || !(newFile instanceof File)) {
      toast.error("Invalid file");
      return;
    }

    const currentRow = filesByField[fieldName][index];

    setFilesByField(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].map((f, i) =>
        i === index ? { ...f, file: newFile, filename: newFile.name, uploading: true } : f
      )
    }));

    try {
      const formData = new FormData();
      formData.append("file", newFile);
      
      if (currentRow.description?.trim()) {
        formData.append("description", currentRow.description.trim());
      }

      const resData = await nbaDashboardService.uploadFile(formData);
      // Handle different response formats - sometimes it's a direct string, sometimes an object
      const s3Url = typeof resData === 'string' ? resData : (resData || resData || "");
      console.log("📤 Upload response:", resData);
      console.log("🔗 Extracted S3 URL:", s3Url);

      setFilesByField(prev => ({
        ...prev,
        [fieldName]: prev[fieldName].map((f, i) =>
          i === index
            ? { ...f, s3Url: s3Url, filename: newFile.name, uploading: false }
            : f
        )
      }));

      toast.success("Uploaded successfully!");
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error("Upload failed");

      setFilesByField(prev => ({
        ...prev,
        [fieldName]: prev[fieldName].map((f, i) =>
          i === index ? { ...f, uploading: false, file: null, filename: "", s3Url: "" } : f
        )
      }));
    }
  };

  const removeFileRow = (fieldName, index) => {
    setFilesByField((prev) => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((_, i) => i !== index),
    }));
  };

  const handleSave = () => {
    onSave({
      content: formValues,
      tableData,
      filesByField,
    }, localFacultyData);
    setIsEditMode(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
      <div className="bg-[#2163c1] text-white p-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{title}</h2>
              <div className="flex items-center gap-2 mt-2">
                <div className="px-3 py-1 bg-white/20 rounded-full text-sm">
                  {marks} Marks
                </div>
                <div className="text-sm opacity-90">Criterion 5.1</div>
              </div>
            </div>
          </div>
          {!isCompleted && (
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`p-3 rounded-xl transition-all shadow-lg flex items-center justify-center ${
                isEditMode ? "bg-red-500 hover:bg-red-600 text-white" : "bg-white hover:bg-gray-100 text-blue-700"
              }`}
              title={isEditMode ? "Cancel Editing" : "Edit Section"}
            >
              {isEditMode ? <X className="w-5 h-5" /> : <Edit className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      <div className="p-8 space-y-12">
        {fields.map((field) => (
          <div key={field.name} className="space-y-6">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-3">
                {field.name.includes('5.1.1') ? (
                  <Calculator className="w-6 h-6 text-blue-600" />
                ) : (
                  <Users className="w-6 h-6 text-green-600" />
                )}
                <h3 className="text-xl font-bold text-gray-800">{field.label}</h3>
              </div>
              {field.marks && (
                <div className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                  {field.marks} Marks
                </div>
              )}
            </div>

            {field.hasTable ? (
              field.tableKey === "lateralEntryCalculation" ? (
                <SpecialTable5_1_1
                  data={tableData[field.tableKey] || []}
                  onChange={(newData) => handleTableChange(field.tableKey, newData)}
                  disabled={!isEditMode}
                />
              ) : field.tableKey === "studentFacultyRatio" ? (
                <StudentFacultyRatioTable
                  data={tableData[field.tableKey] || []}
                  onChange={(newData, facultyDataFromTable) => handleTableChange(field.tableKey, newData, facultyDataFromTable)}
                  disabled={!isEditMode}
                  initialFacultyData={localFacultyData}
                />
              ) : null
            ) : (
              <div className="border-2 border-gray-300 rounded-b-lg bg-white">
                <Editor
                  value={formValues[field.name] || ""}
                  onChange={(val) => setFormValues(prev => ({ ...prev, [field.name]: val }))}
                  disabled={!isEditMode || isCompleted}
                  style={{ minHeight: 240, padding: 16, fontSize: 16 }}
                  className="focus:outline-none"
                />
              </div>
            )}

            {/* Supporting Documents Section - Fixed UI */}
           {/* Supporting Documents Section - Always Show File Upload */}
{isEditMode && !isCompleted && (
  <div className="mt-6 p-6 bg-gray-50 rounded-xl border">
    <div className="flex justify-between items-center mb-4">
      <h4 className="text-lg font-bold text-blue-700 flex items-center gap-2">
        <Upload className="w-6 h-6" /> Supporting Documents
      </h4>
      {filesByField[field.name]?.some((f) => f.filename?.toLowerCase().endsWith(".pdf")) && (
        <button
          onClick={() => setMergeModal({ isOpen: true, fieldName: field.name })}
          className="px-5 py-2.5 bg-[#2163c1] text-white font-medium rounded-lg hover:bg-[#1d57a8] transition flex items-center gap-2"
        >
          <FileText className="w-5 h-5" /> Merge PDFs
        </button>
      )}
    </div>

    <div className="space-y-4">
      {/* Always show the first file upload row */}
      <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-300">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Document description"
            value={(filesByField[field.name]?.[0]?.description) || ""}
            onChange={(e) => {
              if (!filesByField[field.name]?.[0]) {
                addFileRow(field.name);
              }
              updateFileDescription(field.name, 0, e.target.value);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="w-64">
          {filesByField[field.name]?.[0]?.uploading ? (
            <div className="flex items-center gap-2 text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
              <span>Uploading...</span>
            </div>
          ) : filesByField[field.name]?.[0]?.filename ? (
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <button
                onClick={() => setPreviewModal({ isOpen: true, file: filesByField[field.name][0] })}
                className="text-blue-600 font-medium hover:underline truncate max-w-48"
                title={filesByField[field.name][0].filename}
              >
                {filesByField[field.name][0].filename}
              </button>
            </div>
          ) : (
            <input
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={(e) => {
                if (!filesByField[field.name]?.[0]) {
                  addFileRow(field.name);
                }
                handleFileChange(field.name, 0, e.target.files?.[0]);
              }}
              className="block w-full text-sm border-0 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:bg-[#2163c1] file:text-white"
            />
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => addFileRow(field.name)}
            className="text-green-600 hover:bg-green-50 p-2 rounded transition"
            title="Add another document"
          >
            <Plus className="w-5 h-5" />
          </button>
          {filesByField[field.name]?.[0] && (
            <button
              onClick={() => removeFileRow(field.name, 0)}
              className="text-red-500 hover:bg-red-50 p-2 rounded transition"
              title="Remove document"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Show additional document rows if any */}
      {(filesByField[field.name] || []).slice(1).map((file, index) => {
        const actualIndex = index + 1;
        return (
          <div key={file.id || `file-${actualIndex}`} className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-300">
            <div className="flex-1">
              <input
                type="text"
                value={file.description || ""}
                onChange={(e) => updateFileDescription(field.name, actualIndex, e.target.value)}
                placeholder="Document description"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="w-64">
              {file.uploading ? (
                <div className="flex items-center gap-2 text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                  <span>Uploading...</span>
                </div>
              ) : file.filename ? (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <button
                    onClick={() => setPreviewModal({ isOpen: true, file })}
                    className="text-blue-600 font-medium hover:underline truncate max-w-48"
                    title={file.filename}
                  >
                    {file.filename}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(field.name, actualIndex, e.target.files?.[0])}
                    className="block w-full text-sm border-0 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:bg-[#2163c1] file:text-white"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => addFileRow(field.name)}
                className="text-green-600 hover:bg-green-50 p-2 rounded transition"
                title="Add another document"
              >
                <Plus className="w-5 h-5" />
              </button>
              <button
                onClick={() => removeFileRow(field.name, actualIndex)}
                className="text-red-500 hover:bg-red-50 p-2 rounded transition"
                title="Remove document"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  </div>
)}
          </div>
        ))}

        {isEditMode && !isCompleted && (
          <div className="text-center pt-10 flex gap-4 justify-center">
            <button
              onClick={handleSave}
              disabled={saving || !isContributorEditable}
              className={`inline-flex items-center justify-center w-12 h-12 rounded-lg transition-all ${
                saving || !isContributorEditable
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl"
              }`}
              title={saving ? "Saving..." : !isContributorEditable ? "Not allowed to save" : "Save"}
            >
              {saving ? (
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
              ) : (
                <Save className="w-6 h-6" />
              )}
            </button>

            <button
              onClick={() => setIsEditMode(false)}
              disabled={saving}
              className="inline-flex items-center justify-center w-12 h-12 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition shadow-lg"
              title="Cancel"
            >
              <X className="w-6 h-6" />
            </button>

            <button
              onClick={onDelete}
              className="inline-flex items-center justify-center w-12 h-12 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow-lg"
              title="Delete Section Data"
            >
              <Trash2 className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>

      {/* Preview & Merge Modals */}
      <Modal
        isOpen={previewModal.isOpen}
        onRequestClose={() => setPreviewModal({ isOpen: false, file: null })}
        className="fixed inset-4 bg-white rounded-2xl shadow-2xl overflow-hidden outline-none"
        overlayClassName="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
      >
        {previewModal.file && (
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center p-6 bg-gradient-to-r from-blue-600 to-blue-400 text-white">
              <h3 className="text-xl font-bold">{previewModal.file.filename}</h3>
              <button onClick={() => setPreviewModal({ isOpen: false, file: null })}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <iframe
              src={previewModal.file.s3Url}
              title={previewModal.file.filename}
              className="flex-1 w-full"
            />
          </div>
        )}
      </Modal>

      <MergePdfModal
        isOpen={mergeModal.isOpen}
        pdfFiles={filesByField[mergeModal.fieldName] || []}
        onClose={() => setMergeModal({ isOpen: false, fieldName: null })}
        onFileAdd={(mergedDocument) => {
          const mergedFile = {
            id: mergedDocument.id,
            filename: mergedDocument.filename,
            description: mergedDocument.description,
            s3Url: mergedDocument.s3Url,
            uploading: false,
            isMerged: true,
          };
          setFilesByField((prev) => ({
            ...prev,
            [mergeModal.fieldName]: [...(prev[mergeModal.fieldName] || []), mergedFile],
          }));
          setMergeModal({ isOpen: false, fieldName: null });
        }}
      />
    </div>
  );
};

export default GenericCriteriaForm5_1;