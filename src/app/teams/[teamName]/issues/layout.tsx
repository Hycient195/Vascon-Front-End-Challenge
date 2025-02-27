import Link from "next/link"

interface IProps {
  children: React.ReactNode;
}

export default function IssuesLayout({ children }: IProps ) {
  const headings = [
    { text: "All issues", href: "", icon: "" },
    { text: "Active", href: "", icon: "" },
    { text: "Backlog", href: "", icon: "" },
  ]

  return (
    <section className="">
      <ul className="px-4 py-1.5 flex flex-row items-center gap-1.5 border-b border-b-zinc-500/30">
      {
        headings.map((heading) => (
          <li key={heading.href}>
            <Link href={heading.href} className="px-2 py-1 rounded border border-zinc-500/30 text-xs text-white/80 flex flex-row items-center gap-1.5">{heading?.icon} {heading.text}</Link>
          </li>
        ))
      }
      </ul>
      {children}
    </section>
  )
}