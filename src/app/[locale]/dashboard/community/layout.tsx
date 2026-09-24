import type { Metadata } from 'next';
export const metadata: Metadata = {
    title: 'Topluluk',
    description: 'Moda topluluğuna katıl, kombinlerini paylaş ve stilistlerle tanış.',
};
export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
