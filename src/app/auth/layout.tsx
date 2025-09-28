import Image from "next/image";
import Link from "next/link";

import LetterGlitch from "@/components/Background/LetterGlitch";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="relative max-h-dvh min-h-screen w-full">
        <div className="absolute inset-0 z-0">
          <LetterGlitch
            glitchColors={["#2b4539", "#61dca3", "#61b3dc"]}
            glitchSpeed={100}
            centerVignette={true}
            outerVignette={true}
            smooth={true}
            characters="ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$&*()-_+=/[]{};:<>.,0123456789"
          />
        </div>
        <div className="absolute z-20 mt-5 flex w-full items-center justify-center sm:justify-start">
          <Link href="/" className="flex sm:mr-5">
            <Image
              src="/favicon.ico"
              alt="Sefro logo"
              width={30}
              height={30}
              quality={100}
              className="transition-all"
            />
            <span className="mx-3 flex items-center text-2xl font-extralight">|</span>
            <span className="flex items-center text-xl font-bold">Sefro</span>
          </Link>
        </div>
        {children}
      </div>
    </>
  );
}
