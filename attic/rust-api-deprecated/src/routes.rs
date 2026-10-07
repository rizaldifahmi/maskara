use axum::{
    extract::Json,
    http::{HeaderMap, HeaderValue, StatusCode},
    response::IntoResponse,
};
use std::sync::Arc;
use crate::{docx::DocxGenerator, models::ReportData, pdf::PdfGenerator, templates::TemplateEngine};

#[derive(Clone)]
pub struct AppState {
    pub templates_dir: String,
}

pub async fn generate_report(
    axum::extract::State(state): axum::extract::State<Arc<AppState>>,
    Json(data): Json<ReportData>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    if data.consultant_name.trim().is_empty() {
        return Err((StatusCode::BAD_REQUEST, "consultant_name is required".into()));
    }
    if data.project_name.trim().is_empty() {
        return Err((StatusCode::BAD_REQUEST, "project_name is required".into()));
    }
    let engine = TemplateEngine::new(&state.templates_dir);
    let structure = engine.generate_report_structure(&data).map_err(|e| {
        let (s, m): (StatusCode, String) = e.into();
        (s, m)
    })?;
    Ok(Json(serde_json::json!({
        "structure": structure,
        "epics_count": data.epics.len(),
        "activities_count": data.activities.len()
    })))
}

pub async fn export_word(
    axum::extract::State(state): axum::extract::State<Arc<AppState>>,
    Json(data): Json<ReportData>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let engine = TemplateEngine::new(&state.templates_dir);
    let vars = engine.build_variables(&data).map_err(|e| {
        let (s, m): (StatusCode, String) = e.into();
        (s, m)
    })?;
    let bytes = DocxGenerator::generate(&data, &vars).map_err(|e| {
        let (s, m): (StatusCode, String) = e.into();
        (s, m)
    })?;
    let mut headers = HeaderMap::new();
    headers.insert("Content-Type", HeaderValue::from_static("application/vnd.openxmlformats-officedocument.wordprocessingml.document"));
    headers.insert("Content-Disposition", HeaderValue::from_str(&format!("attachment; filename=\"{}-{}.docx\"", sanitize_filename(&data.project_name), data.period_start)).unwrap());
    headers.insert("Content-Length", HeaderValue::from_str(&bytes.len().to_string()).unwrap());
    Ok((StatusCode::OK, headers, bytes))
}

pub async fn export_pdf(
    axum::extract::State(_state): axum::extract::State<Arc<AppState>>,
    Json(data): Json<ReportData>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let bytes = PdfGenerator::generate_with_content(&data).map_err(|e| {
        let (s, m): (StatusCode, String) = e.into();
        (s, m)
    })?;
    let mut headers = HeaderMap::new();
    headers.insert("Content-Type", HeaderValue::from_static("application/pdf"));
    headers.insert("Content-Disposition", HeaderValue::from_str(&format!("attachment; filename=\"{}-{}.pdf\"", sanitize_filename(&data.project_name), data.period_start)).unwrap());
    headers.insert("Content-Length", HeaderValue::from_str(&bytes.len().to_string()).unwrap());
    Ok((StatusCode::OK, headers, bytes))
}

fn sanitize_filename(s: &str) -> String {
    s.chars().map(|c| if c.is_alphanumeric() || c == '-' || c == '_' { c } else { '-' }).collect()
}
