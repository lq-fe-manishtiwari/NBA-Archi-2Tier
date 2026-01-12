// src/screens/pages/NEWNBA/Components/Criteria8/Criterion8_7Form.jsx

import React, { useState, useEffect, useCallback } from "react";
import GenericCriteriaForm from "../GenericCriteriaForm";
import { newnbaCriteria8Service } from "../../Services/NewNBA-Criteria8.service";
import SweetAlert from "react-bootstrap-sweetalert";
import { getAllProfileFlags } from "@/_services/adminProfileUtils";
import StatusBadge from "../StatusBadge";

const Criterion8_7Form = ({
  nba_accredited_program_id,
  nba_criteria_sub_level2_id,
  nba_contributor_allocation_id,
  isContributorEditable = true,
  completed = false,
  onSaveSuccess,
  otherStaffId = null,
  editMode = false,
  professionalDevelopmentId: propProfessionalDevelopmentId = null,
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [professionalDevelopmentId, setProfessionalDevelopmentId] = useState(propProfessionalDevelopmentId);
  const [initialData, setInitialData] = useState({
    content: {},
    tableData: [],
    filesByField: {},
  });
  const [approvalStatus, setApprovalStatus] = useState(null);
  const [userRole, setUserRole] = useState({});
  const [contributorName, setContributorName] = useState("");
  const [alert, setAlert] = useState(null);
  const [hasExistingData, setHasExistingData] = useState(false);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    setUserRole(userInfo);
  }, []);

  const config = {
    title: "8.7 Co-curricular and Extra-curricular Activities",
    totalMarks: 10,
    fields: [
      {
        name: "activities_details",
        type: "textarea",
        rows: 6,
        placeholder: "Describe co-curricular and extra-curricular activities organized and participated...",
      }
    ]
  };

  const loadData = useCallback(async () => {
    if (!nba_criteria_sub_level2_id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
      const userInfo2 = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const staffIdToUse = otherStaffId || userInfo?.rawData?.other_staff_id || userInfo.user_id || userInfo2?.other_staff_id;
      
      if (!staffIdToUse) {
        setInitialData({
          content: { activities_details: "" },
          tableData: [],
          filesByField: {}
        });
        setLoading(false);
        return;
      }

      const response = await newnbaCriteria8Service.getCriteria8_7_Data(
        nba_criteria_sub_level2_id,
        staffIdToUse
      );

      let dataItem = null;
      if (Array.isArray(response)) {
        if (response.length > 0) {
          dataItem = response[0];
        }
      } else {
        dataItem = response;
      }

      if (dataItem && dataItem.activities_id) {
        setHasExistingData(true);
        
        if (dataItem.other_staff_name) {
          setContributorName(dataItem.other_staff_name);
        } else if (dataItem.firstname) {
          const name = `${dataItem.firstname || ''} ${dataItem.middlename || ''} ${dataItem.lastname || ''}`.trim();
          setContributorName(name);
        }

        setProfessionalDevelopmentId(dataItem.activities_id);

        if (dataItem.approval_status) {
          setApprovalStatus({
            status: dataItem.approval_status,
            rejectionReason: dataItem.rejection_reason,
            approvalReason: dataItem.approval_status === 'APPROVED' ? dataItem.rejection_reason : null,
            approvedByName: dataItem.approved_by_name,
            submittedTime: dataItem.submitted_time
          });
        }

        const filesArray = Array.isArray(dataItem.supporting_documents) 
          ? dataItem.supporting_documents 
          : [];

        const filesByField = {
          "activities_details": filesArray.length > 0
            ? filesArray.map((f, i) => ({
                id: f.id || `file-activities-${i}`,
                filename: f.filename || f.name || f.file_url || "",
                s3Url: f.file_url || f.url || f.s3Url || "",
                url: f.file_url || f.url || f.s3Url || "",
                description: f.description || "",
                category: f.category || "Supporting Documents",
                uploading: false
              }))
            : [{ 
                id: `file-activities-0`, 
                description: "", 
                file: null, 
                filename: "", 
                s3Url: "", 
                url: "",
                category: "Supporting Documents",
                uploading: false 
              }]
        };

        setInitialData({
          content: { activities_details: dataItem.activities_details || "" },
          tableData: response,
          filesByField: filesByField
        });

      } else {
        setHasExistingData(false);
        setProfessionalDevelopmentId(null);
        setApprovalStatus(null);
        setContributorName("");
        
        setInitialData({
          content: { activities_details: "" },
          tableData: [],
          filesByField: {
            "activities_details": [{
              id: `file-activities-0`,
              description: "",
              file: null,
              filename: "",
              s3Url: "",
              url: "",
              category: "Supporting Documents",
              uploading: false
            }]
          }
        });
      }

    } catch (err) {
      console.error("Load failed:", err);
      
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
      
      setHasExistingData(false);
      setInitialData({ 
        content: { activities_details: "" }, 
        tableData: [], 
        filesByField: {
          "activities_details": [{ 
            id: `file-activities-0`, 
            description: "", 
            file: null, 
            filename: "", 
            s3Url: "", 
            url: "",
            category: "Supporting Documents",
            uploading: false 
          }]
        }
      });
      setProfessionalDevelopmentId(null);
      setApprovalStatus(null);
      setContributorName("");
      
    } finally {
      setLoading(false);
    }
  }, [nba_accredited_program_id, nba_criteria_sub_level2_id, nba_contributor_allocation_id, otherStaffId, propProfessionalDevelopmentId, editMode]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async (formData) => {
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
      const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
      const userInfo2 = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const staffId = otherStaffId || userInfo?.rawData?.other_staff_id || userInfo2?.other_staff_id;

      if (!staffId) {
        throw new Error("Staff ID not found");
      }

      if (!nba_criteria_sub_level2_id) {
        throw new Error("Cycle sub-category ID is required");
      }

      const filesWithCategory = Object.keys(formData.filesByField || {}).flatMap(
        (field) =>
          (formData.filesByField[field] || []).map((file) => ({
            ...file,
            category: file.category || "Supporting Documents",
            url: file.url || file.s3Url || "",
            file_url: file.url || file.s3Url || "",
          }))
      );

      const payload = {
        other_staff_id: parseInt(staffId),
        cycle_sub_category_id: parseInt(nba_criteria_sub_level2_id),
        activities_details: formData.content?.activities_details || "",
        supporting_documents: filesWithCategory
          .filter((f) => f.url || f.s3Url || f.file)
          .map((f) => ({
            description: f.description || "",
            filename: f.filename || f.name || f.file?.name || "",
            file_url: f.url || f.s3Url || "",
            url: f.url || f.s3Url || "",
            category: f.category || "Supporting Documents",
            id: f.id,
          })),
      };

      let response;
      const hasExistingEntry = professionalDevelopmentId || propProfessionalDevelopmentId;

      if (hasExistingEntry) {
        const idToUse = professionalDevelopmentId || propProfessionalDevelopmentId;
        response = await newnbaCriteria8Service.updateData8_7(idToUse, payload);
      } else {
        response = await newnbaCriteria8Service.saveCriteria8_7_Data(payload);
      }

      const updatedFilesByField = {};
      
      Object.keys(formData.filesByField || {}).forEach(field => {
        const files = formData.filesByField[field] || [];
        updatedFilesByField[field] = files.map(file => {
          const savedFile = payload.supporting_documents?.find(
            f => f.id === file.id || f.filename === (file.filename || file.file?.name)
          );
          
          return {
            ...file,
            s3Url: savedFile?.url || savedFile?.file_url || file.s3Url || file.url || "",
            url: savedFile?.url || savedFile?.file_url || file.s3Url || file.url || "",
            filename: savedFile?.filename || file.filename || file.file?.name || "",
            category: savedFile?.category || file.category || "Supporting Documents",
            uploading: false
          };
        });
      });

      setInitialData(prev => ({
        ...prev,
        content: formData.content,
        filesByField: updatedFilesByField
      }));

      if (response?.activities_id && !professionalDevelopmentId) {
        setProfessionalDevelopmentId(response.activities_id);
        setHasExistingData(true);
      }

      setAlert(
        <SweetAlert
          success
          title="Saved!"
          confirmBtnText="OK"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => setAlert(null)}
        >
          Criterion 8.7 saved successfully
        </SweetAlert>
      );

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

  const handleDelete = async () => {
    if (!professionalDevelopmentId) {
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
            await newnbaCriteria8Service.deleteData8_7(professionalDevelopmentId);
            setAlert(
              <SweetAlert
                success
                title="Deleted!"
                confirmBtnCssClass="btn-confirm"
                confirmBtnText="OK"
                onConfirm={() => setAlert(null)}
              >
                Co-curricular and Extra-curricular Activities record deleted successfully
              </SweetAlert>
            );
            await loadData();
            setProfessionalDevelopmentId(null);
            setHasExistingData(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-2xl text-indigo-600 font-medium">
        Loading {config.title}...
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
        onDelete={professionalDevelopmentId ? handleDelete : null}
        isCompleted={completed}
        isContributorEditable={isContributorEditable}
        saving={saving}
        hasExistingData={hasExistingData}
        showFileCategories={true}
        deleteButtonText={professionalDevelopmentId ? "Delete Record" : null}
        saveButtonText={professionalDevelopmentId ? "Update Record" : "Save Record"}
      />

      {alert}
    </div>
  );
};

export default Criterion8_7Form;