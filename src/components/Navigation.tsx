"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Package, ShoppingCart } from "lucide-react";

const Navigation = () => {
  const pathname = usePathname();

  const navItems = [
    { id: "home", name: "Home", href: "/", icon: Home },
    { id: "users", name: "Users", href: "/users", icon: Users },
    { id: "products", name: "Products", href: "/products", icon: Package },
    { id: "orders", name: "Orders", href: "/orders", icon: ShoppingCart },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo / Title */}
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">Bahari Click</h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex sm:space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`${
                    active
                      ? "border-indigo-500 text-indigo-600 bg-indigo-50"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } flex items-center space-x-2 px-3 py-2 border-b-2 text-sm font-medium rounded-t-md transition`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`${
                    active
                      ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                      : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                  } flex items-center space-x-3 px-3 py-2 border-l-4 text-base font-medium transition`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
