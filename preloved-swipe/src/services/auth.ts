import axios from 'axios';

const GORSE_API = 'http://localhost:8088';

export interface User {
    id: string;
    name: string;
    preferences?: {
        style?: string[];
        priceRange?: string;
        categories?: string[];
    };
}

export interface LoginResponse {
    user: User;
    initialItems: Array<{
        id: string;
        score: number;
    }>;
}

/**
 * Mock authentication service that creates/gets users in Gorse
 */
export class AuthService {
    private static instance: AuthService;
    private currentUser: User | null = null;

    private constructor() { }

    public static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    /**
     * Mock login that creates/gets user in Gorse and returns initial items
     */
    public async login(username: string): Promise<LoginResponse> {
        try {
            // Create/update user in Gorse
            const userData = {
                UserId: username,
                Labels: ['new_user'],
                Subscribe: [],
                Comment: JSON.stringify({
                    name: username,
                    createdAt: new Date().toISOString()
                })
            };

            await axios.post(`${GORSE_API}/api/user`, userData);

            // Get initial items to show (popular items for new users)
            const itemsResponse = await axios.get(`${GORSE_API}/api/popular`, {
                params: {
                    n: 20  // Get 20 popular items to start
                }
            });

            // Create user object
            this.currentUser = {
                id: username,
                name: username
            };

            return {
                user: this.currentUser,
                initialItems: itemsResponse.data
            };
        } catch (error) {
            console.error('Login failed:', error);
            throw new Error('Login failed');
        }
    }

    /**
     * Get the currently logged in user
     */
    public getCurrentUser(): User | null {
        return this.currentUser;
    }

    /**
     * Mock logout
     */
    public logout(): void {
        this.currentUser = null;
    }
}

export default AuthService.getInstance(); 