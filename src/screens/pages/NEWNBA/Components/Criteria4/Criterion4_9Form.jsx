// src/screens/pages/NEWNBA/Components/Criteria4/Criterion4_9Form.jsx
import React, { useState, useEffect, useCallback } from "react";
import GenericCriteriaForm4_9 from "./GenericCriteriaForm4_9";
import { newnbaCriteria4Service } from "../../Services/NewNBA-Criteria4.service";
import SweetAlert from "react-bootstrap-sweetalert";
import { toast } from "react-toastify";

const Criterion4_9Form = ({
  cycle_sub_category_id,
  isEditable = true,
  onSaveSuccess,
  programId = null,
  otherStaffId = null,
  showCardView = false,
  onCardClick = null,
  onStatusChange = null,
  cardData = [],
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [recordId, setRecordId] = useState(null);
  const [initialData, setInitialData] = useState({
    content: {},
    tableData: {},
    filesByField: {},
  });
  const [alert, setAlert] = useState(null);
  const [cardLoading, setCardLoading] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState(null);

  // ---------------- CONFIG FOR 4.9 PROFESSIONAL ACTIVITIES ----------------
  const config = {
    title: "4.9 Professional Activities (20)",
    totalMarks: 20,
    fields: [
      {
        name: "4.9.1",
        label: "4.9.1 Professional Societies / Chapters and Organizing Architectural Events (5)",
        marks: 5,
        description: "Provide the relevant details including holding of position at regional/national/ international level also",
        type: "textarea",
      },
      {
        name: "4.9.2",
        label: "4.9.2 Publication of Technical Magazines, Newsletters, etc. (5)",
        marks: 5,
        description: "Provide a comprehensive list of publications, including the names of editors, publishers, and any other relevant details associated with each publication",
        type: "textarea",
      },
      {
        name: "4.9.3",
        label: "4.9.3 Participation in Inter-Institute Events by Students of the Program of Study (10)",
        marks: 10,
        hasTable: true,
        description: "Provide a table indicating the participation of students in inter-institute events",
        tableConfig: {
          title: "Table No. 4.9.3: Participation in Inter-Institute Events by Students",
          columns: [
            { field: "sn", header: "S.N.", type: "autoNumber" },
            { field: "event_name", header: "Name of the Event", type: "text" },
            { field: "organizing_institute", header: "Organizing Institute", type: "text" },
            { field: "level", header: "Level (National/International)", type: "text" },
            { field: "date", header: "Date", type: "date" },
            { field: "no_of_participants", header: "No. of Participants", type: "number" },
            { field: "achievements", header: "Achievements/Awards", type: "text" },
          ],
          yearSections: [
            { year: "CAYm1", label: "CAYm1" },
            { year: "CAYm2", label: "CAYm2" },
            { year: "CAYm3", label: "CAYm3" }
          ],
        }
      }
    ],
  };

  // ---------------- LOAD DATA ----------------
  const loadData = useCallback(async () => {
    if (!cycle_sub_category_id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
      const userInfoo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const currentOtherStaffId = otherStaffId || userInfo?.rawData?.other_staff_id || userInfo.user_id || userInfoo?.other_staff_id;

      console.log("🟠 Loading 4.9 data for:", { cycle_sub_category_id, currentOtherStaffId });

      // Load data from API
      const res = await newnbaCriteria4Service.getCriteria4_9_Data(cycle_sub_category_id, currentOtherStaffId);
      const rawResponse = res?.data || res || [];
      const data = Array.isArray(rawResponse) && rawResponse.length > 0 ? rawResponse[0] : rawResponse;

      console.log("🟢 Loaded 4.9 data:", data);

      setRecordId(data.professional_activities_id || data.id);

      // Set approval status
      if (data.approval_status) {
        setApprovalStatus({
          status: data.approval_status,
          rejectionReason: data.rejection_reason,
          approvedByName: data.approved_by_name,
          submittedTime: data.submitted_time || data.created_at
        });
      } else {
        setApprovalStatus(null);
      }

      // Format table data for 4.9.3
      let tableData4_9_3 = [];
      if (data.participation_table && data.participation_table.length > 0) {
        tableData4_9_3 = data.participation_table.map((item, index) => ({
          id: `row-${Date.now()}-${index}`,
          sn: index + 1,
          event_name: item.event_name || "",
          organizing_institute: item.organizing_institute || "",
          level: item.level || "",
          date: item.date || "",
          no_of_participants: item.no_of_participants?.toString() || "",
          achievements: item.achievements || "",
          year: item.year || "CAYm1"
        }));
      }

      // Format files by field
      const allDocuments = data.supporting_documents || [];
      
      // Separate files by field
      const filesByField = {
        "4.9.1": [],
        "4.9.2": [],
        "4.9.3": []
      };

      allDocuments.forEach((doc) => {
        const category = doc.category || "4.9.1";
        if (filesByField[category]) {
          filesByField[category].push({
            id: `file-${Date.now()}-${doc.id || Math.random()}`,
            filename: doc.file_name || "",
            url: doc.file_url || "",
            s3Url: doc.file_url || "",
            description: doc.description || "",
            uploading: false
          });
        }
      });

      // Ensure each field has at least one empty file slot
      Object.keys(filesByField).forEach(field => {
        if (filesByField[field].length === 0) {
          filesByField[field] = [
            { id: `file-${field}-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }
          ];
        }
      });

      setInitialData({
        content: {
          "4.9.1": data.professional_societies_description || "",
          "4.9.2": data.publications_description || "",
          "4.9.3": data.participation_description || ""
        },
        tableData: {
          "4.9.3": tableData4_9_3
        },
        filesByField: filesByField,
        approval_status: data.approval_status,
        rejection_reason: data.rejection_reason,
        approved_by_name: data.approved_by_name,
        submitted_time: data.submitted_time || data.created_at,
      });

    } catch (err) {
      console.warn("Load failed for 4.9:", err);
      
      // Set default data if no data found
      setInitialData({
        content: {
          "4.9.1": "",
          "4.9.2": "",
          "4.9.3": ""
        },
        tableData: {
          "4.9.3": []
        },
        filesByField: {
          "4.9.1": [{ id: `file-4.9.1-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }],
          "4.9.2": [{ id: `file-4.9.2-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }],
          "4.9.3": [{ id: `file-4.9.3-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }]
        }
      });
    } finally {
      setLoading(false);
    }
  }, [cycle_sub_category_id, otherStaffId]);

  // Load contributors data for card view
  const loadContributorsData = async () => {
    if (!showCardView || !cycle_sub_category_id) return;
    
    setCardLoading(true);
    try {
      const contributorsResponse = await newnbaCriteria4Service.getAllCriteria4_9_Data?.(cycle_sub_category_id);
      if (onStatusChange) {
        onStatusChange(contributorsResponse || []);
      }
    } catch (err) {
      console.error("Failed to load contributors data:", err);
    } finally {
      setCardLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    loadData();
    if (showCardView) {
      loadContributorsData();
    }
  }, [cycle_sub_category_id, showCardView, otherStaffId, loadData]);

  // ---------------- SAVE DATA ----------------
  const handleSave = async (formData) => {
    setSaving(true);
    
    console.log("Criterion4_9Form handleSave - received formData:", formData);

    try {
      const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
      const userInfoo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const currentOtherStaffId = otherStaffId || userInfo?.rawData?.other_staff_id || userInfo.user_id || userInfoo?.other_staff_id;

      // Format table data for 4.9.3
      const participationTable = (formData.tableData["4.9.3"] || []).map((row, index) => ({
        sn: index + 1,
        event_name: row.event_name || "",
        organizing_institute: row.organizing_institute || "",
        level: row.level || "",
        date: row.date || "",
        no_of_participants: parseInt(row.no_of_participants) || 0,
        achievements: row.achievements || "",
        year: row.year || "CAYm1"
      }));

      // Format supporting documents
      const supportingDocuments = Object.keys(formData.filesByField || {}).flatMap(fieldName => {
        return (formData.filesByField[fieldName] || [])
          .filter(file => file.s3Url && file.filename)
          .map(file => ({
            file_name: file.filename,
            file_url: file.s3Url || file.url,
            description: file.description || "",
            category: fieldName
          }));
      });

      const payload = {
        other_staff_id: currentOtherStaffId,
        cycle_sub_category_id: cycle_sub_category_id,
        professional_societies_description: formData.content["4.9.1"] || "",
        publications_description: formData.content["4.9.2"] || "",
        participation_description: formData.content["4.9.3"] || "",
        participation_table: participationTable,
        supporting_documents: supportingDocuments
      };

      console.log("FINAL API CALL → payload:", payload);

      let result;
      if (recordId) {
        // Update existing record
        result = await newnbaCriteria4Service.updateCriteria4_9_Data(recordId, payload);
      } else {
        // Create new record
        result = await newnbaCriteria4Service.saveCriteria4_9_Data(payload);
      }

      const newRecordId = result.professional_activities_id || result.id;
      if (newRecordId) {
        setRecordId(newRecordId);
      }

      setAlert(
        <SweetAlert
          success
          title="Saved!"
          confirmBtnCssClass="btn-confirm"
          confirmBtnText="OK"
          onConfirm={() => {
            setAlert(null);
            loadData();
            onSaveSuccess?.();
          }}
        >
          Criterion 4.9 saved successfully!
        </SweetAlert>
      );

    } catch (err) {
      console.error("Save error:", err);
      toast.error(err.message || "Failed to save data");
      
      setAlert(
        <SweetAlert
          danger
          title="Save Failed"
          confirmBtnCssClass="btn-confirm"
          confirmBtnText="OK"
          onConfirm={() => setAlert(null)}
        >
          {err.message || "Something went wrong while saving"}
        </SweetAlert>
      );
    } finally {
      setSaving(false);
    }
  };

  // ---------------- DELETE DATA ----------------
  const handleDelete = async () => {
    if (!recordId) {
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
            await newnbaCriteria4Service.deleteCriteria4_9_Data(recordId);

            setAlert(
              <SweetAlert
                success
                title="Deleted!"
                confirmBtnCssClass="btn-confirm"
                confirmBtnText="OK"
                onConfirm={() => {
                  setAlert(null);
                  setRecordId(null);
                  loadData();
                  onSaveSuccess?.();
                }}
              >
                Criterion 4.9 deleted successfully.
              </SweetAlert>
            );
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
        This will permanently delete all Criterion 4.9 data!
      </SweetAlert>
    );
  };

  // ---------------- UI ----------------
  if (loading || (showCardView && cardLoading)) {
    return (
      <div className="flex justify-center py-20 text-xl font-medium text-white">
        Loading Criterion 4.9 (Professional Activities)...
      </div>
    );
  }

  // Show card view for coordinators
  if (showCardView) {
    return (
      <>
        <div className="space-y-4">
          {cardData && cardData.length > 0 ? (
            cardData.map((card, index) => (
              <div 
                key={index} 
                className="border rounded-lg p-4 cursor-pointer "
                onClick={() => onCardClick?.(cycle_sub_category_id, card.other_staff_id, card)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-gray-800">
                      {card.firstname} {card.lastname}
                    </h4>
                    <p className="text-sm text-gray-600">Staff ID: {card.other_staff_id}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Last Updated: {card.updated_at ? new Date(card.updated_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      card.approval_status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                      card.approval_status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {card.approval_status?.replace(/_/g, ' ') || 'Pending'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 border rounded-lg">
              No contributor submissions found for Criterion 4.9
            </div>
          )}
        </div>
        {alert}
      </>
    );
  }

  return (
    <div>
      {/* Approval Status Display */}
      {approvalStatus && approvalStatus.status && (
        <div className={`mb-6 p-4 rounded-lg ${
          approvalStatus.status === 'APPROVED' ? 'bg-green-100 text-green-800 border border-green-300' :
          approvalStatus.status === 'REJECTED' ? 'bg-red-100 text-red-800 border border-red-300' :
          'bg-yellow-100 text-yellow-800 border border-yellow-300'
        }`}>
          <div className="flex justify-between items-center">
            <div className="font-bold">
              Status: {approvalStatus.status.replace(/_/g, ' ')}
            </div>
            {approvalStatus.approvedByName && (
              <div className="text-sm">
                Approved by: {approvalStatus.approvedByName}
              </div>
            )}
          </div>
          {approvalStatus.rejectionReason && (
            <div className="mt-2 text-sm">
              <span className="font-medium">Reason:</span> {approvalStatus.rejectionReason}
            </div>
          )}
          {approvalStatus.submittedTime && (
            <div className="mt-1 text-xs text-gray-600">
              Submitted on: {new Date(approvalStatus.submittedTime).toLocaleString()}
            </div>
          )}
        </div>
      )}

      <GenericCriteriaForm4_9
        title={config.title}
        marks={config.totalMarks}
        fields={config.fields}
        initialData={initialData}
        saving={saving}
        isContributorEditable={isEditable}
        onSave={handleSave}
        onDelete={handleDelete}
      />
      {alert}
    </div>
  );
};

export default Criterion4_9Form;