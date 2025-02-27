import Link from "next/link";

export default function Home() {
  return (
    <section className="text-white flex flex-col items-center gap-2 justify-center h-full w-full">
      <h1 className="text-neutral-300">Navigate to &quot;Your teams&quot; {`>`} &quot;[Team Name]&quot; {`>`} &quot;Issues&quot;</h1>
      <Link href="/teams/team-name/issues" className="bg-neutral-700 px-4 py-2 rounded">Navigate to filter</Link>
    </section>
  );
}
