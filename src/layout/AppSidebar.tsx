"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import { api } from "@/lib/api";
import type { BackendServiceKey } from "@/lib/backend-url";
import {
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  SaleIcon,
  InventoryIcon,
  WarehouseIcon,
} from "../icons/index";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  /** Right-aligned mono count. Rendered only when a real figure is available. */
  count?: number;
  subItems?: { name: string; path: string; count?: number }[];
};

type GroupKey = "reading" | "stock" | "service";

const navGroups: { key: GroupKey; label: string; items: NavItem[] }[] = [
  {
    key: "reading",
    label: "Reading",
    items: [
      {
        icon: <GridIcon />,
        name: "Dashboard",
        subItems: [
          { name: "Sales", path: "/dashboard" },
          { name: "Inventory", path: "/dashboard/inventory" },
          { name: "Revenue", path: "/dashboard/revenue" },
        ],
      },
    ],
  },
  {
    key: "stock",
    label: "Stock",
    items: [
      {
        icon: <InventoryIcon />,
        name: "Inventory",
        subItems: [
          { name: "Inventory", path: "/inventory" },
          { name: "Recipes", path: "/recipes" },
          { name: "Import", path: "/inventory/import" },
          { name: "Export", path: "/inventory/export" },
        ],
      },
      {
        icon: <WarehouseIcon />,
        name: "Warehouse",
        path: "/warehouse",
      },
    ],
  },
  {
    key: "service",
    label: "Service",
    items: [
      {
        icon: <SaleIcon />,
        name: "Sale",
        subItems: [
          { name: "Overview", path: "/sale/overview" },
          { name: "POS", path: "/pos" },
          { name: "Orders", path: "/orders" },
          { name: "List", path: "/sale/list" },
        ],
      },
    ],
  },
];

type Counts = Partial<Record<string, number>>;

/**
 * Reads the totals the rail shows, through the app's own API client so the
 * same auth and base-URL rules apply as everywhere else. A service that does
 * not answer shows no count at all, rather than a zero that would read as a
 * real figure.
 */
async function readCounts(): Promise<Counts> {
  const sources: {
    key: string;
    service: BackendServiceKey;
    pick: (d: any) => number | undefined;
  }[] = [
    { key: "Inventory", service: "inventory", pick: (d) => d?.pagination?.totalItems },
    { key: "Recipes", service: "recipe", pick: (d) => d?.pagination?.totalItems },
    { key: "Warehouse", service: "warehouse", pick: (d) => d?.pagination?.totalItems },
    { key: "Sale", service: "sale", pick: (d) => d?.pagination?.totalItems },
    { key: "POS", service: "pos", pick: (d) => d?.pagination?.totalItems },
    { key: "Orders", service: "orders", pick: (d) => d?.pagination?.totalItems },
  ];

  const out: Counts = {};
  await Promise.allSettled(
    sources.map(async (src) => {
      const data = await api.get<any>("/list", {}, undefined, src.service);
      const value = src.pick(data);
      if (typeof value === "number" && Number.isFinite(value)) {
        out[src.key] = value;
      }
    })
  );
  return out;
}

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const open = isExpanded || isHovered || isMobileOpen;
  const [counts, setCounts] = useState<Counts>({});

  useEffect(() => {
    let alive = true;
    readCounts()
      .then((c) => alive && setCounts(c))
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: GroupKey;
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  useEffect(() => {
    let submenuMatched = false;
    navGroups.forEach((group) => {
      group.items.forEach((nav, index) => {
        nav.subItems?.forEach((subItem) => {
          if (isActive(subItem.path)) {
            setOpenSubmenu({ type: group.key, index });
            submenuMatched = true;
          }
        });
      });
    });
    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [pathname, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prev) => ({
          ...prev,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: GroupKey) => {
    setOpenSubmenu((prev) =>
      prev && prev.type === menuType && prev.index === index
        ? null
        : { type: menuType, index }
    );
  };

  const renderMenuItems = (items: NavItem[], menuType: GroupKey) => (
    <ul className="flex flex-col gap-0.5">
      {items.map((nav, index) => {
        const submenuOpen =
          openSubmenu?.type === menuType && openSubmenu?.index === index;
        const subActive = nav.subItems?.some((s) => isActive(s.path)) ?? false;
        return (
          <li key={nav.name}>
            {nav.subItems ? (
              <button
                onClick={() => handleSubmenuToggle(index, menuType)}
                aria-expanded={submenuOpen}
                className={`menu-item group ${
                  subActive ? "menu-item-active" : "menu-item-inactive"
                } cursor-pointer ${open ? "lg:justify-start" : "lg:justify-center"}`}
              >
                <span
                  className={
                    subActive ? "menu-item-icon-active" : "menu-item-icon-inactive"
                  }
                >
                  {nav.icon}
                </span>
                {open && <span className="truncate">{nav.name}</span>}
                {open && typeof counts[nav.name] === "number" && (
                  <span
                    className={`ml-auto mr-1 font-mono text-[11px] tabular ${
                      subActive ? "text-brand-700" : "text-brand-300"
                    }`}
                  >
                    {counts[nav.name]}
                  </span>
                )}
                {open && (
                  <ChevronDownIcon
                    className={`${
                      typeof counts[nav.name] === "number" ? "" : "ml-auto"
                    } h-4 w-4 shrink-0 transition-transform duration-200 ${
                      submenuOpen ? "rotate-180" : ""
                    } ${subActive ? "text-brand-700" : "text-brand-300"}`}
                  />
                )}
              </button>
            ) : (
              nav.path && (
                <Link
                  href={nav.path}
                  aria-current={isActive(nav.path) ? "page" : undefined}
                  className={`menu-item group ${
                    isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                  } ${open ? "lg:justify-start" : "lg:justify-center"}`}
                >
                  <span
                    className={
                      isActive(nav.path)
                        ? "menu-item-icon-active"
                        : "menu-item-icon-inactive"
                    }
                  >
                    {nav.icon}
                  </span>
                  {open && <span className="truncate">{nav.name}</span>}
                  {open && typeof counts[nav.name] === "number" && (
                    <span
                      className={`ml-auto font-mono text-[11px] tabular ${
                        isActive(nav.path) ? "text-brand-700" : "text-brand-300"
                      }`}
                    >
                      {counts[nav.name]}
                    </span>
                  )}
                </Link>
              )
            )}
            {nav.subItems && open && (
              <div
                ref={(el) => {
                  subMenuRefs.current[`${menuType}-${index}`] = el;
                }}
                className="overflow-hidden transition-all duration-300"
                style={{
                  height: submenuOpen
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
                }}
              >
                <ul className="mt-0.5 ml-9 space-y-0.5 border-l border-white/10 pl-3">
                  {nav.subItems.map((subItem) => (
                    <li key={subItem.name}>
                      <Link
                        href={subItem.path}
                        aria-current={isActive(subItem.path) ? "page" : undefined}
                        className={`menu-dropdown-item ${
                          isActive(subItem.path)
                            ? "menu-dropdown-item-active"
                            : "menu-dropdown-item-inactive"
                        }`}
                      >
                        <span className="truncate">{subItem.name}</span>
                        {typeof counts[subItem.name] === "number" && (
                          <span
                            className={`ml-auto font-mono text-[11px] tabular ${
                              isActive(subItem.path)
                                ? "text-orange-200"
                                : "text-brand-300"
                            }`}
                          >
                            {counts[subItem.name]}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <aside
      className={`fixed top-0 left-0 z-50 mt-16 flex h-screen flex-col bg-brand-900 px-4 text-brand-100 transition-all duration-300 ease-in-out lg:mt-0
        ${isExpanded || isMobileOpen ? "w-[272px]" : isHovered ? "w-[272px]" : "w-[84px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`py-6 ${open ? "" : "lg:flex lg:justify-center"}`}>
        <Link href="/" className="block">
          {open ? (
            <>
              <div className="text-[19px] leading-none font-extrabold tracking-tight text-white">
                INVENT<span className="text-orange-400">IUM</span>
              </div>
              <div className="label-cap mt-1.5 !text-brand-300">
                Stock · Service · Revenue
              </div>
            </>
          ) : (
            <div className="text-[19px] leading-none font-extrabold tracking-tight text-white">
              I<span className="text-orange-400">M</span>
            </div>
          )}
        </Link>
      </div>
      <nav className="no-scrollbar flex flex-col gap-5 overflow-y-auto pb-8">
        {navGroups.map((group) => (
          <div key={group.key}>
            <h2
              className={`label-cap mb-2 flex !text-brand-400 ${
                open ? "justify-start" : "lg:justify-center"
              }`}
            >
              {open ? group.label : <HorizontaLDots />}
            </h2>
            {renderMenuItems(group.items, group.key)}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default AppSidebar;
