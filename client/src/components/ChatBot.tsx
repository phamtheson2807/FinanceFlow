import { Chat, Close, Send } from '@mui/icons-material';
import { Box, CircularProgress, Fab, IconButton, Paper, TextField, Typography } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Xin chào! Tôi là trợ lý tài chính của FinanceFlow. Tôi có thể giúp gì cho bạn hôm nay?", isBot: true },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { text: input, isBot: false }]);
    setIsLoading(true);

    try {
      const response = await generateResponse(input.toLowerCase());
      setMessages((prev) => [...prev, { text: response, isBot: true }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { text: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.", isBot: true },
      ]);
    } finally {
      setIsLoading(false);
      setInput('');
    }
  };

  const generateResponse = async (question: string) => {
    // Kiểm tra API Key
    console.log('Gemini API Key:', process.env.REACT_APP_GEMINI_API_KEY);
    if (!process.env.REACT_APP_GEMINI_API_KEY) {
      throw new Error('Gemini API Key không được tìm thấy. Vui lòng kiểm tra file .env.');
    }

    // Danh sách các phản hồi định sẵn
    const predefinedResponses: { [key: string]: string } = {
      'đăng ký': 'Để đăng ký tài khoản trên FinanceFlow, bạn hãy nhấn vào nút "Đăng ký" ở góc phải trên cùng của trang. Sau đó, điền email, mật khẩu và một số thông tin cá nhân cơ bản. Bạn sẽ nhận được email xác nhận để hoàn tất quá trình.',
      'đăng nhập': 'Bạn có thể đăng nhập bằng cách nhấn vào nút "Đăng nhập" ở góc phải trên cùng. Nếu quên mật khẩu, hãy sử dụng tính năng "Quên mật khẩu" để khôi phục. Chúng tôi sẽ gửi hướng dẫn qua email của bạn.',
      'tính năng': 'FinanceFlow cung cấp các tính năng chính sau:\n- Theo dõi thu chi hàng ngày\n- Lập kế hoạch tiết kiệm và đầu tư\n- Xem báo cáo tài chính chi tiết\n- Thiết lập mục tiêu tài chính\n- Nhắc nhở thanh toán hóa đơn\n- Quản lý ngân sách cá nhân\n- Phân tích xu hướng chi tiêu',
      'tiết kiệm': 'Để bắt đầu tiết kiệm trên FinanceFlow, bạn có thể:\n1. Vào mục "Mục tiêu tiết kiệm"\n2. Tạo mục tiêu mới (ví dụ: mua xe, đi du lịch)\n3. Đặt số tiền cần tiết kiệm và thời hạn\n4. Theo dõi tiến độ qua biểu đồ trực quan',
      'đầu tư': 'FinanceFlow hỗ trợ quản lý đầu tư với các tính năng:\n- Theo dõi danh mục đầu tư (cổ phiếu, quỹ, v.v.)\n- Phân tích lợi nhuận và rủi ro\n- Cập nhật thông tin thị trường\n- Tính toán lãi suất và lợi nhuận dự kiến',
      'báo cáo': 'Bạn có thể xem báo cáo tài chính chi tiết trên FinanceFlow, bao gồm:\n- Thu chi theo ngày, tuần, tháng\n- Phân loại chi tiêu (ăn uống, đi lại, v.v.)\n- Xu hướng chi tiêu qua thời gian\n- So sánh với ngân sách đã đặt',
      'liên hệ': 'Bạn có thể liên hệ với chúng tôi qua:\n- Email: support@financeflow.com\n- Hotline: 0123-456-789\n- Facebook: fb.com/financeflow\n- Địa chỉ: 123 Đường ABC, TP. Hồ Chí Minh',
      'bảo mật': 'FinanceFlow cam kết bảo vệ thông tin của bạn với:\n- Mã hóa dữ liệu đầu cuối\n- Xác thực hai lớp (2FA)\n- Giám sát bảo mật 24/7\n- Tuân thủ các tiêu chuẩn GDPR và bảo mật quốc tế',
      'tác giả': 'Website này được tạo ra bởi Phạm Thế Sơn - một lập trình viên tài năng và đẹp trai 😊. Đây là dự án tốt nghiệp của anh ấy.',
      'creator': 'Website này được tạo ra bởi Phạm Thế Sơn - một lập trình viên tài năng và đẹp trai 😊. Đây là dự án tốt nghiệp của anh ấy.',
      'người tạo': 'Website này được tạo ra bởi Phạm Thế Sơn - một lập trình viên tài năng và đẹp trai 😊. Đây là dự án tốt nghiệp của anh ấy.',
      'thế sơn': 'Phạm Thế Sơn là người tạo ra FinanceFlow. Anh ấy là một lập trình viên tài năng, đẹp trai và đây là dự án tốt nghiệp của anh ấy 😊.',
      'ngân sách': 'Để quản lý ngân sách trên FinanceFlow:\n1. Vào mục "Ngân sách"\n2. Đặt ngân sách cho từng danh mục (ăn uống, giải trí, v.v.)\n3. Theo dõi chi tiêu so với ngân sách\n4. Nhận cảnh báo nếu chi tiêu vượt quá ngân sách',
      'mục tiêu': 'Bạn có thể thiết lập mục tiêu tài chính trên FinanceFlow:\n1. Vào mục "Mục tiêu"\n2. Tạo mục tiêu mới (ví dụ: tiết kiệm 10 triệu trong 6 tháng)\n3. Đặt số tiền và thời hạn\n4. Theo dõi tiến độ qua biểu đồ',
      'thu chi': 'FinanceFlow giúp bạn theo dõi thu chi:\n1. Vào mục "Thu chi"\n2. Thêm giao dịch (thu nhập hoặc chi tiêu)\n3. Phân loại giao dịch (lương, mua sắm, v.v.)\n4. Xem biểu đồ và báo cáo chi tiết',
      'hóa đơn': 'FinanceFlow có tính năng nhắc nhở thanh toán hóa đơn:\n1. Vào mục "Hóa đơn"\n2. Thêm hóa đơn (điện, nước, internet, v.v.)\n3. Đặt ngày đến hạn\n4. Nhận thông báo trước khi hóa đơn đến hạn',
      'phân tích': 'FinanceFlow cung cấp công cụ phân tích chi tiêu:\n- Xem xu hướng chi tiêu qua thời gian\n- Phân loại chi tiêu theo danh mục\n- So sánh chi tiêu với thu nhập\n- Đề xuất cách tối ưu hóa chi tiêu',
      'lợi nhuận': 'Để theo dõi lợi nhuận từ đầu tư trên FinanceFlow:\n1. Vào mục "Đầu tư"\n2. Thêm danh mục đầu tư\n3. Xem lợi nhuận theo thời gian\n4. Nhận phân tích và đề xuất cải thiện',
      'cài đặt': 'Bạn có thể tùy chỉnh cài đặt trên FinanceFlow:\n1. Vào mục "Cài đặt"\n2. Thay đổi thông tin cá nhân\n3. Bật/tắt thông báo\n4. Cài đặt bảo mật (2FA, đổi mật khẩu)',
      'hỗ trợ': 'Nếu cần hỗ trợ, bạn có thể:\n- Xem mục "Hỗ trợ" trên trang web\n- Liên hệ qua email: support@financeflow.com\n- Gọi hotline: 0123-456-789\n- Nhắn tin qua Facebook: fb.com/financeflow',
    };

    // Kiểm tra từ khóa trong câu hỏi
    for (const [keyword, response] of Object.entries(predefinedResponses)) {
      if (question.includes(keyword)) {
        return response;
      }
    }

    // Nếu không có câu trả lời định sẵn, sử dụng Gemini API
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.REACT_APP_GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Bạn là trợ lý tài chính cá nhân của FinanceFlow, một trang web giúp người dùng quản lý tài chính. Bạn hỗ trợ người dùng bằng tiếng Việt, trả lời các câu hỏi về quản lý tài chính, tiết kiệm, đầu tư, ngân sách, thu chi, báo cáo tài chính, và các tính năng của FinanceFlow. Hãy trả lời một cách tự nhiên, dễ hiểu, và chuyên nghiệp. Nếu không biết câu trả lời, hãy hướng dẫn người dùng liên hệ với đội ngũ hỗ trợ. Câu hỏi: ${question}`,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Lỗi khi gọi Gemini API: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      // Trích xuất nội dung từ phản hồi của Gemini API
      const generatedText = data.candidates[0]?.content?.parts[0]?.text;
      if (!generatedText) {
        throw new Error('Không nhận được phản hồi từ Gemini API.');
      }
      return generatedText.trim();
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      return 'Xin lỗi, tôi không thể trả lời câu hỏi này ngay bây giờ. Bạn có thể thử hỏi về các tính năng của FinanceFlow hoặc liên hệ với đội ngũ hỗ trợ qua email: support@financeflow.com.';
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
          >
            <Paper
              sx={{
                position: 'fixed',
                bottom: 80,
                right: 20,
                width: { xs: 280, sm: 320 },
                height: 380,
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                zIndex: 1000,
                borderRadius: '16px',
                background: '#1C1C3D',
              }}
            >
              {/* Header */}
              <Box
                sx={{
                  p: 1.5,
                  bgcolor: '#A78BFA',
                  background: 'linear-gradient(45deg, #A78BFA, #60A5FA)',
                  color: 'white',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderRadius: '16px 16px 0 0',
                }}
              >
                <Typography variant="body1" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                  Trợ lý FinanceFlow
                </Typography>
                <IconButton size="small" onClick={() => setIsOpen(false)} sx={{ color: 'white' }}>
                  <Close fontSize="small" />
                </IconButton>
              </Box>

              {/* Messages */}
              <Box
                sx={{
                  flexGrow: 1,
                  p: 2,
                  overflowY: 'auto',
                  background: '#0A0A23',
                  color: '#FFFFFF',
                }}
              >
                {messages.map((msg, index) => (
                  <Box
                    key={index}
                    sx={{
                      mb: 1.5,
                      display: 'flex',
                      justifyContent: msg.isBot ? 'flex-start' : 'flex-end',
                    }}
                  >
                    <Paper
                      sx={{
                        p: 1,
                        bgcolor: msg.isBot ? '#1C1C3D' : '#A78BFA',
                        color: msg.isBot ? '#A1A1AA' : 'white',
                        maxWidth: '80%',
                        borderRadius: msg.isBot ? '12px 12px 12px 0' : '12px 12px 0 12px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      }}
                    >
                      <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                        {msg.text}
                      </Typography>
                    </Paper>
                  </Box>
                ))}
                <div ref={messagesEndRef} />
              </Box>

              {/* Input */}
              <Box sx={{ p: 1.5, borderTop: '1px solid rgba(255, 255, 255, 0.1)', background: '#1C1C3D' }}>
                <TextField
                  fullWidth
                  size="small"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Nhập câu hỏi của bạn..."
                  disabled={isLoading}
                  sx={{
                    '& .MuiInputBase-root': {
                      background: '#2A2A4A',
                      color: '#FFFFFF',
                      borderRadius: '8px',
                    },
                    '& .MuiInputBase-input': {
                      fontSize: '0.85rem',
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                  InputProps={{
                    endAdornment: (
                      <IconButton onClick={handleSend} disabled={isLoading}>
                        {isLoading ? (
                          <CircularProgress size={20} sx={{ color: '#A78BFA' }} />
                        ) : (
                          <Send sx={{ color: '#A78BFA', fontSize: '20px' }} />
                        )}
                      </IconButton>
                    ),
                  }}
                />
              </Box>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat button */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 1000,
          bgcolor: '#A78BFA',
          '&:hover': { bgcolor: '#906EEB' },
          width: 50,
          height: 50,
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Chat sx={{ fontSize: '24px' }} />
      </Fab>
    </>
  );
};

export default ChatBot;