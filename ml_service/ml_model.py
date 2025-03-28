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
            LSTM(64, input_shape=(None, 4), return_sequences=False),  # 4 features pärinevad test_result tabelist
            Dense(32, activation='relu'),
            Dense(3, activation='softmax')
        ])
        
        # Treeni mudelid näidisandmetega (reaalsuses oleks need päriselt test_result tabelist)
        # Näidisandmed: [correct_rate, avg_time, question_count, type_ratio]
        # Iga kategooria kohta demo andmestik
        self.categories = ["SEQUENCE", "PATTERN", "ANALOGY", "CATEGORIZATION"]
        
        # Treenime mudeli kategooriate kaupa
        X_train_by_category = {
            "SEQUENCE": np.array([
                [0.8, 30, 5, 0.6],
                [0.4, 45, 5, 0.4],
                [0.9, 25, 5, 0.8]
            ]),
            "PATTERN": np.array([
                [0.7, 35, 5, 0.5],
                [0.5, 40, 5, 0.3],
                [0.8, 30, 5, 0.7]
            ]),
            "ANALOGY": np.array([
                [0.6, 40, 5, 0.4],
                [0.3, 50, 5, 0.2],
                [0.7, 35, 5, 0.5]
            ]),
            "CATEGORIZATION": np.array([
                [0.5, 45, 5, 0.3],
                [0.2, 60, 5, 0.1],
                [0.6, 40, 5, 0.4]
            ])
        }
        
        # Vastavad sildid: 0 = nõrk, 1 = keskmine, 2 = tugev
        y_train_by_category = {
            "SEQUENCE": np.array([2, 1, 2]),
            "PATTERN": np.array([2, 1, 2]),
            "ANALOGY": np.array([1, 0, 2]),
            "CATEGORIZATION": np.array([1, 0, 1])
        }
        
        # Treeni LSTM iga kategooria jaoks demo andmetega
        # Pärast tabelis olevate andmete kasutamiseks
        all_X = []
        all_y = []
        
        for category in self.categories:
            X = X_train_by_category[category]
            y = y_train_by_category[category]
            all_X.append(X)
            all_y.extend(y)
        
        # Ühendame kõik andmed üheks treeningandmestikuks
        X_lstm = np.vstack(all_X).reshape(-1, 1, 4)  # Muudame sobivaks LSTM-i jaoks (reshape to: [samples, timesteps, features])
        y_lstm = np.eye(3)[np.array(all_y)]  # One-hot encoding
        
        # Kompileeri ja treeni mudel
        self.sequence_model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
        self.sequence_model.fit(X_lstm, y_lstm, epochs=50, verbose=0)
        
        logger.debug("LSTM mudel on treenitud")
        
    def analyze_patterns(self, results, user_id):
        logger.debug(f"Analyzing patterns for user_id {user_id} with results: {results}")
        
        # Grupeeri tulemused kategooria järgi
        results_by_category = {}
        for result in results:
            category = result['questionType']
            if category not in results_by_category:
                results_by_category[category] = []
            results_by_category[category].append(result)
        
        # Analüüsi iga kategooria jaoks
        category_results = {}
        predictions = {}
        
        for category in self.categories:
            if category in results_by_category:
                category_data = results_by_category[category]
                features = self._extract_features(category_data)
                
                # Kasuta LSTM mudelit ennustamiseks
                sequence_data = np.array([features]).reshape(1, 1, 4)  # Reshape for LSTM [batch, timesteps, features]
                prediction = self.sequence_model.predict(sequence_data, verbose=0)[0]
                
                # Salvesta tulemused
                predictions[category] = prediction
                
                # Määra tase (0=nõrk, 1=keskmine, 2=tugev)
                level = np.argmax(prediction)
                category_results[category] = {
                    'level': level,
                    'confidence': float(prediction[level]),
                    'features': features
                }
        
        return self._generate_recommendations(category_results, user_id)
    
    def _extract_features(self, results):
        # Eraldame olulised tunnused andmetest
        total_time = 0
        total_correct = 0
        
        for result in results:
            total_time += result['timeTaken']
            total_correct += 1 if result['correct'] else 0
        
        # Arvutame statistikud
        correct_rate = total_correct / len(results) if len(results) > 0 else 0
        avg_time = total_time / len(results) if len(results) > 0 else 0
        type_ratio = 1.0  # Kuna nüüd analüüsime kategooriapõhiselt, siis väärtus on alati 1
        
        # Loome tunnusvektori
        features = [correct_rate, avg_time, len(results), type_ratio]
        
        return features
    
    def _generate_recommendations(self, category_results, user_id):
        recommendations = []
        strengths = []
        weaknesses = []
        overall_confidence = 0.0
        recommendation_text = ""
        
        for category, result in category_results.items():
            level = result['level']
            confidence = result['confidence']
            overall_confidence += confidence
            
            if level == 2:  # Tugev
                strengths.append(category)
            elif level == 0:  # Nõrk
                weaknesses.append(category)
                if category == "SEQUENCE":
                    recommendations.append("Harjutage rohkem järjestuste ja jadade tuvastamise ülesandeid")
                elif category == "PATTERN":
                    recommendations.append("Keskenduge mustrite tuvastamise ülesannetele")
                elif category == "ANALOGY":
                    recommendations.append("Pöörake rohkem tähelepanu analoogiate loogilisele analüüsile")
                elif category == "CATEGORIZATION":
                    recommendations.append("Harjutage mõistete kategoriseerimist ja grupeerimist")
        
        # Kui on kategooriaid, mida pole analüüsitud, lisame üldise soovituse
        if len(recommendations) == 0:
            if len(strengths) > 0:
                recommendations.append(f"Jätkake samamoodi! Teie tugevused on {', '.join(strengths)}")
            else:
                recommendations.append("Harjutage erinevat tüüpi ülesandeid kõikides kategooriates")
        
        # Koosta põhisoovitus
        if len(recommendations) > 0:
            recommendation_text = recommendations[0]
        
        # Arvuta keskmine usaldusscore
        if len(category_results) > 0:
            overall_confidence = overall_confidence / len(category_results)
        
        # Määra soovituse tüüp
        if len(strengths) > len(weaknesses):
            recommendation_type = "Arenev"
        elif len(weaknesses) > 0:
            recommendation_type = "Vajab tähelepanu"
        else:
            recommendation_type = "Tasakaalus"
        
        response = {
            'userId': user_id,
            'recommendationText': recommendation_text,
            'recommendationType': recommendation_type,
            'confidenceScore': float(overall_confidence),
            'strengths': strengths,
            'weaknesses': weaknesses
        }
        
        logger.debug(f"Generated recommendation: {response}")
        return response

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
        
        if not data or 'results' not in data or 'userId' not in data:
            return jsonify({"error": "Invalid request data - results and userId are required"}), 400
            
        analysis = analyzer.analyze_patterns(data['results'], data['userId'])
        return jsonify(analysis)
    except Exception as e:
        logger.error(f"Error in predict: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    logger.info("Starting Flask server...")
    app.run(port=5001, debug=True, host='0.0.0.0')
