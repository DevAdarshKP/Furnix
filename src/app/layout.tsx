import type { Metadata } from "next";
import "lenis/dist/lenis.css";
import "./globals.css";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "FURNIX — Calm Objects for Slow Homes",
  description:
    "Curated furniture, modern seating, and architectural lighting. Pieces that get better the longer you live with them.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full"
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var origWarn = console.warn;
                console.warn = function() {
                  if (arguments[0] && typeof arguments[0] === 'string' && arguments[0].indexOf('THREE.Clock') !== -1) {
                    return;
                  }
                  origWarn.apply(console, arguments);
                };
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-[#F2EFE9] text-[#191816] antialiased">
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
