
import { GoogleGenAI, Chat } from "@google/genai";

const API_KEY = process.env.API_KEY || process.env.GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

export const getMajorRecommendation = async (interests: string): Promise<string> => {
  if (!ai) {
    return "API 키가 설정되지 않았습니다. 환경 변수에 GEMINI_API_KEY를 설정해주세요.";
  }
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        You are a university career counselor. Based on the following student interests, recommend 3 to 5 suitable majors. 
        For each major, provide a brief, one-paragraph explanation of why it's a good fit.
        Please provide the answer in Korean.
        
        Student's interests: "${interests}"
      `,
    });
    return response.text || "";
  } catch (error) {
    console.error("Error getting major recommendation:", error);
    return "죄송합니다. 전공 추천을 생성하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
  }
};

export const getCourseRoadmap = async (major: string, grade: string, careerGoal: string): Promise<string> => {
  if (!ai) {
    return "API 키가 설정되지 않았습니다. 환경 변수에 GEMINI_API_KEY를 설정해주세요.";
  }
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        당신은 대학교 학업 컨설턴트입니다.
        학생 정보:
        - 전공: ${major}
        - 현재 학년: ${grade}
        - 희망 진로: ${careerGoal}

        이 학생을 위해 학년별 전공 과목 추천 로드맵을 작성해주세요. 
        다음과 같은 구조로 마크다운 형식의 답변을 제공해주세요:

        1. **학년별 권장 교과목 안내**: 
           - 1학년부터 4학년까지 각 학년에 수강해야 할 주요 전공 과목을 표(Markdown Table) 형태로 정리해주세요.
           - 표의 컬럼은 [학년, 권장 과목] 으로 구성해주세요.
        
        2. **선·후수 과목 안내 (Prerequisites)**: 
           - 주요 과목 간의 이수 순서를 화살표(→)를 사용하여 보여주세요. (예: 프로그래밍기초 → 자료구조 → 알고리즘)

        3. **진로 맞춤 조언**: 
           - ${careerGoal} 진로를 갖기 위해 학년별로 집중해야 할 활동이나 추가 학습 내용을 짧게 조언해주세요.

        반드시 한국어로 답변해주세요.
      `,
    });
    return response.text || "분석 결과를 생성하지 못했습니다.";
  } catch (error) {
    console.error("Error getting course roadmap:", error);
    return "죄송합니다. 로드맵을 생성하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
  }
};

export const getLiberalArtsRecommendation = async (keywords: string, purpose: string, style: string): Promise<string> => {
  if (!ai) {
    return "API 키가 설정되지 않았습니다. 환경 변수에 GEMINI_API_KEY를 설정해주세요.";
  }
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        당신은 대학교 학업 상담사입니다. 학생의 관심사와 성향에 맞춰 교양 과목을 추천해주세요.

        학생 정보:
        - 관심 키워드: ${keywords}
        - 수강 목적: ${purpose}
        - 선호 수업 스타일: ${style}

        위 정보를 바탕으로 3가지 정도의 교양 과목 주제나 실제 개설될 법한 과목명을 추천하고, 
        각 과목이 왜 이 학생에게 적합한지 간단히 설명해주세요.
        답변은 한국어로 작성해주세요.
      `,
    });
    return response.text || "추천 결과를 생성하지 못했습니다.";
  } catch (error) {
    console.error("Error getting liberal arts recommendation:", error);
    return "죄송합니다. 추천을 생성하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
  }
};

export const createCourseChat = (): Chat => {
    if (!ai) {
      throw new Error("API 키가 설정되지 않았습니다. 환경 변수에 GEMINI_API_KEY를 설정해주세요.");
    }
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: 'You are a friendly and knowledgeable university advisor. Your goal is to help students find interesting liberal arts or elective courses. Provide recommendations based on their interests. Keep your answers concise and helpful. Please provide answers in Korean.',
        },
    });
};

export const continueCourseChatStream = async (chat: Chat, message: string) => {
    try {
        const result = await chat.sendMessageStream({ message });
        return result;
    } catch (error) {
        console.error("Error continuing course chat:", error);
        throw new Error("AI와 대화하는 중 오류가 발생했습니다.");
    }
};
