// NFL Hub - Main Application
import { useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useStore } from './store/useStore';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { PicksPage } from './pages/PicksPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { PlayoffsPage } from './pages/PlayoffsPage';
import { NewsPage } from './pages/NewsPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';

// ✅ ScrollToTop component - scrolls to top on every route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // ✅ Use selector to only subscribe to what you need
  const isAuthenticated = useStore(state => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  // ✅ Use selectors instead of destructuring everything
  const isAuthenticated = useStore(state => state.isAuthenticated);
  const authChecked = useStore(state => state.authChecked);
  const dataLoaded = useStore(state => state.dataLoaded);
  
  // ✅ Get functions separately (these are stable references in Zustand)
  const restoreSession = useStore(state => state.restoreSession);
  const loadData = useStore(state => state.loadData);
  const refreshGames = useStore(state => state.refreshGames);

  // ✅ Track if we've already initialized
  const hasRestoredSession = useRef(false);
  const hasLoadedInitialData = useRef(false);

  // ✅ Restore session ONCE on mount
  useEffect(() => {
    if (!hasRestoredSession.current) {
      hasRestoredSession.current = true;
      restoreSession();
    }
  }, []); // Empty deps - only run once!

  // ✅ Load data ONCE when authenticated (not on every render)
  useEffect(() => {
    if (isAuthenticated && !hasLoadedInitialData.current && !dataLoaded) {
      hasLoadedInitialData.current = true;
      loadData();
    }
  }, [isAuthenticated, dataLoaded]); // Don't include loadData in deps!

  // ✅ Separate effect for polling (only refreshGames, not full loadData)
  useEffect(() => {
    if (!isAuthenticated || !dataLoaded) return;

    // Poll every 30 seconds for game updates only (not full reload)
    const interval = setInterval(() => {
      refreshGames(false); // Don't force refresh, use cache if fresh
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, dataLoaded]); // Don't include refreshGames in deps!

  // ✅ Reset refs on logout
  useEffect(() => {
    if (!isAuthenticated) {
      hasLoadedInitialData.current = false;
    }
  }, [isAuthenticated]);

  // Loading state
  if (!authChecked) {
    return (
      <div 
        style={{ 
          background: '#0f172a', 
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white'
        }}
      >
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <>
      <ScrollToTop /> {/* 👈 Added here - inside Router context but outside Routes */}
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/picks"
          element={
            <ProtectedRoute>
              <PicksPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute>
              <LeaderboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/playoffs"
          element={
            <ProtectedRoute>
              <PlayoffsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/news"
          element={
            <ProtectedRoute>
              <NewsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}