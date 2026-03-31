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
  const [blocks, setBlocks] = useState([]);
  const [units, setUnits] = useState([]);
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
    notes: '',
    // Unit bilgileri
    block_id: '',
    floor: '',
    unit_no: '',
    area: '',
    unit_type: 'Konut'
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    // Malikleri getir
    const { data: ownersData } = await supabase
      .from("owners")
      .select("*, units(block_name, floor, no, type)")
      .order("last_name");

    // Blokları getir
    const { data: blocksData } = await supabase.from("blocks").select("*").order("name");
    
    // Daireleri getir
    const { data: unitsData } = await supabase.from("units").select("*").order("block_name");

    setOwners(ownersData || []);
    setBlocks(blocksData || []);
    setUnits(unitsData || []);
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      // 1. Önce owner ekle/güncelle
      let ownerId = editingId;
      const ownerData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        tc_no: formData.tc_no,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        notes: formData.notes
      };

      if (editingId) {
        const { error } = await supabase.from("owners").update(ownerData).eq('id', editingId);
        if (error) throw error;
      } else {
        const { data } = await supabase.from("owners").insert([ownerData]).select();
        if (data) ownerId = data[0].id;
      }

      // 2. Eğer blok/kat/no girilmişse, unit oluştur/güncelle
      if (formData.block_id && formData.floor && formData.unit_no) {
        const block = blocks.find(b => b.id === formData.block_id);
        
        const unitData = {
          block_name: block?.name || formData.block_id,
          floor: parseInt(formData.floor),
          no: formData.unit_no,
          area: parseFloat(formData.area) || 0,
          type: formData.unit_type,
          owner_id: ownerId,
          owner_name: `${formData.first_name} ${formData.last_name}`,
          owner_phone: formData.phone
        };

        // Bu daireye sahip owner var mı kontrol et
        const existingUnit = units.find(u => 
          u.block_name === unitData.block_name && 
          u.floor === unitData.floor && 
          u.no === unitData.no
        );

        if (existingUnit) {
          // Varsa güncelle
          await supabase.from("units").update({
            owner_id: ownerId,
            owner_name: unitData.owner_name,
            owner_phone: unitData.owner_phone
          }).eq('id', existingUnit.id);
        } else {
          // Yoksa yeni oluştur
          await supabase.from("units").insert([unitData]);
        }
      }

      alert("✅ Malik başarıyla kaydedildi!");
      resetForm();
      fetchData();
    } catch (error) {
      alert("❌ Hata: " + error.message);
    }
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
      notes: '',
      block_id: '',
      floor: '',
      unit_no: '',
      area: '',
      unit_type: 'Konut'
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
      notes: owner.notes || '',
      block_id: '',
      floor: '',
      unit_no: '',
      area: '',
      unit_type: 'Konut'
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
      fetchData();
    }
  }

  return (
    <>
      <Head>
        <title>Malikler - SiteYönet</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </Head>
      <div className="flex h-screen bg-gray-100">
        <aside className="w-64 bg-slate-800 text-white">
          <div className="p-6 border-b border-slate-700">
            <h1 className="text-2xl font-bold">🏢 SiteYönet</h1>
          </div>
          <nav className="p-4 space-y-2">
            <Link href="/" className="block px-4 py-3 hover:bg-slate-700 rounded-lg">📊 Dashboard</Link>
            <Link href="/bloklar" className="block px-4 py-3 hover:bg-slate-700 rounded-lg">🏢 Bloklar</Link>
            <Link href="/malikler" className="block px-4 py-3 bg-slate-700 rounded-lg font-medium">👤 Malikler</Link>
            <Link href="/daireler" className="block px-4 py-3 hover:bg-slate-700 rounded-lg">🏠 Daireler</Link>
            <Link href="/gelir-gider" className="block px-4 py-3 hover:bg-slate-700 rounded-lg">💰 Gelir/Gider</Link>
          </nav>
        </aside>

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">👤 Malik Yönetimi</h1>
            <button 
              onClick={() => { resetForm(); setShowForm(!showForm); }}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              {showForm ? '❌ İptal' : '+ Yeni Malik'}
            </button>
          </div>

          {showForm && (
            <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
              <h2 className="text-xl font-bold mb-4">
                {editingId ? '✏️ Malik Düzenle' : '🆕 Yeni Malik Ekle'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Kişisel Bilgiler */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Ad *</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-2 border rounded-lg"
                      value={formData.first_name}
                      onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                      placeholder="Ahmet"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Soyad *</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-2 border rounded-lg"
                      value={formData.last_name}
                      onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                      placeholder="Yılmaz"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">TC No</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border rounded-lg"
                      value={formData.tc_no}
                      onChange={(e) => setFormData({...formData, tc_no: e.target.value})}
                      placeholder="12345678901"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Telefon *</label>
                    <input
                      type="tel"
                      required
                      className="w-full px-4 py-2 border rounded-lg"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="0555 123 45 67"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">E-posta</label>
                    <input
                      type="email"
                      className="w-full px-4 py-2 border rounded-lg"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="ahmet@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Adres</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border rounded-lg"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      placeholder="İstanbul..."
                    />
                  </div>
                </div>

                {/* Daire Bilgileri */}
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-bold text-gray-700 mb-3">🏠 Daire Bilgileri</h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Blok</label>
                      <select
                        className="w-full px-4 py-2 border rounded-lg"
                        value={formData.block_id}
                        onChange={(e) => setFormData({...formData, block_id: e.target.value})}
                      >
                        <option value="">Seçiniz...</option>
                        {blocks.map((block) => (
                          <option key={block.id} value={block.id}>
                            {block.name} Blok
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Kat</label>
                      <input
                        type="number"
                        className="w-full px-4 py-2 border rounded-lg"
                        value={formData.floor}
                        onChange={(e) => setFormData({...formData, floor: e.target.value})}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Daire No</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border rounded-lg"
                        value={formData.unit_no}
                        onChange={(e) => setFormData({...formData, unit_no: e.target.value})}
                        placeholder="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Alan (m²)</label>
                      <input
                        type="number"
                        step="0.01"
                        className="w-full px-4 py-2 border rounded-lg"
                        value={formData.area}
                        onChange={(e) => setFormData({...formData, area: e.target.value})}
                        placeholder="100"
                      />
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="block text-sm font-medium mb-1">Daire Tipi</label>
                    <select
                      className="w-full px-4 py-2 border rounded-lg"
                      value={formData.unit_type}
                      onChange={(e) => setFormData({...formData, unit_type: e.target.value})}
                    >
                      <option value="Konut">Konut</option>
                      <option value="İş Yeri">İş Yeri</option>
                      <option value="Depo">Depo</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Notlar</label>
                  <textarea
                    className="w-full px-4 py-2 border rounded-lg"
                    rows="2"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Ek bilgiler..."
                  ></textarea>
                </div>

                <div className="flex gap-3">
                  <button type="submit" className="bg-green-600 text-white px-6 py-3 rounded-lg flex-1">
                    💾 {editingId ? 'Güncelle' : 'Kaydet'}
                  </button>
                  <button type="button" onClick={resetForm} className="bg-gray-500 text-white px-6 py-3 rounded-lg">
                    Vazgeç
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Malik Listesi */}
          <div className="bg-white rounded-xl shadow-lg">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Kayıtlı Malikler ({owners.length})</h2>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telefon</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Daire</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">E-posta</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {owners.map((owner) => (
                    <tr key={owner.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium">{owner.first_name} {owner.last_name}</td>
                      <td className="px-6 py-4 text-sm">{owner.phone || '-'}</td>
                      <td className="px-6 py-4 text-sm">
                        {owner.units ? (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                            {owner.units.block_name} Blok - Kat:{owner.units.floor} - No:{owner.units.no}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">{owner.email || '-'}</td>
                      <td className="px-6 py-4 text-sm text-right space-x-2">
                        <button onClick={() => editOwner(owner)} className="text-blue-600 hover:text-blue-800">✏️</button>
                        <button onClick={() => deleteOwner(owner.id)} className="text-red-600 hover:text-red-800">🗑️</button>
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
