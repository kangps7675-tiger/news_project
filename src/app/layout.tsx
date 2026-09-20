import type { Metadata } from "next";
import { Space_Grotesk, Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
});

const body = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex",
  display: "swap",
});

export const metadata: Metadata = {
  title: "뉴스 뒷맥락",
  description:
    "뉴스 텍스트를 붙여넣으면 사건의 배경을 4단으로 풀고, 지정학 네트워크 속 위치를 보여줍니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${display.variable} ${body.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
