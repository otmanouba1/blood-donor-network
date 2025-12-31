"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { 
  getCountries, 
  getStatesForCountry, 
  getCitiesForState, 
  validatePhoneForCountry, 
  validatePostalForCountry 
} from "../../utils/globalLocations";

// Constants for better maintainability
const FACILITY_TYPES = ["Hospital", "Blood Lab"];
const FACILITY_CATEGORIES = [
  "Government",
  "Private",
  "Trust",
  "Charity",
  "Other",
];

const WORKING_DAYS = [
  { value: "Mon", label: "Monday" },
  { value: "Tue", label: "Tuesday" },
  { value: "Wed", label: "Wednesday" },
  { value: "Thu", label: "Thursday" },
  { value: "Fri", label: "Friday" },
  { value: "Sat", label: "Saturday" },
  { value: "Sun", label: "Sunday" },
];

// Validation functions
const validators = {
  name: (value) => (!value.trim() ? "Facility name is required" : ""),
  email: (value) => {
    if (!value.trim()) return "Email is required";
    if (!/^\S+@\S+\.\S+$/.test(value)) return "Please enter a valid email address";
    return "";
  },
  password: (value) => {
    if (!value) return "Password is required";
    if (value.length < 6) return "Password must be at least 6 characters";
    return "";
  },
  phone: (value, formData) => {
    if (!value) return "Phone number is required";
    const country = formData?.address?.country;
    if (country) {
      return validatePhoneForCountry(value, country);
    }
    if (value.length < 8 || value.length > 15) return "Phone number must be 8-15 digits";
    if (!/^[0-9+\-\s()]+$/.test(value)) return "Invalid phone number format";
    return "";
  },
  emergencyContact: (value, formData) => {
    if (!value) return "Emergency contact is required";
    const country = formData?.address?.country;
    if (country) {
      return validatePhoneForCountry(value, country);
    }
    if (value.length < 8 || value.length > 15) return "Emergency contact must be 8-15 digits";
    if (!/^[0-9+\-\s()]+$/.test(value)) return "Invalid phone number format";
    return "";
  },
  registrationNumber: (value) => (!value.trim() ? "Registration number is required" : ""),
  "address.country": (value) => (!value.trim() ? "Country is required" : ""),
  "address.street": (value) => (!value.trim() ? "Street address is required" : ""),
  "address.city": (value) => (!value.trim() ? "City is required" : ""),
  "address.state": (value) => (!value.trim() ? "State is required" : ""),
  "address.pincode": (value, formData) => {
    if (!value) return "Postal code is required";
    const country = formData?.address?.country;
    if (country) {
      return validatePostalForCountry(value, country);
    }
    if (value.length < 3 || value.length > 10) return "Postal code must be 3-10 characters";
    return "";
  },
  "documents.registrationProof.url": (value) => (!value.trim() ? "Document URL is required" : ""),
};

export default function FacilityRegisterForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    emergencyContact: "",
    address: { country: "", street: "", city: "", state: "", pincode: "" },
    registrationNumber: "",
    facilityType: "Hospital",
    facilityCategory: "Private",
    documents: { registrationProof: { url: "", filename: "" } },
    operatingHours: {
      open: "09:00",
      close: "18:00",
      workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    },
    is24x7: false,
    emergencyServices: false,
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({});

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData(prev => {
      // Handle nested objects
      if (name.startsWith("address.")) {
        const field = name.split(".")[1];
        return {
          ...prev,
          address: { ...prev.address, [field]: value },
        };
      } else if (name.startsWith("documents.registrationProof.")) {
        const field = name.split(".")[2];
        return {
          ...prev,
          documents: {
            registrationProof: {
              ...prev.documents.registrationProof,
              [field]: value,
            },
          },
        };
      } else if (name.startsWith("operatingHours.")) {
        const field = name.split(".")[1];
        if (field === "workingDays") {
          const options = Array.from(e.target.selectedOptions).map(o => o.value);
          return {
            ...prev,
            operatingHours: { ...prev.operatingHours, workingDays: options },
          };
        }
        return {
          ...prev,
          operatingHours: { ...prev.operatingHours, [field]: value },
        };
      }
      
      // Handle regular fields
      return {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };
    });

    // Mark field as touched
    setTouched(prev => ({ ...prev, [name]: true }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle blur events for validation
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate single field
    validateField(name);
  };

  // Validate single field
  const validateField = (fieldName) => {
    let value;
    
    if (fieldName.includes(".")) {
      const [parent, child] = fieldName.split(".");
      if (parent === "address") {
        value = formData.address[child];
      } else if (fieldName.startsWith("documents.")) {
        value = formData.documents.registrationProof.url;
      }
    } else {
      value = formData[fieldName];
    }
    
    const error = validators[fieldName]?.(value);
    
    setErrors(prev => {
      if (error) {
        return { ...prev, [fieldName]: error };
      } else {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      }
    });
  };

  // Validate current step
  const validateStep = () => {
    const newErrors = {};
    
    const stepValidations = {
      1: ["name", "email"],
      2: ["password", "facilityType"],
      3: [
        "phone", 
        "emergencyContact", 
        "registrationNumber", 
        "address.country",
        "address.street", 
        "address.city", 
        "address.state", 
        "address.pincode", 
        "documents.registrationProof.url"
      ],
    };

    stepValidations[step].forEach(field => {
      let value;
      
      if (field.includes(".")) {
        const [parent, child] = field.split(".");
        if (parent === "address") {
          value = formData.address[child];
        } else if (field.startsWith("documents.")) {
          value = formData.documents.registrationProof.url;
        }
      } else {
        value = formData[field];
      }
      
      const error = validators[field]?.(value);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);
    
    // Mark all step fields as touched to show errors
    const newTouched = { ...touched };
    stepValidations[step].forEach(field => {
      newTouched[field] = true;
    });
    setTouched(newTouched);

    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Scroll to first error
      const firstErrorField = Object.keys(errors)[0];
      const element = document.querySelector(`[name="${firstErrorField}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
      }
    }
  };

  const handleBack = () => {
    setStep(step - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fixes were already here, but check again for clarity:
  const handleSubmit = async (e) => {
    // If 'e' is provided (from form onSubmit or button click), prevent default
    // In this setup, it's safer to check for a method that may exist.
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    
    // Ensure validation runs before proceeding to API call
    if (!validateStep()) {
        console.log("Validation failed on step 3. Data not submitted.");
        // Stop execution if validation fails
        return; 
    }
    
    setIsSubmitting(true);

   // 1. Get the raw facilityType string (e.g., "Blood Lab")
  const rawFacilityType = formData.facilityType;

  // 2. Create the required role slug (e.g., "blood lab" -> "blood-lab")
  const roleSlug = rawFacilityType.toLowerCase().replace(' ', '-');

  // 3. Construct the submission payload
  const submissionPayload = {
    ...formData,
    
    // IMPORTANT: Keep the facilityType field as the original capitalized value.
    facilityType: roleSlug, 
    
    // Set the role field to the required slug format.
    role: roleSlug, 
  };
    
    // **YOUR TARGET URL**
    const API_URL = "http://localhost:5000/api/auth/register"; 
    
   console.log("Submitting Data to Backend:", submissionPayload); // Use the new payload

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // ⭐️ Use the constructed payload here
      body: JSON.stringify(submissionPayload), 
    });
      
      // Check if the response status is 2xx (Success)
      if (response.ok) {
        const result = await response.json();
        console.log("Facility Data Registered Successfully:", result);
        toast("✅ Facility Registered Successfully!");
        // You might want to clear the form or redirect here
        navigate('/');
      } else {
        // Handle server-side errors (400, 500 status codes)
        const errorData = await response.json();
        console.error("Registration failed:", response.status, errorData);
        alert(`❌ Registration failed. Status: ${response.status}. Message: ${errorData.message || 'Check server logs.'}`);
      }

    } catch (error) {
      // Handle network errors (e.g., server unreachable)
      console.error("Network or fetch error:", error);
      alert("❌ Registration failed due to a network error. Ensure the backend is running.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to check if field should show error
  const shouldShowError = (fieldName) => {
    return touched[fieldName] && errors[fieldName];
  };

  const progressPercentage = (step / 3) * 100;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6">
          <h1 className="text-2xl font-bold text-center mb-2 tracking-tight">
            Blood Facility Registration
          </h1>
          <p className="text-center mb-4 opacity-90">
            Register your facility in 3 simple steps
          </p>
          
          {/* Progress Bar */}
          <div className="mb-2 flex justify-between items-center text-sm">
            <span>Step {step} of 3</span>
            <span>{progressPercentage.toFixed(0)}% Complete</span>
          </div>
          <div className="w-full bg-red-300 rounded-full h-2.5">
            <div
              className="bg-white h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span className={step >= 1 ? "font-semibold" : "opacity-75"}>Basic Info</span>
            <span className={step >= 2 ? "font-semibold" : "opacity-75"}>Account</span>
            <span className={step >= 3 ? "font-semibold" : "opacity-75"}>Details</span>
          </div>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block font-bold text-slate-900 mb-2">
                  Facility Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-3 bg-white border border-slate-200 focus:ring-2 focus:ring-red-100 rounded-xl outline-none transition ${
                    shouldShowError("name") ? "border-red-500" : ""
                  }`}
                  placeholder="Enter facility name"
                />
                {shouldShowError("name") && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <span className="mr-1">⚠</span> {errors.name}
                  </p>
                )}
              </div>
              
              <div>
                <label htmlFor="email" className="block font-bold text-slate-900 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-3 bg-white border border-slate-200 focus:ring-2 focus:ring-red-100 rounded-xl outline-none transition ${
                    shouldShowError("email") ? "border-red-500" : ""
                  }`}
                  placeholder="Enter email address"
                />
                {shouldShowError("email") && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <span className="mr-1">⚠</span> {errors.email}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Account Information */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label htmlFor="password" className="block font-bold text-slate-900 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 bg-white border border-slate-200 focus:ring-2 focus:ring-red-100 rounded-xl outline-none transition ${
                      shouldShowError("password") ? "border-red-500" : ""
                    }`}
                    placeholder="Enter password (min 6 characters)"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "🙈" : "👁"}
                  </button>
                </div>
                {shouldShowError("password") && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <span className="mr-1">⚠</span> {errors.password}
                  </p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="facilityType" className="block font-bold text-slate-900 mb-2">
                    Facility Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="facilityType"
                    name="facilityType"
                    value={formData.facilityType}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="w-full px-4 py-3 bg-white border border-slate-200 focus:ring-2 focus:ring-red-100 rounded-xl outline-none transition"
                  >
                    {FACILITY_TYPES.map(ft => (
                      <option key={ft} value={ft}>{ft}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="facilityCategory" className="block font-bold text-slate-900 mb-2">
                    Facility Category
                  </label>
                  <select
                    id="facilityCategory"
                    name="facilityCategory"
                    value={formData.facilityCategory}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border border-slate-200 focus:ring-2 focus:ring-red-100 rounded-xl outline-none transition"
                  >
                    {FACILITY_CATEGORIES.map(fc => (
                      <option key={fc} value={fc}>{fc}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Facility Details */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="phone" className="block font-medium mb-2">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition ${
                      shouldShowError("phone") ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Phone number"
                    maxLength="15"
                  />
                  {shouldShowError("phone") && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <span className="mr-1">⚠</span> {errors.phone}
                    </p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="emergencyContact" className="block font-medium mb-2">
                    Emergency Contact <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="emergencyContact"
                    type="tel"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition ${
                      shouldShowError("emergencyContact") ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Emergency contact number"
                    maxLength="15"
                  />
                  {shouldShowError("emergencyContact") && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <span className="mr-1">⚠</span> {errors.emergencyContact}
                    </p>
                  )}
                </div>
              </div>

              {/* Address Section */}
              <div className="space-y-4">
                <label className="block font-medium mb-2">Address <span className="text-red-500">*</span></label>
                
                <input
                  type="text"
                  name="address.street"
                  placeholder="Street Address"
                  value={formData.address.street}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition ${
                    shouldShowError("address.street") ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {shouldShowError("address.street") && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <span className="mr-1">⚠</span> {errors["address.street"]}
                  </p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <select
                      name="address.country"
                      value={formData.address.country}
                      onChange={(e) => {
                        handleChange(e);
                        setFormData(prev => ({
                          ...prev,
                          address: { ...prev.address, state: "", city: "" },
                        }));
                      }}
                      onBlur={handleBlur}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition ${
                        shouldShowError("address.country") ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      <option value="">Select Country</option>
                      {getCountries().map(country => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                    {shouldShowError("address.country") && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <span className="mr-1">⚠</span> {errors["address.country"]}
                      </p>
                    )}
                  </div>

                  <div>
                    <select
                      name="address.state"
                      value={formData.address.state}
                      onChange={(e) => {
                        handleChange(e);
                        setFormData(prev => ({
                          ...prev,
                          address: { ...prev.address, city: "" },
                        }));
                      }}
                      onBlur={handleBlur}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition ${
                        shouldShowError("address.state") ? "border-red-500" : "border-gray-300"
                      }`}
                      disabled={!formData.address.country}
                    >
                      <option value="">Select State/Province</option>
                      {formData.address.country &&
                        getStatesForCountry(formData.address.country).map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                    </select>
                    {shouldShowError("address.state") && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <span className="mr-1">⚠</span> {errors["address.state"]}
                      </p>
                    )}
                  </div>

                  <div>
                    <select
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition ${
                        shouldShowError("address.city") ? "border-red-500" : "border-gray-300"
                      }`}
                      disabled={!formData.address.state}
                    >
                      <option value="">Select City</option>
                      {formData.address.country && formData.address.state &&
                        getCitiesForState(formData.address.country, formData.address.state).map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                    </select>
                    {shouldShowError("address.city") && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <span className="mr-1">⚠</span> {errors["address.city"]}
                      </p>
                    )}
                  </div>

                  <div>
                    <input
                      type="text"
                      name="address.pincode"
                      placeholder="Postal Code"
                      value={formData.address.pincode}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition ${
                        shouldShowError("address.pincode") ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {shouldShowError("address.pincode") && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <span className="mr-1">⚠</span> {errors["address.pincode"]}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="registrationNumber" className="block font-medium mb-2">
                  Registration Number <span className="text-red-500">*</span>
                </label>
                <input
                  id="registrationNumber"
                  type="text"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition ${
                    shouldShowError("registrationNumber") ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter registration number"
                />
                {shouldShowError("registrationNumber") && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <span className="mr-1">⚠</span> {errors.registrationNumber}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="documentUrl" className="block font-medium mb-2">
                  Registration Proof URL <span className="text-red-500">*</span>
                </label>
                <input
                  id="documentUrl"
                  type="url"
                  name="documents.registrationProof.url"
                  value={formData.documents.registrationProof.url}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition ${
                    shouldShowError("documents.registrationProof.url") ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="https://example.com/document.pdf"
                />
                {shouldShowError("documents.registrationProof.url") && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <span className="mr-1">⚠</span> {errors["documents.registrationProof.url"]}
                  </p>
                )}
              </div>

              {/* Operating Hours */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="openTime" className="block font-medium mb-2">
                    Opening Time
                  </label>
                  <input
                    id="openTime"
                    type="time"
                    name="operatingHours.open"
                    value={formData.operatingHours.open}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label htmlFor="closeTime" className="block font-medium mb-2">
                    Closing Time
                  </label>
                  <input
                    id="closeTime"
                    type="time"
                    name="operatingHours.close"
                    value={formData.operatingHours.close}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="workingDays" className="block font-medium mb-2">
                  Working Days
                </label>
                <select
                  id="workingDays"
                  name="operatingHours.workingDays"
                  multiple
                  value={formData.operatingHours.workingDays}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition h-32"
                  size={5}
                >
                  {WORKING_DAYS.map(day => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  Hold Ctrl/Cmd to select multiple days
                </p>
              </div>

              {/* Service Options */}
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is24x7"
                    checked={formData.is24x7}
                    onChange={handleChange}
                    className="w-4 h-4 accent-red-500"
                  />
                  <span className="font-medium">24x7 Service</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="emergencyServices"
                    checked={formData.emergencyServices}
                    onChange={handleChange}
                    className="w-4 h-4 accent-red-500"
                  />
                  <span className="font-medium">Emergency Services</span>
                </label>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className={`flex ${step > 1 ? 'justify-between' : 'justify-end'} pt-6 border-t`}>
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-300 font-medium"
                disabled={isSubmitting}
              >
                Back
              </button>
            )}
            
            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-200 rounded-xl font-medium transition-all duration-300"
              >
                Next Step
              </button>
            ) : (
               <button
                type="button" // Must be type="button"
                onClick={handleSubmit} // Must call handleSubmit manually
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-200 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-all duration-300"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Registering...
                  </>
                ) : (
                  "Register Facility"
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}