// src/screens/pages/NEWNBA/Components/Criteria3/Criterion3_8Form.jsx

import React, { useState, useEffect, useCallback } from "react";
import GenericCriteriaForm3_8 from "./GenericCriteriaForm3_8";
import { newnbaCriteria3Service } from "../../Services/NewNBA-Criteria3.service";
import SweetAlert from "react-bootstrap-sweetalert";
import { getAllProfileFlags } from "@/_services/adminProfileUtils";

const Criterion3_8Form = ({
  cycle_sub_category_id,
  isEditable = true,
  onSaveSuccess,
  otherStaffId = null,
  showCardView = false,
  onCardClick = null,
  onStatusChange = null,
  cardData = [],
  programId = null,
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [attainmentPoId, setAttainmentPoId] = useState(null);
  const [cardLoading, setCardLoading] = useState(false);
  const [initialData, setInitialData] = useState({
    content: {},
    tableData: {},
    filesByField: {},
  });
  const [alert, setAlert] = useState(null);
  const [isContributor, setIsContributor] = useState(false);

  const config = {
    title: "3.8. Attainment of Program Outcomes and Program Specific Outcomes",
    totalMarks: 25,
    fields: [
      {
        name: "3.8.1",
        label: "3.8.1 Assessment Tools & Processes for Program Outcome Evaluation",
        marks: 5,
        type: "textarea",
        hasFile: true,
      },
      {
        name: "3.8.2",
        label: "3.8.2 Record of Program Outcome Attainment",
        marks: 20,
        hasTable: true,
        hasFile: true,
        tableConfig: {
          type: "program-outcome-attainment",
          title: "Table 3.8.2.1: Program Outcome Attainment Record",
          description: "Record the attainment of program outcomes with respect to set attainment levels.",
          addRowLabel: "Add Program Outcome Record",
          columns: [
            { field: "po_code", header: "PO Code", placeholder: "PO1", width: "w-32" },
            { field: "direct_attainment", header: "Direct (%)", placeholder: "78", width: "w-24" },
            { field: "indirect_attainment", header: "Indirect (%)", placeholder: "82", width: "w-24" },
            { field: "overall_attainment", header: "Overall (%)", placeholder: "80", width: "w-24" },
            { field: "attainment_level", header: "Attainment Level", placeholder: "3", width: "w-24", type: "select", options: [
              { value: "1", label: "Level 1" },
              { value: "2", label: "Level 2" },
              { value: "3", label: "Level 3" },
            ]},
          ],
        },
      },
    ],
  };

  const loadData = useCallback(async () => {
    if (!cycle_sub_category_id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const profileFlags = getAllProfileFlags();
      const userIsContributor = profileFlags?.isContributor || false;
      setIsContributor(userIsContributor);
      
      const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
      const userInfoo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const currentOtherStaffId = otherStaffId || userInfo?.rawData?.other_staff_id || userInfo.user_id || userInfoo?.other_staff_id;
      
      console.log("🟠 Criterion3_8Form - Loading data:");
      console.log("  - cycle_sub_category_id:", cycle_sub_category_id);
      console.log("  - currentOtherStaffId:", currentOtherStaffId);
      
      const res = await newnbaCriteria3Service.getCriteria3_8_Data(cycle_sub_category_id, currentOtherStaffId);
      
      const rawResponse = res?.data || res || [];
      const d = Array.isArray(rawResponse) && rawResponse.length > 0 ? rawResponse[0] : rawResponse;
      
      console.log("🟢 Criterion3_8Form - Raw API Response:", rawResponse);
      console.log("🟢 Criterion3_8Form - Processed Data:", d);

      setAttainmentPoId(d.attainment_po_id || null);

      setInitialData({
        content: {
          "3.8.1": ""
        },
        tableData: {
          "3.8.2": (d.po_pso_attainment || []).map((r, index) => ({
            id: `row-${Date.now()}-${index}`,
            po_code: r.po_code || "",
            direct_attainment: r.direct_attainment || "",
            indirect_attainment: r.indirect_attainment || "",
            overall_attainment: r.overall_attainment || "",
            attainment_level: r.attainment_level || "",
          })) || [{ po_code: "", direct_attainment: "", indirect_attainment: "", overall_attainment: "", attainment_level: "" }],
        },
        filesByField: {
          "3.8": (d.po_pso_attainment_documents || []).length > 0
            ? (d.po_pso_attainment_documents || []).map((f, i) => ({
                id: `file-3.8-${i}`,
                filename: f.file_name || f.name || "",
                s3Url: f.file_url || f.url || "",
                description: f.description || f.file_name || f.name || "",
                uploading: false
              }))
            : [{ id: `file-3.8-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }]
        }
      });

    } catch (err) {
      console.warn("❌ Criterion3_8Form - API failed or returned 404, showing blank form", err);
      setAttainmentPoId(null);
      setInitialData({
        content: { "3.8.1": "" },
        tableData: {
          "3.8.2": [{ po_code: "", direct_attainment: "", indirect_attainment: "", overall_attainment: "", attainment_level: "" }]
        },
        filesByField: {
          "3.8": [{ id: `file-3.8-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }]
        }
      });
    } finally {
      setLoading(false);
    }
  }, [cycle_sub_category_id, otherStaffId]);

  const loadContributorsData = async () => {
    if (!showCardView || !cycle_sub_category_id) return;
    
    setCardLoading(true);
    try {
      const contributorsResponse = await newnbaCriteria3Service.getallCardDetails3_8?.(cycle_sub_category_id);
      if (onStatusChange) {
        onStatusChange(contributorsResponse || []);
      }
    } catch (err) {
      console.error("Failed to load contributors data:", err);
    } finally {
      setCardLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    if (showCardView) {
      loadContributorsData();
    }
  }, [loadData, showCardView]);

  const handleSave = async (formData) => {
    setSaving(true);
    console.log(formData);
    try {
      const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
      const userInfoo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const staffId = otherStaffId || userInfo?.rawData?.other_staff_id || userInfo.user_id || userInfoo?.other_staff_id;

      // Extract attainment data from formData or use existing data
      const attainmentData = formData.attainmentData || {};
      const poAttainmentData = [];
      
      // Convert attainment data to po_pso_attainment format
      if (attainmentData.overall_attainments) {
        Object.entries(attainmentData.overall_attainments).forEach(([poCode, overallValue]) => {
          poAttainmentData.push({
            po_code: poCode,
            direct_attainment: attainmentData.direct_attainments?.[poCode]?.toString() || "0",
            indirect_attainment: attainmentData.indirect_attainments?.[poCode]?.toString() || "0",
            overall_attainment: overallValue.toString(),
            attainment_level: overallValue >= 70 ? "3" : overallValue >= 50 ? "2" : "1"
          });
        });
      }

      const payload = {
        other_staff_id: staffId,
        cycle_sub_category_id,
        po_pso_attainment: poAttainmentData.length > 0 ? poAttainmentData : (formData.tableData?.["3.8.2"] || []),
        po_pso_attainment_documents: (formData.filesByField?.["3.8"] || [])
          .filter(f => f.s3Url && f.filename)
          .map(f => ({
            file_name: f.filename,
            file_url: f.s3Url,
            description: f.description || f.filename
          })),
        overall_po_pso: [],
        overall_po_pso_documents: [],
        indirect_assessment: [],
        indirect_assessment_documents: []
      };
      
      console.log("🟠 Criterion3_8Form - Save payload:", payload);

      if (attainmentPoId) {
        console.log("🟠 Updating existing record with ID:", attainmentPoId);
        await newnbaCriteria3Service.putCriteria3_8_Data(attainmentPoId, payload);
      } else {
        console.log("🟠 Creating new record");
        await newnbaCriteria3Service.saveCriteria3_8_Data(payload);
      }

      setAlert(
        <SweetAlert
          success
          title="Saved!"
          confirmBtnText="OK"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => setAlert(null)}
        >
          Criterion 3.8 saved successfully
        </SweetAlert>
      );

      await loadData();
      onSaveSuccess?.();

    } catch (err) {
      console.error(err);
      setAlert(
        <SweetAlert
          danger
          title="Save Failed"
          confirmBtnText="OK"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => setAlert(null)}
        >
          An error occurred while saving
        </SweetAlert>
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!attainmentPoId) {
      setAlert(
        <SweetAlert
          info
          title="Nothing to Delete"
          confirmBtnText="OK"
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
        cancelBtnText="Cancel"
        confirmBtnCssClass="btn-confirm"
        cancelBtnCssClass="btn-cancel"
        title="Are you sure?"
        onConfirm={async () => {
          setAlert(null);

          try {
            await newnbaCriteria3Service.deleteCriteria3_8_Data(attainmentPoId);

            setAlert(
              <SweetAlert
                success
                title="Deleted!"
                confirmBtnCssClass="btn-confirm"
                confirmBtnText="OK"
                onConfirm={() => setAlert(null)}
              >
                Program Outcomes Attainment record deleted successfully.
              </SweetAlert>
            );

            await loadData();
            setAttainmentPoId(null);
            onSaveSuccess?.();

          } catch (err) {
            console.error(err);
            setAlert(
              <SweetAlert
                danger
                title="Delete Failed"
                confirmBtnCssClass="btn-confirm"
                confirmBtnText="OK"
                onConfirm={() => setAlert(null)}
              >
                An error occurred while deleting
              </SweetAlert>
            );
          }
        }}
        onCancel={() => setAlert(null)}
      >
        You won't be able to revert this deletion!
      </SweetAlert>
    );
  };

  if (loading || (showCardView && cardLoading)) {
    return (
      <div className="flex justify-center py-20 text-xl font-medium text-indigo-600">
        Loading Criterion 3.8...
      </div>
    );
  }

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
      <GenericCriteriaForm3_8
        cycle_sub_category_id={cycle_sub_category_id}
        programId={programId}
        isEditable={isEditable}
        onSaveSuccess={onSaveSuccess}
        saving={saving}
        onSave={handleSave}
        onDelete={handleDelete}
        hasData={!!attainmentPoId}
        initialData={initialData}
      />
      {alert}
    </>
  );
};

export default Criterion3_8Form;