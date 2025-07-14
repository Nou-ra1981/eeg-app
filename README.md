# EEG Signal Analyzer

A web-based EEG signal visualization and analysis tool built with React (Vite) and Flask.  
It allows users to load EEG data, view time-domain and frequency-domain (PSD) graphs, and visualize band power distributions.

---
### ▶️ Quick Start

1. Click the green **"Code"** button → **"Open in Codespaces"**.
2. Once inside Codespaces:
   - In the **first terminal**, run:

     ```bash
     cd backend
     source venv/bin/activate
     python app.py
     ```

   - In the **second terminal**, run:

     ```bash
     cd frontend/eeg-visualizer
     npm install
     npm run dev
     ```
     

3.Open `http://localhost:5173` from the "Ports" tab in Codespaces.


---

## 🧠 Features

- Load EEG data (A3, A4 channels)
- Toggle between time-domain and frequency-domain views
- Compare signals from different channels
- Power Spectral Density (PSD) computation using Welch method
- Pie chart of band power distribution (Delta, Theta, Alpha, Beta, Gamma)
- Clean, animated UI with light interactivity

---

## 📁 Dataset

The EEG data file is located at: frontend/eeg-visualizer/public/eeg_data_a3_a4_utc.csv

This is automatically loaded when the frontend starts.

---

## 🚀 Getting Started

### 🔧 Backend Setup (Flask API)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt  # or install manually:
pip install flask flask-cors pandas scipy
python app.py
```

📍 This runs the backend server at:  
http://localhost:8000

---

### 💻 Frontend Setup (React/Vite)

```bash
cd frontend/eeg-visualizer
npm install
npm run dev
```

📍 Frontend is served at:  
http://localhost:5173

---

## ⚙️ Deployment with Codespaces

This app was developed and deployed using **GitHub Codespaces**.

To open in Codespaces:

- Click the green **"Code"** button on this repository → _"Open in Codespaces"_
- Or directly open:  
  🔗 https://glowing-lamp-44gx7q6pqgg2j7v5-5173.app.github.dev/
