
import { GoogleGenAI, Type, Modality } from "@google/genai";

// Initialize the API client
// Note: Ensure process.env.API_KEY is available in your environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_TEXT = 'gemini-2.5-flash';
const MODEL_REASONING = 'gemini-2.5-flash'; 
const MODEL_IMAGE = 'gemini-2.5-flash-image';
const MODEL_TTS = 'gemini-2.5-flash-preview-tts';
const MODEL_VIDEO = 'veo-3.1-fast-generate-preview';

/**
 * Analyzes a JD and extracts structured key ranking criteria.
 */
export const analyzeJD = async (jdText: string, lang: 'vi' | 'en') => {
  const prompt = `
    You are an expert HR Specialist. Analyze the following Job Description (JD).
    Output language: ${lang === 'vi' ? 'Vietnamese' : 'English'}.
    
    JD Content:
    ${jdText}
    
    Task: Extract the Top 5 most critical technical skills, a brief 1-sentence summary, the required experience level, and suggest a salary range if not mentioned.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            skills: { type: Type.ARRAY, items: { type: Type.STRING } },
            experience: { type: Type.STRING },
            salary: { type: Type.STRING }
          }
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Error:", error);
    // Fallback for error handling
    return {
      summary: lang === 'vi' ? "Không thể phân tích JD. Vui lòng thử lại." : "Could not analyze JD.",
      skills: [],
      experience: lang === 'vi' ? "Không xác định" : "Unknown",
      salary: lang === 'vi' ? "Thỏa thuận" : "Negotiable"
    };
  }
};

/**
 * Generates a social media job post based on a JD.
 */
export const generateJobPost = async (jdText: string, platform: string, tone: string, lang: 'vi' | 'en') => {
  const prompt = `
    Role: Professional Copywriter for HR.
    Task: Write a job post for ${platform}.
    Tone: ${tone}.
    Language: ${lang === 'vi' ? 'Vietnamese (Natural, engaging, professional)' : 'English'}.
    
    Job Description:
    ${jdText}
    
    Requirements:
    - Catchy headline (emoji allowed).
    - Clear Call to Action (CTA).
    - Format properly for ${platform} (use relevant hashtags).
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return lang === 'vi' ? "Lỗi khi tạo nội dung." : "Error generating post.";
  }
};

/**
 * Generates an image for the job post.
 */
export const generateJobImage = async (jobTitle: string) => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_IMAGE,
      contents: {
        parts: [{ text: `Generate a modern, professional, minimal, high-quality photograph suitable for a job posting background for the role of: ${jobTitle}. Office environment, bright, tech-savvy, no text overlays.` }],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Gemini Image Error:", error);
    return null;
  }
};

/**
 * NEW FEATURE: Generates a Recruitment Video using Veo.
 */
export const generateRecruitmentVideo = async (jobTitle: string, lang: 'vi' | 'en') => {
  try {
    const prompt = `Cinematic, high-quality video for a recruitment ad. A modern, bright office environment. Professionals collaborating on a project related to ${jobTitle}. Professional lighting, 4k, smooth motion. No text.`;

    let operation = await ai.models.generateVideos({
      model: MODEL_VIDEO,
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });

    // Polling for video completion
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5s
      operation = await ai.operations.getVideosOperation({operation: operation});
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (downloadLink) {
        // Fetch the actual video bytes using the API key
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const blob = await response.blob();
        return URL.createObjectURL(blob);
    }
    return null;
  } catch (error) {
    console.error("Veo Video Error:", error);
    return null;
  }
};

/**
 * Scores a CV against a JD.
 */
export const scoreCV = async (jdText: string, cvText: string) => {
  const prompt = `
    Role: AI Recruitment Officer.
    Task: Compare the Candidate CV against the Job Description.
    
    Job Description:
    ${jdText}
    
    Candidate CV:
    ${cvText}
    
    Output JSON format only:
    {
      "score": number (0-100),
      "analysis": "Short summary of strengths and weaknesses (max 50 words)",
      "status": "pass" | "fail" | "review" (pass if score > 75, fail if < 50),
      "skillsMatch": ["skill 1", "skill 2"] (List of matched skills found in both)
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            analysis: { type: Type.STRING },
            status: { type: Type.STRING, enum: ["pass", "fail", "review"] },
            skillsMatch: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Error:", error);
    return { score: 0, analysis: "Error processing CV", status: "review", skillsMatch: [] };
  }
};

/**
 * Generates an Onboarding Checklist.
 */
export const generateOnboardingPlan = async (role: string, name: string, lang: 'vi' | 'en') => {
  const prompt = `
    Create a personalized 1-week onboarding checklist for a new employee.
    Name: ${name}
    Role: ${role}
    Language: ${lang === 'vi' ? 'Vietnamese' : 'English'}
    
    Return ONLY a JSON array of objects.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    task: { type: Type.STRING },
                    dueDate: { type: Type.STRING },
                    status: { type: Type.STRING },
                    assignee: { type: Type.STRING }
                }
            }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Gemini Error:", error);
    return [];
  }
};

/**
 * Generates a Welcome Email.
 */
export const generateWelcomeEmail = async (role: string, name: string, lang: 'vi' | 'en') => {
  const prompt = `
    Write a warm, professional welcome email for a new employee.
    Name: ${name}
    Role: ${role}
    Language: ${lang === 'vi' ? 'Vietnamese' : 'English'}
    Context: It is their first day. Include instructions to check their onboarding dashboard.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "";
  }
};

/**
 * Chatbot Interaction with Thinking Config.
 */
export const chatWithHRBot = async (
    history: {role: string, parts: {text: string}[]}[], 
    message: string, 
    lang: 'vi' | 'en',
    persona: string,
    useThinking: boolean = false
) => {
  let systemInstruction = `You are a helpful HR Assistant. Language: ${lang}.`;
  
  if (persona === 'recruiter') {
    systemInstruction = `You are a Senior Recruiter. Expert in sourcing, interviewing, and negotiation. Language: ${lang}.`;
  } else if (persona === 'policy') {
    systemInstruction = `You are an HR Policy Expert. Strict, compliant, and knowledgeable about labor laws and company handbook. Language: ${lang}.`;
  } else if (persona === 'culture') {
    systemInstruction = `You are a Culture & Engagement Specialist. Cheerful, focus on employee well-being and events. Language: ${lang}.`;
  }

  try {
    // Reasoning Config
    const thinkingConfig = useThinking ? { thinkingConfig: { thinkingBudget: 1024 } } : {};

    const chat = ai.chats.create({
      model: MODEL_REASONING,
      history: history,
      config: {
        systemInstruction,
        ...thinkingConfig
      }
    });
    
    const result = await chat.sendMessage({ message });
    return result.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return lang === 'vi' 
      ? "Hệ thống đang quá tải. Vui lòng thử lại sau." 
      : "I am currently experiencing high traffic. Please try again.";
  }
};

/**
 * FEATURE: Salary Market Scout (Google Search Grounding)
 */
export const getSalaryBenchmark = async (role: string, location: string, lang: 'vi' | 'en') => {
    const prompt = `
      Find current salary ranges for a "${role}" in "${location}" for 2024/2025.
      Summarize the salary range and the general market trend (rising/stable/falling).
      Language: ${lang === 'vi' ? 'Vietnamese' : 'English'}.
    `;
    
    try {
      const response = await ai.models.generateContent({
        model: MODEL_TEXT,
        contents: prompt,
        config: {
          tools: [{googleSearch: {}}],
        },
      });
  
      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.map((chunk: any) => chunk.web ? { title: chunk.web.title, uri: chunk.web.uri } : null)
        .filter((s: any) => s !== null) || [];
  
      return {
        text: response.text,
        sources: sources
      };
    } catch (error) {
      console.error("Gemini Search Error:", error);
      return { 
        text: lang === 'vi' ? "Không thể lấy dữ liệu thực tế lúc này." : "Could not fetch real-time data.", 
        sources: [] 
      };
    }
  };
  
  /**
   * FEATURE: Employee Flight Risk Detector (Sentiment Analysis)
   */
  export const analyzeSentiment = async (feedbackText: string, lang: 'vi' | 'en') => {
    const prompt = `
      Analyze this employee feedback/email for sentiment and retention risk.
      Text: "${feedbackText}"
      Language: ${lang === 'vi' ? 'Vietnamese' : 'English'}
      
      Determine:
      1. Risk Level (Low/Medium/High/Critical)
      2. Retention Score (0-100, where 100 is high retention/happy, 0 is leaving)
      3. Summary of issues
      4. Actionable items for HR
    `;
  
    try {
      const response = await ai.models.generateContent({
        model: MODEL_TEXT,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              riskLevel: { type: Type.STRING, enum: ['Low', 'Medium', 'High', 'Critical'] },
              score: { type: Type.NUMBER },
              summary: { type: Type.STRING },
              actionItems: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          }
        }
      });
      return JSON.parse(response.text || '{}');
    } catch (error) {
      console.error("Gemini Sentiment Error:", error);
      return null;
    }
  };
  
  /**
   * FEATURE: Audio Interview Coach (TTS)
   */
  export const speakInterviewQuestion = async (role: string, lang: 'vi' | 'en') => {
    const prompt = `
      Act as a stern but professional hiring manager. 
      Ask ONE challenging behavioral interview question for a ${role}. 
      Language: ${lang === 'vi' ? 'Vietnamese' : 'English'}.
      Keep it under 30 words.
    `;
  
    try {
      const response = await ai.models.generateContent({
        model: MODEL_TTS,
        contents: prompt,
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Fenrir' }, // Deep, professional voice
            },
          },
        },
      });
  
      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      return base64Audio;
    } catch (error) {
      console.error("Gemini TTS Error:", error);
      return null;
    }
  };
