import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

export const Dashboard = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const navigate = useNavigate();

  // Vaatab kas kasutaja on sisse loginud
  useEffect(() => {
    const id = authService.getUserId();
    const name = authService.getUsername();
    if (!id) {
      navigate('/login');
    } else {
      setUserId(id);
      setUsername(name);
    }
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              Logout
            </button>
          </div>
          <div className="mt-6 space-y-4">
            <p className="text-gray-600">
              Welcome, <span className="font-medium">{username}</span>!
            </p>
            <p className="text-gray-600">
              Your user ID is: <span className="font-medium">{userId}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}; 