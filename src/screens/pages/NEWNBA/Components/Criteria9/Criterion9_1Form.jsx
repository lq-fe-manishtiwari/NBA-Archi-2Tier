import React, { useState, useEffect, useCallback } from "react";
import GenericCriteriaForm from "../GenericCriteriaForm";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import StatusBadge from "../StatusBadge";
import SweetAlert from "react-bootstrap-sweetalert";

// Import the new service
import { newnbaCriteria9Service } from "../../Services/NewNBA-Criteria9.service";
import { getAllProfileFlags } from "@/_services/adminProfileUtils";

const Criterion9_1Form = ({
  nba_accredited_program_id,
  nba_criteria_sub_level2_id,
  nba_contributor_allocation_id,
  isContributorEditable = true,
  completed = false,
  onSaveSuccess,
  otherStaffId = null,
  editMode = false,
  fysfr_id: propFysfrId = null,
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fysfrId, setFysfrId] = useState(null);
  const [initialData, setInitialData] = useState({
    content: {},
    tableData: [],
    filesByField: {},
  });
  const [approvalStatus, setApprovalStatus] = useState(null);
  const [userRole, setUserRole] = useState({});
  const [contributorName, setContributorName] = useState("");
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    setUserRole(userInfo);
  }, []);

  const config = {
    title: "9.1. Governance, Leadership and Management (40)",
    totalMarks: 40,
    fields: [
      {
        name: "governing_body",
        label: "9.1.1 Governing Body, Administrative Setup, Functions of Various Bodies, Service Rules Procedures, Recruitment and Promotional Policies (10)",
        marks: 10,
        type: "textarea",
        rows: 6,
        placeholder: "Describe governing body, administrative setup, functions of various bodies, service rules procedures, recruitment and promotional policies..."
      },
      {
        name: "education_policy",
        label: "9.1.2 Strategies for Implementation of Education Policy (5)",
        marks: 5,
        type: "textarea",
        rows: 4,
        placeholder: "Describe strategies for implementation of education policy..."
      },
      {
        name: "sdg_initiatives",
        label: "9.1.3 Policy and Implementation Initiatives on Sustainable Development Goals (SDG) (5)",
        marks: 5,
        type: "textarea",
        rows: 4,
        placeholder: "Describe policy and implementation initiatives on sustainable development goals..."
      },
      {
        name: "decentralization",
        label: "9.1.4 Decentralization in Working and Grievance Redressal Mechanism (5)",
        marks: 5,
        type: "textarea",
        rows: 4,
        placeholder: "Describe decentralization in working and grievance redressal mechanism..."
      },
      {
        name: "financial_powers",
        label: "9.1.5 Delegation of Financial Powers (10)",
        marks: 10,
        type: "textarea",
        rows: 6,
        placeholder: "Describe delegation of financial powers..."
      },
      {
        name: "transparency",
        label: "9.1.6 Transparency and Availability of Correct/Unambiguous Information in Public Domain (5)",
        marks: 5,
        type: "textarea",
        rows: 4,
        placeholder: "Describe transparency and availability of correct/unambiguous information in public domain..."
      }
    ]
  };

  // ---------------- LOAD DATA ----------------
  const loadData = useCallback(async () => {
    if (!nba_criteria_sub_level2_id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      console.log("🎯 Criterion9_1Form - Loading data with:");
      console.log("  - otherStaffId prop:", otherStaffId);
      console.log("  - nba_contributor_allocation_id:", nba_contributor_allocation_id);
      console.log("  - nba_criteria_sub_level2_id:", nba_criteria_sub_level2_id);
      console.log("  - propFysfrId:", propFysfrId);
      console.log("  - editMode:", editMode);

      // Determine which staff ID to use - otherStaffId has priority
      const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
      const userInfo2 = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const staffIdToUse = otherStaffId || userInfo?.rawData?.other_staff_id || userInfo.user_id || userInfo2?.other_staff_id;
      
      console.log("🎯 Criterion9_1Form - Final staffId:", staffIdToUse);

      if (!staffIdToUse) {
        console.log("❌ Criterion9_1Form - No staffId found, using empty data");
        setInitialData({
          content: {
            governing_body: "",
            education_policy: "",
            sdg_initiatives: "",
            decentralization: "",
            financial_powers: "",
            transparency: ""
          },
          tableData: [],
          filesByField: {}
        });
        setLoading(false);
        return;
      }

      console.log("📡 Criterion9_1Form - Making API call with:");
      console.log("  - cycleSubCategoryId:", nba_criteria_sub_level2_id);
      console.log("  - staffId:", staffIdToUse);

      // Use the new service API call
      const response = await newnbaCriteria9Service.getCriteria9Data(
        '9.1', // section
        nba_criteria_sub_level2_id, // cycleSubCategoryId
        staffIdToUse // otherStaffId
      );

      console.log("📊 Criterion9_1Form - Raw API Response:", response);

      // Handle array response like other forms
      let dataItem = null;
      if (Array.isArray(response)) {
        if (response.length > 0) {
          dataItem = response[0];
          console.log("📦 Criterion9_1Form - Extracted first item from array:", dataItem);
        } else {
          console.log("📭 Criterion9_1Form - Empty array response, no data found");
        }
      } else {
        dataItem = response;
      }

      console.log("📊 Final dataItem:", dataItem);

      if (dataItem && dataItem.fysfr_id) {
        console.log("✅ Criterion9_1Form - Found existing data");
        
        // Set contributor name for display
        if (dataItem.other_staff_name) {
          setContributorName(dataItem.other_staff_name);
        } else if (dataItem.firstname) {
          const name = `${dataItem.firstname || ''} ${dataItem.middlename || ''} ${dataItem.lastname || ''}`.trim();
          setContributorName(name);
        }

        // Set ID
        setFysfrId(dataItem.fysfr_id);

        // Set approval status if available
        if (dataItem.approval_status) {
          setApprovalStatus({
            status: dataItem.approval_status,
            rejectionReason: dataItem.rejection_reason,
            approvalReason: dataItem.approval_status === 'APPROVED' ? dataItem.rejection_reason : null,
            approvedByName: dataItem.approved_by_name,
            submittedTime: dataItem.submitted_time
          });
        }

        // Transform files to filesByField structure
        const filesArray = Array.isArray(dataItem.supporting_documents)
          ? dataItem.supporting_documents
          : [];

        const filesByField = {
          "governing_body": filesArray.filter(f => f.category === 'governing_body').length > 0
            ? filesArray.filter(f => f.category === 'governing_body').map((f, i) => ({
                id: f.id || `file-governing-${i}`,
                filename: f.filename || f.name || "",
                s3Url: f.url || f.filePath || "",
                url: f.url || f.filePath || f.s3Url || "",
                description: f.description || "",
                uploading: false
              }))
            : [{
                id: `file-governing-0`,
                description: "",
                file: null,
                filename: "",
                s3Url: "",
                url: "",
                uploading: false
              }],
          "education_policy": filesArray.filter(f => f.category === 'education_policy').length > 0
            ? filesArray.filter(f => f.category === 'education_policy').map((f, i) => ({
                id: f.id || `file-policy-${i}`,
                filename: f.filename || f.name || "",
                s3Url: f.url || f.filePath || "",
                url: f.url || f.filePath || f.s3Url || "",
                description: f.description || "",
                uploading: false
              }))
            : [{
                id: `file-policy-0`,
                description: "",
                file: null,
                filename: "",
                s3Url: "",
                url: "",
                uploading: false
              }],
          "sdg_initiatives": filesArray.filter(f => f.category === 'sdg_initiatives').length > 0
            ? filesArray.filter(f => f.category === 'sdg_initiatives').map((f, i) => ({
                id: f.id || `file-sdg-${i}`,
                filename: f.filename || f.name || "",
                s3Url: f.url || f.filePath || "",
                url: f.url || f.filePath || f.s3Url || "",
                description: f.description || "",
                uploading: false
              }))
            : [{
                id: `file-sdg-0`,
                description: "",
                file: null,
                filename: "",
                s3Url: "",
                url: "",
                uploading: false
              }],
          "decentralization": filesArray.filter(f => f.category === 'decentralization').length > 0
            ? filesArray.filter(f => f.category === 'decentralization').map((f, i) => ({
                id: f.id || `file-decentral-${i}`,
                filename: f.filename || f.name || "",
                s3Url: f.url || f.filePath || "",
                url: f.url || f.filePath || f.s3Url || "",
                description: f.description || "",
                uploading: false
              }))
            : [{
                id: `file-decentral-0`,
                description: "",
                file: null,
                filename: "",
                s3Url: "",
                url: "",
                uploading: false
              }],
          "financial_powers": filesArray.filter(f => f.category === 'financial_powers').length > 0
            ? filesArray.filter(f => f.category === 'financial_powers').map((f, i) => ({
                id: f.id || `file-financial-${i}`,
                filename: f.filename || f.name || "",
                s3Url: f.url || f.filePath || "",
                url: f.url || f.filePath || f.s3Url || "",
                description: f.description || "",
                uploading: false
              }))
            : [{
                id: `file-financial-0`,
                description: "",
                file: null,
                filename: "",
                s3Url: "",
                url: "",
                uploading: false
              }],
          "transparency": filesArray.filter(f => f.category === 'transparency').length > 0
            ? filesArray.filter(f => f.category === 'transparency').map((f, i) => ({
                id: f.id || `file-transparency-${i}`,
                filename: f.filename || f.name || "",
                s3Url: f.url || f.filePath || "",
                url: f.url || f.filePath || f.s3Url || "",
                description: f.description || "",
                uploading: false
              }))
            : [{
                id: `file-transparency-0`,
                description: "",
                file: null,
                filename: "",
                s3Url: "",
                url: "",
                uploading: false
              }]
        };

        setInitialData({
          content: {
            governing_body: dataItem.governing_body || "",
            education_policy: dataItem.education_policy || "",
            sdg_initiatives: dataItem.sdg_initiatives || "",
            decentralization: dataItem.decentralization || "",
            financial_powers: dataItem.financial_powers || "",
            transparency: dataItem.transparency || ""
          },
          tableData: [],
          filesByField: filesByField
        });

      } else {
        // No existing data, initialize empty
        console.log("📭 Criterion9_1Form - No existing data found, showing blank form");
        setFysfrId(null);
        setApprovalStatus(null);
        setContributorName("");
        
        setInitialData({
          content: {
            governing_body: "",
            education_policy: "",
            sdg_initiatives: "",
            decentralization: "",
            financial_powers: "",
            transparency: ""
          },
          tableData: [],
          filesByField: {
            "governing_body": [{
              id: `file-governing-0`,
              description: "",
              file: null,
              filename: "",
              s3Url: "",
              url: "",
              uploading: false
            }],
            "education_policy": [{
              id: `file-policy-0`,
              description: "",
              file: null,
              filename: "",
              s3Url: "",
              url: "",
              uploading: false
            }],
            "sdg_initiatives": [{
              id: `file-sdg-0`,
              description: "",
              file: null,
              filename: "",
              s3Url: "",
              url: "",
              uploading: false
            }],
            "decentralization": [{
              id: `file-decentral-0`,
              description: "",
              file: null,
              filename: "",
              s3Url: "",
              url: "",
              uploading: false
            }],
            "financial_powers": [{
              id: `file-financial-0`,
              description: "",
              file: null,
              filename: "",
              s3Url: "",
              url: "",
              uploading: false
            }],
            "transparency": [{
              id: `file-transparency-0`,
              description: "",
              file: null,
              filename: "",
              s3Url: "",
              url: "",
              uploading: false
            }]
          }
        });
      }

    } catch (err) {
      console.error("Load failed:", err);
      console.error("Error details:", err.response?.data || err.message || err);
      
      // Don't show error if no data exists (404 is expected for new entries)
      if (err.response && err.response.status !== 404) {
        setAlert(
          <SweetAlert
            danger
            title="Load Failed"
            confirmBtnText="OK"
            confirmBtnCssClass="btn-confirm"
            onConfirm={() => setAlert(null)}
          >
            Failed to load saved data
          </SweetAlert>
        );
      }
      
      // Initialize empty data for new entry
      setInitialData({
        content: {
          governing_body: "",
          education_policy: "",
          sdg_initiatives: "",
          decentralization: "",
          financial_powers: "",
          transparency: ""
        },
        tableData: [],
        filesByField: {
          "governing_body": [{
            id: `file-governing-0`,
            description: "",
            file: null,
            filename: "",
            s3Url: "",
            url: "",
            uploading: false
          }],
          "education_policy": [{
            id: `file-policy-0`,
            description: "",
            file: null,
            filename: "",
            s3Url: "",
            url: "",
            uploading: false
          }],
          "sdg_initiatives": [{
            id: `file-sdg-0`,
            description: "",
            file: null,
            filename: "",
            s3Url: "",
            url: "",
            uploading: false
          }],
          "decentralization": [{
            id: `file-decentral-0`,
            description: "",
            file: null,
            filename: "",
            s3Url: "",
            url: "",
            uploading: false
          }],
          "financial_powers": [{
            id: `file-financial-0`,
            description: "",
            file: null,
            filename: "",
            s3Url: "",
            url: "",
            uploading: false
          }],
          "transparency": [{
            id: `file-transparency-0`,
            description: "",
            file: null,
            filename: "",
            s3Url: "",
            url: "",
            uploading: false
          }]
        }
      });
      setFysfrId(null);
      setApprovalStatus(null);
      setContributorName("");
      
    } finally {
      setLoading(false);
    }
  }, [nba_accredited_program_id, nba_criteria_sub_level2_id, nba_contributor_allocation_id, otherStaffId, propFysfrId, editMode]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ---------------- SAVE DATA ----------------
  const handleSave = async (formData) => {
    console.log("Save data received:", formData);
    
    // Check permissions
    const profileFlags = getAllProfileFlags();
    const isContributor = profileFlags?.isContributor || false;
    
    if (!isContributorEditable && isContributor) {
      setAlert(
        <SweetAlert
          warning
          title="Permission Denied"
          confirmBtnText="OK"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => setAlert(null)}
        >
          You don't have permission to edit
        </SweetAlert>
      );
      return;
    }

    setSaving(true);
    
    try {
      // Determine staff ID to use
      const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
      const userInfo2 = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const staffId = userInfo?.rawData?.other_staff_id || userInfo2?.other_staff_id;

      if (!staffId) {
        throw new Error("Staff ID not found");
      }

      if (!nba_criteria_sub_level2_id) {
        throw new Error("Cycle sub-category ID is required");
      }

      // Prepare files with category
      const filesWithCategory = Object.keys(formData.filesByField || {}).flatMap(
        (field) =>
          (formData.filesByField[field] || []).map((file) => ({
            ...file,
            category: field,
          }))
      );

      // Prepare payload
      const payload = {
        other_staff_id: parseInt(staffId),
        cycle_sub_category_id: parseInt(nba_criteria_sub_level2_id),
        governing_body: formData.content?.governing_body || "",
        education_policy: formData.content?.education_policy || "",
        sdg_initiatives: formData.content?.sdg_initiatives || "",
        decentralization: formData.content?.decentralization || "",
        financial_powers: formData.content?.financial_powers || "",
        transparency: formData.content?.transparency || "",
        supporting_documents: filesWithCategory
          .filter((f) => f.url || f.s3Url)
          .map((f) => ({
            description: f.description || "",
            filename: f.filename || f.name || "",
            url: f.s3Url || f.url || "",
            id: f.id,
            category: f.category
          })),
      };

      console.log("🟠 Criterion9_1Form - Save payload:", payload);

      let response;
      const hasExistingEntry = fysfrId || propFysfrId;

      if (hasExistingEntry) {
        // Update existing record
        const idToUse = fysfrId || propFysfrId;
        console.log("🔄 Criterion9_1Form - Updating existing entry with ID:", idToUse);
        response = await newnbaCriteria9Service.updateCriteria9('9.1', idToUse, payload);
      } else {
        // Create new record
        console.log("🆕 Criterion9_1Form - Creating new entry");
        response = await newnbaCriteria9Service.saveCriteria9Data('9.1', payload);
      }

      console.log("Save response:", response);

      // ✅ IMMEDIATELY UPDATE LOCAL STATE with the saved data
      const updatedFilesByField = {};
      
      Object.keys(formData.filesByField || {}).forEach(field => {
        const files = formData.filesByField[field] || [];
        updatedFilesByField[field] = files.map(file => {
          // Find matching file in payload
          const savedFile = payload.supporting_documents?.find(
            f => f.id === file.id || f.filename === (file.filename || file.file?.name)
          );
          
          return {
            ...file,
            s3Url: savedFile?.url || file.s3Url || file.url || "",
            url: savedFile?.url || file.s3Url || file.url || "",
            filename: savedFile?.filename || file.filename || file.file?.name || "",
            uploading: false
          };
        });
      });

      // Update initialData state immediately
      setInitialData(prev => ({
        ...prev,
        content: formData.content,
        filesByField: updatedFilesByField
      }));

      // If this is a new entry, set the ID from response
      if (response?.fysfr_id && !fysfrId) {
        setFysfrId(response.fysfr_id);
      }

      setAlert(
        <SweetAlert
          success
          title="Saved!"
          confirmBtnText="OK"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => setAlert(null)}
        >
          Criterion 9.1 saved successfully
        </SweetAlert>
      );

      // Call success callback
      onSaveSuccess?.();

    } catch (err) {
      console.error("Save failed:", err);
      setAlert(
        <SweetAlert
          danger
          title="Save Failed"
          confirmBtnText="OK"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => setAlert(null)}
        >
          {err.response?.data?.message || err.message || "Failed to save"}
        </SweetAlert>
      );
    } finally {
      setSaving(false);
    }
  };

  // ---------------- DELETE DATA ----------------
  const handleDelete = async () => {
    if (!fysfrId) {
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
            await newnbaCriteria9Service.deleteCriteria9('9.1', fysfrId);
            setAlert(
              <SweetAlert
                success
                title="Deleted!"
                confirmBtnCssClass="btn-confirm"
                confirmBtnText="OK"
                onConfirm={() => setAlert(null)}
              >
                Governance record deleted successfully
              </SweetAlert>
            );
            await loadData();
            setFysfrId(null);
            onSaveSuccess?.();
          } catch (error) {
            console.error(error);
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

  // ---------------- UI ----------------
  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-2xl text-indigo-600 font-medium">
        Loading {config.title}...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Approval Status */}
      {approvalStatus && approvalStatus.status !== 'COORDINATORS_DATA' && userRole.nba_coordinator !== true && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <StatusBadge
              status={approvalStatus.status}
              rejectionReason={approvalStatus.rejectionReason}
              approvalReason={approvalStatus.approvalReason}
              approvedByName={approvalStatus.approvedByName}
            />
            {approvalStatus.submittedTime && (
              <span className="text-sm text-gray-500">
                Submitted: {new Date(approvalStatus.submittedTime).toLocaleString()}
              </span>
            )}
          </div>
        </div>
      )}

      <GenericCriteriaForm
        title={config.title}
        marks={config.totalMarks}
        fields={config.fields}
        initialData={initialData}
        onSave={handleSave}
        onDelete={fysfrId ? handleDelete : null}
        isCompleted={completed}
        isContributorEditable={isContributorEditable}
        saving={saving}
        hasExistingData={!!fysfrId}
        showFileCategories={true}
      />

      {alert}
    </div>
  );
};

export default Criterion9_1Form;