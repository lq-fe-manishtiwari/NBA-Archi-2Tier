// src/screens/pages/NEWNBA/CriterionForm2.jsx

import React from "react";
import { toast } from "react-toastify";

// IMPORT ALL DEDICATED FORMS (just like Criterion1_1)
import Criterion2_1Form from "./Criterion2_1Form";
import Criterion2_2Form from "./Criterion2_2Form";
import Criterion2_3Form from "./Criterion2_3Form";
import Criterion2_4Form from "./Criterion2_4Form";
import Criterion2_5Form from "./Criterion2_5Form";
import Criterion2_6Form from "./Criterion2_6Form";
import Criterion2_7Form from "./Criterion2_7Form";
import Criterion2_8Form from "./Criterion2_8Form";

const CriterionForm2 = ({
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
}) => {

  // ------------------ SECTION → COMPONENT MAPPING ------------------
  const SECTION_COMPONENT_MAP = {
    "2.1": Criterion2_1Form,
    "2.2": Criterion2_2Form,
    "2.3": Criterion2_3Form,
    "2.4": Criterion2_4Form,
    "2.5": Criterion2_5Form,
    "2.6": Criterion2_6Form,
    "2.7": Criterion2_7Form,
    "2.8": Criterion2_8Form,
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
      showCardView={isCoordinator && section === "2.1" && cardData.length > 0}
      onCardClick={onCardClick}
      onStatusChange={onStatusChange}
      editMode={editMode}
      teachingLearningQualityId={teachingLearningQualityId}
      onSaveSuccess={() => {
        toast.success(`Criterion ${section} saved successfully!`);
      }}
    />
  );
};

export default CriterionForm2;
