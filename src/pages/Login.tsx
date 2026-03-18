import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner@2.0.3';
import { Hotel, ArrowLeft } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin', { replace: true });
      else if (user.role === 'receptionist') navigate('/reception', { replace: true });
      else navigate('/customer', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('🔐 Attempting login with:', email);
      const loggedInUser = await signIn(email, password);
      console.log('🔐 Login successful, user data received:', loggedInUser);
      console.log('🔐 User role from signIn:', loggedInUser.role);
      console.log('🔐 User email from signIn:', loggedInUser.email);
      console.log('🔐 Full user object:', JSON.stringify(loggedInUser, null, 2));
      toast.success('Welcome back!');
      
      // Navigate based on role from the returned user object
      console.log('🔐 Navigating based on role:', loggedInUser.role);
      if (loggedInUser.role === 'admin') {
        console.log('🔐 Redirecting to /admin');
        navigate('/admin', { replace: true });
      } else if (loggedInUser.role === 'receptionist') {
        console.log('🔐 Redirecting to /reception');
        navigate('/reception', { replace: true });
      } else {
        console.log('🔐 Redirecting to /customer (default)');
        navigate('/customer', { replace: true });
      }
    } catch (error: any) {
      console.error('❌ Login error:', error);
      toast.error(error.message || 'Failed to sign in');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Link to="/" className="flex items-center gap-2 text-[#0d7377] hover:text-[#0a5c5f]">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-base">Back to Home</span>
          </Link>
        </div>

        <Card>
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-[#0d7377] rounded-full flex items-center justify-center">
                <Hotel className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription className="text-base">
              Sign in to your Panchavati Hotel account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="text-base"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-[#0d7377] hover:bg-[#0a5c5f] text-white"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm">
              Don't have an account?{' '}
              <Link to="/signup" className="text-[#0d7377] hover:underline font-medium">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>

        <div className="mt-6 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm font-semibold text-blue-900 mb-2">First Time Here?</p>
            <Link 
              to="/init-setup" 
              className="text-[#0d7377] hover:underline font-medium text-sm"
            >
              → Click here to set up demo accounts
            </Link>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">Demo Credentials:</p>
            <p>Customer: customer@test.com / password123</p>
            <p>Receptionist: reception@test.com / password123</p>
            <p>Admin: admin@test.com / password123</p>
          </div>
        </div>
      </div>
    </div>
  );
}