import React, { useState } from "react";
import { Upload } from 'lucide-react'; // Importing the Lucide Upload icon

const TransportTab = ({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  handleFileUpload,
  uploadingDriverPhoto,
  sizeDError,
  driverPhotoError,
  setFieldValue,
}) => {
  const [driverImageName, setDriverImageName] = useState("");
  const [fileError, setFileError] = useState("");

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-3 sm:p-5 md:p-8 flex justify-center">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-lg border border-gray-100 p-5 sm:p-8">
        <div className="space-y-8">
          {/* Title */}
          <h2 className="text-xl md:text-2xl font-semibold text-gray-800 border-b pb-2">
            Transport Details
          </h2>

          {/* Transport Details: Enforcing md:grid-cols-2 (iPad Mini) and using md:col-span-2 for Bus Stop */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            
            {/* Field 1: Mode Of Transport */}
            <div>
              <label className="block font-medium mb-1 text-gray-700">
                Mode Of Transport
              </label>
              <input
                type="text"
                name="mode_of_transport"
                value={values.mode_of_transport || ""}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. Bus, Van, Walk"
                className="w-full border rounded-md px-3 py-2 focus:outline-none border-gray-300 focus:border-blue-500 transition-colors text-sm md:text-base"
              />
            </div>

            {/* Field 2: Bus Number */}
            <div>
              <label className="block font-medium mb-1 text-gray-700">
                Bus Number
              </label>
              <input
                type="text"
                name="bus_number"
                value={values.bus_number || ""}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter Bus Number"
                className="w-full border rounded-md px-3 py-2 focus:outline-none border-gray-300 focus:border-blue-500 transition-colors text-sm md:text-base"
              />
            </div>

            {/* Field 3: Bus Stop - Spanning 2 columns on medium screens for a clean wrap */}
            <div className="md:col-span-2 lg:col-span-1">
              <label className="block font-medium mb-1 text-gray-700">Bus Stop</label>
              <input
                type="text"
                name="bus_stop"
                value={values.bus_stop || ""}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter Bus Stop"
                className="w-full border rounded-md px-3 py-2 focus:outline-none border-gray-300 focus:border-blue-500 transition-colors text-sm md:text-base"
              />
            </div>
          </div>

          {/* Driver Details: Enforcing md:grid-cols-2 (iPad Mini) and using md:col-span-2 for Profile Photo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            
            {/* Field 1: Driver Name */}
            <div>
              <label className="block font-medium mb-1 text-gray-700">
                Driver Name
              </label>
              <input
                type="text"
                name="driver_name"
                value={values.driver_name || ""}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter Driver Name"
                className="w-full border rounded-md px-3 py-2 focus:outline-none border-gray-300 focus:border-blue-500 transition-colors text-sm md:text-base"
              />
            </div>

            {/* Field 2: Driver Phone Number */}
            <div>
              <label className="block font-medium mb-1 text-gray-700">
                Driver Phone Number
              </label>
              <input
                type="text"
                name="driver_phone_number"
                value={values.driver_phone_number || ""}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter Phone Number"
                className="w-full border rounded-md px-3 py-2 focus:outline-none border-gray-300 focus:border-blue-500 transition-colors text-sm md:text-base"
              />
            </div>

            {/* Field 3: Profile Photo - Spanning 2 columns on medium screens for a clean wrap */}
            <div className="md:col-span-2 lg:col-span-1">
              <label className="block font-medium mb-1 text-gray-700">Profile Photo</label>
              <div className="relative">
                <input
                  type="text"
                  value={driverImageName || "No file chosen"}
                  readOnly
                  placeholder="Upload Driver Photo"
                  className={`w-full border rounded-md px-3 py-2 focus:outline-none transition-colors bg-gray-50 text-sm md:text-base ${
                    sizeDError
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 focus:border-blue-500"
                  }`}
                />
                <input
                  type="file"
                  id="driverPhoto"
                  accept="image/jpeg,image/png,image/jpg"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      // Validate file size (500KB = 500 * 1024 bytes)
                      if (file.size > 500 * 1024) {
                        setFileError("File size must be less than 500KB");
                        setDriverImageName("");
                        e.target.value = ""; // Clear the input
                        return;
                      }
                      
                      setFileError("");
                      setDriverImageName(file.name);
                      handleFileUpload(file);
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFieldValue("driver_avatar", reader.result);
                      };
                      reader.readAsDataURL(file);
                      e.target.value = ""; // Clear the input to allow re-selection
                    }
                  }}
                  disabled={uploadingDriverPhoto}
                />
                <label
                  htmlFor="driverPhoto"
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                >
                  {/* Using Lucide Icon */}
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">Upload</span>
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                jpeg, png, jpg file less than 500kb*
              </p>
              {(driverPhotoError || fileError) && (
                <p className="mt-1 text-sm text-red-600">{driverPhotoError || fileError}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransportTab;