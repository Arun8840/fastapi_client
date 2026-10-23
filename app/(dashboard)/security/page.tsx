import MfaClient from "@/modules/auth/mfa";

export default function SecurityPage() {
  return (
    <div className="flex flex-1 items-start justify-center p-4 md:p-6">
      <MfaClient />
    </div>
  );
}
