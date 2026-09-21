// =========================================================================
// VISUALIZAÇÃO DE PT ENCERRADA (SOMENTE LEITURA)
// =========================================================================

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const ptId = params.get('id');

    if (!ptId) {
        alert("ID da PT não especificado.");
        window.location.href = "dashboard.html";
        return;
    }

    try {
        const response = await fetch(`http://localhost:8080/api/permissoes-trabalho/${ptId}`);
        if (!response.ok) {
            alert("Erro ao buscar dados da PT.");
            window.location.href = "dashboard.html";
            return;
        }

        const pt = await response.json();

        // Preenche o Número Oficial da PT (exibindo apenas o número/ano limpo no input)
        const numeroExibicao = (pt.numeroEmissao && pt.anoEmissao)
            ? `${String(pt.numeroEmissao).padStart(4, '0')}/${pt.anoEmissao}`
            : 'NÃO EMITIDA';

        const elNumeroPt = document.getElementById('numeroPt');
        if (elNumeroPt) {
            elNumeroPt.value = numeroExibicao;
        }

        // Preenche os inputs de leitura gerais
        document.getElementById('plantaArea').value = pt.plantaArea || '-';
        document.getElementById('turnoGrupo').value = pt.turnoGrupo || '-';
        document.getElementById('tag').value = pt.tag || '-';
        document.getElementById('ordemPj').value = pt.ordemPj || '-';
        document.getElementById('descricaoAtividade').value = pt.descricaoAtividade || '-';

        // Trata o Emitente (objeto ou ID)
        let nomeEmitente = "-";
        const emitenteDado = pt.emitente;

        if (emitenteDado !== null && emitenteDado !== undefined) {
            if (typeof emitenteDado === 'object') {
                nomeEmitente = emitenteDado.nome || emitenteDado.nomeCompleto || emitenteDado.usuario || "-";
            } else {
                try {
                    const responseFunc = await fetch(`http://localhost:8080/api/funcionarios/${emitenteDado}`);
                    if (responseFunc.ok) {
                        const func = await responseFunc.json();
                        nomeEmitente = func.nome || func.nomeCompleto || func.usuario || "Nome não encontrado";
                    } else {
                        nomeEmitente = "Funcionário não encontrado";
                    }
                } catch (err) {
                    console.error("Erro ao buscar dados do funcionário pelo ID do emitente:", err);
                    nomeEmitente = "Erro ao carregar emitente";
                }
            }
        }
        const elEmitente = document.getElementById('emitente');
        if (elEmitente) elEmitente.value = nomeEmitente;

        // Trata a Data e Hora da Emissão
        const dataInicioRaw = pt.dataHoraInicio || pt.dataEmissao || pt.criadoEm || pt.data;
        let dataFormatadaStr = '-';
        if (dataInicioRaw) {
            let dataObj;
            if (Array.isArray(dataInicioRaw)) {
                const [ano, mes, dia, hora = 0, minuto = 0] = dataInicioRaw;
                dataObj = new Date(ano, mes - 1, dia, hora, minuto);
            } else {
                dataObj = new Date(dataInicioRaw);
            }

            if (!isNaN(dataObj.getTime())) {
                const dataFormatada = dataObj.toLocaleDateString('pt-BR');
                const horaFormatada = dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                dataFormatadaStr = `${dataFormatada} às ${horaFormatada}`;
            }
        }
        const elDataEmissao = document.getElementById('dataEmissao');
        if (elDataEmissao) elDataEmissao.value = dataFormatadaStr;

        // Informações de Encerramento
        document.getElementById('servicoConcluido').value = pt.servicoConcluido ? 'Sim' : 'Não';
        document.getElementById('revalidacaoParaContinuidade').value = pt.revalidacaoParaContinuidade ? 'Sim' : 'Não';
        document.getElementById('equipamentoTestado').value = pt.equipamentoTestado || 'N/A';
        document.getElementById('justificativaNaoConclusao').value = pt.justificativaNaoConclusao || 'N/A';

        // Preenche a tabela de executantes reais salvos na baixa
        console.log("Objeto PT recebido:", pt);

        const tbody = document.getElementById('tbodyExecutantes');
        if (pt.executantes && Array.isArray(pt.executantes) && pt.executantes.length > 0) {
            tbody.innerHTML = pt.executantes.map(e => `
                <tr>
                    <td><strong>${e.matricula || 'N/A'}</strong></td>
                    <td>${e.nome}</td>
                    <td>${e.funcao || e.cargo || 'Operacional'}</td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error("Erro de comunicação:", error);
        alert("Falha ao carregar as informações da PT.");
    }
});