let ptAtual = null;
let executantesReais = [];

document.addEventListener("DOMContentLoaded", function () {
    console.log("Tela de Baixa de PT inicializada.");

    // 1. Carregar dados da PT via URL
    async function carregarDadosPT() {
        const urlParams = new URLSearchParams(window.location.search);
        const ptId = urlParams.get('id');

        if (!ptId) {
            console.warn("Nenhum ID de PT informado na URL.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/permissoes-trabalho/${ptId}`, {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            });

            if (!response.ok) {
                throw new Error(`Erro ao buscar dados da PT: ${response.status}`);
            }

            ptAtual = await response.json();

            if (document.getElementById('plantaArea')) document.getElementById('plantaArea').value = ptAtual.plantaArea || '';
            if (document.getElementById('turnoGrupo')) document.getElementById('turnoGrupo').value = ptAtual.turnoGrupo || '';
            if (document.getElementById('tag')) document.getElementById('tag').value = ptAtual.tag || '';
            if (document.getElementById('ordemPj')) document.getElementById('ordemPj').value = ptAtual.ordemPj || '';
            if (document.getElementById('descricaoAtividade')) document.getElementById('descricaoAtividade').value = ptAtual.descricaoAtividade || '';

            // 👤 Preenchimento correto do Solicitante (extraindo do objeto .nome)
            const nomeSolicitante = ptAtual.solicitante && ptAtual.solicitante.nome ? ptAtual.solicitante.nome : (ptAtual.nomeSolicitante || '');
            const inputSol = document.getElementById('inputSolicitante') || document.getElementById('solicitante');
            if (inputSol) inputSol.value = nomeSolicitante;

            // 👷‍♂️ Carregamento da lista de executantes vindas do array do backend
            if (ptAtual.executantes && Array.isArray(ptAtual.executantes)) {
                executantesReais = ptAtual.executantes.map(exec => ({
                    matricula: exec.matricula || '',
                    nome: exec.nome || '',
                    funcao: exec.funcao || '---'
                }));
                atualizarTabelaExecutantes(); // Atualiza a tabela na tela com os executantes salvos
            }

            // 🕒 APLICAÇÃO DA REGRA DE BLOQUEIO REGULATÓRIO (TURNO ADM - 08:00 AM)
            aplicarBloqueioRegulatorioSeVencida();

            // 🕒 APLICAÇÃO DA REGRA DE BLOQUEIO REGULATÓRIO (TURNO ADM - 08:00 AM)
            aplicarBloqueioRegulatorioSeVencida();

        } catch (error) {
            console.error("Erro ao carregar a PT:", error);
        }
    }

    // Função dedicada para manter o código limpo e organizado logo abaixo:
    function aplicarBloqueioRegulatorioSeVencida() {
        const textareaJustificativa = document.getElementById('justificativaNaoConclusao');
        const containerJustificativa = document.getElementById('containerJustificativa');
        if (!textareaJustificativa || !ptAtual) return;

        const dataRef = new Date(ptAtual.dataHoraInicio || ptAtual.dataEmissao || ptAtual.dataCriacao || ptAtual.data);
        let limiteVencimento = new Date(dataRef);
        limiteVencimento.setHours(8, 0, 0, 0);

        if (dataRef.getHours() >= 8) {
            limiteVencimento.setDate(limiteVencimento.getDate() + 1);
        }
        limiteVencimento.setDate(limiteVencimento.getDate() + (ptAtual.quantidadeRevalidacoes || ptAtual.etapaRevalidacao || 0));

        const estaVencida = new Date() > limiteVencimento;

        if (estaVencida) {
            const msgPadraoRegulatoria = "Permissão bloqueada por falta de retorno de status após vencimento de intervalo regulatório.";

            textareaJustificativa.value = msgPadraoRegulatoria;
            textareaJustificativa.readOnly = true;
            textareaJustificativa.style.backgroundColor = "rgba(231, 76, 60, 0.08)";
            textareaJustificativa.style.cursor = "not-allowed";

            if (containerJustificativa && !document.getElementById('alertaBloqueioRegulatorio')) {
                const aviso = document.createElement('div');
                aviso.id = 'alertaBloqueioRegulatorio';
                aviso.innerHTML = `<small style="color: #ff9f43; font-weight: 600; display: block; margin-bottom: 5px;">
                    <i class="fa-solid fa-lock"></i> Campo bloqueado por norma regulatória (Intervalo de Turno Expirado).
                </small>`;
                containerJustificativa.insertBefore(aviso, textareaJustificativa);
            }
        }
    }

    carregarDadosPT();

    // 2. Gestão de Executantes Reais
    const inputMatricula = document.getElementById('inputMatricula');
    const inputNomeExecutante = document.getElementById('inputNomeExecutante');
    const btnAdicionarExecutante = document.getElementById('btnAdicionarExecutante');
    const tbodyExecutantes = document.getElementById('tbodyExecutantes');
    const msgMatriculaStatus = document.getElementById('msgMatriculaStatus');

    if (inputMatricula) {
        inputMatricula.addEventListener('blur', async () => {
            const matricula = inputMatricula.value.trim();
            if (!matricula) return;

            try {
                const response = await fetch(`http://localhost:8080/api/funcionarios/matricula/${matricula}`, {
                    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
                });

                if (response.ok) {
                    const func = await response.json();
                    inputNomeExecutante.value = func.nome || '';
                    inputMatricula.dataset.funcao = func.funcao || '---';
                    if (msgMatriculaStatus) msgMatriculaStatus.textContent = "";
                } else {
                    inputNomeExecutante.value = "";
                    if (msgMatriculaStatus) msgMatriculaStatus.textContent = "Colaborador não encontrado.";
                }
            } catch (error) {
                console.error("Erro ao buscar funcionário:", error);
            }
        });
    }

    if (btnAdicionarExecutante) {
        btnAdicionarExecutante.addEventListener('click', () => {
            const matricula = inputMatricula.value.trim();
            const nome = inputNomeExecutante.value.trim();
            const funcao = inputMatricula.dataset.funcao || '---';

            if (!matricula || !nome) {
                alert("Informe uma matrícula válida para adicionar o executante.");
                return;
            }

            if (executantesReais.some(e => e.matricula === matricula)) {
                alert("Este colaborador já foi adicionado à equipe executante.");
                return;
            }

            executantesReais.push({ matricula, nome, funcao });
            atualizarTabelaExecutantes();

            inputMatricula.value = "";
            inputNomeExecutante.value = "";
            delete inputMatricula.dataset.funcao;
        });
    }

    function atualizarTabelaExecutantes() {
        if (!tbodyExecutantes) return;

        tbodyExecutantes.innerHTML = "";

        if (executantesReais.length === 0) {
            tbodyExecutantes.innerHTML = `
                <tr class="linha-vazia">
                    <td colspan="4">Nenhum executante real adicionado para auditoria.</td>
                </tr>
            `;
            return;
        }

        executantesReais.forEach((exec, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${exec.matricula}</td>
                <td>${exec.nome}</td>
                <td>${exec.funcao}</td>
                <td class="col-acao">
                    <button type="button" class="btn-excluir-exec" onclick="removerExecutante(${index})">🗑️</button>
                </td>
            `;
            tbodyExecutantes.appendChild(tr);
        });
    }

    window.removerExecutante = function (index) {
        executantesReais.splice(index, 1);
        atualizarTabelaExecutantes();
    };

    // 3. Submissão do formulário de Baixa
    const formBaixarPT = document.getElementById('formBaixarPT');
    if (formBaixarPT) {
        formBaixarPT.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!ptAtual || !ptAtual.id) {
                alert("Erro: ID da PT não identificado.");
                return;
            }

            // 🛠️ GARANTE QUE O SOLICITANTE SEJA ENVIADO COMO EXECUTANTE SE FOR O CASO
            let listaExecutantesParaEnviar = [...executantesReais];
            if (ptAtual.solicitanteExecutante && ptAtual.solicitante && listaExecutantesParaEnviar.length === 0) {
                listaExecutantesParaEnviar.push({
                    id: ptAtual.solicitante.id,
                    nome: ptAtual.solicitante.nome,
                    matricula: ptAtual.solicitante.matricula,
                    funcao: ptAtual.solicitante.funcao
                });
            }

            const payload = {
                servicoConcluido: document.getElementById('servicoConcluido').value === 'true',
                revalidacaoParaContinuidade: document.getElementById('revalidacaoParaContinuidade').value === 'true',
                equipamentoTestado: document.getElementById('equipamentoTestado').value,
                justificativaNaoConclusao: document.getElementById('justificativaNaoConclusao').value,
                executantesReais: listaExecutantesParaEnviar // Usa a lista tratada
            };

            try {
                const response = await fetch(`http://localhost:8080/api/permissoes-trabalho/${ptAtual.id}/baixa`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    alert("Baixa da PT realizada com sucesso!");
                    window.location.href = "dashboard.html";
                } else {
                    alert("Erro ao processar a baixa da PT no servidor.");
                }
            } catch (error) {
                console.error("Erro de conexão:", error);
                alert("Falha de comunicação com o servidor.");
            }
        });
    }
function calcularVencimentoPT(pt) {
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
});