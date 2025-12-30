import { useEffect, useState } from "react";
import {
  Building2,
  MapPin,
  Phone,
  CalendarDays,
  Activity,
  Droplet,
  Clock,
  History,
  Users,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  RefreshCw,
  Shield,
  User,
  ArrowRight,
  Filter,
  Download,
  ArrowLeft,
  Loader2
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { ImpactCard, IconWrapper, BMSNavbar, PageContainer, SectionContainer } from "@/components/ui/bms-components";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const HospitalDashboard = () => {
  const [hospital, setHospital] = useState(null);
  const [bloodStock, setBloodStock] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [stats, setStats] = useState({
    totalUnits: 0,
    lowStock: 0,
    expiringSoon: 0,
    pendingRequests: 0,
    totalRequests: 0
  });

  const fetchHospitalData = async (showToast = false) => {
    try {
      if (showToast) {
        setRefreshing(true);
        toast.loading("Refreshing hospital data...", { id: "refresh" });
      } else {
        setLoading(true);
      }

      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      // Fetch hospital profile
      const profileRes = await fetch("http://localhost:5000/api/facility/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!profileRes.ok) {
        throw new Error("Failed to fetch hospital data");
      }

      const profileData = await profileRes.json();
      const h = profileData.hospital || profileData.facility || profileData;

      if (!h) {
        throw new Error("No hospital data found in response");
      }

      // Fetch blood stock
      const stockRes = await axios.get("http://localhost:5000/api/hospital/blood/stock", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Fetch blood requests
      const requestsRes = await axios.get("http://localhost:5000/api/hospital/blood/requests", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const stockData = stockRes.data.data || [];
      const requestsData = requestsRes.data.data || [];

      // Calculate stats
      const totalUnits = stockData.reduce((sum, item) => sum + item.quantity, 0);
      const lowStock = stockData.filter(item => item.quantity < 5).length;
      
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      const expiringSoon = stockData.filter(item => {
        const expiryDate = new Date(item.expiryDate);
        return expiryDate <= nextWeek && expiryDate > today;
      }).length;

      const pendingRequests = requestsData.filter(req => req.status === "pending").length;

      setHospital({
        name: h.name,
        email: h.email,
        phone: h.phone,
        type: h.facilityType,
        category: h.facilityCategory,
        address: `${h.address?.street}, ${h.address?.city}, ${h.address?.state} - ${h.address?.pincode}`,
        status: h.status,
        operatingHours: h.operatingHours,
        history: h.history || [],
        lastLogin: h.lastLogin
      });

      setBloodStock(stockData);
      setRequests(requestsData);
      setStats({
        totalUnits,
        lowStock,
        expiringSoon,
        pendingRequests,
        totalRequests: requestsData.length
      });

      if (showToast) {
        toast.success("Hospital data refreshed successfully!", { id: "refresh" });
      }

    } catch (err) {
      console.error("Error fetching hospital data:", err);
      if (showToast) {
        toast.error("Failed to refresh hospital data", { id: "refresh" });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleNavigation = async (path, actionName) => {
    setActionLoading(actionName);
    toast.loading(`Loading ${actionName}...`, { id: actionName });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      window.location.href = path;
      toast.success(`Navigating to ${actionName}`, { id: actionName });
    } catch (error) {
      toast.error(`Failed to load ${actionName}`, { id: actionName });
      setActionLoading(null);
    }
  };

  useEffect(() => {
    fetchHospitalData();
  }, []);

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

  const getStockStatus = (quantity, expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    
    if (expiry <= today) {
      return { status: "expired", color: "bg-red-100 text-red-800", icon: AlertTriangle };
    }
    
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry <= 3) {
      return { status: "critical", color: "bg-red-100 text-red-800", icon: AlertTriangle };
    } else if (daysUntilExpiry <= 7) {
      return { status: "warning", color: "bg-yellow-100 text-yellow-800", icon: AlertTriangle };
    } else if (quantity < 5) {
      return { status: "low", color: "bg-orange-100 text-orange-800", icon: AlertTriangle };
    } else {
      return { status: "good", color: "bg-green-100 text-green-800", icon: CheckCircle };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse mb-4">
            <Shield className="w-12 h-12 text-red-600 mx-auto" />
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-2">
            Loading Blood Donor Network Hospital
          </h2>
          <p className="text-slate-500">Preparing hospital management console...</p>
        </div>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
          <Shield className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-black text-slate-900 mb-2">
            Hospital Data Error
          </h3>
          <p className="text-slate-600 mb-4">
            Could not load hospital data. Please try refreshing.
          </p>
          <button
            onClick={() => fetchHospitalData()}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-3xl transition-all duration-300 flex items-center gap-2 mx-auto"
          >
            <RefreshCw size={18} />
            Refresh Data
          </button>
        </div>
      </div>
    );
  }

  return (
    <PageContainer>
      {/* BMS Navigation Bar */}
      <BMSNavbar>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <img src="/blooddonner.png" alt="Blood Donor Network" className="w-8 h-8" />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Blood Donor Network</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => fetchHospitalData(true)}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <div className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm border border-slate-200 rounded-xl">
              <IconWrapper icon={Building2} variant="red" className="w-8 h-8" />
              <span className="font-semibold text-slate-900">Hospital</span>
            </div>
          </div>
        </div>
      </BMSNavbar>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Stats Grid - Using Impact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <ImpactCard
            icon={Droplet}
            title="Total Blood Units"
            value={stats.totalUnits}
            change="+5%"
            variant="critical"
          />
          
          <ImpactCard
            icon={Activity}
            title="Blood Types"
            value={bloodStock.length}
            change={`${bloodStock.length} types`}
            variant="success"
          />
          
          <ImpactCard
            icon={AlertTriangle}
            title="Low Stock"
            value={stats.lowStock}
            change={stats.lowStock > 0 ? "Alert" : "Good"}
            variant="warning"
          />
          
          <ImpactCard
            icon={Clock}
            title="Expiring Soon"
            value={stats.expiringSoon}
            change={stats.expiringSoon > 0 ? "Soon" : "Safe"}
            variant="info"
          />
          
          <ImpactCard
            icon={TrendingUp}
            title="Pending Requests"
            value={stats.pendingRequests}
            change="Pending"
            variant="info"
          />
        </div>

        {/* Critical Tasks Alert */}
        {(stats.lowStock > 0 || stats.expiringSoon > 0) && (
          <Card className="bg-red-50 border-red-200 mb-8">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <IconWrapper icon={AlertTriangle} variant="red" className="w-12 h-12 bg-red-600 text-white" />
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-red-900 tracking-tight mb-2">Critical Tasks Require Attention</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {stats.lowStock > 0 && (
                      <div className="flex items-center gap-3">
                        <div className="text-4xl font-bold text-red-600 tracking-tight">{stats.lowStock}</div>
                        <div>
                          <p className="font-semibold text-red-900">Blood types with low stock</p>
                          <p className="text-sm text-red-700">Immediate restocking required</p>
                        </div>
                      </div>
                    )}
                    {stats.expiringSoon > 0 && (
                      <div className="flex items-center gap-3">
                        <div className="text-4xl font-bold text-red-600 tracking-tight">{stats.expiringSoon}</div>
                        <div>
                          <p className="font-semibold text-red-900">Units expiring soon</p>
                          <p className="text-sm text-red-700">Use within 7 days</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Management Console */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <IconWrapper icon={Shield} variant="red" className="bg-red-600 text-white" />
                  Hospital Management Console
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    variant="outline"
                    onClick={() => handleNavigation('/hospital/inventory', 'Blood Inventory')}
                    disabled={actionLoading === 'Blood Inventory'}
                    className="h-auto p-4 justify-start text-left flex-col items-start gap-2"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        {actionLoading === 'Blood Inventory' ? (
                          <Loader2 className="w-5 h-5 animate-spin text-red-600" />
                        ) : (
                          <Droplet className="w-5 h-5 text-red-600" />
                        )}
                        <span className="font-semibold text-slate-900">Blood Inventory</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-500">Manage blood stock levels</p>
                  </Button>

                  <Button 
                    onClick={() => handleNavigation('/hospital/blood-request-create', 'Request Blood')}
                    disabled={actionLoading === 'Request Blood'}
                    className="h-auto p-4 justify-start text-left flex-col items-start gap-2"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        {actionLoading === 'Request Blood' ? (
                          <Loader2 className="w-5 h-5 animate-spin text-white" />
                        ) : (
                          <TrendingUp className="w-5 h-5 text-white" />
                        )}
                        <span className="font-semibold text-white">Request Blood</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-sm text-red-100">Submit new blood requests</p>
                  </Button>

                  <Button 
                    variant="outline"
                    onClick={() => window.location.href = '/hospital/blood-request-history'}
                    className="h-auto p-4 justify-start text-left flex-col items-start gap-2"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <History className="w-5 h-5 text-emerald-600" />
                        <span className="font-semibold text-slate-900">Request History</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-500">View past requests</p>
                  </Button>

                  <Button 
                    variant="outline"
                    onClick={() => window.location.href = '/hospital/donors'}
                    className="h-auto p-4 justify-start text-left flex-col items-start gap-2"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-purple-600" />
                        <span className="font-semibold text-slate-900">Donor Directory</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-500">Browse available donors</p>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Hospital Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <IconWrapper icon={Building2} variant="red" className="bg-red-600 text-white" />
                  Hospital Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 tracking-tight">{hospital.name}</h4>
                    <p className="text-slate-500">{hospital.email}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <MapPin className="w-4 h-4 text-red-500" />
                    <span>{hospital.address}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Phone className="w-4 h-4 text-red-500" />
                    <span>{hospital.phone}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm text-slate-500">Status</span>
                    <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-semibold">
                      <CheckCircle size={14} />
                      {hospital.status?.toUpperCase() || "ACTIVE"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Timeline */}
          <div className="space-y-6">
            {/* Blood Inventory Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <IconWrapper icon={Droplet} variant="red" className="bg-red-600 text-white" />
                  Blood Inventory Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {bloodStock.length === 0 ? (
                  <div className="text-center py-8">
                    <Droplet className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-slate-500 mb-4">No blood inventory available</p>
                    <Button onClick={() => window.location.href = '/hospital/blood-request-create'}>
                      Request Blood
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bloodStock.slice(0, 6).map((item) => {
                      const status = getStockStatus(item.quantity, item.expiryDate);
                      const StatusIcon = status.icon;
                      
                      return (
                        <div key={item._id} className="flex items-center justify-between p-3 border border-slate-200 rounded-xl hover:border-red-300 transition-all duration-300">
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getBloodTypeColor(item.bloodGroup)}`}>
                              {item.bloodGroup}
                            </span>
                            <span className="text-lg font-bold text-slate-900 tracking-tight">{item.quantity} units</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <StatusIcon size={16} className={status.color.replace('bg-', 'text-').split(' ')[0]} />
                            <span className="text-sm text-slate-500 capitalize font-medium">{status.status}</span>
                          </div>
                        </div>
                      );
                    })}
                    
                    {bloodStock.length > 6 && (
                      <Button
                        variant="outline"
                        onClick={() => window.location.href = '/hospital/inventory'}
                        className="w-full border-dashed"
                      >
                        View All {bloodStock.length} Blood Types
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Requests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <IconWrapper icon={Activity} variant="red" className="bg-red-600 text-white" />
                  Recent Blood Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                {requests.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-slate-500">No blood requests yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {requests.slice(0, 5).map((request) => (
                      <div key={request._id} className="flex items-center justify-between p-3 border border-slate-200 rounded-xl hover:border-red-300 transition-all duration-300">
                        <div>
                          <div className="font-semibold text-slate-900">{request.bloodType}</div>
                          <div className="text-sm text-slate-500">
                            {request.units} units • {request.labId?.name || 'Unknown Lab'}
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          request.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' :
                          request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {request.status}
                        </span>
                      </div>
                    ))}
                    
                    {requests.length > 5 && (
                      <Button
                        variant="outline"
                        onClick={() => window.location.href = '/hospital/blood-request-history'}
                        className="w-full border-dashed"
                      >
                        View All {requests.length} Requests
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default HospitalDashboard;