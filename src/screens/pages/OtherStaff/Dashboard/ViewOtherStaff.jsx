import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  Briefcase,
  FileText,
  Star,
  MessageCircle,
  MoreHorizontal,
} from "lucide-react";
import { OtherStaffService } from "../Service/OtherStaff.service";

const ViewOtherStaff = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("personal");
  const [staffDetails, setStaffDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);  
  const [permissionItems, setPermissionItems] = useState([]);

  useEffect(() => {
    const fetchStaffDetails = async () => {
      try {
        setLoading(true);
        const data = await OtherStaffService.getOtherStaffDetailsbyID(id);
        setStaffDetails(data);
        setError(null);
      } catch (err) {
        setError("Failed to fetch staff details.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchStaffDetails();
    }
  }, [id]);

useEffect(() => {
  if (staffDetails?.staff_access_attributes?.length > 0) {
    const access = staffDetails.staff_access_attributes[0];

    // Convert keys like "academic_enabled" → "Academic Enabled"
    const dynamicPermissions = Object.keys(access).map((key) => {
      const formattedLabel = key
        .replace(/_/g, " ")                // underscores → spaces
        .replace(/\b\w/g, (l) => l.toUpperCase()); // capitalize words
      return { key, label: formattedLabel };
    });

    setPermissionItems(dynamicPermissions);

    // ✅ Also normalize values for checkbox checked state
    const normalizedAccess = Object.fromEntries(
      Object.entries(access).map(([k, v]) => [k, v === "true"])
    );
    setCheckedItems(normalizedAccess);
  }
}, [staffDetails]);

  const getProfileImage = () => {
    if (staffDetails?.avatar) {
      return staffDetails.avatar;
    }
    return staffDetails?.gender?.toLowerCase() === 'female'
      ? "http://localhost:8885/assets/female_teacher-c7d13369dc19773503ab.svg"
      : "https://cdn-icons-png.flaticon.com/512/147/147144.png";
  };

  // const permissionItems = [
  //   { key: "academics_access", label: "Academics" },
  //   { key: "syllabus_access", label: "Syllabus" },
  //   { key: "content_access", label: "Content" },
  //   { key: "attendance_access", label: "Attendance" }, 
  //   { key: "student_access", label: "Students" },
  //   { key: "teacher_access", label: "Teachers" },
  //   { key: "staff_access", label: "Other Staff" },
  //   { key: "assessment_access", label: "Assessment" },
  //   { key: "offline_assessment_enabled", label: "Can add offline assessment?" },
  //   { key: "class_update_access", label: "Class Update" },
  //   { key: "learning_plan_access", label: "Learning Plan" },
  //   { key: "in_sights_access", label: "Insights" },
  //   { key: "payment_access", label: "Payments" },
  //   { key: "expenses_access", label: "Expenses" },
  //   { key: "expenses_approved", label: "Expense Approve" },
  //   { key: "enquiry_access", label: "Enquiry Access" },
  //   { key: "report_access", label: "Report Access" },
  //   { key: "leave_access", label: "Leave Access" },
  //   { key: "uniform_access", label: "Uniform Access" },
  //   { key: "library", label: "Library Access" },
  //   { key: "placement", label: "Placement Access" },
  //   { key: "event_access", label: "Event Access" },
  // ];

  // ✅ Local state for UI checkbox tracking
  const [checkedItems, setCheckedItems] = useState({});

  const handleCheckboxChange = (key) => {
    setCheckedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading staff details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }


  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-2 sm:p-3 flex justify-center">
      <div className="w-full max-w-6xl p-2 sm:p-3">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6 relative">
          <div className="flex flex-col items-center text-center">
            <img
              src={getProfileImage()}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 mb-4"
            />
            <h1 className="text-3xl font-bold text-gray-800 capitalize mb-2">
              {staffDetails?.firstname} {staffDetails?.middlename}{" "}
              {staffDetails?.lastname}
            </h1>
            <p className="text-lg text-gray-600 mb-4">
              {staffDetails?.primary_subject} •{" "}
              {staffDetails?.secondary_subject1} •{" "}
              {staffDetails?.secondary_subject2}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-blue-600" />
                <p className="text-gray-800 font-semibold">
                  {staffDetails?.mobile}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                <p className="text-gray-800 font-semibold">
                  {staffDetails?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Blue circular X button */}
          <Link
            to="/other-staff/dashboard"
            className="absolute top-6 right-6 bg-blue-600 hover:bg-blue-700 text-white w-10 h-10 flex items-center justify-center rounded-full shadow-md transition-all"
          >
            <span className="text-xl font-bold leading-none">×</span>
          </Link>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="border-b border-gray-200 mb-4">
            <ul className="flex flex-wrap justify-center -mb-px text-sm font-medium text-center text-gray-500">
              <li className="mx-2">
                <button
                  onClick={() => setActiveTab("personal")}
                  className={`inline-flex items-center gap-2 p-4 border-b-2 rounded-t-lg ${
                    activeTab === "personal"
                      ? "text-blue-600 border-blue-600"
                      : "border-transparent hover:text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <User className="w-5 h-5" />
                  Personal
                </button>
              </li>
              <li className="mx-2">
                <button
                  onClick={() => setActiveTab("communication")}
                  className={`inline-flex items-center gap-2 p-4 border-b-2 rounded-t-lg ${
                    activeTab === "communication"
                      ? "text-blue-600 border-blue-600"
                      : "border-transparent hover:text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <MessageCircle className="w-5 h-5" />
                  Communication
                </button>
              </li>
              <li className="mx-2">
                <button
                  onClick={() => setActiveTab("other")}
                  className={`inline-flex items-center gap-2 p-4 border-b-2 rounded-t-lg ${
                    activeTab === "other"
                      ? "text-blue-600 border-blue-600"
                      : "border-transparent hover:text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <MoreHorizontal className="w-5 h-5" />
                  Other Details
                </button>
              </li>
            </ul>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "personal" && (
              <div className="space-y-8">
            

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                  <Detail
                    label="Name"
                    value={`${staffDetails?.firstname || ''} ${staffDetails?.middlename || ''} ${staffDetails?.lastname || ''}`}
                  />
                  <Detail label="Gender" value={staffDetails?.gender} />
                  <Detail
  label="Date of Birth"
  value={
    staffDetails?.date_of_birth
      ? new Date((staffDetails.date_of_birth * 1000) + (5.5 * 60 * 60 * 1000))
          .toLocaleDateString('en-UN')
      : '-'
  }
  icon={<Calendar />}
/>


                </div>

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* <Detail label="Username" value={staffDetails?.user?.username} /> */}
                  <Detail label="Blood Group" value={staffDetails?.blood_group} />
                  <Detail label="Marital Status" value={staffDetails?.marital_status} />
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                  <Detail label="Father/Husband/Guardian Name" value={staffDetails?.father_name} />
                  <Detail
                    label="Employee ID"
                    value={staffDetails?.employee_id}
                    icon={<FileText />}
                  />
                  <Detail
                    label="Designation"
                    value={staffDetails?.designation}
                    icon={<Briefcase />}
                  />
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                <Detail
  label="Date of Joining"
  value={
    staffDetails?.date_of_joining
      ? new Date(
          (staffDetails.date_of_joining * 1000) + (5.5 * 60 * 60 * 1000)
        ).toLocaleDateString('en-UN')
      : '-'
  }
/>

                  <Detail label="Aadhar Number" value={staffDetails?.aadhar_number} />
                  <Detail label="PAN Number" value={staffDetails?.pan_number} />
                </div>

                {/* <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                  <Detail label="Primary Subject" value={staffDetails?.primary_subject} />
                  <Detail label="Secondary Subject" value={staffDetails?.secondary_subject1} />
                  <Detail label="Tertiary Subject" value={staffDetails?.secondary_subject2} />
                </div> */}

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                  <Detail label="Bank Name" value={staffDetails?.bank_name} />
                  <Detail label="Bank Account No" value={staffDetails?.bank_account_no} />
                  <Detail label="IFSC Code" value={staffDetails?.ifsc_code} />
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                  <Detail label="UAN Number" value={staffDetails?.uan_number} />
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400" />
                    <span className="text-lg text-gray-800 font-medium">
                      Attendance: {staffDetails?.attendance || "0.00"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "communication" && (
              <div className="space-y-8">
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                  <Detail
                    label="Address Line 1"
                    value={staffDetails?.address_line1}
                    icon={<MapPin />}
                  />
                  <Detail label="City" value={staffDetails?.city} />
                  <Detail label="State" value={staffDetails?.state} />
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                  <Detail label="Country" value={staffDetails?.country} />
                  <Detail label="Pincode" value={staffDetails?.pincode} />
                </div>
              </div>
            )}

            {activeTab === "other" && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  {console.log("permissionItems", permissionItems)}
        {permissionItems.map((item) => (
          <div key={item.key} className="flex items-center space-x-2">
            <input
              type="checkbox"
              disabled
              id={item.key}
              checked={checkedItems[item.key] || false}
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable detail component
const Detail = ({ label, value, icon }) => (
  <div className="flex flex-col">
    <p className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-1">
      {icon && <span className="text-blue-500">{icon}</span>}
      {label}
    </p>
    <p className="text-lg text-gray-800">{value || "-"}</p>
  </div>
);

export default ViewOtherStaff;
