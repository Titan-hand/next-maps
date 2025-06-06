import { Providers } from "./providers";
import { GeistSans } from "geist/font/sans";
import { CustomLayout } from "@/components/CustomLayout";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.className} dark h-full`}>
      {/* <head>
        <script src="https://unpkg.com/react-scan/dist/auto.global.js" async />
      </head> */}
      <body className="h-full">
        <Providers>
          <CustomLayout>{children}</CustomLayout>
        </Providers>
      </body>
    </html>
  );
}
