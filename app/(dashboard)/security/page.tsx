import { Suspense } from "react";

import MfaClient from "@/modules/auth/mfa";
import { Skeleton } from "@/components/ui/skeleton";

export function SecuritySkeleton() {
  return (
    <div className="w-full max-w-md space-y-4">
      <Skeleton className="h-64 w-full rounded-xl" />
      <Skeleton className="h-40 w-full rounded-xl" />
    </div>
  );
}

export default function SecurityPage() {
  return (
    <div className="flex flex-1 items-start justify-center p-4 md:p-6">
      <Suspense fallback={<SecuritySkeleton />}>
        <MfaClient />
      </Suspense>
    </div>
  );
}
