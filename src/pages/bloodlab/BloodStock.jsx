import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  Droplets, 
  PlusCircle, 
  MinusCircle, 
  RefreshCw, 
  AlertTriangle,
  Beaker,
  TrendingDown,
  Shield,
  ArrowLeft,
  User
} from "lucide-react";
import { toast } from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

const BloodStock = () => {
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [action, setAction] = useState("add");
  const [form, setForm] = useState({ 
    bloodType: "", 
    quantity: "" 
  });

  const token = localStorage.getItem("token");
  const API_URL = "http://localhost:5000/api/blood-lab";

  // Blood types for dropdown
  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  // Fetch current stock
  const fetchStock = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${API_URL}/blood/stock`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console .log("Fetched Stock Data:", data);
      if (data.success) {
        setStock(data.data || []);
      } else {
        toast.error("Failed to load blood stock");
      }
    } catch (error) {
      console.error("Fetch Stock Error:", error);
      toast.error(error.response?.data?.message || "Failed to load blood stock");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.bloodType || !form.quantity) {
      toast.error("Please fill all fields");
      return;
    }

    if (form.quantity <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }

    setSubmitting(true);

    try {
      const endpoint = action === "add" ? "/blood/add" : "/blood/remove";
      const { data } = await axios.post(
        `${API_URL}${endpoint}`, 
        form, 
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data.success) {
        toast.success(data.message);
        setForm({ bloodType: "", quantity: "" });
        fetchStock();
      } else {
        toast.error(data.message || "Operation failed");
      }
    } catch (error) {
      console.error("Stock Update Error:", error);
      toast.error(
        error.response?.data?.message || `Error ${action === "add" ? "adding" : "removing"} blood stock`
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Check for low stock items
  const lowStockItems = stock.filter(item => item.quantity < 10);

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
                onClick={fetchStock}
                disabled={loading}
                variant="ghost"
                className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm border border-slate-200 rounded-3xl text-slate-700 hover:bg-white/80 transition-all duration-300 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
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
              <Droplets className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900">Blood Stock Management</h2>
              <p className="text-slate-500 mt-1">
                Manage your blood inventory and track stock levels
              </p>
            </div>
          </div>
        </div>

        {/* Low Stock Alert */}
        {lowStockItems.length > 0 && (
          <Alert className="mb-8 bg-amber-50 border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription>
              <div className="flex items-center gap-4">
                <div className="bg-amber-600 text-white rounded-2xl p-4 flex items-center justify-center min-w-[80px] min-h-[80px]">
                  <span className="text-3xl font-black">{lowStockItems.length}</span>
                </div>
                <div>
                  <h3 className="text-xl font-black text-amber-800 mb-1">Critical: Low Blood Stock</h3>
                  <p className="text-amber-600 text-sm">
                    {lowStockItems.length} blood type{lowStockItems.length > 1 ? 's' : ''} require immediate restocking
                  </p>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Stock Management Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Beaker className="w-5 h-5 text-red-600" />
              {action === "add" ? "Add Blood Stock" : "Remove Blood Stock"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-900 mb-1">
                  Blood Type
                </label>
                <select
                  value={form.bloodType}
                  onChange={(e) => setForm({ ...form, bloodType: e.target.value })}
                  className="w-full bg-white border border-slate-200 focus:ring-2 focus:ring-red-100 rounded-xl px-3 py-3 outline-none transition-all duration-300"
                  required
                >
                  <option value="">Select Blood Type</option>
                  {bloodTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-1">
                  Quantity (Units)
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="0"
                  className="w-full bg-white border border-slate-200 focus:ring-2 focus:ring-red-100 rounded-xl px-3 py-3 outline-none transition-all duration-300"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-1">
                  Action
                </label>
                <select
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:ring-2 focus:ring-red-100 rounded-xl px-3 py-3 outline-none transition-all duration-300"
                >
                  <option value="add">Add Stock</option>
                  <option value="remove">Remove Stock</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  type="submit"
                  disabled={submitting}
                  className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white font-medium shadow-md transition-all duration-300 ${
                    action === "add"
                      ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200 disabled:bg-emerald-400"
                      : "bg-red-600 hover:bg-red-700 shadow-red-200 disabled:bg-red-400"
                  }`}
                >
                  {submitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : action === "add" ? (
                    <PlusCircle className="w-4 h-4" />
                  ) : (
                    <MinusCircle className="w-4 h-4" />
                  )}
                  {submitting ? "Processing..." : action === "add" ? "Add Units" : "Remove Units"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Blood Stock Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-red-600" />
                Current Blood Inventory
              </CardTitle>
              <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                Total: {stock.reduce((sum, item) => sum + item.quantity, 0)} units
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-16">
                <RefreshCw className="w-8 h-8 text-slate-400 animate-spin mx-auto mb-2" />
                <p className="text-slate-500 font-medium">Loading blood stock...</p>
              </div>
            ) : stock.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                <Droplets className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="font-bold text-slate-900 mb-1">No blood stock available.</p>
                <p className="text-sm">Start by adding some blood units to your inventory.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left p-4 font-black text-slate-900">Blood Type</th>
                      <th className="text-left p-4 font-black text-slate-900">Quantity</th>
                      <th className="text-left p-4 font-black text-slate-900">Status</th>
                      <th className="text-left p-4 font-black text-slate-900">Expiry Date</th>
                      <th className="text-left p-4 font-black text-slate-900">Last Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stock.map((item) => {
                      const isLowStock = item.quantity < 10;
                      const isCritical = item.quantity < 5;
                      
                      return (
                        <tr key={item._id} className="border-b border-slate-100 hover:bg-slate-50 transition-all duration-300">
                          <td className="p-4">
                            <span className="font-black text-slate-900">{item.bloodGroup}</span>
                          </td>
                          <td className="p-4">
                            <span className={`font-black ${
                              isCritical ? 'text-red-600' : isLowStock ? 'text-amber-600' : 'text-slate-900'
                            }`}>
                              {item.quantity} units
                            </span>
                          </td>
                          <td className="p-4">
                            {isCritical ? (
                              <Badge variant="secondary" className="bg-red-100 text-red-700 border-red-200">
                                <TrendingDown className="w-3 h-3 mr-1" />
                                Critical
                              </Badge>
                            ) : isLowStock ? (
                              <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Low Stock
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200">
                                Adequate
                              </Badge>
                            )}
                          </td>
                          <td className="p-4 text-slate-600 font-medium">
                            {new Date(item.expiryDate).toLocaleDateString()}
                          </td>
                          <td className="p-4 text-slate-600 font-medium">
                            {new Date(item.updatedAt || item.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BloodStock;