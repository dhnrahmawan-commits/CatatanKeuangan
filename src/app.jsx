```react
import React, { useState, useMemo, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, doc, setDoc, onSnapshot } from "firebase/firestore";

// --- Inisialisasi Firebase ---
const appId = typeof __app_id !== 'undefined' ? __app_id : 'keuanganku-app';
let app, auth, db;
if (typeof __firebase_config !== 'undefined') {
  const firebaseConfig = JSON.parse(__firebase_config);
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}

// --- Bantuan Format Rupiah ---
const formatRupiah = (angka) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(angka);
};

// --- Komponen Ikon (SVG) ---
const IconHome = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IconCalculator = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16.01" y1="14" y2="14"/><line x1="16" x2="16.01" y1="18" y2="18"/><line x1="16" x2="16.01" y1="10" y2="10"/><line x1="12" x2="12.01" y1="14" y2="14"/><line x1="12" x2="12.01" y1="18" y2="18"/><line x1="12" x2="12.01" y1="10" y2="10"/><line x1="8" x2="8.01" y1="14" y2="14"/><line x1="8" x2="8.01" y1="18" y2="18"/><line x1="8" x2="8.01" y1="10" y2="10"/></svg>;
const IconWallet = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>;
const IconPiggyBank = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.5-1 2-2h2v-4h-2c0-1-.5-1.5-1-2h0V5z"/><path d="M2 9v1c0 1.1.9 2 2 2h1"/><path d="M16 11h.01"/></svg>;
const IconPlus = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>;
const IconArrowUp = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>;
const IconArrowDown = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>;
const IconPrint = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>;
const IconClose = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>;
const IconFile = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;

export default function App() {
  const [user, setUser] = useState(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [activeTab, setActiveTab] = useState('home');

  // State Profil
  const [userProfile, setUserProfile] = useState({ name: 'Pengguna', photo: '' });
  const [showSettings, setShowSettings] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhoto, setEditPhoto] = useState('');

  // State Data
  const [transactions, setTransactions] = useState([]);
  const [savings, setSavings] = useState([]);
  const [notification, setNotification] = useState(null);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Auth & Firestore Sync
  useEffect(() => {
    if (!auth) {
      setIsAuthChecking(false);
      return;
    }

    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Auth error:", error);
      }
    };
    
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !db) return;
    
    const txRef = collection(db, 'artifacts', appId, 'users', user.uid, 'transactions');
    const unsubTx = onSnapshot(txRef, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTransactions(data);
    }, (err) => console.error("Firebase Tx Error:", err));

    const svRef = collection(db, 'artifacts', appId, 'users', user.uid, 'savings');
    const unsubSv = onSnapshot(svRef, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSavings(data);
    }, (err) => console.error("Firebase Savings Error:", err));

    const profileRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'data');
    const unsubProfile = onSnapshot(profileRef, (docSnap) => {
      if (docSnap.exists()) {
        setUserProfile(docSnap.data());
      }
    }, (err) => console.error("Firebase Profile Error:", err));

    return () => { unsubTx(); unsubSv(); unsubProfile(); };
  }, [user]);

  const openSettings = () => {
    setEditName(userProfile.name || '');
    setEditPhoto(userProfile.photo || '');
    setShowSettings(true);
  };

  const saveProfile = async () => {
    if (user && db) {
      try {
        const profileRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'data');
        await setDoc(profileRef, { name: editName, photo: editPhoto }, { merge: true });
        setShowSettings(false);
        showNotification("Profil berhasil diperbarui");
      } catch (error) {
        console.error("Gagal update profil:", error);
      }
    } else {
      setUserProfile({ name: editName, photo: editPhoto });
      setShowSettings(false);
    }
  };

  // Perhitungan Saldo
  const { totalBalance, totalIn, totalOut } = useMemo(() => {
    let balance = 0;
    let inAmount = 0;
    let outAmount = 0;
    transactions.forEach(t => {
      if (t.type === 'in') {
        balance += t.amount;
        inAmount += t.amount;
      } else {
        balance -= t.amount;
        outAmount += t.amount;
      }
    });
    return { totalBalance: balance, totalIn: inAmount, totalOut: outAmount };
  }, [transactions]);

  // --- Views ---

  const HomeView = () => (
    <div className="p-4 space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-500 text-sm">Selamat Datang,</p>
          <h1 className="text-xl font-bold text-gray-800">{userProfile.name || 'Pengguna'}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={openSettings} className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold overflow-hidden border-2 border-white shadow-sm hover:scale-105 transition-transform cursor-pointer shrink-0">
            {userProfile.photo ? <img src={userProfile.photo} alt="profile" className="w-full h-full object-cover" /> : (userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'P')}
          </button>
        </div>
      </div>

      {/* Card Saldo */}
      <div className="bg-gradient-to-r from-indigo-500 to-blue-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-20">
          <IconWallet />
        </div>
        <p className="text-indigo-100 text-sm mb-1">Total Saldo Saat Ini</p>
        <h2 className="text-3xl font-bold mb-4">{formatRupiah(totalBalance)}</h2>
        <div className="flex justify-between border-t border-indigo-400/30 pt-4">
          <div>
            <p className="text-xs text-indigo-100 flex items-center gap-1"><IconArrowUp/> Pemasukan</p>
            <p className="font-semibold">{formatRupiah(totalIn)}</p>
          </div>
          <div>
            <p className="text-xs text-indigo-100 flex items-center gap-1"><IconArrowDown/> Pengeluaran</p>
            <p className="font-semibold">{formatRupiah(totalOut)}</p>
          </div>
        </div>
      </div>

      {/* Ringkasan Tabungan */}
      {savings.length > 0 && (
         <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
           <div className="flex justify-between items-center mb-3">
             <h3 className="font-bold text-gray-800 text-sm">Ringkasan Tabungan</h3>
             <button onClick={() => setActiveTab('savings')} className="text-xs text-indigo-600 font-medium">Lihat</button>
           </div>
           <div className="space-y-3">
              {savings.slice(0, 2).map(s => {
                const progress = Math.min((s.current / s.target) * 100, 100).toFixed(1);
                return (
                  <div key={s.id}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium">{s.name}</span>
                      <span className="text-indigo-600 font-bold">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                )
              })}
           </div>
         </div>
      )}

      {/* Ringkasan Transaksi Terakhir */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-gray-800">Transaksi Terakhir</h3>
          <button onClick={() => setActiveTab('tracker')} className="text-sm text-indigo-600 font-medium">Semua</button>
        </div>
        <div className="space-y-3">
          {transactions.slice().reverse().slice(0, 3).map(t => (
            <div key={t.id} className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm border border-gray-50">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${t.type === 'in' ? 'bg-green-100' : 'bg-red-100'}`}>
                  {t.type === 'in' ? <IconArrowUp /> : <IconArrowDown />}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{t.note}</p>
                  <p className="text-xs text-gray-400">{new Date(t.date).toLocaleDateString('id-ID')}</p>
                </div>
              </div>
              <p className={`font-bold text-sm ${t.type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                {t.type === 'in' ? '+' : '-'}{formatRupiah(t.amount)}
              </p>
            </div>
          ))}
          {transactions.length === 0 && <p className="text-gray-400 text-center text-sm bg-white p-4 rounded-xl">Belum ada transaksi.</p>}
        </div>
      </div>
    </div>
  );

  const SalaryView = () => {
    const [salaryTab, setSalaryTab] = useState('input'); // 'input' or 'history'
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
        type: 'in',
        amount: gajiBersih,
        note: 'Gaji Harian',
        date: new Date().toISOString(),
        isSalary: true,
        details: {
          base: numGaji,
          transport: numTransport,
          commission: numKomisi,
          items: numJumlah,
          totalCommission: totalKomisi
        }
      };

      if (user && db) {
        const txId = Date.now().toString();
        setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'transactions', txId), newTx);
      } else {
        setTransactions([...transactions, { id: Date.now(), ...newTx }]);
      }

      showNotification('Gaji harian berhasil disimpan!');
      setGajiPokok(''); setUangTransport(''); setKomisiPerProduk(''); setJumlahProduk('');
      setSalaryTab('history');
    };

    const salaryHistory = transactions.filter(t => t.isSalary).reverse();

    return (
      <div className="p-4 space-y-6 animate-fade-in pb-24 print-container">
        <div className="flex justify-between items-center hide-on-print">
          <h2 className="text-xl font-bold text-gray-800">Kalkulator Gaji</h2>
          <div className="flex bg-gray-200 p-1 rounded-lg">
            <button onClick={() => setSalaryTab('input')} className={`px-3 py-1 text-sm rounded-md font-medium transition-colors ${salaryTab === 'input' ? 'bg-white text-indigo-600 shadow' : 'text-gray-500'}`}>Input</button>
            <button onClick={() => setSalaryTab('history')} className={`px-3 py-1 text-sm rounded-md font-medium transition-colors ${salaryTab === 'history' ? 'bg-white text-indigo-600 shadow' : 'text-gray-500'}`}>Riwayat</button>
          </div>
        </div>

        {salaryTab === 'input' ? (
          <div className="space-y-6 hide-on-print">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gaji Pokok Harian</label>
                <input type="number" value={gajiPokok} onChange={(e) => setGajiPokok(e.target.value)} placeholder="Rp 0" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Uang Transport</label>
                <input type="number" value={uangTransport} onChange={(e) => setUangTransport(e.target.value)} placeholder="Rp 0" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all" />
              </div>
              
              <div className="border-t border-gray-100 pt-4 mt-2">
                <p className="font-semibold text-gray-800 mb-3 text-sm">Target & Komisi</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Komisi / Produk</label>
                    <input type="number" value={komisiPerProduk} onChange={(e) => setKomisiPerProduk(e.target.value)} placeholder="Rp 0" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none text-sm transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Jml Terjual</label>
                    <input type="number" value={jumlahProduk} onChange={(e) => setJumlahProduk(e.target.value)} placeholder="0" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none text-sm transition-all" />
                  </div>
                </div>
                {totalKomisi > 0 && (
                  <p className="text-xs text-indigo-600 mt-2 font-medium">Total Komisi: {formatRupiah(totalKomisi)}</p>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-5 rounded-2xl border border-indigo-100 text-center shadow-sm">
              <p className="text-indigo-800 text-sm font-medium mb-1">Total Gaji Hari Ini</p>
              <h3 className="text-3xl font-bold text-indigo-700">{formatRupiah(gajiBersih)}</h3>
            </div>

            <button onClick={simpanGaji} disabled={gajiBersih <= 0} className={`w-full font-bold py-3.5 rounded-xl shadow-md transition-all ${gajiBersih > 0 ? 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98]' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
              Simpan ke Pemasukan
            </button>
          </div>
        ) : (
          <div className="space-y-4" id="print-area">
            <div className="flex justify-between items-center hide-on-print">
               <p className="text-sm text-gray-500">Total Riwayat: {salaryHistory.length}</p>
               <button onClick={() => window.print()} className="flex items-center gap-2 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 active:scale-95 transition-all">
                 <IconPrint /> Export PDF
               </button>
            </div>
            <h2 className="hidden print-only text-2xl font-bold text-center mb-6">Laporan Riwayat Gaji Harian</h2>
            {salaryHistory.length === 0 ? (
              <div className="text-center bg-white p-8 rounded-2xl border border-gray-100 hide-on-print">
                <p className="text-gray-400">Belum ada riwayat gaji.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {salaryHistory.map(t => (
                  <div key={t.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 print-border">
                     <div className="flex justify-between border-b border-gray-100 pb-2 mb-2">
                        <span className="font-bold text-gray-700">{new Date(t.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        <span className="font-bold text-green-600">{formatRupiah(t.amount)}</span>
                     </div>
                     <div className="text-sm space-y-1 text-gray-600">
                        <div className="flex justify-between"><span>Gaji Pokok:</span> <span className="font-medium">{formatRupiah(t.details?.base || 0)}</span></div>
                        <div className="flex justify-between"><span>Uang Transport:</span> <span className="font-medium">{formatRupiah(t.details?.transport || 0)}</span></div>
                        <div className="flex justify-between text-indigo-700">
                          <span>Komisi ({t.details?.items || 0} x {formatRupiah(t.details?.commission || 0)}):</span> 
                          <span className="font-medium">{formatRupiah(t.details?.totalCommission || 0)}</span>
                        </div>
                     </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const TrackerView = () => {
    const [trackerTab, setTrackerTab] = useState('list'); // 'list' or 'report'
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ type: 'out', amount: '', note: '' });
    const [selectedTx, setSelectedTx] = useState(null);

    const handleAdd = (e) => {
      e.preventDefault();
      if (!form.amount || !form.note) return;
      
      const newTx = {
        type: form.type,
        amount: parseFloat(form.amount),
        note: form.note,
        date: new Date().toISOString()
      };

      if (user && db) {
        const txId = Date.now().toString();
        setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'transactions', txId), newTx);
      } else {
        setTransactions([...transactions, { id: Date.now(), ...newTx }]);
      }
      
      setShowForm(false);
      setForm({ type: 'out', amount: '', note: '' });
      showNotification('Transaksi berhasil dicatat');
    };

    const monthlyData = useMemo(() => {
      const data = {};
      transactions.forEach(t => {
        const d = new Date(t.date);
        const monthYear = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const monthName = d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
        
        if (!data[monthYear]) {
          data[monthYear] = { name: monthName, in: 0, out: 0 };
        }
        if (t.type === 'in') data[monthYear].in += t.amount;
        else data[monthYear].out += t.amount;
      });
      return Object.values(data).sort((a, b) => b.name.localeCompare(a.name)); 
    }, [transactions]);

    return (
      <div className="p-4 space-y-4 animate-fade-in relative min-h-screen pb-24">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold text-gray-800">Keuangan</h2>
          <div className="flex bg-gray-200 p-1 rounded-lg">
            <button onClick={() => setTrackerTab('list')} className={`px-3 py-1 text-sm rounded-md font-medium transition-colors ${trackerTab === 'list' ? 'bg-white text-indigo-600 shadow' : 'text-gray-500'}`}>Harian</button>
            <button onClick={() => setTrackerTab('report')} className={`px-3 py-1 text-sm rounded-md font-medium transition-colors ${trackerTab === 'report' ? 'bg-white text-indigo-600 shadow' : 'text-gray-500'}`}>Laporan</button>
          </div>
        </div>

        {trackerTab === 'list' && (
          <>
            {showForm ? (
              <div className="fixed inset-0 bg-black/50 z-40 flex justify-center items-end sm:items-center sm:p-4 animate-fade-in">
                <form onSubmit={handleAdd} className="bg-white w-full sm:max-w-md p-6 rounded-t-3xl sm:rounded-3xl shadow-xl space-y-5">
                  <h3 className="font-bold text-lg border-b pb-2">Tambah Transaksi</h3>
                  <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
                    <button type="button" onClick={() => setForm({...form, type: 'in'})} className={`flex-1 py-2 rounded-lg font-medium transition-all ${form.type === 'in' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500'}`}>Pemasukan</button>
                    <button type="button" onClick={() => setForm({...form, type: 'out'})} className={`flex-1 py-2 rounded-lg font-medium transition-all ${form.type === 'out' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500'}`}>Pengeluaran</button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Nominal</label>
                    <input type="number" required value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value})} placeholder="Rp 0" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Keterangan</label>
                    <input type="text" required value={form.note} onChange={(e) => setForm({...form, note: e.target.value})} placeholder="Cth: Beli Bensin / Gaji" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium active:scale-95 transition-transform">Batal</button>
                    <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold active:scale-95 transition-transform shadow-md">Simpan</button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-gray-500 mb-1">Klik pada transaksi untuk melihat detail</p>
                {transactions.slice().reverse().map(t => (
                  <div key={t.id} onClick={() => setSelectedTx(t)} className="flex justify-between items-center p-4 bg-white rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors active:scale-[0.98]">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${t.type === 'in' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {t.type === 'in' ? <IconArrowUp /> : <IconArrowDown />}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{t.note}</p>
                        <p className="text-xs text-gray-400 font-medium">{new Date(t.date).toLocaleDateString('id-ID')}</p>
                      </div>
                    </div>
                    <p className={`font-bold ${t.type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                      {t.type === 'in' ? '+' : '-'}{formatRupiah(t.amount)}
                    </p>
                  </div>
                ))}
                {transactions.length === 0 && <div className="text-center bg-white p-8 rounded-2xl border border-gray-100"><p className="text-gray-400">Belum ada transaksi</p></div>}
              </div>
            )}

            {!showForm && (
              <button onClick={() => setShowForm(true)} className="fixed bottom-24 right-6 w-14 h-14 bg-indigo-600 text-white rounded-2xl shadow-[0_8px_16px_rgba(79,70,229,0.4)] flex items-center justify-center hover:bg-indigo-700 transition-transform active:scale-90 z-10 rotate-45 hover:rotate-90">
                <div className="-rotate-45 hover:-rotate-90 transition-transform duration-300"><IconPlus /></div>
              </button>
            )}
          </>
        )}

        {trackerTab === 'report' && (
          <div className="space-y-6">
            {monthlyData.map((month, idx) => (
              <div key={idx} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-indigo-50 p-4 border-b border-indigo-100">
                  <h3 className="font-bold text-indigo-900 flex items-center gap-2"><IconFile /> Laporan {month.name}</h3>
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm font-medium">Total Pemasukan</span>
                    <span className="font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">{formatRupiah(month.in)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm font-medium">Total Pengeluaran</span>
                    <span className="font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md">{formatRupiah(month.out)}</span>
                  </div>
                  <div className="border-t border-gray-100 pt-4 mt-2 flex justify-between items-center">
                    <span className="font-bold text-gray-800">Sisa Saldo</span>
                    <span className={`text-xl font-bold ${month.in - month.out >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>
                      {formatRupiah(month.in - month.out)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {monthlyData.length === 0 && <div className="text-center bg-white p-8 rounded-2xl border border-gray-100"><p className="text-gray-400">Belum ada data laporan</p></div>}
          </div>
        )}

        {/* Modal Detail Transaksi */}
        {selectedTx && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center sm:p-4 animate-fade-in" onClick={() => setSelectedTx(null)}>
            <div className="bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl p-6 relative shadow-2xl" onClick={e => e.stopPropagation()}>
              <button onClick={() => setSelectedTx(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 bg-gray-100 rounded-full p-2 transition-colors">
                <IconClose />
              </button>
              
              <div className="text-center mb-6 pt-2">
                <div className={`mx-auto w-16 h-16 flex items-center justify-center rounded-2xl mb-4 shadow-inner ${selectedTx.type === 'in' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                  {selectedTx.type === 'in' ? <IconArrowUp /> : <IconArrowDown />}
                </div>
                <h3 className="text-3xl font-bold text-gray-900">{formatRupiah(selectedTx.amount)}</h3>
                <p className="text-gray-500 mt-1 font-medium">{selectedTx.note}</p>
              </div>

              <div className="space-y-3 text-sm text-gray-600 mb-8 bg-gray-50 p-5 rounded-2xl border border-gray-100">
                <div className="flex justify-between border-b border-gray-200 pb-3">
                  <span className="text-gray-500">Waktu Transaksi</span>
                  <span className="font-bold text-gray-800">{new Date(selectedTx.date).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-3 pt-1">
                  <span className="text-gray-500">Jenis</span>
                  <span className={`font-bold ${selectedTx.type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedTx.type === 'in' ? 'Pemasukan' : 'Pengeluaran'}
                  </span>
                </div>
                
                {selectedTx.isSalary && selectedTx.details && (
                  <div className="pt-2">
                    <p className="font-bold text-indigo-700 mb-2 border-b border-indigo-100 pb-2">Rincian Komponen Gaji:</p>
                    <div className="space-y-2">
                      <div className="flex justify-between"><span>Gaji Pokok:</span> <span className="font-bold text-gray-800">{formatRupiah(selectedTx.details.base)}</span></div>
                      <div className="flex justify-between"><span>Transport:</span> <span className="font-bold text-gray-800">{formatRupiah(selectedTx.details.transport)}</span></div>
                      <div className="flex justify-between text-indigo-600 bg-indigo-50 p-2 rounded-lg mt-1">
                        <span>Komisi ({selectedTx.details.items} brg):</span> 
                        <span className="font-bold">{formatRupiah(selectedTx.details.totalCommission)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button onClick={() => setSelectedTx(null)} className="w-full py-3.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 active:scale-95 transition-all shadow-md">
                Tutup
              </button>
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

    const handleNewSavings = (e) => {
      e.preventDefault();
      const newSaving = { name: form.name, target: parseFloat(form.target), current: 0 };
      
      if (user && db) {
        const svId = Date.now().toString();
        setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'savings', svId), newSaving);
      } else {
        setSavings([...savings, { id: Date.now(), ...newSaving }]);
      }
      
      setShowForm(false); setForm({ name: '', target: '' });
      showNotification('Target tabungan dibuat!');
    };

    const handleAddAmount = (e) => {
      e.preventDefault();
      const savingToUpdate = savings.find(s => s.id === addModal);
      if (!savingToUpdate) return;
      
      const newAmount = savingToUpdate.current + parseFloat(addAmount);

      if (user && db) {
        setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'savings', addModal.toString()), { current: newAmount }, { merge: true });
      } else {
        setSavings(savings.map(s => s.id === addModal ? { ...s, current: newAmount } : s));
      }
      
      setAddModal(null); setAddAmount('');
      showNotification('Saldo tabungan berhasil ditambah!');
    };

    return (
      <div className="p-4 space-y-6 animate-fade-in pb-24">
        <h2 className="text-xl font-bold text-gray-800">Target Tabungan</h2>

        {showForm ? (
           <form onSubmit={handleNewSavings} className="bg-white p-5 rounded-3xl shadow-md border border-gray-100 space-y-4">
             <h3 className="font-bold border-b pb-2 text-lg">Buat Target Baru</h3>
             <div>
               <label className="block text-sm font-medium text-gray-600 mb-1">Nama Impian</label>
               <input type="text" required value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="Cth: Beli Motor" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
             </div>
             <div>
               <label className="block text-sm font-medium text-gray-600 mb-1">Target Nominal (Rp)</label>
               <input type="number" required value={form.target} onChange={(e) => setForm({...form, target: e.target.value})} placeholder="Rp 0" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
             </div>
             <div className="flex gap-3 pt-2">
               <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium active:scale-95 transition-transform">Batal</button>
               <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-md active:scale-95 transition-transform">Simpan</button>
             </div>
           </form>
        ) : (
          <div className="space-y-4">
            {savings.map(s => {
              const progress = Math.min((s.current / s.target) * 100, 100).toFixed(1);
              return (
                <div key={s.id} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-end mb-3">
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">{s.name}</h3>
                      <p className="text-xs font-medium text-gray-500 mt-1">{formatRupiah(s.current)} <span className="text-gray-400 font-normal">dari</span> {formatRupiah(s.target)}</p>
                    </div>
                    <span className="text-sm font-bold bg-indigo-50 text-indigo-700 px-2 py-1 rounded-lg">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 mb-5 overflow-hidden">
                    <div className="bg-indigo-600 h-3 rounded-full transition-all duration-1000 ease-out relative" style={{ width: `${progress}%` }}>
                       <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/20 animate-pulse"></div>
                    </div>
                  </div>
                  <button onClick={() => setAddModal(s.id)} className="w-full py-3 bg-indigo-50 text-indigo-700 font-bold rounded-xl text-sm hover:bg-indigo-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                    <IconPlus /> Tambah Saldo
                  </button>
                </div>
              )
            })}
            
            <button onClick={() => setShowForm(true)} className="w-full py-4 border-2 border-dashed border-indigo-300 text-indigo-600 font-bold rounded-3xl flex items-center justify-center gap-2 hover:bg-indigo-50 hover:border-indigo-400 transition-all">
              <IconPlus /> Buat Target Baru
            </button>
          </div>
        )}

        {/* Modal Nabung */}
        {addModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
             <div className="bg-white p-6 rounded-3xl w-full max-w-sm shadow-2xl">
                <h3 className="font-bold text-xl mb-1 text-gray-800">Menabung</h3>
                <p className="text-sm text-gray-500 mb-5">Masukkan nominal uang yang disisihkan.</p>
                <form onSubmit={handleAddAmount}>
                  <input type="number" required value={addAmount} onChange={(e) => setAddAmount(e.target.value)} placeholder="Nominal Rp" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl mb-6 outline-none focus:ring-2 focus:ring-indigo-500 text-lg transition-all" />
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setAddModal(null)} className="flex-1 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-medium active:scale-95 transition-transform">Batal</button>
                    <button type="submit" className="flex-1 py-3.5 bg-indigo-600 text-white rounded-xl font-bold shadow-md active:scale-95 transition-transform">Simpan</button>
                  </div>
                </form>
             </div>
          </div>
        )}
      </div>
    );
  };

  // --- Render Utama ---
  if (isAuthChecking) {
    return <div className="flex items-center justify-center h-screen bg-slate-50 w-full max-w-md mx-auto sm:border-x border-gray-200"><p className="text-indigo-600 font-bold animate-pulse">Memuat KeuanganKu...</p></div>;
  }

  return (
    <div className="w-full max-w-md mx-auto h-screen bg-slate-50 flex flex-col font-sans shadow-2xl relative overflow-hidden sm:border-x border-gray-200 text-gray-800">
      
      {/* Toast Notification */}
      {notification && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-5 py-3 rounded-full shadow-xl text-sm font-medium z-[200] animate-fade-in flex items-center gap-2">
          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
          {notification}
        </div>
      )}

      {/* Modal Pengaturan Profil */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in z-[100]">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 relative shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Pengaturan Profil</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Nama Tampilan</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="Masukkan nama Anda" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Foto Profil (Dari Galeri)</label>
                <input type="file" accept="image/*" onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => setEditPhoto(reader.result);
                    reader.readAsDataURL(file);
                  }
                }} className="w-full p-2 border border-gray-200 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200 cursor-pointer transition-all" />
                {editPhoto && <div className="mt-4 flex justify-center"><img src={editPhoto} alt="preview" className="w-24 h-24 object-cover rounded-full border-4 border-indigo-50 shadow-md" /></div>}
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowSettings(false)} className="flex-1 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-medium active:scale-95 transition-transform">Batal</button>
                <button onClick={saveProfile} className="flex-1 py-3.5 bg-indigo-600 text-white rounded-xl font-bold shadow-md active:scale-95 transition-transform">Simpan</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Area Konten Utama */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activeTab === 'home' && <HomeView />}
        {activeTab === 'salary' && <SalaryView />}
        {activeTab === 'tracker' && <TrackerView />}
        {activeTab === 'savings' && <SavingsView />}
      </div>

      {/* Navigasi Bawah (Bottom Navigation) ala Android */}
      <div className="bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center absolute bottom-0 w-full rounded-t-3xl shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.05)] pb-5 sm:pb-3">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 transition-colors relative ${activeTab === 'home' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}>
          <IconHome />
          <span className="text-[10px] font-bold">Beranda</span>
          {activeTab === 'home' && <div className="absolute -top-3 w-1 h-1 bg-indigo-600 rounded-full"></div>}
        </button>
        <button onClick={() => setActiveTab('salary')} className={`flex flex-col items-center gap-1 transition-colors relative ${activeTab === 'salary' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}>
          <IconCalculator />
          <span className="text-[10px] font-bold">Gaji</span>
          {activeTab === 'salary' && <div className="absolute -top-3 w-1 h-1 bg-indigo-600 rounded-full"></div>}
        </button>
        <button onClick={() => setActiveTab('tracker')} className={`flex flex-col items-center gap-1 transition-colors relative ${activeTab === 'tracker' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}>
          <IconWallet />
          <span className="text-[10px] font-bold">Keuangan</span>
          {activeTab === 'tracker' && <div className="absolute -top-3 w-1 h-1 bg-indigo-600 rounded-full"></div>}
        </button>
        <button onClick={() => setActiveTab('savings')} className={`flex flex-col items-center gap-1 transition-colors relative ${activeTab === 'savings' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}>
          <IconPiggyBank />
          <span className="text-[10px] font-bold">Tabungan</span>
          {activeTab === 'savings' && <div className="absolute -top-3 w-1 h-1 bg-indigo-600 rounded-full"></div>}
        </button>
      </div>

      <style>{`
        .animate-fade-in { animation: fadeIn 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        .custom-scrollbar::-webkit-scrollbar { width: 0px; background: transparent; }
        
        /* CSS Khusus Export PDF / Print */
        .print-only { display: none; }
        @media print {
          body * { visibility: hidden; }
          .print-container, .print-container * { visibility: visible; }
          .print-container { position: absolute; left: 0; top: 0; width: 100%; padding: 0; background: white; z-index: 9999; }
          .hide-on-print { display: none !important; }
          .print-only { display: block; margin-top: 20px;}
          .print-border { border: 1px solid #e5e7eb !important; margin-bottom: 12px; page-break-inside: avoid; border-radius: 8px; }
        }
      `}</style>
    </div>
  );
}
```
