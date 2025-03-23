import  { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { testService } from '../services/testService';
import { authService } from '../services/authService';
import testsData from '../data/tests.json';
import { AbstractThink } from './AbstractThink';

interface Test {
  id: number;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  category: string;
}

interface TestSession {
  questions: Test[];
  currentQuestionIndex: number;
  correctAnswers: number;
}

interface TestResult {
  questionType: string;
  correct: boolean;
  timeTaken: number;
}

interface MLPrediction {
  recommendations: string[];
  strengths: string[];
  weaknesses: string[];
  confidence_score: number;
}

export const Tests = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<TestSession | null>(null);
  const [currentTest, setCurrentTest] = useState<Test | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [prediction, setPrediction] = useState<MLPrediction | null>(null);
  const [showPrediction, setShowPrediction] = useState(false);

  useEffect(() => {
    // Kontrolli autentimist
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    // Proovi laadida salvestatud sessioon
    const savedSession = localStorage.getItem('testSession');
    if (savedSession) {
      const parsedSession = JSON.parse(savedSession);
      setSession(parsedSession);
      setCurrentTest(parsedSession.questions[parsedSession.currentQuestionIndex]);
    }
  }, [navigate]);

  const handleStartTest = () => {
    console.log('handleStartTest called');
    console.log('testsData:', testsData);
    
    // Vali 30 juhuslikku küsimust
    const allQuestions = [...testsData.tests]; // Kopeeri kõik küsimused
    const selectedQuestions: Test[] = [];
    
    // Vali juhuslikult 30 küsimust
    for (let i = 0; i < 20 && allQuestions.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * allQuestions.length);
      selectedQuestions.push(allQuestions[randomIndex]);
      allQuestions.splice(randomIndex, 1); // Eemalda valitud küsimus
    }
    
    // Loo uus sessioon 30 küsimusega
    const newSession = {
      questions: selectedQuestions,
      currentQuestionIndex: 0,
      correctAnswers: 0
    };
    console.log('Creating new session with questions:', newSession);
    setSession(newSession);
    
    // Sea esimene küsimus aktiivseks
    setCurrentTest(selectedQuestions[0]);
    setSelectedAnswer('');
    setShowExplanation(false);
    setIsCorrect(null);
    setStartTime(Date.now());
    console.log('Test alustatud');
  };

  const handleAnswerSubmit = async () => {
    if (!currentTest || !selectedAnswer) return;

    const timeTaken = (Date.now() - startTime) / 1000; // Aeg sekundites
    const correct = selectedAnswer === currentTest.correct_answer;
    
    setIsCorrect(correct);
    setShowExplanation(true);

    // Lisa tulemus
    const result: TestResult = {
      questionType: testService.determineQuestionType(currentTest),
      correct,
      timeTaken
    };
    
    setTestResults(prev => [...prev, result]);

    // Kui on 20 vastust olemas, küsi ennustust
    if (testResults.length >= 19) {
      try {
        const userId = authService.getUserId();
        if (!userId) {
          throw new Error('User not authenticated');
        }
        const mlResponse = await testService.submitTestResults(userId, [...testResults, result]);
        setPrediction(mlResponse);
        setShowPrediction(true);
      } catch (error) {
        console.error('Error getting ML prediction:', error);
      }
    }
  };

  const handleNextQuestion = () => {
    if (showPrediction) {
      setTestResults([]);
      setPrediction(null);
      setShowPrediction(false);
    }

    if (session) {
      const nextIndex = session.currentQuestionIndex + 1;
      if (nextIndex < session.questions.length) {
        // Liigume järgmise küsimuse juurde
        setSession({
          ...session,
          currentQuestionIndex: nextIndex,
          correctAnswers: isCorrect ? session.correctAnswers + 1 : session.correctAnswers
        });
        setCurrentTest(session.questions[nextIndex]);
        setSelectedAnswer('');
        setShowExplanation(false);
        setIsCorrect(null);
        setStartTime(Date.now());
      } else {
        // Test on lõppenud
        handleEndTest();
      }
    }
  };

  const handleExitTest = () => {
    if (session) {
      navigate('/test-list');
    }
  };

  const handleEndTest = () => {
    if (session) {
      localStorage.removeItem('testSession');
      alert(`Test lõpetatud! Õigeid vastuseid: ${session.correctAnswers} / ${session.questions.length}`);
      navigate('/dashboard');
    }
  };

  if (showPrediction && prediction) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-4">Sinu tulemuste analüüs</h2>
        
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Soovitused:</h3>
          <ul className="list-disc pl-5">
            {prediction.recommendations.map((rec, index) => (
              <li key={index} className="mb-2">{rec}</li>
            ))}
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Tugevused:</h3>
          <ul className="list-disc pl-5">
            {prediction.strengths.length > 0 ? 
              prediction.strengths.map((strength, index) => (
                <li key={index} className="mb-2">{strength}</li>
              )) : 
              <p>Kahjuks ei tuvastatud tugevusi</p>
            }
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Arendamist vajavad oskused:</h3>
          <ul className="list-disc pl-5">
            {prediction.weaknesses.map((weakness, index) => (
              <li key={index} className="mb-2">{weakness}</li>
            ))}
          </ul>
        </div>

        <div className="mb-6">
          <p className="text-lg">
            Ennustuse usaldusscore: {(prediction.confidence_score * 100).toFixed(1)}%
          </p>
        </div>

        <button
          onClick={handleNextQuestion}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Lõpetada test
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-blue-600 rounded-t-2xl p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Abstraktse Mõtlemise Test</h1>
              {session && (
                <p className="mt-2 text-blue-100">
                  Küsimus {session.currentQuestionIndex + 1} / {session.questions.length}
                </p>
              )}
            </div>
            <div className="space-x-4">
              {session && (
                <button
                  onClick={handleExitTest}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold shadow-md hover:bg-blue-700 transition-all duration-200"
                >
                  Välju
                </button>
              )}
              <button
                onClick={() => navigate('/test-list')}
                className="px-6 py-2.5 bg-white text-blue-600 rounded-lg font-semibold shadow-md hover:bg-blue-50 transition-all duration-200"
              >
                Tagasi testide valikusse
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-gray-100 p-8 rounded-b-2xl shadow-lg">
          <div className="max-w-3xl mx-auto">
            {!session ? (
              <div className="bg-white rounded-xl p-8 text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">
                  Valmis alustama abstraktse mõtlemise testi?
                </h3>
                <p className="text-gray-600 mb-8">
                  Test koosneb 20 küsimusest. See Test aitab teil kinnistada oma abstraktse mõtlemise oskusi.
                </p>
                <button
                  onClick={handleStartTest}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow-md hover:bg-blue-700 transition-all duration-200"
                >
                  Alusta Testi
                </button>
              </div>
            ) : (
              <AbstractThink
                currentTest={currentTest}
                selectedAnswer={selectedAnswer}
                showExplanation={showExplanation}
                isCorrect={isCorrect}
                onSelectAnswer={setSelectedAnswer}
                onSubmitAnswer={handleAnswerSubmit}
                onNextQuestion={handleNextQuestion}
                onEndTest={handleEndTest}
                isLastQuestion={session.currentQuestionIndex === session.questions.length - 1}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 