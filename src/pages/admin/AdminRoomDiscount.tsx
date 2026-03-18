import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';

import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { ArrowLeft, Tag, Calendar, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminRoomDiscount() {
  const { id } = useParams();
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const [roomType, setRoomType] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    discount_percentage: 0,
    discount_start_date: '',
    discount_end_date: ''
  });

  useEffect(() => {
    fetchRoomType();
  }, [id, accessToken]);

  const fetchRoomType = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/rooms/types/${id}`);
      if (response.ok) {
        const result = await response.json();
        setRoomType(result.data);
        setFormData({
          discount_percentage: result.data.discount_percentage || 0,
          discount_start_date: result.data.discount_start_date ? new Date(result.data.discount_start_date).toISOString().split('T')[0] : '',
          discount_end_date: result.data.discount_end_date ? new Date(result.data.discount_end_date).toISOString().split('T')[0] : ''
        });
      } else {
        toast.error('Room type not found');
        navigate('/admin/rooms');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/rooms/types/${id}/discount`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || accessToken}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Discount updated successfully');
        navigate('/admin/rooms');
      } else {
        const result = await response.json();
        toast.error(result.message || 'Failed to update discount');
      }
    } catch (error) {
      console.error(error);
      toast.error('Connection error');
    } finally {
      setSaving(false);
    }
  };

  const handleClearDiscount = async () => {
    setSaving(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/rooms/types/${id}/discount`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || accessToken}`,
        },
        body: JSON.stringify({
          discount_percentage: 0,
          discount_start_date: null,
          discount_end_date: null
        }),
      });

      if (response.ok) {
        toast.success('Discount cleared');
        navigate('/admin/rooms');
      }
    } catch (error) {
       toast.error('Failed to clear discount');
    } finally {
       setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0d7377]"></div></div>;

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/rooms')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            BACK
          </Button>
          <h1 className="text-xl font-black text-[#0d7377] italic tracking-tighter">DISCOUNT MANAGER</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-10 text-center">
            <h2 className="text-4xl font-black text-gray-900 mb-2 italic uppercase">{roomType.name}</h2>
            <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs">Set promotional offers for this category</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
            <Card className="rounded-[32px] overflow-hidden border-none shadow-2xl bg-white">
                <CardHeader className="bg-gray-50 border-b p-8">
                    <CardTitle className="flex items-center gap-3 text-2xl font-black italic">
                        <Tag className="w-6 h-6 text-[#0d7377]" />
                        PROMOTION DETAILS
                    </CardTitle>
                    <CardDescription className="font-bold text-gray-500 uppercase text-xs tracking-widest">Configure percentage and validity period</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                    <div className="space-y-3">
                        <Label className="text-sm font-black text-gray-700 uppercase tracking-wider flex items-center gap-2">
                             Percentage Off (%)
                        </Label>
                        <div className="relative group">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-gray-400 group-focus-within:text-[#0d7377] transition-colors">%</span>
                            <Input 
                                type="number"
                                min="0"
                                max="100"
                                value={formData.discount_percentage}
                                onChange={(e) => setFormData({...formData, discount_percentage: parseFloat(e.target.value)})}
                                className="pl-12 h-16 text-3xl font-black border-2 border-gray-100 focus:border-[#0d7377] focus:ring-0 rounded-2xl transition-all"
                                placeholder="0"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <Label className="text-sm font-black text-gray-700 uppercase tracking-wider flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-primary" />
                                Start Date
                            </Label>
                            <Input 
                                type="date"
                                value={formData.discount_start_date}
                                onChange={(e) => setFormData({...formData, discount_start_date: e.target.value})}
                                className="h-14 font-bold border-2 border-gray-100 focus:border-[#0d7377] rounded-xl"
                                required={formData.discount_percentage > 0}
                            />
                        </div>
                        <div className="space-y-3">
                            <Label className="text-sm font-black text-gray-700 uppercase tracking-wider flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-primary" />
                                End Date
                            </Label>
                            <Input 
                                type="date"
                                value={formData.discount_end_date}
                                onChange={(e) => setFormData({...formData, discount_end_date: e.target.value})}
                                className="h-14 font-bold border-2 border-gray-100 focus:border-[#0d7377] rounded-xl"
                                required={formData.discount_percentage > 0}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex flex-col md:flex-row gap-4">
                <Button 
                    type="submit" 
                    disabled={saving}
                    className="flex-1 h-16 rounded-2xl bg-[#0d7377] hover:bg-[#0a5d61] text-lg font-black italic shadow-xl shadow-[#0d7377]/20 transition-all hover:scale-[1.02]"
                >
                    <Save className="w-5 h-5 mr-3" />
                    SAVE PROMOTION
                </Button>
                
                {roomType.discount_percentage > 0 && (
                    <Button 
                        type="button" 
                        variant="outline"
                        onClick={handleClearDiscount}
                        disabled={saving}
                        className="h-16 px-8 rounded-2xl border-2 border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200 font-bold transition-all"
                    >
                        <Trash2 className="w-5 h-5 mr-2" />
                        CLEAR
                    </Button>
                )}
            </div>
        </form>
      </main>
    </div>
  );
}
