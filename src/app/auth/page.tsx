"use client";

import { useState } from "react";
import LoginForm from "@/components/LoginForm";
import SignupForm from "@/components/SignupForm";
import { Button } from "@/components/ui/button";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState<boolean>(true);

  const onToggleForm = () => {
    setIsLogin((prevState) => !prevState);
  };

  return (
    <div className="flex items-center justify-center">
        {isLogin ? <LoginForm onToggleForm={onToggleForm}/> : <SignupForm onToggleForm={onToggleForm}/>}
    </div>
  );
}
