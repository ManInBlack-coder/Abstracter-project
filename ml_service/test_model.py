import requests

def test_server():
    base_url = "http://localhost:8000"
    
    # Test GET endpoint
    try:
        response = requests.get(f"{base_url}/test")
        print("\nTesting GET /test:")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to server. Is it running?")
    except Exception as e:
        print(f"GET Error: {str(e)}")

    # Test POST endpoint
    try:
        test_data = {
            "userId": 1,
            "results": [{"questionType": "TEST", "correct": True, "timeTaken": 5}]
        }
        
        response = requests.post(
            f"{base_url}/predict",
            json=test_data,
            headers={'Content-Type': 'application/json'}
        )
        
        print("\nTesting POST /predict:")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to server. Is it running?")
    except Exception as e:
        print(f"POST Error: {str(e)}")

if __name__ == "__main__":
    test_server() 