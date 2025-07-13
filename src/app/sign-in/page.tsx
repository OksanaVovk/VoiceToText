import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex bg-white items-center justify-center min-h-screen px-4 py-6">
      <SignIn routing="hash" signUpUrl="/sign-up" />
    </div>
  );
}
