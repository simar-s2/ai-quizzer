import { SignUpForm } from "@/features/auth/components/SignupForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | AI Quizzer",
  description: "Create a new account",
};

export default function SignUpPage() {
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email below to create your account
        </p>
      </div>
      <SignUpForm />
    </div>
  );
}