import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SweetAlert from "react-bootstrap-sweetalert";
import { RoleService } from "../Services/Role.service";

export default function EditRole() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [animate, setAnimate] = useState(false);

  const [divisionName, setDivisionName] = useState("");
  const [error, setError] = useState({});

  const [alert, setAlert] = useState(null); // <-- For success SweetAlert
  const [showCancelAlert, setShowCancelAlert] = useState(false);

  useEffect(() => {
    setAnimate(true);
  }, []);

  const isFetchedRef = React.useRef(false);

  useEffect(() => {
    if (!isFetchedRef.current && id) {
      RoleService.getRoleById(id)
        .then(response => {
          setDivisionName(response.name);
        })
        .catch(err => {
          console.error("Failed to fetch division:", err);
          setError({ form: "Failed to load role data." });
        });

      isFetchedRef.current = true;
    }
  }, [id]);

  // Submit handler
  const handleSubmit = (e) => {
    e.preventDefault();

    let newErrors = {};
    if (!divisionName.trim()) newErrors.divisionName = "Role Name is required";

    setError(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const updatedRole = {
      role_id: parseInt(id),
      name: divisionName,
    };

    RoleService.updateRole(id, updatedRole)
      .then(() => {
        // ✅ Success SweetAlert
        setAlert(
          <SweetAlert
            success
            title="Role Updated!"
            onConfirm={() => {
              setAlert(null);
              navigate("/academics/role");
            }}
            confirmBtnCssClass="btn-confirm"
          >
            {`${divisionName} has been updated successfully.`}
          </SweetAlert>
        );
      })
      .catch(() => {
        setError({ form: "Failed to update role." });
      });
  };

  const handleCancel = () => navigate("/academics/role");

  return (
    <>
      {alert}

      <div className="mx-auto p-6">
        <div
          className={`relative bg-white rounded-2xl shadow-md p-6 transform transition-all duration-500 ease-out
          ${animate ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-10 scale-95"}`}
        >
          <button
            onClick={() => navigate("/academics/role")}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl font-bold"
            aria-label="Close"
          >
            ×
          </button>

          <h2 className="text-2xl font-semibold mb-6 text-blue-700">Edit Role</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-medium mb-1">Role Name</label>
              <input
                type="text"
                value={divisionName}
                onChange={(e) => setDivisionName(e.target.value)}
                className={`w-full border rounded px-3 py-2 ${
                  error.divisionName ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="e.g. Co-Ordinator, Contributor"
              />
              {error.divisionName && (
                <p className="text-red-500 text-sm mt-1">{error.divisionName}</p>
              )}
            </div>

            {error.form && (
              <p className="text-red-500 text-sm mt-1">{error.form}</p>
            )}

            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-300 text-gray-800 px-6 py-2 rounded hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
              >
                Update
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
