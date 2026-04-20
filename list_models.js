require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function main() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    // List models is available in the older googleapis but via @google/generative-ai there isn't a direct listModels method on the client instance typically?
    // Wait, let me check the SDK for a way to list models, or just use a direct HTTP request.
  } catch (e) {
    console.error(e);
  }
}
main();
