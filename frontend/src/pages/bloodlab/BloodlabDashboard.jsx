import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Droplet,
  Calendar,
  Users,
  Activity,
  Clock,
  MapPin,
  Phone,
  Mail,
  Building2,
  Shield,
  Timer,
  LogIn,
  AlertCircle,
  RefreshCw,
  Beaker,
  Stethoscope,
  Heart,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  User,
  ArrowLeft
} from "lucide-react";
import { toast } from "react-hot-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

const API_URL = "http://localhost:5000/api/blood-lab";

const BloodLabDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [stock, setStock] = useState([]);
  const [lab, setLab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("🔄 Starting dashboard data fetch...");
      console.log("🔑 Token present:", !!token);

      if (!token) {
        toast.error("Authentication required");
        return;
      }

      console.log("📡 Making API requests...");

      const [dashboardRes, stockRes, profileRes] = await Promise.all([
        axios
          .get(`${API_URL}/dashboard`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .catch((err) => {
            console.error(
              "❌ Dashboard API Error:",
              err.response?.status,
              err.message
            );
            throw err;
          }),
        axios
          .get(`${API_URL}/blood/stock`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .catch((err) => {
            console.error(
              "❌ Stock API Error:",
              err.response?.status,
              err.message
            );
            throw err;
          }),
        // Use the history endpoint instead of dashboard for history data
        axios
          .get(`${API_URL}/history`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .catch((err) => {
            console.error(
              "❌ History API Error:",
              err.response?.status,
              err.message
            );
            // Fallback to dashboard if history endpoint doesn't exist
            return axios.get(`${API_URL}/dashboard`, {
              headers: { Authorization: `Bearer ${token}` },
            });
          }),
      ]);

      console.log("✅ API Responses received:");
      console.log("📊 Dashboard Response:", dashboardRes.data);
      console.log("🩸 Stock Response:", stockRes.data);
      console.log("📜 History/Profile Response:", profileRes.data);

      setDashboard(dashboardRes.data);

      // Fix: Handle different response structures for stock
      let stockData = [];
      if (stockRes.data.data) {
        stockData = stockRes.data.data; // { success: true, data: [...] }
      } else if (stockRes.data.stock) {
        stockData = stockRes.data.stock; // { stock: [...] }
      } else if (Array.isArray(stockRes.data)) {
        stockData = stockRes.data; // [...]
      }
      console.log("📦 Setting stock data:", stockData);
      setStock(stockData);

      // Fix: Handle different response structures for lab/history
      const facilityProfile = dashboardRes.data.facility || {};

      let historyData = [];
      if (profileRes.data.activity) {
        historyData = profileRes.data.activity; // From /history endpoint
      } else {
        // Fallback if /history failed and we used /dashboard instead
        historyData = facilityProfile.history || [];
      }

      console.log("🏢 Setting lab data (from dashboard):", facilityProfile);
      console.log(
        "📚 Setting history data (from history endpoint/fallback):",
        historyData
      );

      setLab({
        ...facilityProfile,
        history: historyData,
      });
    } catch (error) {
      console.error("🚨 Dashboard Error:", error);
      console.log("Error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
      });
      const message =
        error.response?.data?.message || "Failed to load dashboard data";
      toast.error(message);
    }
  };

  const handleRefresh = async () => {
    console.log("🔄 Manual refresh triggered");
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
    toast.success("Dashboard updated");
  };

  useEffect(() => {
    console.log("🎯 Dashboard component mounted");
    const loadData = async () => {
      setLoading(true);
      await fetchDashboardData();
      setLoading(false);
      console.log("🏁 Dashboard data loading completed");
    };
    loadData();
  }, []);

  // Debug current state
  console.log("📊 Current State:", {
    dashboard: dashboard,
    stock: stock,
    lab: lab,
    loading: loading,
    stockLength: stock?.length,
    labHistoryLength: lab?.history?.length,
    dashboardCampsLength: dashboard?.recentCamps?.length,
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse mb-4">
            <Shield className="w-12 h-12 text-red-600 mx-auto" />
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-2">
            Loading Blood Donor Network Lab
          </h2>
          <p className="text-slate-500">Preparing your medical insights...</p>
        </div>
      </div>
    );
  }

  const totalUnits = stock.reduce(
    (sum, blood) => sum + (blood.quantity || 0),
    0
  );
  const criticalStock = stock.filter(
    (blood) => (blood.quantity || 0) < 10
  ).length;

  console.log("🧮 Calculated metrics:", {
    totalUnits,
    criticalStock,
    stockItems: stock.map((s) => ({
      type: s.bloodGroup || s.bloodType,
      quantity: s.quantity,
      id: s._id,
    })),
  });

  // Get login history - filter for login events
  const loginHistory =
    lab?.history?.filter((h) => h.eventType === "Login") || [];
  console.log("🔐 Login History:", loginHistory);

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
                onClick={handleRefresh}
                disabled={refreshing}
                variant="ghost"
                className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm border border-slate-200 rounded-3xl text-slate-700 hover:bg-white/80 transition-all duration-300 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              {/* Lab Profile Chip */}
              <div className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm border border-slate-200 rounded-3xl">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                  <Beaker className="w-4 h-4 text-white" />
                </div>
                <span className="font-black text-slate-900">Lab</span>
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
              <Beaker className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900">Blood Lab Dashboard</h2>
              <p className="text-slate-500 mt-1">
                Comprehensive overview of your blood laboratory operations
              </p>
            </div>
          </div>

          {/* Hero Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Blood Units */}
            <Card className="border-b-4 border-b-red-600 hover:shadow-md transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-red-100 rounded-2xl">
                    <Droplet className="w-6 h-6 text-red-600" />
                  </div>
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                    +8%
                  </Badge>
                </div>
                <h3 className="text-slate-500 text-sm font-medium mb-1">Blood Units</h3>
                <p className="text-3xl font-black text-slate-900">{totalUnits.toLocaleString()}</p>
              </CardContent>
            </Card>

            {/* Blood Types */}
            <Card className="border-b-4 border-b-blue-600 hover:shadow-md transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-2xl">
                    <Activity className="w-6 h-6 text-blue-600" />
                  </div>
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                    +5%
                  </Badge>
                </div>
                <h3 className="text-slate-500 text-sm font-medium mb-1">Blood Types</h3>
                <p className="text-3xl font-black text-slate-900">{stock.length}</p>
              </CardContent>
            </Card>

            {/* Critical Stock */}
            <Card className="border-b-4 border-b-amber-600 hover:shadow-md transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-amber-100 rounded-2xl">
                    <AlertCircle className="w-6 h-6 text-amber-600" />
                  </div>
                  {criticalStock > 0 && (
                    <Badge variant="secondary" className="bg-red-100 text-red-700">
                      Alert
                    </Badge>
                  )}
                </div>
                <h3 className="text-slate-500 text-sm font-medium mb-1">Critical Stock</h3>
                <p className="text-3xl font-black text-slate-900">{criticalStock}</p>
              </CardContent>
            </Card>

            {/* Lab Status */}
            <Card className="border-b-4 border-b-emerald-600 hover:shadow-md transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-emerald-100 rounded-2xl">
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  </div>
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                    Active
                  </Badge>
                </div>
                <h3 className="text-slate-500 text-sm font-medium mb-1">Lab Status</h3>
                <p className="text-lg font-black text-slate-900">{lab?.status || 'Operational'}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Critical Tasks Alert */}
        {criticalStock > 0 && (
          <Alert className="mb-8 bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription>
              <div className="flex items-center gap-4">
                <div className="bg-red-600 text-white rounded-2xl p-4 flex items-center justify-center min-w-[80px] min-h-[80px]">
                  <span className="text-3xl font-black">{criticalStock}</span>
                </div>
                <div>
                  <h3 className="text-xl font-black text-red-800 mb-1">Critical: Low Blood Stock</h3>
                  <p className="text-red-600 text-sm">
                    {criticalStock} blood type{criticalStock > 1 ? 's' : ''} require immediate restocking
                  </p>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Wide */}
          <div className="lg:col-span-2 space-y-8">
            {/* Management Console */}
            <div>
              <h3 className="text-2xl font-black text-slate-900 mb-6">Management Console</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Blood Inventory */}
                <Card className="hover:shadow-md transition-all duration-300 group cursor-pointer"
                     onClick={() => window.location.href = '/lab/inventory'}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-slate-900 text-white rounded-2xl group-hover:bg-red-600 transition-all duration-300">
                        <Droplet className="w-6 h-6" />
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-red-600 transition-all duration-300" />
                    </div>
                    <h4 className="text-xl font-black text-slate-900 mb-2">Blood Inventory</h4>
                    <p className="text-slate-500 text-sm mb-4">Manage blood stock and inventory</p>
                    <Badge variant="secondary" className="bg-blue-50 text-blue-600">
                      {totalUnits} Units
                    </Badge>
                  </CardContent>
                </Card>

                {/* Blood Camps */}
                <Card className="hover:shadow-md transition-all duration-300 group cursor-pointer"
                     onClick={() => window.location.href = '/lab/camps'}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-slate-900 text-white rounded-2xl group-hover:bg-red-600 transition-all duration-300">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-red-600 transition-all duration-300" />
                    </div>
                    <h4 className="text-xl font-black text-slate-900 mb-2">Blood Camps</h4>
                    <p className="text-slate-500 text-sm mb-4">Organize and manage blood donation camps</p>
                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-600">
                      Active
                    </Badge>
                  </CardContent>
                </Card>

                {/* Donor Management */}
                <Card className="hover:shadow-md transition-all duration-300 group cursor-pointer"
                     onClick={() => window.location.href = '/lab/donor'}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-slate-900 text-white rounded-2xl group-hover:bg-red-600 transition-all duration-300">
                        <Users className="w-6 h-6" />
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-red-600 transition-all duration-300" />
                    </div>
                    <h4 className="text-xl font-black text-slate-900 mb-2">Donor Management</h4>
                    <p className="text-slate-500 text-sm mb-4">View and manage donor information</p>
                    <Badge variant="secondary" className="bg-purple-50 text-purple-600">
                      Database
                    </Badge>
                  </CardContent>
                </Card>

                {/* Lab Profile */}
                <Card className="hover:shadow-md transition-all duration-300 group cursor-pointer"
                     onClick={() => window.location.href = '/lab/profile'}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-slate-900 text-white rounded-2xl group-hover:bg-red-600 transition-all duration-300">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-red-600 transition-all duration-300" />
                    </div>
                    <h4 className="text-xl font-black text-slate-900 mb-2">Lab Profile</h4>
                    <p className="text-slate-500 text-sm mb-4">Update laboratory information</p>
                    <Badge variant="secondary" className="bg-slate-50 text-slate-600">
                      Settings
                    </Badge>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Right Column - Narrow */}
          <div className="space-y-8">
            {/* Recent Activity Log */}
            <div>
              <h3 className="text-2xl font-black text-slate-900 mb-6">Recent Activity</h3>
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {loginHistory.slice(0, 5).map((activity, index) => (
                      <div key={index} className="flex items-start gap-4 relative">
                        {/* Timeline Line */}
                        {index < loginHistory.slice(0, 5).length - 1 && (
                          <div className="absolute left-4 top-8 w-px h-12 bg-slate-200"></div>
                        )}
                        
                        {/* Activity Icon */}
                        <div className="p-2 rounded-full bg-white border-2 border-slate-200 text-red-600 flex-shrink-0">
                          <LogIn className="w-4 h-4" />
                        </div>
                        
                        {/* Activity Content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-900 mb-1">
                            {activity.description || 'Lab system access'}
                          </p>
                          <p className="text-xs text-slate-500">
                            {new Date(activity.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {loginHistory.length === 0 && (
                      <div className="text-center py-8">
                        <Activity className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                        <p className="text-slate-500 text-sm">No recent activity</p>
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    className="w-full mt-6 bg-slate-50 hover:bg-slate-100 text-slate-700"
                  >
                    View All Activity
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable Components
const MetricCard = ({ icon, label, value, subtitle, trend, color, alert = false }) => {
  const colorClasses = {
    blue: { border: "border-l-blue-500", bg: "bg-blue-50", text: "text-blue-600" },
    green: { border: "border-l-green-500", bg: "bg-green-50", text: "text-green-600" },
    red: { border: "border-l-red-500", bg: "bg-red-50", text: "text-red-600" },
    purple: { border: "border-l-purple-500", bg: "bg-purple-50", text: "text-purple-600" },
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <Card className={`border-l-4 ${alert ? "border-l-red-500" : colors.border} hover:shadow-lg transition-all duration-300`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
            <p className="text-3xl font-bold text-foreground">{value.toLocaleString()}</p>
            {subtitle && (
              <p className={`text-xs ${alert ? "text-red-600" : "text-muted-foreground"} mt-1`}>
                {subtitle}
              </p>
            )}
          </div>
          <div className={`p-4 rounded-xl ${alert ? "bg-red-100 text-red-600" : `${colors.bg} ${colors.text}`}`}>
            {icon}
          </div>
        </div>
        {trend && (
          <div className="flex items-center gap-1 mt-3 text-xs">
            <TrendingUp className="w-3 h-3 text-green-500" />
            <span className="text-green-600 font-medium">{trend}%</span>
            <span className="text-muted-foreground">from last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const Section = ({ title, icon, subtitle, children, className = "" }) => (
  <Card className={className}>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        {icon} {title}
      </CardTitle>
      {subtitle && <CardDescription>{subtitle}</CardDescription>}
    </CardHeader>
    <CardContent>
      {children}
    </CardContent>
  </Card>
);

const LabInfo = ({ icon, label, value, truncate = false }) => (
  <div className="flex items-start gap-3">
    <div className="p-2 bg-red-100 rounded-lg text-red-600 mt-1">{icon}</div>
    <div>
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={`font-medium text-gray-800 ${truncate ? "truncate" : ""}`}>
        {value || "—"}
      </p>
    </div>
  </div>
);

const BloodStockItem = ({ bloodType, quantity, critical = false }) => (
  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
    <div className="flex items-center gap-3">
      <div
        className={`p-2 rounded-lg ${
          critical ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
        }`}
      >
        <Droplet className="w-4 h-4" />
      </div>
      <span className="font-medium text-gray-800">{bloodType}</span>
    </div>
    <div className="text-right">
      <span
        className={`font-bold ${critical ? "text-red-600" : "text-gray-800"}`}
      >
        {quantity} units
      </span>
      {critical && <p className="text-xs text-red-500 mt-1">Low stock</p>}
    </div>
  </div>
);

const CampCard = ({ camp }) => (
  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
    <div className="flex-1">
      <h4 className="font-medium text-gray-800 mb-1">{camp.title}</h4>
      <p className="text-sm text-gray-600">
        {new Date(camp.date).toLocaleDateString()}
      </p>
    </div>
    <div className="text-right">
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${
          camp.status === "Upcoming"
            ? "bg-yellow-100 text-yellow-700"
            : camp.status === "Completed"
            ? "bg-green-100 text-green-700"
            : "bg-gray-100 text-gray-600"
        }`}
      >
        {camp.status}
      </span>
      {camp.expectedDonors && (
        <p className="text-xs text-gray-500 mt-1">
          {camp.expectedDonors} donors
        </p>
      )}
    </div>
  </div>
);

const LoginHistoryItem = ({ history }) => (
  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
        <LogIn className="w-3 h-3" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-800">System Access</p>
        <p className="text-xs text-gray-500">
          {history.description || "Successful login"}
        </p>
      </div>
    </div>
    <span className="text-xs text-gray-500">
      {new Date(history.date).toLocaleString()}
    </span>
  </div>
);

// New component for all activity items
const ActivityHistoryItem = ({ history }) => {
  const getIcon = (eventType) => {
    switch (eventType) {
      case "Login":
        return <LogIn className="w-3 h-3" />;
      case "Stock Update":
        return <Droplet className="w-3 h-3" />;
      case "Blood Camp":
        return <Calendar className="w-3 h-3" />;
      default:
        return <Activity className="w-3 h-3" />;
    }
  };

  const getColor = (eventType) => {
    switch (eventType) {
      case "Login":
        return "bg-blue-100 text-blue-600";
      case "Stock Update":
        return "bg-green-100 text-green-600";
      case "Blood Camp":
        return "bg-purple-100 text-purple-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${getColor(history.eventType)}`}>
          {getIcon(history.eventType)}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800">
            {history.eventType}
          </p>
          <p className="text-xs text-gray-500">
            {history.description || "Activity recorded"}
          </p>
        </div>
      </div>
      <span className="text-xs text-gray-500">
        {new Date(history.date).toLocaleString()}
      </span>
    </div>
  );
};

const EmptyState = ({ icon, message }) => (
  <div className="text-center py-8 text-gray-500">
    <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
      {icon}
    </div>
    <p className="text-sm">{message}</p>
  </div>
);

export default BloodLabDashboard;
