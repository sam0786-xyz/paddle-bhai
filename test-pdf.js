// using .mjs or running with --experimental-modules
import fs from 'fs';
async function run() {
  try {
    const pdfParse = (await import('pdf-parse')).default;
    console.log("Success");
  } catch(e) {
    console.log("Failed:", e);
  }
}
run();
