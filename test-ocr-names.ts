import { createWorker } from 'tesseract.js';

async function testOCR() {
  const imagePath = 'C:/Users/fahmi/.gemini/antigravity/brain/724332e7-0524-4746-b8cc-43e4203639c4/.user_uploaded/media_1790439292958.png';
  
  const worker = await createWorker('eng');
  await worker.setParameters({
    tessedit_pageseg_mode: '11' as any,
  });
  
  const result = await worker.recognize(imagePath, undefined, { blocks: true });
  
  const words: any[] = [];
  if (result.data.blocks) {
    for (const block of result.data.blocks) {
      if (!block.paragraphs) continue;
      for (const para of block.paragraphs) {
        if (!para.lines) continue;
        for (const line of para.lines) {
          if (!line.words) continue;
          for (const word of line.words) {
            words.push(word);
          }
        }
      }
    }
  }

  const EXCLUDED_WORDS = new Set([
    'date', 'no', 'age', 'record', 'encounter', 'management', 'problem',
    'episode', 'payor', 'paid', 'self', 'assistant', 'charts', 'filter',
    'reason', 'sex', 'male', 'female', 'back', 'to', 'full', 'urn', 'dob',
    'patient', 'doctor', 'provider', 'history', 'clinical', 'summary',
    'time', 'status', 'type', 'category', 'action', 'edit', 'view', 'delete',
    'save', 'cancel', 'close', 'open', 'add', 'new', 'search', 'find',
    'home', 'dashboard', 'settings', 'profile', 'logout', 'login', 'user',
    'admin', 'system', 'report', 'data', 'file', 'export', 'import',
    'download', 'upload', 'print', 'share', 'send', 'receive', 'message',
    'notification', 'alert', 'error', 'success', 'warning', 'info',
    'mr', 'mrs', 'ms', 'dr', 'drg', 'prof', 'tn', 'ny', 'sdr', 'sdri'
  ]);

  const NAME_WORD_PATTERN = /^[A-Z][a-z]+$/;

  console.log('Words classified as sensitive names:');
  words.forEach(w => {
    const text = (w.text || '').trim();
    // Strip punctuation for checking
    const cleanText = text.replace(/^[^\w]+|[^\w]+$/g, '');
    
    if (NAME_WORD_PATTERN.test(cleanText)) {
      if (!EXCLUDED_WORDS.has(cleanText.toLowerCase()) && cleanText.length > 2) {
        console.log(`- ${cleanText} (Original: ${text})`);
      }
    }
  });

  await worker.terminate();
}

testOCR().catch(console.error);
