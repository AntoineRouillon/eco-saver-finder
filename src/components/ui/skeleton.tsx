
import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  aspectRatio?: "square" | "video" | "portrait" | "auto";
  height?: string;
  width?: string;
}

function Skeleton({
  className,
  aspectRatio = "auto",
  height,
  width,
  ...props
}: SkeletonProps) {
  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case "square": return "aspect-square";
      case "video": return "aspect-video";
      case "portrait": return "aspect-[3/4]";
      case "auto": return "";
      default: return "";
    }
  };

  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        getAspectRatioClass(),
        className
      )}
      style={{
        height: height,
        width: width,
      }}
      {...props}
    />
  )
}

export { Skeleton }
