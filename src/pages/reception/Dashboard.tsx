import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';

import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Hotel, LogOut, CheckCircle2, Bed, FileText, CheckSquare, CalendarPlus, X,
  Clock, AlertCircle, Users, RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';

const API = () => import.meta.env.VITE_API_URL || 'http://localhost:5000';
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

export default function ReceptionDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'today' | 'pending'>('all');

  const [stats, setStats] = useState({ todayCheckIns: 0, totalCheckIns: 0, availableRooms: 0 });
  const [bookings, setBookings] = useState<any[]>([]);
  const [todayCheckIns, setTodayCheckIns] = useState<any[]>([]);
  const [pendingBookings, setPendingBookings] = useState<any[]>([]);

  // Extend Stay Modal
  const [extendModal, setExtendModal] = useState<{ open: boolean; booking: any | null }>({ open: false, booking: null });
  const [newCheckOut, setNewCheckOut] = useState('');
  const [extending, setExtending] = useState(false);

  // Bill Modal
  const [selectedGuest, setSelectedGuest] = useState<any | null>(null);
  const [showBillModal, setShowBillModal] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [dashRes, todayRes, pendingRes] = await Promise.all([
        fetch(`${API()}/api/reception/bookings`, { headers: authHeader() }),
        fetch(`${API()}/api/reception/today-checkins`, { headers: authHeader() }),
        fetch(`${API()}/api/reception/pending`, { headers: authHeader() }),
      ]);

      if (dashRes.ok) {
        const { data } = await dashRes.json();
        setBookings(data.bookings || []);
        setStats(data.stats || { todayCheckIns: 0, totalCheckIns: 0, availableRooms: 0 });
      }
      if (todayRes.ok) {
        const { data } = await todayRes.json();
        setTodayCheckIns(data || []);
      }
      if (pendingRes.ok) {
        const { data } = await pendingRes.json();
        setPendingBookings(data || []);
      }
    } catch (err) {
      toast.error('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => { await signOut(); navigate('/'); };

  const handleCheckOut = async (booking: any) => {
    try {
      const res = await fetch(`${API()}/api/reception/check-out/${booking.id}`, {
        method: 'POST', headers: authHeader()
      });
      if (res.ok) { toast.success(`${booking.customer_name} checked out`); fetchAll(); }
      else { const e = await res.json(); toast.error(e.message || 'Check-out failed'); }
    } catch { toast.error('Check-out failed'); }
  };

  const handleCancelBooking = async (booking: any) => {
    try {
      const res = await fetch(`${API()}/api/bookings/${booking.id}/cancel`, {
        method: 'POST', headers: authHeader()
      });
      if (res.ok) { toast.success('Booking cancelled'); fetchAll(); }
      else { const e = await res.json(); toast.error(e.message || 'Cancellation failed'); }
    } catch { toast.error('Cancellation failed'); }
  };

  const openExtendModal = (booking: any) => {
    setExtendModal({ open: true, booking });
    // Default to 1 day beyond current checkout
    const next = new Date(booking.check_out);
    next.setDate(next.getDate() + 1);
    setNewCheckOut(next.toISOString().split('T')[0]);
  };

  const handleExtendStay = async () => {
    if (!extendModal.booking || !newCheckOut) return;
    setExtending(true);
    try {
      const res = await fetch(`${API()}/api/reception/extend-stay/${extendModal.booking.id}`, {
        method: 'PUT',
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ newCheckOut })
      });
      const result = await res.json();
      if (res.ok) {
        toast.success(`Stay extended to ${new Date(newCheckOut).toLocaleDateString('en-IN')}`);
        setExtendModal({ open: false, booking: null });
        fetchAll();
      } else {
        toast.error(result.message || 'Failed to extend stay');
      }
    } catch { toast.error('Failed to extend stay'); }
    finally { setExtending(false); }
  };

  const handleVerifyPayment = async (bookingId: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch(`${API()}/api/payment/verify/${bookingId}`, {
        method: 'POST',
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      const result = await res.json();
      if (res.ok) {
        toast.success(result.message);
        fetchAll();
      } else {
        toast.error(result.message || 'Action failed');
      }
    } catch { toast.error('Action failed'); }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      confirmed: 'bg-green-600',
      checked_in: 'bg-blue-600',
      checked_out: 'bg-gray-500',
      pending_verification: 'bg-orange-500',
      pending: 'bg-yellow-600',
      cancelled: 'bg-red-500',
    };
    return (
      <Badge className={`${map[status] || 'bg-gray-400'} capitalize text-white`}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const currentList = activeTab === 'today' ? todayCheckIns : activeTab === 'pending' ? pendingBookings : bookings;

  const columns = ['Guest', 'Room Type', 'Check-in', 'Check-out', 'Status', 'Actions'];

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      {/* Header */}
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/reception/walk-in')}
                className="border-[#0d7377] text-[#0d7377] hover:bg-[#0d7377] hover:text-white"
              >
                + Walk-in
              </Button>
              <div className="text-right">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">Receptionist</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut}
                className="border-[#0d7377] text-[#0d7377] hover:bg-[#0d7377] hover:text-white">
                <LogOut className="w-4 h-4 mr-2" /> Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Receptionist Dashboard</h2>
          <p className="text-muted-foreground">Front desk operations overview</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('today')}>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2"><Clock className="w-4 h-4" /> Today's Check-ins</CardDescription>
              <CardTitle className="text-3xl text-[#0d7377]">{stats.todayCheckIns}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2"><Users className="w-4 h-4" /> Total Check-ins</CardDescription>
              <CardTitle className="text-3xl text-[#0d7377]">{stats.totalCheckIns}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2"><Bed className="w-4 h-4" /> Available Rooms</CardDescription>
              <CardTitle className="text-3xl text-[#0d7377]">{stats.availableRooms}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Pending Verification Banner */}
        {pendingBookings.length > 0 && (
          <div
            className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-center justify-between gap-4 cursor-pointer hover:bg-orange-100 transition-colors"
            onClick={() => setActiveTab('pending')}
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-orange-800">{pendingBookings.length} booking{pendingBookings.length > 1 ? 's' : ''} awaiting payment verification</p>
                <p className="text-sm text-orange-600">Click to review and approve/reject</p>
              </div>
            </div>
            <Badge className="bg-orange-500 text-white px-3">{pendingBookings.length}</Badge>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {(['all', 'today', 'pending'] as const).map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab(tab)}
              className={activeTab === tab ? 'bg-[#0d7377] hover:bg-[#0a5c5f]' : 'border-[#0d7377] text-[#0d7377] hover:bg-[#0d7377] hover:text-white'}
            >
              {tab === 'all' && 'All Bookings'}
              {tab === 'today' && `Today's Check-ins (${todayCheckIns.length})`}
              {tab === 'pending' && `Pending Verification (${pendingBookings.length})`}
            </Button>
          ))}
        </div>

        {/* Bookings Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>
              {activeTab === 'all' && 'Guest List'}
              {activeTab === 'today' && "Today's Check-ins"}
              {activeTab === 'pending' && 'Awaiting Payment Verification'}
            </CardTitle>
            <CardDescription>
              {activeTab === 'pending' && 'Verify UPI transaction IDs and approve or reject bookings'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading...</div>
            ) : currentList.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {activeTab === 'today' ? 'No check-ins scheduled for today' :
                 activeTab === 'pending' ? 'No pending verifications 🎉' :
                 'No bookings found'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Guest</th>
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Room Type</th>
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Check-in</th>
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Check-out</th>
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentList.map((b: any) => (
                      <tr key={b.id} className="border-b hover:bg-muted/50">
                        <td className="py-4 px-4">
                          <div className="font-medium">{b.customer_name || 'Guest'}</div>
                          <div className="text-sm text-muted-foreground">{b.customer_phone}</div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant="outline">{b.room_type_name || '—'}</Badge>
                        </td>
                        <td className="py-4 px-4 text-sm">
                          {new Date(b.check_in).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="py-4 px-4 text-sm">
                          {new Date(b.check_out).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="py-4 px-4">{statusBadge(b.status)}</td>
                        <td className="py-4 px-4">
                          <div className="flex flex-wrap gap-2">

                            {/* Pending verification actions */}
                            {b.status === 'pending_verification' && (
                              <>
                                {b.payment?.transaction_id && (
                                  <div className="text-xs text-muted-foreground mb-1 w-full">
                                    UTR: <span className="font-mono font-bold">{b.payment.transaction_id}</span>
                                  </div>
                                )}
                                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white"
                                  onClick={() => handleVerifyPayment(b.id, 'approve')}>
                                  <CheckCircle2 className="w-3 h-3 mr-1" /> Approve
                                </Button>
                                <Button size="sm" variant="outline" className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                                  onClick={() => handleVerifyPayment(b.id, 'reject')}>
                                  <X className="w-3 h-3 mr-1" /> Reject
                                </Button>
                              </>
                            )}

                            {/* Confirmed booking — can check-in */}
                            {b.status === 'confirmed' && (
                              <Button size="sm" onClick={() => navigate(`/reception/check-in/${b.id}`)}
                                className="bg-[#0d7377] hover:bg-[#0a5c5f] text-white">
                                <CheckSquare className="w-3 h-3 mr-1" /> Check-in
                              </Button>
                            )}

                            {/* Checked-in — can check-out or extend stay */}
                            {b.status === 'checked_in' && (
                              <>
                                <Button size="sm" onClick={() => handleCheckOut(b)}
                                  className="bg-[#0d7377] hover:bg-[#0a5c5f] text-white">
                                  <CheckSquare className="w-3 h-3 mr-1" /> Check-out
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => openExtendModal(b)}
                                  className="border-[#0d7377] text-[#0d7377] hover:bg-[#0d7377] hover:text-white">
                                  <CalendarPlus className="w-3 h-3 mr-1" /> Extend
                                </Button>
                              </>
                            )}

                            {/* Cancel — for confirmed & pending */}
                            {['confirmed', 'pending_verification', 'pending'].includes(b.status) && (
                              <Button size="sm" variant="outline" onClick={() => handleCancelBooking(b)}
                                className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
                                <X className="w-3 h-3 mr-1" /> Cancel
                              </Button>
                            )}

                            {/* View details */}
                            <Button size="sm" variant="ghost" onClick={() => navigate(`/reception/bookings/${b.id}`)}>
                              <FileText className="w-3 h-3 mr-1" /> View
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Extend Stay Modal */}
      {extendModal.open && extendModal.booking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Extend Stay</CardTitle>
                  <CardDescription>
                    {extendModal.booking.customer_name} · Current checkout:{' '}
                    {new Date(extendModal.booking.check_out).toLocaleDateString('en-IN')}
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setExtendModal({ open: false, booking: null })}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-muted-foreground">New Check-out Date</Label>
                <Input
                  type="date"
                  value={newCheckOut}
                  min={new Date(extendModal.booking.check_out).toISOString().split('T')[0]}
                  onChange={(e: any) => setNewCheckOut(e.target.value)}
                  className="border-[#0d7377]"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  className="flex-1 bg-[#0d7377] hover:bg-[#0a5c5f]"
                  onClick={handleExtendStay}
                  disabled={extending || !newCheckOut}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {extending ? 'Extending...' : 'Confirm Extension'}
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => setExtendModal({ open: false, booking: null })}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}