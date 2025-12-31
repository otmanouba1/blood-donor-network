import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Heart,
  Calendar,
  MapPin,
  Clock,
  Droplet,
  User,
  Shield,
  Download,
  Share2,
  RefreshCw,
  ChevronRight,
  Trophy,
  Activity,
  AlertCircle,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { toast } from "react-hot-toast";
import { PageContainer, ImpactCard, IconWrapper } from "@/components/ui/bms-components";

// Shadcn UI Components
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import ScheduleDonationModal from "@/components/donation/ScheduleDonation";

const API_URL = "http://localhost:5000/api/donor";

const DonorDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [donor, setDonor] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [openSchedule, setOpenSchedule] = useState(false);
  const [upcoming, setUpcoming] = useState(null);

  // --- Data Fetching Logic ---
  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      try {
        if (!token) throw new Error("No token");

        const [profileRes, historyRes, statsRes] = await Promise.all([
          axios.get(`${API_URL}/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/history`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios
            .get(`${API_URL}/stats`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            .catch(() => ({ data: {} })),
        ]);
        
        // Try to fetch upcoming donations (optional)
        try {
          const upcomingRes = await axios.get(`${API_URL}/upcoming`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUpcoming(upcomingRes.data?.appointment || upcomingRes.data);
        } catch (upcomingError) {
          console.log("No upcoming donations found");
          setUpcoming(null);
        }
        const donorData = profileRes.data.donor || profileRes.data;
        setDonor(donorData);

        let historyData =
          historyRes.data.history ||
          historyRes.data.donations ||
          historyRes.data ||
          [];
        setHistory(historyData);

        // Calculate Stats
        const totalDonations = historyData.length;
        const livesImpacted = totalDonations * 3;

        setDashboard({
          stats: {
            totalDonations,
            livesImpacted,
            nextMilestone: Math.ceil((totalDonations + 1) / 5) * 5,
            ...statsRes.data,
          },
          recentActivity: historyData.slice(0, 3),
        });
      } catch (apiError) {
        console.warn("Using mock data due to API error:", apiError);
        setDashboard({
          stats: {
            totalDonations: 0,
            livesImpacted: 0,
            nextMilestone: 5,
          },
          recentActivity:null,
        });
      }
    } catch (error) {
      console.log(error);
      toast.error("Could not load dashboard");
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    toast.loading("Refreshing dashboard...", { id: "refresh" });
    await fetchDashboardData();
    setRefreshing(false);
    toast.success("Dashboard updated successfully!", { id: "refresh" });
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchDashboardData();
      setLoading(false);
    };
    loadData();
  }, []);

  // --- Derived State ---
  const isEligible = donor?.eligibleToDonate || false;
  const nextDonationDate = donor?.nextEligibleDate
    ? new Date(donor.nextEligibleDate)
    : null;
  const daysUntilEligible = nextDonationDate
    ? Math.ceil((nextDonationDate - new Date()) / (1000 * 60 * 60 * 24))
    : 0;

  // Progress to next milestone
  const currentDonations = dashboard?.stats?.totalDonations || 0;
  const nextMilestone = dashboard?.stats?.nextMilestone || 5;
  const progressPercent = (currentDonations / nextMilestone) * 100;

  if (loading) return <DashboardSkeleton />;

  return (
    <PageContainer>
      <div className="max-w-7xl mx-auto space-y-8 p-6">
        {/* Header Area */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2 text-slate-500 font-bold tracking-widest text-xs uppercase mb-2">
              <span className="w-8 h-[2px] bg-red-600"></span>
              Overview
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">
              Welcome back,{" "}
              <span className="text-red-600">
                {donor?.name?.split(" ")[0] || "Hero"}
              </span>
            </h1>
            <p className="text-slate-500 mt-2">
              Here is what's happening with your impact today.
            </p>
          </motion.div>

          <Button
            onClick={handleRefresh}
            variant="outline"
            disabled={refreshing}
            className="rounded-full gap-2 border-slate-200 hover:bg-slate-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Syncing..." : "Refresh Data"}
          </Button>
        </div>

        {/* Top Grid: Stats & Profile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Key Metrics (8 cols) */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Eligibility Banner - Spans full width of this sub-grid */}
            <motion.div
              className="md:col-span-3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card
                className={`border-none shadow-md ${
                  isEligible
                    ? "bg-gradient-to-r from-emerald-50 to-white border-l-4 border-emerald-500"
                    : "bg-gradient-to-r from-amber-50 to-white border-l-4 border-amber-500"
                }`}
              >
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-full ${
                        isEligible
                          ? "bg-emerald-100 text-emerald-600"
                          : "bg-amber-100 text-amber-600"
                      }`}
                    >
                      {isEligible ? (
                        <CheckCircle2 size={24} />
                      ) : (
                        <Clock size={24} />
                      )}
                    </div>
                    <div>
                      <h3
                        className={`text-lg font-bold ${
                          isEligible ? "text-emerald-900" : "text-amber-900"
                        }`}
                      >
                        {isEligible
                          ? "You are eligible to donate!"
                          : "Recovery Period Active"}
                      </h3>
                      <p className="text-slate-600 text-sm">
                        {isEligible
                          ? "Your community needs you. Find a camp nearby."
                          : `You can donate again in ${daysUntilEligible} days (${nextDonationDate?.toLocaleDateString()}).`}
                      </p>
                    </div>
                  </div>
                  {isEligible && (
                    <Button 
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg shadow-emerald-200"
                      onClick={() => setOpenSchedule(true)}
                    >
                      Book Now
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Stat Cards */}
            <StatCard
              label="Total Donations"
              value={dashboard?.stats?.totalDonations || 0}
              subtext="lifetime units"
              icon={<Droplet className="text-red-500" />}
            />
            <StatCard
              label="Lives Impacted"
              value={dashboard?.stats?.livesImpacted || 0}
              subtext="estimated"
              icon={<Heart className="text-pink-500" />}
            />
            <StatCard
              label="Next Milestone"
              value={nextMilestone}
              subtext={`${nextMilestone - currentDonations} donations away`}
              icon={<Trophy className="text-yellow-500" />}
            />
          </div>

          {/* Right: Digital Donor ID (4 cols) */}
          <div className="lg:col-span-4">
            <DonorIDCard donor={donor} />
          </div>
        </div>

        {/* Middle Grid: Actions & Health */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <ActionTile
            icon={<Calendar size={20} />}
            title="Schedule Donation"
            desc="Find a center nearby"
            color="bg-red-50 text-red-600 hover:bg-red-100"
            onClick={() => setOpenSchedule(true)}
          />
          <ActionTile
            icon={<Download size={20} />}
            title="Certificates"
            desc="Download records"
            color="bg-blue-50 text-blue-600 hover:bg-blue-100"
            onClick={() => {
              const token = localStorage.getItem("token");
              if (!token) {
                toast.error("Please login first");
                return;
              }
              // Create a downloadable certificate
              const certificateData = {
                donorName: donor?.fullName || "Donor",
                totalDonations: dashboard?.stats?.totalDonations || 0,
                bloodGroup: donor?.bloodGroup || "N/A",
                date: new Date().toLocaleDateString()
              };
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(certificateData, null, 2));
              const downloadAnchorNode = document.createElement('a');
              downloadAnchorNode.setAttribute("href", dataStr);
              downloadAnchorNode.setAttribute("download", "donation_certificate.json");
              document.body.appendChild(downloadAnchorNode);
              downloadAnchorNode.click();
              downloadAnchorNode.remove();
              toast.success("Certificate downloaded!");
            }}
          />
          <ActionTile
            icon={<Share2 size={20} />}
            title="Share Impact"
            desc="Inspire others"
            color="bg-purple-50 text-purple-600 hover:bg-purple-100"
            onClick={() => {
              const shareText = `I've donated blood ${dashboard?.stats?.totalDonations || 0} times and potentially saved ${dashboard?.stats?.livesImpacted || 0} lives! Join me in making a difference. #BloodDonation #SaveLives`;
              if (navigator.share) {
                navigator.share({
                  title: 'My Blood Donation Impact',
                  text: shareText,
                  url: window.location.origin
                }).then(() => {
                  toast.success("Shared successfully!");
                }).catch(() => {
                  navigator.clipboard.writeText(shareText);
                  toast.success("Copied to clipboard!");
                });
              } else {
                navigator.clipboard.writeText(shareText);
                toast.success("Impact message copied to clipboard!");
              }
            }}
          />
          <ActionTile
            icon={<Clock size={20} />}
            title="Donation History"
            desc="View past donations"
            color="bg-green-50 text-green-600 hover:bg-green-100"
            onClick={() => {
              window.location.href = '/donor/history';
            }}
          />
        </div>

        {/* Bottom Section: Upcoming & History */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Donation Card */}
          {upcoming ? (
            <div className="lg:col-span-1">
              <UpcomingDonationCard upcoming={upcoming} />
            </div>
          ) : (
            <div className="lg:col-span-1">
              <Card className="border-none shadow-md bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardContent className="p-6 text-center">
                  <Calendar className="mx-auto text-blue-400 mb-3" size={32} />
                  <h4 className="font-bold text-blue-800 mb-2">
                    No Upcoming Donations
                  </h4>
                  <p className="text-sm text-blue-600 mb-4">
                    Schedule your next donation to save lives
                  </p>
                  <Button 
                    onClick={() => setOpenSchedule(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    size="sm"
                  >
                    Schedule Now
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Recent Activity List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold text-slate-900">
                Recent Activity
              </h3>
              <Button
                variant="ghost"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 text-sm"
                onClick={() => {
                  window.location.href = '/donor/history';
                }}
              >
                View Full History
              </Button>
            </div>

            <div className="space-y-4">
              {history.length > 0 ? (
                history
                  .slice(0, 3)
                  .map((item, i) => (
                    <ActivityItem key={i} item={item} index={i} />
                  ))
              ) : (
                <EmptyState />
              )}
            </div>
          </div>

          {/* Impact Progress */}
          <div className="lg:col-span-1">
            <Card className="h-full border-none shadow-lg bg-slate-900 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="text-yellow-400" />
                  <span>Road to Gold</span>
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Achievement Progress
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-center py-4">
                  <div className="relative w-32 h-32 flex items-center justify-center rounded-full border-4 border-slate-700">
                    <div className="text-center">
                      <div className="text-3xl font-black">
                        {Math.round(progressPercent)}%
                      </div>
                      <div className="text-[10px] uppercase tracking-widest text-slate-400">
                        Complete
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-slate-300">
                    <span>Current: {currentDonations}</span>
                    <span>Goal: {nextMilestone}</span>
                  </div>
                  <Progress
                    value={progressPercent}
                    className="h-2 bg-slate-700"
                    indicatorClassName="bg-yellow-400"
                  />
                </div>
                <p className="text-xs text-slate-400 text-center leading-relaxed">
                  Donate {nextMilestone - currentDonations} more times to unlock
                  the
                  <span className="text-yellow-400 font-bold">
                    {" "}
                    Gold Life-Saver
                  </span>{" "}
                  badge.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <ScheduleDonationModal 
        open={openSchedule} 
        setOpen={setOpenSchedule}
        onSuccess={fetchDashboardData}
      />
    </PageContainer>
  );
};

const StatCard = ({ label, value, subtext, icon }) => (
  <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
    <CardContent className="p-6">
      <div className="flex justify-between items-start mb-2">
        <div className="p-2 bg-slate-50 rounded-lg">{icon}</div>
      </div>
      <div className="text-3xl font-black text-slate-900">{value}</div>
      <div className="font-bold text-slate-700 text-sm">{label}</div>
      <div className="text-xs text-slate-500 mt-1">{subtext}</div>
    </CardContent>
  </Card>
);

const DonorIDCard = ({ donor }) => (
  <Card className="h-full border-none shadow-lg bg-white relative overflow-hidden group">
    {/* Decorative Background Pattern */}
    <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-bl-full -mr-8 -mt-8 z-0 transition-transform group-hover:scale-110"></div>

    <CardContent className="p-6 relative z-10 flex flex-col h-full justify-between">
      <div>
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-white shadow-md">
              <AvatarImage
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${donor?.name}`}
              />
              <AvatarFallback>ID</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-bold text-slate-900">{donor?.fullName}</h3>
              <p className="text-xs text-slate-500">
                ID:{" "}
                {donor?._id ? donor._id.substring(0, 8).toUpperCase() : "---"}
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className="text-red-600 bg-red-50 border-red-100"
          >
            {donor?.bloodGroup || "N/A"}
          </Badge>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <MapPin size={16} className="text-slate-400" />
            <span className="truncate">
              {donor?.address?.city || "Unknown City"}, {donor?.address?.state}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <User size={16} className="text-slate-400" />
            <span>
              {donor?.age} yrs • {donor?.weight} kg
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <Calendar size={16} className="text-slate-400" />
            <span>Last: {donor?.lastDonationDate || "Never"}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Donor Status
          </span>
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                donor?.eligibleToDonate ? "bg-emerald-500" : "bg-amber-500"
              }`}
            ></span>
            <span className="text-xs font-bold text-slate-700">
              {donor?.eligibleToDonate ? "Active" : "Recovery"}
            </span>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const UpcomingDonationCard = ({ upcoming }) => (
  <Card className="border-none shadow-md bg-gradient-to-br from-emerald-50 to-green-50 h-fit">
    <CardHeader className="pb-3">
      <CardTitle className="flex items-center gap-2 text-emerald-800">
        <Calendar className="text-emerald-600" size={20} />
        Upcoming Donation
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <MapPin className="text-emerald-600" size={16} />
          <div>
            <p className="font-semibold text-emerald-900">
              {upcoming.center || upcoming.facility || "Blood Donation Center"}
            </p>
            <p className="text-sm text-emerald-700">
              {upcoming.address || "Location details"}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Clock className="text-emerald-600" size={16} />
          <div>
            <p className="font-semibold text-emerald-900">
              {upcoming.date ? new Date(upcoming.date).toLocaleDateString() : "Date TBD"}
            </p>
            <p className="text-sm text-emerald-700">
              {upcoming.time || "Time TBD"}
            </p>
          </div>
        </div>
        
        {upcoming.bloodType && (
          <div className="flex items-center gap-3">
            <Droplet className="text-emerald-600" size={16} />
            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
              {upcoming.bloodType} Blood Type
            </Badge>
          </div>
        )}
      </div>
      
      <div className="pt-3 border-t border-emerald-200">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 border-emerald-300 text-emerald-700 hover:bg-emerald-100"
          >
            Reschedule
          </Button>
          <Button 
            size="sm" 
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            View Details
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

const ActionTile = ({ icon, title, desc, color, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-start p-5 rounded-2xl transition-all ${color}`}
  >
    <div className="mb-3 p-2 bg-white rounded-lg shadow-sm">{icon}</div>
    <div className="font-bold text-sm">{title}</div>
    <div className="text-xs opacity-80">{desc}</div>
  </button>
);

const ActivityItem = ({ item, index }) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.1 }}
  >
    <Card className="border-none shadow-sm hover:shadow-md transition-all group">
      <CardContent className="p-4 flex items-center gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center font-bold text-xs group-hover:bg-red-50 group-hover:text-red-500 transition-colors">
          {new Date(item.date).getDate()}
        </div>
        <div className="flex-grow">
          <h4 className="font-bold text-slate-800 text-sm">
            {item.facility || "Blood Donation Camp"}
          </h4>
          <p className="text-xs text-slate-500">
            {item.city} • {item.quantity} Unit
          </p>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="rounded-full text-slate-300 hover:text-red-600"
        >
          <ChevronRight size={18} />
        </Button>
      </CardContent>
    </Card>
  </motion.div>
);

const EmptyState = () => (
  <div className="text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
    <Activity className="mx-auto text-slate-300 mb-3" size={32} />
    <p className="text-slate-500 text-sm font-medium">
      No recent activity found.
    </p>
    <Button variant="link" className="text-red-600 text-xs">
      Book your first donation
    </Button>
  </div>
);

const DashboardSkeleton = () => (
  <div className="p-10 space-y-8 max-w-7xl mx-auto">
    <div className="space-y-2">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-10 w-64" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-8 grid grid-cols-3 gap-4">
        <Skeleton className="col-span-3 h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
      <Skeleton className="lg:col-span-4 h-full rounded-xl" />
    </div>
  </div>
);

export default DonorDashboard;
