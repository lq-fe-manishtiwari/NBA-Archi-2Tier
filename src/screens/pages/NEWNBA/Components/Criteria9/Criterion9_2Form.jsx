

/** @format */
import React, { useState, useEffect, useCallback } from "react";
import GenericCriteriaForm9_2 from "./GenericCriteriaForm9_2";
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
  propMentoringSystemId: propMentoringSystemId = null,
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
    title: "9.2 Budget Allocation, Utilization, and Public Accounting at Institute level (30)",
    totalMarks: 30,
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
      console.log("staffIdToUse",staffIdToUse)
      if (!staffIdToUse) {
        setInitialData({ 
          tableData: {
            income_table: [{ ...emptyIncomeRow, id: `row-${Date.now()}` }],
            budget_expenditure_table: BUDGET_ITEMS.map(emptyBudgetRow),
          }, 
          filesByField: {
            table9_2_a_files: [createEmptyFileRow()],
            table9_2_b_files: [createEmptyFileRow()],
          }
        });
        setLoading(false);
        return;
      }

      const response = await newnbaCriteria9Service.getCriteria9_2_Data(
        nba_criteria_sub_level2_id,
        staffIdToUse
      );
      console.log(response);

      let dataItem = null;
      if (Array.isArray(response)) {
        if (response.length > 0) {
          dataItem = response[0];
        }
      } else {
        dataItem = response;
      }
      console.log(dataItem,"dataItem")

      if (dataItem && dataItem.id) {
        if (dataItem.other_staff_name) {
          setContributorName(dataItem.other_staff_name);
        } else if (dataItem.firstname) {
          const name = `${dataItem.firstname || ''} ${dataItem.middlename || ''} ${dataItem.lastname || ''}`.trim();
          setContributorName(name);
        }
        console.log(dataItem.id);

        setMentoringSystemId(dataItem.id);

        if (dataItem.approval_status) {
          setApprovalStatus({
            status: dataItem.approval_status,
            rejectionReason: dataItem.rejection_reason,
            approvedByName: dataItem.approved_by_name,
            submittedTime: dataItem.submitted_time
          });
        }

        const files = Array.isArray(dataItem.budget_document) 
          ? dataItem.budget_document 
          : [];

        const mapFiles = (files) => files.length > 0 ? files.map((f, i) => ({
          id: f.id || `file-${Date.now()}-${i}`,
          filename: f.filename || f.name || "",
          s3Url: f.url || f.filePath || "",
          url: f.url || f.filePath || f.s3Url || "",
          description: f.description || "",
          uploading: false
        })) : [createEmptyFileRow()];

        setInitialData({
          tableData: {
            income_table: dataItem.total_income_institute_level || [{ ...emptyIncomeRow, id: `row-${Date.now()}` }],
            budget_expenditure_table: dataItem.income_expenditure_institute_level || BUDGET_ITEMS.map(emptyBudgetRow),
          },
          filesByField: {
            table9_2_a_files: mapFiles(files.slice(0, Math.ceil(files.length/2))),
            table9_2_b_files: mapFiles(files.slice(Math.ceil(files.length/2))),
          }
        });

      } else {
        setMentoringSystemId(null);
        setApprovalStatus(null);
        setContributorName("");
        
        setInitialData({ 
          tableData: {
            income_table: [{ ...emptyIncomeRow, id: `row-${Date.now()}` }],
            budget_expenditure_table: BUDGET_ITEMS.map(emptyBudgetRow),
          }, 
          filesByField: {
            table9_2_a_files: [createEmptyFileRow()],
            table9_2_b_files: [createEmptyFileRow()],
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
        tableData: {
          income_table: [{ ...emptyIncomeRow, id: `row-${Date.now()}` }],
          budget_expenditure_table: BUDGET_ITEMS.map(emptyBudgetRow),
        }, 
        filesByField: {
          table9_2_a_files: [createEmptyFileRow()],
          table9_2_b_files: [createEmptyFileRow()],
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
    setSaving(true);

    try {
      const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
      const userInfo2 = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const currentUserStaffId = userInfo?.rawData?.other_staff_id || userInfo.user_id || userInfo2?.other_staff_id;
      
      const payload = {
        other_staff_id: otherStaffId || nba_contributor_allocation_id || currentUserStaffId,
        cycle_sub_category_id: nba_criteria_sub_level2_id,
        total_income_institute_level: formData.tableData.income_table.map(r => {
          const { id, ...rest } = r;
          return rest;
        }),
        income_expenditure_institute_level: formData.tableData.budget_expenditure_table,
        budget_document: formData.filesByField.table9_2_a_files.map(f => ({
          id: f.id,
          filename: f.filename,
          url: f.s3Url,
          description: f.description
        })).concat(formData.filesByField.table9_2_b_files.map(f => ({
          id: f.id,
          filename: f.filename,
          url: f.s3Url,
          description: f.description
        }))),
      };
      
      let response;
      if (mentoringSystemId) {
        response = await newnbaCriteria9Service.putCriteria9_2_Data(mentoringSystemId, currentUserStaffId, payload);
      } else {
        response = await newnbaCriteria9Service.saveCriteria9_2_Data(currentUserStaffId, payload);
      }
      
      if (response && (response.id || response.mentoring_system_id)) {
        setMentoringSystemId(response.id || response.mentoring_system_id);
      }
      
      setAlert(
        <SweetAlert
          success
          title="Saved!"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => setAlert(null)}
        >
          Criterion 9.2 saved successfully!
        </SweetAlert>
      );
      
      if (onSaveSuccess) onSaveSuccess();
      
    } catch (error) {
      console.error("Save failed:", error);
      setAlert(
        <SweetAlert
          danger
          title="Error"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => setAlert(null)}
        >
          Failed to save Criterion 9.2. Error: {error.message || error}
        </SweetAlert>
      );
    } finally {
      setSaving(false);
    }
  };
  
  const handleDelete = async () => {
    if (!mentoringSystemId) {
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
            await newnbaCriteria9Service.deleteCriteria9_2Data(mentoringSystemId);
            
            setAlert(
              <SweetAlert
                success
                title="Deleted!"
                confirmBtnCssClass="btn-confirm"
                confirmBtnText="OK"
                onConfirm={() => setAlert(null)}
              >
                Criterion 9.2 deleted successfully!
              </SweetAlert>
            );
            
            setMentoringSystemId(null);
            setInitialData({ content: {}, tableData: { income_table: [], budget_expenditure_table: [] }, filesByField: {} });
            if (onSaveSuccess) onSaveSuccess();
          } catch (error) {
            console.error("Delete failed:", error);
            
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
      
      <GenericCriteriaForm9_2
        config={config}
        initialData={initialData}
        onSave={handleSave}
        onDelete={handleDelete}
        loading={loading}
        saving={saving}
        isEditable={isContributorEditable && !completed}
      />
    </div>
  );
};

export default Criterion9_2Form;