use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct ReportData {
    pub period_start: String,
    pub period_end: String,
    pub consultant_name: String,
    pub project_name: String,
    pub epics: Vec<Epic>,
    pub activities: Vec<Activity>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Epic {
    pub key: String,
    pub title: String,
    pub status: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Activity {
    pub date: String,
    pub description: String,
    pub hours: f64,
}
