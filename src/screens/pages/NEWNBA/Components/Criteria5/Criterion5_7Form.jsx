import React, { useState, useEffect, useCallback } from "react";
import GenericCriteriaForm5_7 from "../Criteria5/GenericCriteriaForm5_7";
import { newnbaCriteria5Service } from "../../Services/NewNBA-Criteria5.service";
import { toast } from "react-toastify";
import SweetAlert from "react-bootstrap-sweetalert";
import StatusBadge from "../StatusBadge";
import { TrendingUp, BookOpen, Briefcase, Wrench } from "lucide-react";

const Criterion5_7Form = ({
  cycle_sub_category_id,
  other_staff_id,
  isEditable = true,
  onSaveSuccess,
  cardItem = null,
}) => {
  console.log("🔵 Criterion5_7Form props:", {
    cycle_sub_category_id,
    other_staff_id,
    isEditable
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [recordId, setRecordId] = useState(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [approvalStatus, setApprovalStatus] = useState(null);
  const [userRole, setUserRole] = useState({});
  const [contributorName, setContributorName] = useState("");

  const [initialData, setInitialData] = useState({
    content: {
      "5.7.1": "Academic Research: Provide information like academic research activities, including the number of research paper publications, the count of students who received a Ph.D. or were guided for a Ph.D., and the number of faculty members who completed a Ph.D. during the assessment period",
      "5.7.2": "Sponsored Research: Provide a comprehensive list of funded research projects received from external sources. Include the following details for each project: The Principal Investigator (PI) name, project title, Funding Agency, Amount, Duration, and the cumulative funding amount received during academic years (AYm1, AYm2, and AYm3).",
      "5.7.3": "Consultancy: Provide a comprehensive list of consultancy projects received from industry or government sources. Include the following details for each project: The Principal Investigator (PI) name, project title, funding agency along with the date of the award, the initial amount and duration, and the cumulative funding amount received during academic years (AYm1, AYm2, and AYm3).",
      "5.7.4": "Development Activities: Provide details about Design Development, Product Development, Professional Development, Instructional materials, Working models/charts/monograms etc., and Community development activities."
    },
    tableData: {
      academicResearch: [],
      sponsoredResearch: [],
      consultancy: [],
      developmentActivities: []
    },
    filesByField: {},
  });

  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    setUserRole(userInfo);
  }, []);

  // ---------------- CONFIG ----------------
  const config = {
    title: "5.7. Research and Development (45)",
    totalMarks: 45,
    fields: [
      {
        name: "5.7.1",
        label: "5.7.1 Academic Research (5)",
        marks: 5,
        hasTable: true,
        tableKey: "academicResearch",
        tableConfig: {
          title: "Academic Research Details",
          description: "Research publications, Ph.D. students, and faculty achievements"
        },
      },
      {
        name: "5.7.2",
        label: "5.7.2 Sponsored Research (10)",
        marks: 10,
        hasTable: true,
        tableKey: "sponsoredResearch",
        tableConfig: {
          title: "Sponsored Research Projects",
          description: "Funded research projects from external sources"
        },
      },
      {
        name: "5.7.3",
        label: "5.7.3 Consultancy (15)",
        marks: 15,
        hasTable: true,
        tableKey: "consultancy",
        tableConfig: {
          title: "Table No.5.7.3. List of consultancy works for the past 3 years",
          description: "Consultancy projects from industry/government"
        },
      },
      {
        name: "5.7.4",
        label: "5.7.4 Development Activities (15)",
        marks: 15,
        hasTable: true,
        tableKey: "developmentActivities",
        tableConfig: {
          title: "Development Activities",
          description: "Design, product, professional, instructional, and community development"
        },
      },
    ],
  };

  // ---------------- LOAD DATA ----------------
  const loadData = useCallback(async () => {
    if (!cycle_sub_category_id) {
      console.log("⏸️ Skipping load - missing cycle_sub_category_id");
      setLoading(false);
      return;
    }

    const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
    const userInfo2 = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const staffIdToUse = other_staff_id || userInfo?.rawData?.other_staff_id || userInfo2?.other_staff_id;
    
    console.log("🎯 Criterion5_7Form - Final staffId:", staffIdToUse);

    if (!staffIdToUse) {
      console.log("❌ Criterion5_7Form - No staffId found, using empty data");
      setInitialData({
        content: {
          "5.7.1": "",
          "5.7.2": "",
          "5.7.3": "",
          "5.7.4": ""
        },
        tableData: {
          academicResearch: [],
          sponsoredResearch: [],
          consultancy: [],
          developmentActivities: []
        },
        filesByField: {}
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log("📡 Criterion5_7Form - Making API call with:");
      console.log("  - cycle_sub_category_id:", cycle_sub_category_id);
      console.log("  - staffId:", staffIdToUse);
      
      // TODO: Replace with actual API call for 5.7
      const response = await newnbaCriteria5Service.getCriteria5_7_Data(cycle_sub_category_id, staffIdToUse);
      console.log("📊 Criterion5_7Form - Raw API Response:", response);
      
      let data = {};
      if (Array.isArray(response?.data)) {
        data = response.data.find(item => item && (item.research_dev_id || item.criteria5_7_id || item.id)) || {};
      } else if (response?.data) {
        data = response.data;
      } else if (response && !response.data) {
        data = Array.isArray(response) ? (response.find(item => item && (item.research_dev_id || item.criteria5_7_id || item.id)) || {}) : response;
      }

      if (data.research_dev_id || data.criteria5_7_id || data.id) {
        const newRecordId = data.research_dev_id || data.criteria5_7_id || data.id;
        setRecordId(newRecordId);
        console.log("✅ Record ID set to:", newRecordId);

        const statusData = cardItem || data;
        if (statusData.approval_status) {
          setApprovalStatus({
            status: statusData.approval_status,
            rejectionReason: statusData.rejection_reason,
            approvalReason: statusData.approval_status === 'APPROVED' ? statusData.rejection_reason : null,
            approvedByName: statusData.approved_by_name,
            submittedTime: statusData.submitted_time
          });
        }

        // Set approval status if available
        if (data.approval_status) {
          setApprovalStatus({
            status: data.approval_status,
            rejectionReason: data.rejection_reason,
            approvalReason: data.approval_status === 'APPROVED' ? data.rejection_reason : null,
            approvedByName: data.approved_by_name,
            submittedTime: data.submitted_time
          });
        }
        
        // Parse table data
        let academicResearchData = [];
        let sponsoredResearchData = [];
        let consultancyData = [];
        let developmentActivitiesData = [];
        let filesByField = {};

        // Handle academic research data
        if (data.academic_research && Array.isArray(data.academic_research)) {
          academicResearchData = data.academic_research;
        }

        // Handle sponsored research data
        if (data.sponsored_research && Array.isArray(data.sponsored_research)) {
          sponsoredResearchData = data.sponsored_research;
        }

        // Handle consultancy data
        if (data.consultancy && Array.isArray(data.consultancy)) {
          consultancyData = data.consultancy;
        }

        // Handle development activities data
        if (data.development_activities && Array.isArray(data.development_activities)) {
          developmentActivitiesData = data.development_activities;
        }

        // Handle files
        if (data.supporting_documents && Array.isArray(data.supporting_documents)) {
          data.supporting_documents.forEach(doc => {
            const fieldName = doc.field_name || "5.7.1";
            if (!filesByField[fieldName]) {
              filesByField[fieldName] = [];
            }
            filesByField[fieldName].push({
              id: `file-${Date.now()}-${Math.random()}`,
              filename: doc.file_name,
              s3Url: doc.s3_url || doc.file_url,
              description: doc.description || "",
              uploading: false
            });
          });
        }

        setInitialData({
          content: {
            "5.7.1": data.description_5_7_1 || "",
            "5.7.2": data.description_5_7_2 || "",
            "5.7.3": data.description_5_7_3 || "",
            "5.7.4": data.description_5_7_4 || ""
          },
          tableData: {
            academicResearch: academicResearchData,
            sponsoredResearch: sponsoredResearchData,
            consultancy: consultancyData,
            developmentActivities: developmentActivitiesData
          },
          filesByField: filesByField
        });
      } else {
        // No existing data, use defaults
        setApprovalStatus(null);
        setContributorName("");
        setInitialData({
          content: {
            "5.7.1": "",
            "5.7.2": "",
            "5.7.3": "",
            "5.7.4": ""
          },
          tableData: {
            academicResearch: [],
            sponsoredResearch: [],
            consultancy: [],
            developmentActivities: []
          },
          filesByField: {}
        });
      }

    } catch (err) {
      console.error("Load failed:", err);
      toast.error("Failed to load saved data");
      // Set defaults on error
      setInitialData({
        content: {
          "5.7.1": "",
          "5.7.2": "",
          "5.7.3": "",
          "5.7.4": ""
        },
        tableData: {
          academicResearch: [],
          sponsoredResearch: [],
          consultancy: [],
          developmentActivities: []
        },
        filesByField: {}
      });
    } finally {
      setLoading(false);
    }
  }, [cycle_sub_category_id, other_staff_id]);

  useEffect(() => {
    if (cycle_sub_category_id) {
      console.log("🚀 useEffect triggered, loading data...");
      loadData();
    } else {
      console.log("⏸️ Skipping load - missing cycle_sub_category_id:", { cycle_sub_category_id, other_staff_id });
      setLoading(false);
    }
  }, [loadData, cycle_sub_category_id, other_staff_id]);

  // ---------------- SAVE DATA ----------------
  const handleSave = async (formData) => {
    if (!isEditable) {
      toast.error("You don't have permission to edit");
      return;
    }

    setSaveLoading(true);
    try {
      // Transform UI data to API format
      const academic_research = formData.tableData?.academicResearch?.map(row => ({
        type: row.type,
        description: row.description,
        count: row.count
      })) || [];

      const sponsored_research = formData.tableData?.sponsoredResearch?.map(row => ({
        pi_name: row.pi_name,
        project_title: row.project_title,
        funding_agency: row.funding_agency,
        amount: row.amount
      })) || [];

      const consultancy = formData.tableData?.consultancy?.map(yearData => ({
        year: yearData.year,
        projects: yearData.projects,
        totalAmount: yearData.totalAmount,
        marks: yearData.marks
      })) || [];

      const development_activities = formData.tableData?.developmentActivities?.map(activity => ({
        category: activity.category,
        description: activity.description,
        details: activity.details
      })) || [];

      // Transform supporting documents
      const supporting_documents = [];
      if (formData.filesByField) {
        Object.entries(formData.filesByField).forEach(([fieldName, files]) => {
          files.forEach(file => {
            if (file.s3Url) {
              supporting_documents.push({
                field_name: fieldName,
                file_name: file.filename || "",
                s3_url: file.s3Url,
                description: file.description || ""
              });
            }
          });
        });
      }

      const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
      const userInfo2 = JSON.parse(localStorage.getItem("userInfo") || "{}");
    
      const staffId = userInfo?.rawData?.other_staff_id || userInfo2?.other_staff_id;

      const payload = {
        other_staff_id: parseInt(staffId),
        cycle_sub_category_id: parseInt(cycle_sub_category_id),
        description_5_7_1: formData.content?.["5.7.1"] || "",
        description_5_7_2: formData.content?.["5.7.2"] || "",
        description_5_7_3: formData.content?.["5.7.3"] || "",
        description_5_7_4: formData.content?.["5.7.4"] || "",
        academic_research,
        sponsored_research,
        consultancy,
        development_activities,
        supporting_documents
      };

      console.log("🚀 Saving Criterion 5.7 payload:", payload);

      let response;
      if (recordId) {
        // Update existing record
        response = await newnbaCriteria5Service.updateCriteria5_7_Data(recordId, payload);
        console.log("✅ Update response:", response);
        setSuccessMessage("Section updated successfully!");
      } else {
        // Create new record
        response = await newnbaCriteria5Service.saveCriteria5_7_Data(payload, staffId);
        console.log("✅ Save response:", response);
        
        // Set recordId from response for future updates
        if (response?.data?.research_dev_id || response?.data?.id) {
          setRecordId(response.data.research_dev_id || response.data.id);
        } else if (response?.research_dev_id || response?.id) {
          setRecordId(response.research_dev_id || response.id);
        }
        
        setSuccessMessage("Section created successfully!");
      }

      // Update initialData state immediately
      setInitialData({
        content: formData.content,
        tableData: formData.tableData,
        filesByField: formData.filesByField || {}
      });

      setShowSuccessAlert(true);
      onSaveSuccess?.();
      loadData();
    } catch (err) {
      console.error("Save failed:", err);
      toast.error(err.message || "Failed to save");
    } finally {
      setSaveLoading(false);
    }
  };

  // ---------------- DELETE DATA ----------------
  const handleDelete = async () => {
    const idToDelete = recordId;
    
    console.log("🗑️ Delete function called:", idToDelete);
  
    if (!idToDelete) {
      console.warn("⚠️ No ID available for deletion");
      setAlert(
        <SweetAlert info title="No Data to Delete" onConfirm={() => setAlert(null)}>
          There is no saved data to delete.
        </SweetAlert>
      );
      return;
    }
    setShowDeleteAlert(true);
  };

  const confirmDelete = async () => {
    try {
      await newnbaCriteria5Service.deleteCriteria5_7Data(recordId);
  
      toast.success("✅ Section data deleted successfully!");
  
      // Reset everything
      setRecordId(null);
      setApprovalStatus(null);
      setContributorName("");
  
      setInitialData({
        content: {
          "5.7.1": "",
          "5.7.2": "",
          "5.7.3": "",
          "5.7.4": ""
        },
        tableData: {
          academicResearch: [],
          sponsoredResearch: [],
          consultancy: [],
          developmentActivities: []
        },
        filesByField: {}
      });
  
      setShowDeleteAlert(false);
      await loadData();
      onSaveSuccess?.();

    } catch (err) {
      console.error("Delete error:", err);
      toast.error(
        err.response?.data?.message ||
        "❌ Failed to delete data. Please try again."
      );
      setShowDeleteAlert(false);
    }
  };
  

  const cancelDelete = () => {
    setShowDeleteAlert(false);
    toast.info("Delete operation cancelled.");
  };

  // ---------------- UI ----------------
  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-2xl text-purple-600 font-medium">
        Loading 5.7. Research and Development...
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
          </div>
        </div>
      )}

      <GenericCriteriaForm5_7
        title={config.title}
        marks={config.totalMarks}
        fields={config.fields}
        initialData={initialData}
        saving={saveLoading}
        isCompleted={false}
        isContributorEditable={isEditable}
        onSave={handleSave}
        onDelete={handleDelete}
      />
      
      {showDeleteAlert && (
        <SweetAlert
          warning
          showCancel
          confirmBtnText="Yes, Delete!"
          cancelBtnText="Cancel"
          confirmBtnBsStyle="danger"
          cancelBtnBsStyle="default"
          title="Delete Confirmation"
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        >
          <div className="text-left">
            <p className="mb-3">Are you sure you want to delete all data for this section?</p>
          </div>
        </SweetAlert>
      )}

      {showSuccessAlert && (
        <SweetAlert
          success
          confirmBtnText="OK"
          confirmBtnBsStyle="success"
          title="Success!"
          onConfirm={() => {
            setShowSuccessAlert(false);
            onSaveSuccess?.();
            loadData();
          }}
        >
          <div className="text-center">
            <p className="mb-3">{successMessage}</p>
            <div className="text-sm text-gray-600">
              <p>✅ Data has been saved successfully</p>
            </div>
          </div>
        </SweetAlert>
      )}
    </div>
  );
};

export default Criterion5_7Form;