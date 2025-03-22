import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import testData from '../data/tests.json';
import { AbstractThink } from './AbstractThink';

interface Test {
  id: number;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

interface TestSession {
  questions: Test[];
  currentQuestionIndex: number;
  correctAnswers: number;
  answers: { [key: number]: string };
}

export const Tests = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<TestSession | null>(null);
  const [currentTest, setCurrentTest] = useState<Test | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    // Proovi laadida salvestatud sessioon
    const savedSession = localStorage.getItem('testSession');
    if (savedSession) {
      const parsedSession = JSON.parse(savedSession);
      setSession(parsedSession);
      setCurrentTest(parsedSession.questions[parsedSession.currentQuestionIndex]);
    }
  }, []);

  const handleStartTest = () => {
    // Sega küsimused ja vali 30
    const shuffledQuestions = [...testData.tests]
      .sort(() => Math.random() - 0.5)
      .slice(0, 30);

    const newSession: TestSession = {
      questions: shuffledQuestions,
      currentQuestionIndex: 0,
      correctAnswers: 0,
      answers: {}
    };

    setSession(newSession);
    setCurrentTest(shuffledQuestions[0]);
    setSelectedAnswer('');
    setShowExplanation(false);
    setIsCorrect(null);

    // Salvesta sessioon
    localStorage.setItem('testSession', JSON.stringify(newSession));
  };

  const handleAnswerSubmit = () => {
    if (session && currentTest && selectedAnswer) {
      const isAnswerCorrect = selectedAnswer === currentTest.correct_answer;
      setIsCorrect(isAnswerCorrect);
      setShowExplanation(true);

      const updatedSession = {
        ...session,
        correctAnswers: isAnswerCorrect ? session.correctAnswers + 1 : session.correctAnswers,
        answers: {
          ...session.answers,
          [currentTest.id]: selectedAnswer
        }
      };

      setSession(updatedSession);
      localStorage.setItem('testSession', JSON.stringify(updatedSession));
    }
  };

  const handleNextQuestion = () => {
    if (session) {
      const nextIndex = session.currentQuestionIndex + 1;
      
      if (nextIndex < session.questions.length) {
        const updatedSession = {
          ...session,
          currentQuestionIndex: nextIndex
        };
        
        setSession(updatedSession);
        setCurrentTest(session.questions[nextIndex]);
        setSelectedAnswer('');
        setShowExplanation(false);
        setIsCorrect(null);
        
        localStorage.setItem('testSession', JSON.stringify(updatedSession));
      }
    }
  };

  const handleExitTest = () => {
    if (session) {
      navigate('/dashboard');
    }
  };

  const handleEndTest = () => {
    if (session) {
      localStorage.removeItem('testSession');
      alert(`Test lõpetatud! Õigeid vastuseid: ${session.correctAnswers} / ${session.questions.length}`);
      navigate('/dashboard');
    }
  };

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
                  Salvesta ja Välju
                </button>
              )}
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2.5 bg-white text-blue-600 rounded-lg font-semibold shadow-md hover:bg-blue-50 transition-all duration-200"
              >
                Tagasi Avalehele
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
                  Test koosneb 30 küsimusest. Saad testi igal ajal salvestada ja hiljem jätkata.
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