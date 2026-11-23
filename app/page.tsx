"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const router = useRouter();
  const [mode, setMode] = useState("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    setMessage("");

    try {
      if (!email || !password) {
        setMessage("Bitte E-Mail und Passwort eingeben.");
        return;
      }

      if (mode === "register") {
        if (!username.trim()) {
          setMessage("Bitte einen Benutzernamen eingeben.");
          return;
        }

const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { username },
    emailRedirectTo: "http://localhost:3000",
  },
});

        if (error) throw error;

        if (data.user && data.session) {
          const { error: profileError } = await supabase
            .from("profiles")
            .insert({
              id: data.user.id,
              username: username.trim(),
              is_approved: false,
            });

          if (profileError) throw profileError;

          setMessage("Registrierung erfolgreich! Dein Profil wartet auf Freischaltung.");
        } else {
          setMessage("Bitte bestätige zuerst deine E-Mail. Danach melde dich an.");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        const user = data.user;

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("username, is_approved")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) throw profileError;

        if (!profile) {
          const { error: insertError } = await supabase
            .from("profiles")
            .insert({
              id: user.id,
              username:
                user.user_metadata?.username || email.split("@")[0],
              is_approved: false,
            });

          if (insertError) throw insertError;

          setMessage("Dein Profil wurde angelegt und wartet auf Freischaltung.");
          return;
        }

        if (!profile.is_approved) {
          await supabase.auth.signOut();
          setMessage("Dein Konto wartet noch auf die Freischaltung durch den Admin.");
          return;
        }

router.push("/admin");      }
} catch (error: any) {
  console.log("GENAUER FEHLER:", error);
  setMessage(error.message || "Unbekannter Fehler");
} finally {
  setLoading(false);
}
}

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <h1 className="mb-3 text-center text-3xl font-black text-red-700">
          🇦🇹 WIEN CHAT
        </h1>

        <p className="mb-8 text-center text-gray-500">
          Deine Stadt. Deine Community.
        </p>

        <div className="mb-6 flex gap-3">
          <button
            onClick={() => setMode("register")}
            className={`flex-1 rounded-xl p-3 ${
              mode === "register"
                ? "bg-red-700 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            Registrieren
          </button>

          <button
            onClick={() => setMode("login")}
            className={`flex-1 rounded-xl p-3 ${
              mode === "login"
                ? "bg-red-700 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            Anmelden
          </button>
        </div>

        {mode === "register" && (
          <input
            className="mb-3 w-full rounded-xl border p-3"
            placeholder="Benutzername"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        )}

        <input
          type="email"
          className="mb-3 w-full rounded-xl border p-3"
          placeholder="E-Mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="mb-4 w-full rounded-xl border p-3"
          placeholder="Passwort (mindestens 6 Zeichen)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full rounded-xl bg-red-700 p-4 font-bold text-white disabled:opacity-50"
        >
          {loading
            ? "Bitte warten..."
            : mode === "register"
              ? "Konto erstellen"
              : "Anmelden"}
        </button>

        <p className="mt-5 text-center text-sm text-gray-600">
          {message}
        </p>
      </div>
    </main>
  );
}