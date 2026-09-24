import type { Metadata } from 'next';
export const metadata: Metadata = {
    title: 'Dolabım',
    description: 'Kıyafetlerini yönet, AI ile analiz et ve düzenle.',
};
export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
