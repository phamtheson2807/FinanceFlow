import {
    ArrowDownward,
    ArrowUpward,
    AttachMoney,
    Delete, Edit, MoreVert,
    Visibility,
} from '@mui/icons-material';
import {
    alpha,
    Avatar,
    Box,
    Card,
    CardContent,
    CardHeader,
    Chip,
    Divider,
    Grid,
    IconButton,
    LinearProgress,
    ListItemIcon,
    Menu,
    MenuItem,
    styled,
    Typography,
    useTheme,
} from '@mui/material';
import React, { useState } from 'react';

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  background: theme.palette.mode === 'dark' 
    ? 'linear-gradient(135deg, #1e2a38 0%, #2d3748 100%)' 
    : 'linear-gradient(135deg, #fff 0%, #f7fafc 100%)',
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 8px 16px rgba(0,0,0,0.2)' 
    : '0 4px 20px rgba(0,0,0,0.05)',
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(226, 232, 240, 0.8)'}`,
  transition: 'all 0.2s ease',
  height: '100%',
  width: '100%',
  position: 'relative',
  overflow: 'visible',
  marginLeft: 0,
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.palette.mode === 'dark' 
      ? '0 12px 24px rgba(0,0,0,0.3)' 
      : '0 12px 24px rgba(0,0,0,0.1)',
  },
}));

const SecondaryButton = styled(IconButton)(({ theme }) => ({
  borderRadius: '12px',
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.95rem',
  background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(241, 245, 249, 0.8)',
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(226, 232, 240, 0.8)'}`,
  color: theme.palette.mode === 'dark' ? '#e2e8f0' : '#334155',
  transition: 'all 0.2s ease',
  '&:hover': {
    background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(226, 232, 240, 0.8)',
    transform: 'translateY(-2px)',
  },
}));

const GradientButton = styled(IconButton)(({ theme }) => ({
  borderRadius: '12px',
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.95rem',
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
  boxShadow: '0 4px 10px rgba(37, 99, 235, 0.15)',
  border: '1px solid rgba(37, 99, 235, 0.1)',
  color: '#fff',
  transition: 'all 0.2s ease',
  '&:hover': {
    boxShadow: '0 6px 14px rgba(37, 99, 235, 0.2)',
    background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
    transform: 'translateY(-2px)',
  },
}));

export interface Investment {
  _id: string;
  name: string;
  type: string;
  initialAmount: number;
  currentAmount: number;
  expectedReturn: number;
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'cancelled';
  notes?: string;
  quantity?: number;
  history: {
    date: string;
    amount: number;
    type: 'deposit' | 'withdraw' | 'profit' | 'loss';
    reason?: string;
  }[];
}

interface InvestmentCardProps {
  investment: Investment;
  onViewDetails: (investment: Investment) => void;
  onWithdraw: (investment: Investment) => void;
  onEdit: (investment: Investment) => void;
  onDelete: (id: string) => void;
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

export const InvestmentCard: React.FC<InvestmentCardProps> = ({
  investment,
  onViewDetails,
  onWithdraw,
  onEdit,
  onDelete,
  formatCurrency,
  calculateProfitLoss,
  getTypeDetails
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  const profitLoss = calculateProfitLoss(investment);
  const typeInfo = getTypeDetails(investment.type);
  const progress = (investment.currentAmount / (investment.initialAmount * (1 + investment.expectedReturn / 100))) * 100;
  
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <StyledCard
      sx={{
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '6px',
          background: `linear-gradient(45deg, ${typeInfo.color}, ${alpha(typeInfo.color, 0.6)})`,
          borderRadius: '16px 16px 0 0',
        }
      }}
    >
      <CardHeader
        avatar={
          <Avatar 
            sx={{ 
              bgcolor: alpha(typeInfo.color, 0.15), 
              color: typeInfo.color,
              width: { xs: 36, sm: 40 },
              height: { xs: 36, sm: 40 },
              border: `2px solid ${typeInfo.color}`,
              boxShadow: `0 0 0 4px ${alpha(typeInfo.color, 0.1)}`,
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'scale(1.05)',
              },
            }}
          >
            {typeInfo.icon}
          </Avatar>
        }
        title={
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600,
              fontSize: { xs: '1.1rem', sm: '1.2rem' },
              color: (theme) => theme.palette.mode === 'dark' ? '#e2e8f0' : '#1e293b',
            }}
          >
            {investment.name}
          </Typography>
        }
        action={
          <IconButton 
            onClick={handleMenuOpen}
            sx={{
              color: (theme) => theme.palette.mode === 'dark' ? '#94a3b8' : '#64748b',
              '&:hover': {
                color: (theme) => theme.palette.mode === 'dark' ? '#e2e8f0' : '#1e293b',
              },
            }}
          >
            <MoreVert />
          </IconButton>
        }
        subheader={
          <Box sx={{ display: 'flex', gap: 1, mt: 0.8, flexWrap: 'wrap' }}>
            <Chip
              size="small"
              label={typeInfo.label}
              sx={{
                bgcolor: alpha(typeInfo.color, 0.1),
                color: typeInfo.color,
                fontWeight: 600,
                fontSize: '0.8rem',
                borderRadius: '8px',
                height: '26px',
                border: `1px solid ${alpha(typeInfo.color, 0.2)}`,
              }}
            />
            <Chip
              size="small"
              label={
                investment.status === 'active'
                  ? 'Đang hoạt động'
                  : investment.status === 'completed'
                  ? 'Hoàn thành'
                  : 'Đã hủy'
              }
              sx={{
                bgcolor:
                  investment.status === 'active'
                    ? alpha(theme.palette.success.main, 0.1)
                    : investment.status === 'completed'
                    ? alpha(theme.palette.info.main, 0.1)
                    : alpha(theme.palette.error.main, 0.1),
                color:
                  investment.status === 'active'
                    ? theme.palette.success.main
                    : investment.status === 'completed'
                    ? theme.palette.info.main
                    : theme.palette.error.main,
                fontWeight: 600,
                fontSize: '0.8rem',
                borderRadius: '8px',
                height: '26px',
                border: `1px solid ${alpha(
                  investment.status === 'active'
                    ? theme.palette.success.main
                    : investment.status === 'completed'
                    ? theme.palette.info.main
                    : theme.palette.error.main,
                  0.2
                )}`,
              }}
            />
          </Box>
        }
        sx={{ pb: 0.5, px: 2 }}
      />
      <CardContent sx={{ pt: 1, px: 2, pb: 2 }}>
        <Box 
          sx={{ 
            mb: 2, 
            fontSize: { xs: '0.85rem', sm: '0.9rem' }, 
            display: 'flex', 
            gap: 1, 
            alignItems: 'center',
            flexWrap: { xs: 'wrap', sm: 'nowrap' },
            color: (theme) => theme.palette.mode === 'dark' ? '#94a3b8' : '#64748b',
          }}
        >
          <Box component="span" sx={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            borderRadius: '50%',
            width: 20,
            height: 20,
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
            color: (theme) => theme.palette.primary.main,
            border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            flexShrink: 0
          }}>
            <Box sx={{ width: 16, height: 16 }}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z" />
              </svg>
            </Box>
          </Box>
          <Box component="span">
            Bắt đầu: {new Date(investment.startDate).toLocaleDateString('vi-VN')}
            {investment.endDate &&
              ` | Kết thúc: ${new Date(investment.endDate).toLocaleDateString('vi-VN')}`}
          </Box>
        </Box>

        <Box sx={{ mb: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                fontSize: { xs: '0.85rem', sm: '0.9rem' }, 
                fontWeight: 500,
                color: (theme) => theme.palette.mode === 'dark' ? '#94a3b8' : '#64748b',
              }}
            >
              Tiến độ đầu tư
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                fontSize: { xs: '0.8rem', sm: '0.85rem' }, 
                fontWeight: 600,
                color: (theme) => theme.palette.mode === 'dark' ? '#e2e8f0' : '#1e293b',
              }}
            >
              {Math.min(progress, 100).toFixed(0)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={Math.min(progress, 100)}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(241, 245, 249, 0.8)',
              border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(226, 232, 240, 0.8)'}`,
              '& .MuiLinearProgress-bar': {
                bgcolor: profitLoss.isProfit ? theme.palette.success.main : theme.palette.error.main,
                borderRadius: 4,
                transition: 'transform 0.4s linear',
              },
            }}
          />
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography 
              variant="body2" 
              sx={{ 
                fontSize: { xs: '0.85rem', sm: '0.9rem' }, 
                fontWeight: 500,
                color: (theme) => theme.palette.mode === 'dark' ? '#94a3b8' : '#64748b',
              }}
            >
              Số tiền ban đầu
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                fontSize: { xs: '0.9rem', sm: '1rem' }, 
                mt: 0.5,
                fontWeight: 600,
                color: (theme) => theme.palette.mode === 'dark' ? '#e2e8f0' : '#1e293b',
              }}
            >
              {formatCurrency(investment.initialAmount)}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography 
              variant="body2" 
              sx={{ 
                fontSize: { xs: '0.85rem', sm: '0.9rem' }, 
                fontWeight: 500,
                color: (theme) => theme.palette.mode === 'dark' ? '#94a3b8' : '#64748b',
              }}
            >
              Giá trị hiện tại
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                fontSize: { xs: '0.9rem', sm: '1rem' }, 
                mt: 0.5,
                fontWeight: 600,
                color: (theme) => theme.palette.mode === 'dark' ? '#e2e8f0' : '#1e293b',
              }}
            >
              {formatCurrency(investment.currentAmount)}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography 
              variant="body2" 
              sx={{ 
                fontSize: { xs: '0.85rem', sm: '0.9rem' }, 
                fontWeight: 500,
                color: (theme) => theme.palette.mode === 'dark' ? '#94a3b8' : '#64748b',
              }}
            >
              Lợi nhuận/Lỗ
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: profitLoss.isProfit ? theme.palette.success.main : theme.palette.error.main,
                fontSize: { xs: '0.9rem', sm: '1rem' },
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 0.5, sm: 1 },
                mt: 0.5,
                flexWrap: 'wrap',
                fontWeight: 600,
              }}
            >
              {profitLoss.isProfit ? (
                <ArrowUpward fontSize="small" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }} />
              ) : (
                <ArrowDownward fontSize="small" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }} />
              )}
              <span>{profitLoss.isProfit ? '+' : '-'}{formatCurrency(Math.abs(profitLoss.amount))}</span>
              <Typography
                component="span"
                sx={{
                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                  bgcolor: alpha(
                    profitLoss.isProfit ? theme.palette.success.main : theme.palette.error.main,
                    0.15
                  ),
                  px: 0.75,
                  py: 0.25,
                  borderRadius: '6px',
                  fontWeight: 600,
                  ml: { xs: 0, sm: 0.5 },
                  mt: { xs: 0.5, sm: 0 },
                  border: `1px solid ${alpha(
                    profitLoss.isProfit ? theme.palette.success.main : theme.palette.error.main,
                    0.2
                  )}`,
                }}
              >
                {profitLoss.isProfit ? '+' : '-'}{Math.abs(parseFloat(profitLoss.percentage))}%
              </Typography>
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography 
              variant="body2" 
              sx={{ 
                fontSize: { xs: '0.85rem', sm: '0.9rem' }, 
                fontWeight: 500,
                color: (theme) => theme.palette.mode === 'dark' ? '#94a3b8' : '#64748b',
              }}
            >
              Lợi nhuận kỳ vọng
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                fontSize: { xs: '0.9rem', sm: '1rem' }, 
                mt: 0.5,
                fontWeight: 600,
                color: (theme) => theme.palette.mode === 'dark' ? '#e2e8f0' : '#1e293b',
              }}
            >
              {investment.expectedReturn}%
            </Typography>
          </Grid>
          {investment.type === 'crypto' && investment.quantity && (
            <>
              <Grid item xs={6}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontSize: { xs: '0.85rem', sm: '0.9rem' }, 
                    fontWeight: 500,
                    color: (theme) => theme.palette.mode === 'dark' ? '#94a3b8' : '#64748b',
                  }}
                >
                  Số lượng coin
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontSize: { xs: '0.9rem', sm: '1rem' }, 
                    mt: 0.5,
                    fontWeight: 600,
                    color: (theme) => theme.palette.mode === 'dark' ? '#e2e8f0' : '#1e293b',
                  }}
                >
                  {investment.quantity}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontSize: { xs: '0.85rem', sm: '0.9rem' }, 
                    fontWeight: 500,
                    color: (theme) => theme.palette.mode === 'dark' ? '#94a3b8' : '#64748b',
                  }}
                >
                  Giá mua TB
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontSize: { xs: '0.9rem', sm: '1rem' }, 
                    mt: 0.5,
                    fontWeight: 600,
                    color: (theme) => theme.palette.mode === 'dark' ? '#e2e8f0' : '#1e293b',
                  }}
                >
                  {formatCurrency((investment.initialAmount / investment.quantity) || 0)}
                </Typography>
              </Grid>
            </>
          )}
        </Grid>

        <Box sx={{ mt: 2, display: 'flex', gap: 1.5, justifyContent: 'flex-end' }}>
          <SecondaryButton
            size="small"
            onClick={() => onViewDetails(investment)}
          >
            <Visibility sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }} />
          </SecondaryButton>
          <GradientButton
            size="small"
            onClick={() => onWithdraw(investment)}
          >
            <AttachMoney sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }} />
          </GradientButton>
        </Box>
      </CardContent>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            borderRadius: '12px',
            minWidth: 200,
            p: 1,
            border: (theme) => 
              `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(226, 232, 240, 0.8)'}`,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        <MenuItem
          onClick={() => {
            onEdit(investment);
            handleMenuClose();
          }}
          sx={{
            borderRadius: '8px',
            '&:hover': {
              bgcolor: (theme) => 
                theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(241, 245, 249, 0.8)',
            },
          }}
        >
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          Chỉnh sửa
        </MenuItem>
        <Divider sx={{ my: 1 }} />
        <MenuItem
          onClick={() => {
            onDelete(investment._id);
            handleMenuClose();
          }}
          sx={{
            borderRadius: '8px',
            color: 'error.main',
            '&:hover': {
              bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
            },
          }}
        >
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          <Typography color="error">Xóa</Typography>
        </MenuItem>
      </Menu>
    </StyledCard>
  );
};

export default InvestmentCard; 