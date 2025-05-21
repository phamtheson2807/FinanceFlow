import { AccountBalance, TrendingUp } from '@mui/icons-material';
import { Box, Tab, Tabs, styled } from '@mui/material';
import React from 'react';

const StyledTabs = styled(Tabs)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' 
    ? 'linear-gradient(135deg, #1e2a38 0%, #2d3748 100%)' 
    : 'linear-gradient(135deg, #fff 0%, #f7fafc 100%)',
  borderRadius: '16px',
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 8px 16px rgba(0,0,0,0.2)' 
    : '0 4px 20px rgba(0,0,0,0.05)',
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(226, 232, 240, 0.8)'}`,
  padding: theme.spacing(1),
  '& .MuiTabs-indicator': {
    height: 4,
    borderRadius: '4px 4px 0 0',
    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
  },
  '& .MuiTab-root': {
    color: theme.palette.mode === 'dark' ? '#94a3b8' : '#64748b',
    transition: 'all 0.2s ease',
    '&:hover': {
      color: theme.palette.mode === 'dark' ? '#e2e8f0' : '#1e293b',
    },
    '&.Mui-selected': {
      color: theme.palette.primary.main,
      fontWeight: 600,
    },
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 500,
  fontSize: '1rem',
  padding: theme.spacing(2),
  borderRadius: '12px',
  minHeight: 'unset',
  '& .MuiSvgIcon-root': {
    marginBottom: '4px',
    marginRight: '8px',
    transition: 'all 0.2s ease',
  },
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' 
      ? 'rgba(255,255,255,0.05)' 
      : 'rgba(241, 245, 249, 0.8)',
    transform: 'translateY(-2px)',
    '& .MuiSvgIcon-root': {
      transform: 'scale(1.1)',
    },
  },
  '&.Mui-selected': {
    backgroundColor: theme.palette.mode === 'dark' 
      ? 'rgba(219, 234, 254, 0.1)' 
      : 'rgba(219, 234, 254, 0.5)',
    border: `1px solid ${theme.palette.mode === 'dark' 
      ? 'rgba(37, 99, 235, 0.2)' 
      : 'rgba(37, 99, 235, 0.1)'}`,
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.9rem',
    padding: theme.spacing(1.5),
    '& .MuiSvgIcon-root': {
      fontSize: '1.2rem',
    }
  }
}));

interface InvestmentTabsProps {
  activeTab: number;
  onTabChange: (event: React.SyntheticEvent, newValue: number) => void;
}

const InvestmentTabs: React.FC<InvestmentTabsProps> = ({ activeTab, onTabChange }) => {
  // const theme = useTheme(); // Removed unused theme variable

  return (
    <Box mb={3} sx={{ width: '100%' }}>
      <StyledTabs
        value={activeTab}
        onChange={onTabChange}
        variant="fullWidth"
        aria-label="Tabs quản lý đầu tư"
      >
        <StyledTab
          icon={<AccountBalance sx={{ fontSize: { xs: '1.2rem', sm: '1.4rem' } }} />}
          iconPosition="start"
          label="Danh mục đầu tư"
          id="investment-tab-0"
          aria-controls="investment-tabpanel-0"
        />
        <StyledTab
          icon={<TrendingUp sx={{ fontSize: { xs: '1.2rem', sm: '1.4rem' } }} />}
          iconPosition="start"
          label="Phân tích"
          id="investment-tab-1"
          aria-controls="investment-tabpanel-1"
        />
      </StyledTabs>
    </Box>
  );
};

export default InvestmentTabs; 