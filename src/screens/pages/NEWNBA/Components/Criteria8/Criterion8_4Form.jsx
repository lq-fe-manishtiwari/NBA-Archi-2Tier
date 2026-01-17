import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import GenericCriteriaForm from "../GenericCriteriaForm";
import StatusBadge from "../StatusBadge";
import { newnbaCriteria8Service } from "../../Services/NewNBA-Criteria8.service";

const Criterion8_4Form = ({
  nba_accredited_program_id,
  academic_year,
  nba_criteria_sub_level2_id,
  contributor_allocation_id: nba_contributor_allocation_id,
  completed = false,
  isContributorEditable = true,
  otherStaffId = null,
  editMode = false,
  coPoPsoActionsId = null,
  onSuccess = () => {},
  readOnly = false,
  cardData = null
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initialData, setInitialData] = useState(null);
  const [approvalStatus, setApprovalStatus] = useState(null);
  const [currentId, setCurrentId] = useState(null);
  const [userRole, setUserRole] = useState({});

  /* =====================================================
     USER ROLE
  ===================================================== */
  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    setUserRole(userInfo);
  }, []);

  /* =====================================================
     FORM CONFIG
  ===================================================== */
  const emptyTableData = {
    "8.4.1": [],
  };

  const sectionConfig = {
    title: "8.4.Mentoring System to Help at Individual Levels",
    totalMarks: 5,
    fields: [
      {
        name: "8.4",
        label: "8.4.1 Actions Taken Based on the Results of Evaluation of the COs Attainment",
        marks: 20,
        type: "textarea",
        rows: 8,
        placeholder: "Describe the student support system..."
      }
    ]
  };

  /* =====================================================
     LOAD DATA
  ===================================================== */
  useEffect(() => {
    console.log("🎯 Criterion8_1Form - Loading data...");
    console.log("📦 Direct cardData received:", cardData);
    console.log("🔍 Other props:", {
      otherStaffId,
      coPoPsoActionsId,
      nba_criteria_sub_level2_id,
      readOnly
    });

    const loadData = async () => {
      try {
        setLoading(true);

        if (cardData?.id) {
          processData(cardData);
          return;
        }

        if (nba_criteria_sub_level2_id && otherStaffId) {
          const response =
            await newnbaCriteria8Service.getStudentSupportSystemByStaff(
              nba_criteria_sub_level2_id,
              otherStaffId
            );

          const data = Array.isArray(response) ? response[0] : response;
          data ? processData(data) : loadEmptyForm();
        } else {
          loadEmptyForm();
        }
      } catch (err) {
        toast.error("Failed to load data");
        loadEmptyForm();
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [nba_criteria_sub_level2_id, otherStaffId]);

  /* =====================================================
     PROCESS DATA
  ===================================================== */
  const processData = (data) => {
    const files = [];

    if (Array.isArray(data.student_support_document)) {
      data.student_support_document.forEach((doc, i) => {
        files.push({
          id: doc.id || `file-${i}`,
          filename: doc.filename || "",
          description: doc.description || "",
          s3Url: doc.file_url || "",
          category: "Student Support Documents"
        });
      });
    }

    if (files.length === 0) {
      files.push(createEmptyFile());
    }

    setInitialData({
      content: {
        "8.4.1": data.student_support_description || ""
      },
      tableData: emptyTableData,
      filesByField: {
        "8.4.1": files
      }
    });

    setCurrentId(data.id || null);

    if (data.approval_status) {
      setApprovalStatus({
        status: data.approval_status,
        rejectionReason: data.rejection_reason,
        approvedByName: data.approved_by_name
      });
    }
  };

  const loadEmptyForm = () => {
    setInitialData({
      content: { "8.4.1": "" },
      tableData: emptyTableData,
      filesByField: { "8.4.1": [createEmptyFile()] }
    });
    setCurrentId(null);
    setApprovalStatus(null);
  };

  const createEmptyFile = () => ({
    id: `file-${Date.now()}`,
    description: "",
    file: null,
    filename: "",
    s3Url: "",
    uploading: false,
    category: fieldName === "8.4.1" ? "Student Support Documents" : "Student Support Documents"
  });

  /* =====================================================
     SAVE
  ===================================================== */
  const handleSave = async (data) => {
    if (readOnly || (!isContributorEditable && userRole.nba_contributor)) {
      toast.error("You don't have permission to edit");
      return;
    }

    try {
      setSaving(true);

      const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}");
      const staffId =
        otherStaffId ||
        userProfile?.rawData?.other_staff_id ||
        userProfile?.user_id;

      if (!staffId) throw new Error("Staff ID not found");

      const documents =
        data.filesByField?.["8.4.1"]
          ?.filter((f) => f.s3Url)
          .map((f) => ({
            filename: f.filename,
            description: f.description,
            file_url: f.s3Url
          })) || [];

      const payload = {
        other_staff_id: staffId,
        cycle_sub_category_id: nba_criteria_sub_level2_id,
        student_support_description: data.content?.["8.4.1"] || "",
        student_support_document: documents
      };

      if (currentId) {
        await newnbaCriteria8Service.updateStudentSupportSystem(
          currentId,
          payload,
          staffId
        );
        toast.success("Updated successfully");
      } else {
        await newnbaCriteria8Service.saveStudentSupportSystem(
          payload,
          staffId
        );
        toast.success("Saved successfully");
      }

      onSuccess();
    } catch (err) {
      toast.error(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  /* =====================================================
     DELETE
  ===================================================== */
  const handleDelete = async () => {
    if (!currentId) return;

    try {
      await newnbaCriteria8Service.deleteStudentSupportSystem(currentId);
      toast.success("Deleted successfully");
      loadEmptyForm();
      onSuccess();
    } catch {
      toast.error("Delete failed");
    }
  };

  /* =====================================================
     RENDER
  ===================================================== */
  if (loading) {
    return (
      <div className="py-32 text-center text-indigo-600 text-xl">
        Loading {sectionConfig.title}...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {approvalStatus && userRole.nba_coordinator !== true && (
        <div className="bg-white border rounded-lg p-4">
          <StatusBadge {...approvalStatus} />
        </div>
      )}

      <GenericCriteriaForm
        title={sectionConfig.title}
        marks={sectionConfig.totalMarks}
        fields={sectionConfig.fields}
        initialData={initialData}
        onSave={handleSave}
        onDelete={!readOnly && currentId ? handleDelete : null}
        isCompleted={completed}
        isContributorEditable={isContributorEditable && !readOnly}
        saving={saving}
        hasExistingData={!!currentId}
        readOnly={readOnly}
      />
    </div>
  );
};

export default Criterion8_4Form;
