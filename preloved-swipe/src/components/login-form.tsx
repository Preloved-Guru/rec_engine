'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export function LoginForm() {
    const [username, setUsername] = useState('');
    const { login, isLoading } = useAuth();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim()) {
            toast({
                title: 'Error',
                description: 'Please enter a username',
                variant: 'destructive',
            });
            return;
        }

        try {
            await login(username.trim());
            toast({
                title: 'Welcome!',
                description: 'Successfully logged in.',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to log in. Please try again.',
                variant: 'destructive',
            });
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>Welcome to PreLoved Guru</CardTitle>
                <CardDescription>
                    Enter a username to start discovering preloved items
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Input
                            type="text"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Logging in...
                            </>
                        ) : (
                            'Start Exploring'
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
} 