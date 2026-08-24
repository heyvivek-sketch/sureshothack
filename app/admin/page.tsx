'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getToken } from '@/lib/storage';

interface UserRow {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isPremium: boolean;
  isVip: boolean;
  vipExpiresAt: string | null;
  createdAt: string;
  _count: { gameSessions: number };
}

interface Stats {
  totalUsers: number;
  premiumUsers: number;
  vipUsers: number;
  totalSessions: number;
  pendingSessions: number;
  completedSessions: number;
}

export default function AdminPage() {
  const { isLoading: authLoading } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    const token = getToken();
    if (!token) { setError('Please login first.'); setLoading(false); return; }
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };
      const [usersRes, statsRes] = await Promise.all([
        fetch('/api/admin/users', { headers }),
        fetch('/api/admin/stats', { headers }),
      ]);
      const usersJson = await usersRes.json();
      const statsJson = await statsRes.json();
      if (!usersRes.ok || !usersJson.success) throw new Error(usersJson.message || 'Admin access denied');
      setUsers(usersJson.users);
      if (statsJson.success) setStats(statsJson.stats);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load admin panel');
    } finally { setLoading(false); }
  };

  useEffect(() => { if (!authLoading) load(); }, [authLoading]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return users;
    return users.filter(u => `${u.fullName} ${u.email}`.toLowerCase().includes(q));
  }, [users, search]);

  const updateUser = async (userId: string, field: 'isVip' | 'isPremium' | 'role', value: boolean | string) => {
    const token = getToken();
    if (!token) return;
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, [field]: value }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) { setError(json.message || 'Update failed'); return; }
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...json.user } : u));
    load();
  };

  if (authLoading || loading) return <main className="min-h-screen bg-black text-white p-8"><div className="max-w-7xl mx-auto">Loading admin panel...</div></main>;

  if (error) return <main className="min-h-screen bg-black text-white p-8"><div className="max-w-xl mx-auto mt-20 rounded-2xl border border-red-500/30 bg-gray-950 p-8"><h1 className="text-2xl font-bold mb-3">Admin Panel</h1><p className="text-red-400">{error}</p><p className="text-gray-400 mt-4 text-sm">Your account must have role ADMIN in the users table.</p></div></main>;

  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div><p className="text-orange-400 text-sm font-semibold">SURESHOT HACK</p><h1 className="text-3xl font-bold">Admin Dashboard</h1><p className="text-gray-400 mt-1">Users, VIP/Premium status and game activity</p></div>
          <button onClick={load} className="rounded-lg bg-orange-500 px-5 py-2.5 font-semibold hover:bg-orange-600">Refresh</button>
        </header>

        <section className="grid grid-cols-2 lg:grid-cols-6 gap-3">
          {[['Users', stats?.totalUsers], ['Premium', stats?.premiumUsers], ['VIP', stats?.vipUsers], ['Sessions', stats?.totalSessions], ['Pending', stats?.pendingSessions], ['Completed', stats?.completedSessions]].map(([label, value]) => <div key={label as string} className="rounded-xl border border-gray-800 bg-gray-950 p-4"><p className="text-xs text-gray-400">{label}</p><p className="text-2xl font-bold mt-1">{value ?? 0}</p></div>)}
        </section>

        <section className="rounded-2xl border border-gray-800 bg-gray-950 overflow-hidden">
          <div className="p-4 border-b border-gray-800 flex flex-col md:flex-row gap-3 md:items-center md:justify-between"><h2 className="text-xl font-bold">Users</h2><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or email..." className="w-full md:w-80 rounded-lg bg-gray-900 border border-gray-700 px-4 py-2.5 outline-none focus:border-orange-500" /></div>
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-gray-900 text-gray-400"><tr><th className="text-left p-3">User</th><th className="text-left p-3">Role</th><th className="p-3">VIP</th><th className="p-3">Premium</th><th className="p-3">Sessions</th><th className="text-left p-3">Joined</th></tr></thead><tbody>{filtered.map(u => <tr key={u.id} className="border-t border-gray-800 hover:bg-gray-900/50"><td className="p-3"><div className="font-semibold">{u.fullName}</div><div className="text-gray-400 text-xs">{u.email}</div></td><td className="p-3"><select value={u.role} onChange={e => updateUser(u.id, 'role', e.target.value)} className="bg-gray-900 border border-gray-700 rounded px-2 py-1"><option value="USER">USER</option><option value="ADMIN">ADMIN</option></select></td><td className="p-3 text-center"><button onClick={() => updateUser(u.id, 'isVip', !u.isVip)} className={`px-3 py-1 rounded-full text-xs font-bold ${u.isVip ? 'bg-green-500/20 text-green-400' : 'bg-gray-800 text-gray-400'}`}>{u.isVip ? 'ON' : 'OFF'}</button></td><td className="p-3 text-center"><button onClick={() => updateUser(u.id, 'isPremium', !u.isPremium)} className={`px-3 py-1 rounded-full text-xs font-bold ${u.isPremium ? 'bg-orange-500/20 text-orange-400' : 'bg-gray-800 text-gray-400'}`}>{u.isPremium ? 'ON' : 'OFF'}</button></td><td className="p-3 text-center">{u._count.gameSessions}</td><td className="p-3 text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td></tr>)}</tbody></table></div>
          {!filtered.length && <div className="p-8 text-center text-gray-500">No users found.</div>}
        </section>
      </div>
    </main>
  );
}
