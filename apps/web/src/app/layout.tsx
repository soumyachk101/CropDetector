import './globals.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Crop Detector — AI Crop Health & Disease Detection',
  description: 'AI-Powered disease detection and organic treatment reports for Indian crops. Photograph your plant and detect issues instantly.',
  manifest: '/manifest.json',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/apple-icon.png" />
        <meta name="theme-color" content="#16A34A" />
      </head>
      <body>
        <div className="app-container">
          {children}
        </div>
      </body>
    </html>
  );
}
