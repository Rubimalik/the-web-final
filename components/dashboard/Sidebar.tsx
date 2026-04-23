"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  Settings,
  ChevronRight,
  ChevronLeft,
  Tag,
} from "lucide-react";
import { ADMIN_PRODUCT_CATEGORIES, getAdminProductCategoryBySlug } from "@/lib/admin-product-categories";

type NavChild = {
  label: string;
  href: string;
  icon: React.ElementType;
};

type NavItem = {
  label: string;
  href?: string;
  icon: React.ElementType;
  children?: NavChild[];
};

const navItems: NavItem[] = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Products",
    icon: Package,
    children: ADMIN_PRODUCT_CATEGORIES.map((category) => ({
      label: category.label,
      href: `/dashboard/products/all-products?category=${category.slug}`,
      icon: category.slug === "consumables" ? Tag : Package,
    })),
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [collapsed, setCollapsed] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const currentCategorySlug =
    getAdminProductCategoryBySlug(searchParams.get("category"))?.slug ?? "";

  const isActive = (href: string) => {
    const [targetPath, targetQuery] = href.split("?");
    if (pathname !== targetPath) {
      return false;
    }

    if (!targetQuery) {
      return true;
    }

    const targetParams = new URLSearchParams(targetQuery);
    const targetCategory = targetParams.get("category");

    if (targetCategory) {
      return currentCategorySlug === targetCategory;
    }

    return true;
  };

  const isParentActive = () => pathname.startsWith("/dashboard/products");

  return (
    <aside
      className={`flex flex-col bg-[#0c0c0f] border-r border-zinc-800/60 h-screen shrink-0 transition-all duration-200 overflow-hidden ${collapsed ? "w-[52px]" : "w-60"
        }`}
    >
      {/* Logo */}
      <div
        className={`flex items-center h-16 border-b border-zinc-800/60 shrink-0 overflow-hidden ${collapsed ? "justify-center px-2" : "gap-3 px-4"
          }`}
      >
        {collapsed ? (
          <button
            onClick={() => setCollapsed(false)}
            title="Open menu"
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-zinc-700/50 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-900/40 shrink-0">
              <Package className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-semibold text-white tracking-tight block truncate">
                StoreAdmin
              </span>
              <span className="block text-[10px] text-zinc-500 leading-none mt-0.5">
                Management Console
              </span>
            </div>
            {/* X / Close button */}
            <button
              onClick={() => setCollapsed(true)}
              title="Collapse sidebar"
              className="w-6 h-6 flex items-center justify-center rounded-md border border-zinc-700/50 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors shrink-0"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {!collapsed && (
          <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-medium px-2 mb-2">
            Main Menu
          </p>
        )}

        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;

            if (item.children) {
              const parentActive = isParentActive();
              const childrenOpen = parentActive || productsOpen;
              return (
                <li key={item.label}>
                  <button
                    type="button"
                    onClick={() => {
                      if (collapsed) {
                        setCollapsed(false);
                        setProductsOpen(true);
                        return;
                      }
                      setProductsOpen((current) => !current);
                    }}
                    className={`flex w-full items-center gap-3 rounded-lg text-sm transition-all ${
                      collapsed ? "justify-center px-2 py-2" : "px-3 py-2.5"
                    } ${
                      parentActive || childrenOpen
                        ? "bg-zinc-800/60 text-white"
                        : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50"
                    }`}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left font-medium">{item.label}</span>
                        <ChevronRight
                          className={`w-3 h-3 shrink-0 transition-transform ${
                            childrenOpen ? "rotate-90 text-indigo-400" : "text-zinc-600"
                            }`}
                        />
                      </>
                    )}
                  </button>
                  {!collapsed && childrenOpen && (
                    <ul className="ml-4 mt-0.5 space-y-0.5 border-l border-zinc-800 pl-3">
                      {item.children.map((child) => {
                        const ChildIcon = child.icon;
                        const active = isActive(child.href);
                        return (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              className={`flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm transition-all ${active
                                  ? "text-indigo-400 bg-indigo-500/10"
                                  : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50"
                                }`}
                            >
                              <ChildIcon className="w-3.5 h-3.5 shrink-0" />
                              {child.label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            }

            const active = item.href ? isActive(item.href) : false;
            return (
              <li key={item.label}>
                <Link
                  href={item.href || "#"}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center gap-3 rounded-lg text-sm transition-all ${collapsed ? "justify-center px-2 py-2" : "px-3 py-2"
                    } ${active
                      ? "bg-indigo-500/15 text-indigo-400"
                      : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50"
                    }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!collapsed && (
                    <span className="font-medium">{item.label}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
