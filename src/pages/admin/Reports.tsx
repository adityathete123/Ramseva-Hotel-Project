import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';

import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, Download, TrendingUp, Users, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminReports() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, [accessToken]);

  const fetchBookings = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(
        `${apiUrl}/api/bookings`,
        {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || accessToken}` },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setBookings(result.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  // Metrics calculation
  const confirmedBookings = bookings.filter(b => b.status !== 'cancelled');
  const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (parseFloat(b.total_amount) || 0), 0);
  const inHouseCount = bookings.filter(b => b.status === 'checked_in').length;
  
  // Chart Data preparation
  const getChartData = () => {
    const types: Record<string, number> = {};
    confirmedBookings.forEach(b => {
      const name = b.room_type_name || 'Other';
      types[name] = (types[name] || 0) + 1;
    });
    return Object.entries(types).map(([name, count]) => ({ category: name, bookings: count }));
  };

  const handleExport = () => {
    toast.info('Export functionality coming soon');
  };

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <h1 className="text-xl font-semibold text-[#0d7377]">Reports & Analytics</h1>
            </div>
            <Button onClick={handleExport} variant="outline" className="text-[#0d7377] border-[#0d7377]">
              <Download className="w-4 h-4 mr-2" />
              Download CSV
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0d7377] mx-auto"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-[#0d7377]" />
                    <CardDescription>All-Time Revenue</CardDescription>
                  </div>
                  <CardTitle className="text-3xl text-[#0d7377]">
                    ₹{totalRevenue.toLocaleString()}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-[#0d7377]" />
                    <CardDescription>Total Bookings</CardDescription>
                  </div>
                  <CardTitle className="text-3xl text-[#0d7377]">
                    {bookings.length}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-[#0d7377]" />
                    <CardDescription>In-House Guests</CardDescription>
                  </div>
                  <CardTitle className="text-3xl text-[#0d7377]">
                    {inHouseCount}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Popularity by Room Type</CardTitle>
                <CardDescription>Number of bookings per category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getChartData()}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="category" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip 
                         contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                         cursor={{ fill: 'transparent' }}
                      />
                      <Bar dataKey="bookings" fill="#0d7377" radius={[6, 6, 0, 0]} barSize={50} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Booking Ledger</CardTitle>
                  <CardDescription>Comprehensive history of all guest stays</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-muted-foreground text-xs uppercase tracking-wider">
                        <th className="text-left py-4 px-4 font-bold">Guest</th>
                        <th className="text-left py-4 px-4 font-bold">Category</th>
                        <th className="text-left py-4 px-4 font-bold">Dates</th>
                        <th className="text-left py-4 px-4 font-bold">Status</th>
                        <th className="text-right py-4 px-4 font-bold">Total Stay</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {bookings.map((b) => (
                        <tr key={b.id} className="border-b hover:bg-muted/30 transition-colors">
                          <td className="py-4 px-4">
                            <p className="font-semibold">{b.customer_name || 'N/A'}</p>
                            <p className="text-xs text-muted-foreground">{b.customer_phone}</p>
                          </td>
                          <td className="py-4 px-4">
                             <Badge variant="outline" className="bg-white">{b.room_type_name}</Badge>
                          </td>
                          <td className="py-4 px-4">
                            <span>{new Date(b.check_in).toLocaleDateString()}</span>
                            <span className="mx-1 opacity-40">→</span>
                            <span>{new Date(b.check_out).toLocaleDateString()}</span>
                          </td>
                          <td className="py-4 px-4">
                            <Badge className={
                              b.status === 'checked_out' ? 'bg-gray-400' : 
                              b.status === 'checked_in' ? 'bg-[#0d7377]' : 
                              b.status === 'cancelled' ? 'bg-red-400' : 'bg-blue-400'
                            }>
                              {b.status.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="py-4 px-4 text-right font-bold text-[#0d7377]">
                            ₹{(parseFloat(b.total_amount) || 0).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {bookings.length === 0 && (
                    <div className="py-20 text-center text-muted-foreground">
                      No records found in the system.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}