import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const atelierImage = `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
    "high-end fashion product photo, structured sleeveless trench dress in rich tan leather with deep forest green underlayer, on invisible mannequin, studio lighting, luxury editorial, minimal background, ultra realistic",
  )}&image_size=portrait_4_3`;

  return (
    <>
      <section className="relative -mt-24 flex min-h-[calc(100svh+2rem)] w-full items-end overflow-hidden pt-32">
        <div className="absolute inset-0 bg-[color:var(--surface-container-low)]">
          <video
            className="h-full w-full object-cover"
            src="/hero.mp4"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,10,10,0.72)_0%,rgba(10,10,10,0.48)_40%,rgba(10,10,10,0.62)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(215,180,120,0.18),transparent_34%)]" />
          <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
        </div>

        <div className="relative mx-auto flex w-full max-w-[1440px] px-4 pb-20 md:px-16 md:pb-28">
          <div className="max-w-3xl text-center md:text-left">
            <div className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.28em] text-white/72">
              Luxury AI Atelier
            </div>
            <h1 className="mt-6 font-[family-name:var(--font-display)] text-[48px] leading-[0.98] tracking-[-0.03em] text-white md:text-[78px]">
              The Future of Fashion Feels{" "}
              <span className="text-[#e8d1a2]">Effortless</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-[16px] leading-[1.8] text-white/74 md:mx-0 md:text-[18px]">
              Immersive editorial styling, intelligent recommendations, and luxury pieces curated
              with cinematic clarity.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 md:flex-row md:justify-start">
              <Link
                href="/catalog"
                className="inline-flex w-full items-center justify-center rounded-full bg-white px-8 py-4 text-[12px] uppercase tracking-[0.22em] text-black transition-colors hover:bg-white/90 md:w-auto"
              >
                Explore Collections
              </Link>
              <Link
                href="/ideas"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/24 bg-white/10 px-8 py-4 text-[12px] uppercase tracking-[0.22em] text-white backdrop-blur-sm transition-colors hover:bg-white/16 md:w-auto"
              >
                Watch Vision <span className="text-[#e8d1a2]">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-4 pb-24 md:px-16">
        <section className="relative -mt-16 pb-24 md:-mt-20">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "AI Styling",
                desc: "Algorithmic precision meets haute couture sensibility for personalized aesthetics.",
              },
              {
                title: "Curated Drops",
                desc: "Limited-edition conceptual pieces released through predictive trend modeling.",
              },
              {
                title: "Tailored Fit",
                desc: "Biometric scanning ensures every garment is architected for your exact form.",
              },
              {
                title: "Sustainable",
                desc: "Zero-waste production protocols guided by intelligent resource allocation.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-black/6 bg-[rgba(247,241,232,0.92)] p-8 shadow-[0_28px_70px_rgba(15,23,42,0.14)] backdrop-blur"
              >
                <div className="font-[family-name:var(--font-display)] text-[24px] text-[#171411]">
                  {f.title}
                </div>
                <div className="mt-3 text-[14px] leading-[1.8] text-[#5d5148]">{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-[color:var(--outline-variant)] py-24">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="order-2 lg:order-1">
              <div className="relative mx-auto aspect-[3/4] max-w-[420px] overflow-hidden rounded-xl border border-[color:var(--outline-variant)] bg-[color:var(--surface-container-lowest)] p-4">
                <div className="relative h-full w-full overflow-hidden rounded-lg">
                  <Image
                    src={atelierImage}
                    alt="Outfit studio preview"
                    fill
                    sizes="420px"
                    className="object-cover"
                  />
                  <video
                    className="absolute inset-0 h-full w-full object-cover"
                    src="/hero2.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                  />
                </div>
                <div className="absolute bottom-6 right-6 rounded-full border border-[color:var(--outline-variant)] bg-[color:var(--glass-surface)] px-4 py-2 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-primary)]">
                  Neural Render
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-gold)]">
                Interactive Experience
              </div>
              <h2 className="mt-4 font-[family-name:var(--font-display)] text-[44px] leading-[1.05] text-[color:var(--text-primary)] md:text-[56px]">
                Enter the Atelier
              </h2>
              <p className="mt-6 max-w-xl text-[16px] leading-[1.8] text-[color:var(--text-secondary)]">
                Collaborate with our neural stylist to generate looks that transcend seasons. Upload
                your parameters, and watch as raw concepts solidify into wearable art.
              </p>
              <Link
                href="/playground"
                className="mt-10 inline-flex items-center justify-center rounded-full border border-[color:var(--outline-variant)] bg-[color:var(--surface-container-low)] px-8 py-4 text-[12px] uppercase tracking-[0.22em] text-[color:var(--text-primary)] hover:bg-[color:var(--surface-container)]"
              >
                Launch Outfit Studio <span className="ml-2">→</span>
              </Link>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden py-24">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0 bg-[radial-gradient(900px_520px_at_40%_40%,rgba(48,105,72,0.08),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(720px_460px_at_70%_70%,rgba(117,90,38,0.12),transparent_60%)]" />
          </div>
          <div className="relative mx-auto max-w-4xl text-center">
            <div className="mb-6 text-[color:var(--text-gold)]">“”</div>
            <h2 className="font-[family-name:var(--font-display)] text-[42px] leading-[1.12] text-[color:var(--text-primary)] md:text-[64px]">
              Technology doesn&apos;t replace style.
              <br />
              <span className="text-[color:var(--text-gold)]">It reveals it.</span>
            </h2>
          </div>
        </section>
      </div>
    </>
  );
}
