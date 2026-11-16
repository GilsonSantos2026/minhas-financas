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
  googleClientId: '542708707263-b7sdeqbudurcqdjrr21773ev9r4u1qrj.apps.googleusercontent.com',
  // Modo casal: o seletor de arquivos do Google (Picker) usa o número do projeto (início do Client ID).
  // googlePickerKey: chave de API "de navegador", restrita ao site e à Picker API — só se o Google exigir.
  googlePickerKey: '',
  // Versão "de produto" mostrada ao usuário (marco). A versão técnica de cada publicação é a do sw.js.
  versaoApp: 'Beta 1.0',
};
