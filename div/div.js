// Digital Investigation Village — menu e formulário de proposta (FormSubmit, mesmo destino do site principal)
const FORM_DESTINO = "c9de17376398da4020c1bc30fc92c231";

const menuBtn = document.querySelector(".menu-btn");
const menu = document.getElementById("menu");
menuBtn.addEventListener("click", () => {
  const aberto = menu.classList.toggle("aberto");
  menuBtn.setAttribute("aria-expanded", String(aberto));
});
menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => {
  menu.classList.remove("aberto");
  menuBtn.setAttribute("aria-expanded", "false");
}));

// Deixa aberta a edição mais recente
const primeira = document.querySelector(".ed");
if (primeira) primeira.open = true;

document.querySelectorAll("form.form").forEach((f) => {
  const msg = f.querySelector(".form__msg");
  const btn = f.querySelector("button[type=submit]");
  f.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    msg.className = "form__msg";
    if (!f.checkValidity()) {
      msg.textContent = "Confira os campos obrigatórios (*) e o aceite.";
      msg.classList.add("erro");
      f.querySelector(":invalid")?.focus();
      return;
    }
    if (f.querySelector("[name=_honey]").value) return; // robô
    const dados = {};
    new FormData(f).forEach((v, k) => { if (k !== "_honey") dados[k] = v; });
    dados._subject = f.dataset.assunto;
    dados._template = "table";
    dados._captcha = "false";
    dados.Origem = "Site osintecachaca.com.br/div";
    btn.disabled = true;
    msg.textContent = "Enviando…";
    try {
      const r = await fetch("https://formsubmit.co/ajax/" + FORM_DESTINO, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(dados),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || String(j.success) === "false") throw new Error(j.message || r.status);
      f.reset();
      msg.textContent = "Proposta recebida! A curadoria vai responder no e-mail informado.";
      msg.classList.add("ok");
    } catch (e) {
      msg.textContent = "Não foi possível enviar agora. Tente de novo em instantes ou chame no Instagram @digitalinvestigationvillage.";
      msg.classList.add("erro");
    } finally {
      btn.disabled = false;
    }
  });
});

document.getElementById("ano").textContent = new Date().getFullYear();
