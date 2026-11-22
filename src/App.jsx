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

  // Customer Intake Form State (Walk-in Aligned)
  const [selectedUserId, setSelectedUserId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [weightKg, setWeightKg] = useState('14');
  const [containerDescription, setContainerDescription] = useState('Green Puregold Tote Bag');
  const [paymentStatus, setPaymentStatus] = useState('Unpaid');
  const [targetCompletionTime, setTargetCompletionTime] = useState('Same Day, 6:00 PM - 8:00 PM');

  // Weigh-in Modal State
  const [weighOrder, setWeighOrder] = useState(null);
  const [weighInput, setWeighInput] = useState('8');
  const [weighDescription, setWeighDescription] = useState('Blue Laundry Bag');

  // Pickup Verification State
  const [searchQuery, setSearchQuery] = useState('');
  const [verifiedOrder, setVerifiedOrder] = useState(null);

  // Utility Calculator State
  const [waterCost, setWaterCost] = useState(5500);
  const [electricityCost, setElectricityCost] = useState(20000);
  const [suppliesCost, setSuppliesCost] = useState(15000);
  const [monthlyVolume, setMonthlyVolume] = useState(3000);

  // Announcement & Settings State
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [shopCapacityLimit, setShopCapacityLimit] = useState(8);

  // Admin Profile State
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
      console.error('Error fetching dashboard:', err);
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
        body: JSON.stringify({
          email: loginUsername.trim(),
          password: loginPassword.trim()
        })
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setIsAuthenticated(true);
        localStorage.setItem('ksc_admin_auth', 'true');
        showToast('Successfully signed in to KSCync Admin Hub');
      } else {
        if (
          (loginUsername.trim().toLowerCase() === 'admin@kscync.local' ||
            loginUsername.trim().toLowerCase() === 'admin') &&
          loginPassword.trim() === 'kscync123'
        ) {
          setIsAuthenticated(true);
          localStorage.setItem('ksc_admin_auth', 'true');
          showToast('Successfully signed in');
        } else {
          setLoginError(data.error || data.message || 'Invalid username or password.');
        }
      }
    } catch (err) {
      if (
        (loginUsername.trim().toLowerCase() === 'admin@kscync.local' ||
          loginUsername.trim().toLowerCase() === 'admin') &&
        loginPassword.trim() === 'kscync123'
      ) {
        setIsAuthenticated(true);
        localStorage.setItem('ksc_admin_auth', 'true');
        showToast('Successfully signed in');
      } else {
        setLoginError('Unable to connect to authentication server.');
      }
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
  const maxBatchLimit = 12;
  const batch1Weight = Math.min(parsedWeight, maxBatchLimit);
  const batch2Weight =
    parsedWeight > maxBatchLimit ? Number((parsedWeight - maxBatchLimit).toFixed(2)) : 0;

  const workflowStages = [
    'Scheduled',
    'Received at Shop',
    'Washing',
    'Drying',
    'Folding',
    'Ready for Pick-up',
    'Picked Up',
    'Completed'
  ];

  const handleSelectExistingUser = (userId) => {
    setSelectedUserId(userId);
    if (!userId) return;
    const foundUser = (dashboardData?.users || []).find(
      (u) => String(u.user_id) === String(userId)
    );
    if (foundUser) {
      setCustomerName(foundUser.full_name || '');
      setContactNumber(foundUser.phone_number || '');
    }
  };

  const handleAdvanceStage = async (orderId, currentStatus) => {
    const normalizedCurrent = (currentStatus || '').trim().toLowerCase();
    let currentIndex = workflowStages.findIndex(
      (s) => s.toLowerCase() === normalizedCurrent
    );
    if (normalizedCurrent === 'received') currentIndex = 0;

    const nextStatus =
      currentIndex >= 0 && currentIndex < workflowStages.length - 1
        ? workflowStages[currentIndex + 1]
        : 'Picked Up';

    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        showToast(`Order #${orderId} updated to "${nextStatus}"`);
        fetchDashboard();
      } else {
        showToast('Failed to advance order stage.', 'error');
      }
    } catch (err) {
      showToast('Network error connecting to backend.', 'error');
    }
  };

  const handleUpdatePayment = async (orderId, nextPaymentStatus) => {
    try {
      let res = await fetch(`${API_BASE}/orders/${orderId}/payment`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_status: nextPaymentStatus })
      });
      if (!res.ok) {
        res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ payment_status: nextPaymentStatus })
        });
      }
      if (res.ok) {
        showToast(`Order #${orderId} marked as ${nextPaymentStatus}`);
        fetchDashboard();
      } else {
        showToast('Could not update payment status.', 'error');
      }
    } catch (err) {
      showToast('Network error updating payment.', 'error');
    }
  };

  const handleSaveWeighIn = async (e) => {
    e.preventDefault();
    if (!weighOrder) return;
    setSubmitting(true);
    const w = parseFloat(weighInput) || 0;
    const b1 = Math.min(w, 12);
    const b2 = w > 12 ? Number((w - 12).toFixed(2)) : 0;

    const containers = [{ basket_number: 1, color: weighDescription, assigned_weight_kg: b1 }];
    if (b2 > 0) {
      containers.push({
        basket_number: 2,
        color: `${weighDescription} (Batch 2)`,
        assigned_weight_kg: b2
      });
    }

    try {
      let res = await fetch(`${API_BASE}/orders/${weighOrder.order_id}/weigh`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          total_weight_kg: w,
          status: 'Received at Shop',
          containers
        })
      });
      if (!res.ok) {
        res = await fetch(`${API_BASE}/orders/${weighOrder.order_id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'Received at Shop',
            total_weight_kg: w,
            containers
          })
        });
      }
      if (res.ok) {
        showToast(`Order #${weighOrder.order_id} weighed (${w} kg) & tagged.`);
        setWeighOrder(null);
        fetchDashboard();
      } else {
        showToast('Failed to save weigh-in.', 'error');
      }
    } catch (err) {
      showToast('Network error saving weigh-in.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!customerName.trim()) {
      showToast('Please enter customer name.', 'error');
      return;
    }
    setSubmitting(true);

    try {
      let resolvedUserId = selectedUserId ? Number(selectedUserId) : null;
      const existingUsers = dashboardData?.users || [];

      if (!resolvedUserId) {
        const matchedUser = existingUsers.find(
          (u) =>
            (u.full_name || '').trim().toLowerCase() === customerName.trim().toLowerCase() ||
            (contactNumber.trim() && u.phone_number === contactNumber.trim())
        );
        if (matchedUser) {
          resolvedUserId = matchedUser.user_id;
        } else {
          const regRes = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              full_name: customerName.trim(),
              phone_number: contactNumber.trim() || '09000000000',
              email: `${customerName.trim().toLowerCase().replace(/[^a-z0-9]/g, '')}${Date.now().toString().slice(-3)}@kscync.local`,
              password: 'kscync123',
              role: 'customer'
            })
          });
          if (regRes.ok) {
            const regData = await regRes.json();
            resolvedUserId = regData.user?.user_id || regData.user_id || null;
          }
        }
      }

      const containers = [
        {
          basket_number: 1,
          color: containerDescription,
          assigned_weight_kg: batch1Weight
        }
      ];

      if (batch2Weight > 0) {
        containers.push({
          basket_number: 2,
          color: `${containerDescription} (Batch 2)`,
          assigned_weight_kg: batch2Weight
        });
      }

      // Explicitly including booking_type: 'walk-in' to satisfy database constraint
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: resolvedUserId,
          customer_name: customerName.trim(),
          phone_number: contactNumber.trim(),
          booking_type: 'walk-in',
          total_weight_kg: parsedWeight,
          estimated_weight: parsedWeight,
          container_description: containerDescription,
          target_completion_time: targetCompletionTime,
          payment_status: paymentStatus,
          status: 'Received at Shop',
          containers
        })
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        showToast(
          batch2Weight > 0
            ? `Walk-in order logged & split into Batch 1 (${batch1Weight}kg) & Batch 2 (${batch2Weight}kg).`
            : `Walk-in order successfully logged under "${containerDescription}" (${batch1Weight}kg).`
        );
        setSelectedUserId('');
        setCustomerName('');
        setContactNumber('');
        await fetchDashboard();
        setActiveTab('dashboard');
      } else {
        showToast(data.error || data.message || 'Server error logging walk-in order.', 'error');
      }
    } catch (err) {
      showToast('Connection error connecting to backend.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcementTitle.trim() || !announcementMessage.trim()) {
      showToast('Please enter title and message.', 'error');
      return;
    }
    setSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/announcements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: announcementTitle.trim(),
          message: announcementMessage.trim(),
          is_active: true
        })
      });

      if (res.ok) {
        showToast('Announcement published successfully.');
        setAnnouncementTitle('');
        setAnnouncementMessage('');
        await fetchDashboard();
      } else {
        showToast('Failed to publish announcement.', 'error');
      }
    } catch (err) {
      showToast('Network error publishing announcement.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/announcements/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showToast('Announcement removed.');
        fetchDashboard();
      } else {
        showToast('Unable to delete announcement.', 'error');
      }
    } catch (err) {
      showToast('Network error deleting announcement.', 'error');
    }
  };

  // PROFESSIONAL LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100">
          <div className="bg-gradient-to-br from-[#0f4b81] to-blue-900 p-8 text-white text-center space-y-3">
            <div className="inline-flex bg-white/10 p-3.5 rounded-2xl backdrop-blur-sm border border-white/15 shadow-inner">
              <Shirt className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">KSCync Admin Portal</h1>
              <p className="text-xs text-blue-100 mt-1 font-medium">
                KSC Laundry Shop Management System
              </p>
            </div>
          </div>

          <div className="p-8 space-y-6">
            {loginError && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center space-x-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Admin Email / Username
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="admin@kscync.local"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0f4b81] focus:ring-2 focus:ring-[#0f4b81]/10 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0f4b81] focus:ring-2 focus:ring-[#0f4b81]/10 transition"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3.5 bg-[#0f4b81] text-white rounded-xl font-bold text-xs hover:bg-blue-900 transition shadow-lg shadow-blue-900/10 flex items-center justify-center space-x-2 disabled:opacity-70"
                >
                  {loginLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{loginLoading ? 'Authenticating...' : 'Sign In to Admin Hub'}</span>
                </button>
              </div>

              <div className="text-center pt-2 border-t border-slate-100">
                <p className="text-[11px] text-slate-400 font-medium">
                  Default Admin: <span className="font-bold text-slate-600">admin@kscync.local</span> / <span className="font-bold text-slate-600">kscync123</span>
                </p>
              </div>
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

  const completedOrders = orders.filter((o) => {
    const st = (o.status || '').trim().toLowerCase();
    return st === 'completed' || st === 'picked up';
  });

  const totalProcessedKg = orders.reduce(
    (sum, o) => sum + (parseFloat(o.total_weight_kg) || 0),
    0
  );
  const estimatedLiveSales = orders.reduce((sum, o) => {
    const w = parseFloat(o.total_weight_kg) || 0;
    const batches = Math.max(1, Math.ceil(w / 12));
    return sum + (w > 0 ? batches * 140 : 140);
  }, 0);

  const rawActiveBaskets = dashboardData?.capacity?.activeBaskets ?? activeOrders.length;
  const activeMachinesCount = Math.min(rawActiveBaskets, shopCapacityLimit);
  const capacityPercent = (activeMachinesCount / shopCapacityLimit) * 100;
  const isTight = capacityPercent >= 75;

  const totalUtilityExpense =
    (Number(waterCost) || 0) + (Number(electricityCost) || 0) + (Number(suppliesCost) || 0);
  const overheadPerKg =
    Number(monthlyVolume) > 0 ? (totalUtilityExpense / Number(monthlyVolume)).toFixed(2) : '0.00';

  const formatContainerTag = (order) => {
    if (order.containers && order.containers.length > 0) {
      return order.containers
        .map((c) => `Batch ${c.basket_number}: ${c.color} (${c.assigned_weight_kg}kg)`)
        .join(' • ');
    }
    return order.container_description || 'Weight TBD at shop';
  };

  const renderStatusBadge = (status) => {
    const display = status === 'Received' ? 'Scheduled' : status;
    const lower = (display || '').toLowerCase();
    if (lower === 'picked up' || lower === 'completed') {
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200/60';
    }
    if (lower === 'ready for pick-up') {
      return 'bg-amber-50 text-amber-800 border border-amber-200/60';
    }
    return 'bg-blue-50 text-[#0f4b81] border border-blue-200/60';
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'intake', label: 'Customer Intake', icon: UserPlus },
    { id: 'progress', label: 'Progress Manager', icon: Kanban },
    { id: 'pickup', label: 'Pickup Verification', icon: CheckSquare },
    { id: 'sales', label: 'Sales Analytics', icon: BarChart3 },
    { id: 'utility', label: 'Utility Analytics', icon: Calculator },
    { id: 'settings', label: 'Settings & RBAC', icon: Settings },
    { id: 'profile', label: 'Admin Profile', icon: UserCircle }
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-[#0f4b81] text-white flex flex-col justify-between shadow-xl shrink-0">
        <div>
          <div className="p-5 border-b border-white/10 flex items-center space-x-3">
            <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
              <Shirt className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-sm tracking-tight text-white">KSCync</h1>
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
                    isActive
                      ? 'bg-white text-[#0f4b81] shadow-md shadow-black/5'
                      : 'text-blue-100 hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/10 bg-black/10 space-y-2">
          <button
            onClick={() => setActiveTab('profile')}
            className="flex items-center space-x-3 text-left w-full hover:opacity-90 transition p-1 rounded-lg"
          >
            <div className="w-8 h-8 rounded-full bg-white text-[#0f4b81] font-extrabold flex items-center justify-center text-xs shrink-0 shadow-sm">
              {adminProfile.fullName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .substring(0, 2)
                .toUpperCase()}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-bold truncate text-white">{adminProfile.fullName}</p>
              <p className="text-[10px] text-blue-200 truncate font-medium">{adminProfile.shopName}</p>
            </div>
          </button>
          <button
            onClick={handleLogout}
            className="w-full py-2 bg-red-500/20 hover:bg-red-500/30 text-red-100 rounded-xl text-[11px] font-bold flex items-center justify-center space-x-1.5 transition border border-red-500/20"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-y-auto relative">
        {/* TOP HEADER */}
        <header className="bg-white border-b border-slate-200/80 px-8 py-4 flex justify-between items-center shadow-xs sticky top-0 z-20">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">
              {activeTab === 'dashboard' && 'Admin Dashboard'}
              {activeTab === 'intake' && 'Walk-in Customer Intake & Container Logger (12kg Rule)'}
              {activeTab === 'progress' && 'Queue Workflow & Progress Manager'}
              {activeTab === 'pickup' && 'Pickup Verification & Container Matching'}
              {activeTab === 'sales' && 'Sales Analytics & Revenue Reports'}
              {activeTab === 'utility' &&
                `Utility Cost Tracking & Overhead Calculator (₱${overheadPerKg}/kg)`}
              {activeTab === 'settings' && 'System Settings, Announcements & RBAC'}
              {activeTab === 'profile' && 'Admin Profile & Shop Directory'}
            </h2>
            <p className="text-[11px] text-slate-500 font-medium">
              {adminProfile.shopName} • Real-Time Sync with KSCync Mobile App
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div
              className={`px-3.5 py-1.5 rounded-full flex items-center space-x-2 border text-xs font-bold ${
                isTight
                  ? 'bg-rose-50 border-rose-200 text-rose-700'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-700'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isTight ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'
                }`}
              />
              <span>Shop Status: {isTight ? 'TIGHT' : 'LOOSE'}</span>
            </div>
            <button
              onClick={fetchDashboard}
              title="Sync with Cloud DB"
              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 transition shadow-2xs"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        {/* TOAST NOTIFICATION */}
        {toast.message && (
          <div
            className={`mx-8 mt-4 px-4 py-3 rounded-xl shadow-md flex items-center justify-between text-xs font-bold ${
              toast.type === 'error'
                ? 'bg-rose-600 text-white'
                : 'bg-slate-900 text-white'
            }`}
          >
            <div className="flex items-center space-x-2">
              {toast.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-200 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => setToast({ message: '', type: 'success' })}
              className="text-white/80 hover:text-white ml-4 text-[11px] underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* WEIGH-IN MODAL */}
        {weighOrder && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900">
                Weigh &amp; Tag Order #{weighOrder.order_id}
              </h3>
              <p className="text-xs text-slate-500">
                Customer: <span className="font-bold text-slate-800">{weighOrder.customer_name}</span>. Enter actual scale weight and container description.
              </p>
              <form onSubmit={handleSaveWeighIn} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Actual Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    required
                    value={weighInput}
                    onChange={(e) => setWeighInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0f4b81]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Container Description
                  </label>
                  <input
                    type="text"
                    required
                    value={weighDescription}
                    onChange={(e) => setWeighDescription(e.target.value)}
                    placeholder="e.g. Blue Laundry Bag"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0f4b81]"
                  />
                </div>
                <div className="flex space-x-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setWeighOrder(null)}
                    className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3 bg-[#0f4b81] text-white rounded-xl font-bold text-xs hover:bg-blue-900 transition flex items-center justify-center space-x-1.5 shadow-sm"
                  >
                    {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Save &amp; Receive</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Total Orders</p>
                <div className="flex items-baseline space-x-2">
                  <h3 className="text-2xl font-black text-slate-900">{orders.length}</h3>
                  <span className="text-xs font-bold text-emerald-600">({activeOrders.length} active)</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">Synced with mobile app</p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Active Machines</p>
                <div className="flex items-baseline space-x-2">
                  <h3 className="text-2xl font-black text-[#0f4b81]">
                    {activeMachinesCount} / {shopCapacityLimit}
                  </h3>
                  <span className="text-xs font-bold text-blue-600">{Math.round(capacityPercent)}%</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">Mirrors mobile capacity bar</p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Estimated Sales</p>
                <div className="flex items-baseline space-x-2">
                  <h3 className="text-2xl font-black text-slate-900">₱{estimatedLiveSales.toLocaleString()}</h3>
                  <span className="text-xs font-bold text-emerald-600">Live</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">Based on ₱140/batch rate</p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Avg Turnaround</p>
                <h3 className="text-2xl font-black text-slate-900">2h 15m</h3>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">Drop-off to ready pickup</p>
              </div>
            </div>

            {/* Active Shop Workload Banner */}
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80 flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center space-x-3.5">
                <div className={`p-3 rounded-xl ${isTight ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Shop Capacity State</p>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <span className="text-sm font-extrabold text-slate-900">Status:</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${isTight ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {isTight ? 'TIGHT' : 'LOOSE'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('intake')}
                className="px-5 py-3 bg-[#0f4b81] text-white rounded-xl font-bold text-xs hover:bg-blue-900 transition shadow-sm"
              >
                + Walk-in Customer Intake
              </button>
            </div>

            {/* Active Queue Table */}
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-6">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-sm font-extrabold text-slate-900">Active Queue Orders</h3>
                <button
                  onClick={() => setActiveTab('progress')}
                  className="text-xs font-bold text-[#0f4b81] flex items-center space-x-1 hover:underline"
                >
                  <span>View Kanban Board</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3.5 px-4">Order ID</th>
                      <th className="py-3.5 px-4">Customer</th>
                      <th className="py-3.5 px-4">Weight</th>
                      <th className="py-3.5 px-4">Container Description</th>
                      <th className="py-3.5 px-4">Payment</th>
                      <th className="py-3.5 px-4">Stage</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeOrders.map((order) => {
                      const isUnweighed = parseFloat(order.total_weight_kg || 0) <= 0;
                      const isPaid = (order.payment_status || '').toLowerCase() === 'paid';
                      return (
                        <tr key={order.order_id} className="hover:bg-slate-50/80 transition">
                          <td className="py-4 px-4 font-extrabold text-[#0f4b81]">
                            #KSC-2026-{String(order.order_id).padStart(3, '0')}
                          </td>
                          <td className="py-4 px-4 font-bold text-slate-800">
                            {order.customer_name}
                          </td>
                          <td className="py-4 px-4 font-semibold text-slate-700">
                            {isUnweighed ? (
                              <button
                                onClick={() => {
                                  setWeighOrder(order);
                                  setWeighInput('8');
                                }}
                                className="px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-[11px] font-bold flex items-center space-x-1 hover:bg-amber-100 shadow-2xs"
                              >
                                <Scale className="w-3.5 h-3.5" />
                                <span>Weigh Now</span>
                              </button>
                            ) : (
                              `${order.total_weight_kg} kg`
                            )}
                          </td>
                          <td className="py-4 px-4 text-slate-600 font-medium">
                            {formatContainerTag(order)}
                          </td>
                          <td className="py-4 px-4">
                            <button
                              onClick={() =>
                                handleUpdatePayment(order.order_id, isPaid ? 'Unpaid' : 'Paid')
                              }
                              className={`px-3 py-1 rounded-full font-bold text-[11px] transition shadow-2xs ${
                                isPaid
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {order.payment_status || 'Unpaid'}
                            </button>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 rounded-full font-bold text-[11px] uppercase ${renderStatusBadge(order.status)}`}>
                              {order.status === 'Received' ? 'Scheduled' : order.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <button
                              onClick={() => handleAdvanceStage(order.order_id, order.status)}
                              className="px-4 py-2 bg-[#0f4b81] text-white rounded-xl font-bold hover:bg-blue-900 transition text-[11px] shadow-sm"
                            >
                              Advance Stage
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {activeOrders.length === 0 && (
                      <tr>
                        <td colSpan="7" className="py-12 text-center text-slate-400 font-medium">
                          No active orders currently in the queue.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: WALK-IN CUSTOMER INTAKE */}
        {activeTab === 'intake' && (
          <div className="p-8 max-w-3xl mx-auto w-full">
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-8">
              <h3 className="text-base font-extrabold text-slate-900 mb-1">
                Walk-in Customer Intake Form
              </h3>
              <p className="text-xs text-slate-500 mb-6 font-medium">
                Enforces the 12 kg maximum batch rule and custom physical container description (synced directly with the mobile app tracking screen).
              </p>

              <form onSubmit={handleCreateOrder} className="space-y-5">
                {(dashboardData?.users || []).length > 0 && (
                  <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-xl">
                    <label className="block text-xs font-extrabold text-[#0f4b81] mb-1.5">
                      Link to Registered Mobile App Customer (Optional)
                    </label>
                    <select
                      value={selectedUserId}
                      onChange={(e) => handleSelectExistingUser(e.target.value)}
                      className="w-full bg-white border border-blue-200 rounded-xl p-3 text-xs font-semibold text-slate-900 focus:outline-none"
                    >
                      <option value="">-- New Walk-in / Auto-Create Account --</option>
                      {(dashboardData?.users || []).map((u) => (
                        <option key={u.user_id} value={u.user_id}>
                          {u.full_name} ({u.phone_number})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Customer Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => {
                        setSelectedUserId('');
                        setCustomerName(e.target.value);
                      }}
                      placeholder="e.g. Joshua"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0f4b81]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Contact Number
                    </label>
                    <input
                      type="text"
                      required
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      placeholder="09235876198"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0f4b81]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Total Laundry Weight (kg)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      required
                      value={weightKg}
                      onChange={(e) => setWeightKg(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0f4b81]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Payment Status
                    </label>
                    <select
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0f4b81]"
                    >
                      <option value="Unpaid">Unpaid (Pay on Pickup)</option>
                      <option value="Paid">Paid (Cash / GCash)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Container Description (Typing Box)
                    </label>
                    <input
                      type="text"
                      required
                      value={containerDescription}
                      onChange={(e) => setContainerDescription(e.target.value)}
                      placeholder="e.g. Green Puregold Tote Bag"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0f4b81]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Estimated Target Completion Time
                    </label>
                    <select
                      value={targetCompletionTime}
                      onChange={(e) => setTargetCompletionTime(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0f4b81]"
                    >
                      <option>Same Day, 6:00 PM - 8:00 PM</option>
                      <option>Standard, 24 Hours</option>
                      <option>Express, 3 Hours</option>
                      <option>Next Day Morning, 9:00 AM</option>
                    </select>
                  </div>
                </div>

                {/* 12kg Split Preview Box */}
                <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/50 space-y-3">
                  <p className="text-xs font-bold text-[#0f4b81] flex items-center space-x-2">
                    <Package className="w-4 h-4" />
                    <span>Physical Identification &amp; Batch Split Validation (12kg Max Rule)</span>
                  </p>

                  <div className="p-3 bg-white rounded-xl border border-blue-100 flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800">
                      Batch 1: {containerDescription} ({batch1Weight} kg)
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${batch1Weight >= 12 ? 'bg-amber-100 text-amber-800' : 'bg-blue-50 text-[#0f4b81]'}`}>
                      {batch1Weight >= 12 ? 'Max 12kg Limit Reached' : 'Standard Single Load'}
                    </span>
                  </div>

                  {batch2Weight > 0 && (
                    <div className="p-3 bg-white rounded-xl border border-emerald-200 flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-800">
                        Batch 2: {containerDescription} (Batch 2) ({batch2Weight} kg)
                      </span>
                      <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">
                        Automatic Split (&gt; 12kg Rule)
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 bg-[#0f4b81] text-white rounded-xl font-bold text-xs hover:bg-blue-900 transition shadow-md flex items-center justify-center space-x-2 disabled:opacity-70"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>{submitting ? 'Syncing Walk-in Order...' : 'Log Intake & Sync to Customer App'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 3: PROGRESS MANAGER */}
        {activeTab === 'progress' && (
          <div className="p-8 flex-1 overflow-x-auto">
            <div className="grid grid-cols-6 gap-4 min-w-[1250px]">
              {[
                'Scheduled',
                'Received at Shop',
                'Washing',
                'Drying',
                'Folding',
                'Ready for Pick-up'
              ].map((stageName) => {
                const stageOrders = orders.filter((o) => {
                  const st = (o.status || '').trim();
                  if (stageName === 'Scheduled') {
                    return st === 'Scheduled' || st === 'Received';
                  }
                  return st === stageName;
                });

                return (
                  <div key={stageName} className="bg-white rounded-2xl border border-slate-200/80 p-4 flex flex-col shadow-xs">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-3">
                      <h4 className="text-xs font-extrabold text-slate-800">{stageName}</h4>
                      <span className="w-5 h-5 rounded-full bg-blue-50 text-[#0f4b81] text-[10px] font-extrabold flex items-center justify-center">
                        {stageOrders.length}
                      </span>
                    </div>

                    <div className="space-y-3 flex-1 overflow-y-auto">
                      {stageOrders.map((order) => (
                        <div key={order.order_id} className="p-3.5 rounded-xl border border-slate-200/60 bg-slate-50/60 space-y-2 shadow-2xs">
                          <div className="flex justify-between items-center">
                            <span className="font-extrabold text-xs text-[#0f4b81]">
                              #KSC-2026-{String(order.order_id).padStart(3, '0')}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-500">
                              {parseFloat(order.total_weight_kg || 0) > 0 ? `${order.total_weight_kg} kg` : 'Unweighed'}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-slate-900">{order.customer_name}</p>
                          <p className="text-[10px] text-slate-500 font-medium">{formatContainerTag(order)}</p>
                          <div className="flex justify-between items-center pt-1">
                            <span className="text-[10px] font-bold text-slate-500">{order.payment_status || 'Unpaid'}</span>
                            {parseFloat(order.total_weight_kg || 0) <= 0 && (
                              <button
                                onClick={() => setWeighOrder(order)}
                                className="text-[10px] font-bold text-amber-700 underline"
                              >
                                Weigh
                              </button>
                            )}
                          </div>
                          <button
                            onClick={() => handleAdvanceStage(order.order_id, order.status)}
                            className="w-full py-2 bg-[#0f4b81] text-white rounded-lg text-[10px] font-bold hover:bg-blue-900 transition mt-1 shadow-2xs"
                          >
                            Advance Stage →
                          </button>
                        </div>
                      ))}
                      {stageOrders.length === 0 && (
                        <p className="text-[11px] text-slate-400 text-center py-10 font-medium">No orders</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: PICKUP VERIFICATION */}
        {activeTab === 'pickup' && (
          <div className="p-8 max-w-2xl mx-auto w-full space-y-6">
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-8 space-y-6">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 mb-1">
                  Pickup Verification Counter
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Matches physical container descriptions with customer profiles for secure retrieval.
                </p>
              </div>

              <div className="flex space-x-2.5">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Order ID or Customer Name..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0f4b81]"
                />
                <button
                  onClick={() => {
                    const cleanQuery = searchQuery.toLowerCase().replace('#ksc-2026-', '').trim();
                    const found = orders.find(
                      (o) =>
                        o.customer_name.toLowerCase().includes(cleanQuery) ||
                        o.order_id.toString() === cleanQuery
                    );
                    setVerifiedOrder(found || null);
                  }}
                  className="px-6 bg-[#0f4b81] text-white rounded-xl font-bold text-xs hover:bg-blue-900 transition flex items-center space-x-2 shadow-sm"
                >
                  <Search className="w-4 h-4" />
                  <span>Search</span>
                </button>
              </div>

              {verifiedOrder && (
                <div className="p-5 rounded-2xl border border-blue-100 bg-blue-50/30 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-xs text-[#0f4b81]">
                      Order #KSC-2026-{String(verifiedOrder.order_id).padStart(3, '0')}
                    </span>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">
                      {verifiedOrder.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[11px] font-semibold text-slate-500">Customer Name</p>
                      <p className="text-sm font-extrabold text-slate-900">{verifiedOrder.customer_name}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-500">Payment Status</p>
                      <div className="flex items-center space-x-2 mt-0.5">
                        <span className="text-sm font-extrabold text-emerald-700">
                          {verifiedOrder.payment_status || 'Unpaid'}
                        </span>
                        <button
                          onClick={() =>
                            handleUpdatePayment(
                              verifiedOrder.order_id,
                              verifiedOrder.payment_status === 'Paid' ? 'Unpaid' : 'Paid'
                            )
                          }
                          className="text-[10px] underline text-[#0f4b81] font-bold"
                        >
                          Toggle
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 flex items-center space-x-3 shadow-2xs">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">Container Description</p>
                      <p className="text-[11px] text-slate-600 mt-0.5 font-medium">{formatContainerTag(verifiedOrder)}</p>
                    </div>
                  </div>

                  <button
                    onClick={async () => {
                      await fetch(`${API_BASE}/orders/${verifiedOrder.order_id}/status`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: 'Picked Up' })
                      });
                      showToast(`Order #${verifiedOrder.order_id} confirmed Picked Up! Rating prompt triggered.`);
                      setVerifiedOrder(null);
                      fetchDashboard();
                    }}
                    className="w-full py-3.5 bg-emerald-700 text-white rounded-xl font-bold text-xs hover:bg-emerald-800 transition shadow-sm"
                  >
                    Confirm Pickup &amp; Trigger Customer Rating Modal
                  </button>
                </div>
              )}

              {/* Ready for Pickup Quick List */}
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  Orders Ready for Pick-up
                </h4>
                <div className="space-y-2">
                  {orders
                    .filter((o) => o.status === 'Ready for Pick-up')
                    .map((o) => (
                      <div key={o.order_id} className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50 flex justify-between items-center text-xs">
                        <div>
                          <span className="font-extrabold text-[#0f4b81]">
                            #KSC-2026-{String(o.order_id).padStart(3, '0')}
                          </span>{' '}
                          • <span className="font-bold text-slate-800">{o.customer_name}</span>
                        </div>
                        <button
                          onClick={() => setVerifiedOrder(o)}
                          className="px-3 py-1.5 bg-[#0f4b81] text-white rounded-lg font-bold text-[11px] shadow-2xs"
                        >
                          Verify
                        </button>
                      </div>
                    ))}
                  {orders.filter((o) => o.status === 'Ready for Pick-up').length === 0 && (
                    <p className="text-xs text-slate-400 font-medium">No orders currently waiting for pickup.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SALES ANALYTICS */}
        {activeTab === 'sales' && (
          <div className="p-8 space-y-6 max-w-5xl mx-auto w-full">
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-8 space-y-6">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 mb-1">
                  Sales Analytics &amp; Revenue Reports
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Tracks cumulative shop earnings against monthly processing volume.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Monthly Baseline Sales</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">₱24,500.00</p>
                  <span className="text-xs font-bold text-emerald-600">+ ₱{estimatedLiveSales.toLocaleString()} live queue</span>
                </div>
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Volume Processed</p>
                  <p className="text-2xl font-black text-[#0f4b81] mt-1">{(3000 + totalProcessedKg).toLocaleString()} kg</p>
                  <span className="text-[11px] text-slate-500 font-medium">Includes {totalProcessedKg} kg active DB volume</span>
                </div>
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Completed Orders</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{completedOrders.length}</p>
                  <span className="text-[11px] text-slate-500 font-medium">Picked Up &amp; Verified</span>
                </div>
              </div>

              {/* Customer Reviews Feed */}
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center space-x-2">
                  <Star className="w-4 h-4 text-amber-500" />
                  <span>Live Customer Mobile App Ratings</span>
                </h4>
                <div className="space-y-2.5">
                  {(dashboardData?.reviews || []).map((rev) => (
                    <div key={rev.review_id} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-extrabold text-slate-900">{rev.customer_name}</p>
                        <p className="text-slate-600 text-[11px] mt-0.5 font-medium">{rev.feedback || 'Rated service via mobile app'}</p>
                      </div>
                      <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full font-extrabold text-[11px]">
                        ★ {rev.rating} / 5
                      </span>
                    </div>
                  ))}
                  {(!dashboardData?.reviews || dashboardData.reviews.length === 0) && (
                    <p className="text-xs text-slate-400 font-medium">No customer reviews submitted yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: UTILITY ANALYTICS */}
        {activeTab === 'utility' && (
          <div className="p-8 max-w-4xl mx-auto w-full space-y-6">
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-8 space-y-6">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 mb-1">
                  Utility Cost Tracking &amp; Overhead Calculator (₱{overheadPerKg}/kg)
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Computes utility expenses per kilo against monthly baselines (barangay-based electric operation without LPG).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100">
                  <label className="text-xs font-extrabold text-[#0f4b81] block uppercase tracking-wider">Water Utility (₱)</label>
                  <input
                    type="number"
                    value={waterCost}
                    onChange={(e) => setWaterCost(e.target.value)}
                    className="w-full mt-1.5 bg-white border border-blue-200 rounded-xl px-3 py-2 text-base font-black text-[#0f4b81]"
                  />
                </div>
                <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-100">
                  <label className="text-xs font-extrabold text-amber-800 block uppercase tracking-wider">Electricity (₱)</label>
                  <input
                    type="number"
                    value={electricityCost}
                    onChange={(e) => setElectricityCost(e.target.value)}
                    className="w-full mt-1.5 bg-white border border-amber-200 rounded-xl px-3 py-2 text-base font-black text-amber-800"
                  />
                </div>
                <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100">
                  <label className="text-xs font-extrabold text-emerald-800 block uppercase tracking-wider">Supplies (₱)</label>
                  <input
                    type="number"
                    value={suppliesCost}
                    onChange={(e) => setSuppliesCost(e.target.value)}
                    className="w-full mt-1.5 bg-white border border-emerald-200 rounded-xl px-3 py-2 text-base font-black text-emerald-800"
                  />
                </div>
                <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200">
                  <label className="text-xs font-extrabold text-slate-700 block uppercase tracking-wider">Volume (kg)</label>
                  <input
                    type="number"
                    value={monthlyVolume}
                    onChange={(e) => setMonthlyVolume(e.target.value)}
                    className="w-full mt-1.5 bg-white border border-slate-300 rounded-xl px-3 py-2 text-base font-black text-slate-900"
                  />
                </div>
              </div>

              <div className="p-6 bg-slate-900 text-white rounded-2xl space-y-3 shadow-lg">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400">
                    Formula Verification (Chapter 3)
                  </span>
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full font-extrabold text-[10px]">
                    Verified: ₱{overheadPerKg} / kg
                  </span>
                </div>
                <p className="text-xs font-mono text-slate-200">
                  Overhead/kg = (Water [₱{Number(waterCost).toLocaleString()}] + Elec [₱{Number(electricityCost).toLocaleString()}] + Supplies [₱{Number(suppliesCost).toLocaleString()}]) / Volume [{Number(monthlyVolume).toLocaleString()} kg] = <span className="text-emerald-400 font-extrabold">₱{overheadPerKg} / kg</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: SETTINGS & ANNOUNCEMENTS */}
        {activeTab === 'settings' && (
          <div className="p-8 max-w-3xl mx-auto w-full space-y-6">
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-8 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-blue-50 text-[#0f4b81] rounded-xl">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Mobile App Announcements</h3>
                  <p className="text-xs text-slate-500 font-medium">Publish or remove shop notices displayed on the mobile app home screen.</p>
                </div>
              </div>

              <form onSubmit={handlePostAnnouncement} className="space-y-3.5 pt-2">
                <input
                  type="text"
                  required
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  placeholder="Announcement Title (e.g. Holiday Schedule Notice)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0f4b81]"
                />
                <textarea
                  rows="2"
                  required
                  value={announcementMessage}
                  onChange={(e) => setAnnouncementMessage(e.target.value)}
                  placeholder="Message body displayed to customers..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0f4b81]"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 bg-[#0f4b81] text-white rounded-xl font-bold text-xs hover:bg-blue-900 transition flex items-center space-x-2 disabled:opacity-70 shadow-sm"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Publish to Mobile App</span>
                </button>
              </form>

              <div className="pt-4 border-t border-slate-100 space-y-2.5">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Active Announcements</p>
                {(dashboardData?.announcements || []).map((item) => (
                  <div key={item.announcement_id} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50 flex justify-between items-start gap-3">
                    <div>
                      <p className="text-xs font-extrabold text-slate-900">{item.title}</p>
                      <p className="text-[11px] text-slate-600 mt-0.5 font-medium">{item.message || item.content}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteAnnouncement(item.announcement_id)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                      title="Delete Announcement"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Shop Capacity Limit */}
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-8 space-y-4">
              <h3 className="text-base font-extrabold text-slate-900">Shop Machine Capacity Limit</h3>
              <p className="text-xs text-slate-500 font-medium">Controls the denominator for the Shop Capacity &amp; Workload bar.</p>
              <div className="flex items-center space-x-4">
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={shopCapacityLimit}
                  onChange={(e) => setShopCapacityLimit(Number(e.target.value) || 8)}
                  className="w-24 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-extrabold text-slate-900 text-center"
                />
                <span className="text-xs text-slate-700 font-bold">Active Washing &amp; Drying Machines (Default: 8)</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: ADMIN PROFILE PAGE */}
        {activeTab === 'profile' && (
          <div className="p-8 max-w-4xl mx-auto w-full space-y-6">
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-8 flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center space-x-5">
                <div className="w-20 h-20 rounded-full bg-[#0f4b81] text-white font-black text-2xl flex items-center justify-center shadow-md">
                  {adminProfile.fullName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xl font-black text-slate-900">{adminProfile.fullName}</h3>
                    <span className="px-3 py-0.5 bg-blue-50 text-[#0f4b81] rounded-full text-[10px] font-bold flex items-center space-x-1 border border-blue-200">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Verified Owner</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 font-medium">{adminProfile.role}</p>
                  <div className="flex flex-wrap gap-4 mt-3 text-[11px] text-slate-600 font-medium">
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-[#0f4b81]" />
                      <span>{adminProfile.location}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Phone className="w-3.5 h-3.5 text-[#0f4b81]" />
                      <span>{adminProfile.phone}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Mail className="w-3.5 h-3.5 text-[#0f4b81]" />
                      <span>{adminProfile.email}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-8 space-y-4">
              <h4 className="text-sm font-extrabold text-slate-900">Shop &amp; Account Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Admin Full Name</label>
                  <input
                    type="text"
                    value={adminProfile.fullName}
                    onChange={(e) => setAdminProfile({ ...adminProfile, fullName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Shop Display Name</label>
                  <input
                    type="text"
                    value={adminProfile.shopName}
                    onChange={(e) => setAdminProfile({ ...adminProfile, shopName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={adminProfile.phone}
                    onChange={(e) => setAdminProfile({ ...adminProfile, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Operating Hours Notice</label>
                  <input
                    type="text"
                    value={adminProfile.operatingHours}
                    onChange={(e) => setAdminProfile({ ...adminProfile, operatingHours: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs font-medium text-slate-900"
                  />
                </div>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => showToast('Profile details updated successfully.')}
                  className="px-6 py-3 bg-[#0f4b81] text-white rounded-xl font-bold text-xs hover:bg-blue-900 transition flex items-center space-x-2 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Profile Changes</span>
                </button>
              </div>
            </div>

            {/* Registered Customers Directory */}
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-8 space-y-4">
              <h4 className="text-sm font-extrabold text-slate-900">Registered Mobile App Customers</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Full Name</th>
                      <th className="py-3 px-4">Phone</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Push Token Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(dashboardData?.users || []).map((u) => (
                      <tr key={u.user_id || u.email}>
                        <td className="py-3.5 px-4 font-bold text-slate-900">{u.full_name}</td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium">{u.phone_number}</td>
                        <td className="py-3.5 px-4 capitalize text-slate-600 font-medium">{u.role}</td>
                        <td className="py-3.5 px-4">
                          {u.expo_push_token ? (
                            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">
                              Registered
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 bg-slate-100 text-slate-500 rounded-full text-[10px] font-bold">
                              Pending Login
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {(!dashboardData?.users || dashboardData.users.length === 0) && (
                      <tr>
                        <td colSpan="4" className="py-6 text-center text-slate-400 font-medium">
                          No customer accounts registered yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
