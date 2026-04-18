import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    const { prompt, type } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Try to parse as JSON if expected
    if (type === 'json') {
      try {
        // Find the first { or [ and the last } or ] to extract JSON robustly
        const jsonMatch = text.match(/(\{|\[)[\s\S]*(\}|\])/);
        const jsonStr = jsonMatch ? jsonMatch[0] : text;
        const parsed = JSON.parse(jsonStr);
        return NextResponse.json({ data: parsed, raw: text });
      } catch {
        return NextResponse.json({ data: null, raw: text, parseError: true });
      }
    }

    return NextResponse.json({ data: text, raw: text });
  } catch (error) {
    console.error('Gemini API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate content' },
      { status: 500 }
    );
  }
}
