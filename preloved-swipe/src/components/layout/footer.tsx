'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { FaLinkedin, FaTiktok } from "react-icons/fa6";
import logo from '/public/logo_white.png';

export default function Footer() {
    return (
        <footer className="bottom-0 left-0 right-0 h-auto bg-primary flex items-center justify-center py-8">
            <div className="w-full max-w-7xl mx-auto px-4 flex flex-col md:flex-row md:justify-between items-center gap-8">
                {/* Logo and Policies */}
                <div className="flex flex-col items-center md:items-start space-y-4">
                    <div className="w-20 sm:w-32 md:w-40 lg:w-52 xl:w-56">
                        <Image
                            src={logo}
                            alt="Preloved Guru"
                            priority
                            style={{ objectFit: 'cover' }}
                        />
                    </div>
                    <div className="flex space-x-4 text-sm text-gray-300">
                        <Link
                            href="/privacy-policy"
                            className="hover:text-gray-100 transition-colors"
                        >
                            Privacy Policy
                        </Link>
                        <span className="hidden md:block text-gray-300">|</span>
                        <Link
                            href="/cookies"
                            className="hover:text-gray-100 transition-colors"
                        >
                            Cookie Policy
                        </Link>
                    </div>
                </div>

                {/* Waitlist and Socials */}
                <div className="flex flex-col items-center md:items-end space-y-4">
                    <div className="text-center md:text-right">
                        <h3 className="text-white text-lg font-semibold">Join the Waitlist</h3>
                        <Link href="/wishlist" className="block transform transition-transform hover:scale-[1.02] active:scale-[0.98] animate-in fade-in slide-in-from-bottom duration-700 delay-300">
                            <Button
                                size="sm"
                                className="font-bold bg-black p-6 mt-2 hover:bg-neutral-800"
                            >
                                Take our Quiz!
                            </Button>
                        </Link>
                    </div>
                    <div className="text-center md:text-right">
                        <h3 className="text-white text-lg font-semibold">Follow Us</h3>
                        <div className="flex justify-center md:justify-end space-x-4 mt-2">
                            <a
                                href="https://www.linkedin.com/company/preloved-guru/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-300 hover:text-blue-500 transition-colors"
                                aria-label="LinkedIn"
                            >
                                <FaLinkedin className="w-6 h-6" />
                            </a>
                            <a
                                href="https://www.tiktok.com/@preloved.guru"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-300 hover:text-pink-500 transition-colors"
                                aria-label="TikTok"
                            >
                                <FaTiktok className="w-6 h-6" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
} 