use axum::{routing::post, Router};
use std::net::SocketAddr;
use std::sync::Arc;
use tower_http::cors::{Any, CorsLayer};
use tower_http::trace::TraceLayer;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod docx;
mod error;
mod models;
mod pdf;
mod routes;
mod templates;

use routes::{export_pdf, export_word, generate_report, AppState};

#[tokio::main]
async fn main() {
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            std::env::var("RUST_LOG").unwrap_or_else(|_| "info".into()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    let state = Arc::new(AppState {
        templates_dir: "templates".to_string(),
    });

    let app = Router::new()
        .route("/api/reports/generate", post(generate_report))
        .route("/api/reports/export/word", post(export_word))
        .route("/api/reports/export/pdf", post(export_pdf))
        .layer(TraceLayer::new_for_http())
        .layer(CorsLayer::new().allow_origin(Any).allow_methods(Any).allow_headers(Any))
        .with_state(state);

    let addr = SocketAddr::from(([0, 0, 0, 0], 3002));
    tracing::info!("Report engine listening on {}", addr);
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}
