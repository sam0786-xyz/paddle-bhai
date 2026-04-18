import { NextResponse } from 'next/server';

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
    const pdfParse = (await import('pdf-parse')).default;
    const data = await pdfParse(buffer);

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
