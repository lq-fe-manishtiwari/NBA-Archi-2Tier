import React, { useState, useEffect, useCallback } from "react";
import GenericCriteriaForm from "../GenericCriteriaForm";
import { newnbaCriteria6Service } from "../../Services/NewNBA-Criteria6.service";
import SweetAlert from "react-bootstrap-sweetalert";

const Criterion6_5Form = ({
  cycle_sub_category_id,
  isEditable = true,
  onSaveSuccess,
  programId = null,
  otherStaffId = null,
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);
  const [criterionId, setCriterionId] = useState(null);

  const [initialData, setInitialData] = useState({
    content: {
      staff_availability_info: "",
      incentives_info: "",
    },
    tableData: {
      technicalStaffTable: [],
    },
    filesByField: {
      technicalStaffTable: [],
      incentives_info: [],
      staff_availability_info:[],
    },
  });

  // ────────────────────────────────────────────────
  // CONFIG
  // ────────────────────────────────────────────────
  const config = {
    title: "6.5 Non-Teaching Support (20)",
    totalMarks: 20,
    fields: [
      {
        name: "technicalStaffTable",
        label: "List of Technical / Non-Teaching Supporting Staff",
        hasTable: true,
        tableConfig: {
          columns: [
            { field: "sno", header: "S.No", readOnly: true },
            { field: "name", header: "Name" },
            { field: "designation", header: "Designation" },
            { field: "date_of_joining", header: "Date of Joining" },
            { field: "qualification_at_joining", header: "Qualification at Joining" },
            { field: "qualification_now", header: "Present Qualification" },
            { field: "other_skills", header: "Other Skills / Certifications" },
            { field: "responsibility", header: "Responsibility / Lab Assigned" },
          ],
          allowAddRemoveRows: true,
        },
      },
      {
        name: "staff_availability_info",
        label: "6.5.1 Availability of Adequate and Qualified Technical Supporting Staff (15)",
        type: "richText",
        hasFileUpload: true,
        marks: 15,
      },
      {
        name: "incentives_info",
        label: "6.5.2 Incentives, Skill Upgrade, and Professional Advancement (5)",
        type: "richText",
        hasFileUpload: true,
        marks: 5,
      },
    ],
  };

  // ────────────────────────────────────────────────
  // Helpers
  // ────────────────────────────────────────────────
  const resolveStaffId = () => {
    const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}");
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    return (
      otherStaffId ||
      userInfo?.other_staff_id ||
      userProfile?.rawData?.other_staff_id ||
      userProfile?.user_id ||
      userInfo?.user_id
    );
  };

  const mapToFileObjects = (docs = []) =>
    docs?.length > 0
      ? docs.map((f, i) => ({
          id: `file-${Date.now()}-${i}`,
          filename: f.file_name || f.name || "",
          s3Url: f.file_url || f.url || "",
          description: f.description || "",
          uploading: false,
        }))
      : [];

  // Force at least one empty file row in UI (even if backend returns empty array)
  const ensureAtLeastOneFileRow = (files = []) => {
    if (files.length > 0) return files;
    return [
      {
        id: `placeholder-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        filename: "",
        s3Url: "",
        description: "",
        uploading: false,
        isPlaceholder: true, // optional – can be used in UI styling
      },
    ];
  };

  // ────────────────────────────────────────────────
  // Load Data
  // ────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    if (!cycle_sub_category_id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const staffId = resolveStaffId();
      if (!staffId) throw new Error("Staff ID not found");

      const res = await newnbaCriteria6Service.getCriteria6_5_Data(cycle_sub_category_id, staffId);
      const raw = res?.data || res || {};
      const d = Array.isArray(raw) && raw.length > 0 ? raw[0] : raw;

      setCriterionId(d?.id || null);

      const staffRows =
        d?.technical_staff_details?.length > 0
          ? d.technical_staff_details.map((r, i) => ({ ...r, sno: i + 1 }))
          : [
              {
                sno: 1,
                name: "",
                designation: "",
                date_of_joining: "",
                qualification_at_joining: "",
                qualification_now: "",
                other_skills: "",
                responsibility: "",
              },
            ];

      const technicalFiles = mapToFileObjects(d?.technical_staff_details_document || []);
      const incentivesFiles = mapToFileObjects(d?.incentives_skill_upgrade_document || []);
      const nonTeachingFiles = mapToFileObjects(d?.non_teaching_staff_document || []);

      setInitialData({
        content: {
          staff_availability_info: d?.technical_supporting_staff_availability || "",
          incentives_info: d?.incentives_skill_upgrade || "",
        },
        tableData: {
          technicalStaffTable: staffRows,
        },
        filesByField: {
          technicalStaffTable: ensureAtLeastOneFileRow(technicalFiles),
          incentives_info: ensureAtLeastOneFileRow(incentivesFiles),
          staff_availability_info: ensureAtLeastOneFileRow(nonTeachingFiles),
        },
      });
    } catch (err) {
      console.warn("Load failed:", err);
      // Fallback with empty placeholders
      setInitialData({
        content: { staff_availability_info: "", incentives_info: "" },
        tableData: {
          technicalStaffTable: [
            {
              sno: 1,
              name: "",
              designation: "",
              date_of_joining: "",
              qualification_at_joining: "",
              qualification_now: "",
              other_skills: "",
              responsibility: "",
            },
          ],
        },
        filesByField: {
          technicalStaffTable: ensureAtLeastOneFileRow([]),
          incentives_info: ensureAtLeastOneFileRow([]),
          staff_availability_info: ensureAtLeastOneFileRow([]),
        },
      });
    } finally {
      setLoading(false);
    }
  }, [cycle_sub_category_id, otherStaffId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ────────────────────────────────────────────────
  // Summary metrics (similar to 6.4 style)
  // ────────────────────────────────────────────────
  const getStaffSummary = () => {
    const rows = initialData.tableData.technicalStaffTable || [];
    const total = rows.length;
    const qualified = rows.filter((r) =>
      ["Diploma", "Degree", "B.Tech", "M.Tech", "ITI", "BE", "ME"].some((q) =>
        (r.qualification_now || "").toLowerCase().includes(q.toLowerCase())
      )
    ).length;
    const skilled = rows.filter((r) => (r.other_skills || "").trim().length > 8).length;

    return { total, qualified, skilled };
  };

  const { total: staffCount, qualified, skilled } = getStaffSummary();

  // ────────────────────────────────────────────────
  // Save Handler
  // ────────────────────────────────────────────────
  const handleSave = async (formData) => {
    setSaving(true);
    try {
      const staffId = resolveStaffId();
      if (!staffId) throw new Error("Staff ID missing");

      const technical_staff_details = (formData.tableData?.technicalStaffTable || []).map((r, i) => ({
        ...r,
        sno: i + 1,
      }));

      // Filter out placeholder/empty files before sending
      const technical_staff_details_document = (formData.filesByField?.technicalStaffTable || [])
        .filter((f) => f.s3Url?.trim() && f.filename?.trim())
        .map((f) => ({
          file_name: f.filename,
          file_url: f.s3Url,
          description: f.description || "",
        }));

      const incentives_skill_upgrade_document = (formData.filesByField?.incentives_info || [])
        .filter((f) => f.s3Url?.trim() && f.filename?.trim())
        .map((f) => ({
          file_name: f.filename,
          file_url: f.s3Url,
          description: f.description || "",
        }));

       const non_teaching_staff_document = (formData.filesByField?.staff_availability_info || [])
        .filter((f) => f.s3Url?.trim() && f.filename?.trim())
        .map((f) => ({
          file_name: f.filename,
          file_url: f.s3Url,
          description: f.description || "",
        }));

      const payload = {
        other_staff_id: Number(staffId),
        cycle_sub_category_id: Number(cycle_sub_category_id),
        program_id: programId ? Number(programId) : null,
        technical_supporting_staff_availability: formData.content.staff_availability_info || "",
        incentives_skill_upgrade: formData.content.incentives_info || "",
        incentives_skill_upgrade_document,
        technical_staff_details,
        technical_staff_details_document,
        non_teaching_staff_document
      };

      if (criterionId) {
        await newnbaCriteria6Service.putCriteria6_5_Data(criterionId, payload, staffId);
      } else {
        const res = await newnbaCriteria6Service.saveCriteria6_5_Data(payload, staffId);
        if (res?.id) setCriterionId(res.id);
      }

      setAlert(
        <SweetAlert success title="Saved!" onConfirm={() => setAlert(null)}>
          Criterion 6.5 saved successfully.
        </SweetAlert>
      );

      onSaveSuccess?.();
      await loadData();
    } catch (err) {
      console.error("Save failed:", err);
      setAlert(
        <SweetAlert danger title="Error" onConfirm={() => setAlert(null)}>
          Failed to save: {err.message || "Unknown error"}
        </SweetAlert>
      );
    } finally {
      setSaving(false);
    }
  };

  // ────────────────────────────────────────────────
  // Delete Handler
  // ────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!criterionId) {
      setAlert(
        <SweetAlert info title="Nothing to delete" onConfirm={() => setAlert(null)}>
          No saved record found.
        </SweetAlert>
      );
      return;
    }

    setAlert(
      <SweetAlert
        warning
        showCancel
        confirmBtnText="Yes, Delete"
        cancelBtnText="Cancel"
        title="Are you sure?"
        onConfirm={async () => {
          setAlert(null);
          try {
            await newnbaCriteria6Service.deleteCriteria6_5_Data(criterionId);
            setCriterionId(null);
            setInitialData({
              content: { staff_availability_info: "", incentives_info: "" },
              tableData: { technicalStaffTable: [] },
              filesByField: {
                technicalStaffTable: ensureAtLeastOneFileRow([]),
                incentives_info: ensureAtLeastOneFileRow([]),
              },
            });

            setAlert(
              <SweetAlert success title="Deleted" onConfirm={() => setAlert(null)}>
                Criterion 6.5 record deleted.
              </SweetAlert>
            );

            onSaveSuccess?.();
            await loadData();
          } catch (err) {
            setAlert(
              <SweetAlert danger title="Delete Failed" onConfirm={() => setAlert(null)}>
                {err.message || "Could not delete record"}
              </SweetAlert>
            );
          }
        }}
        onCancel={() => setAlert(null)}
      >
        This action cannot be undone.
      </SweetAlert>
    );
  };

  if (loading) return <div className="flex justify-center py-20">Loading Criterion 6.5...</div>;

  return (
    <div>
      <GenericCriteriaForm
        title={config.title}
        marks={config.totalMarks}
        fields={config.fields}
        initialData={initialData}
        saving={saving}
        isCompleted={!isEditable}
        isContributorEditable={isEditable}
        onSave={handleSave}
        onDelete={handleDelete}
        customContent={{
          summary: (
            <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm mb-8">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">6.5 Assessment Overview</h3>
                  <p className="text-gray-600 mt-1">Non-Teaching / Technical Support Staff</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-600">
                    {staffCount >= 3 ? "Adequate" : "Needs Attention"}
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-3 rounded border">
                  <div className="text-xs text-gray-500">Total Staff</div>
                  <div className="text-xl font-semibold">{staffCount}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded border">
                  <div className="text-xs text-gray-500">Technically Qualified</div>
                  <div className="text-xl font-semibold">{qualified}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded border">
                  <div className="text-xs text-gray-500">With Extra Skills</div>
                  <div className="text-xl font-semibold">{skilled}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded border">
                  <div className="text-xs text-gray-500">Incentive Docs</div>
                  <div className="text-xl font-semibold">
                    {(initialData.filesByField?.incentives_info || []).filter((f) => f.s3Url).length}
                  </div>
                </div>
              </div>
            </div>
          ),

          guidelines: (
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-5 mt-8">
              <h4 className="font-medium text-yellow-800">NBA Guidelines – 6.5 Non-Teaching Support</h4>
              <ul className="mt-3 space-y-2 text-sm text-yellow-800 list-disc pl-5">
                <li>At least one qualified technician per lab/workshop</li>
                <li>Qualification preferably Diploma/Degree in relevant field</li>
                <li>Evidence of periodic training/skill upgradation</li>
                <li>Clear job responsibilities and lab allocation</li>
                <li>Supporting documents: appointment letters, qualification certificates, training proofs</li>
              </ul>
            </div>
          ),
        }}
      />

      {alert}
    </div>
  );
};

export default Criterion6_5Form;