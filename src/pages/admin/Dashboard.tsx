import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';

import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Hotel, LogOut, Users, DollarSign, Calendar, Settings, BarChart } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const { user, signOut, accessToken } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);

  useEffect(() => {
    fetchStats();
  }, [accessToken]);

  const fetchStats = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(
        `${apiUrl}/api/admin/stats`,
        {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || accessToken}` },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setStats(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleInitialize = async () => {
    setInitializing(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(
        `${apiUrl}/api/rooms/types/init`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || accessToken}` },
        }
      );

      if (response.ok) {
        toast.success('Room types initialized successfully!');
        fetchStats();
      } else {
        toast.error('Failed to initialize room types');
      }
    } catch (error) {
      console.error('Initialization error:', error);
      toast.error('Failed to initialize');
    } finally {
      setInitializing(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    toast.success('Signed out successfully');
  };

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Hotel className="w-8 h-8 text-[#0d7377]" />
              <div>
                <h1 className="text-xl font-semibold text-[#0d7377]">Admin Portal</h1>
                <p className="text-sm text-muted-foreground">Panchavati Hotel Management</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">Administrator</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="border-[#0d7377] text-[#0d7377] hover:bg-[#0d7377] hover:text-white"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
            <p className="text-lg text-muted-foreground">Hotel operations overview</p>
          </div>
          {!stats && !loading && (
             <Button 
               onClick={handleInitialize} 
               disabled={initializing}
               className="bg-[#0d7377] hover:bg-[#0d7377]"
             >
               {initializing ? 'Initializing...' : 'Initialize System'}
             </Button>
          )}
        </div>

        {/* Stats Cards */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0d7377]"></div>
          </div>
        ) : stats ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Total Revenue</CardDescription>
                  <CardTitle className="text-3xl text-[#0d7377]">
                    ₹{(stats.totalRevenue || 0).toLocaleString()}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Total Bookings</CardDescription>
                  <CardTitle className="text-3xl text-[#0d7377]">
                    {stats.totalBookings || 0}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Today's Bookings</CardDescription>
                  <CardTitle className="text-3xl text-[#0d7377]">
                    {stats.todayBookings || 0}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Guests In-House</CardDescription>
                  <CardTitle className="text-3xl text-[#0d7377]">
                    {stats.inHouse || 0}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>

            {/* Revenue by Room Type */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Revenue by Room Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {stats.revenueByType && Object.entries(stats.revenueByType).length > 0 ? (
                    Object.entries(stats.revenueByType).map(([type, revenue]: [string, any]) => (
                      <div key={type} className="flex flex-col p-4 bg-muted rounded-xl">
                        <span className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">{type}</span>
                        <span className="text-2xl font-bold text-[#0d7377] mt-1">₹{revenue.toLocaleString()}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground py-2 col-span-3 text-center">No revenue data available by type yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="bg-white p-12 rounded-xl border text-center">
            <Hotel className="w-16 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <h3 className="text-xl font-semibold mb-2">No data yet</h3>
            <p className="text-muted-foreground mb-6">Initialize the system to create room types and start tracking statistics.</p>
            <Button 
               onClick={handleInitialize} 
               disabled={initializing}
               className="bg-[#0d7377] hover:bg-[#0a5c5f]"
             >
               {initializing ? 'Initializing...' : 'Initialize System Now'}
             </Button>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/admin/rooms">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-transparent hover:border-[#0d7377]">
              <CardHeader>
                <Settings className="w-12 h-12 text-[#0d7377] mb-2" />
                <CardTitle>Manage Rooms</CardTitle>
                <CardDescription className="text-base">
                  Room types, pricing, and availability
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/admin/users">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-transparent hover:border-[#0d7377]">
              <CardHeader>
                <Users className="w-12 h-12 text-[#0d7377] mb-2" />
                <CardTitle>Manage Employees</CardTitle>
                <CardDescription className="text-base">
                  Staff accounts and permissions
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/admin/reports">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-transparent hover:border-[#0d7377]">
              <CardHeader>
                <BarChart className="w-12 h-12 text-[#0d7377] mb-2" />
                <CardTitle>Reports</CardTitle>
                <CardDescription className="text-base">
                  Analytics and booking history
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  );
}