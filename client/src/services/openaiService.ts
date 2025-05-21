import axios from 'axios';

// Types
interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

const OPENAI_API_KEY = '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';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Rate limiting configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second between requests

const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

const waitForRateLimit = async (): Promise<void> => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await sleep(MIN_REQUEST_INTERVAL - timeSinceLastRequest);
  }
  lastRequestTime = Date.now();
};

const openaiService = {
  generateResponse: async (messages: Message[], retryCount = 0): Promise<string> => {
    try {
      await waitForRateLimit();

      const response = await axios.post<OpenAIResponse>(
        OPENAI_API_URL,
        {
          model: 'gpt-3.5-turbo',
          messages: messages,
          temperature: 0.7,
          max_tokens: 1000,
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.choices[0].message.content;
    } catch (error: any) {
      console.error('OpenAI API Error:', error.response?.data || error.message);

      // Handle rate limiting
      if (error.response?.status === 429 && retryCount < MAX_RETRIES) {
        const retryAfter = error.response.headers['retry-after'] || RETRY_DELAY;
        console.log(`Rate limited. Retrying after ${retryAfter}ms...`);
        await sleep(retryAfter);
        return openaiService.generateResponse(messages, retryCount + 1);
      }

      // Handle other errors
      if (error.response?.status === 401) {
        throw new Error('API key không hợp lệ. Vui lòng kiểm tra lại.');
      } else if (error.response?.status === 429) {
        throw new Error('Hệ thống đang quá tải. Vui lòng thử lại sau ít phút.');
      } else if (error.response?.status === 500) {
        throw new Error('Lỗi server. Vui lòng thử lại sau.');
      }

      throw new Error('Không thể kết nối với AI Assistant. Vui lòng thử lại sau.');
    }
  },

  generateFinancialAdvice: async (
    context: {
      transactions?: any[];
      savings?: any[];
      investments?: any[];
      budget?: any;
    },
    query: string
  ): Promise<string> => {
    try {
      const systemMessage: Message = {
        role: 'system',
        content: `Bạn là một trợ lý tài chính thông minh. Nhiệm vụ của bạn là:
        1. Phân tích dữ liệu tài chính của người dùng
        2. Đưa ra lời khuyên và gợi ý cụ thể
        3. Giúp người dùng đạt được mục tiêu tài chính
        4. Sử dụng ngôn ngữ thân thiện và dễ hiểu
        5. Tập trung vào các giải pháp thực tế
        
        Hãy trả lời bằng tiếng Việt và đảm bảo câu trả lời ngắn gọn, dễ hiểu.
        Nếu không có đủ dữ liệu, hãy yêu cầu thêm thông tin cần thiết.`
      };

      const contextMessage: Message = {
        role: 'system',
        content: `Dữ liệu tài chính của người dùng:
        - Giao dịch: ${JSON.stringify(context.transactions || [])}
        - Tiết kiệm: ${JSON.stringify(context.savings || [])}
        - Đầu tư: ${JSON.stringify(context.investments || [])}
        - Ngân sách: ${JSON.stringify(context.budget || {})}`
      };

      const userMessage: Message = {
        role: 'user',
        content: query
      };

      const messages = [systemMessage, contextMessage, userMessage];
      return await openaiService.generateResponse(messages);
    } catch (error) {
      console.error('Financial Advice Error:', error);
      throw error;
    }
  },

  generateSpendingAnalysis: async (transactions: any[]): Promise<string> => {
    try {
      const messages: Message[] = [
        {
          role: 'system',
          content: `Bạn là một chuyên gia phân tích tài chính. Nhiệm vụ của bạn là:
          1. Phân tích chi tiết các khoản chi tiêu
          2. Xác định các mẫu chi tiêu và xu hướng
          3. Đề xuất cách tối ưu hóa chi tiêu
          4. Đưa ra các gợi ý tiết kiệm cụ thể
          5. Cảnh báo về các khoản chi tiêu bất thường
          
          Hãy trả lời bằng tiếng Việt và đảm bảo phân tích ngắn gọn, dễ hiểu.
          Nếu không có đủ dữ liệu, hãy yêu cầu thêm thông tin cần thiết.`
        },
        {
          role: 'user',
          content: `Phân tích các giao dịch sau: ${JSON.stringify(transactions)}`
        }
      ];

      return await openaiService.generateResponse(messages);
    } catch (error) {
      console.error('Spending Analysis Error:', error);
      throw error;
    }
  },

  generateSavingsSuggestions: async (
    income: number,
    expenses: number,
    savings: any[],
    goals: any[]
  ): Promise<string> => {
    try {
      const messages: Message[] = [
        {
          role: 'system',
          content: `Bạn là một chuyên gia tư vấn tiết kiệm. Hãy phân tích tình hình tài chính và đưa ra các gợi ý tiết kiệm phù hợp với mục tiêu của người dùng.`
        },
        {
          role: 'user',
          content: `
            Thu nhập hàng tháng: ${income}
            Chi tiêu hàng tháng: ${expenses}
            Tiết kiệm hiện tại: ${JSON.stringify(savings)}
            Mục tiêu: ${JSON.stringify(goals)}
            Hãy đề xuất kế hoạch tiết kiệm phù hợp.
          `
        }
      ];

      return await openaiService.generateResponse(messages);
    } catch (error) {
      console.error('Savings Suggestions Error:', error);
      throw error;
    }
  },

  generateInvestmentAdvice: async (
    profile: any,
    currentInvestments: any[],
    riskTolerance: string
  ): Promise<string> => {
    try {
      const messages: Message[] = [
        {
          role: 'system',
          content: `Bạn là một chuyên gia tư vấn đầu tư. Hãy phân tích hồ sơ của người dùng và đưa ra các đề xuất đầu tư phù hợp với mức độ chấp nhận rủi ro của họ.`
        },
        {
          role: 'user',
          content: `
            Hồ sơ người dùng: ${JSON.stringify(profile)}
            Danh mục đầu tư hiện tại: ${JSON.stringify(currentInvestments)}
            Mức độ chấp nhận rủi ro: ${riskTolerance}
            Hãy đề xuất chiến lược đầu tư phù hợp.
          `
        }
      ];

      return await openaiService.generateResponse(messages);
    } catch (error) {
      console.error('Investment Advice Error:', error);
      throw error;
    }
  },

  generateFinancialForecast: async (
    transactions: any[],
    income: number,
    expenses: number,
    savings: any[],
    investments: any[]
  ): Promise<string> => {
    try {
      const messages: Message[] = [
        {
          role: 'system',
          content: `Bạn là một chuyên gia dự báo tài chính. Hãy phân tích dữ liệu lịch sử và dự báo xu hướng tài chính trong tương lai.`
        },
        {
          role: 'user',
          content: `
            Giao dịch: ${JSON.stringify(transactions)}
            Thu nhập: ${income}
            Chi tiêu: ${expenses}
            Tiết kiệm: ${JSON.stringify(savings)}
            Đầu tư: ${JSON.stringify(investments)}
            Hãy dự báo xu hướng tài chính và đưa ra các khuyến nghị.
          `
        }
      ];

      return await openaiService.generateResponse(messages);
    } catch (error) {
      console.error('Financial Forecast Error:', error);
      throw error;
    }
  }
};

export default openaiService; 