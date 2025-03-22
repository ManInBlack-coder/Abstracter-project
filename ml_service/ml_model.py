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
CORS(app)

class AbstractThinkingAnalyzer:
    def __init__(self):
        # LSTM mudel ajaliste mustrite jaoks
        self.sequence_model = Sequential([
            LSTM(64, input_shape=(None, 5)),  # 5 features per timestep
            Dense(32, activation='relu'),
            Dense(3, activation='softmax')  # 3 recommendation types
        ])
        
        # Random Forest mudel üldiste mustrite jaoks
        self.pattern_model = RandomForestClassifier(n_estimators=100)
        
    def analyze_patterns(self, results):
        # Analüüsime erinevaid mustreid:
        # 1. Vastamise kiirus
        # 2. Õigete vastuste muster
        # 3. Küsimuste tüübid, kus esineb raskusi
        features = self._extract_features(results)
        
        # Kombineerime mõlema mudeli tulemused
        sequence_pred = self.sequence_model.predict(features['temporal'])
        pattern_pred = self.pattern_model.predict_proba(features['static'])
        
        return self._combine_predictions(sequence_pred, pattern_pred)
    
    def _extract_features(self, results):
        # Eraldame olulised tunnused andmetest
        temporal_features = []
        static_features = []
        
        # Grupeerime tulemused küsimuste tüüpide järgi
        by_type = {}
        for result in results:
            q_type = result['questionType']
            if q_type not in by_type:
                by_type[q_type] = []
            by_type[q_type].append({
                'correct': result['correct'],
                'timeTaken': result['timeTaken']
            })
        
        # Arvutame statistikud iga tüübi kohta
        for q_type in by_type:
            correct_rate = sum(r['correct'] for r in by_type[q_type]) / len(by_type[q_type])
            avg_time = sum(r['timeTaken'] for r in by_type[q_type]) / len(by_type[q_type])
            static_features.extend([correct_rate, avg_time])
            
        return {
            'temporal': np.array([static_features]),  # Wrap in list for LSTM input
            'static': np.array([static_features])
        }
    
    def _combine_predictions(self, sequence_pred, pattern_pred):
        # Kombineerime ennustused ja genereerime soovitused
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
        
        analysis = analyzer.analyze_patterns(data['results'])
        response = {
            'userId': data['userId'],
            **analysis
        }
        
        return jsonify(response)
    except Exception as e:
        logger.error(f"Error in predict: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    logger.info("Starting Flask server...")
    app.run(port=8000, debug=True)
