import { createWorker } from 'tesseract.js';
import * as fs from 'fs';
import * as path from 'path';

async function testOCR() {
  console.log('Starting OCR test...');
  const worker = await createWorker('eng');
  
  // Try to recognize the uploaded image
  const imagePath = 'C:/Users/fahmi/.gemini/antigravity/brain/724332e7-0524-4746-b8cc-43e4203639c4/.user_uploaded/media_1790439292958.png';
  
  if (!fs.existsSync(imagePath)) {
    console.error('Image not found:', imagePath);
    return;
  }
  
  const result = await worker.recognize(imagePath);
  const words = result.data.words || [];
  
  const SENSITIVE_PATTERNS = [
    /\\b\\d{2}[-/.]\\d{2}[-/.]\\d{2,4}\\b/,                          // dates
    /\\b\\d{4}[-/.]\\d{2}[-/.]\\d{2}\\b/,                            // ISO dates
    /(\\+62|62|08)\\d{7,12}/,                                      // Indonesian phone
    /\\b\\d{16}\\b/,                                                // NIK (16 digits)
    /\\b\\d{13}\\b/,                                                // BPJS (13 digits)
    /\\b[A-Z]{1,2}\\s?\\d{1,4}\\s?[A-Z]{1,3}\\b/,                   // plate numbers
    /\\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}\\b/i,              // email
    /\\b\\d{5,}\\b/,                                                // long numbers (MRN, IDs)
    /\\b(Jl\\.?|Jalan|RT|RW|Kel\\.?|Kec\\.?)\\b/i,                  // address prefixes
  ];

  function isSensitive(text: string): boolean {
    return SENSITIVE_PATTERNS.some(pattern => pattern.test(text));
  }

  const matches = [];
  for (const w of words) {
    const txt = (w.text || '').trim();
    if (txt) {
      const isSens = isSensitive(txt);
      if (isSens) {
        matches.push({ text: txt, reason: 'regex' });
      } else if (w.confidence != null && w.confidence < 55) {
        matches.push({ text: txt, reason: 'low-confidence', conf: w.confidence });
      }
    }
  }
  
  console.log('--- ALL WORDS ---');
  console.log(words.map((w: any) => w.text).join(' '));
  
  console.log('\\n--- DETECTED ---');
  console.log(matches);
  
  await worker.terminate();
}

testOCR().catch(console.error);
