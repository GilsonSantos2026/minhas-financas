/**
 * config.js — Configurações que dependem de você.
 *
 * googleClientId: o "ID do cliente OAuth" criado no Google Cloud Console
 * (termina em .apps.googleusercontent.com). NÃO é segredo — pode ficar no código.
 * Enquanto estiver vazio, a sincronização com o Google Drive fica desativada
 * e o app funciona normalmente só neste aparelho.
 *
 * Passo a passo: veja "Sincronização com o Google Drive" no README.md.
 */
window.Fin = window.Fin || {};

Fin.config = {
  googleClientId: '',
};
