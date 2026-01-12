// C:\LQ\NBA-Eng-2Tier\fe_nba\LQ_Admin\src\screens\pages\NEWNBA\CriterionForm.jsx

import React, { useState, useEffect } from "react";
// import { toast } from "react-toastify";
// import { nbaOptimizedAPIService } from "../../../../Services/NBA-OptimizedAPI.service";
import GenericCriteriaForm from "./GenericCriteriaForm";

const CriterionForm = ({
  section,
  nba_accredited_program_id,
  academic_year,
  nba_criteria_sub_level2_id,
  contributor_allocation_id: nba_contributor_allocation_id,
  completed = false,
  isContributorEditable = true,
}) => {
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);

  const sectionConfig = {
   
    /** ======================= CRITERION 4 ======================= */
    "4.1": {
      title: "Criterion 4: Students’ Performance (120)",
      totalMarks: 10,
      fields: [
        { name: "peo_po", label: "PEO to PO Mapping Justification" },
        { name: "po_pso", label: "PO to PSO Mapping Justification" },
      ],
      tableConfig: {
        title: "Program Articulation Matrix",
        columns: [
          { field: "from", header: "From (PEO/PO)", placeholder: "PEO1" },
          { field: "to", header: "To (PO/PSO)", placeholder: "PO1, PO2, PSO1" },
          { field: "level", header: "Correlation Level", type: "select" },
          { field: "justification", header: "Justification", placeholder: "Strong correlation due to..." },
        ],
      },
    },

  }





  const config = sectionConfig[section];

  useEffect(() => {
    const loadData = async () => {
      if (!nba_contributor_allocation_id || !section) {
        setInitialData({ content: {}, tableData: [], files: [] });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const methodName = `getCriteria${section.replace(".", "_")}_Data`;
        const apiMethod = nbaOptimizedAPIService[methodName];

        if (!apiMethod) {
          console.warn(`API method ${methodName} not found`);
          setInitialData({ content: {}, tableData: [], files: [] });
          return;
        }

        const response = await apiMethod(
          nba_accredited_program_id,
          nba_criteria_sub_level2_id,
          nba_contributor_allocation_id
        );

        setInitialData({
          content: response?.content || {},
          tableData: Array.isArray(response?.tableData) ? response.tableData : [],
          files: Array.isArray(response?.files)
            ? response.files.map((f, i) => ({ ...f, id: f.id || `file-${i}` }))
            : []
        });
      } catch (err) {
        console.error("Load failed:", err);
        toast.error("Failed to load saved data");
        setInitialData({ content: {}, tableData: [], files: [] });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [section, nba_accredited_program_id, nba_criteria_sub_level2_id, nba_contributor_allocation_id]);

  const handleSave = async (data) => {
    if (!isContributorEditable) {
      toast.error("You don't have permission to edit");
      return;
    }

    setSaveLoading(true);
    try {
      const methodName = `saveCriteria${section.replace(".", "_")}_Data`;
      const apiMethod = nbaOptimizedAPIService[methodName];
      if (!apiMethod) throw new Error(`Save method not found: ${methodName}`);

      const payload = {
        content: data.content,
        tableData: data.tableData || [],
        files: data.files.map(f => ({
          description: f.description,
          filename: f.filename,
          url: f.url || "",
        })),
      };

      await apiMethod(
        nba_accredited_program_id,
        nba_criteria_sub_level2_id,
        nba_contributor_allocation_id,
        payload,
        data.files.filter(f => f.file)
      );

      toast.success("Section saved successfully!");

      const refreshed = await nbaOptimizedAPIService[methodName.replace("save", "get")](
        nba_accredited_program_id,
        nba_criteria_sub_level2_id,
        nba_contributor_allocation_id
      );

      setInitialData({
        content: refreshed?.content || {},
        tableData: Array.isArray(refreshed?.tableData) ? refreshed.tableData : [],
        files: Array.isArray(refreshed?.files)
          ? refreshed.files.map((f, i) => ({ ...f, id: f.id || `file-${i}` }))
          : []
      });
    } catch (err) {
      console.error("Save failed:", err);
      toast.error(err.message || "Failed to save");
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
    <GenericCriteriaForm
      title={config.title}
      marks={config.totalMarks}
      fields={config.fields || []}
      tableConfig={config.tableConfig || null}
      initialData={initialData}
      onSave={handleSave}
      isCompleted={completed}
      isContributorEditable={isContributorEditable}
      saving={saveLoading}
    />
  );
};

export default CriterionForm;