import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kombinlerim",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
