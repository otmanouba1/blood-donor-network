import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Calendar, Clock, Filter, Loader2, RefreshCw,
  ChevronLeft, ChevronRight, Droplet, Heart, Search,
  Users, Building2, ListPlus, Info, CheckCircle2, Shield
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

// shadcn/ui components
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const API_BASE_URL = "http://localhost:5000/api";

const STATUS_OPTIONS = [
  { value: "all", label: "All Camps" },
  { value: "Upcoming", label: "Upcoming" },
  { value: "Ongoing", label: "Ongoing" },
  { value: "Completed", label: "Completed" },
  { value: "Cancelled", label: "Cancelled" },
];

const CampCard = ({ camp }) => {
  const isCompleted = camp.status === 'Completed';
  const isCancelled = camp.status === 'Cancelled';
  const isUpcoming = camp.status === 'Upcoming';

  const campDate = new Date(camp.date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
  
  const timeStr = `${camp.time?.start || 'N/A'} - ${camp.time?.end || 'N/A'}`;
  const slotsAvailable = (camp.expectedDonors || 0) - (camp.actualDonors || 0);
  const isFull = slotsAvailable <= 0 && camp.expectedDonors > 0 && !isCompleted && !isCancelled;

  const { venue, city, state, pincode } = camp.location || {};
  const locationStr = `${venue}, ${city}, ${state} - ${pincode}`;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className={`h-full flex flex-col transition-all hover:shadow-lg border-slate-200 rounded-3xl ${isCancelled ? 'opacity-75 grayscale-[0.5]' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start gap-2">
            <Badge 
              variant={isCancelled ? "destructive" : isCompleted ? "secondary" : "default"} 
              className={`font-bold rounded-full ${
                isCancelled ? 'bg-red-100 text-red-800' :
                isCompleted ? 'bg-slate-100 text-slate-800' :
                isUpcoming ? 'bg-emerald-100 text-emerald-800' :
                'bg-blue-100 text-blue-800'
              }`}
            >
              {camp.status}
            </Badge>
            {isUpcoming && !isFull && <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 rounded-full font-bold">Open</Badge>}
          </div>
          <CardTitle className="text-xl font-black mt-3 line-clamp-2 leading-tight text-slate-900">
            {camp.title}
          </CardTitle>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mt-1">
            <Building2 className="w-3.5 h-3.5 text-red-500" />
            <span className="truncate">{camp.hospital?.name || 'Associated Facility'}</span>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 flex-1">
          <div className="space-y-2.5">
            <div className="flex items-start gap-3 text-sm text-slate-600">
              <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <span className="line-clamp-2">{locationStr}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="font-medium">{campDate}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <Clock className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="font-medium">{timeStr}</span>
            </div>
          </div>

          <Separator className="bg-slate-100" />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Capacity</p>
              <div className="flex items-center gap-1.5 font-bold text-sm">
                <Users className="w-3.5 h-3.5 text-red-500" />
                {isUpcoming ? camp.expectedDonors : `${camp.actualDonors}/${camp.expectedDonors}`}
              </div>
            </div>
            {!isCompleted && !isCancelled && (
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Availability</p>
                <p className={`text-sm font-bold ${isFull ? 'text-red-600' : 'text-emerald-600'}`}>
                  {isFull ? 'Full' : `${slotsAvailable} Slots`}
                </p>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="pt-0 pb-6 block">
          <p className="text-xs text-slate-500 italic line-clamp-2 bg-slate-50 p-3 rounded-2xl border border-slate-100">
            "{camp.description || 'Join us to save lives.'}"
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export const DonorCampsList = () => {
  const [filter, setFilter] = useState("Upcoming");
  const [searchTerm, setSearchTerm] = useState("");
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 9, total: 0, totalPages: 1 });

  const fetchCamps = useCallback(async (showToast = false) => {
    const token = localStorage.getItem("token");
    if (!token) return toast.error("Please login first");
    
    if (showToast) setRefreshing(true);
    else setLoading(true);

    try {
      const statusParam = filter === 'all' ? '' : filter;
      const params = new URLSearchParams({
        ...(statusParam && { status: statusParam }),
        page: pagination.page,
        limit: pagination.limit,
        ...(searchTerm && { q: searchTerm }),
      }).toString();
      
      const res = await axios.get(`${API_BASE_URL}/donor/camps?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { camps: campData, pagination: pagData } = res.data.data;
      setCamps(campData || []);
      setPagination(prev => ({ 
        ...prev, 
        total: pagData?.total || 0,
        totalPages: pagData?.totalPages || 1 
      }));

      if (showToast) {
        toast.success(`Loaded ${campData?.length || 0} camps`);
      }
    } catch (err) {
      toast.error("Failed to sync camps");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter, pagination.page, searchTerm]);

  useEffect(() => { fetchCamps(); }, [fetchCamps]);

  const stats = useMemo(() => {
    const upcoming = camps.filter(c => c.status === 'Upcoming').length;
    const ongoing = camps.filter(c => c.status === 'Ongoing').length;
    const completed = camps.filter(c => c.status === 'Completed').length;
    return { upcoming, ongoing, completed, total: camps.length };
  }, [camps]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster position="top-right" />
      
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
                onClick={() => fetchCamps(true)}
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
                <span className="font-bold text-slate-900">Donation Camps</span>
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
                <Droplet className="w-6 h-6 text-red-600" />
              </div>
              <div className="bg-slate-100 text-slate-700 px-2 py-1 rounded-full text-xs font-bold">
                Total
              </div>
            </div>
            <h3 className="text-slate-500 text-sm font-medium mb-1">Total Camps</h3>
            <p className="text-3xl font-black text-slate-900">{stats.total}</p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 p-6 border-b-4 border-b-emerald-600">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-100 rounded-2xl">
                <Calendar className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-bold">
                Available
              </div>
            </div>
            <h3 className="text-slate-500 text-sm font-medium mb-1">Upcoming</h3>
            <p className="text-3xl font-black text-slate-900">{stats.upcoming}</p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 p-6 border-b-4 border-b-blue-600">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-2xl">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-bold">
                Active
              </div>
            </div>
            <h3 className="text-slate-500 text-sm font-medium mb-1">Ongoing</h3>
            <p className="text-3xl font-black text-slate-900">{stats.ongoing}</p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 p-6 border-b-4 border-b-amber-600">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-100 rounded-2xl">
                <CheckCircle2 className="w-6 h-6 text-amber-600" />
              </div>
              <div className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-bold">
                Done
              </div>
            </div>
            <h3 className="text-slate-500 text-sm font-medium mb-1">Completed</h3>
            <p className="text-3xl font-black text-slate-900">{stats.completed}</p>
          </div>
        </div>

        {/* Search and Filter Console */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 mb-8">
          <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
            <div className="p-2 bg-red-600 rounded-xl">
              <Search className="w-5 h-5 text-white" />
            </div>
            Camp Search Console
          </h3>

          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search by camp title, city, or hospital..." 
                className="pl-10 h-11 bg-slate-50/50 border-slate-200 focus-visible:ring-red-500/20 rounded-2xl"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 min-w-[200px]">
              <Select value={filter} onValueChange={(val) => { setFilter(val); setPagination(p => ({...p, page: 1})); }}>
                <SelectTrigger className="h-11 bg-white rounded-2xl">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Status Summary */}
          {!loading && camps.length > 0 && (
            <p className="text-sm font-medium text-slate-500 mt-4">
              Showing <span className="text-slate-900 font-bold">{camps.length}</span> results for <span className="text-red-600 font-bold">"{filter}"</span>
            </p>
          )}
        </div>

        {/* Main Grid / States */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-[300px] rounded-3xl bg-white border border-slate-200 animate-pulse" />)}
          </div>
        ) : camps.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {camps.map((camp) => <CampCard key={camp._id} camp={camp} />)}
            </AnimatePresence>
          </div>
        ) : (
          <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-300">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Info className="text-slate-300 w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">No Camps Found</h3>
            <p className="text-slate-500 mb-6">Try adjusting your filters or search terms.</p>
            <Button variant="link" onClick={() => { setSearchTerm(''); setFilter('all'); }} className="text-red-600">
              Clear All Filters
            </Button>
          </div>
        )}

        {/* Pagination */}
        {camps.length > 0 && (
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-12 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <div className="text-sm text-slate-500">
              Page <span className="font-bold text-slate-900">{pagination.page}</span> of {pagination.totalPages}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPagination(p => ({...p, page: p.page - 1}))}
                disabled={pagination.page === 1}
                className="rounded-2xl"
              >
                <ChevronLeft className="w-4 h-4 mr-2" /> Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPagination(p => ({...p, page: p.page + 1}))}
                disabled={pagination.page === pagination.totalPages}
                className="rounded-2xl"
              >
                Next <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonorCampsList;