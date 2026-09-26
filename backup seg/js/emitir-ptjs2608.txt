let ptId = null;

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    ptId = urlParams.get('id');

    if (!ptId) {
        alert("Nenhuma Permissão de Trabalho selecionada!");
        window.location.href = "dashboard.html";
        return;
    }

    document.getElementById('labelPtId').textContent = ptId;

    // 🟢 Identifica e preenche o nome e a matrícula do emitente logado na tela
    const usuarioLogadoStr = sessionStorage.getItem('usuarioLogado');
    if (usuarioLogadoStr) {
        const usuarioLogado = JSON.parse(usuarioLogadoStr);

        console.log("Objeto do usuário logado:", usuarioLogado);

        // Preenche o Nome do Emitente
        const inputNomeEmitente = document.getElementById('nomeEmitente');
        if (inputNomeEmitente) {
            inputNomeEmitente.value = usuarioLogado.nome || usuarioLogado.usuario || "Emitente Autenticado";
        }

        // 🚀 Busca a matrícula no back-end usando a URL completa do Spring Boot
        const funcionarioId = usuarioLogado.id;
        if (funcionarioId) {
            try {
                const response = await fetch(`http://localhost:8080/api/funcionarios/${funcionarioId}`);
                if (response.ok) {
                    const funcionario = await response.json();

                    const inputMatricula = document.getElementById('matricula');
                    if (inputMatricula && funcionario.matricula) {
                        inputMatricula.value = funcionario.matricula;
                    }
                } else {
                    console.error("Não foi possível buscar os dados do funcionário.");
                }
            } catch (error) {
                console.error("Erro de conexão ao buscar a matrícula:", error);
            }
        }
    }

    preencherDatasPadrao();
    carregarDadosParaEmissao(ptId);

    const formEmitir = document.getElementById('formEmitirPT');
    if (formEmitir) {
        formEmitir.addEventListener('submit', confirmarEmissaoPT);
    }
});



function preencherDatasPadrao() {
    const agora = new Date();
    agora.setMinutes(agora.getMinutes() - agora.getTimezoneOffset());
    document.getElementById('dataHoraInicio').value = agora.toISOString().slice(0, 16);
}

async function carregarDadosParaEmissao(id) {
    try {
        const response = await fetch(`http://localhost:8080/api/permissoes-trabalho/${id}`);
        if (!response.ok) {
            alert("Erro ao carregar dados da PT.");
            window.location.href = "dashboard.html";
            return;
        }

        const pt = await response.json();

        // 1. Popula os campos básicos
        document.getElementById('infoPlantaArea').textContent = pt.plantaArea || '-';

        document.getElementById('infoTag').textContent = pt.tag || '-';
        document.getElementById('infoOrdemPj').textContent = pt.ordemPj || '-';
        document.getElementById('infoDescricao').textContent = pt.descricaoAtividade || '-';
        document.getElementById('infoNomeAst').textContent = pt.nomeAst || 'Não informada';

        const solNome = pt.solicitante?.nome || pt.solicitanteNome || 'Não informado';
        const solMatricula = pt.solicitante?.matricula || pt.solicitanteMatricula || '';
        const textoSolicitante = solMatricula ? `${solNome} (Mat: ${solMatricula})` : solNome;

        const elSolicitante = document.getElementById('infoSolicitante');
        if (elSolicitante) elSolicitante.textContent = textoSolicitante;

        let textoExecutantes = '';
        const temEquipeExterna = pt.executantes || pt.executanteNome || (pt.equipe && pt.equipe.trim() !== '');

        if (!temEquipeExterna || pt.solicitanteExecutante === true) {
            textoExecutantes = `👷 Atuação Própria: ${textoSolicitante}`;
        } else {
            const execNome = pt.executantes || pt.executanteNome || pt.equipe || 'Não especificado';
            const execMatricula = pt.executanteMatricula ? ` (Mat: ${pt.executanteMatricula})` : '';
            textoExecutantes = `${execNome}${execMatricula}`;
        }

        const elExecutantes = document.getElementById('infoExecutantes');
        if (elExecutantes) elExecutantes.textContent = textoExecutantes;

        // 2. Renderiza as tags de Riscos e Requisitos
        const containerRiscos = document.getElementById('listaRiscosResumo');
        if (containerRiscos) {
            containerRiscos.innerHTML = '';

            const riscosMapeados = [
                { chave: 'requerTrabalhoQuente', label: '🔥 Trabalho a Quente' },
                { chave: 'requerTrabalhoFrio', label: '❄️ Trabalho a Frio' },
                { chave: 'requerTrabalhoAltura', label: '🧗 Trabalho em Altura' },
                { chave: 'requerEspacoConfinado', label: '🕳️ Espaço Confinado' },
                { chave: 'requerRiscoEletrico', label: '⚡ Risco Elétrico' },
                { chave: 'requerAltaTensaoSep', label: '⚠️ Alta Tensão / SEP' },
                { chave: 'requerAreaClassificada', label: '🏭 Área Classificada' },
                { chave: 'requerSegurancaMaquinas', label: '⚙️ Segurança em Máquinas' },
                { chave: 'requerLoto', label: '🔒 Bloqueio LOTO' },
                { chave: 'requerAtividadePintura', label: '🎨 Atividade de Pintura' },
                {
                    objeto: pt.agentesQuimicos,
                    labelPadrao: '🧪 Risco Químico',
                    temTextoComplementar: true
                },
                {
                    objeto: pt.diphoterine,
                    labelPadrao: '💧 Uso de Diphoterine / Descontaminação',
                    temTextoComplementar: false
                }
            ];

            let temRisco = false;
            riscosMapeados.forEach(r => {
                let ativo = false;
                let textoFinal = r.label;

                if (r.chave && pt[r.chave]) {
                    ativo = true;
                } else if (r.objeto && r.objeto.ativo) {
                    ativo = true;
                    if (r.temTextoComplementar && r.objeto.textoComplementar) {
                        textoFinal = `🧪 Risco Químico: ${r.objeto.textoComplementar}`;
                    }
                }

                if (ativo) {
                    temRisco = true;
                    const tag = document.createElement('span');
                    tag.textContent = textoFinal;
                    tag.className = 'risco-badge';
                    containerRiscos.appendChild(tag);
                }
            });

            if (!temRisco) {
                const aviso = document.createElement('span');
                aviso.textContent = 'Nenhum risco crítico adicional marcado.';
                aviso.className = 'risco-vazio';
                containerRiscos.appendChild(aviso);
            }
        }

        // 3. Renderiza os EPIs de forma puramente informativa (somente leitura)
        gerarChecklistDinamico(pt);

        // 4. Lógica de Exibição Condicional dos Blocos de Preenchimento
        const blocoLoto = document.getElementById('blocoLoto');
        if (blocoLoto) blocoLoto.classList.toggle('oculto', !pt.requerLoto);

        const blocoAltura = document.getElementById('blocoAltura');
        if (blocoAltura) blocoAltura.classList.toggle('oculto', !pt.requerTrabalhoAltura);

        const blocoMonitoramento = document.getElementById('blocoMonitoramento');
        if (blocoMonitoramento) {
            const exigeMonitoramento = pt.requerEspacoConfinado || pt.requerTrabalhoQuente;
            blocoMonitoramento.classList.toggle('oculto', !exigeMonitoramento);
        }

    } catch (error) {
        console.error("Erro ao carregar PT:", error);
        alert("Falha de comunicação com o servidor.");
    }
}

// 🟢 FUNÇÃO  EXIBE OS EPIs APENAS PARA CONSULTA 
function gerarChecklistDinamico(pt) {
    const container = document.getElementById('containerInspecaoEpiMedidas');
    if (!container) return;
    container.innerHTML = '';

    const episCalculados = pt.episObrigatorios || [];

    if (episCalculados.length === 0) {
        const aviso = document.createElement('p');
        aviso.textContent = 'Nenhum EPI específico obrigatório para esta seleção.';
        aviso.style.color = 'var(--texto-secundario, #a0aec0)';
        container.appendChild(aviso);
        return;
    }

    // Renderiza cards limpos e estáticos (somente leitura)
    let html = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 10px; width: 100%;">';
    episCalculados.forEach(epiNome => {
        html += `
            <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); padding: 10px 14px; border-radius: 6px; display: flex; align-items: center; gap: 10px; color: #cbd5e1;">
                <i class="fa-solid fa-circle-check" style="color: #38bdf8; font-size: 14px;"></i>
                <span style="font-size: 14px;">${epiNome}</span>
            </div>
        `;
    });
    html += '</div>';

    container.innerHTML = html;
}

async function confirmarEmissaoPT(event) {
    event.preventDefault();

    // 1. Pega os dados do usuário logado direto da sessão com segurança
    const usuarioLogadoStr = sessionStorage.getItem('usuarioLogado');
    const usuarioLogado = usuarioLogadoStr ? JSON.parse(usuarioLogadoStr) : null;

    // Garante que pegamos o ID independentemente de como ele venha no objeto (id, usuarioId, etc.)
    const idEmitenteExtraido = usuarioLogado ? (usuarioLogado.id || usuarioLogado.usuarioId || usuarioLogado.funcionarioId) : null;

    // 2. Monta o payload exatamente com os nomes que o EmitirPermissaoRequestDTO espera
    const payload = {
        dataHoraInicio: document.getElementById('dataHoraInicio').value ? document.getElementById('dataHoraInicio').value + ":00" : null,
        recomendacoesEmissor: document.getElementById('recomendacoesEmissor')?.value.trim() || null,
        monitoramentoAmbiental: document.getElementById('monitoramentoAmbiental')?.value.trim() || null,
        lotoDetalhes: document.getElementById('lotoDetalhes')?.value.trim() || null,
        alturaDetalhes: document.getElementById('alturaDetalhes')?.value.trim() || null,
        matricula: document.getElementById('matricula')?.value.trim() || null,
        turnoGrupo: document.getElementById('turnoGrupo')?.value.trim() || null,
        emitenteId: idEmitenteExtraido // Envia o ID extraído da sessão para o DTO
    };

    console.log("Payload enviado para o DTO:", JSON.stringify(payload, null, 2));

    try {
        const response = await fetch(`http://localhost:8080/api/permissoes-trabalho/${ptId}/emitir`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const erroTexto = await response.text();
            console.error("Erro retornado pelo back-end:", erroTexto);
            throw new Error(`Erro HTTP: ${response.status} - ${erroTexto}`);
        }

        alert("Permissão de Trabalho emitida com sucesso!");
        window.location.href = "dashboard.html";

    } catch (error) {
        console.error("Detalhes do erro na emissão:", error);
        alert("Erro ao emitir a PT. Verifique o console.");
    }
}