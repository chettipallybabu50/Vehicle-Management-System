
// app/layout.tsx
import ToasterProvider from "@/components/toasterProvider";
import Sidebar from "../components/Sidebar";
import "./globals.css";
import Footer from "@/components/Footer";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body >
        <div className="flex h-screen">
          <Sidebar />
          <main className="flex-grow p-6 bg-white shadow-inner min-w-0 g-container overflow-auto"
          style={{ width: "100%", maxWidth: "none" }}>
            {children}
          </main>
          <ToasterProvider />
        </div>
      </body>
    </html>
  );
}