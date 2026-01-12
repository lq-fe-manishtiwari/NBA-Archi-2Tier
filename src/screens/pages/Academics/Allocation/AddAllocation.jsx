import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SweetAlert from "react-bootstrap-sweetalert";
import { collegeService } from "../Services/college.service";
import { AdminGradeAllocationService } from "../Services/AdminGradeAllocation.service";
import { X } from "lucide-react";

export default function AddAllocation() {
  const navigate = useNavigate();

  // name now represents other_staff_id
  const [name, setName] = useState("");
  const [role, setRole] = useState(""); // NEW ROLE

  const [schoolUsers, setSchoolUsers] = useState([]);
  const [programIds, setProgramIds] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [programsData, schoolUsersData] = await Promise.all([
          collegeService.getAllprogram(),
          AdminGradeAllocationService.getAllSchoolUser(),
        ]);
        setPrograms(programsData);
        setSchoolUsers(schoolUsersData);
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleProgramSelect = (programId) => {
    if (!programIds.includes(programId)) {
      setProgramIds([...programIds, programId]);
    }
    setIsDropdownOpen(false);
  };

  const handleProgramRemove = (programId) => {
    setProgramIds(programIds.filter((id) => id !== programId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !role || programIds.length === 0) {
      setAlert(
        <SweetAlert
          warning
          title="Incomplete"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => setAlert(null)}
        >
          Please select a staff, role and at least one program.
        </SweetAlert>
      );
      return;
    }

    setIsSubmitting(true);

    // UPDATED PAYLOAD
    const values = programIds.map((programId) => ({
      other_staff_id: Number(name), 
      program_id: Number(programId),
      role: role,
    }));

    try {
      await AdminGradeAllocationService.saveProgramUserAllocation(values);
      setAlert(
        <SweetAlert
          success
          title="Success!"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => navigate("/academics/allocation")}
        >
          New allocation has been added.
        </SweetAlert>
      );
    } catch (error) {
      console.error("Failed to save allocation", error);
      setAlert(
        <SweetAlert
          error
          title="Error!"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => setAlert(null)}
        >
          Failed to save allocation. Please try again.
        </SweetAlert>
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = schoolUsers.filter((user) =>
    `${user.firstname} ${user.lastname}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const selectedUserName = () => {
    if (!name) return "";
    const selectedUser = schoolUsers.find(
      (u) => u.other_staff_id === Number(name)
    );
    return selectedUser
      ? `${selectedUser.firstname} ${selectedUser.lastname}`
      : "";
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-xl animate-slide-up">
      <h2 className="text-2xl font-semibold mb-6 text-blue-700">
        Add New Allocation
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* STAFF DROPDOWN */}
        <div>
          <label className="block font-medium mb-1">Staff</label>
          <div className="relative">
            <div
              className="w-full border rounded px-3 py-2 flex items-center justify-between cursor-pointer"
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            >
              <span>{selectedUserName() || "Select a staff"}</span>
              <svg
                className="w-4 h-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </div>

            {isUserDropdownOpen && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                <input
                  type="text"
                  placeholder="Search users..."
                  className="w-full px-3 py-2 border-b"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />

                <div className="max-h-60 overflow-y-auto">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.other_staff_id}
                      onClick={() => {
                        setName(user.other_staff_id);
                        setIsUserDropdownOpen(false);
                        setSearchTerm("");
                      }}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      {user.firstname} {user.lastname}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ROLE SELECT */}
        <div>
          <label className="block font-medium mb-1">Role</label>
          <select
            className="w-full border px-3 py-2 rounded"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="">Select Role</option>
            <option value="Contributor">Contributor</option>
            <option value="Coordinator">Coordinator</option>
            <option value="Sub-Coordinator">Sub-Coordinator</option>
          </select>
        </div>

        {/* PROGRAM SELECT */}
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
                .filter((p) => programIds.includes(String(p.program_id)))
                .map((p) => (
                  <span
                    key={p.program_id}
                    className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5"
                  >
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
                  .filter((p) => !programIds.includes(String(p.program_id)))
                  .map((p) => (
                    <div
                      key={p.program_id}
                      onClick={() =>
                        handleProgramSelect(String(p.program_id))
                      }
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      {p.program_name}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* BUTTONS */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate("/academics/allocation")}
            className="bg-gray-300 hover:bg-gray-400 px-6 py-2 rounded-lg transition"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition disabled:bg-blue-300"
          >
            {isSubmitting ? "Saving..." : "Save"}
          </button>
        </div>
      </form>

      {alert}
    </div>
  );
}
