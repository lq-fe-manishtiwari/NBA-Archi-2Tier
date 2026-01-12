import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PSOService } from "../Services/pso.service";
import { collegeService } from "../../../Academics/Services/college.service";
import { Edit, Trash2, Eye, X } from 'lucide-react';
import SweetAlert from "react-bootstrap-sweetalert";

const ListPSO = () => {
  const [programs, setPrograms] = useState([]);
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [psoData, setPsoData] = useState([]);
  const [allPsoData, setAllPsoData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [error, setError] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate current page data
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = psoData.slice(indexOfFirstItem, indexOfLastItem);

  // Total pages
  const totalPages = Math.ceil(psoData.length / itemsPerPage);

  // Page handlers
  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  useEffect(() => {
    fetchPrograms();
    fetchAllMission();
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
      setFilteredPrograms(data);
    } catch (err) {
      setError("Failed to fetch programs. Please try again later.");
      console.error("Failed to fetch programs:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllMission = async () => {
    try {
      setLoading(true);
      const data = await PSOService.getAllPSO();
      setAllPsoData(data);
      setPsoData(data); // display all data initially
    } catch (err) {
      console.error("Failed to fetch vision data:", err);
      setError("Failed to fetch vision data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };


  const onProgramChange = async (program_id) => {
    setSelectedProgramId(program_id);

    if (!program_id) {
      // if no program selected, show all visions
      setPsoData(allPsoData);
      return;
    }
    try {
      setLoading(true);
      // Call API to get filtered vision data by program_id
      const response = await PSOService.getPSOByProgramId(program_id);
      setPsoData(response);
    } catch (err) {
      console.error("Error fetching vision by program:", err);
      setPsoData([]);
    } finally {
      setLoading(false);
    }
  };

  // const HandleDelete = async (pso_id) => {
  //     if (!window.confirm("Are you sure you want to delete this pso?")) return;

  //     try {
  //       setLoading(true);
  //       await PSOService.deletePSO(pso_id);

  //       // Remove deleted pso from state so UI updates
  //       setPsoData((prev) => prev.filter((pso) => pso.pso_id !== pso_id));
  //       setAllPsoData((prev) => prev.filter((pso) => pso.pso_id !== pso_id));

  //       alert("PSO deleted successfully!");
  //     } catch (err) {
  //       console.error("Failed to delete pso:", err);
  //       alert("Failed to delete pso. Please try again.");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  const HandleDelete = (PsoId) => {
    const item = psoData.find(m => m.pso_id === PsoId);
    setAlert(
      <SweetAlert
        warning
        showCancel
        confirmBtnText="Yes, delete!"
        cancelBtnText="Cancel"
        title="Are you sure?"
        onConfirm={() => confirmDelete(PsoId)}
        onCancel={() => setAlert(null)}
        confirmBtnCssClass="btn-confirm"
        cancelBtnCssClass="btn-cancel"
      >
        Delete Mission for <strong>{item?.mission_code}</strong>?
      </SweetAlert>
    );
  };

  const confirmDelete = async (PsoId) => {
    try {
      await PSOService.deletePSO(PsoId);
      setPsoData(prev => prev.filter(m => m.pso_id !== PsoId));
      setAllPsoData(prev => prev.filter(m => m.pso_id !== PsoId));
      setAlert(
        <SweetAlert success title="Deleted!"
          confirmBtnCssClass="btn-confirm"
          cancelBtnCssClass="btn-cancel"
          onConfirm={() => setAlert(null)}>
          Mission removed successfully.
        </SweetAlert>
      );
    } catch (err) {
      console.error("Failed to delete Mission", err);
      setAlert(
        <SweetAlert error title="Error!"
          confirmBtnCssClass="btn-confirm"
          cancelBtnCssClass="btn-cancel"
          onConfirm={() => setAlert(null)}>
          Failed to delete Mission. Please try again.
        </SweetAlert>
      );
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="pageheading text-xl font-semibold">PSO List</h2>
        <Link
          to="/obe/settings/Add_PSO"
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded text-sm"
        >
          Add PSO
        </Link>
      </div>

      {/* Program Dropdown */}
      <div className="mb-6 w-64">
        <label className="block font-medium mb-1">
          Program
        </label>

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

      {/* Table */}
      {loading ? (
        <div className="text-center py-10">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading data...</p>
        </div>
      ) : psoData.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 rounded-lg">
            <thead className="bg-primary-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-large text-gray-50 uppercase tracking-wider">Sr.No</th>
                <th className="px-6 py-3 text-left text-xs font-large text-gray-50 uppercase tracking-wider">Program Name</th>
                <th className="px-6 py-3 text-left text-xs font-large text-gray-50 uppercase tracking-wider">PSO Code</th>
                <th className="px-6 py-3 text-left text-xs font-large text-gray-50 uppercase tracking-wider">PSO Statement</th>
                <th className="px-6 py-3 text-left text-xs font-large text-gray-50 uppercase tracking-wider">Action</th>
              </tr>
            </thead>

            <tbody>
              {currentItems.map((item, index) => (
                <tr key={item.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{indexOfFirstItem + index + 1}</td>
                  <td className="px-4 py-2">{item.program?.program_name}</td>
                  <td className="px-4 py-2">{item.pso_code}</td>
                  <td className="px-4 py-2">{item.pso_statement}</td>
                  <td className="px-4 py-2 text-center">
                    <div className="flex items-center justify-center gap-2">

                      <Link
                        to="/obe/settings/Add_PSO"
                        state={{
                          isEdit: true,
                          psoData: item // pass the full row data
                        }}
                      >
                        <button className="p-2 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition">
                          <Edit className="w-4 h-4" />
                        </button>
                      </Link>
                      <button
                        onClick={() => HandleDelete(item.pso_id)}
                        className="p-2.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-center justify-between mt-4 w-full">
            {/* LEFT - Previous */}
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className={`px-4 py-2 bg-primary-600 text-white rounded disabled:bg-gray-300`}
            >
              Previous
            </button>
            {/* CENTER - Entries info */}
            <div className="text-gray-600 text-sm">
              Showing {indexOfFirstItem + 1}–
              {Math.min(indexOfLastItem, psoData.length)} of {psoData.length} entries
            </div>
            {/* RIGHT - Next */}
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 bg-primary-600 text-white rounded disabled:bg-gray-300`}
            >
              Next
            </button>
          </div>

        </div>
      ) : selectedProgramId ? (
        <p className="text-center py-6 text-gray-500">
          No records found.
        </p>
      ) : (
        <p className="text-center py-6 text-gray-500">
          Please select a program.
        </p>
      )}
      {alert}
    </div>

  );
};

export default ListPSO;
