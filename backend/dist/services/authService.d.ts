import { User } from '../models/types';
export declare const registerUser: (email: string, password: string, name: string) => Promise<User>;
export declare const loginUser: (email: string, password: string) => Promise<{
    user: User;
    token: string;
}>;
export declare const getUserById: (id: string) => Promise<User | null>;
export declare const syncOAuthUser: (email: string, name: string, supabaseId: string) => Promise<{
    user: User;
    token: string;
}>;
//# sourceMappingURL=authService.d.ts.map