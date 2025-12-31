import { useState, useEffect } from "react";
import { 
  Shield, 
  ArrowLeft, 
  User, 
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Building2,
  Hospital,
  Phone,
  Mail,
  MapPin,
  FileText,
  Calendar,
  Eye,
  Check,
  X
} from "lucide-react";
import { toast } from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

const AdminVerification = () => {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [processing, setProcessing] = useState(null);

  const fetchPendingFacilities = async (showToast = false) => {
    try {
      if (showToast) setRefreshing(true);
      
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const res = await fetch("http://localhost:5000/api/admin/facilities/pending", {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch pending facilities");
      }

      const data = await res.json();
      setFacilities(data.facilities || []);
      
      if (showToast) {
        toast.success(`Loaded ${data.facilities?.length || 0} pending facilities`);
      }
    } catch (err) {
      console.error("Verification error:", err);
      toast.error("Failed to load pending facilities");
      // Fallback data for demo
      setFacilities([
        {
          _id: "1",
          name: "City General Hospital",
          email: "admin@citygeneral.com",
          phone: "+1-555-0123",
          facilityType: "hospital",
          registrationNumber: "REG-2024-001",
          address: {
            street: "123 Medical Center Dr",
            city: "Healthcare City",
            state: "CA",
            pincode: "90210"
          },
          status: "pending",
          createdAt: "2024-01-15T10:30:00Z"
        },
        {
          _id: "2", 
          name: "Metro Blood Laboratory",
          email: "contact@metroblood.com",
          phone: "+1-555-0456",
          facilityType: "blood-lab",
          registrationNumber: "REG-2024-002",
          address: {
            street: "456 Lab Avenue",
            city: "Research Town",
            state: "NY",
            pincode: "10001"
          },
          status: "pending",
          createdAt: "2024-01-16T14:20:00Z"
        }
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleApproval = async (facilityId, action) => {
    try {
      setProcessing(facilityId);
      
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/admin/facilities/${facilityId}/${action}`, {
        method: 'PUT',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to ${action} facility`);
      }

      toast.success(`Facility ${action}d successfully!`);
      setFacilities(prev => prev.filter(f => f._id !== facilityId));
      setSelectedFacility(null);
    } catch (err) {
      console.error(`${action} error:`, err);
      toast.error(`Failed to ${action} facility`);
    } finally {
      setProcessing(null);
    }
  };

  useEffect(() => {
    fetchPendingFacilities();
  }, []);

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
                  <Card key={facility._id} className="hover:shadow-md transition-all duration-300 group">
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
                              <span className="text-slate-700 font-medium">{facility.phone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-red-600" />
                              <span className="text-slate-700 font-medium">Reg: {facility.registrationNumber}</span>
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
                              {facility.address.street}, {facility.address.city}, {facility.address.state} - {facility.address.pincode}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                        <Button
                          onClick={() => setSelectedFacility(facility)}
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Review Details
                        </Button>
                        
                        <Button
                          onClick={() => handleApproval(facility._id, 'approve')}
                          disabled={processing === facility._id}
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        
                        <Button
                          onClick={() => handleApproval(facility._id, 'reject')}
                          disabled={processing === facility._id}
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
                      {selectedFacility.facilityType === 'hospital' ? 
                        <Hospital className="w-5 h-5 text-red-600" /> : 
                        <Building2 className="w-5 h-5 text-red-600" />
                      }
                    </div>
                    {selectedFacility.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-black text-slate-900 mb-2">Contact Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-red-600" />
                        <span className="font-medium">{selectedFacility.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-red-600" />
                        <span className="font-medium">{selectedFacility.phone}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-black text-slate-900 mb-2">Registration</h4>
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="w-4 h-4 text-red-600" />
                      <span className="font-medium">{selectedFacility.registrationNumber}</span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-black text-slate-900 mb-2">Address</h4>
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-red-600 mt-0.5" />
                      <div className="font-medium">
                        {selectedFacility.address.street}<br />
                        {selectedFacility.address.city}, {selectedFacility.address.state}<br />
                        {selectedFacility.address.pincode}
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-100">
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleApproval(selectedFacility._id, 'approve')}
                        disabled={processing === selectedFacility._id}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Approve Facility
                      </Button>
                      <Button
                        onClick={() => handleApproval(selectedFacility._id, 'reject')}
                        disabled={processing === selectedFacility._id}
                        variant="destructive"
                        className="flex-1"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Reject
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
                  <p className="text-slate-500">Click "Review Details" to view facility information</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminVerification;