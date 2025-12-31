import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import {
  Loader2, Save, Edit3, X, MapPin, Mail, Phone, User, 
  Heart, Droplets, Calendar, Award, AlertCircle, ChevronRight, Shield, RefreshCw, ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const API_BASE_URL = "http://localhost:5000/api";
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

const DonorProfile = () => {
  const [donor, setDonor] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    age: "",
    gender: "",
    weight: "",
    bloodGroup: "",
    address: { street: "", city: "", state: "", pincode: "" },
    password: "",
  });

  const validationRules = {
    fullName: { required: true, minLength: 2 },
    phone: { required: true, pattern: /^[0-9]{10}$/ },
    age: { required: true, min: 18, max: 65 },
    gender: { required: true },
    weight: { required: true, min: 45 },
    bloodGroup: { required: true },
    "address.street": { required: true },
    "address.pincode": { required: true, pattern: /^[0-9]{6}$/ },
  };

  // --- Logic Functions ---

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authorization token found.");

      const { data } = await axios.get(`${API_BASE_URL}/donor/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.donor) {
        setDonor({ ...data.donor, donorId: data.donor._id });
        setFormData({
          ...data.donor,
          address: { ...data.donor.address },
          password: "",
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load profile");
      if (error.response?.status === 401) localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const validateField = (name, value) => {
    const rules = validationRules[name];
    if (!rules) return null;
    if (rules.required && !value) return "Required";
    if (rules.pattern && !rules.pattern.test(value)) return "Invalid format";
    if (rules.min && Number(value) < rules.min) return `Min: ${rules.min}`;
    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const field = name.split(".")[1];
      setFormData(prev => ({ ...prev, address: { ...prev.address, [field]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.put(`${API_BASE_URL}/donor/profile`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        toast.success("Profile updated!");
        setDonor(data.donor);
        setIsEditing(false);
      }
    } catch (error) {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  // --- Sub-Components for UI ---

  const FormField = ({ label, name, type = "text", placeholder, isSelect, options, value }) => (
    <div className="space-y-1.5">
      <Label className="text-sm font-bold text-slate-700">{label}</Label>
      {isSelect ? (
        <select
          name={name}
          value={value}
          onChange={handleChange}
          disabled={!isEditing}
          className="flex h-10 w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 disabled:opacity-60 transition-all duration-300"
        >
          <option value="">Select {label}</option>
          {options.map(opt => (
            <option key={opt.value || opt} value={opt.value || opt}>{opt.label || opt}</option>
          ))}
        </select>
      ) : (
        <Input
          type={type}
          name={name}
          value={value}
          onChange={handleChange}
          disabled={!isEditing}
          placeholder={placeholder}
          className={`rounded-2xl transition-all duration-300 ${errors[name] ? "border-red-500 focus:ring-red-500" : "focus:ring-red-500"}`}
        />
      )}
      {errors[name] && (
        <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
          <AlertCircle size={12} /> {errors[name]}
        </p>
      )}
    </div>
  );

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-pulse mb-4">
          <Shield className="w-12 h-12 text-red-600 mx-auto" />
        </div>
        <h2 className="text-xl font-black text-slate-900 mb-2">
          Loading Blood Donor Network Profile
        </h2>
        <p className="text-slate-500">Preparing donor management console...</p>
      </div>
    </div>
  );

  if (!donor) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <Shield className="w-12 h-12 text-red-600 mx-auto mb-4" />
        <h2 className="text-xl font-black text-slate-900 mb-2">
          Profile Not Found
        </h2>
        <p className="text-slate-500">Unable to load donor profile.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster position="top-right" />
      
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
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-slate-900">Donor Profile</span>
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
                <Heart className="w-6 h-6 text-red-600" />
              </div>
              <Badge className="bg-red-100 text-red-700 border-none hover:bg-red-100">
                {donor?.bloodGroup || 'N/A'}
              </Badge>
            </div>
            <h3 className="text-slate-500 text-sm font-medium mb-1">Blood Group</h3>
            <p className="text-2xl font-black text-slate-900">{donor?.fullName || 'Unknown'}</p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 p-6 border-b-4 border-b-emerald-600">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-100 rounded-2xl">
                <Award className="w-6 h-6 text-emerald-600" />
              </div>
              <Badge className={donor?.status === 'active' ? 'bg-emerald-100 text-emerald-700 border-none' : 'bg-slate-100 text-slate-700 border-none'}>
                {donor?.status || 'Unknown'}
              </Badge>
            </div>
            <h3 className="text-slate-500 text-sm font-medium mb-1">Donor Status</h3>
            <p className="text-2xl font-black text-slate-900">Active Donor</p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 p-6 border-b-4 border-b-blue-600">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-2xl">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="bg-slate-100 text-slate-700 px-2 py-1 rounded-full text-xs font-bold">
                ID: {donor?.donorId?.slice(-6) || 'N/A'}
              </div>
            </div>
            <h3 className="text-slate-500 text-sm font-medium mb-1">Last Donation</h3>
            <p className="text-lg font-black text-slate-900">
              {donor?.lastDonation ? new Date(donor.lastDonation).toLocaleDateString() : 'Never'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mb-8">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-slate-200 text-slate-700 px-6 py-3 rounded-3xl hover:bg-white/80 transition-all duration-300"
              >
                <X size={16} /> Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-6 py-3 rounded-3xl transition-all duration-300"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />}
                Save Profile
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-3xl transition-all duration-300"
            >
              <Edit3 size={16} /> Edit Details
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
                Donor Management Console
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:border-red-300 transition-all duration-300 cursor-pointer">
                  <div className="flex items-center gap-3 mb-2">
                    <Award className="w-5 h-5 text-emerald-600" />
                    <span className="font-bold text-slate-900">Status</span>
                  </div>
                  <p className="text-sm text-slate-600">Current: {donor?.status || 'Unknown'}</p>
                  <p className="text-xs text-slate-500 mt-1">Eligible for donation</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:border-red-300 transition-all duration-300 cursor-pointer">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <span className="font-bold text-slate-900">Last Donated</span>
                  </div>
                  <p className="text-sm text-slate-600">
                    {donor?.lastDonation ? new Date(donor.lastDonation).toLocaleDateString() : 'Never'}
                  </p>
                </div>

                <div className="p-4 bg-red-50 rounded-2xl border border-red-200 hover:border-red-300 transition-all duration-300 cursor-pointer md:col-span-2">
                  <div className="flex items-center gap-3 mb-2">
                    <Heart className="w-5 h-5 text-red-600" />
                    <span className="font-bold text-red-900">Ready to save lives?</span>
                  </div>
                  <p className="text-sm text-red-700 mb-3">Keep your weight and health details updated to stay eligible.</p>
                  <button 
                    onClick={() => window.location.href = '/donor/camps'}
                    className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-2xl transition-all duration-300 font-medium"
                  >
                    Find Donation Camps
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                <div className="p-2 bg-red-600 rounded-xl">
                  <User className="w-5 h-5 text-white" />
                </div>
                Personal Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Full Name" name="fullName" value={formData.fullName} />
                <FormField label="Phone Number" name="phone" type="tel" value={formData.phone} />
                <FormField label="Age" name="age" type="number" value={formData.age} />
                <FormField label="Gender" name="gender" isSelect options={GENDER_OPTIONS} value={formData.gender} />
                <FormField label="Weight (kg)" name="weight" type="number" value={formData.weight} />
                <FormField label="Blood Group" name="bloodGroup" isSelect options={BLOOD_GROUPS} value={formData.bloodGroup} />
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                <div className="p-2 bg-red-600 rounded-xl">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                Address & Location
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <FormField label="Street Address" name="address.street" value={formData.address.street} />
                </div>
                <FormField label="City" name="address.city" value={formData.address.city} />
                <FormField label="State" name="address.state" value={formData.address.state} />
                <FormField label="Pincode" name="address.pincode" type="number" value={formData.address.pincode} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorProfile;