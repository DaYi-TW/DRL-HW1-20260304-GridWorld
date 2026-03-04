# 🗺️ GridWorld — Deep Reinforcement Learning HW1

A Flask-based interactive **Grid World** web application that demonstrates **Policy Evaluation** in reinforcement learning.  
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

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.x + Flask ≥ 3.0 |
| Frontend | HTML5 + Vanilla CSS + Vanilla JavaScript |
| Algorithm | Iterative Policy Evaluation (Bellman Equation) |
| API | REST (JSON) |

---

## 📁 Project Structure

```
GridWorld/
├── app.py                  # Flask main app & API routes
├── grid.py                 # Grid logic & policy evaluation algorithm
├── requirements.txt        # Python dependencies
├── templates/
│   └── index.html          # Frontend page
├── static/
│   ├── style.css           # Styling
│   └── main.js             # Frontend interaction logic
├── proposal.md             # Project proposal (Chinese/English)
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
5. Click **Generate Policy** → displays random action arrows and V(s) values
6. Toggle **Show Values** checkbox to show/hide V(s)
7. Click **Reset** to start over

---

## 🤖 Algorithm — Iterative Policy Evaluation

Uses the **Bellman Expectation Equation** iterated until convergence:

```
Initialize: V(s) = 0 for all states s

Repeat until Δ < θ (θ = 1e-6):
  For each non-obstacle state s:
    a = π(s)                          # action from policy
    s' = next state given action a
    if s' is out-of-bounds or obstacle:
        s' = s                        # stay in place
    V(s) ← R(s, a) + γ · V(s')

Parameters:
  R(s, a) = -1  (step penalty, non-terminal)
  γ = 0.9       (discount factor)
  V(G) = 0      (goal value fixed at 0)
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/generate` | Submit grid config → returns policy + V(s) |
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

---

## 👤 Author

**DaYi-TW**  
Deep Reinforcement Learning — HW1, March 2026
