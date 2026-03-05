# 🗺️ GridWorld — Deep Reinforcement Learning HW1

A Flask-based interactive **Grid World** web application that demonstrates **Policy Evaluation** and **Value Iteration** in reinforcement learning.  
Built for Deep Reinforcement Learning HW1, 2026.

---

## ✨ Features

### HW1-1 — Interactive Grid Map
- Choose grid size **n × n** (5 ≤ n ≤ 9)
- Click to set **Start (S)**, **Goal (G)**, and up to **n-2 Obstacles (X)**
- Reset button to clear all settings
- Real-time status bar showing current interaction mode

### HW1-2 — Policy Display & Evaluation
- **Random Policy Generation**: Each non-goal, non-obstacle cell is assigned a random action (↑ ↓ ← →)
- **Policy Evaluation**: Computes state values **V(s)** using iterative Bellman expectation equation
- Toggle V(s) value display on/off

### HW1-3 — Optimal Policy via Value Iteration
- **Value Iteration**: Derives optimal state values **V\*(s)** using Bellman optimality equation
- **Optimal Policy Extraction**: Computes best action **π\*(s)** via argmax for each cell
- Golden glow visual highlight on cells with optimal actions
- Side-by-side comparison with random policy results

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.x + Flask ≥ 3.0 |
| Frontend | HTML5 + Vanilla CSS + Vanilla JavaScript |
| Algorithm | Policy Evaluation + Value Iteration (Bellman Equations) |
| API | REST (JSON) |

---

## 📁 Project Structure

```
GridWorld/
├── app.py                  # Flask main app & API routes
├── grid.py                 # Grid logic, policy evaluation & value iteration
├── requirements.txt        # Python dependencies
├── templates/
│   └── index.html          # Frontend page
├── static/
│   ├── style.css           # Styling
│   └── main.js             # Frontend interaction logic
├── proposal.md             # Project proposal (Chinese/English)
├── skill.md                # Agent Skill instruction file
├── log.md                  # Conversation & action log
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- pip

### Installation

```bash
# Clone the repository
git clone https://github.com/DaYi-TW/DRL-HW1-20260304-GridWorld.git
cd DRL-HW1-20260304-GridWorld

# Install dependencies
pip install -r requirements.txt
```

### Run

```bash
python app.py
```

Then open your browser at **http://127.0.0.1:5000**

---

## 🎮 How to Use

1. **Select grid size** from the dropdown (5–9) and click **Generate Grid**
2. **Click a cell** → sets the **Start point** (green, `S`)
3. **Click another cell** → sets the **Goal** (red, `G`)
4. **Click more cells** → sets **Obstacles** (grey, `X`), up to `n-2` obstacles
5. Click **生成隨機策略 + V(s)** → displays random action arrows and V(s) values
6. Click **推導最佳策略 (Value Iteration)** → replaces random arrows with optimal policy (golden glow)
7. Toggle **Show Values** / **Show Arrows** switches to show/hide V(s) and arrows
8. Click **重置** to start over

---

## 🤖 Algorithms

### HW1-2 — Iterative Policy Evaluation

Uses the **Bellman Expectation Equation** iterated until convergence:

```
V(s) ← R(s, a) + γ · V(s')     where a = π(s)
```

### HW1-3 — Value Iteration

Uses the **Bellman Optimality Equation** to derive the optimal policy:

```
V(s) ← max_a [ R(s, a) + γ · V(s') ]
π*(s) = argmax_a [ R(s, a) + γ · V(s') ]
```

### Shared Parameters

```
R(s, a) = -1  (step penalty, non-terminal)
γ = 0.9       (discount factor)
θ = 1e-6      (convergence threshold)
V(G) = 0      (goal value fixed at 0)
Out-of-bounds or obstacle → stay in place
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/generate` | Submit grid config → returns random policy + V(s) |
| `POST` | `/api/optimal` | Submit grid config → returns optimal policy + V*(s) via Value Iteration |
| `POST` | `/api/reset` | Reset all state |

**Example Response:**
```json
{
  "policy": {
    "0,0": "→", "0,1": "↓", "1,2": "←"
  },
  "values": {
    "0,0": -3.21, "0,1": -2.14, "1,2": -1.00
  }
}
```

---

## 📊 Scoring Criteria

| Criterion | Weight | Implementation |
|-----------|--------|----------------|
| Grid map functionality | 30% | Dynamic n×n rendering, S/G/obstacle setup |
| UI friendliness | 15% | Status bar, color coding, hover effects |
| Code structure & readability | 10% | Modular split (`grid.py`, `main.js`) |
| Web operation smoothness | 5% | Pure frontend state machine, no page reload |
| Random action display | 20% | Arrow icons on all non-wall cells |
| Policy evaluation correctness | 15% | Bellman equation, convergence check |
| Code structure (HW1-2) | 5% | Algorithm decoupled from Flask routes |
| Optimal policy (HW1-3) | — | Value Iteration convergence, argmax extraction |

---

## 👤 Author

**DaYi-TW**  
Deep Reinforcement Learning — HW1, March 2026
