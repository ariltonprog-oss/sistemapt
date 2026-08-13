 async function renderizarFormularioOficial() {
            try {
                const params = new URLSearchParams(window.location.search);
                const ptId = params.get('id');

                if (!ptId) {
                    alert("ID da Permissão de Trabalho não foi fornecido.");
                    return;
                }

                const response = await fetch('http://localhost:8080/api/permissoes-trabalho');
                if (!response.ok) throw new Error("Erro na requisição ao servidor.");

                const lista = await response.json();
                const pt = lista.find(p => p.id == ptId);

                if (!pt) {
                    alert("PT de número #" + ptId + " não encontrada no banco.");
                    return;
                }

                // 🛡️ BLOQUEIO DE SEGURANÇA ATUALIZADO DO FLUXO
                // Agora aceita tanto EMITIDA quanto EM_REVALIDACAO para permitir a consulta física
                if (pt.status !== 'EMITIDA' && pt.status !== 'EM_REVALIDACAO') {
                    document.body.innerHTML = `
                    <div class="bloqueio-sesmt-container">
                        <h2 class="bloqueio-sesmt-titulo">⚠️ Acesso Bloqueado pelo SESMT</h2>
                        <p class="bloqueio-sesmt-texto">O formulário técnico e os checklists operacionais só ficam disponíveis após a PT ter sido oficialmente EMITIDA e assinada pelo Emitente.</p>
                        <br>
                        <p><b>Status Atual desta PT:</b> <span class="bloqueio-sesmt-badge">${pt.status}</span></p>
                    </div>
                `;
                    return;
                }

                // 1. PREENCHIMENTO DOS CAMPOS GERAIS DO CABEÇALHO
                document.getElementById('pId').textContent = pt.id;
                document.getElementById('pStatus').textContent = pt.status;
                document.getElementById('pData').textContent = pt.dataHoraEmissao ? new Date(pt.dataHoraEmissao).toLocaleString('pt-BR') : new Date().toLocaleString('pt-BR');
                document.getElementById('pPlanta').textContent = pt.plantaArea || 'N/A';
                document.getElementById('pTurno').textContent = pt.turnoGrupo || 'N/A';
                document.getElementById('pTag').textContent = pt.tag || 'N/A';
                document.getElementById('pOrdem').textContent = pt.ordemPj || 'N/A';
                document.getElementById('pEmpresa').textContent = pt.empresaGestora || 'N/A';
                document.getElementById('pArea').textContent = pt.areaAtuacao || 'Não Informada';
                document.getElementById('pDescricao').textContent = pt.descricaoAtividade || 'Nenhuma descrição detalhada fornecida.';

                // 2. PREENCHIMENTO DE RESPONSÁVEIS E MATRÍCULAS (BLOCO 16)
                document.getElementById('pNomeSolicitante').textContent = pt.solicitante ? pt.solicitante.nome : 'Assinado Eletronicamente';
                document.getElementById('pNomeEmitente').textContent = pt.emitente ? pt.emitente.nome : 'Assinado Eletronicamente';

                // Mapeamento direto com base nas propriedades do Funcionario.java
                document.getElementById('pMatriculaSolicitante').textContent = (pt.solicitante && pt.solicitante.matricula) ? pt.solicitante.matricula : '---';
                document.getElementById('pMatriculaEmitente').textContent = (pt.emitente && pt.emitente.matricula) ? pt.emitente.matricula : '---';

                // 3. PREENCHIMENTO DO PRIMEIRO EXECUTANTE / EMPRESA / MATRÍCULA (BLOCO 21)
                if (pt.solicitanteExecutante && pt.solicitante) {
                    document.getElementById('pExecutantePrincipal').textContent = pt.solicitante.nome + " (Solicitante Executante)";

                    // Injeta dinamicamente a empresa parceira na linha 1 da tabela
                    const campoEmpresaTabela = document.getElementById('pEmpresaExecutantePrincipal');
                    if (campoEmpresaTabela) {
                        campoEmpresaTabela.textContent = pt.empresaGestora || '---';
                    }
                } else {
                    document.getElementById('pExecutantePrincipal').textContent = "";
                }

                // 4. 🌟 INTELIGÊNCIA DINÂMICA DO BLOCO 12 (MONITORAMENTO AMBIENTAL)
                const divMonitoramento = document.getElementById('blocoMonitoramentoAtmosferico');
                if (divMonitoramento) {
                    const precisaMonitoramento = pt.requerEspacoConfinado === true || pt.requerTrabalhoQuente === true;

                    if (precisaMonitoramento) {
                        divMonitoramento.classList.remove('hidden'); // Usa classes CSS em vez de inline styles
                    } else {
                        divMonitoramento.classList.add('hidden');
                    }
                }

                // 5. RENDERIZAÇÃO DO CHECKLIST DE NRs DO ESCOPO
                const corpoChecklist = document.getElementById('pCorpoChecklist');
                if (corpoChecklist) {
                    corpoChecklist.innerHTML = '';

                    const adicionarLinha = (condicao, nomeNorma, instrucaoSeguranca) => {
                        corpoChecklist.innerHTML += `
                        <tr>
                            <td class="bold">${nomeNorma}</td>
                            <td class="text-center bold">${condicao ? '✅ APLICA' : '⬜ N/A'}</td>
                            <td><small>${condicao ? instrucaoSeguranca : 'Dispensado para esta ordem de serviço.'}</small></td>
                        </tr>
                    `;
                    };

                    adicionarLinha(pt.requerTrabalhoFrio, "Trabalho a Frio (Riscos Mecânicos)", "Adoção de EPIs gerais da planta, óculos de segurança e proteção mecânica.");
                    adicionarLinha(pt.requerTrabalhoQuente, "Trabalho a Quente (Fagulhas/Centelha)", "Afastamento de materiais combustíveis, disponibilização de extintor CO2/PQS e inspeção pós-término.");
                    adicionarLinha(pt.requerTrabalhoAltura, "Trabalho em Altura (NR-35)", "Linha de vida operacional, cinto paraquedista conectado acima da cintura e inspeção prévia dos talabartes.");
                    adicionarLinha(pt.requerEspacoConfinado, "Espaço Confinado (NR-33)", "Vigia posicionado externamente em tempo integral, rádio comunicação ativo e exaustão mecânica ligada.");
                    adicionarLinha(pt.requerRiscoEletrico, "Risco Elétrico (NR-10)", "Desenergização total, teste de tensão zero e aplicação de mantas isolantes onde necessário.");
                    adicionarLinha(pt.requerLoto, "Bloqueio LOTO (Cartões e Cadeados)", "Instalação de cadeados pessoais nas garras de isolamento e preenchimento da etiqueta de bloqueio individual.");
                    adicionarLinha(pt.requerSegurancaMaquinas, "Segurança em Máquinas (NR-12)", "Garantia de que as proteções fixas voltaram ao lugar antes dos testes de funcionamento.");
                }

                // Força abertura automática da caixa de impressão somente após processar tudo
                setTimeout(() => {
                    window.print();
                }, 500);

            } catch (err) {
                console.error(err);
                alert("Erro ao ler os dados do banco para o formulário.");
            }
        }

        window.onload = renderizarFormularioOficial;