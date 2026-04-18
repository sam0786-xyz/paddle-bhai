import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Model fallback chain: try each in order
const MODEL_CHAIN = [
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
];

export async function POST(request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured. Add GEMINI_API_KEY to your .env file.' },
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
    
    let text = null;
    let lastError = null;

    // Try each model in the fallback chain
    for (const modelName of MODEL_CHAIN) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        text = response.text();
        break; // Success — stop trying
      } catch (err) {
        lastError = err;
        // If it's a rate limit error, try the next model
        if (err.message?.includes('429') || err.message?.includes('quota') || err.message?.includes('Too Many Requests')) {
          console.warn(`Model ${modelName} rate limited, trying next...`);
          continue;
        }
        // For other errors, throw immediately
        throw err;
      }
    }

    // All models failed
    if (text === null) {
      return NextResponse.json(
        { error: 'API quota exceeded on all models. Please wait a few minutes and try again, or update your API key at https://aistudio.google.com/apikey' },
        { status: 429 }
      );
    }

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
    
    const isQuota = error.message?.includes('429') || error.message?.includes('quota');
    return NextResponse.json(
      { error: isQuota 
          ? 'API quota exceeded. Please wait a few minutes or get a new API key at https://aistudio.google.com/apikey' 
          : (error.message || 'Failed to generate content') 
      },
      { status: isQuota ? 429 : 500 }
    );
  }
}
