import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getAdminSession } from "@/lib/auth";
import { getBookings } from "@/lib/bookings";
import { getProducts, getBundles } from "@/lib/catalog";
import { readContent } from "@/lib/content";
import AdminPortal from "@/components/AdminPortal";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getAdminSession();
  if (!session.authed) {
    redirect("/admin/login");
  }
  const [bookings, products, bundles, content] = await Promise.all([
    getBookings(),
    getProducts(),
    getBundles(),
    readContent(),
  ]);
  return (
    <AdminPortal
      bookings={bookings}
      products={products}
      bundles={bundles}
      customProducts={content.customProducts}
      customBundles={content.customBundles}
      leads={content.leads}
      site={content.site}
      media={content.media}
      pages={content.pages}
      demo={session.demo}
      email={session.email}
    />
  );
}
