import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import {
  Loader2,
  Save,
  Edit3,
  X,
  MapPin,
  Mail,
  FlaskConical,
  Phone,
  User,
  Shield,
  Heart,
  Droplet,
  Clock,
  Tag,
  Building,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  ArrowLeft
} from "lucide-react";

// NOTE: Using localStorage and hardcoded URL for API connection as per previous context.
const API_BASE_URL = "http://localhost:5000/api/facility";

// Define a default structured object for operating hours
const defaultOperatingHours = {
  weekdays: "",
  weekends: "",
  notes: "",
};

const LabProfile = () => {
  const [facility, setFacility] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    emergencyContact: "",
    facilityCategory: "", // NEW FIELD ADDED
    address: {
      street: "",
      city: "",
      state: "",
      pincode: "",
    },
    contactPerson: "",
    operatingHours: defaultOperatingHours, // CHANGED TO OBJECT
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // Utility function to safely initialize operating hours as an object
  const initializeOperatingHours = (hoursData) => {
    if (hoursData && typeof hoursData === 'object' && !Array.isArray(hoursData)) {
      return {
        weekdays: hoursData.weekdays || "",
        weekends: hoursData.weekends || "",
        notes: hoursData.notes || "",
      };
    }
    // If it was previously a string (like the old state suggested) or null, initialize to defaults
    return defaultOperatingHours;
  };

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    const path = name.includes('.') ? name : name;

    switch (path) {
      case "phone":
      case "emergencyContact":
        if (value && !/^\d{10}$/.test(value)) {
          newErrors[path] = "Must be a valid 10-digit phone number";
        } else {
          delete newErrors[path];
        }
        break;
      case "address.pincode":
        if (value && !/^\d{6}$/.test(value)) {
          newErrors["address.pincode"] = "Must be a valid 6-digit pincode";
        } else {
          delete newErrors["address.pincode"];
        }
        break;
      // No validation for operatingHours fields for now, as they are free text
      default:
        // Basic check for empty required fields if needed, but keeping it flexible
        break;
    }

    // Clean up error if field becomes empty (except for specific validated fields)
    if (
      value === "" &&
      !["phone", "emergencyContact", "address.pincode"].includes(path)
    ) {
      delete newErrors[path];
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authorization token found.");
      }

      const { data } = await axios.get(`${API_BASE_URL}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (data.success) {
        setFacility(data.data);
        setFormData({
          name: data.data.name || "",
          phone: data.data.phone || "",
          emergencyContact: data.data.emergencyContact || "",
          facilityCategory: data.data.facilityCategory || "", // NEW
          address: {
            street: data.data.address?.street || "",
            city: data.data.address?.city || "",
            state: data.data.address?.state || "",
            pincode: data.data.address?.pincode || "",
          },
          contactPerson: data.data.contactPerson || "",
          operatingHours: initializeOperatingHours(data.data.operatingHours), // Mapped to object
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("❌ Fetch Profile Error:", error);
      let message;

      if (
        error.message.includes("No authorization token found") ||
        error.response?.status === 401
      ) {
        message = "Session expired or unauthorized. Please log in.";
        localStorage.removeItem("token");
        setFacility(null);
        toast.error(message);
        return;
      }

      message = error.response?.data?.message || "Failed to load profile";
      toast.error(message);
      setFacility(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("address.")) {
      const key = name.split(".")[1];
      setFormData((prev) => {
        const updatedData = {
          ...prev,
          address: { ...prev.address, [key]: value },
        };
        validateField(name, value);
        return updatedData;
      });
    } else if (name.startsWith("operatingHours.")) {
      const key = name.split(".")[1];
      setFormData((prev) => {
        const updatedData = {
          ...prev,
          operatingHours: { ...prev.operatingHours, [key]: value },
        };
        // No specific validation for hours, just update state
        return updatedData;
      });
    } else {
      setFormData((prev) => {
        const updatedData = { ...prev, [name]: value };
        validateField(name, value);
        return updatedData;
      });
    }
  };

  const handleSave = async () => {
    const currentErrors = Object.values(errors).filter((e) => e).length > 0;

    if (currentErrors) {
      toast.error("Please fix validation errors before saving");
      return;
    }
    
    // Prepare data payload, excluding internal state keys if necessary, 
    // but current formData structure aligns with the necessary updates.
    const payload = formData;

    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication required to save changes.");
        setSaving(false);
        return;
      }

      const { data } = await axios.put(
        `${API_BASE_URL}/profile`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        toast.success("Profile updated successfully!");
        setFacility(data.data);
        setIsEditing(false);
        setErrors({});
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("❌ Update Profile Error:", error);
      let message = error.response?.data?.message || "Update failed";
      toast.error(message);

      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrors({});
    if (facility) {
      setFormData({
        name: facility.name || "",
        phone: facility.phone || "",
        emergencyContact: facility.emergencyContact || "",
        facilityCategory: facility.facilityCategory || "", // NEW
        address: {
          street: facility.address?.street || "",
          city: facility.address?.city || "",
          state: facility.address?.state || "",
          pincode: facility.address?.pincode || "",
        },
        contactPerson: facility.contactPerson || "",
        operatingHours: initializeOperatingHours(facility.operatingHours), // Mapped to object
      });
    }
  };

  if (loading && !facility) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse mb-4">
            <Shield className="w-12 h-12 text-red-600 mx-auto" />
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-2">
            Loading Blood Donor Network Lab Profile
          </h2>
          <p className="text-slate-500">Preparing facility management console...</p>
        </div>
      </div>
    );
  }

  if (!facility) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
          <Shield className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-black text-slate-900 mb-2">
            Facility Profile Error
          </h3>
          <p className="text-slate-600 mb-4">
            Could not load profile. Please ensure you are authenticated.
          </p>
          <button
            onClick={fetchProfile}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-3xl transition-all duration-300"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster />
      
      {/* Glassmorphism Navigation Bar */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => window.history.back()} className="p-2 hover:bg-white/60 rounded-xl transition-all duration-300">
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </button>
              <img src="/blooddonner.png" alt="Blood Donor Network" className="w-8 h-8" />
              <h1 className="text-2xl font-black text-slate-900">Blood Donor Network</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => fetchProfile()}
                className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm border border-slate-200 rounded-3xl text-slate-700 hover:bg-white/80 transition-all duration-300"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              
              <div className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm border border-slate-200 rounded-3xl">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                  <FlaskConical className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-slate-900">Lab Profile</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 p-6 border-b-4 border-b-red-600">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-100 rounded-2xl">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                facility.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 
                facility.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                'bg-red-100 text-red-700'
              }`}>
                {facility.status?.toUpperCase()}
              </div>
            </div>
            <h3 className="text-slate-500 text-sm font-medium mb-1">Facility Status</h3>
            <p className="text-2xl font-black text-slate-900">{facility.name}</p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 p-6 border-b-4 border-b-emerald-600">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-100 rounded-2xl">
                <FlaskConical className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-bold">
                LAB
              </div>
            </div>
            <h3 className="text-slate-500 text-sm font-medium mb-1">Category</h3>
            <p className="text-2xl font-black text-slate-900">{facility.facilityCategory || 'Blood Lab'}</p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 p-6 border-b-4 border-b-blue-600">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-2xl">
                <Tag className="w-6 h-6 text-blue-600" />
              </div>
              <div className="bg-slate-100 text-slate-700 px-2 py-1 rounded-full text-xs font-bold">
                REG
              </div>
            </div>
            <h3 className="text-slate-500 text-sm font-medium mb-1">Registration</h3>
            <p className="text-lg font-black text-slate-900 font-mono">{facility.registrationNumber}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mb-8">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-slate-200 text-slate-700 px-6 py-3 rounded-3xl hover:bg-white/80 transition-all duration-300"
              >
                <X size={18} /> Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || hasErrors}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-6 py-3 rounded-3xl transition-all duration-300"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save size={18} />
                )}
                Save Changes
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-3xl transition-all duration-300"
            >
              <Edit3 size={18} /> Edit Profile
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Management Console */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                <div className="p-2 bg-red-600 rounded-xl">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                Facility Management
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:border-red-300 transition-all duration-300 cursor-pointer">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <span className="font-bold text-slate-900">Verification</span>
                  </div>
                  <p className="text-sm text-slate-600">Status: {facility.status?.toUpperCase()}</p>
                  {facility.approvedAt && (
                    <p className="text-xs text-slate-500 mt-1">
                      Approved: {new Date(facility.approvedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:border-red-300 transition-all duration-300 cursor-pointer">
                  <div className="flex items-center gap-3 mb-2">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <span className="font-bold text-slate-900">Contact</span>
                  </div>
                  <p className="text-sm text-slate-600">{facility.email}</p>
                  {facility.phone && (
                    <p className="text-xs text-slate-500 mt-1">{facility.phone}</p>
                  )}
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:border-red-300 transition-all duration-300 cursor-pointer">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="w-5 h-5 text-amber-600" />
                    <span className="font-bold text-slate-900">Hours</span>
                  </div>
                  <p className="text-sm text-slate-600">
                    {formData.operatingHours?.weekdays || 'Not set'}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:border-red-300 transition-all duration-300 cursor-pointer">
                  <div className="flex items-center gap-3 mb-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <span className="font-bold text-slate-900">Emergency</span>
                  </div>
                  <p className="text-sm text-slate-600">
                    {facility.emergencyContact || 'Not set'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
              
              {/* General Facility Details (Name, Category) */}
              <div className="mb-8">
                <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                  <div className="p-2 bg-red-600 rounded-xl">
                    <Building className="w-5 h-5 text-white" />
                  </div>
                  Facility Profile
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Name Input */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Facility Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 rounded-2xl border transition-all duration-300 ${
                        isEditing
                          ? "border-slate-300 bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          : "bg-slate-50 border-slate-200"
                      }`}
                      placeholder="e.g., Central Diagnostics Lab"
                    />
                  </div>

                  {/* Category Input */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Facility Category
                    </label>
                    <input
                      type="text"
                      name="facilityCategory"
                      value={formData.facilityCategory}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 rounded-2xl border transition-all duration-300 ${
                        isEditing
                          ? "border-slate-300 bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          : "bg-slate-50 border-slate-200"
                      }`}
                      placeholder="e.g., Blood Lab, Radiology Center"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="mb-8">
                <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                  <div className="p-2 bg-red-600 rounded-xl">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Phone Number */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 rounded-2xl border transition-all duration-300 ${
                        isEditing
                          ? "border-slate-300 bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          : "bg-slate-50 border-slate-200"
                      } ${errors.phone ? "border-red-500" : ""}`}
                      placeholder="10-digit phone number"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-2">{errors.phone}</p>
                    )}
                  </div>

                  {/* Emergency Contact */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Emergency Contact
                    </label>
                    <input
                      type="tel"
                      name="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 rounded-2xl border transition-all duration-300 ${
                        isEditing
                          ? "border-slate-300 bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          : "bg-slate-50 border-slate-200"
                      } ${errors.emergencyContact ? "border-red-500" : ""}`}
                      placeholder="Emergency contact number"
                    />
                    {errors.emergencyContact && (
                      <p className="text-red-500 text-xs mt-2">{errors.emergencyContact}</p>
                    )}
                  </div>

                  {/* Contact Person */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      name="contactPerson"
                      value={formData.contactPerson}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 rounded-2xl border transition-all duration-300 ${
                        isEditing
                          ? "border-slate-300 bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          : "bg-slate-50 border-slate-200"
                      }`}
                      placeholder="Primary contact person name"
                    />
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="mb-8">
                <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                  <div className="p-2 bg-red-600 rounded-xl">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  Facility Address
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {["street", "city", "state", "pincode"].map((field) => (
                    <div key={field} className={field === "street" ? "md:col-span-2" : ""}>
                      <label className="block text-sm font-bold text-slate-700 mb-2 capitalize">
                        {field === "pincode" ? "PIN Code" : field}
                      </label>
                      <input
                        type={field === "pincode" ? "number" : "text"}
                        name={`address.${field}`}
                        value={formData.address?.[field] || ""}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 rounded-2xl border transition-all duration-300 ${
                          isEditing
                            ? "border-slate-300 bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            : "bg-slate-50 border-slate-200"
                        } ${
                          field === "pincode" && errors["address.pincode"] ? "border-red-500" : ""
                        }`}
                        placeholder={`Enter ${field === "pincode" ? "PIN code" : field}`}
                      />
                      {field === "pincode" && errors["address.pincode"] && (
                        <p className="text-red-500 text-xs mt-2">{errors["address.pincode"]}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Operating Hours (Structured Object) */}
              <div className="mb-8">
                <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                  <div className="p-2 bg-red-600 rounded-xl">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  Operating Hours
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Weekdays */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Weekdays (e.g., Mon - Fri)
                    </label>
                    <input
                      type="text"
                      name="operatingHours.weekdays"
                      value={formData.operatingHours.weekdays}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 rounded-2xl border transition-all duration-300 ${
                        isEditing
                          ? "border-slate-300 bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          : "bg-slate-50 border-slate-200"
                      }`}
                      placeholder="e.g., 9:00 AM to 5:00 PM"
                    />
                  </div>

                  {/* Weekends */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Weekends (e.g., Sat - Sun)
                    </label>
                    <input
                      type="text"
                      name="operatingHours.weekends"
                      value={formData.operatingHours.weekends}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 rounded-2xl border transition-all duration-300 ${
                        isEditing
                          ? "border-slate-300 bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          : "bg-slate-50 border-slate-200"
                      }`}
                      placeholder="e.g., 9:00 AM to 1:00 PM or Closed"
                    />
                  </div>

                  {/* Notes */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Additional Notes (e.g., Emergency services)
                    </label>
                    <textarea
                      name="operatingHours.notes"
                      value={formData.operatingHours.notes}
                      onChange={handleChange}
                      disabled={!isEditing}
                      rows={2}
                      className={`w-full px-4 py-3 rounded-2xl border transition-all duration-300 ${
                        isEditing
                          ? "border-slate-300 bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          : "bg-slate-50 border-slate-200"
                      }`}
                      placeholder="e.g., Emergency services available 24/7."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabProfile;