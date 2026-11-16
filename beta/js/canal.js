/**
 * canal.js — Produção ou canal beta (carrega antes de tudo, no <head>).
 *
 * O beta é a mesma versão do app publicada em …/minhas-financas/beta/ (publicar.ps1 -Beta),
 * para testar novidades antes de liberar a todos. Como fica no mesmo endereço-base, os dados
 * precisam ser separados à mão:
 *   - chaves do navegador com prefixo "finbeta:" (produção: "fin:") → Fin.PREFIXO
 *   - arquivo próprio no Google Drive (js/sync/drive.js) e cache próprio (sw.js)
 *   - selo "CANAL BETA" na tela e "[BETA]" no título
 */
window.Fin = window.Fin || {};
Fin.canal = /\/beta\//.test(location.pathname) ? 'beta' : 'producao';
Fin.ehBeta = Fin.canal === 'beta';
Fin.PREFIXO = Fin.ehBeta ? 'finbeta:' : 'fin:';

if (Fin.ehBeta) {
  document.documentElement.classList.add('canal-beta');
  document.title = `[BETA] ${document.title}`;
  document.addEventListener('DOMContentLoaded', () => {
    const selo = document.createElement('div');
    selo.className = 'selo-beta';
    selo.setAttribute('role', 'note');
    selo.textContent = 'CANAL BETA · dados de teste';
    selo.title = 'Versão de teste: os dados aqui são separados do app oficial.';
    document.body.appendChild(selo);
  });
}
