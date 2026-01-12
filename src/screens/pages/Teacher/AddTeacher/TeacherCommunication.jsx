import React from "react";

const TeacherCommunication = ({
  countries,
  states,
  cities,
  getStates,
  getCities,
  loadingStates,
  loadingCities,
  values,
  handleChange,
  errors = {},
  touched = {},
  setFieldValue,
  handleBlur,
}) => {
  
  // Handle country change with proper state and city reset
  const handleCountryChange = (countryId) => {
    setFieldValue("country", countryId);
    setFieldValue("state", "");
    setFieldValue("city", "");
    if (countryId) {
      getStates(countryId);
    }
  };

  // Handle state change with proper city reset
  const handleStateChange = (stateId) => {
    setFieldValue("state", stateId);
    setFieldValue("city", "");
    if (stateId) {
      getCities(stateId);
    }
  };

  // Helper function to ensure unique keys
  const getUniqueKey = (item, prefix, index) => {
    if (item.country_id) return `${prefix}-${item.country_id}`;
    if (item.state_id) return `${prefix}-${item.state_id}`;
    if (item.city_id) return `${prefix}-${item.city_id}`;
    return `${prefix}-${index}`;
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 flex justify-center">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
        <div className="space-y-8">
          {/* Address Line 1, Line 2, Country */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Address Line 1 */}
            <div>
              <label className="block font-medium mb-1 text-gray-700">
                Address Line 1 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="address_line1"
                value={values.address_line1 || ""}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter Address Here"
                className={`w-full border rounded px-3 py-2 focus:outline-none transition-colors ${
                  errors.address_line1 && touched.address_line1
                    ? "border-red-500"
                    : "border-gray-300 focus:border-blue-500"
                }`}
              />
              {errors.address_line1 && touched.address_line1 && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.address_line1}
                </p>
              )}
            </div>

            {/* Address Line 2 */}
            <div>
              <label className="block font-medium mb-1 text-gray-700">
                Address Line 2
              </label>
              <input
                type="text"
                name="address_line2"
                value={values.address_line2 || ""}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter Address Here"
                className={`w-full border rounded px-3 py-2 focus:outline-none transition-colors ${
                  errors.address_line2 && touched.address_line2
                    ? "border-red-500"
                    : "border-gray-300 focus:border-blue-500"
                }`}
              />
              {errors.address_line2 && touched.address_line2 && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.address_line2}
                </p>
              )}
            </div>

            {/* Country */}
            <div>
              <label className="block font-medium mb-1 text-gray-700">
                Country <span className="text-red-500">*</span>
              </label>
              <select
                name="country"
                value={values.country || ""}
                onChange={(e) => {
                  handleCountryChange(e.target.value);
                }}
                onBlur={handleBlur}
                className={`w-full border rounded px-3 py-2 focus:outline-none transition-colors ${
                  errors.country && touched.country
                    ? "border-red-500"
                    : "border-gray-300 focus:border-blue-500"
                }`}
              >
                <option value="">--Select a country--</option>
                {countries?.map((country, index) => (
                  <option 
                    key={getUniqueKey(country, 'country', index)} 
                    value={country.country_id || country.id}
                  >
                    {country.countryname || country.name}
                  </option>
                ))}
              </select>
              {errors.country && touched.country && (
                <p className="mt-1 text-sm text-red-600">{errors.country}</p>
              )}
            </div>
          </div>

          {/* State, City, Pincode */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* State */}
            <div>
              <label className="block font-medium mb-1 text-gray-700">
                State <span className="text-red-500">*</span>
              </label>
              <select
                name="state"
                value={values.state || ""}
                onChange={(e) => {
                  handleStateChange(e.target.value);
                }}
                onBlur={handleBlur}
                disabled={!values.country || loadingStates}
                className={`w-full border rounded px-3 py-2 focus:outline-none transition-colors ${
                  !values.country || loadingStates
                    ? "bg-gray-50 cursor-not-allowed border-gray-300"
                    : errors.state && touched.state
                    ? "border-red-500"
                    : "border-gray-300 focus:border-blue-500"
                }`}
              >
                <option value="">
                  {loadingStates ? "Loading states..." : "--Select a state--"}
                </option>
                {states?.map((state, index) => (
                  <option 
                    key={getUniqueKey(state, 'state', index)} 
                    value={state.state_id || state.id}
                  >
                    {state.statename || state.name}
                  </option>
                ))}
              </select>
              {errors.state && touched.state && (
                <p className="mt-1 text-sm text-red-600">{errors.state}</p>
              )}
            </div>

            {/* City */}
            <div>
              <label className="block font-medium mb-1 text-gray-700">
                City <span className="text-red-500">*</span>
              </label>
              <select
                name="city"
                value={values.city || ""}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={!values.state || loadingCities}
                className={`w-full border rounded px-3 py-2 focus:outline-none transition-colors ${
                  !values.state || loadingCities
                    ? "bg-gray-50 cursor-not-allowed border-gray-300"
                    : errors.city && touched.city
                    ? "border-red-500"
                    : "border-gray-300 focus:border-blue-500"
                }`}
              >
                <option value="">
                  {loadingCities ? "Loading cities..." : "--Select a city--"}
                </option>
                {cities?.map((city, index) => (
                  <option 
                    key={getUniqueKey(city, 'city', index)} 
                    value={city.city_id || city.id}
                  >
                    {city.cityname || city.name}
                  </option>
                ))}
              </select>
              {errors.city && touched.city && (
                <p className="mt-1 text-sm text-red-600">{errors.city}</p>
              )}
            </div>

            {/* Pincode */}
            <div>
              <label className="block font-medium mb-1 text-gray-700">
                Pincode <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="pincode"
                value={values.pincode || ""}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter pincode"
                className={`w-full border rounded px-3 py-2 focus:outline-none transition-colors ${
                  errors.pincode && touched.pincode
                    ? "border-red-500"
                    : "border-gray-300 focus:border-blue-500"
                }`}
              />
              {errors.pincode && touched.pincode && (
                <p className="mt-1 text-sm text-red-600">{errors.pincode}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherCommunication;