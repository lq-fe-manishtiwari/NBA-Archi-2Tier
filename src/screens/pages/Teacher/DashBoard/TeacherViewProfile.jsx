import React, { useState, useEffect } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { User, Mail, Phone, MessageCircle, MoreHorizontal, X } from "lucide-react";
import { fetchTeacherById } from "../Services/teacher.service";
import moment from "moment";

const TeacherViewProfile = () => {
  const location = useLocation();
  const { teacherId } = useParams();
  const [activeTab, setActiveTab] = useState("1");
  const [teacherData, setTeacherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getTeacherId = () => {
    if (teacherId) {
      try { return atob(teacherId); } catch { return teacherId; }
    }
    return location.state?.teacher?.id;
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const id = getTeacherId();
        if (!id) throw new Error("Teacher ID not found");
        const result = await fetchTeacherById(id);

        // --- YEH 3 LINES ADD KARO ---
        const normalized = {
          ...result,
          teacher_employments: result.teacherEmployments || [],
          teacher_qualifications: result.teacherQualifications || [],
          custom_fields: result.customFields || [],
        };
        setTeacherData(normalized);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [teacherId, location.state]);

  const formatDate = (dateValue) => {
    if (!dateValue) return "---";

    // Handle ISO string (e.g., "2025-11-10T18:30:00")
    if (typeof dateValue === "string") {
      const m = moment(dateValue);
      return m.isValid() ? m.format("DD/MM/YYYY") : "---";
    }

    // Handle Unix timestamp (seconds)
    if (typeof dateValue === "number") {
      return moment.unix(dateValue).format("DD/MM/YYYY");
    }

    // Handle Date object
    if (dateValue instanceof Date && !isNaN(dateValue)) {
      return moment(dateValue).format("DD/MM/YYYY");
    }

    return "---";
  };

  const profile = teacherData
    ? {
      firstname: teacherData.firstname || "N/A",
      middlename: teacherData.middlename || "",
      lastname: teacherData.lastname || "N/A",
      mobile: teacherData.mobile || "N/A",
      email: teacherData.email || "N/A",
      blood_group: teacherData.bloodGroup || "N/A",
      date_of_birth: teacherData.dateOfBirth || null,
      gender: teacherData.gender || "N/A",
      marital_status: teacherData.maritalStatus || "N/A",
      father_name: teacherData.fatherName || "N/A",
      spouse_name: teacherData.spouseName || "N/A",
      designation: teacherData.designation || "N/A",
      aadhar_number: teacherData.aadharNumber || "N/A",
      pan_number: teacherData.panNumber || "N/A",
      uan_number: teacherData.uanNumber || "N/A",
      employee_id: teacherData.employeeId || `EMP${teacherData.teacherId || "000"}`,
      date_of_joining: teacherData.dateOfJoining || null,
      financial_year: teacherData.financialYear || "N/A",
      bank_name: teacherData.bankName || "N/A",
      bank_account_no: teacherData.bankAccountNo || "N/A",
      ifsc_code: teacherData.ifscCode || "N/A",
      cost_to_company: teacherData.costToCompany || "N/A",
      deduction: teacherData.deduction || "N/A",
      net_pay: teacherData.netPay || "N/A",
      address_line1: teacherData.addressLine1 || "N/A",
      address_line2: teacherData.addressLine2 || "N/A",
      city: teacherData.city || "N/A",
      state: teacherData.state || "N/A",
      country: teacherData.country || "N/A",
      pincode: teacherData.pincode || "N/A",
      phone: teacherData.phone || "N/A",
      connect_link: teacherData.connectLink || "N/A",
      reports_access: teacherData.reportsAccess || false,
      probation_completed: teacherData.probationCompleted || false,
      probation_completed_date: teacherData.probationCompletedDate || null,
      probation_comment: teacherData.probationComment || "N/A",
      avatar: teacherData.avatar || null,
      username: teacherData.username || "N/A",
    }
    : {};

  const get = (path, fallback = "---") =>
    path.split(".").reduce((o, k) => (o?.[k] !== undefined ? o[k] : fallback), profile) || fallback;

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-t-4 border-blue-600"></div>
      </div>
    );

  if (error)
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
          <p className="text-red-600 text-xl font-semibold mb-4">Error</p>
          <p className="text-gray-700">{error}</p>
          <Link to="/teacher-list" className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg">
            Back to List
          </Link>
        </div>
      </div>
    );

  const getProfileImage = () => profile.avatar || "https://via.placeholder.com/150";

  return (
    <div className="p-2 sm:p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="content-wrapper">
        <div className="student-form-container">
          {/* Header */}
          <div className="page-header relative mb-4 sm:mb-6">
            <Link
              to="/teacher-list"
              className="absolute top-0 right-0 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-white transition-all shadow-sm hover:shadow-md"
              style={{ backgroundColor: "rgb(33 98 193 / var(--tw-bg-opacity, 1))" }}
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
            <div className="flex flex-col items-center text-center">
              <img
                src={getProfileImage()}
                alt="Avatar"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border object-cover mb-3"
              />
              <h3
                className="text-lg sm:text-xl md:text-2xl font-semibold m-0"
                style={{ color: "rgb(33 98 193 / var(--tw-bg-opacity, 1))" }}
              >
                {profile.firstname} {profile.middlename} {profile.lastname}
              </h3>
              <div className="flex items-center justify-center gap-4 mt-2">
                <div className="flex items-center gap-1">
                  <Mail className="w-4 h-4" style={{ color: "rgb(33 98 193 / var(--tw-bg-opacity, 1))" }} />
                  <span className="text-black text-sm">{profile.email}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Phone className="w-4 h-4" style={{ color: "rgb(33 98 193 / var(--tw-bg-opacity, 1))" }} />
                  <span className="text-black text-sm">{profile.mobile}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-4 sm:mb-6">
            <ul className="flex flex-wrap -mb-px text-xs sm:text-sm font-medium text-center text-gray-500 dark:text-gray-400 justify-center overflow-x-auto">
              {[
                { k: "1", l: "Personal", icon: User },
                { k: "2", l: "Communication", icon: MessageCircle },
                { k: "3", l: "Other Details", icon: MoreHorizontal },
                 { k: "4", l: "Allocated Classes", icon: User },
                   { k: "5", l: "Career Journey", icon: User },
              ].map((t, i) => {
                const Icon = t.icon;
                const isActive = activeTab === t.k;
                return (
                  <li key={t.k} className="me-1 sm:me-4 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setActiveTab(t.k)}
                      className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-5 py-2 sm:py-3 border-b-2 rounded-t-lg transition-all duration-200 ${isActive
                        ? "text-blue-600 border-blue-600"
                        : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                        }`}
                    >
                      <span
                        className={`flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full text-xs font-semibold ${isActive ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                          }`}
                      >
                        {i + 1}
                      </span>
                      <Icon className={`w-3 h-3 sm:w-4 sm:h-4 ${isActive ? "text-blue-600" : "text-gray-400"}`} />
                      <span className="text-xs sm:text-base">{t.l}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8 border-0 backdrop-blur-sm">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-200">
              <div className="w-full space-y-8">

                {/* PERSONAL TAB - ONLY REQUIRED FIELDS */}
                {/* PERSONAL TAB */}
                {activeTab === "1" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card label="First Name *" value={get("firstname")} />
                    <Card label="Middle Name" value={get("middlename")} />
                    <Card label="Last Name *" value={get("lastname")} />
                    <Card label="Mobile *" value={get("mobile")} />
                    <Card label="Email *" value={get("email")} />
                    <Card label="Blood Group" value={get("blood_group")} />
                    <Card
                      label="Date of Birth"
                      value={formatDate(profile.date_of_birth)}
                    />
                    <Card label="Gender *" value={get("gender")} />
                    <Card label="Marital Status" value={get("marital_status")} />
                    <Card label="Father Name" value={get("father_name")} />
                    <Card label="Spouse Name" value={get("spouse_name")} />
                    <Card label="Designation" value={get("designation")} />
                    <Card label="Aadhaar Number" value={get("aadhar_number")} />
                    <Card label="PAN Number" value={get("pan_number")} />
                    <Card label="UAN Number" value={get("uan_number")} />
                    <Card label="Employee ID *" value={get("employee_id")} />
                    <Card
                      label="Date of Joining *"
                      value={formatDate(profile.date_of_joining)}
                    />
                    <Card label="Financial Year" value={get("financial_year")} />
                    <Card label="Bank Name" value={get("bank_name")} />
                    <Card label="Bank Account No." value={get("bank_account_no")} />
                    <Card label="IFSC Code" value={get("ifsc_code")} />
                    <Card label="Cost to Company" value={get("cost_to_company")} />
                    <Card label="Deduction" value={get("deduction")} />
                    <Card label="Net Pay" value={get("net_pay")} />
                  </div>
                )}

                {/* COMMUNICATION */}
                {activeTab === "2" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card label="Address Line 1" value={get("address_line1")} />
                    <Card label="Address Line 2" value={get("address_line2")} />
                    <Card label="City" value={get("city")} />
                    <Card label="State" value={get("state")} />
                    <Card label="Country" value={get("country")} />
                    <Card label="Pincode" value={get("pincode")} />
                    <Card label="Phone" value={get("phone")} />
                    <Card label="Connect Link" value={get("connect_link")} />
                    <Card label="Reports Access" value={profile.reports_access ? "Yes" : "No"} />
                  </div>
                )}

                {/* OTHER DETAILS */}
                {activeTab === "3" && (
                  <div className="space-y-8">

                    {/* === BASIC OTHER FIELDS === */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <Card label="Username" value={get("username")} />
                      <Card label="Probation Completed" value={profile.probation_completed ? "Yes" : "No"} />
                      <Card
                        label="Probation Date"
                        value={profile.probation_completed_date
                          ? moment.unix(profile.probation_completed_date).format("DD/MM/YYYY")
                          : "---"}
                      />
                      <Card label="Probation Comment" value={get("probation_comment")} />
                    </div>

                    {/* === PROFESSIONAL EXPERIENCE (teacher_employments) === */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold text-gray-700 mb-4">Professional Experience</h3>
                      {teacherData?.teacher_employments && teacherData.teacher_employments.length > 0 ? (
                        <div className="space-y-6">
                          {teacherData.teacher_employments.map((exp, i) => (
                            <div
                              key={i}
                              className="p-4 border rounded-xl bg-gradient-to-r from-gray-50 to-blue-50 shadow-sm"
                            >
                              <h4 className="text-lg font-semibold text-blue-700 mb-3">
                                {exp.organization || "N/A"}
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <Card
                                  label="From"
                                  value={exp.from_date ? moment(exp.from_date, "DD-MM-YYYY").format("DD/MM/YYYY") : "---"}
                                />
                                <Card
                                  label="To"
                                  value={exp.to_date ? moment(exp.to_date, "DD-MM-YYYY").format("DD/MM/YYYY") : "---"}
                                />
                                <Card label="HR Name" value={exp.organization_hr_name || "---"} />
                                <Card label="HR Email" value={exp.organization_hr_email || "---"} />
                                <Card label="HR Contact" value={exp.organization_hr_contact_number || "---"} />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-gray-500">No employment history available</div>
                      )}
                    </div>

                    {/* === EDUCATIONAL QUALIFICATIONS (teacher_qualifications) === */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold text-gray-700 mb-4">Educational Qualifications</h3>
                      {teacherData?.teacher_qualifications && teacherData.teacher_qualifications.length > 0 ? (
                        <div className="space-y-6">
                          {teacherData.teacher_qualifications.map((qual, i) => (
                            <div
                              key={i}
                              className="p-4 border rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 shadow-sm"
                            >
                              <h4 className="text-lg font-semibold text-indigo-700 mb-3">
                                {qual.degree || "Qualification"}
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <Card label="School/University" value={qual.school_university || "---"} />
                                <Card label="Passing Year" value={qual.passing_year || "---"} />
                                <Card label="Percentage" value={qual.passing_percentage ? `${qual.passing_percentage}%` : "---"} />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-gray-500">No qualifications available</div>
                      )}
                    </div>

                    {/* === CUSTOM FIELDS === */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold text-gray-700 mb-4">Custom Fields</h3>
                      {teacherData?.custom_fields && teacherData.custom_fields.length > 0 ? (
                        <div className="space-y-4">
                          {teacherData.custom_fields.map((field, i) => {
                            // Optional: Map IDs to readable labels (you can extend this)
                            const fieldLabels = {
                              "1": "Emergency Contact",
                              "2": "Alternate Email",
                              "3": "LinkedIn Profile",
                              // Add more as needed
                            };
                            const label = fieldLabels[field.custom_field_id] || `Field ${field.custom_field_id}`;

                            return (
                              <div
                                key={i}
                                className="p-4 border rounded-xl bg-gradient-to-r from-green-50 to-teal-50 shadow-sm"
                              >
                                <h4 className="text-md font-semibold text-green-700 mb-2">{label}</h4>
                                <p className="text-gray-800 font-medium">{field.field_value || "---"}</p>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-gray-500">No custom fields available</div>
                      )}
                    </div>

                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Card = ({ label, value }) => {
  const cleanLabel = label.replace(/\*$/, "");
  const hasAsterisk = label.endsWith("*");

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <p
        className={`text-xs font-semibold uppercase tracking-wide mb-2 flex items-center gap-1 ${hasAsterisk ? "text-gray-600" : "text-gray-500"
          }`}
      >
        {cleanLabel}
        {hasAsterisk && <span className="text-red-600">*</span>}
      </p>
      <p className="font-semibold text-gray-800 text-lg">{value}</p>
    </div>
  );
};

export default TeacherViewProfile;