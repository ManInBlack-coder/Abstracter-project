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
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header Section */}
          <div className="px-6 py-8 bg-gradient-to-r from-indigo-600 to-purple-600">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-white">
                  Welcome back, <span className="font-extrabold">{username}</span>!
                </h2>
                <p className="mt-2 text-indigo-100">Your personal dashboard</p>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => navigate('/tests')}
                  className="px-6 py-2.5 bg-white text-indigo-600 rounded-lg font-semibold shadow-md hover:bg-indigo-50 transition-all duration-200 ease-in-out transform hover:scale-105"
                >
                  Tests
                </button>
                <button
                  onClick={handleLogout}
                  className="px-6 py-2.5 bg-red-500 text-white rounded-lg font-semibold shadow-md hover:bg-red-600 transition-all duration-200 ease-in-out transform hover:scale-105"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="px-6 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profile Card */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Profile Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">Username:</span>
                    <span className="font-medium text-indigo-700">{username}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">User ID:</span>
                    <span className="font-medium text-indigo-700">{userId}</span>
                  </div>
                </div>
              </div>

              {/* Stats Card */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-gray-600">Member Since</p>
                    <p className="text-2xl font-bold text-indigo-600">2024</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="text-2xl font-bold text-green-600">Active</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 