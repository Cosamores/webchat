// Import the global styles
import './globals.css';
import { ThemeProvider } from '@/context/themeContext';

export const metadata = {
  title: 'Web Chat App',
  description: 'Uma aplicação de chat em tempo real aberta e independente',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-base text-neutral dark:bg-dark dark:text-base">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}