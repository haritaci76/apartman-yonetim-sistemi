"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Head from 'next/head';
import Link from 'next/link';

const supabaseUrl = "https://drffiolzmavwbbsulplb.supabase.co";
const supabaseKey = "sb_publishable_SNCUbKXAIu3jijB2hK4GIQ_o2klAx5A";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function GelirGiderPage() {
  const [transactions, setTransactions] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'income',
    category: '',
    amount: '',
    description: '',
    unit_id: '',
    payment_date: new Date().toISOString().split('T')[0]
  });

  const incomeCategories = ['Aidat', 'Kira', 'Bağış', 'Faiz', 'Diğer'];
  const expenseCategories = ['Personel', 'SGK', 'Enerji', 'Bakım', 'Onarım', 'Vergi', 'Sigorta', 'Kırtasiye', 'İletişim', 'Diğer'];

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    // İşlemleri getir
    const {  incomeData } = await supabase
      .from("income")
      .select("*, units(block_name, no, owner_name)")
      .order("created_at", { ascending: false });

    const {  expenseData } = await supabase
      .from("expenses")
      .select("*")
      .order("created_at", { ascending: false });

    // Daireleri getir
    const {  unitsData } = await supabase
      .from("units")
      .select("id, block_name, no, owner_name, owner_phone")
      .order("block_name", { ascending: true })
      .order("no", { ascending: true });

    const combined = [
      ...(incomeData || []).map(item => ({ ...item, type: 'income' })),
      ...(expenseData || []).map(item => ({ ...item, type: 'expense' }))
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    setTransactions(combined);
    setUnits(unitsData || []);
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (formData.type === 'income') {
      const { error } = await supabase.from("income").insert([{
        type: formData.category,
        amount: parseFloat(formData.amount),
        description: formData.description,
        unit_id: formData.unit_id || null,
        payment_date: formData.payment_date
      }]);

      if (error) {
        alert("❌ Hata: " + error.message);
      } else {
        alert("✅ Gelir başarıyla kaydedildi ve resmileştirildi!");
        resetForm();
      }
    } else {
      const { error } = await supabase.from("expenses").insert([{
        category: formData.category,
        sub_category: formData.description,
        amount: parseFloat(formData.amount),
        description: formData.description,
        expense_date: formData.payment_date
      }]);

      if (error) {
        alert("❌ Hata: " + error.message);
      } else {
        alert("✅ Gider başarıyla kaydedildi!");
        resetForm();
      }
    }
    fetchData();
  }

  function resetForm() {
    setShowForm(false);
    setFormData({
      type: 'income',
      category: '',
      amount: '',
      description: '',
      unit_id: '',
      payment_date: new Date().toISOString().split('T')[0]
    });
  }

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const formatMoney = (amount) => {
    return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(amount);
  };

  // Seçili daireyi bul
  const selectedUnit = units.find(u => u.id === formData.unit_id);

  return (
    <>
      <Head>
        <title>Gelir/Gider - SiteYönet</title>
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
            <Link href="/gelir-gider" className="block px-4 py-3 bg-slate-700 rounded-lg text-white font-medium">💰 Gelir/Gider</Link>
            <a href="#" className="block px-4 py-3 hover:bg-slate-700 rounded-lg text-slate-300">👥 Personel</a>
            <a href="#" className="block px-4 py-3 hover:bg-slate-700 rounded-lg text-slate-300">⚡ Sayaçlar</a>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">💰 Gelir ve Gider Yönetimi</h1>
            <button 
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
            >
              {showForm ? '❌ İptal' : '+ Yeni Kayıt'}
            </button>
          </div>

          {/* Özet Kartları */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500">
              <p className="text-sm text-gray-500">Toplam Gelir</p>
              <p className="text-2xl font-bold text-green-600 mt-2">{formatMoney(totalIncome)}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-red-500">
              <p className="text-sm text-gray-500">Toplam Gider</p>
              <p className="text-2xl font-bold text-red-600 mt-2">{formatMoney(totalExpense)}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
              <p className="text-sm text-gray-500">Bakiye</p>
              <p className={`text-2xl font-bold mt-2 ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {formatMoney(balance)}
              </p>
            </div>
          </div>

          {/* Form */}
          {showForm && (
            <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Yeni Kayıt Ekle</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tip</label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value, category: '', unit_id: ''})}
                    >
                      <option value="income">💵 Gelir</option>
                      <option value="expense">💸 Gider</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                    <select
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                      <option value="">Seçiniz...</option>
                      {(formData.type === 'income' ? incomeCategories : expenseCategories).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* SADECE GELİR İSE DAİRE SEÇİMİ */}
                  {formData.type === 'income' && (
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        🏠 Daire / Malik Seçimi (Opsiyonel)
                      </label>
                      <select
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                        value={formData.unit_id}
                        onChange={(e) => setFormData({...formData, unit_id: e.target.value})}
                      >
                        <option value="">-- Genel Gelir (Daire Seçilmedi) --</option>
                        {units.map((unit) => (
                          <option key={unit.id} value={unit.id}>
                            {unit.block_name} Blok - No: {unit.no} | {unit.owner_name || 'Belirtilmemiş'} 
                            {unit.owner_phone ? ` (${unit.owner_phone})` : ''}
                          </option>
                        ))}
                      </select>
                      {selectedUnit && (
                        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                          <p className="font-medium text-blue-900">📋 Seçili Daire Bilgileri:</p>
                          <p className="text-blue-700">
                            {selectedUnit.block_name} Blok, No: {selectedUnit.no}
                          </p>
                          <p className="text-blue-700">
                            Malik: {selectedUnit.owner_name || '-'}
                          </p>
                          <p className="text-blue-700">
                            Telefon: {selectedUnit.owner_phone || '-'}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tutar (₺)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tarih</label>
                    <input
                      type="date"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.payment_date}
                      onChange={(e) => setFormData({...formData, payment_date: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Örn: Ekim 2024 aidat ödemesi..."
                  ></textarea>
                </div>
                <button type="submit" className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 w-full font-medium">
                  💾 Kaydet ve Resmileştir
                </button>
              </form>
            </div>
          )}

          {/* İşlem Listesi */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">Son İşlemler</h2>
            </div>
            {loading ? (
              <div className="p-6 text-center">Yükleniyor...</div>
            ) : transactions.length === 0 ? (
              <div className="p-6 text-center text-gray-500">Henüz işlem yok.</div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Daire</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tip</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Açıklama</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tutar</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm">{new Date(t.created_at).toLocaleDateString('tr-TR')}</td>
                      <td className="px-6 py-4 text-sm">
                        {t.units ? (
                          <span className="text-blue-600 font-medium">
                            {t.units.block_name} Blok - No: {t.units.no}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded text-xs ${t.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {t.type === 'income' ? '💵 Gelir' : '💸 Gider'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">{t.type === 'income' ? t.type : t.category}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{t.description || '-'}</td>
                      <td className={`px-6 py-4 text-sm font-bold text-right ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {t.type === 'income' ? '+' : '-'}{formatMoney(t.amount)}
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
