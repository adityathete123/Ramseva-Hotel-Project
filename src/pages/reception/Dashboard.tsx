import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';

import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Hotel, LogOut, CheckCircle2, Users, Bed, FileText, CheckSquare, CalendarPlus, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Guest {
  id: string;
  name: string;
  roomNumber: string;
  roomCategory: 'General' | 'Standard' | 'Deluxe';
  checkInDate: string;
  checkOutDate: string;
  status: 'Active' | 'Checked Out';
  phone: string;
  guests: number;
  nights: number;
  pricePerNight: number;
}

export default function ReceptionDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [showBillModal, setShowBillModal] = useState(false);

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayCheckIns: 0,
    totalCheckIns: 0,
    availableRooms: 0
  });

  const [guests, setGuests] = useState<Guest[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reception/bookings`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        const { bookings, stats: dashboardStats } = result.data;
        
        // Map backend bookings to Guest interface
        const mappedGuests: Guest[] = bookings.map((b: any) => {
          const checkIn = new Date(b.check_in);
          const checkOut = new Date(b.check_out);
          const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

          return {
            id: b.id,
            name: b.customer_name || 'Guest',
            roomNumber: b.room_number || 'N/A',
            roomCategory: b.room_type_name || 'Standard',
            checkInDate: b.check_in,
            checkOutDate: b.check_out,
            status: b.status === 'checked_in' ? 'Active' : (b.status === 'checked_out' ? 'Checked Out' : b.status),
            phone: b.customer_phone || '',
            guests: b.guests_count || 1,
            nights: diffDays,
            pricePerNight: b.total_price / diffDays
          };
        });

        setGuests(mappedGuests);
        setStats(dashboardStats);
      } else {
        toast.error('Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Fetch dashboard error:', error);
      toast.error('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    toast.success('Signed out successfully');
  };

  const handleCheckOut = async (guest: Guest) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reception/check-out/${guest.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        toast.success(`${guest.name} checked out successfully`);
        fetchDashboardData();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Check-out failed');
      }
    } catch (error) {
      toast.error('Check-out failed');
    }
  };

  const handleExtendStay = (guest: Guest) => {
    toast.success(`Extend stay request for ${guest.name} in Room ${guest.roomNumber}`);
  };

  const handleCancelBooking = async (guest: Guest) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/bookings/${guest.id}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        toast.success(`Booking cancelled for ${guest.name}`);
        fetchDashboardData();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Cancellation failed');
      }
    } catch (error) {
      toast.error('Cancellation failed');
    }
  };

  const handleGenerateBill = (guest: Guest) => {
    setSelectedGuest(guest);
    setShowBillModal(true);
  };

  const handleSendBill = () => {
    setShowBillModal(false);
    toast.success('Bill sent to customer via SMS/WhatsApp');
  };

  const calculateBill = (guest: Guest) => {
    const roomCharges = guest.nights * guest.pricePerNight;
    const gst = roomCharges * 0.12; // 12% GST
    const total = roomCharges + gst;
    return { roomCharges, gst, total };
  };

  const activeGuests = guests.filter(g => g.status === 'Active');

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      {/* Header - Identical to Admin Portal */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Hotel className="w-8 h-8 text-[#0d7377]" />
              <div>
                <h1 className="text-xl font-semibold text-[#0d7377]">Panchavati Hotel</h1>
                <p className="text-sm text-muted-foreground">Reception Desk</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">Receptionist</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="border-[#0d7377] text-[#0d7377] hover:bg-[#0d7377] hover:text-white"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Receptionist Dashboard</h2>
          <p className="text-lg text-muted-foreground">Front desk operations overview</p>
        </div>

        {/* Stats Cards - Same style as Admin Portal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Today's Check-ins</CardDescription>
              <CardTitle className="text-3xl text-[#0d7377]">
                {stats.todayCheckIns}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Check-ins</CardDescription>
              <CardTitle className="text-3xl text-[#0d7377]">
                {stats.totalCheckIns}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Available Rooms</CardDescription>
              <CardTitle className="text-3xl text-[#0d7377]">
                {stats.availableRooms}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Guest List Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Guest List</CardTitle>
            <CardDescription className="text-base">Current guest bookings and status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Guest Name</th>
                    <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Room Number</th>
                    <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Room Category</th>
                    <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Check-in Date</th>
                    <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Check-out Date</th>
                    <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {guests.map((guest) => (
                    <tr key={guest.id} className="border-b hover:bg-muted/50">
                      <td className="py-4 px-4">
                        <div className="font-medium">{guest.name}</div>
                        <div className="text-sm text-muted-foreground">{guest.phone}</div>
                      </td>
                      <td className="py-4 px-4 font-medium text-[#0d7377]">{guest.roomNumber}</td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className="capitalize">
                          {guest.roomCategory}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-sm">
                        {new Date(guest.checkInDate).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="py-4 px-4 text-sm">
                        {new Date(guest.checkOutDate).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="py-4 px-4">
                        <Badge
                          className={
                            guest.status === 'Active'
                              ? 'bg-green-600 hover:bg-green-700'
                              : 'bg-gray-500 hover:bg-gray-600'
                          }
                        >
                          {guest.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        {guest.status === 'Active' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleCheckOut(guest)}
                              className="bg-[#0d7377] hover:bg-[#0a5c5f] text-white"
                            >
                              <CheckSquare className="w-4 h-4 mr-1" />
                              Check-Out
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleExtendStay(guest)}
                              className="border-[#0d7377] text-[#0d7377] hover:bg-[#0d7377] hover:text-white"
                            >
                              <CalendarPlus className="w-4 h-4 mr-1" />
                              Extend Stay
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCancelBooking(guest)}
                              className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                            >
                              <X className="w-4 h-4 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Billing Section */}
        <Card>
          <CardHeader>
            <CardTitle>Generate Bill</CardTitle>
            <CardDescription className="text-base">Select a guest to generate and send their bill</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeGuests.map((guest) => (
                <div
                  key={guest.id}
                  className="flex items-center justify-between p-4 bg-muted rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium mb-1">{guest.name}</div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-muted-foreground">
                      <div>Room: {guest.roomNumber}</div>
                      <div>Category: {guest.roomCategory}</div>
                      <div>Nights: {guest.nights}</div>
                      <div>Rate: ₹{guest.pricePerNight}/night</div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleGenerateBill(guest)}
                    className="border-[#0d7377] text-[#0d7377] hover:bg-[#0d7377] hover:text-white ml-4"
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    Generate Bill
                  </Button>
                </div>
              ))}
              
              {activeGuests.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No active guests to bill
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Bill Modal */}
      {showBillModal && selectedGuest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Guest Bill</CardTitle>
                  <CardDescription className="text-base mt-1">Panchavati Hotel, Nashik</CardDescription>
                </div>
                <Hotel className="w-10 h-10 text-[#0d7377]" />
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Guest Details */}
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Guest Information</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span>
                    <p className="font-medium">{selectedGuest.name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phone:</span>
                    <p className="font-medium">{selectedGuest.phone}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Room Number:</span>
                    <p className="font-medium">{selectedGuest.roomNumber}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Category:</span>
                    <p className="font-medium">{selectedGuest.roomCategory}</p>
                  </div>
                </div>
              </div>

              {/* Bill Details */}
              <div className="space-y-3">
                <h3 className="font-semibold">Bill Details</h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">
                      Room Charges ({selectedGuest.nights} nights × ₹{selectedGuest.pricePerNight})
                    </span>
                    <span className="font-medium">₹{calculateBill(selectedGuest).roomCharges.toLocaleString('en-IN')}</span>
                  </div>
                  
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">GST (12%)</span>
                    <span className="font-medium">₹{calculateBill(selectedGuest).gst.toLocaleString('en-IN')}</span>
                  </div>
                  
                  <div className="flex justify-between py-3 bg-[#0d7377] text-white px-4 rounded-lg mt-2">
                    <span className="font-semibold">Total Amount</span>
                    <span className="text-xl font-bold">₹{calculateBill(selectedGuest).total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleSendBill}
                  className="flex-1 bg-[#0d7377] hover:bg-[#0a5c5f] text-white"
                >
                  Send via SMS / WhatsApp
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowBillModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>

              {/* Confirmation Message */}
              <p className="text-sm text-muted-foreground text-center italic">
                Bill and room details will be sent to customer via SMS / WhatsApp
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}