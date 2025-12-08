import { Navigate } from "react-router-dom";
import { useGetProfile } from "../hooks/useAuth";
import AdminPanelComponent from "../pages/dashboard/routes/AdminRoute";
import { useEffect, useState } from "react";

/**
 * Protected route wrapper for Admin panel
 * Checks if user role is 'admin' before allowing access
 */
const AdminRoute = () => {
  const { getProfile, user, isLoading, error } = useGetProfile();
  const [hasFetched, setHasFetched] = useState(false);

  // Fetch profile on mount to ensure role is available
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        await getProfile();
      } catch (err) {
        console.error('Error fetching profile in AdminRoute:', err);
      } finally {
        setHasFetched(true);
      }
    };
    
    // Only fetch if we don't have user data yet
    if (!user && !hasFetched) {
      fetchProfile();
    } else if (user) {
      // If we already have user data, mark as fetched
      setHasFetched(true);
    }
  }, [getProfile, user, hasFetched]);

  // Show loading state while checking profile
  if (isLoading || (!hasFetched && !user)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#023E8A] mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // If there was an error fetching profile, redirect
  if (error && !user) {
    console.error('Error loading profile:', error);
    return <Navigate to="/dashboard/home" replace />;
  }

  // Check if user exists
  if (!user) {
    console.log('No user found, redirecting to home');
    return <Navigate to="/dashboard/home" replace />;
  }

  // Check role (case-insensitive, trim whitespace)
  const userRole = user.role?.toLowerCase()?.trim();
  console.log('AdminRoute - Checking role:', { 
    userRole, 
    originalRole: user.role,
    fullUser: user,
    isAdmin: userRole === 'admin'
  });

  if (userRole !== 'admin') {
    // Redirect non-admin users to dashboard home
    console.log('Access denied - User role is not admin:', userRole);
    return <Navigate to="/dashboard/home" replace />;
  }

  // Allow access if user is admin
  console.log('Admin access granted!');
  return <AdminPanelComponent />;
};

export default AdminRoute;

