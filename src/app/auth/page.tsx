"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useState } from "react";
import LoginForm from "@/components/LoginForm";
import SignupForm from "@/components/SignupForm";
import Spinner from "@/components/Spinner";

export default function AuthPage() {
  const { user, loading } = useAuth(); // assuming loading is returned
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    if (!loading && user) {
      router.push("/"); // redirect only after loading is complete
    }
  }, [user, loading, router]);

  const onToggleForm = () => {
    setIsLogin((prevState) => !prevState);
  };

  // Prevent flashing by showing nothing while loading
  if (loading || user) {
    return (
    <div className="flex items-center justify-center">
      <Spinner></Spinner>
    </div>);
  }

  return (
    <div className="flex items-center justify-center p-15">
      {isLogin ? (
        <LoginForm onToggleForm={onToggleForm} />
      ) : (
        <SignupForm onToggleForm={onToggleForm} />
      )}
    </div>
  );
}
