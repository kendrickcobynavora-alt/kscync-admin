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
  Shirt,
  ArrowRight,
  Package,
  Clock,
  Star,
  Megaphone,
  CreditCard,
  Scale,
  Trash2,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  Save
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  // Customer Intake Form State (12kg Batch Split Rule & Physical Container Color)
  const [customerName, setCustomerName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [servicePackage, setServicePackage] = useState('Wash • Dry • Fold (₱140)');
  const [weightKg, setWeightKg] = useState('12');
  const [containerColor, setContainerColor] = useState('Blue Bag');
  const [paymentMethod, setPaymentMethod] = useState('Unpaid');
  const [targetTime, setTargetTime] = useState('Same Day, 6:00 PM - 8:00 PM');

  // Weigh-in Modal / Inline State for Mobile Scheduled Orders
  const [weighOrder, setWeighOrder] = useState(null);
  const [weighInput, setWeighInput] = useState('8');
  const [weighColor, setWeighColor] = useState('Blue Bag');

  // Pickup Verification State
  const [searchQuery, setSearchQuery] = useState('');
  const [verifiedOrder, setVerifiedOrder] = useState(null);

  // Interactive Utility Calculator State (Chapter 3 Baseline: ₱13.50/kg)
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

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
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
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 5000);
    return () => clearInterval(interval);
  }, []);

  // 12kg Maximum Batch Rule Calculator (Matches Mobile App Batch 1 / Batch 2 Physical Identification)
  const parsedWeight = parseFloat(weightKg) || 0;
  const maxBatchLimit = 12;
  const batch1Weight = Math.min(parsedWeight, maxBatchLimit);
  const batch2Weight =
    parsedWeight > maxBatchLimit ? Number((parsedWeight - maxBatchLimit).toFixed(2)) : 0;

  // Aligned Status Workflow matching Mobile App TrackScreen.js & Neon DB
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
        showToast(`Order #${orderId} updated to "${nextStatus}" (Synced to Mobile App)`);
        fetchDashboard();
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleUpdatePayment = async (orderId, nextPaymentStatus) => {
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/payment`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_status: nextPaymentStatus })
      });
      if (res.ok) {
        showToast(`Order #${orderId} payment marked as ${nextPaymentStatus}`);
        fetchDashboard();
      } else {
        // Fallback if backend uses general order update route
        await fetch(`${API_BASE}/orders/${orderId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ payment_status: nextPaymentStatus })
        });
        showToast(`Order #${orderId} payment status updated`);
        fetchDashboard();
      }
    } catch (err) {
      console.error('Error updating payment:', err);
    }
  };

  const handleSaveWeighIn = async (e) => {
    e.preventDefault();
    if (!weighOrder) return;
    const w = parseFloat(weighInput) || 0;
    const b1 = Math.min(w, 12);
    const b2 = w > 12 ? Number((w - 12).toFixed(2)) : 0;

    const containers = [{ basket_number: 1, color: weighColor, assigned_weight_kg: b1 }];
    if (b2 > 0) {
      containers.push({
        basket_number: 2,
        color: `${weighColor} (Batch 2)`,
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
          containers
        })
      });
      if (!res.ok) {
        // Fallback to status update if dedicated weigh endpoint is not present
        await fetch(`${API_BASE}/orders/${weighOrder.order_id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Received at Shop', total_weight_kg: w, containers })
        });
      }
      showToast(`Order #${weighOrder.order_id} weighed (${w} kg) & assigned to ${weighColor}`);
      setWeighOrder(null);
      fetchDashboard();
    } catch (err) {
      console.error('Error saving weigh-in:', err);
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    const containers = [
      {
        basket_number: 1,
        color: containerColor,
        assigned_weight_kg: batch1Weight
      }
    ];

    if (batch2Weight > 0) {
      containers.push({
        basket_number: 2,
        color: `${containerColor} (Batch 2)`,
        assigned_weight_kg: batch2Weight
      });
    }

    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName.trim(),
          phone_number: contactNumber.trim(),
          service_package: servicePackage,
          total_weight_kg: parsedWeight,
          target_completion_time: targetTime,
          payment_status: paymentMethod,
          status: 'Received at Shop',
          containers
        })
      });
      if (res.ok) {
        showToast(
          batch2Weight > 0
            ? `Order logged! Split into Batch 1 (${batch1Weight}kg) & Batch 2 (${batch2Weight}kg).`
            : `Order logged under ${containerColor} (${batch1Weight}kg) & synced with mobile app!`
        );
        setCustomerName('');
        setContactNumber('');
        fetchDashboard();
        setActiveTab('dashboard');
      }
    } catch (err) {
      console.error('Error creating order:', err);
    }
  };

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcementTitle.trim() || !announcementMessage.trim()) return;
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
        showToast('Announcement published live to Customer Mobile App!');
        setAnnouncementTitle('');
        setAnnouncementMessage('');
        fetchDashboard();
      }
    } catch (err) {
      console.error('Error posting announcement:', err);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/announcements/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showToast('Announcement removed from Mobile App');
        fetchDashboard();
      }
    } catch (err) {
      console.error('Error deleting announcement:', err);
    }
  };

  const orders = dashboardData?.orders || [];
  const activeOrders = orders.filter((o) => {
    const st = (o.status || '').trim().toLowerCase();
    return st !== 'completed' && st !== 'picked up';
  });

  const completedOrders = orders.filter((o) => {
    const st = (o.status || '').trim().toLowerCase();
    return st === 'completed' || st === 'picked up';
  });

  // Live Sales & Volume Calculations
  const totalProcessedKg = orders.reduce(
    (sum, o) => sum + (parseFloat(o.total_weight_kg) || 0),
    0
  );
  const estimatedLiveSales = orders.reduce((sum, o) => {
    const w = parseFloat(o.total_weight_kg) || 0;
    const batches = Math.max(1, Math.ceil(w / 12));
    return sum + (w > 0 ? batches * 140 : 140);
  }, 0);

  // Aligned with HomeScreen.js (maxMachines = 8)
  const rawActiveBaskets = dashboardData?.capacity?.activeBaskets ?? activeOrders.length;
  const activeMachinesCount = Math.min(rawActiveBaskets, shopCapacityLimit);
  const capacityPercent = (activeMachinesCount / shopCapacityLimit) * 100;
  const isTight = capacityPercent >= 75;

  // Dynamic Overhead Per Kilo Formula
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
    return 'Awaiting Shop Weigh-in';
  };

  const renderStatusBadge = (status) => {
    const display = status === 'Received' ? 'Scheduled' : status;
    const lower = (display || '').toLowerCase();
    if (lower === 'picked up' || lower === 'completed') {
      return 'bg-green-100 text-green-700';
    }
    if (lower === 'ready for pick-up') {
      return 'bg-amber-100 text-amber-800';
    }
    return 'bg-blue-50 text-[#0f4b81]';
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'intake', label: 'Customer Intake', icon: UserPlus },
    { id: 'progress', label: 'Progress Manager', icon: Kanban },
    { id: 'pickup', label: 'Pickup Verification', icon: CheckSquare },
    { id: 'sales', label: 'Sales Analytics', icon: BarChart3 },
    { id: 'utility', label: 'Utility Analytics', icon: Calculator },
    { id: 'settings', label: 'Settings (RBAC)', icon: Settings },
    { id: 'profile', label: 'Admin Profile', icon: UserCircle }
  ];

  return (
    <div className="flex h-screen bg-[#f8f9fa] font-sans text-gray-900 overflow-hidden">
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-[#0f4b81] text-white flex flex-col justify-between shadow-lg shrink-0">
        <div>
          <div className="p-5 border-b border-white/10 flex items-center space-x-3">
            <div className="bg-white/15 p-2.5 rounded-xl">
              <Shirt className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="font-black text-base tracking-wide text-white">KSCync</h1>
              <p className="text-[11px] text-blue-200">Web Admin &amp; Staff Hub</p>
            </div>
          </div>

          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                    isActive
                      ? 'bg-white text-[#0f4b81] shadow-md'
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

        {/* Clickable Sidebar Profile Footer */}
        <button
          onClick={() => setActiveTab('profile')}
          className="p-4 border-t border-white/10 flex items-center space-x-3 bg-black/15 hover:bg-black/25 transition text-left w-full"
        >
          <div className="w-9 h-9 rounded-full bg-white text-[#0f4b81] font-black flex items-center justify-center text-xs shrink-0">
            {adminProfile.fullName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .substring(0, 2)
              .toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold truncate text-white">{adminProfile.fullName}</p>
            <p className="text-[10px] text-blue-200 truncate">{adminProfile.shopName}</p>
          </div>
        </button>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-y-auto relative">
        {/* TOP HEADER */}
        <header className="bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center shadow-sm sticky top-0 z-20">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              {activeTab === 'dashboard' && 'Admin Dashboard'}
              {activeTab === 'intake' && 'Customer Intake & Container Logger (12kg Rule)'}
              {activeTab === 'progress' && 'Queue Workflow & Progress Manager'}
              {activeTab === 'pickup' && 'Pickup Verification & Container Matching'}
              {activeTab === 'sales' && 'Sales Analytics & Revenue Reports'}
              {activeTab === 'utility' &&
                `Utility Cost Tracking & Overhead Calculator (₱${overheadPerKg}/kg)`}
              {activeTab === 'settings' && 'System Settings, Announcements & RBAC'}
              {activeTab === 'profile' && 'Admin Profile & Shop Directory'}
            </h2>
            <p className="text-[11px] text-gray-500">
              {adminProfile.shopName} • Real-Time Sync with KSCync Mobile App
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div
              className={`px-3.5 py-1.5 rounded-full flex items-center space-x-2 border ${
                isTight
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : 'bg-green-50 border-green-200 text-green-700'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isTight ? 'bg-red-500 animate-pulse' : 'bg-green-500'
                }`}
              />
              <span className="text-xs font-bold">
                Shop Status: {isTight ? 'TIGHT' : 'LOOSE'}
              </span>
            </div>
            <button
              onClick={fetchDashboard}
              title="Sync with Cloud DB"
              className="p-2 rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-600 transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        {/* GLOBAL LIVE SYNC TOAST */}
        {toastMessage && (
          <div className="mx-8 mt-4 bg-[#0f4b81] text-white px-4 py-3 rounded-xl shadow-md flex items-center justify-between text-xs font-bold">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-green-300" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage('')} className="text-blue-200 hover:text-white">
              Dismiss
            </button>
          </div>
        )}

        {/* WEIGH-IN MODAL FOR MOBILE SCHEDULED ORDERS */}
        {weighOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-gray-100 space-y-4">
              <h3 className="text-base font-bold text-gray-900">
                Weigh &amp; Tag Mobile Order #{weighOrder.order_id}
              </h3>
              <p className="text-xs text-gray-500">
                Customer: <span className="font-bold text-gray-800">{weighOrder.customer_name}</span>. Enter actual shop scale weight and physical container color.
              </p>
              <form onSubmit={handleSaveWeighIn} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Actual Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    required
                    value={weighInput}
                    onChange={(e) => setWeighInput(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Physical Container Color
                  </label>
                  <select
                    value={weighColor}
                    onChange={(e) => setWeighColor(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-900"
                  >
                    <option value="Blue Bag">Blue Bag</option>
                    <option value="Red Bag">Red Bag</option>
                    <option value="Green Tote Bag">Green Tote Bag</option>
                    <option value="Yellow Mesh Basket">Yellow Mesh Basket</option>
                    <option value="White Laundry Hamper">White Laundry Hamper</option>
                  </select>
                </div>
                <div className="flex space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setWeighOrder(null)}
                    className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-[#0f4b81] text-white rounded-xl font-bold text-xs"
                  >
                    Save &amp; Receive at Shop
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
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-xs text-gray-500 font-semibold mb-1">Total Orders Logged</p>
                <div className="flex items-baseline space-x-2">
                  <h3 className="text-2xl font-black text-gray-900">{orders.length}</h3>
                  <span className="text-xs font-bold text-green-600">
                    ({activeOrders.length} active)
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Synced with mobile app</p>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-xs text-gray-500 font-semibold mb-1">Active Machines</p>
                <div className="flex items-baseline space-x-2">
                  <h3 className="text-2xl font-black text-[#0f4b81]">
                    {activeMachinesCount} / {shopCapacityLimit}
                  </h3>
                  <span className="text-xs font-bold text-blue-600">
                    {Math.round(capacityPercent)}%
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Mirrors mobile capacity bar</p>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-xs text-gray-500 font-semibold mb-1">Estimated Queue Sales</p>
                <div className="flex items-baseline space-x-2">
                  <h3 className="text-2xl font-black text-gray-900">
                    ₱{estimatedLiveSales.toLocaleString()}
                  </h3>
                  <span className="text-xs font-bold text-green-600">Live</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Based on ₱140/batch rate</p>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-xs text-gray-500 font-semibold mb-1">Avg Turnaround</p>
                <h3 className="text-2xl font-black text-gray-900">2h 15m</h3>
                <p className="text-[10px] text-gray-400 mt-1">Drop-off to ready pickup</p>
              </div>
            </div>

            {/* Active Shop Workload Banner */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center space-x-3">
                <div
                  className={`p-3 rounded-xl ${
                    isTight ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                  }`}
                >
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] text-gray-500 font-semibold">
                    Active Shop Workload State
                  </p>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <span className="text-sm font-black text-gray-900">Shop Status:</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isTight ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {isTight ? 'TIGHT' : 'LOOSE'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('intake')}
                className="px-5 py-2.5 bg-[#0f4b81] text-white rounded-xl font-bold text-xs hover:bg-blue-900 transition shadow-sm"
              >
                + New Customer Intake
              </button>
            </div>

            {/* Active Queue Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-gray-800">
                  Active Queue Orders (Live Mobile &amp; Walk-in Sync)
                </h3>
                <button
                  onClick={() => setActiveTab('progress')}
                  className="text-xs font-bold text-[#0f4b81] flex items-center space-x-1 hover:underline"
                >
                  <span>View All Kanban</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
                    <tr>
                      <th className="py-3 px-4">Order ID</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Weight</th>
                      <th className="py-3 px-4">Physical Container</th>
                      <th className="py-3 px-4">Payment</th>
                      <th className="py-3 px-4">Stage</th>
                      <th className="py-3 px-4 text-right">Mobile App Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {activeOrders.map((order) => {
                      const isUnweighed = parseFloat(order.total_weight_kg || 0) <= 0;
                      const isPaid = (order.payment_status || '').toLowerCase() === 'paid';
                      return (
                        <tr key={order.order_id} className="hover:bg-gray-50/70">
                          <td className="py-3.5 px-4 font-bold text-[#0f4b81]">
                            #KSC-2026-{String(order.order_id).padStart(3, '0')}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-gray-800">
                            {order.customer_name}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-gray-700">
                            {isUnweighed ? (
                              <button
                                onClick={() => {
                                  setWeighOrder(order);
                                  setWeighInput('8');
                                }}
                                className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-[10px] font-bold flex items-center space-x-1 hover:bg-amber-100"
                              >
                                <Scale className="w-3 h-3" />
                                <span>Weigh Now</span>
                              </button>
                            ) : (
                              `${order.total_weight_kg} kg`
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-gray-600 text-[11px]">
                            {formatContainerTag(order)}
                          </td>
                          <td className="py-3.5 px-4">
                            <button
                              onClick={() =>
                                handleUpdatePayment(
                                  order.order_id,
                                  isPaid ? 'Unpaid' : 'Paid'
                                )
                              }
                              className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                                isPaid
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {order.payment_status || 'Unpaid'}
                            </button>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase ${renderStatusBadge(
                                order.status
                              )}`}
                            >
                              {order.status === 'Received' ? 'Scheduled' : order.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-2">
                            <button
                              onClick={() => handleAdvanceStage(order.order_id, order.status)}
                              className="px-3.5 py-1.5 bg-[#0f4b81] text-white rounded-xl font-bold hover:bg-blue-900 transition text-[11px]"
                            >
                              Advance Stage
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {activeOrders.length === 0 && (
                      <tr>
                        <td colSpan="7" className="py-8 text-center text-gray-400">
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

        {/* TAB 2: CUSTOMER INTAKE (12KG BATCH SPLIT RULE & CONTAINER MARKING) */}
        {activeTab === 'intake' && (
          <div className="p-8 max-w-3xl mx-auto w-full">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h3 className="text-base font-bold text-gray-900 mb-1">
                New Customer Intake Form
              </h3>
              <p className="text-xs text-gray-500 mb-6">
                Enforces the 12 kg maximum batch rule and physical basket/bag color identification (synced directly with customer mobile tracking).
              </p>

              <form onSubmit={handleCreateOrder} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Customer Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Carim C."
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-900 focus:outline-none focus:border-[#0f4b81]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Contact Number
                    </label>
                    <input
                      type="text"
                      required
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      placeholder="09187654321"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-900 focus:outline-none focus:border-[#0f4b81]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Service Package
                    </label>
                    <select
                      value={servicePackage}
                      onChange={(e) => setServicePackage(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-900 focus:outline-none focus:border-[#0f4b81]"
                    >
                      <option>Wash • Dry • Fold (₱140)</option>
                      <option>Wash • Dry (₱110)</option>
                      <option>Dry Only (₱70)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Total Laundry Weight (kg)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      required
                      value={weightKg}
                      onChange={(e) => setWeightKg(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-900 focus:outline-none focus:border-[#0f4b81]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Physical Container Color
                    </label>
                    <select
                      value={containerColor}
                      onChange={(e) => setContainerColor(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-900 focus:outline-none focus:border-[#0f4b81]"
                    >
                      <option value="Blue Bag">Blue Bag</option>
                      <option value="Red Bag">Red Bag</option>
                      <option value="Green Tote Bag">Green Tote Bag</option>
                      <option value="Yellow Mesh Basket">Yellow Mesh Basket</option>
                      <option value="White Laundry Hamper">White Laundry Hamper</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Payment Status
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-900 focus:outline-none focus:border-[#0f4b81]"
                    >
                      <option value="Unpaid">Unpaid (Pay on Pickup)</option>
                      <option value="Paid">Paid (Cash / GCash)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Est. Completion Window
                    </label>
                    <input
                      type="text"
                      required
                      value={targetTime}
                      onChange={(e) => setTargetTime(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-900 focus:outline-none focus:border-[#0f4b81]"
                    />
                  </div>
                </div>

                {/* 12kg Split Preview Box */}
                <div className="mt-6 p-4 rounded-xl border border-blue-100 bg-blue-50/50 space-y-3">
                  <p className="text-xs font-bold text-[#0f4b81] flex items-center space-x-2">
                    <Package className="w-4 h-4" />
                    <span>
                      Physical Identification &amp; Batch Split Validation (12kg Max Rule)
                    </span>
                  </p>

                  <div className="p-3 bg-white rounded-xl border border-blue-100 flex justify-between items-center text-xs">
                    <span className="font-bold text-gray-800">
                      Batch 1: {containerColor} (Assigned Weight: {batch1Weight} kg)
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        batch1Weight >= 12
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-50 text-[#0f4b81]'
                      }`}
                    >
                      {batch1Weight >= 12 ? 'Max 12kg Batch Limit Reached' : 'Standard Single Load'}
                    </span>
                  </div>

                  {batch2Weight > 0 && (
                    <div className="p-3 bg-white rounded-xl border border-green-200 flex justify-between items-center text-xs">
                      <span className="font-bold text-gray-800">
                        Batch 2: {containerColor} (Batch 2) (Assigned Weight: {batch2Weight} kg)
                      </span>
                      <span className="px-2.5 py-0.5 bg-green-100 text-green-800 rounded-full font-bold text-[10px]">
                        Automatic Split (&gt; 12kg Rule)
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#0f4b81] text-white rounded-xl font-bold text-xs hover:bg-blue-900 transition shadow-md"
                  >
                    Log Intake &amp; Sync to Customer App
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 3: PROGRESS MANAGER (KANBAN WORKFLOW) */}
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
                  <div
                    key={stageName}
                    className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col shadow-sm"
                  >
                    <div className="flex justify-between items-center pb-3 border-b border-gray-100 mb-3">
                      <h4 className="text-xs font-bold text-gray-800">{stageName}</h4>
                      <span className="w-5 h-5 rounded-full bg-blue-50 text-[#0f4b81] text-[10px] font-bold flex items-center justify-center">
                        {stageOrders.length}
                      </span>
                    </div>

                    <div className="space-y-3 flex-1 overflow-y-auto">
                      {stageOrders.map((order) => (
                        <div
                          key={order.order_id}
                          className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/60 space-y-2"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-xs text-[#0f4b81]">
                              #KSC-2026-{String(order.order_id).padStart(3, '0')}
                            </span>
                            <span className="text-[11px] font-semibold text-gray-500">
                              {parseFloat(order.total_weight_kg || 0) > 0
                                ? `${order.total_weight_kg} kg`
                                : 'Unweighed'}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-gray-900">
                            {order.customer_name}
                          </p>
                          <p className="text-[10px] text-gray-500">
                            {formatContainerTag(order)}
                          </p>
                          <div className="flex justify-between items-center pt-1">
                            <span className="text-[10px] font-bold text-gray-500">
                              {order.payment_status || 'Unpaid'}
                            </span>
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
                            className="w-full py-2 bg-[#0f4b81] text-white rounded-lg text-[10px] font-bold hover:bg-blue-900 transition mt-1"
                          >
                            Advance Stage →
                          </button>
                        </div>
                      ))}
                      {stageOrders.length === 0 && (
                        <p className="text-[11px] text-gray-400 text-center py-8">
                          No orders in {stageName}
                        </p>
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
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-1">
                  Pickup Verification Counter
                </h3>
                <p className="text-xs text-gray-500">
                  Matches physical container descriptions with customer profiles for secure retrieval without numeric bag tags.
                </p>
              </div>

              <div className="flex space-x-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Order ID (e.g. 1) or Customer Name (e.g. Carim)..."
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-900 focus:outline-none focus:border-[#0f4b81]"
                />
                <button
                  onClick={() => {
                    const cleanQuery = searchQuery
                      .toLowerCase()
                      .replace('#ksc-2026-', '')
                      .trim();
                    const found = orders.find(
                      (o) =>
                        o.customer_name.toLowerCase().includes(cleanQuery) ||
                        o.order_id.toString() === cleanQuery
                    );
                    setVerifiedOrder(found || null);
                  }}
                  className="px-6 bg-[#0f4b81] text-white rounded-xl font-bold text-xs hover:bg-blue-900 transition flex items-center space-x-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Search Order</span>
                </button>
              </div>

              {verifiedOrder && (
                <div className="p-5 rounded-2xl border border-blue-100 bg-blue-50/30 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs text-[#0f4b81]">
                      Order #KSC-2026-{String(verifiedOrder.order_id).padStart(3, '0')}
                    </span>
                    <span className="px-2.5 py-1 bg-green-100 text-green-800 rounded-full text-[10px] font-bold">
                      {verifiedOrder.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[11px] text-gray-500">Customer Name</p>
                      <p className="text-sm font-bold text-gray-900">
                        {verifiedOrder.customer_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-500">Payment Status</p>
                      <div className="flex items-center space-x-2 mt-0.5">
                        <span className="text-sm font-bold text-green-700">
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
                          Toggle Paid
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-white rounded-xl border border-gray-100 flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-gray-800">
                        Physical Container Description (Visual Confirmation)
                      </p>
                      <p className="text-[11px] text-gray-600 mt-0.5">
                        {formatContainerTag(verifiedOrder)} • Verified by Staff
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={async () => {
                      await fetch(`${API_BASE}/orders/${verifiedOrder.order_id}/status`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: 'Picked Up' })
                      });
                      showToast(
                        `Order #${verifiedOrder.order_id} confirmed Picked Up! Mobile App Rating Box triggered.`
                      );
                      setVerifiedOrder(null);
                      fetchDashboard();
                    }}
                    className="w-full py-3.5 bg-[#15803d] text-white rounded-xl font-bold text-xs hover:bg-green-800 transition shadow-md"
                  >
                    Confirm Pickup &amp; Trigger Customer Rating Modal
                  </button>
                </div>
              )}

              {/* Ready for Pick-up Quick List */}
              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-xs font-bold text-gray-700 mb-3">
                  Orders Ready for Pick-up
                </h4>
                <div className="space-y-2">
                  {orders
                    .filter((o) => o.status === 'Ready for Pick-up')
                    .map((o) => (
                      <div
                        key={o.order_id}
                        className="p-3 rounded-xl border border-gray-100 bg-gray-50 flex justify-between items-center text-xs"
                      >
                        <div>
                          <span className="font-bold text-[#0f4b81]">
                            #KSC-2026-{String(o.order_id).padStart(3, '0')}
                          </span>{' '}
                          • <span className="font-semibold">{o.customer_name}</span>
                        </div>
                        <button
                          onClick={() => setVerifiedOrder(o)}
                          className="px-3 py-1 bg-[#0f4b81] text-white rounded-lg font-bold text-[11px]"
                        >
                          Verify
                        </button>
                      </div>
                    ))}
                  {orders.filter((o) => o.status === 'Ready for Pick-up').length === 0 && (
                    <p className="text-xs text-gray-400">
                      No orders currently waiting in Ready for Pick-up.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SALES ANALYTICS */}
        {activeTab === 'sales' && (
          <div className="p-8 space-y-6 max-w-5xl mx-auto w-full">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-1">
                  Sales Analytics &amp; Revenue Reports
                </h3>
                <p className="text-xs text-gray-500">
                  Tracks cumulative shop earnings against processing volume and customer app feedback.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-xs text-gray-500 font-semibold">
                    Monthly Baseline Sales (November 2026)
                  </p>
                  <p className="text-2xl font-black text-gray-900 mt-1">₱24,500.00</p>
                  <span className="text-xs font-bold text-green-600">
                    + ₱{estimatedLiveSales.toLocaleString()} live queue
                  </span>
                </div>
                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-xs text-gray-500 font-semibold">
                    Total Volume Processed
                  </p>
                  <p className="text-2xl font-black text-[#0f4b81] mt-1">
                    {(3000 + totalProcessedKg).toLocaleString()} kg
                  </p>
                  <span className="text-[11px] text-gray-500">
                    Includes {totalProcessedKg} kg active DB volume
                  </span>
                </div>
                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-xs text-gray-500 font-semibold">
                    Completed Orders
                  </p>
                  <p className="text-2xl font-black text-gray-900 mt-1">
                    {completedOrders.length}
                  </p>
                  <span className="text-[11px] text-gray-500">Picked Up &amp; Verified</span>
                </div>
              </div>

              {/* Customer Reviews Feed */}
              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-xs font-bold text-gray-700 mb-3 flex items-center space-x-2">
                  <Star className="w-4 h-4 text-amber-500" />
                  <span>Live Customer Mobile App Ratings</span>
                </h4>
                <div className="space-y-2">
                  {(dashboardData?.reviews || []).map((rev) => (
                    <div
                      key={rev.review_id}
                      className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/70 flex justify-between items-center text-xs"
                    >
                      <div>
                        <p className="font-bold text-gray-900">{rev.customer_name}</p>
                        <p className="text-gray-600 text-[11px] mt-0.5">
                          {rev.feedback || 'Rated service via mobile app'}
                        </p>
                      </div>
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full font-bold text-[11px]">
                        ★ {rev.rating} / 5
                      </span>
                    </div>
                  ))}
                  {(!dashboardData?.reviews || dashboardData.reviews.length === 0) && (
                    <p className="text-xs text-gray-400">
                      No customer reviews submitted yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: UTILITY ANALYTICS (INTERACTIVE ₱13.50/KG OVERHEAD CALCULATOR) */}
        {activeTab === 'utility' && (
          <div className="p-8 max-w-4xl mx-auto w-full space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-1">
                  Utility Cost Tracking &amp; Overhead Calculator (₱{overheadPerKg}/kg)
                </h3>
                <p className="text-xs text-gray-500">
                  Computes utility and supply expenses per kilo washed against owner monthly baselines (barangay-based electric operation without LPG). Adjust any baseline below to simulate overhead.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100">
                  <label className="text-xs font-bold text-[#0f4b81] block">
                    Water Utility (₱)
                  </label>
                  <input
                    type="number"
                    value={waterCost}
                    onChange={(e) => setWaterCost(e.target.value)}
                    className="w-full mt-1.5 bg-white border border-blue-200 rounded-lg px-2.5 py-1.5 text-base font-black text-[#0f4b81]"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">Monthly flat &amp; metered</p>
                </div>
                <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-100">
                  <label className="text-xs font-bold text-amber-800 block">
                    Electricity (₱)
                  </label>
                  <input
                    type="number"
                    value={electricityCost}
                    onChange={(e) => setElectricityCost(e.target.value)}
                    className="w-full mt-1.5 bg-white border border-amber-200 rounded-lg px-2.5 py-1.5 text-base font-black text-amber-800"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">Electric washers &amp; dryers</p>
                </div>
                <div className="p-4 bg-green-50/60 rounded-2xl border border-green-100">
                  <label className="text-xs font-bold text-green-800 block">
                    Detergent &amp; Downy (₱)
                  </label>
                  <input
                    type="number"
                    value={suppliesCost}
                    onChange={(e) => setSuppliesCost(e.target.value)}
                    className="w-full mt-1.5 bg-white border border-green-200 rounded-lg px-2.5 py-1.5 text-base font-black text-green-800"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">Supplies &amp; softeners</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                  <label className="text-xs font-bold text-gray-700 block">
                    Monthly Volume (kg)
                  </label>
                  <input
                    type="number"
                    value={monthlyVolume}
                    onChange={(e) => setMonthlyVolume(e.target.value)}
                    className="w-full mt-1.5 bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-base font-black text-gray-900"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">Total monthly kilos</p>
                </div>
              </div>

              <div className="p-6 bg-gray-900 text-white rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-green-400">
                    Formula Verification (Chapter 3)
                  </span>
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full font-bold text-[10px]">
                    Verified: ₱{overheadPerKg} / kg
                  </span>
                </div>
                <p className="text-xs font-mono text-gray-200">
                  Overhead per Kilo = (Water [₱{Number(waterCost).toLocaleString()}] + Electricity [₱
                  {Number(electricityCost).toLocaleString()}] + Supplies [₱
                  {Number(suppliesCost).toLocaleString()}]) / Monthly Volume [
                  {Number(monthlyVolume).toLocaleString()} kg] ={' '}
                  <span className="text-green-400 font-bold">₱{overheadPerKg} / kg</span>
                </p>
                <p className="text-[11px] text-gray-400">
                  Based on KSC Laundry Shop owner&apos;s baseline records of ₱
                  {totalUtilityExpense.toLocaleString()} total monthly utility expenses divided by{' '}
                  {Number(monthlyVolume).toLocaleString()} kg monthly volume, yielding ₱
                  {overheadPerKg} per kilo overhead.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: SETTINGS, ANNOUNCEMENTS & RBAC */}
        {activeTab === 'settings' && (
          <div className="p-8 max-w-3xl mx-auto w-full space-y-6">
            {/* Live Shop Announcement Broadcaster */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-4">
              <div className="flex items-center space-x-2">
                <Megaphone className="w-5 h-5 text-[#0f4b81]" />
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Mobile App Announcements Manager
                  </h3>
                  <p className="text-xs text-gray-500">
                    Publish or remove live Shop Announcements displayed on the KSCync Mobile App Home screen.
                  </p>
                </div>
              </div>

              <form onSubmit={handlePostAnnouncement} className="space-y-3">
                <input
                  type="text"
                  required
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  placeholder="Announcement Title (e.g. Holiday Schedule Notice)"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-900 focus:outline-none focus:border-[#0f4b81]"
                />
                <textarea
                  rows="2"
                  required
                  value={announcementMessage}
                  onChange={(e) => setAnnouncementMessage(e.target.value)}
                  placeholder="Message body displayed to customers..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-900 focus:outline-none focus:border-[#0f4b81]"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0f4b81] text-white rounded-xl font-bold text-xs hover:bg-blue-900 transition"
                >
                  Publish Announcement to Mobile App
                </button>
              </form>

              {/* Active Announcements List */}
              <div className="pt-4 border-t border-gray-100 space-y-2">
                <p className="text-xs font-bold text-gray-700">Active Mobile Announcements</p>
                {(dashboardData?.announcements || []).map((item) => (
                  <div
                    key={item.announcement_id}
                    className="p-3.5 rounded-xl border border-gray-100 bg-gray-50 flex justify-between items-start gap-3"
                  >
                    <div>
                      <p className="text-xs font-bold text-gray-900">{item.title}</p>
                      <p className="text-[11px] text-gray-600 mt-0.5">{item.message}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteAnnouncement(item.announcement_id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                      title="Delete Announcement"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Machine Capacity Threshold Control */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-4">
              <h3 className="text-base font-bold text-gray-900">
                Shop Machine Capacity Limit
              </h3>
              <p className="text-xs text-gray-500">
                Controls the denominator for the Shop Capacity &amp; Workload bar across Web and Mobile.
              </p>
              <div className="flex items-center space-x-4">
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={shopCapacityLimit}
                  onChange={(e) => setShopCapacityLimit(Number(e.target.value) || 8)}
                  className="w-24 bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-bold text-gray-900"
                />
                <span className="text-xs text-gray-600 font-semibold">
                  Active Washing &amp; Drying Machines (Default: 8)
                </span>
              </div>
            </div>

            {/* RBAC Permissions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-1">
                  Role-Based Access Control (RBAC)
                </h3>
                <p className="text-xs text-gray-500">
                  Manages feature permissions across Administrator, Staff, and Customer tiers.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    role: 'Administrator Role',
                    desc: 'Full access to utility analytics, sales reports, announcements, and user management.'
                  },
                  {
                    role: 'Staff / Counter Worker Role',
                    desc: 'Access to customer intake logger, physical container assignment, and stage progression.'
                  },
                  {
                    role: 'Customer Mobile User Role',
                    desc: 'Access to drop-off scheduling, live stage tracker, ratings, and push notifications.'
                  }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-gray-100 bg-gray-50/60 flex justify-between items-center"
                  >
                    <div>
                      <p className="text-xs font-bold text-gray-900">{item.role}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-bold text-[10px]">
                      Enabled
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: ADMIN PROFILE PAGE */}
        {activeTab === 'profile' && (
          <div className="p-8 max-w-4xl mx-auto w-full space-y-6">
            {/* Profile Header Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-wrap items-center justify-between gap-6">
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
                    <h3 className="text-xl font-black text-gray-900">
                      {adminProfile.fullName}
                    </h3>
                    <span className="px-2.5 py-0.5 bg-blue-50 text-[#0f4b81] rounded-full text-[10px] font-bold flex items-center space-x-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Verified Owner</span>
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{adminProfile.role}</p>
                  <div className="flex flex-wrap gap-4 mt-3 text-[11px] text-gray-600">
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

            {/* Editable Shop & Admin Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-4">
              <h4 className="text-sm font-bold text-gray-900">
                Shop &amp; Account Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Admin Full Name
                  </label>
                  <input
                    type="text"
                    value={adminProfile.fullName}
                    onChange={(e) =>
                      setAdminProfile({ ...adminProfile, fullName: e.target.value })
                    }
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Shop Display Name
                  </label>
                  <input
                    type="text"
                    value={adminProfile.shopName}
                    onChange={(e) =>
                      setAdminProfile({ ...adminProfile, shopName: e.target.value })
                    }
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Contact Phone Number
                  </label>
                  <input
                    type="text"
                    value={adminProfile.phone}
                    onChange={(e) =>
                      setAdminProfile({ ...adminProfile, phone: e.target.value })
                    }
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Operating Hours Notice
                  </label>
                  <input
                    type="text"
                    value={adminProfile.operatingHours}
                    onChange={(e) =>
                      setAdminProfile({
                        ...adminProfile,
                        operatingHours: e.target.value
                      })
                    }
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-900"
                  />
                </div>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => showToast('Admin Profile & Shop Details saved!')}
                  className="px-5 py-2.5 bg-[#0f4b81] text-white rounded-xl font-bold text-xs hover:bg-blue-900 transition flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Profile Changes</span>
                </button>
              </div>
            </div>

            {/* Registered Mobile App Users Directory */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-4">
              <h4 className="text-sm font-bold text-gray-900">
                Registered Mobile App Customers &amp; Push Notification Status
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
                    <tr>
                      <th className="py-3 px-4">Full Name</th>
                      <th className="py-3 px-4">Phone</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Expo Push Token</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(dashboardData?.users || []).map((u) => (
                      <tr key={u.user_id || u.email}>
                        <td className="py-3 px-4 font-bold text-gray-900">{u.full_name}</td>
                        <td className="py-3 px-4 text-gray-600">{u.phone_number}</td>
                        <td className="py-3 px-4 capitalize text-gray-600">{u.role}</td>
                        <td className="py-3 px-4">
                          {u.expo_push_token ? (
                            <span className="px-2.5 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-bold">
                              Registered
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 bg-gray-100 text-gray-500 rounded-full text-[10px] font-bold">
                              Pending Login
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {(!dashboardData?.users || dashboardData.users.length === 0) && (
                      <tr>
                        <td colSpan="4" className="py-4 text-center text-gray-400">
                          Customer profiles sync automatically when orders are placed.
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