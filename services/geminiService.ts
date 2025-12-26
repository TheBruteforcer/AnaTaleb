
import { GoogleGenAI, Type } from "@google/genai";
import { STRINGS } from "../strings";
import { Grade } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateQuiz = async (grade: Grade, description: string, questionCount: number = 7, language: 'ar' | 'en' = 'ar') => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `قم بإنشاء كويز تعليمي مكون من ${questionCount} أسئلة للمنهج المصري للمرحلة: ${grade}. 
      المحتوى المطلوب: ${description}.
      اللغة: ${language === 'ar' ? 'العربية' : 'الإنجليزية'}.`,
      config: {
        systemInstruction: `أنت معلم خبير. 
        قواعد هامة جداً:
        1. يجب أن يكون correctAnswerIndex مطابقاً تماماً للاختيار الصحيح.
        2. التفسير (explanation) يجب أن يشرح الإجابة الصحيحة المحددة فقط.
        3. استخدم LaTeX دائماً للمعادلات الكيميائية والرياضية بين علامات $ (مثال: $H_2O$).
        4. لا تكرر الأسئلة.
        5. الرد يجب أن يكون JSON فقط.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "4 options" },
                  correctAnswerIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING }
                },
                required: ["text", "options", "correctAnswerIndex", "explanation"]
              }
            }
          },
          required: ["title", "questions"]
        }
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    throw error;
  }
};

export const generateQuizFromContent = async (title: string, content: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `حول هذا الملخص إلى كويز 5 أسئلة:\nالعنوان: ${title}\nالمحتوى: ${content}`,
      config: {
        systemInstruction: "أنت مساعد تعليمي. حول النص لكويز JSON مع استخدام LaTeX للمعادلات. تأكد من دقة correctAnswerIndex.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctAnswerIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING }
                },
                required: ["text", "options", "correctAnswerIndex", "explanation"]
              }
            }
          },
          required: ["title", "questions"]
        }
      },
    });
    return JSON.parse(response.text);
  } catch (error) {
    throw error;
  }
};

export const getStudyBuddyAdvice = async (userMessage: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userMessage,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: "أنت مساعد ذكي لطلاب المدارس والجامعات في مصر. اسمك 'زميلك الدحيح'. تحدث باللهجة المصرية العامية بطريقة تشجع الطالب. استخدم البحث في جوجل لو سألك عن مواعيد امتحانات أو أخبار تعليمية. لو سألك عن معلومة علمية، اشرحها ببساطة وأمثلة من حياتنا في مصر. قدم المصادر (Links) في آخر ردك.",
      },
    });

    let text = response.text || STRINGS.gemini.defaultResponse;
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks && chunks.length > 0) {
      text += `\n\n${STRINGS.gemini.sourcesLabel}`;
      const seenUrls = new Set();
      chunks.forEach((chunk: any) => {
        if (chunk.web?.uri && !seenUrls.has(chunk.web.uri)) {
          text += `\n- ${chunk.web.title}: ${chunk.web.uri}`;
          seenUrls.add(chunk.web.uri);
        }
      });
    }
    return text;
  } catch (error) {
    return STRINGS.gemini.error;
  }
};

export const explainPostContent = async (title: string, content: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `اشرح لي بأسلوب مبسط ومختصر جداً محتوى هذا الملخص الدراسي: \nالعنوان: ${title}\nالمحتوى: ${content}`,
      config: {
        systemInstruction: "أنت معلم مصري عبقري يبسط المعلومة للطلاب في جملتين فقط باللهجة العامية المصرية. ابدأ بكلمة 'بص يا بطل...' وانهِ بكلمة 'بالتوفيق يا دحيح!'",
      },
    });
    return response.text || STRINGS.gemini.defaultResponse;
  } catch (error) {
    return STRINGS.gemini.aiExplainError;
  }
};
