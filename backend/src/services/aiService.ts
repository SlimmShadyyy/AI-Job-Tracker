import { GoogleGenerativeAI } from "@google/generative-ai";

export const parseJobDescription = async (jdText: string) => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
  
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
    "resumeSuggestions": ["string"]
  }

  Job Description: ${jdText}
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const cleanJson = jsonMatch ? jsonMatch[0] : text;
    
    return JSON.parse(cleanJson);
  } catch (error: any) {
    console.error("Gemini 2.5 Flash Error:", error.message);
    throw new Error("AI Parsing failed. Please try again in a few seconds.");
  }
};