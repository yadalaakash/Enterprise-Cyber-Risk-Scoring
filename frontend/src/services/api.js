const BASE_URL = '/api';

export const api = {
  // Health
  getHealth: async () => {
    const res = await fetch(`${BASE_URL}/health`);
    return res.json();
  },

  // Dashboard Aggregates
  getDashboard: async () => {
    const res = await fetch(`${BASE_URL}/dashboard`);
    if (!res.ok) throw new Error('Failed to fetch dashboard telemetry');
    return res.json();
  },

  // Telemetry Vector Analysis
  getNetworkAnalysis: async () => {
    const res = await fetch(`${BASE_URL}/network-analysis`);
    if (!res.ok) throw new Error('Failed to fetch network telemetry');
    return res.json();
  },

  getEndpointAnalysis: async () => {
    const res = await fetch(`${BASE_URL}/endpoint-analysis`);
    if (!res.ok) throw new Error('Failed to fetch endpoint telemetry');
    return res.json();
  },

  getEmailAnalysis: async () => {
    const res = await fetch(`${BASE_URL}/email-analysis`);
    if (!res.ok) throw new Error('Failed to fetch email telemetry');
    return res.json();
  },

  // Prediction & ML Ensemble
  predictThreat: async (payload) => {
    const res = await fetch(`${BASE_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Prediction failed');
    }
    return res.json();
  },

  // CSV Upload
  uploadCsv: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${BASE_URL}/upload`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'CSV upload failed');
    }
    return res.json();
  },

  // Trigger On-Demand Telemetry Analysis
  triggerAnalyze: async () => {
    const res = await fetch(`${BASE_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error('Failed to execute analysis cycle');
    return res.json();
  },

  // Scan History
  getScanHistory: async () => {
    const res = await fetch(`${BASE_URL}/scan-history`);
    if (!res.ok) throw new Error('Failed to fetch scan history');
    return res.json();
  },

  getScanDetails: async (id) => {
    const res = await fetch(`${BASE_URL}/scan-history/${id}`);
    if (!res.ok) throw new Error('Failed to fetch scan details');
    return res.json();
  },

  // Risk Assessment Report
  getReport: async (id = null) => {
    const url = id ? `${BASE_URL}/report?id=${id}` : `${BASE_URL}/report`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to load risk report');
    return res.json();
  },

  // ML Evaluation Metrics
  getMlMetrics: async () => {
    const res = await fetch(`${BASE_URL}/ml-metrics`);
    if (!res.ok) throw new Error('Failed to load model evaluation metrics');
    return res.json();
  },

  // Incidents
  getIncidents: async (source, severity, search) => {
    const params = new URLSearchParams();
    if (source) params.append('source', source);
    if (severity) params.append('severity', severity);
    if (search) params.append('search', search);
    const res = await fetch(`${BASE_URL}/incidents?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch security incidents');
    return res.json();
  },

  updateIncidentStatus: async (id, status) => {
    const res = await fetch(`${BASE_URL}/incidents/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update incident status');
    return res.json();
  },

  // Config & Weights
  getConfig: async () => {
    const res = await fetch(`${BASE_URL}/config`);
    return res.json();
  },

  updateConfig: async (weights) => {
    const res = await fetch(`${BASE_URL}/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(weights)
    });
    return res.json();
  }
};
