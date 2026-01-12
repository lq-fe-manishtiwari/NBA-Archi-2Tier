import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SweetAlert from "react-bootstrap-sweetalert";
import { Edit, Trash2, Calendar, Hash } from 'lucide-react';
import { batchService } from "../Services/batch.Service"; // Service import
import SearchBar from "../../../../Components/SearchBar";
import ViewToggle from "../Components/ViewToggle";
import  {useViewMode}  from "../../../../contexts/ViewModeContext";

export default function BatchPage() {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [filteredBatches, setFilteredBatches] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { globalViewMode } = useViewMode();
  const [viewMode, setViewMode] = useState(globalViewMode);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showAlert, setShowAlert] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);

  const isFetchedRef = React.useRef(false);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        setLoading(true);
        const data = await batchService.getBatch();
        // API response ko check karein, ho sakta hai data 'data.data' mein ho
        const batchData = data?.data || data || [];
        setBatches(batchData);
        setFilteredBatches(batchData);
        setError(null);
      } catch (err) {
        setError(err.message || "Failed to fetch batches.");
        setBatches([]);
      } finally {
        setLoading(false);
      }
    };

    if (!isFetchedRef.current) {
      fetchBatches();
      isFetchedRef.current = true;
    }
  }, []);

  // Update local viewMode when global changes
  useEffect(() => {
    setViewMode(globalViewMode);
  }, [globalViewMode]);

  // Filter batches based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredBatches(batches);
    } else {
      const filtered = batches.filter((batch) =>
        batch.batch_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batch.batch_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (batch.description && batch.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        batch.start_year.toString().includes(searchTerm) ||
        batch.end_year.toString().includes(searchTerm)
      );
      setFilteredBatches(filtered);
    }
  }, [searchTerm, batches]);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  const handleViewChange = (mode) => {
    setViewMode(mode);
  };

  const handleDeleteClick = (item) => {
    setSelectedBatch(item);
    setShowAlert(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedBatch) return;
    try {
      await batchService.deleteBatch(selectedBatch.batch_id);
      setBatches(batches.filter((b) => b.batch_id !== selectedBatch.batch_id));
    } catch (err) {
      // Optionally show an error alert
      console.error("Failed to delete batch:", err);
    } finally {
      setShowAlert(false);
      setSelectedBatch(null);
    }
  };

  const handleCancelDelete = () => {
    setShowAlert(false);
    setSelectedBatch(null); // ← Clean up
  };

  if (loading) {
    return <div className="p-6 text-center">Loading batches...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
      {/* Search Bar */}
      <div >
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          placeholder="Search batches..."
          className="max-w-md"
        />
      </div>

        <button
          onClick={() => navigate("/academics/batch/add")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition w-full sm:w-auto text-center"
        >
          + Add New Batch
        </button>
      </div>



      {/* Table View */}
      {viewMode === "table" ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                    Batch Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-50 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBatches.length > 0 ? (
                  filteredBatches.map((item) => (
                    <tr key={item.batch_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.batch_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.batch_code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.start_year} - {item.end_year}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {item.description || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            className="p-2 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition"
                            onClick={() => navigate(`/academics/batch/edit/${item.batch_id}`)}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(item)}
                            className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      {searchTerm ? `No batches found matching "${searchTerm}"` : "No batches found. Add a new one to get started!"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBatches.length > 0 ? (
            filteredBatches.map((item) => (
            <div
              key={item.batch_id}
              className="bg-white shadow-md rounded-lg p-4 border border-gray-200 hover:shadow-lg transition flex flex-col justify-between"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{item.batch_name}</h3>
                <div className="text-sm text-gray-600 mt-2 space-y-1">
                  <p className="flex items-center"><Hash className="w-4 h-4 mr-2 text-gray-400" /> {item.batch_code}</p>
                  <p className="flex items-center"><Calendar className="w-4 h-4 mr-2 text-gray-400" /> {item.start_year} - {item.end_year}</p>
                </div>
                {item.description && (
                   <p className="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded">
                     {item.description}
                   </p>
                )}
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button className="p-2.5 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition"
                  onClick={() => navigate(`/academics/batch/edit/${item.batch_id}`)}
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteClick(item)}
                  className="p-2.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">
                {searchTerm ? `No batches found matching "${searchTerm}"` : "No batches found. Add a new one to get started!"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* SweetAlert - FIXED */}
      {showAlert && selectedBatch && (
        <SweetAlert
          warning
          showCancel
          title="Are you sure?"
          confirmBtnCssClass="btn-confirm"
          cancelBtnCssClass="btn-cancel"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        >
          Do you want to delete <strong>{selectedBatch.batch_name}</strong>?
        </SweetAlert>
      )}
    </div>
  );
}