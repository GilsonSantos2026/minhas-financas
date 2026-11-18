/**
 * sw.js — Service worker: faz o app abrir e funcionar sem internet.
 *
 * - Arquivos do app (mesma origem): "rede primeiro" — online você sempre recebe a versão
 *   mais nova; offline, usa a cópia guardada.
 * - Bibliotecas (js/vendor/: SheetJS, PDF.js, OCR) e o núcleo/idioma do OCR
 *   (jsDelivr): "cache primeiro" — os nomes têm versão fixa, então a cópia guardada nunca
 *   fica velha. Trocar de versão = arquivo com nome novo.
 *
 * Ao publicar uma versão nova do app, troque VERSAO: o app mostra "Nova versão disponível".
 * Os DADOS não passam por aqui (ficam no LocalStorage do navegador).
 */
const VERSAO = '2026-11-18.3';
// Canal beta (…/beta/sw.js): caches com outro prefixo — um canal nunca apaga o cache do outro.
const BETA = self.location.pathname.includes('/beta/');
const PFX = BETA ? 'financas-beta' : 'financas';
const CACHE_APP = `${PFX}-app-${VERSAO}`;
const CACHE_CDN = `${PFX}-cdn-v1`;

const ARQUIVOS_APP = [
  './', './index.html', './privacidade.html', './termos.html', './manifest.webmanifest', './css/styles.css', './css/tailwind.css', './css/legal.css',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png', './icons/apple-touch-icon.png', './icons/favicon-32.png',
  './js/config.js', './js/canal.js','./js/tema.js', './js/icones.js', './js/membros.js', './js/educacao.js', './js/sugestoes.js', './js/ia.js', './js/seguranca/cofre.js', './js/sync/mesclar.js', './js/sync/drive.js', './js/pages/acesso.js',
  './js/storage.js', './js/parsers.js', './js/column-map.js', './js/importer.js', './js/format.js', './js/finance.js',
  './js/periodo.js', './js/analise.js', './js/ui.js', './js/charts.js', './js/privacidade.js', './js/avisos.js', './js/tour.js', './js/puxar.js', './js/saude.js', './js/router.js', './js/pwa.js', './js/components/convite-app.js', './js/novidades.js', './js/components/novidades.js', './js/app.js',
  './js/components/lancamento-form.js', './js/components/compra-form.js', './js/components/cartao-form.js', './js/components/categoria-form.js',
  './js/pages/dashboard.js', './js/pages/lancamentos.js', './js/pages/cartoes.js', './js/pages/importar-fatura.js',
  './js/pages/categorias.js', './js/pages/orcamento.js', './js/pages/relatorios.js', './js/pages/conciliacao.js', './js/pages/planilha.js', './js/pages/investimentos.js',
  './js/investimentos/cotacoes.js', './js/investimentos/carteira.js', './js/investimentos/reserva.js', './js/investimentos/formularios.js', './js/investimentos/nomad.js', './js/investimentos/rico.js', './js/investimentos/importar.js', './js/pages/mais.js', './js/demo.js', './js/pages/dados.js', './js/pages/configuracoes.js', './js/pages/educacao.js',
  './js/fatura/leitor.js', './js/fatura/importador.js',
];

// Bibliotecas do próprio site (js/vendor/, nome com versão → "cache primeiro").
// SheetJS é carregada sempre; as de PDF/OCR entram no cache no primeiro uso.
// (O Tailwind agora é CSS pré-gerado — css/tailwind.css, entre os arquivos do app.)
const CDN_ESSENCIAIS = [
  './js/vendor/xlsx-0.20.3.full.min.js',
];
const PASTA_VENDOR = '/js/vendor/';
// Só o núcleo do OCR e o idioma português ainda vêm de fora (rodam isolados no worker).
const HOSTS_CDN = ['cdn.jsdelivr.net', 'tessdata.projectnaptha.com'];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const app = await caches.open(CACHE_APP);
    // Um arquivo que falhe não impede a instalação dos demais.
    await Promise.all(ARQUIVOS_APP.map((u) => app.add(new Request(u, { cache: 'reload' })).catch(() => null)));
    const cdn = await caches.open(CACHE_CDN);
    await Promise.all(CDN_ESSENCIAIS.map(async (u) => {
      if (await cdn.match(u)) return;
      try { await cdn.put(u, await fetch(u, { mode: 'no-cors' })); } catch { /* offline na instalação */ }
    }));
  })());
  // Não ativa sozinho: o app pergunta antes (botão "Atualizar").
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const nomes = await caches.keys();
    await Promise.all(nomes.filter((n) => n.startsWith(`${PFX}-app-`) && n !== CACHE_APP).map((n) => caches.delete(n)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
  if (event.data === 'VERSAO') event.ports[0]?.postMessage(VERSAO); // mostrado nas notificações
});

async function redePrimeiro(req) {
  const cache = await caches.open(CACHE_APP);
  try {
    const controle = new AbortController();
    const timer = setTimeout(() => controle.abort(), 4000); // rede lenta → usa o cache
    // "no-cache": confirma com o servidor se há versão nova (o GitHub Pages deixa o
    // navegador reaproveitar arquivos por até 10 min, o que atrasaria as atualizações).
    const resp = await fetch(req, { signal: controle.signal, cache: 'no-cache' });
    clearTimeout(timer);
    if (resp.ok) cache.put(req, resp.clone());
    return resp;
  } catch {
    const salvo = await cache.match(req, { ignoreSearch: true });
    if (salvo) return salvo;
    if (req.mode === 'navigate') return (await cache.match('./index.html')) || Response.error();
    return Response.error();
  }
}

async function cachePrimeiro(req) {
  const cache = await caches.open(CACHE_CDN);
  const salvo = await cache.match(req, { ignoreVary: true });
  if (salvo) return salvo;
  const resp = await fetch(req);
  if (resp.ok || resp.type === 'opaque') cache.put(req, resp.clone());
  return resp;
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (!BETA && url.origin === self.location.origin && url.pathname.includes('/beta/')) return; // o beta tem o próprio SW
  if (url.origin === self.location.origin && url.pathname.includes(PASTA_VENDOR)) event.respondWith(cachePrimeiro(req));
  else if (url.origin === self.location.origin) event.respondWith(redePrimeiro(req));
  else if (HOSTS_CDN.includes(url.hostname)) event.respondWith(cachePrimeiro(req));
});
