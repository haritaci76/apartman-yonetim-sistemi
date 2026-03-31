"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Supabase bağlantı ayarları
const supabaseUrl = "BURAYA_SUPABASE_URL_GELECEK";
const supabaseKey = "sb_publishable_SNCUbKXAIu3jijB2hK4GIQ_o2klAx5A";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function Home() {
  const [tenants, setTenants] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      // Siteleri getir
      const { data: tenantsData } = await supabase
        .from("tenants")
        .select("*");
      
      // Daireleri getir
      const { data: unitsData } = await supabase
        .from("units")
        .select("*");

      setTenants(tenantsData || []);
      setUnits(unitsData || []);
    } catch (error) {
      console.error("Hata:", error);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold">🏢 Apartman Yönetim Sistemi</h1>
          <p className="mt-2 text-blue-100">Profesyonel Site ve Apartman Yönetimi</p>
        </div>
      </header>

      {/* Ana İçerik */}
      <main className="max-w-6xl mx-auto p-6">
        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <h3 className="text-gray-500 text-sm font-medium">Toplam Site/Apartman</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">{tenants.length}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
            <h3 className="text-gray-500 text-sm font-medium">Toplam Daire</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">{units.length}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
            <h3 className="text-gray-500 text-sm font-medium">Sistem Durumu</h3>
            <p className="text-xl font-bold text-green-600 mt-2">
              {loading ? "Yükleniyor..." : "✅ Aktif"}
            </p>
          </div>
        </div>

        {/* Kayıtlı Siteler */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">📋 Kayıtlı Siteler & Apartmanlar</h2>
          {tenants.length === 0 ? (
            <p className="text-gray-500">Henüz site kaydı yok.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">ID</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Ad</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Eklenme Tarihi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {tenants.map((tenant) => (
                    <tr key={tenant.id}>
                      <td className="px-4 py-3 text-sm text-gray-600">{tenant.id.slice(0, 8)}...</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{tenant.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(tenant.created_at).toLocaleDateString("tr-TR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Daire Listesi */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">🏠 Kayıtlı Daireler</h2>
          {units.length === 0 ? (
            <p className="text-gray-500">Henüz daire kaydı yok.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Blok</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Kat</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">No</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">m²</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Tür</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Malik</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {units.map((unit) => (
                    <tr key={unit.id}>
                      <td className="px-4 py-3 text-sm text-gray-900">{unit.block_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{unit.floor}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{unit.no}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{unit.area}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {unit.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{unit.owner_name || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white text-center p-4 mt-8">
        <p>© 2024 Apartman Yönetim Sistemi - Tüm hakları saklıdır.</p>
      </footer>
    </div>
  );
}
