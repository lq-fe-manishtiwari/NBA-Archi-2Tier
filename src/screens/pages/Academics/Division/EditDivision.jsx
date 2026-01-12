import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SweetAlert from "react-bootstrap-sweetalert";
import { DivisionService } from "../Services/Division.service";

export default function EditDivision() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [animate, setAnimate] = useState(false);

  // Form states
  const [divisionName, setDivisionName] = useState("");

  const [error, setError] = useState({});
  const [showCancelAlert, setShowCancelAlert] = useState(false);

  useEffect(() => {
    setAnimate(true);
  }, []);

  const isFetchedRef = React.useRef(false);

  useEffect(() => {
    if (!isFetchedRef.current && id) {
      DivisionService.getDivisionById(id)
        .then(response => {
          const div = response;
          setDivisionName(div.division_name);
        })
        .catch(err => {
          console.error("Failed to fetch division:", err);
          setError({ form: "Failed to load division data." });
        });
  
      isFetchedRef.current = true; // ✅ ensures it runs only once
    }
  }, [id]);


  // ✅ Form submit handler
  const handleSubmit = (e) => {
    e.preventDefault();
    let newErrors = {};

    if (!divisionName.trim()) newErrors.divisionName = "Division Name is required";

    setError(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const updatedDivision = {
      division_id: parseInt(id),
      division_name: divisionName,
    };

    DivisionService.updateDivision(updatedDivision)
      .then(() => navigate("/academics/division"))
      .catch(err => setError({ form: "Failed to update division." }));
  };

  // ✅ Cancel confirmation handlers
  const handleCancel = () => navigate("/academics/division");

  const handleConfirmCancel = () => {
    setShowCancelAlert(false);
    navigate("/academics/division");
  };
  const handleCancelAlert = () => navigate("/academics/division");

  return (
    <div className="mx-auto p-6">
      <div
        className={`relative bg-white rounded-2xl shadow-md p-6 transform transition-all duration-500 ease-out
        ${animate ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-10 scale-95"}`}
      >
        {/* Close button */}
        <button
          onClick={() => navigate("/academics/division")}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl font-bold"
          aria-label="Close"
        >
          ×
        </button>

        <h2 className="text-2xl font-semibold mb-6 text-blue-700">Edit Division</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Division Name */}
          <div>
            <label className="block font-medium mb-1">Division Name</label>
            <input
              type="text"
              value={divisionName}
              onChange={(e) => setDivisionName(e.target.value)}
              className={`w-full border rounded px-3 py-2 ${
                error.divisionName ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter Division Name"
            />
            {error.divisionName && (
              <p className="text-red-500 text-sm mt-1">{error.divisionName}</p>
            )}
          </div>

          {error.form && <p className="text-red-500 text-sm mt-1">{error.form}</p>}

          {/* Buttons */}
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

        {/* SweetAlert for Cancel */}
        {showCancelAlert && (
          <SweetAlert
            warning
            showCancel
            title="Are you sure?"
            onConfirm={handleConfirmCancel}
            onCancel={handleCancelAlert}
            confirmBtnText="OK"
            cancelBtnText="Cancel"
               confirmBtnCssClass="btn-confirm"
          cancelBtnCssClass="btn-cancel"
          >
            Your changes will be lost if you leave this page.
          </SweetAlert>
        )}
      </div>
    </div>
  );
}
