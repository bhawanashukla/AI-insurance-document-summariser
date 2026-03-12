import pdf from 'pdf-parse';
import Tesseract from 'tesseract.js';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

function getOpenAI() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error('OPENAI_API_KEY is not set. Set the OPENAI_API_KEY environment variable or provide an apiKey when creating the client.');
  }
  return new OpenAI({ apiKey: key });
}

export async function extractTextFromBuffer(buffer, filename, mimetype) {
  const name = (filename || '').toLowerCase();
  if (mimetype === 'application/pdf' || name.endsWith('.pdf')) {
    const data = await pdf(buffer);
    return data.text || '';
  }

  if ((mimetype && mimetype.startsWith('image/')) || /\.(jpg|jpeg|png)$/i.test(name)) {
    const { data: { text } } = await Tesseract.recognize(buffer, 'eng', { logger: m => {} });
    return text || '';
  }

  return buffer.toString('utf8');
}

function buildPrompt(extractedText) {
  return `You are an assistant that extracts and summarizes insurance policy documents.\nGiven the document text below, extract the following fields when present: Policy Number, Insurer, Policyholder Name, Coverage Types, Effective Date, Expiry/End Date, Claim Contact (name/email/phone), Premium Amount, Vehicle Details (if any), and a short plain-language summary (3-5 sentences). Output JSON with keys: policyNumber, insurer, policyholder, coverages (array), effectiveDate, endDate, claimContact, premium, vehicle, summary.\n\nDocument Text:\n"""\n${extractedText}\n"""\n\nReturn only valid JSON without extra commentary.`;
}

export async function callOpenAIForExtraction(extractedText) {
  const prompt = buildPrompt(extractedText);
  const openai = getOpenAI();

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: 'You are a helpful assistant that extracts insurance policy information and outputs JSON.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 800
  });

  const output = completion.choices?.[0]?.message?.content || '';
  try {
    return { parsed: JSON.parse(output), raw: output };
  } catch (e) {
    return { parsed: null, raw: output };
  }
}
