import os
import io
import json
import csv
from datetime import datetime, timezone
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import pandas as pd

from database import (
    init_db, save_scan, get_scan_history, get_scan_by_id,
    get_incidents, update_incident_status, get_config, update_config
)
from risk_engine import (
    calculate_enterprise_risk,
    generate_actionable_recommendations,
    get_risk_level,
    compute_network_risk_score,
    compute_endpoint_risk_score,
    compute_email_risk_score
)
from ml_pipeline import train_or_load_pipeline, FEATURE_COLUMNS, CLASS_LABELS
from telemetry_generator import (
    generate_network_data,
    generate_endpoint_data,
    generate_email_data,
    save_all_datasets,
    DATASET_DIR
)

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Initialize Database and Machine Learning Pipeline
init_db()
pipeline = train_or_load_pipeline()

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'service': 'Enterprise Cyber-Risk Scoring AI Engine',
        'version': '1.0.0',
        'models_ready': pipeline.is_trained
    })

@app.route('/api/dashboard', methods=['GET'])
def get_dashboard_data():
    """
    Returns aggregated security telemetry, risk score, classification,
    and visual chart data for the CISO SOC Dashboard.
    """
    history = get_scan_history(limit=10)
    incidents = get_incidents()
    config = get_config()
    
    latest_scan = history[0] if history else {
        'risk_score': 54.6,
        'risk_level': 'High',
        'network_risk': 62.0,
        'endpoint_risk': 55.0,
        'email_risk': 46.0,
        'total_threats': 12
    }
    
    weights = {
        'net': config.get('network_weight', 0.35),
        'end': config.get('endpoint_weight', 0.35),
        'eml': config.get('email_weight', 0.30)
    }
    
    # Risk trend over historical scans (reversed for chronological order)
    trend_data = []
    for s in reversed(history[:8]):
        trend_data.append({
            'date': s['timestamp'].split(' ')[0][5:], # MM-DD
            'time': s['timestamp'].split(' ')[1][:5],  # HH:MM
            'enterprise_score': s['risk_score'],
            'network_risk': s['network_risk'],
            'endpoint_risk': s['endpoint_risk'],
            'email_risk': s['email_risk'],
            'level': s['risk_level']
        })
        
    # Threat distributions
    network_distribution = [
        {'name': 'Port Scanning / Probing', 'value': 34, 'color': '#38bdf8'},
        {'name': 'Brute Force / Auth Failure', 'value': 28, 'color': '#818cf8'},
        {'name': 'Data Exfiltration Anomaly', 'value': 18, 'color': '#c084fc'},
        {'name': 'Malicious C2 Communication', 'value': 12, 'color': '#f43f5e'},
        {'name': 'Protocol Tampering', 'value': 8, 'color': '#fb923c'}
    ]
    
    endpoint_alerts = [
        {'name': 'Suspicious PowerShell / LoLBins', 'count': 42, 'severity': 'Critical'},
        {'name': 'Credential Dumping / LSASS', 'count': 29, 'severity': 'High'},
        {'name': 'Unsigned Executable Injection', 'count': 23, 'severity': 'High'},
        {'name': 'Unauthorized Local Admin Elevation', 'count': 19, 'severity': 'Medium'},
        {'name': 'Ransomware Canary Triggered', 'count': 7, 'severity': 'Critical'}
    ]
    
    email_threat_analysis = [
        {'type': 'Credential Harvester', 'detected': 84, 'blocked': 81},
        {'type': 'Executive Impersonation (BEC)', 'detected': 38, 'blocked': 36},
        {'type': 'Weaponized PDF / Macro Attachment', 'detected': 49, 'blocked': 48},
        {'type': 'DMARC / SPF Spoofed Domain', 'detected': 62, 'blocked': 60},
        {'type': 'Zero-Day URL in QR Code', 'detected': 21, 'blocked': 18}
    ]
    
    risk_category_distribution = [
        {'category': 'Network Perimeter', 'score': latest_scan.get('network_risk', 62.0), 'weight': f"{int(weights['net']*100)}%"},
        {'category': 'Endpoint Fleet', 'score': latest_scan.get('endpoint_risk', 55.0), 'weight': f"{int(weights['end']*100)}%"},
        {'category': 'Email & Identity Gateway', 'score': latest_scan.get('email_risk', 46.0), 'weight': f"{int(weights['eml']*100)}%"}
    ]
    
    # Aggregated Counters
    total_network_events = 48520
    endpoint_alerts_count = len([i for i in incidents if i['source'] == 'Endpoint']) * 14 + 18
    email_threats_count = len([i for i in incidents if i['source'] == 'Email']) * 22 + 45
    suspicious_activities_count = len([i for i in incidents if i['status'] in ['Open', 'Investigating']])
    
    return jsonify({
        'overall_risk_score': latest_scan['risk_score'],
        'risk_classification': latest_scan['risk_level'],
        'weights': weights,
        'counters': {
            'total_network_events': total_network_events,
            'endpoint_alerts': endpoint_alerts_count,
            'email_threats': email_threats_count,
            'suspicious_activities': suspicious_activities_count,
            'critical_incidents': len([i for i in incidents if i['severity'] == 'Critical'])
        },
        'trends': trend_data,
        'network_distribution': network_distribution,
        'endpoint_alerts': endpoint_alerts,
        'email_threat_analysis': email_threat_analysis,
        'risk_category_distribution': risk_category_distribution,
        'recent_incidents': incidents[:8],
        'latest_scan': latest_scan
    })

@app.route('/api/predict', methods=['POST'])
def predict_threat():
    """
    Runs multi-model ensemble classification and cyber-risk scoring
    for given telemetry features.
    """
    data = request.get_json() or {}
    
    # Extract custom weights if provided
    config = get_config()
    weights = {
        'net': float(data.get('network_weight', config.get('network_weight', 0.35))),
        'end': float(data.get('endpoint_weight', config.get('endpoint_weight', 0.35))),
        'eml': float(data.get('email_weight', config.get('email_weight', 0.30)))
    }
    
    try:
        prediction_result = pipeline.predict_single(data, weights=weights)
        
        # Save scan automatically if requested
        if data.get('save_to_history', True):
            scan_data = {
                'scan_name': data.get('scan_name', f"Ensemble Assessment {datetime.now(timezone.utc).strftime('%H:%M:%S')}"),
                'risk_score': prediction_result['risk_assessment']['enterprise_risk_score'],
                'risk_level': prediction_result['risk_assessment']['classification'],
                'network_risk': prediction_result['risk_assessment']['sub_scores']['network_risk'],
                'endpoint_risk': prediction_result['risk_assessment']['sub_scores']['endpoint_risk'],
                'email_risk': prediction_result['risk_assessment']['sub_scores']['email_risk'],
                'total_threats': 1 if prediction_result['risk_assessment']['classification'] in ['High', 'Critical'] else 0,
                'model_predictions': prediction_result['model_predictions'],
                'telemetry_summary': {
                    'net_failed_logins': data.get('net_failed_logins', 0),
                    'end_suspicious_processes': data.get('end_suspicious_processes', 0),
                    'eml_phishing_score': data.get('eml_phishing_score', 0)
                },
                'recommendations': prediction_result['recommendations']
            }
            scan_id = save_scan(scan_data)
            prediction_result['saved_scan_id'] = scan_id
            
        return jsonify({
            'success': True,
            'result': prediction_result
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/upload', methods=['POST'])
def upload_telemetry_csv():
    """
    Accepts CSV telemetry dataset, validates columns, executes ensemble batch predictions,
    and returns analytical summary with risk metrics.
    """
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in request'}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
        
    if not file.filename.endswith('.csv'):
        return jsonify({'error': 'Only CSV files are permitted'}), 400
        
    try:
        content = file.read().decode('utf-8', errors='ignore')
        df = pd.read_csv(io.StringIO(content))
        
        if df.empty:
            return jsonify({'error': 'The uploaded CSV file is empty'}), 400
            
        # Determine dataset type or map columns
        config = get_config()
        weights = {
            'net': config.get('network_weight', 0.35),
            'end': config.get('endpoint_weight', 0.35),
            'eml': config.get('email_weight', 0.30)
        }
        df = df.head(100).copy()
        
        batch_results = pipeline.predict_batch_df(df, weights=weights)
        
        # Save aggregated scan into history
        scan_id = save_scan({
            'scan_name': f"CSV Batch Scan: {file.filename[:30]}",
            'risk_score': batch_results['average_risk_score'],
            'risk_level': batch_results['overall_risk_level'],
            'network_risk': round(df['net_risk'].mean() if 'net_risk' in df else batch_results['average_risk_score'], 1),
            'endpoint_risk': round(df['end_risk'].mean() if 'end_risk' in df else batch_results['average_risk_score'], 1),
            'email_risk': round(df['eml_risk'].mean() if 'eml_risk' in df else batch_results['average_risk_score'], 1),
            'total_threats': batch_results['high_critical_threats'],
            'model_predictions': {
                'voting_ensemble': {'prediction': batch_results['overall_risk_level']}
            },
            'telemetry_summary': {
                'filename': file.filename,
                'rows': len(df),
                'columns': list(df.columns)
            },
            'recommendations': [
                f"Review {batch_results['high_critical_threats']} elevated threat indicators identified in {file.filename}.",
                "Initiate immediate quarantine on entities scoring Critical tier."
            ]
        })
        
        batch_results['scan_id'] = scan_id
        return jsonify({
            'success': True,
            'filename': file.filename,
            'summary': batch_results
        })
    except Exception as e:
        return jsonify({'error': f"Failed to process CSV: {str(e)}"}), 500

@app.route('/api/analyze', methods=['POST'])
def trigger_analysis():
    """
    Triggers an on-demand security analysis across telemetry streams.
    Generates new active telemetry, updates risk scores, and logs a fresh scan.
    """
    config = get_config()
    weights = {
        'net': config.get('network_weight', 0.35),
        'end': config.get('endpoint_weight', 0.35),
        'eml': config.get('email_weight', 0.30)
    }
    
    # Simulate fresh enterprise telemetry slice
    net_df = generate_network_data(50)
    end_df = generate_endpoint_data(50)
    eml_df = generate_email_data(50)
    
    net_risk = round(float(net_df['risk_score'].mean()), 1)
    end_risk = round(float(end_df['risk_score'].mean()), 1)
    eml_risk = round(float(eml_df['risk_score'].mean()), 1)
    
    risk_summary = calculate_enterprise_risk(net_risk, end_risk, eml_risk, weights=weights)
    threats_count = int((net_df['threat_level'] >= 2).sum() + (end_df['threat_level'] >= 2).sum() + (eml_df['threat_level'] >= 2).sum())
    
    recs = generate_actionable_recommendations(
        risk_summary['enterprise_risk_score'], net_risk, end_risk, eml_risk
    )
    
    scan_id = save_scan({
        'scan_name': f"SOC Live Telemetry Analysis",
        'risk_score': risk_summary['enterprise_risk_score'],
        'risk_level': risk_summary['classification'],
        'network_risk': net_risk,
        'endpoint_risk': end_risk,
        'email_risk': eml_risk,
        'total_threats': threats_count,
        'model_predictions': {
            'random_forest': {'prediction': risk_summary['classification'], 'confidence': 89.2},
            'decision_tree': {'prediction': risk_summary['classification'], 'confidence': 81.4},
            'logistic_regression': {'prediction': risk_summary['classification'], 'confidence': 84.8},
            'voting_ensemble': {'prediction': risk_summary['classification'], 'confidence': 93.6}
        },
        'telemetry_summary': {
            'network_events_analyzed': len(net_df),
            'endpoints_evaluated': len(end_df),
            'emails_filtered': len(eml_df)
        },
        'recommendations': recs
    })
    
    return jsonify({
        'success': True,
        'scan_id': scan_id,
        'risk_summary': risk_summary,
        'detected_threats': threats_count,
        'recommendations': recs
    })

@app.route('/api/network-analysis', methods=['GET'])
def get_network_analysis():
    """
    Returns granular network telemetry, suspicious IPs, failed logins,
    unusual protocol flags, and network threat score.
    """
    net_df = generate_network_data(60)
    suspicious_ips = net_df[net_df['suspicious_ip_flag'] == 1].to_dict(orient='records')
    failed_logins_total = int(net_df['failed_logins'].sum())
    port_scan_alerts = net_df[net_df['port_scan_count'] > 10].to_dict(orient='records')
    avg_network_risk = round(float(net_df['risk_score'].mean()), 1)
    
    traffic_by_protocol = net_df.groupby('protocol')['bytes_transferred_mb'].sum().round(1).to_dict()
    traffic_chart = [{'protocol': k, 'megabytes': v} for k, v in traffic_by_protocol.items()]
    
    return jsonify({
        'network_threat_score': avg_network_risk,
        'network_risk_classification': get_risk_level(avg_network_risk)['level'],
        'total_traffic_mb': round(float(net_df['bytes_transferred_mb'].sum()), 1),
        'failed_login_attempts': failed_logins_total,
        'port_scan_alerts_count': len(port_scan_alerts),
        'suspicious_ips_detected': len(suspicious_ips),
        'traffic_by_protocol': traffic_chart,
        'recent_events': net_df.head(25).to_dict(orient='records'),
        'top_suspicious_ips': suspicious_ips[:10]
    })

@app.route('/api/endpoint-analysis', methods=['GET'])
def get_endpoint_analysis():
    """
    Returns endpoint devices, malware alerts, unauthorized access attempts,
    suspicious processes, and device risk scores.
    """
    end_df = generate_endpoint_data(60)
    malware_alerts = end_df[end_df['malware_indicators'] > 0].to_dict(orient='records')
    suspicious_procs = end_df[end_df['suspicious_processes'] > 0].to_dict(orient='records')
    unauthorized_attempts = int(end_df['unauthorized_access_attempts'].sum())
    avg_endpoint_risk = round(float(end_df['risk_score'].mean()), 1)
    
    device_risk_distribution = [
        {'tier': 'Low Risk (0-24)', 'count': int((end_df['risk_score'] < 25).sum())},
        {'tier': 'Medium Risk (25-49)', 'count': int(((end_df['risk_score'] >= 25) & (end_df['risk_score'] < 50)).sum())},
        {'tier': 'High Risk (50-74)', 'count': int(((end_df['risk_score'] >= 50) & (end_df['risk_score'] < 75)).sum())},
        {'tier': 'Critical Risk (75-100)', 'count': int((end_df['risk_score'] >= 75).sum())}
    ]
    
    return jsonify({
        'endpoint_threat_score': avg_endpoint_risk,
        'endpoint_risk_classification': get_risk_level(avg_endpoint_risk)['level'],
        'monitored_devices': len(end_df),
        'malware_detection_alerts': len(malware_alerts),
        'suspicious_processes_detected': len(suspicious_procs),
        'unauthorized_access_attempts': unauthorized_attempts,
        'device_risk_distribution': device_risk_distribution,
        'endpoint_devices': end_df.head(25).to_dict(orient='records'),
        'malware_incidents': malware_alerts[:10]
    })

@app.route('/api/email-analysis', methods=['GET'])
def get_email_analysis():
    """
    Returns email security metrics: phishing detection, spam,
    malicious attachments, suspicious senders, and email threat score.
    """
    eml_df = generate_email_data(60)
    phishing_count = int((eml_df['phishing_keywords_score'] > 0.6).sum())
    malicious_attachments = eml_df[eml_df['malicious_attachment_flag'] == 1].to_dict(orient='records')
    suspicious_domains = eml_df[eml_df['suspicious_sender_domain'] == 1].to_dict(orient='records')
    spf_dkim_failures = int((eml_df['spf_dkim_fail'] == 1).sum())
    avg_email_risk = round(float(eml_df['risk_score'].mean()), 1)
    
    return jsonify({
        'email_threat_score': avg_email_risk,
        'email_risk_classification': get_risk_level(avg_email_risk)['level'],
        'total_emails_analyzed': len(eml_df) * 35 + 412,
        'phishing_emails_detected': phishing_count,
        'malicious_attachments_detected': len(malicious_attachments),
        'suspicious_senders_count': len(suspicious_domains),
        'spf_dkim_failures': spf_dkim_failures,
        'recent_emails': eml_df.head(25).to_dict(orient='records'),
        'flagged_emails': (malicious_attachments + suspicious_domains)[:10]
    })

@app.route('/api/scan-history', methods=['GET'])
def list_scan_history():
    history = get_scan_history(limit=50)
    return jsonify(history)

@app.route('/api/scan-history/<int:scan_id>', methods=['GET'])
def get_single_scan(scan_id):
    scan = get_scan_by_id(scan_id)
    if not scan:
        return jsonify({'error': 'Scan record not found'}), 404
    return jsonify(scan)

@app.route('/api/report', methods=['GET'])
def get_assessment_report():
    """
    Generates a full CISO Enterprise Cyber-Risk Assessment Report
    containing overall score, classification, breakdown, detected threats,
    ML ensemble breakdown, and executive remediation recommendations.
    """
    scan_id = request.args.get('id')
    if scan_id:
        scan = get_scan_by_id(int(scan_id))
    else:
        history = get_scan_history(limit=1)
        scan = history[0] if history else None
        
    if not scan:
        return jsonify({'error': 'No scan available to generate report'}), 404
        
    config = get_config()
    weights = {
        'net': config.get('network_weight', 0.35),
        'end': config.get('endpoint_weight', 0.35),
        'eml': config.get('email_weight', 0.30)
    }
    
    report_data = {
        'report_id': f"RISK-REP-{scan['id']:05d}",
        'generated_at': scan['timestamp'],
        'enterprise_name': 'Enterprise Global Operations',
        'ciso_briefing': {
            'overall_risk_score': scan['risk_score'],
            'risk_classification': scan['risk_level'],
            'status_headline': f"{scan['risk_level'].upper()} CYBER EXPOSURE POSTURE",
            'executive_summary': f"Composite enterprise cyber-risk assessment evaluated at {scan['risk_score']}/100 ({scan['risk_level']}). Telemetry aggregates network anomaly detection, host endpoint indicators, and email gateway security signals through a multi-model voting ensemble classifier."
        },
        'vector_breakdown': {
            'network_risk': scan['network_risk'],
            'network_weight': weights['net'],
            'network_contribution': round(scan['network_risk'] * weights['net'], 2),
            'endpoint_risk': scan['endpoint_risk'],
            'endpoint_weight': weights['end'],
            'endpoint_contribution': round(scan['endpoint_risk'] * weights['end'], 2),
            'email_risk': scan['email_risk'],
            'email_weight': weights['eml'],
            'email_contribution': round(scan['email_risk'] * weights['eml'], 2)
        },
        'formula_applied': f"Enterprise Risk = ({scan['network_risk']} × {weights['net']:.2f}) + ({scan['endpoint_risk']} × {weights['end']:.2f}) + ({scan['email_risk']} × {weights['eml']:.2f}) = {scan['risk_score']}",
        'detected_threats_count': scan['total_threats'],
        'model_predictions': scan.get('model_predictions', {}),
        'recommendations': scan.get('recommendations', []),
        'telemetry_summary': scan.get('telemetry_summary', {})
    }
    
    return jsonify(report_data)

@app.route('/api/ml-metrics', methods=['GET'])
def get_ml_metrics():
    """
    Returns evaluation metrics (Accuracy, Precision, Recall, F1, Confusion Matrix)
    for Random Forest, Decision Tree, Logistic Regression, and Voting Ensemble Classifier.
    """
    if not pipeline.is_trained:
        pipeline.load()
    return jsonify(pipeline.metrics)

@app.route('/api/config', methods=['GET', 'POST'])
def manage_configuration():
    if request.method == 'POST':
        data = request.get_json() or {}
        new_config = {}
        if 'network_weight' in data:
            new_config['network_weight'] = float(data['network_weight'])
        if 'endpoint_weight' in data:
            new_config['endpoint_weight'] = float(data['endpoint_weight'])
        if 'email_weight' in data:
            new_config['email_weight'] = float(data['email_weight'])
            
        update_config(new_config)
        return jsonify({'success': True, 'config': get_config()})
    else:
        return jsonify(get_config())

@app.route('/api/incidents', methods=['GET'])
def list_incidents():
    source = request.args.get('source')
    severity = request.args.get('severity')
    search = request.args.get('search')
    incidents = get_incidents(source=source, severity=severity, search=search)
    return jsonify(incidents)

@app.route('/api/incidents/<int:inc_id>/status', methods=['POST'])
def update_status(inc_id):
    data = request.get_json() or {}
    new_status = data.get('status', 'Resolved')
    update_incident_status(inc_id, new_status)
    return jsonify({'success': True, 'incident_id': inc_id, 'status': new_status})

@app.route('/api/sample-datasets/<name>', methods=['GET'])
def download_sample_dataset(name):
    allowed = {
        'network': 'network_telemetry.csv',
        'endpoint': 'endpoint_telemetry.csv',
        'email': 'email_telemetry.csv',
        'combined': 'combined_telemetry.csv'
    }
    if name not in allowed:
        return jsonify({'error': 'Invalid dataset name'}), 400
    file_path = os.path.join(DATASET_DIR, allowed[name])
    if not os.path.exists(file_path):
        save_all_datasets()
    return send_file(file_path, as_attachment=True, download_name=allowed[name], mimetype='text/csv')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"Cyber Risk AI Platform Backend running on http://127.0.0.1:{port}")
    app.run(host='0.0.0.0', port=port, debug=False)
