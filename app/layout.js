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

export const metadata = {
  title: "SecureVolt Solutions | Security Camera Installation Cleveland, OH",
  description:
    "SecureVolt Solutions Inc provides professional security camera installation, CCTV systems, and low-voltage cabling for residential and commercial clients in Cleveland and Northeast Ohio.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}
      >
        {/* Page Content */}
        <main>{children}</main>

        {/* Footer */}
        <footer className="mt-20 border-t border-gray-800 py-8 text-sm text-gray-300">
          <div className="container mx-auto px-4 text-center space-y-2">
            <p className="font-semibold text-white">
              SecureVolt Solutions Inc
            </p>

            <p>
              898 Wayside Rd, Cleveland, OH 44110
            </p>

            <p>
              Business Line:{" "}
              <a
                href="tel:12166320022"
                className="text-green-400 hover:underline"
              >
                216-632-0022
              </a>{" "}
              | Business Cell:{" "}
              <a
                href="tel:12163772523"
                className="text-green-400 hover:underline"
              >
                216-377-2523
              </a>
            </p>

            <p className="text-gray-500">
              Professional Security Camera Installation & Low-Voltage Systems
              <br />
              Serving Cleveland and Northeast Ohio
            </p>

            <p className="text-gray-600 mt-2">
              © {new Date().getFullYear()} SecureVolt Solutions Inc. All rights reserved.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
