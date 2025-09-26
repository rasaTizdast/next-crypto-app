"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/16/solid";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const Header = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Keyboard shortcut (Ctrl+K / Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K on Windows/Linux or Cmd+K on Mac
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault(); // prevent browser search
        setIsSearchOpen((prev) => !prev);
      }
      // Escape to close
      if (e.key === "Escape") {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      {/* HEADER */}
      <header className="fixed top-5 z-20 mx-auto flex w-full max-w-11/12 items-center justify-start rounded-[12px] border border-gray-100 bg-gray-100/25 p-3 text-xs text-gray-100 backdrop-blur-xl sm:max-w-10/12 md:text-base">
        <Link href="/" className="mr-2 transition duration-300 hover:invert">
          <Image
            src="/favicon.ico"
            alt="Sefro logo"
            width={30}
            height={30}
            quality={100}
            className="transition-all"
          />
        </Link>

        <span className="mx-5 hidden items-center text-2xl font-extralight sm:flex">|</span>
        <NavUl />
        <HeaderActions onSearchToggle={() => setIsSearchOpen(true)} />
      </header>

      {/* SEARCH MODAL */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Blur background */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsSearchOpen(false)}
          />

          {/* Search box */}
          <div className="relative z-10 w-11/12 max-w-md rounded-lg border border-gray-700 bg-gray-900 p-4 text-white shadow-lg">
            <input
              autoFocus
              type="text"
              placeholder="نام ارز خود را وارد کنید"
              className="w-full rounded-md bg-gray-800 p-2 text-sm focus:outline-none sm:text-base"
            />
            <div className="mt-3">
              {/* Example results */}
              <ul className="space-y-2">
                <li className="cursor-pointer rounded p-2 hover:bg-gray-800">بیت‌کوین</li>
                <li className="cursor-pointer rounded p-2 hover:bg-gray-800">اتریوم</li>
                <li className="cursor-pointer rounded p-2 hover:bg-gray-800">دوج‌کوین</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;

const navList = [
  { name: "ارز های دیجیتال", href: "/coins" },
  { name: "مشاور هوشمند", href: "/smart-advisor" },
];

const NavUl = () => {
  return (
    <ul className="hidden list-none gap-3 sm:flex md:gap-5 lg:gap-10">
      {navList.map((item) => (
        <li
          key={item.href}
          className="cursor-pointer font-semibold transition-all hover:text-blue-300"
        >
          <Link href={item.href}>{item.name}</Link>
        </li>
      ))}
    </ul>
  );
};

const HeaderActions = ({ onSearchToggle }: { onSearchToggle: () => void }) => {
  return (
    <div className="mr-auto flex gap-3">
      {true && (
        <Link
          href="/auth"
          className="flex cursor-pointer items-center rounded-lg bg-gray-900 px-4 py-1 text-xs font-semibold text-white transition-all hover:bg-neutral-950 md:text-sm"
        >
          ورود / ثبت نام
        </Link>
      )}
      <span className="mx-0.5 flex items-center text-2xl font-extralight">|</span>
      <MagnifyingGlassIcon
        className="size-6 cursor-pointer text-white md:size-7"
        onClick={onSearchToggle}
      />
    </div>
  );
};
