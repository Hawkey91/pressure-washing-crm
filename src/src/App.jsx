import React, { useEffect, useState } from "react";

const pricing = { driveway: 0.18, house: 0.22, deck: 0.25, roof: 0.35 };
const serviceLabels = { driveway: "Driveway", house: "House", deck: "Deck", roof: "Roof" };

const styles = {
  page: { minHeight: "100dvh", background: "#f4f4f0", padding: "16px" },
  card: { background: "#fff", borderRadius: 16, padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", marginBottom: 12 },
  h1: { fontSize: 22, fontWeight: 600, marginBottom: 4 },
  label: { fontSize: 12, color: "#888", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6, display: "block" },
  input: { width: "100%", padding: "11px 14px", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 15, fontFamily: "inherit", outline: "none", marginBottom: 10, background: "#fff" },
  select: { width: "100%", padding: "11px 14px", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 15, fontFamily: "inherit", outline: "none", marginBottom: 10, background: "#fff", appearance: "none" },
  quoteBox: { background: "#1a1a1a", color: "#fff", borderRadius: 14, padding: "20px 16px", textAlign: "center", margin: "16px 0" },
  btnPrimary: { width: "100%", padding: "13px", background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: "pointer", marginBottom: 8, fontFamily: "inherit" },
  btnSecondary: { width: "100%", padding: "13px", background: "#fff", color: "#1a1a1a", border: "1.5px solid #e0e0e0", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: "pointer", marginBottom: 8, fontFamily: "inherit" },
  btnSuccess: { width: "100%", padding: "13px", background: "#1D9E75", color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: "pointer", marginBottom: 8, fontFamily: "inherit" },
  btnDanger: { width: "100%", padding: "13px", background: "#E24B4A", color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: "pointer", marginBottom: 8, fontFamily: "inherit" },
  topbar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  backBtn: { padding: "7px 14px", background: "#fff", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 14, cursor: "pointer", fontFamily: "inherit" },
  statGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 },
  statCard: { background: "#f4f4f0", borderRadius: 12, padding: "14px 12px" },
  statVal: { fontSize: 24, fontWeight: 600 },
  statLabel: { fontSize: 12, color: "#888", marginTop: 2 },
  quoteItem: { background: "#fff", borderRadius: 12, padding: "14px 16px", marginBottom: 8, boxShadow: "0 1px 2px rgba(0,0,0,0.06)" },
  badge: { display: "inline-block", fontSize: 11, padding: "3px 9px", borderRadius: 99, marginTop: 6, fontWeight: 500 },
  toast: { position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "#1a1a1a", color: "#fff", padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 500, zIndex: 999, whiteSpace: "nowrap" },
  linkBox: { background: "#f4f4f0", borderRadius: 10, padding: "10px 12px", fontSize: 12, color: "#555", wordBreak: "break-all", marginTop: 10, fontFamily: "monospace", lineHeight: 1.6 },
};

const badgeStyle = (status) => {
  const map = {
    draft: { background: "#f0f0f0", color: "#666" },
    accepted: { background: "#e6f5ef", color: "#1D6B4A" },
    declined: { background: "#fdeaea", color: "#A32D2D" },
    changes: { background: "#fef3e2", color: "#854F0B" },
  };
  return { ...styles.badge, ...(map[status] || map.draft) };
};

export default function App() {
  const [view, setView] = useState("builder");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [service, setService] = useState("driveway");
  const [sqft, setSqft] = useState(1000);
  const [quotes, setQuotes] = useState([]);
  const [quoteData, setQuoteData] = useState(null);
  const [showLink, setShowLink] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");
  const [toast, setToast] = useState(null);

  const estimate = (sqft * pricing[service]).toFixed(2);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("pw_quotes") || "[]");
    setQuotes(saved);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get("quote");
    if (encoded) {
      try {
        const data = JSON.parse(atob(encoded));
        setQuoteData(data);
        setView("customer");
      } catch (e) {}
    }
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const saveQuote = () => {
    const q = { id: Date.now(), name, phone, address, service, sqft, estimate, status: "draft" };
    const updated = [q, ...quotes];
    setQuotes(updated);
    localStorage.setItem("pw_quotes", JSON.stringify(updated));
    showToast("Quote saved ✓");
  };

  const makeLink = () => {
    const data = { name, phone, address, service, sqft, estimate };
    const encoded = btoa(JSON.stringify(data));
    return `${window.location.origin}${window.location.pathname}?quote=${encoded}`;
  };

  const handleGenerateLink = () => {
    setGeneratedLink(makeLink());
    setShowLink(true);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      showToast("Link copied!");
    } catch {
      showToast("Copy the link above");
    }
  };

  const updateQuoteStatus = (status) => {
    if (!quoteData) return;
    const updated = quotes.map(q => q.phone === quoteData.phone ? { ...q, status } : q);
    setQuotes(updated);
    localStorage.setItem("pw_quotes", JSON.stringify(updated));
  };

  if (view === "customer" && quoteData) {
    return (
      <div style={{ ...styles.page, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {toast && <div style={styles.toast}>{toast}</div>}
        <div style={{ width: "100%", maxWidth: 420 }}>
          <div style={styles.card}>
            <div style={{ textAlign: "center", padding: "8px 0 20px" }}>
              <div style={{ fontSize: 13, color: "#888", marginBottom: 8 }}>{quoteData.address}</div>
              <div style={{ fontSize: 13, color: "#aaa", marginBottom: 12 }}>{serviceLabels[quoteData.service]} · {quoteData.sqft} sqft</div>
              <div style={{ fontSize: 52, fontWeight: 700, lineHeight: 1 }}>${quoteData.estimate}</div>
              <div style={{ fontSize: 13, color: "#aaa", marginTop: 6 }}>Estimated total</div>
            </div>
            <button style={styles.btnSuccess} onClick={() => { updateQuoteStatus("accepted"); showToast("Quote accepted!"); }}>✓ Accept Quote</button>
            <button style={styles.btnDanger} onClick={() => { updateQuoteStatus("declined"); showToast("Declined."); }}>✕ Decline</button>
            <button style={styles.btnSecondary} onClick={() => { updateQuoteStatus("changes"); showToast("Changes requested."); }}>✎ Request Changes</button>
          </div>
        </div>
      </div>
    );
  }

  if (view === "dashboard") {
    const accepted = quotes.filter(q => q.status === "accepted").length;
    const revenue = quotes.filter(q => q.status === "accepted").reduce((s, q) => s + parseFloat(q.estimate), 0);
    return (
      <div style={styles.page}>
        {toast && <div style={styles.toast}>{toast}</div>}
        <div style={styles.topbar}>
          <div style={styles.h1}>Dashboard</div>
          <button style={styles.backBtn} onClick={() => setView("builder")}>+ New Quote</button>
        </div>
        <div style={styles.statGrid}>
          <div style={styles.statCard}><div style={styles.statVal}>{quotes.length}</div><div style={styles.statLabel}>Total quotes</div></div>
          <div style={styles.statCard}><div style={styles.statVal}>{accepted}</div><div style={styles.statLabel}>Accepted</div></div>
          <div style={styles.statCard}><div style={styles.statVal}>{quotes.filter(q => q.status === "draft").length}</div><div style={styles.statLabel}>Pending</div></div>
          <div style={styles.statCard}><div style={{ ...styles.statVal, fontSize: 20 }}>${revenue.toFixed(0)}</div><div style={styles.statLabel}>Revenue</div></div>
        </div>
        {quotes.length === 0 ? (
          <div style={{ textAlign: "center", color: "#aaa", padding: "40px 0", fontSize: 14 }}>No quotes yet. Create one!</div>
        ) : quotes.map(q => (
          <div key={q.id} style={styles.quoteItem}>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{q.name || "Unnamed"}</div>
            <div style={{ fontSize: 13, color: "#777", marginTop: 2 }}>{q.address || "No address"}</div>
            <div style={{ fontSize: 13, color: "#777" }}>{serviceLabels[q.service]} · {q.sqft} sqft · ${q.estimate}</div>
            <span style={badgeStyle(q.status)}>{q.status.charAt(0).toUpperCase() + q.status.slice(1)}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {toast && <div style={styles.toast}>{toast}</div>}
      <div style={styles.topbar}>
        <div style={styles.h1}>New Quote</div>
        <button style={styles.backBtn} onClick={() => setView("dashboard")}>📋 CRM</button>
      </div>
      <div style={styles.card}>
        <span style={styles.label}>Customer info</span>
        <input style={styles.input} placeholder="Full name" value={name} onChange={e => setName(e.target.value)} />
        <input style={styles.input} placeholder="Phone number" value={phone} onChange={e => setPhone(e.target.value)} />
        <input style={styles.input} placeholder="Property address" value={address} onChange={e => setAddress(e.target.value)} />
        <span style={styles.label}>Service type</span>
        <select style={styles.select} value={service} onChange={e => setService(e.target.value)}>
          <option value="driveway">Driveway — $0.18/sqft</option>
          <option value="house">House — $0.22/sqft</option>
          <option value="deck">Deck — $0.25/sqft</option>
          <option value="roof">Roof — $0.35/sqft</option>
        </select>
        <span style={styles.label}>Square footage</span>
        <input style={styles.input} type="number" value={sqft} onChange={e => setSqft(Number(e.target.value))} />
        <div style={styles.quoteBox}>
          <div style={{ fontSize: 12, opacity: 0.5, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>Estimated total</div>
          <div style={{ fontSize: 48, fontWeight: 700, lineHeight: 1 }}>${estimate}</div>
          <div style={{ fontSize: 12, opacity: 0.4, marginTop: 6 }}>{serviceLabels[service]} · {sqft} sqft</div>
        </div>
        <button style={styles.btnPrimary} onClick={saveQuote}>Save Quote</button>
        <button style={styles.btnSecondary} onClick={handleGenerateLink}>🔗 Generate Share Link</button>
        {showLink && (
          <>
            <div style={styles.linkBox}>{generatedLink}</div>
            <button style={{ ...styles.btnSecondary, marginTop: 8 }} onClick={copyLink}>Copy Link</button>
          </>
        )}
      </div>
    </div>
  );
}
