import React, { useState, useEffect, useCallback } from "react";
import { Editor } from "react-editor";
import Modal from "react-modal";
import MergePdfModal from "../MergePdfModal";
import { toast } from "react-toastify";
import { nbaDashboardService } from "../../Services/NBA-dashboard.service";
import {
  Trash2, Plus, FileText, Save, CheckCircle,
  Upload, X, Edit, Calculator, BookOpen, 
  TrendingUp, Briefcase, Wrench, DollarSign,
  FilePlus, Award, GraduationCap, Building
} from "lucide-react";

Modal.setAppElement("#root");

// 5.7.1 Academic Research Component
const AcademicResearchTable = ({ data, onChange, disabled }) => {
  const [rows, setRows] = useState(() => {
    if (data && data.length > 0) {
      return data;
    }
    return [
      { 
        id: "publication_1", 
        type: "publication", 
        description: "", 
        count: "" 
      },
      { 
        id: "phd_students_1", 
        type: "phd_students", 
        description: "No. of students received Ph.D.", 
        count: "" 
      },
      { 
        id: "faculty_guided_1", 
        type: "faculty_guided", 
        description: "No. of faculty guided Ph.D students", 
        count: "" 
      },
      { 
        id: "faculty_awarded_1", 
        type: "faculty_awarded", 
        description: "No. of faculty awarded Ph.D during assessment period", 
        count: "" 
      }
    ];
  });

  useEffect(() => {
    if (data && data.length > 0) {
      setRows(data);
    }
  }, [data]);

  const handleChange = useCallback((id, field, value) => {
    setRows(prevRows => {
      const updatedRows = prevRows.map(row => {
        if (row.id === id) {
          return { ...row, [field]: value };
        }
        return row;
      });
      
      onChange(updatedRows);
      return updatedRows;
    });
  }, [onChange]);

  const addRow = (type) => {
    const newRow = {
      id: `${type}_${Date.now()}`,
      type: type,
      description: type === "publication" ? "" : rows.find(r => r.type === type)?.description || "",
      count: ""
    };
    const newRows = [...rows, newRow];
    setRows(newRows);
    onChange(newRows);
  };

  const removeRow = (id) => {
    const newRows = rows.filter(row => row.id !== id);
    setRows(newRows);
    onChange(newRows);
  };

  const getRowStyle = (type) => {
    switch(type) {
      case "publication": return "bg-blue-50";
      case "phd_students": return "bg-green-50";
      case "faculty_guided": return "bg-yellow-50";
      case "faculty_awarded": return "bg-purple-50";
      default: return "bg-white";
    }
  };

  const getTypeLabel = (type) => {
    switch(type) {
      case "publication": return "5.7.1.1";
      case "phd_students": return "5.7.1.2 (Students)";
      case "faculty_guided": return "5.7.1.2 (Faculty Guided)";
      case "faculty_awarded": return "5.7.1.2 (Faculty Awarded)";
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BookOpen className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-bold text-blue-800">Academic Research Details</h4>
            <p className="text-sm text-gray-600 mt-1">
              Provide information about research publications, Ph.D. students, and faculty Ph.D. achievements
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-300">
        <table className="w-full bg-white">
          <thead>
            <tr className="bg-[#2163c1] text-white">
              <th className="p-4 text-left font-semibold w-48">Type</th>
              <th className="p-4 text-left font-semibold">Description</th>
              <th className="p-4 text-center font-semibold w-32">Count</th>
              {!disabled && <th className="p-4 text-center font-semibold w-24">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className={`border-b ${getRowStyle(row.type)}`}>
                <td className="p-4">
                  <div className="font-medium text-gray-700">
                    {getTypeLabel(row.type)}
                  </div>
                </td>
                <td className="p-4">
                  {row.type === "publication" ? (
                    <input
                      type="text"
                      value={row.description || ""}
                      onChange={(e) => handleChange(row.id, 'description', e.target.value)}
                      disabled={disabled}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="E.g., SCI Journals, Citations, Books/Book Chapters"
                    />
                  ) : (
                    <div className="px-3 py-2 text-gray-700">
                      {row.description}
                    </div>
                  )}
                </td>
                <td className="p-4">
                  <input
                    type="number"
                    min="0"
                    value={row.count || ""}
                    onChange={(e) => handleChange(row.id, 'count', e.target.value)}
                    disabled={disabled}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                  />
                </td>
                {!disabled && (
                  <td className="p-4 text-center">
                    <button
                      onClick={() => removeRow(row.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
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
        <div className="flex gap-2">
          <button
            onClick={() => addRow("publication")}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Publication
          </button>
          <button
            onClick={() => addRow("phd_students")}
            className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Ph.D. Student
          </button>
        </div>
      )}
    </div>
  );
};

// 5.7.2 Sponsored Research Component
const SponsoredResearchTable = ({ data, onChange, disabled, calculateMarks }) => {
  const [rows, setRows] = useState(() => {
    if (data && data.length > 0) {
      return data;
    }
    return [
      { 
        id: "sponsored_1", 
        pi_name: "", 
        project_title: "", 
        funding_agency: "", 
        amount: "" 
      }
    ];
  });

  const [totalAmount, setTotalAmount] = useState(0);
  const [marks, setMarks] = useState(0);

  useEffect(() => {
    if (data && data.length > 0) {
      setRows(data);
    }
  }, [data]);

  useEffect(() => {
    // Calculate total amount
    const total = rows.reduce((sum, row) => {
      return sum + (parseFloat(row.amount) || 0);
    }, 0);
    setTotalAmount(total);
    
    // Calculate marks based on total amount
    if (calculateMarks) {
      let calculatedMarks = 0;
      if (total >= 15) calculatedMarks = 10;
      else if (total >= 12) calculatedMarks = 8;
      else if (total >= 9) calculatedMarks = 6;
      else if (total >= 6) calculatedMarks = 4;
      else if (total >= 3) calculatedMarks = 2;
      setMarks(calculatedMarks);
    }
  }, [rows, calculateMarks]);

  const handleChange = useCallback((id, field, value) => {
    setRows(prevRows => {
      const updatedRows = prevRows.map(row => {
        if (row.id === id) {
          return { ...row, [field]: value };
        }
        return row;
      });
      
      onChange(updatedRows);
      return updatedRows;
    });
  }, [onChange]);

  const addRow = () => {
    const newRow = {
      id: `sponsored_${Date.now()}`,
      pi_name: "",
      project_title: "",
      funding_agency: "",
      amount: ""
    };
    const newRows = [...rows, newRow];
    setRows(newRows);
    onChange(newRows);
  };

  const removeRow = (id) => {
    const newRows = rows.filter(row => row.id !== id);
    setRows(newRows);
    onChange(newRows);
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h4 className="font-bold text-green-800">Sponsored Research Projects</h4>
            <p className="text-sm text-gray-600 mt-1">
              Provide list of funded research projects from external sources
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-300">
        <table className="w-full bg-white">
          <thead>
            <tr className="bg-[#2163c1] text-white">
              <th className="p-4 text-center font-semibold w-16">SN</th>
              <th className="p-4 text-left font-semibold">PI Name</th>
              <th className="p-4 text-left font-semibold">Project Title</th>
              <th className="p-4 text-left font-semibold">Funding Agency</th>
              <th className="p-4 text-center font-semibold w-32">Amount (Lakhs)</th>
              {!disabled && <th className="p-4 text-center font-semibold w-24">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id} className="border-b hover:bg-gray-50">
                <td className="p-4 text-center">{index + 1}</td>
                <td className="p-4">
                  <input
                    type="text"
                    value={row.pi_name || ""}
                    onChange={(e) => handleChange(row.id, 'pi_name', e.target.value)}
                    disabled={disabled}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter PI name"
                  />
                </td>
                <td className="p-4">
                  <input
                    type="text"
                    value={row.project_title || ""}
                    onChange={(e) => handleChange(row.id, 'project_title', e.target.value)}
                    disabled={disabled}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter project title"
                  />
                </td>
                <td className="p-4">
                  <input
                    type="text"
                    value={row.funding_agency || ""}
                    onChange={(e) => handleChange(row.id, 'funding_agency', e.target.value)}
                    disabled={disabled}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter funding agency"
                  />
                </td>
                <td className="p-4">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={row.amount || ""}
                    onChange={(e) => handleChange(row.id, 'amount', e.target.value)}
                    disabled={disabled}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-center focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="0.00"
                  />
                </td>
                {!disabled && (
                  <td className="p-4 text-center">
                    <button
                      onClick={() => removeRow(row.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
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

      {/* Total Amount and Marks Calculation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <h4 className="font-bold text-blue-800">Total Amount (CAYm1)</h4>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-700 mb-2">
              ₹{totalAmount.toFixed(2)} Lakhs
            </div>
            <p className="text-sm text-gray-600">Cumulative for past 3 years</p>
          </div>
        </div>

        <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Award className="w-5 h-5 text-green-600" />
            </div>
            <h4 className="font-bold text-green-800">Marks Calculation</h4>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-700 mb-2">
              {marks} / 10
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Amount ≥ 15L: 10 marks</p>
              <p>≥ 12L &lt; 15L: 8 marks</p>
              <p>≥ 9L &lt; 12L: 6 marks</p>
              <p>≥ 6L &lt; 9L: 4 marks</p>
              <p>≥ 3L &lt; 6L: 2 marks</p>
              <p>&lt; 3L: 0 marks</p>
            </div>
          </div>
        </div>
      </div>

      {!disabled && (
        <div className="flex justify-end">
          <button
            onClick={addRow}
            className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Project
          </button>
        </div>
      )}
    </div>
  );
};

// 5.7.3 Consultancy Component
const ConsultancyTable = ({ data, onChange, disabled }) => {
  const [yearlyData, setYearlyData] = useState(() => {
    if (data && data.length > 0) {
      return data;
    }
    return [
      { 
        year: "CAYm1", 
        projects: [
          { id: "consultancy_caym1_1", pi_name: "", project_title: "", funding_agency: "", amount: "" }
        ], 
        totalAmount: 0,
        marks: 0
      },
      { 
        year: "CAYm2", 
        projects: [
          { id: "consultancy_caym2_1", pi_name: "", project_title: "", funding_agency: "", amount: "" }
        ], 
        totalAmount: 0,
        marks: 0
      },
      { 
        year: "CAYm3", 
        projects: [
          { id: "consultancy_caym3_1", pi_name: "", project_title: "", funding_agency: "", amount: "" }
        ], 
        totalAmount: 0,
        marks: 0
      }
    ];
  });

  useEffect(() => {
    if (data && data.length > 0) {
      setYearlyData(data);
    }
  }, [data]);

  useEffect(() => {
    // Calculate totals and marks for each year
    const updatedData = yearlyData.map(yearData => {
      const total = yearData.projects.reduce((sum, project) => {
        return sum + (parseFloat(project.amount) || 0);
      }, 0);
      
      let marks = 0;
      if (total >= 25) marks = 15;
      else if (total >= 20) marks = 12;
      else if (total >= 15) marks = 9;
      else if (total >= 10) marks = 6;
      else if (total >= 5) marks = 3;
      
      return { ...yearData, totalAmount: total, marks };
    });
    
    setYearlyData(updatedData);
    onChange(updatedData);
  }, [yearlyData, onChange]);

  const handleProjectChange = (yearIndex, projectId, field, value) => {
    setYearlyData(prev => {
      const newData = [...prev];
      newData[yearIndex].projects = newData[yearIndex].projects.map(project => {
        if (project.id === projectId) {
          return { ...project, [field]: value };
        }
        return project;
      });
      return newData;
    });
  };

  const addProject = (yearIndex) => {
    const newProject = {
      id: `consultancy_${yearlyData[yearIndex].year}_${Date.now()}`,
      pi_name: "",
      project_title: "",
      funding_agency: "",
      amount: ""
    };
    
    setYearlyData(prev => {
      const newData = [...prev];
      newData[yearIndex].projects = [...newData[yearIndex].projects, newProject];
      return newData;
    });
  };

  const removeProject = (yearIndex, projectId) => {
    setYearlyData(prev => {
      const newData = [...prev];
      newData[yearIndex].projects = newData[yearIndex].projects.filter(p => p.id !== projectId);
      return newData;
    });
  };

  const getYearColor = (year) => {
    switch(year) {
      case "CAYm1": return "from-blue-50 to-indigo-50 border-blue-200 text-blue-800";
      case "CAYm2": return "from-green-50 to-emerald-50 border-green-200 text-green-800";
      case "CAYm3": return "from-purple-50 to-violet-50 border-purple-200 text-purple-800";
      default: return "from-gray-50 to-gray-100 border-gray-200 text-gray-800";
    }
  };

  return (
    <div className="space-y-8">
      <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Briefcase className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h4 className="font-bold text-amber-800">Consultancy Projects</h4>
            <p className="text-sm text-gray-600 mt-1">
              Provide list of consultancy projects from industry/government sources
            </p>
          </div>
        </div>
      </div>

      {yearlyData.map((yearData, yearIndex) => (
        <div key={yearData.year} className="space-y-4">
          <div className={`p-4 rounded-lg border ${getYearColor(yearData.year)}`}>
            <div className="flex justify-between items-center">
              <h5 className="font-bold text-lg">{yearData.year} - Consultancy Projects</h5>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-gray-600">Total Amount</div>
                  <div className="text-xl font-bold">₹{yearData.totalAmount.toFixed(2)} Lakhs</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Marks</div>
                  <div className="text-xl font-bold">{yearData.marks} / 15</div>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-300">
            <table className="w-full bg-white">
              <thead>
                <tr className="bg-[#2163c1] text-white">
                  <th className="p-4 text-center font-semibold w-16">SN</th>
                  <th className="p-4 text-left font-semibold">PI Name</th>
                  <th className="p-4 text-left font-semibold">Project Title</th>
                  <th className="p-4 text-left font-semibold">Funding Agency</th>
                  <th className="p-4 text-center font-semibold w-32">Amount (Lakhs)</th>
                  {!disabled && <th className="p-4 text-center font-semibold w-24">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {yearData.projects.map((project, index) => (
                  <tr key={project.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 text-center">{index + 1}</td>
                    <td className="p-4">
                      <input
                        type="text"
                        value={project.pi_name || ""}
                        onChange={(e) => handleProjectChange(yearIndex, project.id, 'pi_name', e.target.value)}
                        disabled={disabled}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        placeholder="Enter PI name"
                      />
                    </td>
                    <td className="p-4">
                      <input
                        type="text"
                        value={project.project_title || ""}
                        onChange={(e) => handleProjectChange(yearIndex, project.id, 'project_title', e.target.value)}
                        disabled={disabled}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        placeholder="Enter project title"
                      />
                    </td>
                    <td className="p-4">
                      <input
                        type="text"
                        value={project.funding_agency || ""}
                        onChange={(e) => handleProjectChange(yearIndex, project.id, 'funding_agency', e.target.value)}
                        disabled={disabled}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        placeholder="Enter funding agency"
                      />
                    </td>
                    <td className="p-4">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={project.amount || ""}
                        onChange={(e) => handleProjectChange(yearIndex, project.id, 'amount', e.target.value)}
                        disabled={disabled}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-center focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        placeholder="0.00"
                      />
                    </td>
                    {!disabled && (
                      <td className="p-4 text-center">
                        <button
                          onClick={() => removeProject(yearIndex, project.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
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
            <div className="flex justify-end">
              <button
                onClick={() => addProject(yearIndex)}
                className="px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Project for {yearData.year}
              </button>
            </div>
          )}
        </div>
      ))}

      {/* Marks Legend */}
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h5 className="font-bold text-gray-800 mb-2">Marks Calculation for Consultancy</h5>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 text-sm">
          <div className="p-2 bg-white border rounded text-center">
            <div className="font-semibold">≥ 25L</div>
            <div className="text-green-600">15 marks</div>
          </div>
          <div className="p-2 bg-white border rounded text-center">
            <div className="font-semibold">≥ 20L &lt; 25L</div>
            <div className="text-green-600">12 marks</div>
          </div>
          <div className="p-2 bg-white border rounded text-center">
            <div className="font-semibold">≥ 15L &lt; 20L</div>
            <div className="text-amber-600">9 marks</div>
          </div>
          <div className="p-2 bg-white border rounded text-center">
            <div className="font-semibold">≥ 10L &lt; 15L</div>
            <div className="text-amber-600">6 marks</div>
          </div>
          <div className="p-2 bg-white border rounded text-center">
            <div className="font-semibold">≥ 5L &lt; 10L</div>
            <div className="text-orange-600">3 marks</div>
          </div>
          <div className="p-2 bg-white border rounded text-center">
            <div className="font-semibold">&lt; 5L</div>
            <div className="text-red-600">0 marks</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 5.7.4 Development Activities Component
const DevelopmentActivitiesTable = ({ data, onChange, disabled }) => {
  const [activities, setActivities] = useState(() => {
    if (data && data.length > 0) {
      return data;
    }
    return [
      { id: "dev_1", category: "design", description: "Design Development", details: "" },
      { id: "dev_2", category: "product", description: "Product Development", details: "" },
      { id: "dev_3", category: "professional", description: "Professional Development", details: "" },
      { id: "dev_4", category: "instructional", description: "Instructional Materials", details: "" },
      { id: "dev_5", category: "models", description: "Working Models/Charts/Monograms", details: "" },
      { id: "dev_6", category: "community", description: "Community Development", details: "" }
    ];
  });

  useEffect(() => {
    if (data && data.length > 0) {
      setActivities(data);
    }
  }, [data]);

  const handleChange = useCallback((id, field, value) => {
    setActivities(prev => {
      const updated = prev.map(activity => {
        if (activity.id === id) {
          return { ...activity, [field]: value };
        }
        return activity;
      });
      
      onChange(updated);
      return updated;
    });
  }, [onChange]);

  const getCategoryColor = (category) => {
    switch(category) {
      case "design": return "bg-blue-50 border-blue-200";
      case "product": return "bg-green-50 border-green-200";
      case "professional": return "bg-purple-50 border-purple-200";
      case "instructional": return "bg-yellow-50 border-yellow-200";
      case "models": return "bg-indigo-50 border-indigo-200";
      case "community": return "bg-teal-50 border-teal-200";
      default: return "bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Wrench className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h4 className="font-bold text-purple-800">Development Activities</h4>
            <p className="text-sm text-gray-600 mt-1">
              Provide details of various development activities undertaken
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className={`p-4 rounded-lg border ${getCategoryColor(activity.category)}`}>
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h5 className="font-bold text-gray-800 mb-2">{activity.description}</h5>
                <textarea
                  value={activity.details || ""}
                  onChange={(e) => handleChange(activity.id, 'details', e.target.value)}
                  disabled={disabled}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder={`Provide details about ${activity.description.toLowerCase()}...`}
                />
              </div>
              <div className="w-24">
                <div className="text-sm text-gray-500 mb-1">Category</div>
                <div className="px-3 py-1 bg-white border rounded text-center font-medium">
                  {activity.category}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!disabled && (
        <div className="p-4 bg-gray-50 rounded-lg border">
          <p className="text-sm text-gray-600">
            <strong>Note:</strong> Provide specific details, achievements, and outcomes for each development activity category.
          </p>
        </div>
      )}
    </div>
  );
};

// Main Component - Generic Criteria Form 5.7
const GenericCriteriaForm5_7 = ({
  title = "5.7 Research and Development (45)",
  marks = 45,
  fields = [],
  initialData = null,
  onSave,
  onDelete,
  isCompleted = false,
  isContributorEditable = true,
  saving = false,
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

  useEffect(() => {
    if (initialData?.content) {
      setFormValues(initialData.content);
    }
    if (initialData?.tableData) {
      setTableData(initialData.tableData);
    }
    if (initialData?.filesByField) {
      setFilesByField(initialData.filesByField);
    }
  }, [initialData]);

  const handleTableChange = (tableKey, newData) => {
    setTableData(prev => ({ ...prev, [tableKey]: newData }));
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
      const s3Url = typeof resData === 'string' ? resData : (resData || "");

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
    });
    setIsEditMode(false);
  };

  // Render appropriate table component based on field type
  const renderTableComponent = (field) => {
    switch(field.tableKey) {
      case "academicResearch":
        return (
          <AcademicResearchTable
            data={tableData[field.tableKey] || []}
            onChange={(newData) => handleTableChange(field.tableKey, newData)}
            disabled={!isEditMode}
          />
        );
      
      case "sponsoredResearch":
        return (
          <SponsoredResearchTable
            data={tableData[field.tableKey] || []}
            onChange={(newData) => handleTableChange(field.tableKey, newData)}
            disabled={!isEditMode}
            calculateMarks={true}
          />
        );
      
      case "consultancy":
        return (
          <ConsultancyTable
            data={tableData[field.tableKey] || []}
            onChange={(newData) => handleTableChange(field.tableKey, newData)}
            disabled={!isEditMode}
          />
        );
      
      case "developmentActivities":
        return (
          <DevelopmentActivitiesTable
            data={tableData[field.tableKey] || []}
            onChange={(newData) => handleTableChange(field.tableKey, newData)}
            disabled={!isEditMode}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-[#2163c1] text-white p-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <TrendingUp className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{title}</h2>
              <div className="flex items-center gap-2 mt-2">
                <div className="px-3 py-1 bg-white/20 rounded-full text-sm">
                  {marks} Marks
                </div>
                <div className="text-sm opacity-90">Criterion 5.7 - Research and Development</div>
              </div>
            </div>
          </div>
          {!isCompleted && (
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`p-3 rounded-xl transition-all shadow-lg flex items-center justify-center ${
                isEditMode ? "bg-red-500 hover:bg-red-600 text-white" : "bg-white hover:bg-gray-100 text-[#2163c1]"
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
                {field.name === "5.7.1" && <BookOpen className="w-6 h-6 text-[#2163c1]" />}
                {field.name === "5.7.2" && <TrendingUp className="w-6 h-6 text-green-600" />}
                {field.name === "5.7.3" && <Briefcase className="w-6 h-6 text-amber-600" />}
                {field.name === "5.7.4" && <Wrench className="w-6 h-6 text-purple-600" />}
                <h3 className="text-xl font-bold text-gray-800">{field.label}</h3>
              </div>
              {field.marks && (
                <div className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                  {field.marks} Marks
                </div>
              )}
            </div>

            {field.hasTable ? (
              renderTableComponent(field)
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

            {/* Supporting Documents Section */}
            {isEditMode && !isCompleted && (
              <div className="mt-6 p-6 bg-gray-50 rounded-xl border">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-bold text-[#2163c1] flex items-center gap-2">
                    <Upload className="w-6 h-6" /> Supporting Documents
                  </h4>
                  {filesByField[field.name]?.some((f) => f.filename?.toLowerCase().endsWith(".pdf")) && (
                    <button
                      onClick={() => setMergeModal({ isOpen: true, fieldName: field.name })}
                      className="px-5 py-2.5 bg-[#2163c1] text-white font-medium rounded-lg hover:bg-[#1a4f9a] transition flex items-center gap-2"
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
                        placeholder="Document description (e.g., research publications, project certificates)"
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
                            className="text-[#2163c1] font-medium hover:underline truncate max-w-48"
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
                                className="text-[#2163c1] font-medium hover:underline truncate max-w-48"
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
            <div className="flex justify-between items-center p-6 bg-[#2163c1] text-white">
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

export default GenericCriteriaForm5_7;