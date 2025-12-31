import React, { useEffect, useState } from "react";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Plus, 
  Trash2, 
  Edit3,
  Search,
  ChevronDown,
  ChevronUp,
  Droplet,
  CheckCircle,
  XCircle,
  MoreVertical,
  Shield,
  ArrowLeft,
  User,
  RefreshCw
} from "lucide-react";
import { toast } from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

const BloodCamps = () => {
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCamp, setEditingCamp] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    sortBy: 'date',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCamps: 0,
    hasNext: false,
    hasPrev: false
  });
  const [stats, setStats] = useState({
    upcoming: 0,
    ongoing: 0,
    completed: 0,
    cancelled: 0,
    total: 0
  });

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    venue: "",
    city: "",
    state: "",
    pincode: "",
    expectedDonors: "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [actionMenu, setActionMenu] = useState(null);

  const token = localStorage.getItem("token");
  // Fixed API URL - removed /blood-lab if it doesn't exist
  const API_URL = "http://localhost:5000/api/blood-lab";

  console.log("🔧 BloodCamps Component State:", {
    campsCount: camps.length,
    loading,
    showForm,
    editingCamp: editingCamp?._id,
    filters,
    pagination,
    stats,
    token: token ? "Present" : "Missing"
  });

  // Calculate stats from camps data
  const calculateStats = (campsData) => {
    console.log("📊 Calculating stats from camps:", campsData);
    const stats = {
      upcoming: campsData.filter(camp => camp.status === 'Upcoming').length,
      ongoing: campsData.filter(camp => camp.status === 'Ongoing').length,
      completed: campsData.filter(camp => camp.status === 'Completed').length,
      cancelled: campsData.filter(camp => camp.status === 'Cancelled').length,
      total: campsData.length
    };
    console.log("📈 Calculated stats:", stats);
    return stats;
  };

  // Validation function
  const validateForm = (data) => {
    console.log("📋 Validating form data:", data);
    const newErrors = {};

    if (!data.title?.trim()) newErrors.title = "Title is required";
    if (!data.date) newErrors.date = "Date is required";
    if (!data.startTime) newErrors.startTime = "Start time is required";
    if (!data.endTime) newErrors.endTime = "End time is required";
    if (!data.venue?.trim()) newErrors.venue = "Venue is required";
    if (!data.city?.trim()) newErrors.city = "City is required";
    if (!data.state?.trim()) newErrors.state = "State is required";
    if (!data.pincode?.match(/^[1-9][0-9]{5}$/)) newErrors.pincode = "Valid 6-digit pincode required";
    if (!data.expectedDonors || data.expectedDonors < 1) newErrors.expectedDonors = "Expected donors must be at least 1";

    // Date validation
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(data.date);
    if (selectedDate < today) {
      newErrors.date = "Date cannot be in the past";
    }

    // Time validation
    if (data.startTime && data.endTime && data.startTime >= data.endTime) {
      newErrors.endTime = "End time must be after start time";
    }

    console.log("❌ Validation errors:", newErrors);
    return newErrors;
  };

  // Fetch blood camps with filters
  const fetchCamps = async (page = 1) => {
    try {
      setLoading(true);
      console.log("🔄 Fetching camps with filters:", { ...filters, page });
      
      const queryParams = new URLSearchParams({
        status: filters.status,
        page: page.toString(),
        limit: '8',
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        ...(filters.search && { search: filters.search })
      });

      // Try different endpoint variations
      const url = `${API_URL}/camps?${queryParams}`;
      console.log("📡 API URL:", url);

      const res = await fetch(url, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      console.log("📨 Response status:", res.status, res.statusText);

      // Check if response is JSON
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error("❌ Server returned non-JSON response:", text.substring(0, 200));
        throw new Error("Server returned HTML instead of JSON. Check API endpoint.");
      }

      if (!res.ok) {
        const errorData = await res.json();
        console.error("❌ API Error Response:", errorData);
        throw new Error(errorData.message || `Failed to fetch camps: ${res.status}`);
      }

      const data = await res.json();
      console.log("✅ API Response data:", data);
      
      if (data.success) {
        const campsData = data.data?.camps || data.camps || [];
        const calculatedStats = calculateStats(campsData);
        
        console.log("📊 Setting camps data:", {
          campsCount: campsData.length,
          pagination: data.data?.pagination || data.pagination,
          stats: calculatedStats
        });
        
        setCamps(campsData);
        setPagination(data.data?.pagination || data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalCamps: 0,
          hasNext: false,
          hasPrev: false
        });
        setStats(calculatedStats);
      } else {
        console.error("❌ API returned success: false", data);
        throw new Error(data.message || "Failed to fetch camps");
      }
    } catch (err) {
      console.error("🚨 Fetch camps error:", err);
      toast.error(err.message || "Failed to load blood camps");
      // Set empty state on error
      setCamps([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalCamps: 0,
        hasNext: false,
        hasPrev: false
      });
      setStats({
        upcoming: 0,
        ongoing: 0,
        completed: 0,
        cancelled: 0,
        total: 0
      });
    } finally {
      setLoading(false);
    }
  };

  // Update camp status - FIXED VERSION
  const updateCampStatus = async (campId, newStatus) => {
    try {
      console.log("🔄 Updating camp status:", { campId, newStatus });
      
      // Try different endpoint variations
      const endpoints = [
        `${API_URL}/camps/${campId}/status`,
        `${API_URL}/camps/${campId}`,
        `${API_URL}/camps/${campId}/status`
      ];

      let lastError = null;

      for (const url of endpoints) {
        try {
          console.log("🔗 Trying endpoint:", url);
          
          const payload = { status: newStatus };
          const res = await fetch(url, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          });

          // Check content type before parsing
          const contentType = res.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            const text = await res.text();
            console.warn("⚠️ Non-JSON response from", url, text.substring(0, 100));
            continue; // Try next endpoint
          }

          const data = await res.json();
          console.log("📨 Status update response:", { status: res.status, data });

          if (res.ok && data.success) {
            toast.success(`Camp marked as ${newStatus.toLowerCase()}!`);
            setActionMenu(null);
            fetchCamps(); // Refresh the list
            return; // Success, exit function
          } else {
            lastError = new Error(data.message || "Failed to update camp status");
          }
        } catch (err) {
          console.warn("⚠️ Endpoint failed:", url, err.message);
          lastError = err;
        }
      }

      // If all endpoints failed
      if (lastError) {
        throw lastError;
      } else {
        throw new Error("No valid endpoint found for status update");
      }

    } catch (err) {
      console.error("🚨 Status update error:", err);
      toast.error(err.message || "Error updating camp status");
    }
  };

  useEffect(() => {
    console.log("🎯 BloodCamps component mounted");
    fetchCamps();
  }, [filters]);

  // Reset form
  const resetForm = () => {
    console.log("🔄 Resetting form");
    setFormData({
      title: "",
      description: "",
      date: "",
      startTime: "",
      endTime: "",
      venue: "",
      city: "",
      state: "",
      pincode: "",
      expectedDonors: "",
    });
    setErrors({});
    setEditingCamp(null);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    console.log("📤 Form submission started:", { formData, editingCamp: editingCamp?._id });

    const formErrors = validateForm(formData);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      setSubmitting(false);
      return;
    }

    try {
      // Try different endpoint variations
      const baseUrls = [
        `${API_URL}/camps`,
        `${API_URL}/camps`
      ];

      let lastError = null;

      for (const baseUrl of baseUrls) {
        const url = editingCamp ? `${baseUrl}/${editingCamp._id}` : baseUrl;
        const method = editingCamp ? "PUT" : "POST";

        const payload = {
          title: formData.title.trim(),
          description: formData.description.trim(),
          date: formData.date,
          time: {
            start: formData.startTime,
            end: formData.endTime,
          },
          location: {
            venue: formData.venue.trim(),
            city: formData.city.trim(),
            state: formData.state.trim(),
            pincode: formData.pincode,
          },
          expectedDonors: Number(formData.expectedDonors),
        };

        console.log("📦 Sending payload:", payload);
        console.log("🔗 Making request to:", url, "Method:", method);

        try {
          const res = await fetch(url, {
            method,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          });

          // Check content type
          const contentType = res.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            const text = await res.text();
            console.warn("⚠️ Non-JSON response from", url, text.substring(0, 100));
            continue;
          }

          const data = await res.json();
          console.log("📨 Form submission response:", { status: res.status, data });

          if (res.ok && data.success) {
            toast.success(`Blood Camp ${editingCamp ? 'Updated' : 'Added'} Successfully!`);
            resetForm();
            setShowForm(false);
            fetchCamps();
            return; // Success, exit function
          } else {
            lastError = new Error(data.message || `Failed to ${editingCamp ? 'update' : 'add'} blood camp`);
          }
        } catch (err) {
          console.warn("⚠️ Endpoint failed:", url, err.message);
          lastError = err;
        }
      }

      // If all endpoints failed
      if (lastError) {
        throw lastError;
      } else {
        throw new Error("No valid endpoint found for camp operation");
      }

    } catch (err) {
      console.error("🚨 Form submission error:", err);
      toast.error(err.message || `Error ${editingCamp ? 'updating' : 'adding'} camp`);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle edit
  const handleEdit = (camp) => {
    console.log("✏️ Editing camp:", camp);
    setEditingCamp(camp);
    setFormData({
      title: camp.title,
      description: camp.description || "",
      date: new Date(camp.date).toISOString().split('T')[0],
      startTime: camp.time.start,
      endTime: camp.time.end,
      venue: camp.location.venue,
      city: camp.location.city,
      state: camp.location.state,
      pincode: camp.location.pincode,
      expectedDonors: camp.expectedDonors.toString(),
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle delete
  const handleDeleteCamp = async (id) => {
    console.log("🗑️ Deleting camp:", id);
    if (!window.confirm("Are you sure you want to delete this camp? This action cannot be undone.")) return;
    
    try {
      // Try different endpoint variations
      const endpoints = [
        `${API_URL}/camps/${id}`,
        `${API_URL}/camps/${id}`
      ];

      let lastError = null;

      for (const url of endpoints) {
        try {
          console.log("🔗 DELETE request to:", url);

          const res = await fetch(url, {
            method: "DELETE",
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
          });

          // Check content type
          const contentType = res.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            const text = await res.text();
            console.warn("⚠️ Non-JSON response from", url, text.substring(0, 100));
            continue;
          }

          const data = await res.json();
          console.log("📨 Delete response:", { status: res.status, data });

          if (res.ok && data.success) {
            toast.success("Camp deleted successfully!");
            fetchCamps();
            return; // Success, exit function
          } else {
            lastError = new Error(data.message || "Failed to delete camp");
          }
        } catch (err) {
          console.warn("⚠️ Endpoint failed:", url, err.message);
          lastError = err;
        }
      }

      // If all endpoints failed
      if (lastError) {
        throw lastError;
      } else {
        throw new Error("No valid endpoint found for delete operation");
      }

    } catch (err) {
      console.error("🚨 Delete camp error:", err);
      toast.error(err.message || "Error deleting camp");
    }
  };

  // Handle input change
  const handleInputChange = (field, value) => {
    console.log("⌨️ Input change:", field, value);
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      Upcoming: { color: "bg-blue-100 text-blue-800", label: "Upcoming", icon: Calendar },
      Ongoing: { color: "bg-green-100 text-green-800", label: "Ongoing", icon: Clock },
      Completed: { color: "bg-gray-100 text-gray-800", label: "Completed", icon: CheckCircle },
      Cancelled: { color: "bg-red-100 text-red-800", label: "Cancelled", icon: XCircle }
    };

    const config = statusConfig[status] || statusConfig.Upcoming;
    const IconComponent = config.icon;

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${config.color}`}>
        <IconComponent size={12} />
        {config.label}
      </span>
    );
  };

  // Get available status actions for a camp - FIXED to include Completed
  const getAvailableActions = (camp) => {
    const baseActions = [];
    
    switch (camp.status) {
      case 'Upcoming':
        baseActions.push(
          { label: 'Mark as Ongoing', value: 'Ongoing', color: 'text-green-600' },
          { label: 'Cancel Camp', value: 'Cancelled', color: 'text-red-600' }
        );
        break;
      case 'Ongoing':
        baseActions.push(
          { label: 'Mark as Completed', value: 'Completed', color: 'text-gray-600' },
          { label: 'Cancel Camp', value: 'Cancelled', color: 'text-red-600' }
        );
        break;
      case 'Completed':
        baseActions.push(
          { label: 'Re-open as Ongoing', value: 'Ongoing', color: 'text-green-600' },
          { label: 'Mark as Upcoming', value: 'Upcoming', color: 'text-blue-600' }
        );
        break;
      case 'Cancelled':
        baseActions.push(
          { label: 'Re-schedule as Upcoming', value: 'Upcoming', color: 'text-blue-600' },
          { label: 'Mark as Ongoing', value: 'Ongoing', color: 'text-green-600' }
        );
        break;
      default:
        // Default actions for any status
        baseActions.push(
          { label: 'Mark as Upcoming', value: 'Upcoming', color: 'text-blue-600' },
          { label: 'Mark as Ongoing', value: 'Ongoing', color: 'text-green-600' },
          { label: 'Mark as Completed', value: 'Completed', color: 'text-gray-600' },
          { label: 'Cancel Camp', value: 'Cancelled', color: 'text-red-600' }
        );
    }

    return baseActions;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Glassmorphism Navigation Bar */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Back */}
            <div className="flex items-center gap-4">
              <Button
                onClick={() => window.history.back()}
                variant="ghost"
                className="p-2 bg-white/60 backdrop-blur-sm border border-slate-200 rounded-2xl text-slate-700 hover:bg-white/80 transition-all duration-300"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <img src="/blooddonner.png" alt="Blood Donor Network" className="w-8 h-8" />
                <h1 className="text-2xl font-black text-slate-900">Blood Donor Network</h1>
              </div>
            </div>
            
            {/* Right Side */}
            <div className="flex items-center gap-4">
              <Button
                onClick={() => {
                  resetForm();
                  setShowForm(!showForm);
                }}
                className="bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-200 rounded-xl font-medium transition-all duration-300"
              >
                <Plus className="w-4 h-4 mr-2" />
                {showForm ? 'Cancel' : 'Add Camp'}
              </Button>
              
              {/* Lab Profile Chip */}
              <div className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm border border-slate-200 rounded-3xl">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                <span className="font-black text-slate-900">Camps</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-red-100 rounded-2xl">
              <Droplet className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900">Blood Donation Camps</h2>
              <p className="text-slate-500 mt-1">
                Manage and organize blood donation camps
              </p>
            </div>
          </div>

          {/* Hero Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <Card className="border-b-4 border-b-red-600 hover:shadow-md transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-red-100 rounded-2xl">
                    <Calendar className="w-6 h-6 text-red-600" />
                  </div>
                </div>
                <h3 className="text-slate-500 text-sm font-medium mb-1">Total Camps</h3>
                <p className="text-3xl font-black text-slate-900">{stats.total}</p>
              </CardContent>
            </Card>
            
            <Card className="border-b-4 border-b-blue-600 hover:shadow-md transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-2xl">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-slate-500 text-sm font-medium mb-1">Upcoming</h3>
                <p className="text-3xl font-black text-slate-900">{stats.upcoming}</p>
              </CardContent>
            </Card>
            
            <Card className="border-b-4 border-b-emerald-600 hover:shadow-md transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-emerald-100 rounded-2xl">
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
                <h3 className="text-slate-500 text-sm font-medium mb-1">Ongoing</h3>
                <p className="text-3xl font-black text-slate-900">{stats.ongoing}</p>
              </CardContent>
            </Card>
            
            <Card className="border-b-4 border-b-slate-600 hover:shadow-md transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-slate-100 rounded-2xl">
                    <CheckCircle className="w-6 h-6 text-slate-600" />
                  </div>
                </div>
                <h3 className="text-slate-500 text-sm font-medium mb-1">Completed</h3>
                <p className="text-3xl font-black text-slate-900">{stats.completed}</p>
              </CardContent>
            </Card>
            
            <Card className="border-b-4 border-b-amber-600 hover:shadow-md transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-amber-100 rounded-2xl">
                    <XCircle className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
                <h3 className="text-slate-500 text-sm font-medium mb-1">Cancelled</h3>
                <p className="text-3xl font-black text-slate-900">{stats.cancelled}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 mb-6 hover:shadow-lg transition-all duration-300">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search camps..."
                  value={filters.search}
                  onChange={(e) => {
                    console.log("🔍 Search filter:", e.target.value);
                    setFilters(prev => ({ ...prev, search: e.target.value }))
                  }}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 focus:ring-2 focus:ring-red-100 rounded-xl outline-none transition-all duration-300"
                />
              </div>
            </div>
            <select
              value={filters.status}
              onChange={(e) => {
                console.log("📊 Status filter:", e.target.value);
                setFilters(prev => ({ ...prev, status: e.target.value }))
              }}
              className="px-4 py-3 bg-white border border-slate-200 focus:ring-2 focus:ring-red-100 rounded-xl outline-none transition-all duration-300"
            >
              <option value="all">All Status</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <select
              value={filters.sortBy}
              onChange={(e) => {
                console.log("📈 Sort by:", e.target.value);
                setFilters(prev => ({ ...prev, sortBy: e.target.value }))
              }}
              className="px-4 py-3 bg-white border border-slate-200 focus:ring-2 focus:ring-red-100 rounded-xl outline-none transition-all duration-300"
            >
              <option value="date">Sort by Date</option>
              <option value="title">Sort by Title</option>
              <option value="expectedDonors">Sort by Donors</option>
            </select>
            <button
              onClick={() => {
                console.log("🔄 Toggling sort order");
                setFilters(prev => ({ 
                  ...prev, 
                  sortOrder: prev.sortOrder === 'desc' ? 'asc' : 'desc' 
                }))
              }}
              className="px-4 py-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all duration-300"
            >
              {filters.sortOrder === 'desc' ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            </button>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-lg border border-red-100 p-6 mb-8"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Droplet className="w-5 h-5 text-red-600" />
              {editingCamp ? 'Edit Blood Camp' : 'Add New Blood Camp'}
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Camp Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={`w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                    errors.title ? 'border-red-500' : ''
                  }`}
                  placeholder="Enter camp title"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className={`w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                    errors.date ? 'border-red-500' : ''
                  }`}
                />
                {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
              </div>

              {/* Times */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => handleInputChange('startTime', e.target.value)}
                    className={`w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                      errors.startTime ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.startTime && <p className="text-red-500 text-sm mt-1">{errors.startTime}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time *
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => handleInputChange('endTime', e.target.value)}
                    className={`w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                      errors.endTime ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.endTime && <p className="text-red-500 text-sm mt-1">{errors.endTime}</p>}
                </div>
              </div>

              {/* Location Fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Venue *
                </label>
                <input
                  type="text"
                  value={formData.venue}
                  onChange={(e) => handleInputChange('venue', e.target.value)}
                  className={`w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                    errors.venue ? 'border-red-500' : ''
                  }`}
                  placeholder="Enter venue name"
                />
                {errors.venue && <p className="text-red-500 text-sm mt-1">{errors.venue}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className={`w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                    errors.city ? 'border-red-500' : ''
                  }`}
                  placeholder="Enter city"
                />
                {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className={`w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                    errors.state ? 'border-red-500' : ''
                  }`}
                  placeholder="Enter state"
                />
                {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pincode *
                </label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => handleInputChange('pincode', e.target.value)}
                  className={`w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                    errors.pincode ? 'border-red-500' : ''
                  }`}
                  placeholder="6-digit pincode"
                  maxLength={6}
                />
                {errors.pincode && <p className="text-red-500 text-sm mt-1">{errors.pincode}</p>}
              </div>

              {/* Expected Donors */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Donors *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.expectedDonors}
                  onChange={(e) => handleInputChange('expectedDonors', e.target.value)}
                  className={`w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                    errors.expectedDonors ? 'border-red-500' : ''
                  }`}
                  placeholder="Expected number of donors"
                />
                {errors.expectedDonors && <p className="text-red-500 text-sm mt-1">{errors.expectedDonors}</p>}
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Enter camp description (optional)"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 mt-6">
              <button
                type="submit"
                disabled={submitting}
                className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-6 py-2 rounded-lg transition-colors"
              >
                {submitting ? 'Saving...' : (editingCamp ? 'Update Camp' : 'Create Camp')}
              </button>
              <button
                type="button"
                onClick={() => {
                  console.log("❌ Form cancelled");
                  setShowForm(false);
                  resetForm();
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Blood Camps List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            <span className="ml-3 text-gray-600">Loading camps...</span>
          </div>
        ) : camps.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg border border-red-100">
            <div className="text-gray-400 mb-4">
              <Droplet size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No blood camps found</h3>
            <p className="text-gray-600 mb-4">
              {filters.status !== 'all' || filters.search ? 'Try changing your filters' : 'Get started by creating your first blood camp'}
            </p>
            {!filters.search && filters.status === 'all' && (
              <button
                onClick={() => {
                  console.log("➕ Create first camp clicked");
                  setShowForm(true);
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
              >
                Create Your First Camp
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {camps.map((camp) => {
                console.log("🎪 Rendering camp card:", camp._id, camp.title);
                const availableActions = getAvailableActions(camp);
                
                return (
                  <div
                    key={camp._id}
                    className="bg-white rounded-2xl shadow-lg border border-red-100 p-6 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
                        {camp.title}
                      </h3>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(camp)}
                          className="text-red-600 hover:text-red-700 p-1 transition-colors"
                          title="Edit camp"
                        >
                          <Edit3 size={16} />
                        </button>
                        {availableActions.length > 0 && (
                          <div className="relative">
                            <button
                              onClick={() => setActionMenu(actionMenu === camp._id ? null : camp._id)}
                              className="text-gray-600 hover:text-gray-700 p-1 transition-colors"
                              title="More actions"
                            >
                              <MoreVertical size={16} />
                            </button>
                            {actionMenu === camp._id && (
                              <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10 min-w-48">
                                {availableActions.map((action) => (
                                  <button
                                    key={action.value}
                                    onClick={() => updateCampStatus(camp._id, action.value)}
                                    className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${action.color}`}
                                  >
                                    {action.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                        <button
                          onClick={() => handleDeleteCamp(camp._id)}
                          className="text-red-500 hover:text-red-600 p-1 transition-colors"
                          title="Delete camp"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mb-4">
                      <StatusBadge status={camp.status} />
                      <span className="text-sm text-gray-500">
                        {new Date(camp.date).toLocaleDateString()}
                      </span>
                    </div>

                    {camp.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {camp.description}
                      </p>
                    )}

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Clock size={16} className="mr-2 text-red-500 flex-shrink-0" />
                        <span>{camp.time.start} - {camp.time.end}</span>
                      </div>
                      <div className="flex items-start">
                        <MapPin size={16} className="mr-2 text-red-500 flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-2">
                          {camp.location.venue}, {camp.location.city}, {camp.location.state} - {camp.location.pincode}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Users size={16} className="mr-2 text-red-500 flex-shrink-0" />
                        <span>Expected: {camp.expectedDonors} donors</span>
                      </div>
                      {camp.actualDonors > 0 && (
                        <div className="flex items-center text-green-600">
                          <Users size={16} className="mr-2 flex-shrink-0" />
                          <span>Actual: {camp.actualDonors} donors</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-4">
                <button
                  onClick={() => {
                    console.log("⬅️ Previous page");
                    fetchCamps(pagination.currentPage - 1);
                  }}
                  disabled={!pagination.hasPrev}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => {
                    console.log("➡️ Next page");
                    fetchCamps(pagination.currentPage + 1);
                  }}
                  disabled={!pagination.hasNext}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BloodCamps;