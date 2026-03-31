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
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
const [formData, setFormData] = useState({
  first_name: '',
  last_name: '',
  tc_no: '',
  phone: '',
  email: '',
  notes: '',
  block_id: '',
  floor: '',
  unit_no: '',
  area: '',  // ← EKLE
  unit_type: 'Mesken',
  street_number: '',
  door_number: ''
});
  useEffect(() => {
    fetchData();  
  }, []);

  async function fetchData() {
    const {  ownersData } = await supabase
      .from("owners")
      .select("*, units(block_name, floor, unit_no, type, street_number, door_number)")
      .order("last_name");

    const {  blocksData } = await supabase.from("blocks").select("*").order("name");

    setOwners(ownersData || []);
    setBlocks(blocksData || []);
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      // 1. Owner ekle/güncelle
      let ownerId = editingId;
      const ownerData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        tc_no: formData.tc_no,
        phone: formData.phone,
        email: formData.email,
        notes: formData.notes
      };

      if (editingId) {
        const { error } = await supabase.from("owners").update(ownerData).eq('id', editingId);
        if (error) throw error;
      } else {
        const { data } = await supabase.from("owners").insert([ownerData]).select();
        if (data) ownerId = data[0].id;
      }

      // 2. Daire/İş yeri bilgilerini güncelle
      if (formData.block_id && ownerId) {
        const block = blocks.find(b => b.id === formData.block_id);
        const blockName = block?.name.toUpperCase() || '';

        if (formData.unit_type === 'Mesken') {
          // MESKEN için
          if (formData.floor !== '' && formData.unit_no) {
            const unitData = {
              block_id: formData.block_id,
              block_name: blockName,
              floor: parseInt(formData.floor),
              unit_no: formData.unit_no,
              type: 'Mesken',
              owner_id: ownerId,
              owner_name: `${formData.first_name} ${formData.last_name}`,
              owner_phone: formData.phone,
              street_number: null,
              door_number: null
            };

            // Var mı kontrol et
            const {  existing } = await supabase
              .from("units")
              .select("id")
              .eq("block_name", blockName)
              .eq("floor", unitData.floor)
              .eq("unit_no", unitData.unit_no)
              .eq("type", "Mesken");

            if (existing && existing.length > 0) {
              await supabase.from("units").update({
                owner_id: ownerId,
                owner_name: unitData.owner_name,
                owner_phone: unitData.owner_phone
              }).eq("id", existing[0].id);
            } else {
              await supabase.from("units").insert([unitData]);
            }
          }
        } else {
          // İŞ YERİ için
          if (formData.street_number && formData.door_number) {
            const unitData = {
              block_id: formData.block_id,
              block_name: blockName,
              floor: -1,
              unit_no: `İş${formData.door_number}`,
              type: 'İş Yeri',
              street_number: formData.street_number.toUpperCase(),
              door_number: formData.door_number,
              owner_id: ownerId,
              owner_name: `${formData.first_name} ${formData.last_name}`,
              owner_phone: formData.phone
            };

            const {  existing } = await supabase
              .from("units")
              .select("id")
              .eq("block_name", blockName)
              .eq("street_number", unitData.street_number)
              .eq("door_number", unitData.door_number)
              .eq("type", "İş Yeri");

            if (existing && existing.length > 0) {
              await supabase.from("units").update({
                owner_id: ownerId,
                owner_name: unitData.owner_name,
                owner_phone: unitData.owner_phone
              }).eq("id", existing[0].id);
            } else {
              await supabase.from("units").insert([unitData]);
            }
          }
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
    notes: '',
    block_id: '',
    floor: '',
    unit_no: '',
    area: '',  // ← EKLE
    unit_type: 'Mesken',
    street_number: '',
    door_number: ''
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
      notes: owner.notes || '',
      block_id: '',
      floor: '',
      unit_no: '',
      unit_type: 'Mesken',
      street_number: '',
      door_number: ''
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

  // Kat ve daire seçenekleri
  const floors = Array.from({ length: 9 }, (_, i) => i); // 0-8
  const unitNumbers = ['1', '2']; // Her katta 2 daire

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
            <p className="text-xs text-slate-400 mt-1">5 Blok - 90 Mesken</p>
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
                </div>

                {/* Daire/İş Yeri Bilgileri */}
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-bold text-gray-700 mb-3">🏠 Daire/İş Yeri Bilgileri</h3>
                  
                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-1">Birim Tipi *</label>
                    <select
                      required
                      className="w-full px-4 py-2 border rounded-lg"
                      value={formData.unit_type}
                      onChange={(e) => setFormData({...formData, unit_type: e.target.value})}
                    >
                      <option value="Mesken">🏠 Mesken (Daire)</option>
                      <option value="İş Yeri">🏪 İş Yeri</option>
                    </select>
                  </div>

  {formData.unit_type === 'Mesken' && formData.block_id && (
  <div className="grid grid-cols-4 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Kat *</label>
      <select
        required
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        value={formData.floor}
        onChange={(e) => setFormData({...formData, floor: e.target.value})}
      >
        <option value="">Seçiniz...</option>
        {floors.map((f) => (
          <option key={f} value={f}>{f}. Kat</option>
        ))}
      </select>
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Daire No *</label>
      <select
        required
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        value={formData.unit_no}
        onChange={(e) => setFormData({...formData, unit_no: e.target.value})}
      >
        <option value="">Seçiniz...</option>
        {unitNumbers.map((n) => (
          <option key={n} value={n}>{n}. Daire</option>
        ))}
      </select>
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Alan (m²) *</label>
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
    <div className="flex items-end">
      <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg text-sm font-medium">
        📍 {blocks.find(b => b.id === formData.block_id)?.name} - {formData.floor || '?'}. Kat - No: {formData.unit_no || '?'}
      </div>
    </div>
  </div>
)}
      <label className="block text-sm font-medium mb-1">Alan (m²) *</label>
      <input
        type="number"
        step="0.01"
        required
        className="w-full px-4 py-2 border rounded-lg"
        value={formData.area}
        onChange={(e) => setFormData({...formData, area: e.target.value})}
        placeholder="100"
      />
    </div>
  </div>
)}
                  {formData.unit_type === 'İş Yeri' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Sokak No *</label>
                        <input
                          type="text"
                          required
                          className="w-full px-4 py-2 border rounded-lg uppercase"
                          value={formData.street_number}
                          onChange={(e) => setFormData({...formData, street_number: e.target.value.toUpperCase()})}
                          placeholder="örn: 15"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Kapı No *</label>
                        <input
                          type="text"
                          required
                          className="w-full px-4 py-2 border rounded-lg"
                          value={formData.door_number}
                          onChange={(e) => setFormData({...formData, door_number: e.target.value})}
                          placeholder="örn: 1"
                        />
                      </div>
                    </div>
                  )}
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Birim</th>
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
                          owner.units.type === 'Mesken' ? (
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                              {owner.units.block_name} Blok - {owner.units.floor}. Kat - No: {owner.units.unit_no}
                            </span>
                          ) : (
                            <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-medium">
                              {owner.units.block_name} Blok - İş Yeri (Sokak: {owner.units.street_number}, Kapı: {owner.units.door_number})
                            </span>
                          )
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">{owner.email || '-'}</td>
                      <td className="px-6 py-4 text-sm text-right space-x-2">
                        <button onClick={() => editOwner(owner)} className="text-blue-600 hover:text-blue-800">✏️ Düzenle</button>
                        <button onClick={() => deleteOwner(owner.id)} className="text-red-600 hover:text-red-800">🗑️ Sil</button>
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
