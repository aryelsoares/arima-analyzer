import type { Metadata } from "next";
import "./globals.css";
import { Poppins } from "next/font/google";
import "../lib/fontawesome";
import Header from "../components/Header";
import Footer from "../components/Footer";

const poppins = Poppins({ subsets: ['latin'], weight: ['400', '600'] });

export const metadata: Metadata = {
  title: "ARIMA Analyser",
  description: "ARIMA based time series analysis tool",
  authors: [{ name: "Aryel Soares "}],
  keywords: ["ARIMA", "SARIMA", "Time Series", "Data Analysis", "Data Science"]
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${poppins.className} min-h-screen flex flex-col bg-bg text-text`}>
        <Header />

        <main className="flex-1">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}
