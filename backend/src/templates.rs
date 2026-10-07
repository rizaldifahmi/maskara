use std::collections::HashMap;
use crate::models::ReportData;
use crate::error::{ReportEngineError, escape_html};

/// Template engine that builds variables for document generation.
pub struct TemplateEngine {
    pub templates_dir: String,
}

impl TemplateEngine {
    pub fn new(templates_dir: &str) -> Self {
        Self {
            templates_dir: templates_dir.to_string(),
        }
    }
    
    /// Build a HashMap of template variables from ReportData.
    /// All HTML/XML special characters are escaped for security.
    pub fn build_variables(&self, data: &ReportData) -> Result<HashMap<String, String>, ReportEngineError> {
        let mut vars = HashMap::new();
        
        // Basic fields
        vars.insert("CONSULTANT_NAME".to_string(), escape_html(&data.consultant_name));
        vars.insert("PROJECT_NAME".to_string(), escape_html(&data.project_name));
        vars.insert("PERIOD_START".to_string(), escape_html(&data.period_start));
        vars.insert("PERIOD_END".to_string(), escape_html(&data.period_end));
        
        // Build epics table rows
        let mut epics_table = String::new();
        for epic in &data.epics {
            epics_table.push_str(&format!(
                "<tr><td>{}</td><td>{}</td><td>{}</td></tr>",
                escape_html(&epic.key),
                escape_html(&epic.title),
                escape_html(&epic.status)
            ));
        }
        vars.insert("EPICS_TABLE_ROWS".to_string(), epics_table);
        
        // Build activities table rows
        let mut activities_table = String::new();
        for activity in &data.activities {
            activities_table.push_str(&format!(
                "<tr><td>{}</td><td>{}</td><td>{:.1}h</td></tr>",
                escape_html(&activity.date),
                escape_html(&activity.description),
                activity.hours
            ));
        }
        vars.insert("ACTIVITIES_TABLE_ROWS".to_string(), activities_table);
        
        // Total hours for attendance summary
        let total_hours: f64 = data.activities.iter().map(|a| a.hours).sum();
        vars.insert("TOTAL_HOURS".to_string(), format!("{:.1}", total_hours));
        
        Ok(vars)
    }
    
    /// Generate a JSON structure representing the report outline.
    /// Used for validation and preview before actual document generation.
    pub fn generate_report_structure(&self, data: &ReportData) -> Result<String, ReportEngineError> {
        let _variables = self.build_variables(data)?;
        
        let structure = serde_json::json!({
            "title_page": {
                "consultant": data.consultant_name,
                "project": data.project_name,
                "period": format!("{} to {}", data.period_start, data.period_end),
            },
            "epics_section": {
                "count": data.epics.len(),
                "items": data.epics,
            },
            "activities_section": {
                "count": data.activities.len(),
                "items": data.activities,
            }
        });
        
        serde_json::to_string_pretty(&structure).map_err(|e| ReportEngineError::SerializationError(e.to_string()))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_escape_html() {
        assert_eq!(escape_html("<script>"), "&lt;script&gt;");
        assert_eq!(escape_html("A & B"), "A &amp; B");
        assert_eq!(escape_html("\"quoted\""), "&quot;quoted&quot;");
    }
    
    #[test]
    fn test_build_variables_escapes_html() {
        let data = ReportData {
            period_start: "2024-01-01".to_string(),
            period_end: "2024-01-31".to_string(),
            consultant_name: "John & Mary <Smith>".to_string(),
            project_name: "Project X\"Y'Z".to_string(),
            epics: vec![],
            activities: vec![],
        };
        
        let engine = TemplateEngine::new("templates");
        let vars = engine.build_variables(&data).unwrap();
        
        assert_eq!(vars.get("CONSULTANT_NAME").unwrap(), "John &amp; Mary &lt;Smith&gt;");
        assert_eq!(vars.get("PROJECT_NAME").unwrap(), "Project X&quot;Y&apos;Z");
    }
}
