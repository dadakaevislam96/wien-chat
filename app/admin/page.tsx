"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

type Member = {
  id: string;
  username: string;
  is_approved: boolean;
  created_at: string;
};

const VIENNA_MAP =
  "https://images.unsplash.com/photo-1516550893923-42d28e5677af?auto=format&fit=crop&w=2000&q=85";

export default function AdminPage() {
  const router = useRouter();

  const [users, setUsers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [adminName, setAdminName] = useState("Admin");
  const [activeTab, setActiveTab] = useState("dashboard");

  async function loadUsers() {
    setLoading(true);
    setMessage("");

    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      setMessage("Bitte zuerst anmelden.");
      setLoading(false);
      return;
    }

    const { data: admin, error: adminError } = await supabase
      .from("profiles")
      .select("is_admin, username")
      .eq("id", authData.user.id)
      .single();

    if (adminError || !admin?.is_admin) {
      setMessage("Zugriff verweigert. Nur Admins dürfen diese Seite öffnen.");
      setLoading(false);
      return;
    }

    setAdminName(admin.username || "Admin");

    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, is_approved, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
    } else {
      setUsers(data || []);
    }

    setLoading(false);
  }

  async function approveUser(id: string) {
    setMessage("");

    const { error } = await supabase
      .from("profiles")
      .update({ is_approved: true })
      .eq("id", id);

    if (error) {
      setMessage("Freischaltung fehlgeschlagen: " + error.message);
      return;
    }

    setMessage("Mitglied wurde freigeschaltet!");
    await loadUsers();
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(
    () =>
      users.filter((user) =>
        (user.username || "").toLowerCase().includes(search.toLowerCase())
      ),
    [users, search]
  );

  const approved = users.filter((u) => u.is_approved).length;
  const waiting = users.length - approved;

  const tabs = [
    { id: "dashboard", icon: "⌂", label: "Dashboard" },
    { id: "members", icon: "♟", label: "Mitglieder" },
    { id: "stats", icon: "▥", label: "Statistiken" },
    { id: "settings", icon: "⚙", label: "Einstellungen" },
  ];

  return (
    <main className="admin">
      <style jsx global>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: #090810; }

        .admin {
          min-height: 100vh;
          display: flex;
          color: #f8f5fa;
          font-family: Arial, sans-serif;
          background: #090810;
        }

        .sidebar {
          width: 250px;
          min-height: 100vh;
          flex-shrink: 0;
          padding: 25px 16px;
          background: linear-gradient(180deg,#190b19,#0b0a13);
          border-right: 1px solid #8e1740;
          display: flex;
          flex-direction: column;
        }

        .brand {
          text-align: center;
          padding: 15px 0 42px;
        }

        .brand-logo {
          width: 76px;
          height: 76px;
          margin: auto auto 13px;
          display: grid;
          place-items: center;
          border: 2px solid #ff2457;
          border-radius: 23px;
          transform: rotate(-5deg);
          background: linear-gradient(145deg,#4a102b,#160b20);
          box-shadow: 0 0 30px #ed174744;
          font-size: 43px;
          color: #ff315e;
        }

        .brand-name {
          font-size: 26px;
          font-weight: 900;
          letter-spacing: -1px;
        }

        .brand-name span { color: #f32353; }

        .brand-sub {
          font-size: 10px;
          color: #aaa0b3;
          letter-spacing: 3px;
          margin-top: 7px;
        }

        .nav-label {
          color: #8d8498;
          font-size: 10px;
          letter-spacing: 2px;
          padding: 12px 13px;
        }

        .nav-button {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 15px;
          margin: 4px 0;
          border: 0;
          border-radius: 12px;
          background: transparent;
          color: #c8c1d0;
          cursor: pointer;
          text-align: left;
          font-size: 14px;
          transition: .2s;
        }

        .nav-button:hover {
          background: #ffffff0c;
          color: white;
        }

        .nav-button.active {
          background: linear-gradient(100deg,#f21c4b,#92002f);
          color: white;
          box-shadow: 0 7px 22px #e900423d;
        }

        .nav-icon { font-size: 21px; width: 23px; text-align: center; }

        .side-bottom {
          margin-top: auto;
          text-align: center;
          color: #a99aaa;
          font-size: 14px;
          line-height: 1.8;
          font-style: italic;
          padding-top: 35px;
        }

        .main {
          flex: 1;
          min-width: 0;
          padding: 25px 30px;
          position: relative;
          overflow: hidden;
          background: #0b0911;
        }

        .map-background {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          background-image:
            linear-gradient(
              90deg,
              rgba(9, 8, 16, 0.48),
              rgba(9, 8, 16, 0.12),
              rgba(9, 8, 16, 0.48)
            ),
            linear-gradient(
              180deg,
              rgba(9, 8, 16, 0.12),
              rgba(9, 8, 16, 0.55)
            ),
            url("${VIENNA_MAP}");
          background-position: center;
          background-size: cover;
          background-repeat: no-repeat;
          opacity: 1;
          pointer-events: none;
        }

        .content {
          position: relative;
          z-index: 1;
          max-width: 1500px;
          margin: auto;
        }

        .topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 66px;
        }

        .breadcrumb { color: #aaa1b5; font-size: 13px; }

        .admin-pill {
          background: #191421dd;
          border: 1px solid #59405f;
          border-radius: 13px;
          padding: 12px 17px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
        }

        .online { color: #22d77d; }

        .hero h1 {
          font-size: clamp(27px,4vw,43px);
          margin: 0;
          font-weight: 900;
          letter-spacing: -1px;
        }

        .hero h1 span { color: #f31b4d; }
        .hero p { color: #c3bacb; font-size: 16px; }

        .red-line {
          width: 145px;
          height: 3px;
          margin: 22px 0 28px;
          background: linear-gradient(90deg,#f21c4b,transparent);
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(3,minmax(0,1fr));
          gap: 16px;
          margin-bottom: 27px;
        }

        .stat {
          background: linear-gradient(145deg,#211b29ef,#11101aef);
          border: 1px solid #423343;
          border-radius: 16px;
          padding: 22px;
          box-shadow: 0 12px 35px #0003;
        }

        .stat-icon { font-size: 27px; }
        .stat-label { color: #c7bdce; font-size: 13px; margin-top: 12px; }
        .stat-number { font-size: 36px; font-weight: 900; margin-top: 7px; }
        .green { color: #26d982; }
        .orange { color: #ff9d28; }
        .red { color: #fa3155; }

        .panel {
          background: linear-gradient(145deg,#1b1722ee,#100e17ee);
          border: 1px solid #443343;
          border-radius: 18px;
          padding: 20px;
          box-shadow: 0 15px 40px #0005;
          backdrop-filter: blur(8px);
        }

        .panel-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }

        .panel-head h2 { font-size: 21px; margin: 0; }

        .search {
          background: #100e17;
          border: 1px solid #55425d;
          color: white;
          padding: 12px 15px;
          border-radius: 10px;
          min-width: 230px;
          outline: none;
        }

        .search:focus { border-color: #ed2854; }

        .member {
          display: grid;
          grid-template-columns: minmax(130px,1.2fr) 1fr 1fr auto;
          align-items: center;
          gap: 13px;
          padding: 16px 10px;
          border-bottom: 1px solid #342c3a;
          font-size: 13px;
        }

        .member:last-child { border-bottom: 0; }

        .member-heading {
          background: #29232f;
          border-radius: 9px;
          color: #d4cbdc;
          font-weight: bold;
        }

        .username {
          display: flex;
          align-items: center;
          gap: 11px;
          font-weight: bold;
        }

        .avatar {
          width: 39px;
          height: 39px;
          border-radius: 50%;
          background: linear-gradient(135deg,#54365e,#21182f);
          display: grid;
          place-items: center;
          font-size: 17px;
        }

        .status {
          display: inline-block;
          border-radius: 20px;
          padding: 7px 11px;
          font-size: 11px;
          font-weight: bold;
          white-space: nowrap;
        }

        .approved { background: #075c2a; color: #6cff9e; }
        .waiting { background: #71400b; color: #ffd08a; }

        .action {
          border: 1px solid #19d77a;
          color: #36e68b;
          background: transparent;
          padding: 10px 12px;
          border-radius: 9px;
          cursor: pointer;
          font-weight: bold;
        }

        .action:hover { background: #075c2a; }

        .notice {
          background: #291421;
          border: 1px solid #a52b50;
          padding: 13px;
          border-radius: 10px;
          margin-bottom: 15px;
          color: #ffdce5;
        }

        .chart-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
          margin-top: 20px;
        }

        .chart-card {
          background: #17131e;
          border: 1px solid #3b3042;
          border-radius: 15px;
          padding: 22px;
        }

        .bar {
          height: 13px;
          background: #332b3a;
          border-radius: 20px;
          overflow: hidden;
          margin: 13px 0 20px;
        }

        .bar-fill {
          height: 100%;
          background: linear-gradient(90deg,#f21c4b,#ff875d);
          border-radius: 20px;
        }

        .settings-row {
          padding: 17px 0;
          border-bottom: 1px solid #332b3a;
          color: #d5ccdc;
        }

        .footer {
          text-align: center;
          color: #a69cad;
          border-top: 1px solid #6f1732;
          padding: 23px 0;
          margin-top: 45px;
          font-size: 12px;
        }

        @media(max-width:850px) {
          .sidebar { width: 75px; padding: 15px 8px; }
          .brand-name,.brand-sub,.nav-label,.side-bottom { display: none; }
          .brand { padding: 12px 0 30px; }
          .brand-logo { width: 49px; height: 49px; font-size: 27px; }
          .nav-button { justify-content: center; padding: 15px 5px; }
          .nav-icon { width: auto; }
          .main { padding: 17px 12px; }
          .topbar { margin-bottom: 42px; }
          .stats { grid-template-columns: 1fr; }
          .member { grid-template-columns: 1fr 1fr; }
          .member-heading { display: none; }
          .chart-row { grid-template-columns: 1fr; }
          .map-background { width: 100%; }
        }

        @media(max-width:450px) {
          .admin-pill { padding: 9px; }
          .breadcrumb { font-size: 11px; }
          .search { min-width: 100%; }
          .panel { padding: 13px; }
        }
      `}</style>

      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">W</div>
          <div className="brand-name">WIEN <span>CHAT</span></div>
          <div className="brand-sub">DIE WIENER COMMUNITY</div>
        </div>

        <div className="nav-label">MENÜ</div>

        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`nav-button ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="nav-icon">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}

        <div className="nav-label">KONTO</div>
        <button className="nav-button" onClick={logout}>
          <span className="nav-icon">⇥</span>
          <span>Logout</span>
        </button>

        <div className="side-bottom">
          Wien verbindet.<br />
          Gemeinsam in Wien!
        </div>
      </aside>

      <section className="main">
        <div className="map-background" />

        <div className="content">
          <div className="topbar">
            <div className="breadcrumb">WIEN CHAT / ADMIN CENTER</div>
            <div className="admin-pill">
              ♛ {adminName} <span className="online">●</span>
            </div>
          </div>

          <header className="hero">
            <h1><span>♛</span> WIEN CHAT – ADMIN</h1>
            <p>Deine Community. Deine Stadt. Deine Kontrolle.</p>
            <div className="red-line" />
          </header>

          {message && <div className="notice">{message}</div>}

          {activeTab === "dashboard" && (
            <>
              <div className="stats">
                <div className="stat">
                  <div className="stat-icon">♟</div>
                  <div className="stat-label">Gesamtmitglieder</div>
                  <div className="stat-number">{users.length}</div>
                </div>
                <div className="stat">
                  <div className="stat-icon orange">◷</div>
                  <div className="stat-label">Warten auf Freigabe</div>
                  <div className="stat-number orange">{waiting}</div>
                </div>
                <div className="stat">
                  <div className="stat-icon green">⬟</div>
                  <div className="stat-label">Aktive Mitglieder</div>
                  <div className="stat-number green">{approved}</div>
                </div>
              </div>

              <section className="panel">
                <div className="panel-head">
                  <h2>♟ Neueste Mitglieder</h2>
                  <button className="action" onClick={() => setActiveTab("members")}>
                    Alle Mitglieder →
                  </button>
                </div>

                {loading && <p>Lade Mitglieder...</p>}

                {!loading && users.slice(0, 5).map((user) => (
                  <div className="member" key={user.id}>
                    <div className="username">
                      <div className="avatar">
                        {(user.username || "?").charAt(0).toUpperCase()}
                      </div>
                      {user.username}
                    </div>
                    <div>
                      <span className={`status ${user.is_approved ? "approved" : "waiting"}`}>
                        {user.is_approved ? "✓ Freigeschaltet" : "◷ Wartet"}
                      </span>
                    </div>
                    <div>{new Date(user.created_at).toLocaleDateString("de-AT")}</div>
                    <div>
                      {!user.is_approved && (
                        <button className="action" onClick={() => approveUser(user.id)}>
                          Freischalten
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </section>
            </>
          )}

          {activeTab === "members" && (
            <section className="panel">
              <div className="panel-head">
                <h2>♟ Mitglieder verwalten</h2>
                <input
                  className="search"
                  placeholder="Username suchen..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {loading && <p>Lade Mitglieder...</p>}

              {!loading && (
                <>
                  <div className="member member-heading">
                    <div>Username</div>
                    <div>Status</div>
                    <div>Registriert am</div>
                    <div>Aktionen</div>
                  </div>

                  {filteredUsers.map((user) => (
                    <div className="member" key={user.id}>
                      <div className="username">
                        <div className="avatar">
                          {(user.username || "?").charAt(0).toUpperCase()}
                        </div>
                        {user.username}
                      </div>
                      <div>
                        <span className={`status ${user.is_approved ? "approved" : "waiting"}`}>
                          {user.is_approved ? "✓ Freigeschaltet" : "◷ Wartet"}
                        </span>
                      </div>
                      <div>{new Date(user.created_at).toLocaleDateString("de-AT")}</div>
                      <div>
                        {!user.is_approved && (
                          <button className="action" onClick={() => approveUser(user.id)}>
                            ✓ Freischalten
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {filteredUsers.length === 0 && <p>Keine Mitglieder gefunden.</p>}
                </>
              )}
            </section>
          )}

          {activeTab === "stats" && (
            <>
              <div className="stats">
                <div className="stat">
                  <div className="stat-icon">♟</div>
                  <div className="stat-label">Alle Mitglieder</div>
                  <div className="stat-number">{users.length}</div>
                </div>
                <div className="stat">
                  <div className="stat-icon green">✓</div>
                  <div className="stat-label">Freigeschaltet</div>
                  <div className="stat-number green">{approved}</div>
                </div>
                <div className="stat">
                  <div className="stat-icon orange">◷</div>
                  <div className="stat-label">Offene Anfragen</div>
                  <div className="stat-number orange">{waiting}</div>
                </div>
              </div>

              <div className="chart-row">
                <div className="chart-card">
                  <h3>Mitgliederstatus</h3>
                  <p>Freigeschaltet: {approved}</p>
                  <div className="bar">
                    <div
                      className="bar-fill"
                      style={{ width: `${users.length ? approved / users.length * 100 : 0}%` }}
                    />
                  </div>
                  <p>Warten auf Freigabe: {waiting}</p>
                  <div className="bar">
                    <div
                      className="bar-fill"
                      style={{
                        width: `${users.length ? waiting / users.length * 100 : 0}%`,
                        background: "linear-gradient(90deg,#ff9d28,#ffd080)"
                      }}
                    />
                  </div>
                </div>

                <div className="chart-card">
                  <h3>WIEN CHAT Community</h3>
                  <div className="stat-number">{users.length}</div>
                  <p>Registrierte Profile insgesamt</p>
                  <p className="green">{approved} aktive Freigaben</p>
                  <p className="orange">{waiting} offene Freigaben</p>
                </div>
              </div>
            </>
          )}

          {activeTab === "settings" && (
            <section className="panel">
              <h2>⚙ Admin-Einstellungen</h2>
              <div className="settings-row">
                <strong>Projekt:</strong> WIEN CHAT
              </div>
              <div className="settings-row">
                <strong>Angemeldet als:</strong> {adminName}
              </div>
              <div className="settings-row">
                <strong>Mitglieder insgesamt:</strong> {users.length}
              </div>
              <div className="settings-row">
                <strong>Hintergrund:</strong> Wien Panorama
              </div>
              <div className="settings-row">
                <strong>Kontoverwaltung:</strong> Supabase Authentication
              </div>
              <button className="action" onClick={loadUsers}>
                Daten neu laden
              </button>
            </section>
          )}

          <footer className="footer">
            ♢ WIEN CHAT – Sicher. Stark. Gemeinsam. ❤️ Wien
            <br />
            Wien Panorama
          </footer>
        </div>
      </section>
    </main>
  );
}