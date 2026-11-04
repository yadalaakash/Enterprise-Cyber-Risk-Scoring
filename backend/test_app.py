import os
import sys
sys.path.insert(0, os.path.dirname(__file__))
import unittest
import json
import io
from app import app

from database import init_db

class CyberRiskApiTestCase(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        self.client = app.test_client()

    def test_01_health_check(self):
        res = self.client.get('/api/health')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data['status'], 'healthy')
        self.assertTrue(data['models_ready'])

    def test_02_dashboard(self):
        res = self.client.get('/api/dashboard')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn('overall_risk_score', data)
        self.assertIn('risk_classification', data)
        self.assertIn('counters', data)
        self.assertIn('trends', data)
        self.assertIn('recent_incidents', data)

    def test_03_predict_threat(self):
        sample_payload = {
            'net_bytes_transferred_mb': 150.0,
            'net_failed_logins': 8,
            'net_port_scan_count': 35,
            'net_packet_anomaly_score': 0.75,
            'net_unusual_protocol': 1,
            'net_external_connection_rate': 120.0,
            'net_suspicious_ip': 1,
            'end_suspicious_processes': 2,
            'end_malware_indicators': 1,
            'end_unauthorized_access': 3,
            'end_cpu_spike_sec': 250.0,
            'end_registry_modifications': 5,
            'end_privilege_escalation': 1,
            'eml_phishing_score': 0.85,
            'eml_suspicious_domain': 1,
            'eml_malicious_attachment': 1,
            'eml_spf_dkim_fail': 1,
            'eml_link_count': 6
        }
        res = self.client.post('/api/predict', json=sample_payload)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data['success'])
        result = data['result']
        self.assertIn('voting_ensemble', result['model_predictions'])
        self.assertIn('random_forest', result['model_predictions'])
        self.assertIn('decision_tree', result['model_predictions'])
        self.assertIn('logistic_regression', result['model_predictions'])
        self.assertIn('enterprise_risk_score', result['risk_assessment'])
        self.assertIn('recommendations', result)

    def test_04_trigger_analyze(self):
        res = self.client.post('/api/analyze')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data['success'])
        self.assertIn('scan_id', data)
        self.assertIn('risk_summary', data)

    def test_05_network_analysis(self):
        res = self.client.get('/api/network-analysis')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn('network_threat_score', data)
        self.assertIn('recent_events', data)
        self.assertIn('top_suspicious_ips', data)

    def test_06_endpoint_analysis(self):
        res = self.client.get('/api/endpoint-analysis')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn('endpoint_threat_score', data)
        self.assertIn('endpoint_devices', data)
        self.assertIn('malware_incidents', data)

    def test_07_email_analysis(self):
        res = self.client.get('/api/email-analysis')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn('email_threat_score', data)
        self.assertIn('recent_emails', data)
        self.assertIn('phishing_emails_detected', data)

    def test_08_scan_history(self):
        res = self.client.get('/api/scan-history')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIsInstance(data, list)
        self.assertGreater(len(data), 0)

    def test_09_risk_report(self):
        res = self.client.get('/api/report')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn('ciso_briefing', data)
        self.assertIn('vector_breakdown', data)
        self.assertIn('formula_applied', data)

    def test_10_ml_metrics(self):
        res = self.client.get('/api/ml-metrics')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn('models', data)
        self.assertIn('voting_ensemble', data['models'])
        self.assertIn('feature_importance', data)

    def test_11_csv_upload(self):
        csv_content = """net_bytes_transferred_mb,net_failed_logins,net_port_scan_count,net_packet_anomaly_score,net_unusual_protocol,net_external_connection_rate,net_suspicious_ip,end_suspicious_processes,end_malware_indicators,end_unauthorized_access,end_cpu_spike_sec,end_registry_modifications,end_privilege_escalation,eml_phishing_score,eml_suspicious_domain,eml_malicious_attachment,eml_spf_dkim_fail,eml_link_count
5.2,0,0,0.02,0,5.1,0,0,0,0,5.0,0,0,0.01,0,0,0,1
120.5,12,45,0.88,1,160.0,1,3,2,4,450.0,9,1,0.92,1,1,1,6
"""
        data = {
            'file': (io.BytesIO(csv_content.encode('utf-8')), 'test_batch_telemetry.csv')
        }
        res = self.client.post('/api/upload', data=data, content_type='multipart/form-data')
        self.assertEqual(res.status_code, 200)
        result = res.get_json()
        self.assertTrue(result['success'])
        self.assertEqual(result['summary']['total_records'], 2)

if __name__ == '__main__':
    unittest.main()
