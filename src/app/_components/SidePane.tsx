import Link from "next/link";
import { FiInbox } from "react-icons/fi";
import { GoIssueOpened } from "react-icons/go";
import { PiProjectorScreenChart, PiStack } from "react-icons/pi";
import { BsThreeDots } from "react-icons/bs";
import { LuUsers } from "react-icons/lu";
import { IoGitBranchOutline } from "react-icons/io5";

interface SidebarItem {
  title: string;
  href: string;
  icon?: JSX.Element;
  children?: SidebarItem[];
}

const sidebarData: SidebarItem[] = [
  {
    title: "",
    href: "#",
    children: [
      { title: "Inbox", href: "/inbox", icon: <FiInbox size={18} /> },
      { title: "My issues", href: "/issues", icon: <GoIssueOpened size={18} /> },
    ],
  },
  {
    title: "Workspace",
    href: "#",
    children: [
      { title: "Projects", href: "/workspace/projects", icon: <PiProjectorScreenChart size={18} /> },
      { title: "Views", href: "/workspace/views", icon: <PiStack size={18} /> },
      { title: "More", href: "/workspace/more", icon: <BsThreeDots size={18} /> },
    ],
  },
  {
    title: "Your teams",
    href: "#",
    children: [
      {
        title: "Felix",
        href: "/teams/team-name",
        icon: <LuUsers size={18} />,
        children: [
          { title: "Issues", href: "/teams/hycient-workspace/issues", icon: <GoIssueOpened size={18} /> },
          { title: "Projects", href: "/teams/hycient-workspace/projects", icon: <PiProjectorScreenChart size={18} /> },
          { title: "Views", href: "/teams/hycient-workspace/views", icon: <PiStack size={18} /> },
        ],
      },
    ],
  },
  {
    title: "Try",
    href: "#",
    children: [
      { title: "Import issues", href: "/try/import-issues", icon: <GoIssueOpened size={18} /> },
      { title: "Invite people", href: "/try/invite-people", icon: <LuUsers size={18} /> },
      { title: "Link GitHub", href: "/try/link-github", icon: <IoGitBranchOutline size={18} /> },
    ],
  },
];

const SidePane = () => {
  return (
    <aside className="h-full bg-zinc-900/10 text-gray-300 py-2 px-1">
      <div className="flex items-center mb-2">
        <span className="w-6 h-6 flex items-center justify-center bg-pink-500 text-white rounded-md text-xs font-semibold">
          FE
        </span>
        <span className="ml-2 text-sm font-semibold">Felix</span>
      </div>

      <nav className="flex flex-col gap-4">
        {sidebarData.map((item, index) => (
          <details open key={index}>
            <summary className={`flex flex-row-reverse items-center justify-end gap-2 text-[9px] text-white/60 cursor-pointer px-2 py-1 hover:bg-zinc-900 rounded-md ${!item?.title ? "[&::-webkit-details-marker]:hidden" : ""}`}>
              <span className="text-xs text-white/60">{item?.title}</span>
            </summary>
            <div>
              {item.children?.map((child, childIndex) => (
                child.children ? (
                  <details open key={childIndex}>
                    <summary className="flex flex-row-reverse items-center justify-end gap-2 text-[9px] text-white/60 cursor-pointer px-2 py-1 hover:bg-zinc-900 rounded-md">
                      <span className="flex items-center text-sm font-semibold text-white">
                        {child.icon && <span className="mr-2">{child.icon}</span>}
                        {child.title}
                      </span>
                    </summary>
                    <div className="ml-3 flex flex-col mt-1">
                      {child.children.map((subChild, subIndex) => (
                        <Link key={subIndex} href={subChild.href} className="flex items-center px-2 py-1 hover:bg-zinc-900 rounded-md cursor-pointer">
                          {subChild.icon && <span className="mr-2">{subChild.icon}</span>}
                          <span className="text-sm">{subChild.title}</span>
                        </Link>
                      ))}
                    </div>
                  </details>
                ) : (
                  <Link key={childIndex} href={child.href} className="flex items-center px-2 py-1 hover:bg-zinc-900 rounded-md cursor-pointer">
                    {child.icon && <span className="mr-2">{child.icon}</span>}
                    <span className="text-sm font-medium">{child.title}</span>
                  </Link>
                )
              ))}
            </div>
          </details>
        ))}
      </nav>
    </aside>
  );
};

export default SidePane;