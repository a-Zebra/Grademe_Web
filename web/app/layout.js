import "./globals.css";
import { CleanupButton } from "@/components/ui/CleanupButton";

export const metadata = {
  title: "Grademe Web",
  description: "42 exam simulation UI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-950 text-neutral-100">
        {children}
        <CleanupButton />
      </body>
    </html>
  );
}
