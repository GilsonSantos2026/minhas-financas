/**
 * novidades.js — Conteúdo e regras da tela "Novidades" (What's New), Etapa 3 do onboarding.
 *
 * COMO ACRESCENTAR UMA NOVIDADE (a cada versão com mudança VISÍVEL para quem usa o app):
 *   inclua um item NO FIM de LISTA com o próximo `id` (número inteiro, sempre crescente),
 *   a data e até 4 itens curtos. Correções internas não entram.
 *   Ícones: nomes de js/icones.js. `acao.rota` = hash do app (ex.: '#/categorias').
 *
 * Quem vê (prefs.novidadesVista = id da última vista, por aparelho), decidido 1× na
 * primeira abertura com este código:
 *   - aparelho novo (sem conta): marca a mais recente como vista (quem chega tem o tutorial);
 *   - usuário atual (com conta): marca a anterior → vê só a novidade atual, não o histórico.
 */
window.Fin = window.Fin || {};

Fin.novidades = (() => {
  const LISTA = [
    {
      id: 1,
      data: '2026-11-17',
      titulo: 'O app agora é Valoris',
      itens: [
        { icone: 'paleta', titulo: 'Nova identidade: Valoris', texto: 'Novo nome, abertura animada e visual azul-marinho com dourado. Prefere outra cor? Ainda dá para escolher.', acao: { rotulo: 'Ver cores', rota: '#/configuracoes' } },
        { icone: 'etiqueta', titulo: 'Categorias mais espertas', texto: 'Toque no ícone de uma categoria para ver os lançamentos dela e mover vários de uma vez.', acao: { rotulo: 'Ver categorias', rota: '#/categorias' } },
        { icone: 'check', titulo: 'Edite sem medo', texto: 'Ao renomear uma categoria, o app mostra o que já foi lançado e você escolhe o que corrigir.' },
        { icone: 'escudo', titulo: 'Mais segurança', texto: 'Proteção da senha reforçada e todo o código servido pelo próprio app.' },
      ],
    },
  ];

  const chave = () => `${Fin.PREFIXO || 'fin:'}prefs`;
  const ler = () => { try { return JSON.parse(localStorage.getItem(chave()) || '{}'); } catch { return {}; } };
  function gravar(id) {
    try {
      const p = ler();
      p.novidadesVista = id;
      localStorage.setItem(chave(), JSON.stringify(p));
    } catch { /* sem armazenamento: vale só nesta sessão */ }
  }

  const ultima = () => LISTA[LISTA.length - 1] || null;

  // Decisão única (gravada direto nas prefs locais, como o tema): funciona com o app bloqueado.
  if (ler().novidadesVista == null && ultima()) {
    const temConta = !!Fin.cofre?.existeConta?.();
    const anterior = LISTA.length > 1 ? LISTA[LISTA.length - 2].id : 0;
    gravar(temConta ? anterior : ultima().id);
  }

  /** Última vista; valor estranho (texto, negativo…) conta como "já vi tudo" — nunca despeja o histórico. */
  function vista() {
    const v = Number(ler().novidadesVista);
    return Number.isFinite(v) && v >= 0 ? v : (ultima()?.id ?? 0);
  }

  /** A novidade a mostrar agora (só a mais recente ainda não vista) ou null. */
  const pendente = () => (ultima() && ultima().id > vista() ? ultima() : null);
  const marcarVista = (id = ultima()?.id) => { if (id != null) gravar(id); };

  return { LISTA, ultima, pendente, marcarVista, vista };
})();
