import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.ensemble import RandomForestClassifier, VotingClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, classification_report
)

from telemetry_generator import generate_combined_features, save_all_datasets
from risk_engine import (
    compute_network_risk_score,
    compute_endpoint_risk_score,
    compute_email_risk_score,
    calculate_enterprise_risk,
    generate_actionable_recommendations,
    get_risk_level
)

MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')
PIPELINE_PATH = os.path.join(MODEL_DIR, 'ensemble_model.joblib')
METRICS_PATH = os.path.join(MODEL_DIR, 'model_metrics.json')

FEATURE_COLUMNS = [
    # Network features
    'net_bytes_transferred_mb',
    'net_failed_logins',
    'net_port_scan_count',
    'net_packet_anomaly_score',
    'net_unusual_protocol',
    'net_external_connection_rate',
    'net_suspicious_ip',
    # Endpoint features
    'end_suspicious_processes',
    'end_malware_indicators',
    'end_unauthorized_access',
    'end_cpu_spike_sec',
    'end_registry_modifications',
    'end_privilege_escalation',
    # Email features
    'eml_phishing_score',
    'eml_suspicious_domain',
    'eml_malicious_attachment',
    'eml_spf_dkim_fail',
    'eml_link_count'
]

CLASS_LABELS = {
    0: 'Low',
    1: 'Medium',
    2: 'High',
    3: 'Critical'
}

def ensure_model_dir():
    os.makedirs(MODEL_DIR, exist_ok=True)

class CyberRiskEnsemblePipeline:
    def __init__(self):
        self.imputer = SimpleImputer(strategy='median')
        self.scaler = StandardScaler()
        self.rf_model = RandomForestClassifier(
    n_estimators=120,
    max_depth=12,
    random_state=42,
    n_jobs=1
)
        self.dt_model = DecisionTreeClassifier(max_depth=8, random_state=42)
        self.lr_model = LogisticRegression(max_iter=1500, random_state=42)
        self.ensemble_model = None
        self.is_trained = False
        self.metrics = {}

    def fit(self, X, y):
        # 1. Clean & Impute missing values
        X_imputed = self.imputer.fit_transform(X)
        
        # 2. Scale / Normalize features
        X_scaled = self.scaler.fit_transform(X_imputed)
        
        # 3. Split train/test
        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled, y, test_size=0.25, random_state=42, stratify=y
        )
        
        # 4. Train Individual Models
        self.rf_model.fit(X_train, y_train)
        self.dt_model.fit(X_train, y_train)
        self.lr_model.fit(X_train, y_train)
        
        # 5. Train Soft Voting Ensemble Classifier
        self.ensemble_model = VotingClassifier(
            estimators=[
                ('Random Forest', self.rf_model),
                ('Decision Tree', self.dt_model),
                ('Logistic Regression', self.lr_model)
            ],
            voting='soft'
        )
        self.ensemble_model.fit(X_train, y_train)
        self.is_trained = True
        
        # 6. Comprehensive Evaluation
        models_dict = {
            'random_forest': self.rf_model,
            'decision_tree': self.dt_model,
            'logistic_regression': self.lr_model,
            'voting_ensemble': self.ensemble_model
        }
        
        eval_results = {}
        for name, model in models_dict.items():
            preds = model.predict(X_test)
            probs = model.predict_proba(X_test) if hasattr(model, "predict_proba") else None
            
            acc = float(accuracy_score(y_test, preds))
            prec = float(precision_score(y_test, preds, average='weighted', zero_division=0))
            rec = float(recall_score(y_test, preds, average='weighted', zero_division=0))
            f1 = float(f1_score(y_test, preds, average='weighted', zero_division=0))
            cm = confusion_matrix(y_test, preds).tolist()
            
            eval_results[name] = {
                'accuracy': round(acc * 100, 2),
                'precision': round(prec * 100, 2),
                'recall': round(rec * 100, 2),
                'f1_score': round(f1 * 100, 2),
                'confusion_matrix': cm
            }
            
        # Extract feature importances from Random Forest
        importances = self.rf_model.feature_importances_
        feature_importance_list = [
            {'feature': col, 'importance': round(float(imp) * 100, 2)}
            for col, imp in zip(FEATURE_COLUMNS, importances)
        ]
        feature_importance_list.sort(key=lambda x: x['importance'], reverse=True)
        
        self.metrics = {
            'trained_timestamp': pd.Timestamp.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC'),
            'total_samples': len(X),
            'train_samples': len(X_train),
            'test_samples': len(X_test),
            'class_distribution': {str(CLASS_LABELS[k]): int(v) for k, v in pd.Series(y).value_counts().items()},
            'models': eval_results,
            'feature_importance': feature_importance_list,
            'classes': [CLASS_LABELS[i] for i in range(4)]
        }
        
        return self.metrics

    def save(self):
        ensure_model_dir()
        bundle = {
            'imputer': self.imputer,
            'scaler': self.scaler,
            'rf_model': self.rf_model,
            'dt_model': self.dt_model,
            'lr_model': self.lr_model,
            'ensemble_model': self.ensemble_model,
            'metrics': self.metrics
        }
        joblib.dump(bundle, PIPELINE_PATH)
        with open(METRICS_PATH, 'w') as f:
            json.dump(self.metrics, f, indent=2)
        print("Model pipeline saved successfully.")

    def load(self):
        if not os.path.exists(PIPELINE_PATH):
            return False
        bundle = joblib.load(PIPELINE_PATH)
        self.imputer = bundle['imputer']
        self.scaler = bundle['scaler']
        self.rf_model = bundle['rf_model']
        self.dt_model = bundle['dt_model']
        self.lr_model = bundle['lr_model']
        self.ensemble_model = bundle['ensemble_model']
        self.metrics = bundle.get('metrics', {})
        self.is_trained = True
        return True

    def predict_single(self, input_data, weights=None):
        """
        Runs prediction for a single telemetry record or manual feature input.
        Returns predictions from all 4 models (RF, DT, LR, Voting Ensemble),
        probabilities, confidence, and enterprise cyber risk score.
        """
        if not self.is_trained:
            loaded = self.load()
            if not loaded:
                raise ValueError("Model has not been trained yet.")
                
        # Prepare vector
        vector = []
        for col in FEATURE_COLUMNS:
            val = input_data.get(col, 0)
            try:
                vector.append(float(val))
            except:
                vector.append(0.0)
                
        X_df = pd.DataFrame([vector], columns=FEATURE_COLUMNS)
        X_imp = self.imputer.transform(X_df)
        X_scaled = self.scaler.transform(X_imp)
        
        # Individual predictions
        models = {
            'random_forest': self.rf_model,
            'decision_tree': self.dt_model,
            'logistic_regression': self.lr_model,
            'voting_ensemble': self.ensemble_model
        }
        
        predictions_out = {}
        for m_name, model in models.items():
            pred_class_idx = int(model.predict(X_scaled)[0])
            pred_label = CLASS_LABELS.get(pred_class_idx, 'Unknown')
            probs = model.predict_proba(X_scaled)[0]
            confidence = round(float(np.max(probs)) * 100, 1)
            prob_dict = {CLASS_LABELS[i]: round(float(probs[i]) * 100, 1) for i in range(len(probs))}
            
            predictions_out[m_name] = {
                'prediction': pred_label,
                'class_index': pred_class_idx,
                'confidence': confidence,
                'probabilities': prob_dict
            }
            
        # Compute sub-scores & composite enterprise risk
        net_risk = compute_network_risk_score(input_data)
        end_risk = compute_endpoint_risk_score(input_data)
        eml_risk = compute_email_risk_score(input_data)
        
        # If user directly specified subscores, use them
        if 'network_risk' in input_data and input_data['network_risk'] is not None:
            net_risk = float(input_data['network_risk'])
        if 'endpoint_risk' in input_data and input_data['endpoint_risk'] is not None:
            end_risk = float(input_data['endpoint_risk'])
        if 'email_risk' in input_data and input_data['email_risk'] is not None:
            eml_risk = float(input_data['email_risk'])
            
        risk_result = calculate_enterprise_risk(net_risk, end_risk, eml_risk, weights)
        recommendations = generate_actionable_recommendations(
            risk_result['enterprise_risk_score'], net_risk, end_risk, eml_risk, input_data
        )
        
        return {
            'model_predictions': predictions_out,
            'ensemble_verdict': predictions_out['voting_ensemble']['prediction'],
            'ensemble_confidence': predictions_out['voting_ensemble']['confidence'],
            'risk_assessment': risk_result,
            'recommendations': recommendations,
            'input_features': input_data
        }

    def predict_batch_df(self, df, weights=None):
        """
        Evaluates a batch of telemetry records from uploaded CSV.
        """
        if not self.is_trained:
            self.load()
            
        rows_result = []
        high_critical_count = 0
        total_enterprise_score = 0.0
        
        for idx, row in df.iterrows():
            row_dict = row.to_dict()
            res = self.predict_single(row_dict, weights)
            score = res['risk_assessment']['enterprise_risk_score']
            level = res['risk_assessment']['classification']
            total_enterprise_score += score
            if level in ['High', 'Critical']:
                high_critical_count += 1
                
            rows_result.append({
                'row_index': idx + 1,
                'record_id': row_dict.get('record_id', f"EVT-{idx+1001}"),
                'enterprise_risk_score': score,
                'classification': level,
                'ensemble_verdict': res['ensemble_verdict'],
                'confidence': res['ensemble_confidence'],
                'network_risk': res['risk_assessment']['sub_scores']['network_risk'],
                'endpoint_risk': res['risk_assessment']['sub_scores']['endpoint_risk'],
                'email_risk': res['risk_assessment']['sub_scores']['email_risk'],
                'primary_vector': res['risk_assessment']['primary_threat_vector']
            })
            
        avg_score = round(total_enterprise_score / max(len(df), 1), 1)
        avg_level = get_risk_level(avg_score)
        
        return {
            'total_records': len(df),
            'average_risk_score': avg_score,
            'overall_risk_level': avg_level['level'],
            'high_critical_threats': high_critical_count,
            'records': rows_result[:100], # preview top 100
            'summary_distribution': {
                'Low': sum(1 for r in rows_result if r['classification'] == 'Low'),
                'Medium': sum(1 for r in rows_result if r['classification'] == 'Medium'),
                'High': sum(1 for r in rows_result if r['classification'] == 'High'),
                'Critical': sum(1 for r in rows_result if r['classification'] == 'Critical')
            }
        }

# Global Pipeline Instance
pipeline = CyberRiskEnsemblePipeline()

def train_or_load_pipeline():
    ensure_model_dir()
    if os.path.exists(PIPELINE_PATH):
        try:
            pipeline.load()
            print("Loaded pre-trained ML ensemble pipeline.")
            return pipeline
        except Exception as e:
            print(f"Reloading/Retraining due to: {e}")
            
    # Generate datasets and train
    print("Generating synthetic demonstration telemetry datasets...")
    combined_df, _, _, _ = generate_combined_features(2000)
    save_all_datasets()
    
    X = combined_df[FEATURE_COLUMNS]
    y = combined_df['threat_class']
    
    print("Training ML Ensemble Models (Random Forest, Decision Tree, Logistic Regression, Voting Classifier)...")
    pipeline.fit(X, y)
    pipeline.save()
    print("ML Ensemble Pipeline trained and saved successfully.")
    return pipeline

if __name__ == '__main__':
    train_or_load_pipeline()
