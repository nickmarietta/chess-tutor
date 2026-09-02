import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chess Tutor — Game review",
  description:
    "Import Chess.com games or paste PGN, review moves, and analyze positions with Stockfish.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{
  var ACCENTS={indigo:'#5b73e8',emerald:'#10b981',rose:'#f43f5e',amber:'#f59e0b',cyan:'#06b6d4',violet:'#8b5cf6'};
  var s=localStorage.getItem('chess-tutor-theme');
  var scheme=(s==='dark'||s==='light'||s==='oled')?s:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
  document.documentElement.setAttribute('data-scheme',scheme);
  document.documentElement.classList.toggle('dark',scheme!=='light');
  document.documentElement.style.colorScheme=scheme==='light'?'light':'dark';
  var a=localStorage.getItem('chess-tutor-accent');
  var accentHex=ACCENTS[a]||ACCENTS.indigo;
  document.documentElement.style.setProperty('--accent',accentHex);
}catch(e){}})();`,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col bg-[var(--bg)] text-[var(--text)]">
        <ThemeProvider>
          <Header />
          <main className="flex-1">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
