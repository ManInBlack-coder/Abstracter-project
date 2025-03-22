import { useNavigate } from 'react-router-dom';

export const Tests = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header Section */}
          <div className="px-6 py-8 bg-gradient-to-r from-blue-600 to-indigo-600">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-white">Tests</h2>
                <p className="mt-2 text-blue-100">Manage your tests here</p>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2.5 bg-white text-blue-600 rounded-lg font-semibold shadow-md hover:bg-blue-50 transition-all duration-200 ease-in-out transform hover:scale-105"
              >
                Back to Dashboard
              </button>
            </div>
          </div>

          {/* Content Section */}
          <div className="px-6 py-8">
            <div className="grid gap-6">
              {/* Test List */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Tests</h3>
                <div className="space-y-4">
                  {/* Sample Test Items */}
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h4 className="font-medium text-gray-800">Test #1</h4>
                    <p className="text-gray-600 text-sm mt-1">Status: Pending</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h4 className="font-medium text-gray-800">Test #2</h4>
                    <p className="text-gray-600 text-sm mt-1">Status: Completed</p>
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