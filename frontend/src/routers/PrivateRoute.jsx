import PropTypes from "prop-types";
import useAuth from "../hooks/useAuth";
import Spinner from "../components/common/Spinner";
import { Navigate, useLocation } from "react-router-dom";
import { getRoleBasedRedirect } from "../utils/roleRedirect";

/**
 * AdminRoute - Protects routes that require admin role
 * Redirects non-admin users to home page
 */
export const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading && !user) return <Spinner />;

    if (!user) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    if (user.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return children;
};

AdminRoute.propTypes = {
    children: PropTypes.any,
};

/**
 * ServiceProviderRoute - Protects routes that require service provider role
 * Redirects non-providers to become-provider page
 */
export const ServiceProviderRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading && !user) return <Spinner />;

    if (!user) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    if (user.role !== 'service_provider') {
        return <Navigate to="/become-provider" replace />;
    }

    return children;
};

ServiceProviderRoute.propTypes = {
    children: PropTypes.any,
};

/**
 * PrivateRoute - Protects routes that require authentication
 * Redirects to login if not authenticated
 */
const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading && !user) return <Spinner />;

    if (user && user?.email) {
        return children;
    }

    return <Navigate state={{ from: location.pathname }} to="/login" replace />;
};

PrivateRoute.propTypes = {
    children: PropTypes.any,
};

/**
 * GuestRoute - Protects routes that should ONLY be accessible by guests (non-authenticated users)
 * Redirects authenticated users to their role-specific dashboard
 */
export const GuestRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading && !user) return <Spinner />;

    if (user) {
        const redirectPath = getRoleBasedRedirect(user);
        return <Navigate to={redirectPath} replace />;
    }

    return children;
};

GuestRoute.propTypes = {
    children: PropTypes.any,
};

/**
 * PetOwnerRoute - Protects the main user dashboard
 * Ensures Service Providers and Admins are redirected to their own dashboards
 * only "normal" users (pet owners) can access /dashboard
 */
export const PetOwnerRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading && !user) return <Spinner />;

    // 1. Must be logged in
    if (!user) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    // 2. If Service Provider -> Redirect to Provider Dashboard
    if (user.role === 'service_provider') {
        return <Navigate to={getRoleBasedRedirect(user)} replace />;
    }

    // 3. If Admin -> Redirect to Admin Dashboard
    if (user.role === 'admin') {
        return <Navigate to={getRoleBasedRedirect(user)} replace />;
    }

    // 4. Authorized (Pet Owner / Standard User)
    return children;
};

PetOwnerRoute.propTypes = {
    children: PropTypes.any,
};

export default PrivateRoute;