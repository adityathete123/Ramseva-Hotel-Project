import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';

import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, UserPlus, User } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminUsers() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'receptionist',
  });

  useEffect(() => {
    fetchUsers();
  }, [accessToken]);

  const fetchUsers = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(
        `${apiUrl}/api/admin/employees`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token') || accessToken}` },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setUsers(result.data || []);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load employee accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(
        `${apiUrl}/api/admin/employees`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token') || accessToken}`,
          },
          body: JSON.stringify(newUser),
        }
      );

      if (response.ok) {
        toast.success('Employee account created successfully');
        fetchUsers();
        setNewUser({ name: '', email: '', phone: '', password: '', role: 'receptionist' });
        setDialogOpen(false);
      } else {
        const result = await response.json();
        toast.error(result.message || 'Failed to create employee');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to create employee');
    } finally {
      setCreating(false);
    }
  };

  const employees = users.filter((u) => u.role !== 'admin');

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-[#0d7377]">Employee Management</h1>
              <p className="text-sm text-muted-foreground">
                Staff accounts and access control
              </p>
            </div>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#0d7377] hover:bg-[#0a5c5f]">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Employee
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Employee</DialogTitle>
                <DialogDescription>
                  Provide account details for the staff member.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCreateUser} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <Input
                    required
                    value={newUser.name}
                    onChange={(e: any) =>
                      setNewUser({ ...newUser, name: e.target.value })
                    }
                    placeholder="Enter full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Email (Login ID) *</Label>
                  <Input
                    type="email"
                    required
                    value={newUser.email}
                    onChange={(e: any) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                    placeholder="email@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Phone *</Label>
                  <Input
                    type="tel"
                    required
                    value={newUser.phone}
                    onChange={(e: any) =>
                      setNewUser({ ...newUser, phone: e.target.value })
                    }
                    placeholder="10 digit mobile number"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Password *</Label>
                  <Input
                    type="password"
                    required
                    minLength={6}
                    value={newUser.password}
                    onChange={(e: any) =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                    placeholder="Min 6 characters"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Assign Role *</Label>
                  <Select
                    value={newUser.role}
                    onValueChange={(value) => setNewUser({ ...newUser, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="receptionist">Receptionist</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#0d7377] hover:bg-[#0a5c5f] py-6 text-lg mt-4"
                  disabled={creating}
                >
                  {creating ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-1">Staff Overview</h2>
          <p className="text-lg text-muted-foreground">Manage employees and their access levels.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Directory</CardTitle>
            <CardDescription className="text-base">
              List of all registered employees excluding yourself.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0d7377] mx-auto"></div>
              </div>
            ) : employees.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="text-left py-4 px-4 font-medium text-sm">Staff Name</th>
                      <th className="text-left py-4 px-4 font-medium text-sm">Contact Info</th>
                      <th className="text-left py-4 px-4 font-medium text-sm">Role</th>
                      <th className="text-left py-4 px-4 font-medium text-sm">Account Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((u) => (
                      <tr key={u.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="py-5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#0d7377]/10 flex items-center justify-center text-[#0d7377]">
                              <User className="w-5 h-5" />
                            </div>
                            <span className="font-semibold">{u.name}</span>
                          </div>
                        </td>
                        <td className="py-5 px-4">
                          <div className="text-sm font-medium">{u.email}</div>
                          <div className="text-xs text-muted-foreground">{u.phone}</div>
                        </td>
                        <td className="py-5 px-4">
                          <Badge variant="outline" className="capitalize px-3 py-1 font-medium bg-white">
                            {u.role}
                          </Badge>
                        </td>
                        <td className="py-5 px-4">
                          <Badge className={u.is_active ? "bg-green-500 hover:bg-green-600" : "bg-red-500"}>
                            {u.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-16">
                <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                <p className="text-xl font-medium">No receptionist accounts found</p>
                <p className="max-w-xs mx-auto mt-2">Use the "Add Employee" button above to create a new account.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}