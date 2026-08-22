import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Users, Package, BarChart2, FolderTree, Leaf, Search, UserX, UserCheck, Shield } from "lucide-react";
import { toast } from "sonner";
import type { UserRole } from "@/types/database.types";

import { supabase } from "@/lib/supabase";

type UserStatus = "active" | "suspended";

function AdminSidebar({ active }: { active: string }) {
  const navigate = useNavigate();
  const links = [
    { icon: Users, label: "Users", path: "/admin/users" },
    { icon: Package, label: "Listings", path: "/admin/listings" },
    { icon: BarChart2, label: "Analytics", path: "/admin/analytics" },
    { icon: FolderTree, label: "Categories", path: "/admin/categories" },
  ];
  return (
    <aside className="w-[220px] flex-shrink-0">
      <div className="rounded-2xl p-4 sticky top-24" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 2px 16px rgba(46,125,50,0.07)" }}>
        <div className="flex items-center gap-2 px-3 py-2 mb-2">
          <Shield size={16} color="#6A1B9A" />
          <span className="font-bold text-sm" style={{ color: "#6A1B9A" }}>Admin Panel</span>
        </div>
        <p className="px-3 text-xs mb-4" style={{ color: "#90A4AE" }}>GreenCart Platform</p>
        <nav className="space-y-1">
          {links.map((l) => (
            <button key={l.path} onClick={() => navigate(l.path)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-left text-sm font-medium transition-all"
              style={{ backgroundColor: active === l.path ? "#F3E5F5" : "transparent", color: active === l.path ? "#6A1B9A" : "#607D8B" }}>
              <l.icon size={16} />{l.label}
            </button>
          ))}
        </nav>
        <div className="mt-4 pt-4" style={{ borderTop: "1px solid #E8F0E8" }}>
          <button onClick={() => navigate("/home")} className="text-xs px-3 py-2" style={{ color: "#90A4AE" }}>
            ← Back to Marketplace
          </button>
        </div>
      </div>
    </aside>
  );
}

export function AdminUsersPage() {
  const [users, setUsers] = useState<Array<{
    id: string;
    name: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    joined: string;
    orders: number;
    avatar: string;
  }>>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUsers() {
      setLoading(true);
      // Try to fetch users and their order counts
      const { data } = await supabase
        .from("profiles")
        .select(`
          id, role, display_name, created_at,
          orders!buyer_id(id)
        `);
      
      if (data) {
        const mapped = data.map((u: any) => ({
          id: u.id,
          name: u.display_name || "Unknown User",
          email: "hidden@privacy.eco", // Avoid real emails since auth table isn't fully queryable
          role: u.role as UserRole,
          status: "active" as UserStatus,
          joined: new Date(u.created_at).toLocaleDateString(),
          orders: u.orders ? u.orders.length : 0,
          avatar: (u.display_name || "UU").substring(0, 2).toUpperCase()
        }));
        setUsers(mapped);
      }
      setLoading(false);
    }
    loadUsers();
  }, []);

  const filtered = users.filter((u) => {
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const toggleSuspend = (id: string) => {
    // In database.types.ts, profiles doesn't have a status flag. 
    // This is simulated for demo UI
    setUsers((prev) => prev.map((u) => {
      if (u.id !== id) return u;
      const newStatus = u.status === "active" ? "suspended" : "active";
      toast.success(`User ${newStatus === "suspended" ? "suspended" : "reinstated"} successfully.`);
      return { ...u, status: newStatus };
    }));
  };

  const ROLE_COLORS: Record<UserRole, { bg: string; color: string }> = {
    buyer: { bg: "#E8F5E9", color: "#2E7D32" },
    seller: { bg: "#E3F2FD", color: "#1565C0" },
    admin: { bg: "#F3E5F5", color: "#6A1B9A" },
  };

  return (
    <div style={{ backgroundColor: "#F5F7F5", minHeight: "100vh" }}>
      <div style={{ backgroundColor: "#FFFFFF", borderBottom: "1px solid #E8F0E8" }} className="px-8 py-4 sticky top-0 z-40">
        <div className="max-w-[1440px] mx-auto flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#6A1B9A" }}>
            <Leaf size={16} color="#FFFFFF" />
          </div>
          <span className="font-bold" style={{ color: "#2E7D32" }}>GreenCart</span>
          <span className="text-sm" style={{ color: "#90A4AE" }}>/ Admin / Users</span>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-8 py-8">
        <div className="flex gap-6">
          <AdminSidebar active="/admin/users" />

          <main className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold" style={{ color: "#263238" }}>User Management</h1>
                <p className="text-sm" style={{ color: "#607D8B" }}>{users.length} total users · {users.filter((u) => u.status === "active").length} active</p>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: "Total Users", value: users.length, icon: "👥", bg: "#E8F5E9", col: "#2E7D32" },
                { label: "Active Sellers", value: users.filter((u) => u.role === "seller" && u.status === "active").length, icon: "🏪", bg: "#E3F2FD", col: "#1565C0" },
                { label: "Suspended", value: users.filter((u) => u.status === "suspended").length, icon: "🚫", bg: "#FFEBEE", col: "#C62828" },
              ].map((m) => (
                <div key={m.label} className="rounded-2xl p-5 flex items-center gap-4" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 2px 12px rgba(46,125,50,0.07)" }}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: m.bg }}>{m.icon}</div>
                  <div>
                    <p className="text-2xl font-bold" style={{ color: "#263238" }}>{m.value}</p>
                    <p className="text-xs" style={{ color: "#90A4AE" }}>{m.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="flex gap-3 mb-5">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#90A4AE" }} />
                <input type="text" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border outline-none text-sm"
                  style={{ borderColor: "#D1E8D1", backgroundColor: "#FFFFFF", color: "#263238" }} />
              </div>
              {["all", "buyer", "seller", "admin"].map((r) => (
                <button key={r} onClick={() => setRoleFilter(r as UserRole | "all")}
                  className="px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all"
                  style={{ backgroundColor: roleFilter === r ? "#6A1B9A" : "#FFFFFF", color: roleFilter === r ? "#FFFFFF" : "#607D8B", border: `1px solid ${roleFilter === r ? "#6A1B9A" : "#E8F0E8"}` }}>
                  {r === "all" ? "All Roles" : r}
                </button>
              ))}
            </div>

            {/* Table */}
            <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 2px 12px rgba(46,125,50,0.07)" }}>
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: "#F5F7F5", borderBottom: "1px solid #E8F0E8" }}>
                    {["User", "Role", "Orders", "Status", "Joined", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "#90A4AE" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} className="py-16 text-center text-sm text-gray-400">Loading users...</td></tr>
                  ) : filtered.map((u) => (
                    <tr key={u.id} className="border-b transition-colors hover:bg-gray-50" style={{ borderColor: "#F0F4F0" }}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ backgroundColor: u.status === "suspended" ? "#FFEBEE" : "#E8F5E9", color: u.status === "suspended" ? "#C62828" : "#2E7D32" }}>
                            {u.avatar}
                          </div>
                          <div>
                            <p className="font-medium text-sm" style={{ color: "#263238" }}>{u.name}</p>
                            <p className="text-xs" style={{ color: "#90A4AE" }}>{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold capitalize" style={{ backgroundColor: ROLE_COLORS[u.role].bg, color: ROLE_COLORS[u.role].color }}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium" style={{ color: "#263238" }}>{u.orders}</td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold capitalize" style={{ backgroundColor: u.status === "active" ? "#E8F5E9" : "#FFEBEE", color: u.status === "active" ? "#2E7D32" : "#C62828" }}>
                          {u.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: "#90A4AE" }}>{u.joined}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleSuspend(u.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
                          style={{
                            backgroundColor: u.status === "active" ? "#FFEBEE" : "#E8F5E9",
                            color: u.status === "active" ? "#C62828" : "#2E7D32",
                          }}
                        >
                          {u.status === "active" ? <><UserX size={12} /> Suspend</> : <><UserCheck size={12} /> Reinstate</>}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!loading && filtered.length === 0 && (
                <div className="py-16 text-center">
                  <Users size={40} color="#D1E8D1" className="mx-auto mb-3" />
                  <p style={{ color: "#90A4AE" }}>No users found.</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
