// src/screens/pages/NEWNBA/Components/CriterionForm5.jsx

import React from "react";
import { toast } from "react-toastify";

// IMPORT ALL DEDICATED FORMS
import Criterion5_1Form from "./Criterion5_1Form";
import Criterion5_2Form from "./Criterion5_2Form";
import Criterion5_3Form from "./Criterion5_3Form";
import Criterion5_4Form from "./Criterion5_4Form";
import Criterion5_5Form from "./Criterion5_5Form";
import Criterion5_6Form from "./Criterion5_6Form";
import Criterion5_7Form from "./Criterion5_7Form";
import Criterion5_8Form from "./Criterion5_8Form";
import Criterion5_9Form from "./Criterion5_9Form";
import Criterion5_AForm from "./Criterion5_AForm"; // Corrected import name if needed
const CriterionForm5 = ({
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
  cardItem = null
}) => {

  const SECTION_COMPONENT_MAP = {
    "5.1": Criterion5_1Form,
    "5.2": Criterion5_2Form,
    "5.3": Criterion5_3Form,
    "5.4": Criterion5_4Form,
    "5.5": Criterion5_5Form,
    "5.6": Criterion5_6Form,
    "5.7": Criterion5_7Form,
    "5.8": Criterion5_8Form,
    "5.9": Criterion5_9Form,
    "5A": Criterion5_AForm,
  };
  console.log("section",section)
  const Component = SECTION_COMPONENT_MAP[section];

  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const isCoordinator = !userInfo.nba_contributor;
  if (!Component) {
    return (
      <div className="p-12 text-center bg-red-50 rounded-xl border border-red-500">
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
      // nba_criteria_sub_level2_id={nba_criteria_sub_level2_id}
      cycle_sub_category_id={nba_criteria_sub_level2_id}
      nba_contributor_allocation_id={nba_contributor_allocation_id}
      nba_criteria_sub_level2_id={section.id}
      isEditable={isContributorEditable}
      completed={completed}
      academic_year={academic_year}
      programId={programId}
      other_staff_id={otherStaffId}
      showCardView={isCoordinator && section === "5.1" && cardData.length > 0}
      onCardClick={onCardClick}
      onStatusChange={onStatusChange}
      onSaveSuccess={() => {
        toast.success(`Criterion ${section} saved successfully!`);
      }}
      cardItem={cardItem}
    />
  );
};

export default CriterionForm5;
