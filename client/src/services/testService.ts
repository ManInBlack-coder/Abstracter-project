interface TestResult {
    questionType: string;
    correct: boolean;
    timeTaken: number;
}

interface MLResponse {
    userId: string;
    recommendationText: string;
    recommendationType: string;
    confidenceScore: number;
    strengths: string[];
    weaknesses: string[];
}

interface Test {
    id: number;
    question: string;
    options: string[];
    correct_answer: string;
    explanation: string;
    category: string;
}

class TestService {
    private readonly API_URL = 'http://localhost:8080/api';

    async submitTestResults(userId: string, results: TestResult[]): Promise<MLResponse> {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            // Kontrollime, et kõigil tulemustel oleks kategooria (questionType)
            const validResults = results.map(result => {
                // Tagame, et questionType on alati olemas
                if (!result.questionType) {
                    console.warn('Test result missing questionType, using default category');
                    return { ...result, questionType: 'PATTERN' };
                }
                return result;
            });

            const response = await fetch(`${this.API_URL}/submit-test`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    userId,
                    results: validResults
                })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            // Saadame tulemused ML teenusele
            const mlResponse = await response.json();
            
            // Salvestame soovitused localStorage'i
            if (mlResponse) {
                localStorage.setItem('recommendation', JSON.stringify(mlResponse));
            }
            
            return mlResponse;
        } catch (error) {
            console.error('Error submitting test results:', error);
            throw error;
        }
    }

    // Võta küsimuse kategooria otse testi objektist
    determineQuestionType(test: Test): string {
        return test.category;
    }
}

export const testService = new TestService(); 