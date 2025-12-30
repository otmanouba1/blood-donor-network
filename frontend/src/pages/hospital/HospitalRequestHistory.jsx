import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Calendar,
  Shield,
  RefreshCw,
  ArrowLeft,
  User,
  Droplet,
  TrendingUp,
  AlertTriangle,
  Activity,
  ArrowRight,
  FileText,
  Hospital,
  Users,
  BarChart3
} from "lucide-react";

const HospitalRequestHistory = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRequests = async (showToast = false) => {
    try {
      if (showToast) setRefreshing(true);
      else setLoading(true);
      
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/hospital/blood/requests", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setRequests(res.data.data || []);
      
      if (showToast) {
        toast.success(`Loaded ${res.data.data?.length || 0} requests`);
      }
    } catch (err) {
      console.error("Load history error:", err);
      toast.error("Failed to load request history");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const getStatusConfig = (status) => {
    const config = {
      pending: { color: "bg-amber-100 text-amber-800 border-amber-200", icon: Clock, label: "Pending" },
      accepted: { color: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: CheckCircle, label: "Accepted" },
      rejected: { color: "bg-red-100 text-red-800 border-red-200", icon: XCircle, label: "Rejected" }
    };
    return config[status] || config.pending;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse mb-4">
            <Shield className="w-12 h-12 text-red-600 mx-auto" />
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-2">
            Loading HEMOGLOBIN Dashboard
          </h2>
          <p className="text-slate-500">Preparing blood request management console...</p>
        </div>
      </div>
    );
  }

  const totalRequests = requests.length;
  const pendingCount = requests.filter(r => r.status === "pending").length;
  const acceptedCount = requests.filter(r => r.status === "accepted").length;
  const rejectedCount = requests.filter(r => r.status === "rejected").length;

  const recentActivity = requests.slice(0, 5).map(req => ({
    id: req._id,
    action: `Blood request ${req.status}`,
    details: `${req.units} units of ${req.bloodType}`,
    time: new Date(req.createdAt).toLocaleDateString(),
    status: req.status
  }));

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
                onClick={() => fetchRequests(true)}
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
                <FileText className="w-6 h-6 text-red-600" />
              </div>
              <div className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-bold">
                +12%
              </div>
            </div>
            <h3 className="text-slate-500 text-sm font-medium mb-1">Total Requests</h3>
            <p className="text-3xl font-black text-slate-900">{totalRequests}</p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 p-6 border-b-4 border-b-blue-600">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-2xl">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-bold">
                +8%
              </div>
            </div>
            <h3 className="text-slate-500 text-sm font-medium mb-1">Pending</h3>
            <p className="text-3xl font-black text-slate-900">{pendingCount}</p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 p-6 border-b-4 border-b-emerald-600">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-100 rounded-2xl">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-bold">
                +15%
              </div>
            </div>
            <h3 className="text-slate-500 text-sm font-medium mb-1">Accepted</h3>
            <p className="text-3xl font-black text-slate-900">{acceptedCount}</p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 p-6 border-b-4 border-b-purple-600">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-2xl">
                <XCircle className="w-6 h-6 text-purple-600" />
              </div>
              <div className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold">
                -5%
              </div>
            </div>
            <h3 className="text-slate-500 text-sm font-medium mb-1">Rejected</h3>
            <p className="text-3xl font-black text-slate-900">{rejectedCount}</p>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Critical Tasks */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-xl font-black text-slate-900 mb-6">Critical Tasks</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-2xl p-6 border border-red-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-red-800 font-bold mb-2">Urgent Requests</h3>
                      <p className="text-red-600 text-sm">Requires immediate attention</p>
                    </div>
                    <div className="bg-red-600 text-white rounded-2xl w-16 h-16 flex items-center justify-center">
                      <span className="text-2xl font-black">{pendingCount}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-2xl p-6 border border-amber-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-amber-800 font-bold mb-2">Follow-ups</h3>
                      <p className="text-amber-600 text-sm">Pending lab responses</p>
                    </div>
                    <div className="bg-amber-600 text-white rounded-2xl w-16 h-16 flex items-center justify-center">
                      <span className="text-2xl font-black">{Math.floor(pendingCount / 2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Management Console */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-xl font-black text-slate-900 mb-6">Management Console</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="group bg-slate-50 hover:bg-slate-100 rounded-2xl p-6 transition-all duration-300 cursor-pointer border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-slate-900 rounded-2xl group-hover:bg-red-600 transition-colors">
                        <Droplet className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">Blood Inventory</h3>
                        <p className="text-slate-500 text-sm">Manage stock levels</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
                  </div>
                </div>

                <div className="group bg-slate-50 hover:bg-slate-100 rounded-2xl p-6 transition-all duration-300 cursor-pointer border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-slate-900 rounded-2xl group-hover:bg-red-600 transition-colors">
                        <Hospital className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">Lab Network</h3>
                        <p className="text-slate-500 text-sm">Connected facilities</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
                  </div>
                </div>

                <div className="group bg-slate-50 hover:bg-slate-100 rounded-2xl p-6 transition-all duration-300 cursor-pointer border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-slate-900 rounded-2xl group-hover:bg-red-600 transition-colors">
                        <BarChart3 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">Analytics</h3>
                        <p className="text-slate-500 text-sm">Request patterns</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
                  </div>
                </div>

                <div className="group bg-slate-50 hover:bg-slate-100 rounded-2xl p-6 transition-all duration-300 cursor-pointer border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-slate-900 rounded-2xl group-hover:bg-red-600 transition-colors">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">Staff Management</h3>
                        <p className="text-slate-500 text-sm">Team coordination</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Requests Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-xl font-black text-slate-900">Request History</h2>
              </div>
              {requests.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-900 mb-2">No request history</h3>
                  <p className="text-slate-500">Your blood requests will appear here once you make them.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="p-4 text-left font-bold text-slate-900">Blood Lab</th>
                        <th className="p-4 text-left font-bold text-slate-900">Blood Type</th>
                        <th className="p-4 text-left font-bold text-slate-900">Units</th>
                        <th className="p-4 text-left font-bold text-slate-900">Status</th>
                        <th className="p-4 text-left font-bold text-slate-900">Request Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.map((request) => {
                        const statusConfig = getStatusConfig(request.status);
                        const IconComponent = statusConfig.icon;

                        return (
                          <tr key={request._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                  <span className="font-black text-red-600">
                                    {request.labId?.name?.charAt(0) || "L"}
                                  </span>
                                </div>
                                <div>
                                  <div className="font-bold text-slate-900">{request.labId?.name || "Unknown Lab"}</div>
                                  <div className="flex items-center gap-1 text-sm text-slate-500">
                                    <MapPin size={12} />
                                    {request.labId?.address?.city || "Unknown City"}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-bold border border-red-200">
                                {request.bloodType}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className="text-lg font-black text-slate-900">{request.units}</span>
                              <span className="text-sm text-slate-500 ml-1">units</span>
                            </td>
                            <td className="p-4">
                              <span className={`px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 border ${statusConfig.color}`}>
                                <IconComponent size={14} />
                                {statusConfig.label}
                              </span>
                            </td>
                            <td className="p-4 text-sm text-slate-600">
                              {new Date(request.createdAt).toLocaleDateString()}
                              <br />
                              <span className="text-xs text-slate-400">
                                {new Date(request.createdAt).toLocaleTimeString()}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Activity Log */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-xl font-black text-slate-900 mb-6">Recent Activity Log</h2>
              <div className="space-y-4">
                {recentActivity.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm">No recent activity</p>
                  </div>
                ) : (
                  recentActivity.map((activity, index) => (
                    <div key={activity.id} className="flex items-start gap-3 relative">
                      {index < recentActivity.length - 1 && (
                        <div className="absolute left-4 top-8 w-px h-8 bg-slate-200"></div>
                      )}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        activity.status === 'accepted' ? 'bg-emerald-100' :
                        activity.status === 'rejected' ? 'bg-red-100' : 'bg-amber-100'
                      }`}>
                        {activity.status === 'accepted' ? (
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                        ) : activity.status === 'rejected' ? (
                          <XCircle className="w-4 h-4 text-red-600" />
                        ) : (
                          <Clock className="w-4 h-4 text-amber-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 text-sm">{activity.action}</p>
                        <p className="text-slate-500 text-xs">{activity.details}</p>
                        <p className="text-slate-400 text-xs mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalRequestHistory;