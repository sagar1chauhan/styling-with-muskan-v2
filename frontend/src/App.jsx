import { Toaster } from "@/modules/user/components/ui/toaster";
import { Toaster as Sonner } from "@/modules/user/components/ui/sonner";
import { TooltipProvider } from "@/modules/user/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { GenderThemeProvider } from "@/modules/user/contexts/GenderThemeContext";
import { CartProvider } from "@/modules/user/contexts/CartContext";
import { AuthProvider } from "@/modules/user/contexts/AuthContext";
import { BookingProvider } from "@/modules/user/contexts/BookingContext";
import { WishlistProvider } from "@/modules/user/contexts/WishlistContext";
import LoginModal from "@/modules/user/components/salon/LoginModal";

// User Pages
import SplashScreen from "@/modules/user/pages/SplashScreen";
import GenderSelect from "@/modules/user/pages/GenderSelect";
import HomePage from "@/modules/user/pages/HomePage";
import ExplorePage from "@/modules/user/pages/ExplorePage";
import BookingsPage from "@/modules/user/pages/BookingsPage";
import ServiceDetail from "@/modules/user/pages/ServiceDetail";
import BookingSummary from "@/modules/user/pages/BookingSummary";
import PaymentPage from "@/modules/user/pages/PaymentPage";
import ProfilePage from "@/modules/user/pages/ProfilePage";
import EditProfilePage from "@/modules/user/pages/EditProfilePage";
import WalletPage from "@/modules/user/pages/WalletPage";
import AddressesPage from "@/modules/user/pages/AddressesPage";
import ReferralPage from "@/modules/user/pages/ReferralPage";
import CouponsPage from "@/modules/user/pages/CouponsPage";
import SupportPage from "@/modules/user/pages/SupportPage";
import NotFound from "@/modules/user/pages/NotFound";
import WishlistPage from "@/modules/user/pages/WishlistPage";

// Beautician Module
import { BeauticianAuthProvider } from "@/modules/beautician/contexts/BeauticianAuthContext";
import { BeauticianBookingProvider } from "@/modules/beautician/contexts/BeauticianBookingContext";
import { BeauticianAvailabilityProvider } from "@/modules/beautician/contexts/BeauticianAvailabilityContext";
import BeauticianLayout from "@/modules/beautician/components/BeauticianLayout";
import BeauticianLoginPage from "@/modules/beautician/pages/BeauticianLoginPage";
import BeauticianRegisterPage from "@/modules/beautician/pages/BeauticianRegisterPage";
import PendingApprovalPage from "@/modules/beautician/pages/PendingApprovalPage";
import BeauticianDashboard from "@/modules/beautician/pages/BeauticianDashboard";
import BeauticianBookingsPage from "@/modules/beautician/pages/BeauticianBookingsPage";
import BookingDetailPage from "@/modules/beautician/pages/BookingDetailPage";
import AvailabilityPage from "@/modules/beautician/pages/AvailabilityPage";
import EarningsPage from "@/modules/beautician/pages/EarningsPage";
import BeauticianProfilePage from "@/modules/beautician/pages/BeauticianProfilePage";
import BookingHistoryPage from "@/modules/beautician/pages/BookingHistoryPage";

// Service Provider Module
import ProviderLayout from "@/modules/serviceprovider/components/ProviderLayout";
import ProviderDashboard from "@/modules/serviceprovider/pages/ProviderDashboard";
import LeadCreditManager from "@/modules/serviceprovider/pages/LeadCreditManager";
import AvailabilityCalendar from "@/modules/serviceprovider/pages/AvailabilityCalendar";
import PerformanceDashboard from "@/modules/serviceprovider/pages/PerformanceDashboard";
import ProviderProfile from "@/modules/serviceprovider/pages/ProviderProfile";
import AdminFinanceSuite from "@/modules/serviceprovider/pages/AdminFinanceSuite";
import JobHistory from "@/modules/serviceprovider/pages/JobHistory";
import TrainingHub from "@/modules/serviceprovider/pages/TrainingHub";

// Service Provider Auth
import ProviderLoginPage from "@/modules/serviceprovider/pages/auth/ProviderLoginPage";
import ProviderRegisterPage from "@/modules/serviceprovider/pages/auth/ProviderRegisterPage";
import ProviderStatusPage from "@/modules/serviceprovider/pages/auth/ProviderStatusPage";
const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <GenderThemeProvider>
              <CartProvider>
                <WishlistProvider>
                  <BookingProvider>
                    <BeauticianAuthProvider>
                      <BeauticianBookingProvider>
                        <BeauticianAvailabilityProvider>
                          <Toaster />
                          <Sonner />
                          <Routes>
                            {/* User Routes */}
                            <Route path="/" element={<SplashScreen />} />
                            <Route path="/select-gender" element={<GenderSelect />} />
                            <Route path="/home" element={<HomePage />} />
                            <Route path="/explore" element={<ExplorePage />} />
                            <Route path="/explore/:categoryId" element={<ExplorePage />} />
                            <Route path="/bookings" element={<BookingsPage />} />
                            <Route path="/service/:id" element={<ServiceDetail />} />
                            <Route path="/booking/:id" element={<BookingSummary />} />
                            <Route path="/payment" element={<PaymentPage />} />
                            <Route path="/profile" element={<ProfilePage />} />
                            <Route path="/edit-profile" element={<EditProfilePage />} />
                            <Route path="/wallet" element={<WalletPage />} />
                            <Route path="/addresses" element={<AddressesPage />} />
                            <Route path="/referral" element={<ReferralPage />} />
                            <Route path="/coupons" element={<CouponsPage />} />
                            <Route path="/support" element={<SupportPage />} />
                            <Route path="/wishlist" element={<WishlistPage />} />

                            {/* Beautician Module */}
                            <Route path="/beautician/login" element={<BeauticianLoginPage />} />
                            <Route path="/beautician/register" element={<BeauticianRegisterPage />} />
                            <Route path="/beautician/pending" element={<PendingApprovalPage />} />
                            <Route path="/beautician" element={<BeauticianLayout />}>
                              <Route index element={<Navigate to="/beautician/dashboard" replace />} />
                              <Route path="dashboard" element={<BeauticianDashboard />} />
                              <Route path="bookings" element={<BeauticianBookingsPage />} />
                              <Route path="booking/:id" element={<BookingDetailPage />} />
                              <Route path="availability" element={<AvailabilityPage />} />
                              <Route path="earnings" element={<EarningsPage />} />
                              <Route path="profile" element={<BeauticianProfilePage />} />
                              <Route path="history" element={<BookingHistoryPage />} />
                            </Route>

                            {/* Service Provider Module */}
                            <Route path="/provider/login" element={<ProviderLoginPage />} />
                            <Route path="/provider/register" element={<ProviderRegisterPage />} />
                            <Route path="/provider/status" element={<ProviderStatusPage />} />
                            <Route path="/provider" element={<ProviderLayout />}>
                              <Route index element={<Navigate to="/provider/dashboard" replace />} />
                              <Route path="dashboard" element={<ProviderDashboard />} />
                              <Route path="credits" element={<LeadCreditManager />} />
                              <Route path="availability" element={<AvailabilityCalendar />} />
                              <Route path="performance" element={<PerformanceDashboard />} />
                              <Route path="profile" element={<ProviderProfile />} />
                              <Route path="admin" element={<AdminFinanceSuite />} />
                              <Route path="history" element={<JobHistory />} />
                              <Route path="training" element={<TrainingHub />} />
                            </Route>

                            {/* Common Typos / Legacy Redirects */}
                            <Route path="/home/beautician/*" element={<Navigate to="/beautician" replace />} />
                            <Route path="/home/provider/*" element={<Navigate to="/provider" replace />} />

                            {/* Fallback */}
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                          <LoginModal />
                        </BeauticianAvailabilityProvider>
                      </BeauticianBookingProvider>
                    </BeauticianAuthProvider>
                  </BookingProvider>
                </WishlistProvider>
              </CartProvider>
            </GenderThemeProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};
export default App;
