"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';


const MagicLogin = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token"); // get ?token=... from URL

  useEffect(() => {
    if (!token) return; // wait for token

    const verifyToken = async () => {
      try {
        const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/verify`, { token });

        const { jwt, user } = res.data;

        localStorage.setItem("token", jwt);
        localStorage.setItem("user", JSON.stringify(user));

        router.push("/"); // redirect to home after login
      } catch (err) {
        console.error(err);
        toast.error("Invalid or expired magic link");
        router.push("/login"); // fallback if token invalid
      }
    };

    verifyToken();
  }, [token, router]);

  return <div className="flex items-center justify-center py-4 bg-white">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>;
};

export default MagicLogin;
