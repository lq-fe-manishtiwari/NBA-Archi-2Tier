import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SweetAlert from "react-bootstrap-sweetalert";
import { collegeService } from "../Services/college.service";
import { AdminGradeAllocationService } from "../Services/AdminGradeAllocation.service";
import { X } from "lucide-react";

export default function EditAllocation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [programIds, setProgramIds] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allPrograms, allocation] = await Promise.all([
          collegeService.getAllprogram(),
          AdminGradeAllocationService.getProgramUserUsingUserID(id)
        ]);

        setPrograms(allPrograms);

        if (allocation && allocation.length > 0) {
          // The user_id should be the same for all allocations of a user.
          setName(allocation[0].user_id);

          // Extract all program IDs from the array of allocations
          const allocatedProgramIds = allocation.map(alloc => String(alloc.program.program_id));

          if (allocatedProgramIds.length > 0) {
            setProgramIds(allocatedProgramIds);
          }
        } else {
          navigate("/academics/allocation");
        }
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const handleProgramSelect = (programId) => {
    if (!programIds.includes(programId)) {
      setProgramIds([...programIds, programId]);
    }
    setIsDropdownOpen(false);
  };

  const handleProgramRemove = (programId) => {
    setProgramIds(programIds.filter(id => id !== programId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    setIsSubmitting(true);
    const values = {
      userId: id, // The user ID from params
      programIds: programIds.map(Number) // Convert back to numbers for the API
    };

    try {
      // The update function might need allocationId, but the API seems to be by userId.
      // Let's assume updateProgramUserAllocationID takes userId. This might need adjustment.
      await AdminGradeAllocationService.updateProgramUserAllocationID(id, values);
      setAlert(
        <SweetAlert
          success
          title="Updated!"
          confirmBtnCssClass="btn-confirm"
          cancelBtnCssClass="btn-cancel"
          onConfirm={() => navigate("/academics/allocation")}
        >
          Allocation has been updated.
        </SweetAlert>
      );
    } catch (error) {
      console.error("Failed to update allocation", error);
      setAlert(
        <SweetAlert error title="Error!"
          confirmBtnCssClass="btn-confirm"
          cancelBtnCssClass="btn-cancel"
          onConfirm={() => setAlert(null)}>
          Failed to update allocation. Please try again.
        </SweetAlert>
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-xl animate-slide-up">
      <h2 className="text-2xl font-semibold mb-6 text-blue-700">
        Edit Allocation
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-medium mb-1">Name</label>
          <input
            type="text"
            value={name}
            readOnly // Name should not be editable
            className="w-full border rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Program to Allocate</label>
          <div className="relative">
            <div
              className="w-full border rounded px-3 py-2 min-h-[42px] flex flex-wrap gap-2 items-center cursor-pointer bg-white hover:border-blue-400"
              onClick={() => !loading && setIsDropdownOpen(!isDropdownOpen)}
            >
              {programIds.length === 0 && (
                <span className="text-gray-400">Select programs...</span>
              )}
              {programs
                .filter(p => programIds.includes(String(p.program_id)))
                .map(p => (
                  <span key={p.program_id} className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5">
                    {p.program_name}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProgramRemove(String(p.program_id));
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
            </div>
            {isDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {programs
                  .filter(p => !programIds.includes(String(p.program_id)))
                  .map(p => (
                    <div key={p.program_id} onClick={() => handleProgramSelect(String(p.program_id))} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">{p.program_name}</div>
                  ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-4">
          <button type="button" onClick={() => navigate("/academics/allocation")} className="bg-gray-300 hover:bg-gray-400 px-6 py-2 rounded-lg transition">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition disabled:bg-blue-300">
            {isSubmitting ? "Updating..." : "Update"}
          </button>
        </div>
      </form>
      {alert}
    </div>
  );
}