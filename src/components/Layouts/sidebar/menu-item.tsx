import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import Link from "next/link";
import { useSidebarContext } from "./sidebar-context";

const menuItemBaseStyles = cva(
  "group relative rounded-[20px] px-3.5 text-sm font-semibold text-ink-muted transition-all duration-200 dark:text-dark-6",
  {
    variants: {
      isActive: {
        true:
          "bg-primary/[0.08] text-primary shadow-card dark:bg-dark-2 dark:text-white before:absolute before:left-1 before:top-1/2 before:h-8 before:w-1 before:-translate-y-1/2 before:rounded-full before:bg-primary",
        false:
          "hover:bg-surface-soft hover:text-ink dark:hover:bg-dark-2 dark:hover:text-white",
      },
    },
    defaultVariants: {
      isActive: false,
    },
  },
);

export function MenuItem(
  props: {
    className?: string;
    children: React.ReactNode;
    isActive: boolean;
    title?: string;
  } & ({ as?: "button"; onClick: () => void } | { as: "link"; href: string }),
) {
  const { toggleSidebar, isMobile } = useSidebarContext();

  if (props.as === "link") {
    return (
      <Link
        href={props.href}
        // Close sidebar on clicking link if it's mobile
        onClick={() => isMobile && toggleSidebar()}
        title={props.title}
        className={cn(
          menuItemBaseStyles({
            isActive: props.isActive,
            className: "relative block py-3",
          }),
          props.className,
        )}
      >
        {props.children}
      </Link>
    );
  }

  return (
    <button
      onClick={props.onClick}
      aria-expanded={props.isActive}
      title={props.title}
      className={menuItemBaseStyles({
        isActive: props.isActive,
        className: "flex w-full items-center gap-3 py-3",
      })}
    >
      {props.children}
    </button>
  );
}
