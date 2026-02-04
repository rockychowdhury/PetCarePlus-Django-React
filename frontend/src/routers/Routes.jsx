import { createBrowserRouter, RouterProvider, Outlet, Navigate } from 'react-router-dom';
import useAuth from "../hooks/useAuth";
import PrivateRoute, { AdminRoute, ServiceProviderRoute, GuestRoute, PetOwnerRoute } from './PrivateRoute';

// Layouts
import MainLayout from "../layouts/MainLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import AdminLayout from "../components/Admin/Layout/AdminLayout";

// Home & Error
import HomePage from "../pages/HomePages/HomePage";
import NotFoundPage from "../pages/ErrorPages/NotFoundPage";
import ServerErrorPage from "../pages/ErrorPages/ServerErrorPage";

// Auth Pages
import LoginPage from "../pages/AuthPages/LoginPage";
import RegisterPage from "../pages/AuthPages/RegisterPage";
import VerifyEmailPage from "../pages/AuthPages/VerifyEmailPage";
import ForgotPasswordPage from "../pages/AuthPages/ForgotPasswordPage";
import ResetPasswordPage from "../pages/AuthPages/ResetPasswordPage";

// Public Pages (Static)
import AboutPage from "../pages/AboutPages/AboutPage";
import ContactPage from "../pages/LegalPages/ContactPage";
import HowItWorksPage from "../pages/AboutPages/HowItWorksPage";
import FAQPage from "../pages/AboutPages/FAQPage";
import TermsOfServicePage from "../pages/LegalPages/TermsOfServicePage";
import PrivacyPolicyPage from "../pages/LegalPages/PrivacyPolicyPage";
import CookiePolicyPage from "../pages/LegalPages/CookiePolicyPage";

// Feature Pages
import PetListingPage from "../pages/PetPages/PetListingPage";
import PetDetailPage from "../pages/PetPages/PetDetailPage";
import PublicProfilePage from "../pages/ProfilePages/PublicProfilePage";

// Services
import ServiceSearchPage from "../pages/ServicePages/ServiceSearchPage";
import ServiceDetailPage from "../pages/ServicePages/ServiceDetailPage";
import ServiceReviewPage from "../pages/ServicePages/ServiceReviewPage";
import ServiceProviderRegistrationPage from "../pages/ServicePages/ServiceProviderRegistrationPage";
import BecomeProviderPage from "../pages/ServicePages/BecomeProviderPage";
import ProviderDashboardPage from "../pages/ServicePages/ProviderDashboardPage";
import DashboardOverview from "../components/Services/ProviderDashboard/Pages/DashboardOverview";
import BookingsPage from "../components/Services/ProviderDashboard/Pages/BookingsPage";
import CalendarPage from "../components/Services/ProviderDashboard/Pages/CalendarPage";
import AvailabilityManager from "../components/Services/ProviderDashboard/Pages/AvailabilityManager";
import ProfileManager from "../components/Services/ProviderDashboard/Pages/ProfileManager";
import ReviewsManager from "../components/Services/ProviderDashboard/Pages/ReviewsManager";
import ProviderAnalyticsPage from "../components/Services/ProviderDashboard/Pages/AnalyticsPage";
import SettingsPage from "../components/Services/ProviderDashboard/Pages/SettingsPage";

// Rehoming
import RehomingFlowLayout from "../layouts/RehomingFlowLayout";
import RehomingPetSelectionPage from '../pages/RehomingPages/RehomingPetSelectionPage';
import RehomingSituationPage from "../pages/RehomingPages/RehomingSituationPage";
import RehomingDetailsPage from "../pages/RehomingPages/RehomingDetailsPage";
import RehomingReviewPage from "../pages/RehomingPages/RehomingReviewPage";
import RehomingListingDetailPage from "../pages/RehomingPages/RehomingListingDetailPage";
import RehomingDashboardPage from "../pages/RehomingPages/RehomingDashboardPage";
// import RehomingRequestPage removed

// Applications & Reviews
// Applications & Reviews
// import AdoptionProfileSetupPage removed
import AdoptionProfilePage from "../pages/ApplicationPages/AdoptionProfilePage";
import ApplicationSubmitPage from "../pages/ApplicationPages/ApplicationSubmitPage";
import MyApplicationsPage from "../pages/ApplicationPages/MyApplicationsPage";
import ApplicationDetailPage from "../pages/ApplicationPages/ApplicationDetailPage";
import OwnerApplicationReviewPage from "../pages/ApplicationPages/OwnerApplicationReviewPage";
import OwnerApplicationDetailPage from "../pages/ApplicationPages/OwnerApplicationDetailPage";
import AdoptionReviewPage from "../pages/ReviewPages/AdoptionReviewPage";
import AIApplicationPage from "../pages/ApplicationPages/AIApplicationPage";
import ApplicationMailboxPage from "../pages/ApplicationPages/ApplicationMailboxPage";

// Messages - Removed

// Dashboard (User)
import UserDashboardOverview from "../pages/Dashboard/UserDashboardOverview";
import UserProfilePage from "../pages/ProfilePages/UserProfilePage";
import EditProfilePage from "../pages/ProfilePages/EditProfilePage";
import ProfileSettingsPage from "../pages/ProfilePages/ProfileSettingsPage";
import VerificationPage from "../pages/ProfilePages/VerificationPage";
import MyPetsPage from "../pages/PetPages/MyPetsPage";
import AddPetPage from "../pages/PetPages/AddPetPage";
import UserServiceBookingsPage from "../pages/Dashboard/UserServiceBookingsPage";
import UserReviewsPage from "../pages/Dashboard/UserReviewsPage";

// Admin
import AdminDashboard from "../pages/AdminPages/AdminDashboard";
import UserManagementPage from "../pages/AdminPages/UserManagementPage";
import UserDetailPage from "../pages/AdminPages/UserDetailPage";
import ListingModerationPage from "../pages/AdminPages/ListingModerationPage";
import ReportManagementPage from "../pages/AdminPages/ReportManagementPage";
import AdminAnalyticsPage from "../pages/AdminPages/AnalyticsPage";
import RoleRequestsPage from "../pages/AdminPages/RoleRequestsPage";
import AdminProvidersPage from "../pages/AdminPages/AdminProvidersPage";

// Payment
import PaymentCheckoutPage from "../pages/Payment/PaymentCheckoutPage";
import PaymentSuccessPage from "../pages/Payment/PaymentSuccessPage";
import PaymentFailurePage from "../pages/Payment/PaymentFailurePage";

// --- Guards imported from PrivateRoute.jsx ---


// --- Router ---

const router = createBrowserRouter([
    {
        element: <Outlet />,
        errorElement: <ServerErrorPage />,
        children: [
            /* =======================
               UNAUTHORIZED / GUEST ROUTES
               (Redirects to dashboard if logged in)
            ======================== */
            {
                element: (
                    <GuestRoute>
                        <Outlet />
                    </GuestRoute>
                ),
                children: [
                    { path: "/login", element: <LoginPage /> },
                    { path: "/register", element: <RegisterPage /> },
                    { path: "/verify-email", element: <VerifyEmailPage /> },
                    { path: "/forgot-password", element: <ForgotPasswordPage /> },
                    { path: "/password-reset/:uid/:token", element: <ResetPasswordPage /> },
                ],
            },

            /* =======================
               PUBLIC ROUTES
               (Accessible by everyone)
            ======================== */
            {
                element: <MainLayout />,
                children: [
                    { path: "/", element: <HomePage /> },

                    /* Static Pages */
                    { path: "/about", element: <AboutPage /> },
                    { path: "/contact", element: <ContactPage /> },
                    { path: "/how-it-works", element: <HowItWorksPage /> },
                    { path: "/faq", element: <FAQPage /> },
                    { path: "/terms", element: <TermsOfServicePage /> },
                    { path: "/privacy", element: <PrivacyPolicyPage /> },
                    { path: "/cookies", element: <CookiePolicyPage /> },

                    /* Services (Search & Viewing) */
                    { path: "/services", element: <ServiceSearchPage /> },
                    { path: "/services/:id", element: <ServiceDetailPage /> },

                    /* Pets (Listing & Viewing - Public Listing, Private Details) */
                    { path: "/pets", element: <PetListingPage /> },

                    /* SEO aliases */
                    { path: "/browse", element: <Navigate to="/pets" replace /> },
                    { path: "/adopt", element: <Navigate to="/pets" replace /> },
                    { path: "/find-pet", element: <Navigate to="/pets" replace /> },

                    /* Public Profiles */
                    { path: "/profile/:username", element: <PublicProfilePage /> },
                ],
            },

            /* =======================
               AUTHENTICATED COMMON ROUTES
               (Accessible by any logged-in user)
            ======================== */
            {
                element: (
                    <PrivateRoute>
                        <MainLayout />
                    </PrivateRoute>
                ),
                children: [
                    /* Pet Details (Private) */
                    { path: "/pets/:id", element: <PetDetailPage /> },

                    /* Reviews */
                    { path: "/services/:id/review", element: <ServiceReviewPage /> },
                    { path: "/adoptions/:id/review", element: <AdoptionReviewPage /> },

                    /* Rehoming Flow */
                    {
                        path: "/rehoming",
                        element: (
                            <PetOwnerRoute>
                                <RehomingFlowLayout />
                            </PetOwnerRoute>
                        ),
                        children: [
                            { index: true, element: <Navigate to="select-pet" replace /> },
                            { path: "select-pet", element: <RehomingPetSelectionPage /> },
                            { path: "situation", element: <RehomingSituationPage /> },
                            { path: "details", element: <RehomingDetailsPage /> },
                            { path: "review", element: <RehomingReviewPage /> },
                        ]
                    },

                    /* Applications (General) */
                    { path: "/applications", element: <MyApplicationsPage /> },
                    { path: "/applications/:id", element: <ApplicationDetailPage /> },
                    { path: "/applications/profile", element: <AdoptionProfilePage /> },
                    { path: "/rehoming/listings/:id/inquiry", element: <ApplicationMailboxPage /> },
                    { path: "/rehoming/listings/:id/apply-ai", element: <AIApplicationPage /> },
                    { path: "/rehoming/listings/:id/applications", element: <OwnerApplicationReviewPage /> },
                    { path: "/applications/:id/review", element: <OwnerApplicationDetailPage /> },

                    /* Rehoming Listing Details (Private Action) */
                    { path: "/rehoming/listings/:id", element: <RehomingListingDetailPage /> },

                    /* Payment */
                    { path: "/checkout/:bookingId", element: <PaymentCheckoutPage /> },
                    { path: "/checkout/success/:bookingId", element: <PaymentSuccessPage /> },
                    { path: "/checkout/failure", element: <PaymentFailurePage /> },

                    /* Provider Registration */
                    { path: "/become-provider", element: <BecomeProviderPage /> },
                    { path: "/service-provider/register", element: <ServiceProviderRegistrationPage /> },
                ],
            },

            /* =======================
               SERVICE PROVIDER ROUTES
               (Role: service_provider)
            ======================== */
            {
                element: (
                    <ServiceProviderRoute>
                        <Outlet />
                    </ServiceProviderRoute>
                ),
                children: [
                    {
                        path: "/provider",
                        element: <ProviderDashboardPage />,
                        children: [
                            { index: true, element: <Navigate to="dashboard" replace /> },
                            { path: "dashboard", element: <DashboardOverview /> },
                            { path: "bookings", element: <BookingsPage /> },
                            { path: "calendar", element: <CalendarPage /> },
                            { path: "availability", element: <AvailabilityManager /> },
                            { path: "profile", element: <ProfileManager /> },
                            { path: "reviews", element: <ReviewsManager /> },
                            { path: "analytics", element: <ProviderAnalyticsPage /> },
                            { path: "settings", element: <SettingsPage /> },
                        ]
                    },
                ],
            },

            /* =======================
               PET OWNER DASHBOARD ROUTES
               (Default authenticated role)
            ======================== */
            {
                path: "/dashboard",
                element: (
                    <PetOwnerRoute>
                        <DashboardLayout />
                    </PetOwnerRoute>
                ),
                children: [
                    { index: true, element: <UserDashboardOverview /> },

                    /* Profile */
                    { path: "profile", element: <UserProfilePage /> },
                    { path: "profile/edit", element: <EditProfilePage /> },
                    { path: "profile/settings", element: <ProfileSettingsPage /> },
                    { path: "verification", element: <VerificationPage /> },

                    /* Pets */
                    { path: "my-pets", element: <MyPetsPage /> },
                    { path: "pets/create", element: <AddPetPage /> },
                    { path: "pets/:id/edit", element: <AddPetPage /> },

                    /* Service Bookings */
                    { path: "bookings", element: <UserServiceBookingsPage /> },

                    /* Rehoming Management */
                    { path: "rehoming", element: <RehomingDashboardPage /> },

                    /* Applications */
                    { path: "applications", element: <MyApplicationsPage /> },
                    { path: "applications/:id", element: <ApplicationDetailPage /> },

                    /* Reviews */
                    { path: "reviews", element: <UserReviewsPage /> },
                ],
            },

            /* =======================
               ADMIN ROUTES
               (Role: admin)
            ======================== */
            {
                path: "/admin",
                element: (
                    <AdminRoute>
                        <AdminLayout />
                    </AdminRoute>
                ),
                children: [
                    { index: true, element: <AdminDashboard /> },
                    { path: "role-requests", element: <RoleRequestsPage /> },
                    { path: "users", element: <UserManagementPage /> },
                    { path: "users/:id", element: <UserDetailPage /> },
                    { path: "providers", element: <AdminProvidersPage /> },
                    { path: "moderation", element: <ListingModerationPage /> },
                    { path: "reports", element: <ReportManagementPage /> },
                    { path: "analytics", element: <AdminAnalyticsPage /> },
                ],
            },

            /* =======================
               404 FALLBACK
            ======================== */
            {
                element: <MainLayout />,
                children: [{ path: "*", element: <NotFoundPage /> }],
            },
        ],
    },
]);

export default router;
