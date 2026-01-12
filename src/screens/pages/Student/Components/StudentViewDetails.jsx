import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import moment from "moment";
import { X, User, GraduationCap, MessageCircle, Bus, Mail, Phone } from "lucide-react";
import { fetchStudentById, fetchStudentHistory, fetchCountries, fetchStates, fetchCities } from "../Services/student.service.js";
import { DivisionService } from "../../Academics/Services/Division.service.js";
import { batchService } from "../../Academics/Services/batch.Service.js";

export default function StudentViewDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("1");
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [enrichedHistory, setEnrichedHistory] = useState([]);
  
  // Reference data for lookups
  const [programsMap, setProgramsMap] = useState({});
  const [divisionsMap, setDivisionsMap] = useState({});
  const [batchesMap, setBatchesMap] = useState({});
  const [locationNames, setLocationNames] = useState({ country: '', state: '', city: '' });

  useEffect(() => {
    if (!id) return navigate("/student");

    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchStudentById(Number(id));
        setStudent(data);
        
        // Resolve location names
        if (data.country) {
          const countries = await fetchCountries();
          const country = countries.find(c => c.country_id === parseInt(data.country));
          if (country) setLocationNames(prev => ({ ...prev, country: country.countryname }));
        }
        if (data.state && data.country) {
          const states = await fetchStates(data.country);
          const state = states.find(s => s.state_id === parseInt(data.state));
          if (state) setLocationNames(prev => ({ ...prev, state: state.statename }));
        }
        if (data.city && data.state) {
          const cities = await fetchCities(data.state);
          const city = cities.find(c => c.city_id === parseInt(data.city));
          if (city) setLocationNames(prev => ({ ...prev, city: city.cityname }));
        }
      } catch (e) {
        console.error(e);
        alert("Student not found");
        navigate("/student");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  // Fetch reference data for lookups
  useEffect(() => {
    const loadReferenceData = async () => {
      try {
        // Load programs from localStorage
        const storedPrograms = localStorage.getItem('college_programs');
        if (storedPrograms) {
          const programs = JSON.parse(storedPrograms);
          const pMap = {};
          programs.forEach(p => {
            pMap[p.program_id] = p.program_name;
          });
          setProgramsMap(pMap);
        }

        // Load all divisions
        const divisions = await DivisionService.getDivision();
        const dMap = {};
        if (Array.isArray(divisions)) {
          divisions.forEach(d => {
            dMap[d.division_id] = d.division_name;
          });
        }
        setDivisionsMap(dMap);

        // Load all batches
        const batches = await batchService.getBatch();
        const bMap = {};
        if (Array.isArray(batches)) {
          batches.forEach(b => {
            bMap[b.batch_id] = {
              name: b.batch_name,
              academic_years: b.academic_years || []
            };
          });
        }
        setBatchesMap(bMap);
      } catch (e) {
        console.error("Failed to load reference data:", e);
      }
    };
    loadReferenceData();
  }, []);

  useEffect(() => {
    if (activeTab === "5" && id && history.length === 0) {
      const loadHistory = async () => {
        try {
          setHistoryLoading(true);
          const data = await fetchStudentHistory(Number(id));
          setHistory(data);
          
          // Enrich history data with names
          const enriched = data.map(record => {
            const enrichedRecord = { ...record };
            
            // Look up division name
            if (record.division_id && divisionsMap[record.division_id]) {
              enrichedRecord.division_name = divisionsMap[record.division_id];
            }
            
            // Look up academic year and semester names from batches
            if (record.academic_year_id || record.semester_id) {
              Object.values(batchesMap).forEach(batch => {
                if (batch.academic_years && Array.isArray(batch.academic_years)) {
                  batch.academic_years.forEach(ay => {
                    // Match academic year
                    if (record.academic_year_id === ay.academic_year_id) {
                      enrichedRecord.academic_year_name = ay.academic_year_name;
                      enrichedRecord.class_name = ay.class_year_name;
                      enrichedRecord.batch_name = batch.name;
                      
                      // Match semester within this academic year
                      if (ay.semesters && Array.isArray(ay.semesters)) {
                        const semester = ay.semesters.find(s => s.semester_id === record.semester_id);
                        if (semester) {
                          enrichedRecord.semester_name = semester.semester_name;
                        }
                      }
                    }
                  });
                }
              });
            }
            
            return enrichedRecord;
          });
          
          // Sort chronologically (most recent first, then by id)
          enriched.sort((a, b) => {
            // If we have allocated_at timestamps, use those
            if (a.allocated_at && b.allocated_at) {
              return b.allocated_at - a.allocated_at;
            }
            // Otherwise sort by ID (higher ID = more recent)
            return b.id - a.id;
          });
          
          setEnrichedHistory(enriched);
        } catch (e) {
          console.error("Failed to fetch student history:", e);
        } finally {
          setHistoryLoading(false);
        }
      };
      loadHistory();
    }
  }, [activeTab, id, history.length, divisionsMap, batchesMap]);

  const get = (path, fallback = "---") => {
    if (!student) return fallback;
    const value = path.split(".").reduce((o, k) => (o?.[k] !== undefined ? o[k] : fallback), student);
    return value || fallback;
  };

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-t-4 border-blue-600"></div>
      </div>
    );

  if (!student) return null;

  return (
    <div className="p-2 sm:p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="content-wrapper">
        <div className="student-form-container">
          {/* Header */}
          <div className="page-header relative mb-4 sm:mb-6">
            <Link
              to="/student"
              className="absolute top-0 right-0 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-white transition-all shadow-sm hover:shadow-md"
              style={{ backgroundColor: "rgb(33 98 193 / var(--tw-bg-opacity, 1))" }}
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
            <div className="flex flex-col items-center text-center">
              <img
                src={student.avatar || "https://via.placeholder.com/150"}
                alt="Avatar"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border object-cover mb-3"
              />
              <h3 className="text-lg sm:text-xl md:text-2xl font-semibold m-0" style={{ color: "rgb(33 98 193 / var(--tw-bg-opacity, 1))" }}>
                {student.firstname} {student.middlename || ""} {student.lastname}
              </h3>
              <div className="flex items-center justify-center gap-4 mt-2">
                <div className="flex items-center gap-1">
                  <Mail className="w-4 h-4" style={{ color: "rgb(33 98 193 / var(--tw-bg-opacity, 1))" }} />
                  <span className="text-black text-sm">{student.email}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Phone className="w-4 h-4" style={{ color: "rgb(33 98 193 / var(--tw-bg-opacity, 1))" }} />
                  <span className="text-black text-sm">{student.mobile}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-4 sm:mb-6">
            <ul className="flex flex-wrap -mb-px text-xs sm:text-sm font-medium text-center text-gray-500 dark:text-gray-400 justify-center overflow-x-auto">
              {[
                { k: "1", l: "Personal", icon: User },
                { k: "2", l: "Educational", icon: GraduationCap },
                { k: "3", l: "Communication", icon: MessageCircle },
                { k: "4", l: "Transport", icon: Bus },
                 { k: "5", l: "Academic Journey", icon: GraduationCap },
              ].map((t, index) => {
                const Icon = t.icon;
                const isActive = activeTab === t.k;
                return (
                  <li key={t.k} className="me-1 sm:me-4 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setActiveTab(t.k)}
                      className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-5 py-2 sm:py-3 border-b-2 rounded-t-lg transition-all duration-200 ${
                        isActive
                          ? "text-blue-600 border-blue-600"
                          : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <span
                        className={`flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full text-xs font-semibold ${
                          isActive
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {index + 1}
                      </span>
                      <Icon
                        className={`w-3 h-3 sm:w-4 sm:h-4 ${
                          isActive ? "text-blue-600" : "text-gray-400"
                        }`}
                      />
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
            {/* PERSONAL */}
            {activeTab === "1" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">First Name</p>
                  <p className="font-semibold text-gray-800 text-lg">{get("firstname")}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Middle Name</p>
                  <p className="font-semibold text-gray-800 text-lg">{get("middlename")}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Last Name</p>
                  <p className="font-semibold text-gray-800 text-lg">{get("lastname")}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Gender</p>
                  <p className="font-semibold text-gray-800 text-lg">{get("gender")}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Date of Birth</p>
                  <p className="font-semibold text-gray-800 text-lg">
                    {student.date_of_birth
                      ? moment(new Date(student.date_of_birth)).format("DD/MM/YYYY")
                      : "---"}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Date of Admission</p>
                  <p className="font-semibold text-gray-800 text-lg">
                    {student.date_of_admission
                      ? moment(student.date_of_admission).format("DD/MM/YYYY")
                      : "---"}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Blood Group</p>
                  <p className="font-semibold text-gray-800 text-lg">{get("blood_group")}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Mother Tongue</p>
                  <p className="font-semibold text-gray-800 text-lg">{get("mother_tongue")}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Birth Place</p>
                  <p className="font-semibold text-gray-800 text-lg">{get("birthplace")}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Nationality</p>
                  <p className="font-semibold text-gray-800 text-lg">{get("nationality")}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Caste</p>
                  <p className="font-semibold text-gray-800 text-lg">{get("caste")}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Sub Caste</p>
                  <p className="font-semibold text-gray-800 text-lg">{get("sub_cast")}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Caste Category</p>
                  <p className="font-semibold text-gray-800 text-lg">{get("cast_category")}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Aadhaar Number</p>
                  <p className="font-semibold text-gray-800 text-lg">{get("aadhar_number")}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Name As Per Aadhaar</p>
                  <p className="font-semibold text-gray-800 text-lg">{get("name_as_per_aadhaar_card")}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Religion</p>
                  <p className="font-semibold text-gray-800 text-lg">{get("religion")}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Class House</p>
                  <p className="font-semibold text-gray-800 text-lg">{get("school_house")}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Weight (kg)</p>
                  <p className="font-semibold text-gray-800 text-lg">{get("weight")}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Native Place</p>
                  <p className="font-semibold text-gray-800 text-lg">{get("native_place")}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">PRN</p>
                  <p className="font-semibold text-gray-800 text-lg">{get("permanent_registration_number")}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Admission Number</p>
                  <p className="font-semibold text-gray-800 text-lg">{get("admission_number")}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Roll Number</p>
                  <p className="font-semibold text-gray-800 text-lg">{get("roll_number")}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Saral ID</p>
                  <p className="font-semibold text-gray-800 text-lg">{get("saral_id")}</p>
                </div>
                <div className="md:col-span-2 lg:col-span-3 bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Address</p>
                  <p className="font-semibold text-gray-800 text-lg">
                    {[get("address_line1"), locationNames.city || get("city"), locationNames.state || get("state"), locationNames.country || get("country"), get("pincode")].filter(item => item !== "---").join(", ") || "---"}
                  </p>
                </div>
              </div>
            )}

            {/* EDUCATIONAL */}
            {activeTab === "2" && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">ABC ID</p>
                    <p className="font-semibold text-gray-800 text-lg">{get("abc_id")}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">University Application Number</p>
                    <p className="font-semibold text-gray-800 text-lg">{get("university_application_form")}</p>
                  </div>
                 
                  
                </div>
                
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Previous Qualifications</h3>
                  {student.education_details && Array.isArray(student.education_details) && student.education_details.length > 0 ? (
                    <div className="space-y-4">
                      {student.education_details.map((edu, index) => (
                        <div key={index} className="p-4 border rounded-xl bg-gradient-to-r from-gray-50 to-blue-50 shadow-sm">
                          <h4 className="text-lg font-semibold text-blue-700 mb-3">
                            {edu.qualification?.toUpperCase() || 'Qualification'}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Name as per Marksheet</p>
                              <p className="font-semibold text-gray-800">{edu.name_as_per_marksheet || "---"}</p>
                            </div>
                            <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">College / School</p>
                              <p className="font-semibold text-gray-800">{edu.college || "---"}</p>
                            </div>
                            <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">University / Board</p>
                              <p className="font-semibold text-gray-800">{edu.university || "---"}</p>
                            </div>
                            <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Passing Year</p>
                              <p className="font-semibold text-gray-800">{edu.passing_year || "---"}</p>
                            </div>
                            <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Percentage / CGPA</p>
                              <p className="font-semibold text-gray-800">{edu.percentage || "---"}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No education details available
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* COMMUNICATION */}
            {activeTab === "3" && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Primary Contact</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Primary Mobile</p>
                      <p className="font-semibold text-gray-800 text-lg">{get("parents_mobile")}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Primary Relation</p>
                      <p className="font-semibold text-gray-800 text-lg">{get("primary_relation")}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Father's Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Father First Name</p>
                      <p className="font-semibold text-gray-800 text-lg">{get("father_first_name")}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Father Last Name</p>
                      <p className="font-semibold text-gray-800 text-lg">{get("father_last_name")}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Father Mobile</p>
                      <p className="font-semibold text-gray-800 text-lg">{get("father_contact")}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Mother's Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Mother First Name</p>
                      <p className="font-semibold text-gray-800 text-lg">{get("mother_first_name")}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Mother Last Name</p>
                      <p className="font-semibold text-gray-800 text-lg">{get("mother_last_name")}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Mother Mobile</p>
                      <p className="font-semibold text-gray-800 text-lg">{get("mother_contact")}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Address Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Address Line 1</p>
                      <p className="font-semibold text-gray-800 text-lg">{get("address_line1")}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Country</p>
                      <p className="font-semibold text-gray-800 text-lg">{locationNames.country || get("country")}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">State</p>
                      <p className="font-semibold text-gray-800 text-lg">{locationNames.state || get("state")}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">City</p>
                      <p className="font-semibold text-gray-800 text-lg">{locationNames.city || get("city")}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Pincode</p>
                      <p className="font-semibold text-gray-800 text-lg">{get("pincode")}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TRANSPORT */}
            {activeTab === "4" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Mode of Transport</p>
                  <p className="font-semibold text-gray-800 text-lg">{get("mode_of_transport")}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Bus Number</p>
                  <p className="font-semibold text-gray-800 text-lg">{get("bus_number")}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Bus Stop</p>
                  <p className="font-semibold text-gray-800 text-lg">{get("bus_stop")}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Driver Name</p>
                  <p className="font-semibold text-gray-800 text-lg">{get("driver_name")}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Driver Phone</p>
                  <p className="font-semibold text-gray-800 text-lg">{get("driver_phone_number")}</p>
                </div>
              </div>
            )}

            {/* ACADEMIC JOURNEY */}
            {activeTab === "5" && (
              <div className="space-y-6">
                {historyLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="h-12 w-12 animate-spin rounded-full border-t-4 border-blue-600"></div>
                  </div>
                ) : enrichedHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <GraduationCap className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500 text-lg">No academic history available</p>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Timeline line - responsive positioning */}
                    <div className="absolute left-3 sm:left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-400 to-blue-200"></div>
                    <div className="space-y-6 sm:space-y-8">
                      {enrichedHistory.map((record, index) => (
                        <div key={index} className="relative pl-10 sm:pl-16">
                          {/* Timeline circle - responsive sizing */}
                          <div className="absolute left-0 sm:left-3 top-2 sm:top-3 w-6 h-6 rounded-full bg-blue-500 border-4 border-white shadow-md flex items-center justify-center">
                            <span className="text-white text-xs font-bold">{enrichedHistory.length - index}</span>
                          </div>
                          
                          {/* Card - responsive padding */}
                          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all">
                            {/* Header - responsive layout */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between mb-3 sm:mb-4 gap-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                  <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                                  <h4 className="text-base sm:text-lg font-bold text-gray-800 break-words">
                                    {record.class_name || "Class"}
                                  </h4>
                                  {record.is_active && (
                                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 whitespace-nowrap">
                                      Current
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs sm:text-sm text-gray-600 break-words">
                                  {record.academic_year_name || "Academic Year"} • {record.semester_name || "Semester"}
                                </p>
                              </div>
                              <div className="text-left sm:text-right">
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Timeline</p>
                                <p className="text-xs sm:text-sm font-semibold text-blue-600 whitespace-nowrap">
                                  {index === 0 ? "Most Recent" : `Step ${enrichedHistory.length - index}`}
                                </p>
                              </div>
                            </div>

                            {/* Grid - fully responsive */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                              <div className="bg-blue-50 p-2.5 sm:p-3 rounded-lg border border-blue-100">
                                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Batch</p>
                                <p className="font-semibold text-gray-800 text-xs sm:text-sm break-words">{record.batch_name || "---"}</p>
                              </div>
                              <div className="bg-purple-50 p-2.5 sm:p-3 rounded-lg border border-purple-100">
                                <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1">Division</p>
                                <p className="font-semibold text-gray-800 text-xs sm:text-sm break-words">{record.division_name || "---"}</p>
                              </div>
                              <div className="bg-green-50 p-2.5 sm:p-3 rounded-lg border border-green-100">
                                <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">Roll Number</p>
                                <p className="font-semibold text-gray-800 text-xs sm:text-sm break-words">{record.roll_number || "---"}</p>
                              </div>
                              <div className="bg-orange-50 p-2.5 sm:p-3 rounded-lg border border-orange-100">
                                <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide mb-1">Status</p>
                                <p className="font-semibold text-gray-800 text-xs sm:text-sm capitalize">{record.is_active ? "Active" : "Inactive"}</p>
                              </div>
                            </div>

                            {/* Timeline Events - responsive */}
                            {(record.allocated_at || record.promoted_at || record.deallocated_at) && (
                              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Timeline Events</p>
                                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3">
                                  {record.allocated_at && (
                                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                                      <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></span>
                                      <span className="text-gray-600 whitespace-nowrap">Allocated:</span>
                                      <span className="font-semibold text-gray-800">
                                        {moment.unix(record.allocated_at).format("DD/MM/YYYY")}
                                      </span>
                                    </div>
                                  )}
                                  {record.promoted_at && (
                                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                                      <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></span>
                                      <span className="text-gray-600 whitespace-nowrap">Promoted:</span>
                                      <span className="font-semibold text-gray-800">
                                        {moment.unix(record.promoted_at).format("DD/MM/YYYY")}
                                      </span>
                                    </div>
                                  )}
                                  {record.deallocated_at && (
                                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                                      <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0"></span>
                                      <span className="text-gray-600 whitespace-nowrap">Deallocated:</span>
                                      <span className="font-semibold text-gray-800">
                                        {moment.unix(record.deallocated_at).format("DD/MM/YYYY")}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
