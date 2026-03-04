"""
app.py – Flask entry point for the GridWorld application.
"""

from flask import Flask, jsonify, render_template, request

from grid import generate_random_policy, policy_evaluation

app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/generate", methods=["POST"])
def api_generate():
    """
    Body JSON:
    {
        "n": int,
        "start": [row, col],
        "goal":  [row, col],
        "obstacles": [[row, col], ...]   // list of [r,c] pairs
    }

    Response:
    {
        "policy": { "r,c": arrow, ... },
        "values":  { "r,c": float, ... }
    }
    """
    data = request.get_json(force=True)
    n = int(data["n"])
    start = data["start"]        # [r, c]
    goal = data["goal"]          # [r, c]
    obstacles = [f"{o[0]},{o[1]}" for o in data.get("obstacles", [])]

    policy = generate_random_policy(n, start, goal, obstacles)
    values = policy_evaluation(n, start, goal, obstacles, policy)

    return jsonify({"policy": policy, "values": values})


@app.route("/api/reset", methods=["POST"])
def api_reset():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(debug=True)
