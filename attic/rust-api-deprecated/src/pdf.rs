use crate::error::ReportEngineError;
use crate::models::ReportData;

/// PDF generator that creates a minimal valid PDF structure.
pub struct PdfGenerator;

impl PdfGenerator {
    /// Generate a minimal valid PDF file from report data.
    /// Note: This is a simplified implementation. For production use,
    /// consider integrating a library like pdfbox or an external service.
    pub fn generate(_data: &ReportData) -> Result<Vec<u8>, ReportEngineError> {
        let mut pdf = String::new();
        
        // PDF header
        pdf.push_str("%PDF-1.4\n");
        
        // Catalog object
        pdf.push_str("1 0 obj\n");
        pdf.push_str("<< /Type /Catalog /Pages 2 0 R >>\n");
        pdf.push_str("endobj\n");
        
        // Pages object
        pdf.push_str("2 0 obj\n");
        pdf.push_str("<< /Type /Pages /Kids [3 0 R] /Count 1 >>\n");
        pdf.push_str("endobj\n");
        
        // Page object
        pdf.push_str("3 0 obj\n");
        pdf.push_str("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\n");
        pdf.push_str("endobj\n");
        
        // Cross-reference table
        let xref_offset = pdf.len() as u32 + 5;
        pdf.push_str("xref\n");
        pdf.push_str("0 4\n");
        pdf.push_str("0000000000 65535 f \n");
        pdf.push_str("0000000009 00000 n \n");
        pdf.push_str("0000000058 00000 n \n");
        pdf.push_str("0000000115 00000 n \n");
        
        // Trailer
        pdf.push_str("trailer\n");
        pdf.push_str("<< /Size 4 /Root 1 0 R >>\n");
        pdf.push_str(&format!("startxref\n{}\n%%EOF", xref_offset));
        
        Ok(pdf.into_bytes())
    }
    
    /// Generate a larger PDF with actual content streams.
    pub fn generate_with_content(data: &ReportData) -> Result<Vec<u8>, ReportEngineError> {
        let mut pdf = String::new();
        
        // Calculate text content based on report data
        let consultant = data.consultant_name.clone();
        let project = data.project_name.clone();
        let start = data.period_start.clone();
        let end = data.period_end.clone();
        let epics_count = data.epics.len();
        let activities_count = data.activities.len();
        
        pdf.push_str("%PDF-1.4\n");
        
        // Object 1: Catalog
        pdf.push_str("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
        
        // Object 2: Pages
        pdf.push_str("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");
        
        // Object 3: Page
        pdf.push_str("3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >>> >>\nendobj\n");
        
        // Object 4: Content stream
        let content = format!("BT /F1 12 Tf 50 750 Td ({} - Report) Tj 0 -20 Td ({}) Tj 0 -20 Td (Period: {} to {}) Tj 0 -20 Td (Epics: {}) Tj 0 -20 Td (Activities: {}) Tj ET",
            project, consultant, start, end, epics_count, activities_count);
        pdf.push_str(&format!("4 0 obj\n<< /Length {} >>\nstream\n{}\nendstream\nendobj\n", content.len(), content));
        
        // Object 5: Font
        pdf.push_str("5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n");
        
        // Xref
        let xref_offset = pdf.len() as u32 + 5;
        pdf.push_str(&format!("xref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000{} 00000 n \n", xref_offset % 100000000));
        
        pdf.push_str(&format!("trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n{}\n%%EOF", xref_offset));
        
        Ok(pdf.into_bytes())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::{Epic, Activity};
    
    #[test]
    fn test_generate_pdf_has_valid_header() {
        let data = ReportData {
            period_start: "2024-01-01".to_string(),
            period_end: "2024-01-31".to_string(),
            consultant_name: "John Doe".to_string(),
            project_name: "Test Project".to_string(),
            epics: vec![],
            activities: vec![],
        };
        
        let pdf = PdfGenerator::generate(&data).unwrap();
        let pdf_str = String::from_utf8_lossy(&pdf);
        
        assert!(pdf_str.starts_with("%PDF-1.4"));
        assert!(pdf_str.contains("endobj"));
        assert!(pdf_str.contains("%%EOF"));
    }
    
    #[test]
    fn test_generate_pdf_with_content() {
        let data = ReportData {
            period_start: "2024-01-01".to_string(),
            period_end: "2024-01-31".to_string(),
            consultant_name: "John Doe".to_string(),
            project_name: "Test Project".to_string(),
            epics: vec![Epic { key: "P1".to_string(), title: "Title".to_string(), status: "Done".to_string() }],
            activities: vec![Activity { date: "2024-01-01".to_string(), description: "Work".to_string(), hours: 8.0 }],
        };
        
        let pdf = PdfGenerator::generate_with_content(&data).unwrap();
        let pdf_str = String::from_utf8_lossy(&pdf);
        
        assert!(pdf_str.contains("Test Project - Report"));
        assert!(pdf_str.contains("John Doe"));
        assert!(pdf_str.len() > 300);
    }
}
