import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import {
  ShieldCheck,
  ShieldAlert,
  Users,
  Layers,
  FileCheck,
  TrendingUp,
  Plus,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Trash2,
  Edit,
  X,
  Search,
  Filter,
  RefreshCw,
  Clock,
  ArrowRight,
  Eye,
  AlertTriangle,
  FileText,
  UserCheck,
  UserX,
  BarChart3,
  Calendar,
  Lock,
  ChevronLeft,
  ChevronRight,
  Activity,
  Check,
  Image
} from 'lucide-react';
import UserAvatar from '../components/UserAvatar';
import ReportDetailModal from '../components/ReportDetailModal';
import SuspendUserModal from '../components/SuspendUserModal';
import UserDetailModal from '../components/UserDetailModal';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { socket, pendingReportsCount, refreshPendingReportsCount } = useSocket();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Tab: 'overview' | 'reports' | 'users' | 'audit' | 'skills'
  const initialTab = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);

  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Reports Management State
  const [reports, setReports] = useState([]);
  const [reportsTotalCount, setReportsTotalCount] = useState(0);
  const [reportsPage, setReportsPage] = useState(1);
  const [reportsTotalPages, setReportsTotalPages] = useState(1);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState(null);
  const [reportFilterStatus, setReportFilterStatus] = useState('All');
  const [reportFilterCategory, setReportFilterCategory] = useState('All');
  const [reportFilterPriority, setReportFilterPriority] = useState('All');
  const [reportSearchTerm, setReportSearchTerm] = useState('');
  const [reportCounts, setReportCounts] = useState({
    all: 0,
    pending: 0,
    underReview: 0,
    resolved: 0,
    rejected: 0
  });
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [administrators, setAdministrators] = useState([]);

  // User Management State
  const [userList, setUserList] = useState([]);
  const [userFilterStatus, setUserFilterStatus] = useState('All'); // 'All' | 'active' | 'suspended'
  const [userFilterRole, setUserFilterRole] = useState('All'); // 'All' | 'user' | 'admin'
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userLoading, setUserLoading] = useState(false);
  const [selectedUserForSuspension, setSelectedUserForSuspension] = useState(null);
  const [selectedUserForDetails, setSelectedUserForDetails] = useState(null);
  const [showUserDetailModal, setShowUserDetailModal] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return 'Not available';
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Not available';
    }
  };

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLogsPage, setAuditLogsPage] = useState(1);
  const [auditLogsTotalPages, setAuditLogsTotalPages] = useState(1);
  const [auditLogsLoading, setAuditLogsLoading] = useState(false);
  const [auditSearchTerm, setAuditSearchTerm] = useState('');

  // Skills Taxonomy State
  const [skillsList, setSkillsList] = useState([]);
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [skillName, setSkillName] = useState('');
  const [skillCategory, setSkillCategory] = useState('Software & Tech');
  const [skillDescription, setSkillDescription] = useState('');
  const [skillIcon, setSkillIcon] = useState('Sparkles');
  const [skillPopular, setSkillPopular] = useState(false);
  const [skillSubmitting, setSkillSubmitting] = useState(false);

  const [notificationMsg, setNotificationMsg] = useState('');

  // Update URL search query on tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Sync activeTab with URL search params when changed via AdminLayout
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab') || 'overview';
    if (tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  // 1. Fetch Dashboard Stats
  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await api.get('/admin/stats');
      if (res.data.success && res.data.stats) {
        setStats(res.data.stats);
        setReportCounts(prev => ({
          ...prev,
          all: res.data.stats.totalReports ?? prev.all,
          pending: res.data.stats.pendingReports ?? prev.pending,
          underReview: res.data.stats.underReviewReports ?? prev.underReview,
          resolved: res.data.stats.resolvedReports ?? prev.resolved,
          rejected: res.data.stats.rejectedReports ?? prev.rejected
        }));
      }
    } catch (e) {
      console.error('Failed to load admin stats:', e);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // 2. Fetch Administrators for assignment
  const fetchAdministrators = useCallback(async () => {
    try {
      const res = await api.get('/admin/administrators');
      if (res.data.success) {
        setAdministrators(res.data.administrators || []);
      }
    } catch (e) {
      console.warn('Could not load administrators list:', e);
    }
  }, []);

  // 3. Fetch Reports with filters & pagination
  const fetchReports = useCallback(async (page = 1, overrides = {}) => {
    setReportsLoading(true);
    setReportsError(null);
    try {
      const activeStatus = overrides.status !== undefined ? overrides.status : reportFilterStatus;
      const activeCategory = overrides.category !== undefined ? overrides.category : reportFilterCategory;
      const activePriority = overrides.priority !== undefined ? overrides.priority : reportFilterPriority;
      const activeSearch = overrides.search !== undefined ? overrides.search : reportSearchTerm;

      const params = {
        page,
        limit: 10,
        status: activeStatus,
        category: activeCategory,
        priority: activePriority,
        search: activeSearch
      };
      const res = await api.get('/admin/reports', { params });
      if (res.data.success) {
        setReports(res.data.reports || []);
        setReportsTotalCount(res.data.totalCount || 0);
        setReportsPage(res.data.page || 1);
        setReportsTotalPages(res.data.totalPages || 1);
        if (res.data.counts) {
          setReportCounts(res.data.counts);
        }
      } else {
        setReportsError(res.data.message || 'Failed to load reports');
      }
    } catch (e) {
      console.error('Failed to load reports:', e);
      setReportsError(e.response?.data?.message || e.message || 'Failed to load reports from database');
    } finally {
      setReportsLoading(false);
    }
  }, [reportFilterStatus, reportFilterCategory, reportFilterPriority, reportSearchTerm]);

  // Report Filter Handlers - trigger immediate fetch with new parameter
  const handleStatusFilterChange = (st) => {
    setReportFilterStatus(st);
    setReportsPage(1);
    fetchReports(1, { status: st });
  };

  const handleCategoryFilterChange = (cat) => {
    setReportFilterCategory(cat);
    setReportsPage(1);
    fetchReports(1, { category: cat });
  };

  const handlePriorityFilterChange = (prio) => {
    setReportFilterPriority(prio);
    setReportsPage(1);
    fetchReports(1, { priority: prio });
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setReportsPage(1);
    fetchReports(1, { search: reportSearchTerm });
  };

  const handleClearSearch = () => {
    setReportSearchTerm('');
    setReportsPage(1);
    fetchReports(1, { search: '' });
  };

  const navigateToReportsWithFilter = (targetStatus) => {
    setReportFilterStatus(targetStatus);
    handleTabChange('reports');
    fetchReports(1, { status: targetStatus });
  };

  // 4. Fetch Users with status and report counters
  const fetchUsers = useCallback(async () => {
    setUserLoading(true);
    try {
      const params = {
        status: userFilterStatus === 'All' ? undefined : userFilterStatus,
        role: userFilterRole === 'All' ? undefined : userFilterRole,
        search: userSearchTerm || undefined
      };
      const res = await api.get('/admin/users', { params });
      if (res.data.success) {
        setUserList(res.data.users || []);
      }
    } catch (e) {
      console.error('Failed to load users:', e);
    } finally {
      setUserLoading(false);
    }
  }, [userFilterStatus, userFilterRole, userSearchTerm]);

  // 5. Fetch Audit Logs
  const fetchAuditLogs = useCallback(async (page = 1) => {
    setAuditLogsLoading(true);
    try {
      const params = {
        page,
        limit: 15,
        search: auditSearchTerm || undefined
      };
      const res = await api.get('/admin/audit-logs', { params });
      if (res.data.success) {
        setAuditLogs(res.data.logs || []);
        setAuditLogsPage(res.data.page || 1);
        setAuditLogsTotalPages(res.data.totalPages || 1);
      }
    } catch (e) {
      console.error('Failed to load audit logs:', e);
    } finally {
      setAuditLogsLoading(false);
    }
  }, [auditSearchTerm]);

  // 6. Fetch Skills Taxonomy
  const fetchSkills = useCallback(async () => {
    try {
      const res = await api.get('/skills');
      if (res.data.success) {
        setSkillsList(res.data.skills || []);
      }
    } catch (e) {
      console.error('Failed to load skills:', e);
    }
  }, []);

  // Initial Load
  useEffect(() => {
    fetchStats();
    fetchAdministrators();
    fetchReports(1);
    fetchUsers();
    fetchSkills();
    fetchAuditLogs(1);
  }, []);

  // Socket.IO real-time auto-refresh listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewReport = () => {
      fetchStats();
      fetchReports(reportsPage);
    };

    const handleReportUpdated = () => {
      fetchStats();
      fetchReports(reportsPage);
      fetchAuditLogs(1);
    };

    socket.on('new_report_notification', handleNewReport);
    socket.on('report_updated', handleReportUpdated);

    return () => {
      socket.off('new_report_notification', handleNewReport);
      socket.off('report_updated', handleReportUpdated);
    };
  }, [socket, reportsPage, fetchStats, fetchReports, fetchAuditLogs]);

  // Handle Role Toggle with safeguard against self-demotion
  const handleRoleToggle = async (targetUserId, currentRole) => {
    if (String(targetUserId) === String(user?._id)) {
      alert('Security Safeguard: You cannot alter your own administrative role.');
      return;
    }
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      const res = await api.patch(`/admin/users/${targetUserId}/role`, { role: newRole });
      if (res.data.success) {
        setUserList(prev =>
          prev.map(u => (u._id === targetUserId ? { ...u, role: newRole } : u))
        );
        fetchStats();
        fetchAdministrators();
        setNotificationMsg(`User role updated to ${newRole}`);
        setTimeout(() => setNotificationMsg(''), 4000);
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Error updating user role');
    }
  };

  // Create Skill
  const handleCreateSkill = async (e) => {
    e.preventDefault();
    setSkillSubmitting(true);
    try {
      const res = await api.post('/skills', {
        name: skillName,
        category: skillCategory,
        description: skillDescription,
        icon: skillIcon,
        isPopular: skillPopular
      });
      if (res.data.success) {
        setNotificationMsg('New platform skill added to taxonomy!');
        setShowAddSkill(false);
        setSkillName('');
        setSkillDescription('');
        fetchSkills();
        fetchStats();
        setTimeout(() => setNotificationMsg(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating skill');
    } finally {
      setSkillSubmitting(false);
    }
  };

  // Delete Skill
  const handleDeleteSkill = async (id) => {
    if (!confirm('Are you sure you want to delete this skill?')) return;
    try {
      const res = await api.delete(`/skills/${id}`);
      if (res.data.success) {
        setSkillsList(prev => prev.filter(s => s._id !== id));
        fetchStats();
      }
    } catch (e) {
      alert('Failed to delete skill');
    }
  };

  const getPriorityPill = (prio) => {
    switch (prio) {
      case 'Urgent':
        return 'bg-rose-50 dark:bg-rose-950/50 text-[#DC5555] dark:text-rose-400 border-[#DC5555]/30';
      case 'High':
        return 'bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 border-orange-300 dark:border-orange-800/60';
      case 'Medium':
        return 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800/60';
      default:
        return 'bg-[#FAF9F5] dark:bg-[#0E1526] text-[#708096] dark:text-slate-400 border-[#E5EAE7] dark:border-slate-800';
    }
  };

  const getStatusPill = (st) => {
    switch (st) {
      case 'Pending':
        return 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800/60';
      case 'In Progress':
      case 'IN_PROGRESS':
      case 'Under Review':
        return 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-400 border-sky-300 dark:border-sky-800/60';
      case 'Resolved':
      case 'RESOLVED':
        return 'bg-[#EAF6EF] dark:bg-emerald-950/60 text-[#07866D] dark:text-emerald-400 border-[#07866D]/30';
      case 'Rejected':
        return 'bg-slate-100 dark:bg-slate-800 text-[#708096] dark:text-slate-400 border-slate-200 dark:border-slate-700';
      default:
        return 'bg-[#FAF9F5] dark:bg-[#0E1526] text-[#708096] dark:text-slate-400 border-[#E5EAE7] dark:border-slate-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5EAE7] dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 sm:p-2.5 rounded-2xl bg-[#EAF6EF] dark:bg-emerald-950/60 text-[#07866D] dark:text-emerald-400 border border-[#07866D]/20 shadow-xs shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#102B50] dark:text-white font-display">
                Admin Command Center
              </h1>
              <p className="text-xs sm:text-sm text-[#708096] dark:text-slate-400 mt-1">
                Overview metrics, user report moderation, member safety, and platform audit logs
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Tools */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            onClick={() => {
              fetchStats();
              fetchReports(reportsPage);
              fetchUsers();
              fetchAuditLogs(auditLogsPage);
              refreshPendingReportsCount();
            }}
            className="btn-white !py-2.5 !px-4 !text-xs flex items-center gap-1.5"
            title="Refresh all metrics"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Data</span>
          </button>

          <button
            onClick={() => setShowAddSkill(true)}
            className="btn-emerald !py-2.5 !px-4 !text-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Skill</span>
          </button>
        </div>
      </div>

      {notificationMsg && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#EAF6EF] dark:bg-emerald-950/40 border border-[#07866D]/20 flex items-center gap-2.5 text-xs font-bold text-[#07866D] dark:text-emerald-300 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 1: OVERVIEW DASHBOARD */}
      {/* ======================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
          {/* Key Metric KPI Cards Row */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {/* Total Users */}
              <div className="card-clean p-4 sm:p-5 hover:-translate-y-0.5 transition-all">
                <div className="flex items-center justify-between text-[#708096] dark:text-slate-400 mb-2">
                  <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">Registered Users</span>
                  <div className="p-2 rounded-2xl bg-[#EAF6EF] dark:bg-emerald-950/60 text-[#07866D] dark:text-emerald-400 border border-[#07866D]/20">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#102B50] dark:text-white font-display">
                  {stats.totalUsers}
                </div>
                <div className="flex items-center gap-2 mt-1.5 text-[11px]">
                  <span className="text-[#07866D] dark:text-emerald-400 font-bold">{stats.activeUsers || stats.totalUsers} active</span>
                  {stats.suspendedUsers > 0 && (
                    <span className="text-[#DC5555] font-bold">• {stats.suspendedUsers} suspended</span>
                  )}
                </div>
              </div>

              {/* Total Reports */}
              <div
                onClick={() => navigateToReportsWithFilter('All')}
                className="card-clean p-4 sm:p-5 cursor-pointer hover:border-[#DC5555]/40 hover:-translate-y-0.5 transition-all"
                title="Click to view all reports"
              >
                <div className="flex items-center justify-between text-[#708096] dark:text-slate-400 mb-2">
                  <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">Total Reports</span>
                  <div className="p-2 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-[#DC5555] dark:text-rose-400 border border-[#DC5555]/20">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#DC5555] dark:text-rose-400 font-display">
                  {stats.totalReports || 0}
                </div>
                <span className="text-[11px] text-[#708096] dark:text-slate-400 font-medium mt-1 block">
                  Lifetime reports filed • Click to view all
                </span>
              </div>

              {/* Pending Action Reports */}
              <div
                onClick={() => navigateToReportsWithFilter('Pending')}
                className="card-clean p-4 sm:p-5 cursor-pointer hover:border-amber-500/50 hover:-translate-y-0.5 transition-all border-amber-300 dark:border-amber-900/60 bg-amber-50/20 dark:bg-amber-950/10"
                title="Click to view pending reports"
              >
                <div className="flex items-center justify-between text-[#708096] dark:text-slate-400 mb-2">
                  <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                    Pending Review
                  </span>
                  <div className="p-2 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400 font-display">
                  {stats.pendingReports || 0}
                </div>
                <span className="text-[11px] text-amber-700 dark:text-amber-300 font-bold mt-1 block">
                  Requires admin triage • Click to view
                </span>
              </div>

              {/* Resolved Reports */}
              <div
                onClick={() => navigateToReportsWithFilter('Resolved')}
                className="card-clean p-4 sm:p-5 cursor-pointer hover:border-[#07866D]/40 hover:-translate-y-0.5 transition-all"
                title="Click to view resolved reports"
              >
                <div className="flex items-center justify-between text-[#708096] dark:text-slate-400 mb-2">
                  <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">Resolved & Actioned</span>
                  <div className="p-2 rounded-2xl bg-[#EAF6EF] dark:bg-emerald-950/60 text-[#07866D] dark:text-emerald-400 border border-[#07866D]/20">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#07866D] dark:text-emerald-400 font-display">
                  {stats.resolvedReports || 0}
                </div>
                <span className="text-[11px] text-[#07866D] dark:text-emerald-400 font-bold mt-1 block">
                  {stats.underReviewReports || 0} under review • Click to view
                </span>
              </div>
            </div>
          )}

          {/* Secondary Metric Bar */}
          {stats && (
            <div className="card-clean p-4 sm:p-5 grid grid-cols-2 xs:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-[#708096] dark:text-slate-400 block text-[10px] uppercase font-bold">Active Swaps</span>
                <span className="font-extrabold text-base text-[#102B50] dark:text-white font-display">{stats.activeSwaps}</span>
              </div>
              <div>
                <span className="text-[#708096] dark:text-slate-400 block text-[10px] uppercase font-bold">Completed Swaps</span>
                <span className="font-extrabold text-base text-[#07866D] dark:text-emerald-400 font-display">
                  {stats.completedSwaps} ({stats.completionRate}%)
                </span>
              </div>
              <div>
                <span className="text-[#708096] dark:text-slate-400 block text-[10px] uppercase font-bold">Skills Catalog</span>
                <span className="font-extrabold text-base text-[#102B50] dark:text-white font-display">{stats.totalSkills}</span>
              </div>
              <div>
                <span className="text-[#708096] dark:text-slate-400 block text-[10px] uppercase font-bold">Rejected Reports</span>
                <span className="font-extrabold text-base text-[#708096] dark:text-slate-400 font-display">{stats.rejectedReports || 0}</span>
              </div>
            </div>
          )}

          {/* Analytics Visual Breakdown Grid */}
          {stats && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Breakdown Bar Visualizer */}
              <div className="card-clean p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm sm:text-base text-[#102B50] dark:text-white font-display flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-[#DC5555]" />
                    <span>Report Categories Breakdown</span>
                  </h3>
                  <span className="text-[11px] text-[#708096] dark:text-slate-400 font-bold">Distribution</span>
                </div>

                <div className="space-y-3">
                  {Object.entries(stats.categoryDistribution || {}).length === 0 ? (
                    <p className="text-xs text-[#708096] dark:text-slate-400 italic py-4 text-center">No reports filed yet.</p>
                  ) : (
                    Object.entries(stats.categoryDistribution || {}).map(([catName, count]) => {
                      const total = stats.totalReports || 1;
                      const pct = Math.round((count / total) * 100);
                      return (
                        <div key={catName} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-[#24364B] dark:text-slate-200 truncate max-w-[280px]">
                              {catName}
                            </span>
                            <span className="text-[#708096] dark:text-slate-400 font-extrabold">
                              {count} ({pct}%)
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-[#07866D] to-teal-400 transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Priority Breakdown & City Distribution */}
              <div className="card-clean p-5 sm:p-6 space-y-5">
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-[#102B50] dark:text-white font-display flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-[#07866D]" />
                    <span>Severity & Geographic Activity</span>
                  </h3>

                  {/* Priority Badges Breakdown */}
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: 'Urgent', count: stats.priorityDistribution?.Urgent || 0, color: 'text-[#DC5555] dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-[#DC5555]/30' },
                      { label: 'High', count: stats.priorityDistribution?.High || 0, color: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 border-orange-300 dark:border-orange-850' },
                      { label: 'Medium', count: stats.priorityDistribution?.Medium || 0, color: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-850' },
                      { label: 'Low', count: stats.priorityDistribution?.Low || 0, color: 'text-[#708096] dark:text-slate-400 bg-slate-50 dark:bg-slate-850 border-[#E5EAE7] dark:border-slate-800' }
                    ].map(p => (
                      <div key={p.label} className={`p-2.5 rounded-2xl border text-center ${p.color}`}>
                        <div className="text-lg font-black">{p.count}</div>
                        <div className="text-[10px] font-bold uppercase">{p.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Cities */}
                <div className="space-y-2 pt-2 border-t border-[#E5EAE7] dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-[#708096] dark:text-slate-400 block">Top Barter Regions (Pakistan)</span>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(stats.cityDistribution || {}).slice(0, 6).map(([c, count]) => (
                      <span
                        key={c}
                        className="px-2.5 py-1 rounded-xl bg-[#FAF9F5] dark:bg-[#0D1527] border border-[#E5EAE7] dark:border-slate-800 text-xs font-bold text-[#24364B] dark:text-slate-300 flex items-center gap-1.5 shadow-2xs"
                      >
                        <MapPin className="w-3 h-3 text-[#07866D]" />
                        <span>{c}</span>
                        <span className="text-[#708096] dark:text-slate-400 font-normal">({count})</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Recent Reports Stream */}
          {stats?.recentReports && (
            <div className="card-clean p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-sm sm:text-base text-[#102B50] dark:text-white font-display flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#07866D]" />
                  <span>Recent Reports Stream</span>
                </h3>
                <button
                  onClick={() => handleTabChange('reports')}
                  className="text-xs font-bold text-[#07866D] dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>View All Reports</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2.5">
                {stats.recentReports.map(r => (
                  <div
                    key={r._id}
                    onClick={() => {
                      setSelectedReportId(r._id);
                    }}
                    className="p-3.5 rounded-2xl bg-[#FAF9F5] dark:bg-[#0D1527] border border-[#E5EAE7] dark:border-slate-800 hover:border-[#07866D]/40 transition-all flex items-center justify-between gap-3 cursor-pointer shadow-2xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2 rounded-xl shrink-0 border ${getPriorityPill(r.priority)}`}>
                        <ShieldAlert className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-[#102B50] dark:text-white">
                            #{r.reportId}
                          </span>
                          <span className={`px-2 py-0.2 rounded-full text-[9px] font-black uppercase border ${getStatusPill(r.status)}`}>
                            {r.status}
                          </span>
                        </div>
                        <p className="text-xs text-[#24364B] dark:text-slate-200 font-extrabold truncate mt-0.5">
                          {r.category}
                        </p>
                        <p className="text-[11px] text-[#708096] dark:text-slate-400 truncate">
                          Target: {r.reportedUser?.name || 'Content Item'} • By: {r.reporter?.name || 'Member'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-[#708096] dark:text-slate-400 block font-medium">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-xs font-bold text-[#07866D] dark:text-emerald-400 flex items-center gap-1 mt-1 justify-end">
                        <span>Review</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: REPORTS MANAGEMENT */}
      {/* ======================================================== */}
      {activeTab === 'reports' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Filtering and Search Controls Bar */}
          <div className="card-clean p-4 sm:p-5 space-y-3.5">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Search Box */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#708096] dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={reportSearchTerm}
                  onChange={(e) => setReportSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearchSubmit();
                  }}
                  placeholder="Search by Report ID, user name, email, or keywords..."
                  className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-white dark:bg-[#0D1527] border border-[#E5EAE7] dark:border-slate-700 text-xs outline-none focus:ring-2 focus:ring-[#07866D]/20 focus:border-[#07866D] font-medium text-[#102B50] dark:text-white"
                />
                {reportSearchTerm && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#708096] hover:text-[#102B50] dark:hover:text-slate-200 p-0.5 rounded cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar touch-scroll">
                {[
                  { id: 'All', label: 'All', count: reportCounts.all },
                  { id: 'Pending', label: 'Pending', count: reportCounts.pending },
                  { id: 'In Progress', label: 'In Progress', count: reportCounts.underReview },
                  { id: 'Resolved', label: 'Resolved', count: reportCounts.resolved },
                  { id: 'Rejected', label: 'Rejected', count: reportCounts.rejected }
                ].map(st => {
                  const isActive =
                    reportFilterStatus.toLowerCase() === st.id.toLowerCase() ||
                    (st.id === 'In Progress' && (reportFilterStatus.toLowerCase() === 'under review' || reportFilterStatus.toLowerCase() === 'in progress'));
                  return (
                    <button
                      key={st.id}
                      type="button"
                      id={`filter-btn-${st.id.toLowerCase().replace(/\s+/g, '-')}`}
                      onClick={() => handleStatusFilterChange(st.id)}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-xs active:scale-95 ${
                        isActive
                          ? 'bg-[#07866D] text-white shadow-sm'
                          : 'bg-white dark:bg-[#0D1527] border border-[#E5EAE7] dark:border-slate-800 text-[#24364B] dark:text-slate-300 hover:border-[#07866D]/40 hover:text-[#07866D]'
                      }`}
                    >
                      <span>{st.label}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold transition-colors ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-[#FAF9F5] dark:bg-[#0E1526] text-[#708096] dark:text-slate-400 border border-[#E5EAE7] dark:border-slate-800'
                        }`}
                      >
                        {st.count ?? 0}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Secondary Filter Row: Category, Priority */}
            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#E5EAE7] dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-[#708096] dark:text-slate-400">Category:</span>
                <select
                  value={reportFilterCategory}
                  onChange={(e) => handleCategoryFilterChange(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#0D1527] border border-[#E5EAE7] dark:border-slate-700 text-xs font-semibold text-[#102B50] dark:text-slate-200 outline-none cursor-pointer focus:ring-2 focus:ring-[#07866D]/20 focus:border-[#07866D]"
                >
                  <option value="All">All Categories</option>
                  <option value="Fraud or scam">Fraud or scam</option>
                  <option value="Harassment or abusive behavior">Harassment or abusive behavior</option>
                  <option value="Fake or impersonation account">Fake or impersonation account</option>
                  <option value="Spam or unwanted content">Spam or unwanted content</option>
                  <option value="Inappropriate content">Inappropriate content</option>
                  <option value="False or misleading information">False or misleading information</option>
                  <option value="Copyright or intellectual property concern">Copyright or IP concern</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-[#708096] dark:text-slate-400">Severity:</span>
                <select
                  value={reportFilterPriority}
                  onChange={(e) => handlePriorityFilterChange(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#0D1527] border border-[#E5EAE7] dark:border-slate-700 text-xs font-semibold text-[#102B50] dark:text-slate-200 outline-none cursor-pointer focus:ring-2 focus:ring-[#07866D]/20 focus:border-[#07866D]"
                >
                  <option value="All">All Priorities</option>
                  <option value="Urgent">Urgent</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              {/* Reset Filters Shortcut (if any filter is applied) */}
              {(reportFilterStatus !== 'All' || reportFilterCategory !== 'All' || reportFilterPriority !== 'All' || reportSearchTerm) && (
                <button
                  type="button"
                  onClick={() => {
                    setReportFilterStatus('All');
                    setReportFilterCategory('All');
                    setReportFilterPriority('All');
                    setReportSearchTerm('');
                    setReportsPage(1);
                    fetchReports(1, { status: 'All', category: 'All', priority: 'All', search: '' });
                  }}
                  className="text-[11px] font-bold text-[#07866D] dark:text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Reset all filters
                </button>
              )}

              <div className="ml-auto text-xs font-bold text-[#708096] dark:text-slate-400">
                Found {reportsTotalCount} report{reportsTotalCount !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* Reports Table / Card View */}
          <div className="card-clean p-4 sm:p-6 space-y-4">
            {reportsError ? (
              <div className="py-12 px-4 text-center space-y-3">
                <AlertCircle className="w-10 h-10 text-[#DC5555] mx-auto" />
                <h4 className="font-extrabold text-sm text-[#102B50] dark:text-white font-display">Unable to Load Reports</h4>
                <p className="text-xs text-[#DC5555] dark:text-rose-400 max-w-md mx-auto">
                  {reportsError}
                </p>
                <button
                  type="button"
                  onClick={() => fetchReports(reportsPage)}
                  className="btn-emerald !py-2 !px-4 !text-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Retry Loading
                </button>
              </div>
            ) : reportsLoading ? (
              <div className="py-20 text-center">
                <div className="w-10 h-10 rounded-full border-4 border-[#07866D]/20 border-t-[#07866D] animate-spin mx-auto mb-3" />
                <p className="text-xs font-bold text-[#708096] dark:text-slate-400 uppercase tracking-wider">
                  Loading {reportFilterStatus !== 'All' ? `${reportFilterStatus} ` : ''}reports...
                </p>
              </div>
            ) : reports.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                {reportFilterStatus === 'Pending' ? (
                  <>
                    <CheckCircle2 className="w-12 h-12 text-[#07866D] mx-auto" />
                    <h4 className="font-extrabold text-base text-[#102B50] dark:text-white font-display">
                      No Pending Reports
                    </h4>
                    <p className="text-xs text-[#708096] dark:text-slate-400 max-w-sm mx-auto">
                      All reports have been reviewed! There are no unresolved reports awaiting triage at this time.
                    </p>
                  </>
                ) : reportFilterStatus === 'Resolved' ? (
                  <>
                    <ShieldCheck className="w-12 h-12 text-[#07866D] mx-auto" />
                    <h4 className="font-extrabold text-base text-[#102B50] dark:text-white font-display">
                      No Resolved Reports
                    </h4>
                    <p className="text-xs text-[#708096] dark:text-slate-400 max-w-sm mx-auto">
                      No reports currently have a resolved status. Actioned reports with resolutions will appear here.
                    </p>
                  </>
                ) : reportFilterStatus === 'Under Review' ? (
                  <>
                    <Clock className="w-12 h-12 text-amber-500 mx-auto" />
                    <h4 className="font-extrabold text-base text-[#102B50] dark:text-white font-display">
                      No Reports Under Review
                    </h4>
                    <p className="text-xs text-[#708096] dark:text-slate-400 max-w-sm mx-auto">
                      No reports are currently assigned or under active investigation.
                    </p>
                  </>
                ) : reportFilterStatus === 'Rejected' ? (
                  <>
                    <ShieldAlert className="w-12 h-12 text-[#708096] mx-auto" />
                    <h4 className="font-extrabold text-base text-[#102B50] dark:text-white font-display">
                      No Rejected Reports
                    </h4>
                    <p className="text-xs text-[#708096] dark:text-slate-400 max-w-sm mx-auto">
                      No reports have been dismissed or rejected as non-violations.
                    </p>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-12 h-12 text-[#07866D] mx-auto" />
                    <h4 className="font-extrabold text-base text-[#102B50] dark:text-white font-display">
                      No Reports Found
                    </h4>
                    <p className="text-xs text-[#708096] dark:text-slate-400 max-w-sm mx-auto">
                      {reportSearchTerm
                        ? `No reports found matching "${reportSearchTerm}". Try adjusting your keywords or filters.`
                        : 'No reports match the current filter selection.'}
                    </p>
                  </>
                )}
                {(reportFilterStatus !== 'All' || reportFilterCategory !== 'All' || reportFilterPriority !== 'All' || reportSearchTerm) && (
                  <button
                    type="button"
                    onClick={() => {
                      setReportFilterStatus('All');
                      setReportFilterCategory('All');
                      setReportFilterPriority('All');
                      setReportSearchTerm('');
                      setReportsPage(1);
                      fetchReports(1, { status: 'All', category: 'All', priority: 'All', search: '' });
                    }}
                    className="btn-white !py-1.5 !px-3.5 !text-xs inline-flex items-center gap-1.5 mx-auto"
                  >
                    <RefreshCw className="w-3 h-3" />
                    View All Reports
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Desktop Data Table */}
                <div className="hidden md:block overflow-x-auto no-scrollbar">
                  <table className="w-full text-left text-xs min-w-[840px]">
                    <thead className="border-b border-[#E5EAE7] dark:border-slate-800 text-[#708096] dark:text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3 px-3">Report ID</th>
                        <th className="py-3 px-3">Issue Title & Description</th>
                        <th className="py-3 px-3">Screenshot</th>
                        <th className="py-3 px-3">Reporter</th>
                        <th className="py-3 px-3">Priority</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3">Date</th>
                        <th className="py-3 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5EAE7]/70 dark:divide-slate-800/60 font-medium">
                      {reports.map((r) => (
                        <tr
                          key={r._id}
                          className="hover:bg-[#FAF9F5]/80 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="py-3.5 px-3">
                            <span className="font-mono font-bold text-[#102B50] dark:text-white">
                              #{r.reportId}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 max-w-[280px]">
                            <div className="font-extrabold text-[#102B50] dark:text-white truncate">
                              {r.title || r.category}
                            </div>
                            <div className="text-[11px] text-[#708096] dark:text-slate-400 truncate mt-0.5">
                              {r.description || r.reason}
                            </div>
                          </td>
                          <td className="py-3.5 px-3">
                            {r.screenshot ? (
                              <button
                                type="button"
                                onClick={() => setSelectedReportId(r._id)}
                                className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[#EAF6EF] dark:bg-emerald-950/60 text-[#07866D] dark:text-emerald-400 border border-[#07866D]/20 hover:scale-105 transition-transform cursor-pointer"
                                title="Click to view full screenshot in review modal"
                              >
                                <img
                                  src={r.screenshot}
                                  alt="Thumb"
                                  className="w-5 h-5 rounded object-cover"
                                />
                                <span className="text-[10px] font-bold">Preview</span>
                              </button>
                            ) : (
                              <span className="text-[#708096] dark:text-slate-500 text-[11px]">—</span>
                            )}
                          </td>
                          <td className="py-3.5 px-3">
                            <span className="text-[#24364B] dark:text-slate-300">
                              {r.reporter?.name || 'Member'}
                            </span>
                          </td>
                          <td className="py-3.5 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getPriorityPill(r.priority)}`}>
                              {r.priority}
                            </span>
                          </td>
                          <td className="py-3.5 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusPill(r.status)}`}>
                              {r.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-[#708096] dark:text-slate-400 text-[11px] whitespace-nowrap">
                            {new Date(r.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedReportId(r._id)}
                              className="btn-emerald !py-1.5 !px-3 !text-xs cursor-pointer active:scale-95"
                            >
                              Review
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards View */}
                <div className="md:hidden space-y-3">
                  {reports.map((r) => (
                    <div
                      key={r._id}
                      className="p-4 rounded-2xl bg-white dark:bg-[#0D1527] border border-[#E5EAE7] dark:border-slate-800 space-y-2.5 shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-black text-xs text-[#102B50] dark:text-white">
                          #{r.reportId}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${getPriorityPill(r.priority)}`}>
                            {r.priority}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${getStatusPill(r.status)}`}>
                            {r.status}
                          </span>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-extrabold text-[#102B50] dark:text-white">
                          {r.title || r.category}
                        </h4>
                        <p className="text-[11px] text-[#708096] dark:text-slate-400 line-clamp-2 mt-0.5">
                          {r.description || r.reason}
                        </p>
                      </div>

                      {r.screenshot && (
                        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-[#FAF9F5] dark:bg-[#070B16] border border-[#E5EAE7] dark:border-slate-800">
                          <img
                            src={r.screenshot}
                            alt="Screenshot"
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <span className="text-[10px] font-bold text-[#07866D] dark:text-emerald-400">
                            Screenshot Attached
                          </span>
                        </div>
                      )}

                      <div className="text-[11px] text-[#708096] dark:text-slate-400 space-y-0.5 border-t border-[#E5EAE7] dark:border-slate-800 pt-2">
                        <div>Reporter: <span className="text-[#24364B] dark:text-slate-300 font-semibold">{r.reporter?.name || 'Member'}</span></div>
                        <div>Submitted: {new Date(r.createdAt).toLocaleString()}</div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedReportId(r._id)}
                        className="btn-emerald w-full !py-2.5 !text-xs text-center cursor-pointer"
                      >
                        Review Issue Details
                      </button>
                    </div>
                  ))}
                </div>

                {/* Server-Side Pagination Controls */}
                {reportsTotalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t border-[#E5EAE7] dark:border-slate-800 text-xs">
                    <span className="text-[#708096] dark:text-slate-400 font-bold">
                      Page {reportsPage} of {reportsTotalPages}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={reportsPage <= 1}
                        onClick={() => fetchReports(reportsPage - 1)}
                        className="p-2 rounded-xl border border-[#E5EAE7] dark:border-slate-700 bg-white dark:bg-[#0E1526] text-[#24364B] dark:text-slate-300 disabled:opacity-30 cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={reportsPage >= reportsTotalPages}
                        onClick={() => fetchReports(reportsPage + 1)}
                        className="p-2 rounded-xl border border-[#E5EAE7] dark:border-slate-700 bg-white dark:bg-[#0E1526] text-[#24364B] dark:text-slate-300 disabled:opacity-30 cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: USER MANAGEMENT & SUSPENSION */}
      {/* ======================================================== */}
      {activeTab === 'users' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* User Filtering Controls */}
          <div className="card-clean p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#708096] dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') fetchUsers();
                }}
                placeholder="Search user by name, email, or Pakistani city..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#0D1527] border border-[#E5EAE7] dark:border-slate-700 text-xs outline-none focus:ring-2 focus:ring-[#07866D]/20 focus:border-[#07866D] font-medium text-[#102B50] dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={userFilterStatus}
                onChange={(e) => setUserFilterStatus(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white dark:bg-[#0D1527] border border-[#E5EAE7] dark:border-slate-700 text-xs font-bold text-[#102B50] dark:text-slate-200 cursor-pointer focus:ring-2 focus:ring-[#07866D]/20 focus:border-[#07866D]"
              >
                <option value="All">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="suspended">Suspended Only</option>
              </select>

              <select
                value={userFilterRole}
                onChange={(e) => setUserFilterRole(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white dark:bg-[#0D1527] border border-[#E5EAE7] dark:border-slate-700 text-xs font-bold text-[#102B50] dark:text-slate-200 cursor-pointer focus:ring-2 focus:ring-[#07866D]/20 focus:border-[#07866D]"
              >
                <option value="All">All Roles</option>
                <option value="user">Users</option>
                <option value="admin">Administrators</option>
              </select>
            </div>
          </div>

          {/* User List Table */}
          <div className="card-clean p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm sm:text-base text-[#102B50] dark:text-white font-display flex items-center gap-2">
                <Users className="w-5 h-5 text-[#07866D]" />
                <span>Learners Directory ({userList.length})</span>
              </h3>
            </div>

            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left text-xs min-w-[960px]">
                <thead className="border-b border-[#E5EAE7] dark:border-slate-800 text-[#708096] dark:text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-3">User</th>
                    <th className="py-3.5 px-3">Role</th>
                    <th className="py-3.5 px-3">City</th>
                    <th className="py-3.5 px-3">Teaching Skills</th>
                    <th className="py-3.5 px-3">Learning Skills</th>
                    <th className="py-3.5 px-3">Reports Submitted</th>
                    <th className="py-3.5 px-3">Account Status</th>
                    <th className="py-3.5 px-3">Joined</th>
                    <th className="py-3.5 px-3 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5EAE7]/70 dark:divide-slate-800/60 font-medium">
                  {userLoading ? (
                    <tr>
                      <td colSpan="9" className="py-12 text-center">
                        <div className="w-8 h-8 rounded-full border-4 border-[#07866D]/20 border-t-[#07866D] animate-spin mx-auto mb-2" />
                        <p className="text-xs font-bold text-[#708096] dark:text-slate-400 uppercase tracking-wider">
                          Loading student directory...
                        </p>
                      </td>
                    </tr>
                  ) : userList.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="py-12 text-center text-[#708096] dark:text-slate-400">
                        <Users className="w-8 h-8 text-[#708096] dark:text-slate-500 mx-auto mb-2 opacity-50" />
                        <p className="text-xs font-bold uppercase tracking-wider">No users found matching your criteria</p>
                      </td>
                    </tr>
                  ) : (
                    userList.map((u) => {
                      const isSysAdmin = u.role === 'admin';
                      const teachingCount = (u.profile?.teachingSkills || []).length;
                      const learningCount = (u.profile?.learningSkills || []).length;
                      const functionalRole = isSysAdmin ? 'Admin' : teachingCount > 0 ? 'Teacher' : 'Student';

                      return (
                        <tr key={u._id} className="hover:bg-[#FAF9F5]/80 dark:hover:bg-slate-800/40 transition-colors">
                          {/* USER COLUMN: Avatar, Name, Email */}
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedUserForDetails(u);
                                  setShowUserDetailModal(true);
                                }}
                                className="cursor-pointer transition-transform hover:scale-105 shrink-0"
                                title="Click to view complete details"
                              >
                                <UserAvatar user={u} size="sm" className="ring-1 ring-[#07866D]/30" />
                              </button>
                              <div className="min-w-0">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedUserForDetails(u);
                                    setShowUserDetailModal(true);
                                  }}
                                  className="font-extrabold text-[#102B50] dark:text-white flex items-center gap-1.5 hover:text-[#07866D] dark:hover:text-emerald-400 transition-colors text-left cursor-pointer group"
                                  title="Click to view complete user details"
                                >
                                  <span className="group-hover:underline truncate max-w-[150px] sm:max-w-[190px]">
                                    {u.name || 'Member'}
                                  </span>
                                  {String(u._id) === String(user?._id) && (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-[#EAF6EF] dark:bg-emerald-950/60 text-[#07866D] font-bold border border-[#07866D]/20">
                                      You
                                    </span>
                                  )}
                                </button>
                                <div
                                  className="text-[11px] text-[#708096] dark:text-slate-400 font-normal truncate max-w-[170px] sm:max-w-[210px]"
                                  title={u.email}
                                >
                                  {u.email || 'No email provided'}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* USER ROLE */}
                          <td className="py-3.5 px-3">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                isSysAdmin
                                  ? 'bg-[#EAF6EF] dark:bg-emerald-950/60 text-[#07866D] dark:text-emerald-400 border-[#07866D]/30'
                                  : teachingCount > 0
                                  ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 border-sky-500/30'
                                  : 'bg-[#FAF9F5] dark:bg-slate-800 text-[#708096] dark:text-slate-300 border border-[#E5EAE7] dark:border-slate-700'
                              }`}
                            >
                              {functionalRole}
                            </span>
                          </td>

                          {/* CITY */}
                          <td className="py-3.5 px-3 text-[#24364B] dark:text-slate-300 whitespace-nowrap">
                            <span className="flex items-center gap-1 text-[11px] font-semibold">
                              <MapPin className="w-3 h-3 text-[#07866D] shrink-0" />
                              <span>{u.profile?.city || 'Pakistan'}</span>
                            </span>
                          </td>

                          {/* TEACHING SKILLS */}
                          <td className="py-3.5 px-3 text-[#24364B] dark:text-slate-300">
                            <div className="flex flex-col gap-1 max-w-[180px]">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-extrabold text-[11px] text-[#102B50] dark:text-white">
                                  {teachingCount} skill{teachingCount === 1 ? '' : 's'}
                                </span>
                                {(u.profile?.teachingSkills || []).slice(0, 2).map((ts, i) => (
                                  <span
                                    key={i}
                                    className="text-[9px] px-1.5 py-0.5 rounded-md bg-[#EAF6EF] dark:bg-emerald-950/50 text-[#07866D] dark:text-emerald-400 font-bold border border-[#07866D]/20 truncate max-w-[90px]"
                                    title={ts.skill?.name}
                                  >
                                    {ts.skill?.name || 'Skill'}
                                  </span>
                                ))}
                                {teachingCount > 2 && (
                                  <span className="text-[9px] text-[#708096] dark:text-slate-400 font-bold">
                                    +{teachingCount - 2}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* LEARNING SKILLS / GOALS */}
                          <td className="py-3.5 px-3 text-[#24364B] dark:text-slate-300">
                            <div className="flex flex-col gap-1 max-w-[180px]">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-extrabold text-[11px] text-[#102B50] dark:text-white">
                                  {learningCount} goal{learningCount === 1 ? '' : 's'}
                                </span>
                                {(u.profile?.learningSkills || []).slice(0, 2).map((ls, i) => (
                                  <span
                                    key={i}
                                    className="text-[9px] px-1.5 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 font-bold border border-sky-500/20 truncate max-w-[90px]"
                                    title={ls.skill?.name}
                                  >
                                    {ls.skill?.name || 'Skill'}
                                  </span>
                                ))}
                                {learningCount > 2 && (
                                  <span className="text-[9px] text-[#708096] dark:text-slate-400 font-bold">
                                    +{learningCount - 2}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* TOTAL REPORTS SUBMITTED */}
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            {u.reportsSubmittedCount > 0 ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                                {u.reportsSubmittedCount} submitted
                              </span>
                            ) : (
                              <span className="text-[#708096] dark:text-slate-400 text-[11px]">0 submitted</span>
                            )}
                          </td>

                          {/* ACCOUNT STATUS */}
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                u.isSuspended
                                  ? 'bg-rose-50 dark:bg-rose-950/50 text-[#DC5555] dark:text-rose-400 border-[#DC5555]/30'
                                  : 'bg-[#EAF6EF] dark:bg-emerald-950/60 text-[#07866D] dark:text-emerald-400 border-[#07866D]/30'
                              }`}
                            >
                              {u.isSuspended ? 'Suspended' : 'Active'}
                            </span>
                          </td>

                          {/* REGISTRATION DATE */}
                          <td className="py-3.5 px-3 text-[#708096] dark:text-slate-400 text-[11px] whitespace-nowrap">
                            {formatDate(u.createdAt)}
                          </td>

                          {/* ACTIONS */}
                          <td className="py-3.5 px-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                              {/* View Details Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedUserForDetails(u);
                                  setShowUserDetailModal(true);
                                }}
                                className="btn-white !py-1 !px-2.5 !text-[11px] flex items-center gap-1 cursor-pointer hover:border-[#07866D] dark:hover:border-emerald-500 transition-colors"
                                title="View Complete User Details"
                              >
                                <Eye className="w-3.5 h-3.5 text-[#07866D] dark:text-emerald-400" />
                                <span>Details</span>
                              </button>

                              {/* Suspend / Reactivate Button */}
                              <button
                                type="button"
                                onClick={() => setSelectedUserForSuspension(u)}
                                className={`px-2.5 py-1 text-[11px] font-extrabold rounded-xl border transition-all cursor-pointer ${
                                  u.isSuspended
                                    ? 'bg-[#EAF6EF] dark:bg-emerald-950/40 hover:bg-[#EAF6EF]/80 text-[#07866D] dark:text-emerald-400 border-[#07866D]/30'
                                    : 'bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-[#DC5555] dark:text-rose-400 border-[#DC5555]/30'
                                }`}
                              >
                                {u.isSuspended ? 'Reactivate' : 'Suspend'}
                              </button>

                              {/* Role Toggle Button */}
                              <button
                                type="button"
                                onClick={() => handleRoleToggle(u._id, u.role)}
                                className="btn-white !py-1 !px-2.5 !text-[11px] cursor-pointer"
                              >
                                {u.role === 'admin' ? 'Demote' : 'Make Admin'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: AUDIT LOGS */}
      {/* ======================================================== */}
      {activeTab === 'audit' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="card-clean p-4 sm:p-5 flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#708096] dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={auditSearchTerm}
                onChange={(e) => setAuditSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') fetchAuditLogs(1);
                }}
                placeholder="Search audit trail by administrator, action, or target ID..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#0D1527] border border-[#E5EAE7] dark:border-slate-700 text-xs outline-none focus:ring-2 focus:ring-[#07866D]/20 focus:border-[#07866D] font-medium text-[#102B50] dark:text-white"
              />
            </div>

            <button
              onClick={() => fetchAuditLogs(1)}
              className="btn-white !py-2.5 !px-3.5 !text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Logs</span>
            </button>
          </div>

          <div className="card-clean p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm sm:text-base text-[#102B50] dark:text-white font-display flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#07866D]" />
                <span>Immutable Administrative Audit Trail</span>
              </h3>
            </div>

            {auditLogsLoading ? (
              <div className="py-20 text-center">
                <div className="w-10 h-10 rounded-full border-4 border-[#07866D]/20 border-t-[#07866D] animate-spin mx-auto mb-3" />
                <p className="text-xs font-bold text-[#708096] dark:text-slate-400 uppercase tracking-wider">Loading audit trail...</p>
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="py-16 text-center text-[#708096] dark:text-slate-400 text-xs italic">
                No administrative logs recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left text-xs min-w-[700px]">
                  <thead className="border-b border-[#E5EAE7] dark:border-slate-800 text-[#708096] dark:text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-3">Timestamp</th>
                      <th className="py-3 px-3">Administrator</th>
                      <th className="py-3 px-3">Action</th>
                      <th className="py-3 px-3">Target</th>
                      <th className="py-3 px-3">Details / Rationale</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5EAE7]/70 dark:divide-slate-800/60 font-medium">
                    {auditLogs.map((log) => (
                      <tr key={log._id} className="hover:bg-[#FAF9F5]/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-3 text-[#708096] dark:text-slate-400 text-[11px] whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="font-bold text-[#102B50] dark:text-white">
                            {log.adminName}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-[#EAF6EF] dark:bg-emerald-950/60 text-[#07866D] dark:text-emerald-400 border border-[#07866D]/20">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="text-[#24364B] dark:text-slate-300 font-mono text-[11px]">
                            {log.targetType} {log.targetId ? `(#${log.targetId})` : ''}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-[#24364B] dark:text-slate-300 max-w-xs break-words">
                          {log.details}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {auditLogsTotalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-[#E5EAE7] dark:border-slate-800 text-xs">
                <span className="text-[#708096] dark:text-slate-400 font-bold">
                  Page {auditLogsPage} of {auditLogsTotalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={auditLogsPage <= 1}
                    onClick={() => fetchAuditLogs(auditLogsPage - 1)}
                    className="p-2 rounded-xl border border-[#E5EAE7] dark:border-slate-700 bg-white dark:bg-[#0E1526] text-[#24364B] dark:text-slate-300 disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={auditLogsPage >= auditLogsTotalPages}
                    onClick={() => fetchAuditLogs(auditLogsPage + 1)}
                    className="p-2 rounded-xl border border-[#E5EAE7] dark:border-slate-700 bg-white dark:bg-[#0E1526] text-[#24364B] dark:text-slate-300 disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: SKILLS CATALOG TAXONOMY */}
      {/* ======================================================== */}
      {activeTab === 'skills' && (
        <div className="card-clean p-4 sm:p-6 sm:p-8 space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base md:text-lg font-extrabold text-[#102B50] dark:text-white font-display flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#07866D]" />
              <span>Pakistani Skill Taxonomy ({skillsList.length})</span>
            </h2>
            <button
              onClick={() => setShowAddSkill(true)}
              className="btn-emerald !py-2 !px-3.5 !text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Platform Skill</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {skillsList.map(s => (
              <div
                key={s._id}
                className="p-3.5 rounded-2xl bg-white dark:bg-[#0D1527] border border-[#E5EAE7] dark:border-slate-800 flex items-center justify-between shadow-2xs hover:border-[#07866D]/40 transition-colors"
              >
                <div className="min-w-0 pr-2">
                  <h4 className="font-extrabold text-xs text-[#102B50] dark:text-white truncate">{s.name}</h4>
                  <span className="text-[10px] text-[#708096] dark:text-slate-400 font-medium">{s.category}</span>
                </div>
                <button
                  onClick={() => handleDeleteSkill(s._id)}
                  className="p-2 text-[#708096] hover:text-[#DC5555] rounded-xl hover:bg-[#DC5555]/10 transition-colors cursor-pointer shrink-0"
                  title="Delete skill"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODALS */}
      {/* ======================================================== */}

      {/* 1. Report Detail Dossier Modal */}
      {selectedReportId && (
        <ReportDetailModal
          isOpen={Boolean(selectedReportId)}
          onClose={() => setSelectedReportId(null)}
          reportId={selectedReportId}
          administrators={administrators}
          onReportUpdated={() => {
            fetchReports(reportsPage);
            fetchStats();
            refreshPendingReportsCount();
          }}
        />
      )}

      {/* 2. User Suspension Safeguard Modal */}
      {selectedUserForSuspension && (
        <SuspendUserModal
          isOpen={Boolean(selectedUserForSuspension)}
          onClose={() => setSelectedUserForSuspension(null)}
          targetUser={selectedUserForSuspension}
          onSuccess={(updated) => {
            setUserList(prev =>
              prev.map(u => (u._id === updated._id ? { ...u, ...updated } : u))
            );
            setSelectedUserForDetails(prev =>
              prev?._id === updated._id ? { ...prev, ...updated } : prev
            );
            fetchStats();
            fetchReports(reportsPage);
            setNotificationMsg(`Account status updated for ${updated.name}`);
            setTimeout(() => setNotificationMsg(''), 4000);
          }}
        />
      )}

      {/* 3. Dedicated User Detail Dossier Modal */}
      {showUserDetailModal && selectedUserForDetails && (
        <UserDetailModal
          isOpen={showUserDetailModal}
          onClose={() => {
            setShowUserDetailModal(false);
            setSelectedUserForDetails(null);
          }}
          userId={selectedUserForDetails._id}
          initialUser={selectedUserForDetails}
          onOpenReport={(repId) => {
            setSelectedReportId(repId);
          }}
          onOpenSuspend={(targetU) => {
            setSelectedUserForSuspension(targetU);
          }}
          onRoleToggle={(targetUserId, currentRole) => {
            handleRoleToggle(targetUserId, currentRole);
            const newRole = currentRole === 'admin' ? 'user' : 'admin';
            setSelectedUserForDetails(prev =>
              prev?._id === targetUserId ? { ...prev, role: newRole } : prev
            );
          }}
        />
      )}

      {/* 3. Create Skill Modal */}
      {showAddSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 xs:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0E1526] border border-[#E5EAE7] dark:border-slate-800 rounded-3xl w-full max-w-md p-5 sm:p-7 max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain shadow-2xl relative text-[#24364B] dark:text-slate-100">
            <button
              onClick={() => setShowAddSkill(false)}
              className="absolute top-5 right-5 p-2 text-[#708096] hover:text-[#102B50] dark:hover:text-slate-200 rounded-full hover:bg-[#FAF9F5] dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-extrabold text-[#102B50] dark:text-white font-display mb-4">
              Add New Platform Skill
            </h3>

            <form onSubmit={handleCreateSkill} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#708096] dark:text-slate-400 mb-1.5">
                  Skill Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flutter Mobile Development"
                  value={skillName}
                  onChange={(e) => setSkillName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-[#0D1527] border border-[#E5EAE7] dark:border-slate-700 rounded-xl text-xs text-[#102B50] dark:text-white outline-none focus:ring-2 focus:ring-[#07866D]/20 focus:border-[#07866D] font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#708096] dark:text-slate-400 mb-1.5">
                  Category *
                </label>
                <select
                  value={skillCategory}
                  onChange={(e) => setSkillCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-[#0D1527] border border-[#E5EAE7] dark:border-slate-700 rounded-xl text-xs text-[#102B50] dark:text-white outline-none focus:ring-2 focus:ring-[#07866D]/20 focus:border-[#07866D] font-medium cursor-pointer"
                >
                  <option value="Software & Tech">Software & Tech</option>
                  <option value="Design & Creative">Design & Creative</option>
                  <option value="Language & Arts">Language & Arts</option>
                  <option value="Business & Freelancing">Business & Freelancing</option>
                  <option value="Academics & Science">Academics & Science</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#708096] dark:text-slate-400 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={skillDescription}
                  onChange={(e) => setSkillDescription(e.target.value)}
                  placeholder="Short summary of topics covered in this barter domain..."
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-[#0D1527] border border-[#E5EAE7] dark:border-slate-700 rounded-xl text-xs text-[#102B50] dark:text-white outline-none focus:ring-2 focus:ring-[#07866D]/20 focus:border-[#07866D] font-medium resize-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="popularCheck"
                  checked={skillPopular}
                  onChange={(e) => setSkillPopular(e.target.checked)}
                  className="rounded text-[#07866D] focus:ring-[#07866D] cursor-pointer"
                />
                <label htmlFor="popularCheck" className="text-xs font-semibold text-[#24364B] dark:text-slate-300 cursor-pointer">
                  Mark as Trending / Popular
                </label>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddSkill(false)}
                  className="btn-white flex-1 !py-2.5 !text-xs text-center cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={skillSubmitting}
                  className="btn-emerald flex-1 !py-2.5 !text-xs cursor-pointer active:scale-95"
                >
                  {skillSubmitting ? 'Creating...' : 'Create Skill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
