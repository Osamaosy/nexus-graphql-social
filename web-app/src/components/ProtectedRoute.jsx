import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children }) {
  // بنستلم loading من الكونتكست
  const { isAuthenticated, loading } = useAuth();

  // 1. لو لسه بيحمل، اعرض رسالة انتظار ومتاخدش قرار دلوقتي
  if (loading) {
    return <div className="p-4 text-center">Checking authentication...</div>;
  }

  // 2. لو خلص تحميل، شوف بقى هو مسجل ولا لأ
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;