import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import GenericCriteriaForm from "./GenericCriteriaForm";
import StatusBadge from "./StatusBadge";
import { newnbaCriteria7Service } from "../Services/NewNBA-Criteria7.service";
import { newnbaCriteria7_2_Service } from "../Services/NewNBA-Criteria7_2.service";
import { newnbaCriteria7_3_Service } from "../Services/NewNBA-Criteria7_3.service";
import { newnbaCriteria7_4_Service } from "../Services/NewNBA-Criteria7_4.service";
import { newnbaCriteria7_5_Service } from "../Services/NewNBA-Criteria7_5.service";

const CriterionForm = ({
  section,
  nba_accredited_program_id,
  academic_year,
  nba_criteria_sub_level2_id,
  contributor_allocation_id: nba_contributor_allocation_id,
  completed = false,
  isContributorEditable = true,
  otherStaffId = null, // For coordinator viewing specific contributor's data
  editMode = false, // For editing existing entries
  innovationLabId = null, // For PUT operations
}) => {

  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState(null);
  const [currentInnovationLabId, setCurrentInnovationLabId] = useState(innovationLabId);
  const [userRole, setUserRole] = useState("");
  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const roles = userInfo || {};
    setUserRole(roles);
  }, []);

  const sectionConfig = {
  
    "7.1": {
      title: "7.1. Adequate and Well-Equipped Laboratories and Technical Manpower",
      totalMarks: 50,
      fields: [
        {
          name: "7.1.1",
          label: "7.1.1 Adequate and Well-Equipped Laboratories and Technical Manpower ",
          marks: 50,
          hasTable: true,
          tableConfig: {
            title: "Teaching-Learning Activities",
            columns: [
              { field: "laboratory_name", header: "Name of the Laboratories", placeholder: "" },
              { field: "batch_size", header: "Number of the Students per Setup(Batch Size)", placeholder: "" },
              { field: "major_equipment", header: "Name of the Major equipment", placeholder: "" },
              { field: "weekly_utilization", header: "Weekly utilization status(all the courses for which the lab is utilized)", placeholder: "" },
              { field: "technical_manpower", header: "Technical Manpower support", placeholder: "" },
            ],
          },
        },
      ],
    },
    "7.2": {
      title: "7.2. Additional Facilities Created for Improving the Quality of Learning Experience in Laboratories",
      totalMarks: 20,
      fields: [
        {
          // name: "7.2.1",
          // label: "7.2.1 Additional Facilities Created for Improving the Quality of Learning Experience in Laboratories ",
          // marks: 20,
          hasTable: true,
          tableConfig: {
            title: "List of Additional Facilities",
            columns: [
              { field: "name_of_facility", header: "Name of the Facility", placeholder: "Enter name" },
              { field: "details", header: "Details", placeholder: "Details" },
              { field: "purpose_creating_facility", header: "Purpose for creating Facility", placeholder: "Purpose" },
              { field: "utilization", header: "Utilization", placeholder: "Utilization" },
              { field: "relevance", header: "Relevance to POs/PSOs", placeholder: "Relevance" },
            ],
          },
        },
      ],
    },
    "7.3": {
      title: "7.3. Maintenance of Laboratories and Overall Ambiance",
      totalMarks: 10,
      fields: [ 
        { name: "7.3", label: "7.3.1 Mainenance of Laboratories and Overall Ambiance", marks: 10 },
      ],
    },
    "7.4": {
      title: "7.4. Safety Measures in Laboratories",
      totalMarks: 10,
      fields: [
        {
          name: "7.4",
          // label: "7.4 Safety Measures in Laboratories ",
          // marks: 10,
          hasTable: true,
          tableConfig: {
            title: "List of various safety measures in laboratories",
            columns: [
              { field: "laboratory_name", header: "Name of the Laboratory", placeholder: "Enter name" },
              // { field: "laboratory_type", header: "Type of Laboratory", placeholder: "" },
              { field: "safety_measures", header: "Safety measures", placeholder: "Safety Measures" },
            ],
          },
        },
      ],
    },
    "7.5": {
      title: "7.5. Project Laboratory/Research Laboratory",
      totalMarks: 10,
      fields: [
        {
          name: "7.5",
          // label: "7.5.1 Adequate and Well-Equipped Laboratories and Technical Manpower ",
          // marks: 10,
          hasTable: true,
          tableConfig: {
            title: "List of project laboratory/research laboratory/Centre of Excellence",
            columns: [
              { field: "laboratory_name", header: "Name of the Laboratory", placeholder: "" },
            ],
          },
        },
      ],
    },

  }

  const sectionPayloadConfig = {
  "7.1": {
    mapPayload: (data, staffId, ids) => ({
      cycleSubCategoryId: ids.subLevelId,
      otherStaffId: staffId,
      innovationLabDetails: data.content?.["7.1.1"] || "",
      innovationLabProjectTable: data.tableData || [],
      innovationLabStartupTable: [],
      innovationLabDocument: Object.values(data?.filesByField || {})
        .flat()
        .map(f => ({
          filename: f.filename,
          url: f.s3Url || f.url,
          description: f.description
        })),
      isCoordinatorEntry: !ids.contributorAllocationId
    }),
    mapResponse: (data) => ({
      content: {
                "7.1.1": data.innovation_lab_details || "",
                data: data.innovation_lab_details || ""
              },
      tableData: [
                ...(data.innovation_lab_project_table || []),
                ...(data.innovation_lab_startup_table || [])
              ],
      filesByField: {
        "7.1.1": (data.innovation_lab_document || []).map((file, i) => ({
          id: file.id || `file-${i}`,
          description: file.description || "",
          filename: file.filename || "",
          url: file.url,
          s3Url: file.url,
        }))
      }
    }),
    save: newnbaCriteria7Service.saveCriteria7_1_Data,
    update: newnbaCriteria7Service.updateInnovationLab,
    refresh: newnbaCriteria7Service.getCriteria7_1_Data,
    delete: newnbaCriteria7Service.deleteInnovationLab,
  },

  "7.2": {
    mapPayload: (data, staffId, ids) => ({
      cycleSubCategoryId: ids.subLevelId,
      otherStaffId: staffId,
      facility_details: data.content?.["7.2.1"] || "",
      facility_table: data.tableData || [],
      facility_document: Object.values(data.filesByField || {})
        .flat()
        .map(f => ({
          filename: f.filename,
          url: f.s3Url || f.url,
          description: f.description
        })),
      isCoordinatorEntry: !ids.contributorAllocationId
    }),
    mapResponse: (data) => ({
      id: data.lab_learning_facilities_id,
      content: {
        "7.2.1": data.facility_details || "",
      },
      tableData: data.facility_table || [],
      filesByField: {
        "7.2.1": (data.facility_document || []).map((file, i) => ({
          id: file.id || `file-${i}`,
          filename: file.filename,
          url: file.url,
          s3Url: file.url,
          description: file.description || ""
        }))
      }
    }),
    save: newnbaCriteria7_2_Service.saveCriteria7_2_Data,
    update: newnbaCriteria7_2_Service.updateCriteria7_2,
    refresh: newnbaCriteria7_2_Service.getCriteria7_2_Data, 
    delete: newnbaCriteria7_2_Service.deleteCriteria7_2,
  },

  "7.3": {
  mapPayload: (data, staffId, ids) => ({
    cycleSubCategoryId: ids.subLevelId,
    otherStaffId: staffId,
    maintenance_details: data.content?.["7.3"] || "",
    maintenance_document: Object.values(data.filesByField || {}).flat().map(f => ({
      filename: f.filename,
      url: f.s3Url || f.url,
      description: f.description
    })),
    isCoordinatorEntry: !ids.contributorAllocationId
  }),

  mapResponse: (data) => ({
    id: data.lab_maintenance_id,
    content: {
      "7.3": data.maintenance_details || ""
    },
    tableData: [],
    filesByField: {
      "7.3": (data.maintenance_document || []).map((file, i) => ({
        id: file.id || `file-${i}`,
        filename: file.filename,
        url: file.url,
        s3Url: file.url,
        description: file.description || ""
      }))
    }
  }),

  save: newnbaCriteria7_3_Service.saveCriteria7_3_Data,
  update: newnbaCriteria7_3_Service.updateCriteria7_3,
  refresh: newnbaCriteria7_3_Service.getCriteria7_3_Data,
  delete: newnbaCriteria7_3_Service.deleteCriteria7_3
},

  "7.4": {
  mapPayload: (data, staffId, ids) => ({
    cycleSubCategoryId: ids.subLevelId,
    otherStaffId: staffId,
    lab_safety_table: data.tableData || [],
    lab_safety_document: Object.values(data.filesByField || {}).flat().map(f => ({
      filename: f.filename,
      url: f.s3Url || f.url,
      description: f.description
    })),
    isCoordinatorEntry: !ids.contributorAllocationId
  }),

  mapResponse: (data) => ({
    id: data.lab_safety_id,
    content: {},
    tableData: data.lab_safety_table || [],
    filesByField: {
      "7.4": (data.lab_safety_document || []).map((file, i) => ({
        id: file.id || `file-${i}`,
        filename: file.filename,
        url: file.url,
        s3Url: file.url,
        description: file.description || ""
      }))
    }
  }),

  save: newnbaCriteria7_4_Service.saveCriteria7_4_Data,
  update: newnbaCriteria7_4_Service.updateCriteria7_4,
  refresh: newnbaCriteria7_4_Service.getCriteria7_4_Data,
  delete: newnbaCriteria7_4_Service.deleteCriteria7_4
},

  "7.5": {
  mapPayload: (data, staffId, ids) => ({
    cycleSubCategoryId: ids.subLevelId,
    otherStaffId: staffId,
    project_table: data.tableData || [],
    documents: Object.values(data.filesByField || {}).flat().map(f => ({
      filename: f.filename,
      url: f.url,
      description: f.description
    })),
    isCoordinatorEntry: !ids.contributorAllocationId
  }),

  mapResponse: (data) => ({
    id: data.project_research_lab_id,
    content: {},
    tableData: data.project_table || [],
    filesByField: {
      "7.5": (data.documents || []).map((file, i) => ({
        id: file.id || `file-${i}`,
        filename: file.filename,
        url: file.url,
        s3Url: file.url,
        description: file.description || ""
      }))
    }
  }),

  save: newnbaCriteria7_5_Service.saveCriteria7_5_Data,
  update: newnbaCriteria7_5_Service.updateCriteria7_5,
  refresh: newnbaCriteria7_5_Service.getCriteria7_5_Data,
  delete: newnbaCriteria7_5_Service.deleteCriteria7_5
}
};






  const config = sectionConfig[section];

  useEffect(() => {
  const loadData = async () => {
    if (!nba_criteria_sub_level2_id || !section) {
      setInitialData({ content: {}, tableData: [], files: [] });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

        // Use provided otherStaffId or get from current user info
      let staffId = otherStaffId;
      if (!staffId) {
        const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
            const userInfoo = JSON.parse(localStorage.getItem("userInfo") || "{}");
          staffId = userInfo?.rawData?.other_staff_id || userInfo.user_id || userInfoo?.other_staff_id;
      }

      const config = sectionPayloadConfig[section];
      if (!config?.refresh) {
        setInitialData({ content: {}, tableData: [], files: [] });
          setLoading(false);
        return;
      }

      const response = await config.refresh(nba_criteria_sub_level2_id, staffId);

      const dataItem = Array.isArray(response) ? response[0] : response;

      if (dataItem && config.mapResponse) {
        const transformed = config.mapResponse(dataItem);

        setInitialData(transformed);

        // store record ID for PUT updates
        if (dataItem.id || dataItem.innovation_lab_id || dataItem.lab_learning_facilities_id || dataItem.lab_maintenance_id || dataItem.lab_safety_id || dataItem.project_research_lab_id) {
          setCurrentInnovationLabId(dataItem.id || dataItem.innovation_lab_id || dataItem.lab_learning_facilities_id  || dataItem.lab_maintenance_id || dataItem.lab_safety_id || dataItem.project_research_lab_id);
        }

            

            // Set approval status if available
        if (dataItem.approval_status) {
          setApprovalStatus({
            status: dataItem.approval_status,
            rejectionReason: dataItem.rejection_reason,
                approvalReason: dataItem.approval_status === 'APPROVED' ? dataItem.rejection_reason : null,
            approvedByName: dataItem.approved_by_name
          });

        }
      } else {
            
        setInitialData({ content: {}, tableData: [], files: [] });
      }

    } catch (err) {
        toast.error("Failed to load saved data");
      setInitialData({ content: {}, tableData: [], files: [] });
    } finally {
      setLoading(false);
    }
  };

  loadData();
  }, [section, nba_accredited_program_id, nba_criteria_sub_level2_id, nba_contributor_allocation_id, otherStaffId]);

  const handleSave = async (data) => {
    console.log("🚀 handleSave called with data:", data);
  console.log("🔍 isContributorEditable:", isContributorEditable);
    console.log("🔍 section:", section);

    if (!isContributorEditable && userRole.nba_contributor === true) {
      console.log("❌ Permission denied - not editable");
      toast.error("You don't have permission to edit");
      return;
    }

    console.log("✅ Starting save process...");

  const config = sectionPayloadConfig[section];

  if (!config) {
    toast.error(`Save not implemented for Section ${section}`);
    return;
  }

  try {
    setSaveLoading(true);

    // Extract logged-in user
    const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
    const userInfo2 = JSON.parse(localStorage.getItem("userInfo") || "{}");

    const staffId = otherStaffId || userInfo?.rawData?.other_staff_id || userInfo.user_id || userInfo2?.other_staff_id;

    const payload = config.mapPayload(data, staffId, {
      subLevelId: nba_criteria_sub_level2_id,
      contributorAllocationId: nba_contributor_allocation_id
    });

        console.log("📦 Payload to be sent:", payload);

    // POST or PUT depending if entry exists
    const exists = currentInnovationLabId || innovationLabId;
    console.log("exists", exists);
    const response = exists
      ? await config.update(exists, payload)
      : await config.save(payload);

    const successMessage = exists ?
          "✅ Innovation Lab data updated successfully!" :
          "✅ Innovation Lab data saved successfully!";

        toast.success(successMessage, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

    // Refresh
    const refreshed = await config.refresh(nba_criteria_sub_level2_id, staffId);
    const refreshedItem = Array.isArray(refreshed) ? refreshed[0] : refreshed;

    setInitialData({
      content: data.content,
      tableData: data.tableData,
      files: Object.values(data.filesByField || {}).flat()
    });

    // Store new ID if needed
    const newId = 
      refreshedItem?.id || 
      refreshedItem?.innovation_lab_id || 
      refreshedItem?.facility_id;

    if (newId) {
      setCurrentInnovationLabId(newId);
    }

    // Update approval status from refreshed data
    if (refreshedItem.approval_status) {
            setApprovalStatus({
              status: refreshedItem.approval_status,
              rejectionReason: refreshedItem.rejection_reason,
              approvalReason: refreshedItem.approval_status === 'APPROVED' ? refreshedItem.rejection_reason : null,
              approvedByName: refreshedItem.approved_by_name
            });
    console.log("✅ Data refresh completed successfully");
    } else {
          console.log("⚠️ No refreshed data item found");
        }
  } catch (err) {
      console.error("💥 Save failed:", err);
      console.error("💥 Error details:", err.message, err.stack);

      // Show detailed error message
      const errorMessage = err.message || "Failed to save Innovation Lab data";
      toast.error(`❌ ${errorMessage}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Log additional error context
      if (err.response) {
        console.error("💥 API Response Error:", err.response);
        toast.error(`🔥 API Error: ${err.response.status} - ${err.response.statusText}`, {
          position: "top-right",
          autoClose: 5000,
        });
      } else if (err.request) {
        console.error("💥 Network Error:", err.request);
        toast.error("🌐 Network Error: Unable to reach server", {
          position: "top-right",
          autoClose: 5000,
        });
      }
  } finally {
    setSaveLoading(false);
  }
};


  const handleDelete = async () => {
  if (!currentInnovationLabId && !innovationLabId) {
    toast.error("❌ No record available to delete");
    return;
  }

  const config = sectionPayloadConfig[section];

  if (!config || !config.delete) {
    toast.error(`❌ Delete not implemented for section ${section}`);
    return;
  }

  const recordId = currentInnovationLabId || innovationLabId;

  const confirmed = await Swal.fire({
    title: "Are you sure?",
    text: `This will permanently delete data for Section ${section}.`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it!",
  });

  if (!confirmed.isConfirmed) {
    return;
  }

  try {
    setSaveLoading(true);

    await config.delete(recordId);
       Swal.fire("Deleted!", "Entry has been deleted.", "success");

    // Reset state
    setInitialData(null); // Clear UI
    setCurrentInnovationLabId(null); // temporary reset


    // Refresh UI if needed
    const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
    const staffId = userInfo?.rawData?.other_staff_id || userInfo.user_id;
    const refreshed = await config.refresh(nba_criteria_sub_level2_id, staffId);
    const refreshedItem = Array.isArray(refreshed) ? refreshed[0] : refreshed;

    if (refreshedItem) {
    const newId = 
      refreshedItem.id ||
      refreshedItem.innovation_lab_id ||
      refreshedItem.lab_learning_facilities_id ||
      refreshedItem.lab_maintenance_id ||
      refreshedItem.lab_safety_id ||
      refreshedItem.project_research_lab_id;

    setCurrentInnovationLabId(newId);

    setInitialData(config.mapResponse(refreshedItem));
  } else {
    // No more records exist → form becomes fresh entry
    setInitialData({
      content: {},
      tableData: [],
      files: []
    });

    setCurrentInnovationLabId(null);
  }

  } catch (err) {
    console.error("❌ Delete error →", err);
    toast.error(`❌ Delete failed: ${err.message}`);
  } finally {
    setSaveLoading(false);
  }
};


  if (!config) {
    return <div className="p-12 text-center text-red-600 text-2xl font-bold bg-red-50 rounded-xl">Section {section} not configured</div>;
  }

  if (loading) {
    return <div className="flex items-center justify-center py-32 text-2xl text-indigo-600 font-medium">Loading {config.title}...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Show approval status if available - but hide for coordinator's own entries */}
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

      {/* Main form */}
      <GenericCriteriaForm
        title={config.title}
        marks={config.totalMarks}
        fields={config.fields || []}
        tableConfig={config.tableConfig || null}
        initialData={initialData}
        onSave={handleSave}
        onDelete={currentInnovationLabId ? handleDelete : null}
        isCompleted={completed}
        isContributorEditable={
    // if no existing record → editable
    !currentInnovationLabId
      ? true
      : // if record exists → editable only when editMode=true
        editMode
  }
        saving={saveLoading}
        hasExistingData={!!currentInnovationLabId}
      />
    </div>
  );
};

export default CriterionForm;