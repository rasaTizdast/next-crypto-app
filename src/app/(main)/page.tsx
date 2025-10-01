import Link from "next/link";

import AnimateContent from "@/components/AnimateContent";
import Dither from "@/components/Background/DitherBackground";
import GlareHoverButton from "@/components/GlareHover";

export default function Home() {
  return (
    <>
      <div className="relative w-full">
        <div className="absolute inset-0 z-0">
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
        <div className="relative z-[1] mx-auto flex min-h-screen w-full flex-col items-center justify-center gap-5 px-3 pt-30 sm:max-w-10/12">
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
        <div className="relative z-[1] mx-auto flex w-full flex-col items-center justify-center gap-5 px-3 pb-50 sm:max-w-10/12">
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
          <AnimateContent>
            <GlareHoverButton
              height="fit-content"
              width="fit-content"
              className="mt-10"
              borderColor="#fff"
            >
              <Link href="/coins" className="px-10 py-3">
                <AnimateContent>رفتن به صفحه ارز های دیجیتال</AnimateContent>
              </Link>
            </GlareHoverButton>
          </AnimateContent>
        </div>
      </div>
    </>
  );
}
