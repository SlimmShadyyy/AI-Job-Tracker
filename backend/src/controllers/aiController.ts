import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';


export const parseJobDescription = async (req: Request, res: Response) => {
  try {
    const { jdText } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ message: "Server Configuration Error: API Key missing." });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      Extract details from this job description and return strictly as JSON.
      
      IMPORTANT: You MUST include the "resumeSuggestions" field with 3 bullet points.
      
      JSON Structure:
      {
        "company": "string",
        "role": "string",
        "location": "string",
        "requiredSkills": ["string"],
        "niceToHaveSkills": ["string"],
        "seniority": "string",
        "resumeSuggestions": ["string"]
      }

      Job Description: ${jdText}
    `;

    const result = await model.generateContent(prompt);
    let text = result.response.text();
    
    // Clean up the markdown formatting Gemini sometimes adds
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const parsedData = JSON.parse(text);
    res.json(parsedData);

  } catch (error) {
    console.error("Parsing error:", error);
    res.status(500).json({ message: "Error parsing job description with AI." });
  }
};

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