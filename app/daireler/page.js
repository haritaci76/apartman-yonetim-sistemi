"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Head from 'next/head';
import Link from 'next/link';

const supabaseUrl = "https://drffiolzmavwbbsulplb.supabase.co";
const supabaseKey = "sb_publishable_SNCUbKXAIu3jijB2hK4GIQ_o2klAx5A"; // Kendi anahtarını yapıştır
const supabase = createClient(supabaseUrl, supabaseKey);

export default function DairelerPage() {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    block_name: '',
    floor: '',
    no: '',
    area: '',
    type: 'Konut',
    owner_name: '',
    owner_phone: '',
    owner_email: ''
  });

  useEffect(() => {
    fetchUnits();
  }, []);

  async function fetchUnits() {
    const { data } = await supabase.from("units").select("*").order("block_name", { ascending: true });
    setUnits(data || []);
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    const { error } = await supabase.from("units").insert([{
      ...formData,
      floor: parseInt(formData.floor),
      area: parseFloat(formData.area)
    }]);

    if (error) {
      alert("Hata: " + error.message);
    } else {
      alert("✅ Daire başarıyla eklendi!");
      setShowForm(false);
      setFormData({
        block_name: '',
        floor: '',
        no: '',
        area: '',
        type: 'Konut',
        owner_name: '',
        owner_phone: '',
        owner_email: ''
      });
      fetchUnits();
    }
  }

  return (
    <>
      <Head>
        <title>Daireler - SiteYönet</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </Head>
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-800 text-white flex flex-col">
          <div className="p-6 border-b border-slate-700">
            <h1 className="text-2xl font-bold">🏢 SiteYönet</h1>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <Link href="/" className="block px-4 py-3 hover:bg-slate-700 rounded-lg text-slate-300">📊 Dashboard</Link>
            <Link href="/daireler" className="block px-4 py-3 bg-slate-700 rounded-lg text-white font-medium">🏠 Daireler</Link>
            <a href="#" className="block px-4 py-3 hover:bg-slate-700 rounded-lg text-slate-300">💰 Gelir/Gider</a>
            <a href="#" className="block px-4 py-3 hover:bg-slate-700 rounded-lg text-slate-300">👥 Personel</a>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">🏠 Daire Yönetimi</h1>
            <button 
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
            >
              {showForm ? '❌ İptal' : '+ Yeni Daire Ekle'}
            </button>
          </div>

          {/* Daire Ekleme Formu */}
          {showForm && (
            <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Yeni Daire Ekle</h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Blok Adı</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.block_name}
                    onChange={(e) => setFormData({...formData, block_name: e.target.value})}
                    placeholder="A"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kat</label>
                  <input
                    type="number"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.floor}
                    onChange={(e) => setFormData({...formData, floor: e.target.value})}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Daire No</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.no}
                    onChange={(e) => setFormData({...formData, no: e.target.value})}
                    placeholder="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alan (m²)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.area}
                    onChange={(e) => setFormData({...formData, area: e.target.value})}
                    placeholder="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tür</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="Konut">Konut</option>
                    <option value="İş Yeri">İş Yeri</option>
                    <option value="Depo">Depo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Malik Adı</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.owner_name}
                    onChange={(e) => setFormData({...formData, owner_name: e.target.value})}
                    placeholder="Ahmet Yılmaz"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                  <input
                    type="tel"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.owner_phone}
                    onChange={(e) => setFormData({...formData, owner_phone: e.target.value})}
                    placeholder="0555 123 45 67"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.owner_email}
                    onChange={(e) => setFormData({...formData, owner_email: e.target.value})}
                    placeholder="ahmet@email.com"
                  />
                </div>
                <div className="col-span-2">
                  <button type="submit" className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium w-full">
                    💾 Kaydet
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Daire Listesi */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Kayıtlı Daireler</h2>
            </div>
            {loading ? (
              <div className="p-6 text-center text-gray-500">Yükleniyor...</div>
            ) : units.length === 0 ? (
              <div className="p-6 text-center text-gray-500">Henüz daire eklenmemiş.</div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Blok</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kat</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">m²</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tür</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Malik</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telefon</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {units.map((unit) => (
                    <tr key={unit.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{unit.block_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{unit.floor}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{unit.no}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{unit.area} m²</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded text-xs ${unit.type === 'Konut' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}`}>
                          {unit.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{unit.owner_name || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{unit.owner_phone || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
