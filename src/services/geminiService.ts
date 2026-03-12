import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const screenResume = async (jobDescription: string, resumeText: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: `
      As an expert HR Recruiter, analyze this resume against the job description.
      
      Job Description: ${jobDescription}
      Resume: ${resumeText}
      
      Provide a score from 0-100 and brief feedback on why this candidate is or isn't a good fit.
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.INTEGER },
          feedback: { type: Type.STRING }
        },
        required: ["score", "feedback"]
      }
    }
  });
  
  return JSON.parse(response.text);
};

export const generateInterviewQuestions = async (role: string, seniority: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: `Generate 5 technical and 3 behavioral interview questions for a ${seniority} ${role} position.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          technical: { type: Type.ARRAY, items: { type: Type.STRING } },
          behavioral: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["technical", "behavioral"]
      }
    }
  });
  
  return JSON.parse(response.text);
};

export const hrAssistantChat = async (history: { role: string, parts: { text: string }[] }[], message: string) => {
  const chat = ai.chats.create({
    model: "gemini-2.0-flash",
    config: {
      systemInstruction: "You are Nexus HR Assistant. You help employees with policy questions, leave requests, and general HR inquiries. Be professional, helpful, and concise."
    }
  });
  
  const response = await chat.sendMessage({ message });
  return response.text;
};
