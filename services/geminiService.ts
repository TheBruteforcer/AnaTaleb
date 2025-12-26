
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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

    let text = response.text || "مش عارف أقولك إيه والله يا صاحبي..";
    
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks && chunks.length > 0) {
      text += "\n\n🔗 المصادر اللي لقيتها:";
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
    return "معلش يا صاحبي، النت عندي مهنج شوية.. جرب تاني!";
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
    return response.text || "مقدرتش أشرح الملخص ده للأسف.";
  } catch (error) {
    return "حصل مشكلة في الشرح، حاول كمان شوية.";
  }
};
