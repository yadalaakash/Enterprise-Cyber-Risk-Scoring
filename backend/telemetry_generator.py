import os
import random
import numpy as np
import pandas as pd
from datetime import datetime, timedelta, timezone

DATASET_DIR = os.path.join(os.path.dirname(__file__), 'datasets')

def ensure_dataset_dir():
    os.makedirs(DATASET_DIR, exist_ok=True)

def generate_network_data(n=1000):
    """
    Generates synthetic demonstration data for enterprise network telemetry.
    Labeled as synthetic demonstration data for AI model training and evaluation.
    """
    random.seed(42)
    np.random.seed(42)
    
    internal_subnets = ['10.0.1.', '10.0.2.', '10.0.3.', '192.168.1.']
    known_threat_ips = ['198.51.100.42', '203.0.113.88', '185.220.101.44', '45.142.214.12', '194.26.29.11']
    protocols = ['TCP', 'UDP', 'ICMP', 'DNS', 'HTTPS', 'SSH', 'RDP', 'SMB']
    
    rows = []
    now = datetime.now(timezone.utc)
    
    for i in range(n):
        is_attack = random.random() < 0.28
        ts = (now - timedelta(minutes=random.randint(1, 10000))).strftime("%Y-%m-%d %H:%M:%S")
        src_ip = random.choice(known_threat_ips) if is_attack and random.random() < 0.6 else f"{random.choice(internal_subnets)}{random.randint(2, 250)}"
        dst_ip = f"10.0.1.{random.randint(10, 50)}" if is_attack else f"10.0.{random.randint(1, 5)}.{random.randint(2, 250)}"
        port = random.choice([22, 3389, 445, 8080, 4444, 21]) if is_attack else random.choice([80, 443, 53, 123, 8080])
        protocol = random.choice(protocols)
        
        if is_attack:
            bytes_mb = round(np.random.exponential(scale=250.0) + 10.0, 2)
            failed_logins = int(np.random.poisson(lam=12) + 2)
            port_scan_count = int(np.random.poisson(lam=45) + 5)
            packet_anomaly_score = round(min(1.0, np.random.beta(a=5, b=2)), 3)
            unusual_protocol_flag = 1 if random.random() < 0.7 else 0
            external_connection_rate = round(np.random.uniform(50.0, 200.0), 2)
            suspicious_ip_flag = 1 if (src_ip in known_threat_ips or random.random() < 0.4) else 0
            threat_level = random.choice([2, 3])  # High or Critical
        else:
            bytes_mb = round(np.random.exponential(scale=15.0) + 0.1, 2)
            failed_logins = int(np.random.choice([0, 1, 2], p=[0.85, 0.12, 0.03]))
            port_scan_count = int(np.random.choice([0, 1], p=[0.95, 0.05]))
            packet_anomaly_score = round(min(0.35, np.random.beta(a=1, b=5)), 3)
            unusual_protocol_flag = 0 if random.random() < 0.95 else 1
            external_connection_rate = round(np.random.uniform(1.0, 20.0), 2)
            suspicious_ip_flag = 0
            threat_level = 0 if random.random() < 0.8 else 1 # Low or Medium
            
        risk_score = round(min(100.0, (failed_logins * 3.5) + (port_scan_count * 0.9) + (packet_anomaly_score * 40) + (suspicious_ip_flag * 25)), 1)
        
        rows.append({
            'record_id': f"NET-{i+10001}",
            'dataset_type': 'SYNTHETIC_DEMO',
            'timestamp': ts,
            'source_ip': src_ip,
            'destination_ip': dst_ip,
            'destination_port': port,
            'protocol': protocol,
            'bytes_transferred_mb': bytes_mb,
            'failed_logins': failed_logins,
            'port_scan_count': port_scan_count,
            'packet_anomaly_score': packet_anomaly_score,
            'unusual_protocol_flag': unusual_protocol_flag,
            'external_connection_rate': external_connection_rate,
            'suspicious_ip_flag': suspicious_ip_flag,
            'threat_level': threat_level,
            'risk_score': risk_score
        })
        
    return pd.DataFrame(rows)

def generate_endpoint_data(n=1000):
    """
    Generates synthetic demonstration data for enterprise endpoint security telemetry.
    """
    random.seed(43)
    np.random.seed(43)
    
    hostnames = [f"WS-CORP-{i:03d}" for i in range(1, 40)] + [f"SRV-PROD-{i:02d}" for i in range(1, 10)] + [f"LT-EXEC-{i:02d}" for i in range(1, 10)]
    oses = ['Windows 11 Pro', 'Windows 10 Enterprise', 'Windows Server 2022', 'Ubuntu 22.04 LTS', 'macOS Sonoma']
    users = ['jsmith', 'mgarcia', 'achoi', 'bwilson', 'dvogel', 'svc_backup', 'admin_corp', 'contractor_temp']
    
    rows = []
    now = datetime.now(timezone.utc)
    
    for i in range(n):
        is_attack = random.random() < 0.25
        ts = (now - timedelta(minutes=random.randint(1, 10000))).strftime("%Y-%m-%d %H:%M:%S")
        host = random.choice(hostnames)
        os_name = random.choice(oses)
        user = random.choice(users)
        
        if is_attack:
            suspicious_processes = int(np.random.poisson(lam=4) + 1)
            malware_indicators = int(np.random.poisson(lam=3) + 1)
            unauthorized_access_attempts = int(np.random.poisson(lam=5) + 1)
            cpu_spike_sec = round(np.random.uniform(120.0, 900.0), 1)
            registry_modifications = int(np.random.poisson(lam=8) + 2)
            privilege_escalation_flag = 1 if random.random() < 0.65 else 0
            threat_level = random.choice([2, 3])
        else:
            suspicious_processes = 0 if random.random() < 0.92 else 1
            malware_indicators = 0
            unauthorized_access_attempts = 0 if random.random() < 0.90 else 1
            cpu_spike_sec = round(np.random.uniform(0.0, 45.0), 1)
            registry_modifications = int(np.random.choice([0, 1, 2], p=[0.7, 0.25, 0.05]))
            privilege_escalation_flag = 0
            threat_level = 0 if random.random() < 0.85 else 1
            
        risk_score = round(min(100.0, (suspicious_processes * 18.0) + (malware_indicators * 22.0) + (unauthorized_access_attempts * 12.0) + (privilege_escalation_flag * 30.0) + (registry_modifications * 2.5)), 1)
        
        rows.append({
            'record_id': f"END-{i+20001}",
            'dataset_type': 'SYNTHETIC_DEMO',
            'timestamp': ts,
            'hostname': host,
            'os_name': os_name,
            'user': user,
            'suspicious_processes': suspicious_processes,
            'malware_indicators': malware_indicators,
            'unauthorized_access_attempts': unauthorized_access_attempts,
            'cpu_spike_sec': cpu_spike_sec,
            'registry_modifications': registry_modifications,
            'privilege_escalation_flag': privilege_escalation_flag,
            'threat_level': threat_level,
            'risk_score': risk_score
        })
        
    return pd.DataFrame(rows)

def generate_email_data(n=1000):
    """
    Generates synthetic demonstration data for enterprise email security telemetry.
    """
    random.seed(44)
    np.random.seed(44)
    
    sender_domains = ['microsoft-updates-auth.com', 'secure-bank-login.net', 'urgent-invoice-processing.xyz', 'paypal-account-check.biz', 'internal-corp.com', 'trusted-vendor.com', 'hr-updates-global.com']
    subjects_phishing = [
        "URGENT: Verify your Microsoft 365 credentials immediately",
        "Overdue Invoice #INV-99021 from Accounts Payable",
        "Action Required: Security Compliance Update",
        "Wire Transfer Confirmation Needed ASAP",
        "Employee Benefits Enrollment Notice - Urgent"
    ]
    subjects_benign = [
        "Weekly Team Sync Agenda & Notes",
        "Project Architecture Review Q4",
        "Upcoming Office Holiday Schedule",
        "Quarterly OKR Status Report",
        "Lunch and Learn: New Cloud Architecture"
    ]
    
    rows = []
    now = datetime.now(timezone.utc)
    
    for i in range(n):
        is_attack = random.random() < 0.26
        ts = (now - timedelta(minutes=random.randint(1, 10000))).strftime("%Y-%m-%d %H:%M:%S")
        
        if is_attack:
            sender = f"security@{random.choice(sender_domains[:4])}"
            subject = random.choice(subjects_phishing)
            phishing_keywords_score = round(np.random.uniform(0.65, 0.99), 3)
            suspicious_sender_domain = 1
            malicious_attachment_flag = 1 if random.random() < 0.6 else 0
            spf_dkim_fail = 1 if random.random() < 0.85 else 0
            link_count = random.randint(3, 12)
            external_recipient_count = random.randint(1, 5)
            threat_level = random.choice([2, 3])
        else:
            sender = f"user{random.randint(1, 50)}@{random.choice(sender_domains[4:])}"
            subject = random.choice(subjects_benign)
            phishing_keywords_score = round(np.random.uniform(0.01, 0.25), 3)
            suspicious_sender_domain = 0
            malicious_attachment_flag = 0
            spf_dkim_fail = 1 if random.random() < 0.05 else 0
            link_count = random.randint(0, 3)
            external_recipient_count = random.randint(1, 2)
            threat_level = 0 if random.random() < 0.88 else 1
            
        risk_score = round(min(100.0, (phishing_keywords_score * 45.0) + (suspicious_sender_domain * 20.0) + (malicious_attachment_flag * 25.0) + (spf_dkim_fail * 15.0) + (link_count * 1.5)), 1)
        
        rows.append({
            'record_id': f"EML-{i+30001}",
            'dataset_type': 'SYNTHETIC_DEMO',
            'timestamp': ts,
            'sender_email': sender,
            'recipient_email': f"employee{random.randint(1, 100)}@enterprise-corp.com",
            'subject': subject,
            'phishing_keywords_score': phishing_keywords_score,
            'suspicious_sender_domain': suspicious_sender_domain,
            'malicious_attachment_flag': malicious_attachment_flag,
            'spf_dkim_fail': spf_dkim_fail,
            'link_count': link_count,
            'external_recipient_count': external_recipient_count,
            'threat_level': threat_level,
            'risk_score': risk_score
        })
        
    return pd.DataFrame(rows)

def generate_combined_features(n=2000):
    """
    Generates unified multi-domain feature vectors combining network, endpoint, and email telemetry
    for training the machine learning ensemble classifier models.
    """
    net_df = generate_network_data(n)
    end_df = generate_endpoint_data(n)
    eml_df = generate_email_data(n)
    
    # Combined DataFrame for Ensemble Modeling
    combined = pd.DataFrame({
        # Network signals
        'net_bytes_transferred_mb': net_df['bytes_transferred_mb'],
        'net_failed_logins': net_df['failed_logins'],
        'net_port_scan_count': net_df['port_scan_count'],
        'net_packet_anomaly_score': net_df['packet_anomaly_score'],
        'net_unusual_protocol': net_df['unusual_protocol_flag'],
        'net_external_connection_rate': net_df['external_connection_rate'],
        'net_suspicious_ip': net_df['suspicious_ip_flag'],
        # Endpoint signals
        'end_suspicious_processes': end_df['suspicious_processes'],
        'end_malware_indicators': end_df['malware_indicators'],
        'end_unauthorized_access': end_df['unauthorized_access_attempts'],
        'end_cpu_spike_sec': end_df['cpu_spike_sec'],
        'end_registry_modifications': end_df['registry_modifications'],
        'end_privilege_escalation': end_df['privilege_escalation_flag'],
        # Email signals
        'eml_phishing_score': eml_df['phishing_keywords_score'],
        'eml_suspicious_domain': eml_df['suspicious_sender_domain'],
        'eml_malicious_attachment': eml_df['malicious_attachment_flag'],
        'eml_spf_dkim_fail': eml_df['spf_dkim_fail'],
        'eml_link_count': eml_df['link_count'],
        # Sub-vector risk scores
        'net_risk': net_df['risk_score'],
        'end_risk': end_df['risk_score'],
        'eml_risk': eml_df['risk_score'],
    })
    
    # Calculate composite enterprise risk score (35% net + 35% end + 30% eml)
    combined['enterprise_risk_score'] = round(
        (combined['net_risk'] * 0.35) +
        (combined['end_risk'] * 0.35) +
        (combined['eml_risk'] * 0.30), 1
    )
    
    # Multi-class target label: 0: Low (0-24), 1: Medium (25-49), 2: High (50-74), 3: Critical (75-100)
    conditions = [
        combined['enterprise_risk_score'] < 25,
        (combined['enterprise_risk_score'] >= 25) & (combined['enterprise_risk_score'] < 50),
        (combined['enterprise_risk_score'] >= 50) & (combined['enterprise_risk_score'] < 75),
        combined['enterprise_risk_score'] >= 75
    ]
    choices = [0, 1, 2, 3] # Low, Medium, High, Critical
    combined['threat_class'] = np.select(conditions, choices, default=0)
    
    return combined, net_df, end_df, eml_df

def save_all_datasets():
    ensure_dataset_dir()
    combined_df, net_df, end_df, eml_df = generate_combined_features(1500)
    
    net_path = os.path.join(DATASET_DIR, 'network_telemetry.csv')
    end_path = os.path.join(DATASET_DIR, 'endpoint_telemetry.csv')
    eml_path = os.path.join(DATASET_DIR, 'email_telemetry.csv')
    cmb_path = os.path.join(DATASET_DIR, 'combined_telemetry.csv')
    
    net_df.to_csv(net_path, index=False)
    end_df.to_csv(end_path, index=False)
    eml_df.to_csv(eml_path, index=False)
    combined_df.to_csv(cmb_path, index=False)
    
    print(f"Datasets generated and saved to {DATASET_DIR}")
    return cmb_path

if __name__ == '__main__':
    save_all_datasets()
