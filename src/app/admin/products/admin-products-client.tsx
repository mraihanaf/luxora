"use client"

import dynamic from "next/dynamic"

const AdminProducts = dynamic(() => import("@/components/admin-products"), {
  ssr: false,
})

export default function AdminProductsClient() {
  return <AdminProducts />
}

