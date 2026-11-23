
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Member = {
  id: string;
  username: string;
  created_at: string;
  bezirk: string | null;
  geschlecht: string | null;
  age: number | null;
  avatar_url: string | null;
};

export default function CommunityPage() {
  const [username, setUsername] = useState("Wiener");
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState("Startseite");

  const [searchName, setSearchName] = useState("");
  const [district, setDistrict] = useState("");
  const [gender, setGender] = useState("");
  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");

  useEffect(() => {
    async function loadCommunity() {
      const { data: auth } = await supabase.auth.getUser();

      if (!auth.user) {
        window.location.href = "/";
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", auth.user.id)
        .maybeSingle();

      if (profile?.username) setUsername(profile.username);

      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, created_at, bezirk, geschlecht, age, avatar_url")
        .eq("is_approved", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Mitglieder konnten nicht geladen werden:", error);
      }

      setMembers(data || []);
      setLoading(false);
    }

    loadCommunity();
  }, []);

  const filteredMembers = members.filter((member) => {
    const nameMatch = (member.username || "")
      .toLowerCase()
      .includes(searchName.toLowerCase());

    const districtMatch =
      !district || member.bezirk === district;

    const genderMatch =
      !gender || member.geschlecht === gender;

    const minMatch =
      !minAge || (member.age !== null && member.age >= Number(minAge));

    const maxMatch =
      !maxAge || (member.age !== null && member.age <= Number(maxAge));

    return nameMatch && districtMatch && genderMatch && minMatch && maxMatch;
  });

  const menu = [
    ["⌂", "Startseite"],
    ["♧", "Wien entdecken"],
    ["♟", "Mitglieder"],
    ["✉", "Nachrichten"],
    ["♧", "Benachrichtigungen"],
    ["◎", "Mein Profil"],
  ];

  return (
    <main className="community">
      <style jsx global>{`
        * { box-sizing: border-box; }

        body {
          margin: 0;
          background: #090810;
          color: white;
          font-family: Arial, sans-serif;
        }

        .community {
          min-height: 100vh;
          background:
            radial-gradient(ellipse at 55% 0%, #40152f 0%, transparent 40%),
            #090810;
        }

        .layout {
          max-width: 1550px;
          margin: auto;
          display: grid;
          grid-template-columns: 245px minmax(0, 1fr) 290px;
          gap: 22px;
          padding: 24px;
        }

        .sidebar, .right-panel, .card {
          background: #15121e;
          border: 1px solid #34283b;
          border-radius: 18px;
        }

        .sidebar {
          padding: 23px 15px;
          min-height: calc(100vh - 48px);
          display: flex;
          flex-direction: column;
        }

        .logo {
          text-align: center;
          padding: 14px 0 35px;
        }

        .logo-symbol {
          width: 65px;
          height: 65px;
          margin: auto auto 12px;
          display: grid;
          place-items: center;
          border-radius: 20px;
          background: linear-gradient(135deg,#e91e55,#64144b);
          font-size: 35px;
          font-weight: 900;
          box-shadow: 0 0 30px #ed174755;
        }

        .logo h2 {
          margin: 0;
          font-size: 23px;
          letter-spacing: -1px;
        }

        .logo h2 span { color: #f12a5d; }

        .logo small {
          color: #a89bad;
          letter-spacing: 3px;
          font-size: 9px;
        }

        .menu-label {
          color: #83788d;
          font-size: 10px;
          letter-spacing: 2px;
          padding: 12px;
        }

        .menu-item {
          display: flex;
          gap: 13px;
          align-items: center;
          width: 100%;
          padding: 14px;
          margin: 3px 0;
          border: 0;
          border-radius: 11px;
          background: transparent;
          color: #c9c0d1;
          cursor: pointer;
          text-align: left;
          font-size: 14px;
        }

        .menu-item:hover, .menu-item.active {
          background: linear-gradient(100deg,#e91e55,#82153f);
          color: white;
        }

        .menu-icon { font-size: 20px; }

        .side-bottom {
          margin-top: auto;
          padding: 20px 10px 5px;
          color: #9e91a5;
          font-size: 12px;
          text-align: center;
        }

        .center { min-width: 0; }

        .topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 22px;
          gap: 12px;
        }

        .search {
          width: 65%;
          max-width: 430px;
          background: #17131f;
          color: white;
          border: 1px solid #3c3045;
          border-radius: 12px;
          padding: 14px 17px;
          outline: none;
        }

        .profile-chip {
          background: #211827;
          border: 1px solid #513347;
          padding: 12px 15px;
          border-radius: 12px;
          font-size: 13px;
        }

        .hero {
          min-height: 235px;
          padding: 30px;
          border-radius: 20px;
          border: 1px solid #63304d;
          background:
            linear-gradient(90deg,#100b18ee,#160c1ccc,#160b19aa),
            url("https://images.unsplash.com/photo-1516550893923-42d28e5677af?auto=format&fit=crop&w=1600&q=85")
            center/cover;
          display: flex;
          flex-direction: column;
          justify-content: center;
          margin-bottom: 22px;
        }

        .hero small {
          color: #ff6c91;
          letter-spacing: 3px;
          font-weight: bold;
        }

        .hero h1 {
          font-size: clamp(30px,4vw,43px);
          margin: 13px 0;
          letter-spacing: -1px;
        }

        .hero h1 span { color: #ff315f; }

        .hero p {
          color: #d0c4d3;
          margin: 0;
        }

        .card {
          padding: 20px;
          margin-bottom: 18px;
        }

        .card h3 {
          margin: 0 0 16px;
          font-size: 17px;
        }

        .welcome {
          font-size: 20px;
          margin-bottom: 18px;
        }

        .welcome span { color: #ff315f; }

        .composer {
          width: 100%;
          min-height: 90px;
          resize: vertical;
          border: 1px solid #413348;
          border-radius: 12px;
          padding: 15px;
          background: #0e0c15;
          color: white;
          font: inherit;
          outline: none;
        }

        .composer:focus { border-color: #e91e55; }

        .composer-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 13px;
          color: #a99caf;
          font-size: 12px;
        }

        .primary {
          border: 0;
          border-radius: 10px;
          background: linear-gradient(100deg,#ed2054,#a20c49);
          color: white;
          padding: 12px 19px;
          font-weight: bold;
          cursor: pointer;
        }

        .feed-placeholder {
          color: #aaa0b3;
          text-align: center;
          padding: 30px 10px;
          line-height: 1.7;
        }

        .right-panel {
          padding: 20px 15px;
          height: fit-content;
        }

        .right-panel h3 {
          margin: 0 0 17px;
          font-size: 16px;
        }

        .member {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 12px 0;
          border-bottom: 1px solid #302737;
        }

        .member:last-child { border: 0; }

        .avatar {
          width: 43px;
          height: 43px;
          flex-shrink: 0;
          border-radius: 50%;
          background: linear-gradient(135deg,#7a315e,#342044);
          display: grid;
          place-items: center;
          font-weight: bold;
          overflow: hidden;
        }

        .avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .member-name {
          font-size: 13px;
          font-weight: bold;
        }

        .member-date {
          color: #968b9e;
          font-size: 10px;
          margin-top: 4px;
        }

        .admin-link {
          display: block;
          text-decoration: none;
          color: #ff6689;
          border: 1px solid #693047;
          border-radius: 10px;
          padding: 12px;
          margin-top: 22px;
          text-align: center;
          font-size: 13px;
        }

        .admin-link:hover { background: #301426; }

        .filters {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .filter-input {
          width: 100%;
          min-width: 0;
          background: #0e0c15;
          border: 1px solid #413348;
          border-radius: 10px;
          padding: 13px;
          color: white;
          outline: none;
        }

        .filter-input:focus { border-color: #e91e55; }

        .filter-label {
          display: block;
          font-size: 11px;
          color: #b9aebe;
          margin-bottom: 7px;
        }

        .member-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
          gap: 14px;
        }

        .member-card {
          background: #0e0c15;
          border: 1px solid #392a40;
          border-radius: 14px;
          padding: 17px;
          text-align: center;
        }

        .big-avatar {
          width: 76px;
          height: 76px;
          border-radius: 50%;
          margin: 0 auto 12px;
          background: linear-gradient(135deg,#a32c67,#39204c);
          display: grid;
          place-items: center;
          font-size: 27px;
          font-weight: bold;
          overflow: hidden;
        }

        .big-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .member-card strong { font-size: 14px; }

        .member-info {
          color: #a99caf;
          font-size: 11px;
          margin-top: 7px;
          line-height: 1.6;
        }

        .empty {
          text-align: center;
          color: #aaa0b3;
          padding: 30px 10px;
        }

        @media(max-width:1100px) {
          .layout { grid-template-columns: 190px minmax(0,1fr); }
          .right-panel { grid-column: 2; }
        }

        @media(max-width:700px) {
          .layout {
            display: flex;
            flex-direction: column;
            padding: 12px;
          }
          .sidebar {
            min-height: auto;
            padding: 12px;
          }
          .logo { padding: 5px 0 15px; }
          .logo-symbol { width: 45px; height: 45px; font-size: 25px; }
          .menu-label, .side-bottom { display: none; }
          .sidebar nav {
            display: flex;
            overflow-x: auto;
          }
          .menu-item {
            flex-direction: column;
            min-width: 75px;
            gap: 5px;
            font-size: 10px;
          }
          .right-panel { order: 3; }
          .hero { min-height: 190px; padding: 20px; }
          .search { width: 100%; }
          .profile-chip { display: none; }
          .filters { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="layout">
        <aside className="sidebar">
          <div className="logo">
            <div className="logo-symbol">W</div>
            <h2>WIEN <span>CHAT</span></h2>
            <small>DEINE WIENER COMMUNITY</small>
          </div>

          <div className="menu-label">COMMUNITY</div>
          <nav>
            {menu.map(([icon, label]) => (
              <button
                key={label}
                className={`menu-item ${active === label ? "active" : ""}`}
                onClick={() => setActive(label)}
              >
                <span className="menu-icon">{icon}</span>
                {label}
              </button>
            ))}
          </nav>

          <div className="side-bottom">
            Wien verbindet.<br />
            Gemeinsam in Wien! ❤️
          </div>
        </aside>

        <section className="center">
          <div className="topbar">
            <input
              className="search"
              placeholder="⌕  WIEN CHAT durchsuchen..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
            <div className="profile-chip">♙ {username}</div>
          </div>

          <header className="hero">
            <small>WILLKOMMEN IN DER COMMUNITY</small>
            <h1>WIEN. <span>DEINE</span> STADT.</h1>
            <p>Entdecke Menschen, teile Erlebnisse und verbinde dich mit Wien.</p>
          </header>

          <div className="welcome">
            Willkommen zurück, <span>{username}</span>!
          </div>

          <section className="card">
            <h3>✎ Was gibt es Neues bei dir?</h3>
            <textarea
              className="composer"
              placeholder="Teile etwas mit der Wiener Community..."
            />
            <div className="composer-actions">
              <span>📷 Fotos · 💬 Community</span>
              <button className="primary" onClick={() => alert("Beiträge kommen als Nächstes!")}>
                Beitrag erstellen
              </button>
            </div>
          </section>

          <section className="card">
            <h3>♟ Mitglieder in Wien finden</h3>

            <div className="filters">
              <div>
                <label className="filter-label">Benutzername</label>
                <input
                  className="filter-input"
                  placeholder="Namen eingeben..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
              </div>

              <div>
                <label className="filter-label">Wiener Bezirk</label>
                <select
                  className="filter-input"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                >
                  <option value="">Alle Bezirke</option>
                  {Array.from({ length: 23 }, (_, i) => (
                    <option key={i + 1} value={`${i + 1}`}>
                      {i + 1}. Bezirk
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="filter-label">Geschlecht</label>
                <select
                  className="filter-input"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="">Alle</option>
                  <option value="Frau">Frau</option>
                  <option value="Mann">Mann</option>
                  <option value="Divers">Divers</option>
                </select>
              </div>

              <div>
                <label className="filter-label">Mindestalter</label>
                <input
                  className="filter-input"
                  type="number"
                  min="18"
                  placeholder="z. B. 18"
                  value={minAge}
                  onChange={(e) => setMinAge(e.target.value)}
                />
              </div>

              <div>
                <label className="filter-label">Höchstalter</label>
                <input
                  className="filter-input"
                  type="number"
                  min="18"
                  placeholder="z. B. 35"
                  value={maxAge}
                  onChange={(e) => setMaxAge(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", alignItems: "end" }}>
                <button
                  className="primary"
                  style={{ width: "100%" }}
                  onClick={() => {
                    setSearchName("");
                    setDistrict("");
                    setGender("");
                    setMinAge("");
                    setMaxAge("");
                  }}
                >
                  Filter zurücksetzen
                </button>
              </div>
            </div>
          </section>

          <section className="card">
            <h3>♟ Mitglieder ({filteredMembers.length})</h3>

            {loading && <p className="empty">Lade Mitglieder...</p>}

            {!loading && filteredMembers.length === 0 && (
              <p className="empty">
                Keine Mitglieder mit diesen Suchkriterien gefunden.
              </p>
            )}

            <div className="member-grid">
              {!loading && filteredMembers.map((member) => (
                <div className="member-card" key={member.id}>
                  <div className="big-avatar">
                    {member.avatar_url ? (
                      <img src={member.avatar_url} alt="Profilbild" />
                    ) : (
                      (member.username || "?").charAt(0).toUpperCase()
                    )}
                  </div>
                  <strong>{member.username}</strong>
                  <div className="member-info">
                    {member.bezirk ? `${member.bezirk}. Bezirk` : "Bezirk nicht angegeben"}
                    <br />
                    {member.age ? `${member.age} Jahre` : "Alter nicht angegeben"}
                    <br />
                    {member.geschlecht || "Keine Angabe"}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="card">
            <h3>▤ Community-Feed</h3>
            <div className="feed-placeholder">
              <div style={{ fontSize: 32 }}>💬</div>
              <strong>Hier entsteht dein WIEN CHAT Feed.</strong>
              <br />
              Bald kannst du Beiträge lesen, Fotos teilen und kommentieren.
            </div>
          </section>
        </section>

        <aside className="right-panel">
          <h3>♟ Neue Mitglieder</h3>

          {loading && <p style={{ color: "#aaa" }}>Lade Mitglieder...</p>}

          {!loading && members.slice(0, 8).map((member) => (
            <div className="member" key={member.id}>
              <div className="avatar">
                {member.avatar_url ? (
                  <img src={member.avatar_url} alt="Profilbild" />
                ) : (
                  (member.username || "?").charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <div className="member-name">{member.username}</div>
                <div className="member-date">
                  Registriert: {new Date(member.created_at).toLocaleDateString("de-AT")}
                </div>
              </div>
            </div>
          ))}

          <Link href="/admin" className="admin-link">
            ♛ Admin-Bereich öffnen
          </Link>
        </aside>
      </div>
    </main>
  );
}
