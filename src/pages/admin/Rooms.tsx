import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';

import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, Plus, Tag, Calendar, Layout, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminRooms() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoomTypes();
  }, [accessToken]);

  const fetchRoomTypes = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/rooms/types`);
      if (response.ok) {
        const result = await response.json();
        setRoomTypes(result.data || []);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load room types');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePrice = async (id: number, price: number) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/rooms/types/${id}/price`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || accessToken}`,
        },
        body: JSON.stringify({ basePrice: price }),
      });

      if (response.ok) {
        toast.success('Price updated successfully');
        fetchRoomTypes();
      }
    } catch (error) {
      toast.error('Failed to update price');
    }
  };

  const handleUpdateAvailability = async (id: number, rooms: number) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/rooms/types/${id}/availability`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || accessToken}`,
        },
        body: JSON.stringify({ totalRooms: rooms }),
      });

      if (response.ok) {
        toast.success('Availability updated');
        fetchRoomTypes();
      }
    } catch (error) {
      toast.error('Failed to update availability');
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
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-xl font-semibold text-[#0d7377]">Manage Room Categories</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold mb-1">Room Types & Pricing</h2>
            <p className="text-lg text-muted-foreground">Configure categories, base pricing, and total rooms.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {roomTypes.map((type) => (
            <Card key={type.id} className="overflow-hidden border-2 hover:border-[#0d7377]/20 transition-all">
              <div className="grid grid-cols-1 md:grid-cols-12">
                <div className="md:col-span-4 bg-[#0d7377]/5 p-6 border-r flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-2">
                    <Layout className="w-5 h-5 text-[#0d7377]" />
                    <h3 className="text-2xl font-bold">{type.name}</h3>
                  </div>
                  <p className="text-muted-foreground mb-4">{type.description}</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-white">Max Guests: {type.max_occupancy}</Badge>
                      <Badge variant="outline" className="bg-white font-semibold text-[#0d7377]">Base Price: ₹{type.base_price}</Badge>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-4 bg-white hover:bg-[#0d7377] hover:text-white border-[#0d7377]/20 text-[#0d7377] font-bold"
                      onClick={() => navigate(`/admin/rooms/${type.id}/images`)}
                    >
                      <ImageIcon className="w-4 h-4 mr-2" />
                      MANAGE GALLERY
                    </Button>
                  </div>
                </div>

                <div className="md:col-span-8 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Base Price (₹)</Label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          defaultValue={type.base_price}
                          onBlur={(e: any) => handleUpdatePrice(type.id, parseFloat(e.target.value))}
                          className="font-semibold text-lg"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Total Rooms</Label>
                      <Input
                        type="number"
                        defaultValue={type.total_rooms}
                        onBlur={(e: any) => handleUpdateAvailability(type.id, parseInt(e.target.value))}
                        className="font-semibold text-lg"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Current Active Rooms</Label>
                      <div className="h-10 flex items-center px-3 bg-muted rounded-md font-bold text-[#0d7377]">
                        {type.total_rooms_count || 0} Rooms defined
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Tag className="w-4 h-4 text-[#0d7377]" />
                        Active Discount
                      </h4>
                      {type.discount_percentage > 0 ? (
                        <div className="bg-green-50 p-4 rounded-lg border border-green-100 flex justify-between items-center">
                          <div>
                            <p className="text-green-800 font-bold text-lg">{type.discount_percentage}% OFF</p>
                            <p className="text-xs text-green-600">
                              {new Date(type.discount_start_date).toLocaleDateString()} - {new Date(type.discount_end_date).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className="bg-green-600">ACTIVE</Badge>
                        </div>
                      ) : (
                        <div className="bg-muted/50 p-4 rounded-lg border border-dashed text-center">
                          <p className="text-sm text-muted-foreground">No active discount</p>
                          <Button variant="link" size="sm" className="text-[#0d7377] p-0 h-auto mt-1" onClick={() => navigate(`/admin/rooms/${type.id}/discount`)}>Set Discount</Button>
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#0d7377]" />
                        Seasonal Pricing
                      </h4>
                      <div className="bg-muted/50 p-4 rounded-lg border border-dashed text-center">
                        <p className="text-sm text-muted-foreground">Manage Kumbh/Seasonal rates</p>
                        <Button variant="link" size="sm" className="text-[#0d7377] p-0 h-auto mt-1" onClick={() => navigate(`/admin/rooms/${type.id}/seasonal`)}>Configure Rules</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {roomTypes.length === 0 && (
            <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed">
              <Plus className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-xl font-medium">No Room Categories Defined</p>
              <p className="text-muted-foreground mt-2">Initialize the system or add categories to see them here.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}