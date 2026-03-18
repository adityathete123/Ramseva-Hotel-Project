import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';

import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Calendar, MapPin, LogOut, Hotel, CalendarCheck, User, ChevronRight, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function CustomerDashboard() {
  const { user, accessToken, signOut } = useAuth();
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
      toast.error('Failed to load your profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    toast.success('Successfully signed out');
  };

  const upcomingBookings = bookings.filter(
    b => b.status !== 'cancelled' && b.status !== 'checked_out' && new Date(b.check_in) >= new Date(new Date().setHours(0,0,0,0))
  );

  const activeBooking = bookings.find(
    b => b.status === 'checked_in'
  );

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-[#0d7377]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-[#0d7377] p-1.5 rounded-lg shadow-inner">
                 <Hotel className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-black text-[#0d7377] leading-none">PANCHAVATI</h1>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Guest Hub</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-black text-gray-800">{user?.name}</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{user?.email}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-red-500 hover:text-red-600 hover:bg-red-50/50 font-bold"
              >
                <LogOut className="w-4 h-4 mr-2" />
                EXIT
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Welcome Banner */}
        <div className="mb-12 relative overflow-hidden bg-[#0d7377] rounded-[32px] p-8 md:p-12 text-white shadow-2xl">
           <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="space-y-4 max-w-xl">
                 <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
                    <Sparkles className="w-3.5 h-3.5" />
                    Premium Pilgrimage Stay
                 </div>
                 <h2 className="text-4xl md:text-5xl font-black">Welcome back,<br/>{user?.name}!</h2>
                 <p className="text-white/80 font-medium text-lg leading-relaxed">
                   Manage your bookings, discover our newest facilities, and prepare for your peaceful stay at Godavari's banks.
                 </p>
              </div>
              <div className="flex flex-col gap-3">
                 <Button onClick={() => navigate('/customer/book')} className="bg-white text-[#0d7377] hover:bg-white/90 font-black px-8 py-7 rounded-2xl text-lg shadow-xl hover:translate-y-[-2px] transition-all">
                    BOOK NEW STAY
                 </Button>
                 <Button variant="ghost" onClick={() => navigate('/customer/bookings')} className="text-white hover:bg-white/10 font-bold text-sm">
                    View History
                 </Button>
              </div>
           </div>
           {/* Abstract Decoration */}
           <div className="absolute top-[-10%] right-[-5%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
           <div className="absolute bottom-[-20%] left-[-10%] w-96 h-96 bg-black/5 rounded-full blur-3xl"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 space-y-8">
              {/* Ongoing Stay */}
              {activeBooking && (
                <Card className="border-none shadow-xl overflow-hidden rounded-[24px]">
                  <div className="bg-green-600 px-6 py-3 flex items-center justify-between">
                     <div className="flex items-center gap-2 text-white font-bold text-sm uppercase tracking-widest">
                        <Hotel className="w-4 h-4" />
                        ACTIVE RESIDENCE
                     </div>
                     <Badge className="bg-white/20 text-white border-none backdrop-blur-sm">IN-HOUSE</Badge>
                  </div>
                  <CardContent className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-muted-foreground uppercase opacity-60">Room Type</p>
                        <p className="text-xl font-black text-gray-800">{activeBooking.room_type_name}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-muted-foreground uppercase opacity-60">Room Number</p>
                        <p className="text-xl font-black text-green-600">{activeBooking.room_number || 'ASSIGNED'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-muted-foreground uppercase opacity-60">Check-out</p>
                        <p className="text-xl font-black text-gray-800">
                          {new Date(activeBooking.check_out).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                        </p>
                      </div>
                    </div>
                    <Button onClick={() => navigate(`/customer/bookings/${activeBooking.id}`)} variant="outline" className="mt-8 w-full md:w-auto border-green-600 text-green-600 font-bold px-8">
                       Manage Room Service
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Upcoming Highlights */}
              <div className="space-y-4">
                 <h3 className="text-2xl font-black text-gray-800 flex items-center gap-3">
                    <CalendarCheck className="w-6 h-6 text-[#0d7377]" />
                    Upcoming Journeys
                 </h3>
                 {loading ? (
                    <div className="py-12 flex justify-center"><div className="animate-spin h-8 w-8 border-b-2 border-[#0d7377]"></div></div>
                 ) : upcomingBookings.length > 0 ? (
                    <div className="grid gap-4">
                       {upcomingBookings.slice(0, 3).map(b => (
                          <div key={b.id} className="group bg-white p-5 rounded-2xl shadow-sm border border-transparent hover:border-[#0d7377]/20 hover:shadow-md transition-all cursor-pointer" onClick={() => navigate(`/customer/bookings/${b.id}`)}>
                             <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                   <p className="text-sm font-black text-gray-800">{b.room_type_name}</p>
                                   <p className="text-xs text-muted-foreground font-medium">
                                      {new Date(b.check_in).toLocaleDateString()} - {new Date(b.check_out).toLocaleDateString()}
                                   </p>
                                </div>
                                <div className="flex items-center gap-4">
                                   <Badge className="bg-[#0d7377]/10 text-[#0d7377] border-none font-bold uppercase text-[10px]">{b.status}</Badge>
                                   <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                </div>
                             </div>
                          </div>
                       ))}
                       {upcomingBookings.length > 3 && (
                          <Button variant="link" onClick={() => navigate('/customer/bookings')} className="text-[#0d7377] font-bold p-0 w-fit">
                             VIEW ALL {upcomingBookings.length} RESERVATIONS
                          </Button>
                       )}
                    </div>
                 ) : (
                    <div className="bg-white border-2 border-dashed rounded-2xl py-16 text-center">
                       <p className="text-muted-foreground font-bold mb-4 uppercase tracking-widest opacity-40">No future stays planned</p>
                       <Button onClick={() => navigate('/customer/book')} className="bg-[#0d7377] font-black uppercase text-xs tracking-widest">
                          Explore Rooms
                       </Button>
                    </div>
                 )}
              </div>
           </div>

           {/* Sidebar */}
           <div className="space-y-8">
              <Card className="border-none shadow-xl rounded-[24px] bg-[#faf9f6]">
                 <CardHeader className="pb-2">
                    <CardTitle className="text-base font-black uppercase tracking-widest text-muted-foreground">Shortcuts</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-2 p-4">
                    <Link to="/customer/book" className="flex items-center gap-4 p-4 rounded-xl hover:bg-white hover:shadow-sm transition-all group">
                       <div className="bg-[#0d7377]/10 p-2.5 rounded-lg group-hover:bg-[#0d7377] transition-colors">
                          <Sparkles className="w-5 h-5 text-[#0d7377] group-hover:text-white" />
                       </div>
                       <span className="font-bold text-gray-700">Premium Reservation</span>
                    </Link>
                    <Link to="/customer/bookings" className="flex items-center gap-4 p-4 rounded-xl hover:bg-white hover:shadow-sm transition-all group">
                       <div className="bg-orange-50 p-2.5 rounded-lg group-hover:bg-orange-500 transition-colors">
                          <Calendar className="w-5 h-5 text-orange-600 group-hover:text-white" />
                       </div>
                       <span className="font-bold text-gray-700">Booking Ledger</span>
                    </Link>
                    <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-white hover:shadow-sm transition-all group cursor-not-allowed opacity-50">
                       <div className="bg-blue-50 p-2.5 rounded-lg group-hover:bg-blue-500 transition-colors">
                          <User className="w-5 h-5 text-blue-600 group-hover:text-white" />
                       </div>
                       <span className="font-bold text-gray-700">Membership Profile</span>
                    </div>
                 </CardContent>
              </Card>

              <div className="bg-white rounded-[24px] p-8 shadow-inner border border-gray-100 flex flex-col items-center text-center space-y-4">
                 <div className="bg-[#0d7377]/5 p-4 rounded-full">
                    <MapPin className="w-8 h-8 text-[#0d7377]" />
                 </div>
                 <div>
                    <h4 className="font-black text-lg">Visiting Nashik?</h4>
                    <p className="text-sm text-muted-foreground font-medium">Located just 5 mins from the sacred Panchavati Ghats.</p>
                 </div>
                 <Button variant="outline" className="rounded-full border-[#0d7377] text-[#0d7377] font-bold">
                    GET DIRECTIONS
                 </Button>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
}
