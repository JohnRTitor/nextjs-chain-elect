"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { usePathname } from "next/navigation";
import { NavLink } from "@/types";
import { Logo } from "./Logo";
import { DesktopNavigation } from "./DesktopNavigation";
import { MobileNavigation } from "./MobileNavigation";
import { WalletDisplay } from "./WalletDisplay";
import { DesktopThemeSwitcher } from "./theme/DesktopThemeSwitcher";

export default function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isConnected, address } = useAccount();
  const [isClient, setIsClient] = useState(false);

  // Set client-side rendering flag after mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  const navLinks: NavLink[] = [
    { href: "/", label: "Home" },
    { href: "/elections", label: "Elections" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  const authLinks: NavLink[] = [
    { href: "/voter", label: "Voter Dashboard" },
    { href: "/candidate", label: "Candidate Dashboard" },
    { href: "/admin", label: "Admin Dashboard" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Logo />

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center">
            <DesktopNavigation navLinks={navLinks} pathname={pathname} />
            {isClient && (
              <WalletDisplay
                isConnected={isConnected}
                address={address}
                authLinks={authLinks}
                className="ml-2"
              />
            )}
            <DesktopThemeSwitcher />
          </div>

          {/* Mobile Nav */}
          <div className="md:hidden flex items-center gap-2">
            {isClient && (
              <WalletDisplay
                isConnected={isConnected}
                address={address}
                authLinks={authLinks}
                isMobile={true}
              />
            )}
            <MobileNavigation
              isMenuOpen={isMenuOpen}
              setIsMenuOpen={setIsMenuOpen}
              navLinks={navLinks}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
