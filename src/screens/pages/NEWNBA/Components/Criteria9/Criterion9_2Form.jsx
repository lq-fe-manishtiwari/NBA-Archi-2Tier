/** @format */
import React, { useState, useEffect, useCallback } from "react";
import GenericCriteriaForm from "../GenericCriteriaForm";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import StatusBadge from "../StatusBadge";
import SweetAlert from "react-bootstrap-sweetalert";

// Import the new service
import { newnbaCriteria9Service } from "../../Services/NewNBA-Criteria9.service";
import { getAllProfileFlags } from "@/_services/adminProfileUtils";

const Criterion9_2Form = ({
  nba_accredited_program_id,
  nba_criteria_sub_level2_id,
  nba_contributor_allocation_id,
  isContributorEditable = true,
  completed = false,
  onSaveSuccess,
  otherStaffId = null, // For coordinator viewing specific contributor's data
  editMode = false,
  mentoringSystemId: propMentoringSystemId = null,
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mentoringSystemId, setMentoringSystemId] = useState(null);
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
    title: "9.2. Mentoring System (05)",
    totalMarks: 5,
    fields: [
      {
        name: "mentoring_system_details",
        label: "Type of mentoring: Professional guidance/career advancement/course work specific/laboratory specific/all-round development. Number of faculty mentors: Number of students per mentor: Frequency of meeting",
        marks: 5,
        type: "textarea"
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
      const staffIdToUse = otherStaffId || nba_contributor_allocation_id || userInfo?.rawData?.other_staff_id || userInfo.user_id || userInfo2?.other_staff_id;
      
      if (!staffIdToUse) {
        setInitialData({ 
          content: { mentoring_system_details: "" }, 
          tableData: [], 
          filesByField: {
            "mentoring_system_details": [{ 
              id: `file-mentoring-0`, 
              description: "", 
              file: null, 
              filename: "", 
              s3Url: "", 
              url: "",
              uploading: false 
            }]
          }
        });
        setLoading(false);
        return;
      }

      const response = await newnbaCriteria9Service.getCriteria9_2_Data(
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

      if (dataItem && dataItem.mentoring_system_id) {
        if (dataItem.other_staff_name) {
          setContributorName(dataItem.other_staff_name);
        } else if (dataItem.firstname) {
          const name = `${dataItem.firstname || ''} ${dataItem.middlename || ''} ${dataItem.lastname || ''}`.trim();
          setContributorName(name);
        }

        setMentoringSystemId(dataItem.mentoring_system_id);

        if (dataItem.approval_status) {
          setApprovalStatus({
            status: dataItem.approval_status,
            rejectionReason: dataItem.rejection_reason,
            approvedByName: dataItem.approved_by_name,
            submittedTime: dataItem.submitted_time
          });
        }

        const filesArray = Array.isArray(dataItem.mentoring_supporting_documents) 
          ? dataItem.mentoring_supporting_documents 
          : [];

        const filesByField = {
          "mentoring_system_details": filesArray.length > 0
            ? filesArray.map((f, i) => ({
                id: f.id || `file-mentoring-${i}`,
                filename: f.filename || f.name || "",
                s3Url: f.url || f.filePath || "",
                url: f.url || f.filePath || f.s3Url || "",
                description: f.description || "",
                uploading: false
              }))
            : [{ 
                id: `file-mentoring-0`, 
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
            mentoring_system_details: dataItem.mentoring_system_details || "" 
          },
          tableData: [],
          filesByField: filesByField
        });

      } else {
        setMentoringSystemId(null);
        setApprovalStatus(null);
        setContributorName("");
        
        setInitialData({ 
          content: { mentoring_system_details: "" }, 
          tableData: [], 
          filesByField: {
            "mentoring_system_details": [{ 
              id: `file-mentoring-0`, 
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
      
      setInitialData({ 
        content: { mentoring_system_details: "" }, 
        tableData: [], 
        filesByField: {
          "mentoring_system_details": [{ 
            id: `file-mentoring-0`, 
            description: "", 
            file: null, 
            filename: "", 
            s3Url: "", 
            url: "",
            uploading: false 
          }]
        }
      });
      setMentoringSystemId(null);
      setApprovalStatus(null);
      setContributorName("");
      
    } finally {
      setLoading(false);
    }
  }, [nba_accredited_program_id, nba_criteria_sub_level2_id, nba_contributor_allocation_id, otherStaffId, propMentoringSystemId, editMode]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async (formData) => {
    try {
      setSaving(true);
      
      const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
      const userInfo2 = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const currentUserStaffId = userInfo?.rawData?.other_staff_id || userInfo.user_id || userInfo2?.other_staff_id;
      
      const payload = {
        other_staff_id: otherStaffId || nba_contributor_allocation_id || currentUserStaffId,
        cycle_sub_category_id: nba_criteria_sub_level2_id,
        mentoring_system_details: formData.content.mentoring_system_details || "",
        mentoring_supporting_documents: formData.filesByField.mentoring_system_details || []
      };
      
      let response;
      if (mentoringSystemId) {
        response = await newnbaCriteria9Service.putCriteria9_2_Data(mentoringSystemId, currentUserStaffId, payload);
      } else {
        response = await newnbaCriteria9Service.saveCriteria9_2_Data(currentUserStaffId, payload);
      }
      
      if (response && response.mentoring_system_id) {
        setMentoringSystemId(response.mentoring_system_id);
      }
      
      toast.success("Data saved successfully!");
      if (onSaveSuccess) onSaveSuccess();
      
    } catch (error) {
      console.error("Save failed:", error);
      toast.error("Failed to save data");
    } finally {
      setSaving(false);
    }
  };
  
  const handleDelete = async () => {
    if (!mentoringSystemId) return;
    
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!"
    });
    
    if (result.isConfirmed) {
      try {
        await newnbaCriteria9Service.deleteCriteria9_2Data(mentoringSystemId);
        toast.success("Data deleted successfully!");
        setMentoringSystemId(null);
        setInitialData({ content: { mentoring_system_details: "" }, tableData: [], filesByField: {} });
        if (onSaveSuccess) onSaveSuccess();
      } catch (error) {
        console.error("Delete failed:", error);
        toast.error("Failed to delete data");
      }
    }
  };
  
  return (
    <div>
      {alert}
      {contributorName && (
        <div className="mb-3">
          <strong>Contributor:</strong> {contributorName}
          {approvalStatus && (
            <StatusBadge 
              status={approvalStatus.status}
              rejectionReason={approvalStatus.rejectionReason}
              approvedByName={approvalStatus.approvedByName}
              submittedTime={approvalStatus.submittedTime}
            />
          )}
        </div>
      )}
      
      <GenericCriteriaForm
        config={config}
        initialData={initialData}
        onSave={handleSave}
        onDelete={mentoringSystemId ? handleDelete : null}
        loading={loading}
        saving={saving}
        isEditable={isContributorEditable && !completed}
        showDeleteButton={!!mentoringSystemId && isContributorEditable}
      />
    </div>
  );
};

export default Criterion9_2Form;