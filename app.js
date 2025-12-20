:root{
  --bg:#f6f7fb;
  --card:#fff;
  --text:#111;
  --muted:#666;
  --border:#e6e6ef;
  --accent:#0a7a2a;
}

*{box-sizing:border-box}
body{margin:0;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial;background:var(--bg);color:var(--text)}
.wrap{max-width:1100px;margin:0 auto;padding:14px 16px}
.header{background:#fff;border-bottom:1px solid var(--border);position:sticky;top:0;z-index:10}
.row{display:flex;gap:12px;align-items:center}
.space{justify-content:space-between}
.brand-title{font-weight:800;font-size:20px}
.brand-sub{font-size:12px;color:var(--muted)}
.meta{margin-left:auto;display:flex;gap:8px;align-items:center}
.pill{padding:6px 10px;border:1px solid var(--border);border-radius:999px;background:#fff;font-size:12px}
.cartBtn{padding:9px 12px;border:0;border-radius:999px;background:#ff7a00;color:#fff;font-weight:700;cursor:pointer}
.grid{display:grid;grid-template-columns:1.35fr .65fr;gap:16px}
@media(max-width:980px){.grid{grid-template-columns:1fr}}
.card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:14px}
.stack{display:flex;flex-direction:column;gap:10px}
.tabs{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0}
.tab{padding:8px 10px;border-radius:999px;border:1px solid var(--border);background:#fff;cursor:pointer;font-size:13px}
.tab.active{border-color:#111}
.products{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
@media(max-width:980px){.products{grid-template-columns:repeat(2,1fr)}}
@media(max-width:560px){.products{grid-template-columns:1fr}}
.prod{border:1px solid var(--border);border-radius:14px;padding:12px;background:#fff}
.prod h3{margin:0 0 6px 0;font-size:15px}
.muted{color:var(--muted)}
.small{font-size:12px}
.price{font-weight:800;margin-top:8px}
.btnRow{display:flex;gap:8px;margin-top:10px}
.btn{flex:1;padding:9px 10px;border-radius:10px;border:1px solid var(--border);background:#fff;cursor:pointer}
.btn.primary{background:#111;color:#fff;border-color:#111}
.cartPanel{position:sticky;top:78px;height:fit-content}
.linkBtn{border:0;background:transparent;color:#0b5cff;cursor:pointer}
.input{width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:10px}
.label{font-size:12px;color:var(--muted)}
.primary{padding:11px 12px;border:0;border-radius:12px;background:var(--accent);color:#fff;font-weight:800;cursor:pointer}
.totals .grand{font-size:16px}
.footer{padding:18px 0}
hr{border:0;border-top:1px solid var(--border);margin:14px 0}
