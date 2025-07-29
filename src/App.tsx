import React, { Suspense } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";

// Import components with error boundaries
const Home = React.lazy(() => import("./components/home").catch(() => ({ default: () => <div>Error loading Home</div> })));
const QRScanner = React.lazy(() => import("./components/QRScanner").catch(() => ({ default: () => <div>Error loading QRScanner</div> })));
const AssetDetail = React.lazy(() => import("./components/AssetDetail").catch(() => ({ default: () => <div>Error loading AssetDetail</div> })));
const QRCodeManager = React.lazy(() => import("./components/QRCodeManager").catch(() => ({ default: () => <div>Error loading QRCodeManager</div> })));
const QRAssignment = React.lazy(() => import("./components/QRAssignment").catch(() => ({ default: () => <div>Error loading QRAssignment</div> })));
const MaintenanceCalendar = React.lazy(() => import("./components/MaintenanceCalendar").catch(() => ({ default: () => <div>Error loading MaintenanceCalendar</div> })));
const AssetDashboard = React.lazy(() => import("./components/AssetDashboard").catch(() => ({ default: () => <div>Error loading AssetDashboard</div> })));
const TaskDashboard = React.lazy(() => import("./components/TaskDashboard").catch(() => ({ default: () => <div>Error loading TaskDashboard</div> })));
const MaintenanceTaskList = React.lazy(() => import("./components/MaintenanceTaskList").catch(() => ({ default: () => <div>Error loading MaintenanceTaskList</div> })));
const ProjectSelector = React.lazy(() => import("./components/ProjectSelector").catch(() => ({ default: () => <div>Error loading ProjectSelector</div> })));
const CurrentAssets = React.lazy(() => import("./components/CurrentAssets").catch(() => ({ default: () => <div>Error loading CurrentAssets</div> })));
const LoginPage = React.lazy(() => import("./components/LoginPage").catch(() => ({ default: () => <div>Error loading LoginPage</div> })));

// Safe AuthProvider import
import { AuthProvider, useAuth } from "./components/AuthProvider";

// Safe tempo routes component
const TempoRoutes = () => {
  try {
    if (import.meta.env.VITE_TEMPO === "true") {
      const routes = (window as any).__tempoRoutes || [];
      return useRoutes(routes);
    }
  } catch (error) {
    console.warn("Tempo routes not available:", error);
  }
  return null;
};

// Loading component
const LoadingSpinner = ({ message = "Loading..." }: { message?: string }) => (
  <div className="min-h-screen bg-white flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">{message}</p>
    </div>
  </div>
);

// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
            <p className="text-gray-600 mb-4">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Initializing application..." />;
  }

  // For now, bypass authentication to test functionality
  const bypassAuth = true;

  if (!user && !bypassAuth) {
    return (
      <Suspense fallback={<LoadingSpinner message="Loading login..." />}>
        <LoginPage />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner message="Loading page..." />}>
          {import.meta.env.VITE_TEMPO === "true" && <TempoRoutes />}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/scan" element={<QRScanner />} />
            <Route path="/asset/:id" element={<AssetDetail />} />
            <Route path="/qr-manager" element={<QRCodeManager />} />
            <Route path="/qr/:qrId" element={<QRAssignment />} />
            <Route path="/maintenance-calendar" element={<MaintenanceCalendar />} />
            <Route path="/asset-dashboard" element={<AssetDashboard />} />
            <Route path="/task-dashboard" element={<TaskDashboard />} />
            <Route path="/maintenance-tasks" element={<MaintenanceTaskList />} />
            <Route path="/projects" element={<ProjectSelector />} />
            <Route path="/current-assets" element={<CurrentAssets />} />
            {import.meta.env.VITE_TEMPO === "true" && (
              <Route path="/tempobook/*" element={<div className="p-8">Tempo Route</div>} />
            )}
            <Route path="*" element={
              <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
                  <p className="text-gray-600 mb-4">The page you're looking for doesn't exist.</p>
                  <button
                    onClick={() => window.location.href = '/'}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Go Home
                  </button>
                </div>
              </div>
            } />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;