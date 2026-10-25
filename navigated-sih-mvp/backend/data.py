"""
Data structures and preloaded Indian Railway corridors, trains, sections, and historical parameters.
"""

# Major Indian Railways Corridors with section-level decomposition
CORRIDORS = {
    "NDLS-HWH": {
        "id": "NDLS-HWH",
        "name": "Northern Trunk Corridor (New Delhi to Howrah)",
        "zone": "NR / NCR / ECR / ER",
        "length_km": 1447,
        "stations": [
            {"code": "NDLS", "name": "New Delhi", "km": 0, "platforms": 16, "city": "Delhi", "coords": [28.6427, 77.2195]},
            {"code": "GZB", "name": "Ghaziabad Jn", "km": 25, "platforms": 6, "city": "Ghaziabad", "coords": [28.6678, 77.4326]},
            {"code": "ALJN", "name": "Aligarh Jn", "km": 131, "platforms": 7, "city": "Aligarh", "coords": [27.8974, 78.0880]},
            {"code": "TDL", "name": "Tundla Jn", "km": 209, "platforms": 5, "city": "Tundla", "coords": [27.2081, 78.2415]},
            {"code": "ETW", "name": "Etawah Jn", "km": 301, "platforms": 5, "city": "Etawah", "coords": [26.7725, 79.0305]},
            {"code": "CNB", "name": "Kanpur Central", "km": 440, "platforms": 10, "city": "Kanpur", "coords": [26.4547, 80.3507]},
            {"code": "FTP", "name": "Fatehpur", "km": 518, "platforms": 4, "city": "Fatehpur", "coords": [25.9286, 80.8128]},
            {"code": "PRYJ", "name": "Prayagraj Jn (Allahabad)", "km": 634, "platforms": 10, "city": "Prayagraj", "coords": [25.4484, 81.8340]},
            {"code": "MZP", "name": "Mirzapur", "km": 724, "platforms": 4, "city": "Mirzapur", "coords": [25.1337, 82.5644]},
            {"code": "DDU", "name": "Pt. Deen Dayal Upadhyaya Jn", "km": 787, "platforms": 8, "city": "Mughalsarai", "coords": [25.2818, 83.1189]},
            {"code": "BXR", "name": "Buxar", "km": 881, "platforms": 3, "city": "Buxar", "coords": [25.5647, 83.9777]},
            {"code": "ARA", "name": "Ara Jn", "km": 950, "platforms": 4, "city": "Ara", "coords": [25.5541, 84.6634]},
            {"code": "PNBE", "name": "Patna Jn", "km": 999, "platforms": 10, "city": "Patna", "coords": [25.6022, 85.1376]},
            {"code": "MKA", "name": "Mokama Jn", "km": 1088, "platforms": 4, "city": "Mokama", "coords": [25.3976, 85.9189]},
            {"code": "KIUL", "name": "Kiul Jn", "km": 1122, "platforms": 5, "city": "Lakhisarai", "coords": [25.1764, 86.0961]},
            {"code": "JAJ", "name": "Jhajha", "km": 1176, "platforms": 4, "city": "Jhajha", "coords": [24.7725, 86.3769]},
            {"code": "JSME", "name": "Jasidih Jn", "km": 1220, "platforms": 5, "city": "Jasidih", "coords": [24.5152, 86.6433]},
            {"code": "ASN", "name": "Asansol Jn", "km": 1330, "platforms": 7, "city": "Asansol", "coords": [23.6871, 86.9746]},
            {"code": "BWN", "name": "Barddhaman Jn", "km": 1406, "platforms": 8, "city": "Barddhaman", "coords": [23.2324, 87.8615]},
            {"code": "HWH", "name": "Howrah Jn", "km": 1447, "platforms": 23, "city": "Kolkata", "coords": [22.5838, 88.3426]}
        ],
        "sections": [
            {"id": "SEC-NDLS-GZB", "from": "NDLS", "to": "GZB", "length_km": 25, "tracks": 4, "max_speed_kmh": 110, "curvature_idx": 0.2, "gradient_idx": 0.1, "historical_congestion": 0.75},
            {"id": "SEC-GZB-ALJN", "from": "GZB", "to": "ALJN", "length_km": 106, "tracks": 2, "max_speed_kmh": 130, "curvature_idx": 0.1, "gradient_idx": 0.05, "historical_congestion": 0.45},
            {"id": "SEC-ALJN-TDL", "from": "ALJN", "to": "TDL", "length_km": 78, "tracks": 2, "max_speed_kmh": 130, "curvature_idx": 0.15, "gradient_idx": 0.08, "historical_congestion": 0.55, "fog_prone": True},
            {"id": "SEC-TDL-ETW", "from": "TDL", "to": "ETW", "length_km": 92, "tracks": 2, "max_speed_kmh": 130, "curvature_idx": 0.1, "gradient_idx": 0.05, "historical_congestion": 0.40, "fog_prone": True},
            {"id": "SEC-ETW-CNB", "from": "ETW", "to": "CNB", "length_km": 139, "tracks": 2, "max_speed_kmh": 130, "curvature_idx": 0.2, "gradient_idx": 0.12, "historical_congestion": 0.65},
            {"id": "SEC-CNB-FTP", "from": "CNB", "to": "FTP", "length_km": 78, "tracks": 2, "max_speed_kmh": 130, "curvature_idx": 0.1, "gradient_idx": 0.05, "historical_congestion": 0.45},
            {"id": "SEC-FTP-PRYJ", "from": "FTP", "to": "PRYJ", "length_km": 116, "tracks": 2, "max_speed_kmh": 130, "curvature_idx": 0.15, "gradient_idx": 0.06, "historical_congestion": 0.50},
            {"id": "SEC-PRYJ-MZP", "from": "PRYJ", "to": "MZP", "length_km": 90, "tracks": 2, "max_speed_kmh": 120, "curvature_idx": 0.25, "gradient_idx": 0.15, "historical_congestion": 0.40},
            {"id": "SEC-MZP-DDU", "from": "MZP", "to": "DDU", "length_km": 63, "tracks": 2, "max_speed_kmh": 120, "curvature_idx": 0.2, "gradient_idx": 0.1, "historical_congestion": 0.80, "bottleneck": True},
            {"id": "SEC-DDU-BXR", "from": "DDU", "to": "BXR", "length_km": 94, "tracks": 2, "max_speed_kmh": 130, "curvature_idx": 0.1, "gradient_idx": 0.05, "historical_congestion": 0.35},
            {"id": "SEC-BXR-ARA", "from": "BXR", "to": "ARA", "length_km": 69, "tracks": 2, "max_speed_kmh": 130, "curvature_idx": 0.1, "gradient_idx": 0.04, "historical_congestion": 0.40},
            {"id": "SEC-ARA-PNBE", "from": "ARA", "to": "PNBE", "length_km": 49, "tracks": 2, "max_speed_kmh": 110, "curvature_idx": 0.2, "gradient_idx": 0.1, "historical_congestion": 0.70},
            {"id": "SEC-PNBE-MKA", "from": "PNBE", "to": "MKA", "length_km": 89, "tracks": 2, "max_speed_kmh": 120, "curvature_idx": 0.15, "gradient_idx": 0.08, "historical_congestion": 0.50},
            {"id": "SEC-MKA-KIUL", "from": "MKA", "to": "KIUL", "length_km": 34, "tracks": 2, "max_speed_kmh": 110, "curvature_idx": 0.2, "gradient_idx": 0.12, "historical_congestion": 0.55},
            {"id": "SEC-KIUL-JAJ", "from": "KIUL", "to": "JAJ", "length_km": 54, "tracks": 2, "max_speed_kmh": 110, "curvature_idx": 0.3, "gradient_idx": 0.25, "historical_congestion": 0.45},
            {"id": "SEC-JAJ-JSME", "from": "JAJ", "to": "JSME", "length_km": 44, "tracks": 2, "max_speed_kmh": 120, "curvature_idx": 0.25, "gradient_idx": 0.2, "historical_congestion": 0.40},
            {"id": "SEC-JSME-ASN", "from": "JSME", "to": "ASN", "length_km": 110, "tracks": 2, "max_speed_kmh": 130, "curvature_idx": 0.2, "gradient_idx": 0.15, "historical_congestion": 0.60},
            {"id": "SEC-ASN-BWN", "from": "ASN", "to": "BWN", "length_km": 76, "tracks": 3, "max_speed_kmh": 130, "curvature_idx": 0.1, "gradient_idx": 0.05, "historical_congestion": 0.50},
            {"id": "SEC-BWN-HWH", "from": "BWN", "to": "HWH", "length_km": 41, "tracks": 4, "max_speed_kmh": 110, "curvature_idx": 0.2, "gradient_idx": 0.08, "historical_congestion": 0.85}
        ]
    },
    "MMCT-ADI": {
        "id": "MMCT-ADI",
        "name": "Western High-Density Corridor (Mumbai to Ahmedabad)",
        "zone": "WR",
        "length_km": 493,
        "stations": [
            {"code": "MMCT", "name": "Mumbai Central", "km": 0, "platforms": 8, "city": "Mumbai", "coords": [18.9696, 72.8193]},
            {"code": "BVI", "name": "Borivali", "km": 30, "platforms": 10, "city": "Mumbai Suburban", "coords": [19.2288, 72.8569]},
            {"code": "VAPI", "name": "Vapi", "km": 168, "platforms": 3, "city": "Vapi", "coords": [20.3705, 72.9094]},
            {"code": "ST", "name": "Surat", "km": 263, "platforms": 6, "city": "Surat", "coords": [21.2049, 72.8406]},
            {"code": "BRC", "name": "Vadodara Jn", "km": 392, "platforms": 7, "city": "Vadodara", "coords": [22.3106, 73.1812]},
            {"code": "ADI", "name": "Ahmedabad Jn", "km": 493, "platforms": 12, "city": "Ahmedabad", "coords": [23.0225, 72.6000]}
        ],
        "sections": [
            {"id": "SEC-MMCT-BVI", "from": "MMCT", "to": "BVI", "length_km": 30, "tracks": 6, "max_speed_kmh": 100, "curvature_idx": 0.2, "gradient_idx": 0.05, "historical_congestion": 0.90},
            {"id": "SEC-BVI-VAPI", "from": "BVI", "to": "VAPI", "length_km": 138, "tracks": 2, "max_speed_kmh": 130, "curvature_idx": 0.15, "gradient_idx": 0.08, "historical_congestion": 0.45},
            {"id": "SEC-VAPI-ST", "from": "VAPI", "to": "ST", "length_km": 95, "tracks": 2, "max_speed_kmh": 130, "curvature_idx": 0.1, "gradient_idx": 0.05, "historical_congestion": 0.60},
            {"id": "SEC-ST-BRC", "from": "ST", "to": "BRC", "length_km": 129, "tracks": 2, "max_speed_kmh": 130, "curvature_idx": 0.1, "gradient_idx": 0.05, "historical_congestion": 0.50},
            {"id": "SEC-BRC-ADI", "from": "BRC", "to": "ADI", "length_km": 101, "tracks": 2, "max_speed_kmh": 130, "curvature_idx": 0.1, "gradient_idx": 0.05, "historical_congestion": 0.65}
        ]
    }
}

# Pre-configured Coaching Trains with Timetable Baseline
TRAINS = [
    {
        "train_no": "12301",
        "train_name": "Howrah Rajdhani Express",
        "corridor_id": "NDLS-HWH",
        "type": "Rajdhani / Premium",
        "priority_level": 1,
        "rake_type": "LHB",
        "scheduled_dep": "16:55",
        "current_status": {
            "current_section_id": "SEC-TDL-ETW",
            "progress_percent_in_section": 62.0,
            "current_km": 266.0,
            "current_speed_kmh": 118.5,
            "scheduled_delay_min": 24,
            "static_extrapolated_delay_min": 24,
            "rfid_last_tag": "RFID-TDL-DOWN-04",
            "signal_aspect": "DOUBLE_YELLOW",
            "signaling_block_id": "BLK-NCR-266",
            "last_ping_seconds_ago": 6
        },
        "stops": ["NDLS", "CNB", "PRYJ", "DDU", "PNBE", "ASN", "HWH"],
        "schedule": [
            {"station": "NDLS", "sch_arr": "---", "sch_dep": "16:55", "dist_km": 0},
            {"station": "CNB", "sch_arr": "21:30", "sch_dep": "21:35", "dist_km": 440},
            {"station": "PRYJ", "sch_arr": "23:43", "sch_dep": "23:45", "dist_km": 634},
            {"station": "DDU", "sch_arr": "01:25", "sch_dep": "01:35", "dist_km": 787},
            {"station": "PNBE", "sch_arr": "04:40", "sch_dep": "04:50", "dist_km": 999},
            {"station": "ASN", "sch_arr": "08:05", "sch_dep": "08:07", "dist_km": 1330},
            {"station": "HWH", "sch_arr": "10:05", "sch_dep": "---", "dist_km": 1447}
        ]
    },
    {
        "train_no": "22436",
        "train_name": "Vande Bharat Express (Varanasi)",
        "corridor_id": "NDLS-HWH",
        "type": "Vande Bharat / Semi-High Speed",
        "priority_level": 1,
        "rake_type": "Train-18 EMU",
        "scheduled_dep": "06:00",
        "current_status": {
            "current_section_id": "SEC-GZB-ALJN",
            "progress_percent_in_section": 85.0,
            "current_km": 115.0,
            "current_speed_kmh": 128.0,
            "scheduled_delay_min": 3,
            "static_extrapolated_delay_min": 3,
            "rfid_last_tag": "RFID-ALJN-UP-02",
            "signal_aspect": "GREEN",
            "signaling_block_id": "BLK-NR-115",
            "last_ping_seconds_ago": 3
        },
        "stops": ["NDLS", "CNB", "PRYJ", "DDU"],
        "schedule": [
            {"station": "NDLS", "sch_arr": "---", "sch_dep": "06:00", "dist_km": 0},
            {"station": "CNB", "sch_arr": "10:08", "sch_dep": "10:10", "dist_km": 440},
            {"station": "PRYJ", "sch_arr": "12:08", "sch_dep": "12:10", "dist_km": 634},
            {"station": "DDU", "sch_arr": "14:00", "sch_dep": "---", "dist_km": 787}
        ]
    },
    {
        "train_no": "12004",
        "train_name": "Lucknow Shatabdi Express",
        "corridor_id": "NDLS-HWH",
        "type": "Shatabdi / Superfast",
        "priority_level": 2,
        "rake_type": "LHB",
        "scheduled_dep": "06:10",
        "current_status": {
            "current_section_id": "SEC-ETW-CNB",
            "progress_percent_in_section": 35.0,
            "current_km": 350.0,
            "current_speed_kmh": 110.0,
            "scheduled_delay_min": 18,
            "static_extrapolated_delay_min": 18,
            "rfid_last_tag": "RFID-PHD-DN-01",
            "signal_aspect": "YELLOW",
            "signaling_block_id": "BLK-NCR-350",
            "last_ping_seconds_ago": 5
        },
        "stops": ["NDLS", "GZB", "ALJN", "TDL", "ETW", "CNB"],
        "schedule": [
            {"station": "NDLS", "sch_arr": "---", "sch_dep": "06:10", "dist_km": 0},
            {"station": "GZB", "sch_arr": "06:48", "sch_dep": "06:50", "dist_km": 25},
            {"station": "ALJN", "sch_arr": "07:47", "sch_dep": "07:49", "dist_km": 131},
            {"station": "TDL", "sch_arr": "08:43", "sch_dep": "08:45", "dist_km": 209},
            {"station": "ETW", "sch_arr": "09:40", "sch_dep": "09:42", "dist_km": 301},
            {"station": "CNB", "sch_arr": "11:20", "sch_dep": "---", "dist_km": 440}
        ]
    },
    {
        "train_no": "12802",
        "train_name": "Purushottam Express",
        "corridor_id": "NDLS-HWH",
        "type": "Superfast Mail/Express",
        "priority_level": 3,
        "rake_type": "LHB",
        "scheduled_dep": "22:40",
        "current_status": {
            "current_section_id": "SEC-MZP-DDU",
            "progress_percent_in_section": 45.0,
            "current_km": 752.0,
            "current_speed_kmh": 72.0,
            "scheduled_delay_min": 52,
            "static_extrapolated_delay_min": 52,
            "rfid_last_tag": "RFID-MZP-DN-08",
            "signal_aspect": "YELLOW",
            "signaling_block_id": "BLK-NCR-752",
            "last_ping_seconds_ago": 8
        },
        "stops": ["NDLS", "CNB", "FTP", "PRYJ", "MZP", "DDU", "BXR", "ARA", "PNBE", "KIUL", "JSME", "ASN"],
        "schedule": [
            {"station": "NDLS", "sch_arr": "---", "sch_dep": "22:40", "dist_km": 0},
            {"station": "CNB", "sch_arr": "04:00", "sch_dep": "04:05", "dist_km": 440},
            {"station": "PRYJ", "sch_arr": "06:55", "sch_dep": "07:00", "dist_km": 634},
            {"station": "DDU", "sch_arr": "09:50", "sch_dep": "10:00", "dist_km": 787},
            {"station": "PNBE", "sch_arr": "13:30", "sch_dep": "13:40", "dist_km": 999},
            {"station": "ASN", "sch_arr": "18:40", "sch_dep": "---", "dist_km": 1330}
        ]
    },
    {
        "train_no": "12952",
        "train_name": "Mumbai Tejas Rajdhani Express",
        "corridor_id": "MMCT-ADI",
        "type": "Tejas Rajdhani / Premium",
        "priority_level": 1,
        "rake_type": "Tejas Sleeper",
        "scheduled_dep": "17:00",
        "current_status": {
            "current_section_id": "SEC-BVI-VAPI",
            "progress_percent_in_section": 40.0,
            "current_km": 85.0,
            "current_speed_kmh": 124.0,
            "scheduled_delay_min": 4,
            "static_extrapolated_delay_min": 4,
            "rfid_last_tag": "RFID-PLG-UP-01",
            "signal_aspect": "GREEN",
            "signaling_block_id": "BLK-WR-085",
            "last_ping_seconds_ago": 4
        },
        "stops": ["MMCT", "BVI", "VAPI", "ST", "BRC", "ADI"],
        "schedule": [
            {"station": "MMCT", "sch_arr": "---", "sch_dep": "17:00", "dist_km": 0},
            {"station": "BVI", "sch_arr": "17:28", "sch_dep": "17:30", "dist_km": 30},
            {"station": "ST", "sch_arr": "19:48", "sch_dep": "19:53", "dist_km": 263},
            {"station": "BRC", "sch_arr": "21:18", "sch_dep": "21:23", "dist_km": 392},
            {"station": "ADI", "sch_arr": "23:05", "sch_dep": "---", "dist_km": 493}
        ]
    }
]

# Preset Disruption Scenarios for What-If Sandbox
DISRUPTION_PRESETS = [
    {
        "id": "SCEN_FOG_TUNDLA",
        "title": "Severe Winter Fog Advisory (Visibility < 100m)",
        "section_id": "SEC-ALJN-TDL",
        "type": "WEATHER_FOG",
        "severity": "HIGH",
        "description": "Dense radiation fog along the Yamuna basin reducing maximum permissible speed to 60 km/h with mandatory detonator placement and fog-pass devices.",
        "impact_factor": 1.75,
        "speed_cap_kmh": 60,
        "confidence_penalty": 0.35
    },
    {
        "id": "SCEN_TRACK_MAINT_MZP",
        "title": "Planned Track Renewal & Caution Order (Mirzapur)",
        "section_id": "SEC-MZP-DDU",
        "type": "INFRASTRUCTURE",
        "severity": "MEDIUM",
        "description": "Deep screening and ballast tamping caution order (30 km/h speed restriction over 4.2 km length).",
        "impact_factor": 1.45,
        "speed_cap_kmh": 30,
        "confidence_penalty": 0.20
    },
    {
        "id": "SCEN_FREIGHT_BUNCHING_CNB",
        "title": "Goods Train Overtake & Headway Bunching (Kanpur)",
        "section_id": "SEC-ETW-CNB",
        "type": "TRAFFIC_BUNCHING",
        "severity": "HIGH",
        "description": "Heavy container rake running on loop line awaiting yard line clearance; 3 coaching trains stacked within 18 km block headway.",
        "impact_factor": 1.60,
        "speed_cap_kmh": 45,
        "confidence_penalty": 0.40
    },
    {
        "id": "SCEN_SIGNAL_ASPECT_FAILURE",
        "title": "Automatic Block Signalling Intermittent Failure",
        "section_id": "SEC-TDL-ETW",
        "type": "SIGNALING",
        "severity": "CRITICAL",
        "description": "Track circuit glitch triggering Red aspect across 2 consecutive automatic signal blocks. Manual piloting required.",
        "impact_factor": 2.10,
        "speed_cap_kmh": 15,
        "confidence_penalty": 0.55
    }
]
