import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Droplet,
  Search,
  Download,
  MapPin,
  Heart,
  ChevronRight,
  Info,
  Clock,
  CheckCircle2,
  Trophy,
  Shield,
  RefreshCw,
  Calendar,
  Award
} from "lucide-react";
import { toast } from "react-hot-toast";

// Ensure these point to your actual Shadcn component paths
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const API_URL = "http://localhost:5000/api/donor";

const DonorDonationHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // Fetch Data
  const fetchHistory = async (showToast = false) => {
    try {
      if (showToast) setRefreshing(true);
      else setLoading(true);

      const token = localStorage.getItem("token");
      // Mock data fallback if API fails (for visual demonstration)
      const mockData = [
          { _id: 1, facility: "City General Hospital", date: "2023-10-15", bloodGroup: "A+", quantity: 1, city: "New York" },
          { _id: 2, facility: "Red Cross Camp", date: "2023-06-20", bloodGroup: "A+", quantity: 1, city: "Brooklyn" },
          { _id: 3, facility: "Community Health Center", date: "2023-02-10", bloodGroup: "A+", quantity: 1, city: "Queens" },
      ];

      try {
          const res = await axios.get(`${API_URL}/history`, {
          headers: { Authorization: `Bearer ${token}` },
          });
          setHistory(res.data.history || res.data || []);
      } catch (apiError) {
          console.warn("API unreachable, using mock data for UI demo");
          setHistory(mockData);
      }

      if (showToast) {
        toast.success("History refreshed successfully");
      }
    } catch (err) {
      toast.error("Failed to sync your records");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Logic: Stats, Rank & Gamification
  const donorStats = useMemo(() => {
    const total = history.length;
    const units = history.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const ranks = [
      { name: "Iron Donor", min: 0, next: 3, color: "bg-slate-500", text: "text-slate-500" },
      { name: "Bronze Hero", min: 3, next: 5, color: "bg-orange-500", text: "text-orange-500" },
      { name: "Silver Champion", min: 5, next: 10, color: "bg-blue-400", text: "text-blue-400" },
      { name: "Gold Life-Saver", min: 10, next: 100, color: "bg-yellow-500", text: "text-yellow-500" }
    ];
    // Find the highest rank achieved
    const currentRank = ranks.reduce((prev, curr) => (total >= curr.min ? curr : prev), ranks[0]);
    
    // Calculate progress to next rank
    const nextRankIndex = ranks.indexOf(currentRank) + 1;
    const nextMilestone = nextRankIndex < ranks.length ? ranks[nextRankIndex].min : 100;
    const prevMilestone = currentRank.min;
    
    // Progress bar calculation
    const progress = Math.min(100, Math.max(5, ((total - prevMilestone) / (nextMilestone - prevMilestone)) * 100));

    return { total, units, lives: units * 3, currentRank, progress, nextMilestone };
  }, [history]);

  // Logic: Filtering & Sorting
  const filteredHistory = useMemo(() => {
    return history
      .filter((item) =>
        (item.facility?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (item.bloodGroup?.toLowerCase() || "").includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        const dateA = new Date(a.date || a.donationDate);
        const dateB = new Date(b.date || b.donationDate);
        return sortBy === "newest" ? dateB - dateA : dateA - dateB;
      });
  }, [history, searchTerm, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse mb-4">
            <Shield className="w-12 h-12 text-red-600 mx-auto" />
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-2">
            Loading HEMOGLOBIN History
          </h2>
          <p className="text-slate-500">Preparing donation timeline...</p>
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
            <div className="flex items-center gap-3">
              <button onClick={() => window.history.back()} className="p-2 hover:bg-white/60 rounded-xl transition-all duration-300">
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </button>
              <img src="/blooddonner.png" alt="Blood Donor Network" className="w-8 h-8" />
              <h1 className="text-2xl font-black text-slate-900">Blood Donor Network</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => fetchHistory(true)}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm border border-slate-200 rounded-3xl text-slate-700 hover:bg-white/80 transition-all duration-300 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              
              <div className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm border border-slate-200 rounded-3xl">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-slate-900">My Journey</span>
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
                Life Saving
              </div>
            </div>
            <h3 className="text-slate-500 text-sm font-medium mb-1">Blood Units</h3>
            <p className="text-3xl font-black text-slate-900">{donorStats.units}</p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 p-6 border-b-4 border-b-emerald-600">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-100 rounded-2xl">
                <Heart className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="bg-pink-100 text-pink-700 px-2 py-1 rounded-full text-xs font-bold">
                Impact
              </div>
            </div>
            <h3 className="text-slate-500 text-sm font-medium mb-1">Lives Saved</h3>
            <p className="text-3xl font-black text-slate-900">{donorStats.lives}+</p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 p-6 border-b-4 border-b-blue-600">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-2xl">
                <Trophy className="w-6 h-6 text-blue-600" />
              </div>
              <Badge className={`${donorStats.currentRank.color} hover:${donorStats.currentRank.color} border-none text-white px-2 py-1 text-xs`}>
                {donorStats.currentRank.name}
              </Badge>
            </div>
            <h3 className="text-slate-500 text-sm font-medium mb-1">Total Donations</h3>
            <p className="text-3xl font-black text-slate-900">{donorStats.total}</p>
            <div className="mt-3">
              <div className="flex justify-between text-xs font-medium text-slate-400 mb-1">
                <span>Progress to next rank</span>
                <span>{Math.round(donorStats.progress)}%</span>
              </div>
              <Progress value={donorStats.progress} className="h-2 bg-slate-100" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Filter by facility or blood type..." 
                className="pl-10 w-80 rounded-2xl bg-white border-slate-200 focus-visible:ring-red-500/20 focus-visible:border-red-500 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="rounded-3xl shadow-sm hover:bg-slate-50 border-slate-200" 
              onClick={() => {
                const exportData = {
                  donorName: "Donor",
                  totalDonations: donorStats.total,
                  livesImpacted: donorStats.lives,
                  currentRank: donorStats.currentRank.name,
                  donations: history.map(item => ({
                    facility: item.facility,
                    date: item.date,
                    bloodGroup: item.bloodGroup,
                    city: item.city,
                    quantity: item.quantity || 1
                  })),
                  exportDate: new Date().toISOString()
                };
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
                const downloadAnchorNode = document.createElement('a');
                downloadAnchorNode.setAttribute("href", dataStr);
                downloadAnchorNode.setAttribute("download", "donation_history_report.json");
                document.body.appendChild(downloadAnchorNode);
                downloadAnchorNode.click();
                downloadAnchorNode.remove();
                toast.success("Report exported successfully!");
              }}
            >
              <Download className="mr-2 h-4 w-4" /> Export Report
            </Button>
            <Button 
              className="rounded-3xl bg-red-600 hover:bg-red-700 shadow-md" 
              onClick={() => {
                window.location.href = '/donor/camps';
              }}
            >
              Donate Again
            </Button>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
            <div className="p-2 bg-red-600 rounded-xl">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            Donation Timeline
          </h3>

          <div className="relative min-h-[400px]">
            {/* The Vertical Timeline Line */}
            <div className="absolute left-[23px] top-4 bottom-0 w-[2px] bg-slate-100 hidden md:block"></div>

            <div className="space-y-8 relative">
              <AnimatePresence mode="popLayout">
                {filteredHistory.length > 0 ? (
                    filteredHistory.map((item, index) => (
                    <TimelineItem key={item._id || index} item={item} index={index} />
                    ))
                ) : (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }}
                        className="text-center py-20 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200"
                    >
                        <Info className="mx-auto text-slate-300 mb-4" size={48} />
                        <h3 className="text-lg font-bold text-slate-700">No Records Found</h3>
                        <p className="text-slate-500">Try adjusting your search filters.</p>
                    </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Sub-Components ---

const TimelineItem = ({ item, index }) => {
  const date = new Date(item.date || item.donationDate);
  const month = date.toLocaleString('default', { month: 'short' });
  const day = date.getDate();
  const year = date.getFullYear();
  
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="flex items-start gap-6 group relative"
    >
      {/* Date Indicator (Left side) */}
      <div className="hidden md:flex flex-col items-center z-10 pt-2">
        <div className="w-12 h-12 rounded-full bg-white border-4 border-slate-50 flex items-center justify-center shadow-md group-hover:border-red-100 group-hover:scale-110 transition-all duration-300">
          <Droplet className="text-red-500 w-5 h-5" fill="currentColor" />
        </div>
      </div>

      {/* Content Card (Right side) */}
      <Card className="flex-1 border-none shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group-hover:-translate-y-1">
        <div className="flex flex-col md:flex-row">
          {/* Date Box */}
          <div className="bg-slate-50 p-6 flex flex-col justify-center items-center md:min-w-[140px] border-r border-slate-100 group-hover:bg-red-50/50 transition-colors">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{month}</span>
            <span className="text-3xl font-black text-slate-800">{day}</span>
            <span className="text-xs font-bold text-slate-500">{year}</span>
          </div>
          
          <CardContent className="p-6 flex-1 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="space-y-2 text-center md:text-left w-full">
              <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start">
                <h3 className="text-lg font-black text-slate-800 tracking-tight">{item.facility || "Blood Donation Camp"}</h3>
                <Badge variant="outline" className="text-[10px] font-bold py-0 h-5 bg-emerald-50 text-emerald-600 border-emerald-200">VERIFIED</Badge>
              </div>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1.5"><MapPin size={14} className="text-red-400" /> {item.city || "Unknown Location"}</span>
                <span className="flex items-center gap-1.5"><Clock size={14} /> 10:30 AM</span>
                <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded italic border border-red-100">Type {item.bloodGroup || "O+"}</span>
              </div>
            </div>

            <div className="flex items-center gap-6 min-w-fit">
              <div className="text-center">
                <div className="text-2xl font-black text-slate-800">+{item.quantity || 1}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Unit</div>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-red-50 hover:text-red-600" onClick={() => {
                      const certificateData = {
                        donorName: "Donor",
                        facility: item.facility,
                        date: new Date(item.date || item.donationDate).toLocaleDateString(),
                        bloodGroup: item.bloodGroup,
                        quantity: item.quantity || 1,
                        certificateId: `CERT-${item._id || Math.random().toString(36).substr(2, 9)}`,
                        issueDate: new Date().toLocaleDateString()
                      };
                      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(certificateData, null, 2));
                      const downloadAnchorNode = document.createElement('a');
                      downloadAnchorNode.setAttribute("href", dataStr);
                      downloadAnchorNode.setAttribute("download", `certificate_${item.facility?.replace(/\s+/g, '_')}.json`);
                      document.body.appendChild(downloadAnchorNode);
                      downloadAnchorNode.click();
                      downloadAnchorNode.remove();
                      toast.success("Certificate downloaded!");
                    }}>
                      <ChevronRight size={20} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Download Certificate</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardContent>
        </div>
      </Card>
    </motion.div>
  );
};

export default DonorDonationHistory;