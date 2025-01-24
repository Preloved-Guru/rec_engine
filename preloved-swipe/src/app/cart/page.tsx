'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CartPage() {
    return (
        <div className="min-h-screen p-4">
            <header className="flex items-center gap-4 mb-8">
                <Link href="/">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold">Your Liked Items</h1>
            </header>

            <main>
                <Card className="mb-4">
                    <CardContent className="p-6">
                        <p className="text-muted-foreground text-center">
                            This is a placeholder cart page. In a real application, this would show
                            your liked items persisted in a database or local storage.
                        </p>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
} 