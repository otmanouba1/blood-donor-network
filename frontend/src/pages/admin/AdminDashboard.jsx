import { useState, useEffect } from "react";
import { 
  Users, 
  Hospital, 
  Droplet, 
  Calendar, 
  Heart, 
  TrendingUp,
  Activity,
  Shield,
  Beaker,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Building2,
  FileCheck,
  Settings
} from "lucide-react";
import { toast } from "react-hot-toast";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async (showToast = false) => {
    try {
      if (showToast) setRefreshing(true);
      
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const res = await fetch("http://localhost:5000/api/admin/dashboard", {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch stats");
      }

      const data = await res.json();
      setStats(data);
      
      if (showToast) {
        toast.success("Dashboard updated successfully!");
      }
    } catch (err) {
      console.error("Dashboard error:", err);
      toast.error("Failed to load admin stats");
      // Fallback data for demo
      setStats({
        totalDonors: 1247,
        totalFacilities: 23,
        pendingFacilities: 5,
        totalDonations: 3456,
        activeDonors: 892,
        approvedFacilities: 18
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse mb-4">
            <div className="p-3 bg-red-600 rounded-xl mx-auto w-fit">
              <Shield className="w-12 h-12 text-white" />
            </div>
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-2">
            Loading Blood Donor Network
          </h2>
          <p className="text-slate-500">Preparing admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Recent Activity Data
  const recentActivity = [
    { id: 1, type: 'approval', message: 'City Hospital approved', time: '2 min ago', icon: CheckCircle, color: 'text-emerald-600' },
    { id: 2, type: 'donation', message: 'New blood donation recorded', time: '5 min ago', icon: Droplet, color: 'text-red-600' },
    { id: 3, type: 'facility', message: 'Metro Blood Lab registered', time: '12 min ago', icon: Building2, color: 'text-blue-600' },
    { id: 4, type: 'user', message: 'New donor registration', time: '18 min ago', icon: User, color: 'text-purple-600' },
    { id: 5, type: 'system', message: 'System backup completed', time: '1 hour ago', icon: Shield, color: 'text-slate-600' }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Glassmorphism Navigation Bar */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img src="/blooddonner.png" alt="Blood Donor Network" className="w-8 h-8" />
              <h1 className="text-2xl font-black text-slate-900">Blood Donor Network</h1>
            </div>
            
            {/* Right Side */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => fetchStats(true)}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm border border-slate-200 rounded-3xl text-slate-700 hover:bg-white/80 transition-all duration-300 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              
              {/* Admin Profile Chip */}
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
          {/* Total Donors */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 p-6 border-b-4 border-b-red-600">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-100 rounded-2xl">
                <Users className="w-6 h-6 text-red-600" />
              </div>
              <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">
                +12%
              </div>
            </div>
            <h3 className="text-slate-500 text-sm font-medium mb-1">Total Donors</h3>
            <p className="text-3xl font-black text-slate-900">{stats?.totalDonors?.toLocaleString() || '0'}</p>
          </div>

          {/* Total Facilities */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 p-6 border-b-4 border-b-blue-600">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-2xl">
                <Hospital className="w-6 h-6 text-blue-600" />
              </div>
              <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">
                +8%
              </div>
            </div>
            <h3 className="text-slate-500 text-sm font-medium mb-1">Facilities</h3>
            <p className="text-3xl font-black text-slate-900">{stats?.totalFacilities?.toLocaleString() || '0'}</p>
          </div>

          {/* Total Donations */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 p-6 border-b-4 border-b-emerald-600">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-100 rounded-2xl">
                <Droplet className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">
                +24%
              </div>
            </div>
            <h3 className="text-slate-500 text-sm font-medium mb-1">Blood Units</h3>
            <p className="text-3xl font-black text-slate-900">{stats?.totalDonations?.toLocaleString() || '0'}</p>
          </div>

          {/* Active Donors */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 p-6 border-b-4 border-b-purple-600">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-2xl">
                <Heart className="w-6 h-6 text-purple-600" />
              </div>
              <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">
                +15%
              </div>
            </div>
            <h3 className="text-slate-500 text-sm font-medium mb-1">Active Donors</h3>
            <p className="text-3xl font-black text-slate-900">{stats?.activeDonors?.toLocaleString() || '0'}</p>
          </div>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Wide */}
          <div className="lg:col-span-2 space-y-8">
            {/* Critical Tasks */}
            <div>
              <h2 className="text-2xl font-black text-slate-900 mb-6">Critical Tasks</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pending Approvals Alert */}
                <div className="bg-red-50 border border-red-200 rounded-3xl p-6 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="bg-red-600 text-white rounded-2xl p-4 flex items-center justify-center min-w-[80px] min-h-[80px]">
                      <span className="text-3xl font-black">{stats?.pendingFacilities || 0}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-red-800 mb-1">Pending Approvals</h3>
                      <p className="text-red-600 text-sm">Facilities awaiting verification</p>
                      <button 
                        onClick={() => window.location.href = '/admin/verification'}
                        className="mt-3 bg-red-600 text-white px-4 py-2 rounded-2xl text-sm font-bold hover:bg-red-700 transition-all duration-300"
                      >
                        Review Now
                      </button>
                    </div>
                  </div>
                </div>

                {/* System Health */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="bg-emerald-600 text-white rounded-2xl p-4 flex items-center justify-center min-w-[80px] min-h-[80px]">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-emerald-800 mb-1">System Health</h3>
                      <p className="text-emerald-600 text-sm">All systems operational</p>
                      <div className="mt-3 bg-emerald-600 text-white px-4 py-2 rounded-2xl text-sm font-bold inline-block">
                        99.9% Uptime
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Management Console */}
            <div>
              <h2 className="text-2xl font-black text-slate-900 mb-6">Management Console</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Facility Management */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 p-6 group cursor-pointer"
                     onClick={() => window.location.href = '/admin/verification'}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-slate-900 text-white rounded-2xl group-hover:bg-red-600 transition-all duration-300">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-red-600 transition-all duration-300" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">Facility Verification</h3>
                  <p className="text-slate-500 text-sm mb-4">Review and approve facility registrations</p>
                  <div className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold inline-block">
                    {stats?.pendingFacilities || 0} Pending
                  </div>
                </div>

                {/* Donor Management */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 p-6 group cursor-pointer"
                     onClick={() => window.location.href = '/admin/donors'}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-slate-900 text-white rounded-2xl group-hover:bg-red-600 transition-all duration-300">
                      <Users className="w-6 h-6" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-red-600 transition-all duration-300" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">Donor Management</h3>
                  <p className="text-slate-500 text-sm mb-4">View and manage donor profiles</p>
                  <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold inline-block">
                    {stats?.totalDonors?.toLocaleString() || 0} Total
                  </div>
                </div>

                {/* Facilities Overview */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 p-6 group cursor-pointer"
                     onClick={() => window.location.href = '/admin/facilities'}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-slate-900 text-white rounded-2xl group-hover:bg-red-600 transition-all duration-300">
                      <Hospital className="w-6 h-6" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-red-600 transition-all duration-300" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">All Facilities</h3>
                  <p className="text-slate-500 text-sm mb-4">Manage hospitals and blood labs</p>
                  <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold inline-block">
                    {stats?.approvedFacilities || 0} Active
                  </div>
                </div>

                {/* System Settings */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 p-6 group cursor-pointer">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-slate-900 text-white rounded-2xl group-hover:bg-red-600 transition-all duration-300">
                      <Settings className="w-6 h-6" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-red-600 transition-all duration-300" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">System Settings</h3>
                  <p className="text-slate-500 text-sm mb-4">Configure system parameters</p>
                  <div className="bg-purple-50 text-purple-600 px-3 py-1 rounded-full text-xs font-bold inline-block">
                    Admin Only
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Narrow */}
          <div className="space-y-8">
            {/* Recent Activity Log */}
            <div>
              <h2 className="text-2xl font-black text-slate-900 mb-6">Recent Activity</h2>
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                <div className="space-y-6">
                  {recentActivity.map((activity, index) => (
                    <div key={activity.id} className="flex items-start gap-4 relative">
                      {/* Timeline Line */}
                      {index < recentActivity.length - 1 && (
                        <div className="absolute left-4 top-8 w-px h-12 bg-slate-200"></div>
                      )}
                      
                      {/* Activity Icon */}
                      <div className={`p-2 rounded-full bg-white border-2 border-slate-200 ${activity.color} flex-shrink-0`}>
                        <activity.icon className="w-4 h-4" />
                      </div>
                      
                      {/* Activity Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 mb-1">
                          {activity.message}
                        </p>
                        <p className="text-xs text-slate-500">
                          {activity.time}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;