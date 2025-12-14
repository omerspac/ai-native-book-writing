from flask import Flask, request, jsonify
import random
import time

app = Flask(__name__)

@app.route('/qwen-embeddings', methods=['POST'])
def generate_embeddings():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Invalid JSON"}), 400

        texts = data.get('input')
        model = data.get('model')

        if not isinstance(texts, list) or not texts:
            return jsonify({"error": "'input' must be a non-empty list of strings"}), 400
        if not model:
            return jsonify({"error": "'model' is required"}), 400

        print(f"Mock Qwen Embedding Server received request for model '{model}' with {len(texts)} texts.")
        
        embeddings_list = []
        embedding_dimension = 768 # Matching the expected dimension in book_embedding.py

        for i, text in enumerate(texts):
            # Generate a dummy embedding
            # For demonstration, let's make them distinct but consistent for each text
            dummy_embedding = [random.uniform(-0.1, 0.1) + i * 0.001 for _ in range(embedding_dimension)]
            embeddings_list.append({"embedding": dummy_embedding})
            
        # Simulate some processing time
        time.sleep(0.1 * len(texts)) 

        return jsonify({"data": embeddings_list}), 200

    except Exception as e:
        print(f"Error in mock server: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("Starting Mock Qwen Embedding Server on http://localhost:8000/qwen-embeddings")
    print("Ensure QWEN_API_ENDPOINT is set to http://localhost:8000/qwen-embeddings in your .env")
    print("Ensure QWEN_API_KEY is set to any non-empty string in your .env")
    app.run(host='0.0.0.0', port=8000)
