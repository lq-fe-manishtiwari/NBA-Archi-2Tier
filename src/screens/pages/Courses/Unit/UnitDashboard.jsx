import React, { useState, useMemo } from "react";
import { Eye, Edit, Trash2, Plus, Search, Upload } from "lucide-react"; // ✅ Upload icon जोड़ा
import SweetAlert from "react-bootstrap-sweetalert";
import { Link } from "react-router-dom";

export default function UnitDashboard() {
    const [units, setUnits] = useState([
        {
            id: 1,
            unit: "Loops in JavaScript",
            module: "Control Structures",
            subject: "Web Programming",
            batchName: "BCA Sem 4",
        },
        {
            id: 2,
            unit: "Database Normalization",
            module: "Relational Model",
            subject: "DBMS",
            batchName: "BCA Sem 3",
        },
        {
            id: 3,
            unit: "Functions in Python",
            module: "Core Python",
            subject: "Python",
            batchName: "BCA Sem 2",
        },
    ]);

    const [searchQuery, setSearchQuery] = useState("");
    const [deleteId, setDeleteId] = useState(null);
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);

    // ✅ Search filter logic
    const filteredUnits = useMemo(() => {
        if (!searchQuery) return units;
        const q = searchQuery.toLowerCase();
        return units.filter(
            (u) =>
                u.unit.toLowerCase().includes(q) ||
                u.module.toLowerCase().includes(q) ||
                u.subject.toLowerCase().includes(q) ||
                u.batchName.toLowerCase().includes(q)
        );
    }, [searchQuery, units]);

    // ✅ Delete handlers
    const handleDelete = (id) => {
        setDeleteId(id);
        setShowDeleteAlert(true);
    };

    const confirmDelete = () => {
        setUnits((prev) => prev.filter((u) => u.id !== deleteId));
        setShowDeleteAlert(false);
    };

    const cancelDelete = () => {
        setDeleteId(null);
        setShowDeleteAlert(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">

                {/* ===== Header ===== */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    {/* 🔍 Search Bar */}
                    <div className="relative w-full sm:w-80">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                            type="search"
                            placeholder="Search by unit, module, subject..."
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-gray-900 bg-white shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* ✅ Buttons (Bulk Upload + Add Unit) */}
                    <div className="flex items-center gap-3">
                      

                        <Link to="/courses/add-unit">
                            <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md shadow-md transition-all hover:shadow-lg">
                                <Plus className="w-4 h-4" />
                                Add New Unit
                            </button>
                        </Link>
                        <Link to="/courses/bulk-upload-unit">
                            <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md shadow-md transition-all hover:shadow-lg">
                                <Upload className="w-4 h-4" />
                                Bulk Upload
                            </button>
                        </Link>
                    </div>
                </div>

                {/* ===== Table ===== */}
                <div className="ld:block bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <table className="w-full min-w-[900px]">
                        <thead className="table-header">
                            <tr>
                                <th className="table-th">Unit</th>
                                <th className="table-th">Module</th>
                                <th className="table-th">Subject</th>
                                <th className="table-th">Batch Name</th>
                                <th className="table-th">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-200">
                            {filteredUnits.length > 0 ? (
                                filteredUnits.map((unit) => (
                                    <tr key={unit.id} className="hover:bg-gray-50 transition-all">
                                        <td className="px-4 py-3">{unit.unit}</td>
                                        <td className="px-4 py-3">{unit.module}</td>
                                        <td className="px-4 py-3">{unit.subject}</td>
                                        <td className="px-4 py-3">{unit.batchName}</td>

                                        {/* Actions */}
                                        <td className="px-4 py-3 text-center flex justify-center gap-2">
                                            <Link to={`/courses/edit-unit/${unit.id}`}>
                                                <button className="p-2 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                            </Link>

                                            <button
                                                onClick={() => handleDelete(unit.id)}
                                                className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-6 text-gray-500">
                                        No units found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ===== Delete Confirmation Alert ===== */}
                {showDeleteAlert && (
                    <SweetAlert
                        warning
                        showCancel
                        confirmBtnCssClass="btn-confirm"
                        cancelBtnCssClass="btn-cancel"
                        title="Are you sure?"
                        onConfirm={confirmDelete}
                        onCancel={cancelDelete}
                    >
                        Do you want to delete this unit?
                    </SweetAlert>
                )}
            </div>
        </div>
    );
}
