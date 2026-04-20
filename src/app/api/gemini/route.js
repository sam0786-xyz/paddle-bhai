import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

// Model fallback chain: try each in order
const MODEL_CHAIN = [
  'gemini-3.1-pro-preview',
  'gemini-3-flash-preview',
  'gemini-2.5-pro',
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite'
];

export async function POST(request) {
  try {
    const { prompt, type, customApiKey } = await request.json();
    const activeKey = customApiKey || process.env.GEMINI_API_KEY;

    if (!activeKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured. Please provide a custom API key or add GEMINI_API_KEY to your .env file.' },
        { status: 500 }
      );
    }

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(activeKey);

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
        // Robust pattern to extract JSON even if wrapped in markdown ```json ... ```
        const jsonMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
        const jsonStr = jsonMatch ? jsonMatch[0] : text;
        const parsed = JSON.parse(jsonStr.replace(/```json|```/g, '').trim());
        return NextResponse.json({ data: parsed, raw: text });
      } catch (err) {
        console.error('JSON Parse Error. Raw text:', text);
        return NextResponse.json({
          data: null,
          raw: text,
          parseError: true,
          error: 'AI response was not in a valid JSON format. Raw output saved for review.'
        });
      }
    }

    return NextResponse.json({ data: text, raw: text });
  } catch (error) {
    console.error('Gemini API error:', error);

    const isQuota = error.message?.includes('429') || error.message?.includes('quota');
    return NextResponse.json(
      {
        error: isQuota
          ? 'API quota exceeded. Please wait a few minutes or get a new API key at https://aistudio.google.com/apikey'
          : (error.message || 'Failed to generate content')
      },
      { status: isQuota ? 429 : 500 }
    );
  }
}
