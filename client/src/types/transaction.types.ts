export interface User {
    _id: string;
    name: string;
    email: string;
}

export interface Transaction {
    _id: string;
    user: User | null;
    amount: number;
    category: string;
    type: 'income' | 'expense';
    date: string;
    description: string;
    isViolating?: boolean;
    createdAt?: string;
    updatedAt?: string;
}