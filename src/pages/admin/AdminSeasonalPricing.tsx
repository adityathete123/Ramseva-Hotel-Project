import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';

import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { ArrowLeft, Plus, Trash2, Calendar, TrendingUp, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSeasonalPricing() {
  const { id } = useParams();
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const [roomType, setRoomType] = useState<any>(null);
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const [newRule, setNewRule] = useState({
    name: '',
    start_date: '',
    end_date: '',
    price_multiplier: 1.0,
    fixed_price: '',
    priority: 0
  });

  useEffect(() => {
    fetchData();
  }, [id, accessToken]);

  const fetchData = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const [typeRes, rulesRes] = await Promise.all([
        fetch(`${apiUrl}/api/rooms/types/${id}`),
        fetch(`${apiUrl}/api/rooms/types/${id}/seasonal`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || accessToken}` }
        })
      ]);

      if (typeRes.ok && rulesRes.ok) {
        const typeData = await typeRes.json();
        const rulesData = await rulesRes.json();
        setRoomType(typeData.data);
        setRules(rulesData.data || []);
      }
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/rooms/types/${id}/seasonal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || accessToken}`,
        },
        body: JSON.stringify(newRule),
      });

      if (response.ok) {
        toast.success('Seasonal rule added');
        setNewRule({ name: '', start_date: '', end_date: '', price_multiplier: 1.0, fixed_price: '', priority: 0 });
        fetchData();
      } else {
        const res = await response.json();
        toast.error(res.message || 'Failed to add rule');
      }
    } catch (error) {
      toast.error('Connection error');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteRule = async (ruleId: number) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/rooms/seasonal/${ruleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || accessToken}`,
        },
      });

      if (response.ok) {
        toast.success('Rule deleted');
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to delete rule');
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0d7377]"></div></div>;

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
           <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate('/admin/rooms')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    BACK
                </Button>
                <div>
                    <h1 className="text-lg font-bold text-gray-900 leading-none uppercase tracking-tighter italic">SEASONAL PRICING</h1>
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">{roomType?.name}</p>
                </div>
           </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* ADD RULE FORM */}
            <div className="lg:col-span-5">
                <Card className="rounded-[32px] overflow-hidden border-none shadow-2xl bg-[#0d7377] text-white">
                    <CardHeader className="p-8 pb-4">
                        <CardTitle className="text-3xl font-black italic uppercase">ADD NEW RULE</CardTitle>
                        <CardDescription className="text-emerald-100/70 font-bold text-xs uppercase tracking-widest">Define date range and pricing logic</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 pt-4">
                        <form onSubmit={handleAddRule} className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-emerald-100/80">EVENT NAME</Label>
                                <Input 
                                    value={newRule.name}
                                    onChange={(e) => setNewRule({...newRule, name: e.target.value})}
                                    className="bg-white/10 border-white/20 text-white placeholder:text-white/30 h-12 font-bold"
                                    placeholder="e.g. Kumbh Mela Peak"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-emerald-100/80">START DATE</Label>
                                    <Input 
                                        type="date"
                                        value={newRule.start_date}
                                        onChange={(e) => setNewRule({...newRule, start_date: e.target.value})}
                                        className="bg-white/10 border-white/20 text-white h-12 font-bold"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-emerald-100/80">END DATE</Label>
                                    <Input 
                                        type="date"
                                        value={newRule.end_date}
                                        onChange={(e) => setNewRule({...newRule, end_date: e.target.value})}
                                        className="bg-white/10 border-white/20 text-white h-12 font-bold"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-emerald-100/80 font-flex">MULTIPLIER (x)</Label>
                                    <Input 
                                        type="number"
                                        step="0.1"
                                        value={newRule.price_multiplier}
                                        onChange={(e) => setNewRule({...newRule, price_multiplier: parseFloat(e.target.value)})}
                                        className="bg-white/10 border-white/20 text-white h-12 font-bold text-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-emerald-100/80">FIXED PRICE (₹)</Label>
                                    <Input 
                                        type="number"
                                        value={newRule.fixed_price}
                                        onChange={(e) => setNewRule({...newRule, fixed_price: e.target.value})}
                                        className="bg-white/10 border-white/20 text-white h-12 font-bold text-xl"
                                        placeholder="Optional"
                                    />
                                </div>
                            </div>

                            <Button disabled={adding} type="submit" className="w-full h-14 bg-white text-[#0d7377] hover:bg-emerald-50 font-black italic uppercase rounded-2xl transition-all shadow-xl">
                                <Plus className="w-5 h-5 mr-2" />
                                ACTIVATE RULE
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>

            {/* RULE LIST */}
            <div className="lg:col-span-7">
                <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-2xl font-black italic uppercase text-gray-900">ACTIVE RULES</h3>
                    <Badge variant="outline" className="font-bold border-2">{rules.length} CONFIGURED</Badge>
                </div>

                <div className="space-y-4">
                    {rules.map((rule) => (
                        <Card key={rule.id} className="rounded-3xl border-2 hover:border-[#0d7377]/30 transition-all overflow-hidden bg-white">
                            <div className="p-6 flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center border-2 border-dashed">
                                         {rule.fixed_price ? <DollarSign className="text-[#0d7377] w-8 h-8"/> : <TrendingUp className="text-[#0d7377] w-8 h-8" />}
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold uppercase tracking-tighter italic">{rule.name}</h4>
                                        <div className="flex items-center gap-3 text-xs font-black text-muted-foreground uppercase mt-1">
                                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {new Date(rule.start_date).toLocaleDateString()} - {new Date(rule.end_date).toLocaleDateString()}</span>
                                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                            <span className="text-[#0d7377]">PRIORITY: {rule.priority}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <div className="text-2xl font-black text-gray-900 italic">
                                            {rule.fixed_price ? `₹${rule.fixed_price}` : `${rule.price_multiplier}x`}
                                        </div>
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Rate Type</p>
                                    </div>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => handleDeleteRule(rule.id)}
                                        className="text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl w-12 h-12"
                                    >
                                        <Trash2 className="w-6 h-6" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}

                    {rules.length === 0 && (
                        <div className="text-center py-20 bg-gray-50 rounded-[40px] border-4 border-dashed border-gray-100">
                             <TrendingUp className="w-16 h-16 mx-auto text-gray-200 mb-4" />
                             <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No seasonal rules defined for this room category</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}
