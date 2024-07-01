import { Providers } from "./providers";
import { GeistSans } from "geist/font/sans";
import { CustomLayout } from "@/components/CustomLayout";
import { APP_BACKGROUND_COLOR } from "@/const/stylesConst";

import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Next.js and Supabase Starter Kit",
  description: "The fastest way to build apps with Next.js and Supabase",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.className}>
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        />
      </head>

      <body>
        <main
          style={{
            minHeight: "100vh",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            backgroundColor: APP_BACKGROUND_COLOR,
          }}
        >
          <Providers>
            <CustomLayout>{children}</CustomLayout>
          </Providers>
        </main>
      </body>
    </html>
  );
}
