import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';

import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function ReceptionGuestList() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    if (search) {
      const filtered = bookings.filter((b: any) =>
        (b.customer_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (b.id || '').toString().toLowerCase().includes(search.toLowerCase()) ||
        (b.customer_phone || '').includes(search)
      );
      setFilteredBookings(filtered);
    } else {
      setFilteredBookings(bookings);
    }
  }, [search, bookings]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(
        `${apiUrl}/api/reception/bookings`,
        {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || accessToken}` },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setBookings(result.data.bookings || []);
        setFilteredBookings(result.data.bookings || []);
      } else {
        toast.error('Failed to fetch bookings');
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      toast.error('Failed to load guest list');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending_verification: 'bg-orange-500',
      confirmed: 'bg-blue-600',
      checked_in: 'bg-green-600',
      checked_out: 'bg-gray-500',
      cancelled: 'bg-red-500',
    };
    return <Badge className={`${colors[status] || 'bg-gray-500'} font-bold uppercase text-[10px]`}>{status.replace('_', ' ')}</Badge>;
  };

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/reception')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-xl font-semibold">Guest List</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>All Bookings</CardTitle>
            <div className="mt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Search by name, booking ID, or phone..."
                  value={search}
                  onChange={(e: any) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading bookings...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">ID</th>
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Guest Name</th>
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Phone</th>
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Room</th>
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Dates</th>
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((b) => (
                      <tr key={b.id} className="border-b hover:bg-muted/50">
                        <td className="py-4 px-4 font-medium">{b.id}</td>
                        <td className="py-4 px-4">{b.customer_name}</td>
                        <td className="py-4 px-4">{b.customer_phone}</td>
                        <td className="py-4 px-4 font-medium text-[#0d7377]">{b.room_number || 'N/A'}</td>
                        <td className="py-4 px-4">{b.room_type_name}</td>
                        <td className="py-4 px-4 text-sm whitespace-nowrap">
                          {new Date(b.check_in).toLocaleDateString()} - {new Date(b.check_out).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4">{getStatusBadge(b.status)}</td>
                        <td className="py-4 px-4">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-[#0d7377]"
                            onClick={() => navigate(`/reception/bookings/${b.id}`)}
                          >
                            Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {filteredBookings.length === 0 && (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-muted-foreground">
                          No bookings found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
