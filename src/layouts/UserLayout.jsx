import React, { Suspense, useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import NotificationToastContainer from '../components/NotificationToastContainer';
import PageLoader from '../components/PageLoader';

/**
 * UserLayout: Dedicated layout strictly for normal users & marketplace visitors.
 * Renders the consumer navbar, ambient background, main user content, and footer.
 * If an administrator is currently logged in, automatically redirects them to the Admin Panel.
 */
export default function UserLayout() {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  // Enforce complete separation: Administrators are routed exclusively to the Admin Panel
  if (isAuthenticated && user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  const isChatRoute = location.pathname === '/chat';

  // Prevent background document scrolling when in full-height chat mode
  useEffect(() => {
    if (isChatRoute) {
      document.body.classList.add('overflow-hidden');
      return () => {
        document.body.classList.remove('overflow-hidden');
      };
    }
  }, [isChatRoute]);

  return (
    <div
      className={`${
        isChatRoute
          ? 'h-screen h-[100dvh] overflow-hidden'
          : 'min-h-screen'
      } flex flex-col bg-[#FAF9F5] dark:bg-[#080B14] text-[#24364B] dark:text-slate-100 selection:bg-[#07866D] selection:text-white transition-colors duration-200 relative`}
    >
      <div className="ambient-mesh" aria-hidden="true" />
      <Navbar />
      <NotificationToastContainer />
      <main
        className={`flex-1 relative z-10 ${
          isChatRoute ? 'flex flex-col min-h-0 overflow-hidden' : ''
        }`}
      >
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      {!isChatRoute && <Footer />}
    </div>
  );
}
