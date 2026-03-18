import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';

import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { ArrowLeft, Calendar, Hotel, Info } from 'lucide-react';
import { toast } from 'sonner';

export default function CustomerBookings() {
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
        `${apiUrl}/api/bookings/my`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || accessToken}`,
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setBookings(result.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      toast.error('Failed to load your bookings');
    } finally {
      setLoading(false);
    }
  };

  const upcomingBookings = bookings.filter(
    b => b.status !== 'cancelled' && b.status !== 'checked_out' && new Date(b.check_in) >= new Date(new Date().setHours(0,0,0,0))
  );

  const pastBookings = bookings.filter(
    b => b.status === 'checked_out' || (b.status !== 'cancelled' && new Date(b.check_out) < new Date())
  );

  const cancelledBookings = bookings.filter(b => b.status === 'cancelled');

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      confirmed: 'bg-green-600',
      checked_in: 'bg-[#0d7377]',
      checked_out: 'bg-gray-500',
      cancelled: 'bg-red-500',
      pending_verification: 'bg-orange-500',
    };
    return <Badge className={`${colors[status] || 'bg-gray-500'} px-2 py-0.5 text-[10px] uppercase font-bold`}>{status.replace('_', ' ')}</Badge>;
  };

  const BookingCard = ({ booking }: { booking: any }) => (
    <Card className="mb-6 overflow-hidden border-none shadow-sm hover:shadow-md transition-all border-l-4 border-l-[#0d7377]">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl font-black">{booking.room_type_name}</CardTitle>
            <CardDescription className="text-xs font-mono uppercase tracking-widest">
              ID: {booking.id}
            </CardDescription>
          </div>
          {getStatusBadge(booking.status)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Check-in</p>
            <p className="font-bold text-sm">{new Date(booking.check_in).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Check-out</p>
            <p className="font-bold text-sm">{new Date(booking.check_out).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Guests</p>
            <p className="font-bold text-sm">{booking.guests} Person{booking.guests > 1 ? 's' : ''}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Amount</p>
            <p className="font-black text-sm text-[#0d7377]">₹{(parseFloat(booking.total_amount) || 0).toLocaleString()}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => navigate(`/customer/bookings/${booking.id}`)}
            className="flex-1 bg-[#0d7377] hover:bg-[#0a5c5f] font-bold py-5"
          >
            <Info className="w-4 h-4 mr-2" />
            Booking Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/customer')}
                className="text-muted-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center gap-3">
                <Hotel className="w-6 h-6 text-[#0d7377]" />
                <h1 className="text-xl font-black text-[#0d7377] tracking-tight">MY RESERVATIONS</h1>
              </div>
            </div>
            <Button 
              onClick={() => navigate('/customer/book')}
              className="bg-[#0d7377] hover:bg-[#0a5c5f] text-sm font-bold"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Book New Stay
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0d7377] mx-auto mb-4"></div>
            <p className="text-muted-foreground animate-pulse font-medium">Synchronizing your stays...</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-2 border-[#0d7377]/10 pb-6">
              <div>
                <h2 className="text-3xl font-black text-gray-800">Your Booking History</h2>
                <p className="text-muted-foreground font-medium">Manage and review all your reservations at Panchavati Hotel.</p>
              </div>
            </div>

            <Tabs defaultValue="upcoming" className="w-full">
              <TabsList className="bg-white p-1 rounded-xl shadow-sm border mb-8 flex w-fit">
                <TabsTrigger value="upcoming" className="px-6 py-2.5 rounded-lg data-[state=active]:bg-[#0d7377] data-[state=active]:text-white font-bold transition-all">
                  UPCOMING ({upcomingBookings.length})
                </TabsTrigger>
                <TabsTrigger value="past" className="px-6 py-2.5 rounded-lg data-[state=active]:bg-[#0d7377] data-[state=active]:text-white font-bold transition-all">
                  PAST ({pastBookings.length})
                </TabsTrigger>
                <TabsTrigger value="cancelled" className="px-6 py-2.5 rounded-lg data-[state=active]:bg-[#0d7377] data-[state=active]:text-white font-bold transition-all">
                  CANCELLED ({cancelledBookings.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {upcomingBookings.length > 0 ? (
                  upcomingBookings.map(booking => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))
                ) : (
                  <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed">
                    <Calendar className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
                    <p className="text-xl font-bold mb-2">No Upcoming Stays</p>
                    <p className="text-muted-foreground mb-6">Plan your next divine experience in Nashik today.</p>
                    <Link to="/customer/book">
                      <Button className="bg-[#0d7377] hover:bg-[#0a5c5f] font-bold px-8 py-6">
                        Find Available Rooms
                      </Button>
                    </Link>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="past" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {pastBookings.length > 0 ? (
                  pastBookings.map(booking => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))
                ) : (
                  <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed">
                    <Calendar className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
                    <p className="text-xl font-bold">No Past Stays Recorded</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="cancelled" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {cancelledBookings.length > 0 ? (
                  cancelledBookings.map(booking => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))
                ) : (
                  <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed">
                    <Calendar className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
                    <p className="text-xl font-bold">No Cancelled Stays</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
    </div>
  );
}
