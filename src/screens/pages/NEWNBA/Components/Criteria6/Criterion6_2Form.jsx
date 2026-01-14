// src/screens/pages/NEWNBA/Components/Criteria1/Criterion6_2Form.jsx

import React, { useState, useEffect } from "react";
import GenericCriteriaForm1_2 from "../GenericCriteriaForm1_2";
import { newnbaCriteria1Service } from "../../Services/NewNBA-Criteria1.service";
import { toast } from "react-toastify";
import SweetAlert from 'react-bootstrap-sweetalert';

const Criterion6_2Form = ({
  cycle_sub_category_id,
  isEditable = true,
  onSaveSuccess,
  programId = null,
  otherStaffId = null,
  showCardView = false,
  onCardClick = null,
  onStatusChange = null,
  cardData = [],
  editMode = false,
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initialData, setInitialData] = useState({
    content: {},
    tableData: {},
    files: [],
    faculty_rooms_id: null,
  });
  const [cardLoading, setCardLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  
  // Faculty rooms data
  const [facultyRooms, setFacultyRooms] = useState([]);
  const [qualityMetrics, setQualityMetrics] = useState({
    availability_score: 0,
    quality_score: 0,
    comfort_score: 0,
    facilities_score: 0,
    maintenance_score: 0
  });

  const config = {
    title: "6.2 Faculty Rooms (15)",
    totalMarks: 15,
    fields: [
      {
        name: "availability_description",
        label: "Availability of Faculty Rooms",
        marks: 5,
        type: "richText",
        placeholder: "Describe the availability and sufficiency of faculty rooms...",
      },
      // {
      //   name: "quality_description",
      //   label: "Quality of Faculty Rooms",
      //   marks: 10,
      //   type: "richText",
      //   placeholder: "Describe the quality, comfort, facilities, and conducive environment...",
      // },
    ]
  };

  // Calculate marks based on metrics
  const calculateMarks = () => {
    const totalScore = 
      qualityMetrics.availability_score * 0.2 +
      qualityMetrics.quality_score * 0.2 +
      qualityMetrics.comfort_score * 0.2 +
      qualityMetrics.facilities_score * 0.2 +
      qualityMetrics.maintenance_score * 0.2;
    
    const marks = Math.round((totalScore / 100) * 15); // Convert to 15 marks scale
    
    return {
      availabilityMarks: Math.round((qualityMetrics.availability_score / 100) * 5),
      qualityMarks: Math.round((totalScore / 100) * 10),
      totalMarks: marks
    };
  };

  // Load data from API function
  const loadData = async () => {
    const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
    const userInfoo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const currentOtherStaffId = otherStaffId || userInfo?.rawData?.other_staff_id || userInfo.user_id || userInfoo?.other_staff_id;
    
    console.log("🟠 Criterion6_2Form - useEffect triggered:");
    console.log("  - cycle_sub_category_id:", cycle_sub_category_id);
    console.log("  - currentOtherStaffId:", currentOtherStaffId);

    if (!cycle_sub_category_id) {
      console.log("❌ Criterion6_2Form: cycle_sub_category_id is missing, exiting");
      setLoading(false);
      return;
    }

    let d = {};
    setLoading(true);

    try {
      const res = await newnbaCriteria1Service.getCriteria6_2_Data?.(cycle_sub_category_id, currentOtherStaffId) || { data: {} };
      const rawResponse = res?.data || res || {};
      d = rawResponse;
      console.log("🟢 Loaded Criterion 6.2 data:", d);
    } catch (err) {
      console.error("❌ Failed to load Criterion 6.2 data:", err);
      toast.error("Failed to load Criterion 6.2 data");
      d = {};
    }

    // Parse faculty rooms list
    if (d.faculty_rooms && Array.isArray(d.faculty_rooms)) {
      setFacultyRooms(d.faculty_rooms);
    } else {
      // Default sample data
      setFacultyRooms([
        {
          id: 1,
          room_number: "F-101",
          room_type: "Faculty Room",
          capacity: 4,
          area_sqft: 200,
          facilities: ["AC", "Desk", "Chair", "Internet", "Cabinet", "Whiteboard"],
          condition: "Excellent",
          department: "Computer Science",
          remarks: "Well maintained, good ventilation"
        },
        {
          id: 2,
          room_number: "F-102",
          room_type: "HOD Room",
          capacity: 1,
          area_sqft: 180,
          facilities: ["AC", "Conference Table", "Visitor Chairs", "Internet", "Phone"],
          condition: "Excellent",
          department: "Computer Science",
          remarks: "Spacious and well-equipped"
        }
      ]);
    }

    // Parse quality metrics
    if (d.quality_metrics) {
      setQualityMetrics(d.quality_metrics);
    }

    setInitialData({
      content: {
        availability_description: d.availability_description || "The department/institution provides adequate and sufficient faculty rooms to accommodate all teaching faculty members. Each department has dedicated faculty rooms with appropriate seating arrangements to ensure comfortable working spaces for academic preparation, student consultations, and collaborative work.",
        quality_description: d.quality_description || "Faculty rooms are designed to provide a conducive and comfortable environment for academic activities. They are well-equipped with essential furniture, proper lighting, ventilation, internet connectivity, and storage facilities. Regular maintenance ensures clean, hygienic, and functional spaces that support faculty productivity and well-being.",
      },
      tableData: {},
      faculty_rooms_id: d.faculty_rooms_id || null,
      filesByField: {
        "room_layouts": (d.room_layout_documents || []).length > 0 
          ? (d.room_layout_documents || []).map((f, i) => ({
              id: `file-layout-${i}`,
              name: f.document_name || f.name || "",
              filename: f.document_name || f.name || "",
              url: f.document_url || f.url || "",
              s3Url: f.document_url || f.url || "",
              description: f.description || "Room Layout/Floor Plan",
              uploading: false
            }))
          : [{ id: `file-layout-0`, description: "Faculty Room Layout Plan", file: null, filename: "", s3Url: "", uploading: false }],
        "photographs": (d.photograph_documents || []).length > 0 
          ? (d.photograph_documents || []).map((f, i) => ({
              id: `file-photo-${i}`,
              name: f.document_name || f.name || "",
              filename: f.document_name || f.name || "",
              url: f.document_url || f.url || "",
              s3Url: f.document_url || f.url || "",
              description: f.description || "Room Photographs",
              uploading: false
            }))
          : [{ id: `file-photo-0`, description: "Faculty Room Photographs", file: null, filename: "", s3Url: "", uploading: false }],
        "inventory_documents": (d.inventory_documents || []).length > 0 
          ? (d.inventory_documents || []).map((f, i) => ({
              id: `file-inventory-${i}`,
              name: f.document_name || f.name || "",
              filename: f.document_name || f.name || "",
              url: f.document_url || f.url || "",
              s3Url: f.document_url || f.url || "",
              description: f.description || "Furniture & Equipment Inventory",
              uploading: false
            }))
          : [{ id: `file-inventory-0`, description: "Furniture Inventory List", file: null, filename: "", s3Url: "", uploading: false }],
      }
    });

    console.log("✅ Criterion6_2Form: Data loaded and set successfully");
    setLoading(false);
  };

  // Load contributors data for card view
  const loadContributorsData = async () => {
    if (!showCardView || !cycle_sub_category_id) return;
    
    setCardLoading(true);
    try {
      const contributorsResponse = await newnbaCriteria1Service.getAllCriteria6_2_Data?.(cycle_sub_category_id);
      if (onStatusChange) {
        onStatusChange(contributorsResponse || []);
      }
    } catch (err) {
      console.error("Failed to load contributors data:", err);
    } finally {
      setCardLoading(false);
    }
  };

  // Delete function that calls API
  const handleDelete = async () => {
    if (!initialData?.faculty_rooms_id) {
      setAlert(
        <SweetAlert
          warning
          title="No Data"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => setAlert(null)}
        >
          No data available to delete
        </SweetAlert>
      );
      return;
    }

    setAlert(
      <SweetAlert
        warning
        showCancel
        confirmBtnText="Yes, delete it!"
        confirmBtnBsStyle="danger"
        confirmBtnCssClass="btn-confirm"
        cancelBtnCssClass="btn-cancel"
        title="Are you sure?"
        onConfirm={async () => {
          setAlert(null);
          try {
            await newnbaCriteria1Service.deleteCriteria6_2_Data?.(initialData.faculty_rooms_id);
            
            setAlert(
              <SweetAlert
                success
                title="Deleted!"
                confirmBtnCssClass="btn-confirm"
                onConfirm={async () => {
                  setAlert(null);
                  await loadData();
                  onSaveSuccess?.();
                }}
              >
                Criterion 6.2 data has been deleted successfully.
              </SweetAlert>
            );
          } catch (err) {
            console.error("Delete Error:", err);
            setAlert(
              <SweetAlert
                danger
                title="Delete Failed"
                confirmBtnCssClass="btn-confirm"
                onConfirm={() => setAlert(null)}
              >
                {err.message || 'Failed to delete data'}
              </SweetAlert>
            );
          }
        }}
        onCancel={() => setAlert(null)}
      >
        This will permanently delete all Criterion 6.2 data!
      </SweetAlert>
    );
  };

  // Load initial data
  useEffect(() => {
    loadData();
    if (showCardView) {
      loadContributorsData();
    }
  }, [cycle_sub_category_id, showCardView, otherStaffId]);

  // Handle quality metrics changes
  const handleQualityMetricChange = (metric, value) => {
    setQualityMetrics(prev => ({
      ...prev,
      [metric]: parseInt(value) || 0
    }));
  };

  // Add new faculty room
  const handleAddRoom = () => {
    const newRoom = {
      id: Date.now(),
      room_number: "",
      room_type: "Faculty Room",
      capacity: 1,
      area_sqft: 0,
      facilities: [],
      condition: "Good",
      department: "",
      remarks: ""
    };
    setFacultyRooms([...facultyRooms, newRoom]);
  };

  const handleRoomChange = (index, field, value) => {
    const newList = [...facultyRooms];
    newList[index][field] = value;
    setFacultyRooms(newList);
  };

  const handleRemoveRoom = (index) => {
    const newList = facultyRooms.filter((_, i) => i !== index);
    setFacultyRooms(newList);
  };

  const handleSave = async (formData) => {
    const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
    const userInfoo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const currentOtherStaffId = otherStaffId || userInfo?.rawData?.other_staff_id || userInfo.user_id || userInfoo?.other_staff_id;
    
    console.log("🟠 Criterion6_2Form handleSave called");
    setSaving(true);

    try {
      // Transform filesByField → flat files with correct category
      const filesWithCategory = Object.keys(formData.filesByField || {}).flatMap(fieldName => {
        return (formData.filesByField[fieldName] || []).map(file => {
          let category = "Other";
          if (fieldName === "room_layouts") category = "Layout Documents";
          if (fieldName === "photographs") category = "Photographs";
          if (fieldName === "inventory_documents") category = "Inventory Documents";
          return { ...file, category };
        });
      });

      const marks = calculateMarks();

      const payload = {
        cycle_sub_category_id,
        other_staff_id: currentOtherStaffId,
        program_id: programId,
        availability_description: formData.content.availability_description || "",
        quality_description: formData.content.quality_description || "",
        faculty_rooms: facultyRooms,
        quality_metrics: qualityMetrics,
        calculated_marks: marks,
        total_faculty_rooms: facultyRooms.length,
        total_capacity: facultyRooms.reduce((sum, room) => sum + (room.capacity || 0), 0),
        total_area: facultyRooms.reduce((sum, room) => sum + (room.area_sqft || 0), 0),
        room_layout_documents: filesWithCategory
          .filter(f => f.category === "Layout Documents" && (f.url || f.s3Url))
          .map(f => ({ 
            document_name: f.filename, 
            document_url: f.s3Url || f.url,
            description: f.description || ""
          })),
        photograph_documents: filesWithCategory
          .filter(f => f.category === "Photographs" && (f.url || f.s3Url))
          .map(f => ({ 
            document_name: f.filename, 
            document_url: f.s3Url || f.url,
            description: f.description || ""
          })),
        inventory_documents: filesWithCategory
          .filter(f => f.category === "Inventory Documents" && (f.url || f.s3Url))
          .map(f => ({ 
            document_name: f.filename, 
            document_url: f.s3Url || f.url,
            description: f.description || ""
          })),
      };

      console.log("FINAL API CALL → payload:", payload);
      
      const newFiles = filesWithCategory.filter(f => f.file);
      console.log("New files to upload:", newFiles.length);

      // Use PUT for update if ID exists, otherwise POST for create
      if (initialData?.faculty_rooms_id) {
        await newnbaCriteria1Service.putCriteria6_2_Data?.(
          initialData.faculty_rooms_id,
          currentOtherStaffId,
          payload
        );
      } else {
        await newnbaCriteria1Service.saveCriteria6_2_Data?.(currentOtherStaffId, payload);
      }

      setAlert(
        <SweetAlert
          success
          title="Saved!"
          confirmBtnCssClass="btn-confirm"
          onConfirm={async () => {
            setAlert(null);
            await loadData();
            onSaveSuccess?.();
          }}
        >
          Criterion 6.2 saved successfully!
        </SweetAlert>
      );
    } catch (err) {
      console.error("Save error:", err);
      toast.error(err.message || "Save failed");
    }

    setSaving(false);
  };

  if (loading || (showCardView && cardLoading)) {
    return (
      <div className="flex justify-center py-20 text-xl font-medium text-indigo-600">
        Loading Criterion 6.2..
      </div>
    );
  }

  const marks = calculateMarks();

  // Show card view for coordinators
  if (showCardView) {
    return (
      <>
        <div className="space-y-4">
          {cardData && cardData.length > 0 ? (
            cardData.map((card, index) => (
              <div key={index} className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                   onClick={() => onCardClick?.(cycle_sub_category_id, card.other_staff_id, card)}>
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">{card.firstname} {card.lastname}</h4>
                    <p className="text-sm text-gray-600">Staff ID: {card.other_staff_id}</p>
                    <p className="text-sm text-gray-600">Total Rooms: {card.total_faculty_rooms || 0}</p>
                    <p className="text-sm text-gray-600">Calculated Marks: {card.calculated_marks?.totalMarks || 0}/15</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded text-xs ${
                      card.approval_status === 'APPROVED_BY_COORDINATOR' ? 'bg-green-100 text-green-800' :
                      card.approval_status === 'REJECTED_BY_COORDINATOR' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {card.approval_status || 'Pending'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No contributor submissions found
            </div>
          )}
        </div>
        {alert}
      </>
    );
  }

  return (
    <>
      <GenericCriteriaForm1_2
        title={config.title}
        marks={config.totalMarks}
        fields={config.fields}
        initialData={initialData}
        saving={saving}
        isCompleted={!isEditable}
        isContributorEditable={isEditable}
        onDelete={handleDelete}
        customContent={{
          "faculty_rooms_section": (
            <div className="space-y-6">
              {/* Marks Calculation Summary */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h5 className="font-semibold text-blue-700">Marks Calculation (0-15)</h5>
                    <p className="text-sm text-gray-700">
                      Availability: <span className="font-bold">{marks.availabilityMarks}/5</span> | 
                      Quality: <span className="font-bold">{marks.qualityMarks}/10</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-700">Total: {marks.totalMarks}/15</p>
                    <p className="text-xs text-gray-600">
                      Based on quality metrics below
                    </p>
                  </div>
                </div>
              </div>

              {/* Quality Assessment Metrics */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-[#2163c1] text-white px-4 py-2">
                  <h5 className="font-semibold">Faculty Rooms Quality Assessment Metrics</h5>
                </div>
                <div className="p-4 bg-gray-50">
                  <div className="space-y-4">
                    {Object.entries({
                      availability_score: "Availability & Sufficiency",
                      quality_score: "Quality of Construction",
                      comfort_score: "Comfort & Ergonomics",
                      facilities_score: "Facilities & Amenities",
                      maintenance_score: "Maintenance & Cleanliness"
                    }).map(([key, label], idx) => (
                      <div key={key} className="flex items-center justify-between">
                        <div className="w-48">
                          <label className="text-sm font-medium text-gray-700">{label}</label>
                          <div className="text-xs text-gray-500">0-100 points</div>
                        </div>
                        <div className="flex-1 max-w-md">
                          <div className="flex items-center space-x-4">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={qualityMetrics[key]}
                              onChange={(e) => handleQualityMetricChange(key, e.target.value)}
                              className="w-full"
                              disabled={!isEditable}
                            />
                            <div className="w-16 text-center">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={qualityMetrics[key]}
                                onChange={(e) => handleQualityMetricChange(key, e.target.value)}
                                className="w-full p-1 border rounded text-center text-sm"
                                disabled={!isEditable}
                              />
                            </div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Poor</span>
                            <span>Average</span>
                            <span>Good</span>
                            <span>Very Good</span>
                            <span>Excellent</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Faculty Rooms Inventory Table */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-[#2163c1] text-white px-4 py-2 flex justify-between items-center">
                  <h5 className="font-semibold">Faculty Rooms Inventory</h5>
                  {isEditable && (
                    <button
                      onClick={handleAddRoom}
                      className="px-3 py-1 bg-white text-blue-600 rounded text-sm font-medium hover:bg-gray-100"
                    >
                      + Add Room
                    </button>
                  )}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border text-sm">
                    <thead className="bg-blue-50">
                      <tr>
                        <th className="border px-3 py-2 w-24">Room No.</th>
                        <th className="border px-3 py-2 w-32">Room Type</th>
                        <th className="border px-3 py-2 w-20">Capacity</th>
                        <th className="border px-3 py-2 w-24">Area (sq.ft)</th>
                        <th className="border px-3 py-2">Facilities</th>
                        <th className="border px-3 py-2 w-28">Condition</th>
                        <th className="border px-3 py-2">Remarks</th>
                        {isEditable && <th className="border px-3 py-2 w-20">Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {facultyRooms.length > 0 ? (
                        facultyRooms.map((room, idx) => (
                          <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                            <td className="border px-3 py-2">
                              <input
                                type="text"
                                value={room.room_number}
                                onChange={(e) => handleRoomChange(idx, 'room_number', e.target.value)}
                                className="w-full p-1 border rounded text-center"
                                disabled={!isEditable}
                                placeholder="Room No."
                              />
                            </td>
                            <td className="border px-3 py-2">
                              <select
                                value={room.room_type}
                                onChange={(e) => handleRoomChange(idx, 'room_type', e.target.value)}
                                className="w-full p-1 border rounded text-sm"
                                disabled={!isEditable}
                              >
                                <option value="Faculty Room">Faculty Room</option>
                                <option value="HOD Room">HOD Room</option>
                                <option value="Common Room">Common Room</option>
                                <option value="Meeting Room">Meeting Room</option>
                                <option value="Discussion Room">Discussion Room</option>
                                <option value="Staff Room">Staff Room</option>
                              </select>
                            </td>
                            <td className="border px-3 py-2">
                              <input
                                type="number"
                                value={room.capacity}
                                onChange={(e) => handleRoomChange(idx, 'capacity', e.target.value)}
                                className="w-full p-1 border rounded text-center"
                                min="1"
                                disabled={!isEditable}
                              />
                            </td>
                            <td className="border px-3 py-2">
                              <input
                                type="number"
                                value={room.area_sqft}
                                onChange={(e) => handleRoomChange(idx, 'area_sqft', e.target.value)}
                                className="w-full p-1 border rounded text-center"
                                min="0"
                                disabled={!isEditable}
                              />
                            </td>
                            <td className="border px-3 py-2">
                              <select
                                multiple
                                value={room.facilities || []}
                                onChange={(e) => {
                                  const selected = Array.from(e.target.selectedOptions, option => option.value);
                                  handleRoomChange(idx, 'facilities', selected);
                                }}
                                className="w-full p-1 border rounded text-sm h-24"
                                disabled={!isEditable}
                              >
                                <option value="AC">Air Conditioning</option>
                                <option value="Desk">Study Desk</option>
                                <option value="Chair">Comfortable Chair</option>
                                <option value="Internet">Internet Connectivity</option>
                                <option value="Cabinet">Storage Cabinet</option>
                                <option value="Whiteboard">Whiteboard</option>
                                <option value="Bookshelf">Bookshelf</option>
                                <option value="Lighting">Adequate Lighting</option>
                                <option value="Ventilation">Good Ventilation</option>
                                <option value="Power Outlets">Power Outlets</option>
                                <option value="Phone">Telephone</option>
                                <option value="Computer">Computer</option>
                                <option value="Printer">Printer</option>
                                <option value="Water Dispenser">Water Dispenser</option>
                              </select>
                              <div className="text-xs text-gray-500 mt-1">
                                {room.facilities?.length || 0} facility(ies)
                              </div>
                            </td>
                            <td className="border px-3 py-2">
                              <select
                                value={room.condition}
                                onChange={(e) => handleRoomChange(idx, 'condition', e.target.value)}
                                className="w-full p-1 border rounded text-sm"
                                disabled={!isEditable}
                              >
                                <option value="Excellent">Excellent</option>
                                <option value="Very Good">Very Good</option>
                                <option value="Good">Good</option>
                                <option value="Average">Average</option>
                                <option value="Poor">Poor</option>
                                <option value="Needs Repair">Needs Repair</option>
                              </select>
                            </td>
                            <td className="border px-3 py-2">
                              <textarea
                                value={room.remarks}
                                onChange={(e) => handleRoomChange(idx, 'remarks', e.target.value)}
                                className="w-full p-1 border rounded text-sm"
                                rows="2"
                                disabled={!isEditable}
                                placeholder="Additional remarks..."
                              />
                            </td>
                            {isEditable && (
                              <td className="border px-3 py-2 text-center">
                                <button
                                  onClick={() => handleRemoveRoom(idx)}
                                  className="px-2 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                                >
                                  Remove
                                </button>
                              </td>
                            )}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={isEditable ? 8 : 7} className="border px-3 py-8 text-center text-gray-500">
                            No faculty rooms added. Click "Add Room" to add room details.
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot className="bg-gray-100">
                      <tr>
                        <td className="border px-3 py-2 text-center font-medium">Total</td>
                        <td className="border px-3 py-2 text-center">
                          {facultyRooms.length} rooms
                        </td>
                        <td className="border px-3 py-2 text-center font-bold">
                          {facultyRooms.reduce((sum, room) => sum + (room.capacity || 0), 0)}
                        </td>
                        <td className="border px-3 py-2 text-center font-bold">
                          {facultyRooms.reduce((sum, room) => sum + (room.area_sqft || 0), 0)} sq.ft
                        </td>
                        <td className="border px-3 py-2 text-center">
                          {facultyRooms.flatMap(r => r.facilities || []).filter((v, i, a) => a.indexOf(v) === i).length} unique facilities
                        </td>
                        <td className="border px-3 py-2 text-center">
                          {facultyRooms.filter(r => r.condition === 'Excellent' || r.condition === 'Very Good').length} rooms in good condition
                        </td>
                        <td colSpan={isEditable ? 2 : 1} className="border px-3 py-2"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Facilities Checklist */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h6 className="font-semibold text-gray-700 mb-3">Essential Facilities Checklist for Conductive Faculty Rooms:</h6>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Ergonomic furniture (desk & chair)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Adequate lighting and ventilation</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Internet connectivity (WiFi/LAN)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Storage facilities (cabinets/shelves)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Power outlets with surge protection</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Whiteboard/Notice board</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Thermal comfort (AC/fans/heating)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Noise control measures</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Clean and hygienic environment</span>
                  </div>
                </div>
              </div>
            </div>
          )
        }}
        onSave={(data) => {
          handleSave({
            content: data.content,
            tableData: data.tableData,
            filesByField: data.filesByField,
          });
        }}
      />
      {alert}
    </>
  );
};

export default Criterion6_2Form;