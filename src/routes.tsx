import { createBrowserRouter } from "react-router";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import CustomerDashboard from "./pages/customer/Dashboard";
import CustomerBookings from "./pages/customer/Bookings";
import BookingDetails from "./pages/customer/BookingDetails";
import SearchAndBook from "./pages/customer/SearchAndBook";
import ReceptionDashboard from "./pages/reception/Dashboard";
import ReceptionCheckIn from "./pages/reception/CheckIn";
import ReceptionCheckOut from "./pages/reception/CheckOut";
import ReceptionGuestList from "./pages/reception/GuestList";
import ReceptionWalkIn from "./pages/reception/WalkIn";
import ReceptionBookingDetails from "./pages/reception/BookingDetails";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminRooms from "./pages/admin/Rooms";
import AdminUsers from "./pages/admin/Users";
import AdminReports from "./pages/admin/Reports";
import AdminRoomDiscount from "./pages/admin/AdminRoomDiscount";
import AdminSeasonalPricing from "./pages/admin/AdminSeasonalPricing";
import AdminRoomImages from "./pages/admin/AdminRoomImages";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import RootLayout from "./components/RootLayout";
import InitSetup from "./pages/InitSetup";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      {
        index: true,
        Component: Home,
      },
      {
        path: "init-setup",
        Component: InitSetup,
      },
      {
        path: "login",
        Component: Login,
      },
      {
        path: "signup",
        Component: Signup,
      },
      {
        path: "customer",
        element: <ProtectedRoute allowedRoles={['customer']} />,
        children: [
          { index: true, Component: CustomerDashboard },
          { path: "bookings", Component: CustomerBookings },
          { path: "bookings/:id", Component: BookingDetails },
          { path: "book", Component: SearchAndBook },
        ],
      },
      {
        path: "reception",
        element: <ProtectedRoute allowedRoles={['receptionist', 'admin']} />,
        children: [
          { index: true, Component: ReceptionDashboard },
          { path: "check-in/:id", Component: ReceptionCheckIn },
          { path: "check-out/:id", Component: ReceptionCheckOut },
          { path: "guests", Component: ReceptionGuestList },
          { path: "bookings/:id", Component: ReceptionBookingDetails },
          { path: "walk-in", Component: ReceptionWalkIn },
        ],
      },
      {
        path: "admin",
        element: <ProtectedRoute allowedRoles={['admin']} />,
        children: [
          { index: true, Component: AdminDashboard },
          { path: "rooms", Component: AdminRooms },
          { path: "rooms/:id/discount", Component: AdminRoomDiscount },
          { path: "rooms/:id/seasonal", Component: AdminSeasonalPricing },
          { path: "rooms/:id/images", Component: AdminRoomImages },
          { path: "users", Component: AdminUsers },
          { path: "reports", Component: AdminReports },
        ],
      },
      {
        path: "*",
        Component: NotFound,
      },
    ],
  },
]);