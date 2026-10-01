import { useState, useEffect } from 'react';
import { 
  Home, ShoppingCart, Users, Package, DollarSign, 
  ListOrdered, LogOut, Search, Plus, Minus, 
  Trash2, CheckCircle2, Clock, ChevronRight, AlertCircle, Menu, X 
} from 'lucide-react';
import { 
  auth, db, appId, isFirebaseInitialized, 
  signInWithEmailAndPassword, onAuthStateChanged, signOut,
  collection, addDoc, updateDoc, onSnapshot, doc, serverTimestamp, getDocs
} from './firebase-config';

const LOGO_URL = "https://scontent.fssa15-1.fna.fbcdn.net/v/t39.30808-1/219328287_4179125075511732_2510958268718781333_n.jpg?stp=dst-jpg_tt6&cstp=mx909x909&ctp=s200x200&_nc_cat=106&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=2d3e12&_nc_ohc=-S3ank6Bh-IQ7kNvwFmRxdZ&_nc_oc=Adp4-FnKkGcpZnvC0YC33bVlV1tGRXavrIInJqFrDBUBa4SV6PHa_5E_tuk4I5oXF4M&_nc_zt=24&_nc_ht=scontent.fssa15-1.fna&_nc_gid=e0OXKFJG5P-f4A7Qoieyog&_nc_ss=7d289&oh=00_AQNGij7-yTRgdI62wRCMYnqiNpky8ikP5F30lbYBot9u0g&oe=6AC3369B";

const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

const formatDate = (dateStringOrTimestamp) => {
  if (!dateStringOrTimestamp) return '';
  const date = dateStringOrTimestamp?.toDate ? dateStringOrTimestamp.toDate() : new Date(dateStringOrTimestamp);
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
};

const isToday = (dateStringOrTimestamp) => {
  if (!dateStringOrTimestamp) return false;
  const date = dateStringOrTimestamp?.toDate ? dateStringOrTimestamp.toDate() : new Date(dateStringOrTimestamp);
  const today = new Date();
  return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
};

export default function App() {
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Estados dos dados (agora apenas alimentados pelo Firebase)
  const [students, setStudents] = useState([]);
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [payments, setPayments] = useState([]);

  // Login Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isFirebaseInitialized) {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setIsInitializing(false);
      });
      return () => unsubscribe();
    } else {
      setIsInitializing(false);
    }
  }, []);

  useEffect(() => {
    if (!user || !isFirebaseInitialized) return;
    
    const basePath = `artifacts/${appId}/users/${user.uid}`;
    const unsubs = [];

    unsubs.push(onSnapshot(collection(db, `${basePath}/students`), (snap) => {
      setStudents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }));

    unsubs.push(onSnapshot(collection(db, `${basePath}/products`), (snap) => {
      setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }));

    unsubs.push(onSnapshot(collection(db, `${basePath}/sales`), (snap) => {
      const data = snap.docs.map(doc => ({
        id: doc.id, ...doc.data(),
        createdAt: doc.data().createdAt || { toDate: () => new Date() }
      }));
      data.sort((a, b) => (b.createdAt?.toDate ? b.createdAt.toDate() : 0) - (a.createdAt?.toDate ? a.createdAt.toDate() : 0));
      setSales(data);
    }));

    unsubs.push(onSnapshot(collection(db, `${basePath}/payments`), (snap) => {
      setPayments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }));

    return () => unsubs.forEach(u => u());
  }, [user]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);
    
    if (!isFirebaseInitialized) {
      setLoginError("Erro: Conecte as credenciais do Firebase em src/firebase-config.js primeiro.");
      setIsLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error(error);
      setLoginError("Credenciais inválidas. Verifique seu e-mail e senha.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    if (isFirebaseInitialized) {
      await signOut(auth);
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-blue-900 font-medium gap-2">
        <Home className="animate-spin w-5 h-5" /> Carregando sistema...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
          <div className="flex justify-center mb-6">
            <img src={LOGO_URL} alt="Logo" className="w-24 h-24 rounded-full object-cover shadow-sm border-2 border-slate-100" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-center text-blue-900 mb-2">Colégio Novo Espaço</h1>
          <p className="text-center text-slate-500 mb-8 text-sm sm:text-base">Cantina - Painel Administrativo</p>
          
          <form className="space-y-4" onSubmit={handleLogin}>
            {loginError && (
              <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm text-center">
                {loginError}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-blue-900 mb-1">E-mail Administrativo</label>
              <input 
                type="email" required 
                value={email} onChange={e => setEmail(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                placeholder="admin@cantina.com" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-900 mb-1">Senha</label>
              <input 
                type="password" required 
                value={password} onChange={e => setPassword(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                placeholder="••••••••" 
              />
            </div>
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white font-medium py-3 px-4 rounded-lg transition-colors mt-4 disabled:opacity-50"
            >
              {isLoading ? 'Entrando...' : 'Entrar no Sistema'}
            </button>
          </form>
          {!isFirebaseInitialized && (
             <p className="text-xs text-center text-orange-500 mt-4 font-medium mt-6">
               Aviso: Banco de Dados Firebase não configurado. Adicione suas chaves em src/firebase-config.js.
             </p>
          )}
        </div>
      </div>
    );
  }

  const navigateTo = (view) => {
    setCurrentView(view);
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen flex relative bg-slate-50 font-sans text-slate-800 overflow-hidden">
      
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm z-30 lg:relative`}>
        <div className="p-6 flex items-center space-x-3 border-b border-slate-100 relative">
          <img src={LOGO_URL} alt="Logo" className="w-10 h-10 rounded-full object-cover border border-slate-200" />
          <div className="flex flex-col">
            <span className="font-bold text-sm text-blue-900 leading-none">Colégio</span>
            <span className="font-bold text-sm text-orange-500 leading-tight mt-1">Novo Espaço</span>
          </div>
          <button className="absolute right-4 lg:hidden text-slate-400" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <NavItem icon={Home} label="Dashboard" isActive={currentView === 'dashboard'} onClick={() => navigateTo('dashboard')} />
          <NavItem icon={ShoppingCart} label="Nova Venda" isActive={currentView === 'nova-venda'} highlight onClick={() => navigateTo('nova-venda')} />
          <div className="my-4 border-t border-slate-100" />
          <NavItem icon={Users} label="Alunos" isActive={currentView === 'alunos'} onClick={() => navigateTo('alunos')} />
          <NavItem icon={Package} label="Produtos" isActive={currentView === 'produtos'} onClick={() => navigateTo('produtos')} />
          <NavItem icon={AlertCircle} label="Pendências" isActive={currentView === 'pendencias'} onClick={() => navigateTo('pendencias')} />
          <NavItem icon={ListOrdered} label="Histórico" isActive={currentView === 'vendas'} onClick={() => navigateTo('vendas')} />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
            <LogOut className="w-5 h-5" />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white border-b border-slate-200 p-4 sm:p-6 shadow-sm z-0 flex items-center gap-4">
          <button className="lg:hidden text-slate-600 hover:text-blue-700" onClick={() => setIsSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
          <h2 className="text-xl sm:text-2xl font-bold text-blue-900 capitalize truncate">
            {currentView.replace('-', ' ')}
          </h2>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {currentView === 'dashboard' && <DashboardView sales={sales} />}
            {currentView === 'nova-venda' && <NovaVendaView products={products} students={students} user={user} />}
            {currentView === 'alunos' && <AlunosView students={students} user={user} />}
            {currentView === 'produtos' && <ProdutosView products={products} user={user} />}
            {currentView === 'pendencias' && <PendenciasView students={students} user={user} />}
            {currentView === 'vendas' && <VendasView sales={sales} />}
          </div>
        </div>
      </main>
    </div>
  );
}

// Components auxiliares
function NavItem({ icon: Icon, label, isActive, highlight, onClick }) {
  const baseClass = `w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all `;
  const activeClass = highlight 
    ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-md font-medium' 
    : isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-50 hover:text-blue-700';
  const iconColor = highlight ? 'text-white' : isActive ? 'text-blue-700' : 'text-slate-500';

  return (
    <button onClick={onClick} className={baseClass + activeClass}>
      <Icon className={`${iconColor} w-5 h-5`} />
      <span>{label}</span>
    </button>
  );
}

const renderPaymentBadge = (method) => {
  const styles = {
    'PIX': 'bg-teal-50 text-teal-700 border-teal-200',
    'DINHEIRO': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'FIADO': 'bg-orange-50 text-orange-700 border-orange-200',
    'PAGO ANTES': 'bg-blue-50 text-blue-700 border-blue-200',
  };
  return <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${styles[method] || 'bg-slate-100 text-slate-700 border-slate-200'} whitespace-nowrap`}>{method}</span>;
};

// ================= Views =================

function DashboardView({ sales }) {
  const todaySales = sales.filter(s => isToday(s.createdAt));
  const total = todaySales.reduce((acc, s) => acc + s.total, 0);
  const fiado = todaySales.filter(s => s.paymentMethod === 'FIADO').reduce((acc, s) => acc + s.total, 0);
  const recebido = total - fiado;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard title="Vendas Hoje" value={todaySales.length} icon={ShoppingCart} color="blue" />
        <StatCard title="Valor Total" value={formatCurrency(total)} icon={DollarSign} color="blue" />
        <StatCard title="Recebido (Pix/Din)" value={formatCurrency(recebido)} icon={CheckCircle2} color="emerald" />
        <StatCard title="Em Fiado" value={formatCurrency(fiado)} icon={Clock} color="orange" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mt-8">
        <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-lg font-bold text-blue-900">Últimas Vendas</h3>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[600px]">
            <thead className="bg-slate-50 text-slate-500 text-sm">
              <tr>
                <th className="px-6 py-4 text-left font-medium">Horário</th>
                <th className="px-6 py-4 text-left font-medium">Aluno</th>
                <th className="px-6 py-4 text-left font-medium">Itens</th>
                <th className="px-6 py-4 text-right font-medium">Valor</th>
                <th className="px-6 py-4 text-center font-medium">Pagamento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {todaySales.slice(0, 5).map(sale => (
                <tr key={sale.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 text-sm text-slate-600">{formatDate(sale.createdAt).split(' ')[1]}</td>
                  <td className="px-6 py-4 text-sm font-medium text-blue-900">{sale.studentName}</td>
                  <td className="px-6 py-4 text-sm text-slate-500 truncate max-w-xs">{sale.items?.map(i => `${i.quantity}x ${i.name}`).join(', ')}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-800 text-right">{formatCurrency(sale.total)}</td>
                  <td className="px-6 py-4 text-center">{renderPaymentBadge(sale.paymentMethod)}</td>
                </tr>
              ))}
              {todaySales.length === 0 && <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">Nenhuma venda hoje.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    orange: 'bg-orange-50 text-orange-600',
  };
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
      <div className={`p-4 rounded-xl flex-shrink-0 ${colors[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="overflow-hidden">
        <p className="text-sm font-medium text-slate-500 truncate">{title}</p>
        <p className="text-2xl font-bold text-blue-900 truncate">{value}</p>
      </div>
    </div>
  );
}

function NovaVendaView({ products, students, user }) {
  const [step, setStep] = useState(1);
  const [student, setStudent] = useState(null);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [payment, setPayment] = useState('');

  const filtered = search ? students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.registration.includes(search)).slice(0, 5) : [];
  const activeProducts = products.filter(p => p.active);
  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const addToCart = (prod) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === prod.id);
      if (ex) return prev.map(i => i.id === prod.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...prod, quantity: 1 }];
    });
  };

  const updateCart = (id, delta) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: i.quantity + delta } : i).filter(i => i.quantity > 0));
  };

  const submit = async () => {
    if (!isFirebaseInitialized) return alert('Firebase não configurado.');
    
    const saleData = {
      studentId: student.id,
      studentName: student.name,
      total: cartTotal,
      paymentMethod: payment,
      createdAt: serverTimestamp(),
      items: cart
    };
    
    const basePath = `artifacts/${appId}/users/${user.uid}`;
    await addDoc(collection(db, `${basePath}/sales`), saleData);
    
    if (payment === 'FIADO') {
      await updateDoc(doc(db, `${basePath}/students`, student.id), { pendingBalance: (student.pendingBalance || 0) + cartTotal });
    }
    
    setCart([]);
    setStep(1);
    setStudent(null);
    setPayment('');
    setSearch('');
    alert('Venda confirmada!');
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-10rem)] gap-6">
      <div className="flex-1 flex flex-col space-y-6">
        <div className={`bg-white rounded-2xl shadow-sm border p-6 ${step === 1 ? 'border-orange-300 ring-2 ring-orange-100' : 'border-slate-200'}`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 1 ? 'bg-orange-500 text-white' : 'bg-slate-200 text-slate-500'}`}>1</span>
              Selecionar Aluno
            </h3>
            {student && step > 1 && <button onClick={() => setStep(1)} className="text-sm text-blue-600 hover:underline">Alterar</button>}
          </div>

          {step === 1 ? (
            <div className="relative">
              <Search className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
              <input type="text" placeholder="Buscar aluno..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" />
              {search && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-20">
                  {filtered.length ? filtered.map(s => (
                    <div key={s.id} onClick={() => { setStudent(s); setStep(2); setSearch(''); }} className="p-4 hover:bg-orange-50 cursor-pointer border-b flex justify-between items-center">
                      <div><p className="font-bold text-blue-900">{s.name}</p><p className="text-sm text-slate-500">{s.class}</p></div>
                      <ChevronRight className="text-slate-300 w-5 h-5" />
                    </div>
                  )) : <div className="p-4 text-center text-slate-500">Nenhum aluno.</div>}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-xl">{student?.name.charAt(0)}</div>
              <div><p className="font-bold text-blue-900 text-lg">{student?.name}</p><p className="text-sm text-slate-500">{student?.class}</p></div>
            </div>
          )}
        </div>

        <div className={`flex-1 bg-white rounded-2xl shadow-sm border p-6 flex flex-col ${step === 2 ? 'border-orange-300 ring-2 ring-orange-100' : 'border-slate-200'} ${step < 2 ? 'opacity-50 pointer-events-none' : ''}`}>
          <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2 mb-6">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 2 ? 'bg-orange-500 text-white' : 'bg-slate-200 text-slate-500'}`}>2</span>
            Adicionar Produtos
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 pr-2">
            {activeProducts.map(p => (
              <button key={p.id} onClick={() => addToCart(p)} className="bg-white border-2 border-slate-100 hover:border-orange-400 rounded-xl p-4 flex flex-col items-center justify-center transition-all hover:shadow-md active:scale-95 h-32">
                <span className="font-bold text-blue-900 mb-2 text-sm text-center">{p.name}</span>
                <span className="text-orange-600 font-bold bg-orange-50 px-3 py-1 rounded-full text-sm">{formatCurrency(p.price)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={`w-full lg:w-96 bg-white rounded-2xl shadow-md border flex flex-col ${step === 3 ? 'border-orange-300 ring-2 ring-orange-100' : 'border-slate-200'} ${step < 2 ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
          <h3 className="text-lg font-bold text-blue-900">Resumo do Pedido</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4 cart-scroll">
          {cart.length === 0 ? (
             <div className="text-center text-slate-400 py-8 flex flex-col items-center">
               <ShoppingCart className="w-12 h-12 mb-4 opacity-20" />
               <p>Carrinho vazio.</p>
             </div>
          ) : cart.map(item => (
            <div key={item.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="flex-1 pr-2">
                <p className="font-bold text-slate-800 text-sm truncate">{item.name}</p>
                <p className="text-orange-600 font-medium text-xs">{formatCurrency(item.price)}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={() => updateCart(item.id, -1)} className="p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-md">
                  {item.quantity === 1 ? <Trash2 className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                </button>
                <span className="font-bold text-blue-900 w-4 text-center">{item.quantity}</span>
                <button onClick={() => updateCart(item.id, 1)} className="p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-500 rounded-md"><Plus className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
          <div className="flex justify-between items-end mb-6">
            <span className="text-slate-500 font-medium">Total:</span>
            <span className="text-3xl font-black text-blue-900">{formatCurrency(cartTotal)}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-6">
            {['PIX', 'DINHEIRO', 'PAGO ANTES', 'FIADO'].map(m => (
              <button key={m} onClick={() => setPayment(m)} disabled={cart.length === 0} className={`py-3 px-2 rounded-xl text-xs font-bold transition-all border-2 ${payment === m ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300'}`}>
                {m}
              </button>
            ))}
          </div>
          <button onClick={submit} disabled={!student || !cart.length || !payment} className="w-full py-4 rounded-xl font-bold text-lg flex justify-center bg-orange-500 text-white disabled:bg-slate-200 disabled:text-slate-400 hover:bg-orange-600 transition-colors shadow-md">
            CONFIRMAR VENDA
          </button>
        </div>
      </div>
    </div>
  );
}

function AlunosView({ students, user }) {
  const [search, setSearch] = useState('');
  const filtered = students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.registration.includes(search));

  const addAluno = async () => {
    const name = prompt("Nome do aluno:");
    if (!name) return;
    const registration = prompt("Matrícula:");
    const turma = prompt("Turma:");
    
    if (isFirebaseInitialized) {
      await addDoc(collection(db, `artifacts/${appId}/users/${user.uid}/students`), {
        name, registration, class: turma, pendingBalance: 0
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-2.5 text-slate-400 w-5 h-5" />
          <input type="text" placeholder="Buscar aluno..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <button onClick={addAluno} className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2">
          <Plus className="w-4 h-4" /> Novo Aluno
        </button>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead className="bg-slate-50 text-slate-500 text-sm">
            <tr><th className="px-6 py-4 text-left">Nome</th><th className="px-6 py-4 text-left">Matrícula</th><th className="px-6 py-4 text-left">Turma</th><th className="px-6 py-4 text-right">Pendência</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(s => (
              <tr key={s.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-bold text-blue-900">{s.name}</td>
                <td className="px-6 py-4 text-slate-600">{s.registration}</td>
                <td className="px-6 py-4 text-slate-600">{s.class}</td>
                <td className={`px-6 py-4 text-right font-bold ${s.pendingBalance > 0 ? 'text-red-500' : 'text-slate-400'}`}>{formatCurrency(s.pendingBalance)}</td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500">Nenhum aluno encontrado.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProdutosView({ products, user }) {
  const addProduto = async () => {
    const name = prompt("Nome do produto:");
    if (!name) return;
    const priceStr = prompt("Preço (R$):");
    const price = parseFloat(priceStr.replace(',', '.'));
    if (isNaN(price)) return alert("Preço inválido");

    if (isFirebaseInitialized) {
      await addDoc(collection(db, `artifacts/${appId}/users/${user.uid}/products`), {
        name, price, active: true
      });
    }
  };

  const toggleStatus = async (p) => {
    if (isFirebaseInitialized) {
      await updateDoc(doc(db, `artifacts/${appId}/users/${user.uid}/products`, p.id), { active: !p.active });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
         <button onClick={addProduto} className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2">
            <Plus className="w-4 h-4" /> Novo Produto
          </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map(p => (
          <div key={p.id} className={`bg-white rounded-2xl border p-6 ${p.active ? '' : 'opacity-60 bg-slate-50'}`}>
            <h3 className="text-lg font-bold text-blue-900">{p.name}</h3>
            <p className="text-2xl font-black text-orange-500 mt-2">{formatCurrency(p.price)}</p>
            <div className="mt-4 pt-4 border-t border-slate-100 text-right">
              <button onClick={() => toggleStatus(p)} className={`text-xs px-3 py-1 rounded-full font-medium ${p.active ? 'bg-emerald-50 text-emerald-700 hover:bg-slate-200 hover:text-slate-700' : 'bg-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'}`}>
                {p.active ? 'Ativo' : 'Inativo'}
              </button>
            </div>
          </div>
        ))}
        {products.length === 0 && <div className="col-span-full py-8 text-center text-slate-500">Nenhum produto cadastrado.</div>}
      </div>
    </div>
  );
}

function PendenciasView({ students, user }) {
  const pending = students.filter(s => (s.pendingBalance || 0) > 0);

  const quitar = async (s) => {
    if(!confirm(`Confirmar o pagamento de ${formatCurrency(s.pendingBalance)} referente a ${s.name}?`)) return;
    if (isFirebaseInitialized) {
      await addDoc(collection(db, `artifacts/${appId}/users/${user.uid}/payments`), { studentId: s.id, amount: s.pendingBalance, createdAt: serverTimestamp() });
      await updateDoc(doc(db, `artifacts/${appId}/users/${user.uid}/students`, s.id), { pendingBalance: 0 });
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {pending.length === 0 ? <div className="col-span-full text-center py-12 text-slate-500">Nenhuma pendência. Excelente!</div> : 
        pending.map(s => (
          <div key={s.id} className="bg-white rounded-2xl border p-6 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-blue-900 text-lg truncate">{s.name}</h4>
              <p className="text-sm text-slate-500">{s.class}</p>
              <p className="text-2xl font-black text-red-500 mt-4">{formatCurrency(s.pendingBalance)}</p>
            </div>
            <button onClick={() => quitar(s)} className="mt-6 w-full py-3 bg-slate-100 hover:bg-slate-200 text-blue-700 font-bold rounded-xl transition-colors">
              Registrar Pagto Total
            </button>
          </div>
        ))
      }
    </div>
  );
}

function VendasView({ sales }) {
  return (
    <div className="bg-white rounded-2xl border overflow-x-auto">
      <table className="w-full min-w-[600px]">
        <thead className="bg-slate-50 text-slate-500 text-sm">
          <tr><th className="px-6 py-4 text-left">Data/Hora</th><th className="px-6 py-4 text-left">Aluno</th><th className="px-6 py-4 text-left">Itens</th><th className="px-6 py-4 text-right">Valor</th><th className="px-6 py-4 text-center">Formato</th></tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {sales.map(s => (
            <tr key={s.id} className="hover:bg-slate-50">
              <td className="px-6 py-4 text-sm text-slate-600">{formatDate(s.createdAt)}</td>
              <td className="px-6 py-4 text-sm font-medium text-blue-900">{s.studentName}</td>
              <td className="px-6 py-4 text-sm text-slate-500 max-w-[200px] truncate">{s.items?.map(i => `${i.quantity}x ${i.name}`).join(', ')}</td>
              <td className="px-6 py-4 text-sm font-bold text-slate-800 text-right">{formatCurrency(s.total)}</td>
              <td className="px-6 py-4 text-center">{renderPaymentBadge(s.paymentMethod)}</td>
            </tr>
          ))}
          {sales.length === 0 && <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">Nenhuma venda registrada.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
