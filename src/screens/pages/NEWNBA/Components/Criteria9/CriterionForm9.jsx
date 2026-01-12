// src/screens/pages/NEWNBA/Components/CriterionForm9.jsx

import React from "react";
import { toast } from "react-toastify";

// IMPORT ALL DEDICATED FORMS
import Criterion9_1Form from "./Criterion9_1Form";
import Criterion9_2Form from "./Criterion9_2Form";
import Criterion9_3Form from "./Criterion9_3Form";
import Criterion9_4Form from "./Criterion9_4Form";
import Criterion9_5Form from "./Criterion9_5Form";
import Criterion9_6Form from "./Criterion9_6Form";
import Criterion9_7Form from "./Criterion9_7Form";
import Criterion9_8Form from "./Criterion9_8Form";
import Criterion9_9Form from "./Criterion9_9Form";
import Criterion9_10Form from "./Criterion9_10Form";
import Criterion9_11Form from "./Criterion9_11Form";
import Criterion9_12Form from "./Criterion9_12Form";
import Criterion9_13Form from "./Criterion9_13Form";
import Criterion9_14Form from "./Criterion9_14Form";

const CriterionForm9 = ({
  section,
  nba_accredited_program_id,
  academic_year,
  nba_criteria_sub_level2_id,
  contributor_allocation_id: nba_contributor_allocation_id,
  completed = false,
  isContributorEditable = true,
  isSubCoordinator = false,
  otherStaffId = null,
  editMode = false,
  // Dynamic ID fields for different sections
  mentoring_system_id = null,
  feedback_analysis_id = null,
  training_placement_id = null,
  startup_entrepreneurship_id = null,
  student_activities_id = null,
  governance_structure_id = null,
  academic_calendar_id = null,
  student_grievance_id = null,
  student_welfare_id = null,
  alumni_engagement_id = null,
  institutional_support_id = null,
  ...additionalProps
}) => {

  const SECTION_COMPONENT_MAP = {
    "9.1": Criterion9_1Form,
    "9.2": Criterion9_2Form,
    "9.3": Criterion9_3Form,
    "9.4": Criterion9_4Form,
    "9.5": Criterion9_5Form,
    "9.6": Criterion9_6Form,
    "9.7": Criterion9_7Form,
    "9.8": Criterion9_8Form,
    "9.9": Criterion9_9Form,
    "9.10": Criterion9_10Form,
    "9.11": Criterion9_11Form,
    "9.12": Criterion9_12Form,
    "9.13": Criterion9_13Form,
    "9.14": Criterion9_14Form,
  };

  const Component = SECTION_COMPONENT_MAP[section];

  if (!Component) {
    return (
      <div className="p-12 text-center bg-red-80 rounded-xl border border-red-800">
        <p className="text-2xl font-bold text-red-600">
          Criterion {section} Not Implemented
        </p>
        <p className="text-lg text-red-700">
          No form component is defined for this section.
        </p>
      </div>
    );
  }

  return (
    <Component
      nba_accredited_program_id={nba_accredited_program_id}
      nba_criteria_sub_level2_id={nba_criteria_sub_level2_id}
      nba_contributor_allocation_id={nba_contributor_allocation_id}
      isContributorEditable={isContributorEditable}
      completed={completed}
      academic_year={academic_year}
      isSubCoordinator={isSubCoordinator}
      otherStaffId={otherStaffId}
      editMode={editMode}
      // Pass dynamic ID fields
      mentoring_system_id={mentoring_system_id}
      feedback_analysis_id={feedback_analysis_id}
      training_placement_id={training_placement_id}
      startup_entrepreneurship_id={startup_entrepreneurship_id}
      student_activities_id={student_activities_id}
      governance_structure_id={governance_structure_id}
      academic_calendar_id={academic_calendar_id}
      student_grievance_id={student_grievance_id}
      student_welfare_id={student_welfare_id}
      alumni_engagement_id={alumni_engagement_id}
      institutional_support_id={institutional_support_id}
      // Pass any additional props
      {...additionalProps}
      onSaveSuccess={() => {
        toast.success(`Criterion ${section} saved successfully!`);
      }}
    />
  );
};

export default CriterionForm9;