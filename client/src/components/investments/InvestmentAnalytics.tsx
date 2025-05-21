import {
    ArrowDownward,
    ArrowUpward,
    TrendingUp,
} from '@mui/icons-material';
import {
    alpha,
    Box,
    Card,
    Grid,
    Paper,
    styled,
    Typography,
    useTheme
} from '@mui/material';
import React, { useMemo } from 'react';
import {
    Bar,
    BarChart,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    XAxis,
    YAxis,
} from 'recharts';
import { Investment } from './InvestmentCard';
import { InvestmentType } from './InvestmentHeader';

const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3, 4),
  borderRadius: '16px',
  background: theme.palette.mode === 'dark' 
    ? 'linear-gradient(145deg, rgba(36,47,64,0.8) 0%, rgba(50,63,84,0.9) 100%)' 
    : 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 10px 25px rgba(0,0,0,0.2)'
    : '0 10px 25px rgba(0,0,0,0.05)'
}));

interface PieChartData {
  name: string;
  value: number;
  color: string;
}

interface ChartData {
  date: string;
  profitLoss: number;
}

interface InvestmentAnalyticsProps {
  investments: Investment[];
  investmentTypes: InvestmentType[];
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

const InvestmentAnalytics: React.FC<InvestmentAnalyticsProps> = ({
  investments,
  investmentTypes,
  formatCurrency,
  calculateProfitLoss,
  getTypeDetails,
}) => {
  const theme = useTheme();

  // Tính toán tổng quan về hiệu suất đầu tư
  const totalProfitLoss = useMemo(() => {
    const total = investments.reduce(
      (acc, inv) => {
        const { amount, isProfit } = calculateProfitLoss(inv);
        return {
          profit: isProfit ? acc.profit + amount : acc.profit,
          loss: !isProfit ? acc.loss + Math.abs(amount) : acc.loss,
          totalInvested: acc.totalInvested + inv.initialAmount,
          totalCurrent: acc.totalCurrent + inv.currentAmount,
        };
      },
      { profit: 0, loss: 0, totalInvested: 0, totalCurrent: 0 }
    );
    return total;
  }, [investments, calculateProfitLoss]);

  const totalPerformance = useMemo(() => {
    return totalProfitLoss.totalInvested > 0
      ? ((totalProfitLoss.totalCurrent - totalProfitLoss.totalInvested) / totalProfitLoss.totalInvested) * 100
      : 0;
  }, [totalProfitLoss]);

  // Dữ liệu biểu đồ tròn theo tên đầu tư
  const pieData: PieChartData[] = useMemo(() => {
    return investments.map((inv) => ({
      name: inv.name,
      value: inv.currentAmount,
      color: getTypeDetails(inv.type).color,
    }));
  }, [investments, getTypeDetails]);

  // Dữ liệu biểu đồ theo loại đầu tư
  const investmentByTypeData: PieChartData[] = useMemo(() => {
    const typeMap = new Map<string, number>();
    investments.forEach((inv) => {
      const type = getTypeDetails(inv.type).label;
      typeMap.set(type, (typeMap.get(type) || 0) + inv.currentAmount);
    });
    return Array.from(typeMap.entries()).map(([name, value]) => ({
      name,
      value,
      color: getTypeDetails(investmentTypes.find((t) => t.label === name)?.value || 'other').color,
    }));
  }, [investments, getTypeDetails, investmentTypes]);

  // Dữ liệu biểu đồ hiệu suất theo thời gian
  const performanceChartData: ChartData[] = useMemo(() => {
    const data: ChartData[] = [];
    if (investments.length === 0) return data;
    
    const startDate = new Date(Math.min(...investments.map((inv) => new Date(inv.startDate).getTime())));
    const endDate = new Date();
    
    for (let date = new Date(startDate); date <= endDate; date.setMonth(date.getMonth() + 1)) {
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      let totalProfitLoss = 0;
      
      investments.forEach((inv) => {
        const invStartDate = new Date(inv.startDate);
        if (invStartDate <= date) {
          const profitLoss = inv.currentAmount - inv.initialAmount;
          totalProfitLoss += profitLoss;
        }
      });
      
      data.push({
        date: monthKey,
        profitLoss: totalProfitLoss,
      });
    }
    
    return data;
  }, [investments]);

  if (investments.length === 0) {
    return (
      <StyledCard>
        <Box sx={{ 
          textAlign: 'center', 
          py: 8, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <Box sx={{ 
            width: 80, 
            height: 80, 
            bgcolor: alpha(theme.palette.primary.light, 0.1),
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3
          }}>
            <TrendingUp color="primary" sx={{ fontSize: 40 }} />
          </Box>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
            Chưa có dữ liệu phân tích
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Hãy thêm các khoản đầu tư để xem thống kê và phân tích chi tiết
          </Typography>
        </Box>
      </StyledCard>
    );
  }

  return (
    <Grid container spacing={3} sx={{ width: '100%', m: 0, p: 0 }}>
      <Grid item xs={12}>
        <StyledCard>
          <Typography 
            variant="h5" 
            fontWeight="bold" 
            sx={{ 
              mb: 4, 
              fontSize: { xs: '1.3rem', sm: '1.5rem' },
              position: 'relative',
              display: 'inline-block',
              '&:after': {
                content: '""',
                position: 'absolute',
                bottom: -10,
                left: 0,
                width: 40,
                height: 4,
                borderRadius: 2,
                backgroundColor: theme.palette.primary.main
              } 
            }}
          >
            Tổng quan hiệu suất
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: { xs: 2, sm: 2.5 }, 
                  borderRadius: 4, 
                  background: alpha(theme.palette.primary.light, 0.08),
                  border: `1px solid ${alpha(theme.palette.primary.light, 0.2)}`
                }}
              >
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.85rem', sm: '0.9rem' }, mb: 1.5 }}>
                  Tổng vốn đầu tư
                </Typography>
                <Typography variant="h5" fontWeight="bold" sx={{ fontSize: { xs: '1.3rem', sm: '1.5rem' }, color: theme.palette.primary.main }}>
                  {formatCurrency(totalProfitLoss.totalInvested)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: { xs: 2, sm: 2.5 }, 
                  borderRadius: 4, 
                  background: alpha(theme.palette.info.light, 0.08),
                  border: `1px solid ${alpha(theme.palette.info.light, 0.2)}`
                }}
              >
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.85rem', sm: '0.9rem' }, mb: 1.5 }}>
                  Giá trị hiện tại
                </Typography>
                <Typography variant="h5" fontWeight="bold" sx={{ fontSize: { xs: '1.3rem', sm: '1.5rem' }, color: theme.palette.info.main }}>
                  {formatCurrency(totalProfitLoss.totalCurrent)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: { xs: 2, sm: 2.5 }, 
                  borderRadius: 4, 
                  background: alpha(theme.palette.success.light, 0.08),
                  border: `1px solid ${alpha(theme.palette.success.light, 0.2)}`
                }}
              >
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.85rem', sm: '0.9rem' }, mb: 1.5 }}>
                  Lợi nhuận
                </Typography>
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  sx={{ color: theme.palette.success.main, fontSize: { xs: '1.3rem', sm: '1.5rem' }, display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <ArrowUpward fontSize={window.innerWidth < 600 ? 'small' : 'medium'} />
                  {formatCurrency(totalProfitLoss.profit)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: { xs: 2, sm: 2.5 }, 
                  borderRadius: 4, 
                  background: alpha(theme.palette.error.light, 0.08),
                  border: `1px solid ${alpha(theme.palette.error.light, 0.2)}`
                }}
              >
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.85rem', sm: '0.9rem' }, mb: 1.5 }}>
                  Lỗ
                </Typography>
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  sx={{ color: theme.palette.error.main, fontSize: { xs: '1.3rem', sm: '1.5rem' }, display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <ArrowDownward fontSize={window.innerWidth < 600 ? 'small' : 'medium'} />
                  {formatCurrency(totalProfitLoss.loss)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  borderRadius: 4, 
                  background: alpha(totalPerformance >= 0 ? theme.palette.success.light : theme.palette.error.light, 0.08),
                  border: `1px solid ${alpha(totalPerformance >= 0 ? theme.palette.success.light : theme.palette.error.light, 0.2)}`
                }}
              >
                <Typography variant="body1" color="text.secondary" sx={{ mb: 1, fontSize: '1rem', fontWeight: 500 }}>
                  Tổng hiệu suất đầu tư
                </Typography>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  sx={{
                    color: totalPerformance >= 0 ? theme.palette.success.main : theme.palette.error.main,
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '2rem',
                  }}
                >
                  {totalPerformance >= 0 ? <ArrowUpward fontSize="large" sx={{ mr: 1 }} /> : <ArrowDownward fontSize="large" sx={{ mr: 1 }} />}
                  {totalPerformance >= 0 ? '+' : '-'}{Math.abs(totalPerformance).toFixed(2)}%
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  borderRadius: 4,
                  mt: 2
                }}
              >
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, fontSize: '1.2rem' }}>
                  Hiệu suất theo thời gian
                </Typography>
                {performanceChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={performanceChartData}>
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }} 
                        tickFormatter={(value) => {
                          // Trên mobile chỉ hiển thị năm
                          const isMobile = window.innerWidth < 600;
                          if (isMobile) {
                            return value.split('-')[0]; // Chỉ lấy năm
                          }
                          return value; // Trên desktop hiển thị đầy đủ
                        }}
                      />
                      <YAxis 
                        tickFormatter={(value) => value.toLocaleString('vi-VN')} 
                        tick={{ fontSize: 12 }}
                        width={60}
                      />
                      <RechartsTooltip 
                        formatter={(value: number) => formatCurrency(value)} 
                        contentStyle={{ 
                          borderRadius: 8, 
                          border: 'none', 
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          padding: '10px 14px' 
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="profitLoss"
                        stroke={theme.palette.primary.main}
                        strokeWidth={3}
                        name="Lợi nhuận/Lỗ"
                        dot={{ strokeWidth: 2, r: 4, fill: '#fff' }}
                        activeDot={{ strokeWidth: 0, r: 6, fill: theme.palette.primary.main }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 5 }}>
                    <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1rem' }}>
                      Chưa có dữ liệu hiệu suất
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </StyledCard>
      </Grid>
      <Grid item xs={12} md={6}>
        <StyledCard sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Typography 
            variant="h6" 
            fontWeight="bold" 
            sx={{ 
              mb: 3, 
              fontSize: '1.2rem',
              position: 'relative',
              display: 'inline-block',
              '&:after': {
                content: '""',
                position: 'absolute',
                bottom: -8,
                left: 0,
                width: 30,
                height: 3,
                borderRadius: 1.5,
                backgroundColor: theme.palette.primary.main
              }
            }}
          >
            Phân bổ theo loại đầu tư
          </Typography>
          {investmentByTypeData.length > 0 ? (
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={investmentByTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    innerRadius={60}
                    dataKey="value"
                    paddingAngle={2}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                  >
                    {investmentByTypeData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color} 
                        stroke={theme.palette.background.paper}
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Legend 
                    wrapperStyle={{ fontSize: '0.9rem', paddingTop: '20px' }}
                    iconSize={10}
                    iconType="circle"
                  />
                  <RechartsTooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ 
                      borderRadius: 8, 
                      border: 'none', 
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      padding: '10px 14px' 
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          ) : (
            <Box sx={{ 
              textAlign: 'center', 
              py: 6, 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <Box sx={{ 
                width: 60, 
                height: 60, 
                bgcolor: alpha(theme.palette.primary.light, 0.1),
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2
              }}>
                <TrendingUp color="primary" fontSize="large" />
              </Box>
              <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1rem' }}>
                Chưa có dữ liệu đầu tư
              </Typography>
            </Box>
          )}
        </StyledCard>
      </Grid>
      <Grid item xs={12} md={6}>
        <StyledCard sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Typography 
            variant="h6" 
            fontWeight="bold" 
            sx={{ 
              mb: 3, 
              fontSize: '1.2rem',
              position: 'relative',
              display: 'inline-block',
              '&:after': {
                content: '""',
                position: 'absolute',
                bottom: -8,
                left: 0,
                width: 30,
                height: 3,
                borderRadius: 1.5,
                backgroundColor: theme.palette.primary.main
              }
            }}
          >
            Phân bổ theo giá trị
          </Typography>
          {pieData.length > 0 ? (
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={pieData}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis 
                    tickFormatter={(value) => value.toLocaleString('vi-VN')} 
                    tick={{ fontSize: 12 }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <RechartsTooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ 
                      borderRadius: 8, 
                      border: 'none', 
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      padding: '10px 14px' 
                    }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={40}>
                    {pieData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color} 
                        stroke={theme.palette.background.paper}
                        strokeWidth={1}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          ) : (
            <Box sx={{ 
              textAlign: 'center', 
              py: 6, 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <Box sx={{ 
                width: 60, 
                height: 60, 
                bgcolor: alpha(theme.palette.primary.light, 0.1),
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2
              }}>
                <TrendingUp color="primary" fontSize="large" />
              </Box>
              <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1rem' }}>
                Chưa có dữ liệu
              </Typography>
            </Box>
          )}
        </StyledCard>
      </Grid>
    </Grid>
  );
};

export default InvestmentAnalytics; 