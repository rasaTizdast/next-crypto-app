import Link from "next/link";

import AnimateContent from "@/components/AnimateContent";
import Dither from "@/components/DitherBackground";
import GlareHoverButton from "@/components/GlareHover";

export default function Home() {
  return (
    <div className="relative min-h-screen w-full">
      <div className="absolute inset-0 z-0 blur-xs">
        <Dither
          waveColor={[0.15, 0.39, 0.5]}
          disableAnimation={false}
          colorNum={40}
          waveAmplitude={0.45}
          waveFrequency={2.7}
          waveSpeed={0.02}
        />
      </div>
      <div className="relative z-10 mx-auto flex min-h-screen w-full flex-col items-center justify-center gap-5 pt-30 sm:max-w-10/12">
        <AnimateContent>
          <h1 className="text-center text-3xl leading-normal font-black sm:text-4xl md:text-5xl lg:text-7xl">
            آنالیز قیمت های ارز دیجیتال و <br />
            خرید به کمک دستیار هوشمند صفرو
          </h1>
        </AnimateContent>

        <AnimateContent delay={0.2}>
          <p className="mt-2 w-3/6 text-center text-gray-200 sm:text-2xl md:text-3xl">
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
        <AnimateContent delay={0.6}>
          <p className="text-center text-gray-400">
            * گروه صفرو هیچ مسئولیتی در مورد عواقب دستیار هوشمند ندارد و شدیدا پیشنهاد میشود پاسخ ها
            توسط شخص شما هم چک شوند.
          </p>
        </AnimateContent>
      </div>
    </div>
  );
}
