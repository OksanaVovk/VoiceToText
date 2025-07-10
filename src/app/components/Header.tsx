"use client";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";

const Header = () => {
  return (
    <header className="w-full bg-white shadow-md p-4 flex items-center justify-between">
      <h1 className="text-xl font-bold text-gray-800">Voice to Text</h1>

      <SignedIn>
        <UserButton />
      </SignedIn>
      <SignedOut>
        <div className="space-x-4">
          <Link href="/sign-in" passHref>
            <button className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition">
              Sign in
            </button>
          </Link>
          <Link href="/sign-up" passHref>
            <button className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition">
              Sign up
            </button>
          </Link>
        </div>
      </SignedOut>
    </header>
  );
};

export default Header;
