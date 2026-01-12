// src/screens/pages/NEWNBA/CriterionForm2.jsx

import React from "react";
import { toast } from "react-toastify";

// IMPORT ALL DEDICATED FORMS (just like Criterion1_1)
import Criterion1_1Form from "./Criterion1_1Form";
import Criterion1_2Form from "./Criterion1_2Form";
import Criterion1_3Form from "./Criterion1_3Form";
import Criterion1_4Form from "./Criterion1_4Form";
import Criterion1_5Form from "./Criterion1_5Form";


const CriterionForm = ({
  section,
  nba_accredited_program_id,
  academic_year,
  nba_criteria_sub_level2_id,
  contributor_allocation_id: nba_contributor_allocation_id,
  completed = false,
  isContributorEditable = true,
  programId = null,
  otherStaffId,
  onCardClick = null,
  onStatusChange = null,
  cardData = [],
}) => {

  // ------------------ SECTION → COMPONENT MAPPING ------------------
  const SECTION_COMPONENT_MAP = {
    "1.1": Criterion1_1Form,
    "1.2": Criterion1_2Form,
    "1.3": Criterion1_3Form,
    "1.4": Criterion1_4Form,
    "1.5": Criterion1_5Form,
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
      programId={programId}
      otherStaffId={otherStaffId}
      showCardView={isCoordinator && ["1.1", "1.2", "1.3", "1.4", "1.5"].includes(section) && cardData.length > 0}
      cardData={cardData}
      onCardClick={onCardClick}
      onStatusChange={onStatusChange}
      onSaveSuccess={() => {
        toast.success(`Criterion ${section} saved successfully!`);
      }}
    />
  );
};

export default CriterionForm;
