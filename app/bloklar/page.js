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
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchBlocks();
  }, []);

  async function fetchBlocks() {
    const { data } = await supabase.from("blocks").select("*").order("name");
    setBlocks(data || []);
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    const { error } = await supabase.from("blocks").insert([{
      name: formData.name.toUpperCase(),
      description: formData.description
    }]);

    if (error) {
      alert("❌ Hata: " + error.message);
    } else {
      alert("✅ Blok eklendi!");
      setFormData({ name: '', description: '' });
      setShowForm(false);
      fetchBlocks();
    }
  }

  async function deleteBlock(id) {
    if (!confirm('Bu bloğu silmek istediğinize emin misiniz?')) return;
    
    const { error } = await supabase.from("blocks").delete().eq('id', id);
    if (error) {
      alert("❌ Hata: " + error.message);
    } else {
      alert("✅ Blok silindi!");
      fetchBlocks();
    }
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
          </div>
          <nav className="p-4 space-y-2">
            <Link href="/" className="block px-4 py-3 hover:bg-slate-700 rounded-lg">📊 Dashboard</Link>
            <Link href="/bloklar" className="block px-4 py-3 bg-slate-700 rounded-lg font-medium">🏢 Bloklar</Link>
            <Link href="/malikler" className="block px-4 py-3 hover:bg-slate-700 rounded-lg">👤 Malikler</Link>
            <Link href="/daireler" className="block px-4 py-3 hover:bg-slate-700 rounded-lg">🏠 Daireler</Link>
          </nav>
        </aside>

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">🏢 Blok Yönetimi</h1>
            <button 
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              {showForm ? '❌ İptal' : '+ Yeni Blok'}
            </button>
          </div>

          {showForm && (
            <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
              <h2 className="text-xl font-bold mb-4">Yeni Blok Ekle</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Blok Adı</label>
                  <input
                    type="text"
                    required
                    maxLength={1}
                    className="w-full px-4 py-2 border rounded-lg uppercase"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value.toUpperCase()})}
                    placeholder="A"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Açıklama</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border rounded-lg"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="A Blok - Ana Giriş"
                  />
                </div>
                <button type="submit" className="bg-green-600 text-white px-6 py-3 rounded-lg w-full">
                  💾 Kaydet
                </button>
              </form>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-lg">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Bloklar ({blocks.length})</h2>
            </div>
            {blocks.length === 0 ? (
              <div className="p-6 text-center text-gray-500">Henüz blok eklenmemiş.</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-6">
                {blocks.map((block) => (
                  <div key={block.id} className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl text-center shadow-lg relative group">
                    <div className="text-4xl font-bold mb-2">{block.name}</div>
                    <div className="text-sm text-blue-100">{block.description || 'Blok'}</div>
                    <button 
                      onClick={() => deleteBlock(block.id)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-red-600 p-2 rounded-lg transition"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
