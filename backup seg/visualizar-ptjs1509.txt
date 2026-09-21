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

        // Preenche os inputs de leitura
        document.getElementById('plantaArea').value = pt.plantaArea || '-';
        document.getElementById('turnoGrupo').value = pt.turnoGrupo || '-';
        document.getElementById('tag').value = pt.tag || '-';
        document.getElementById('ordemPj').value = pt.ordemPj || '-';
        document.getElementById('descricaoAtividade').value = pt.descricaoAtividade || '-';
        
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
