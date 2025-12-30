import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Download,
  UserCheck,
  UserX,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Eye,
  Edit,
  Trash2,
  Plus,
  ArrowLeft
} from 'lucide-react';
import { PageContainer, BMSNavbar, ImpactCard, IconWrapper } from '@/components/ui/bms-components';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const AdminUserManagement = () => {
  const [donors, setDonors] = useState([]);
  const [filteredDonors, setFilteredDonors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API call
  const mockDonors = [
    {
      id: 1,
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+1 (555) 123-4567',
      bloodType: 'O+',
      status: 'active',
      lastDonation: '2024-01-15',
      totalDonations: 12,
      location: 'New York, NY',
      registeredDate: '2023-03-10'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '+1 (555) 987-6543',
      bloodType: 'A-',
      status: 'pending',
      lastDonation: null,
      totalDonations: 0,
      location: 'Los Angeles, CA',
      registeredDate: '2024-01-20'
    },
    {
      id: 3,
      name: 'Michael Brown',
      email: 'mike.brown@email.com',
      phone: '+1 (555) 456-7890',
      bloodType: 'B+',
      status: 'inactive',
      lastDonation: '2023-08-22',
      totalDonations: 8,
      location: 'Chicago, IL',
      registeredDate: '2022-11-05'
    },
    {
      id: 4,
      name: 'Emily Davis',
      email: 'emily.davis@email.com',
      phone: '+1 (555) 321-0987',
      bloodType: 'AB+',
      status: 'active',
      lastDonation: '2024-01-28',
      totalDonations: 15,
      location: 'Houston, TX',
      registeredDate: '2022-07-18'
    },
    {
      id: 5,
      name: 'David Wilson',
      email: 'david.w@email.com',
      phone: '+1 (555) 654-3210',
      bloodType: 'O-',
      status: 'active',
      lastDonation: '2024-01-25',
      totalDonations: 20,
      location: 'Phoenix, AZ',
      registeredDate: '2021-12-03'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setDonors(mockDonors);
      setFilteredDonors(mockDonors);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = donors;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(donor =>
        donor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donor.bloodType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(donor => donor.status === statusFilter);
    }

    setFilteredDonors(filtered);
  }, [searchTerm, statusFilter, donors]);

  const getStatusBadge = (status) => {
    const variants = {
      active: 'bg-emerald-100 text-emerald-800',
      pending: 'bg-amber-100 text-amber-800',
      inactive: 'bg-slate-100 text-slate-600'
    };
    return variants[status] || variants.inactive;
  };

  const getBloodTypeBadge = (bloodType) => {
    const variants = {
      'O+': 'bg-red-100 text-red-800',
      'O-': 'bg-red-50 text-red-700',
      'A+': 'bg-blue-100 text-blue-800',
      'A-': 'bg-blue-50 text-blue-700',
      'B+': 'bg-green-100 text-green-800',
      'B-': 'bg-green-50 text-green-700',
      'AB+': 'bg-purple-100 text-purple-800',
      'AB-': 'bg-purple-50 text-purple-700'
    };
    return variants[bloodType] || 'bg-slate-100 text-slate-600';
  };

  const stats = {
    totalDonors: donors.length,
    activeDonors: donors.filter(d => d.status === 'active').length,
    pendingApprovals: donors.filter(d => d.status === 'pending').length,
    totalDonations: donors.reduce((sum, d) => sum + d.totalDonations, 0)
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-pulse mb-4">
              <Shield className="w-12 h-12 text-red-600 mx-auto" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-2">
              Loading Admin Dashboard
            </h2>
            <p className="text-slate-500">Preparing user management console...</p>
          </div>
        </div>
      </PageContainer>
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
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Dashboard</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Button>
              <Plus className="w-4 h-4" />
              Add Donor
            </Button>
            
            <div className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm border border-slate-200 rounded-xl">
              <IconWrapper icon={Shield} variant="red" className="w-8 h-8" />
              <span className="font-semibold text-slate-900">Admin</span>
            </div>
          </div>
        </div>
      </BMSNavbar>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <ImpactCard
            icon={Users}
            title="Total Donors"
            value={stats.totalDonors}
            change="+12%"
            variant="critical"
          />
          
          <ImpactCard
            icon={UserCheck}
            title="Active Donors"
            value={stats.activeDonors}
            change="+8%"
            variant="success"
          />
          
          <ImpactCard
            icon={UserX}
            title="Pending Approvals"
            value={stats.pendingApprovals}
            change={stats.pendingApprovals > 0 ? "Review" : "Clear"}
            variant="warning"
          />
          
          <ImpactCard
            icon={Calendar}
            title="Total Donations"
            value={stats.totalDonations}
            change="+25%"
            variant="info"
          />
        </div>

        {/* Donor Management Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                <IconWrapper icon={Users} variant="red" className="bg-red-600 text-white" />
                Donor Management
              </CardTitle>
              
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4" />
                  Export
                </Button>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4" />
                  Filter
                </Button>
              </div>
            </div>
            
            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search donors by name, email, or blood type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bms-input px-3 py-2 min-w-[150px]"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </CardHeader>
          
          <CardContent>
            {filteredDonors.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-500 mb-4">
                  {searchTerm || statusFilter !== 'all' ? 'No donors match your filters' : 'No donors found'}
                </p>
                {(searchTerm || statusFilter !== 'all') && (
                  <Button variant="outline" onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}>
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-semibold text-slate-900 tracking-tight">Donor</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900 tracking-tight">Blood Type</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900 tracking-tight">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900 tracking-tight">Donations</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900 tracking-tight">Last Donation</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900 tracking-tight">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDonors.map((donor) => (
                      <tr key={donor.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-4">
                          <div>
                            <div className="font-semibold text-slate-900 tracking-tight">{donor.name}</div>
                            <div className="text-sm text-slate-500 flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {donor.email}
                            </div>
                            <div className="text-sm text-slate-500 flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {donor.phone}
                            </div>
                            <div className="text-sm text-slate-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {donor.location}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge className={`${getBloodTypeBadge(donor.bloodType)} font-semibold`}>
                            {donor.bloodType}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <Badge className={`${getStatusBadge(donor.status)} font-semibold capitalize`}>
                            {donor.status}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-semibold text-slate-900">{donor.totalDonations}</div>
                          <div className="text-sm text-slate-500">donations</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm text-slate-900">
                            {donor.lastDonation ? new Date(donor.lastDonation).toLocaleDateString() : 'Never'}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon-sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon-sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon-sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
};

export default AdminUserManagement;