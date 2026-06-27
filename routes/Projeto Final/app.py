from flask import Flask, request, jsonify
import sys
import json
from pathlib import Path
from algoritmos.nearest_neighbor import nearest_neighbor, Node, CONSUMPTION

app = Flask(__name__)

@app.route('/optimize', methods=['POST'])
def optimize_route():
    try:
        payload = request.get_json()
        if not payload or 'nodes' not in payload or 'vehicles' not in payload:
            return jsonify({'error': 'Invalid payload'}), 400

        # Construct Node objects
        nodes = [Node(n) for n in payload["nodes"]]
        vehicle = payload["vehicles"][0]

        # Use the nearest neighbor algorithm
        route, mat = nearest_neighbor(nodes, vehicle)

        # route is a list of node IDs like [0, 2, 1, 0]
        # Return the ordered list of node IDs
        ordered_ids = [nodes[i].id for i in route]

        # Compute total distance and energy
        dist_total = sum(mat[route[k]][route[k + 1]] for k in range(len(route) - 1))
        energia = dist_total * CONSUMPTION

        return jsonify({
            'route': ordered_ids,
            'distance_km': round(dist_total, 2),
            'energy_kwh': round(energia, 2)
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
