import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { Client, Message } from '@stomp/stompjs';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import SockJS from 'sockjs-client';
import { LandingPage } from './LandingPage';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

interface CategoryStats {
  category: string;
  averagePercentage: number;
  averageTimeSeconds: number;
  totalAttempts: number;
  userId: string;
}

// Abifunktsioonid localStorage'i jaoks
const getStoredStats = (): CategoryStats[] => {
  const storedStats = localStorage.getItem(`stats`);
  return storedStats ? JSON.parse(storedStats) : [];
};

const setStoredStats = (stats: CategoryStats[]) => {
  localStorage.setItem(`stats`, JSON.stringify(stats));
};

const getStoredRecommendation = (): any => {
  const storedRecommendation = localStorage.getItem(`recommendation`);
  return storedRecommendation ? JSON.parse(storedRecommendation) : null;
};

const setStoredRecommendation = (recommendation: any) => {
  localStorage.setItem(`recommendation`, JSON.stringify(recommendation));
};

export const Dashboard = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [stats, setStats] = useState<CategoryStats[]>([]);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeDashboard = async () => {
      const maxRetries = 10;
      const retryDelay = 2000;

      const fetchDataWithRetry = async (retryCount = 0) => {
        console.log(`Fetch attempt ${retryCount + 1}/${maxRetries}`);
        
        const token = localStorage.getItem('token');
        const id = localStorage.getItem('userId');

        if (!token || !id) {
          console.log('Missing credentials, waiting before retry...');
          if (retryCount < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            return fetchDataWithRetry(retryCount + 1);
          } else {
            console.log('Max retries reached, redirecting to login');
            navigate('/login');
            return;
          }
        }

        try {
          setUserId(id);
          setUsername(localStorage.getItem('username'));

          // Lae salvestatud andmed kohe
          const savedStats = getStoredStats();
          if (savedStats.length > 0) {
            setStats(savedStats);
            setIsLoading(false);
          }

          const savedRecommendation = getStoredRecommendation();
          if (savedRecommendation) {
            setRecommendation(savedRecommendation);
          }

          const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
            debug: function (str: string) {
              console.log('WebSocket Debug:', str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            connectHeaders: {
              Authorization: `Bearer ${token}`
            },
            beforeConnect: () => {
              const currentToken = localStorage.getItem('token');
              if (currentToken) {
                client.connectHeaders = {
                  Authorization: `Bearer ${currentToken}`
                };
              }
            },
            onConnect: async () => {
              console.log('Connected to WebSocket');
              
              try {
                // Subscribe to stats updates
                client.subscribe('/topic/stats/' + id, (message: Message) => {
                  console.log('Received stats update:', message.body);
                  const newStats = JSON.parse(message.body) as CategoryStats[];
                  setStats(newStats);
                  setStoredStats(newStats); // Salvesta uued andmed localStorage'i
                }, { Authorization: `Bearer ${token}` });

                // Fetch initial data if not in localStorage
                if (savedStats.length === 0) {
                  console.log('Fetching initial stats data...');
                  const statsResponse = await fetch(`http://localhost:8080/api/stats/${id}`, {
                    method: 'GET',
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json',
                      'Accept': 'application/json'
                    }
                  });

                  if (statsResponse.ok) {
                    const statsData = await statsResponse.json();
                    console.log('Initial stats data received:', statsData);
                    setStats(statsData);
                    setStoredStats(statsData);
                  }
                }

                // Fetch recommendation if not in localStorage
                if (!savedRecommendation) {
                  console.log('Fetching initial recommendation data...');
                  const recommendationResponse = await fetch(`http://localhost:8080/api/recommendation/${id}`, {
                    method: 'GET',
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json',
                      'Accept': 'application/json'
                    }
                  });

                  if (recommendationResponse.ok) {
                    const recommendationData = await recommendationResponse.json();
                    console.log('Initial recommendation data received');
                    setRecommendation(recommendationData);
                    setStoredRecommendation(recommendationData);
                  }
                }

                setIsLoading(false);
              } catch (error) {
                console.error('Error fetching data:', error);
                // Kui andmete laadimine ebaõnnestub, aga meil on cached andmed, siis näitame neid
                if (savedStats.length > 0) {
                  setIsLoading(false);
                } else if (retryCount < maxRetries) {
                  console.log(`Retry attempt ${retryCount + 1} of ${maxRetries}`);
                  await new Promise(resolve => setTimeout(resolve, retryDelay));
                  return fetchDataWithRetry(retryCount + 1);
                }
              }
            },
            onStompError: (frame) => {
              console.error('STOMP error:', frame);
              // Kui on cached andmed, siis näitame neid
              if (savedStats.length > 0) {
                setIsLoading(false);
              }
            },
            onWebSocketError: (event) => {
              console.error('WebSocket error:', event);
              // Kui on cached andmed, siis näitame neid
              if (savedStats.length > 0) {
                setIsLoading(false);
              }
            }
          });

          client.activate();

          return () => {
            if (client.connected) {
              client.deactivate();
            }
          };
        } catch (error) {
          console.error('Error in dashboard initialization:', error);
          // Kui on cached andmed, siis näitame neid
          const cachedStats = getStoredStats();
          if (cachedStats.length > 0) {
            setStats(cachedStats);
            setIsLoading(false);
          } else if (retryCount < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            return fetchDataWithRetry(retryCount + 1);
          }
        }
      };

      await fetchDataWithRetry();
    };

    initializeDashboard();
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
    navigate('/landingpage');
  };

  const pieChartData = {
    labels: stats.map(s => s.category),
    datasets: [
      {
        data: stats.map(s => s.averagePercentage),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const timeChartData = {
    labels: stats.map(s => s.category),
    datasets: [
      {
        label: 'Keskmine vastamise aeg (sekundites)',
        data: stats.map(s => s.averageTimeSeconds),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header Section */}
            <div className="px-6 py-8 bg-gradient-to-r from-indigo-600 to-purple-600">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold text-white">
                    Tere tulemast tagasi, <span className="font-extrabold">{username}</span>!
                  </h2>
                  <p className="mt-2 text-indigo-100">Sinu tulemuste ülevaade</p>
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={() => navigate('/test-list')}
                    className="px-6 py-2.5 bg-white text-indigo-600 rounded-lg font-semibold shadow-md hover:bg-indigo-50 transition-all duration-200 ease-in-out transform hover:scale-105"
                  >
                    Testid
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-6 py-2.5 bg-red-500 text-white rounded-lg font-semibold shadow-md hover:bg-red-600 transition-all duration-200 ease-in-out transform hover:scale-105"
                  >
                    Logi välja
                  </button>
                </div>
              </div>
            </div>
         {/* Soovitused */}
         {recommendation && (
                  <div className="md:col-span-2 bg-white rounded-xl p-6 shadow-lg mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Viimase testi soorituse põhjal soovitused</h3>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <div className="flex-shrink-0">
                          <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <p className="ml-3 text-sm text-blue-700">
                          {recommendation.recommendationText}
                        </p>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">
                          Tugevused: {recommendation.recommendationType}
                        </p>
                        <p className="text-sm text-gray-600">
                          Usaldusscore: {(recommendation.confidenceScore * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                )}
            {/* Content Section */}
            <div className="px-6 py-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tulemuste graafik */}
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Kategooriate Tulemused</h3>
                  {stats.length > 0 ? (
                    <Pie data={pieChartData} />
                  ) : (
                    <p className="text-gray-500">Andmed puuduvad</p>
                  )}
                </div>

                {/* Aja graafik */}
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Vastamise Ajad</h3>
                  {stats.length > 0 ? (
                    <Bar data={timeChartData} />
                  ) : (
                    <p className="text-gray-500">Andmed puuduvad</p>
                  )}
                </div>

                {/* Testide koguarv */}
                <div className="md:col-span-2 bg-white rounded-xl p-6 shadow-lg mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Testid</h3>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-lg text-gray-800">
                      Kokku sooritatud teste: {stats.reduce((sum, stat) => sum + stat.totalAttempts / 4, 0)}
                    </p>
                  </div>
                </div>

              

                {/* Detailne statistika */}
                <div className="md:col-span-2 bg-white rounded-xl p-6 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Detailne Statistika</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {stats.map((stat) => (
                      <div key={stat.category} className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-medium text-gray-800">{stat.category}</h3>
                        <p className="text-sm text-gray-600 ">Keskmine tulemus: {stat.averagePercentage.toFixed(1)}%</p>
                        <p className="text-sm text-gray-600 ">Keskmine aeg: {stat.averageTimeSeconds.toFixed(1)}s</p>
                        <p className="text-sm text-gray-600 ">Katsete arv: {stat.totalAttempts}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 