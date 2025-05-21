import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY || "AIzaSyCWqESnXoAoAgMGLeQwsTntDEzS5hmdIyc";
const genAI = new GoogleGenerativeAI(API_KEY);

const geminiService = {
  generateFinancialAdvice: async (context: any, userInput: string) => {
    try {
      // Khởi tạo model với cấu hình cụ thể
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      });

      // Chuẩn bị prompt với ngữ cảnh
      const prompt = `
        Bạn là trợ lý tài chính cá nhân của FinanceFlow, một trang web giúp người dùng quản lý tài chính. 
        Bạn hỗ trợ người dùng bằng tiếng Việt, trả lời các câu hỏi về quản lý tài chính, tiết kiệm, đầu tư, ngân sách, thu chi, báo cáo tài chính, và các tính năng của FinanceFlow.
        Hãy trả lời một cách tự nhiên, dễ hiểu, và chuyên nghiệp.

        Thông tin tài chính của người dùng:
        - Giao dịch: ${JSON.stringify(context.transactions, null, 2)}
        - Tiết kiệm: ${JSON.stringify(context.savings, null, 2)}
        - Đầu tư: ${JSON.stringify(context.investments, null, 2)}
        - Ngân sách: ${JSON.stringify(context.budget, null, 2)}

        Câu hỏi của người dùng: ${userInput}

        Hãy phân tích thông tin và đưa ra lời khuyên chi tiết bằng tiếng Việt. Tập trung vào:
        1. Phân tích tình hình tài chính hiện tại
        2. Đề xuất cải thiện cụ thể
        3. Các bước hành động tiếp theo
      `;

      // Gọi API để sinh nội dung
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      throw new Error('Không thể kết nối với AI Assistant. Vui lòng thử lại sau.');
    }
  }
};

export default geminiService; 