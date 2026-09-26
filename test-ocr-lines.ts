import { createWorker } from 'tesseract.js';

async function testOCR() {
  const imagePath = 'C:/Users/fahmi/.gemini/antigravity/brain/724332e7-0524-4746-b8cc-43e4203639c4/.user_uploaded/media_1790439292958.png';
  
  const worker = await createWorker('eng');
  await worker.setParameters({
    tessedit_pageseg_mode: '11' as any,
  });
  
  const result = await worker.recognize(imagePath, undefined, { blocks: true });
  
  const lines: any[] = [];
  if (result.data.blocks) {
    for (const block of result.data.blocks) {
      if (!block.paragraphs) continue;
      for (const para of block.paragraphs) {
        if (!para.lines) continue;
        for (const line of para.lines) {
          lines.push(line);
        }
      }
    }
  }

  console.log(`Extracted ${lines.length} lines`);
  
  lines.forEach(l => {
    console.log(`LINE: ${l.text.trim()}`);
  });

  await worker.terminate();
}

testOCR().catch(console.error);
