"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

function decodeToken(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname(); // current route
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const publicRoutes = ["/login", "/register", "/magicLogin", "/resetPassword"];

  if (publicRoutes.includes(pathname)) {
    setLoading(false);
    return;
  }

  const token = localStorage.getItem("token");
  if (!token) {
    router.push("/login");
    return;
  }

  const fetchUser = async () => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token");
      router.push("/login");
      return;
    }

    if (!res.ok) {
      console.warn("Failed to fetch user, but keeping logged in temporarily.");
      setLoading(false);
      return;
    }

    const user = await res.json(); // ✅ read only once

    // Optional: validate JWT expiration
    const decoded = decodeToken(token);
    if (!decoded || (decoded.exp && decoded.exp * 1000 < Date.now())) {
      localStorage.removeItem("token");
      router.push("/login");
      return;
    }

    setUser(user);
    setLoading(false);
  } catch (err) {
    console.error(err);
    localStorage.removeItem("token");
    router.push("/login");
  }
};

  fetchUser();
}, [pathname, router]);


   const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null); // trigger re-render
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {/* don’t block login/register page */}
      {loading ? (
        // ✅ Replace this with your custom loader
        <div className="flex items-center justify-center py-4 bg-white">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}


