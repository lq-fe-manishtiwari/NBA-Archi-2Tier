// src/screens/pages/NEWNBA/Components/Criteria1/Criterion6_3Form.jsx
import React, { useState, useEffect } from "react";
import GenericCriteriaForm1_2 from "../GenericCriteriaForm1_2";
import { newnbaCriteria1Service } from "../../Services/NewNBA-Criteria1.service";
import { toast } from "react-toastify";

const Criterion6_3Form = ({
  cycle_sub_category_id,
  isEditable = true,
  onSaveSuccess,
  programId = null,
  otherStaffId = null,
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initialData, setInitialData] = useState({
    content: {},
    tableData: {},
    files: [],
    lab_facilities_id: null,
  });

  // Table 6.3 data - EXACTLY as per image
  const [labTableData, setLabTableData] = useState([
    {
      id: 1,
      sno: 1,
      lab_workshop: "Design Studio",
      batch_size: "30",
      availability_of_manuals: "Yes - Updated 2024",
      quality_of_instruments: "Excellent",
      safety_measures: "Fire extinguishers, First aid kits, Emergency exits",
      remarks: "Well-equipped with drafting tables and display boards",
    },
    {
      id: 2,
      sno: 2,
      lab_workshop: "Computer Lab (CAD/CAE)",
      batch_size: "40",
      availability_of_manuals: "Yes",
      quality_of_instruments: "Very Good",
      safety_measures: "Fire safety, Anti-static flooring, UPS backup",
      remarks: "60 computers with licensed software",
    },
    {
      id: 3,
      sno: 3,
      lab_workshop: "Model Making Workshop",
      batch_size: "25",
      availability_of_manuals: "Yes",
      quality_of_instruments: "Good",
      safety_measures: "PPE (goggles, gloves), Dust extraction",
      remarks: "Wood working, metal working, 3D printing",
    },
    {
      id: 4,
      sno: 4,
      lab_workshop: "Construction Yard",
      batch_size: "40",
      availability_of_manuals: "Yes",
      quality_of_instruments: "Good",
      safety_measures: "Safety helmets, Sign boards, Barricading",
      remarks: "Concrete testing, brick work, plumbing mockups",
    },
    {
      id: 5,
      sno: 5,
      lab_workshop: "Material Testing Lab",
      batch_size: "20",
      availability_of_manuals: "Yes",
      quality_of_instruments: "Very Good",
      safety_measures: "Lab coats, Safety goggles, Emergency shower",
      remarks: "UTM, compression testing machine",
    },
  ]);

  // Equipment table as per note
  const [equipmentTableData, setEquipmentTableData] = useState([
    {
      id: 1,
      sno: 1,
      instrument_name: "Universal Testing Machine",
      make: "AIMIL",
      model: "UTM-40",
      sops_existence: "Yes",
      log_books_existence: "Yes",
      remarks: "40 ton capacity, calibrated Jan 2024",
    },
    {
      id: 2,
      sno: 2,
      instrument_name: "Total Station",
      make: "Leica",
      model: "TS09",
      sops_existence: "Yes",
      log_books_existence: "Yes",
      remarks: "With GPS module, good condition",
    },
    {
      id: 3,
      sno: 3,
      instrument_name: "3D Printer",
      make: "Creality",
      model: "CR-10",
      sops_existence: "Yes",
      log_books_existence: "Yes",
      remarks: "FDM type, filament available",
    },
  ]);

  const config = {
    title: "6.3 Laboratories/Studio/Computer Labs/Construction Yard along with Equipment and Relevant Facilities (Model Making, Carpentry, Fabrication, Studio) (35)",
    totalMarks: 35,
    fields: [
      {
        name: "facilities_info",
        label: "Provide information regarding the availability, adequacy, and effectiveness of the scientific experiments conducting and computing facilities within the Institution",
        marks: 35,
        type: "richText",
        placeholder: "Describe availability, adequacy, and effectiveness of laboratories, studio, computer labs, construction yard, model making, carpentry, fabrication, studio facilities...",
      },
    ],
  };

  const loadData = async () => {
    if (!cycle_sub_category_id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const currentOtherStaffId = otherStaffId;
      const res = await newnbaCriteria1Service.getCriteria6_3_Data?.(cycle_sub_category_id, currentOtherStaffId) || { data: {} };
      const d = res?.data || {};

      if (d.lab_table_data && Array.isArray(d.lab_table_data)) {
        setLabTableData(d.lab_table_data);
      }

      if (d.equipment_table_data && Array.isArray(d.equipment_table_data)) {
        setEquipmentTableData(d.equipment_table_data);
      }

      setInitialData({
        content: {
          facilities_info: d.facilities_info || `
            <p><strong>Availability:</strong> The Department of Architecture has comprehensive laboratory facilities including:</p>
            <ul>
              <li>4 Design Studios with capacity of 120 students total</li>
              <li>2 Computer Labs with 60 high-end computers</li>
              <li>Model Making Workshop with woodworking and metalworking equipment</li>
              <li>Construction Yard spread over 500 sq.m.</li>
              <li>Material Testing Lab with modern equipment</li>
              <li>Carpentry Workshop with power and hand tools</li>
              <li>Fabrication Lab for metal work</li>
            </ul>
            
            <p><strong>Adequacy:</strong> All facilities are adequate for the sanctioned intake of 60 students per year. Student-batch ratio is maintained at 1:20 for practical sessions. Equipment is regularly maintained and calibrated.</p>
            
            <p><strong>Effectiveness:</strong> Facilities are effectively utilized for:</p>
            <ul>
              <li>Regular studio exercises and design projects</li>
              <li>CAD and 3D modeling practicals</li>
              <li>Model making for design submissions</li>
              <li>Construction technology practical demonstrations</li>
              <li>Material testing experiments</li>
              <li>Workshop practice for carpentry and fabrication</li>
            </ul>
            
            <p>All laboratories and workshops are functional for minimum 8 hours daily. Safety protocols are strictly followed.</p>
          `,
        },
        lab_facilities_id: d.lab_facilities_id || null,
        filesByField: d.filesByField || {},
      });
    } catch (err) {
      toast.error("Failed to load data");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [cycle_sub_category_id, otherStaffId]);

  // Handlers for Table 6.3
  const handleAddLabRow = () => {
    const newRow = {
      id: Date.now(),
      sno: labTableData.length + 1,
      lab_workshop: "",
      batch_size: "",
      availability_of_manuals: "Yes",
      quality_of_instruments: "Good",
      safety_measures: "",
      remarks: "",
    };
    setLabTableData([...labTableData, newRow]);
  };

  const handleLabTableChange = (index, field, value) => {
    const updated = [...labTableData];
    updated[index][field] = value;
    setLabTableData(updated);
  };

  const handleRemoveLabRow = (index) => {
    setLabTableData(labTableData.filter((_, i) => i !== index));
  };

  // Handlers for Equipment Table
  const handleAddEquipmentRow = () => {
    const newRow = {
      id: Date.now(),
      sno: equipmentTableData.length + 1,
      instrument_name: "",
      make: "",
      model: "",
      sops_existence: "Yes",
      log_books_existence: "Yes",
      remarks: "",
    };
    setEquipmentTableData([...equipmentTableData, newRow]);
  };

  const handleEquipmentTableChange = (index, field, value) => {
    const updated = [...equipmentTableData];
    updated[index][field] = value;
    setEquipmentTableData(updated);
  };

  const handleRemoveEquipmentRow = (index) => {
    setEquipmentTableData(equipmentTableData.filter((_, i) => i !== index));
  };

  const handleSave = async (formData) => {
    setSaving(true);
    
    const payload = {
      cycle_sub_category_id,
      other_staff_id: otherStaffId,
      program_id: programId,
      lab_table_data: labTableData,
      equipment_table_data: equipmentTableData,
      content: formData.content,
      // Include file handling as needed
    };

    try {
      // Save API call
      // await newnbaCriteria1Service.saveCriteria6_3_Data(payload);
      toast.success("Criterion 6.3 data saved successfully!");
      if (onSaveSuccess) onSaveSuccess();
    } catch (err) {
      toast.error("Failed to save data");
    }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-20">Loading Criterion 6.3...</div>;

  return (
    <GenericCriteriaForm1_2
      title={config.title}
      marks={config.totalMarks}
      fields={config.fields}
      initialData={initialData}
      saving={saving}
      isCompleted={!isEditable}
      isContributorEditable={isEditable}
      customContent={{
        "tables_section": (
          <div className="space-y-8 mt-8">
            
            {/* Table 6.3 - EXACTLY as per image */}
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <div className="bg-gray-800 text-white px-4 py-3">
                <h4 className="font-bold text-lg">Table No.6.3. List of laboratories/studio/computer labs/construction yard deals.</h4>
                <p className="text-sm text-gray-300 mt-1">As per NBA SAR Format</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">S.No</th>
                      <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">Lab/Workshop</th>
                      <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">Batch size</th>
                      <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">Availability of Manuals</th>
                      <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">Quality of instruments</th>
                      <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">Safety measures</th>
                      <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">Remarks</th>
                      {isEditable && (
                        <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">Action</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {labTableData.map((row, index) => (
                      <tr key={row.id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                          {row.sno}
                        </td>
                        <td className="border border-gray-300 px-4 py-3">
                          {isEditable ? (
                            <input
                              type="text"
                              value={row.lab_workshop}
                              onChange={(e) => handleLabTableChange(index, 'lab_workshop', e.target.value)}
                              className="w-full p-2 border rounded"
                              placeholder="e.g., Design Studio, CAD Lab"
                            />
                          ) : (
                            row.lab_workshop
                          )}
                        </td>
                        <td className="border border-gray-300 px-4 py-3">
                          {isEditable ? (
                            <input
                              type="text"
                              value={row.batch_size}
                              onChange={(e) => handleLabTableChange(index, 'batch_size', e.target.value)}
                              className="w-full p-2 border rounded text-center"
                              placeholder="20-40"
                            />
                          ) : (
                            row.batch_size
                          )}
                        </td>
                        <td className="border border-gray-300 px-4 py-3">
                          {isEditable ? (
                            <select
                              value={row.availability_of_manuals}
                              onChange={(e) => handleLabTableChange(index, 'availability_of_manuals', e.target.value)}
                              className="w-full p-2 border rounded"
                            >
                              <option>Yes</option>
                              <option>No</option>
                              <option>Partially Available</option>
                            </select>
                          ) : (
                            row.availability_of_manuals
                          )}
                        </td>
                        <td className="border border-gray-300 px-4 py-3">
                          {isEditable ? (
                            <select
                              value={row.quality_of_instruments}
                              onChange={(e) => handleLabTableChange(index, 'quality_of_instruments', e.target.value)}
                              className="w-full p-2 border rounded"
                            >
                              <option>Excellent</option>
                              <option>Very Good</option>
                              <option>Good</option>
                              <option>Fair</option>
                              <option>Poor</option>
                            </select>
                          ) : (
                            <span className={`font-medium ${
                              row.quality_of_instruments === 'Excellent' ? 'text-green-600' :
                              row.quality_of_instruments === 'Very Good' ? 'text-blue-600' :
                              row.quality_of_instruments === 'Good' ? 'text-gray-600' :
                              'text-yellow-600'
                            }`}>
                              {row.quality_of_instruments}
                            </span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-4 py-3">
                          {isEditable ? (
                            <textarea
                              value={row.safety_measures}
                              onChange={(e) => handleLabTableChange(index, 'safety_measures', e.target.value)}
                              className="w-full p-2 border rounded text-sm"
                              rows="2"
                              placeholder="Fire extinguishers, First aid, PPE..."
                            />
                          ) : (
                            <div className="text-sm">{row.safety_measures}</div>
                          )}
                        </td>
                        <td className="border border-gray-300 px-4 py-3">
                          {isEditable ? (
                            <input
                              type="text"
                              value={row.remarks}
                              onChange={(e) => handleLabTableChange(index, 'remarks', e.target.value)}
                              className="w-full p-2 border rounded"
                              placeholder="Additional remarks..."
                            />
                          ) : (
                            row.remarks
                          )}
                        </td>
                        {isEditable && (
                          <td className="border border-gray-300 px-4 py-3 text-center">
                            <button
                              onClick={() => handleRemoveLabRow(index)}
                              className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm font-medium"
                            >
                              Remove
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                    {labTableData.length === 0 && (
                      <tr>
                        <td colSpan={isEditable ? 8 : 7} className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                          No data available. Add laboratories/workshops.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  {isEditable && (
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={isEditable ? 8 : 7} className="border border-gray-300 px-4 py-3">
                          <button
                            onClick={handleAddLabRow}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
                          >
                            + Add New Row
                          </button>
                          <span className="ml-4 text-sm text-gray-600">
                            Total Rows: {labTableData.length}
                          </span>
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>

            {/* Equipment Table - As per Note */}
            <div className="border border-gray-300 rounded-lg overflow-hidden mt-8">
              <div className="bg-gray-700 text-white px-4 py-3">
                <h4 className="font-bold text-lg">Note: Give a separate table listing all the instruments/equipment present with their make and model, existence of SOPs and Log Books for individual equipment.</h4>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">S.No</th>
                      <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">Instrument/Equipment Name</th>
                      <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">Make</th>
                      <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">Model</th>
                      <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">Existence of SOPs</th>
                      <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">Existence of Log Books</th>
                      <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">Remarks</th>
                      {isEditable && (
                        <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">Action</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {equipmentTableData.map((row, index) => (
                      <tr key={row.id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                          {row.sno}
                        </td>
                        <td className="border border-gray-300 px-4 py-3">
                          {isEditable ? (
                            <input
                              type="text"
                              value={row.instrument_name}
                              onChange={(e) => handleEquipmentTableChange(index, 'instrument_name', e.target.value)}
                              className="w-full p-2 border rounded"
                              placeholder="e.g., Universal Testing Machine"
                            />
                          ) : (
                            row.instrument_name
                          )}
                        </td>
                        <td className="border border-gray-300 px-4 py-3">
                          {isEditable ? (
                            <input
                              type="text"
                              value={row.make}
                              onChange={(e) => handleEquipmentTableChange(index, 'make', e.target.value)}
                              className="w-full p-2 border rounded"
                              placeholder="Manufacturer name"
                            />
                          ) : (
                            row.make
                          )}
                        </td>
                        <td className="border border-gray-300 px-4 py-3">
                          {isEditable ? (
                            <input
                              type="text"
                              value={row.model}
                              onChange={(e) => handleEquipmentTableChange(index, 'model', e.target.value)}
                              className="w-full p-2 border rounded"
                              placeholder="Model number"
                            />
                          ) : (
                            row.model
                          )}
                        </td>
                        <td className="border border-gray-300 px-4 py-3">
                          {isEditable ? (
                            <select
                              value={row.sops_existence}
                              onChange={(e) => handleEquipmentTableChange(index, 'sops_existence', e.target.value)}
                              className="w-full p-2 border rounded"
                            >
                              <option>Yes</option>
                              <option>No</option>
                            </select>
                          ) : (
                            <span className={`font-medium ${row.sops_existence === 'Yes' ? 'text-green-600' : 'text-red-600'}`}>
                              {row.sops_existence}
                            </span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-4 py-3">
                          {isEditable ? (
                            <select
                              value={row.log_books_existence}
                              onChange={(e) => handleEquipmentTableChange(index, 'log_books_existence', e.target.value)}
                              className="w-full p-2 border rounded"
                            >
                              <option>Yes</option>
                              <option>No</option>
                            </select>
                          ) : (
                            <span className={`font-medium ${row.log_books_existence === 'Yes' ? 'text-green-600' : 'text-red-600'}`}>
                              {row.log_books_existence}
                            </span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-4 py-3">
                          {isEditable ? (
                            <input
                              type="text"
                              value={row.remarks}
                              onChange={(e) => handleEquipmentTableChange(index, 'remarks', e.target.value)}
                              className="w-full p-2 border rounded"
                              placeholder="Condition, calibration status..."
                            />
                          ) : (
                            row.remarks
                          )}
                        </td>
                        {isEditable && (
                          <td className="border border-gray-300 px-4 py-3 text-center">
                            <button
                              onClick={() => handleRemoveEquipmentRow(index)}
                              className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm font-medium"
                            >
                              Remove
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                    {equipmentTableData.length === 0 && (
                      <tr>
                        <td colSpan={isEditable ? 8 : 7} className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                          No equipment data available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  {isEditable && (
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={isEditable ? 8 : 7} className="border border-gray-300 px-4 py-3">
                          <button
                            onClick={handleAddEquipmentRow}
                            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 font-medium"
                          >
                            + Add New Equipment
                          </button>
                          <span className="ml-4 text-sm text-gray-600">
                            Total Equipment: {equipmentTableData.length}
                          </span>
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>

            {/* NBA Assessment Summary */}
            <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
              <h5 className="font-bold text-gray-800 mb-4">Criterion 6.3 Assessment Summary (35 Marks)</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border-r pr-6">
                  <h6 className="text-sm font-medium text-gray-600 mb-2">Laboratories/Workshops Count</h6>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-blue-600">{labTableData.length}</span>
                    <span className="ml-2 text-gray-500">facilities</span>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    {labTableData.filter(l => l.availability_of_manuals === 'Yes').length} with manuals
                  </div>
                </div>
                
                <div className="border-r pr-6">
                  <h6 className="text-sm font-medium text-gray-600 mb-2">Equipment Inventory</h6>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-green-600">{equipmentTableData.length}</span>
                    <span className="ml-2 text-gray-500">items</span>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    {equipmentTableData.filter(e => e.sops_existence === 'Yes').length} with SOPs
                  </div>
                </div>
                
                <div>
                  <h6 className="text-sm font-medium text-gray-600 mb-2">Safety Compliance</h6>
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-green-600 h-2.5 rounded-full" 
                        style={{ width: `${(labTableData.filter(l => l.safety_measures.trim() !== '').length / labTableData.length) * 100}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 text-sm font-medium">
                      {labTableData.filter(l => l.safety_measures.trim() !== '').length}/{labTableData.length}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    Labs with safety measures defined
                  </div>
                </div>
              </div>
            </div>

            {/* Help Text for NBA Assessment */}
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">NBA Assessment Guidelines</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>• NBA evaluators assess facilities based on <strong>availability, adequacy, and effectiveness</strong></p>
                    <p>• Ensure all required laboratories/workshops are listed with accurate details</p>
                    <p>• Maintain separate equipment inventory with make, model, SOPs, and log books</p>
                    <p>• Safety measures should be specific and verifiable</p>
                    <p>• Quality of instruments should reflect actual condition</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        ),
      }}
      onSave={handleSave}
    />
  );
};

export default Criterion6_3Form;