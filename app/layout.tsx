import { Providers } from "./providers";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.className} dark`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
