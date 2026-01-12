import React, {useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { POService }  from "../Services/po.service";
import { collegeService } from "../../../Academics/Services/college.service";
import { AcademicService } from "../../../Academics/Services/Academic.service";

const ListPO = () => {
  const [programs, setPrograms] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [selectedYearId, setSelectedYearId] = useState("");
  const [poData, setPoData] = useState([]);
  const [loading, setLoading] = useState(false);

   useEffect(() => {
        fetchPrograms();
        fetchAcademicYears();
      }, []);

    useEffect(() => {
      const storedProgram = localStorage.getItem("selectedOBEprogram");
    
      if (storedProgram && programs.length > 0) {
        const programId = Number(storedProgram);  // convert to number
        setSelectedProgramId(programId);
        onProgramChange(programId);
      }
    }, [programs]);   // wait until programs are loaded

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

  const fetchAcademicYears = async () => {
        try {
          setLoading(true);
          const response = await AcademicService.getAcademic();
          setAcademicYears(response);
        } catch (err) {
          console.error("Failed to fetch academic years:", err);
          setError("Failed to load academic years. Please try again.");
        } finally {
          setLoading(false);
        }
      };

  const getPObyProgramIdYear = async (program_id, year_id) => {
  try {
    setLoading(true);
    const response = await POService.getPObyProgramIdYear(program_id, year_id);
    setPoData(response);
  } catch (err) {
    console.error("Failed to load PO data:", err);
  } finally {
    setLoading(false);
  }
};

  const [selectedGradeId, setSelectedGradeId] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editPO, setEditPO] = useState(null);

  const onProgramChange = (programId) => {
  setSelectedProgramId(programId);

  // call API only when year selected
  if (programId && selectedYearId) {
    getPObyProgramIdYear(programId, selectedYearId);
  }
};

  const onAcademicYearChange = (yearId) => {
  setSelectedYearId(yearId);

  // call API only when program selected
  if (selectedProgramId && yearId) {
    getPObyProgramIdYear(selectedProgramId, yearId);
  }
};


  // Edit action
  const handleEdit = (item) => {
    setEditPO(item);
    setShowModal(true);
  };

  // Delete action
  const handleDelete = (id) => {
    setPoData(poData.filter((x) => x.po_id !== id));
  };

  // Save edited data
  const handleSave = () => {
    setPoData(
      poData.map((item) =>
        item.po_id === editPO.po_id ? editPO : item
      )
    );
    setShowModal(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
                                        <h2 className="pageheading text-xl font-semibold">PO List</h2>
                                        <Link
                                          to="/obe/settings/Add_PO"
                                          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded text-sm"
                                        >
                                          Add PO
                                        </Link>
                                      </div>

      {/* Program + Academic Year in One Row */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

  {/* Program Dropdown */}
  <div>
    <label className="block mb-1 font-medium">Program</label>
    <select
      className="w-full border border-gray-300 rounded p-2"
      value={selectedProgramId}
      onChange={(e) => onProgramChange(e.target.value)}
    >
      <option value="">Select Program</option>
      {programs.map((p) => (
        <option key={p.program_id} value={p.program_id}>
          {p.program_name}
        </option>
      ))}
    </select>
  </div>

  {/* Academic Year Dropdown */}
  <div>
    <label className="block mb-1 font-medium">Academic Year</label>
    <select
      className="w-full border border-gray-300 rounded p-2"
      value={selectedYearId}
      onChange={(e) => onAcademicYearChange(e.target.value)}
    >
      <option value="">Select Academic Year</option>
      {academicYears.map((y) => (
        <option key={y.id} value={y.id}>
          {y.year}
        </option>
      ))}
    </select>
  </div>

</div>


      {/* Table */}
      {poData.length === 0 ? (
        <p className="text-center text-gray-500 py-4">POs Not Found!</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead className="bg-primary-600 text-white">
              <tr>
                <th className="px-3 py-2 border">S.No</th>
                <th className="px-3 py-2 border">PO Code</th>
                <th className="px-3 py-2 border">PO Statement</th>
                {/* <th className="px-3 py-2 border">Actions</th> */}
              </tr>
            </thead>
            <tbody>
              {poData.map((item, index) => (
                <tr key={item.po_id} className="hover:bg-gray-100">
                  <td className="px-3 py-2 border text-center">{index + 1}</td>
                  <td className="px-3 py-2 border">{item.po_code}</td>
                  <td className="px-3 py-2 border">{item.po_statement}</td>
                  {/* <td className="px-3 py-2 border text-center">
                    <button
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm mr-2 hover:bg-blue-600"
                      onClick={() => handleEdit(item)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                      onClick={() => handleDelete(item.po_id)}
                    >
                      Delete
                    </button>
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ---------- Tailwind Modal ---------- */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded shadow-lg p-6 w-96">
            <h2 className="text-lg font-bold mb-4">Edit PO</h2>

            <label>PO Code</label>
            <input
              value={editPO.po_code}
              onChange={(e) =>
                setEditPO({ ...editPO, po_code: e.target.value })
              }
              className="border w-full p-2 mb-3 rounded"
            />

            <label>PO Statement</label>
            <textarea
              value={editPO.po_statement}
              onChange={(e) =>
                setEditPO({ ...editPO, po_statement: e.target.value })
              }
              className="border w-full p-2 rounded mb-4"
            />

            <div className="flex justify-end space-x-2">
              <button
                className="bg-gray-500 text-white px-4 py-1 rounded"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-1 rounded"
                onClick={handleSave}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListPO;
