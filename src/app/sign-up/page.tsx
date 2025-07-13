import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex bg-white items-center justify-center min-h-screen px-4 py-6">
      <SignUp routing="hash" signInUrl="/sign-in" />
    </div>
  );
}
