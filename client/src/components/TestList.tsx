import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
interface TestCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  questionsCount: number;
  estimatedTime: string;
  difficulty: 'Kerge' | 'Keskmine' | 'Raske';
}

const testCategories: TestCategory[] = [
  {
    id: 'sequence',
    title: 'Järjestuse Test',
    description: 'Testi oma võimet tuvastada mustreid ja järjestusi. Sobib hästi loogilise mõtlemise arendamiseks.',
    icon: 'M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11',
    questionsCount: 20,
    estimatedTime: '15-20 min',
    difficulty: 'Keskmine'
  },
  {
    id: 'pattern',
    title: 'Mustrite Test',
    description: 'Arenda oma võimet näha keerulisi mustreid ja seoseid. Ideaalne visuaalse mõtlemise arendamiseks.',
    icon: 'M2 10.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z',
    questionsCount: 15,
    estimatedTime: '20-25 min',
    difficulty: 'Raske'
  },
  {
    id: 'analogy',
    title: 'Analoogia Test',
    description: 'Paranda oma võimet leida seoseid erinevate kontseptsioonide vahel. Suurepärane abstraktse mõtlemise arendamiseks.',
    icon: 'M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5l2.404.961L10.404 2l-2.218-.887zm3.564 1.426L5.596 5 8 5.961 14.154 3.5l-2.404-.961zm3.25 1.7l-6.5 2.6v7.922l6.5-2.6V4.24zM7.5 14.762V6.838L1 4.239v7.923l6.5 2.6zM7.443.184a1.5 1.5 0 0 1 1.114 0l7.129 2.852A.5.5 0 0 1 16 3.5v8.662a1 1 0 0 1-.629.928l-7.185 2.874a.5.5 0 0 1-.372 0L.63 13.09a1 1 0 0 1-.63-.928V3.5a.5.5 0 0 1 .314-.464L7.443.184z',
    questionsCount: 25,
    estimatedTime: '25-30 min',
    difficulty: 'Keskmine'
  },
  {
    id: 'categorization',
    title: 'Kategoriseerimise Test',
    description: 'Õpi grupeerima ja kategoriseerima erinevaid elemente. Täiuslik loogilise struktureerimise oskuse arendamiseks.',
    icon: 'M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z',
    questionsCount: 18,
    estimatedTime: '15-20 min',
    difficulty: 'Kerge'
  }
];

export const TestList = () => {
  const navigate = useNavigate();

  const getDifficultyColor = (difficulty: TestCategory['difficulty']) => {
    switch (difficulty) {
      case 'Kerge':
        return 'text-green-600 bg-green-50';
      case 'Keskmine':
        return 'text-yellow-600 bg-yellow-50';
      case 'Raske':
        return 'text-red-600 bg-red-50';
    }
  };

  const handleStartTest = (categoryId: string) => {
    navigate(`/tests?category=${categoryId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="px-6 py-8 bg-gradient-to-r from-indigo-600 to-purple-600">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white">Testide Valik</h1>
                <p className="mt-2 text-indigo-100">
                  Vali test, mida soovid lahendada
                </p>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2.5 bg-white text-indigo-600 rounded-lg font-semibold shadow-md hover:bg-indigo-50 transition-all duration-200"
              >
                Tagasi Avalehele
              </button>
            </div>
          </div>
        </div>

        {/* Test Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testCategories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-indigo-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={category.icon}
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {category.title}
                    </h2>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(
                        category.difficulty
                      )}`}
                    >
                      {category.difficulty}
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 mb-4">{category.description}</p>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                  <span>{category.questionsCount} küsimust</span>
                  <span>{category.estimatedTime}</span>
                </div>

                <button
                  onClick={() => handleStartTest(category.id)}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors duration-200"
                >
                  Alusta Testi
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 