import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  Hospital,
  Mail,
  Phone,
  MapPin,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Search,
  ChevronDown,
  ChevronUp,
  Tag,
  Briefcase,
  Shield,
  AlertTriangle,
  Building2,
  ArrowRight,
  User,
  Filter,
  Download,
  ArrowLeft
} from 'lucide-react';

const API_URL = "http://localhost:5000/api/admin";

function GetAllFacilities() {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    facilityType: 'all',
    status: 'all',
    sortBy: 'name',
    sortOrder: 'asc'
  });

  const token = localStorage.getItem("token");

  const fetchAllFacilities = async (showToast = false) => {
    try {
      if (showToast) setRefreshing(true);
      else setLoading(true);

      const res = await fetch(`${API_URL}/facilities`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch facilities: ${res.status}`);
      }

      const data = await res.json();
      setFacilities(data.facilities || []);

      if (showToast) {
        toast.success(`Loaded ${data.facilities?.length || 0} facilities`);
      }
    } catch (error) {
      toast.error(error.message || "Failed to load facility data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllFacilities();
  }, []);

  const filteredFacilities = facilities
    .filter(facility => {
      const matchesSearch = !filters.search || 
        facility.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        facility.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
        facility.registrationNumber?.toLowerCase().includes(filters.search.toLowerCase()) ||
        facility.phone?.includes(filters.search);
      
      const matchesType = filters.facilityType === 'all' || facility.facilityType === filters.facilityType;
      const matchesStatus = filters.status === 'all' || facility.status === filters.status;
      
      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (filters.sortBy) {
        case 'name':
          aValue = a.name?.toLowerCase();
          bValue = b.name?.toLowerCase();
          break;
        case 'status':
          aValue = a.status?.toLowerCase();
          bValue = b.status?.toLowerCase();
          break;
        case 'type':
          aValue = a.facilityType?.toLowerCase();
          bValue = b.facilityType?.toLowerCase();
          break;
        default:
          aValue = a.name?.toLowerCase();
          bValue = b.name?.toLowerCase();
      }
      
      if (filters.sortOrder === 'desc') {
        return aValue < bValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse mb-4">
            <Shield className="w-12 h-12 text-red-600 mx-auto" />
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-2">
            Loading Blood Donor Network Facilities
          </h2>
          <p className="text-slate-500">Preparing facility management console...</p>
        </div>
      </div>
    );
  }

  const approvedCount = facilities.filter(f => f.status === 'approved').length;
  const pendingCount = facilities.filter(f => f.status === 'pending').length;
  const rejectedCount = facilities.filter(f => f.status === 'rejected').length;
  const hospitalCount = facilities.filter(f => f.facilityType === 'hospital').length;
  const labCount = facilities.filter(f => f.facilityType === 'blood-lab').length;

  const getStatusBadge = (status) => {
    const statusConfig = {
      approved: { color: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: <CheckCircle size={12} />, label: "Approved" },
      rejected: { color: "bg-red-100 text-red-800 border-red-200", icon: <XCircle size={12} />, label: "Rejected" },
      pending: { color: "bg-amber-100 text-amber-800 border-amber-200", icon: <Clock size={12} />, label: "Pending Review" }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${config.color}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const typeDisplay = type.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
    const isHospital = type === 'hospital';
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-black border ${
        isHospital ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-50 text-purple-700 border-purple-200'
      }`}>
        <Building2 size={10} />
        {typeDisplay}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
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
                onClick={() => fetchAllFacilities(true)}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm border border-slate-200 rounded-3xl text-slate-700 hover:bg-white/80 transition-all duration-300 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              
              <div className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm border border-slate-200 rounded-3xl">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-slate-900">Admin</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 p-6 border-b-4 border-b-red-600">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-100 rounded-2xl">
                <Building2 className="w-6 h-6 text-red-600" />
              </div>
              <div className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-bold">
                +8%
              </div>
            </div>
            <h3 className="text-slate-500 text-sm font-medium mb-1">Total Facilities</h3>
            <p className="text-3xl font-black text-slate-900">{facilities.length}</p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 p-6 border-b-4 border-b-emerald-600">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-100 rounded-2xl">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-bold">
                +12%
              </div>
            </div>
            <h3 className="text-slate-500 text-sm font-medium mb-1">Approved</h3>
            <p className="text-3xl font-black text-slate-900">{approvedCount}</p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 p-6 border-b-4 border-b-amber-600">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-100 rounded-2xl">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              {pendingCount > 0 && (
                <div className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold">
                  Alert
                </div>
              )}
            </div>
            <h3 className="text-slate-500 text-sm font-medium mb-1">Pending Review</h3>
            <p className="text-3xl font-black text-slate-900">{pendingCount}</p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 p-6 border-b-4 border-b-blue-600">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-2xl">
                <Hospital className="w-6 h-6 text-blue-600" />
              </div>
              <div className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-bold">
                +5%
              </div>
            </div>
            <h3 className="text-slate-500 text-sm font-medium mb-1">Hospitals</h3>
            <p className="text-3xl font-black text-slate-900">{hospitalCount}</p>
          </div>
        </div>

        {/* Critical Tasks Alert */}
        {pendingCount > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-3xl p-6 mb-8 hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="bg-red-600 text-white rounded-2xl p-4 flex items-center justify-center min-w-[80px] min-h-[80px]">
                <span className="text-3xl font-black">{pendingCount}</span>
              </div>
              <div>
                <h3 className="text-xl font-black text-red-800 mb-1">Critical: Pending Approvals</h3>
                <p className="text-red-600 text-sm">
                  {pendingCount} facilities require immediate review and approval
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Wide */}
          <div className="lg:col-span-2 space-y-8">
            {/* Management Console */}
            <div>
              <h2 className="text-2xl font-black text-slate-900 mb-6">Management Console</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 p-6 group cursor-pointer">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-slate-900 text-white rounded-2xl group-hover:bg-red-600 transition-all duration-300">
                      <Search className="w-6 h-6" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-red-600 transition-all duration-300" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">Search & Filter</h3>
                  <p className="text-slate-500 text-sm mb-4">Advanced facility search and filtering</p>
                  <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold inline-block">
                    {filteredFacilities.length} Results
                  </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 p-6 group cursor-pointer">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-slate-900 text-white rounded-2xl group-hover:bg-red-600 transition-all duration-300">
                      <Download className="w-6 h-6" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-red-600 transition-all duration-300" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">Export Data</h3>
                  <p className="text-slate-500 text-sm mb-4">Download facility reports and analytics</p>
                  <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold inline-block">
                    Ready
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search facilities, emails, or registration numbers..."
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                  />
                </div>
                <div className="flex gap-3">
                  <select
                    className="px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                    value={filters.facilityType}
                    onChange={(e) => setFilters({...filters, facilityType: e.target.value})}
                  >
                    <option value="all">All Types</option>
                    <option value="hospital">Hospitals</option>
                    <option value="blood-lab">Blood Labs</option>
                  </select>
                  <select
                    className="px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                  >
                    <option value="all">All Status</option>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Facilities List */}
            <div className="space-y-4">
              {filteredFacilities.map((facility) => (
                <div key={facility._id} className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-black text-slate-900">{facility.name}</h3>
                        {getTypeBadge(facility.facilityType)}
                        {getStatusBadge(facility.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-red-500" />
                          {facility.email}
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-red-500" />
                          {facility.phone || 'Not provided'}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-red-500" />
                          {facility.address?.city}, {facility.address?.state}
                        </div>
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-red-500" />
                          {facility.registrationNumber}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all duration-300">
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredFacilities.length === 0 && (
                <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
                  <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-700 mb-2">No Facilities Found</h3>
                  <p className="text-slate-500">Try adjusting your search filters.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Narrow */}
          <div className="space-y-8">
            {/* Recent Activity Log */}
            <div>
              <h3 className="text-2xl font-black text-slate-900 mb-6">Recent Activity</h3>
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                <div className="space-y-6">
                  {[1,2,3,4,5].map((_, index) => (
                    <div key={index} className="flex items-start gap-4 relative">
                      {index < 4 && (
                        <div className="absolute left-4 top-8 w-px h-12 bg-slate-200"></div>
                      )}
                      <div className="p-2 rounded-full bg-white border-2 border-slate-200 text-red-600 flex-shrink-0">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 mb-1">
                          Facility {index === 0 ? 'approved' : index === 1 ? 'registered' : 'updated'}
                        </p>
                        <p className="text-xs text-slate-500">
                          {index + 1} hour{index > 0 ? 's' : ''} ago
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <button className="w-full mt-6 bg-slate-50 hover:bg-slate-100 text-slate-700 py-3 rounded-2xl text-sm font-bold transition-all duration-300">
                  View All Activity
                </button>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-xl font-black text-slate-900 mb-6">Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Blood Labs</span>
                  <span className="font-bold text-slate-900">{labCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Hospitals</span>
                  <span className="font-bold text-slate-900">{hospitalCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Rejected</span>
                  <span className="font-bold text-red-600">{rejectedCount}</span>
                </div>
                <div className="border-t border-slate-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-900 font-bold">Total</span>
                    <span className="font-black text-slate-900 text-lg">{facilities.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GetAllFacilities;