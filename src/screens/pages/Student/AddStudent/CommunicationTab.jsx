import React, { useState, useEffect, useCallback, useRef } from "react";
import { ChevronDown } from "lucide-react";
import {
  fetchCountries,
  fetchStates,
  fetchCities,
} from "../Services/student.service.js";

// Custom Select Component
const CustomSelect = ({ label, value, onChange, options, placeholder, disabled = false, required = false, error = false, onBlur }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        if (onBlur && required && !value) {
          onBlur();
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onBlur, required, value]);

  return (
    <div ref={dropdownRef} className="relative">
      {label && (
        <label className="block font-medium mb-1 text-gray-700">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div
        className={`w-full px-3 py-2 border ${
          disabled
            ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed'
            : error
            ? 'bg-white border-red-500 cursor-pointer hover:border-red-400'
            : 'bg-white border-gray-300 cursor-pointer hover:border-blue-400'
        } rounded min-h-[40px] flex items-center justify-between transition-all duration-150 focus:ring-2 focus:ring-blue-500`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={value ? 'text-gray-900' : 'text-gray-400'}>
          {value || placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`}
        />
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
          <div
            className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
            onClick={() => handleSelect('')}
          >
            {placeholder}
          </div>
          {options.map((option) => (
            <div
              key={option}
              className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
              onClick={() => handleSelect(option)}
            >
              {option}
            </div>
          ))}
        </div>
      )}
      {error && (
        <p className="mt-1 text-sm text-red-600">Required</p>
      )}
    </div>
  );
};

const CommunicationTab = ({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  setFieldValue,
  parentDetails,
  isExistingParent,
  markedAsExistingParent,
  markParentAsExisting,
  removeParentAsExisting,
  countries: propCountries = [],
  states: propStates = [],
  cities: propCities = [],
  getStates,
  getCities,
}) => {
  const [localCountries, setLocalCountries] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [mobileError, setMobileError] = useState(false);
  const [relationError, setRelationError] = useState(false);

  // Prevent double API calls
  const countryFetched = useRef(false);
  const stateFetched = useRef({});
  const cityFetched = useRef({});

  // === Load Countries (Only Once) ===
  const loadCountries = useCallback(async () => {
    if (countryFetched.current) return;
    countryFetched.current = true;

    try {
      setLoadingCountries(true);
      const data = await fetchCountries();
      const normalized = data.map((c) => ({
        country_id: c.country_id ?? c.id,
        countryname: c.countryname ?? c.name,
      }));
      setLocalCountries(normalized);
    } catch (err) {
      console.error("Failed to fetch countries:", err);
      setLocalCountries([]);
    } finally {
      setLoadingCountries(false);
    }
  }, []);

  // === Load States (Only if not already loaded for this countryId) ===
  const loadStates = useCallback(
    async (countryId) => {
      if (!countryId || stateFetched.current[countryId]) return;
      stateFetched.current[countryId] = true;

      setLoadingStates(true);
      try {
        const data = await fetchStates(countryId);
        getStates(data || []);
      } catch (err) {
        console.error("Failed to fetch states:", err);
        getStates([]);
      } finally {
        setLoadingStates(false);
      }
    },
    [getStates]
  );

  // === Load Cities (Only if not already loaded for this stateId) ===
  const loadCities = useCallback(
    async (stateId) => {
      if (!stateId || cityFetched.current[stateId]) return;
      cityFetched.current[stateId] = true;

      setLoadingCities(true);
      try {
        const data = await fetchCities(stateId);
        getCities(data || []);
      } catch (err) {
        console.error("Failed to fetch cities:", err);
        getCities([]);
      } finally {
        setLoadingCities(false);
      }
    },
    [getCities]
  );

  // === Initial Load: Countries (only if not passed) ===
  useEffect(() => {
    if (propCountries.length > 0) {
      setLoadingCountries(false);
    } else {
      loadCountries();
    }
  }, [propCountries, loadCountries]);

  // === Auto-load States when country changes (Edit mode) ===
  useEffect(() => {
    if (values.country && !propStates.find((s) => s.state_id === values.state)) {
      loadStates(values.country);
    }
  }, [values.country, propStates, loadStates]);

  // === Auto-load Cities when state changes (Edit mode) ===
  useEffect(() => {
    if (values.state && !propCities.find((c) => c.city_id === values.city)) {
      loadCities(values.state);
    }
  }, [values.state, propCities, loadCities]);

  const displayCountries = propCountries.length > 0 ? propCountries : localCountries;
  const displayStates = propStates;
  const displayCities = propCities;

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 flex justify-center">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
        <div className="space-y-8">
          <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
            Communication Details
          </h2>

          {/* Parent Alerts */}
          {isExistingParent && !markedAsExistingParent && (
            <div className="flex items-center gap-4 bg-yellow-100 p-4 rounded-lg border border-yellow-300">
              <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center">
                <span className="text-2xl text-yellow-700">i</span>
              </div>
              <div className="flex-1 text-sm sm:text-base">
                <span className="font-medium">
                  {parentDetails?.name} {parentDetails?.lastname}
                </span>{" "}
                is already added.
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="text-blue-600 hover:underline text-sm"
                    data-toggle="modal"
                    data-target="#parent-children-popup"
                  >
                    View Details
                  </button>
                  <button
                    type="button"
                    className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm hover:bg-blue-700"
                    onClick={() =>
                      markParentAsExisting(parentDetails, setFieldValue)
                    }
                  >
                    Mark as existing
                  </button>
                </div>
              </div>
            </div>
          )}

          {markedAsExistingParent && (
            <div className="flex items-center gap-4 bg-green-100 p-4 rounded-lg border border-green-300">
              <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                <span className="text-2xl text-green-700">✓</span>
              </div>
              <div className="flex-1 text-sm sm:text-base">
                <span className="font-medium">
                  {parentDetails?.name} {parentDetails?.lastname}
                </span>{" "}
                added as existing parent.
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="text-blue-600 hover:underline text-sm"
                    data-toggle="modal"
                    data-target="#parent-children-popup"
                  >
                    View Details
                  </button>
                  <button
                    type="button"
                    className="bg-red-600 text-white px-4 py-1.5 rounded-full text-sm hover:bg-red-700"
                    onClick={() => removeParentAsExisting(setFieldValue)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Primary Mobile & Relation - Simplified Dropdown */}
          <div className="flex justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl w-full">
              <div>
                <label className="block font-medium mb-1 text-gray-700">
                  Primary Mobile <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="parents_mobile"
                  value={values.parents_mobile || ""}
                  onChange={(e) => {
                    handleChange(e);
                    if (e.target.value.trim()) {
                      setMobileError(false);
                    }
                  }}
                  onBlur={(e) => {
                    handleBlur(e);
                    if (!e.target.value.trim()) {
                      setMobileError(true);
                    }
                  }}
                  placeholder="Enter Primary Mobile"
                  className={`w-full border rounded px-3 py-2 focus:outline-none transition-colors ${
                    (errors.parents_mobile && touched.parents_mobile) || mobileError
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 focus:border-blue-500"
                  }`}
                />
                {((errors.parents_mobile && touched.parents_mobile) || mobileError) && (
                  <p className="mt-1 text-sm text-red-600">
                    Required
                  </p>
                )}
              </div>

              <div>
                <CustomSelect
                  label="Primary Relation"
                  value={values.primary_relation
 || ""}
                  onChange={(selectedRelation) => {
                    const event = {
                      target: {
                        name: "primary_relation",
                        value: selectedRelation
                      }
                    };
                    handleChange(event);
                    if (selectedRelation) {
                      setRelationError(false);
                    }
                  }}
                  onBlur={() => {
                    if (!values.primary_relation
) {
                      setRelationError(true);
                    }
                  }}
                  options={["Father", "Mother", "Other"]}
                  placeholder="--Select Relation--"
                  required={true}
                  error={(errors.primary_relation
 && touched.primary_relation
) || relationError}
                />
              </div>
            </div>
          </div>

          {/* Father's Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block font-medium mb-1 text-gray-700">Father First Name</label>
              <input
                type="text"
                name="father_first_name"
                value={values.father_first_name || ""}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter First Name"
                className="w-full border rounded px-3 py-2 focus:outline-none border-gray-300 focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-gray-700">Father Last Name</label>
              <input
                type="text"
                name="father_last_name"
                value={values.father_last_name || ""}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter Last Name"
                className="w-full border rounded px-3 py-2 focus:outline-none border-gray-300 focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-gray-700">Father Mobile</label>
              <input
                type="text"
                name="father_contact"
                value={values.father_contact || ""}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter Mobile"
                className="w-full border rounded px-3 py-2 focus:outline-none border-gray-300 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Mother's Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block font-medium mb-1 text-gray-700">Mother First Name</label>
              <input
                type="text"
                name="mother_first_name"
                value={values.mother_first_name || ""}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter First Name"
                className="w-full border rounded px-3 py-2 focus:outline-none border-gray-300 focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-gray-700">Mother Last Name</label>
              <input
                type="text"
                name="mother_last_name"
                value={values.mother_last_name || ""}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter Last Name"
                className="w-full border rounded px-3 py-2 focus:outline-none border-gray-300 focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-gray-700">Mother Mobile</label>
              <input
                type="text"
                name="mother_contact"
                value={values.mother_contact || ""}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter Mobile"
                className="w-full border rounded px-3 py-2 focus:outline-none border-gray-300 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Address Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block font-medium mb-1 text-gray-700">Nationality</label>
              <input
                type="text"
                name="nationality"
                value={values.nationality || ""}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g., Indian"
                className="w-full border rounded px-3 py-2 focus:outline-none border-gray-300 focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block font-medium mb-1 text-gray-700">Address Line 1</label>
              <input
                type="text"
                name="address_line1"
                value={values.address_line1 || ""}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter Address"
                className="w-full border rounded px-3 py-2 focus:outline-none border-gray-300 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Country */}
            <div>
              {loadingCountries ? (
                <div>
                  <label className="block font-medium mb-1 text-gray-700">Country</label>
                  <div className="w-full border rounded px-3 py-2 bg-gray-50 text-gray-500 text-sm">
                    Loading countries...
                  </div>
                </div>
              ) : (
                <CustomSelect
                  label="Country"
                  value={displayCountries.find(c => c.country_id === values.country)?.countryname || ""}
                  onChange={(selectedCountry) => {
                    const selectedCountryObj = displayCountries.find(c => c.countryname === selectedCountry);
                    const countryId = selectedCountryObj ? selectedCountryObj.country_id : "";
                    const event = {
                      target: {
                        name: "country",
                        value: countryId
                      }
                    };
                    handleChange(event);
                    setFieldValue("state", "");
                    setFieldValue("city", "");
                    if (countryId) loadStates(countryId);
                  }}
                  options={displayCountries.map(c => c.countryname)}
                  placeholder="--Select Country--"
                />
              )}
            </div>

            {/* State */}
            <div>
              {loadingStates ? (
                <div>
                  <label className="block font-medium mb-1 text-gray-700">State</label>
                  <div className="w-full border rounded px-3 py-2 bg-gray-50 text-gray-500 text-sm">
                    Loading states...
                  </div>
                </div>
              ) : (
                <CustomSelect
                  label="State"
                  value={displayStates.find(s => s.state_id === values.state)?.statename || ""}
                  onChange={(selectedState) => {
                    const selectedStateObj = displayStates.find(s => s.statename === selectedState);
                    const stateId = selectedStateObj ? selectedStateObj.state_id : "";
                    const event = {
                      target: {
                        name: "state",
                        value: stateId
                      }
                    };
                    handleChange(event);
                    setFieldValue("city", "");
                    if (stateId) loadCities(stateId);
                  }}
                  options={displayStates.map(s => s.statename)}
                  placeholder="--Select State--"
                />
              )}
            </div>

            {/* City */}
            <div>
              {loadingCities ? (
                <div>
                  <label className="block font-medium mb-1 text-gray-700">City</label>
                  <div className="w-full border rounded px-3 py-2 bg-gray-50 text-gray-500 text-sm">
                    Loading cities...
                  </div>
                </div>
              ) : (
                <CustomSelect
                  label="City"
                  value={displayCities.find(c => c.city_id === values.city)?.cityname || ""}
                  onChange={(selectedCity) => {
                    const selectedCityObj = displayCities.find(c => c.cityname === selectedCity);
                    const cityId = selectedCityObj ? selectedCityObj.city_id : "";
                    const event = {
                      target: {
                        name: "city",
                        value: cityId
                      }
                    };
                    handleChange(event);
                  }}
                  options={displayCities.map(c => c.cityname)}
                  placeholder="--Select City--"
                />
              )}
            </div>

            <div>
              <label className="block font-medium mb-1 text-gray-700">Pincode</label>
              <input
                type="text"
                name="pincode"
                value={values.pincode || ""}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter Pincode"
                className="w-full border rounded px-3 py-2 focus:outline-none border-gray-300 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunicationTab;
