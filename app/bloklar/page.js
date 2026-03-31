"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Head from 'next/head';
import Link from 'next/link';

const supabaseUrl = "https://drffiolzmavwbbsulplb.supabase.co";
const supabaseKey = "sb_publishable_SNCUbKXAIu3jijB2hK4GIQ_o2klAx5A";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function BloklarPage() {
  const [blocks, setBlocks] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const {  blocksData } = await supabase.from("blocks").select("*").order("name");
    
    const statsData = {};
    for (const block of blocksData || []) {
      const { count } = await supabase.from("units")
        .select("*", { count: "exact", head: true })
        .eq("block_id", block.id);
      statsData[block.id] = count || 0;
    }

    setBlocks(blocksData || []);
    setStats(statsData);
    setLoading(false);
  }

  return (
    <>
      <Head>
        <title>Bloklar - SiteYönet</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </Head>
      <div className="flex h-screen bg-gray-100">
        <aside className="w-64 bg-slate-800 text-white">
          <div className="p-6 border-b border-slate-700">
            <h1 className="text-2xl font-bold">🏢 SiteYönet</h1>
            <p className="text-xs text-slate-400 mt-1">5 Blok - 90 Mesken - 15 İş Yeri</p>
          </div>
          <nav className="p-4 space-y-2">
            <Link href="/" className="block px-4 py-3 hover:bg-slate-700 rounded-lg">📊 Dashboard</Link>
            <Link href="/bloklar" className="block px-4 py-3 bg-slate-700 rounded-lg font-medium">🏢 Bloklar</Link>
            <Link href="/malikler" className="block px-4 py-3 hover:bg-slate-700 rounded-lg">👤 Malikler</Link>
            <Link href="/daireler" className="block px-4 py-3 hover:bg-slate-700 rounded-lg">🏠 Daireler</Link>
            <Link href="/gelir-gider" className="block px-4 py-3 hover:bg-slate-700 rounded-lg">💰 Gelir/Gider</Link>
          </nav>
        </aside>

        <main className="flex-1 p-8 overflow-y-auto">
          <h1 className="text-3xl font-bold mb-6">🏢 Blok Yönetimi</h1>

          {loading ? (
            <div className="text-center">Yükleniyor...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {blocks.map((block) => (
                <div key={block.id} className="bg-gradient-to-br from-blue-500 to-blue-700 text-white p-6 rounded-xl shadow-lg">
                  <div className="text-5xl font-bold mb-3">{block.name}</div>
                  <div className="text-blue-100 text-sm mb-4">{block.description}</div>
                  <div className="border-t border-blue-400 pt-3">
                    <div className="text-sm">
                      <div className="text-blue-200">Toplam Birim</div>
                      <div className="text-2xl font-bold">{stats[block.id] || 0}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold mb-4">📊 Site Özeti</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-blue-600">5</div>
                <div className="text-sm text-gray-600">Blok</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-green-600">90</div>
                <div className="text-sm text-gray-600">Mesken</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-orange-600">15</div>
                <div className="text-sm text-gray-600">İş Yeri</div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
