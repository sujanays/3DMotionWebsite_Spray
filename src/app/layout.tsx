import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NANJUNDESHWARA ENTERPRISES",
  description: "A luxury, cinematic, scroll-controlled 3D landing page showcasing state-of-the-art interactive digital art. Powered by React Three Fiber, Three.js, and GSAP.",
  keywords: ["Next.js", "React Three Fiber", "Three.js", "GSAP", "ScrollTrigger", "3D Web", "WebGL", "Digital Art"],
  authors: [{ name: "VKZ Studio", url: "https://vkz.studio" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

