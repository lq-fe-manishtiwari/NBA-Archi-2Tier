import React from "react";
import { toast } from "react-toastify";
import Criterion4_Form from "./Criterion4_Form";
import Criterion4_AForm from "./Criterion4_AForm";
import Criterion4_BForm from "./Criterion4_BForm";
import Criterion4_CForm from "./Criterion4_CForm";
import Criterion4_1Form from "./Criterion4_1Form";
import Criterion4_2Form from "./Criterion4_2Form";
import Criterion4_3Form from "./Criterion4_3Form";
import Criterion4_4Form from "./Criterion4_4Form";
import Criterion4_5Form from "./Criterion4_5Form";
import Criterion4_6Form from "./Criterion4_6Form";
import Criterion4_7Form from "./Criterion4_7Form";

const CriterionForm4 = ({
  section,
  nba_accredited_program_id,
  academic_year,
  nba_criteria_sub_level2_id,
  contributor_allocation_id: nba_contributor_allocation_id, 
  completed = false,
  isContributorEditable = true,
  otherStaffId,
  onCardClick = null,
  onStatusChange = null,
  cardData = [],
  editMode = false,
  teachingLearningQualityId = null,
  programId = null,

}) => {

  // ------------------ SECTION → COMPONENT MAPPING ------------------
  const SECTION_COMPONENT_MAP = {
    "4": Criterion4_Form,
    "4A": Criterion4_AForm,
    "4B": Criterion4_BForm,
    "4C": Criterion4_CForm,
    "4.1": Criterion4_1Form,
    "4.2": Criterion4_2Form,
    "4.3": Criterion4_3Form,
    "4.4": Criterion4_4Form,
    "4.5": Criterion4_5Form,
    "4.6": Criterion4_6Form,
    "4.7": Criterion4_7Form,
  };

  const Component = SECTION_COMPONENT_MAP[section];

  // ------------------ INVALID SECTION ------------------
  if (!Component) {
    return (
      <div className="p-12 text-center bg-red-50 rounded-xl border border-red-300">
        <p className="text-2xl font-bold text-red-600">
          Criterion {section} Not Implemented
        </p>
        <p className="text-lg text-red-700">
          No form component is defined for this section.
        </p>
      </div>
    );
  }

  // ------------------ RENDER DEDICATED COMPONENT ------------------
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const isCoordinator = !userInfo.nba_contributor;

  return (
    <Component
      nba_accredited_program_id={nba_accredited_program_id}
      nba_criteria_sub_level2_id={nba_criteria_sub_level2_id}
      cycle_sub_category_id={nba_criteria_sub_level2_id}
      nba_contributor_allocation_id={nba_contributor_allocation_id}
      isEditable={isContributorEditable}
      completed={completed}
      academic_year={academic_year}
      otherStaffId={otherStaffId}
      showCardView={isCoordinator && cardData.length > 0}
      onCardClick={onCardClick}
      onStatusChange={onStatusChange}
      editMode={editMode}
      teachingLearningQualityId={teachingLearningQualityId}
      programId={programId || nba_accredited_program_id}
      onSaveSuccess={() => {
        toast.success(`Criterion ${section} saved successfully!`);
      }}
    />
  );
};

export default CriterionForm4;
