import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Loader from './components/ui/Loader';
import { useAuth } from './context/AuthContext';
import { AIProvider } from './context/AIContext.jsx';
import ChatBot from './components/ai/ChatBot.jsx';

// Lazy imports - Auth
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));

// Lazy imports - Home & Offers
const Home = lazy(() => import('./pages/Home'));
const Offers = lazy(() => import('./pages/Offers'));

// Lazy imports - Flights
const FlightSearch = lazy(() => import('./pages/flights/FlightSearch'));
const FlightResults = lazy(() => import('./pages/flights/FlightResults'));
const FlightBooking = lazy(() => import('./pages/flights/FlightBooking'));
const FlightConfirmation = lazy(() => import('./pages/flights/FlightConfirmation'));

// Lazy imports - Hotels
const HotelSearch = lazy(() => import('./pages/hotels/HotelSearch'));
const HotelListing = lazy(() => import('./pages/hotels/HotelListing'));
const HotelDetail = lazy(() => import('./pages/hotels/HotelDetail'));
const HotelBooking = lazy(() => import('./pages/hotels/HotelBooking'));
const HotelConfirmation = lazy(() => import('./pages/hotels/HotelConfirmation'));

// Lazy imports - Trains
const TrainSearch = lazy(() => import('./pages/trains/TrainSearch'));
const TrainResults = lazy(() => import('./pages/trains/TrainResults'));
const TrainBooking = lazy(() => import('./pages/trains/TrainBooking'));
const TrainConfirmation = lazy(() => import('./pages/trains/TrainConfirmation'));

// Lazy imports - Buses
const BusSearch = lazy(() => import('./pages/buses/BusSearch'));
const BusResults = lazy(() => import('./pages/buses/BusResults'));
const BusBooking = lazy(() => import('./pages/buses/BusBooking'));
const BusConfirmation = lazy(() => import('./pages/buses/BusConfirmation'));

// Lazy imports - Cabs
const CabSearch = lazy(() => import('./pages/cabs/CabSearch'));
const CabResults = lazy(() => import('./pages/cabs/CabResults'));
const CabBooking = lazy(() => import('./pages/cabs/CabBooking'));
const CabConfirmation = lazy(() => import('./pages/cabs/CabConfirmation'));

// Lazy imports - Holidays
const HolidayPackages = lazy(() => import('./pages/holidays/HolidayPackages'));
const HolidayDetail = lazy(() => import('./pages/holidays/HolidayDetail'));
const HolidayBooking = lazy(() => import('./pages/holidays/HolidayBooking'));
const HolidayConfirmation = lazy(() => import('./pages/holidays/HolidayConfirmation'));

// Lazy imports - Account (protected)
const Dashboard = lazy(() => import('./pages/account/Dashboard'));
const MyTrips = lazy(() => import('./pages/account/MyTrips'));
const Profile = lazy(() => import('./pages/account/Profile'));
const Wallet = lazy(() => import('./pages/account/Wallet'));

// Lazy imports - Support & Misc
const AboutUs = lazy(() => import('./pages/support/AboutUs'));
const ContactUs = lazy(() => import('./pages/support/ContactUs'));
const HelpCenter = lazy(() => import('./pages/support/HelpCenter'));
const Terms = lazy(() => import('./pages/support/Terms'));
const Privacy = lazy(() => import('./pages/support/Privacy'));
const TravelGuides = lazy(() => import('./pages/blog/TravelGuides'));

// Lazy imports - AI pages
const TripPlanner = lazy(() => import('./pages/ai/TripPlanner'));
const TravelBuddies = lazy(() => import('./pages/ai/TravelBuddies'));
const BudgetPlanner = lazy(() => import('./pages/ai/BudgetPlanner'));

// Layout wrapper that adds Navbar, Footer, and floating ChatBot
function PageWrapper({ children, hideFooter = false }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      {!hideFooter && <Footer />}
      <ChatBot />
    </div>
  );
}

// Protected route
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

const SuspenseFallback = (
  <div className="min-h-screen flex items-center justify-center">
    <Loader size="lg" />
  </div>
);

export default function App() {
  return (
    <AIProvider>
      <Suspense fallback={SuspenseFallback}>
        <Routes>
          {/* Auth pages - no navbar/footer */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Public pages */}
          <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
          <Route path="/offers" element={<PageWrapper><Offers /></PageWrapper>} />

          {/* Flights */}
          <Route path="/flights" element={<PageWrapper><FlightSearch /></PageWrapper>} />
          <Route path="/flights/results" element={<PageWrapper><FlightResults /></PageWrapper>} />
          <Route path="/flights/book/:id" element={<PageWrapper><FlightBooking /></PageWrapper>} />
          <Route path="/flights/confirmation" element={<PageWrapper hideFooter><FlightConfirmation /></PageWrapper>} />

          {/* Hotels */}
          <Route path="/hotels" element={<PageWrapper><HotelSearch /></PageWrapper>} />
          <Route path="/hotels/listing" element={<PageWrapper><HotelListing /></PageWrapper>} />
          <Route path="/hotels/:id" element={<PageWrapper><HotelDetail /></PageWrapper>} />
          <Route path="/hotels/book/:id" element={<PageWrapper><HotelBooking /></PageWrapper>} />
          <Route path="/hotels/confirmation" element={<PageWrapper hideFooter><HotelConfirmation /></PageWrapper>} />

          {/* Trains */}
          <Route path="/trains" element={<PageWrapper><TrainSearch /></PageWrapper>} />
          <Route path="/trains/results" element={<PageWrapper><TrainResults /></PageWrapper>} />
          <Route path="/trains/book/:id" element={<PageWrapper><TrainBooking /></PageWrapper>} />
          <Route path="/trains/confirmation" element={<PageWrapper hideFooter><TrainConfirmation /></PageWrapper>} />

          {/* Buses */}
          <Route path="/buses" element={<PageWrapper><BusSearch /></PageWrapper>} />
          <Route path="/buses/results" element={<PageWrapper><BusResults /></PageWrapper>} />
          <Route path="/buses/book/:id" element={<PageWrapper><BusBooking /></PageWrapper>} />
          <Route path="/buses/confirmation" element={<PageWrapper hideFooter><BusConfirmation /></PageWrapper>} />

          {/* Cabs */}
          <Route path="/cabs" element={<PageWrapper><CabSearch /></PageWrapper>} />
          <Route path="/cabs/results" element={<PageWrapper><CabResults /></PageWrapper>} />
          <Route path="/cabs/book/:id" element={<PageWrapper><CabBooking /></PageWrapper>} />
          <Route path="/cabs/confirmation" element={<PageWrapper hideFooter><CabConfirmation /></PageWrapper>} />

          {/* Holidays */}
          <Route path="/holidays" element={<PageWrapper><HolidayPackages /></PageWrapper>} />
          <Route path="/holidays/:id" element={<PageWrapper><HolidayDetail /></PageWrapper>} />
          <Route path="/holidays/book/:id" element={<PageWrapper><HolidayBooking /></PageWrapper>} />
          <Route path="/holidays/confirmation" element={<PageWrapper hideFooter><HolidayConfirmation /></PageWrapper>} />

          {/* Protected account pages */}
          <Route path="/dashboard" element={<ProtectedRoute><PageWrapper><Dashboard /></PageWrapper></ProtectedRoute>} />
          <Route path="/my-trips" element={<ProtectedRoute><PageWrapper><MyTrips /></PageWrapper></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><PageWrapper><Profile /></PageWrapper></ProtectedRoute>} />
          <Route path="/wallet" element={<ProtectedRoute><PageWrapper><Wallet /></PageWrapper></ProtectedRoute>} />

          {/* Support & Content */}
          <Route path="/about-us" element={<PageWrapper><AboutUs /></PageWrapper>} />
          <Route path="/contact-us" element={<PageWrapper><ContactUs /></PageWrapper>} />
          <Route path="/support" element={<PageWrapper><HelpCenter /></PageWrapper>} />
          <Route path="/terms" element={<PageWrapper><Terms /></PageWrapper>} />
          <Route path="/privacy" element={<PageWrapper><Privacy /></PageWrapper>} />
          <Route path="/travel-guides" element={<PageWrapper><TravelGuides /></PageWrapper>} />

          {/* AI pages */}
          <Route path="/trip-planner" element={<PageWrapper><TripPlanner /></PageWrapper>} />
          <Route path="/travel-buddies" element={<PageWrapper><TravelBuddies /></PageWrapper>} />
          <Route path="/budget" element={<PageWrapper><BudgetPlanner /></PageWrapper>} />

          {/* 404 fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AIProvider>
  );
}
