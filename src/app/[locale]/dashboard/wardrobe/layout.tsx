import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gardırobum",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
