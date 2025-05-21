import {
    AccountBalance,
    Add,
    MoreVert,
    SearchOutlined,
    TrendingUp,
} from '@mui/icons-material';
import {
    Box,
    Button,
    Card,
    FormControl,
    Grid,
    IconButton,
    InputBase,
    InputLabel,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Paper,
    Select,
    SelectChangeEvent,
    styled,
    Tooltip,
    Typography
} from '@mui/material';
import React, { useState } from 'react';

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  background: theme.palette.mode === 'dark' 
    ? 'linear-gradient(135deg, #1e2a38 0%, #2d3748 100%)' 
    : 'linear-gradient(135deg, #fff 0%, #f7fafc 100%)',
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 8px 16px rgba(0,0,0,0.2)' 
    : '0 4px 20px rgba(0,0,0,0.05)',
  padding: theme.spacing(2.5),
  marginBottom: theme.spacing(2),
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(226, 232, 240, 0.8)'}`,
}));

const GradientButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  padding: '10px 24px',
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.95rem',
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
  boxShadow: '0 4px 10px rgba(0, 118, 255, 0.15)',
  color: '#fff',
  border: '1px solid rgba(37, 99, 235, 0.1)',
  '&:hover': {
    boxShadow: '0 6px 14px rgba(0, 118, 255, 0.2)',
    background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
    transform: 'translateY(-2px)',
  },
}));

const SearchWrapper = styled(Paper)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  borderRadius: '12px',
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(1),
  marginRight: theme.spacing(2),
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(241, 245, 249, 0.8)',
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(226, 232, 240, 0.8)'}`,
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(226, 232, 240, 0.8)',
    transform: 'translateY(-2px)',
  },
}));

// Define investment type interface
export interface InvestmentType {
  value: string;
  label: string;
  color: string;
  icon: React.ReactNode;
}

interface InvestmentHeaderProps {
  onAddInvestment: () => void;
  filterType: string;
  onFilterChange: (type: string) => void;
  sortOption: string;
  onSortChange: (sort: string) => void;
  onSearch?: (term: string) => void;
  investmentTypes: InvestmentType[];
}

const InvestmentHeader: React.FC<InvestmentHeaderProps> = ({
  onAddInvestment,
  filterType,
  onFilterChange,
  sortOption,
  onSortChange,
  onSearch,
  investmentTypes
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleFilterChange = (event: SelectChangeEvent) => {
    onFilterChange(event.target.value);
  };

  const handleSortChange = (event: SelectChangeEvent) => {
    onSortChange(event.target.value);
  };

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchTerm);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(searchTerm);
    }
  };

  return (
    <StyledCard>
      <Grid container spacing={2}>
        <Grid item xs={12} md={5} lg={6}>
          <Box>
            <Typography 
              variant="h4" 
              fontWeight="bold" 
              sx={{ 
                mb: 1, 
                fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem' },
                background: `linear-gradient(45deg, #2563eb, #3b82f6)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.02em',
              }}
            >
              Quản Lý Đầu Tư
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                fontSize: { xs: '0.9rem', sm: '0.95rem' },
                color: (theme) => theme.palette.mode === 'dark' ? '#94a3b8' : '#64748b',
                fontWeight: 500,
              }}
            >
              Theo dõi và quản lý danh mục đầu tư của bạn một cách dễ dàng
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={7} lg={6}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' }, 
            gap: { xs: 1.5, sm: 1.5 }, 
            justifyContent: { sm: 'flex-end' },
            alignItems: { xs: 'stretch', sm: 'center' },
            height: '100%',
            mt: { xs: 2, md: 0 }
          }}>
            {onSearch && (
              <SearchWrapper sx={{ maxWidth: { xs: '100%', sm: '100%', md: 200 } }}>
                <InputBase
                  placeholder="Tìm kiếm đầu tư..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  fullWidth
                  sx={{ 
                    fontSize: '0.95rem',
                    color: (theme) => theme.palette.mode === 'dark' ? '#e2e8f0' : '#334155',
                  }}
                />
                <IconButton 
                  type="button" 
                  onClick={handleSearch}
                  sx={{
                    color: (theme) => theme.palette.mode === 'dark' ? '#94a3b8' : '#64748b',
                  }}
                >
                  <SearchOutlined />
                </IconButton>
              </SearchWrapper>
            )}
            
            <Box sx={{ 
              display: 'flex', 
              gap: { xs: 2, sm: 2 }, 
              flexDirection: { xs: 'column', sm: 'row' },
              width: '100%',
              flexWrap: { xs: 'nowrap', sm: 'wrap', md: 'nowrap' }
            }}>
              <FormControl 
                size="small" 
                sx={{ 
                  minWidth: { xs: '100%', sm: 140 },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: (theme) => 
                      theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(241, 245, 249, 0.8)',
                    border: (theme) => 
                      `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(226, 232, 240, 0.8)'}`,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: (theme) => 
                        theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(226, 232, 240, 0.8)',
                      transform: 'translateY(-2px)',
                    },
                  },
                }}
              >
                <InputLabel sx={{ 
                  fontSize: '0.95rem',
                  color: (theme) => theme.palette.mode === 'dark' ? '#94a3b8' : '#64748b',
                }}>
                  Loại đầu tư
                </InputLabel>
                <Select
                  value={filterType}
                  onChange={handleFilterChange}
                  label="Loại đầu tư"
                  sx={{ '& .MuiSelect-select': { fontSize: '0.95rem' } }}
                >
                  <MenuItem value="all" sx={{ fontSize: '0.95rem' }}>Tất cả</MenuItem>
                  {investmentTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value} sx={{ fontSize: '0.95rem' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ color: type.color }}>{type.icon}</Box>
                        {type.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl 
                size="small" 
                sx={{ 
                  minWidth: { xs: '100%', sm: 140 },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: (theme) => 
                      theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(241, 245, 249, 0.8)',
                    border: (theme) => 
                      `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(226, 232, 240, 0.8)'}`,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: (theme) => 
                        theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(226, 232, 240, 0.8)',
                      transform: 'translateY(-2px)',
                    },
                  },
                }}
              >
                <InputLabel sx={{ 
                  fontSize: '0.95rem',
                  color: (theme) => theme.palette.mode === 'dark' ? '#94a3b8' : '#64748b',
                }}>
                  Sắp xếp
                </InputLabel>
                <Select
                  value={sortOption}
                  onChange={handleSortChange}
                  label="Sắp xếp"
                  sx={{ '& .MuiSelect-select': { fontSize: '0.95rem' } }}
                >
                  <MenuItem value="profitDesc" sx={{ fontSize: '0.95rem' }}>Lợi nhuận (cao → thấp)</MenuItem>
                  <MenuItem value="profitAsc" sx={{ fontSize: '0.95rem' }}>Lợi nhuận (thấp → cao)</MenuItem>
                  <MenuItem value="amountDesc" sx={{ fontSize: '0.95rem' }}>Giá trị (cao → thấp)</MenuItem>
                  <MenuItem value="amountAsc" sx={{ fontSize: '0.95rem' }}>Giá trị (thấp → cao)</MenuItem>
                  <MenuItem value="nameAsc" sx={{ fontSize: '0.95rem' }}>Tên (A → Z)</MenuItem>
                  <MenuItem value="nameDesc" sx={{ fontSize: '0.95rem' }}>Tên (Z → A)</MenuItem>
                </Select>
              </FormControl>
              
              <Tooltip title="Thêm khoản đầu tư mới" arrow>
                <GradientButton 
                  startIcon={<Add />} 
                  onClick={onAddInvestment}
                  sx={{ 
                    whiteSpace: 'nowrap',
                    flex: { xs: '1', sm: '0 0 auto' } 
                  }}
                >
                  Thêm đầu tư
                </GradientButton>
              </Tooltip>
              
              <Tooltip title="Tùy chọn khác" arrow>
                <IconButton 
                  onClick={handleMenuOpen}
                  sx={{ 
                    borderRadius: '12px', 
                    backgroundColor: (theme) => 
                      theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(241, 245, 249, 0.8)',
                    border: (theme) => 
                      `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(226, 232, 240, 0.8)'}`,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: (theme) => 
                        theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(226, 232, 240, 0.8)',
                      transform: 'translateY(-2px)',
                    },
                    display: { xs: 'flex', sm: 'none' }
                  }}
                >
                  <MoreVert />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Grid>
      </Grid>
      
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
        <MenuItem onClick={onAddInvestment}>
          <ListItemIcon>
            <Add fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Thêm đầu tư mới" />
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <TrendingUp fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Biểu đồ phân tích" />
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <AccountBalance fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Xem giao dịch" />
        </MenuItem>
      </Menu>
    </StyledCard>
  );
};

export default InvestmentHeader; 