"""
grid.py – Grid World state logic and policy evaluation.
"""

import random

ACTIONS = ["↑", "↓", "←", "→"]
ACTION_DELTA = {
    "↑": (-1, 0),
    "↓": (1, 0),
    "←": (0, -1),
    "→": (0, 1),
}


def generate_random_policy(n, start, goal, obstacles):
    """
    Randomly assign one action to every non-obstacle, non-goal cell.
    Returns dict { "row,col": arrow_str }.
    """
    policy = {}
    obstacle_set = set(obstacles)
    for r in range(n):
        for c in range(n):
            key = f"{r},{c}"
            if (r, c) == tuple(goal) or key in obstacle_set:
                continue
            policy[key] = random.choice(ACTIONS)
    return policy


def policy_evaluation(n, start, goal, obstacles, policy, gamma=0.9, theta=1e-6):
    """
    Iterative policy evaluation using the Bellman expectation equation.

    Rules:
    - R(s, a) = -1 for all non-terminal transitions.
    - V(goal) = 0  (terminal state, fixed).
    - If action leads out-of-bounds or into an obstacle, agent stays in place.
    - Convergence threshold: theta = 1e-6.

    Returns dict { "row,col": float }
    """
    obstacle_set = set(obstacles)
    goal_key = f"{goal[0]},{goal[1]}"

    # Initialise V(s) = 0 for all states
    V = {}
    for r in range(n):
        for c in range(n):
            V[f"{r},{c}"] = 0.0

    def is_obstacle(r, c):
        return f"{r},{c}" in obstacle_set

    def next_state(r, c, action):
        dr, dc = ACTION_DELTA[action]
        nr, nc = r + dr, c + dc
        # Out of bounds or obstacle → stay
        if nr < 0 or nr >= n or nc < 0 or nc >= n or is_obstacle(nr, nc):
            return r, c
        return nr, nc

    while True:
        delta = 0.0
        for r in range(n):
            for c in range(n):
                key = f"{r},{c}"
                # Skip terminal and obstacle states
                if key == goal_key or key in obstacle_set:
                    continue
                if key not in policy:
                    continue
                action = policy[key]
                nr, nc = next_state(r, c, action)
                next_key = f"{nr},{nc}"
                new_v = -1.0 + gamma * V[next_key]
                delta = max(delta, abs(new_v - V[key]))
                V[key] = new_v
        if delta < theta:
            break

    # Round for display
    return {k: round(v, 2) for k, v in V.items()}
