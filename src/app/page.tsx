import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <main className="flex min-h-screen w-full flex-col items-center justify-center gap-8">
        <h1 className="text-4xl font-bold">orgOS Board Demo</h1>
        <p className="text-muted-foreground text-lg">
          1:1 replica of the team board with roles and features
        </p>
        <Link
          href="/board"
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-6 py-3 font-medium transition-colors"
        >
          Open Board
        </Link>
      </main>
    </div>
  );
}
