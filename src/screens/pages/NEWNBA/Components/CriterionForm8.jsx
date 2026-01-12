// // C:\LQ\NBA-Eng-2Tier\fe_nba\LQ_Admin\src\screens\pages\NEWNBA\CriterionForm.jsx

// import React, { useState, useEffect } from "react";
// // import { toast } from "react-toastify";
// // import { nbaOptimizedAPIService } from "../../../../Services/NBA-OptimizedAPI.service";
// import GenericCriteriaForm from "./GenericCriteriaForm";

// const CriterionForm8= ({
//   section,
//   nba_accredited_program_id,
//   academic_year,
//   nba_criteria_sub_level2_id,
//   contributor_allocation_id: nba_contributor_allocation_id,
//   completed = false,
//   isContributorEditable = true,
// }) => {
//   const [loading, setLoading] = useState(true);
//   const [initialData, setInitialData] = useState(null);
//   const [saveLoading, setSaveLoading] = useState(false);

//   const sectionConfig = {

//     "8.1": {
//       title: ". Actions Taken Based on the Results of Evaluation of the COs, POs, and PSOs (40)",
//       totalMarks: 40,
//       fields: [
//         { name: "8.1.1", label: "8.1.1. Actions Taken Based on the Results of Evaluation of the COs Attainment (20)", marks: 20 },
//         { name: "8.1.2", label: "8.1.2. Actions Taken Based on the Results of Evaluation of the POs/PSOs Attainment (20)", marks: 20 }
//       ]
//     },

//     "8.2": {
//       title: ". Academic Audit and Actions Taken thereof during the Period of Assessment (15)",
//       totalMarks: 15,
//       fields: [
//         { name: "8.2.1", label: "Academic audit system/process and its implementation in relation to continuous improvement", marks: 15 }
//       ]
//     },

//     "8.3": {
//       title: ". Improvement in Faculty Qualification/Contribution (10)",
//       totalMarks: 10,
//       fields: [
//         {
//           name: "8.3.1",
//           label: "Assessment is based on improvement in qualification and publications with respect to the Department During the assessment period",
//           marks: 10,
//           hasTable: true,
//           tableConfig: {
//             title: "Table No.8.3.1: Improvement in qualification and publications",
//             columns: [
//               { field: "item", header: "Item" },
//               { field: "caym1", header: "CAYm1" },
//               { field: "caym2", header: "CAYm2" },
//               { field: "caym3", header: "CAYm3" }
//             ],
//             defaultRows: [
//               { item: "No. of faculty members with Ph.D. degree", caym1: "", caym2: "", caym3: "" },
//               { item: "No. of publications in peer reviewed journals", caym1: "", caym2: "", caym3: "" },
//               { item: "No. of publications in conferences", caym1: "", caym2: "", caym3: "" }
//             ]
//           }
//         }
//       ]
//     },

//     "8.4": {
//       title: ".Improvement in Academic Performance (15)",
//       totalMarks: 15,
//       fields: [
//         {
//           name: "8.4.1",
//           label: "Provide details of improvement in academic performance of 1st year, 2nd year, 3rd year students during the assessment period",
//           marks: 15,
//           hasTable: true,
//           tableConfig: {
//             title: "Table No.8.4.1: Improvement in academic performance",
//             columns: [
//               { field: "item", header: "Item" },
//               { field: "caym1", header: "CAYm1" },
//               { field: "caym2", header: "CAYm2" },
//               { field: "caym3", header: "CAYm3" }
//             ],
//             defaultRows: [
//               { item: "Academic Performance Index (API) of the First-Year Students in the Program (Refer to section 4.3)", caym1: "", caym2: "", caym3: "" },
//               { item: "Academic Performance Index of the Second-Year Students in the Program (Refer to section 4.4)", caym1: "", caym2: "", caym3: "" },
//               { item: "Academic Performance Index of the Third Year Students in the Program (Refer to section 4.5)", caym1: "", caym2: "", caym3: "" }
//             ]
//           }
//         }
//       ]
//     }

//   }





//   const config = sectionConfig[section];

//   useEffect(() => {
//     const loadData = async () => {
//       if (!nba_contributor_allocation_id || !section) {
//         setInitialData({ content: {}, tableData: [], files: [] });
//         setLoading(false);
//         return;
//       }

//       try {
//         setLoading(true);
//         const methodName = `getCriteria${section.replace(".", "_")}_Data`;
//         const apiMethod = nbaOptimizedAPIService[methodName];

//         if (!apiMethod) {
//           console.warn(`API method ${methodName} not found`);
//           setInitialData({ content: {}, tableData: [], files: [] });
//           return;
//         }

//         const response = await apiMethod(
//           nba_accredited_program_id,
//           nba_criteria_sub_level2_id,
//           nba_contributor_allocation_id
//         );

//         setInitialData({
//           content: response?.content || {},
//           tableData: Array.isArray(response?.tableData) ? response.tableData : [],
//           files: Array.isArray(response?.files)
//             ? response.files.map((f, i) => ({ ...f, id: f.id || `file-${i}` }))
//             : []
//         });
//       } catch (err) {
//         console.error("Load failed:", err);
//         toast.error("Failed to load saved data");
//         setInitialData({ content: {}, tableData: [], files: [] });
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadData();
//   }, [section, nba_accredited_program_id, nba_criteria_sub_level2_id, nba_contributor_allocation_id]);

//   const handleSave = async (data) => {
//     if (!isContributorEditable) {
//       toast.error("You don't have permission to edit");
//       return;
//     }

//     setSaveLoading(true);
//     try {
//       const methodName = `saveCriteria${section.replace(".", "_")}_Data`;
//       const apiMethod = nbaOptimizedAPIService[methodName];
//       if (!apiMethod) throw new Error(`Save method not found: ${methodName}`);

//       const payload = {
//         content: data.content,
//         tableData: data.tableData || [],
//         files: data.files.map(f => ({
//           description: f.description,
//           filename: f.filename,
//           url: f.url || "",
//         })),
//       };

//       await apiMethod(
//         nba_accredited_program_id,
//         nba_criteria_sub_level2_id,
//         nba_contributor_allocation_id,
//         payload,
//         data.files.filter(f => f.file)
//       );

//       toast.success("Section saved successfully!");

//       const refreshed = await nbaOptimizedAPIService[methodName.replace("save", "get")](
//         nba_accredited_program_id,
//         nba_criteria_sub_level2_id,
//         nba_contributor_allocation_id
//       );

//       setInitialData({
//         content: refreshed?.content || {},
//         tableData: Array.isArray(refreshed?.tableData) ? refreshed.tableData : [],
//         files: Array.isArray(refreshed?.files)
//           ? refreshed.files.map((f, i) => ({ ...f, id: f.id || `file-${i}` }))
//           : []
//       });
//     } catch (err) {
//       console.error("Save failed:", err);
//       toast.error(err.message || "Failed to save");
//     } finally {
//       setSaveLoading(false);
//     }
//   };

//   if (!config) {
//     return <div className="p-12 text-center text-red-600 text-2xl font-bold bg-red-50 rounded-xl">Section {section} not configured</div>;
//   }

//   if (loading) {
//     return <div className="flex items-center justify-center py-32 text-2xl text-indigo-600 font-medium">Loading {config.title}...</div>;
//   }

//   return (
//     <GenericCriteriaForm
//       title={config.title}
//       marks={config.totalMarks}
//       fields={config.fields || []}
//       tableConfig={config.tableConfig || null}
//       initialData={initialData}
//       onSave={handleSave}
//       isCompleted={completed}
//       isContributorEditable={isContributorEditable}
//       saving={saveLoading}
//     />
//   );
// };

// export default CriterionForm8;