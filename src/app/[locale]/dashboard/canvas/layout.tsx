import type { Metadata } from 'next';
export const metadata: Metadata = {
    title: 'Kombin Editörü',
    description: 'Sürükle bırak ile kombin oluştur, mannekende dene.',
};
export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
