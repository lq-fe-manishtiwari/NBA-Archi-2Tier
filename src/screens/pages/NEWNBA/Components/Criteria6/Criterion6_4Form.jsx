// src/screens/pages/NEWNBA/Components/Criteria1/Criterion6_4Form.jsx
import React, { useState, useEffect } from "react";
import GenericCriteriaForm1_2 from "../GenericCriteriaForm1_2";
import { newnbaCriteria6Service } from "../../Services/NewNBA-Criteria6.service";
import SweetAlert from "react-bootstrap-sweetalert";

const Criterion6_4Form = ({
  cycle_sub_category_id,
  isEditable = true,
  onSaveSuccess,
  programId = null,
  otherStaffId = null,
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);
  const [initialData, setInitialData] = useState({
    content: {},
    files: [],
    material_museum_id: null,
  });

  // Museum collection table data - simple format as per image
  const [museumData, setMuseumData] = useState([
    {
      id: 1,
      sno: 1,
      collection_type: "Geological Samples",
      quality: "Excellent",
      labeling_standards: "Scientific nomenclature with QR codes",
      display_standards: "Glass cases with proper lighting and climate control",
      remarks: "100+ rock and mineral samples, well cataloged",
    },
    {
      id: 2,
      sno: 2,
      collection_type: "Building Material Samples",
      quality: "Very Good",
      labeling_standards: "Material specifications with technical details",
      display_standards: "Wall-mounted displays with proper organization",
      remarks: "Bricks, tiles, concrete, wood, steel samples",
    },
    {
      id: 3,
      sno: 3,
      collection_type: "Historical Architectural Models",
      quality: "Good",
      labeling_standards: "Historical context and architectural details",
      display_standards: "Protected glass cases with description panels",
      remarks: "Scale models of historical buildings",
    },
    {
      id: 4,
      sno: 4,
      collection_type: "Construction Details & Joinery Samples",
      quality: "Very Good",
      labeling_standards: "Technical drawings with component names",
      display_standards: "Interactive displays with zoom features",
      remarks: "Wood joinery, steel connections, masonry details",
    },
    {
      id: 5,
      sno: 5,
      collection_type: "Sustainable Material Samples",
      quality: "Excellent",
      labeling_standards: "Sustainability rating and properties",
      display_standards: "Modern display with digital information",
      remarks: "Bamboo, recycled materials, green building products",
    },
  ]);

  const config = {
    title: "6.4 Material Museum (15)",
    totalMarks: 15,
    fields: [
      {
        name: "museum_info",
        label: "Provide information about the type and quality of the collection in the museum, along with details regarding the labeling and display standards maintained",
        marks: 15,
        type: "richText",
        placeholder: "Describe the material museum collection, its type, quality, labeling standards, and display standards...",
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
      const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
      const userInfoo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const currentOtherStaffId = otherStaffId || 
        userInfoo?.other_staff_id || 
        userInfo?.rawData?.other_staff_id || 
        userInfo?.user_id;

      const res = await newnbaCriteria6Service.getCriteria6_4_Data(cycle_sub_category_id, currentOtherStaffId);
      const rawResponse = res?.data || res || [];
      const d = Array.isArray(rawResponse) && rawResponse.length > 0 ? rawResponse[0] : rawResponse;

      console.log("🟢 Criterion6_4Form - Raw API Response:", rawResponse);
      console.log("🟢 Criterion6_4Form - Processed Data:", d);

      if (d.museum_data && Array.isArray(d.museum_data)) {
        setMuseumData(d.museum_data);
      }

      setInitialData({
        content: {
          museum_info: d.material_museum_description || d.museum_info || `
            <p><strong>Material Museum Overview:</strong></p>
            <p>The Department of Architecture maintains a comprehensive Material Museum that serves as an essential educational resource for students and faculty. The museum houses diverse collections that support the curriculum and provide hands-on learning experiences.</p>
            
            <p><strong>Type and Quality of Collection:</strong></p>
            <ul>
              <li><strong>Geological Samples:</strong> Collection of rocks, minerals, and soil samples representing different geological formations.</li>
              <li><strong>Building Material Samples:</strong> Comprehensive range of construction materials including bricks, tiles, concrete blocks, wood types, steel sections, and finishing materials.</li>
              <li><strong>Historical Architectural Models:</strong> Scale models of historical and contemporary buildings showing construction techniques.</li>
              <li><strong>Construction Details:</strong> Physical samples of joinery, connections, and building assembly details.</li>
              <li><strong>Sustainable Materials:</strong> Environmentally friendly building materials and innovative construction products.</li>
              <li><strong>Material Testing Specimens:</strong> Samples showing material behavior under different conditions.</li>
            </ul>
            
            <p><strong>Labeling Standards:</strong></p>
            <p>The museum maintains high labeling standards with each specimen clearly labeled with:</p>
            <ul>
              <li>Scientific/technical name of the material</li>
              <li>Common name and alternative names</li>
              <li>Material properties and specifications</li>
              <li>Source/location of collection</li>
              <li>Date of acquisition</li>
              <li>Catalog number for reference</li>
              <li>QR codes linking to digital database</li>
            </ul>
            
            <p><strong>Display Standards:</strong></p>
            <p>The museum follows international display standards:</p>
            <ul>
              <li>Proper lighting to show material texture and color accurately</li>
              <li>Climate control to preserve material integrity</li>
              <li>Logical organization by material type and application</li>
              <li>Interactive displays with digital information screens</li>
              <li>Safety measures to protect valuable specimens</li>
              <li>Accessibility features for all users</li>
              <li>Regular maintenance and cleaning schedule</li>
            </ul>
            
            <p>The museum is regularly updated with new acquisitions and serves as an important resource for design studios, material science courses, and research projects.</p>
          `,
        },
        material_museum_id: d.id || null,
        filesByField: {
          "museum_info": (d.material_museum_document || []).length > 0
            ? (d.material_museum_document || []).map((f, i) => ({
                id: `file-museum-${i}`,
                filename: f.file_name || f.name || "",
                s3Url: f.file_url || f.url || "",
                description: f.description || "",
                uploading: false
              }))
            : [{ id: `file-museum-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }]
        }
      });
    } catch (err) {
      console.warn("Load failed:", err);
      
      setInitialData({
        content: { museum_info: "" },
        material_museum_id: null,
        filesByField: {
          "museum_info": [{ id: `file-museum-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }]
        }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [cycle_sub_category_id, otherStaffId]);

  // Handlers for Museum Data Table
  const handleAddRow = () => {
    const newRow = {
      id: Date.now(),
      sno: museumData.length + 1,
      collection_type: "",
      quality: "Good",
      labeling_standards: "",
      display_standards: "",
      remarks: "",
    };
    setMuseumData([...museumData, newRow]);
  };

  const handleTableChange = (index, field, value) => {
    const updated = [...museumData];
    updated[index][field] = value;
    setMuseumData(updated);
  };

  const handleRemoveRow = (index) => {
    setMuseumData(museumData.filter((_, i) => i !== index));
  };

  // Calculate marks based on quality assessment
  const calculateMarks = () => {
    let marks = 0;
    
    // Collection type diversity (0-3 marks)
    const uniqueTypes = [...new Set(museumData.map(item => item.collection_type))].length;
    marks += Math.min(uniqueTypes * 0.6, 3);
    
    // Quality of collection (0-4 marks)
    const qualityScore = museumData.reduce((sum, item) => {
      const qualityValue = {
        "Excellent": 4,
        "Very Good": 3,
        "Good": 2,
        "Fair": 1,
        "Poor": 0
      }[item.quality] || 0;
      return sum + qualityValue;
    }, 0);
    marks += (qualityScore / museumData.length) * 0.8;
    
    // Labeling standards (0-4 marks)
    const labelingScore = museumData.filter(item => 
      item.labeling_standards && item.labeling_standards.length > 20
    ).length;
    marks += (labelingScore / museumData.length) * 4;
    
    // Display standards (0-4 marks)
    const displayScore = museumData.filter(item => 
      item.display_standards && item.display_standards.length > 20
    ).length;
    marks += (displayScore / museumData.length) * 4;
    
    return Math.min(Math.round(marks), 15);
  };

  const handleSave = async (formData) => {
    setSaving(true);

    try {
      const filesWithCategory = Object.keys(formData.filesByField || {}).flatMap(
        (field) =>
          (formData.filesByField[field] || []).map((file) => ({
            ...file,
            category: "Material Museum",
          }))
      );
      
      console.log("Files with category:", filesWithCategory);
      
      const material_museum_document = filesWithCategory
        .filter((f) => {
          const hasUrl = f.s3Url && f.s3Url.trim() !== "";
          console.log(`File ${f.filename}: hasUrl=${hasUrl}, s3Url=${f.s3Url}`);
          return hasUrl;
        })
        .map((f) => ({
          file_name: f.filename,
          file_url: f.s3Url,
          description: f.description || ""
        }));
      
      const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
      const userInfoo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      
      // Get currentUserStaffId correctly
      const currentUserStaffId = userInfoo?.other_staff_id || userInfo?.rawData?.other_staff_id;
      
      if (!currentUserStaffId) {
        console.error("❌ currentUserStaffId not found in user data");
        throw new Error("Current user staff ID not found. Please login again.");
      }
      
      const staffId = otherStaffId || 
        userInfoo?.other_staff_id || 
        userInfo?.rawData?.other_staff_id || 
        userInfo?.user_id;

      const payload = {
        other_staff_id: parseInt(staffId, 10),
        cycle_sub_category_id: parseInt(cycle_sub_category_id, 10),
        material_museum_description: formData.content.museum_info || "",
        material_museum_document
      };

      console.log("🟢 Saving payload:", payload);
      console.log("🟢 currentUserStaffId:", currentUserStaffId);

      if (initialData.material_museum_id) {
        // UPDATE existing record
        await newnbaCriteria6Service.putCriteria6_4_Data(initialData.material_museum_id, payload, currentUserStaffId);
      } else {
        // CREATE new record
        const res = await newnbaCriteria6Service.saveCriteria6_4_Data(payload, currentUserStaffId);
        if (res && res.id) {
          setInitialData(prev => ({ ...prev, material_museum_id: res.id }));
        }
      }
      
      setAlert(
        <SweetAlert
          success
          title="Saved!"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => setAlert(null)}
        >
          Criterion 6.4 saved successfully!
        </SweetAlert>
      );

      onSaveSuccess?.();
      loadData();
    } catch (err) {
      console.error("Save failed:", err);

      setAlert(
        <SweetAlert
          danger
          title="Error"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => setAlert(null)}
        >
          Failed to save Criterion 6.4. Error: {err.message || err}
        </SweetAlert>
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20">Loading Criterion 6.4...</div>;

  const totalMarks = calculateMarks();

  const handleDelete = async () => {
    if (!initialData.material_museum_id) {
      setAlert(
        <SweetAlert
          info
          title="Nothing to Delete"
          confirmBtnCssClass="btn-confirm"
          confirmBtnText="OK"
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
        cancelBtnText="Cancel"
        confirmBtnCssClass="btn-confirm"
        cancelBtnCssClass="btn-cancel"
        title="Are you sure?"
        onConfirm={async () => {
          setAlert(null);

          try {
            const res = await newnbaCriteria6Service.deleteCriteria6_4_Data(initialData.material_museum_id);

            let message = "Criterion 6.4 deleted successfully.";
            if (typeof res === "string") message = res;
            else if (res?.data) message = res.data;

            setAlert(
              <SweetAlert
                success
                title="Deleted!"
                confirmBtnCssClass="btn-confirm"
                confirmBtnText="OK"
                onConfirm={() => setAlert(null)}
              >
                {message}
              </SweetAlert>
            );

            setInitialData({
              content: {},
              filesByField: {},
              material_museum_id: null
            });
            setMuseumData([]);
            loadData();
            onSaveSuccess?.();
          } catch (err) {
            console.error("Delete failed:", err);

            setAlert(
              <SweetAlert
                danger
                title="Delete Failed"
                confirmBtnCssClass="btn-confirm"
                confirmBtnText="OK"
                onConfirm={() => setAlert(null)}
              >
                Error deleting the record
              </SweetAlert>
            );
          }
        }}
        onCancel={() => setAlert(null)}
      >
        You won't be able to revert this!
      </SweetAlert>
    );
  };

  return (
    <div>
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
          "museum_table_section": (
            <div className="space-y-8 mt-8">
              
              {/* Marks Summary */}
              <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Criterion 6.4 Assessment</h3>
                    <p className="text-gray-600 mt-1">Material Museum Collection</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-600">{totalMarks}</div>
                    <div className="text-sm text-gray-500">Out of 15</div>
                  </div>
                </div>
                
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-3 rounded border">
                    <div className="text-xs text-gray-500">Collection Types</div>
                    <div className="text-lg font-semibold">
                      {[...new Set(museumData.map(item => item.collection_type))].length}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded border">
                    <div className="text-xs text-gray-500">Total Items</div>
                    <div className="text-lg font-semibold">{museumData.length}</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded border">
                    <div className="text-xs text-gray-500">Excellent Quality</div>
                    <div className="text-lg font-semibold text-green-600">
                      {museumData.filter(item => item.quality === "Excellent").length}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded border">
                    <div className="text-xs text-gray-500">With Labels</div>
                    <div className="text-lg font-semibold">
                      {museumData.filter(item => item.labeling_standards?.length > 10).length}
                    </div>
                  </div>
                </div>
              </div>

              {/* Museum Collection Table */}
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <div className="bg-gray-800 text-white px-4 py-3">
                  <h4 className="font-bold text-lg">Material Museum Collection Details</h4>
                  <p className="text-sm text-gray-300 mt-1">Type and quality of collection, labeling and display standards</p>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">S.No</th>
                        <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">Type of Collection</th>
                        <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">Quality</th>
                        <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">Labeling Standards</th>
                        <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">Display Standards</th>
                        <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">Remarks</th>
                        {isEditable && (
                          <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">Action</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {museumData.map((row, index) => (
                        <tr key={row.id} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                            {row.sno}
                          </td>
                          <td className="border border-gray-300 px-4 py-3">
                            {isEditable ? (
                              <input
                                type="text"
                                value={row.collection_type}
                                onChange={(e) => handleTableChange(index, 'collection_type', e.target.value)}
                                className="w-full p-2 border rounded"
                                placeholder="e.g., Geological Samples, Building Materials"
                              />
                            ) : (
                              row.collection_type
                            )}
                          </td>
                          <td className="border border-gray-300 px-4 py-3">
                            {isEditable ? (
                              <select
                                value={row.quality}
                                onChange={(e) => handleTableChange(index, 'quality', e.target.value)}
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
                                row.quality === 'Excellent' ? 'text-green-600' :
                                row.quality === 'Very Good' ? 'text-blue-600' :
                                row.quality === 'Good' ? 'text-gray-600' :
                                'text-yellow-600'
                              }`}>
                                {row.quality}
                              </span>
                            )}
                          </td>
                          <td className="border border-gray-300 px-4 py-3">
                            {isEditable ? (
                              <textarea
                                value={row.labeling_standards}
                                onChange={(e) => handleTableChange(index, 'labeling_standards', e.target.value)}
                                className="w-full p-2 border rounded text-sm"
                                rows="2"
                                placeholder="Describe labeling standards..."
                              />
                            ) : (
                              <div className="text-sm">{row.labeling_standards}</div>
                            )}
                          </td>
                          <td className="border border-gray-300 px-4 py-3">
                            {isEditable ? (
                              <textarea
                                value={row.display_standards}
                                onChange={(e) => handleTableChange(index, 'display_standards', e.target.value)}
                                className="w-full p-2 border rounded text-sm"
                                rows="2"
                                placeholder="Describe display standards..."
                              />
                            ) : (
                              <div className="text-sm">{row.display_standards}</div>
                            )}
                          </td>
                          <td className="border border-gray-300 px-4 py-3">
                            {isEditable ? (
                              <input
                                type="text"
                                value={row.remarks}
                                onChange={(e) => handleTableChange(index, 'remarks', e.target.value)}
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
                                onClick={() => handleRemoveRow(index)}
                                className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm font-medium"
                              >
                                Remove
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                      {museumData.length === 0 && (
                        <tr>
                          <td colSpan={isEditable ? 7 : 6} className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                            No museum collection data available.
                          </td>
                        </tr>
                      )}
                    </tbody>
                    {isEditable && (
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td colSpan={isEditable ? 7 : 6} className="border border-gray-300 px-4 py-3">
                            <button
                              onClick={handleAddRow}
                              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
                            >
                              + Add Collection Type
                            </button>
                            <span className="ml-4 text-sm text-gray-600">
                              Total Collections: {museumData.length}
                            </span>
                          </td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>

              {/* NBA Assessment Guidelines */}
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">NBA Assessment Guidelines for Material Museum (15 Marks)</h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>• <strong>Type of Collection (0-4 marks):</strong> Diversity and relevance to architecture curriculum</p>
                      <p>• <strong>Quality of Collection (0-4 marks):</strong> Condition, preservation, and educational value</p>
                      <p>• <strong>Labeling Standards (0-4 marks):</strong> Accuracy, completeness, and clarity of labels</p>
                      <p>• <strong>Display Standards (0-3 marks):</strong> Organization, lighting, accessibility, and maintenance</p>
                      <p>• Museum should be actively used in teaching and learning</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Typical Architecture Museum Collections */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                <h5 className="font-bold text-gray-700 mb-3">Typical Material Museum Collections for Architecture Programs</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h6 className="font-medium text-blue-600 mb-2">Building Materials:</h6>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Natural stones (granite, marble, sandstone)</li>
                      <li>• Bricks (different types, sizes, compositions)</li>
                      <li>• Concrete (blocks, precast, reinforced samples)</li>
                      <li>• Wood (different species, finishes, treatments)</li>
                      <li>• Steel sections and connections</li>
                      <li>• Glass types and glazing systems</li>
                    </ul>
                  </div>
                  <div>
                    <h6 className="font-medium text-green-600 mb-2">Construction Details:</h6>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Wall sections (cavity, solid, composite)</li>
                      <li>• Roofing details (flat, pitched, green roofs)</li>
                      <li>• Joinery samples (wood, steel, concrete)</li>
                      <li>• Fenestration details (windows, doors)</li>
                      <li>• Foundation types and details</li>
                      <li>• Sustainable construction samples</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Labeling Standards Checklist */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                <h5 className="font-bold text-blue-700 mb-3">Recommended Labeling Standards Checklist</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h6 className="font-medium text-blue-600 mb-2">Essential Information:</h6>
                    <ul className="space-y-1 text-gray-700">
                      <li className="flex items-start">
                        <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Material name (scientific/common)</span>
                      </li>
                      <li className="flex items-start">
                        <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Physical and mechanical properties</span>
                      </li>
                      <li className="flex items-start">
                        <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Typical applications in architecture</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h6 className="font-medium text-blue-600 mb-2">Additional Details:</h6>
                    <ul className="space-y-1 text-gray-700">
                      <li className="flex items-start">
                        <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Source/geographical origin</span>
                      </li>
                      <li className="flex items-start">
                        <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Date of acquisition and catalog number</span>
                      </li>
                      <li className="flex items-start">
                        <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Sustainability/environmental impact</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

            </div>
          ),
        }}
        onSave={handleSave}
      />

      {alert}
    </div>
  );
};

export default Criterion6_4Form;   