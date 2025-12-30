import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  User,
  Heart,
  Calendar,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Droplet,
  Weight,
  Users,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  Shield,
  ArrowRight,
  ArrowLeft,
  Download,
  Activity
} from 'lucide-react';

const API_URL = "http://localhost:5000/api/admin";

function GetAllDonors() {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    bloodGroup: 'all',
    eligibility: 'all',
    sortBy: 'name',
    sortOrder: 'asc'
  });

  const token = localStorage.getItem("token");
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const fetchAllDonors = async (showToast = false) => {
    try {
      if (showToast) setRefreshing(true);
      else setLoading(true);

      const res = await fetch(`${API_URL}/donors`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch donors: ${res.status}`);
      }

      const data = await res.json();
      setDonors(data.donors || []);

      if (showToast) {
        toast.success(`Loaded ${data.donors?.length || 0} donors`);
      }
    } catch (error) {
      toast.error(error.message || "Failed to load donor data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllDonors();
  }, []);

  const filteredDonors = donors
    .filter(donor => {
      const matchesSearch = !filters.search || 
        donor.fullName?.toLowerCase().includes(filters.search.toLowerCase()) ||
        donor.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
        donor.phone?.includes(filters.search);
      
      const matchesBloodGroup = filters.bloodGroup === 'all' || donor.bloodGroup === filters.bloodGroup;
      
      const matchesEligibility = filters.eligibility === 'all' || 
        (filters.eligibility === 'eligible' && donor.eligibleToDonate) ||
        (filters.eligibility === 'ineligible' && !donor.eligibleToDonate);
      
      return matchesSearch && matchesBloodGroup && matchesEligibility;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (filters.sortBy) {
        case 'name':
          aValue = a.fullName?.toLowerCase();
          bValue = b.fullName?.toLowerCase();
          break;
        case 'donations':
          aValue = a.donationHistory?.length || 0;
          bValue = b.donationHistory?.length || 0;
          break;
        case 'age':
          aValue = a.age || 0;
          bValue = b.age || 0;
          break;
        default:
          aValue = a.fullName?.toLowerCase();
          bValue = b.fullName?.toLowerCase();
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
            Loading Blood Donor Network Donors
          </h2>
          <p className="text-slate-500">Preparing donor management console...</p>
        </div>
      </div>
    );
  }

  const eligibleCount = donors.filter(d => d.eligibleToDonate).length;
  const ineligibleCount = donors.filter(d => !d.eligibleToDonate).length;
  const totalDonations = donors.reduce((sum, donor) => sum + (donor.donationHistory?.length || 0), 0);

  const getEligibilityBadge = (isEligible) => {
    if (isEligible === undefined) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border bg-slate-100 text-slate-800 border-slate-200">
          <Clock size={12} /> Unknown
        </span>
      );
    }
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${
        isEligible
          ? "bg-emerald-100 text-emerald-800 border-emerald-200"
          : "bg-red-100 text-red-800 border-red-200"
      }`}>
        {isEligible ? <CheckCircle size={12} /> : <XCircle size={12} />}
        {isEligible ? "Eligible" : "Ineligible"}
      </span>
    );
  };

  const getBloodGroupBadge = (bloodGroup) => {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-black bg-red-50 text-red-700 border border-red-200">
        <Droplet size={10} />
        {bloodGroup}
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
                onClick={() => fetchAllDonors(true)}
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
                <Users className="w-6 h-6 text-red-600" />
              </div>
              <div className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-bold">
                +15%
              </div>
            </div>
            <h3 className="text-slate-500 text-sm font-medium mb-1">Total Donors</h3>
            <p className="text-3xl font-black text-slate-900">{donors.length}</p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 p-6 border-b-4 border-b-emerald-600">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-100 rounded-2xl">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-bold">
                +8%
              </div>
            </div>
            <h3 className="text-slate-500 text-sm font-medium mb-1">Eligible Donors</h3>
            <p className="text-3xl font-black text-slate-900">{eligibleCount}</p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 p-6 border-b-4 border-b-amber-600">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-100 rounded-2xl">
                <XCircle className="w-6 h-6 text-amber-600" />
              </div>
              {ineligibleCount > 0 && (
                <div className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold">
                  Review
                </div>
              )}
            </div>
            <h3 className="text-slate-500 text-sm font-medium mb-1">Ineligible</h3>
            <p className="text-3xl font-black text-slate-900">{ineligibleCount}</p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 p-6 border-b-4 border-b-blue-600">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                <Droplet className="w-6 h-6" />
              </div>
              <div className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-bold">
                +22%
              </div>
            </div>
            <h3 className="text-slate-500 text-sm font-medium mb-1">Total Donations</h3>
            <p className="text-3xl font-black text-slate-900">{totalDonations}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search donors by name, email, or phone..."
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border-slate-200 focus:ring-red-100 focus:ring-2 focus:border-red-600 transition-all"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
            </div>
            <div className="flex gap-3">
              <select
                className="px-4 py-3 rounded-xl bg-white border-slate-200 focus:ring-red-100 focus:ring-2 focus:border-red-600 transition-all"
                value={filters.bloodGroup}
                onChange={(e) => setFilters({...filters, bloodGroup: e.target.value})}
              >
                <option value="all">All Blood Types</option>
                {bloodGroups.map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
              <select
                className="px-4 py-3 rounded-xl bg-white border-slate-200 focus:ring-red-100 focus:ring-2 focus:border-red-600 transition-all"
                value={filters.eligibility}
                onChange={(e) => setFilters({...filters, eligibility: e.target.value})}
              >
                <option value="all">All Status</option>
                <option value="eligible">Eligible Only</option>
                <option value="ineligible">Ineligible Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Donors Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black tracking-tight text-slate-900">Donor Management</h2>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-200 rounded-xl transition-all duration-300">
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <div className="text-sm text-slate-500">
                  {filteredDonors.length} of {donors.length} donors
                </div>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left p-4 font-bold text-slate-900">Donor</th>
                  <th className="text-left p-4 font-bold text-slate-900">Blood Type</th>
                  <th className="text-left p-4 font-bold text-slate-900">Status</th>
                  <th className="text-left p-4 font-bold text-slate-900">Contact</th>
                  <th className="text-left p-4 font-bold text-slate-900">Donations</th>
                  <th className="text-left p-4 font-bold text-slate-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDonors.map((donor, index) => (
                  <tr key={donor._id} className="border-b border-slate-100 hover:bg-slate-50 transition-all duration-300">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-red-50 rounded-xl text-red-600">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{donor.fullName}</div>
                          <div className="text-sm text-slate-500">{donor.age} years old</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {getBloodGroupBadge(donor.bloodGroup)}
                    </td>
                    <td className="p-4">
                      {getEligibilityBadge(donor.eligibleToDonate)}
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mail className="w-3 h-3" />
                          {donor.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Phone className="w-3 h-3" />
                          {donor.phone || 'Not provided'}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                          <Heart className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-slate-900">{donor.donationHistory?.length || 0}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 rounded-xl bg-slate-100 hover:bg-red-600 hover:text-white text-slate-600 transition-all duration-300">
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredDonors.length === 0 && (
              <div className="text-center py-12">
                <div className="p-3 bg-red-50 rounded-xl text-red-600 w-fit mx-auto mb-4">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-700 mb-2">No Donors Found</h3>
                <p className="text-slate-500">Try adjusting your search filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GetAllDonors;