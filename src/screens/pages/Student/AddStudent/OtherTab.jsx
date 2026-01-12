import React from "react";

const OtherTab = ({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  setFieldValue,
  academicEnabled,
  vocationalEnabled,
  codingEnabled,
  sportEnabled,
  vertical1_4_enabled,
  vertical2_enabled,
  vertical3_enabled,
  vertical5_enabled,
  vertical6_enabled,
  handleCheckboxChange, // receives (e, setFieldValue)
}) => {
  const handleAddField = () => {
    setFieldValue("customFields", [
      ...(values.customFields || []),
      { id: Date.now(), value: "" },
    ]);
  };

  const handleRemoveField = (id) => {
    setFieldValue(
      "customFields",
      values.customFields.filter((field) => field.id !== id)
    );
  };

  const checkboxItems = [
    { name: "is_academic_enabled", label: "Academics", checked: academicEnabled },
    { name: "is_vocational_enabled", label: "Vocational", checked: vocationalEnabled },
    { name: "is_coding_enabled", label: "Coding", checked: codingEnabled },
    { name: "is_sport_enabled", label: "Sport", checked: sportEnabled },
    { name: "is_vertical1_4_enabled", label: "Vertical 1 & 4", checked: vertical1_4_enabled },
    { name: "is_vertical2_enabled", label: "Vertical 2", checked: vertical2_enabled },
    { name: "is_vertical3_enabled", label: "Vertical 3", checked: vertical3_enabled },
    { name: "is_vertical5_enabled", label: "Vertical 5", checked: vertical5_enabled },
    { name: "is_vertical6_enabled", label: "Vertical 6", checked: vertical6_enabled },
  ];

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 flex justify-center">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
        <div className="space-y-8">
          {/* Title */}
          <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Other Details</h2>

          {/* Content Visibility Checkboxes */}
          <div>
            <label className="block font-medium mb-3 text-gray-700">
              Select Content Visibility <span className="text-red-500">*</span>
            </label>
            {/* Layout: 
              - Default (Mobile): 2 columns 
              - MD (iPad Mini/Tablet): 2 columns (Requested "two-two layout" for better readability) 
              - LG (Desktop): 4 columns 
            */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {checkboxItems.map((item) => (
                <label
                  key={item.name}
                  className="flex items-center gap-2 cursor-pointer p-3 rounded-xl border border-gray-200 bg-white shadow-sm hover:bg-blue-50/50 transition duration-150"
                >
                  <input
                    type="checkbox"
                    name={item.name}
                    checked={item.checked}
                    onChange={(e) => handleCheckboxChange(e, setFieldValue)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Coding Counter + Add Custom Field */}
          <div className="flex flex-col sm:flex-row gap-5 items-end">
            <div className="flex-1 w-full">
              <label className="block font-medium mb-1 text-gray-700">Coding Counter</label>
              <input
                type="text"
                name="coding_count"
                value={values.coding_count || ""}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter coding counter"
                className={`w-full border rounded px-3 py-2 focus:outline-none transition-colors ${
                  errors.coding_count && touched.coding_count
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 focus:border-blue-500"
                }`}
              />
              {errors.coding_count && touched.coding_count && (
                <p className="mt-1 text-sm text-red-600">{errors.coding_count}</p>
              )}
            </div>

            <button
              type="button"
              onClick={handleAddField}
              className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2.5 rounded-full hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-md h-[42px] font-medium whitespace-nowrap"
            >
              Add Custom Field
            </button>
          </div>

          {/* Custom Fields */}
          {values.customFields?.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700">Custom Fields</h3>
              {values.customFields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex flex-col sm:flex-row gap-4 items-start sm:items-center p-4 bg-gray-50 rounded-xl border border-gray-200"
                >
                  <div className="flex-1 w-full">
                    <label className="block font-medium mb-1 text-gray-700">
                      Custom Field {index + 1}
                    </label>
                    <input
                      type="text"
                      name={`customFields[${index}].value`}
                      value={field.value}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder={`Enter value for field ${index + 1}`}
                      className={`w-full border rounded px-3 py-2 focus:outline-none transition-colors ${
                        errors.customFields?.[index]?.value
                          ? "border-red-500 focus:border-red-500"
                          : "border-gray-300 focus:border-blue-500"
                      }`}
                    />
                    {errors.customFields?.[index]?.value && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.customFields[index].value}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveField(field.id)}
                    className="w-full sm:w-auto bg-red-100 text-red-600 hover:bg-red-200 px-4 py-2 rounded-full transition flex items-center justify-center gap-1 h-[42px] font-medium"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OtherTab;