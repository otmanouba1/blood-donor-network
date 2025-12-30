import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  RefreshCw,
  AlertTriangle,
  ArrowLeft,
  User,
  Eye,
  Check,
  X
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";

const FacilityApproval = () => {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const token = localStorage.getItem("token");
  const API_URL = "http://localhost:5000/api/admin";

  const fetchPendingFacilities = async (showToast = false) => {
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
      const pendingFacilities = data.facilities?.filter(f => f.status === "pending") || [];
      setFacilities(pendingFacilities);
      
      if (showToast) {
        toast.success(`Found ${pendingFacilities.length} pending facilities`);
      }
    } catch (error) {
      console.error("Fetch facilities error:", error);
      toast.error("Failed to load facilities");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPendingFacilities();
  }, []);

  const handleApprove = async (facilityId) => {
    setActionLoading(facilityId);
    try {
      const res = await fetch(`${API_URL}/facility/approve/${facilityId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Facility approved successfully!");
        setFacilities(prev => prev.filter(f => f._id !== facilityId));
        setSelectedFacility(null);
      } else {
        throw new Error(data.message || "Approval failed");
      }
    } catch (error) {
      toast.error(error.message || "Error approving facility");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (facilityId) => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    setActionLoading(facilityId);
    try {
      const res = await fetch(`${API_URL}/facility/reject/${facilityId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rejectionReason }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Facility rejected successfully!");
        setFacilities(prev => prev.filter(f => f._id !== facilityId));
        setSelectedFacility(null);
        setRejectionReason("");
      } else {
        throw new Error(data.message || "Rejection failed");
      }
    } catch (error) {
      toast.error(error.message || "Error rejecting facility");
    } finally {
      setActionLoading(null);
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
            Loading Blood Donor Network Verification
          </h2>
          <p className="text-slate-500">Fetching pending facility approvals...</p>
        </div>
      </div>
    );
  }

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
                onClick={() => fetchPendingFacilities(true)}
                disabled={refreshing}
                variant="ghost"
                className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm border border-slate-200 rounded-3xl text-slate-700 hover:bg-white/80 transition-all duration-300 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              {/* Admin Profile Chip */}
              <div className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm border border-slate-200 rounded-3xl">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="font-black text-slate-900">Admin</span>
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
              <Building2 className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900">Facility Verification</h2>
              <p className="text-slate-500 mt-1">
                Review and approve pending facility registrations
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-b-4 border-b-amber-600 hover:shadow-md transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-amber-100 rounded-2xl">
                    <Clock className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
                <h3 className="text-slate-500 text-sm font-medium mb-1">Pending Review</h3>
                <p className="text-3xl font-black text-slate-900">{facilities.length}</p>
              </CardContent>
            </Card>
            
            <Card className="border-b-4 border-b-emerald-600 hover:shadow-md transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-emerald-100 rounded-2xl">
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
                <h3 className="text-slate-500 text-sm font-medium mb-1">Approved Today</h3>
                <p className="text-3xl font-black text-slate-900">0</p>
              </CardContent>
            </Card>
            
            <Card className="border-b-4 border-b-red-600 hover:shadow-md transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-red-100 rounded-2xl">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
                <h3 className="text-slate-500 text-sm font-medium mb-1">Rejected Today</h3>
                <p className="text-3xl font-black text-slate-900">0</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Critical Tasks Alert */}
        {facilities.length > 0 && (
          <Alert className="mb-8 bg-red-50 border-red-200">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription>
              <div className="flex items-center gap-4">
                <div className="bg-red-600 text-white rounded-2xl p-4 flex items-center justify-center min-w-[80px] min-h-[80px]">
                  <span className="text-3xl font-black">{facilities.length}</span>
                </div>
                <div>
                  <h3 className="text-xl font-black text-red-800 mb-1">Urgent: Facilities Awaiting Approval</h3>
                  <p className="text-red-600 text-sm">
                    {facilities.length} medical facilities require immediate verification and approval
                  </p>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Facility List */}
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-black text-slate-900 mb-6">Pending Facilities</h3>
            
            {facilities.length === 0 ? (
              <Card>
                <CardContent className="p-16 text-center">
                  <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                  <h3 className="text-lg font-black text-slate-900 mb-2">All Caught Up!</h3>
                  <p className="text-slate-500">No facilities pending verification at this time.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {facilities.map((facility) => (
                  <Card
                    key={facility._id}
                    className={`hover:shadow-md transition-all duration-300 group cursor-pointer ${
                      selectedFacility?._id === facility._id 
                        ? "border-red-300 bg-red-50" 
                        : ""
                    }`}
                    onClick={() => setSelectedFacility(facility)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-xl font-black text-slate-900 group-hover:text-red-600 transition-colors duration-300">
                              {facility.name}
                            </h4>
                            <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                              {facility.facilityType === 'hospital' ? 'Hospital' : 'Blood Lab'}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-red-600" />
                              <span className="text-slate-700 font-medium">{facility.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-red-600" />
                              <span className="text-slate-700 font-medium">{facility.phone || "No phone provided"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-red-600" />
                              <span className="text-slate-700 font-medium">Reg: {facility.registrationNumber || "Not provided"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-red-600" />
                              <span className="text-slate-700 font-medium">
                                {new Date(facility.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-2 mt-3">
                            <MapPin className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <span className="text-slate-700 text-sm font-medium">
                              {facility.address?.street || "Address not provided"}, {facility.address?.city}, {facility.address?.state} - {facility.address?.pincode}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFacility(facility);
                          }}
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Review Details
                        </Button>
                        
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApprove(facility._id);
                          }}
                          disabled={actionLoading === facility._id}
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFacility(facility);
                          }}
                          disabled={actionLoading === facility._id}
                          variant="destructive"
                          size="sm"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Facility Details */}
          <div>
            <h3 className="text-2xl font-black text-slate-900 mb-6">Facility Details</h3>
            
            {selectedFacility ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-xl">
                      <Building2 className="w-5 h-5 text-red-600" />
                    </div>
                    Review Facility
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-900 mb-1">Facility Name</label>
                      <p className="text-slate-700 font-medium">{selectedFacility.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-900 mb-1">Type</label>
                      <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                        {selectedFacility.facilityType === 'hospital' ? 'Hospital' : 'Blood Lab'}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-1">Email</label>
                    <p className="text-slate-700 font-medium">{selectedFacility.email}</p>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-900 mb-1">Phone</label>
                      <p className="text-slate-700 font-medium">{selectedFacility.phone || "Not provided"}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-900 mb-1">Registration Number</label>
                      <p className="text-slate-700 font-mono font-medium">{selectedFacility.registrationNumber || "Not provided"}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-1">Address</label>
                    <p className="text-slate-700 font-medium">
                      {selectedFacility.address?.street || "Street not provided"}, {selectedFacility.address?.city}<br />
                      {selectedFacility.address?.state} - {selectedFacility.address?.pincode}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <Button
                      onClick={() => handleApprove(selectedFacility._id)}
                      disabled={actionLoading === selectedFacility._id}
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                    >
                      {actionLoading === selectedFacility._id ? (
                        <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      )}
                      {actionLoading === selectedFacility._id ? "Approving..." : "Approve Facility"}
                    </Button>

                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-900">
                        Rejection Reason (required)
                      </label>
                      <Textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Provide specific reason for rejection..."
                        rows={3}
                        className="border-slate-300 focus:border-red-600 focus:ring-red-600"
                      />
                      <Button
                        onClick={() => handleReject(selectedFacility._id)}
                        disabled={actionLoading === selectedFacility._id || !rejectionReason.trim()}
                        variant="destructive"
                        className="w-full"
                      >
                        {actionLoading === selectedFacility._id ? (
                          <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <XCircle className="w-4 h-4 mr-2" />
                        )}
                        {actionLoading === selectedFacility._id ? "Rejecting..." : "Reject Facility"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-16 text-center">
                  <Eye className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-black text-slate-900 mb-2">Select a Facility</h3>
                  <p className="text-slate-500">
                    Click on any facility from the list to review details and take action
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacilityApproval;