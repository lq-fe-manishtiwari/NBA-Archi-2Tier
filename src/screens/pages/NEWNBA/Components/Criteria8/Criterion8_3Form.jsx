import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import GenericCriteriaForm from "../GenericCriteriaForm";
import StatusBadge from "../StatusBadge";
import SweetAlert from "react-bootstrap-sweetalert";
import { newnbaCriteria8Service } from "../../Services/NewNBA-Criteria8.service";

const Criterion8_3Form = ({
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
  const [deleting, setDeleting] = useState(false);
  const [initialData, setInitialData] = useState(null);
  const [approvalStatus, setApprovalStatus] = useState(null);
  const [currentId, setCurrentId] = useState(null);
  const [userRole, setUserRole] = useState({});
  const [alert, setAlert] = useState(null);

  // Force edit mode from the beginning (like Criterion 1.3)
  const isEditMode = true;

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    setUserRole(userInfo);
  }, []);

  const getEffectiveStaffId = () => {
    const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}");
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");

    return (
      otherStaffId ||
      userProfile?.rawData?.other_staff_id ||
      userProfile?.user_id ||
      userInfo?.other_staff_id ||
      userInfo?.user_id ||
      null
    );
  };

  const sectionConfig = {
    title: "8.3. Feedback on Facilities",
    totalMarks: 5,
    fields: [
      {
        name: "8.3.1",
        // label: "8.3.1 Actions Taken Based on the Results of Evaluation of the COs Attainment",
        marks: 20,
        type: "textarea",
        rows: 8,
        placeholder: "Describe the student support system / mentoring system...",
        allowFiles: true
      }
    ]
  };

  const createEmptyFile = () => ({
    id: `file-8.3.1-default-${Date.now()}`,
    description: "",
    file: null,
    filename: "",
    s3Url: "",
    uploading: false,
    category: "Student Support Documents"
  });

  const ensureFileSlot = (files = []) => {
    return files.length === 0 ? [createEmptyFile()] : files;
  };

  useEffect(() => {
    const loadData = async () => {
      const staffId = getEffectiveStaffId();

      if (!nba_criteria_sub_level2_id || !staffId) {
        loadEmptyForm();
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const response = await newnbaCriteria8Service.getStudentSupportSystemByStaff(
          nba_criteria_sub_level2_id,
          staffId
        );

        let selectedRecord = null;

        if (Array.isArray(response) && response.length > 0) {
          selectedRecord = response.reduce((prev, curr) => {
            const prevTime = prev.updated_at ? new Date(prev.updated_at) : new Date(0);
            const currTime = curr.updated_at ? new Date(curr.updated_at) : new Date(0);
            return currTime > prevTime ? curr : prev;
          });
        } else if (response && typeof response === 'object') {
          selectedRecord = response;
        }

        if (selectedRecord) {
          processData(selectedRecord);
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

  const processData = (d) => {
    const files = (d.student_support_document || []).map((doc, i) => ({
      id: doc.id || `file-8.3.1-${i}`,
      filename: doc.filename || "",
      description: doc.description || "",
      s3Url: doc.file_url || "",
      category: "Student Support Documents"
    }));

    setInitialData({
      content: {
        "8.3.1": d.student_support_description || ""
      },
      tableData: {},
      filesByField: {
        "8.3.1": ensureFileSlot(files)
      }
    });

    setCurrentId(d.id || null);

    if (d.approval_status) {
      setApprovalStatus({
        status: d.approval_status,
        rejectionReason: d.rejection_reason,
        approvedByName: d.approved_by_name
      });
    }
  };

  const loadEmptyForm = () => {
    setInitialData({
      content: { "8.3.1": "" },
      tableData: {},
      filesByField: {
        "8.3.1": ensureFileSlot([])
      }
    });
    setCurrentId(null);
    setApprovalStatus(null);
  };

  const handleSave = async (formData) => {
    const staffId = getEffectiveStaffId();
    if (!staffId) {
      toast.error("Cannot save: Staff ID not found");
      return;
    }

    try {
      setSaving(true);

      const documents = (formData.filesByField?.["8.3.1"] || [])
        .filter(f => f.s3Url)
        .map(f => ({
          filename: f.filename,
          description: f.description,
          file_url: f.s3Url
        }));

      const payload = {
        other_staff_id: staffId,
        cycle_sub_category_id: nba_criteria_sub_level2_id,
        student_support_description: formData.content?.["8.3.1"] || "",
        student_support_document: documents
      };

      let newId;

      if (currentId) {
        await newnbaCriteria8Service.updateStudentSupportSystem(currentId, payload, staffId);
        toast.success("Updated successfully");
        newId = currentId;
      } else {
        const response = await newnbaCriteria8Service.saveStudentSupportSystem(payload, staffId);
        toast.success("Saved successfully");
        // If your create API returns the new ID, capture it
        newId = response?.id || null; // adjust according to your API response
      }

      // Very important: update currentId after create → delete becomes available immediately
      setCurrentId(newId);

      onSuccess();
    } catch (err) {
      toast.error(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!currentId) {
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
        title="Are you sure?"
        onConfirm={async () => {
          setAlert(null);
          try {
            setDeleting(true);
            await newnbaCriteria8Service.deleteStudentSupportSystem(currentId);
            toast.success("Deleted successfully");

            // Reset form completely - like Criterion 1.3
            loadEmptyForm();
            onSuccess();
          } catch (err) {
            toast.error("Failed to delete");
          } finally {
            setDeleting(false);
          }
        }}
        onCancel={() => setAlert(null)}
      >
        This will permanently delete Criterion 8.3 data
      </SweetAlert>
    );
  };

  if (loading) {
    return (
      <div className="py-32 text-center text-indigo-600 text-xl">
        Loading {sectionConfig.title}...
      </div>
    );
  }

  return (
    <>
      {alert}

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
          onDelete={handleDelete}
          isCompleted={completed}
          isContributorEditable={isContributorEditable && !readOnly}
          saving={saving || deleting}
          hasExistingData={!!currentId}
          readOnly={readOnly}
          // Force edit mode (like Criterion 1.3)
          initialEditMode={true}
        />
      </div>
    </>
  );
};

export default Criterion8_3Form;