"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Head from 'next/head';
import Link from 'next/link';

const supabaseUrl = "https://drffiolzmavwbbsulplb.supabase.co";
const supabaseKey = "sb_publishable_SNCUbKXAIu3jijB2hK4GIQ_o2klAx5A";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function MaliklerPage() {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    tc_no: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  });

  useEffect(() => {
    fetchOwners();
  }, []);

  async function fetchOwners() {
    const { data } = await supabase.from("owners").select("*").order("last_name", { ascending: true });
    setOwners(data || []);
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (editingId) {
      const { error } = await supabase.from("owners").update(formData).eq('id', editingId);
      if (error) {
        alert("❌ Hata: " + error.message);
      } else {
        alert("✅ Malik bilgileri güncellendi!");
        resetForm();
      }
    } else {
      const { error } = await supabase.from("owners").insert([formData]);
      if (error) {
        alert("❌ Hata: " + error.message);
      } else {
        alert("✅ Malik başarıyla eklendi!");
        resetForm();
      }
    }
    fetchOwners();
  }

  function resetForm() {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      first_name: '',
      last_name: '',
      tc_no: '',
      phone: '',
      email: '',
      address: '',
      notes: ''
    });
  }

  function editOwner(owner) {
    setEditingId(owner.id);
    setFormData({
      first_name: owner.first_name,
      last_name: owner.last_name,
      tc_no: owner.tc_no || '',
      phone: owner.phone || '',
      email: owner.email || '',
      address: owner.address || '',
      notes: owner.notes || ''
    });
    setShowForm(true);
  }

  async function deleteOwner(id) {
    if (!confirm('Bu maliki silmek istediğinize emin misiniz?')) return;
    
    const { error } = await supabase.from("owners").delete().eq('id', id);
    if (error) {
      alert("❌ Hata: " + error.message);
    } else {
      alert("✅ Malik silindi!");
      fetchOwners();
    }
  }

  return (
    <>
      <Head>
        <title>Malikler - SiteYönet</title>
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
            <Link href="/daireler" className="block px-4 py-3 hover:bg-slate-700 rounded-lg text-slate-300">🏠 Daireler</Link>
            <Link href="/malikler" className="block px-4 py-3 bg-slate-700 rounded-lg text-white font-medium">👤 Malikler</Link>
            <Link href="/gelir-gider" className="block px-4 py-3 hover:bg-slate-700 rounded-lg text-slate-300">💰 Gelir/Gider</Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">👤 Malik Yönetimi</h1>
            <button 
              onClick={() => { resetForm(); setShowForm(!showForm); }}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
            >
              {showForm ? '❌ İptal' : '+ Yeni Malik Ekle'}
            </button>
          </div>

          {/* Form */}
          {showForm && (
            <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800">
                {editingId ? '✏️ Malik Düzenle' : '🆕 Yeni Malik Ekle'}
              </h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ad *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.first_name}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    placeholder="Ahmet"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Soyad *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.last_name}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    placeholder="Yılmaz"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">TC Kimlik No</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.tc_no}
                    onChange={(e) => setFormData({...formData, tc_no: e.target.value})}
                    placeholder="12345678901"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefon *</label>
                  <input
                    type="tel"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="0555 123 45 67"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="ahmet@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="İstanbul, Kadıköy..."
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notlar</label>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Ek bilgiler..."
                  ></textarea>
                </div>
                <div className="col-span-2 flex gap-3">
                  <button type="submit" className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium flex-1">
                    💾 {editingId ? 'Güncelle' : 'Kaydet'}
                  </button>
                  <button type="button" onClick={resetForm} className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 font-medium">
                    Vazgeç
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Malik Listesi */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">Kayıtlı Malikler ({owners.length})</h2>
            </div>
            {loading ? (
              <div className="p-6 text-center">Yükleniyor...</div>
            ) : owners.length === 0 ? (
              <div className="p-6 text-center text-gray-500">Henüz malik eklenmemiş.</div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ad Soyad</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">TC No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telefon</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">E-posta</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Daireler</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {owners.map((owner) => (
                    <tr key={owner.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {owner.first_name} {owner.last_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{owner.tc_no || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{owner.phone || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{owner.email || '-'}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="text-blue-600 cursor-pointer hover:underline">
                          Dairelerini Gör →
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-right space-x-2">
                        <button 
                          onClick={() => editOwner(owner)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          ✏️ Düzenle
                        </button>
                        <button 
                          onClick={() => deleteOwner(owner.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          🗑️ Sil
                        </button>
                      </td>
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
