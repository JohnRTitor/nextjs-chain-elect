import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted/80",
        className
      )}
    />
  );
}

export function AvatarSkeleton({ size = "h-24 w-24" }: { size?: string }) {
  return <Skeleton className={`${size} rounded-full`} />;
}

export function CardSkeleton({ height = "h-24" }: { height?: string }) {
  return <Skeleton className={`${height} w-full`} />;
}

export function TextSkeleton({ width = "w-full", height = "h-4", className = "" }: { 
  width?: string;
  height?: string;
  className?: string;
}) {
  return <Skeleton className={`${height} ${width} ${className}`} />;
}

export function ParagraphSkeleton({ lines = 3, widths = [] }: { 
  lines?: number;
  widths?: string[];
}) {
  return (
    <div className="space-y-2">
      {Array(lines)
        .fill(0)
        .map((_, i) => {
          let width = "w-full";
          
          if (widths && widths[i]) {
            width = widths[i];
          } else if (i === lines - 1) {
            width = "w-4/5";
          }
          
          return <TextSkeleton key={i} width={width} />;
        })}
    </div>
  );
}

export function ProfileInfoSkeletonItem({ 
  labelWidth = "w-1/3",
  valueWidth = "w-1/2",
  spacing = "space-y-1"
}: { 
  labelWidth?: string;
  valueWidth?: string;
  spacing?: string;
}) {
  return (
    <div className={spacing}>
      <TextSkeleton width={labelWidth} />
      <TextSkeleton width={valueWidth} />
    </div>
  );
}

export function BadgeSkeleton({ widths = ["w-16", "w-24", "w-32"] }: { widths?: string[] }) {
  return (
    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
      {widths.map((width, i) => (
        <Skeleton key={i} className={`h-6 ${width} rounded-full`} />
      ))}
    </div>
  );
}

export function ProfileOverviewSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
          <AvatarSkeleton />
          
          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="space-y-2">
              <TextSkeleton width="w-48" height="h-6" />
              <TextSkeleton width="w-36" />
            </div>
            
            <BadgeSkeleton />
          </div>
          
          <div className="text-center md:text-right">
            <TextSkeleton width="w-24" />
            <TextSkeleton width="w-20" className="mt-1" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function GridProfileInfoSkeleton({ columns = 2, items = 6 }) {
  return (
    <div className="space-y-6">
      <TextSkeleton width="w-48" height="h-6" />
      <div className={`grid gap-6 md:grid-cols-${columns}`}>
        {Array(items).fill(0).map((_, i) => (
          <ProfileInfoSkeletonItem key={i} />
        ))}
      </div>

      <div className="pt-2">
        <TextSkeleton width="w-32" className="mb-1" />
        <Skeleton className="h-20 w-full" />
      </div>
    </div>
  );
}

export function TabsSkeleton({ 
  tabs = ["Tab 1", "Tab 2", "Tab 3"],
  activeTab = 0,
  content = <CardSkeleton height="h-60" />
}) {
  return (
    <Tabs defaultValue={tabs[activeTab].toLowerCase().replace(" ", "-")} className="w-full">
      <TabsList className={`grid grid-cols-${tabs.length}`}>
        {tabs.map((tab) => (
          <TabsTrigger 
            key={tab} 
            value={tab.toLowerCase().replace(" ", "-")} 
            disabled
          >
            {tab}
          </TabsTrigger>
        ))}
      </TabsList>
      
      <TabsContent value={tabs[activeTab].toLowerCase().replace(" ", "-")}>
        <Card>
          <CardContent className="p-6">
            {content}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}