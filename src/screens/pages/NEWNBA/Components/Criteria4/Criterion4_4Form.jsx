// src/screens/pages/NEWNBA/Components/Criteria4/Criterion4_4Form.jsx

import React, { useState, useEffect, useCallback } from "react";
import GenericCriteriaForm4_4 from "./GenericCriteriaForm4_4";
import { newnbaCriteria4Service } from "../../Services/NewNBA-Criteria4.service";
import SweetAlert from "react-bootstrap-sweetalert";

const Criterion4_4Form = ({
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
  const [academicPerformanceId, setAcademicPerformanceId] = useState(null);
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
    title: "4.4. Academic Performance in Fourth Year",
    totalMarks: 10,
    fields: [
      {
        name: "4.4",
        label: "4.4 Academic Performance in Fourth Year",
        marks: 10,
        hasTable: true,
        tableConfig: {
          title: "Academic Performance",
          columns: [
            { field: "item", header: "Academic Performance", placeholder: "" },
            { field: "caym1", header: "CAYm1", placeholder: "" },
            { field: "caym2", header: "CAYm2", placeholder: "" },
            { field: "caym3", header: "CAYm3", placeholder: "" },
          ],
          predefinedRows: [
            { item: "(Mean of 4th year Grade Point Average of all successful Students on a 10-point scale) or (Mean of the percentage of marks of all successful students in 4th year/10) (X)" },
            { item: "Y= Total no. of successful students" },
            { item: "Z = Total no. of students appeared in the examination" },
            { item: "API = X* (Y/Z)" },
            { item: "Average API = ( API_1 + API_2 + API_3)/3" },
          ],
        },
      },
    ],
  };

  const loadContributorsData = async () => {
    if (!showCardView || !cycle_sub_category_id) return;
    
    setCardLoading(true);
    try {
      const contributorsResponse = await newnbaCriteria4Service.getAllCriteria4_4_Data?.(cycle_sub_category_id);
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

  // ---------------- LOAD DATA ----------------
  const loadData = useCallback(async () => {
    if (!cycle_sub_category_id) return setLoading(false);

    try {
      setLoading(true);

      const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
      const userInfoo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const userIsContributor = userInfo?.rawData?.is_contributor || false;
      setIsContributor(userIsContributor);
      
      const currentOtherStaffId = otherStaffId || userInfo?.rawData?.other_staff_id || userInfo.user_id || userInfoo?.other_staff_id;

      // Get data using staff ID and cycle subcategory
      const res = await newnbaCriteria4Service.getCriteria4_4_Data(cycle_sub_category_id, currentOtherStaffId);
      const rawResponse = res?.data || res || [];
      const d = Array.isArray(rawResponse) && rawResponse.length > 0 ? rawResponse[0] : rawResponse;

      console.log("🟢 Criterion4_4Form - Raw API Response:", rawResponse);
      console.log("🟢 Criterion4_4Form - Processed Data:", d);

      setAcademicPerformanceId(d.id || null);

      // Transform API table data back to form format
      let tableData = [];
      if (d.academic_performance_data && Array.isArray(d.academic_performance_data)) {
        const apiTable = d.academic_performance_data;
        
        // Create table rows from API data
        const rowTypes = ["Xrow", "Yrow", "Zrow", "api", "averageApi"];
        tableData = rowTypes.map(rowType => {
          const apiRow = apiTable.find(row => row.row_type === rowType);
          return {
            item: getRowLabel(rowType),
            caym1: apiRow?.caym1 || "",
            caym2: apiRow?.caym2 || "",
            caym3: apiRow?.caym3 || ""
          };
        });
      } else {
        // Default empty table
        tableData = [
          { item: "(Mean of 4th year Grade Point Average of all successful Students on a 10-point scale) or (Mean of the percentage of marks of all successful students in 4th year/10) (X)", caym1: "", caym2: "", caym3: "" },
          { item: "Y= Total no. of successful students", caym1: "", caym2: "", caym3: "" },
          { item: "Z = Total no. of students appeared in the examination", caym1: "", caym2: "", caym3: "" },
          { item: "API = X* (Y/Z)", caym1: "", caym2: "", caym3: "" },
          { item: "Average API = ( API_1 + API_2 + API_3)/3", caym1: "", caym2: "", caym3: "" },
        ];
      }

      setInitialData({
        content: { "4.4": "" },
        tableData: tableData,
        filesByField: {
          "4.4": (d.academic_performance_document || []).length > 0
            ? (d.academic_performance_document || []).map((f, i) => ({
                id: `file-4.4-${i}`,
                filename: f.file_name || f.name || "",
                s3Url: f.file_url || f.url || "",
                description: f.description || "",
                uploading: false
              }))
            : [{ id: `file-4.4-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }]
        }
      });
    } catch (err) {
      console.warn("Load failed:", err);

      setAcademicPerformanceId(null);
      setInitialData({
        content: { "4.4": "" },
        tableData: [],
        filesByField: {
          "4.4": [{ id: `file-4.4-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }]
        }
      });
    } finally {
      setLoading(false);
    }
  }, [cycle_sub_category_id, otherStaffId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ---------------- HELPER FUNCTION FOR ROW LABELS ----------------
  const getRowLabel = (rowType) => {
    const labels = {
      "Xrow": "(Mean of 4th year Grade Point Average of all successful Students on a 10-point scale) or (Mean of the percentage of marks of all successful students in 4th year/10) (X)",
      "Yrow": "Y= Total no. of successful students",
      "Zrow": "Z = Total no. of students appeared in the examination",
      "api": "API = X* (Y/Z)",
      "averageApi": "Average API = ( API_1 + API_2 + API_3)/3"
    };
    return labels[rowType] || "";
  };

  // ---------------- TRANSFORM TABLE INTO REQUIRED PAYLOAD ----------------
  const transformAcademicPerformance = (table) => {
    const rowKeys = ["Xrow", "Yrow", "Zrow", "api", "averageApi"];
    
    return table.map((row, i) => {
      const key = rowKeys[i];
      if (!key) return null;

      return {
        row_type: key,
        caym1: row.caym1 || "",
        caym2: row.caym2 || "",
        caym3: row.caym3 || ""
      };
    }).filter(Boolean);
  };

  // ---------------- SAVE DATA ----------------
  const handleSave = async (formData) => {
    setSaving(true);

    try {
      const filesWithCategory = Object.keys(formData.filesByField || {}).flatMap(
        (field) =>
          (formData.filesByField[field] || []).map((file) => ({
            ...file,
            category: "Academic Performance",
          }))
      );
      
      console.log("Files with category:", filesWithCategory);
      
      const academic_performance_document = filesWithCategory
        .filter((f) => {
          const hasUrl = f.s3Url && f.s3Url.trim() !== "";
          console.log(`File ${f.filename}: hasUrl=${hasUrl}, s3Url=${f.s3Url}`);
          return hasUrl;
        })
        .map((f) => ({
          file_name: f.filename,
          file_url: f.s3Url,
          description: f.description || ""
        }));
      
      const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
      const userInfoo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const staffId = otherStaffId || userInfo?.rawData?.other_staff_id || userInfo.user_id || userInfoo?.other_staff_id;

      const academic_performance_data = transformAcademicPerformance(formData.tableData);

      const payload = {
        other_staff_id: staffId,
        cycle_sub_category_id: cycle_sub_category_id,
        academic_performance_data,
        academic_performance_document
      };

      console.log("Saving payload:", payload);

      if (academicPerformanceId) {
        // UPDATE existing record
        await newnbaCriteria4Service.putCriteria4_4_Data(academicPerformanceId, payload);
      } else {
        // CREATE new record
        await newnbaCriteria4Service.saveCriteria4_4_Data(payload);
      }

      setAlert(
        <SweetAlert
          success
          title="Saved!"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => setAlert(null)}
        >
          Criterion 4.4 saved successfully!
        </SweetAlert>
      );

      onSaveSuccess?.();
      loadData();
    } catch (err) {
      console.error("Save failed:", err);

      setAlert(
        <SweetAlert
          danger
          title="Error"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => setAlert(null)}
        >
          Failed to save Criterion 4.4. Error: {err.message}
        </SweetAlert>
      );
    } finally {
      setSaving(false);
    }
  };

  // ---------------- DELETE DATA ----------------
  const handleDelete = async () => {
    if (!academicPerformanceId) {
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
            const res = await newnbaCriteria4Service.deleteCriteria4_4Data(academicPerformanceId);

            let message = "Criterion 4.4 deleted successfully.";
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

            setAcademicPerformanceId(null);
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
        You won't be able to revert this!
      </SweetAlert>
    );
  };

  // ---------------- UI ----------------
  if (loading || (showCardView && cardLoading)) {
    return (
      <div className="flex justify-center py-20 text-xl font-medium text-indigo-600">
        Loading Criterion 4.4...
      </div>
    );
  }

  console.log("🎯 Criterion4_4Form rendering with initialData:", initialData);

  // Note: GenericCardWorkflow component को import करना न भूलें
  // import GenericCardWorkflow from "../GenericCardWorkflow"; (यदि आवश्यक हो)

  // Show card view for coordinators
  if (showCardView) {
    return (
      <>
        {/* GenericCardWorkflow component यहां उपयोग करें */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-bold text-blue-700 mb-4">Academic Performance Fourth Year - Contributors</h3>
          {cardData.length > 0 ? (
            <div className="space-y-3">
              {cardData.map((item, index) => (
                <div key={index} className="border p-3 rounded hover:bg-gray-50 cursor-pointer">
                  <div className="flex justify-between">
                    <span className="font-medium">
                      {item.firstname} {item.lastname}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      item.approval_status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                      item.approval_status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.approval_status || 'PENDING'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No contributors found</p>
          )}
        </div>
        {alert}
      </>
    );
  }

  return (
    <div>
      <GenericCriteriaForm4_4
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

export default Criterion4_4Form;