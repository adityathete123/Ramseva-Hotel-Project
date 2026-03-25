import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';

import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Textarea } from '../../components/ui/textarea';
import { ArrowLeft, Calendar, CreditCard, CheckCircle, Bed } from 'lucide-react';
import { toast } from 'sonner';

export default function SearchAndBook() {
  const { user, accessToken } = useAuth();
  const navigate = useNavigate();
  
  // Search form
  const [searchForm, setSearchForm] = useState({
    checkIn: '',
    checkOut: '',
    guests: 2,
  });

  // Availability state
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [nights, setNights] = useState(0);
  const [searchComplete, setSearchComplete] = useState(false);

  // Selected room and booking state
  const [selectedRoom, setSelectedRoom] = useState<any | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);

  // Booking form
  const [bookingForm, setBookingForm] = useState({
    guestName: user?.name || '',
    guestPhone: (user as any)?.phone || '',
    guestEmail: user?.email || '',
    numberOfGuests: 2,
    specialRequests: '',
    transactionId: '',
  });

  const [booking, setBooking] = useState(false);
  const [bookingComplete, setBookingComplete] = useState<any>(null);

  // Hotel payment details from DB
  const [paymentDetails, setPaymentDetails] = useState<{ upi_id: string | null; qr_code_url: string | null } | null>(null);

  useEffect(() => {
    if (user) {
      setBookingForm(prev => ({
        ...prev,
        guestName: user.name,
        guestEmail: user.email,
        guestPhone: (user as any).phone || ''
      }));
    }
  }, [user]);

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiUrl}/api/payment/details`);
        if (res.ok) {
          const result = await res.json();
          setPaymentDetails(result.data);
        }
      } catch (err) {
        console.error('Could not fetch payment details', err);
      }
    };
    fetchPaymentDetails();
  }, []);

  const calculateNights = (checkIn: string, checkOut: string) => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    return diffDays;
  };

  const calculateTotalCost = (pricePerNight: number) => {
    const subtotal = pricePerNight * nights;
    const gstValue = subtotal * 0.12;
    const totalValue = subtotal + gstValue;
    return { subtotal, gst: gstValue, total: totalValue };
  };

  const calculateAdvancePayment = (totalValue: number) => {
    return Math.ceil(totalValue * 0.3); // 30% advance
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearching(true);
    setSearchComplete(false);
    setSelectedRoom(null);
    setShowBookingForm(false);

    const calculatedNights = calculateNights(searchForm.checkIn, searchForm.checkOut);
    setNights(calculatedNights);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const queryParams = new URLSearchParams({
        checkIn: searchForm.checkIn,
        checkOut: searchForm.checkOut,
        guests: searchForm.guests.toString()
      });

      const response = await fetch(`${apiUrl}/api/rooms/availability?${queryParams}`);
      if (response.ok) {
        const result = await response.json();
        setAvailableRooms(result.data || []);
        setSearchComplete(true);
      } else {
        toast.error('Failed to check availability');
      }
    } catch (error) {
      console.error(error);
      toast.error('Network error during search');
    } finally {
      setSearching(false);
    }
  };

  const handleBookNow = (room: any) => {
    setSelectedRoom(room);
    setShowBookingForm(true);
    setBookingForm({ ...bookingForm, numberOfGuests: searchForm.guests });
    
    setTimeout(() => {
      document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bookingForm.transactionId.trim()) {
      toast.error('Please enter transaction ID for advance payment');
      return;
    }

    setBooking(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || accessToken}`,
        },
        body: JSON.stringify({
          roomTypeId: selectedRoom.id,
          checkIn: searchForm.checkIn,
          checkOut: searchForm.checkOut,
          guests: bookingForm.numberOfGuests,
          specialRequests: bookingForm.specialRequests,
          transactionId: bookingForm.transactionId
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setBookingComplete({
           id: result.data.bookingId,
           roomType: selectedRoom.name,
           checkIn: searchForm.checkIn,
           checkOut: searchForm.checkOut,
           nights: nights,
           guests: bookingForm.numberOfGuests,
           amount: calculateTotalCost(selectedRoom.base_price).total,
           advancePaid: calculateAdvancePayment(calculateTotalCost(selectedRoom.base_price).total),
           transactionId: bookingForm.transactionId,
           guestPhone: bookingForm.guestPhone
        });
        toast.success('Booking request submitted!');
      } else {
        const result = await response.json();
        toast.error(result.message || 'Booking failed');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to submit booking');
    } finally {
      setBooking(false);
    }
  };

  if (bookingComplete) {
    return (
      <div className="min-h-screen bg-[#faf9f6]">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-xl font-semibold text-[#0d7377]">Booking Confirmation</h1>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="border-t-4 border-t-[#0d7377]">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-2xl">Submission Received!</CardTitle>
              <CardDescription className="text-base mt-2">
                Your reservation request is being verified by our team.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-[#f0f9fa] p-6 rounded-xl border border-[#0d7377]/20 flex flex-col items-center">
                <p className="text-sm text-muted-foreground mb-1 uppercase tracking-widest font-bold">Booking ID</p>
                <p className="text-3xl font-black text-[#0d7377] underline decoration-wavy decoration-[#0d7377]/30">{bookingComplete.id}</p>
              </div>

              <div className="bg-muted p-6 rounded-xl">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                   <Calendar className="w-4 h-4" />
                   Stay Details
                </h3>
                <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-0.5">Check-in</p>
                    <p className="font-bold">{new Date(bookingComplete.checkIn).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-0.5">Check-out</p>
                    <p className="font-bold">{new Date(bookingComplete.checkOut).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-0.5">Room Type</p>
                    <p className="font-bold">{bookingComplete.roomType}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-0.5">Nights</p>
                    <p className="font-bold">{bookingComplete.nights}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={() => navigate('/customer/bookings')}
                  className="flex-1 bg-[#0d7377] hover:bg-[#0a5c5f] py-6"
                >
                  My Bookings
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/customer')}
                  className="flex-1 py-6"
                >
                  Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/customer')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-xl font-bold text-[#0d7377]">
              {searchComplete ? 'Select Your Room' : 'Search & Book'}
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-8 border-none shadow-md overflow-hidden">
          <div className="bg-[#0d7377] p-6 text-white">
            <CardTitle className="text-xl flex items-center gap-2">
               <Calendar className="w-5 h-5" />
               Availability Search
            </CardTitle>
          </div>
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs uppercase font-bold text-muted-foreground">Check-in Date</Label>
                  <Input
                    type="date"
                    value={searchForm.checkIn}
                    onChange={(e: any) => setSearchForm({ ...searchForm, checkIn: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    className="border-muted-foreground/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase font-bold text-muted-foreground">Check-out Date</Label>
                  <Input
                    type="date"
                    value={searchForm.checkOut}
                    onChange={(e: any) => setSearchForm({ ...searchForm, checkOut: e.target.value })}
                    min={searchForm.checkIn || new Date().toISOString().split('T')[0]}
                    required
                    className="border-muted-foreground/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase font-bold text-muted-foreground">Guests</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={searchForm.guests}
                    onChange={(e: any) => setSearchForm({ ...searchForm, guests: parseInt(e.target.value) })}
                    required
                    className="border-muted-foreground/20"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-[#0d7377] hover:bg-[#0a5c5f] py-6 text-lg font-bold"
                disabled={searching}
              >
                {searching ? 'Checking Live Availability...' : 'Show Available Rooms'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {searchComplete && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
               <h2 className="text-2xl font-black text-gray-800">Results for {nights} Night{nights !== 1 ? 's' : ''}</h2>
               <Badge className="bg-[#0d7377] px-3 py-1">{availableRooms.length} Found</Badge>
            </div>
            
            {availableRooms.map((room) => {
              const costs = calculateTotalCost(room.base_price);
              return (
                <Card key={room.id} className={`overflow-hidden transition-all ${selectedRoom?.id === room.id ? 'ring-2 ring-[#0d7377]' : 'border-none shadow-sm hover:shadow-md'}`}>
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="w-full md:w-64 h-48 bg-muted flex items-center justify-center relative">
                        {room.images && room.images.length > 0 ? (
                           <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${room.images[0].image_url}`} alt={room.name} className="w-full h-full object-cover" />
                        ) : (
                           <Bed className="w-12 h-12 text-muted-foreground/40" />
                        )}
                        <div className="absolute top-2 left-2">
                           <Badge className="bg-white/90 text-black border-none backdrop-blur-sm">₹{room.base_price}/Night</Badge>
                        </div>
                      </div>

                      <div className="flex-1 p-6">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-black">{room.name}</h3>
                          <Badge variant="outline" className="text-[#0d7377] border-[#0d7377] font-bold">Max {room.max_occupancy} Guests</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{room.description}</p>

                        <div className="flex flex-wrap gap-2 mb-6">
                          {(typeof room.amenities === 'string' ? JSON.parse(room.amenities) : room.amenities || []).map((amenity: string, idx: number) => (
                            <span key={idx} className="text-[10px] uppercase font-bold tracking-tighter bg-muted px-2 py-0.5 rounded border">
                              {amenity}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t">
                          <div>
                            <p className="text-2xl font-black text-[#0d7377]">₹{costs.total.toLocaleString()}</p>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold">Total Stay Inc. GST</p>
                          </div>
                          <Button
                            onClick={() => handleBookNow(room)}
                            className="bg-[#0d7377] hover:bg-[#0a5c5f] font-bold px-8"
                          >
                            Select Room
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {availableRooms.length === 0 && (
              <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed">
                <Bed className="w-16 h-16 mx-auto mb-4 text-muted-foreground/20" />
                <h3 className="text-xl font-bold">Sold Out!</h3>
                <p className="text-muted-foreground">No rooms available for these dates. Try adjusting your search.</p>
              </div>
            )}
          </div>
        )}

        {showBookingForm && selectedRoom && (
          <div id="booking-form" className="mt-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-black text-gray-800 border-b-4 border-[#0d7377] w-fit italic">Finalize Booking</h2>
            
            <form onSubmit={handleBooking} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-none shadow-md">
                   <CardHeader><CardTitle className="text-lg">Contact Information</CardTitle></CardHeader>
                   <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <Label className="text-xs font-bold text-muted-foreground uppercase">Full Name</Label>
                           <Input value={bookingForm.guestName} onChange={(e: any) => setBookingForm({...bookingForm, guestName: e.target.value})} required />
                        </div>
                        <div className="space-y-2">
                           <Label className="text-xs font-bold text-muted-foreground uppercase">Phone Number</Label>
                           <Input value={bookingForm.guestPhone} onChange={(e: any) => setBookingForm({...bookingForm, guestPhone: e.target.value})} required />
                        </div>
                      </div>
                      <div className="space-y-2">
                         <Label className="text-xs font-bold text-muted-foreground uppercase">Special Requests</Label>
                         <Textarea value={bookingForm.specialRequests} onChange={(e: any) => setBookingForm({...bookingForm, specialRequests: e.target.value})} placeholder="Extra bed, late check-in, etc." />
                      </div>
                   </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-[#0d7377]/5 border-l-4 border-l-[#0d7377]">
                   <CardHeader><CardTitle className="text-lg flex items-center gap-2 font-black text-[#0d7377]"><CreditCard className="w-5 h-5"/> Advance Payment</CardTitle></CardHeader>
                   <CardContent className="space-y-6">
                      <div className="text-center bg-white p-6 rounded-xl shadow-sm border border-[#0d7377]/10">
                          <p className="text-sm font-bold text-muted-foreground mb-4">Scan &amp; Pay 30% Advance to Reserve</p>
                          {paymentDetails?.qr_code_url ? (
                            <img
                              src={paymentDetails.qr_code_url}
                              alt="Hotel Payment QR Code"
                              className="w-40 h-40 mx-auto mb-4 rounded-lg object-contain border"
                            />
                          ) : (
                            <div className="w-40 h-40 bg-muted mx-auto mb-4 rounded-lg flex flex-col items-center justify-center gap-1">
                              <span className="text-2xl">📱</span>
                              <span className="text-[10px] font-mono text-muted-foreground">QR not configured</span>
                            </div>
                          )}
                          <p className="text-2xl font-black text-[#0d7377]">₹{calculateAdvancePayment(calculateTotalCost(selectedRoom.base_price).total).toLocaleString()}</p>
                          <p className="text-xs font-bold text-muted-foreground mt-1 uppercase">
                            UPI ID: {paymentDetails?.upi_id || 'Contact hotel'}
                          </p>
                      </div>

                      <div className="space-y-2">
                         <Label className="text-xs font-black text-[#0d7377] uppercase">Enter UPI Transaction ID / UTR *</Label>
                         <Input 
                           value={bookingForm.transactionId} 
                           onChange={(e: any) => setBookingForm({...bookingForm, transactionId: e.target.value})} 
                           required 
                           className="border-[#0d7377] bg-white text-lg font-mono"
                           placeholder="XXXXXXXXXXXX"
                         />
                      </div>
                   </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="border-none shadow-md bg-white sticky top-8">
                   <CardHeader><CardTitle className="text-lg">Summary</CardTitle></CardHeader>
                   <CardContent className="space-y-4">
                      <div className="space-y-2 pb-4 border-b">
                         <p className="text-sm font-bold">{selectedRoom.name}</p>
                         <p className="text-xs text-muted-foreground">{nights} Night(s) Stay</p>
                      </div>
                      <div className="space-y-1.5 text-sm">
                         <div className="flex justify-between items-center text-muted-foreground"><span>Base Price</span><span>₹{calculateTotalCost(selectedRoom.base_price).subtotal.toLocaleString()}</span></div>
                         <div className="flex justify-between items-center text-muted-foreground"><span>GST (12%)</span><span>₹{calculateTotalCost(selectedRoom.base_price).gst.toLocaleString()}</span></div>
                         <div className="flex justify-between items-center pt-2 font-black text-lg text-[#0d7377]"><span>Total</span><span>₹{calculateTotalCost(selectedRoom.base_price).total.toLocaleString()}</span></div>
                      </div>
                      <Button type="submit" className="w-full bg-[#0d7377] hover:bg-[#0a5c5f] py-6 font-black uppercase text-lg mt-4 shadow-lg" disabled={booking}>
                         {booking ? 'Reserving...' : 'Submit Booking'}
                      </Button>
                   </CardContent>
                </Card>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}