import { useState } from "react";
import { useNavigate } from "react-router";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { toast } from "sonner@2.0.3";

const API_BASE = '/api';

export default function InitSetup() {
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const navigate = useNavigate();

  const initializeDemoUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/init-demo`, {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        setInitialized(true);
        toast.success("Demo users created successfully!");
      } else {
        toast.error(data.message || "Failed to initialize demo users");
      }
    } catch (error) {
      console.error("Initialization error:", error);
      toast.error("Failed to initialize demo users");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-[#0d7377] mb-6">
            First-Time Setup
          </h1>

          {!initialized ? (
            <>
              <div className="space-y-4 mb-8">
                <p className="text-lg text-gray-700">
                  Welcome to Panchavati Hotel's booking
                  management system!
                </p>
                <p className="text-gray-600">
                  To get started, click the button below to
                  create demo accounts for testing:
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                  <h3 className="font-semibold text-blue-900">
                    Demo Accounts:
                  </h3>
                  <ul className="space-y-1 text-sm text-blue-800">
                    <li>
                      • <strong>Admin:</strong> admin@test.com /
                      password123
                    </li>
                    <li>
                      • <strong>Reception:</strong>{" "}
                      reception@test.com / password123
                    </li>
                    <li>
                      • <strong>Customer:</strong>{" "}
                      customer@test.com / password123
                    </li>
                  </ul>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> After creating demo
                    users, you'll need to log in as admin and
                    initialize room types from the Admin
                    Dashboard → Room Types page.
                  </p>
                </div>
              </div>

              <button
                onClick={initializeDemoUsers}
                disabled={loading}
                className="w-full bg-[#0d7377] hover:bg-[#14919b] text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? "Creating Demo Users..."
                  : "Initialize Demo Users"}
              </button>
            </>
          ) : (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <div className="text-green-600 text-5xl mb-4">
                  ✓
                </div>
                <h3 className="text-xl font-semibold text-green-900 mb-2">
                  Setup Complete!
                </h3>
                <p className="text-green-700">
                  Demo users have been created successfully.
                </p>
              </div>

              <div className="grid gap-4">
                <button
                  onClick={() => navigate("/login")}
                  className="w-full bg-[#0d7377] hover:bg-[#14919b] text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Go to Login
                </button>

                <button
                  onClick={() => navigate("/")}
                  className="w-full bg-white hover:bg-gray-50 text-[#0d7377] font-semibold py-3 px-6 rounded-lg border-2 border-[#0d7377] transition-colors"
                >
                  Go to Homepage
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <h4 className="font-semibold text-blue-900 mb-2">
                  Next Steps:
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                  <li>Login as admin@test.com / password123</li>
                  <li>Go to Admin Dashboard → Room Types</li>
                  <li>Click "Initialize Room Types" button</li>
                  <li>Start testing the booking system!</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}