"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Head from 'next/head';
import Link from 'next/link';

const supabaseUrl = "https://drffiolzmavwbbsulplb.supabase.co";
const supabaseKey = "sb_publishable_SNCUbKXAIu3jijB2hK4GIQ_o2klAx5A";
const supabase = createClient(supabaseUrl, supabaseKey);

// Sabitler
const FLOORS = Array.from({ length: 9 }, (_, i) => i); // 0-8
const UNIT_NUMBERS = ['1', '2'];

export default function MaliklerPage() {
  const [owners, setOwners] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const initialForm = {
    first_name: '', last_name: '', tc_no: '', phone: '', email: '', notes: '',
    block_id: '', floor: '', unit_no: '', area: '', unit_type: 'Mesken',
    street_number: '', door_number: ''
  };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    const { data: ownersData } = await supabase.from("owners").select("*, units(block_name, floor, unit_no, type, street_number, door_number)").order("last_name");
    const { data: blocksData } = await supabase.from("blocks").select("*").order("name");
    setOwners(ownersData || []);
    setBlocks(blocksData || []);
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      let ownerId = editingId;
      const ownerData = {
        first_name: formData.first_name, last_name: formData.last_name,
        tc_no: formData.tc_no, phone: formData.phone, email: formData.email, notes: formData.notes
      };

      if (editingId) {
        const { error } = await supabase.from("owners").update(ownerData).eq('id', editingId);
        if (error) throw error;
      } else {
        const { data } = await supabase.from("owners").insert([ownerData]).select();
        if (data) ownerId = data[0].id;
      }

      if (formData.block_id && ownerId) {
        const block = blocks.find(b => b.id === formData.block_id);
        const blockName = block?.name?.toUpperCase() || '';

        if (formData.unit_type === 'Mesken' && formData.floor !== '' && formData.unit_no) {
          const unitData = {
            block_id: formData.block_id, block_name: blockName,
            floor: parseInt(formData.floor), unit_no: formData.unit_no,
            area: parseFloat(formData.area) || 0, type: 'Mesken',
            owner_id: ownerId, owner_name: `${formData.first_name} ${formData.last_name}`,
            owner_phone: formData.phone
          };
          const { data: existing } = await supabase.from("units").select("id").eq("block_name", blockName).eq("floor", unitData.floor).eq("unit_no", unitData.unit_no).eq("type", "Mesken");
          if (existing?.length) {
            await supabase.from("units").update({ owner_id: ownerId, owner_name: unitData.owner_name, owner_phone: unitData.owner_phone }).eq("id", existing[0].id);
          } else {
            await supabase.from("units").insert([unitData]);
          }
        } else if (formData.unit_type === 'İş Yeri' && formData.street_number && formData.door_number) {
          const unitData = {
            block_id: formData.block_id, block_name: blockName,
            floor: -1, unit_no: `İş${formData.door_number}`, type: 'İş Yeri',
            street_number: formData.street_number.toUpperCase(), door_number: formData.door_number,
            owner_id: ownerId, owner_name: `${formData.first_name} ${formData.last_name}`,
            owner_phone: formData.phone
          };
          const { data: existing } = await supabase.from("units").select("id").eq("block_name", blockName).eq("street_number", unitData.street_number).eq("door_number", unitData.door_number).eq("type", "İş Yeri");
          if (existing?.length) {
            await supabase.from("units").update({ owner_id: ownerId, owner_name: unitData.owner_name, owner_phone: unitData.owner_phone }).eq("id", existing[0].id);
          } else {
            await supabase.from("units").insert([unitData]);
          }
        }
      }
      alert("✅ Kaydedildi!");
      resetForm();
      fetchData();
    } catch (error) {
      alert("❌ Hata: " + error.message);
    }
  }

  function resetForm() {
    setShowForm(false);
    setEditingId(null);
    setFormData(initialForm);
  }

  function editOwner(owner) {
    setEditingId(owner.id);
    setFormData({
      first_name: owner.first_name, last_name: owner.last_name,
      tc_no: owner.tc_no || '', phone: owner.phone || '', email: owner.email || '', notes: owner.notes || '',
      block_id: '', floor: '', unit_no: '', area: '', unit_type: 'Mesken', street_number: '', door_number: ''
    });
    setShowForm(true);
  }

  async function deleteOwner(id) {
    if (!confirm('Silmek istediğinize emin misiniz?')) return;
    const { error } = await supabase.from("owners").delete().eq('id', id);
    if (error) { alert("❌ " + error.message); } 
    else { alert("✅ Silindi!"); fetchData(); }
  }

  return (
    <>
      <Head><title>Malikler - SiteYönet</title><script src="https://cdn.tailwindcss.com"></script></Head>
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
            <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
              {showForm ? '❌ İptal' : '+ Yeni Malik'}
            </button>
          </div>

          {showForm && (
            <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
              <h2 className="text-xl font-bold mb-4">{editingId ? '✏️ Düzenle' : '🆕 Yeni Malik'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Kişisel Bilgiler */}
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium mb-1">Ad *</label><input type="text" required className="w-full px-4 py-2 border rounded-lg" value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} placeholder="Ahmet" /></div>
                  <div><label className="block text-sm font-medium mb-1">Soyad *</label><input type="text" required className="w-full px-4 py-2 border rounded-lg" value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} placeholder="Yılmaz" /></div>
                  <div><label className="block text-sm font-medium mb-1">TC No</label><input type="text" className="w-full px-4 py-2 border rounded-lg" value={formData.tc_no} onChange={(e) => setFormData({...formData, tc_no: e.target.value})} placeholder="12345678901" /></div>
                  <div><label className="block text-sm font-medium mb-1">Telefon *</label><input type="tel" required className="w-full px-4 py-2 border rounded-lg" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="0555 123 45 67" /></div>
                  <div><label className="block text-sm font-medium mb-1">E-posta</label><input type="email" className="w-full px-4 py-2 border rounded-lg" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="ahmet@email.com" /></div>
                </div>

                {/* Birim Bilgileri */}
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-bold text-gray-700 mb-3">🏠 Birim Bilgileri</h3>
                  
                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-1">Blok *</label>
                    <select required className="w-full px-4 py-2 border rounded-lg" value={formData.block_id} onChange={(e) => setFormData({...formData, block_id: e.target.value})}>
                      <option value="">Seçiniz...</option>
                      {blocks.map((b) => <option key={b.id} value={b.id}>{b.name} Blok</option>)}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-1">Tip *</label>
                    <select required className="w-full px-4 py-2 border rounded-lg" value={formData.unit_type} onChange={(e) => setFormData({...formData, unit_type: e.target.value})}>
                      <option value="Mesken">🏠 Mesken</option>
                      <option value="İş Yeri">🏪 İş Yeri</option>
                    </select>
                  </div>

                  {formData.unit_type === 'Mesken' && formData.block_id && (
                    <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div><label className="block text-sm font-medium mb-1">Kat *</label><select required className="w-full px-4 py-2 border rounded-lg" value={formData.floor} onChange={(e) => setFormData({...formData, floor: e.target.value})}><option value="">Seçiniz...</option>{FLOORS.map(f => <option key={f} value={f}>{f}. Kat</option>)}</select></div>
                      <div><label className="block text-sm font-medium mb-1">Daire *</label><select required className="w-full px-4 py-2 border rounded-lg" value={formData.unit_no} onChange={(e) => setFormData({...formData, unit_no: e.target.value})}><option value="">Seçiniz...</option>{UNIT_NUMBERS.map(n => <option key={n} value={n}>{n}. Daire</option>)}</select></div>
                      <div><label className="block text-sm font-medium mb-1">Alan (m²) *</label><input type="number" step="0.01" required className="w-full px-4 py-2 border rounded-lg" value={formData.area} onChange={(e) => setFormData({...formData, area: e.target.value})} placeholder="100" /></div>
                      <div className="flex items-end"><div className="bg-blue-100 text-blue-800 px-3 py-2 rounded text-sm">📍 {blocks.find(b => b.id === formData.block_id)?.name} - {formData.floor || '?'} - No:{formData.unit_no || '?'}</div></div>
                    </div>
                  )}

                  {formData.unit_type === 'İş Yeri' && formData.block_id && (
                    <div className="grid grid-cols-2 gap-4 p-4 bg-orange-50 rounded-lg">
                      <div><label className="block text-sm font-medium mb-1">Sokak No *</label><input type="text" required className="w-full px-4 py-2 border rounded-lg uppercase" value={formData.street_number} onChange={(e) => setFormData({...formData, street_number: e.target.value.toUpperCase()})} placeholder="15" /></div>
                      <div><label className="block text-sm font-medium mb-1">Kapı No *</label><input type="text" required className="w-full px-4 py-2 border rounded-lg" value={formData.door_number} onChange={(e) => setFormData({...formData, door_number: e.target.value})} placeholder="1" /></div>
                    </div>
                  )}
                </div>

                <div><label className="block text-sm font-medium mb-1">Notlar</label><textarea className="w-full px-4 py-2 border rounded-lg" rows="2" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} placeholder="Ek bilgi..."></textarea></div>

                <div className="flex gap-3">
                  <button type="submit" className="bg-green-600 text-white px-6 py-3 rounded-lg flex-1">💾 Kaydet</button>
                  <button type="button" onClick={resetForm} className="bg-gray-500 text-white px-6 py-3 rounded-lg">Vazgeç</button>
                </div>
              </form>
            </div>
          )}

          {/* Liste */}
          <div className="bg-white rounded-xl shadow-lg">
            <div className="p-6 border-b"><h2 className="text-xl font-bold">Malikler ({owners.length})</h2></div>
            {loading ? <div className="p-6 text-center">Yükleniyor...</div> : owners.length === 0 ? <div className="p-6 text-center text-gray-500">Henüz yok.</div> : (
              <table className="w-full">
                <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ad Soyad</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telefon</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Birim</th><th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">İşlem</th></tr></thead>
                <tbody className="divide-y">
                  {owners.map((o) => (
                    <tr key={o.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium">{o.first_name} {o.last_name}</td>
                      <td className="px-6 py-4 text-sm">{o.phone || '-'}</td>
                      <td className="px-6 py-4 text-sm">{o.units ? <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">{o.units.block_name} - {o.units.type === 'Mesken' ? `${o.units.floor}.Kat No:${o.units.unit_no}` : `İş Yeri`}</span> : '-'}</td>
                      <td className="px-6 py-4 text-sm text-right space-x-2">
                        <button onClick={() => editOwner(o)} className="text-blue-600">✏️</button>
                        <button onClick={() => deleteOwner(o.id)} className="text-red-600">🗑️</button>
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
