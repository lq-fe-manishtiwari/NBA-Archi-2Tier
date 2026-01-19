import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
// import { nbaOptimizedAPIService } from "../../../../Services/NBA-OptimizedAPI.service";
import GenericCriteriaForm from "./GenericCriteriaForm";
import Criterion6_1Form from "../Components/Criteria6/Criterion6_1Form";
import Criterion6_2Form from "../Components/Criteria6/Criterion6_2Form";
import Criterion6_3Form from "../Components/Criteria6/Criterion6_3Form";
import Criterion6_4Form from "../Components/Criteria6/Criterion6_4Form";
import Criterion6_5Form from "../Components/Criteria6/Criterion6_5Form";

const CriterionForm = ({
  section,
  nba_accredited_program_id,
  academic_year,
  nba_criteria_sub_level2_id,
  contributor_allocation_id: nba_contributor_allocation_id,
  completed = false,
  isContributorEditable = true,
  otherStaffId,
  editMode,
  professionalDevelopmentId,
  developmentActivitiesId,
  isSubCoordinator,
}) => {
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);

  // For sections 6.1 and 6.2, use the dedicated components
  if (section === "6.1") {
    console.log("🎯 CriterionForm6 - Rendering 6.1 with props:");
    console.log("  - otherStaffId:", otherStaffId);
    console.log("  - professionalDevelopmentId:", professionalDevelopmentId);
    console.log("  - editMode:", editMode);
    console.log("  - isSubCoordinator:", isSubCoordinator);
    
    return (
      <Criterion6_1Form
        nba_accredited_program_id={nba_accredited_program_id}
        academic_year={academic_year}
        cycle_sub_category_id={nba_criteria_sub_level2_id}
        contributor_allocation_id={nba_contributor_allocation_id}
        completed={completed}
        isContributorEditable={isContributorEditable}
        otherStaffId={otherStaffId}
        editMode={editMode}
        professionalDevelopmentId={professionalDevelopmentId}
        isSubCoordinator={isSubCoordinator}
      />
    );
  }

  if (section === "6.2") {

    return (
      <Criterion6_2Form
        nba_accredited_program_id={nba_accredited_program_id}
        academic_year={academic_year}
        cycle_sub_category_id={nba_criteria_sub_level2_id}
        contributor_allocation_id={nba_contributor_allocation_id}
        completed={completed}
        isContributorEditable={isContributorEditable}
        otherStaffId={otherStaffId}
        editMode={editMode}
        developmentActivitiesId={developmentActivitiesId}
        isSubCoordinator={isSubCoordinator}
      />
    );
  }
   if (section === "6.3") {

    return (
      <Criterion6_3Form
        nba_accredited_program_id={nba_accredited_program_id}
        academic_year={academic_year}
        nba_criteria_sub_level2_id={nba_criteria_sub_level2_id}
        contributor_allocation_id={nba_contributor_allocation_id}
        completed={completed}
        isContributorEditable={isContributorEditable}
        otherStaffId={otherStaffId}
        editMode={editMode}
        developmentActivitiesId={developmentActivitiesId}
        isSubCoordinator={isSubCoordinator}
      />
    );
  }
  if (section === "6.4") {

    return (
      <Criterion6_4Form
        nba_accredited_program_id={nba_accredited_program_id}
        academic_year={academic_year}
        cycle_sub_category_id={nba_criteria_sub_level2_id}
        // nba_criteria_sub_level2_id={nba_criteria_sub_level2_id}
        contributor_allocation_id={nba_contributor_allocation_id}
        completed={completed}
        isContributorEditable={isContributorEditable}
        otherStaffId={otherStaffId}
        editMode={editMode}
        developmentActivitiesId={developmentActivitiesId}
        isSubCoordinator={isSubCoordinator}
      />
    );
  }
    if (section === "6.5") {

    return (
      <Criterion6_5Form
        nba_accredited_program_id={nba_accredited_program_id}
        academic_year={academic_year}
        cycle_sub_category_id={nba_criteria_sub_level2_id}
        // nba_criteria_sub_level2_id={nba_criteria_sub_level2_id}
        contributor_allocation_id={nba_contributor_allocation_id}
        completed={completed}
        isContributorEditable={isContributorEditable}
        otherStaffId={otherStaffId}
        editMode={editMode}
        developmentActivitiesId={developmentActivitiesId}
        isSubCoordinator={isSubCoordinator}
      />
    );
  }

  // Configuration for other sections (if any remain)
  const sectionConfig = {
    // Add configurations for other sections here
    // Example:
    // "1.1": { ... },
    // "1.2": { ... },
  };

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