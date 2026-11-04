# AI-Powered Enterprise Cyber Risk Scoring Platform
### *A Multi-Model Ensemble Classifier-Based Approach to Enterprise Cyber-Risk Scoring*

[![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.12%20%7C%203.13-blue.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Backend-Flask%203.1-emerald.svg)](https://flask.palletsprojects.com/)
[![React](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite-sky.svg)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/UI-Tailwind%20CSS%20v4-cyan.svg)](https://tailwindcss.com/)
[![Scikit-Learn](https://img.shields.io/badge/ML%20Ensemble-Scikit--Learn-indigo.svg)](https://scikit-learn.org/)
[![Database](https://img.shields.io/badge/Database-SQLite3-amber.svg)](https://sqlite.org/)

---

## 1. Project Overview & Objective

The **AI-Powered Enterprise Cyber Risk Scoring Platform** is an enterprise-grade cybersecurity web application and CISO-facing Security Operations Center (SOC) dashboard. It synthesizes multi-vector security telemetry across three critical enterprise threat boundaries:
1. **Network Security Telemetry**: NetFlow volume anomalies, brute-force auth attempts, port scan probes, packet anomalies, and foreign IP reputation.
2. **Endpoint Security Telemetry**: EDR process injection anomalies, malware indicators, unauthorized privilege escalations, LSASS memory dumping, and registry tampering.
3. **Email Gateway Telemetry**: Heuristic spear-phishing scoring, suspicious sender domains, weaponized attachment detonation flags, and SPF/DKIM/DMARC authentication failures.

The platform executes a **Machine Learning Ensemble Pipeline** combining **Random Forest**, **Decision Tree**, and **Logistic Regression** classifiers fused through a **Soft Voting Ensemble Classifier** to determine threat classifications and calculate a composite **Enterprise Cyber Risk Score (0–100)**.

---

## 2. Risk Scoring Formulation & Classification

The composite Enterprise Cyber Risk Score is calculated from the three telemetry sub-vectors using a configurable weighted formulation:

$$\text{Enterprise Cyber Risk Score} = (\text{Network Risk} \times w_{\text{net}}) + (\text{Endpoint Risk} \times w_{\text{end}}) + (\text{Email Risk} \times w_{\text{eml}})$$

*Standard Default Weights:*
- **Network Vector Weight ($w_{\text{net}}$)**: `0.35` (35%)
- **Endpoint Vector Weight ($w_{\text{end}}$)**: `0.35` (35%)
- **Email Gateway Weight ($w_{\text{eml}}$)**: `0.30` (30%)

*(Weights are fully customizable in real time via the UI/API with instant score recalculation.)*

### Risk Classification Tiers:
| Score Range | Risk Classification Tier | Posture Status | Badge Color |
|:---:|:---:|:---|:---:|
| **0 – 24.9** | **Low Risk** | Routine SOC Monitoring & Defensive Hygiene | Emerald / Green |
| **25 – 49.9** | **Medium Risk** | Elevated Vigilance & Anomaly Investigation | Amber / Yellow |
| **50 – 74.9** | **High Risk** | Active Threat Containment & EDR Host Isolation | Orange |
| **75 – 100.0** | **Critical Threat** | Emergency Incident Response & CISO Briefing | Crimson / Red |

---

## 3. Technology Stack

### Frontend:
- **React.js 19** with **Vite** build engine
- **Tailwind CSS v4** with custom SOC glassmorphism & cyber-glow styling
- **Recharts** for real-time telemetry visualizations (Area charts, Bar charts, Pie charts)
- **Lucide React** for enterprise cybersecurity iconography
- **HTML5 Canvas** for interactive cyber threat mesh particle animation

### Backend:
- **Python 3.13**
- **Flask 3.1** REST API with **Flask-CORS**
- **SQLite3** database for persistent scan history, incident triage, and configuration

### Machine Learning:
- **Scikit-Learn** ML suite
- **Random Forest Classifier** (`n_estimators=120`, `max_depth=12`)
- **Decision Tree Classifier** (`max_depth=8`)
- **Logistic Regression Classifier** (`multi_class='multinomial'`)
- **Voting Classifier** (`voting='soft'`)
- **StandardScaler** & **SimpleImputer**
- **Pandas** & **NumPy** for telemetry feature extraction and data normalization

---

## 4. Platform Pages & Core Features

1. **Platform Overview (Landing Page)**:
   - High-tech cyber defense hero with interactive particle canvas background
   - Enterprise security metrics ticker
   - 4-step ML risk scoring architecture walkthrough
   - Technology stack showcase

2. **Main SOC Dashboard (CISO View)**:
   - Real-time Radial Cyber Risk Gauge (0–100) with dynamic sub-vector breakdown
   - 4 key telemetry metric cards (Network events, Endpoint alerts, Email threats, Suspicious activities)
   - Enterprise risk trend historical area chart
   - Network threat distribution pie chart
   - Endpoint security alerts horizontal bar chart
   - Email threat detection vs. quarantine comparative bar chart
   - Interactive security incidents triage queue with search, filter, and status containment modal

3. **Network Security Analysis**:
   - Ingress/egress flow telemetry stream
   - Malicious IP blacklist matches with one-click firewall shunning
   - Port scanning alert telemetry & brute-force login counters
   - Download sample network telemetry CSV

4. **Endpoint Security Analysis**:
   - Monitored enterprise workstation and server fleet table
   - Malware indicator and suspicious process detections
   - Living-off-the-Land Binary (LoLBin) execution flags
   - One-click EDR Host Isolation action

5. **Email Security Analysis**:
   - Phishing heuristics and lexical anomaly tracking
   - Weaponized attachment detonation alerts
   - DMARC, SPF, and DKIM authentication failure logs
   - One-click mailbox quarantine / retraction action

6. **AI Multi-Model Ensemble Predictor**:
   - **Interactive Manual Input Form** with scenario presets (*Normal Baseline, Port Scan, Spear-Phishing, Ransomware Outbreak*)
   - **CSV Dataset Upload** for batch enterprise telemetry classification
   - Real-time comparison across **Random Forest**, **Decision Tree**, **Logistic Regression**, and **Soft Voting Ensemble**
   - Individual model confidence percentages and class probability distributions
   - **Model Evaluation Suite**: Accuracy, Precision, Recall, F1-Score table, Confusion Matrix, and Random Forest Feature Importance chart

7. **Risk Assessment Report**:
   - Professional CISO audit briefing document
   - Mathematical formula display and vector score contributions
   - Prioritized remediation roadmap with expected impact ratings
   - **Download Report (PDF)** / browser-native print export

8. **Scan History & Audit Archives**:
   - Complete immutable history of all prior scans stored in SQLite
   - Filter by risk level tier (Low, Medium, High, Critical)
   - Drill down to view the full report for any past scan

---

## 5. Machine Learning Evaluation Results

*Evaluated on stratified test split of 2,000 multi-source enterprise telemetry records:*

| Model Architecture | Accuracy | Precision (Weighted) | Recall (Weighted) | F1-Score (Weighted) |
|:---|:---:|:---:|:---:|:---:|
| **Random Forest** | **98.8%** | 98.81% | 98.80% | 98.78% |
| **Decision Tree** | **99.0%** | 99.01% | 99.00% | 98.98% |
| **Logistic Regression** | **99.2%** | 99.21% | 99.20% | 99.18% |
| **Voting Ensemble (Soft)** | **99.0%** | **99.00%** | **99.00%** | **99.00%** |

---

## 6. REST API Documentation

| Endpoint | Method | Description |
|:---|:---:|:---|
| `/api/health` | `GET` | Service status, version, and ML model readiness |
| `/api/dashboard` | `GET` | Aggregated SOC telemetry, risk score, counters, and chart datasets |
| `/api/predict` | `POST` | Executes ML predictions across all 4 models and returns risk score |
| `/api/upload` | `POST` | Uploads CSV dataset, runs batch predictions, and logs scan history |
| `/api/analyze` | `POST` | Triggers on-demand live telemetry simulation and scoring cycle |
| `/api/network-analysis` | `GET` | Granular network traffic, suspicious IPs, and port scan alerts |
| `/api/endpoint-analysis` | `GET` | Monitored fleet devices, malware alerts, and unauthorized attempts |
| `/api/email-analysis` | `GET` | Phishing metrics, malicious attachments, and domain authentication |
| `/api/scan-history` | `GET` | Retrieves historical scan archive records from SQLite |
| `/api/scan-history/<id>`| `GET` | Retrieves specific historical scan record by ID |
| `/api/report` | `GET` | Generates full CISO Executive Cyber-Risk Assessment Report |
| `/api/ml-metrics` | `GET` | Returns accuracy, precision, recall, F1, and confusion matrices |
| `/api/config` | `GET/POST` | Inspects or updates network, endpoint, and email risk weights |
| `/api/incidents` | `GET` | Returns active security incidents with optional search/filter |
| `/api/incidents/<id>/status` | `POST` | Updates containment status (Open, Investigating, Mitigated, Resolved) |
| `/api/sample-datasets/<name>` | `GET` | Downloads sample synthetic demonstration datasets |

---

## 7. Installation & Execution Guide

### Prerequisites
- **Python 3.11+** (Python 3.13 tested and supported)
- **Node.js v18+** & **npm**

### Step 1: Clone or Navigate to the Project Directory
```powershell
cd "c:\Users\yadal\OneDrive\Desktop\mini project"
```

### Step 2: Set Up Backend Virtual Environment
```powershell
# Create virtual environment (if not already created)
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1   # or .\venv\Scripts\activate.bat in cmd

# Install Python backend dependencies
pip install -r requirements.txt
```

### Step 3: Train / Initialize ML Models and Database
```powershell
# Trains the ML ensemble models and generates initial synthetic demonstration datasets
python backend/ml_pipeline.py
```

### Step 4: Run the Backend REST API Server
```powershell
python backend/app.py
```
*The backend API server will start on `http://127.0.0.1:5000`.*

### Step 5: Start the Frontend Application (in a separate terminal)
```powershell
cd frontend
cmd /c npm run dev
```
*The React + Vite application will start on `http://localhost:5173` with automatic API proxying to port 5000.*

---

## 8. Running Automated Tests

To execute the unit test suite verifying all 11 REST API endpoints, ML predictions, CSV upload, and SQLite integration:
```powershell
.\venv\Scripts\python.exe -m unittest backend/test_app.py
```

---

## 9. Demonstration Data Disclosure
*This platform includes clearly labeled synthetic demonstration datasets for model training and simulation purposes. Synthetic telemetry reflects realistic distributions of enterprise network flows, host endpoint events, and email headers designed for machine learning evaluation.*
