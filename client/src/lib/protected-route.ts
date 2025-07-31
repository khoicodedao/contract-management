// components/ProtectedRoute.tsx
import { isLoggedIn } from "@/lib/auth";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function ProtectedRoute({
  children,
}: {
  children: JSX.Element;
}) {
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login");
    }
  }, []);

  if (!isLoggedIn()) return null; // chưa login thì không render gì cả

  return children;
}
