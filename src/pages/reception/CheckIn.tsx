import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';

import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ReceptionCheckIn() {
  const { id } = useParams();
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState({
    roomNumber: '',
    notes: '',
  });

  useEffect(() => {
    fetchBooking();
  }, [id]);

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
        toast.error('Booking not found');
        navigate('/reception');
      }
    } catch (error) {
      console.error('Failed to fetch booking:', error);
      toast.error('Failed to load booking');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(
        `${apiUrl}/api/reception/check-in/${id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || accessToken}`,
          },
          body: JSON.stringify({
            room_number: formData.roomNumber,
            notes: formData.notes
          }),
        }
      );

      if (response.ok) {
        toast.success('Guest checked in successfully');
        navigate('/reception');
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to check in');
      }
    } catch (error) {
      console.error('Check-in error:', error);
      toast.error('Failed to check in');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0d7377]"></div>
      </div>
    );
  }

  if (!booking) return null;

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/reception')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-semibold">Check-in Guest</h1>
              <p className="text-sm text-muted-foreground">Booking ID: {booking.id}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Guest Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Guest Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Guest Name</p>
                  <p className="font-semibold text-lg">{booking.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{booking.customer_phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{booking.customer_email}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">ID Type</p>
                  <p className="font-medium">{booking.id_proof_type}: {booking.id_proof_number}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Number of Guests</p>
                  <p className="font-medium">{booking.guests_count}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Booking Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Booking Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Room Type</p>
                <p className="font-semibold">{booking.room_type_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Check-in</p>
                <p className="font-semibold">{new Date(booking.check_in).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Check-out</p>
                <p className="font-semibold">{new Date(booking.check_out).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="font-semibold text-[#0d7377]">₹{(booking.total_price || 0).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Check-in Form */}
        <Card>
          <CardHeader>
            <CardTitle>Check-in Details</CardTitle>
            <CardDescription className="text-base">
              Assign room and complete check-in
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCheckIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="roomNumber">Room Number *</Label>
                <Input
                  id="roomNumber"
                  type="text"
                  placeholder="e.g., 101, 201, etc."
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Check-in Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional notes or observations..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-[#0d7377] hover:bg-[#0a5c5f] text-lg py-6"
                disabled={processing}
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                {processing ? 'Processing...' : 'Complete Check-in'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
