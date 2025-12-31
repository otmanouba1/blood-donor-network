import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { 
  Search, 
  User, 
  Phone, 
  Mail, 
  Droplet, 
  Calendar,
  CheckCircle,
  XCircle,
  History,
  Filter,
  Plus,
  Shield,
  RefreshCw,
  ArrowRight,
  AlertTriangle,
  ArrowLeft
} from "lucide-react";

const BloodLabDonor = () => {
  const [term, setTerm] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [donationData, setDonationData] = useState({
    quantity: 1,
    remarks: "",
    bloodGroup: ""
  });
  const [recentDonations, setRecentDonations] = useState([]);
  const [stats, setStats] = useState({
    today: 0,
    thisWeek: 0,
    total: 0
  });

  // Search donors
  const searchDonors = async () => {
    if (!term.trim()) {
      toast.error("Please enter search term");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:5000/api/blood-lab/donors/search?term=${term}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setResults(res.data.donors || []);
      if (res.data.donors.length === 0) {
        toast.error("No donors found");
      }
    } catch (err) {
      console.error("Search error:", err);
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  };

  // Load recent donations and stats
  const loadRecentDonations = async (showToast = false) => {
    try {
      if (showToast) setRefreshing(true);
      
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:5000/api/blood-lab/donations/recent",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRecentDonations(res.data.donations || []);
      setStats(res.data.stats || { today: 0, thisWeek: 0, total: 0 });
      
      if (showToast) {
        toast.success("Data refreshed successfully");
      }
    } catch (err) {
      console.error("Failed to load recent donations:", err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRecentDonations();
  }, []);

  // Open donation form
  const openDonationForm = (donor) => {
    setSelectedDonor(donor);
    setDonationData({
      quantity: 1,
      remarks: "",
      bloodGroup: donor.bloodGroup
    });
    setShowDonationForm(true);
  };

  // Mark donation
  const markDonation = async () => {
    if (!selectedDonor) return;

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/api/blood-lab/donors/donate/${selectedDonor._id}`,
        donationData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Donation recorded successfully!");
      setShowDonationForm(false);
      setSelectedDonor(null);
      searchDonors(); // Refresh search results
      loadRecentDonations(); // Refresh recent donations
    } catch (err) {
      console.error("Donation error:", err);
      toast.error(err.response?.data?.message || "Failed to record donation");
    }
  };

  const canDonate = (lastDonationDate) => {
    if (!lastDonationDate) return true;
    const lastDonation = new Date(lastDonationDate);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    return lastDonation < threeMonthsAgo;
  };

  const getTimeSinceLastDonation = (lastDonationDate) => {
    if (!lastDonationDate) return "Never donated";
    
    const lastDonation = new Date(lastDonationDate);
    const now = new Date();
    const diffTime = Math.abs(now - lastDonation);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) return `${diffDays} days ago`;
    const diffMonths = Math.floor(diffDays / 30);
    return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
  };

  const getBloodGroupColor = (bloodGroup) => {
    const colors = {
      "A+": "bg-red-100 text-red-800 border-red-300",
      "A-": "bg-red-50 text-red-700 border-red-200",
      "B+": "bg-blue-100 text-blue-800 border-blue-300",
      "B-": "bg-blue-50 text-blue-700 border-blue-200",
      "O+": "bg-green-100 text-green-800 border-green-300",
      "O-": "bg-green-50 text-green-700 border-green-200",
      "AB+": "bg-purple-100 text-purple-800 border-purple-300",
      "AB-": "bg-purple-50 text-purple-700 border-purple-200"
    };
    return colors[bloodGroup] || "bg-gray-100 text-gray-800 border-gray-300";
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
                onClick={() => loadRecentDonations(true)}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm border border-slate-200 rounded-3xl text-slate-700 hover:bg-white/80 transition-all duration-300 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              
              <div className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm border border-slate-200 rounded-3xl">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                  <Droplet className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-slate-900">Donor Management</span>
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
                <Droplet className="w-6 h-6 text-red-600" />
              </div>
              <div className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-bold">
                Today
              </div>
            </div>
            <h3 className="text-slate-500 text-sm font-medium mb-1">Donations Today</h3>
            <p className="text-3xl font-black text-slate-900">{stats.today}</p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 p-6 border-b-4 border-b-emerald-600">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-100 rounded-2xl">
                <Calendar className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-bold">
                Week
              </div>
            </div>
            <h3 className="text-slate-500 text-sm font-medium mb-1">This Week</h3>
            <p className="text-3xl font-black text-slate-900">{stats.thisWeek}</p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 p-6 border-b-4 border-b-blue-600">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-2xl">
                <History className="w-6 h-6 text-blue-600" />
              </div>
              <div className="bg-slate-100 text-slate-700 px-2 py-1 rounded-full text-xs font-bold">
                All Time
              </div>
            </div>
            <h3 className="text-slate-500 text-sm font-medium mb-1">Total Donations</h3>
            <p className="text-3xl font-black text-slate-900">{stats.total}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Management Console */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                <div className="p-2 bg-red-600 rounded-xl">
                  <Search className="w-5 h-5 text-white" />
                </div>
                Donor Search Console
              </h3>
              
              <div className="flex gap-3 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search by name, email, phone number..."
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300"
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchDonors()}
                  />
                </div>
                <button
                  onClick={searchDonors}
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-6 py-3 rounded-2xl transition-all duration-300 flex items-center gap-2"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Search size={18} />
                  )}
                  Search
                </button>
              </div>

              {/* Search Results */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {results.map((donor) => (
                  <div key={donor._id} className="bg-slate-50 rounded-2xl p-4 border border-slate-200 hover:border-red-300 transition-all duration-300">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-black text-slate-900 text-lg">{donor.fullName}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getBloodGroupColor(donor.bloodGroup)}`}>
                            {donor.bloodGroup}
                          </span>
                          {!canDonate(donor.lastDonationDate) && (
                            <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold">
                              Recently Donated
                            </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            <Mail size={14} className="text-red-500" />
                            <span>{donor.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone size={14} className="text-red-500" />
                            <span>{donor.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-red-500" />
                            <span>Last: {getTimeSinceLastDonation(donor.lastDonationDate)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <History size={14} className="text-red-500" />
                            <span>Total: {donor.donationHistory?.length || 0}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => openDonationForm(donor)}
                          disabled={!canDonate(donor.lastDonationDate)}
                          className="bg-red-600 hover:bg-red-700 disabled:bg-slate-400 text-white px-4 py-2 rounded-2xl transition-all duration-300 flex items-center gap-2 text-sm font-medium"
                        >
                          <Plus size={16} />
                          Donate
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {results.length === 0 && !loading && term && (
                  <div className="text-center py-8 text-slate-500">
                    <User size={48} className="mx-auto mb-2 text-slate-400" />
                    <p>No donors found matching "{term}"</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                <div className="p-2 bg-red-600 rounded-xl">
                  <History className="w-5 h-5 text-white" />
                </div>
                Recent Donations Activity
              </h3>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {recentDonations.map((donation, index) => (
                  <div key={index} className="bg-slate-50 rounded-2xl p-3 border border-slate-200 hover:border-red-300 transition-all duration-300">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-slate-900">{donation.donorName}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getBloodGroupColor(donation.bloodGroup)}`}>
                        {donation.bloodGroup}
                      </span>
                    </div>
                    <div className="text-sm text-slate-600">
                      <div className="flex justify-between">
                        <span className="font-medium">{donation.quantity} unit{donation.quantity > 1 ? 's' : ''}</span>
                        <span>{new Date(donation.date).toLocaleDateString()}</span>
                      </div>
                      {donation.remarks && (
                        <p className="text-xs text-slate-500 mt-1">Note: {donation.remarks}</p>
                      )}
                    </div>
                  </div>
                ))}
                
                {recentDonations.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <History className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    <p>No recent donations</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Donation Modal */}
        {showDonationForm && selectedDonor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                <div className="p-2 bg-red-600 rounded-xl">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                Record Donation
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    Donor
                  </label>
                  <p className="font-black text-slate-900">{selectedDonor.fullName}</p>
                  <p className="text-sm text-slate-600">{selectedDonor.email} | {selectedDonor.phone}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    Blood Group
                  </label>
                  <select
                    value={donationData.bloodGroup}
                    onChange={(e) => setDonationData({...donationData, bloodGroup: e.target.value})}
                    className="w-full border border-slate-300 rounded-2xl px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    Quantity (Units)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="2"
                    value={donationData.quantity}
                    onChange={(e) => setDonationData({...donationData, quantity: parseInt(e.target.value)})}
                    className="w-full border border-slate-300 rounded-2xl px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    Remarks (Optional)
                  </label>
                  <textarea
                    value={donationData.remarks}
                    onChange={(e) => setDonationData({...donationData, remarks: e.target.value})}
                    rows={3}
                    className="w-full border border-slate-300 rounded-2xl px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300"
                    placeholder="Any additional notes..."
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={markDonation}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-2xl transition-all duration-300 font-medium"
                >
                  Confirm Donation
                </button>
                <button
                  onClick={() => setShowDonationForm(false)}
                  className="flex-1 bg-slate-500 hover:bg-slate-600 text-white py-3 rounded-2xl transition-all duration-300 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BloodLabDonor;