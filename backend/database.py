import sqlite3
import json
import os
from datetime import datetime, timezone, timedelta

DB_PATH = os.path.join(os.path.dirname(__file__), 'cyber_risk.db')

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Table for scan history
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS scan_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            scan_name TEXT NOT NULL,
            risk_score REAL NOT NULL,
            risk_level TEXT NOT NULL,
            network_risk REAL NOT NULL,
            endpoint_risk REAL NOT NULL,
            email_risk REAL NOT NULL,
            total_threats INTEGER NOT NULL,
            model_predictions TEXT,
            telemetry_summary TEXT,
            recommendations TEXT
        )
    ''')

    # Table for security incidents / alerts
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS security_incidents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            source TEXT NOT NULL,
            severity TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            entity TEXT NOT NULL,
            status TEXT DEFAULT 'Open'
        )
    ''')

    # Table for system configuration (weights, parameters)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS system_config (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        )
    ''')

    conn.commit()

    # Seed initial demo scan and incidents if empty
    cursor.execute('SELECT COUNT(*) as count FROM scan_history')
    if cursor.fetchone()['count'] == 0:
        seed_initial_data(cursor)
        conn.commit()

    conn.close()

def seed_initial_data(cursor):
    now = datetime.now(timezone.utc)
    
    # Default weights
    default_config = {
        "network_weight": "0.35",
        "endpoint_weight": "0.35",
        "email_weight": "0.30"
    }
    for k, v in default_config.items():
        cursor.execute('INSERT OR REPLACE INTO system_config (key, value) VALUES (?, ?)', (k, v))

    # Initial scan records
    history_samples = [
        {
            "timestamp": (now - timedelta(days=6)).strftime("%Y-%m-%d %H:%M:%S"),
            "scan_name": "Scheduled Enterprise Baseline Scan",
            "risk_score": 38.4,
            "risk_level": "Medium",
            "network_risk": 42.0,
            "endpoint_risk": 36.5,
            "email_risk": 36.0,
            "total_threats": 7,
            "model_predictions": json.dumps({
                "random_forest": {"prediction": "Medium", "confidence": 0.82},
                "decision_tree": {"prediction": "Medium", "confidence": 0.75},
                "logistic_regression": {"prediction": "Medium", "confidence": 0.79},
                "voting_ensemble": {"prediction": "Medium", "confidence": 0.88}
            }),
            "telemetry_summary": json.dumps({"network_events": 14200, "endpoint_events": 8600, "emails_scanned": 4120}),
            "recommendations": json.dumps([
                "Patch Apache Struts on web server cluster DMZ-02.",
                "Review abnormal outbound connection from 192.168.4.112.",
                "Enforce MFA on Microsoft 365 executive mailboxes."
            ])
        },
        {
            "timestamp": (now - timedelta(days=4)).strftime("%Y-%m-%d %H:%M:%S"),
            "scan_name": "Post-Firewall Firmware Upgrade Scan",
            "risk_score": 28.7,
            "risk_level": "Medium",
            "network_risk": 24.2,
            "endpoint_risk": 31.0,
            "email_risk": 31.5,
            "total_threats": 4,
            "model_predictions": json.dumps({
                "random_forest": {"prediction": "Medium", "confidence": 0.85},
                "decision_tree": {"prediction": "Medium", "confidence": 0.78},
                "logistic_regression": {"prediction": "Low", "confidence": 0.68},
                "voting_ensemble": {"prediction": "Medium", "confidence": 0.82}
            }),
            "telemetry_summary": json.dumps({"network_events": 16800, "endpoint_events": 9200, "emails_scanned": 4500}),
            "recommendations": json.dumps([
                "Verify host intrusion detection agent on 3 offline endpoints.",
                "Tighten inbound rate-limiting on gateway edge router."
            ])
        },
        {
            "timestamp": (now - timedelta(days=2)).strftime("%Y-%m-%d %H:%M:%S"),
            "scan_name": "Quarterly CISO SOC Assessment",
            "risk_score": 64.8,
            "risk_level": "High",
            "network_risk": 71.5,
            "endpoint_risk": 62.0,
            "email_risk": 60.2,
            "total_threats": 14,
            "model_predictions": json.dumps({
                "random_forest": {"prediction": "High", "confidence": 0.89},
                "decision_tree": {"prediction": "High", "confidence": 0.84},
                "logistic_regression": {"prediction": "High", "confidence": 0.81},
                "voting_ensemble": {"prediction": "High", "confidence": 0.93}
            }),
            "telemetry_summary": json.dumps({"network_events": 28400, "endpoint_events": 12800, "emails_scanned": 6900}),
            "recommendations": json.dumps([
                "Isolate finance department workstation WS-FIN-09 immediately (Mimikatz memory artifact detected).",
                "Block malicious IP 185.220.101.44 targeting RDP port 3389.",
                "Quarantine phishing campaign spoofing corporate HR payroll portal."
            ])
        },
        {
            "timestamp": (now - timedelta(hours=3)).strftime("%Y-%m-%d %H:%M:%S"),
            "scan_name": "Active Telemetry Full Spectrum Scan",
            "risk_score": 58.2,
            "risk_level": "High",
            "network_risk": 64.0,
            "endpoint_risk": 56.5,
            "email_risk": 53.0,
            "total_threats": 11,
            "model_predictions": json.dumps({
                "random_forest": {"prediction": "High", "confidence": 0.91},
                "decision_tree": {"prediction": "High", "confidence": 0.83},
                "logistic_regression": {"prediction": "High", "confidence": 0.86},
                "voting_ensemble": {"prediction": "High", "confidence": 0.94}
            }),
            "telemetry_summary": json.dumps({"network_events": 34100, "endpoint_events": 15920, "emails_scanned": 7840}),
            "recommendations": json.dumps([
                "Rotate compromised API keys identified in external code repo leak.",
                "Deploy PowerShell Script Block Logging across domain controllers.",
                "Blacklist top phishing sender domains under .top and .cc TLDs."
            ])
        }
    ]

    for item in history_samples:
        cursor.execute('''
            INSERT INTO scan_history (timestamp, scan_name, risk_score, risk_level, network_risk, endpoint_risk, email_risk, total_threats, model_predictions, telemetry_summary, recommendations)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            item["timestamp"], item["scan_name"], item["risk_score"], item["risk_level"],
            item["network_risk"], item["endpoint_risk"], item["email_risk"], item["total_threats"],
            item["model_predictions"], item["telemetry_summary"], item["recommendations"]
        ))

    # Initial security incidents
    incidents = [
        ("Network", "Critical", "Automated Port Scan & SYN Flood Detected", "Massive syn scan observed from external IP targeting ports 22, 80, 443, 3389, 8080.", "198.51.100.42", "Open"),
        ("Endpoint", "Critical", "Cobalt Strike Beacon Activity", "Process powershell.exe spawned with encoded payload contacting unknown C2 domain.", "WS-SALES-14 (10.0.3.45)", "Investigating"),
        ("Email", "High", "CEO Fraud Spear-Phishing Campaign", "Spoofed wire-transfer request claiming to be Chief Financial Officer with malicious macro attachment.", "cfo-exec-office@pay-wire-secure.com", "Mitigated"),
        ("Network", "High", "Suspicious Data Exfiltration via DNS Tunnel", "High-volume DNS TXT record queries exceeding 45 MB/min to ns1.data-exfil.xyz.", "SRV-DB-PROD-01 (10.0.1.15)", "Investigating"),
        ("Endpoint", "Medium", "Multiple Local Admin Privilege Escalation Attempts", "User 'guest_contractor' attempted token manipulation and UAC bypass via fodhelper.exe.", "WS-DEV-08 (10.0.5.21)", "Resolved"),
        ("Email", "Medium", "Credential Harvesting URL Detected in Outlook", "QR code phishing (Quishing) bypass detected in internal inbound marketing mailbox.", "notify-service@account-verify-portal.net", "Mitigated"),
        ("Network", "Low", "Repeated Failed SSH Login Threshold Exceeded", "14 failed SSH authentication attempts on perimeter bastion within 60 seconds.", "203.0.113.88", "Resolved"),
        ("Endpoint", "Low", "Unsigned DLL Injected into Web Browser", "Chrome helper loaded unsigned library from %AppData%/Local/Temp.", "WS-HR-03 (10.0.2.19)", "Resolved"),
        ("Email", "High", "Invoice Malware Delivery (Remcos RAT)", "Email with subject 'OVERDUE INVOICE #89211' containing password-protected zip with executable.", "billing@overdue-collection-dept.org", "Open")
    ]

    for inc in incidents:
        cursor.execute('''
            INSERT INTO security_incidents (timestamp, source, severity, title, description, entity, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (now.strftime("%Y-%m-%d %H:%M:%S"), inc[0], inc[1], inc[2], inc[3], inc[4], inc[5]))

def save_scan(scan_data):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO scan_history (
            timestamp, scan_name, risk_score, risk_level, network_risk, endpoint_risk, email_risk,
            total_threats, model_predictions, telemetry_summary, recommendations
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        scan_data.get('timestamp', datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")),
        scan_data.get('scan_name', 'Ad-hoc Telemetry Risk Evaluation'),
        float(scan_data.get('risk_score', 0)),
        scan_data.get('risk_level', 'Low'),
        float(scan_data.get('network_risk', 0)),
        float(scan_data.get('endpoint_risk', 0)),
        float(scan_data.get('email_risk', 0)),
        int(scan_data.get('total_threats', 0)),
        json.dumps(scan_data.get('model_predictions', {})),
        json.dumps(scan_data.get('telemetry_summary', {})),
        json.dumps(scan_data.get('recommendations', []))
    ))
    scan_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return scan_id

def get_scan_history(limit=50):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM scan_history ORDER BY id DESC LIMIT ?', (limit,))
    rows = cursor.fetchall()
    result = []
    for r in rows:
        d = dict(r)
        if d.get('model_predictions'):
            try:
                d['model_predictions'] = json.loads(d['model_predictions'])
            except:
                pass
        if d.get('telemetry_summary'):
            try:
                d['telemetry_summary'] = json.loads(d['telemetry_summary'])
            except:
                pass
        if d.get('recommendations'):
            try:
                d['recommendations'] = json.loads(d['recommendations'])
            except:
                pass
        result.append(d)
    conn.close()
    return result

def get_scan_by_id(scan_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM scan_history WHERE id = ?', (scan_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    d = dict(row)
    for field in ['model_predictions', 'telemetry_summary', 'recommendations']:
        if d.get(field):
            try:
                d[field] = json.loads(d[field])
            except:
                pass
    return d

def get_incidents(source=None, severity=None, search=None):
    conn = get_db_connection()
    cursor = conn.cursor()
    query = 'SELECT * FROM security_incidents WHERE 1=1'
    params = []
    if source and source.lower() != 'all':
        query += ' AND source = ?'
        params.append(source)
    if severity and severity.lower() != 'all':
        query += ' AND severity = ?'
        params.append(severity)
    if search:
        query += ' AND (title LIKE ? OR description LIKE ? OR entity LIKE ?)'
        like_term = f'%{search}%'
        params.extend([like_term, like_term, like_term])
    query += ' ORDER BY id DESC'
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def update_incident_status(incident_id, status):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('UPDATE security_incidents SET status = ? WHERE id = ?', (status, incident_id))
    conn.commit()
    conn.close()
    return True

def get_config():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT key, value FROM system_config')
    rows = cursor.fetchall()
    conn.close()
    return {r['key']: float(r['value']) for r in rows}

def update_config(config_dict):
    conn = get_db_connection()
    cursor = conn.cursor()
    for k, v in config_dict.items():
        cursor.execute('INSERT OR REPLACE INTO system_config (key, value) VALUES (?, ?)', (k, str(v)))
    conn.commit()
    conn.close()
