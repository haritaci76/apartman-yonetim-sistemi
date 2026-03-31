import './globals.css'

export const metadata = {
  title: "Apartman Yönetim Sistemi",
  description: "Profesyonel Site ve Apartman Yönetimi",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
