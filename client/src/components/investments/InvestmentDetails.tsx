import {
    ArrowDownward,
    ArrowUpward,
    Edit
} from '@mui/icons-material';
import {
    alpha,
    Avatar,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    Paper,
    styled,
    Typography,
    useTheme
} from '@mui/material';
import React, { useMemo } from 'react';
import {
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import { Investment } from './InvestmentCard';

const SecondaryButton = styled(Button)(({ theme }) => ({
  borderRadius: '10px',
  padding: '10px 24px',
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.95rem',
  background: theme.palette.mode === 'dark' ? '#2d3748' : '#f7fafc',
  boxShadow: '0 2px 5px rgba(0,0,0,0.07)',
  color: theme.palette.mode === 'dark' ? '#fff' : '#4a5568',
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
  '&:hover': {
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    background: theme.palette.mode === 'dark' ? '#374151' : '#edf2f7',
  },
}));

const GradientButton = styled(Button)(({ theme }) => ({
  borderRadius: '10px',
  padding: '10px 24px',
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.95rem',
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
  boxShadow: '0 4px 10px rgba(0, 118, 255, 0.2)',
  color: '#fff',
  '&:hover': {
    boxShadow: '0 6px 14px rgba(0, 118, 255, 0.3)',
    background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
  },
}));

interface HistoryChartData {
  date: string;
  amount: number;
  type?: 'deposit' | 'withdraw' | 'profit' | 'loss';
}

interface InvestmentDetailsProps {
  open: boolean;
  onClose: () => void;
  investment: Investment | null;
  onEdit: (investment: Investment) => void;
  formatCurrency: (amount: number) => string;
  calculateProfitLoss: (investment: Investment) => { 
    amount: number;
    percentage: string;
    isProfit: boolean 
  };
  getTypeDetails: (type: string) => { 
    value: string;
    label: string;
    color: string;
    icon: React.ReactNode 
  };
}

const InvestmentDetails: React.FC<InvestmentDetailsProps> = ({
  open,
  onClose,
  investment,
  onEdit,
  formatCurrency,
  calculateProfitLoss,
  getTypeDetails
}) => {
  const theme = useTheme();

  const historyChartData: HistoryChartData[] = useMemo(() => {
    if (!investment) return [];
    const data: HistoryChartData[] = [
      {
        date: new Date(investment.startDate).toLocaleDateString('vi-VN'),
        amount: investment.initialAmount,
      },
    ];
    let currentAmount = investment.initialAmount;
    investment.history.forEach((item) => {
      if (item.type === 'deposit') {
        currentAmount += item.amount;
      } else if (item.type === 'withdraw') {
        currentAmount -= item.amount;
      } else if (item.type === 'profit') {
        currentAmount += item.amount;
      } else if (item.type === 'loss') {
        currentAmount -= item.amount;
      }
      data.push({
        date: new Date(item.date).toLocaleDateString('vi-VN'),
        amount: currentAmount,
        type: item.type,
      });
    });
    return data;
  }, [investment]);

  if (!investment) return null;

  const profitLoss = calculateProfitLoss(investment);
  const typeInfo = getTypeDetails(investment.type);
  const averageBuyPrice = investment.type === 'crypto' && investment.quantity
    ? investment.initialAmount / investment.quantity
    : null;
  const currentPrice = investment.type === 'crypto' && investment.quantity
    ? investment.currentAmount / investment.quantity
    : null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ 
        sx: { 
          borderRadius: 3, 
          p: 2,
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(145deg, rgba(30,42,56,0.95) 0%, rgba(38,50,63,0.95) 100%)' 
            : 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)'
        } 
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar 
            sx={{ 
              bgcolor: alpha(typeInfo.color, 0.15), 
              color: typeInfo.color,
              width: 48, 
              height: 48,
              border: `2px solid ${typeInfo.color}`
            }}
          >
            {typeInfo.icon}
          </Avatar>
          <Box>
            <Typography 
              component="div" 
              variant="h5" 
              fontWeight="bold" 
              sx={{ 
                fontSize: '1.5rem',
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {investment.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95rem' }}>
              Chi tiết khoản đầu tư
            </Typography>
          </Box>
        </Box>
        <Divider sx={{ mt: 2 }} />
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 0.5 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ 
              p: 3, 
              borderRadius: 3, 
              bgcolor: theme.palette.mode === 'dark' ? alpha('#2d3748', 0.5) : alpha('#f7fafc', 0.8),
              borderLeft: `4px solid ${theme.palette.primary.main}`
            }}>
              <Typography 
                variant="h6" 
                fontWeight="bold" 
                sx={{ 
                  mb: 2.5, 
                  fontSize: '1.2rem',
                  color: theme.palette.primary.main
                }}
              >
                Thông tin cơ bản
              </Typography>
              <Divider sx={{ mb: 2.5 }} />
              <Grid container spacing={2.5}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
                    Loại đầu tư
                  </Typography>
                  <Typography variant="body1" fontWeight="bold" sx={{ fontSize: '1rem', mt: 0.5 }}>
                    {typeInfo.label}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
                    Trạng thái
                  </Typography>
                  <Typography 
                    variant="body1" 
                    fontWeight="bold" 
                    sx={{ 
                      fontSize: '1rem', 
                      mt: 0.5,
                      color: 
                        investment.status === 'active'
                          ? theme.palette.success.main
                          : investment.status === 'completed'
                          ? theme.palette.info.main
                          : theme.palette.error.main,
                    }}
                  >
                    {investment.status === 'active'
                      ? 'Đang hoạt động'
                      : investment.status === 'completed'
                      ? 'Hoàn thành'
                      : 'Đã hủy'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
                    Số tiền ban đầu
                  </Typography>
                  <Typography variant="body1" fontWeight="bold" sx={{ fontSize: '1rem', mt: 0.5 }}>
                    {formatCurrency(investment.initialAmount)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
                    Giá trị hiện tại
                  </Typography>
                  <Typography variant="body1" fontWeight="bold" sx={{ fontSize: '1rem', mt: 0.5 }}>
                    {formatCurrency(investment.currentAmount)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
                    Ngày bắt đầu
                  </Typography>
                  <Typography variant="body1" fontWeight="bold" sx={{ fontSize: '1rem', mt: 0.5 }}>
                    {new Date(investment.startDate).toLocaleDateString('vi-VN')}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
                    Ngày kết thúc
                  </Typography>
                  <Typography variant="body1" fontWeight="bold" sx={{ fontSize: '1rem', mt: 0.5 }}>
                    {investment.endDate
                      ? new Date(investment.endDate).toLocaleDateString('vi-VN')
                      : 'Chưa xác định'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
                    Lợi nhuận kỳ vọng
                  </Typography>
                  <Typography variant="body1" fontWeight="bold" sx={{ fontSize: '1rem', mt: 0.5 }}>
                    {investment.expectedReturn}%
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
                    Hiệu suất thực tế
                  </Typography>
                  <Typography
                    variant="body1"
                    fontWeight="bold"
                    sx={{
                      color: profitLoss.isProfit
                        ? theme.palette.success.main
                        : theme.palette.error.main,
                      fontSize: '1rem',
                      mt: 0.5,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5
                    }}
                  >
                    {profitLoss.isProfit ? (
                      <ArrowUpward fontSize="small" sx={{ fontSize: '0.9rem' }} />
                    ) : (
                      <ArrowDownward fontSize="small" sx={{ fontSize: '0.9rem' }} />
                    )}
                    {profitLoss.percentage}%
                  </Typography>
                </Grid>
                {investment.type === 'crypto' && investment.quantity && (
                  <>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
                        Số lượng coin
                      </Typography>
                      <Typography variant="body1" fontWeight="bold" sx={{ fontSize: '1rem', mt: 0.5 }}>
                        {investment.quantity}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
                        Giá mua trung bình
                      </Typography>
                      <Typography variant="body1" fontWeight="bold" sx={{ fontSize: '1rem', mt: 0.5 }}>
                        {formatCurrency(averageBuyPrice || 0)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
                        Giá hiện tại
                      </Typography>
                      <Typography 
                        variant="body1" 
                        fontWeight="bold" 
                        sx={{ 
                          fontSize: '1rem', 
                          mt: 0.5,
                          color: (currentPrice || 0) > (averageBuyPrice || 0)
                            ? theme.palette.success.main
                            : theme.palette.error.main
                        }}
                      >
                        {formatCurrency(currentPrice || 0)}
                      </Typography>
                    </Grid>
                  </>
                )}
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ 
              p: 3, 
              borderRadius: 3, 
              bgcolor: theme.palette.mode === 'dark' ? alpha('#2d3748', 0.5) : alpha('#f7fafc', 0.8),
              borderLeft: `4px solid ${profitLoss.isProfit ? theme.palette.success.main : theme.palette.error.main}`
            }}>
              <Typography 
                variant="h6" 
                fontWeight="bold" 
                sx={{ 
                  mb: 2.5, 
                  fontSize: '1.2rem',
                  color: profitLoss.isProfit ? theme.palette.success.main : theme.palette.error.main
                }}
              >
                Hiệu suất đầu tư
              </Typography>
              <Divider sx={{ mb: 2.5 }} />
              <Grid container spacing={2.5}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
                    Lợi nhuận/Lỗ
                  </Typography>
                  <Typography
                    variant="body1"
                    fontWeight="bold"
                    sx={{
                      color: profitLoss.isProfit
                        ? theme.palette.success.main
                        : theme.palette.error.main,
                      fontSize: '1rem',
                      mt: 0.5,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5
                    }}
                  >
                    {profitLoss.isProfit ? (
                      <ArrowUpward fontSize="small" sx={{ fontSize: '0.9rem' }} />
                    ) : (
                      <ArrowDownward fontSize="small" sx={{ fontSize: '0.9rem' }} />
                    )}
                    {profitLoss.isProfit ? '+' : '-'}
                    {formatCurrency(Math.abs(profitLoss.amount))}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem', mb: 1 }}>
                    Biến động giá trị
                  </Typography>
                  <Box sx={{ height: 200 }}>
                    {historyChartData.length > 1 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={historyChartData}>
                          <XAxis 
                            dataKey="date" 
                            tick={{ fontSize: 10 }} 
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis 
                            tickFormatter={(value) => formatCurrency(value).split('.')[0]} 
                            tick={{ fontSize: 10 }}
                            tickLine={false}
                            axisLine={false}
                          />
                          <Tooltip 
                            formatter={(value: number) => formatCurrency(value)}
                            contentStyle={{ 
                              borderRadius: 8, 
                              border: 'none', 
                              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                              padding: '10px 14px' 
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="amount" 
                            stroke={theme.palette.primary.main} 
                            strokeWidth={2}
                            dot={{ fill: theme.palette.background.paper, strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, fill: theme.palette.primary.main }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        height: '100%',
                        color: 'text.secondary'
                      }}>
                        <Typography variant="body2">Chưa có lịch sử giao dịch</Typography>
                      </Box>
                    )}
                  </Box>
                </Grid>
              </Grid>
              {investment.notes && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.9rem' }}>
                    Ghi chú
                  </Typography>
                  <Paper
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: theme.palette.mode === 'dark' ? alpha('#374151', 0.7) : alpha('#f1f5f9', 0.7),
                    }}
                  >
                    <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
                      {investment.notes}
                    </Typography>
                  </Paper>
                </Box>
              )}
            </Paper>
          </Grid>
          {investment.history.length > 0 && (
            <Grid item xs={12}>
              <Paper sx={{ 
                p: 3, 
                borderRadius: 3, 
                bgcolor: theme.palette.mode === 'dark' ? alpha('#2d3748', 0.5) : alpha('#f7fafc', 0.8),
              }}>
                <Typography 
                  variant="h6" 
                  fontWeight="bold" 
                  sx={{ 
                    mb: 2.5, 
                    fontSize: '1.2rem',
                    color: theme.palette.info.main
                  }}
                >
                  Lịch sử giao dịch
                </Typography>
                <Divider sx={{ mb: 2.5 }} />
                <Box sx={{ maxHeight: 250, overflowY: 'auto', pr: 1 }}>
                  {investment.history.map((item, index) => (
                    <Box
                      key={index}
                      sx={{
                        p: 2,
                        mb: 2,
                        borderRadius: 2,
                        bgcolor: theme.palette.mode === 'dark' ? alpha('#1e2a38', 0.8) : alpha('#fff', 0.8),
                        border: '1px solid',
                        borderColor: 
                          item.type === 'deposit'
                            ? alpha(theme.palette.info.main, 0.3)
                            : item.type === 'withdraw'
                            ? alpha(theme.palette.warning.main, 0.3)
                            : item.type === 'profit'
                            ? alpha(theme.palette.success.main, 0.3)
                            : alpha(theme.palette.error.main, 0.3),
                      }}
                    >
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={3}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                            Ngày
                          </Typography>
                          <Typography variant="body1" fontWeight="bold" sx={{ fontSize: '0.95rem' }}>
                            {new Date(item.date).toLocaleDateString('vi-VN')}
                          </Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                            Loại
                          </Typography>
                          <Typography 
                            variant="body1" 
                            fontWeight="bold" 
                            sx={{ 
                              fontSize: '0.95rem',
                              color:
                                item.type === 'deposit'
                                  ? theme.palette.info.main
                                  : item.type === 'withdraw'
                                  ? theme.palette.warning.main
                                  : item.type === 'profit'
                                  ? theme.palette.success.main
                                  : theme.palette.error.main
                            }}
                          >
                            {item.type === 'deposit'
                              ? 'Nạp thêm'
                              : item.type === 'withdraw'
                              ? 'Rút tiền'
                              : item.type === 'profit'
                              ? 'Lợi nhuận'
                              : 'Thua lỗ'}
                          </Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                            Số tiền
                          </Typography>
                          <Typography 
                            variant="body1" 
                            fontWeight="bold" 
                            sx={{ 
                              fontSize: '0.95rem',
                              color:
                                item.type === 'deposit' || item.type === 'profit'
                                  ? theme.palette.success.main
                                  : theme.palette.error.main,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5
                            }}
                          >
                            {item.type === 'deposit' || item.type === 'profit' ? (
                              <ArrowUpward sx={{ fontSize: '0.8rem' }} />
                            ) : (
                              <ArrowDownward sx={{ fontSize: '0.8rem' }} />
                            )}
                            {formatCurrency(item.amount)}
                          </Typography>
                        </Grid>
                        <Grid item xs={3}>
                          {item.reason && (
                            <>
                              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                                Lý do
                              </Typography>
                              <Typography variant="body1" sx={{ fontSize: '0.95rem' }}>
                                {item.reason}
                              </Typography>
                            </>
                          )}
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <SecondaryButton onClick={onClose}>Đóng</SecondaryButton>
        {investment && (
          <GradientButton
            startIcon={<Edit />}
            onClick={() => {
              onClose();
              onEdit(investment);
            }}
          >
            Chỉnh sửa
          </GradientButton>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default InvestmentDetails; 