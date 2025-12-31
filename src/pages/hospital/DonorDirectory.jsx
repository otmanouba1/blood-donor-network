import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  Search,
  User,
  Phone,
  Mail,
  MapPin,
  Droplet,
  Calendar,
  Filter,
  Heart,
  Shield,
  Clock,
  ChevronDown,
  ChevronUp,
  PhoneCall,
  MessageCircle,
  Mail as MailIcon,
  ArrowLeft,
  RefreshCw,
  CheckCircle
} from "lucide-react";

const DonorDirectory = () => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    bloodGroup: "all",
    city: "all",
    availability: "all",
    sortBy: "lastDonation"
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    rareBlood: 0
  });

  // Fetch all donors
  const fetchDonors = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const queryParams = new URLSearchParams({
        search: searchTerm,
        bloodGroup: filters.bloodGroup,
        city: filters.city,
        availability: filters.availability,
        sortBy: filters.sortBy
      });

      const res = await axios.get(
        `http://localhost:5000/api/hospital/donors?${queryParams}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setDonors(res.data.donors || []);
      setStats(res.data.stats || { total: 0, available: 0, rareBlood: 0 });
    } catch (err) {
      console.error("Fetch donors error:", err);
      toast.error("Failed to load donors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, [filters, searchTerm]);

  // Contact donor
  const contactDonor = (donor) => {
    setSelectedDonor(donor);
    setShowContactModal(true);
    
    // Log contact attempt in history
    logContactAttempt(donor._id);
  };

  const logContactAttempt = async (donorId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/api/hopital/donors/${donorId}/contact`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Log contact error:", err);
    }
  };

  // Check donor availability
  const isDonorAvailable = (lastDonationDate) => {
    if (!lastDonationDate) return true;
    const lastDonation = new Date(lastDonationDate);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    return lastDonation < threeMonthsAgo;
  };

  const getAvailabilityStatus = (lastDonationDate) => {
    if (!lastDonationDate) return { status: "available", text: "Available", color: "bg-green-100 text-green-800" };
    
    const lastDonation = new Date(lastDonationDate);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    if (lastDonation < threeMonthsAgo) {
      return { status: "available", text: "Available", color: "bg-green-100 text-green-800" };
    }
    
    const nextDonationDate = new Date(lastDonation);
    nextDonationDate.setMonth(nextDonationDate.getMonth() + 3);
    const daysUntilAvailable = Math.ceil((nextDonationDate - new Date()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilAvailable <= 7) {
      return { status: "soon", text: `Available in ${daysUntilAvailable} days`, color: "bg-yellow-100 text-yellow-800" };
    }
    
    return { status: "unavailable", text: "Recently donated", color: "bg-red-100 text-red-800" };
  };

  const getTimeSinceLastDonation = (lastDonationDate) => {
    if (!lastDonationDate) return "Never donated";
    
    const lastDonation = new Date(lastDonationDate);
    const now = new Date();
    const diffTime = Math.abs(now - lastDonation);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 30) return `${diffDays} days ago`;
    
    const diffMonths = Math.floor(diffDays / 30);
    return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
  };

  const isRareBloodGroup = (bloodGroup) => {
    return ['O-', 'AB-', 'B-', 'A-'].includes(bloodGroup);
  };

  // Blood group options
  const bloodGroups = ['all', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

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
                onClick={fetchDonors}
                className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm border border-slate-200 rounded-3xl text-slate-700 hover:bg-white/80 transition-all duration-300"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              
              <div className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm border border-slate-200 rounded-3xl">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-slate-900">Donor Directory</span>
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
                <User className="w-6 h-6 text-red-600" />
              </div>
              <div className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-bold">
                +8%
              </div>
            </div>
            <h3 className="text-slate-500 text-sm font-medium mb-1">Total Donors</h3>
            <p className="text-3xl font-black text-slate-900">{stats.total}</p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 p-6 border-b-4 border-b-emerald-600">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-100 rounded-2xl">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-bold">
                Available
              </div>
            </div>
            <h3 className="text-slate-500 text-sm font-medium mb-1">Available Now</h3>
            <p className="text-3xl font-black text-slate-900">{stats.available}</p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 p-6 border-b-4 border-b-purple-600">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-2xl">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <div className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-bold">
                Rare
              </div>
            </div>
            <h3 className="text-slate-500 text-sm font-medium mb-1">Rare Blood Types</h3>
            <p className="text-3xl font-black text-slate-900">{stats.rareBlood}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Search donors by name, email, phone, or city..."
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:w-48 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-3 rounded-2xl transition-colors flex items-center justify-center gap-2"
            >
              <Filter size={18} />
              Filters
              {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-200">
              {/* Blood Group Filter */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Blood Group
                </label>
                <select
                  value={filters.bloodGroup}
                  onChange={(e) => setFilters({...filters, bloodGroup: e.target.value})}
                  className="w-full border border-slate-300 rounded-2xl px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300"
                >
                  <option value="all">All Blood Groups</option>
                  {bloodGroups.filter(bg => bg !== 'all').map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              {/* City Filter */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  City
                </label>
                <select
                  value={filters.city}
                  onChange={(e) => setFilters({...filters, city: e.target.value})}
                  className="w-full border border-slate-300 rounded-2xl px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300"
                >
                  <option value="all">All Cities</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Kolkata">Kolkata</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Pune">Pune</option>
                </select>
              </div>

              {/* Availability Filter */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Availability
                </label>
                <select
                  value={filters.availability}
                  onChange={(e) => setFilters({...filters, availability: e.target.value})}
                  className="w-full border border-slate-300 rounded-2xl px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300"
                >
                  <option value="all">All Donors</option>
                  <option value="available">Available Now</option>
                  <option value="soon">Available Soon</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Sort By
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                  className="w-full border border-slate-300 rounded-2xl px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300"
                >
                  <option value="lastDonation">Last Donation</option>
                  <option value="name">Name</option>
                  <option value="bloodGroup">Blood Group</option>
                  <option value="city">City</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Donors Grid */}
        {loading ? (
          <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-pulse mb-4">
                <Shield className="w-12 h-12 text-red-600 mx-auto" />
              </div>
              <h2 className="text-xl font-black text-slate-900 mb-2">
                Loading Blood Donor Network Directory
              </h2>
              <p className="text-slate-500">Preparing donor management console...</p>
            </div>
          </div>
        ) : donors.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl shadow-sm border border-slate-200">
            <User className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-black text-slate-900 mb-2">No donors found</h3>
            <p className="text-slate-600">
              {searchTerm || filters.bloodGroup !== 'all' || filters.city !== 'all' 
                ? 'Try adjusting your search filters' 
                : 'No donors registered in the system'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {donors.map((donor) => {
              const availability = getAvailabilityStatus(donor.lastDonationDate);
              const isRare = isRareBloodGroup(donor.bloodGroup);
              
              return (
                <div
                  key={donor._id}
                  className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 p-6"
                >
                  {/* Donor Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 text-lg">{donor.fullName}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                            donor.bloodGroup === 'O-' ? 'bg-red-100 text-red-800 border-red-200' :
                            donor.bloodGroup === 'O+' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                            donor.bloodGroup === 'A-' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                            donor.bloodGroup === 'A+' ? 'bg-green-100 text-green-800 border-green-200' :
                            donor.bloodGroup === 'B-' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                            donor.bloodGroup === 'B+' ? 'bg-indigo-100 text-indigo-800 border-indigo-200' :
                            donor.bloodGroup === 'AB-' ? 'bg-pink-100 text-pink-800 border-pink-200' :
                            'bg-slate-100 text-slate-800 border-slate-200'
                          }`}>
                            {donor.bloodGroup}
                          </span>
                          {isRare && (
                            <Shield size={14} className="text-purple-500" />
                          )}
                        </div>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${availability.color.replace('bg-', 'bg-').replace('text-', 'text-')} border-current`}>
                      {availability.text}
                    </span>
                  </div>

                  {/* Donor Details */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone size={14} className="text-red-500 flex-shrink-0" />
                      <span className="font-medium">{donor.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail size={14} className="text-red-500 flex-shrink-0" />
                      <span>{donor.email}</span>
                    </div>
                    {donor.address?.city && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin size={14} className="text-red-500 flex-shrink-0" />
                        <span>{donor.address.city}, {donor.address.state}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar size={14} className="text-red-500 flex-shrink-0" />
                      <span>Last: {getTimeSinceLastDonation(donor.lastDonationDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Droplet size={14} className="text-red-500 flex-shrink-0" />
                      <span>Total: {donor.donationHistory?.length || 0}</span>
                    </div>
                  </div>

                  {/* Contact Button */}
                  <button
                    onClick={() => contactDonor(donor)}
                    disabled={availability.status === "unavailable"}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-400 text-white py-3 px-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 font-medium"
                  >
                    <PhoneCall size={16} />
                    Contact Donor
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Contact Modal */}
        {showContactModal && selectedDonor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Contact Donor
              </h3>
              <p className="text-gray-600 mb-6">Choose how you'd like to contact {selectedDonor.fullName}</p>
              
              <div className="space-y-3">
                {/* Phone Call */}
                <a
                  href={`tel:${selectedDonor.phone}`}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-3"
                >
                  <PhoneCall size={20} />
                  <div className="text-left">
                    <div className="font-semibold">Call Now</div>
                    <div className="text-sm opacity-90">{selectedDonor.phone}</div>
                  </div>
                </a>

                {/* SMS */}
                <a
                  href={`sms:${selectedDonor.phone}`}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-3"
                >
                  <MessageCircle size={20} />
                  <div className="text-left">
                    <div className="font-semibold">Send SMS</div>
                    <div className="text-sm opacity-90">Quick message</div>
                  </div>
                </a>

                {/* Email */}
                <a
                  href={`mailto:${selectedDonor.email}`}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-3"
                >
                  <MailIcon size={20} />
                  <div className="text-left">
                    <div className="font-semibold">Send Email</div>
                    <div className="text-sm opacity-90">{selectedDonor.email}</div>
                  </div>
                </a>
              </div>

              {/* Donor Info */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">Donor Information</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div><strong>Blood Group:</strong> {selectedDonor.bloodGroup}</div>
                  <div><strong>Last Donation:</strong> {getTimeSinceLastDonation(selectedDonor.lastDonationDate)}</div>
                  {selectedDonor.address?.city && (
                    <div><strong>Location:</strong> {selectedDonor.address.city}, {selectedDonor.address.state}</div>
                  )}
                </div>
              </div>

              <button
                onClick={() => setShowContactModal(false)}
                className="w-full mt-4 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonorDirectory;