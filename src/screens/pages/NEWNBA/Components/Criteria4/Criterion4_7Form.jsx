// src/screens/pages/NEWNBA/Components/Criteria4/Criterion4_7Form.jsx

import React, { useState, useEffect, useCallback } from "react";
import GenericCriteriaForm from "../GenericCriteriaForm";
import { newnbaCriteria4Service } from "../../Services/NewNBA-Criteria4.service";
import SweetAlert from "react-bootstrap-sweetalert";

const Criterion4_7Form = ({
  cycle_sub_category_id,
  isEditable = true,
  onSaveSuccess,
  programId = null,
  otherStaffId = null,
  showCardView = false,
  onCardClick = null,
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [professionalActivitiesId, setProfessionalActivitiesId] = useState(null);
  const [isContributor, setIsContributor] = useState(false);

  const [initialData, setInitialData] = useState({
    content: {},
    tableData: [],
    files: [],
  });

  const [alert, setAlert] = useState(null);
  const [cardData, setCardData] = useState([]);
    const [cardLoading, setCardLoading] = useState(false);

  // ---------------- CONFIG ----------------
  const config = {
    title:
      "4.7. Professional Activities",
    totalMarks: 25,
    fields: [
      {
        name: "4.7.1",
        label: "4.7.1 Professional Societies/ Bodies, Chapters, Clubs, and Professional Engineering Events Organized ",
        marks: 5,
        hasTable: true,
          tableConfig: {
            title: "Teaching-Learning Activities",
            columns: [
              { field: "Name of the Faculty", header: "Name of the Professional Societies/Bodies, Chapters, Clubs", placeholder: "" },
              // { field: "Name of the Proffesional Society / Bpdy at National and International Level", header: "CAYm1", placeholder: "" },
              // { field: "Name of the Grade/Level/Position", header: "CAYm2", placeholder: "" },
              // { field: "Name of the Grade/Level/Position", header: "CAYm3", placeholder: "" },
            ],
          },
      },
         {
        name: "4.7.1.2",
        label: "4.7.1.2  List of events/programs organized:  CAYm1,CAYm2,CAYm3",
        // marks: 5,
        hasTable: true,
          tableConfig: {
            title: "Teaching-Learning Activities",
            columns: [
              { field: "Professional", header: "Name of the Professional Societies/Bodies/Chapters/Clubs", placeholder: "" },
              { field: "event", header: "Name of the Event", placeholder: "" },
              { field: "level", header: "National/ International level", placeholder: "" },
              { field: "dateEvent", header: "Date of Event", placeholder: "" },
            ],
          },
      },
       {
        name: "4.7.2",
        label: "4.7.2 Student’s Participations in Professional Events",
        marks: 10,
        type: "heading",
      },
      {
        name: "4.7.2", 
        label: "4.7.2 Student’s Participations in Professional Events: CAYm1,CAYm2,CAYm3",
        marks: 10,
        hasTable: true,
          tableConfig: {
            title: "Teaching-Learning Activities",
            columns: [
              { field: "Student", header: "Name of the Student", placeholder: "" },
              { field: "Event", header: "Name of the Event", placeholder: "" },
              { field: "level", header: "State /National/International level", placeholder: "" },
              { field: "dateEvent", header: "Date of Event", placeholder: "" },
              { field: "award", header: "Name of the award if any ", placeholder: "" },
            ],
          },
      },
      {
        name: "4.7.3",
        label: "4.7.3 Publication of Journals, Magazines, Newsletters, etc. in the Department",
        marks: 5,
        type: "heading",
      },
      {
        name: "4.7.3",
        label: "4.7.3 Publication of Journals, Magazines, Newsletters, etc. in the Department:  CAYm1,CAYm2,CAYm3",
        marks: 5,
        hasTable: true,
          tableConfig: {
            title: "Teaching-Learning Activities",
            columns: [
              { field: "Newsletter", header: "Name of the Name of Journal, Magazine,Newsletter", placeholder: "" },
              { field: "Editor", header: "Name of the Editor", placeholder: "" },
              { field: "Semester", header: "Name of the Student & Semester", placeholder: "" },
              { field: "Issues", header: "NO. of the Issues", placeholder: "" },
              { field: "Soft", header: "Hard copy/Soft copy", placeholder: "" },
            ],
          },
      },
       {
        name: "4.7.4",
        label: "4.7.4 Student Publications",
        marks: 5,
        type: "heading",
      },
      {
        name: "4.7.4",
        label: "4.7.4 Student Publications:  CAYm1,CAYm2,CAYm3",
        marks: 5,
        hasTable: true,
          tableConfig: {
            title: "Teaching-Learning Activities",
            columns: [
              { field: "Semester", header: "Name of the Student & Semester", placeholder: "" },
              { field: "Publisher", header: "Name of the Publisher", placeholder: "" },
              { field: "Journal", header: "Name of the Journal/ Conference, etc. ", placeholder: "" },
              { field: "Issue", header: "Volume No. & Issue No. ", placeholder: "" },
              { field: "Award", header: "Name of the Award if any", placeholder: "" },
            ],
          },
      },
    ],
  };

  const loadContributorsData = async () => {
      if (!showCardView || !cycle_sub_category_id) return;
      
      setCardLoading(true);
      try {
        const contributorsResponse = await newnbaCriteria4Service.getAllCriteria4_7_Data?.(cycle_sub_category_id);
        setCardData(contributorsResponse || []);
      } catch (err) {
        console.error("Failed to load contributors data:", err);
        setCardData([]);
      } finally {
        setCardLoading(false);
      }
    };
  
    // Load data from API
      useEffect(() => {
        loadData();
        if (showCardView) {
          loadContributorsData();
        }
      }, [cycle_sub_category_id, programId, showCardView, otherStaffId]);

  // ---------------- LOAD DATA (Same as 2.1) ----------------
  const loadData = useCallback(async () => {
    if (!cycle_sub_category_id) return setLoading(false);

    try {
      setLoading(true);

      const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
      const userInfoo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const userIsContributor = userInfo?.rawData?.is_contributor || false;
      setIsContributor(userIsContributor);
      
      const currentOtherStaffId = otherStaffId || userInfo?.rawData?.other_staff_id || userInfo.user_id || userInfoo?.other_staff_id;

      const res = await newnbaCriteria4Service.getCriteria4_7_Data(cycle_sub_category_id, currentOtherStaffId);
      const rawResponse = res?.data || res || [];
      const d = Array.isArray(rawResponse) && rawResponse.length > 0 ? rawResponse[0] : rawResponse;

      setProfessionalActivitiesId(d.cri47_professional_activities_id || null);

      // Transform table data from API response for multiple sections
      const tablesByField = {
        "4.7.1": (d.cri4711_professional_engineering_table || []).map((row, index) => ({
          id: `row-${Date.now()}-${index}`,
          ...row
        })),
         "4.7.1.2": (d.cri4712_programs_organized_table || []).map((row, index) => ({
          id: `row-${Date.now()}-${index}`,
          ...row
        })),
        "4.7.2": (d.cri472_student_participation_table || []).map((row, index) => ({
          id: `row-${Date.now()}-${index}`,
          ...row
        })),
        "4.7.3": (d.cri473_publication_journals_table || []).map((row, index) => ({
          id: `row-${Date.now()}-${index}`,
          ...row
        })),
        "4.7.4": (d.cri474_student_publication_table || []).map((row, index) => ({
          id: `row-${Date.now()}-${index}`,
          ...row
        }))
      };

      setInitialData({
        content: { "4.7": "" },
        tableData: tablesByField,
        filesByField: {
          "4.7.1": (d.cri4711_professional_engineering_document || []).length > 0
            ? (d.cri4711_professional_engineering_document || []).map((f, i) => ({
                id: `file-4.7.1-${i}`,
                name: f.name || f.file_name || "",
                filename: f.name || f.file_name || "",
                url: f.url || f.file_url || "",
                s3Url: f.url || f.file_url || "",
                description: f.description || "",
                uploading: false
              }))
            : [{ id: `file-4.7.1-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }],
          "4.7.1.2": (d.cri4712_programs_organized_document || []).length > 0
            ? (d.cri4712_programs_organized_document || []).map((f, i) => ({
                id: `file-4.7.1.2-${i}`,
                name: f.name || f.file_name || "",
                filename: f.name || f.file_name || "",
                url: f.url || f.file_url || "",
                s3Url: f.url || f.file_url || "",
                description: f.description || "",
                uploading: false
              }))
            : [{ id: `file-4.7.1-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }],
          "4.7.2": (d.cri472_student_participation_document || []).length > 0
            ? (d.cri472_student_participation_document || []).map((f, i) => ({
                id: `file-4.7.2-${i}`,
                name: f.name || f.file_name || "",
                filename: f.name || f.file_name || "",
                url: f.url || f.file_url || "",
                s3Url: f.url || f.file_url || "",
                description: f.description || "",
                uploading: false
              }))
            : [{ id: `file-4.7.2-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }],
          "4.7.3": (d.cri473_publication_journals_document || []).length > 0
            ? (d.cri473_publication_journals_document || []).map((f, i) => ({
                id: `file-4.7.3-${i}`,
                name: f.name || f.file_name || "",
                filename: f.name || f.file_name || "",
                url: f.url || f.file_url || "",
                s3Url: f.url || f.file_url || "",
                description: f.description || "",
                uploading: false
              }))
            : [{ id: `file-4.7.3-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }],
          "4.7.4": (d.cri474_student_publication_document || []).length > 0
            ? (d.cri474_student_publication_document || []).map((f, i) => ({
                id: `file-4.7.4-${i}`,
                name: f.name || f.file_name || "",
                filename: f.name || f.file_name || "",
                url: f.url || f.file_url || "",
                s3Url: f.url || f.file_url || "",
                description: f.description || "",
                uploading: false
              }))
            : [{ id: `file-4.7.4-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }]
        }
      });
    } catch (err) {
      console.warn("Load failed:", err);

      setProfessionalActivitiesId(null);
      setInitialData({
        content: { "4.7": "" },
        tableData: [],
        filesByField: {
          "4.7.1": [{ id: `file-4.7.1-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }],
           "4.7.1.2": [{ id: `file-4.7.1.2-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }],
          "4.7.2": [{ id: `file-4.7.2-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }],
          "4.7.3": [{ id: `file-4.7.3-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }],
          "4.7.4": [{ id: `file-4.7.4-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }]
        }
      });
    } finally {
      setLoading(false);
    }
  }, [cycle_sub_category_id, otherStaffId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ---------------- SAVE DATA (Same as 2.1) ----------------
  const handleSave = async (formData) => {
    setSaving(true);

    try {
      const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
      const userInfoo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const staffId = otherStaffId || userInfo?.rawData?.other_staff_id || userInfo.user_id || userInfoo?.other_staff_id;

      // Transform filesByField → flat files with correct category
      const filesWithCategory = Object.keys(formData.filesByField || {}).flatMap(fieldName => {
        return (formData.filesByField[fieldName] || []).map(file => {
          let category = "Other";
          if (fieldName === "4.7.1") category = "Professional Engineering";
          if (fieldName === "4.7.1.2") category = "Professional Engineering1";
          if (fieldName === "4.7.2") category = "Student Participation";
          if (fieldName === "4.7.3") category = "Publication Journals";
          if (fieldName === "4.7.4") category = "Student Publication";

          return { ...file, category };
        });
      });

      const payload = {
        other_staff_id: staffId,
        cycle_sub_category_id: cycle_sub_category_id,
        cri4711_professional_engineering_table: formData.tableData?.["4.7.1"] || [],
        cri4712_programs_organized_table: formData.tableData?.["4.7.1.2"] || [],
        cri472_student_participation_table: formData.tableData?.["4.7.2"] || [],
        cri473_publication_journals_table: formData.tableData?.["4.7.3"] || [],
        cri474_student_publication_table: formData.tableData?.["4.7.4"] || [],
        
        // Document arrays
        cri4711_professional_engineering_document: filesWithCategory
          .filter(f => f.category === "Professional Engineering" && (f.url || f.s3Url) && f.filename)
          .map(f => ({ name: f.filename, url: f.s3Url || f.url, description: f.description || "" })),

        cri4712_programs_organized_document: filesWithCategory
          .filter(f => f.category === "Professional Engineering1" && (f.url || f.s3Url) && f.filename)
          .map(f => ({ name: f.filename, url: f.s3Url || f.url, description: f.description || "" })),
        
        cri472_student_participation_document: filesWithCategory
          .filter(f => f.category === "Student Participation" && (f.url || f.s3Url) && f.filename)
          .map(f => ({ name: f.filename, url: f.s3Url || f.url, description: f.description || "" })),
        
        cri473_publication_journals_document: filesWithCategory
          .filter(f => f.category === "Publication Journals" && (f.url || f.s3Url) && f.filename)
          .map(f => ({ name: f.filename, url: f.s3Url || f.url, description: f.description || "" })),
        
        cri474_student_publication_document: filesWithCategory
          .filter(f => f.category === "Student Publication" && (f.url || f.s3Url) && f.filename)
          .map(f => ({ name: f.filename, url: f.s3Url || f.url, description: f.description || "" }))
      };

      console.log("FINAL API CALL → payload:", payload);
      console.log("Files with category:", filesWithCategory);

      if (professionalActivitiesId) {
        await newnbaCriteria4Service.putCriteria4_7_Data(professionalActivitiesId, payload);
      } else {
        await newnbaCriteria4Service.saveCriteria4_7_Data(payload);
      }

      setAlert(
        <SweetAlert
          success
          title="Saved!"
          confirmBtnCssClass="btn-confirm"
          confirmBtnText="OK"
          onConfirm={() => setAlert(null)}
        >
          Criterion 4.7 saved successfully
        </SweetAlert>
      );

      onSaveSuccess?.();
      loadData();
    } catch (err) {
      console.error("Save failed:", err);

      setAlert(
        <SweetAlert
          danger
          title="Save Failed"
          confirmBtnCssClass="btn-confirm"
          confirmBtnText="OK"
          onConfirm={() => setAlert(null)}
        >
          Something went wrong while saving
        </SweetAlert>
      );
    } finally {
      setSaving(false);
    }
  };

  // ---------------- DELETE DATA (Same as 2.1) ----------------
  const handleDelete = async () => {
    if (!professionalActivitiesId) {
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
            const res = await newnbaCriteria4Service.deleteCriteria4_7Data(
              professionalActivitiesId
            );

            let message = "Criterion 4.7 deleted successfully.";
            if (typeof res === "string") message = res;
            else if (res?.data) message = res.data;

            setAlert(
              <SweetAlert
                success
                title="Deleted!"
                confirmBtnCssClass="btn-confirm"
                confirmBtnText="OK"
                onConfirm={() => setAlert(null)}
              >
                {message}
              </SweetAlert>
            );

            setProfessionalActivitiesId(null);
            loadData();
            onSaveSuccess?.();
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
        You won’t be able to revert this!
      </SweetAlert>
    );
  };

  // ---------------- UI ----------------
  if (loading || (showCardView && cardLoading)) {
    return (
      <div className="flex justify-center py-20 text-xl font-medium text-indigo-600">
        Loading Criterion 4.7...
      </div>
    );
  }

  console.log("🎯 Criterion1_1Form rendering with initialData:", initialData);

  // Show card view for coordinators
  if (showCardView) {
    return (
      <>
        <GenericCardWorkflow
          cycleSubCategoryId={cycle_sub_category_id}
          cardData={cardData}
          onCardClick={onCardClick}
          onStatusChange={loadContributorsData}
          apiService={newnbaCriteria4Service}
          cardConfig={{
            title: "Criterion 4.1",
            statusField: "approval_status",
            userField: "other_staff_id",
            nameFields: ["firstname", "lastname"],
            idField: "enrolment_ratio_id",
            isCoordinatorField: "is_coordinator_entry"
          }}
        />
        {alert}
      </>
    );
  }

  return (
    <div>
      <GenericCriteriaForm
        title={config.title}
        marks={config.totalMarks}
        fields={config.fields}
        initialData={initialData}
        saving={saving}
        isContributorEditable={isEditable}
        showFileCategories={true}
        onSave={handleSave}
        onDelete={handleDelete}
      />

      {alert}
    </div>
  );
};

export default Criterion4_7Form;
