
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavbarWrapper from "./components/NavbarWrapper";
import { Providers } from "./components/Providers";
import { AuthProvider } from "./components/AuthProvider";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "KAVI",
  description: "KAVI Database",
};

export default function RootLayout({ children }) {

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-200`}
      >
       
         <AuthProvider>
          <NavbarWrapper />
          <Providers>{children}</Providers>
        </AuthProvider>

                {/* 👇 Add Toaster once globally */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 5000,
            style: {
              fontSize: '14px',
            },
          }}
        />
        
      </body>
    </html>
  );
}
