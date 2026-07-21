import { Loader } from "@/components/ui/Loader";

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[70vh] w-full" aria-busy="true" aria-label="Loading page">
      <Loader label="Loading Page..." />
    </div>
  );
}
