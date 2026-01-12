import React from "react";
import BulkUpload from "./Dashboard/BulkUpload";
import SetTarget from "./Dashboard/SetTarget";
import MarksEntryTable from "./Dashboard/MarksEntryTable";

export default function MarksEntryLayout() {
  return (
    <div>
      {/* Row for BulkUpload and SetTarget */}
      <div className="flex justify-between items-start">
        <div className="flex-shrink-0">
          <SetTarget />
        </div>
        <div className="flex-shrink-0">
          <BulkUpload />
        </div>
  
      </div>

      {/* MarksEntryTable full width */}
      <div>
        <MarksEntryTable />
      </div>
    </div>
  );
}
