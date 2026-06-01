import Image from "next/image";

export const dynamic = "force-dynamic";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <header className="border-b border-[var(--border-default)] bg-[var(--bg-secondary)]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-center px-4 py-4">
          <Image
            src="/logo-dark.png"
            alt="ManyHandz"
            width={180}
            height={56}
            className="h-10 w-auto"
            priority
          />
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
    </div>
  );
}
