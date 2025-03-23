interface TestResult {
    questionType: string;
    correct: boolean;
    timeTaken: number;
}

interface MLResponse {
    userId: string;
    recommendations: string[];
    strengths: string[];
    weaknesses: string[];
    confidence_score: number;
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

            const response = await fetch(`${this.API_URL}/submit-test`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    userId,
                    results
                })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            return await response.json();
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