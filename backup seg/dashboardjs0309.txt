// Dicionário para traduzir Enums e constantes do banco de dados
const TRADUCOES = {
    // Áreas de Atuação
    'INSTRUMENTACAO': 'Instrumentação',
    'ELETRICA': 'Elétrica',
    'MECANICA': 'Mecânica',
    'CIVIL': 'Civil',
    'CALDEIRARIA': 'Caldeiraria',
    'GERAL': 'Geral',

    // Status da PT
    'SOLICITADA': 'Solicitada',
    'EMITIDA': 'Emitida',
    'EM_REVALIDACAO': 'Em Revalidação',
    'AGUARDANDO_REVALIDACAO': 'Aguardando Revalidação',
    'ENCERRADA': 'Encerrada',
    'BAIXADA': 'Baixada',
    'CANCELADA': 'Cancelada'
};

// Função para formatar o texto para Português correto
function formatarTexto(valor) {
    if (!valor) return '-';
    const chave = valor.toString().trim().toUpperCase();
    return TRADUCOES[chave] || valor;
}

// Variáveis globais para controle de filtro
let listaPtsGlobal = [];
let statusFiltroAtual = 'TODAS';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Verificação de Segurança
    const logado = sessionStorage.getItem('usuarioLogado');
    if (!logado) {
        window.location.href = 'login.html';
        return;
    }

    const usuario = JSON.parse(logado);
    const perfil = usuario.perfil ? usuario.perfil.toUpperCase() : '';

    console.log("Dashboard carregado. Acesso como: ", perfil);

    // ADMIN_SISTEMA é somente instalação.
    if (perfil === "ADMIN_SISTEMA") {
        alert("Acesso restrito. Usuário de instalação não possui acesso ao monitoramento de PTs.");
        window.location.href = "admin.html";
        return;
    }

    carregarTabelaPTs();
});

// 1. Carrega as PTs e guarda na variável global
async function carregarTabelaPTs() {
    try {
        const response = await fetch('http://localhost:8080/api/permissoes-trabalho');
        if (!response.ok) return;

        listaPtsGlobal = await response.json();
        filtrarStatus(statusFiltroAtual); // Aplica o filtro atual (padrão 'TODAS')

    } catch (error) {
        console.error("Erro ao carregar monitoramento de PTs:", error);
    }
}

// 2. Função acionada ao clicar nas abas de filtro (anexada ao window para escopo global)
window.filtrarStatus = function (status, event) {
    statusFiltroAtual = status;

    // Atualiza o estilo visual dos botões de filtro
    document.querySelectorAll('.dashboard-filtros button').forEach(btn => btn.classList.remove('ativo'));
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('ativo');
    }

    // Filtra os dados com base na lista global
    if (status === 'TODAS') {
        renderizarTabela(listaPtsGlobal);
    } else if (status === 'REVALIDAR') {
        // Agrupa as PTs que exigem revalidação de turno ou estão em trânsito de revalidação
        const filtradas = listaPtsGlobal.filter(pt => {
            const st = (pt.status || '').toUpperCase();
            return st === 'EM_REVALIDACAO' || st === 'AGUARDANDO_REVALIDACAO';
        });
        renderizarTabela(filtradas);
    } else if (status === 'ENCERRADA') {
        const filtradas = listaPtsGlobal.filter(pt => {
            const st = (pt.status || '').toUpperCase();
            return st === 'ENCERRADA' || st === 'BAIXADA';
        });
        renderizarTabela(filtradas);
    } else {
        const filtradas = listaPtsGlobal.filter(pt => (pt.status || '').toUpperCase() === status);
        renderizarTabela(filtradas);
    }
}

// 3. Renderiza a tabela com monitoramento de prazo (24h / Limite)
function renderizarTabela(lista) {
    const corpoTabela = document.getElementById('corpoTabela');
    if (!corpoTabela) return;

    if (lista.length === 0) {
        corpoTabela.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 20px;">
                    Nenhuma Permissão de Trabalho encontrada para este filtro.
                </td>
            </tr>`;
        return;
    }

    const logado = sessionStorage.getItem('usuarioLogado');
    const usuario = logado ? JSON.parse(logado) : {};
    const perfil = usuario.perfil ? usuario.perfil.toUpperCase() : '';

    const perfisEmitentes = ['EMISSOR', 'SESMT', 'MASTER', 'ADMIN', 'OPERADOR_INDUSTRIAL'];
    const ehEmitente = perfisEmitentes.includes(perfil);

    corpoTabela.innerHTML = lista.map(pt => {
        const statusChave = (pt.status || 'SOLICITADA').toUpperCase();
        const statusExibicao = formatarTexto(statusChave);
        const areaExibicao = formatarTexto(pt.areaAtuacao);

        let acoesHtml = '';
        let classeDestaqueLinha = '';
        let avisoPrazoHtml = '';

        // Pega a data de emissão considerando o nome correto do campo no backend / H2
        const dataEmissaoBruta = pt.dataHoraInicio || pt.dataEmissao || pt.dataCriacao || pt.createdAt || pt.criadoEm || pt.data;

        let dataEmissaoFormatada = '-';
        if (dataEmissaoBruta) {
            const dataObj = new Date(dataEmissaoBruta);
            if (!isNaN(dataObj)) {
                dataEmissaoFormatada = dataObj.toLocaleDateString('pt-BR') + ' ' + dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            }
        }

        // 🟢 REGRA 1: Status SOLICITADA
        if (statusChave === 'SOLICITADA') {
            if (ehEmitente) {
                acoesHtml += `<a href="emitir-pt.html?id=${pt.id}" class="btn-acao-emitir" title="Emitir PT">🛡️ Emitir</a> `;
            }
            acoesHtml += `<a href="editar-pt.html?id=${pt.id}" class="btn-acao-editar" title="Ver/Editar Solicitação">✏️ Detalhes</a>`;
        }
        // 🟢 REGRA 2: Status EMITIDA ou EM_REVALIDACAO / AGUARDANDO_REVALIDACAO
        else if (statusChave === 'EMITIDA' || statusChave === 'EM_REVALIDACAO' || statusChave === 'AGUARDANDO_REVALIDACAO') {
            const infoVencimento = calcularVencimentoPT(pt);
            const obsRegulatoriaPadrao = "Permissão bloqueada por falta de retorno de status após vencimento de intervalo regulatório.";

            if (infoVencimento.estaVencida) {
                // BLOQUEIO COMPULSÓRIO
                classeDestaqueLinha = 'linha-alerta-limite';
                const msgBloqueio = infoVencimento.tipoRegra === 'POS_EXPEDIENTE' 
                    ? "Bloqueado (Pós-Expediente 12h) - Baixa Obrigatória" 
                    : "Bloqueado (Turno 08h) - Baixa Obrigatória";
                
                avisoPrazoHtml = `<br><span style="color: #ff9f43; font-size: 0.80em; font-weight: 600;" title="${obsRegulatoriaPadrao}">
                    <i class="fa-solid fa-ban"></i> ${msgBloqueio}
                </span>`;
                
                acoesHtml = `<a href="baixar-pt.html?id=${pt.id}" class="btn-acao-baixar" title="${obsRegulatoriaPadrao}">🏁 Baixar (Obrigatório)</a> `;
                acoesHtml += `<a href="imprimir-pt.html?id=${pt.id}" class="btn-acao-imprimir" target="_blank" title="Imprimir Documento">🖨️ Imprimir</a>`;
            } else {
                // Fluxo normal
                acoesHtml += `<a href="revalidar-pt.html?id=${pt.id}" class="btn-acao-revalidar" title="Revalidar PT">🔄 Revalidar</a> `;
                acoesHtml += `<a href="baixar-pt.html?id=${pt.id}" class="btn-acao-baixar" title="Dar Baixa na PT">🏁 Baixar</a> `;
                acoesHtml += `<a href="imprimir-pt.html?id=${pt.id}" class="btn-acao-imprimir" target="_blank" title="Imprimir Documento">🖨️ Imprimir</a>`;

                // Alertas preventivos específicos por tipo de regra
                if (infoVencimento.tipoRegra === 'POS_EXPEDIENTE') {
                    classeDestaqueLinha = 'linha-alerta-prazo';
                    avisoPrazoHtml = `<br><span style="color: #3498db; font-size: 0.85em; font-weight: 600;" title="Verificar se a PT está ativa ou não no pós-expediente">
                        <i class="fa-solid fa-clock"></i> Pós-expediente (12h) - Verificar Atividade
                    </span>`;
                } else {
                    const diffHoras = (infoVencimento.limiteVencimento - new Date()) / (1000 * 60 * 60);
                    if (diffHoras <= 4 && diffHoras > 0) {
                        classeDestaqueLinha = 'linha-alerta-prazo';
                        avisoPrazoHtml = `<br><span style="color: #ff6b6b; font-size: 0.85em; font-weight: 600;"><i class="fa-solid fa-triangle-exclamation"></i> Vence hoje às 08:00 AM</span>`;
                    }
                }
            }
        }
        // 🟢 REGRA 3: Status ENCERRADA / BAIXADA
        else {
            acoesHtml += `<a href="visualizar-pt.html?id=${pt.id}" class="btn-acao-visualizar" title="Visualizar PT Encerrada">👁️ Visualizar</a>`;
        }

        return `
            <tr class="${classeDestaqueLinha}">
                <td>#${pt.id}</td>
                <td>${pt.plantaArea || '-'}</td>
                <td>${pt.emergencial ? '🚨 Emergencial' : (pt.ordemPj || '-')}</td>
                <td><strong>${areaExibicao}</strong></td>
                <td>${pt.tag || '-'}</td>
                <td>${pt.solicitante ? pt.solicitante.nome : '-'}</td>
                <td>${dataEmissaoFormatada}</td>
                <td>
                    <span class="badge ${getStatusBadgeClass(statusChave)}">${statusExibicao}</span>
                    ${avisoPrazoHtml}
                </td>
                <td class="coluna-acoes">
                    ${acoesHtml}
                </td>
            </tr>
        `;
    }).join('');
}

// Retorna as cores de cada badge
function getStatusBadgeClass(status) {
    switch (status) {
        case 'SOLICITADA':
            return 'badge-solicitada';
        case 'EMITIDA':
            return 'badge-emitida';
        case 'EM_REVALIDACAO':
        case 'AGUARDANDO_REVALIDACAO':
            return 'badge-revalidacao';
        case 'ENCERRADA':
        case 'BAIXADA':
            return 'badge-encerrada';
        default:
            return 'badge-solicitada';
    }
}

// Função unificada de cálculo de prazos (Turno ADM vs Pós-Expediente 12h)
function calcularVencimentoPT(pt) {
    const status = (pt.status || '').toUpperCase();

    // 🛡️ TRAVA DE SEGURANÇA: PTs em processo de revalidação ou aguardando revalidação 
    // nunca devem cair em baixa obrigatória / vencimento prematuro.
    if (status === 'EM_REVALIDACAO' || status === 'AGUARDANDO_REVALIDACAO') {
        return {
            dataRef: new Date(),
            limiteVencimento: new Date(Date.now() + 24 * 60 * 60 * 1000),
            tipoRegra: 'REVALIDACAO',
            estaVencida: false
        };
    }

    const dataRefBruta = pt.dataHoraInicio || pt.dataEmissao || pt.ultimaAtualizacao || pt.dataCriacao || pt.criadoEm || pt.data;
    const dataRef = dataRefBruta ? new Date(dataRefBruta) : new Date();
    const revalCount = pt.quantidadeRevalidacoes || pt.etapaRevalidacao || 0;
    
    const horas = dataRef.getHours();
    const minutos = dataRef.getMinutes();
    
    // Verifica se foi iniciada após o fim do expediente ADM (17:45)
    const isAposExpediente = (horas > 17) || (horas === 17 && minutos >= 45);
    
    let limiteVencimento = new Date(dataRef);
    let tipoRegra = 'ADM';
    
    if (isAposExpediente) {
        // 🌙 Regra especial pós-expediente: 12 horas de validade a partir do início
        tipoRegra = 'POS_EXPEDIENTE';
        limiteVencimento = new Date(dataRef.getTime() + 12 * 60 * 60 * 1000);
    } else {
        // ☀️ Regra Turno ADM (incluindo início antecipado): Vence às 08:00 AM do dia seguinte (+ revalidações)
        limiteVencimento.setHours(8, 0, 0, 0);
        limiteVencimento.setDate(limiteVencimento.getDate() + 1 + revalCount);
    }
    
    const agora = new Date();
    const expirado = agora > limiteVencimento;
    
    return {
        dataRef,
        limiteVencimento,
        tipoRegra,
        estaVencida: expirado || (tipoRegra === 'ADM' && revalCount >= 4)
    };
}