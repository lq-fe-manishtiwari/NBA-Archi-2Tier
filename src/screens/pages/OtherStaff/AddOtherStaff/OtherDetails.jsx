import React from "react";

const OtherDetails = ({ values, onCheckboxChangeCurr }) => {
  const permissionItems = [
    { key: "academics_access", label: "Academics" },
    { key: "syllabus_access", label: "Syllabus" },
    { key: "content_access", label: "Content" },
    { key: "attendance_access", label: "Attendance" },
    { key: "student_access", label: "Students" },
    { key: "teacher_access", label: "Teachers" },
    { key: "staff_access", label: "Other Staff" },
    { key: "assessment_access", label: "Assessment" },
    { key: "offline_assessment_enabled", label: "Can add offline assessment?" },
    { key: "class_update_access", label: "Class Update" },
    { key: "learning_plan_access", label: "Learning Plan" },
    { key: "in_sights_access", label: "Insights" },
    { key: "payment_access", label: "Payments" },
    { key: "expenses_access", label: "Expenses" },
    { key: "expenses_approved", label: "Expense Approve" },
    { key: "enquiry_access", label: "Enquiry Access" },
    { key: "report_access", label: "Report Access" },
    { key: "leave_access", label: "Leave Access" },
    { key: "uniform_access", label: "Uniform Access" },
    { key: "library", label: "Library Access" },
    { key: "placement", label: "Placement Access" },
    { key: "event_access", label: "Event Access" },
    { key: "coordinator", label: "Co-ordinator" },
    { key: "subcoordinator", label: "Sub Co-ordinator" },
    { key: "contributor", label: "Contributor" },
  ];

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <span className="text-sm font-medium text-gray-700 ms-3">
          Select Content Visibility
        </span>
      </div>

      {/* ✅ Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        {permissionItems.map((item) => (
          <div key={item.key} className="flex items-center space-x-2">
            <input
              type="checkbox"
              name={item.key}
              id={item.key}
              checked={Boolean(values[item.key])}
              onChange={onCheckboxChangeCurr}
              className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
            />
            <label
              htmlFor={item.key}
              className="text-sm text-gray-700 cursor-pointer select-none"
            >
              {item.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OtherDetails;
