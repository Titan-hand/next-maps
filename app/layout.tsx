import { Providers } from "./providers";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.className} dark`}>
      {/* <head>
        <script src="https://unpkg.com/react-scan/dist/auto.global.js" async />
      </head> */}
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
