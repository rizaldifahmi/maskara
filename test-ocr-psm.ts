import { createWorker } from 'tesseract.js';

async function testOCR() {
  const imagePath = 'C:/Users/fahmi/.gemini/antigravity/brain/724332e7-0524-4746-b8cc-43e4203639c4/.user_uploaded/media_1790439292958.png';
  
  const worker = await createWorker('eng');
  await worker.setParameters({
    tessedit_pageseg_mode: '11' as any,
  });
  
  // Ask for blocks in the output
  const result = await worker.recognize(imagePath, undefined, { blocks: true });
  
  console.log('Has blocks?', !!result.data.blocks);
  
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

  console.log(`Extracted ${words.length} words from blocks hierarchy`);
  
  words.slice(0, 10).forEach(w => {
    console.log(`- ${w.text} (conf: ${w.confidence})`);
  });

  await worker.terminate();
}

testOCR().catch(console.error);
