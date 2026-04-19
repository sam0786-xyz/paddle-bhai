import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let PDFParser;
    try {
      PDFParser = (await import('pdf2json')).default;
    } catch (e) {
      console.error('Failed to import pdf2json:', e);
      return NextResponse.json({ error: 'System error: PDF parser missing. Try pasting notes manually.' }, { status: 500 });
    }

    const textPayload = await new Promise((resolve, reject) => {
      const pdfParser = new PDFParser(null, 1);
      
      pdfParser.on("pdfParser_dataError", errData => reject(errData.parserError));
      pdfParser.on("pdfParser_dataReady", pdfData => {
        const text = pdfParser.getRawTextContent();
        resolve(text);
      });

      pdfParser.parseBuffer(buffer);
    });

    return NextResponse.json({
      text: textPayload,
      numPages: 0,
      info: 'Parsed via pdf2json'
    });

  } catch (error) {
    console.error('PDF parse error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to parse PDF' },
      { status: 500 }
    );
  }
}

export const maxDuration = 30;
