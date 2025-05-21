import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
  styled,
  useTheme
} from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { Investment } from './InvestmentCard';
import { InvestmentType } from './InvestmentHeader';

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

interface FormData {
  name: string;
  type: string;
  initialAmount: string;
  expectedReturn: string;
  startDate: string;
  endDate: string;
  notes: string;
  status: 'active' | 'completed' | 'cancelled';
  quantity: string;
}

interface FormErrors {
  name: string;
  type: string;
  initialAmount: string;
  quantity: string;
}

interface InvestmentFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
  selectedInvestment: Investment | null;
  investmentTypes: InvestmentType[];
  isLoading: boolean;
}

const InvestmentForm: React.FC<InvestmentFormProps> = ({
  open,
  onClose,
  onSubmit,
  selectedInvestment,
  investmentTypes,
  isLoading
}) => {
  const theme = useTheme();
  
  const initialFormState: FormData = useMemo(() => ({
    name: '',
    type: '',
    initialAmount: '',
    expectedReturn: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    notes: '',
    status: 'active',
    quantity: '',
  }), []);

  const [formData, setFormData] = useState<FormData>(initialFormState);
  const [formErrors, setFormErrors] = useState<FormErrors>({
    name: '',
    type: '',
    initialAmount: '',
    quantity: '',
  });

  useEffect(() => {
    if (selectedInvestment) {
      setFormData({
        name: selectedInvestment.name,
        type: selectedInvestment.type,
        initialAmount: selectedInvestment.initialAmount.toString(),
        expectedReturn: selectedInvestment.expectedReturn.toString(),
        startDate: selectedInvestment.startDate.split('T')[0],
        endDate: selectedInvestment.endDate ? selectedInvestment.endDate.split('T')[0] : '',
        notes: selectedInvestment.notes || '',
        status: selectedInvestment.status,
        quantity: selectedInvestment.quantity?.toString() || '',
      });
    } else {
      setFormData(initialFormState);
    }
  }, [selectedInvestment, initialFormState]);

  const validateForm = () => {
    const errors = {
      name: '',
      type: '',
      initialAmount: '',
      quantity: '',
    };
    let isValid = true;

    if (!formData.name) {
      errors.name = 'Tên đầu tư là bắt buộc';
      isValid = false;
    }
    if (!formData.type) {
      errors.type = 'Loại đầu tư là bắt buộc';
      isValid = false;
    }
    if (!formData.initialAmount || parseFloat(formData.initialAmount) <= 0) {
      errors.initialAmount = 'Số tiền ban đầu phải lớn hơn 0';
      isValid = false;
    }
    if (formData.type === 'crypto' && (!formData.quantity || parseFloat(formData.quantity) <= 0)) {
      errors.quantity = 'Số lượng coin phải lớn hơn 0';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | SelectChangeEvent<unknown>) => {
    const name = e.target.name;
    const value = e.target.value as string;

    if (name) {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
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
        <Typography 
          component="div" 
          variant="h5" 
          fontWeight="bold" 
          sx={{ 
            fontSize: '1.5rem',
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1
          }}
        >
          {selectedInvestment ? 'Chỉnh sửa đầu tư' : 'Thêm đầu tư mới'}
        </Typography>
        <Divider sx={{ mt: 2 }} />
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <TextField
              label="Tên đầu tư"
              fullWidth
              name="name"
              value={formData.name}
              onChange={handleChange}
              variant="outlined"
              error={!!formErrors.name}
              helperText={formErrors.name}
              sx={{ 
                '& .MuiInputBase-root': { 
                  fontSize: '0.95rem',
                  borderRadius: '10px'
                } 
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!formErrors.type}>
              <InputLabel sx={{ fontSize: '0.95rem' }}>Loại đầu tư</InputLabel>
              <Select
                name="type"
                value={formData.type}
                onChange={handleChange}
                label="Loại đầu tư"
                sx={{ 
                  '& .MuiSelect-select': { 
                    fontSize: '0.95rem' 
                  },
                  borderRadius: '10px'
                }}
              >
                {investmentTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value} sx={{ fontSize: '0.95rem' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ color: type.color }}>{type.icon}</Box>
                      {type.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              {formErrors.type && <Typography color="error" sx={{ fontSize: '0.75rem', mt: 0.5 }}>{formErrors.type}</Typography>}
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel sx={{ fontSize: '0.95rem' }}>Trạng thái</InputLabel>
              <Select
                name="status"
                value={formData.status}
                onChange={handleChange}
                label="Trạng thái"
                sx={{ 
                  '& .MuiSelect-select': { fontSize: '0.95rem' },
                  borderRadius: '10px'
                }}
              >
                <MenuItem value="active" sx={{ fontSize: '0.95rem' }}>Đang hoạt động</MenuItem>
                <MenuItem value="completed" sx={{ fontSize: '0.95rem' }}>Đã hoàn thành</MenuItem>
                <MenuItem value="cancelled" sx={{ fontSize: '0.95rem' }}>Đã hủy</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Số tiền ban đầu"
              fullWidth
              type="number"
              name="initialAmount"
              value={formData.initialAmount}
              onChange={handleChange}
              variant="outlined"
              error={!!formErrors.initialAmount}
              helperText={formErrors.initialAmount}
              InputProps={{
                startAdornment: <InputAdornment position="start">₫</InputAdornment>,
              }}
              sx={{ 
                '& .MuiInputBase-root': { 
                  fontSize: '0.95rem',
                  borderRadius: '10px' 
                } 
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Lợi nhuận kỳ vọng (%)"
              fullWidth
              type="number"
              name="expectedReturn"
              value={formData.expectedReturn}
              onChange={handleChange}
              variant="outlined"
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
              sx={{ 
                '& .MuiInputBase-root': { 
                  fontSize: '0.95rem',
                  borderRadius: '10px'
                } 
              }}
            />
          </Grid>
          {formData.type === 'crypto' && (
            <Grid item xs={12}>
              <TextField
                label="Số lượng coin"
                fullWidth
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                variant="outlined"
                error={!!formErrors.quantity}
                helperText={formErrors.quantity}
                sx={{ 
                  '& .MuiInputBase-root': { 
                    fontSize: '0.95rem',
                    borderRadius: '10px'
                  } 
                }}
              />
            </Grid>
          )}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Ngày bắt đầu"
              fullWidth
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              sx={{ 
                '& .MuiInputBase-root': { 
                  fontSize: '0.95rem',
                  borderRadius: '10px'
                } 
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Ngày kết thúc (tùy chọn)"
              fullWidth
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              sx={{ 
                '& .MuiInputBase-root': { 
                  fontSize: '0.95rem',
                  borderRadius: '10px'
                } 
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Ghi chú (tùy chọn)"
              fullWidth
              multiline
              rows={3}
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              variant="outlined"
              sx={{ 
                '& .MuiInputBase-root': { 
                  fontSize: '0.95rem',
                  borderRadius: '10px'
                } 
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 2 }}>
        <SecondaryButton onClick={onClose}>Hủy</SecondaryButton>
        <GradientButton onClick={handleSubmit} disabled={isLoading}>
          {selectedInvestment ? 'Cập nhật' : 'Thêm mới'}
        </GradientButton>
      </DialogActions>
    </Dialog>
  );
};

export default InvestmentForm; 