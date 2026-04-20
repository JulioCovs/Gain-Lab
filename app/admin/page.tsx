import { Metadata } from "next"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

export const metadata: Metadata = {
  title: "Admin Dashboard | APEX Supplements",
  description: "Panel de administración para gestión de inventario",
}

export default function AdminPage() {
  return <AdminDashboard />
}
