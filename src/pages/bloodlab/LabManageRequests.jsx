import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  MapPin, 
  Phone, 
  Shield, 
  RefreshCw, 
  Building2,
  AlertTriangle,
  TrendingUp,
  Activity,
  ArrowLeft
} from "lucide-react";

const LabManageRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadRequests = async (showToast = false) => {
    try {
      if (showToast) setRefreshing(true);
      else setLoading(true);
      
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/blood-lab/blood/requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(res.data.requests || []);
      
      if (showToast) {
        toast.success(`Loaded ${res.data.requests?.length || 0} requests`);
      }
    } catch (err) {
      console.error("Load requests error:", err);
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const updateStatus = async (id, action) => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:5000/api/blood-lab/blood/requests/${id}`,
        { action },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`Request ${action}ed successfully`);
      loadRequests(); // Refresh the list
    } catch (err) {
      console.error("Update status error:", err);
      toast.error(err.response?.data?.message || "Failed to update request");
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: "bg-amber-100 text-amber-800 border-amber-200", icon: Clock },
      accepted: { color: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: CheckCircle },
      rejected: { color: "bg-red-100 text-red-800 border-red-200", icon: XCircle }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 border ${config.color}`}>
        <IconComponent size={14} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getBloodTypeColor = (bloodType) => {
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
    return colors[bloodType] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse mb-4">
            <Shield className="w-12 h-12 text-red-600 mx-auto" />
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-2">
            Loading Blood Donor Network Requests
          </h2>
          <p className="text-slate-500">Preparing request management console...</p>
        </div>
      </div>
    );
  }

  const pendingCount = requests.filter(r => r.status === "pending").length;
  const acceptedCount = requests.filter(r => r.status === "accepted").length;
  const rejectedCount = requests.filter(r => r.status === "rejected").length;

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
                onClick={() => loadRequests(true)}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm border border-slate-200 rounded-3xl text-slate-700 hover:bg-white/80 transition-all duration-300 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              
              <div className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm border border-slate-200 rounded-3xl">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-slate-900">Blood Requests</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 p-6 border-b-4 border-b-red-600">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-100 rounded-2xl">
                <Activity className="w-6 h-6 text-red-600" />
              </div>
              <div className="bg-slate-100 text-slate-700 px-2 py-1 rounded-full text-xs font-bold">
                Total
              </div>
            </div>
            <h3 className="text-slate-500 text-sm font-medium mb-1">Total Requests</h3>
            <p className="text-3xl font-black text-slate-900">{requests.length}</p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 p-6 border-b-4 border-b-amber-600">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-100 rounded-2xl">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              {pendingCount > 0 && (
                <div className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold">
                  Action Required
                </div>
              )}
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
                Approved
              </div>
            </div>
            <h3 className="text-slate-500 text-sm font-medium mb-1">Accepted</h3>
            <p className="text-3xl font-black text-slate-900">{acceptedCount}</p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 p-6 border-b-4 border-b-blue-600">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-2xl">
                <XCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-bold">
                Declined
              </div>
            </div>
            <h3 className="text-slate-500 text-sm font-medium mb-1">Rejected</h3>
            <p className="text-3xl font-black text-slate-900">{rejectedCount}</p>
          </div>
        </div>

        {/* Critical Tasks Alert */}
        {pendingCount > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-600 rounded-2xl">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-black text-amber-900 mb-2">Pending Requests Require Attention</h3>
                <div className="flex items-center gap-3">
                  <div className="text-4xl font-black text-amber-600">{pendingCount}</div>
                  <div>
                    <p className="font-bold text-amber-900">Blood requests awaiting approval</p>
                    <p className="text-sm text-amber-700">Review and respond to hospital requests</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Requests Management Console */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
              <div className="p-2 bg-red-600 rounded-xl">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              Blood Request Management Console
            </h3>
          </div>

          {requests.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-black text-slate-900 mb-2">No blood requests</h3>
              <p className="text-slate-600">When hospitals request blood, they will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-4 text-left font-black text-slate-700">Hospital</th>
                    <th className="p-4 text-left font-black text-slate-700">Blood Type</th>
                    <th className="p-4 text-left font-black text-slate-700">Units</th>
                    <th className="p-4 text-left font-black text-slate-700">Status</th>
                    <th className="p-4 text-left font-black text-slate-700">Date</th>
                    <th className="p-4 text-left font-black text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <tr key={req._id} className="border-b border-slate-100 hover:bg-slate-50 transition-all duration-300">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-red-600" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{req.hospitalId?.name || "Unknown Hospital"}</div>
                            <div className="flex items-center gap-1 text-sm text-slate-500">
                              <MapPin size={12} />
                              {req.hospitalId?.address?.city || "Unknown City"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getBloodTypeColor(req.bloodType)}`}>
                          {req.bloodType}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-lg font-black text-slate-900">{req.units}</span>
                        <span className="text-sm text-slate-500 ml-1">units</span>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(req.status)}
                      </td>
                      <td className="p-4 text-sm text-slate-600">
                        {new Date(req.createdAt).toLocaleDateString()}
                        <br />
                        <span className="text-xs text-slate-400">
                          {new Date(req.createdAt).toLocaleTimeString()}
                        </span>
                      </td>
                      <td className="p-4">
                        {req.status === "pending" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => updateStatus(req._id, "accept")}
                              className="flex items-center gap-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl transition-all duration-300 font-medium"
                            >
                              <CheckCircle size={16} />
                              Accept
                            </button>
                            <button
                              onClick={() => updateStatus(req._id, "reject")}
                              className="flex items-center gap-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-2xl transition-all duration-300 font-medium"
                            >
                              <XCircle size={16} />
                              Reject
                            </button>
                          </div>
                        )}
                        {req.status !== "pending" && (
                          <span className="text-slate-500 text-sm font-medium">
                            Processed on {new Date(req.processedAt).toLocaleDateString()}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LabManageRequests;