// GridironHub - Main Application
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
  const isAuthenticated = useStore(state => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  const isAuthenticated = useStore(state => state.isAuthenticated);
  const authChecked = useStore(state => state.authChecked);
  const dataLoaded = useStore(state => state.dataLoaded);
  
  const restoreSession = useStore(state => state.restoreSession);
  const loadData = useStore(state => state.loadData);
  const refreshGames = useStore(state => state.refreshGames);

  const hasRestoredSession = useRef(false);
  const hasLoadedInitialData = useRef(false);

  // ✅ FIX 1: FORCE THE TAB TITLE 
  // This runs immediately when the app loads to overwrite "NFL Hub"
  useEffect(() => {
    document.title = "GridironHub | 2026 Season";
  }, []);

  // Restore session ONCE on mount
  useEffect(() => {
    if (!hasRestoredSession.current) {
      hasRestoredSession.current = true;
      restoreSession();
    }
  }, [restoreSession]);

  // Load data ONCE when authenticated
  useEffect(() => {
    if (isAuthenticated && !hasLoadedInitialData.current && !dataLoaded) {
      hasLoadedInitialData.current = true;
      loadData();
    }
  }, [isAuthenticated, dataLoaded, loadData]);

  // Polling for game updates
  useEffect(() => {
    if (!isAuthenticated || !dataLoaded) return;

    const interval = setInterval(() => {
      refreshGames(false);
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, dataLoaded, refreshGames]);

  // Reset refs on logout
  useEffect(() => {
    if (!isAuthenticated) {
      hasLoadedInitialData.current = false;
    }
  }, [isAuthenticated]);

  if (!authChecked) {
    return (
      <div 
        style={{ 
          background: '#111111', 
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: 'Oswald, sans-serif'
        }}
      >
        <div>LOADING GRIDIRONHUB...</div>
      </div>
    );
  }

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route
          path="/"
          element={<ProtectedRoute><HomePage /></ProtectedRoute>}
        />
        <Route
          path="/picks"
          element={<ProtectedRoute><PicksPage /></ProtectedRoute>}
        />
        <Route
          path="/leaderboard"
          element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>}
        />
        <Route
          path="/playoffs"
          element={<ProtectedRoute><PlayoffsPage /></ProtectedRoute>}
        />
        <Route
          path="/news"
          element={<ProtectedRoute><NewsPage /></ProtectedRoute>}
        />
        <Route
          path="/profile"
          element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}
        />
        <Route
          path="/admin"
          element={<ProtectedRoute><AdminPage /></ProtectedRoute>}
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