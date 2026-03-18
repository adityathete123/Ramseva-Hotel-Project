import { Link } from 'react-router';
import { Button } from '../components/ui/button';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-[#0d7377] mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-muted-foreground mb-8 text-lg">
          The page you're looking for doesn't exist.
        </p>
        <Link to="/">
          <Button className="bg-[#0d7377] hover:bg-[#0a5c5f] text-white">
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
