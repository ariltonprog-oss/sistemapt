document.addEventListener('DOMContentLoaded', async () => {
    function preencherTexto(idElemento, texto) {
        const elemento = document.getElementById(idElemento);
        if (elemento) {
            elemento.textContent = texto;
        }
    }
    const params = new URLSearchParams(window.location.search);
    const ptId = params.get('id');

    if (!ptId) {
        alert("ID da PT não especificado para emissão do documento.");
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
        console.log("ESTRUTURA DO OBJETO PT:", pt);
        console.log("CHAVES DISPONÍVEIS NO OBJETO PT:", Object.keys(pt));

        // 1. Cabeçalho: Empresa
        const empresaObj = pt.empresaGestora || pt.empresa;
        let nomeEmpresa = null;

        if (empresaObj) {
            nomeEmpresa = empresaObj.nomeFantasia || empresaObj.nome || empresaObj.razaoSocial;
        }

        if (!nomeEmpresa) {
            const logado = sessionStorage.getItem('usuarioLogado');
            const usuario = logado ? JSON.parse(logado) : null;
            nomeEmpresa = (usuario && usuario.empresaNome) ? usuario.empresaNome : 'Notlira';
        }

        document.getElementById('valEmpresaHeader').textContent = nomeEmpresa || 'EMPRESA';

        // 2. Cabeçalho básico
        document.getElementById('docNumeroPt').textContent = `PT Nº: #${pt.id || '---'}`;
        document.getElementById('valPlanta').textContent = pt.plantaArea || '-';
        document.getElementById('valTurno').textContent = pt.turnoGrupo || '-';
        document.getElementById('valTag').textContent = pt.tag || '-';
        document.getElementById('valOrdem').textContent = pt.ordemPj || (pt.emergencial ? '🚨 Emergencial' : '-');
        document.getElementById('valDescricao').textContent = pt.descricaoAtividade || '-';

        // 3. EMITENTE: Utilizando a chave correta "emitente" encontrada no objeto PT
        let nomeEmitente = "-";
        let matriculaEmitente = "-";

        const emitenteDado = pt.emitente;
        console.log("DEBUG JS - Dado do Emitente recebido na PT:", emitenteDado);

        if (emitenteDado !== null && emitenteDado !== undefined) {
            if (typeof emitenteDado === 'object') {
                // Cenário A: O backend enviou o objeto completo do emitente
                nomeEmitente = emitenteDado.nome || emitenteDado.nomeCompleto || emitenteDado.usuario || "-";
                matriculaEmitente = emitenteDado.matricula || "-";
            } else {
                // Cenário B: O backend enviou apenas o ID, então buscamos na rota de funcionários
                try {
                    const responseFunc = await fetch(`http://localhost:8080/api/funcionarios/${emitenteDado}`);
                    if (responseFunc.ok) {
                        const func = await responseFunc.json();
                        nomeEmitente = func.nome || func.nomeCompleto || func.usuario || "Nome não encontrado";
                        matriculaEmitente = func.matricula || "-";
                    } else {
                        nomeEmitente = "Funcionário não encontrado";
                    }
                } catch (err) {
                    console.error("Erro ao buscar dados do funcionário pelo ID do emitente:", err);
                    nomeEmitente = "Erro ao carregar emitente";
                }
            }
        } else {
            // Fallback caso venha totalmente vazio: tenta pegar da sessão ou exibe padrão
            const usuarioLogadoStr = sessionStorage.getItem('usuarioLogado');
            if (usuarioLogadoStr) {
                const usuarioLogado = JSON.parse(usuarioLogadoStr);
                nomeEmitente = usuarioLogado.nome || usuarioLogado.usuario || "";
                matriculaEmitente = usuarioLogado.matricula || "";
            } else {
                nomeEmitente = "Sistema / Emissor SESMT";
            }
        }

        // Atribui os valores finais aos elementos da tela de impressão
        document.getElementById('valEmitente').textContent = nomeEmitente;
        document.getElementById('valMatriculaEmitente').textContent = matriculaEmitente;
        // 4. Data e Hora
        // Utilizando a data e hora de início diretamente no documento impresso
        const dataInicioRaw = pt.dataHoraInicio;
        console.log("DEBUG JS - Valor bruto de dataHoraInicio:", dataInicioRaw);

        if (dataInicioRaw) {
            let dataObj;

            // Se o Java enviar como array [ano, mes, dia, hora, minuto, segundo]
            if (Array.isArray(dataInicioRaw)) {
                const [ano, mes, dia, hora = 0, minuto = 0] = dataInicioRaw;
                // No JS, os meses vão de 0 a 11 (por isso o mes - 1)
                dataObj = new Date(ano, mes - 1, dia, hora, minuto);
            } else {
                // Se o Java enviar como String ISO ("2026-08-06T07:54:00")
                dataObj = new Date(dataInicioRaw);
            }

            // Valida se a data é válida antes de exibir
            if (!isNaN(dataObj.getTime())) {
                const dataFormatada = dataObj.toLocaleDateString('pt-BR');
                const horaFormatada = dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                preencherTexto('valDataEmissao', `${dataFormatada} às ${horaFormatada}`);
            } else {
                preencherTexto('valDataEmissao', '-');
            }
        } else {
            preencherTexto('valDataEmissao', '-');
        }

        // 5. Riscos e EPIs (Sua lógica original que estava boa)
        const riscosContainer = document.getElementById('listaRiscosDoc');
        const riscosMapeados = [
            { label: 'Trabalho a Quente', ativo: pt.requerTrabalhoQuente },
            { label: 'Trabalho a Frio', ativo: pt.requerTrabalhoFrio },
            { label: 'Trabalho em Altura', ativo: pt.requerTrabalhoAltura },
            { label: 'Espaço Confinado', ativo: pt.requerEspacoConfinado },
            { label: 'Risco Elétrico', ativo: pt.requerRiscoEletrico },
            { label: 'Alta Tensão / SEP', ativo: pt.requerAltaTensaoSep },
            { label: 'Área Classificada', ativo: pt.requerAreaClassificada },
            { label: 'Segurança em Máquinas', ativo: pt.requerSegurancaMaquinas },
            { label: 'Bloqueio e LOTO', ativo: pt.requerLoto },
            { label: 'Atividade de Pintura', ativo: pt.requerAtividadePintura }
        ];

        const riscosAtivos = riscosMapeados.filter(r => r.ativo);
        riscosContainer.innerHTML = riscosAtivos.length > 0
            ? riscosAtivos.map(r => `<div class="checkbox-item"><i class="fa-solid fa-square-check"></i> ${r.label}</div>`).join('')
            : '<div class="checkbox-item">Nenhum risco específico marcado.</div>';

        const episContainer = document.getElementById('listaEpisDoc');
        if (pt.episObrigatorios && Array.isArray(pt.episObrigatorios) && pt.episObrigatorios.length > 0) {
            episContainer.innerHTML = pt.episObrigatorios.map(epi => `<span style="display: inline-block; background: #e2e3e5; color: #000; padding: 3px 8px; margin: 2px; border-radius: 3px; font-weight: bold;">[X] ${epi}</span>`).join(' ');
        } else {
            episContainer.innerHTML = 'Nenhum EPI específico cadastrado ou calculado.';
        }

        const btnImprimir = document.getElementById('btnImprimir');
        if (btnImprimir) {
            btnImprimir.addEventListener('click', () => {
                window.print();
            });
        }

        // Botão de Gerar e Salvar PDF Automático
        const btnSalvarPdf = document.getElementById('btnSalvarPdf');
        if (btnSalvarPdf) {
            btnSalvarPdf.addEventListener('click', () => {
                const element = document.getElementById('conteudo-pt');
                const nomeArquivo = `PT_Nº${pt.id || '000'}.pdf`; // Nome automático baseado no ID da PT

                const opt = {
                    margin: 10, // Margens em milímetros
                    filename: nomeArquivo,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2 }, // Aumenta a nitidez do PDF
                    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                };

                // Executa a biblioteca para gerar e baixar o PDF
                html2pdf().set(opt).from(element).save();
            });
        }

    } catch (error) {
        console.error("Erro ao carregar documento da PT:", error);
        alert("Falha ao gerar o documento oficial da PT.");
    }
});