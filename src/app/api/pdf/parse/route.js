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

    // Read file buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Use pdf-parse to extract text
    let pdfParse;
    try {
      pdfParse = (await import('pdf-parse')).default;
    } catch (e) {
      console.error('Failed to import pdf-parse:', e);
      return NextResponse.json({ error: 'System error: PDF parser missing. Try pasting notes manually.' }, { status: 500 });
    }
    
    let data;
    try {
      data = await pdfParse(buffer);
    } catch (e) {
      console.error('Failed to parse buffer:', e);
      return NextResponse.json({ error: 'Failed to read this PDF. It might be corrupted or protected.' }, { status: 500 });
    }

    return NextResponse.json({
      text: data.text,
      numPages: data.numpages,
      info: data.info,
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
