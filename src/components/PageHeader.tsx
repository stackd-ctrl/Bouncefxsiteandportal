export default function PageHeader({
  eyebrow,
  title,
  subtitle,
  color = "bg-party-red",
  text = "text-white",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  color?: string;
  text?: string;
}) {
  return (
    <section className={`${color} ${text}`}>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20">
        {eyebrow && (
          <p className="eyebrow opacity-80">{eyebrow}</p>
        )}
        <h1 className="mt-4 font-display text-5xl font-bold italic leading-[0.95] tracking-tight sm:text-6xl md:text-7xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-5 max-w-2xl font-body text-lg opacity-90">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
