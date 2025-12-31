import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/components/lib/utils"; 

const WEBSITE_NAME = import.meta.env.VITE_WEBSITE_NAME;

export default function Header({ currentUser }) {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const authLinks = currentUser
    ? [
        { name: "Dashboard", path: "/dashboard" },
        { name: "Profile", path: "/profile" },
      ]
    : [
        { name: "Login", path: "/login" },
        { name: "Register as Donor", path: "/register/donor" },
        { name: "Register as Facility", path: "/register/facility" },
      ];

  const isActive = (path) => location.pathname === path;

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100"
          : "bg-white/90 backdrop-blur-sm border-b border-gray-100"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img src="/blooddonner.png" alt="Blood Donor Network" className="w-10 h-10 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105" />
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors duration-200">Blood Donor Network</h1>
              <p className="text-xs text-gray-500 -mt-0.5 font-medium">Blood Management System</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={cn(
                  "relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                  isActive(link.path) ? "text-red-700 bg-red-50" : "text-gray-700 hover:text-red-600 hover:bg-gray-50"
                )}
              >
                {link.name}
              </Link>
            ))}

            <div className="w-px h-6 bg-gray-300 mx-2" />

            {authLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                  link.name.includes("Register")
                    ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg hover:shadow-xl hover:from-red-700 hover:to-red-800 hover:scale-105"
                    : isActive(link.path)
                    ? "text-red-700 bg-red-50"
                    : "text-gray-700 hover:text-red-600 hover:bg-gray-50"
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Mobile Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="md:hidden p-2 rounded-xl transition-all duration-200"
              >
                <span className="sr-only">Open menu</span>
                <div className="relative w-6 h-6">
                  <span className="absolute top-1 left-0 w-6 h-0.5 bg-current block rotate-0 transition-all duration-200"></span>
                  <span className="absolute top-2.5 left-0 w-6 h-0.5 bg-current block transition-all duration-200"></span>
                  <span className="absolute top-5 left-0 w-6 h-0.5 bg-current block transition-all duration-200"></span>
                </div>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-6 bg-white">
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
              <div className="relative z-10 bg-white h-full rounded-l-2xl shadow-2xl">
                <ScrollArea className="h-full p-6">
                  <div className="space-y-4">
                    {navLinks.map((link) => (
                      <Link
                        key={link.name}
                        to={link.path}
                        className={cn(
                          "block px-4 py-3 rounded-xl text-base font-medium transition-all duration-200",
                          isActive(link.path)
                            ? "bg-red-50 text-red-700 border-l-4 border-red-500"
                            : "text-gray-700 hover:bg-gray-50 hover:text-red-600"
                        )}
                      >
                        {link.name}
                      </Link>
                    ))}

                    <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
                      {authLinks.map((link) => (
                        <Link
                          key={link.name}
                          to={link.path}
                          className={cn(
                            "block px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 text-center",
                            link.name.includes("Register")
                              ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg hover:shadow-xl"
                              : isActive(link.path)
                              ? "bg-red-50 text-red-700 border-l-4 border-red-500"
                              : "text-gray-700 hover:bg-gray-50 hover:text-red-600"
                          )}
                        >
                          {link.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </ScrollArea>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
