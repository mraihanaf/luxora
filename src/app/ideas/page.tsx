import Image from "next/image";

type Idea = {
  title: string;
  description: string;
  duration: string;
  tag?: string;
  prompt: string;
};

const IDEAS: Idea[] = [
  {
    title: "Spring/Summer AI Concepts",
    description: "Exploration of fluid fabrics and responsive digital environments.",
    duration: "02:45",
    tag: "Featured",
    prompt:
      "minimalist luxury fashion video still, pale stone studio set with soft curved architecture, liquid glass fabric draping, editorial lighting, calm atmosphere, ultra realistic",
  },
  {
    title: "Virtual Runway Test 01",
    description: "Kinetic motion studies for upcoming digital garments.",
    duration: "01:12",
    prompt:
      "minimalist luxury runway video still, vertical light columns, clean steps, reflective surface, editorial lighting, calm atmosphere, ultra realistic",
  },
  {
    title: "Materiality Study Alpha",
    description: "Texture-driven explorations of cloth and light.",
    duration: "00:58",
    prompt:
      "macro video still of folded silk textile, subtle highlights, minimalist composition, luxury editorial, ultra realistic",
  },
  {
    title: "Spatial Dynamics",
    description: "Architecture-led motion concepts.",
    duration: "01:06",
    prompt:
      "minimalist architecture video still, white pillars and soft shadows, luxury editorial, ultra realistic",
  },
  {
    title: "Liquid Glass Iterations",
    description: "Refraction tests for future silhouettes.",
    duration: "00:42",
    prompt:
      "abstract liquid glass fabric video still, deep green highlights, minimalist luxury, ultra realistic",
  },
];

function ideaThumb(prompt: string, size: "landscape_4_3" | "portrait_4_3") {
  return `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=${size}`;
}

function IdeaCard({
  idea,
  variant,
}: {
  idea: Idea;
  variant: "wide" | "tall" | "small";
}) {
  const sizes =
    variant === "wide"
      ? "(min-width: 1024px) 820px, 100vw"
      : variant === "tall"
        ? "(min-width: 1024px) 420px, 100vw"
        : "(min-width: 1024px) 420px, 100vw";

  const imageSize = variant === "tall" ? "portrait_4_3" : "landscape_4_3";

  return (
    <article className="glass-card overflow-hidden rounded-xl">
      <div className="relative">
        <div
          className={
            variant === "tall"
              ? "aspect-[4/5]"
              : variant === "wide"
                ? "aspect-[16/9]"
                : "aspect-[16/10]"
          }
        />
        <Image
          src={ideaThumb(idea.prompt, imageSize)}
          alt={idea.title}
          fill
          sizes={sizes}
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent" />

        <button
          type="button"
          aria-label={`Play ${idea.title}`}
          className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white/80 text-black"
        >
          ▶
        </button>

        <div className="absolute bottom-4 right-4 rounded-full bg-black/70 px-3 py-1 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.22em] text-white">
          {idea.duration}
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="font-[family-name:var(--font-display)] text-[22px] leading-[1.1] text-[color:var(--text-primary)]">
              {idea.title}
            </div>
            <div className="mt-2 text-[14px] leading-[1.7] text-[color:var(--text-secondary)]">
              {idea.description}
            </div>
          </div>
          {idea.tag ? (
            <div className="rounded-full border border-[color:var(--outline-variant)] bg-[color:var(--surface-container-lowest)] px-3 py-1 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-primary)]">
              {idea.tag}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default function IdeasPage() {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 pb-24 md:px-16">
      <header className="mb-12">
        <h1 className="font-[family-name:var(--font-display)] text-[56px] leading-[1.05] tracking-[-0.02em] text-[color:var(--text-primary)]">
          Ideas — Video Gallery
        </h1>
        <p className="mt-4 max-w-3xl text-[16px] leading-[1.8] text-[color:var(--text-secondary)]">
          A curated exhibition of AI-generated motion concepts, exploring future spatial aesthetics
          and digital materiality. These conceptual studies serve as visual anchors for upcoming
          atelier collections.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <IdeaCard idea={IDEAS[0]} variant="wide" />
        </div>
        <div className="lg:col-span-4">
          <IdeaCard idea={IDEAS[1]} variant="tall" />
        </div>
        <div className="lg:col-span-4">
          <IdeaCard idea={IDEAS[2]} variant="small" />
        </div>
        <div className="lg:col-span-4">
          <IdeaCard idea={IDEAS[3]} variant="small" />
        </div>
        <div className="lg:col-span-4">
          <IdeaCard idea={IDEAS[4]} variant="small" />
        </div>
      </section>

      <div className="mt-14 flex justify-center">
        <button
          type="button"
          className="rounded-full border border-[color:var(--outline-variant)] bg-[color:var(--surface-container-lowest)] px-10 py-4 text-[12px] uppercase tracking-[0.22em] text-[color:var(--text-primary)] hover:bg-[color:var(--surface-container-low)]"
        >
          Load More Concepts ⌄
        </button>
      </div>
    </div>
  );
}

