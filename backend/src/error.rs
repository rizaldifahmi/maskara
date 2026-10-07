use thiserror::Error;
use axum::http::StatusCode;

#[derive(Debug, Error)]
pub enum ReportEngineError {
    #[error("Template not found: {0}")]
    TemplateNotFound(String),
    #[error("Document generation failed: {0}")]
    GenerationFailed(String),
    #[error("Serialization error: {0}")]
    SerializationError(String),
    #[error("Missing required data: {0}")]
    MissingData(String),
    #[error("ZIP error: {0}")]
    ZipError(String),
    #[error("IO error: {0}")]
    IoError(String),
    #[error("Invalid input: {0}")]
    InvalidInput(String),
}

impl From<std::io::Error> for ReportEngineError {
    fn from(e: std::io::Error) -> Self { Self::IoError(e.to_string()) }
}
impl From<zip::result::ZipError> for ReportEngineError {
    fn from(e: zip::result::ZipError) -> Self { Self::ZipError(e.to_string()) }
}
impl From<ReportEngineError> for (StatusCode, String) {
    fn from(err: ReportEngineError) -> Self {
        match &err {
            ReportEngineError::TemplateNotFound(_) => (StatusCode::NOT_FOUND, err.to_string()),
            ReportEngineError::InvalidInput(_) | ReportEngineError::MissingData(_) => (StatusCode::BAD_REQUEST, err.to_string()),
            _ => (StatusCode::INTERNAL_SERVER_ERROR, err.to_string()),
        }
    }
}

/// Escape XML/HTML special characters to prevent injection in docx/pdf templates.
pub fn escape_xml(input: &str) -> String {
    input.replace('&', "&amp;").replace('<', "&lt;").replace('>', "&gt;").replace('"', "&quot;").replace('\'', "&apos;")
}
pub fn escape_html(input: &str) -> String { escape_xml(input) }
