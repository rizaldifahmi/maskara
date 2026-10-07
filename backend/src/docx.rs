use std::io::{Cursor, Read, Write};
use zip::{ZipArchive, ZipWriter};
use zip::write::FileOptions;
use crate::error::ReportEngineError;
use crate::models::{ReportData, Epic, Activity};
use std::collections::HashMap;

/// DOCX generator that loads a verified .docx template and replaces placeholders.
/// Template is embedded via include_bytes! — no filesystem I/O at runtime.
pub struct DocxGenerator;

impl DocxGenerator {
    /// Generate a .docx file by loading the embedded template and replacing
    /// {{VARIABLE}} placeholders with escaped, template-ready values.
    pub fn generate(
        _data: &ReportData,
        variables: &HashMap<String, String>,
    ) -> Result<Vec<u8>, ReportEngineError> {
        // Embedded template — read-only, no temp writes (security: prevents zip-slip/file-system attacks)
        let template_data = include_bytes!("../templates/report_template.docx");

        let reader = Cursor::new(template_data);
        let mut archive = ZipArchive::new(reader)
            .map_err(|e| ReportEngineError::GenerationFailed(format!("Failed to read template ZIP: {}", e)))?;

        let buf = Vec::new();
        let writer = Cursor::new(buf);
        let mut zip = ZipWriter::new(writer);

        for i in 0..archive.len() {
            let file_name = archive.by_index(i).map_err(|e| {
                ReportEngineError::GenerationFailed(format!("Cannot access template entry {}: {}", i, e))
            })?.name().to_string();
            let mut file = archive.by_index(i).map_err(|e| {
                ReportEngineError::GenerationFailed(format!("Cannot access template entry {}: {}", i, e))
            })?;

            zip.start_file(&file_name, FileOptions::default())
                .map_err(|e| ReportEngineError::GenerationFailed(format!("Cannot write output: {}", e)))?;

            if file_name == "word/document.xml" {
                let mut content = String::new();
                file.read_to_string(&mut content)
                    .map_err(|e| ReportEngineError::GenerationFailed(format!("Cannot read XML: {}", e)))?;

                // Template variable replacement (docxtemplater-style):
                // All variables are pre-escaped by TemplateEngine::build_variables.
                for (key, val) in variables {
                    let placeholder = format!("{{{{{}}}}}", key);
                    content = content.replace(&placeholder, val);
                }
                zip.write_all(content.as_bytes())
                    .map_err(|e| ReportEngineError::GenerationFailed(format!("Cannot write XML: {}", e)))?;
            } else {
                std::io::copy(&mut file, &mut zip)
                    .map_err(|e| ReportEngineError::GenerationFailed(format!("Cannot copy template file: {}", e)))?;
            }
        }

        let cursor = zip.finish().map_err(|e| {
            ReportEngineError::GenerationFailed(format!("Failed to finalize ZIP: {}", e))
        })?;
        Ok(cursor.into_inner())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::templates::TemplateEngine;

    fn sample_data() -> ReportData {
        ReportData {
            period_start: "2024-01-01".to_string(),
            period_end: "2024-01-31".to_string(),
            consultant_name: "John Doe".to_string(),
            project_name: "Test Project".to_string(),
            epics: vec![
                Epic { key: "PROJ-1".to_string(), title: "Feature A".to_string(), status: "Done".to_string() },
                Epic { key: "PROJ-2".to_string(), title: "Feature B".to_string(), status: "In Progress".to_string() },
            ],
            activities: vec![
                Activity { date: "2024-01-01".to_string(), description: "Work on A".to_string(), hours: 8.0 },
            ],
        }
    }

    #[test]
    fn test_template_file_is_valid_zip() {
        let cursor = Cursor::new(include_bytes!("../templates/report_template.docx"));
        let mut archive = zip::ZipArchive::new(cursor).unwrap();
        let mut names: Vec<String> = Vec::new();
        for i in 0..archive.len() {
            names.push(archive.by_index(i).unwrap().name().to_string());
        }
        let has_doc = names.iter().any(|n| n == "word/document.xml");
        let has_ct = names.iter().any(|n| n == "[Content_Types].xml");
        assert!(has_doc, "template must contain word/document.xml");
        assert!(has_ct, "template must contain [Content_Types].xml");
    }

    #[test]
    fn test_generate_docx_produces_valid_zip() {
        let data = sample_data();
        let engine = TemplateEngine::new("templates");
        let vars = engine.build_variables(&data).unwrap();
        let docx = DocxGenerator::generate(&data, &vars).unwrap();

        // Verify ZIP signature
        assert!(docx.len() > 4);
        assert_eq!(&docx[0..2], b"PK");

        let cursor = Cursor::new(&docx);
        let mut archive = zip::ZipArchive::new(cursor).unwrap();
        assert!(archive.by_name("[Content_Types].xml").is_ok());
        assert!(archive.by_name("word/document.xml").is_ok());
    }

    #[test]
    fn test_placeholders_replaced_in_output() {
        let data = sample_data();
        let engine = TemplateEngine::new("templates");
        let vars = engine.build_variables(&data).unwrap();
        let docx = DocxGenerator::generate(&data, &vars).unwrap();

        let cursor = Cursor::new(&docx);
        let mut archive = zip::ZipArchive::new(cursor).unwrap();
        let mut doc = archive.by_name("word/document.xml").unwrap();
        let mut content = String::new();
        doc.read_to_string(&mut content).unwrap();

        // Template values should be present
        assert!(content.contains("Test Project"), "project name should be in output");
        assert!(content.contains("John Doe"), "consultant name should be in output");
        assert!(content.contains("2024-01-01"), "period start should be in output");
        // No unreplaced placeholders for basic fields
        assert!(!content.contains("{{PROJECT_NAME}}"), "PROJECT_NAME placeholder must be replaced");
        assert!(!content.contains("{{CONSULTANT_NAME}}"), "CONSULTANT_NAME placeholder must be replaced");
    }

    #[test]
    fn test_epic_and_activity_rows_in_output() {
        let data = sample_data();
        let engine = TemplateEngine::new("templates");
        let vars = engine.build_variables(&data).unwrap();
        let docx = DocxGenerator::generate(&data, &vars).unwrap();

        let cursor = Cursor::new(&docx);
        let mut archive = zip::ZipArchive::new(cursor).unwrap();
        let mut doc = archive.by_name("word/document.xml").unwrap();
        let mut content = String::new();
        doc.read_to_string(&mut content).unwrap();

        // Epic rows
        assert!(content.contains("PROJ-1"), "first epic key should appear");
        assert!(content.contains("Feature A"), "first epic title should appear");
        // Activity rows
        assert!(content.contains("Work on A"), "activity description should appear");
        // No unreplaced table placeholders
        assert!(!content.contains("{{EPICS_TABLE_ROWS}}"), "EPICS_TABLE_ROWS must be replaced");
        assert!(!content.contains("{{ACTIVITIES_TABLE_ROWS}}"), "ACTIVITIES_TABLE_ROWS must be replaced");
    }

    #[test]
    fn test_empty_epics_generates_valid_doc() {
        let data = ReportData {
            period_start: "2024-01-01".to_string(),
            period_end: "2024-01-31".to_string(),
            consultant_name: "Jane".to_string(),
            project_name: "Empty Project".to_string(),
            epics: vec![],
            activities: vec![],
        };
        let engine = TemplateEngine::new("templates");
        let vars = engine.build_variables(&data).unwrap();
        let docx = DocxGenerator::generate(&data, &vars).unwrap();

        let cursor = Cursor::new(&docx);
        let mut archive = zip::ZipArchive::new(cursor).unwrap();
        let mut doc = archive.by_name("word/document.xml").unwrap();
        let mut content = String::new();
        doc.read_to_string(&mut content).unwrap();

        // Empty table placeholders replaced with empty string
        assert!(!content.contains("{{EPICS_TABLE_ROWS}}"));
        assert!(!content.contains("{{ACTIVITIES_TABLE_ROWS}}"));
        assert!(content.contains("Empty Project"));
    }

    #[test]
    fn test_xml_escaping_in_template_values() {
        let data = ReportData {
            period_start: "2024-01-01".to_string(),
            period_end: "2024-01-31".to_string(),
            consultant_name: "John & Mary <Smith>".to_string(),
            project_name: "X\"Y'Z".to_string(),
            epics: vec![],
            activities: vec![],
        };
        let engine = TemplateEngine::new("templates");
        let vars = engine.build_variables(&data).unwrap();
        let docx = DocxGenerator::generate(&data, &vars).unwrap();

        let cursor = Cursor::new(&docx);
        let mut archive = zip::ZipArchive::new(cursor).unwrap();
        let mut doc = archive.by_name("word/document.xml").unwrap();
        let mut content = String::new();
        doc.read_to_string(&mut content).unwrap();

        // XML special chars should be escaped in the output
        assert!(content.contains("John &amp; Mary &lt;Smith&gt;"), "special chars must be escaped");
        assert!(!content.contains("John & Mary <Smith>"), "raw unescaped chars must not appear");
    }

    #[test]
    fn test_total_hours_in_output() {
        let data = sample_data();
        let engine = TemplateEngine::new("templates");
        let vars = engine.build_variables(&data).unwrap();
        let docx = DocxGenerator::generate(&data, &vars).unwrap();

        let cursor = Cursor::new(&docx);
        let mut archive = zip::ZipArchive::new(cursor).unwrap();
        let mut doc = archive.by_name("word/document.xml").unwrap();
        let mut content = String::new();
        doc.read_to_string(&mut content).unwrap();

        // Total hours = 8.0h from one activity
        assert!(content.contains("8.0"), "total hours should appear in output");
    }

    #[test]
    fn test_unicode_data_in_template() {
        let data = ReportData {
            period_start: "2024-01-01".to_string(),
            period_end: "2024-01-31".to_string(),
            consultant_name: "Budi Ahmad Putra".to_string(),
            project_name: "Projek Data - Dashboard".to_string(),
            epics: vec![
                Epic { key: "PROJ-1".to_string(), title: "Implementasi fitur A".to_string(), status: "Selesai".to_string() },
            ],
            activities: vec![
                Activity { date: "2024-01-01".to_string(), description: "Kerja pada fitur A".to_string(), hours: 7.5 },
            ],
        };
        let engine = TemplateEngine::new("templates");
        let vars = engine.build_variables(&data).unwrap();
        let docx = DocxGenerator::generate(&data, &vars).unwrap();

        let cursor = Cursor::new(&docx);
        let mut archive = zip::ZipArchive::new(cursor).unwrap();
        let mut doc = archive.by_name("word/document.xml").unwrap();
        let mut content = String::new();
        doc.read_to_string(&mut content).unwrap();

        assert!(content.contains("Budi Ahmad Putra"));
        assert!(content.contains("Implementasi fitur A"));
        assert!(content.contains("Kerja pada fitur A"));
    }
}
