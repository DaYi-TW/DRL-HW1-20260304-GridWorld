---
name: DRL GridWorld 作業開發
description: 當使用者要求建構深度強化學習 GridWorld 互動式網頁作業時，依照本技能指引自動完成專案建置、演算法實作、UI 開發與部署。
---

# DRL GridWorld 作業開發技能

> 本文件是 AI Agent 的操作指引。當使用者提出類似「建一個 GridWorld 網頁」、「做 DRL 策略評估作業」等需求時，直接按以下步驟執行。

---

## 何時觸發

使用者需求符合以下任一條件時啟用本技能：
- 要求建立 Grid World / 網格世界的互動式網頁
- 需要實作策略評估（Policy Evaluation）或貝爾曼方程
- 需要實作價值迭代（Value Iteration）推導最佳策略
- 深度強化學習課程作業，涉及 n×n 網格、起點/終點/障礙物設定

---

## 技術棧（固定）

| 項目 | 選擇 | 備註 |
|------|------|------|
| 後端 | Python 3.10+ / Flask ≥ 3.0 | 輕量、快速啟動 |
| 前端 | HTML5 + Vanilla CSS + Vanilla JS | 不引入框架，保持簡單 |
| 字型 | Google Fonts — Inter | 現代感 |
| 主題 | 暗色（背景 `#0d1117`） | 參考 GitHub Dark |
| API  | REST JSON | POST 為主 |

---

## 執行步驟

### Step 1 — 建立專案骨架

1. 建立以下檔案結構：
   ```
   GridWorld/
   ├── app.py
   ├── grid.py
   ├── requirements.txt       # 內容：flask>=3.0.0
   ├── templates/
   │   └── index.html
   ├── static/
   │   ├── style.css
   │   └── main.js
   └── .gitignore             # 排除 __pycache__/, *.pyc, venv/
   ```
2. `requirements.txt` 只需 `flask>=3.0.0`，除非使用者指定其他套件。

### Step 2 — 後端 `app.py`

建立 Flask 應用，包含四個路由：

| Method | Path | 功能 |
|--------|------|------|
| GET | `/` | 返回 `index.html` |
| POST | `/api/generate` | 接收網格設定 JSON，回傳隨機策略 + V(s) |
| POST | `/api/optimal` | 接收網格設定 JSON，回傳最佳策略 + V*(s)（Value Iteration） |
| POST | `/api/reset` | 回傳 `{"status": "ok"}` |

`/api/generate` 的請求格式：
```json
{ "n": 7, "start": [r, c], "goal": [r, c], "obstacles": [[r,c], ...] }
```

回應格式：
```json
{ "policy": {"r,c": "→", ...}, "values": {"r,c": -3.21, ...} }
```

> ⚠️ `app.py` 只做路由轉發，**演算法邏輯全部放在 `grid.py`**。

### Step 3 — 演算法模組 `grid.py`

實作三個函式：

#### `generate_random_policy(n, start, goal, obstacles)`
- 為每個**非終點、非障礙物**的格子隨機指定一個動作（↑ ↓ ← →）
- 回傳 `dict`：`{"r,c": "箭頭"}`

#### `policy_evaluation(n, start, goal, obstacles, policy, gamma=0.9, theta=1e-6)`
- 使用 Iterative Policy Evaluation（Bellman Expectation Equation）
- 規則：
  - `V(s)` 初始化為 0
  - `R(s, a) = -1`（非終態步伐懲罰）
  - `γ = 0.9`（折扣因子）
  - `V(goal) = 0`（固定不更新）
  - 若動作導致越界或撞障礙物 → 原地不動
  - 收斂條件：`Δ < θ = 1e-6`
- 回傳 `dict`：`{"r,c": float}`（保留兩位小數）

#### `value_iteration(n, start, goal, obstacles, gamma=0.9, theta=1e-6)`
- 使用 Value Iteration（Bellman Optimality Equation）
- 迭代公式：`V(s) = max_a [ R(s,a) + γ · V(next_state(s,a)) ]`
- 收斂後提取最佳策略：`π*(s) = argmax_a [ R(s,a) + γ · V(next_state(s,a)) ]`
- 參數與規則同 `policy_evaluation`
- 回傳 `(policy_dict, values_dict)` 二元組

### Step 4 — 前端 `index.html`

頁面結構：
- **Header**：Logo + 副標題
- **左側控制面板**（220px 寬）：
  - 網格大小下拉選單（5–9），預設 7
  - 「建立網格」按鈕 + 「重置」按鈕
  - 圖例（起點綠 / 終點紅 / 障礙物灰 / 空格）
  - HW1-2 策略面板（預設隱藏，障礙物設滿後顯示）：生成策略按鈕 + V(s) 切換開關 + 箭頭切換開關
  - HW1-3 最佳策略面板：「推導最佳策略 (Value Iteration)」金色按鈕 + 說明文字
  - 狀態資訊面板（網格大小 / 障礙物數量）
- **右側網格區域**：動態渲染的 n×n 表格 + 底部狀態列

### Step 5 — 前端邏輯 `main.js`

實作**前端狀態機**，避免頁面重整：

```
EMPTY → [建立網格] → SET_START → [點擊格子] → SET_GOAL → [點擊] → SET_OBSTACLES → [點滿 n-2 個] → DONE
```

每個格子需包含三個子元素：
- `.cell-label`：左上角顯示 S / G / X
- `.cell-arrow`：中央顯示策略箭頭
- `.cell-value`：右下角顯示 V(s) 值

關鍵行為：
- 點擊格子依狀態設定起點（綠）、終點（紅）、障礙物（灰）
- 狀態列即時更新目前操作提示
- `generatePolicy()` 呼叫 `/api/generate`，渲染箭頭與 V(s)
- `generateOptimalPolicy()` 呼叫 `/api/optimal`，以最佳策略取代隨機策略，並加金色 glow
- Toggle 開關控制箭頭與 V(s) 顯示/隱藏（透過 opacity 切換）
- 「重置」清除所有狀態（含 optimal glow）並呼叫 `/api/reset`

### Step 6 — 樣式 `style.css`

核心設計代幣（CSS Custom Properties）：

```css
:root {
  --bg:         #0d1117;
  --surface:    #161b22;
  --border:     #30363d;
  --text:       #e6edf3;
  --text-muted: #8b949e;
  --accent:     #58a6ff;
  --green:      #3fb950;    /* 起點 */
  --red:        #f85149;    /* 終點 */
  --gray:       #6e7681;    /* 障礙物 */
  --yellow:     #e3b341;    /* V(s) 數值 */
}
```

必備效果：
- 格子 Hover 高亮（scale 1.04 + 背景變色）
- 按鈕 Hover 上浮 + 光暈陰影
- 狀態列 fadeSlide 進場動畫
- Toggle 開關（滑動式）
- 格子大小 70×70px
- `.btn-optimal` 金色漸層按鈕（`#f59e0b → #d97706`）
- `.grid-cell.optimal` 金色 glow 描邊效果

### Step 7 — 測試與驗證

啟動伺服器後，在瀏覽器中驗證：

```bash
pip install -r requirements.txt
python app.py
# 開啟 http://127.0.0.1:5000
```

驗證清單：
- [ ] n=5 和 n=9 都能正確渲染
- [ ] 點擊順序正確：起點 → 終點 → 障礙物
- [ ] 障礙物上限為 n-2
- [ ] 重置功能正常（含清除 optimal glow）
- [ ] 隨機策略箭頭顯示在所有非牆格
- [ ] V(s) 數值合理（終點 = 0.00，離終點越遠越負）
- [ ] 切換開關正常
- [ ] 最佳策略箭頭指向合理方向（朝終點）
- [ ] 最佳策略的 V(s) 比隨機策略更優（更接近 0）
- [ ] 金色 glow 正確標記最佳策略格子

### Step 8 — Git 推送（若使用者要求）

```bash
git init
git add .
git commit -m "Initial commit: GridWorld Flask app (HW1)"
git remote add origin <使用者提供的 repo URL>
git push -u origin main
```

---

## 注意事項

1. **演算法與路由分離**：`grid.py` 裡的函式不能 import Flask，保持純邏輯。
2. **前端不重整**：所有互動用 JS 狀態機處理，不做頁面跳轉。
3. **障礙物上限**：最多 `n - 2` 個，不是 `n` 個。
4. **越界處理**：動作導致越界或撞障礙物時，agent 停在原地（s' = s）。
5. **V(goal) 固定為 0**：迭代時不更新終點的值。
6. **顯示精度**：V(s) 後端 round 到 2 位小數，前端用 `.toFixed(2)` 顯示。
7. **使用者沒指定語言就用中文**：UI 文字、狀態提示、按鈕都用繁體中文。

---

## 評分重點（提醒 AI 注意品質）

| 項目 | 佔比 | AI 該注意什麼 |
|------|------|---------------|
| 網格功能完整性 | 30% | n×n 動態渲染、S/G/X 設定全部可用 |
| UI 友好性 | 15% | 顏色直觀、狀態提示清楚、Hover 回饋 |
| 程式碼結構 | 10% | 模組拆分（grid.py / main.js）、命名清晰 |
| 操作流暢度 | 5% | 純前端狀態機、0 頁面重整 |
| 隨機行動顯示 | 20% | 箭頭覆蓋所有非牆格、終點不顯示 |
| 策略評估正確性 | 15% | Bellman 方程收斂、值合理 |
| HW1-2 程式碼結構 | 5% | 演算法不混在 Flask 路由裡 |
| 最佳策略推導 | — | Value Iteration 收斂、argmax 最佳動作、金色 glow 視覺區分 |
