// src/screens/pages/NEWNBA/CriterionForm2.jsx

import React from "react";
import { toast } from "react-toastify";

// IMPORT ALL DEDICATED FORMS (just like Criterion1_1)
import Criterion3_1Form from "./Criterion3_1Form";
import Criterion3_2Form from "./Criterion3_2Form";
import Criterion3_3Form from "./Criterion3_3Form";
import Criterion3_4Form from "./Criterion3_4Form";
import Criterion3_5Form from "./Criterion3_5Form";
import Criterion3_6Form from "./Criterion3_6Form";
import Criterion3_7Form from "./Criterion3_7Form";
import Criterion3_8Form from "./Criterion3_8Form";
// import Criterion2_3Form from "./Criterion2_3Form";
// import Criterion2_4Form from "./Criterion2_4Form";
// import Criterion2_5Form from "./Criterion2_5Form";
// import Criterion2_6Form from "./Criterion2_6Form";
// import Criterion2_7Form from "./Criterion2_7Form";
// import Criterion2_8Form from "./Criterion2_8Form";

const CriterionForm3 = ({
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
    "3.1": Criterion3_1Form,
    "3.2": Criterion3_2Form,
    "3.3": Criterion3_3Form,
    "3.4": Criterion3_4Form,
    "3.5": Criterion3_5Form,
    "3.6": Criterion3_6Form,
    "3.7": Criterion3_7Form,
    "3.8": Criterion3_8Form,
    // "2.2": Criterion2_2Form,
    // "2.3": Criterion2_3Form,
    // "2.4": Criterion2_4Form,
    // "2.5": Criterion2_5Form,
    // "2.6": Criterion2_6Form,
    // "2.7": Criterion2_7Form,
    // "2.8": Criterion2_8Form,
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

export default CriterionForm3;
