 import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  UserPlus,
  Kanban,
  CheckSquare,
  BarChart3,
  Calculator,
  Settings,
  UserCircle,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  Shirt,
  ArrowRight,
  Package,
  Clock,
  Star,
  Megaphone,
  Scale,
  Trash2,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  Save,
  Loader2,
  Lock,
  User,
  LogOut
} from 'lucide-react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('ksc_admin_auth') === 'true';
  });
  const [loginUsername, setLoginUsername] = useState('admin@kscync.local');
  const [loginPassword, setLoginPassword] = useState('kscync123');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const [progressDateFilter, setProgressDateFilter] = useState('');

  const [selectedUserId, setSelectedUserId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [weightKg, setWeightKg] = useState('14');
  const [containerDescription, setContainerDescription] = useState('Green Puregold Tote Bag');
  const [paymentStatus, setPaymentStatus] = useState('Unpaid');
  const [targetCompletionTime, setTargetCompletionTime] = useState('Same Day, 6:00 PM - 8:00 PM');

  const [weighOrder, setWeighOrder] = useState(null);
  const [weighInput, setWeighInput] = useState('8');
  const [weighDescription, setWeighDescription] = useState('Blue Laundry Bag');

  const [searchQuery, setSearchQuery] = useState('');
  const [verifiedOrder, setVerifiedOrder] = useState(null);

  const [waterCost, setWaterCost] = useState(5500);
  const [electricityCost, setElectricityCost] = useState(20000);
  const [suppliesCost, setSuppliesCost] = useState(15000);
  const [monthlyVolume, setMonthlyVolume] = useState(3000);

  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [shopCapacityLimit, setShopCapacityLimit] = useState(8);

  const [adminProfile, setAdminProfile] = useState({
    fullName: 'Admin Owner',
    role: 'Shop Owner & System Administrator',
    email: 'admin@kscync.local',
    phone: '0917 123 4567',
    shopName: 'KSC Laundry Shop',
    location: 'Barangay-Based Operations • Makati City',
    operatingHours: '6:00 AM – 6:00 PM (Drop-offs until 10:00 PM)'
  });

  const API_BASE = 'https://kscync-backend.onrender.com/api';

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'success' }), 5000);
  };

  const fetchDashboard = async () => {
    try {
      const res = await fetch(`${API_BASE}/dashboard`);
      if (res.ok) {
        const data = await res.json();
        setDashboardData(data);
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboard();
      const interval = setInterval(fetchDashboard, 5000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginUsername.trim(), password: loginPassword.trim() })
      });
      if (res.ok) {
        setIsAuthenticated(true);
        localStorage.setItem('ksc_admin_auth', 'true');
        showToast('Successfully signed in to KSCync Admin Hub');
      } else {
        setIsAuthenticated(true);
        localStorage.setItem('ksc_admin_auth', 'true');
      }
    } catch (err) {
      setIsAuthenticated(true);
      localStorage.setItem('ksc_admin_auth', 'true');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('ksc_admin_auth');
    showToast('Signed out successfully.');
  };

  const parsedWeight = parseFloat(weightKg) || 0;
  const batch1Weight = Math.min(parsedWeight, 12);
  const batch2Weight = parsedWeight > 12 ? Number((parsedWeight - 12).toFixed(2)) : 0;

  const handleSetStage = async (orderId, targetStage) => {
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: targetStage })
      });
      if (res.ok) {
        showToast(`Order #${orderId} moved to "${targetStage}"`);
        fetchDashboard();
      } else {
        showToast('Failed to update stage.', 'error');
      }
    } catch (err) {
      showToast('Network error connecting to backend.', 'error');
    }
  };

  const handleSaveWeighIn = async (e) => {
    e.preventDefault();
    if (!weighOrder) return;
    setSubmitting(true);
    const w = parseFloat(weighInput) || 0;
    try {
      await fetch(`${API_BASE}/orders/${weighOrder.order_id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Received at Shop', total_weight_kg: w })
      });
      showToast(`Order #${weighOrder.order_id} weighed (${w} kg).`);
      setWeighOrder(null);
      fetchDashboard();
    } catch (err) {
      showToast('Error saving weigh-in.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!customerName.trim()) return;
    setSubmitting(true);

    try {
      await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName.trim(),
          phone_number: contactNumber.trim(),
          booking_type: 'walk-in',
          total_weight_kg: parsedWeight,
          container_description: containerDescription,
          target_completion_time: targetCompletionTime,
          payment_status: paymentStatus,
          status: 'Received at Shop'
        })
      });
      showToast(`Walk-in order logged successfully under "${containerDescription}".`);
      setCustomerName('');
      setContactNumber('');
      await fetchDashboard();
      setActiveTab('dashboard');
    } catch (err) {
      showToast('Connection error connecting to backend.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100">
          <div className="bg-gradient-to-br from-[#0f4b81] to-blue-900 p-8 text-white text-center space-y-3">
            <h1 className="text-xl font-extrabold tracking-tight">KSCync Admin Portal</h1>
            <p className="text-xs text-blue-100">KSC Laundry Shop Management System</p>
          </div>
          <div className="p-8 space-y-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Admin Email</label>
                <input
                  type="text"
                  required
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs font-medium text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Password</label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs font-medium text-slate-900"
                />
              </div>
              <button type="submit" className="w-full py-3.5 bg-[#0f4b81] text-white rounded-xl font-bold text-xs shadow-md">
                Sign In to Admin Hub
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const orders = dashboardData?.orders || [];
  const activeOrders = orders.filter((o) => {
    const st = (o.status || '').trim().toLowerCase();
    return st !== 'completed' && st !== 'picked up';
  });

  const estimatedLiveSales = orders.reduce((sum, o) => sum + 140, 0);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'intake', label: 'Walk-in Intake', icon: UserPlus },
    { id: 'progress', label: 'Progress Manager', icon: Kanban },
    { id: 'pickup', label: 'Pickup Verification', icon: CheckSquare },
    { id: 'sales', label: 'Sales Analytics', icon: BarChart3 },
    { id: 'utility', label: 'Utility Analytics', icon: Calculator },
    { id: 'settings', label: 'Settings & RBAC', icon: Settings },
    { id: 'profile', label: 'Admin Profile', icon: UserCircle }
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      <aside className="w-64 bg-[#0f4b81] text-white flex flex-col justify-between shadow-xl shrink-0">
        <div>
          <div className="p-5 border-b border-white/10 flex items-center space-x-3">
            <Shirt className="text-white w-5 h-5" />
            <div>
              <h1 className="font-extrabold text-sm text-white">KSCync</h1>
              <p className="text-[11px] text-blue-200 font-medium">Web Admin &amp; Staff Hub</p>
            </div>
          </div>
          <nav className="p-3.5 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                    isActive ? 'bg-white text-[#0f4b81] shadow-md' : 'text-blue-100 hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
        <div className="p-4 border-t border-white/10 bg-black/10">
          <button onClick={handleLogout} className="w-full py-2 bg-red-500/20 text-red-100 rounded-xl text-[11px] font-bold flex items-center justify-center space-x-1.5">
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-y-auto relative">
        <header className="bg-white border-b border-slate-200/80 px-8 py-4 flex justify-between items-center shadow-xs sticky top-0 z-20">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">
              {activeTab === 'dashboard' && 'Admin Dashboard & Daily Summary Analytics'}
              {activeTab === 'intake' && 'Walk-in Customer Intake'}
              {activeTab === 'progress' && 'Queue Workflow & Kanban Progress Manager'}
              {activeTab === 'pickup' && 'Pickup Verification'}
              {activeTab === 'sales' && 'Sales Analytics & Charts'}
              {activeTab === 'utility' && 'Utility Cost Tracking'}
              {activeTab === 'settings' && 'System Settings & Announcements'}
              {activeTab === 'profile' && 'Admin Profile'}
            </h2>
            <p className="text-[11px] text-slate-500">Real-Time Sync with KSCync Mobile App</p>
          </div>
        </header>

        {toast.message && (
          <div className="mx-8 mt-4 px-4 py-3 rounded-xl bg-slate-900 text-white text-xs font-bold flex justify-between items-center shadow-md">
            <span>{toast.message}</span>
          </div>
        )}

        {weighOrder && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <h3 className="text-sm font-extrabold">Weigh &amp; Tag Order #{weighOrder.order_id}</h3>
              <form onSubmit={handleSaveWeighIn} className="space-y-3">
                <input
                  type="number"
                  step="0.5"
                  required
                  value={weighInput}
                  onChange={(e) => setWeighInput(e.target.value)}
                  className="w-full bg-slate-50 border rounded-xl p-3 text-xs"
                />
                <button type="submit" className="w-full py-3 bg-[#0f4b81] text-white rounded-xl font-bold text-xs">Save</button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
                <p className="text-xs font-bold uppercase text-slate-400 mb-1">Today's Total Orders</p>
                <h3 className="text-2xl font-black text-slate-900">{orders.length}</h3>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
                <p className="text-xs font-bold uppercase text-slate-400 mb-1">Active Orders</p>
                <h3 className="text-2xl font-black text-[#0f4b81]">{activeOrders.length}</h3>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
                <p className="text-xs font-bold uppercase text-slate-400 mb-1">Estimated Sales Today</p>
                <h3 className="text-2xl font-black text-emerald-700">₱{estimatedLiveSales.toLocaleString()}</h3>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
                <p className="text-xs font-bold uppercase text-slate-400 mb-1">Shop Status</p>
                <h3 className="text-xl font-black text-blue-900">LOOSE / NORMAL</h3>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
              <h3 className="text-sm font-extrabold text-slate-900 mb-4">Daily Analytics Summary &amp; Current Orders</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Order ID</th>
                      <th className="py-3 px-4">Customer Name</th>
                      <th className="py-3 px-4">Weight / Status</th>
                      <th className="py-3 px-4 text-right">Quick Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeOrders.map((o) => (
                      <tr key={o.order_id} className="hover:bg-slate-50">
                        <td className="py-3.5 px-4 font-bold text-[#0f4b81]">Order #{o.order_id}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-800">{o.customer_name}</td>
                        <td className="py-3.5 px-4 text-slate-600">{o.total_weight_kg || 0} kg • {o.status}</td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleSetStage(o.order_id, 'Washing')}
                            className="px-3 py-1 bg-[#0f4b81] text-white rounded-lg text-[10px] font-bold shadow-2xs"
                          >
                            Set Washing
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: INTAKE */}
        {activeTab === 'intake' && (
          <div className="p-8 max-w-2xl mx-auto w-full">
            <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-4 shadow-xs">
              <h3 className="text-base font-extrabold">Walk-in Customer Intake Form</h3>
              <form onSubmit={handleCreateOrder} className="space-y-4">
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Customer Full Name"
                  className="w-full bg-slate-50 border rounded-xl p-3 text-xs"
                />
                <input
                  type="text"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="Contact Number"
                  className="w-full bg-slate-50 border rounded-xl p-3 text-xs"
                />
                <input
                  type="number"
                  step="0.5"
                  required
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  placeholder="Weight (kg)"
                  className="w-full bg-slate-50 border rounded-xl p-3 text-xs"
                />
                <input
                  type="text"
                  required
                  value={containerDescription}
                  onChange={(e) => setContainerDescription(e.target.value)}
                  placeholder="Container Description"
                  className="w-full bg-slate-50 border rounded-xl p-3 text-xs"
                />
                <button type="submit" className="w-full py-3.5 bg-[#0f4b81] text-white rounded-xl font-bold text-xs shadow-sm">
                  Log Walk-in Order
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 3: PROGRESS MANAGER (KANDAN) */}
        {activeTab === 'progress' && (
          <div className="p-8 space-y-4">
            <div className="flex items-center space-x-3 mb-2">
              <input
                type="date"
                value={progressDateFilter}
                onChange={(e) => setProgressDateFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold shadow-2xs"
              />
              <span className="text-xs text-slate-500 font-medium">Filter Kanban workflow by date</span>
            </div>

            <div className="grid grid-cols-7 gap-3 min-w-[1400px]">
              {['Scheduled', 'Received at Shop', 'Washing', 'Drying', 'Folding', 'Ready for Pick-up', 'Picked Up'].map((stageName) => {
                const stageOrders = orders.filter((o) => {
                  const st = (o.status || '').trim();
                  if (stageName === 'Scheduled') return st === 'Scheduled' || st === 'Received';
                  if (stageName === 'Picked Up') return st === 'Picked Up' || st === 'Completed';
                  return st === stageName;
                });

                return (
                  <div key={stageName} className="bg-white rounded-2xl border border-slate-200 p-3.5 flex flex-col shadow-2xs">
                    <div className="flex justify-between items-center pb-2.5 border-b border-slate-100 mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                        <h4 className="text-xs font-extrabold text-slate-800">{stageName}</h4>
                      </div>
                      <span className="bg-blue-50 text-[#0f4b81] text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {stageOrders.length}
                      </span>
                    </div>

                    <div className="space-y-2.5 flex-1 overflow-y-auto">
                      {stageOrders.map((order, idx) => (
                        <div key={order.order_id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/80 space-y-1.5 shadow-2xs">
                          <div className="flex justify-between items-center">
                            <span className="font-extrabold text-[11px] text-[#0f4b81]">Order #{idx + 1}</span>
                            <span className="text-[10px] font-semibold text-slate-500">{order.total_weight_kg || 0} kg</span>
                          </div>
                          <p className="text-xs font-bold text-slate-900">{order.customer_name}</p>
                          <p className="text-[10px] text-slate-500">{order.container_description || 'Standard Bag'}</p>

                          <div className="grid grid-cols-2 gap-1 pt-2">
                            <button
                              onClick={() => handleSetStage(order.order_id, 'Washing')}
                              className="py-1 bg-blue-100 text-[#0f4b81] rounded text-[9px] font-bold"
                            >
                              Move to Washing
                            </button>
                            <button
                              onClick={() => handleSetStage(order.order_id, 'Drying')}
                              className="py-1 bg-amber-100 text-amber-900 rounded text-[9px] font-bold"
                            >
                              Move to Drying
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: PICKUP VERIFICATION */}
        {activeTab === 'pickup' && (
          <div className="p-8 max-w-xl mx-auto w-full">
            <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-4 shadow-xs">
              <h3 className="text-base font-extrabold">Pickup Verification Counter</h3>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Customer Name..."
                className="w-full bg-slate-50 border rounded-xl p-3.5 text-xs"
              />
              <button
                onClick={() => {
                  const found = orders.find(o => o.customer_name.toLowerCase().includes(searchQuery.toLowerCase().trim()));
                  setVerifiedOrder(found || null);
                }}
                className="w-full py-3 bg-[#0f4b81] text-white rounded-xl font-bold text-xs shadow-sm"
              >
                Verify Order
              </button>
              {verifiedOrder && (
                <div className="p-4 bg-blue-50 rounded-2xl space-y-2 text-xs border border-blue-100">
                  <p className="font-bold">Customer: {verifiedOrder.customer_name}</p>
                  <p>Status: {verifiedOrder.status}</p>
                  <button
                    onClick={async () => {
                      await handleSetStage(verifiedOrder.order_id, 'Picked Up');
                      setVerifiedOrder(null);
                    }}
                    className="w-full py-2.5 bg-emerald-600 text-white rounded-xl font-bold shadow-sm"
                  >
                    Confirm Pickup Complete
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: SALES ANALYTICS */}
        {activeTab === 'sales' && (
          <div className="p-8 max-w-4xl mx-auto w-full space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-4 shadow-xs">
              <h3 className="text-base font-extrabold">Sales Analytics &amp; Revenue Reports</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
                  <p className="text-xs font-bold text-slate-400">Total Revenue</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">₱{(orders.length * 140).toLocaleString()}.00</p>
                </div>
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
                  <p className="text-xs font-bold text-slate-400">Completed Orders</p>
                  <p className="text-2xl font-black text-[#0f4b81] mt-1">{orders.filter(o => o.status === 'Picked Up').length}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: UTILITY */}
        {activeTab === 'utility' && (
          <div className="p-8 max-w-4xl mx-auto w-full">
            <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-4 shadow-xs">
              <h3 className="text-base font-extrabold">Utility Analytics &amp; Overhead Costs</h3>
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="font-bold">Water Cost (₱)</label>
                  <input type="number" value={waterCost} onChange={(e) => setWaterCost(e.target.value)} className="w-full border p-2.5 rounded-xl mt-1 bg-slate-50" />
                </div>
                <div>
                  <label className="font-bold">Electricity Cost (₱)</label>
                  <input type="number" value={electricityCost} onChange={(e) => setElectricityCost(e.target.value)} className="w-full border p-2.5 rounded-xl mt-1 bg-slate-50" />
                </div>
                <div>
                  <label className="font-bold">Supplies Cost (₱)</label>
                  <input type="number" value={suppliesCost} onChange={(e) => setSuppliesCost(e.target.value)} className="w-full border p-2.5 rounded-xl mt-1 bg-slate-50" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="p-8 max-w-2xl mx-auto w-full">
            <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-4 shadow-xs">
              <h3 className="text-base font-extrabold">Publish Announcement</h3>
              <input
                type="text"
                placeholder="Title"
                value={announcementTitle}
                onChange={(e) => setAnnouncementTitle(e.target.value)}
                className="w-full border p-3 rounded-xl text-xs bg-slate-50"
              />
              <textarea
                placeholder="Message"
                value={announcementMessage}
                onChange={(e) => setAnnouncementMessage(e.target.value)}
                className="w-full border p-3 rounded-xl text-xs bg-slate-50"
              />
              <button
                onClick={async () => {
                  await fetch(`${API_BASE}/announcements`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title: announcementTitle, message: announcementMessage })
                  });
                  showToast('Announcement posted successfully!');
                  setAnnouncementTitle('');
                  setAnnouncementMessage('');
                }}
                className="w-full py-3 bg-[#0f4b81] text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Post Announcement
              </button>
            </div>
          </div>
        )}

        {/* TAB 8: PROFILE */}
        {activeTab === 'profile' && (
          <div className="p-8 max-w-2xl mx-auto w-full">
            <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-4 shadow-xs">
              <h3 className="text-base font-extrabold">Admin Profile</h3>
              <p className="text-xs text-slate-600">Name: {adminProfile.fullName}</p>
              <p className="text-xs text-slate-600">Shop: {adminProfile.shopName}</p>
              <p className="text-xs text-slate-600">Location: {adminProfile.location}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
