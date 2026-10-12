import React, { Suspense, useEffect, useState } from 'react';
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
  const [viewportHeight, setViewportHeight] = useState(() => {
    if (typeof window !== 'undefined' && window.visualViewport) {
      return Math.round(window.visualViewport.height);
    }
    return null;
  });

  // Track visual viewport height on mobile devices (especially iOS Safari virtual keyboard)
  useEffect(() => {
    if (!isChatRoute) {
      setViewportHeight(null);
      return;
    }

    const updateHeight = () => {
      if (window.visualViewport) {
        setViewportHeight(Math.round(window.visualViewport.height));
      }
    };

    updateHeight();

    const vv = window.visualViewport;
    if (vv) {
      vv.addEventListener('resize', updateHeight);
      vv.addEventListener('scroll', updateHeight);
    }
    window.addEventListener('resize', updateHeight);

    return () => {
      if (vv) {
        vv.removeEventListener('resize', updateHeight);
        vv.removeEventListener('scroll', updateHeight);
      }
      window.removeEventListener('resize', updateHeight);
    };
  }, [isChatRoute]);

  // Prevent background document scrolling and iOS rubber-banding when in full-height chat mode
  useEffect(() => {
    if (isChatRoute) {
      document.body.classList.add('overflow-hidden');
      document.documentElement.classList.add('overflow-hidden');
      const handleWindowScroll = () => {
        if (window.scrollY !== 0 || document.documentElement.scrollTop !== 0) {
          window.scrollTo(0, 0);
        }
      };
      window.addEventListener('scroll', handleWindowScroll);

      return () => {
        document.body.classList.remove('overflow-hidden');
        document.documentElement.classList.remove('overflow-hidden');
        window.removeEventListener('scroll', handleWindowScroll);
      };
    }
  }, [isChatRoute]);

  return (
    <div
      style={
        isChatRoute && viewportHeight
          ? { height: `${viewportHeight}px`, maxHeight: `${viewportHeight}px` }
          : undefined
      }
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
