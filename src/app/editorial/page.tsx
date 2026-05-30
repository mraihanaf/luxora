import Image from "next/image";
import Link from "next/link";

type Issue = {
  title: string;
  subtitle: string;
  prompt: string;
};

const ISSUES: Issue[] = [
  {
    title: "Issue 01 — Invisible Technology",
    subtitle: "How restraint becomes the loudest statement.",
    prompt:
      "minimalist fashion editorial cover, abstract fabric texture with subtle gold accents, luxury magazine style, ultra realistic",
  },
  {
    title: "Issue 02 — The Quiet Runway",
    subtitle: "Neutral palettes, sharper silhouettes.",
    prompt:
      "minimalist runway editorial cover, monochrome studio, high fashion silhouette, luxury magazine style, ultra realistic",
  },
  {
    title: "Issue 03 — Material Futures",
    subtitle: "Liquid glass, biometrics, and the new tailoring.",
    prompt:
      "fashion editorial cover, liquid glass textile macro, deep green and soft ivory palette, luxury magazine style, ultra realistic",
  },
];

function cover(prompt: string) {
  return `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
    prompt,
  )}&image_size=portrait_4_3`;
}

export default function EditorialPage() {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 pb-24 md:px-16">
      <header className="mb-12">
        <div className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
          Editorial
        </div>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-[56px] leading-[1.05] tracking-[-0.02em] text-[color:var(--text-primary)]">
          Luxora Journal
        </h1>
        <p className="mt-4 max-w-3xl text-[16px] leading-[1.8] text-[color:var(--text-secondary)]">
          A seasonal record of silhouettes, systems, and the aesthetics of intelligence.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-10 md:grid-cols-3">
        {ISSUES.map((i) => (
          <article key={i.title} className="group">
            <div className="relative mb-6 aspect-[3/4] overflow-hidden rounded-sm border border-[color:var(--outline-variant)] bg-[color:var(--surface-container-low)] shadow-sm">
              <Image src={cover(i.prompt)} alt={i.title} fill sizes="420px" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-transparent opacity-80" />
            </div>
            <div className="font-[family-name:var(--font-display)] text-[22px] leading-[1.15] text-[color:var(--text-primary)] group-hover:text-[color:var(--primary-container)]">
              {i.title}
            </div>
            <div className="mt-2 text-[14px] leading-[1.7] text-[color:var(--text-secondary)]">
              {i.subtitle}
            </div>
            <div className="mt-4">
              <Link
                href="/editorial"
                className="text-[12px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"
              >
                Read →
              </Link>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

