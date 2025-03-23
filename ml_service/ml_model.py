from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
import numpy as np
from keras.models import Sequential
from keras.layers import LSTM, Dense
from sklearn.ensemble import RandomForestClassifier

# Seadista logimine
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

class AbstractThinkingAnalyzer:
    def __init__(self):
        # LSTM mudel ajaliste mustrite jaoks
        self.sequence_model = Sequential([
            LSTM(64, input_shape=(1, 4)),  # 4 features: correct_rate, avg_time, question_count, type_ratio
            Dense(32, activation='relu'),
            Dense(3, activation='softmax')
        ])
        
        # Random Forest mudel üldiste mustrite jaoks
        self.pattern_model = RandomForestClassifier(n_estimators=100)
        
        # Treeni mudelid näidisandmetega
        # Näidisandmed: [correct_rate, avg_time, question_count, type_ratio]
        X_train = np.array([
            [0.8, 30, 5, 0.6],  # Hea sooritus
            [0.4, 45, 5, 0.4],  # Keskmine sooritus
            [0.2, 60, 5, 0.2],  # Nõrk sooritus
            [0.9, 25, 5, 0.8],  # Väga hea sooritus
            [0.3, 50, 5, 0.3]   # Alla keskmise sooritus
        ])
        
        # Sildid: 0 = nõrk, 1 = keskmine, 2 = tugev
        y_train = np.array([2, 1, 0, 2, 0])
        
        # Treeni Random Forest
        self.pattern_model.fit(X_train, y_train)
        
        # Treeni LSTM (lihtsustatud)
        X_lstm = X_train.reshape(X_train.shape[0], 1, 4)
        y_lstm = np.eye(3)[y_train]  # One-hot encoding
        self.sequence_model.compile(optimizer='adam', loss='categorical_crossentropy')
        self.sequence_model.fit(X_lstm, y_lstm, epochs=50, verbose=0)
        
    def analyze_patterns(self, results):
        logger.debug(f"Analyzing patterns for results: {results}")
        features = self._extract_features(results)
        logger.debug(f"Extracted features: {features}")
        
        # Kombineerime mõlema mudeli tulemused
        sequence_pred = self.sequence_model.predict(features['temporal'], verbose=0)
        pattern_pred = self.pattern_model.predict_proba([features['static']])
        
        return self._combine_predictions(sequence_pred, pattern_pred)
    
    def _extract_features(self, results):
        # Eraldame olulised tunnused andmetest
        by_type = {}
        total_time = 0
        total_correct = 0
        
        # Grupeerime tulemused küsimuste tüüpide järgi
        for result in results:
            q_type = result['questionType']
            if q_type not in by_type:
                by_type[q_type] = []
            by_type[q_type].append({
                'correct': result['correct'],
                'timeTaken': result['timeTaken']
            })
            total_time += result['timeTaken']
            total_correct += 1 if result['correct'] else 0
        
        # Arvutame üldised statistikud
        correct_rate = total_correct / len(results)
        avg_time = total_time / len(results)
        type_count = len(by_type)
        type_ratio = type_count / len(results)
        
        # Loome tunnusvektorid
        features = [correct_rate, avg_time, len(results), type_ratio]
        temporal_features = np.array([features]).reshape(1, 1, 4)  # Reshape for LSTM (batch_size, timesteps, features)
        
        return {
            'temporal': temporal_features,
            'static': features
        }
    
    def _combine_predictions(self, sequence_pred, pattern_pred):
        recommendations = []
        strengths = []
        weaknesses = []
        
        # Analüüsime tugevusi ja nõrkusi
        if pattern_pred[0][0] > 0.6:  # Hea mustrite tuvastamine
            strengths.append("mustrite tuvastamine")
        elif pattern_pred[0][0] < 0.4:  # Nõrk mustrite tuvastamine
            weaknesses.append("mustrite tuvastamine")
            recommendations.append("Harjuta rohkem mustrite tuvastamise ülesandeid")
            
        if sequence_pred[0][1] > 0.6:  # Hea järjestuste mõistmine
            strengths.append("järjestuste mõistmine")
        elif sequence_pred[0][1] < 0.4:  # Nõrk järjestuste mõistmine
            weaknesses.append("järjestuste mõistmine")
            recommendations.append("Keskendu järjestuste ja jadade ülesannetele")
        
        # Lisa üldised soovitused
        if len(strengths) == 0:
            recommendations.append("Harjuta erinevat tüüpi ülesandeid")
        
        return {
            'recommendations': recommendations,
            'strengths': strengths,
            'weaknesses': weaknesses,
            'confidence_score': float(np.mean([sequence_pred.max(), pattern_pred.max()]))
        }

analyzer = AbstractThinkingAnalyzer()

@app.route('/test', methods=['GET'])
def test():
    logger.debug("Processing /test endpoint")
    return jsonify({"message": "Server is working!"})

@app.route('/predict', methods=['POST'])
def predict():
    logger.debug("Processing /predict endpoint")
    try:
        data = request.get_json()
        logger.debug(f"Received data: {data}")
        
        if not data or 'results' not in data:
            return jsonify({"error": "Invalid request data"}), 400
            
        analysis = analyzer.analyze_patterns(data['results'])
        response = {
            'userId': data.get('userId'),
            **analysis
        }
        
        return jsonify(response)
    except Exception as e:
        logger.error(f"Error in predict: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    logger.info("Starting Flask server...")
    app.run(port=5001, debug=True, host='0.0.0.0')
