"use client";

import Link from "next/link";

import AnimateContent from "@/components/AnimateContent";
import Dither from "@/components/Background/DitherBackground";
import DotGrid from "@/components/Background/DotGrid";
import GlareHoverButton from "@/components/GlareHover";
import SectionNavigation from "@/components/SectionNavigation";
import { useSectionScroll } from "@/hooks/useSectionScroll";

export default function Home() {
  const { currentSection, registerSection, goToSection } = useSectionScroll({
    threshold: 0.6,
    debounceMs: 150,
  });
  return (
    <>
      {/* Section Navigation */}
      <SectionNavigation
        totalSections={2}
        currentSection={currentSection}
        onSectionClick={goToSection}
      />

      {/* Section 1: AI Assistant */}
      <section
        ref={(el) => registerSection(el, 0)}
        className="relative flex min-h-screen w-full items-center justify-center"
      >
        {/* Content Container */}
        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center justify-center gap-5 px-3">
          <AnimateContent>
            <h1 className="text-center text-3xl leading-normal font-black md:text-5xl lg:text-6xl xl:text-7xl">
              آنالیز قیمت های ارز دیجیتال و <br />
              خرید به کمک دستیار هوشمند صفرو
            </h1>
          </AnimateContent>

          <AnimateContent delay={0.2}>
            <p className="w-5/6 text-center text-gray-300 sm:text-xl lg:text-2xl xl:w-4/6">
              با استفاده از دستیار هوشمند صفرو، می‌توانید به راحتی قیمت‌های ارزهای دیجیتال را تحلیل
              کنید و بهترین زمان خرید را پیدا کنید.
            </p>
          </AnimateContent>
          <AnimateContent delay={0.4}>
            <GlareHoverButton
              height="fit-content"
              width="fit-content"
              className="mt-10"
              borderColor="#fff"
            >
              <Link href="/smart-advisor" className="px-10 py-3">
                <AnimateContent delay={0.6}>رفتن به صفحه دستیار هوشمند</AnimateContent>
              </Link>
            </GlareHoverButton>
          </AnimateContent>
        </div>

        {/* Dither Background for Section 1 - Behind content */}
        <div className="absolute inset-0 -z-10 h-full w-full">
          <Dither
            waveColor={[0.15, 0.39, 0.5]}
            disableAnimation={false}
            colorNum={40}
            waveAmplitude={0.45}
            waveFrequency={2.7}
            waveSpeed={0.02}
            enableMouseInteraction={false}
          />
        </div>
      </section>

      {/* Section 2: Crypto Prices */}
      <section
        ref={(el) => registerSection(el, 1)}
        className="relative flex min-h-screen w-full items-center justify-center"
      >
        {/* DotGrid Background for Section 2 - Full Width */}
        <div className="absolute inset-0 z-0 h-full w-full">
          <DotGrid
            dotSize={8}
            gap={25}
            baseColor="#292929"
            activeColor="#33fcff"
            proximity={150}
            speedTrigger={80}
            shockRadius={150}
            shockStrength={7}
            maxSpeed={4000}
            resistance={600}
            returnDuration={1.8}
            className="h-full w-full"
          />
        </div>

        {/* Content Container */}
        <div className="relative z-50 mx-auto flex w-full max-w-6xl flex-col items-center justify-center gap-5 px-3">
          <AnimateContent>
            <h1 className="text-center text-3xl leading-normal font-black md:text-5xl lg:text-6xl xl:text-7xl">
              مشاهده قیمت لحظه ای ارز های دیجیتال
            </h1>
          </AnimateContent>

          <AnimateContent delay={0.2}>
            <p className="w-5/6 text-center text-gray-300 sm:text-xl lg:text-2xl xl:w-4/6">
              با استفاده از وبسایت صفرو، به راحتی قیمت ارز دیجیتال مورد نظر خود را مشاهده کنید و
              تصمیم خود را بگیرید !
            </p>
          </AnimateContent>
          <AnimateContent delay={0.3}>
            <GlareHoverButton
              height="fit-content"
              width="fit-content"
              className="mt-10"
              borderColor="#fff"
            >
              <Link href="/coins" className="px-10 py-3">
                <AnimateContent delay={0.5}>رفتن به صفحه ارز های دیجیتال</AnimateContent>
              </Link>
            </GlareHoverButton>
          </AnimateContent>
        </div>
      </section>
    </>
  );
}
