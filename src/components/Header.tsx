"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/16/solid";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const Header = () => {
  return (
    <header className="fixed top-5 z-10 mx-auto mt-5 flex w-full max-w-11/12 items-center justify-start rounded-[12px] border border-gray-100 bg-gray-100/25 p-3 text-xs text-gray-100 backdrop-blur-xl sm:max-w-10/12 md:text-base">
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
      <HeaderActions />
    </header>
  );
};

export default Header;

const navList = [
  {
    name: "ارز های دیجیتال",
    href: "/coins",
  },
  {
    name: "مشاور هوشمند",
    href: "/smart-advisor",
  },
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

const HeaderActions = () => {
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
      <SearchBar />
    </div>
  );
};

const SearchBar = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  return (
    <div className="relative flex items-center gap-2 rounded-lg bg-gray-900 p-2 text-black sm:py-1">
      {isSearchOpen && (
        <div className="absolute top-[180%] -left-2/7 w-72 overflow-hidden rounded-md border border-gray-100 bg-gray-900 p-2 text-white!">
          <input
            type="text"
            className="text-sm focus:outline-none sm:text-base"
            placeholder="ارز خود را وارد کنید"
          />
        </div>
      )}
      <MagnifyingGlassIcon
        className="size-6 cursor-pointer text-white md:size-7"
        onClick={() => setIsSearchOpen(!isSearchOpen)}
      />
    </div>
  );
};
