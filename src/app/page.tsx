import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const atelierImage = `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
    "high-end fashion product photo, structured sleeveless trench dress in rich tan leather with deep forest green underlayer, on invisible mannequin, studio lighting, luxury editorial, minimal background, ultra realistic",
  )}&image_size=portrait_4_3`;

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 pb-24 md:px-16">
      <section className="relative flex min-h-[720px] items-center justify-center overflow-hidden py-20">
        <div className="absolute inset-0 bg-[color:var(--surface-container-low)]" />
        <div className="absolute inset-0 opacity-60">
          <div className="absolute inset-0 bg-[radial-gradient(800px_520px_at_52%_8%,rgba(48,105,72,0.10),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(760px_520px_at_40%_60%,rgba(253,215,152,0.28),transparent_62%)]" />
        </div>

        <div className="relative w-full text-center">
          <h1 className="mx-auto max-w-4xl font-[family-name:var(--font-display)] text-[42px] leading-[1.05] tracking-[-0.02em] text-[color:var(--text-primary)] md:text-[64px]">
            The Future of Fashion is{" "}
            <span className="text-[color:var(--text-gold)]">Intelligent</span>
          </h1>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 md:flex-row">
            <Link
              href="/catalog"
              className="inline-flex w-full items-center justify-center rounded-sm bg-[color:var(--primary-container)] px-8 py-4 text-[12px] uppercase tracking-[0.22em] text-[color:var(--on-primary)] md:w-auto"
            >
              Explore Collections
            </Link>
            <Link
              href="/ideas"
              className="glass-card inline-flex w-full items-center justify-center gap-2 rounded-sm px-8 py-4 text-[12px] uppercase tracking-[0.22em] text-[color:var(--text-primary)] md:w-auto"
            >
              Watch Vision <span className="text-[color:var(--text-gold)]">→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="relative z-10 -mt-14 pb-24">
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
            <div key={f.title} className="glass-card rounded-lg p-8">
              <div className="font-[family-name:var(--font-display)] text-[22px] text-[color:var(--text-primary)]">
                {f.title}
              </div>
              <div className="mt-3 text-[14px] leading-[1.8] text-[color:var(--text-secondary)]">
                {f.desc}
              </div>
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
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
  );
}
