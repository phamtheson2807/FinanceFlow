import { TrendingUp } from '@mui/icons-material';
import { Box, Card, Grid, styled, Typography } from '@mui/material';
import React from 'react';
import InvestmentCard, { Investment } from './InvestmentCard';

const EmptyStateCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(8),
  borderRadius: '16px',
  textAlign: 'center',
  background: theme.palette.mode === 'dark' 
    ? 'linear-gradient(135deg, #1e2a38 0%, #2d3748 100%)' 
    : 'linear-gradient(135deg, #fff 0%, #f7fafc 100%)',
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 8px 16px rgba(0,0,0,0.2)' 
    : '0 4px 20px rgba(0,0,0,0.05)',
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(226, 232, 240, 0.8)'}`,
  width: '100%',
  maxWidth: 600,
  margin: '0 auto',
}));

interface InvestmentListProps {
  investments: Investment[];
  filteredInvestments: Investment[];
  filterType: string;
  onViewDetails: (investment: Investment) => void;
  onWithdraw: (investment: Investment) => void;
  onEdit: (investment: Investment) => void;
  onDelete: (id: string) => void;
  onAddInvestment: () => void;
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

const InvestmentList: React.FC<InvestmentListProps> = ({
  investments,
  filteredInvestments,
  filterType,
  onViewDetails,
  onWithdraw,
  onEdit,
  onDelete,
  onAddInvestment,
  formatCurrency,
  calculateProfitLoss,
  getTypeDetails
}) => {
  if (investments.length === 0) {
    return (
      <EmptyStateCard>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: (theme) => `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
              color: 'white',
              mb: 2,
              boxShadow: '0 8px 16px rgba(37, 99, 235, 0.2)',
              border: '4px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <TrendingUp sx={{ fontSize: 36 }} />
          </Box>
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 2, 
              fontSize: '1.25rem',
              fontWeight: 600,
              color: (theme) => theme.palette.mode === 'dark' ? '#e2e8f0' : '#1e293b',
            }}
          >
            Chưa có khoản đầu tư nào
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              mb: 3, 
              fontSize: '0.95rem',
              color: (theme) => theme.palette.mode === 'dark' ? '#94a3b8' : '#64748b',
              maxWidth: '80%',
              textAlign: 'center',
              lineHeight: 1.6,
            }}
          >
            Hãy thêm khoản đầu tư mới để bắt đầu theo dõi!
          </Typography>
          <Box
            component="button"
            onClick={onAddInvestment}
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              border: '1px solid rgba(37, 99, 235, 0.1)',
              borderRadius: '12px',
              px: 4,
              py: 1.5,
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: (theme) => `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
              boxShadow: '0 4px 10px rgba(37, 99, 235, 0.15)',
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 14px rgba(37, 99, 235, 0.2)',
              },
            }}
          >
            Thêm đầu tư mới
          </Box>
        </Box>
      </EmptyStateCard>
    );
  }

  if (filterType !== 'all' && filteredInvestments.length === 0) {
    return (
      <EmptyStateCard>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: (theme) => `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
              color: 'white',
              mb: 2,
              boxShadow: '0 8px 16px rgba(37, 99, 235, 0.2)',
              border: '4px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <TrendingUp sx={{ fontSize: 36 }} />
          </Box>
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 2, 
              fontSize: '1.25rem',
              fontWeight: 600,
              color: (theme) => theme.palette.mode === 'dark' ? '#e2e8f0' : '#1e293b',
            }}
          >
            Không tìm thấy khoản đầu tư nào
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              mb: 3, 
              fontSize: '0.95rem',
              color: (theme) => theme.palette.mode === 'dark' ? '#94a3b8' : '#64748b',
              maxWidth: '80%',
              textAlign: 'center',
              lineHeight: 1.6,
            }}
          >
            Không có khoản đầu tư nào thuộc loại {getTypeDetails(filterType).label}
          </Typography>
        </Box>
      </EmptyStateCard>
    );
  }

  return (
    <Grid container spacing={2}>
      {filteredInvestments.map((investment) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={investment._id}>
          <InvestmentCard
            investment={investment}
            onViewDetails={onViewDetails}
            onWithdraw={onWithdraw}
            onEdit={onEdit}
            onDelete={onDelete}
            formatCurrency={formatCurrency}
            calculateProfitLoss={calculateProfitLoss}
            getTypeDetails={getTypeDetails}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default InvestmentList; 