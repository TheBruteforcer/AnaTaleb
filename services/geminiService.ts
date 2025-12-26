
import { GoogleGenAI, Type } from "@google/genai";
import { STRINGS } from "../strings";
import { Grade } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateQuiz = async (grade: Grade, description: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `قم بإنشاء كويز تعليمي مكون من 7 أسئلة للمنهج المصري للمرحلة: ${grade}. \nالمحتوى المطلوب: ${description}.`,
      config: {
        systemInstruction: `أنت معلم مصري خبير تضع امتحانات للطلاب. 
        يجب أن تكون الأسئلة احترافية وتناسب المرحلة العمرية.
        استخدم LaTeX لكتابة أي معادلات رياضية أو رموز كيميائية (مثال: $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$ أو $H_2O$).
        يجب أن يكون الرد بصيغة JSON حصراً.`,
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
                  text: { type: Type.STRING, description: "نص السؤال مع LaTeX إذا لزم" },
                  options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "4 اختيارات" },
                  correctAnswerIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING, description: "تفسير بسيط للإجابة بالعامية المصرية" }
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
    console.error("Gemini Quiz Error:", error);
    throw error;
  }
};

export const generateQuizFromContent = async (title: string, content: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `حول هذا الملخص الدراسي إلى كويز اختباري سريع مكون من 5 أسئلة.\nالعنوان: ${title}\nالمحتوى: ${content}`,
      config: {
        systemInstruction: `أنت مساعد تعليمي ذكي. هدفك هو اختبار فهم الطالب للمحتوى المقدم له. 
        تأكد أن الأسئلة مستوحاة مباشرة من المعلومات الموجودة في الملخص.
        يجب أن يكون الرد بصيغة JSON.`,
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
    console.error("Gemini Error:", error);
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
