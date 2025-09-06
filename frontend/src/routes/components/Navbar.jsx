import React from "react";
import { MagnifyingGlassIcon, PersonIcon, ChatBubbleIcon } from "@radix-ui/react-icons";
import { ShoppingCart } from "lucide-react";

export default function AstrapeHeader() {
    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-b">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <nav className="h-16 flex items-center justify-between">
                    {/* Left: Brand */}
                    <a href="/" className="flex items-center gap-2 group">
                        <svg
                            width="32"
                            height="32"
                            viewBox="0 0 32 32"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="text-blue-600 transition-transform duration-200 group-hover:scale-105"
                            aria-label="Astrape Logo"
                        >
                            <path d="M16 4L26 28H22L19.5 22H12.5L10 28H6L16 4Z" fill="currentColor" />
                            <path d="M14 16H18L16 12L14 16Z" fill="white" />
                        </svg>
                        <span className="text-lg sm:text-xl font-bold text-gray-900 tracking-wide">
                            Astrape
                        </span>
                    </a>

                    {/* Center: Search (hidden on small screens) */}
                    <div className="hidden md:flex md:flex-1 md:justify-center md:px-6">
                        <div className="flex w-full max-w-2xl items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 shadow-sm/30 hover:bg-white focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500">
                            <MagnifyingGlassIcon className="h-4 w-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search products, brands, and more"
                                className="w-full bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
                            />
                            <button
                                type="button"
                                className="inline-flex h-8 px-3 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-medium transition-colors hover:bg-blue-700"
                                aria-label="Search"
                            >
                                Search
                            </button>
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        <button
                            type="button"
                            className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 transition-all hover:shadow-md hover:border-gray-300"
                        >
                            <ChatBubbleIcon className="h-4 w-4" />
                            Reach Us
                        </button>

                        {/* Compact search button for mobile */}
                        <button
                            type="button"
                            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 hover:shadow-md"
                            aria-label="Search"
                        >
                            <MagnifyingGlassIcon className="h-5 w-5" />
                        </button>

                        {/* Cart */}
                        <button
                            type="button"
                            className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition-all hover:shadow-md"
                            aria-label="Cart"
                        >
                            <ShoppingCart className="h-5 w-5" />
                            <span className="absolute -top-1.5 -right-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white">
                                0
                            </span>
                        </button>

                        {/* Profile */}
                        <button
                            type="button"
                            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 transition-all hover:shadow-md"
                            aria-label="Profile"
                        >
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-100">
                                <PersonIcon className="h-4 w-4 text-gray-700" />
                            </span>
                            <span className="hidden sm:inline">Profile</span>
                        </button>
                    </div>
                </nav>
            </div>
        </header>
    );
}
