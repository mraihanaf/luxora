import Image from "next/image";

type Note = {
  title: string;
  subtitle: string;
  prompt: string;
};

const NOTES: Note[] = [
  {
    title: "Material",
    subtitle: "Silk & light refraction studies.",
    prompt:
      "macro studio photo of premium silk fabric folds, soft highlights, minimalist luxury, ultra realistic",
  },
  {
    title: "Construction",
    subtitle: "Geometry-led tailoring in motion.",
    prompt:
      "minimalist atelier studio photo of pattern pieces on table, soft daylight, luxury editorial, ultra realistic",
  },
  {
    title: "Finish",
    subtitle: "Hardware accents, quiet brilliance.",
    prompt:
      "close-up studio photo of brushed metal hardware on leather, subtle gold sheen, luxury editorial, ultra realistic",
  },
];

function img(prompt: string) {
  return `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
    prompt,
  )}&image_size=landscape_4_3`;
}

export default function AtelierPage() {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 pb-24 md:px-16">
      <header className="mb-12">
        <div className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
          Atelier
        </div>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-[56px] leading-[1.05] tracking-[-0.02em] text-[color:var(--text-primary)]">
          Notes from the Workroom
        </h1>
        <p className="mt-4 max-w-3xl text-[16px] leading-[1.8] text-[color:var(--text-secondary)]">
          A disciplined space where digital materiality meets traditional craft. Each study refines
          the vocabulary of Luxora silhouettes.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {NOTES.map((n) => (
          <article key={n.title} className="glass-card overflow-hidden rounded-xl">
            <div className="relative aspect-[4/3]">
              <Image src={img(n.prompt)} alt={n.title} fill sizes="420px" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-transparent" />
            </div>
            <div className="p-6">
              <div className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                {n.title}
              </div>
              <div className="mt-3 font-[family-name:var(--font-display)] text-[28px] leading-[1.1] text-[color:var(--text-primary)]">
                {n.subtitle}
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

