import { Suspense } from "react";
import SearchContent from "./SearchContent";

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-8">Duke kërkuar...</div>}>
      <SearchContent />
    </Suspense>
  );
}