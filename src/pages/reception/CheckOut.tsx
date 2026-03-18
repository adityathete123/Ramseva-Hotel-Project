import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';

import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { ArrowLeft, CheckCircle, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ReceptionCheckOut() {
  const { id } = useParams();
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [extraCharges, setExtraCharges] = useState<{ description: string; amount: number }[]>([]);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchBooking();
  }, [id]);

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
        navigate('/reception');
      }
    } catch (error) {
      console.error('Failed to fetch booking:', error);
      toast.error('Failed to load booking');
    } finally {
      setLoading(false);
    }
  };

  const addExtraCharge = () => {
    setExtraCharges([...extraCharges, { description: '', amount: 0 }]);
  };

  const removeExtraCharge = (index: number) => {
    setExtraCharges(extraCharges.filter((_, i) => i !== index));
  };

  const updateExtraCharge = (index: number, field: string, value: any) => {
    const updated = [...extraCharges];
    updated[index] = { ...updated[index], [field]: value };
    setExtraCharges(updated);
  };

  const calculateFinalAmount = () => {
    if (!booking) return 0;
    const extra = extraCharges.reduce((sum, charge) => sum + (charge.amount || 0), 0);
    return (booking.total_price || 0) + extra - discount;
  };

  const handleCheckOut = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(
        `${apiUrl}/api/reception/check-out/${id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || accessToken}`,
          },
          body: JSON.stringify({ extraCharges, discount, notes }),
        }
      );

      if (response.ok) {
        toast.success('Guest checked out successfully');
        navigate('/reception');
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to check out');
      }
    } catch (error) {
      console.error('Check-out error:', error);
      toast.error('Failed to check out');
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
            <Button variant="ghost" size="sm" onClick={() => navigate('/reception')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-semibold">Check-out Guest</h1>
              <p className="text-sm text-muted-foreground">Booking ID: {booking.id}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Guest: {booking.customer_name}</CardTitle>
            <CardDescription className="text-base">
              Room {booking.room_number || 'N/A'} | {booking.room_type_name}
              <br />
              Check-in: {new Date(booking.check_in).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Booking Amount</span>
                <span className="font-semibold">₹{(booking.total_price || 0).toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Extra Charges</CardTitle>
              <Button onClick={addExtraCharge} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Charge
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {extraCharges.length > 0 ? (
              <div className="space-y-3">
                {extraCharges.map((charge, index) => (
                  <div key={index} className="flex gap-3">
                    <Input
                      placeholder="Description (e.g., Laundry, Mini bar)"
                      value={charge.description}
                      onChange={(e: any) => updateExtraCharge(index, 'description', e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={charge.amount || ''}
                      onChange={(e: any) => updateExtraCharge(index, 'amount', parseFloat(e.target.value) || 0)}
                      className="w-32"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeExtraCharge(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">No extra charges</p>
            )}
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Discount (Optional)</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="number"
              placeholder="Discount amount"
              value={discount || ''}
              onChange={(e: any) => setDiscount(parseFloat(e.target.value) || 0)}
            />
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Final Bill Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Original Booking Amount</span>
                <span>₹{(booking.total_price || 0).toLocaleString()}</span>
              </div>
              {extraCharges.map((charge, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{charge.description || `Extra Charge ${index + 1}`}</span>
                  <span>₹{(charge.amount || 0).toLocaleString()}</span>
                </div>
              ))}
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount Applied</span>
                  <span>-₹{discount.toLocaleString()}</span>
                </div>
              )}
              <div className="border-t pt-4 flex justify-between items-center mt-2">
                <span className="text-lg font-semibold">Total Payable</span>
                <span className="text-3xl font-bold text-[#0d7377]">
                  ₹{calculateFinalAmount().toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleCheckOut}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Check-out Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Any observations or final notes..."
                value={notes}
                onChange={(e: any) => setNotes(e.target.value)}
                rows={3}
              />
            </CardContent>
          </Card>

          <Button
            type="submit"
            className="w-full bg-[#0d7377] hover:bg-[#0a5c5f] text-lg py-6"
            disabled={processing}
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            {processing ? 'Processing...' : `Complete Check-out`}
          </Button>
        </form>
      </main>
    </div>
  );
}
