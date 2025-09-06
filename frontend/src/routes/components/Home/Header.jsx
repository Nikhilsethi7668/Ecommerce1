// src/components/Home/CategoryHeader.jsx
import React from "react";
import { Link } from "react-router-dom";

function slugify(s = "") {
    return s
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

export default function CategoryHeader({ categories }) {
    const data =
        categories ??
        [
            {
                id: 1,
                title: "Electronics",
                url: "https://rukminim2.flixcart.com/fk-p-flap/128/128/image/5f2ee7f883cdb774.png?q=100",
            },
            {
                id: 2,
                title: "Jewelry",
                url: "https://m.media-amazon.com/images/I/61D4Zp9WJDL._AC_UF894,1000_QL80_.jpg",
            },
            {
                id: 3,
                title: "Fashion",
                url: "https://m.media-amazon.com/images/I/61D4Zp9WJDL._AC_UF894,1000_QL80_.jpg",
            },
            {
                id: 4,
                title: "Home & Garden",
                url: "https://m.media-amazon.com/images/I/61D4Zp9WJDL._AC_UF894,1000_QL80_.jpg",
            },
            {
                id: 5,
                title: "Sports",
                url: "https://m.media-amazon.com/images/I/61D4Zp9WJDL._AC_UF894,1000_QL80_.jpg",
            },
            {
                id: 6,
                title: "Books",
                url: "https://m.media-amazon.com/images/I/61D4Zp9WJDL._AC_UF894,1000_QL80_.jpg",
            },
            {
                id: 7,
                title: "Beauty",
                url: "https://m.media-amazon.com/images/I/61D4Zp9WJDL._AC_UF894,1000_QL80_.jpg",
            },
        ];

    return (
        <section className="w-full bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-100">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
                {/* Mobile: snap-scroll row */}
                <div className="md:hidden -mx-4 px-4 overflow-x-auto scroll-smooth snap-x snap-mandatory flex gap-3">
                    {data.map((item, idx) => {
                        const slug = slugify(item.title);
                        return (
                            <Link
                                to={`/category/${slug}`}
                                key={`${item.id}-${slug}-${idx}`}
                                className="group snap-start shrink-0 w-28 flex flex-col items-center rounded-xl bg-white/80 backdrop-blur-sm p-3 shadow-sm transition-all duration-200 hover:shadow-lg hover:bg-white hover:-translate-y-0.5"
                                title={item.title}
                            >
                                <div className="w-16 h-16 overflow-hidden rounded-lg bg-gray-50 ring-1 ring-gray-100 flex items-center justify-center">
                                    <img
                                        src={item.url}
                                        alt={item.title}
                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                        loading="lazy"
                                    />
                                </div>
                                <span className="mt-1 text-xs font-medium text-gray-700 group-hover:text-blue-600 text-center line-clamp-1">
                                    {item.title}
                                </span>
                            </Link>
                        );
                    })}
                </div>

                {/* Desktop: tidy grid */}
                <div className="hidden md:grid grid-cols-5 lg:grid-cols-7 gap-3">
                    {data.map((item, idx) => {
                        const slug = slugify(item.title);
                        return (
                            <Link
                                to={`/category/${slug}`}
                                key={`${item.id}-${slug}-${idx}`}
                                className="group flex flex-col items-center rounded-xl bg-white/80 backdrop-blur-sm p-3 shadow-sm transition-all duration-200 hover:shadow-lg hover:bg-white hover:-translate-y-1"
                                title={item.title}
                            >
                                <div className="w-16 h-16 lg:w-20 lg:h-20 overflow-hidden rounded-lg bg-gray-50 ring-1 ring-gray-100 flex items-center justify-center">
                                    <img
                                        src={item.url}
                                        alt={item.title}
                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                        loading="lazy"
                                    />
                                </div>
                                <span className="mt-1 text-xs sm:text-sm font-medium text-gray-700 group-hover:text-blue-600 text-center line-clamp-1">
                                    {item.title}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
