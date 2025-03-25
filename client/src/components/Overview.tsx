import {
  Box,
  Card,
  CardContent,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import { motion } from 'framer-motion';
import React from 'react';

interface User {
  _id: string;
  name: string;
  email: string;
}

interface OverviewData {
  userCount: number;
  transactionCount: number;
  newUsers: User[];
}

interface OverviewProps {
  data: OverviewData | null;
}

const Overview: React.FC<OverviewProps> = ({ data }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card sx={{ mb: 3, maxWidth: 800, margin: '0 auto' }}>
        <CardContent>
          <Typography variant="h6" align="center">Tổng quan dữ liệu</Typography>
          {data && (
            <Box>
              <Typography align="center">Số lượng người dùng: {data.userCount}</Typography>
              <Typography align="center">Số lượng giao dịch: {data.transactionCount}</Typography>
              <Typography align="center">Người dùng mới:</Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Tên</TableCell>
                      <TableCell>Email</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.newUsers.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Overview;