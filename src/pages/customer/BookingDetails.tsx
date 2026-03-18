import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';

import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../components/ui/alert-dialog';
import { ArrowLeft, Download, QrCode, Calendar, MapPin, Users, Phone, Mail, CreditCard, X, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function BookingDetails() {
  const { id } = useParams();
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchBooking();
  }, [id, accessToken]);

  const fetchBooking = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(
        `${apiUrl}/api/bookings/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || accessToken}`,
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setBooking(result.data);
      } else {
        toast.error('Booking details unavailable');
        navigate('/customer/bookings');
      }
    } catch (error) {
      console.error('Failed to fetch booking:', error);
      toast.error('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    setCancelling(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(
        `${apiUrl}/api/bookings/${id}/cancel`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || accessToken}`,
          },
        }
      );

      if (response.ok) {
        toast.success('Successfully cancelled');
        fetchBooking();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Cancellation failed');
      }
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      toast.error('Cancellation failed');
    } finally {
      setCancelling(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0d7377]"></div>
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  const canCancel = (booking.status === 'confirmed' || booking.status === 'pending_verification' || booking.status === 'pending') && new Date(booking.check_in) > new Date();

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <header className="bg-white shadow-sm border-b print:hidden sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/customer/bookings')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-black text-[#0d7377]">RESERVATION DETAILS</h1>
                <p className="text-xs font-mono text-muted-foreground uppercase">{booking.id}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {canCancel && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                      <X className="w-4 h-4 mr-2" />
                      CANCEL
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-2xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-2xl font-black">Cancel this trip?</AlertDialogTitle>
                      <AlertDialogDescription className="text-base font-medium">
                        Are you sure you want to cancel your stay at Panchavati Hotel? Refund policies will apply based on the time of cancellation.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-6">
                      <AlertDialogCancel className="rounded-xl font-bold">KEEP BOOKING</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleCancelBooking}
                        disabled={cancelling}
                        className="bg-red-600 hover:bg-red-700 rounded-xl font-bold px-8"
                      >
                        {cancelling ? 'PROCESSING...' : 'YES, CANCEL'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              <Button onClick={handlePrint} variant="outline" size="sm" className="border-[#0d7377] text-[#0d7377] font-bold">
                <Download className="w-4 h-4 mr-2" />
                PRINT
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section with Status */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 bg-white p-8 rounded-[32px] shadow-sm">
           <div className="space-y-4">
              <div className="flex items-center gap-2">
                 <Badge className={`text-xs px-3 py-1 font-black uppercase tracking-widest ${
                   booking.status === 'confirmed' ? 'bg-green-600' :
                   booking.status === 'checked_in' ? 'bg-[#0d7377]' :
                   booking.status === 'checked_out' ? 'bg-gray-500' :
                   booking.status === 'pending_verification' ? 'bg-orange-500' :
                   'bg-red-500'
                 }`}>
                   {booking.status.replace('_', ' ')}
                 </Badge>
                 {booking.status === 'pending_verification' && (
                    <span className="text-[10px] font-bold text-orange-600 animate-pulse flex items-center gap-1">
                       <ShieldCheck className="w-3 h-3"/> PAYMENT VERIFICATION IN PROGRESS
                    </span>
                 )}
              </div>
              <h2 className="text-4xl font-black text-gray-800">{booking.room_type_name}</h2>
              <div className="flex items-center gap-6 text-sm font-bold text-muted-foreground">
                 <span className="flex items-center gap-2"><Calendar className="w-4 h-4"/> {new Date(booking.check_in).toLocaleDateString()} - {new Date(booking.check_out).toLocaleDateString()}</span>
                 <span className="flex items-center gap-2"><Users className="w-4 h-4"/> {booking.guests} Guests</span>
              </div>
           </div>
           
           <div className="bg-[#f0f9fa] p-4 rounded-2xl flex flex-col items-center justify-center border border-[#0d7377]/10 w-fit">
              <QrCode className="w-24 h-24 text-[#0d7377]" />
              <p className="text-[10px] font-black text-[#0d7377] mt-2 opacity-60">SCAN AT CHECK-IN</p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="md:col-span-2 space-y-8">
              <Card className="border-none shadow-sm rounded-[24px]">
                <CardHeader><CardTitle className="text-lg font-black uppercase tracking-widest text-[#0d7377]">Stay Details</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                   <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-1">
                         <p className="text-[10px] font-black text-muted-foreground uppercase">Check-in</p>
                         <p className="font-bold">{new Date(booking.check_in).toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}</p>
                         <p className="text-xs text-muted-foreground">After 12:00 PM</p>
                      </div>
                      <div className="space-y-1">
                         <p className="text-[10px] font-black text-muted-foreground uppercase">Check-out</p>
                         <p className="font-bold">{new Date(booking.check_out).toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}</p>
                         <p className="text-xs text-muted-foreground">Before 11:00 AM</p>
                      </div>
                   </div>
                   <div className="pt-6 border-t font-medium text-sm text-gray-700">
                      {booking.special_requests ? (
                         <div className="bg-muted/30 p-4 rounded-xl">
                            <p className="text-[10px] font-black text-muted-foreground uppercase mb-2">Special Requests</p>
                            "{booking.special_requests}"
                         </div>
                      ) : (
                         <p className="italic text-muted-foreground">No special requests provided</p>
                      )}
                   </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm rounded-[24px]">
                <CardHeader><CardTitle className="text-lg font-black uppercase tracking-widest text-[#0d7377]">Guest Information</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-muted-foreground uppercase">Primary Guest</p>
                      <p className="font-bold text-lg">{booking.customer_name}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-muted-foreground uppercase">Contact Info</p>
                      <p className="font-bold flex items-center gap-2 text-sm"><Phone className="w-3 h-3"/> {booking.customer_phone}</p>
                      <p className="font-medium flex items-center gap-2 text-xs text-muted-foreground"><Mail className="w-3 h-3"/> {booking.customer_email}</p>
                   </div>
                </CardContent>
              </Card>
           </div>

           <div className="space-y-8">
              <Card className="border-none shadow-xl rounded-[24px] bg-[#0d7377] text-white">
                <CardHeader><CardTitle className="text-lg font-black uppercase tracking-widest opacity-80">Payment Summary</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                   <div className="space-y-2 pb-4 border-b border-white/10">
                      <div className="flex justify-between text-sm">
                         <span className="opacity-70">Room Total</span>
                         <span className="font-bold">₹{(parseFloat(booking.total_amount) || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                         <span className="opacity-70">Advance Paid</span>
                         <span className="font-bold text-green-300">₹{(parseFloat(booking.paid_amount) || 0).toLocaleString()}</span>
                      </div>
                   </div>
                   <div className="pt-2">
                      <div className="flex justify-between items-center mb-1">
                         <span className="text-sm font-bold uppercase tracking-widest opacity-80">Total Due</span>
                         <span className="text-3xl font-black">₹{((parseFloat(booking.total_amount) || 0) - (parseFloat(booking.paid_amount) || 0)).toLocaleString()}</span>
                      </div>
                      <p className="text-[10px] font-bold opacity-60 uppercase">Payable at reception during check-in</p>
                   </div>
                   
                   <div className="bg-white/10 p-4 rounded-xl mt-6 space-y-2">
                      <div className="flex items-center gap-2 mb-1">
                         <CreditCard className="w-4 h-4 text-green-300" />
                         <span className="text-xs font-black uppercase">Transaction Audit</span>
                      </div>
                      <p className="text-[10px] font-mono opacity-80 break-all">{booking.transaction_id || 'N/A'}</p>
                      <Badge className="bg-white/20 text-white text-[9px] border-none font-black uppercase">
                         {booking.payment_status || 'PENDING'}
                      </Badge>
                   </div>
                </CardContent>
              </Card>
              
              <div className="bg-orange-50 p-6 rounded-[24px] border border-orange-200">
                 <h4 className="font-black text-orange-800 text-sm mb-2 uppercase flex items-center gap-2">
                    <MapPin className="w-4 h-4"/> Location
                 </h4>
                 <p className="text-xs font-bold text-orange-700/80 leading-relaxed capitalize">
                    Main Road, Near Ram Kund,<br/>Panchavati, Nashik - 422003
                 </p>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
}
