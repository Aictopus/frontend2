"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const HomePage = () => {
    const [tab, setTab] = useState('UI');
    const [inputValue, setInputValue] = useState('');
    const router = useRouter();

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            localStorage.setItem('userMessage', inputValue);
            router.push('/chat');
        }
    };

    return (
        <div className="container mx-auto px-4">
            {/* <header className="flex justify-between items-center py-6">
                <div className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary-foreground text-transparent bg-clip-text">AIctopus</div>
                <nav className="flex items-center space-x-4">
                    <Link href="#" className="text-gray-600 hover:text-gray-900">Explore</Link>
                    <Link href="#" className="text-gray-600 hover:text-gray-900">Feedback</Link>
                    <Avatar>
                        <AvatarImage src="/path/to/avatar.jpg" alt="User Avatar" />
                        <AvatarFallback>UN</AvatarFallback>
                    </Avatar>
                </nav>
            </header> */}

            <main className="mt-20">
                <h1 className="text-6xl font-bold bg-gradient-to-r from-primary to-secondary-foreground text-transparent bg-clip-text text-center mb-4">Idea, Explore, Choose</h1>
                <p className="text-xl text-center text-gray-600 mb-8">Less operations, more creative. Lets make UI design easier!</p>

                <div className="max-w-2xl mx-auto mb-12">
                    <Tabs value={tab} onValueChange={setTab} className="mb-4">
                        <TabsList>
                            <TabsTrigger value="UI">Full UI</TabsTrigger>
                            <TabsTrigger value="Asset">Asset</TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <Input
                        type="text"
                        placeholder="Tell me what you want to build..."
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        className="w-full"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((item) => (
                        <Card key={item}>
                            <CardHeader>
                                <Avatar>
                                    <AvatarImage src={`/path/to/avatar${item}.jpg`} alt="User Avatar" />
                                    <AvatarFallback>U{item}</AvatarFallback>
                                </Avatar>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600 mb-4">
                                    Prompt: This is a component that allows user hover and click
                                    in to change the colors.
                                </p>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <Button variant="outline">Figma</Button>
                                <Button>Code</Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </main>

            <Link href="/app" className="fixed bottom-8 right-8">
                <Button size="lg" className="rounded-full">
                    Start Creating
                </Button>
            </Link>
        </div>
    );
};

export default HomePage;