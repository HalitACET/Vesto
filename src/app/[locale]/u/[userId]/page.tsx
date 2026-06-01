import type { Metadata } from 'next';
import { adminDb } from '@/lib/firebase/server';
import PublicProfileClient from './PublicProfileClient';

export const revalidate = 60; // ISR: Her 60 saniyede bir

export async function generateMetadata({
  params
}: {
  params: Promise<{ userId: string }>
}): Promise<Metadata> {
  try {
    const { userId } = await params;
    const userDoc = await adminDb.collection('users').doc(userId).get();
    const user = userDoc.data();

    if (!user) return { title: 'Kullanıcı Bulunamadı' };

    return {
      title: `${user.displayName} — Vesto`,
      description: user.bio
        || `${user.displayName}'in Vesto profili. ${user.followerCount ?? 0} takipçi.`,
      openGraph: {
        title: `${user.displayName} | Vesto`,
        description: user.bio || `${user.displayName}'in Vesto profili`,
        images: user.photoUrl ? [{ url: user.photoUrl }] : ['/og-image.png'],
      },
    };
  } catch {
    return { title: 'Vesto' };
  }
}

export default async function PublicProfilePage({
  params
}: {
  params: Promise<{ userId: string; locale: string }>
}) {
  const { userId } = await params;
  return <PublicProfileClient userId={userId} />;
}
