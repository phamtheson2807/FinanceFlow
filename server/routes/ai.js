const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Saving = require('../models/Saving');
const Investment = require('../models/Investment');
const { authMiddleware } = require('../middleware/auth');

// Danh sách gợi ý mẫu với trọng số
const suggestionPool = [
  { suggestion: 'Tăng mức tiết kiệm hàng tháng', action: 'Dành thêm một phần thu nhập vào quỹ tiết kiệm.', impact: 'Tăng tốc độ đạt mục tiêu tài chính.', weight: 2 },
  { suggestion: 'Đa dạng hóa danh mục đầu tư', action: 'Xem xét đầu tư vào cổ phiếu hoặc trái phiếu.', impact: 'Giảm rủi ro và tăng lợi nhuận dài hạn.', weight: 3 },
  { suggestion: 'Tối ưu hóa chi tiêu', action: 'Cắt giảm chi phí không cần thiết.', impact: 'Tăng khoản tiết kiệm hàng tháng.', weight: 2 },
  { suggestion: 'Tạo nguồn thu nhập thụ động', action: 'Khám phá việc cho thuê tài sản hoặc đầu tư cổ tức.', impact: 'Tăng dòng tiền ổn định.', weight: 4 },
  { suggestion: 'Xem xét lại mục tiêu tiết kiệm', action: 'Điều chỉnh mục tiêu cho thực tế hơn.', impact: 'Dễ dàng đạt được kế hoạch tài chính.', weight: 1 },
  { suggestion: 'Đầu tư dài hạn', action: 'Chọn các quỹ ETF hoặc bất động sản để đầu tư.', impact: 'Tăng trưởng tài sản bền vững.', weight: 3 },
  { suggestion: 'Kiểm tra danh mục đầu tư', action: 'Đánh giá lại các khoản đầu tư hiện tại.', impact: 'Tối ưu hóa lợi nhuận.', weight: 2 },
];

// Hàm phân tích dữ liệu tài chính và đề xuất gợi ý phù hợp
const analyzeFinancialDataAndSuggest = (financialData) => {
  const { income, expense, savings, investment } = financialData;
  const personalizedTips = [];

  // Phân tích tỷ lệ chi tiêu so với thu nhập
  const expenseRatio = expense / income;
  if (expenseRatio > 0.8) {
    personalizedTips.push({
      suggestion: 'Chi tiêu của bạn đang cao hơn mức hợp lý',
      action: 'Xem xét giảm chi phí không cần thiết ở các danh mục chi tiêu chính',
      impact: 'Giảm tỷ lệ chi tiêu xuống dưới 70% thu nhập để tăng khả năng tích lũy',
      weight: 5
    });
  }

  // Phân tích tiến độ tiết kiệm
  if (savings.target > 0) {
    const savingsProgress = savings.current / savings.target;
    if (savingsProgress < 0.5) {
      personalizedTips.push({
        suggestion: 'Tiến độ tiết kiệm còn chậm',
        action: 'Tăng khoản tiết kiệm định kỳ hàng tháng',
        impact: 'Đạt mục tiêu tiết kiệm nhanh hơn và tăng an toàn tài chính',
        weight: 4
      });
    }
  } else if (savings.current === 0) {
    personalizedTips.push({
      suggestion: 'Bạn chưa có kế hoạch tiết kiệm',
      action: 'Bắt đầu bằng việc tạo một mục tiêu tiết kiệm và gửi tiền định kỳ',
      impact: 'Xây dựng quỹ khẩn cấp và an toàn tài chính',
      weight: 5
    });
  }

  // Phân tích đầu tư
  if (investment.total === 0) {
    personalizedTips.push({
      suggestion: 'Chưa có khoản đầu tư nào',
      action: 'Bắt đầu đầu tư với số tiền nhỏ vào các sản phẩm an toàn',
      impact: 'Tạo thói quen đầu tư và tăng trưởng tài sản dài hạn',
      weight: 3
    });
  } else if (investment.profit < 0) {
    personalizedTips.push({
      suggestion: 'Danh mục đầu tư đang bị lỗ',
      action: 'Xem xét lại chiến lược đầu tư và phân bổ tài sản',
      impact: 'Giảm thiểu rủi ro và cải thiện hiệu suất đầu tư',
      weight: 5
    });
  }

  // Phân tích tỷ lệ tiết kiệm so với thu nhập
  const monthlySavings = income - expense;
  const savingsRatio = monthlySavings / income;
  if (savingsRatio < 0.2 && income > 0) {
    personalizedTips.push({
      suggestion: 'Tỷ lệ tiết kiệm hàng tháng còn thấp',
      action: 'Cố gắng tiết kiệm ít nhất 20% thu nhập hàng tháng',
      impact: 'Xây dựng tự do tài chính và chuẩn bị tốt hơn cho tương lai',
      weight: 4
    });
  }

  return personalizedTips;
};

// Hàm tạo gợi ý có trọng số
const generateTips = (financialData) => {
  console.log('📌 Bắt đầu tạo gợi ý');

  const minTips = 3;
  const weightedSuggestions = [];
  
  // Tạo gợi ý cá nhân hóa từ dữ liệu tài chính
  const personalizedTips = analyzeFinancialDataAndSuggest(financialData);
  console.log('📌 Gợi ý cá nhân hóa:', personalizedTips);
  
  // Kết hợp gợi ý cá nhân hóa với gợi ý chung
  const combinedSuggestionPool = [...personalizedTips, ...suggestionPool];

  // Nhân bản các gợi ý theo trọng số
  combinedSuggestionPool.forEach(suggestion => {
    for (let i = 0; i < suggestion.weight; i++) {
      weightedSuggestions.push(suggestion);
    }
  });

  console.log('📌 Danh sách gợi ý mở rộng:', weightedSuggestions);

  if (weightedSuggestions.length === 0) {
    console.warn('⚠️ Không có gợi ý nào trong danh sách mẫu!');
    return [];
  }

  const tips = new Set();

  // Ưu tiên thêm gợi ý cá nhân hóa trước
  personalizedTips.forEach(tip => {
    if (tips.size < minTips) {
      tips.add(tip);
    }
  });

  // Sau đó thêm gợi ý ngẫu nhiên nếu cần
  while (tips.size < minTips) {
    const randomIndex = Math.floor(Math.random() * weightedSuggestions.length);
    tips.add(weightedSuggestions[randomIndex]);
  }

  const finalTips = Array.from(tips);
  console.log('📌 Tips cuối cùng:', finalTips);
  return finalTips;
};

const generateAIFinancialReport = async (userId) => {
  try {
    const transactions = await Transaction.find({ user: userId }).lean();
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    const savings = await Saving.find({ user: userId }).lean();
    console.log('📌 Savings data:', savings);
    const totalSavings = savings.reduce((sum, s) => sum + (s.current_amount || 0), 0);
    const totalSavingsTarget = savings.reduce((sum, s) => sum + (s.target_amount || 0), 0);

    const investments = await Investment.find({ user: userId }).lean();
    console.log('📌 Investments data:', investments);
    const totalInvestment = investments.reduce((sum, i) => sum + (i.currentAmount || 0), 0);
    const totalProfit = investments.reduce((sum, i) => sum + ((i.currentAmount || 0) - (i.initialAmount || 0)), 0);

    const financialData = {
      income,
      expense,
      savings: { current: totalSavings, target: totalSavingsTarget },
      investment: { total: totalInvestment, profit: totalProfit }
    };

    // Tạo gợi ý dựa trên dữ liệu tài chính
    const tips = generateTips(financialData);

    return {
      income,
      expense,
      savings: { current: totalSavings, target: totalSavingsTarget },
      investment: { total: totalInvestment, profit: totalProfit },
      tips,
    };
  } catch (error) {
    console.error('❌ Lỗi tạo báo cáo AI:', error);
    throw error;
  }
};

router.get('/report', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    console.log('📌 UserID:', userId);
    const report = await generateAIFinancialReport(userId);
    console.log('📌 Report data:', report);
    res.status(200).json(report);
  } catch (error) {
    console.error('❌ Lỗi trong route GET /report:', error);
    res.status(500).json({ message: 'Lỗi lấy báo cáo tài chính AI' });
  }
});

module.exports = router;
