// src/screens/pages/NEWNBA/Components/Criteria8/CriterionForm8.jsx

import React from "react";
import { toast } from "react-toastify";

// IMPORT ALL DEDICATED FORMS
import Criterion8_1Form from "./Criterion8_1Form";
import Criterion8_2Form from "./Criterion8_2Form";
import Criterion8_3Form from "./Criterion8_3Form";
import Criterion8_4Form from "./Criterion8_4Form";
import Criterion8_5Form from "./Criterion8_5Form";
import Criterion8_6Form from "./Criterion8_6Form";
import Criterion8_7Form from "./Criterion8_7Form";

const CriterionForm8 = ({
  section,
  nba_accredited_program_id,
  academic_year,
  nba_criteria_sub_level2_id,
  contributor_allocation_id: nba_contributor_allocation_id,
  completed = false,
  isContributorEditable = true,
  otherStaffId = null,
  editMode = false,
  coPoPsoActionsId = null,
  qualityAssuranceId = null,
  facultyFeedbackId = null,
  studentFeedbackId = null,
  careerGuidanceId = null,
  entrepreneurshipId = null,
  activitiesId = null,
  isSubCoordinator = false,
  readOnly = false,
  onSuccess = () => {},
  cardItem = null
}) => {

  const SECTION_COMPONENT_MAP = {
    "8.1": Criterion8_1Form,
    "8.2": Criterion8_2Form,
    "8.3": Criterion8_3Form,
    "8.4": Criterion8_4Form,
    "8.5": Criterion8_5Form,
    "8.6": Criterion8_6Form,
    "8.7": Criterion8_7Form,
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
      cycle_sub_category_id={nba_criteria_sub_level2_id}
      nba_contributor_allocation_id={nba_contributor_allocation_id}
      isEditable={isContributorEditable}
      academic_year={academic_year}
      completed={completed}
      isContributorEditable={isContributorEditable}
      isSubCoordinator={isSubCoordinator}
      otherStaffId={otherStaffId}
      editMode={editMode}
      coPoPsoActionsId={coPoPsoActionsId}
      qualityAssuranceId={qualityAssuranceId}
      facultyFeedbackId={facultyFeedbackId}
      studentFeedbackId={studentFeedbackId}
      careerGuidanceId={careerGuidanceId}
      entrepreneurshipId={entrepreneurshipId}
      activitiesId={activitiesId}
      professionalDevelopmentId={
        section === "8.2" ? qualityAssuranceId :
        section === "8.3" ? facultyFeedbackId :
        section === "8.4" ? studentFeedbackId :
        section === "8.5" ? careerGuidanceId :
        section === "8.6" ? entrepreneurshipId :
        section === "8.7" ? activitiesId : null
      }
      readOnly={readOnly}
      onSuccess={onSuccess}
      cardData={cardItem} 
      onSaveSuccess={onSuccess}
    />
  );
};

export default CriterionForm8;