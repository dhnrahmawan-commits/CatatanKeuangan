import React, { useState, useMemo, useEffect } from 'react';
import { 
  Home, Calculator, Wallet, PiggyBank, User, Camera, 
  FileText, Printer, X, Plus, ArrowUp, ArrowDown, ChevronRight 
} from 'lucide-react';

const formatRupiah = (angka) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(angka || 0);
};

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [notification, setNotification] = useState(null);

  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('keuanganku_profile');
    return saved ? JSON.parse(saved) : { name: 'Pengguna', photo: '' };
  });

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('keuanganku_tx');
    return saved ? JSON.parse(saved) : [];
  });

  const [savings, setSavings] = useState(() => {
    const saved = localStorage.getItem('keuanganku_savings');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => { localStorage.setItem('keuanganku_profile', JSON.stringify(userProfile)); }, [userProfile]);
  useEffect(() => { localStorage.setItem('keuanganku_tx', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('keuanganku_savings', JSON.stringify(savings)); }, [savings]);

  const showNotification = (msg, type = 'default') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const { totalBalance, totalIn, totalOut } = useMemo(() => {
    let balance = 0, inAmount = 0, outAmount = 0;
    (transactions || []).forEach(t => {
      if (t.type === 'in') { balance += t.amount; inAmount += t.amount; }
      else { balance -= t.amount; outAmount += t.amount; }
    });
    return { totalBalance: balance, totalIn: inAmount, totalOut: outAmount };
  }, [transactions]);

  // --- VIEWS ---
  const HomeView = () => {
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [editName, setEditName] = useState(userProfile.name);
    const [editPhoto, setEditPhoto] = useState(userProfile.photo);

    const handlePhotoUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => setEditPhoto(reader.result);
        reader.readAsDataURL(file);
      }
    };

    const saveProfile = () => {
      setUserProfile({ name: editName, photo: editPhoto });
      setShowProfileModal(false);
      showNotification('Profil berhasil disimpan!', 'default');
    };

    return (
      <div style={{ padding: '20px', paddingBottom: '120px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <p style={{ color: '#64748b', fontSize: '13px', margin: 0, fontWeight: 500 }}>Selamat Datang,</p>
            <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e293b', margin: '2px 0 0 0' }}>{userProfile.name || 'Pengguna'}</h1>
          </div>
          <button onClick={() => setShowProfileModal(true)} style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#dbeafe', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', overflow: 'hidden', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            {userProfile.photo ? <img src={userProfile.photo} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={24} />}
          </button>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', borderRadius: '24px', padding: '24px', color: 'white', boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.4)', position: 'relative', overflow: 'hidden', marginBottom: '20px' }}>
          <p style={{ color: '#bfdbfe', fontSize: '13px', margin: '0 0 4px 0', fontWeight: 500 }}>Total Saldo Saat Ini</p>
          <h2 style={{ fontSize: '32px', fontWeight: '800', margin: '0 0 20px 0', letterSpacing: '-0.5px' }}>{formatRupiah(totalBalance)}</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '16px' }}>
            <div>
              <p style={{ fontSize: '11px', color: '#bfdbfe', display: 'flex', alignItems: 'center', gap: '4px', margin: '0 0 4px 0' }}><ArrowUp size={14}/> Pemasukan</p>
              <p style={{ fontWeight: 'bold', fontSize: '14px', margin: 0 }}>{formatRupiah(totalIn)}</p>
            </div>
            <div>
              <p style={{ fontSize: '11px', color: '#bfdbfe', display: 'flex', alignItems: 'center', gap: '4px', margin: '0 0 4px 0' }}><ArrowDown size={14}/> Pengeluaran</p>
              <p style={{ fontWeight: 'bold', fontSize: '14px', margin: 0 }}>{formatRupiah(totalOut)}</p>
            </div>
          </div>
        </div>

        {(savings || []).length > 0 && (
           <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9', marginBottom: '20px' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
               <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>Target Tabungan</h3>
               <button onClick={() => setActiveTab('savings')} style={{ fontSize: '12px', fontWeight: 'bold', color: '#2563eb', backgroundColor: '#eff6ff', border: 'none', padding: '6px 12px', borderRadius: '20px', cursor: 'pointer' }}>Lihat Semua</button>
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {savings.slice(0, 2).map(s => {
                  const progress = Math.min((s.current / s.target) * 100, 100).toFixed(1);
                  return (
                    <div key={s.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                        <span style={{ fontWeight: 'bold', color: '#334155' }}>{s.name}</span>
                        <span style={{ fontWeight: 'bold', color: '#64748b' }}>{formatRupiah(s.current)} <span style={{ color: '#94a3b8', fontWeight: 'normal' }}>/ {formatRupiah(s.target)}</span></span>
                      </div>
                      <div style={{ width: '100%', backgroundColor: '#f1f5f9', borderRadius: '99px', height: '8px', overflow: 'hidden' }}>
                        <div style={{ backgroundColor: '#2563eb', height: '100%', width: `${progress}%`, borderRadius: '99px' }}></div>
                      </div>
                    </div>
                  )
                })}
             </div>
           </div>
        )}

        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#1e293b', marginBottom: '14px' }}>Transaksi Terakhir</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {transactions.length === 0 ? (
               <p style={{ color: '#94a3b8', textAlign: 'center', fontSize: '13px', backgroundColor: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #f1f5f9', margin: 0 }}>Belum ada transaksi.</p>
            ) : (
              transactions.slice().reverse().slice(0, 3).map(t => (
                <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: 'white', borderRadius: '18px', border: '1px solid #f8fafc', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ padding: '10px', borderRadius: '14px', backgroundColor: t.type === 'in' ? '#dcfce7' : '#fee2e2', color: t.type === 'in' ? '#16a34a' : '#dc2626', display: 'flex' }}>
                      {t.type === 'in' ? <ArrowUp size={18} /> : <ArrowDown size={18} />}
                    </div>
                    <div>
                      <p style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '14px', margin: '0 0 2px 0' }}>{t.note}</p>
                      <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0, fontWeight: 500 }}>{new Date(t.date).toLocaleDateString('id-ID')}</p>
                    </div>
                  </div>
                  <p style={{ fontWeight: 'bold', fontSize: '14px', margin: 0, color: t.type === 'in' ? '#16a34a' : '#dc2626' }}>
                    {t.type === 'in' ? '+' : '-'}{formatRupiah(t.amount)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {showProfileModal && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setShowProfileModal(false)}>
            <div style={{ backgroundColor: 'white', width: '100%', maxWidth: '340px', borderRadius: '28px', padding: '24px', position: 'relative', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} onClick={e => e.stopPropagation()}>
              <button onClick={() => setShowProfileModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', padding: '8px', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '50%', cursor: 'pointer', color: '#64748b' }}><X size={18}/></button>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginTop: 0, marginBottom: '20px' }}>Edit Profil</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#f1f5f9', border: '3px solid white', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                  {editPhoto ? <img src={editPhoto} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={36} color="#94a3b8"/>}
                </div>
                <label style={{ backgroundColor: '#eff6ff', color: '#2563eb', padding: '8px 16px', borderRadius: '14px', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <Camera size={16}/> Ubah Foto Galeri
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />
                </label>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '8px' }}>Nama Panggilan</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} style={{ width: '100%', padding: '12px 16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} placeholder="Masukkan nama..." />
              </div>
              
              <button onClick={saveProfile} style={{ width: '100%', padding: '14px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '14px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}>
                Simpan Perubahan
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const SalaryView = () => {
    const [tab, setTab] = useState('input');
    const [tipeGaji, setTipeGaji] = useState('Harian');
    const [gajiPokok, setGajiPokok] = useState('');
    const [uangTransport, setUangTransport] = useState('');
    const [komisiPerProduk, setKomisiPerProduk] = useState('');
    const [jumlahProduk, setJumlahProduk] = useState('');

    const numGaji = parseFloat(gajiPokok) || 0;
    const numTransport = parseFloat(uangTransport) || 0;
    const numKomisi = parseFloat(komisiPerProduk) || 0;
    const numJumlah = parseFloat(jumlahProduk) || 0;
    
    const totalKomisi = numKomisi * numJumlah;
    const gajiBersih = numGaji + numTransport + totalKomisi;

    const simpanGaji = () => {
      if (gajiBersih <= 0) return;
      const newTx = {
        id: Date.now(), type: 'in', amount: gajiBersih, note: `Gaji ${tipeGaji}`,
        date: new Date().toISOString(), isSalary: true,
        details: { type: tipeGaji, base: numGaji, transport: numTransport, commission: numKomisi, items: numJumlah, totalCommission: totalKomisi }
      };
      setTransactions([...transactions, newTx]);
      showNotification('Gaji berhasil disimpan!', 'salary');
      setGajiPokok(''); setUangTransport(''); setKomisiPerProduk(''); setJumlahProduk('');
      setTab('history');
    };

    const salaryHistory = transactions.filter(t => t.isSalary).reverse();

    return (
      <div style={{ padding: '20px', paddingBottom: '120px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>Kalkulator Gaji</h2>
          <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '14px' }}>
            <button onClick={() => setTab('input')} style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '10px', fontWeight: 'bold', border: 'none', cursor: 'pointer', backgroundColor: tab === 'input' ? 'white' : 'transparent', color: tab === 'input' ? '#2563eb' : '#64748b' }}>Form</button>
            <button onClick={() => setTab('history')} style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '10px', fontWeight: 'bold', border: 'none', cursor: 'pointer', backgroundColor: tab === 'history' ? 'white' : 'transparent', color: tab === 'history' ? '#2563eb' : '#64748b' }}>Riwayat</button>
          </div>
        </div>

        {tab === 'input' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '24px', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', backgroundColor: '#f8fafc', padding: '4px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <button type="button" onClick={() => setTipeGaji('Harian')} style={{ flex: 1, padding: '10px', borderRadius: '10px', fontWeight: 'bold', fontSize: '13px', border: 'none', cursor: 'pointer', backgroundColor: tipeGaji === 'Harian' ? 'white' : 'transparent', color: tipeGaji === 'Harian' ? '#2563eb' : '#64748b' }}>Harian</button>
                <button type="button" onClick={() => setTipeGaji('Bulanan')} style={{ flex: 1, padding: '10px', borderRadius: '10px', fontWeight: 'bold', fontSize: '13px', border: 'none', cursor: 'pointer', backgroundColor: tipeGaji === 'Bulanan' ? 'white' : 'transparent', color: tipeGaji === 'Bulanan' ? '#2563eb' : '#64748b' }}>Bulanan</button>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>Gaji Pokok ({tipeGaji})</label>
                <input type="number" value={gajiPokok} onChange={(e) => setGajiPokok(e.target.value)} placeholder="Rp 0" style={{ width: '100%', padding: '12px 16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>Uang Transport</label>
                <input type="number" value={uangTransport} onChange={(e) => setUangTransport(e.target.value)} placeholder="Rp 0" style={{ width: '100%', padding: '12px 16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                <p style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '13px', margin: '0 0 12px 0' }}>Target & Komisi (Opsional)</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#64748b', marginBottom: '4px' }}>Komisi / Produk</label>
                    <input type="number" value={komisiPerProduk} onChange={(e) => setKomisiPerProduk(e.target.value)} placeholder="Rp 0" style={{ width: '100%', padding: '10px 12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#64748b', marginBottom: '4px' }}>Jml Terjual</label>
                    <input type="number" value={jumlahProduk} onChange={(e) => setJumlahProduk(e.target.value)} placeholder="0" style={{ width: '100%', padding: '10px 12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: '#eff6ff', padding: '20px', borderRadius: '24px', border: '1px solid #dbeafe', textAlign: 'center' }}>
              <p style={{ color: '#1e40af', fontSize: '13px', fontWeight: 'bold', margin: '0 0 4px 0' }}>Total Diterima</p>
              <h3 style={{ fontSize: '28px', fontWeight: '900', color: '#2563eb', margin: 0 }}>{formatRupiah(gajiBersih)}</h3>
            </div>

            <button onClick={simpanGaji} disabled={gajiBersih <= 0} style={{ width: '100%', fontWeight: 'bold', padding: '16px', borderRadius: '16px', border: 'none', cursor: gajiBersih > 0 ? 'pointer' : 'not-allowed', backgroundColor: gajiBersih > 0 ? '#2563eb' : '#e2e8f0', color: gajiBersih > 0 ? 'white' : '#94a3b8' }}>
              Simpan ke Keuangan
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <p style={{ fontSize: '13px', fontWeight: 500, color: '#64748b', margin: 0 }}>{salaryHistory.length} Riwayat Tersimpan</p>
               <button onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#1e293b', color: 'white', padding: '8px 14px', borderRadius: '12px', fontSize: '13px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
                 <Printer size={16} /> Export
               </button>
            </div>

            {salaryHistory.length === 0 ? (
              <div style={{ textAlign: 'center', backgroundColor: 'white', padding: '30px', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>Belum ada riwayat gaji.</p>
              </div>
            ) : (
              salaryHistory.map(t => (
                <div key={t.id} style={{ backgroundColor: 'white', padding: '18px', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '12px' }}>
                      <div>
                        <span style={{ display: 'block', fontWeight: 'bold', color: '#1e293b', fontSize: '13px' }}>{new Date(t.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#2563eb', backgroundColor: '#eff6ff', padding: '2px 8px', borderRadius: '6px', marginTop: '4px', display: 'inline-block' }}>{t.details?.type || 'Harian'}</span>
                      </div>
                      <span style={{ fontWeight: 'bold', color: '#16a34a', fontSize: '16px' }}>{formatRupiah(t.amount)}</span>
                   </div>
                   <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px', color: '#475569', fontWeight: 500 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Gaji Pokok:</span> <span style={{ color: '#1e293b' }}>{formatRupiah(t.details?.base || 0)}</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Uang Transport:</span> <span style={{ color: '#1e293b' }}>{formatRupiah(t.details?.transport || 0)}</span></div>
                      {(t.details?.totalCommission || 0) > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#1e40af', backgroundColor: '#eff6ff', padding: '8px 10px', borderRadius: '8px', marginTop: '4px' }}>
                          <span>Komisi ({t.details?.items}x):</span> 
                          <span style={{ fontWeight: 'bold' }}>{formatRupiah(t.details?.totalCommission || 0)}</span>
                        </div>
                      )}
                   </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    );
  };

  const FinanceView = () => {
    const [tab, setTab] = useState('list');
    const [showForm, setShowForm] = useState(false);
    const [selectedTx, setSelectedTx] = useState(null);
    const [form, setForm] = useState({ type: 'out', amount: '', note: '' });

    const handleAdd = (e) => {
      e.preventDefault();
      if (!form.amount || !form.note) return;
      const newTx = { id: Date.now(), type: form.type, amount: parseFloat(form.amount), note: form.note, date: new Date().toISOString() };
      setTransactions([...transactions, newTx]);
      setShowForm(false); 
      setForm({ type: 'out', amount: '', note: '' });
      showNotification('Transaksi disimpan!', form.type);
    };

    const monthlyData = useMemo(() => {
      const data = {};
      transactions.forEach(t => {
        const d = new Date(t.date);
        const monthYear = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const monthName = d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
        if (!data[monthYear]) data[monthYear] = { name: monthName, in: 0, out: 0, sortKey: monthYear };
        if (t.type === 'in') data[monthYear].in += t.amount;
        else data[monthYear].out += t.amount;
      });
      return Object.values(data).sort((a, b) => b.sortKey.localeCompare(a.sortKey)); 
    }, [transactions]);

    return (
      <div style={{ padding: '20px', paddingBottom: '120px', position: 'relative', minHeight: '80vh' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>Catatan Keuangan</h2>
          <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '14px' }}>
            <button onClick={() => setTab('list')} style={{ padding: '8px 14px', fontSize: '13px', borderRadius: '10px', fontWeight: 'bold', border: 'none', cursor: 'pointer', backgroundColor: tab === 'list' ? 'white' : 'transparent', color: tab === 'list' ? '#2563eb' : '#64748b' }}>Transaksi</button>
            <button onClick={() => setTab('report')} style={{ padding: '8px 14px', fontSize: '13px', borderRadius: '10px', fontWeight: 'bold', border: 'none', cursor: 'pointer', backgroundColor: tab === 'report' ? 'white' : 'transparent', color: tab === 'report' ? '#2563eb' : '#64748b' }}>Laporan</button>
          </div>
        </div>

        {tab === 'list' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {transactions.length === 0 ? (
                 <div style={{ textAlign: 'center', backgroundColor: 'white', padding: '30px', borderRadius: '24px', border: '1px solid #f1f5f9' }}><p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>Belum ada transaksi</p></div>
              ) : (
                transactions.slice().reverse().map(t => (
                  <div key={t.id} onClick={() => setSelectedTx(t)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: 'white', borderRadius: '18px', border: '1px solid #f8fafc', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ padding: '10px', borderRadius: '14px', backgroundColor: t.type === 'in' ? '#dcfce7' : '#fee2e2', color: t.type === 'in' ? '#16a34a' : '#dc2626', display: 'flex' }}>
                        {t.type === 'in' ? <ArrowUp size={18} /> : <ArrowDown size={18} />}
                      </div>
                      <div>
                        <p style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '14px', margin: '0 0 2px 0' }}>{t.note}</p>
                        <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0, fontWeight: 500 }}>{new Date(t.date).toLocaleDateString('id-ID')}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <p style={{ fontWeight: 'bold', fontSize: '14px', margin: 0, color: t.type === 'in' ? '#16a34a' : '#dc2626' }}>
                        {t.type === 'in' ? '+' : '-'}{formatRupiah(t.amount)}
                      </p>
                      <ChevronRight size={16} color="#cbd5e1" />
                    </div>
                  </div>
                ))
              )}
            </div>

            {!showForm && (
              <button onClick={() => setShowForm(true)} style={{ position: 'fixed', bottom: '90px', right: '20px', width: '56px', height: '56px', backgroundColor: '#2563eb', color: 'white', borderRadius: '50%', border: 'none', boxShadow: '0 10px 20px rgba(37,99,235,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 50 }}>
                <Plus size={28} />
              </button>
            )}
          </>
        )}

        {tab === 'report' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {monthlyData.length === 0 ? (
               <div style={{ textAlign: 'center', backgroundColor: 'white', padding: '30px', borderRadius: '24px', border: '1px solid #f1f5f9' }}><p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>Belum ada data laporan.</p></div>
            ) : (
              monthlyData.map((month, idx) => (
                <div key={idx} style={{ backgroundColor: 'white', borderRadius: '24px', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                  <div style={{ backgroundColor: '#eff6ff', padding: '14px 18px', borderBottom: '1px solid #dbeafe', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={16} color="#1d4ed8" />
                    <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e40af', margin: 0 }}>{month.name}</h3>
                  </div>
                  <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                      <span style={{ color: '#64748b', fontWeight: 500 }}>Pemasukan</span>
                      <span style={{ fontWeight: 'bold', color: '#16a34a' }}>{formatRupiah(month.in)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                      <span style={{ color: '#64748b', fontWeight: 500 }}>Pengeluaran</span>
                      <span style={{ fontWeight: 'bold', color: '#dc2626' }}>{formatRupiah(month.out)}</span>
                    </div>
                    <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '13px' }}>Saldo Bersih</span>
                      <span style={{ fontSize: '18px', fontWeight: '900', color: month.in - month.out >= 0 ? '#2563eb' : '#dc2626' }}>
                        {formatRupiah(month.in - month.out)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {showForm && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setShowForm(false)}>
            <form onSubmit={handleAdd} style={{ backgroundColor: 'white', width: '100%', maxWidth: '340px', borderRadius: '28px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>Catat Transaksi</h3>
                <button type="button" onClick={() => setShowForm(false)} style={{ padding: '6px', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '50%', cursor: 'pointer', color: '#64748b' }}><X size={18}/></button>
              </div>
              
              <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '14px' }}>
                <button type="button" onClick={() => setForm({...form, type: 'in'})} style={{ flex: 1, padding: '10px', borderRadius: '10px', fontWeight: 'bold', fontSize: '13px', border: 'none', cursor: 'pointer', backgroundColor: form.type === 'in' ? '#16a34a' : 'transparent', color: form.type === 'in' ? 'white' : '#64748b' }}>Pemasukan</button>
                <button type="button" onClick={() => setForm({...form, type: 'out'})} style={{ flex: 1, padding: '10px', borderRadius: '10px', fontWeight: 'bold', fontSize: '13px', border: 'none', cursor: 'pointer', backgroundColor: form.type === 'out' ? '#dc2626' : 'transparent', color: form.type === 'out' ? 'white' : '#64748b' }}>Pengeluaran</button>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>Nominal (Rp)</label>
                <input type="number" required value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value})} placeholder="0" style={{ width: '100%', padding: '12px 16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', fontSize: '16px', fontWeight: 'bold', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>Keterangan</label>
                <input type="text" required value={form.note} onChange={(e) => setForm({...form, note: e.target.value})} placeholder="Cth: Makan siang" style={{ width: '100%', padding: '12px 16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              
              <button type="submit" style={{ width: '100%', padding: '14px', backgroundColor: form.type === 'in' ? '#16a34a' : '#dc2626', color: 'white', border: 'none', borderRadius: '14px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', marginTop: '6px' }}>Simpan Transaksi</button>
            </form>
          </div>
        )}

        {selectedTx && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setSelectedTx(null)}>
            <div style={{ backgroundColor: 'white', width: '100%', maxWidth: '340px', borderRadius: '28px', padding: '24px', position: 'relative', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} onClick={e => e.stopPropagation()}>
              <button onClick={() => setSelectedTx(null)} style={{ position: 'absolute', top: '16px', right: '16px', padding: '8px', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '50%', cursor: 'pointer', color: '#64748b' }}><X size={18}/></button>
              
              <div style={{ textAlign: 'center', marginBottom: '20px', paddingTop: '10px' }}>
                <div style={{ margin: '0 auto 12px auto', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '18px', backgroundColor: selectedTx.type === 'in' ? '#dcfce7' : '#fee2e2', color: selectedTx.type === 'in' ? '#16a34a' : '#dc2626' }}>
                  {selectedTx.type === 'in' ? <ArrowUp size={28} /> : <ArrowDown size={28} />}
                </div>
                <h3 style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', margin: '0 0 4px 0' }}>{formatRupiah(selectedTx.amount)}</h3>
                <p style={{ color: '#64748b', fontSize: '14px', margin: 0, fontWeight: 500 }}>{selectedTx.note}</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#475569', marginBottom: '20px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '18px', border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                  <span style={{ color: '#94a3b8' }}>Tanggal</span> 
                  <span style={{ fontWeight: 'bold', color: '#1e293b' }}>{new Date(selectedTx.date).toLocaleString('id-ID')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px' }}>
                  <span style={{ color: '#94a3b8' }}>Jenis</span> 
                  <span style={{ fontWeight: 'bold', color: selectedTx.type === 'in' ? '#16a34a' : '#dc2626' }}>{selectedTx.type === 'in' ? 'Pemasukan' : 'Pengeluaran'}</span>
                </div>
              </div>
              <button onClick={() => setSelectedTx(null)} style={{ width: '100%', padding: '14px', backgroundColor: '#1e293b', color: 'white', border: 'none', borderRadius: '14px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}>Tutup</button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const SavingsView = () => {
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: '', target: '' });
    const [addModal, setAddModal] = useState(null); 
    const [addAmount, setAddAmount] = useState('');
    const [detailSaving, setDetailSaving] = useState(null);

    const handleNewSavings = (e) => {
      e.preventDefault();
      const newSaving = { id: Date.now(), name: form.name, target: parseFloat(form.target), current: 0, history: [] };
      setSavings([...savings, newSaving]);
      setShowForm(false); setForm({ name: '', target: '' });
      showNotification('Target tabungan dibuat!', 'default');
    };

    const handleAddAmount = (e) => {
      e.preventDefault();
      const amountNum = parseFloat(addAmount) || 0;
      if (amountNum <= 0) return;

      const record = { id: Date.now(), amount: amountNum, date: new Date().toISOString() };
      setSavings(savings.map(s => s.id === addModal ? { ...s, current: s.current + amountNum, history: [record, ...(s.history || [])] } : s));
      setAddModal(null); setAddAmount('');
      showNotification('Tabungan berhasil disetor!', 'in');
    };

    return (
      <div style={{ padding: '20px', paddingBottom: '120px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginTop: 0, marginBottom: '16px' }}>Target Tabungan</h2>

        {showForm ? (
           <form onSubmit={handleNewSavings} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '24px', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '16px' }}>
             <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e293b', margin: '0 0 4px 0', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>Buat Target Baru</h3>
             <div>
               <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>Nama Impian</label>
               <input type="text" required value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="Cth: Beli Motor" style={{ width: '100%', padding: '12px 16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
             </div>
             <div>
               <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>Target Nominal (Rp)</label>
               <input type="number" required value={form.target} onChange={(e) => setForm({...form, target: e.target.value})} placeholder="Rp 0" style={{ width: '100%', padding: '12px 16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
             </div>
             <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
               <button type="button" onClick={() => setShowForm(false)} style={{ flex: 1, padding: '14px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '14px', fontWeight: 'bold', cursor: 'pointer' }}>Batal</button>
               <button type="submit" style={{ flex: 1, padding: '14px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '14px', fontWeight: 'bold', cursor: 'pointer' }}>Simpan</button>
             </div>
           </form>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {savings.length === 0 ? (
              <div style={{ textAlign: 'center', backgroundColor: 'white', padding: '30px', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>Belum ada target tabungan.</p>
              </div>
            ) : (
              savings.map(s => {
                const progress = Math.min((s.current / s.target) * 100, 100).toFixed(1);
                return (
                  <div key={s.id} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '24px', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div onClick={() => setDetailSaving(s)} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e293b', margin: '0 0 4px 0' }}>{s.name}</h3>
                          <p style={{ fontSize: '12px', fontWeight: 500, color: '#64748b', margin: 0 }}>
                            {formatRupiah(s.current)} <span style={{ color: '#94a3b8', fontWeight: 'normal' }}>/ {formatRupiah(s.target)}</span>
                          </p>
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 'bold', backgroundColor: '#eff6ff', color: '#2563eb', padding: '4px 10px', borderRadius: '10px' }}>{progress}%</span>
                      </div>
                      <div style={{ width: '100%', backgroundColor: '#f1f5f9', borderRadius: '99px', height: '10px', overflow: 'hidden' }}>
                        <div style={{ backgroundColor: '#2563eb', height: '100%', width: `${progress}%`, borderRadius: '99px' }}></div>
                      </div>
                      <p style={{ fontSize: '11px', color: '#2563eb', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        Ketuk untuk riwayat setoran <ChevronRight size={14} />
                      </p>
                    </div>

                    <button onClick={() => setAddModal(s.id)} style={{ width: '100%', padding: '12px', backgroundColor: '#eff6ff', color: '#2563eb', border: 'none', borderRadius: '14px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <Plus size={16} /> Setor Tabungan
                    </button>
                  </div>
                )
              })
            )}
            
            <button onClick={() => setShowForm(true)} style={{ width: '100%', padding: '16px', border: '2px dashed #93c5fd', color: '#2563eb', fontWeight: 'bold', borderRadius: '24px', backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Plus size={18} /> Buat Target Baru
            </button>
          </div>
        )}

        {addModal && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setAddModal(null)}>
             <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '28px', width: '100%', maxWidth: '340px', position: 'relative' }} onClick={e => e.stopPropagation()}>
                <button onClick={() => setAddModal(null)} style={{ position: 'absolute', top: '16px', right: '16px', padding: '8px', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '50%', cursor: 'pointer', color: '#64748b' }}><X size={18}/></button>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', margin: '0 0 4px 0' }}>Setor Tabungan</h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px 0' }}>Masukkan nominal uang yang disisihkan.</p>
                <form onSubmit={handleAddAmount}>
                  <input type="number" required value={addAmount} onChange={(e) => setAddAmount(e.target.value)} placeholder="0" style={{ width: '100%', padding: '14px 16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', fontSize: '16px', fontWeight: 'bold', outline: 'none', marginBottom: '20px', boxSizing: 'border-box' }} />
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="button" onClick={() => setAddModal(null)} style={{ flex: 1, padding: '14px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '14px', fontWeight: 'bold', cursor: 'pointer' }}>Batal</button>
                    <button type="submit" style={{ flex: 1, padding: '14px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '14px', fontWeight: 'bold', cursor: 'pointer' }}>Simpan</button>
                  </div>
                </form>
             </div>
          </div>
        )}

        {detailSaving && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setDetailSaving(null)}>
             <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '28px', width: '100%', maxWidth: '340px', maxHeight: '75vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e293b', margin: '0 0 2px 0' }}>{detailSaving.name}</h3>
                    <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>Terkumpul: {formatRupiah(detailSaving.current)}</p>
                  </div>
                  <button onClick={() => setDetailSaving(null)} style={{ padding: '6px', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '50%', cursor: 'pointer', color: '#64748b' }}><X size={18}/></button>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', margin: '0 0 4px 0' }}>Riwayat Setoran</p>
                  {(!detailSaving.history || detailSaving.history.length === 0) ? (
                    <p style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center', padding: '24px', backgroundColor: '#f8fafc', borderRadius: '16px', margin: 0 }}>Belum ada riwayat setoran.</p>
                  ) : (
                    detailSaving.history.map((h, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', backgroundColor: '#f8fafc', borderRadius: '14px', border: '1px solid #f1f5f9', fontSize: '13px' }}>
                        <span style={{ color: '#64748b', fontSize: '11px' }}>{new Date(h.date).toLocaleString('id-ID')}</span>
                        <span style={{ fontWeight: 'bold', color: '#16a34a' }}>+{formatRupiah(h.amount)}</span>
                      </div>
                    ))
                  )}
                </div>
                <button onClick={() => setDetailSaving(null)} style={{ width: '100%', marginTop: '16px', padding: '12px', backgroundColor: '#1e293b', color: 'white', border: 'none', borderRadius: '14px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>Tutup</button>
             </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ width: '100%', maxWidth: '420px', margin: '0 auto', height: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, -apple-system, sans-serif', position: 'relative', overflow: 'hidden', color: '#1e293b' }}>
      
      {notification && (
        <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', backgroundColor: notification.type === 'salary' ? '#2563eb' : notification.type === 'in' ? '#16a34a' : notification.type === 'out' ? '#dc2626' : '#1e293b', color: 'white', padding: '10px 20px', borderRadius: '99px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.2)', fontSize: '13px', fontWeight: 'bold', zIndex: 9999, whiteSpace: 'nowrap' }}>
          {notification.msg}
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {activeTab === 'home' && <HomeView />}
        {activeTab === 'salary' && <SalaryView />}
        {activeTab === 'tracker' && <FinanceView />}
        {activeTab === 'savings' && <SavingsView />}
      </div>

      <div style={{ backgroundColor: 'white', padding: '10px 20px 20px 20px', display: 'flex', justifyContent: 'space-around', alignItems: 'center', position: 'absolute', bottom: 0, width: '100%', borderTop: '1px solid #f1f5f9', boxSizing: 'border-box', zIndex: 100 }}>
        
        <button onClick={() => setActiveTab('home')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: activeTab === 'home' ? '#2563eb' : 'transparent', color: activeTab === 'home' ? 'white' : '#94a3b8', border: 'none', padding: '8px 16px', borderRadius: '16px', cursor: 'pointer' }}>
          <Home size={20} />
          <span style={{ fontSize: '10px', fontWeight: 'bold' }}>Beranda</span>
        </button>
        
        <button onClick={() => setActiveTab('salary')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: activeTab === 'salary' ? '#2563eb' : 'transparent', color: activeTab === 'salary' ? 'white' : '#94a3b8', border: 'none', padding: '8px 16px', borderRadius: '16px', cursor: 'pointer' }}>
          <Calculator size={20} />
          <span style={{ fontSize: '10px', fontWeight: 'bold' }}>Gaji</span>
        </button>
        
        <button onClick={() => setActiveTab('tracker')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: activeTab === 'tracker' ? '#2563eb' : 'transparent', color: activeTab === 'tracker' ? 'white' : '#94a3b8', border: 'none', padding: '8px 16px', borderRadius: '16px', cursor: 'pointer' }}>
          <Wallet size={20} />
          <span style={{ fontSize: '10px', fontWeight: 'bold' }}>Keuangan</span>
        </button>
        
        <button onClick={() => setActiveTab('savings')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: activeTab === 'savings' ? '#2563eb' : 'transparent', color: activeTab === 'savings' ? 'white' : '#94a3b8', border: 'none', padding: '8px 16px', borderRadius: '16px', cursor: 'pointer' }}>
          <PiggyBank size={20} />
          <span style={{ fontSize: '10px', fontWeight: 'bold' }}>Tabungan</span>
        </button>

      </div>
    </div>
  );
}
