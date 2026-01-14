// src/screens/pages/NEWNBA/Components/Criteria1/Criterion6_5Form.jsx

import React, { useState, useEffect } from "react";
import GenericCriteriaForm1_2 from "../GenericCriteriaForm1_2";
import { newnbaCriteria1Service } from "../../Services/NewNBA-Criteria1.service";
import { toast } from "react-toastify";
import SweetAlert from 'react-bootstrap-sweetalert';

const Criterion6_5Form = ({
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
    material_museum_id: null,
  });
  const [cardLoading, setCardLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  
  // Museum collection data
  const [museumCollection, setMuseumCollection] = useState([]);
  const [qualityStandards, setQualityStandards] = useState({
    collection_diversity: 0,
    specimen_quality: 0,
    labeling_standards: 0,
    display_standards: 0,
    maintenance_standards: 0,
    documentation_quality: 0
  });

  const config = {
    title: "6.4 Material Museum (15)",
    totalMarks: 15,
    fields: [
      {
        name: "museum_description",
        label: "Material Museum Description",
        marks: 5,
        type: "richText",
        placeholder: "Describe the material museum, its purpose, scope, and significance...",
      },
      {
        name: "standards_description",
        label: "Labeling and Display Standards",
        marks: 10,
        type: "richText",
        placeholder: "Describe the labeling, display, cataloging, and maintenance standards...",
      },
    ]
  };

  // Calculate marks based on quality standards
  const calculateMarks = () => {
    // Average of all quality metrics
    const totalScore = Object.values(qualityStandards).reduce((sum, score) => sum + score, 0);
    const averageScore = totalScore / Object.keys(qualityStandards).length;
    
    // Convert to 15 marks scale (0-100 to 0-15)
    const marks = Math.round((averageScore / 100) * 15);
    
    return {
      collectionMarks: Math.round((qualityStandards.collection_diversity / 100) * 3),
      specimenMarks: Math.round((qualityStandards.specimen_quality / 100) * 3),
      labelingMarks: Math.round((qualityStandards.labeling_standards / 100) * 3),
      displayMarks: Math.round((qualityStandards.display_standards / 100) * 3),
      maintenanceMarks: Math.round((qualityStandards.maintenance_standards / 100) * 3),
      totalMarks: marks
    };
  };

  // Load data from API function
  const loadData = async () => {
    const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
    const userInfoo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const currentOtherStaffId = otherStaffId || userInfo?.rawData?.other_staff_id || userInfo.user_id || userInfoo?.other_staff_id;
    
    console.log("🟠 Criterion6_5Form - useEffect triggered:");
    console.log("  - cycle_sub_category_id:", cycle_sub_category_id);
    console.log("  - currentOtherStaffId:", currentOtherStaffId);

    if (!cycle_sub_category_id) {
      console.log("❌ Criterion6_5Form: cycle_sub_category_id is missing, exiting");
      setLoading(false);
      return;
    }

    let d = {};
    setLoading(true);

    try {
      const res = await newnbaCriteria1Service.getCriteria6_4_Data?.(cycle_sub_category_id, currentOtherStaffId) || { data: {} };
      const rawResponse = res?.data || res || {};
      d = rawResponse;
      console.log("🟢 Loaded Criterion 6.4 data:", d);
    } catch (err) {
      console.error("❌ Failed to load Criterion 6.4 data:", err);
      toast.error("Failed to load Criterion 6.4 data");
      d = {};
    }

    // Parse museum collection
    if (d.museum_collection && Array.isArray(d.museum_collection)) {
      setMuseumCollection(d.museum_collection);
    } else {
      // Default sample data
      setMuseumCollection([
        {
          id: 1,
          item_name: "Igneous Rock Collection",
          item_type: "Geological Specimen",
          category: "Geology",
          quantity: 25,
          quality_rating: "Excellent",
          labeling_standard: "Scientific Nomenclature",
          display_method: "Glass Display Case",
          acquisition_year: "2020",
          source: "Field Collection",
          catalog_number: "GEO-001",
          remarks: "Well-preserved specimens with detailed documentation"
        },
        {
          id: 2,
          item_name: "Electronic Circuit Board Collection",
          item_type: "Engineering Model",
          category: "Electronics",
          quantity: 15,
          quality_rating: "Very Good",
          labeling_standard: "Technical Specifications",
          display_method: "Open Shelf Display",
          acquisition_year: "2021",
          source: "Industry Donation",
          catalog_number: "ELEC-001",
          remarks: "Functional models with working demonstrations"
        }
      ]);
    }

    // Parse quality standards
    if (d.quality_standards) {
      setQualityStandards(d.quality_standards);
    }

    setInitialData({
      content: {
        museum_description: d.museum_description || "The Material Museum serves as a comprehensive repository of physical specimens, models, and materials relevant to the academic disciplines. It provides students and faculty with hands-on learning opportunities and serves as a valuable resource for practical understanding of theoretical concepts. The museum houses diverse collections across various domains including geological samples, engineering models, biological specimens, and historical artifacts.",
        standards_description: d.standards_description || "The museum maintains high standards for labeling, display, and documentation. Each specimen is properly labeled with scientific names, technical specifications, source information, and relevant details. Display cases are well-organized with proper lighting, security, and environmental controls. A comprehensive cataloging system ensures easy retrieval and reference, while regular maintenance preserves the quality and educational value of the collections.",
      },
      tableData: {},
      material_museum_id: d.material_museum_id || null,
      filesByField: {
        "catalog_documents": (d.catalog_documents || []).length > 0 
          ? (d.catalog_documents || []).map((f, i) => ({
              id: `file-catalog-${i}`,
              name: f.document_name || f.name || "",
              filename: f.document_name || f.name || "",
              url: f.document_url || f.url || "",
              s3Url: f.document_url || f.url || "",
              description: f.description || "Museum Catalog",
              uploading: false
            }))
          : [{ id: `file-catalog-0`, description: "Complete Museum Catalog", file: null, filename: "", s3Url: "", uploading: false }],
        "photographs": (d.photograph_documents || []).length > 0 
          ? (d.photograph_documents || []).map((f, i) => ({
              id: `file-photo-${i}`,
              name: f.document_name || f.name || "",
              filename: f.document_name || f.name || "",
              url: f.document_url || f.url || "",
              s3Url: f.document_url || f.url || "",
              description: f.description || "Museum Display Photographs",
              uploading: false
            }))
          : [{ id: `file-photo-0`, description: "Museum Display Photos", file: null, filename: "", s3Url: "", uploading: false }],
        "policy_documents": (d.policy_documents || []).length > 0 
          ? (d.policy_documents || []).map((f, i) => ({
              id: `file-policy-${i}`,
              name: f.document_name || f.name || "",
              filename: f.document_name || f.name || "",
              url: f.document_url || f.url || "",
              s3Url: f.document_url || f.url || "",
              description: f.description || "Museum Policy Document",
              uploading: false
            }))
          : [{ id: `file-policy-0`, description: "Museum Management Policy", file: null, filename: "", s3Url: "", uploading: false }],
      }
    });

    console.log("✅ Criterion6_5Form: Data loaded and set successfully");
    setLoading(false);
  };

  // Load contributors data for card view
  const loadContributorsData = async () => {
    if (!showCardView || !cycle_sub_category_id) return;
    
    setCardLoading(true);
    try {
      const contributorsResponse = await newnbaCriteria1Service.getAllCriteria6_4_Data?.(cycle_sub_category_id);
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
    if (!initialData?.material_museum_id) {
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
            await newnbaCriteria1Service.deleteCriteria6_4_Data?.(initialData.material_museum_id);
            
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
                Criterion 6.4 data has been deleted successfully.
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
        This will permanently delete all Criterion 6.4 data!
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

  // Handle quality standards changes
  const handleQualityStandardChange = (metric, value) => {
    setQualityStandards(prev => ({
      ...prev,
      [metric]: parseInt(value) || 0
    }));
  };

  // Add new museum item
  const handleAddItem = () => {
    const newItem = {
      id: Date.now(),
      item_name: "",
      item_type: "",
      category: "",
      quantity: 1,
      quality_rating: "Good",
      labeling_standard: "Standard",
      display_method: "",
      acquisition_year: new Date().getFullYear().toString(),
      source: "",
      catalog_number: "",
      remarks: ""
    };
    setMuseumCollection([...museumCollection, newItem]);
  };

  const handleItemChange = (index, field, value) => {
    const newList = [...museumCollection];
    newList[index][field] = value;
    setMuseumCollection(newList);
  };

  const handleRemoveItem = (index) => {
    const newList = museumCollection.filter((_, i) => i !== index);
    setMuseumCollection(newList);
  };

  const handleSave = async (formData) => {
    const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
    const userInfoo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const currentOtherStaffId = otherStaffId || userInfo?.rawData?.other_staff_id || userInfo.user_id || userInfoo?.other_staff_id;
    
    console.log("🟠 Criterion6_5Form handleSave called");
    setSaving(true);

    try {
      // Transform filesByField → flat files with correct category
      const filesWithCategory = Object.keys(formData.filesByField || {}).flatMap(fieldName => {
        return (formData.filesByField[fieldName] || []).map(file => {
          let category = "Other";
          if (fieldName === "catalog_documents") category = "Catalog Documents";
          if (fieldName === "photographs") category = "Photographs";
          if (fieldName === "policy_documents") category = "Policy Documents";
          return { ...file, category };
        });
      });

      const marks = calculateMarks();

      const payload = {
        cycle_sub_category_id,
        other_staff_id: currentOtherStaffId,
        program_id: programId,
        museum_description: formData.content.museum_description || "",
        standards_description: formData.content.standards_description || "",
        museum_collection: museumCollection,
        quality_standards: qualityStandards,
        calculated_marks: marks,
        total_items: museumCollection.length,
        total_categories: [...new Set(museumCollection.map(item => item.category))].length,
        catalog_documents: filesWithCategory
          .filter(f => f.category === "Catalog Documents" && (f.url || f.s3Url))
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
        policy_documents: filesWithCategory
          .filter(f => f.category === "Policy Documents" && (f.url || f.s3Url))
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
      if (initialData?.material_museum_id) {
        await newnbaCriteria1Service.putCriteria6_4_Data?.(
          initialData.material_museum_id,
          currentOtherStaffId,
          payload
        );
      } else {
        await newnbaCriteria1Service.saveCriteria6_4_Data?.(currentOtherStaffId, payload);
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
          Criterion 6.4 saved successfully!
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
        Loading Criterion 6.4..
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
                    <p className="text-sm text-gray-600">Total Items: {card.total_items || 0}</p>
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
          "museum_collection_section": (
            <div className="space-y-6">
              {/* Marks Calculation Summary */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h5 className="font-semibold text-blue-700">Marks Calculation (0-15)</h5>
                    <p className="text-sm text-gray-700">
                      Collection Quality: <span className="font-bold">{marks.collectionMarks}/3</span> | 
                      Labeling: <span className="font-bold">{marks.labelingMarks}/3</span> |
                      Display: <span className="font-bold">{marks.displayMarks}/3</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-700">Total: {marks.totalMarks}/15</p>
                    <p className="text-xs text-gray-600">
                      Based on quality assessment below
                    </p>
                  </div>
                </div>
              </div>

              {/* Quality Assessment Metrics */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-[#2163c1] text-white px-4 py-2">
                  <h5 className="font-semibold">Material Museum Quality Assessment</h5>
                </div>
                <div className="p-4 bg-gray-50">
                  <div className="space-y-4">
                    {Object.entries({
                      collection_diversity: "Collection Diversity & Scope",
                      specimen_quality: "Specimen/Item Quality",
                      labeling_standards: "Labeling Standards",
                      display_standards: "Display Standards",
                      maintenance_standards: "Maintenance & Preservation",
                      documentation_quality: "Documentation & Cataloging"
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
                              value={qualityStandards[key]}
                              onChange={(e) => handleQualityStandardChange(key, e.target.value)}
                              className="w-full"
                              disabled={!isEditable}
                            />
                            <div className="w-16 text-center">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={qualityStandards[key]}
                                onChange={(e) => handleQualityStandardChange(key, e.target.value)}
                                className="w-full p-1 border rounded text-center text-sm"
                                disabled={!isEditable}
                              />
                            </div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Poor</span>
                            <span>Fair</span>
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

              {/* Museum Collection Inventory Table */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-[#2163c1] text-white px-4 py-2 flex justify-between items-center">
                  <h5 className="font-semibold">Museum Collection Inventory</h5>
                  {isEditable && (
                    <button
                      onClick={handleAddItem}
                      className="px-3 py-1 bg-white text-blue-600 rounded text-sm font-medium hover:bg-gray-100"
                    >
                      + Add Item
                    </button>
                  )}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border text-sm">
                    <thead className="bg-blue-50">
                      <tr>
                        <th className="border px-3 py-2">Item Name</th>
                        <th className="border px-3 py-2 w-32">Item Type</th>
                        <th className="border px-3 py-2 w-28">Category</th>
                        <th className="border px-3 py-2 w-20">Quantity</th>
                        <th className="border px-3 py-2 w-28">Quality Rating</th>
                        <th className="border px-3 py-2 w-36">Labeling Standard</th>
                        <th className="border px-3 py-2 w-36">Display Method</th>
                        <th className="border px-3 py-2 w-24">Year</th>
                        <th className="border px-3 py-2">Source</th>
                        {isEditable && <th className="border px-3 py-2 w-20">Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {museumCollection.length > 0 ? (
                        museumCollection.map((item, idx) => (
                          <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                            <td className="border px-3 py-2">
                              <input
                                type="text"
                                value={item.item_name}
                                onChange={(e) => handleItemChange(idx, 'item_name', e.target.value)}
                                className="w-full p-1 border rounded"
                                disabled={!isEditable}
                                placeholder="Item Name"
                              />
                            </td>
                            <td className="border px-3 py-2">
                              <select
                                value={item.item_type}
                                onChange={(e) => handleItemChange(idx, 'item_type', e.target.value)}
                                className="w-full p-1 border rounded text-sm"
                                disabled={!isEditable}
                              >
                                <option value="">Select Type</option>
                                <option value="Geological Specimen">Geological Specimen</option>
                                <option value="Biological Specimen">Biological Specimen</option>
                                <option value="Engineering Model">Engineering Model</option>
                                <option value="Historical Artifact">Historical Artifact</option>
                                <option value="Scientific Instrument">Scientific Instrument</option>
                                <option value="Circuit Board">Circuit Board</option>
                                <option value="Material Sample">Material Sample</option>
                                <option value="Chemical Compound">Chemical Compound</option>
                                <option value="Textile Sample">Textile Sample</option>
                                <option value="Construction Material">Construction Material</option>
                              </select>
                            </td>
                            <td className="border px-3 py-2">
                              <select
                                value={item.category}
                                onChange={(e) => handleItemChange(idx, 'category', e.target.value)}
                                className="w-full p-1 border rounded text-sm"
                                disabled={!isEditable}
                              >
                                <option value="">Select Category</option>
                                <option value="Geology">Geology</option>
                                <option value="Biology">Biology</option>
                                <option value="Chemistry">Chemistry</option>
                                <option value="Physics">Physics</option>
                                <option value="Electronics">Electronics</option>
                                <option value="Mechanical">Mechanical</option>
                                <option value="Civil">Civil</option>
                                <option value="Materials Science">Materials Science</option>
                                <option value="Textile">Textile</option>
                                <option value="Architecture">Architecture</option>
                              </select>
                            </td>
                            <td className="border px-3 py-2">
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                                className="w-full p-1 border rounded text-center"
                                min="1"
                                disabled={!isEditable}
                              />
                            </td>
                            <td className="border px-3 py-2">
                              <select
                                value={item.quality_rating}
                                onChange={(e) => handleItemChange(idx, 'quality_rating', e.target.value)}
                                className="w-full p-1 border rounded text-sm"
                                disabled={!isEditable}
                              >
                                <option value="Excellent">Excellent</option>
                                <option value="Very Good">Very Good</option>
                                <option value="Good">Good</option>
                                <option value="Fair">Fair</option>
                                <option value="Poor">Poor</option>
                              </select>
                            </td>
                            <td className="border px-3 py-2">
                              <select
                                value={item.labeling_standard}
                                onChange={(e) => handleItemChange(idx, 'labeling_standard', e.target.value)}
                                className="w-full p-1 border rounded text-sm"
                                disabled={!isEditable}
                              >
                                <option value="Scientific Nomenclature">Scientific Nomenclature</option>
                                <option value="Technical Specifications">Technical Specifications</option>
                                <option value="Standard Labeling">Standard Labeling</option>
                                <option value="Basic Labeling">Basic Labeling</option>
                                <option value="Custom Labeling">Custom Labeling</option>
                              </select>
                            </td>
                            <td className="border px-3 py-2">
                              <select
                                value={item.display_method}
                                onChange={(e) => handleItemChange(idx, 'display_method', e.target.value)}
                                className="w-full p-1 border rounded text-sm"
                                disabled={!isEditable}
                              >
                                <option value="">Select Display</option>
                                <option value="Glass Display Case">Glass Display Case</option>
                                <option value="Open Shelf Display">Open Shelf Display</option>
                                <option value="Wall Mounted">Wall Mounted</option>
                                <option value="Interactive Display">Interactive Display</option>
                                <option value="Rotating Exhibit">Rotating Exhibit</option>
                                <option value="Digital Display">Digital Display</option>
                                <option value="Protected Cabinet">Protected Cabinet</option>
                              </select>
                            </td>
                            <td className="border px-3 py-2">
                              <input
                                type="text"
                                value={item.acquisition_year}
                                onChange={(e) => handleItemChange(idx, 'acquisition_year', e.target.value)}
                                className="w-full p-1 border rounded text-center"
                                disabled={!isEditable}
                                placeholder="YYYY"
                              />
                            </td>
                            <td className="border px-3 py-2">
                              <select
                                value={item.source}
                                onChange={(e) => handleItemChange(idx, 'source', e.target.value)}
                                className="w-full p-1 border rounded text-sm"
                                disabled={!isEditable}
                              >
                                <option value="">Select Source</option>
                                <option value="Field Collection">Field Collection</option>
                                <option value="Industry Donation">Industry Donation</option>
                                <option value="Research Project">Research Project</option>
                                <option value="Purchased">Purchased</option>
                                <option value="Alumni Donation">Alumni Donation</option>
                                <option value="Government Grant">Government Grant</option>
                                <option value="In-house Development">In-house Development</option>
                              </select>
                            </td>
                            {isEditable && (
                              <td className="border px-3 py-2 text-center">
                                <button
                                  onClick={() => handleRemoveItem(idx)}
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
                          <td colSpan={isEditable ? 10 : 9} className="border px-3 py-8 text-center text-gray-500">
                            No museum items added. Click "Add Item" to add collection details.
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot className="bg-gray-100">
                      <tr>
                        <td className="border px-3 py-2 font-medium">Collection Summary</td>
                        <td className="border px-3 py-2 text-center">
                          {[...new Set(museumCollection.map(item => item.item_type))].length} types
                        </td>
                        <td className="border px-3 py-2 text-center">
                          {[...new Set(museumCollection.map(item => item.category))].length} categories
                        </td>
                        <td className="border px-3 py-2 text-center font-bold">
                          {museumCollection.reduce((sum, item) => sum + (item.quantity || 0), 0)} items
                        </td>
                        <td className="border px-3 py-2 text-center">
                          {museumCollection.filter(item => item.quality_rating === 'Excellent' || item.quality_rating === 'Very Good').length} in good condition
                        </td>
                        <td className="border px-3 py-2 text-center">
                          {museumCollection.filter(item => item.labeling_standard === 'Scientific Nomenclature' || item.labeling_standard === 'Technical Specifications').length} with proper labeling
                        </td>
                        <td colSpan={isEditable ? 4 : 3} className="border px-3 py-2"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Labeling Standards Guidelines */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-green-600 text-white px-4 py-2">
                  <h5 className="font-semibold">Labeling Standards Guidelines</h5>
                </div>
                <div className="p-4 bg-green-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h6 className="font-medium text-green-700 mb-2">Essential Label Information:</h6>
                      <ul className="space-y-1 text-sm text-gray-700">
                        <li className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                          <span>Scientific/Technical Name</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                          <span>Common Name (if applicable)</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                          <span>Date of Acquisition</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                          <span>Source/Location</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                          <span>Catalog Number</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h6 className="font-medium text-green-700 mb-2">Display Requirements:</h6>
                      <ul className="space-y-1 text-sm text-gray-700">
                        <li className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                          <span>Proper lighting for visibility</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                          <span>Climate control for preservation</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                          <span>Security measures against theft/damage</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                          <span>Accessibility for study and research</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                          <span>Educational descriptions for visitors</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Collection Categories */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h6 className="font-semibold text-gray-700 mb-3">Typical Material Museum Collection Categories:</h6>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-white p-3 rounded border">
                    <h6 className="font-medium text-blue-600 mb-1">Geological</h6>
                    <p className="text-xs text-gray-600">Rocks, minerals, fossils, soil samples</p>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <h6 className="font-medium text-green-600 mb-1">Biological</h6>
                    <p className="text-xs text-gray-600">Plant specimens, animal skeletons, preserved samples</p>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <h6 className="font-medium text-purple-600 mb-1">Engineering</h6>
                    <p className="text-xs text-gray-600">Models, prototypes, machine parts, tools</p>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <h6 className="font-medium text-orange-600 mb-1">Materials Science</h6>
                    <p className="text-xs text-gray-600">Metals, alloys, polymers, composites, ceramics</p>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <h6 className="font-medium text-teal-600 mb-1">Electronics</h6>
                    <p className="text-xs text-gray-600">Circuit boards, components, historical devices</p>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <h6 className="font-medium text-pink-600 mb-1">Historical</h6>
                    <p className="text-xs text-gray-600">Artifacts, instruments, documents, photographs</p>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <h6 className="font-medium text-indigo-600 mb-1">Chemical</h6>
                    <p className="text-xs text-gray-600">Compounds, elements, reaction products</p>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <h6 className="font-medium text-yellow-600 mb-1">Textile</h6>
                    <p className="text-xs text-gray-600">Fabric samples, fibers, clothing materials</p>
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

export default Criterion6_5Form;