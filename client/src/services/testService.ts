interface TestResult {
    questionType: string;
    correct: boolean;
    timeTaken: number;
}

interface MLResponse {
    userId: number;
    recommendations: string[];
    strengths: string[];
    weaknesses: string[];
    confidence_score: number;
}

class TestService {
    private readonly ML_API_URL = 'http://localhost:8000';

    async submitTestResults(userId: number, results: TestResult[]): Promise<MLResponse> {
        try {
            const response = await fetch(`${this.ML_API_URL}/predict`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
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

    // Määra küsimuse tüüp vastavalt küsimuse sisule
    determineQuestionType(question: string): string {
        if (question.includes('sequence') || question.includes('pattern') || question.includes('next')) {
            return 'SEQUENCE';
        } else if (question.includes('analogy') || question.includes('is to')) {
            return 'ANALOGY';
        } else if (question.toLowerCase().includes('which') && 
                  (question.includes('belong') || question.includes('different') || question.includes('odd'))) {
            return 'CATEGORIZATION';
        }
        return 'PATTERN'; // Default tüüp
    }
}

export const testService = new TestService(); 