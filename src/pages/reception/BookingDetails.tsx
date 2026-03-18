import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';

import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, Check, X, ShieldCheck, CreditCard, User, Calendar, Phone } from 'lucide-react';
import { toast } from 'sonner';

export default function ReceptionBookingDetails() {
  const { id } = useParams();
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchBooking();
  }, [id, accessToken]);

  const fetchBooking = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(
        `${apiUrl}/api/bookings/${id}`,
        {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || accessToken}` },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setBooking(result.data);
      } else {
        toast.error('Booking not found');
        navigate('/reception/guests');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    setProcessing(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(
        `${apiUrl}/api/bookings/${id}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || accessToken}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        toast.success(`Booking ${newStatus === 'confirmed' ? 'Verified & Confirmed' : 'Updated'}`);
        fetchBooking();
      } else {
        const result = await response.json();
        toast.error(result.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Connection error');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0d7377]"></div></div>;
  if (!booking) return null;

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/reception/guests')} className="text-muted-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              BACK
            </Button>
            <h1 className="text-xl font-black text-[#0d7377]">VERIFY RESERVATION</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="md:col-span-2 space-y-6">
              <Card className="rounded-[24px] overflow-hidden border-none shadow-sm">
                 <div className="bg-[#0d7377] p-6 text-white flex justify-between items-center">
                    <div>
                       <p className="text-[10px] font-black opacity-60 uppercase tracking-widest">Booking Status</p>
                       <h3 className="text-xl font-black uppercase italic tracking-tight">{booking.status.replace('_', ' ')}</h3>
                    </div>
                    {booking.status === 'pending_verification' && (
                       <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-black animate-pulse flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4"/> VERIFICATION REQUIRED
                       </div>
                    )}
                 </div>
                 <CardContent className="p-8">
                    <div className="grid grid-cols-2 gap-y-8">
                       <div className="space-y-1">
                          <p className="text-[10px] font-black text-muted-foreground uppercase">Guest</p>
                          <p className="font-black text-lg flex items-center gap-2"><User className="w-4 h-4 text-[#0d7377]"/> {booking.customer_name}</p>
                          <p className="text-sm font-bold opacity-60 flex items-center gap-2"><Phone className="w-3 h-3"/> {booking.customer_phone}</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[10px] font-black text-muted-foreground uppercase">Room Type</p>
                          <p className="font-black text-lg">{booking.room_type_name}</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[10px] font-black text-muted-foreground uppercase">Dates</p>
                          <p className="font-bold flex items-center gap-2"><Calendar className="w-4 h-4 text-[#0d7377]"/> {new Date(booking.check_in).toLocaleDateString()} - {new Date(booking.check_out).toLocaleDateString()}</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[10px] font-black text-muted-foreground uppercase">Guests</p>
                          <p className="font-bold">{booking.guests} Pax</p>
                       </div>
                    </div>
                 </CardContent>
              </Card>

              {booking.special_requests && (
                 <Card className="rounded-[24px] border-none shadow-sm bg-orange-50">
                    <CardContent className="p-6">
                       <p className="text-[10px] font-black text-orange-800 uppercase mb-2">Customer Note</p>
                       <p className="font-bold text-orange-900 italic text-lg">"{booking.special_requests}"</p>
                    </CardContent>
                 </Card>
              )}
           </div>

           <div className="space-y-6">
              <Card className="rounded-[24px] border-none shadow-xl bg-white border-t-8 border-t-[#0d7377]">
                 <CardHeader><CardTitle className="text-lg font-black uppercase text-[#0d7377] flex items-center gap-2 shadow-inner p-2 w-fit bg-[#0d7377]/5 rounded-xl"><CreditCard className="w-5 h-5"/> Payment Verification</CardTitle></CardHeader>
                 <CardContent className="space-y-6">
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-muted-foreground uppercase">Transaction Ref</p>
                       <p className="font-mono text-sm bg-muted p-3 rounded-xl border font-bold break-all">{booking.transaction_id || 'NO TRANSACTION RECORDED'}</p>
                    </div>
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-muted-foreground uppercase">Paid Amount</p>
                       <p className="text-3xl font-black text-green-600 italic">₹{parseFloat(booking.paid_amount || 0).toLocaleString()}</p>
                    </div>
                    
                    {booking.status === 'pending_verification' && (
                       <div className="grid gap-3 pt-4 border-t">
                          <Label className="text-[10px] font-black text-muted-foreground uppercase mb-1">Verify and Action</Label>
                          <Button 
                             disabled={processing}
                             onClick={() => handleUpdateStatus('confirmed')}
                             className="bg-green-600 hover:bg-green-700 font-black h-12 rounded-xl"
                          >
                             <Check className="w-5 h-5 mr-2" />
                             APPROVE PAYMENT
                          </Button>
                          <Button 
                             disabled={processing}
                             variant="outline"
                             onClick={() => handleUpdateStatus('cancelled')}
                             className="border-red-500 text-red-500 hover:bg-red-50 font-black h-12 rounded-xl"
                          >
                             <X className="w-5 h-5 mr-2" />
                             INVALID / REJECT
                          </Button>
                       </div>
                    )}
                 </CardContent>
              </Card>
           </div>
        </div>
      </main>
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode, className?: string }) {
   return <div className={className}>{children}</div>;
}
