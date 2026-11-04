"""
Enterprise Cyber-Risk Scoring Engine
Combines multi-vector security signals (Network, Endpoint, Email)
using configurable weighted formulations and granular telemetry heuristic baselines.
"""

def get_risk_level(score):
    """Maps score 0-100 to risk level tier"""
    if score < 25.0:
        return {
            "level": "Low",
            "tier": "LOW_RISK",
            "badge_color": "emerald",
            "hex": "#10b981",
            "action_posture": "Routine SOC Monitoring & Defensive Hygiene"
        }
    elif score < 50.0:
        return {
            "level": "Medium",
            "tier": "MODERATE_RISK",
            "badge_color": "yellow",
            "hex": "#f59e0b",
            "action_posture": "Elevated Vigilance & Anomaly Investigation"
        }
    elif score < 75.0:
        return {
            "level": "High",
            "tier": "HIGH_RISK",
            "badge_color": "orange",
            "hex": "#f97316",
            "action_posture": "Active Incident Containment Required"
        }
    else:
        return {
            "level": "Critical",
            "tier": "CRITICAL_THREAT",
            "badge_color": "red",
            "hex": "#ef4444",
            "action_posture": "Emergency Incident Response & CISO Briefing"
        }

def compute_network_risk_score(features):
    """
    Computes individual network risk sub-score (0-100) from telemetry features.
    """
    failed_logins = float(features.get('net_failed_logins', features.get('failed_logins', 0)))
    port_scan_count = float(features.get('net_port_scan_count', features.get('port_scan_count', 0)))
    packet_anomaly = float(features.get('net_packet_anomaly_score', features.get('packet_anomaly_score', 0.0)))
    unusual_protocol = float(features.get('net_unusual_protocol', features.get('unusual_protocol_flag', 0)))
    suspicious_ip = float(features.get('net_suspicious_ip', features.get('suspicious_ip_flag', 0)))
    bytes_mb = float(features.get('net_bytes_transferred_mb', features.get('bytes_transferred_mb', 0)))
    
    score = (
        (min(failed_logins, 30.0) / 30.0 * 25.0) +
        (min(port_scan_count, 100.0) / 100.0 * 25.0) +
        (packet_anomaly * 25.0) +
        (suspicious_ip * 15.0) +
        (unusual_protocol * 10.0)
    )
    
    # Exfiltration burst multiplier
    if bytes_mb > 500.0:
        score += 10.0
        
    return round(min(100.0, max(0.0, score)), 1)

def compute_endpoint_risk_score(features):
    """
    Computes individual endpoint risk sub-score (0-100) from telemetry features.
    """
    suspicious_proc = float(features.get('end_suspicious_processes', features.get('suspicious_processes', 0)))
    malware_ind = float(features.get('end_malware_indicators', features.get('malware_indicators', 0)))
    unauthorized_acc = float(features.get('end_unauthorized_access', features.get('unauthorized_access_attempts', 0)))
    priv_esc = float(features.get('end_privilege_escalation', features.get('privilege_escalation_flag', 0)))
    reg_mods = float(features.get('end_registry_modifications', features.get('registry_modifications', 0)))
    cpu_spike = float(features.get('end_cpu_spike_sec', features.get('cpu_spike_sec', 0)))
    
    score = (
        (min(suspicious_proc, 5.0) / 5.0 * 25.0) +
        (min(malware_ind, 4.0) / 4.0 * 30.0) +
        (min(unauthorized_acc, 8.0) / 8.0 * 15.0) +
        (priv_esc * 20.0) +
        (min(reg_mods, 15.0) / 15.0 * 10.0)
    )
    
    if cpu_spike > 300.0:
        score += 5.0
        
    return round(min(100.0, max(0.0, score)), 1)

def compute_email_risk_score(features):
    """
    Computes individual email risk sub-score (0-100) from telemetry features.
    """
    phishing_score = float(features.get('eml_phishing_score', features.get('phishing_keywords_score', 0.0)))
    suspicious_domain = float(features.get('eml_suspicious_domain', features.get('suspicious_sender_domain', 0)))
    malicious_attachment = float(features.get('eml_malicious_attachment', features.get('malicious_attachment_flag', 0)))
    spf_dkim_fail = float(features.get('eml_spf_dkim_fail', features.get('spf_dkim_fail', 0)))
    link_count = float(features.get('eml_link_count', features.get('link_count', 0)))
    
    score = (
        (phishing_score * 35.0) +
        (suspicious_domain * 25.0) +
        (malicious_attachment * 25.0) +
        (spf_dkim_fail * 10.0) +
        (min(link_count, 10.0) / 10.0 * 5.0)
    )
    
    return round(min(100.0, max(0.0, score)), 1)

def calculate_enterprise_risk(net_risk, end_risk, eml_risk, weights=None):
    """
    Combines network, endpoint, and email risk scores using weighted formulation:
    Enterprise Risk Score = (Network Risk * w_net) + (Endpoint Risk * w_end) + (Email Risk * w_eml)
    """
    if weights is None:
        weights = {"net": 0.35, "end": 0.35, "eml": 0.30}
        
    w_net = float(weights.get("net", 0.35))
    w_end = float(weights.get("end", 0.35))
    w_eml = float(weights.get("eml", 0.30))
    
    # Normalize weights so they sum to 1.0 if not already
    total_w = w_net + w_end + w_eml
    if total_w > 0:
        w_net /= total_w
        w_end /= total_w
        w_eml /= total_w
        
    net_contrib = round(net_risk * w_net, 2)
    end_contrib = round(end_risk * w_end, 2)
    eml_contrib = round(eml_risk * w_eml, 2)
    
    enterprise_score = round(net_contrib + end_contrib + eml_contrib, 1)
    classification = get_risk_level(enterprise_score)
    
    # Determine primary threat vector
    vector_scores = {"Network": net_risk, "Endpoint": end_risk, "Email": eml_risk}
    primary_vector = max(vector_scores, key=vector_scores.get)
    
    return {
        "enterprise_risk_score": enterprise_score,
        "classification": classification["level"],
        "tier": classification["tier"],
        "color": classification["badge_color"],
        "hex": classification["hex"],
        "posture": classification["action_posture"],
        "weights": {
            "network": round(w_net, 2),
            "endpoint": round(w_end, 2),
            "email": round(w_eml, 2)
        },
        "formula": f"({net_risk:.1f} × {w_net:.2f}) + ({end_risk:.1f} × {w_end:.2f}) + ({eml_risk:.1f} × {w_eml:.2f}) = {enterprise_score:.1f}",
        "sub_scores": {
            "network_risk": round(net_risk, 1),
            "endpoint_risk": round(end_risk, 1),
            "email_risk": round(eml_risk, 1)
        },
        "contributions": {
            "network_contribution": net_contrib,
            "endpoint_contribution": end_contrib,
            "email_contribution": eml_contrib
        },
        "primary_threat_vector": primary_vector
    }

def generate_actionable_recommendations(enterprise_score, net_risk, end_risk, eml_risk, raw_features=None):
    """
    Generates dynamic, CISO-grade cybersecurity remediation recommendations based on score and telemetry.
    """
    recs = []
    
    # Network recommendations
    if net_risk >= 60.0:
        recs.append({
            "category": "Network Defense",
            "priority": "Critical",
            "action": "Enforce dynamic IP-shunning on perimeter firewalls for external subnets initiating persistent SYN sweeps.",
            "impact": "Mitigates automated reconnaissance and perimeter reconnaissance attacks."
        })
        recs.append({
            "category": "Network Defense",
            "priority": "High",
            "action": "Implement strict egress filtering and inspect encrypted DNS (DoH/DoT) tunnels for potential C2 beaconing.",
            "impact": "Halts exfiltration attempts and unapproved DNS channel usage."
        })
    elif net_risk >= 30.0:
        recs.append({
            "category": "Network Defense",
            "priority": "Medium",
            "action": "Audit internal VLAN ACLs and enable anomaly alerting on high-throughput internal transfers.",
            "impact": "Constrains lateral movement pathways across corporate subnets."
        })
    else:
        recs.append({
            "category": "Network Defense",
            "priority": "Low",
            "action": "Maintain routine perimeter port scanning verification and baseline ingress rate rules.",
            "impact": "Maintains network defensive perimeter hygiene."
        })
        
    # Endpoint recommendations
    if end_risk >= 60.0:
        recs.append({
            "category": "Endpoint Hardening",
            "priority": "Critical",
            "action": "Trigger EDR host isolation on endpoints reporting living-off-the-land binaries (powershell/wmic/cmd) execution.",
            "impact": "Prevents active memory injection and persistence mechanism establishment."
        })
        recs.append({
            "category": "Endpoint Hardening",
            "priority": "High",
            "action": "Enforce LSA Protection (RunAsPPL) and credential guard to block LSASS memory dumping tools.",
            "impact": "Inactivates credential scraping via Mimikatz and memory parsers."
        })
    elif end_risk >= 30.0:
        recs.append({
            "category": "Endpoint Hardening",
            "priority": "Medium",
            "action": "Verify EDR sensor agent health and update heuristic definitions across all workstation fleets.",
            "impact": "Ensures zero telemetry blindspots across remote endpoints."
        })
    else:
        recs.append({
            "category": "Endpoint Hardening",
            "priority": "Low",
            "action": "Continue scheduled monthly OS security rollup patching and local administrative privilege audits.",
            "impact": "Keeps endpoint attack surface minimized."
        })

    # Email recommendations
    if eml_risk >= 60.0:
        recs.append({
            "category": "Email & Identity",
            "priority": "Critical",
            "action": "Deploy automated mailbox retraction for messages originating from domains failing DMARC/SPF authentication.",
            "impact": "Stops active executive spear-phishing campaigns from reaching end-user inboxes."
        })
        recs.append({
            "category": "Email & Identity",
            "priority": "High",
            "action": "Revoke active session tokens for high-risk accounts and mandate FIDO2 hardware token verification.",
            "impact": "Neutralizes session hijacking and reverse-proxy credential harvesting."
        })
    elif eml_risk >= 30.0:
        recs.append({
            "category": "Email & Identity",
            "priority": "Medium",
            "action": "Enable sandbox detonation for all inbound email attachments with macro-enabled extensions (.xlsm, .docm, .vbs).",
            "impact": "Intercepts weaponized payload delivery prior to user interaction."
        })
    else:
        recs.append({
            "category": "Email & Identity",
            "priority": "Low",
            "action": "Conduct simulated phishing awareness training for staff and refresh spam filter blocklists.",
            "impact": "Bolsters human firewall resilience against evolving deceptive tactics."
        })

    return recs
