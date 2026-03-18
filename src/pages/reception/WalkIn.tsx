import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';

import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ReceptionWalkIn() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    roomTypeId: '',
    checkIn: new Date().toISOString().split('T')[0],
    checkOut: '',
    rooms: 1,
    guests: 2,
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    idType: 'aadhaar',
    idNumber: '',
    address: '',
    specialRequests: '',
    paymentMethod: 'cash',
  });

  useEffect(() => {
    fetchRoomTypes();
  }, []);

  const fetchRoomTypes = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/rooms/types`);
      if (response.ok) {
        const result = await response.json();
        setRoomTypes(result.data || []);
        if (result.data && result.data.length > 0) {
          setFormData(prev => ({ ...prev, roomTypeId: result.data[0].id.toString() }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch room types:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    const type = roomTypes.find(rt => rt.id.toString() === formData.roomTypeId);
    if (!type || !formData.checkOut) return 0;
    
    const checkInDate = new Date(formData.checkIn);
    const checkOutDate = new Date(formData.checkOut);
    const diff = checkOutDate.getTime() - checkInDate.getTime();
    const nights = Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    
    return type.base_price * nights * formData.rooms;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    const totalAmount = calculateTotal();

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const bodyPayload = {
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        idType: formData.idType,
        idNumber: formData.idNumber,
        address: formData.address,
        roomTypeId: parseInt(formData.roomTypeId),
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        guests: formData.guests,
        roomsBooked: formData.rooms,
        totalAmount: totalAmount,
        specialRequests: formData.specialRequests
      };

      const response = await fetch(
        `${apiUrl}/api/reception/walk-in`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || accessToken}`,
          },
          body: JSON.stringify(bodyPayload),
        }
      );

      if (response.ok) {
        toast.success('Walk-in booking created successfully');
        navigate('/reception');
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Walk-in booking error:', error);
      toast.error('Failed to create booking');
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
              <h1 className="text-xl font-semibold text-[#0d7377]">Walk-in Booking</h1>
              <p className="text-sm text-muted-foreground">Create booking for guests with no reservation</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Guest Information</CardTitle>
            <CardDescription className="text-base">Enter walk-in guest details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Guest Name *</Label>
                  <Input
                    value={formData.customerName}
                    onChange={(e: any) => setFormData({ ...formData, customerName: e.target.value })}
                    required
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone *</Label>
                  <Input
                    value={formData.customerPhone}
                    onChange={(e: any) => setFormData({ ...formData, customerPhone: e.target.value })}
                    required
                    placeholder="10 digit mobile number"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email (Optional)</Label>
                  <Input
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e: any) => setFormData({ ...formData, customerEmail: e.target.value })}
                    placeholder="guest@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>ID Type *</Label>
                  <Select
                    value={formData.idType}
                    onValueChange={(value) => setFormData({ ...formData, idType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aadhaar">Aadhaar</SelectItem>
                      <SelectItem value="passport">Passport</SelectItem>
                      <SelectItem value="driving_license">Driving License</SelectItem>
                      <SelectItem value="pan_card">PAN Card</SelectItem>
                      <SelectItem value="voter_id">Voter ID</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>ID Number *</Label>
                  <Input
                    value={formData.idNumber}
                    onChange={(e: any) => setFormData({ ...formData, idNumber: e.target.value })}
                    required
                    placeholder="Enter ID proof number"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Address (Optional)</Label>
                  <Input
                    value={formData.address}
                    onChange={(e: any) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Guest city/address"
                  />
                </div>
              </div>

              <div className="border-t pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Room Type *</Label>
                  <Select
                    value={formData.roomTypeId}
                    onValueChange={(value) => setFormData({ ...formData, roomTypeId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roomTypes.map(rt => (
                        <SelectItem key={rt.id} value={rt.id.toString()}>
                          {rt.name} (₹{rt.base_price})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Check-in Date *</Label>
                  <Input
                    type="date"
                    value={formData.checkIn}
                    onChange={(e: any) => setFormData({ ...formData, checkIn: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Check-out Date *</Label>
                  <Input
                    type="date"
                    value={formData.checkOut}
                    onChange={(e: any) => setFormData({ ...formData, checkOut: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Number of Rooms *</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.rooms}
                    onChange={(e: any) => setFormData({ ...formData, rooms: parseInt(e.target.value) || 1 })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Total Guests *</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.guests}
                    onChange={(e: any) => setFormData({ ...formData, guests: parseInt(e.target.value) || 1 })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Special Requests</Label>
                <Textarea
                  value={formData.specialRequests}
                  onChange={(e: any) => setFormData({ ...formData, specialRequests: e.target.value })}
                  placeholder="Any special requests or instructions..."
                  rows={2}
                />
              </div>

              <div className="bg-[#0d7377]/5 p-6 rounded-xl border border-[#0d7377]/20 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                  <p className="text-[#0d7377] font-medium">Estimated Total Amount</p>
                  <p className="text-3xl font-bold text-[#0d7377]">₹{calculateTotal().toLocaleString()}</p>
                </div>
                
                <Button
                  type="submit"
                  className="w-full md:w-auto bg-[#0d7377] hover:bg-[#0a5c5f] text-lg px-8 py-6"
                  disabled={processing}
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  {processing ? 'Creating...' : 'Create Booking & Check-in'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}