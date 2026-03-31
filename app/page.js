"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Head from 'next/head';

// --- SUPABASE BİLGİLERİN ---
const supabaseUrl = "https://drffiolzmavwbbsulplb.supabase.co";
const supabaseKey = "sb_publishable_SNCUbKXAIu3jijB2hK4GIQ_o2klAx5A"; // Kendi anahtarını yapıştır
const supabase = createClient(supabaseUrl, supabaseKey);

export default function Dashboard() {
  const [stats, setStats] = useState({
    tenants: 0,
    units: 0,
    income: 0,
    expense: 0,
    cash: 0,
    personnel: 0,
    licenseStatus: 'Bilinmiyor'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      const { count: tenantsCount } = await supabase.from("tenants").select("*", { count: "exact", head: true });
      const { count: unitsCount } = await supabase.from("units").select("*", { count: "exact", head: true });
      const { count: personnelCount } = await supabase.from("personnel").select("*", { count: "exact", head: true });
      const { data: incomeData } = await supabase.from("income").select("amount");
      const totalIncome = incomeData?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
      const { data: expenseData } = await supabase.from("expenses").select("amount");
      const totalExpense = expenseData?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
      const { data: tenantData } = await supabase.from("tenants").select("license_status").limit(1);
      const licenseStatus = tenantData && tenantData.length > 0 ? tenantData[0].license_status : 'Pasif';

      setStats({
        tenants: tenantsCount || 0,
        units: unitsCount || 0,
        income: totalIncome,
        expense: totalExpense,
        cash: totalIncome - totalExpense,
        personnel: personnelCount || 0,
        licenseStatus: licenseStatus
      });
    } catch (error) {
      console.error("Hata:", error);
    }
    setLoading(false);
  }

  const formatMoney = (amount) => {
    return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(amount);
  };

  return (
    <>
      <Head>
        <title>SiteYönet - Dashboard</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </Head>
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-800 text-white flex flex-col">
          <div className="p-6 border-b border-slate-700">
            <h1 className="text-2xl font-bold">🏢 SiteYönet</h1>
            <p className="text-xs text-slate-400 mt-1">Profesyonel Çözüm</p>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <a href="#" className="block px-4 py-3 bg-slate-700 rounded-lg text-white font-medium">📊 Dashboard</a>
            <a href="#" className="block px-4 py-3 hover:bg-slate-700 rounded-lg text-slate-300">🏠 Daireler</a>
            <a href="#" className="block px-4 py-3 hover:bg-slate-700 rounded-lg text-slate-300">💰 Gelir/Gider</a>
            <a href="#" className="block px-4 py-3 hover:bg-slate-700 rounded-lg text-slate-300">👥 Personel</a>
            <a href="#" className="block px-4 py-3 hover:bg-slate-700 rounded-lg text-slate-300">⚡ Sayaçlar</a>
            <a href="#" className="block px-4 py-3 hover:bg-slate-700 rounded-lg text-slate-300">📄 Raporlar</a>
          </nav>
          <div className="p-4 border-t border-slate-700">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${stats.licenseStatus === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-xs text-slate-300">Lisans: {stats.licenseStatus}</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">v2.0 Pro</p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <header className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Genel Bakış</h2>
              <p className="text-gray-500 mt-1">Hoşgeldiniz, işte site durumu.</p>
            </div>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 shadow-lg font-medium">
              + Yeni Kayıt
            </button>
          </header>

          {loading ? (
            <div className="text-center text-gray-500 mt-20 text-xl">Yükleniyor...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500">
                <p className="text-sm text-gray-500 font-medium">Güncel Kasa</p>
                <p className={`text-3xl font-bold mt-2 ${stats.cash >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatMoney(stats.cash)}
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
                <p className="text-sm text-gray-500 font-medium">Toplam Gelir</p>
                <p className="text-3xl font-bold mt-2 text-gray-800">{formatMoney(stats.income)}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-red-500">
                <p className="text-sm text-gray-500 font-medium">Toplam Gider</p>
                <p className="text-3xl font-bold mt-2 text-gray-800">{formatMoney(stats.expense)}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-purple-500">
                <p className="text-sm text-gray-500 font-medium">Kayıtlı Daire</p>
                <p className="text-3xl font-bold mt-2 text-gray-800">{stats.units}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="font-bold text-gray-800 text-xl mb-4">📋 Sistem Özeti</h3>
              <ul className="space-y-4">
                <li className="flex justify-between border-b pb-3">
                  <span className="text-gray-600">Aktif Site Sayısı</span>
                  <span className="font-bold text-lg">{stats.tenants}</span>
                </li>
                <li className="flex justify-between border-b pb-3">
                  <span className="text-gray-600">Personel Sayısı</span>
                  <span className="font-bold text-lg">{stats.personnel}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">Lisans Durumu</span>
                  <span className={`font-bold text-lg ${stats.licenseStatus === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.licenseStatus === 'active' ? '✅ Aktif' : '⚠️ Pasif'}
                  </span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-xl shadow-lg text-white">
              <h3 className="font-bold text-xl mb-3">🤖 Yapay Zeka Asistanı</h3>
              <p className="text-blue-100 text-sm mb-4">
                Henüz yeterli veri yok. Gelir ve gider kayıtları eklendikten sonra size tasarruf önerileri sunacağım.
              </p>
              <div className="bg-white/20 p-4 rounded-lg text-sm">
                💡 <strong>Öneri:</strong> İlk aidat tahsilatlarını girerek sistemi aktif edin.
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
