import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import testData from '../data/tests.json';

interface Test {
  id: number;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

export const Tests = () => {
  const navigate = useNavigate();
  const [currentTest, setCurrentTest] = useState<Test | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const handleStartTest = () => {
    const randomTest = testData.tests[Math.floor(Math.random() * testData.tests.length)];
    setCurrentTest(randomTest);
    setSelectedAnswer('');
    setShowExplanation(false);
    setIsCorrect(null);
  };

  const handleAnswerSubmit = () => {
    if (currentTest && selectedAnswer) {
      setIsCorrect(selectedAnswer === currentTest.correct_answer);
      setShowExplanation(true);
    }
  };

  const handleNextQuestion = () => {
    handleStartTest();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header Section */}
          <div className="px-6 py-8 bg-gradient-to-r from-blue-600 to-indigo-600">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-white">Abstract Thinking Tests</h2>
                <p className="mt-2 text-blue-100">Challenge your mind with these questions</p>
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
            <div className="max-w-3xl mx-auto">
              {!currentTest ? (
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6">Ready to test your abstract thinking?</h3>
                  <button
                    onClick={handleStartTest}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow-md hover:bg-blue-700 transition-all duration-200"
                  >
                    Start Test
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-blue-50 rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Question {currentTest.id}</h3>
                    <p className="text-lg text-gray-700 mb-6">{currentTest.question}</p>
                    <div className="grid gap-4">
                      {currentTest.options.map((option) => (
                        <button
                          key={option}
                          onClick={() => setSelectedAnswer(option)}
                          className={`p-4 text-left rounded-lg transition-all duration-200 ${
                            selectedAnswer === option
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-700 hover:bg-blue-50'
                          } ${showExplanation ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                          disabled={showExplanation}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  {!showExplanation && selectedAnswer && (
                    <div className="text-center">
                      <button
                        onClick={handleAnswerSubmit}
                        className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold shadow-md hover:bg-green-700 transition-all duration-200"
                      >
                        Submit Answer
                      </button>
                    </div>
                  )}

                  {showExplanation && (
                    <div className={`p-6 rounded-xl ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                      <h4 className={`font-semibold mb-2 ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                        {isCorrect ? 'Correct!' : 'Incorrect'}
                      </h4>
                      <p className="text-gray-700 mb-4">{currentTest.explanation}</p>
                      <button
                        onClick={handleNextQuestion}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow-md hover:bg-blue-700 transition-all duration-200"
                      >
                        Next Question
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 