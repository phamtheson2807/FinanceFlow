import { AppBar, Box, Toolbar, Typography, useTheme } from '@mui/material';
import { motion } from 'framer-motion';

const Header = () => {
  const theme = useTheme();

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        bgcolor: '#1E3A8A',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      }}
    >
      <Toolbar>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 'bold',
                color: 'white',
                flexGrow: 1,
              }}
            >
              Bảng Điều Khiển Admin
            </Typography>
          </Box>
        </motion.div>
      </Toolbar>
    </AppBar>
  );
};

export default Header;