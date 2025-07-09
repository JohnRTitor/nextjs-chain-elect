"use client";

import * as React from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from "@/components/ui/drawer";

interface HybridDialogDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  drawerWidthClass?: string; // e.g. "max-w-md"
  dialogWidthClass?: string; // e.g. "sm:max-w-lg"
  showDrawerCloseButton?: boolean; // show a close button in drawer footer
}

export function HybridDialogDrawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  drawerWidthClass = "max-w-md",
  dialogWidthClass = "sm:max-w-lg",
  showDrawerCloseButton = false,
}: HybridDialogDrawerProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className={dialogWidthClass}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
          {children}
          {footer}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className={`mx-auto w-full ${drawerWidthClass}`}>
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
            {description && <DrawerDescription>{description}</DrawerDescription>}
          </DrawerHeader>
          {children}
          {footer}
          {showDrawerCloseButton && (
            <DrawerClose asChild>
              <button
                type="button"
                className="mt-4 w-full rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow hover:bg-accent"
              >
                Close
              </button>
            </DrawerClose>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
