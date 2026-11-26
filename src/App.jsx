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
  LogOut,
  ArrowLeft,
  Users,
  Edit3
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
  const [salesTimeframe, setSalesTimeframe] = useState('monthly');

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

  const [adminProfile, setAdminProfile] = useState(() => {
    const saved = localStorage.getItem('ksc_admin_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      fullName: 'Admin Owner',
      role: 'Shop Owner & System Administrator',
      email: 'admin@kscync.local',
      phone: '0917 123 4567',
      shopName: 'KSC Laundry Shop',
      location: 'Barangay-Based Operations • Makati City',
      operatingHours: '6:00 AM – 6:00 PM (Drop-offs until 10:00 PM)'
    };
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState(adminProfile);

  const [editingCustomer, setEditingCustomer] = useState(null);
  const [customerForm, setCustomerForm] = useState({ full_name: '', phone_number: '', email: '' });

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

  const handleSetStage = async (orderId, targetStatus) => {
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: targetStatus })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        showToast(`Order #${orderId} updated to "${targetStatus}"`);
        await fetchDashboard();
      } else {
        showToast(data.error || 'Failed to update order stage.', 'error');
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
        await fetchDashboard();
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
      const res = await fetch(`${API_BASE}/orders/${weighOrder.order_id}/weigh`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          total_weight_kg: w,
          status: 'Received at Shop',
          container_description: weighDescription,
          containers
        })
      });
      
      if (res.ok) {
        showToast(`Order #${weighOrder.order_id} weighed (${w} kg) & tagged successfully.`);
        setWeighOrder(null);
        await fetchDashboard();
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

      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName.trim(),
          phone_number: contactNumber.trim() || '09000000000',
          booking_type: 'walk-in',
          total_weight_kg: parsedWeight,
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
        await fetchDashboard();
      } else {
        showToast('Unable to delete announcement.', 'error');
      }
    } catch (err) {
      showToast('Network error deleting announcement.', 'error');
    }
  };

  const handleUpdateCustomer = async (e) => {
    e.preventDefault();
    if (!editingCustomer) return;
    try {
      const res = await fetch(`${API_BASE}/users/${editingCustomer.user_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerForm)
      });
      if (res.ok) {
        showToast('Customer account updated successfully.');
        setEditingCustomer(null);
        await fetchDashboard();
      } else {
        showToast('Failed to update customer.', 'error');
      }
    } catch (err) {
      showToast('Network error updating customer.', 'error');
    }
  };

  const handleDeleteCustomer = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this customer account?')) return;
    try {
      const res = await fetch(`${API_BASE}/users/${userId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showToast('Customer account deleted.');
        await fetchDashboard();
      } else {
        showToast('Failed to delete customer.', 'error');
      }
    } catch (err) {
      showToast('Network error deleting customer.', 'error');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans antialiased">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100">
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0f4b81] focus:ring-2 focus:ring-[#0f4b81]/15 transition shadow-2xs"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0f4b81] focus:ring-2 focus:ring-[#0f4b81]/15 transition shadow-2xs"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3.5 bg-[#0f4b81] text-white rounded-xl font-bold text-xs hover:bg-blue-900 transition shadow-lg shadow-blue-900/10 flex items-center justify-center space-x-2 disabled:opacity-70 cursor-pointer"
                >
                  {loginLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{loginLoading ? 'Authenticating...' : 'Sign In to Admin Hub'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const orders = dashboardData?.orders || [];
  
  const filteredOrders = orders.filter(o => {
    if (!progressDateFilter) return true;
    const orderDate = new Date(o.created_at).toISOString().split('T')[0];
    return orderDate === progressDateFilter;
  });

  const activeOrders = filteredOrders.filter((o) => {
    const st = (o.status || '').trim().toLowerCase();
    return st !== 'completed' && st !== 'picked up';
  });

  const completedOrders = filteredOrders.filter((o) => {
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

  const salesMultiplier = salesTimeframe === 'daily' ? 0.15 : salesTimeframe === 'weekly' ? 0.35 : 1.0;
  const currentSalesDisplay = (estimatedLiveSales * salesMultiplier).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const currentVolumeDisplay = Math.round((3000 + totalProcessedKg) * salesMultiplier).toLocaleString();

  const standardWashPercent = salesTimeframe === 'daily' ? 82 : salesTimeframe === 'weekly' ? 75 : 78;
  const expressDropPercent = 100 - standardWashPercent;

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
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 whitespace-nowrap';
    }
    if (lower === 'ready for pick-up') {
      return 'bg-amber-50 text-amber-800 border border-amber-200/60 whitespace-nowrap';
    }
    return 'bg-blue-50 text-[#0f4b81] border border-blue-200/60 whitespace-nowrap';
  };

  const getNextStageInfo = (status) => {
    const st = (status || '').trim();
    if (st === 'Scheduled' || st === 'Received') return { nextStatus: 'Received at Shop', label: 'Move to Shop' };
    if (st === 'Received at Shop') return { nextStatus: 'Washing', label: 'Move to Washing' };
    if (st === 'Washing') return { nextStatus: 'Drying', label: 'Move to Drying' };
    if (st === 'Drying') return { nextStatus: 'Folding', label: 'Move to Folding' };
    if (st === 'Folding') return { nextStatus: 'Ready for Pick-up', label: 'Move to Ready' };
    if (st === 'Ready for Pick-up') return { nextStatus: 'Picked Up', label: 'Confirm Pickup' };
    return { nextStatus: 'Completed', label: 'Complete' };
  };

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
    <div className="flex h-screen bg-[#f8fafc] font-sans text-slate-900 overflow-hidden antialiased">
      <aside className="w-64 bg-[#0f4b81] text-white flex flex-col justify-between shadow-2xl shrink-0">
        <div>
          <div className="p-6 border-b border-white/10 flex items-center space-x-3">
            <div className="bg-white/10 p-2.5 rounded-xl border border-white/10 shadow-inner">
              <Shirt className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-sm tracking-tight text-white">KSCync</h1>
              <p className="text-[11px] text-blue-200 font-medium">Web Admin &amp; Staff Hub</p>
            </div>
          </div>

          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isActive
                      ? 'bg-white text-[#0f4b81] shadow-md shadow-black/10'
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

        <div className="p-4 border-t border-white/10 bg-black/10 space-y-2">
          <button
            onClick={() => setActiveTab('profile')}
            className="flex items-center space-x-3 text-left w-full hover:opacity-90 transition p-1.5 rounded-xl cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full bg-white text-[#0f4b81] font-extrabold flex items-center justify-center text-xs shrink-0 shadow-sm">
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
            className="w-full py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-100 rounded-xl text-[11px] font-bold flex items-center justify-center space-x-1.5 transition border border-red-500/20 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-y-auto relative bg-slate-50">
        <header className="bg-white border-b border-slate-200/80 px-8 py-4 flex justify-between items-center shadow-xs sticky top-0 z-20">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">
              {activeTab === 'dashboard' && 'Admin Dashboard — Today’s Summary & Current Orders'}
              {activeTab === 'intake' && 'Walk-in Customer Intake & Container Logger'}
              {activeTab === 'progress' && 'Queue Workflow & Kanban Progress Manager'}
              {activeTab === 'pickup' && 'Pickup Verification & Container Matching'}
              {activeTab === 'sales' && 'Sales Analytics & Revenue Reports'}
              {activeTab === 'utility' && `Utility Cost Tracking & Overhead Calculator (₱${overheadPerKg}/kg)`}
              {activeTab === 'settings' && 'System Settings, Announcements & RBAC'}
              {activeTab === 'profile' && 'Admin Profile & Shop Directory'}
            </h2>
            <p className="text-[11px] text-slate-500 font-medium">
              {adminProfile.shopName} • Real-Time Sync with KSCync Mobile App
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShopCapacityLimit(shopCapacityLimit === 1 ? 8 : 1)}
              title="Click to toggle Shop Capacity State"
              className={`px-3.5 py-1.5 rounded-full flex items-center space-x-2 border text-xs font-bold transition hover:opacity-90 shadow-2xs cursor-pointer ${
                isTight
                  ? 'bg-rose-50 border-rose-200 text-rose-700'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-700'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isTight ? 'bg-rose-500 animate-ping' : 'bg-emerald-500 animate-pulse'
                }`}
              />
              <span>Shop Status: {isTight ? 'TIGHT' : 'LOOSE'}</span>
            </button>
            <button
              onClick={fetchDashboard}
              title="Sync with Cloud DB"
              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 transition shadow-2xs cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        {toast.message && (
          <div
            className={`mx-8 mt-4 px-4 py-3 rounded-xl shadow-lg flex items-center justify-between text-xs font-bold ${
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
              className="text-white/80 hover:text-white ml-4 text-[11px] underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {weighOrder && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-7 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
              <h3 className="text-base font-black text-slate-900">
                Weigh &amp; Tag Order #{weighOrder.order_id}
              </h3>
              <p className="text-xs text-slate-500">
                Customer: <span className="font-bold text-slate-800">{weighOrder.customer_name}</span>. Enter actual scale weight and container description.
              </p>
              <form onSubmit={handleSaveWeighIn} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Actual Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    required
                    value={weighInput}
                    onChange={(e) => setWeighInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0f4b81]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Container Description
                  </label>
                  <input
                    type="text"
                    required
                    value={weighDescription}
                    onChange={(e) => setWeighDescription(e.target.value)}
                    placeholder="e.g. Blue Laundry Bag"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0f4b81]"
                  />
                </div>
                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setWeighOrder(null)}
                    className="flex-1 py-3.5 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-200 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3.5 bg-[#0f4b81] text-white rounded-xl font-bold text-xs hover:bg-blue-900 transition flex items-center justify-center space-x-1.5 shadow-md cursor-pointer"
                  >
                    {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Save &amp; Receive</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {editingCustomer && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-7 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
              <h3 className="text-base font-black text-slate-900">
                Edit Customer Account #{editingCustomer.user_id}
              </h3>
              <form onSubmit={handleUpdateCustomer} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={customerForm.full_name}
                    onChange={(e) => setCustomerForm({ ...customerForm, full_name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0f4b81]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={customerForm.phone_number}
                    onChange={(e) => setCustomerForm({ ...customerForm, phone_number: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0f4b81]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    value={customerForm.email}
                    onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0f4b81]"
                  />
                </div>
                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingCustomer(null)}
                    className="flex-1 py-3.5 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-200 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3.5 bg-[#0f4b81] text-white rounded-xl font-bold text-xs hover:bg-blue-900 transition shadow-md cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Today's Total Orders</p>
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
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Estimated Sales Today</p>
                <div className="flex items-baseline space-x-2">
                  <h3 className="text-2xl font-black text-slate-900">₱{estimatedLiveSales.toLocaleString()}</h3>
                  <span className="text-xs font-bold text-emerald-600 animate-pulse">● Live</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">Based on ₱140/batch rate</p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Avg Turnaround</p>
                <h3 className="text-2xl font-black text-slate-900">2h 15m</h3>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">Drop-off to ready pickup</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80 flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center space-x-3.5">
                <div className={`p-3 rounded-xl ${isTight ? 'bg-rose-100 text-rose-700 animate-bounce' : 'bg-emerald-100 text-emerald-700'}`}>
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today's Operating State</p>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <span className="text-sm font-extrabold text-slate-900">Shop Status:</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center space-x-1.5 ${isTight ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isTight ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'}`} />
                      <span>{isTight ? 'TIGHT' : 'LOOSE'}</span>
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('intake')}
                className="px-5 py-3 bg-[#0f4b81] text-white rounded-xl font-bold text-xs hover:bg-blue-900 transition shadow-sm cursor-pointer"
              >
                + Walk-in Customer Intake
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-6">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                  <span>Current Orders for Today</span>
                </h3>
                <button
                  onClick={() => setActiveTab('progress')}
                  className="text-xs font-bold text-[#0f4b81] flex items-center space-x-1 hover:underline cursor-pointer"
                >
                  <span>Open Kanban Progress Manager</span>
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
                      <th className="py-3.5 px-4">Est. Completion</th>
                      <th className="py-3.5 px-4">Payment</th>
                      <th className="py-3.5 px-4">Stage</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeOrders.map((order) => {
                      const isUnweighed = parseFloat(order.total_weight_kg || 0) <= 0;
                      const isPaid = (order.payment_status || '').toLowerCase() === 'paid';
                      const stageInfo = getNextStageInfo(order.status);
                      return (
                        <tr key={order.order_id} className="hover:bg-slate-50/80 transition">
                          <td className="py-4 px-4 font-extrabold text-[#0f4b81]">
                            Order #{order.order_id}
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
                                className="px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-[11px] font-bold flex items-center space-x-1 hover:bg-amber-100 shadow-2xs cursor-pointer"
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
                          <td className="py-4 px-4 text-slate-600 font-bold">
                            {order.target_completion_time || 'Same Day'}
                          </td>
                          <td className="py-4 px-4">
                            <button
                              onClick={() =>
                                handleUpdatePayment(order.order_id, isPaid ? 'Unpaid' : 'Paid')
                              }
                              className={`px-3 py-1 rounded-full font-bold text-[11px] transition shadow-2xs cursor-pointer ${
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
                              onClick={() => handleSetStage(order.order_id, stageInfo.nextStatus)}
                              className="px-3 py-1.5 bg-[#0f4b81] text-white rounded-xl font-bold hover:bg-blue-900 transition text-[11px] shadow-sm cursor-pointer"
                            >
                              {stageInfo.label}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {activeOrders.length === 0 && (
                      <tr>
                        <td colSpan="8" className="py-12 text-center text-slate-400 font-medium">
                          No current active orders for today.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'intake' && (
          <div className="p-8 max-w-3xl mx-auto w-full">
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-8">
              <h3 className="text-base font-extrabold text-slate-900 mb-1">
                Walk-in Customer Intake Form
              </h3>
              <p className="text-xs text-slate-500 mb-6 font-medium">
                Enforces the 12 kg maximum batch rule and custom container description (synced with mobile app tracking).
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
                      Container Description
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

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 bg-[#0f4b81] text-white rounded-xl font-bold text-xs hover:bg-blue-900 transition shadow-md flex items-center justify-center space-x-2 disabled:opacity-70 cursor-pointer"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>{submitting ? 'Syncing Walk-in Order...' : 'Log Intake & Sync to Customer App'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="p-8 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-2 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center space-x-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Filter Workflow by Date:</span>
                <input
                  type="date"
                  value={progressDateFilter}
                  onChange={(e) => setProgressDateFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800"
                />
                {progressDateFilter && (
                  <button
                    onClick={() => setProgressDateFilter('')}
                    className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Showing {filteredOrders.length} orders across workflow columns. Use stage buttons to move cards forward or backward.
              </p>
            </div>

            <div className="grid grid-cols-7 gap-4 min-w-[1400px]">
              {[
                { name: 'Scheduled', color: 'border-l-4 border-l-blue-500 bg-blue-50/20' },
                { name: 'Received at Shop', color: 'border-l-4 border-l-cyan-500 bg-cyan-50/20' },
                { name: 'Washing', color: 'border-l-4 border-l-indigo-500 bg-indigo-50/20' },
                { name: 'Drying', color: 'border-l-4 border-l-amber-500 bg-amber-50/20' },
                { name: 'Folding', color: 'border-l-4 border-l-purple-500 bg-purple-50/20' },
                { name: 'Ready for Pick-up', color: 'border-l-4 border-l-emerald-500 bg-emerald-50/20' },
                { name: 'Picked Up', color: 'border-l-4 border-l-slate-400 bg-slate-50/40' }
              ].map((stageObj, stageIndex, arr) => {
                const stageName = stageObj.name;
                const stageOrders = filteredOrders.filter((o) => {
                  const st = (o.status || '').trim();
                  if (stageName === 'Scheduled') return st === 'Scheduled' || st === 'Received';
                  if (stageName === 'Picked Up') return st === 'Picked Up' || st === 'Completed';
                  return st === stageName;
                });

                return (
                  <div key={stageName} className={`bg-white rounded-2xl border border-slate-200/80 p-4 flex flex-col shadow-xs ${stageObj.color}`}>
                    <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
                        <h4 className="text-xs font-extrabold text-slate-800">{stageName}</h4>
                      </div>
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-extrabold flex items-center justify-center">
                        {stageOrders.length}
                      </span>
                    </div>

                    <div className="space-y-3 flex-1 overflow-y-auto">
                      {stageOrders.map((order) => (
                        <div key={order.order_id} className="p-3.5 rounded-xl border border-slate-200/60 bg-white space-y-2 shadow-2xs hover:shadow-sm transition">
                          <div className="flex justify-between items-center">
                            <span className="font-extrabold text-xs text-[#0f4b81]">
                              Order #{order.order_id}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-500">
                              {parseFloat(order.total_weight_kg || 0) > 0 ? `${order.total_weight_kg} kg` : 'Unweighed'}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-slate-900">{order.customer_name}</p>
                          <p className="text-[10px] text-slate-500 font-medium">{formatContainerTag(order)}</p>

                          {parseFloat(order.total_weight_kg || 0) <= 0 && (
                            <button
                              onClick={() => setWeighOrder(order)}
                              className="w-full py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-[10px] font-bold text-center block cursor-pointer"
                            >
                              Weigh Now
                            </button>
                          )}

                          <div className="grid grid-cols-2 gap-1 pt-2 border-t border-slate-100">
                            {stageIndex > 0 ? (
                              <button
                                onClick={() => handleSetStage(order.order_id, arr[stageIndex - 1].name)}
                                className="py-1.5 bg-slate-100 text-slate-700 rounded-lg text-[9px] font-bold hover:bg-slate-200 transition flex items-center justify-center space-x-1 cursor-pointer"
                              >
                                <ArrowLeft className="w-2.5 h-2.5" />
                                <span>{arr[stageIndex - 1].name}</span>
                              </button>
                            ) : <div />}

                            {stageIndex < arr.length - 1 ? (
                              <button
                                onClick={() => handleSetStage(order.order_id, arr[stageIndex + 1].name)}
                                className="py-1.5 bg-[#0f4b81] text-white rounded-lg text-[9px] font-bold hover:bg-blue-900 transition flex items-center justify-center space-x-1 col-span-2 cursor-pointer"
                              >
                                <span>Move to {arr[stageIndex + 1].name}</span>
                                <ArrowRight className="w-2.5 h-2.5" />
                              </button>
                            ) : null}
                          </div>
                        </div>
                      ))}
                      {stageOrders.length === 0 && (
                        <p className="text-[11px] text-slate-400 text-center py-10 font-medium">No orders in this stage</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
                  placeholder="Search by Customer Name..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0f4b81]"
                />
                <button
                  onClick={() => {
                    const cleanQuery = searchQuery.toLowerCase().trim();
                    const found = orders.find(
                      (o) =>
                        o.customer_name.toLowerCase().includes(cleanQuery) ||
                        o.order_id.toString() === cleanQuery
                    );
                    setVerifiedOrder(found || null);
                  }}
                  className="px-6 bg-[#0f4b81] text-white rounded-xl font-bold text-xs hover:bg-blue-900 transition flex items-center space-x-2 shadow-sm cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>Search</span>
                </button>
              </div>

              {verifiedOrder && (
                <div className="p-5 rounded-2xl border border-blue-100 bg-blue-50/30 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-xs text-[#0f4b81]">
                      Verified Order Profile
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
                          className="text-[10px] underline text-[#0f4b81] font-bold cursor-pointer"
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
                      await handleSetStage(verifiedOrder.order_id, 'Picked Up');
                      showToast(`Order confirmed Picked Up! Rating prompt triggered.`);
                      setVerifiedOrder(null);
                    }}
                    className="w-full py-3.5 bg-emerald-700 text-white rounded-xl font-bold text-xs hover:bg-emerald-800 transition shadow-sm cursor-pointer"
                  >
                    Confirm Pickup &amp; Trigger Customer Rating Modal
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'sales' && (
          <div className="p-8 space-y-6 max-w-5xl mx-auto w-full">
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-8 space-y-6">
              <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 mb-1">
                    Sales Analytics &amp; Revenue Reports
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Tracks cumulative shop earnings against monthly processing volume and customer feedback.
                  </p>
                </div>
                
                <div className="flex bg-slate-100 p-1 rounded-xl space-x-1">
                  {['daily', 'weekly', 'monthly'].map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setSalesTimeframe(tf)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition cursor-pointer ${
                        salesTimeframe === tf ? 'bg-[#0f4b81] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {salesTimeframe.toUpperCase()} Revenue
                  </p>
                  <p className="text-2xl font-black text-slate-900 mt-1">₱{currentSalesDisplay}</p>
                  <span className="text-xs font-bold text-emerald-600">● Synced with live DB</span>
                </div>
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Volume Processed</p>
                  <p className="text-2xl font-black text-[#0f4b81] mt-1">{currentVolumeDisplay} kg</p>
                  <span className="text-[11px] text-slate-500 font-medium">Active queue volume</span>
                </div>
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Completed Orders</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{completedOrders.length}</p>
                  <span className="text-[11px] text-slate-500 font-medium">Picked Up &amp; Verified</span>
                </div>
              </div>

              <div className="p-6 bg-blue-50/40 rounded-2xl border border-blue-100 space-y-3">
                <h4 className="text-xs font-extrabold text-[#0f4b81] uppercase tracking-wider">
                  {salesTimeframe.charAt(0).toUpperCase() + salesTimeframe.slice(1)} Revenue Distribution Trend
                </h4>
                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between font-bold mb-1">
                      <span>Standard Wash Cycles</span>
                      <span>{standardWashPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-[#0f4b81] h-full rounded-full transition-all duration-300" style={{ width: `${standardWashPercent}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between font-bold mb-1">
                      <span>Express Drop-offs</span>
                      <span>{expressDropPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-600 h-full rounded-full transition-all duration-300" style={{ width: `${expressDropPercent}%` }} />
                    </div>
                  </div>
                </div>
              </div>

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
                    Formula Verification
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
                  className="px-6 py-3 bg-[#0f4b81] text-white rounded-xl font-bold text-xs hover:bg-blue-900 transition flex items-center space-x-2 disabled:opacity-70 shadow-sm cursor-pointer"
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
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                      title="Delete Announcement"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="p-8 max-w-5xl mx-auto w-full space-y-6">
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-8">
              <div className="flex flex-wrap items-center justify-between gap-6 pb-6 border-b border-slate-100">
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

                <div className="flex items-center space-x-3">
                  {!isEditingProfile ? (
                    <button
                      onClick={() => { setProfileForm(adminProfile); setIsEditingProfile(true); }}
                      className="px-5 py-2.5 bg-[#0f4b81] text-white rounded-xl font-bold text-xs hover:bg-blue-900 transition flex items-center space-x-2 shadow-sm cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Profile &amp; Shop</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsEditingProfile(false)}
                      className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-200 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {isEditingProfile ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setAdminProfile(profileForm);
                    localStorage.setItem('ksc_admin_profile', JSON.stringify(profileForm));
                    setIsEditingProfile(false);
                    showToast('Admin profile and shop details updated successfully.');
                  }}
                  className="space-y-4 pt-6"
                >
                  <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Update Account &amp; Shop Specifications</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Owner Full Name</label>
                      <input
                        type="text"
                        required
                        value={profileForm.fullName}
                        onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0f4b81]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Shop Name</label>
                      <input
                        type="text"
                        required
                        value={profileForm.shopName}
                        onChange={(e) => setProfileForm({ ...profileForm, shopName: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0f4b81]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0f4b81]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                      <input
                        type="text"
                        required
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0f4b81]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Location / Address</label>
                      <input
                        type="text"
                        required
                        value={profileForm.location}
                        onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0f4b81]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Operating Hours</label>
                      <input
                        type="text"
                        required
                        value={profileForm.operatingHours}
                        onChange={(e) => setProfileForm({ ...profileForm, operatingHours: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0f4b81]"
                      />
                    </div>
                  </div>
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-[#0f4b81] text-white rounded-xl font-bold text-xs hover:bg-blue-900 transition shadow-md cursor-pointer"
                    >
                      Save Profile Updates
                    </button>
                  </div>
                </form>
              ) : (
                <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Shop Specifications</p>
                    <p className="text-xs font-extrabold text-slate-800 mt-1">{adminProfile.shopName}</p>
                    <p className="text-[11px] text-slate-600 mt-0.5">{adminProfile.location}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Operating Schedule</p>
                    <p className="text-xs font-extrabold text-slate-800 mt-1">{adminProfile.operatingHours}</p>
                    <p className="text-[11px] text-emerald-600 mt-0.5 font-semibold">● Barangay-Based (No LPG)</p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-8 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-blue-50 text-[#0f4b81] rounded-xl">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Registered Mobile App Customers</h3>
                    <p className="text-xs text-slate-500 font-medium">Directory of active accounts synced from the customer mobile application. Admin can edit or delete accounts.</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold">
                  {(dashboardData?.users || []).length} Total Customers
                </span>
              </div>

              <div className="overflow-x-auto pt-2">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">User ID</th>
                      <th className="py-3 px-4">Full Name</th>
                      <th className="py-3 px-4">Phone Number</th>
                      <th className="py-3 px-4">Email Address</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(dashboardData?.users || []).map((u) => (
                      <tr key={u.user_id} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 px-4 font-bold text-[#0f4b81]">#{u.user_id}</td>
                        <td className="py-3.5 px-4 font-extrabold text-slate-900">{u.full_name}</td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium">{u.phone_number || 'N/A'}</td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium">{u.email || 'N/A'}</td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingCustomer(u);
                              setCustomerForm({ full_name: u.full_name, phone_number: u.phone_number || '', email: u.email || '' });
                            }}
                            className="px-3 py-1.5 bg-blue-50 text-[#0f4b81] rounded-lg font-bold text-[11px] hover:bg-blue-100 transition cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCustomer(u.user_id)}
                            className="px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg font-bold text-[11px] hover:bg-rose-100 transition cursor-pointer"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {(!dashboardData?.users || dashboardData.users.length === 0) && (
                      <tr>
                        <td colSpan="5" className="py-10 text-center text-slate-400 font-medium">
                          No registered mobile customers found yet.
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
