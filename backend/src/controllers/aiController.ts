import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const streamCoverLetter = async (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Transfer-Encoding', 'chunked');

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error("API KEY IS MISSING! Check your backend/.env file.");
      return res.status(500).end("Server Configuration Error: API Key missing.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    const { company, role } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `Write a short, punchy, 3-paragraph cover letter for a ${role} position at ${company}. Make it sound professional but enthusiastic. Do not include placeholders like [Your Name].`;

    const result = await model.generateContentStream(prompt);

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      res.write(chunkText); 
    }
    
    res.end();

  } catch (error) {
    console.error("Streaming error:", error);
    res.status(500).end("Error generating cover letter.");
  }
};