import type { Metadata } from "next";
// import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// const inter = Inter({ subsets: ["latin"] });

const navBarSource: NavBarSource = {
  title: 'Hojoong Chung',
  menus: [
    { id: 1, menuTitle: 'CV', path: '/cv' },
    { id: 2, menuTitle: 'Works', path: '/works' },
  ]
}

export const metadata: Metadata = {
  title: "Hojoong Chung - Microproducts",
  description: "Hojoong's very personal but also very public space in the web",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html data-theme="dark" lang="en">
      {/* <body className={inter.className}>{children}</body> */}
      <body className="flex flex-col mb-auto items-center justify-between">
        <Navbar navBarSource={navBarSource} />
        {children}
        {/* <Footer /> */}
      </body>
    </html>
  );
}
