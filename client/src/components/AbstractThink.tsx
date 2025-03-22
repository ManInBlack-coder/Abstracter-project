import {} from 'react';

interface Test {
  id: number;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

interface AbstractThinkProps {
  currentTest: Test | null;
  selectedAnswer: string;
  showExplanation: boolean;
  isCorrect: boolean | null;
  onSelectAnswer: (answer: string) => void;
  onSubmitAnswer: () => void;
  onNextQuestion: () => void;
  onEndTest: () => void;
  isLastQuestion: boolean;
}

export const AbstractThink = ({
  currentTest,
  selectedAnswer,
  showExplanation,
  isCorrect,
  onSelectAnswer,
  onSubmitAnswer,
  onNextQuestion,
  onEndTest,
  isLastQuestion
}: AbstractThinkProps) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="ml-4">
            <h2 className="text-lg font-medium text-gray-900">Abstraktne Mõtlemine</h2>
            <p className="text-sm text-gray-500">Vali õige vastus</p>
          </div>
        </div>
      </div>

      {/* Content */}
      {currentTest && (
        <div className="p-6 space-y-6">
          <div className="bg-gray-50 rounded-lg p-6">
            <p className="text-lg text-gray-900 font-medium mb-6">{currentTest.question}</p>
            <div className="space-y-3">
              {currentTest.options.map((option) => (
                <button
                  key={option}
                  onClick={() => onSelectAnswer(option)}
                  className={`w-full p-4 text-left rounded-lg transition-all duration-200 border ${
                    selectedAnswer === option
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  } ${showExplanation ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  disabled={showExplanation}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {!showExplanation && selectedAnswer && (
            <div className="flex justify-end">
              <button
                onClick={onSubmitAnswer}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 shadow-sm"
              >
                Kinnita Vastus
              </button>
            </div>
          )}

          {showExplanation && (
            <div className={`rounded-lg p-6 ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="flex items-center mb-4">
                {isCorrect ? (
                  <svg className="h-6 w-6 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6 text-red-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                <h4 className={`font-medium ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                  {isCorrect ? 'Õige vastus!' : 'Vale vastus'}
                </h4>
              </div>
              <p className="text-gray-700 mb-4">{currentTest.explanation}</p>
              <div className="flex justify-end">
                {!isLastQuestion ? (
                  <button
                    onClick={onNextQuestion}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 shadow-sm"
                  >
                    Järgmine Küsimus
                  </button>
                ) : (
                  <button
                    onClick={onEndTest}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 shadow-sm"
                  >
                    Lõpeta Test
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 