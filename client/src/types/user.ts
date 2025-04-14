export interface User {
    _id: string;
    name?: string;
    email?: string;
    role: 'user' | 'admin'; // Sử dụng literal type thay vì string
    isLocked: boolean;
  }