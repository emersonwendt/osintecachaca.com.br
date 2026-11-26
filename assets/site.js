/* ==== CONFIGURAÇÃO: preencha os links antes de publicar ==== */
const LINKS = {
  comunidade: "https://chat.whatsapp.com/HxN9vAmtJ0XDpnOLNYoBt0", // grupo da comunidade no WhatsApp (mesmo do QR Code)
  connection: "https://chat.whatsapp.com/Fzm0MPU8YWB0qA1JbPvsSe", // comunidade Osint Connection (O&C, OsintHunters, UaiSINT)
  whatsapp: "",    // grupo(s) das edições; vazio = usa o link da Comunidade
  linkedin: "https://www.linkedin.com/showcase/osintecacha%C3%A7a/", // página (showcase) no LinkedIn
  palestrante: "",  // formulário de proposta de charla (Google Forms)
  patrocinio: "",   // formulário ou e-mail de patrocínio; vazio = usa o e-mail abaixo
  email: "",        // ex.: "contato@osintecachaca.com.br"
};
// Destino dos formulários (FormSubmit). Depois da ativação, troque o e-mail pelo código aleatório
// que o FormSubmit envia (ex.: "a1b2c3d4e5...") para o endereço não aparecer no código do site.
const FORM_DESTINO = "osmosint1@gmail.com";
const RESERVA ="https://www.instagram.com/osintecachaca"; // usado quando um link está vazio
/* ========================================================== */

document.querySelectorAll("[data-link]").forEach((a) => {
  const tipo = a.dataset.link;
  let url = LINKS[tipo];
  if (tipo === "email") {
    const li = a.closest("[data-se]");
    if (!LINKS.email) { if (li) li.remove(); return; }
    a.href = "mailto:" + LINKS.email;
    a.textContent = LINKS.email;
    return;
  }
  if (!url && tipo === "linkedin") { a.removeAttribute("href"); return; } // fica só o nome até ter o link
  if (!url && tipo === "whatsapp") url = LINKS.comunidade;
  if (!url && tipo === "patrocinio" && LINKS.email) url = "mailto:" + LINKS.email + "?subject=Patroc%C3%ADnio%20Osint%20%26%20Cacha%C3%A7a";
  url = url || RESERVA;
  a.href = url;
  if (/^https?:/.test(url)) { a.target = "_blank"; a.rel = "noopener"; }
});

const btn = document.querySelector(".menu-btn");
const menu = document.getElementById("menu");
btn.addEventListener("click", () => {
  const aberto = menu.classList.toggle("aberto");
  btn.setAttribute("aria-expanded", aberto);
});
menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => {
  menu.classList.remove("aberto");
  btn.setAttribute("aria-expanded", "false");
}));

// Carrossel de posts do Instagram: carrega o script oficial só quando a seção se aproxima
const trilho = document.querySelector(".carrossel__trilho");
if (trilho) {
  document.querySelectorAll(".carrossel__btn").forEach((b) => b.addEventListener("click", () => {
    const passo = (trilho.querySelector(".post")?.offsetWidth || 340) + 18;
    trilho.scrollBy({ left: passo * Number(b.dataset.dir), behavior: "smooth" });
  }));
  const carregar = () => {
    if (window.instgrm) { window.instgrm.Embeds.process(); return; }
    const s = document.createElement("script");
    s.src = "https://www.instagram.com/embed.js";
    s.async = true;
    document.body.appendChild(s);
  };
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((ents) => {
      if (ents.some((e) => e.isIntersecting)) { carregar(); io.disconnect(); }
    }, { rootMargin: "600px" });
    io.observe(trilho);
  } else carregar();
}

// Formulários de charla e de apoio: envio por e-mail via FormSubmit, sem sair da página
document.querySelectorAll("form.form").forEach((f) => {
  const msg = f.querySelector(".form__msg");
  const btn = f.querySelector("button[type=submit]");
  f.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    msg.className = "form__msg";
    const grupo = f.querySelectorAll("input[name=Interesse]");
    const marcouInteresse = !grupo.length || [...grupo].some((c) => c.checked);
    if (!f.checkValidity() || !marcouInteresse) {
      msg.textContent = !marcouInteresse && f.checkValidity()
        ? "Marque pelo menos um interesse."
        : "Confira os campos obrigatórios (*) e o aceite.";
      msg.classList.add("erro");
      (f.querySelector(":invalid") || grupo[0])?.focus();
      return;
    }
    if (f.querySelector("[name=_honey]").value) return; // robô
    const dados = {};
    new FormData(f).forEach((v, k) => {
      if (k === "_honey") return;
      dados[k] = dados[k] ? dados[k] + ", " + v : v;
    });
    dados._subject = f.dataset.assunto;
    dados._template = "table";
    dados._captcha = "false";
    dados.Origem = "Site osintecachaca.com.br";
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
      msg.textContent = "Recebido! A organização vai responder no e-mail informado. Saúde! 🥃";
      msg.classList.add("ok");
    } catch (e) {
      msg.textContent = "Não foi possível enviar agora. Tente de novo em instantes ou chame no Instagram @osintecachaca.";
      msg.classList.add("erro");
    } finally {
      btn.disabled = false;
    }
  });
});

document.getElementById("ano").textContent = new Date().getFullYear();
