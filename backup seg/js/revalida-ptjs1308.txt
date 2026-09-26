let ptAtual = null;
let executantesReais = [];

document.addEventListener("DOMContentLoaded", async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const ptId = urlParams.get('id');

    if (!ptId) {
        alert("ID da PT não informado.");
        window.location.href = "dashboard.html";
        return;
    }

    // Preenche data e hora atuais automaticamente para o término da jornada
    const agora = new Date();
    document.getElementById('revalData').value = agora.toISOString().split('T')[0];
    document.getElementById('revalHora').value = agora.toTimeString().slice(0, 5);

    // Preenche o Emitente com o usuário logado
    const usuarioLogado = JSON.parse(sessionStorage.getItem('usuarioLogado'));
    if (usuarioLogado && usuarioLogado.nome) {
        document.getElementById('revalEmitente').value = usuarioLogado.nome;
    }

    try {
        const response = await fetch(`http://localhost:8080/api/permissoes-trabalho/${ptId}`, {
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
        });

        if (response.ok) {
            ptAtual = await response.json();
            
            // 1. Preenche os campos do cabeçalho de resumo
            if (document.getElementById('plantaArea')) document.getElementById('plantaArea').value = ptAtual.plantaArea || '';
            if (document.getElementById('turnoGrupo')) document.getElementById('turnoGrupo').value = ptAtual.turnoGrupo || '';
            if (document.getElementById('tag')) document.getElementById('tag').value = ptAtual.tag || '';
            if (document.getElementById('ordemPj')) document.getElementById('ordemPj').value = ptAtual.ordemPj || '';
            if (document.getElementById('descricaoAtividade')) document.getElementById('descricaoAtividade').value = ptAtual.descricaoAtividade || '';

            // 2. Carrega os executantes/equipe já vinculados à PT
            const listaExecutantesBackend = ptAtual.executantes || ptAtual.equipeExecutante || ptAtual.executantesReais || [];
            if (Array.isArray(listaExecutantesBackend) && listaExecutantesBackend.length > 0) {
                executantesReais = listaExecutantesBackend.map(e => ({
                    matricula: e.matricula || '',
                    nome: e.nome || '',
                    funcao: e.funcao || '---'
                }));
            } else if (ptAtual.solicitante) {
                // Caso o backend traga o solicitante principal
                executantesReais.push({
                    matricula: ptAtual.solicitante.matricula || '',
                    nome: ptAtual.solicitante.nome || '',
                    funcao: ptAtual.solicitante.funcao || '---'
                });
            }
            atualizarTabelaExecutantes();

            // 3. Controla o ciclo de revalidações (Limite de 4 revalidações após a emissão = 5 dias total)
            const qtdRevalAtuais = ptAtual.quantidadeRevalidacoes || 0;
            const proximaEtapa = qtdRevalAtuais + 1;

            if (proximaEtapa > 4) {
                alert("Atenção: Esta PT atingiu o limite máximo de 4 revalidações (5 dias). Ela será redirecionada para a Baixa compulsória.");
                window.location.href = `baixar-pt.html?id=${ptId}`;
                return;
            }

            document.getElementById('revalEtapa').value = `${proximaEtapa}ª Revalidação (Ciclo ${proximaEtapa} de 4)`;
        } else {
            alert("Erro ao buscar dados da PT.");
        }
    } catch (error) {
        console.error("Erro de conexão:", error);
    }

    // 4. Gestão de Adição/Remoção de Executantes
    const inputMatricula = document.getElementById('inputMatricula');
    const inputNomeExecutante = document.getElementById('inputNomeExecutante');
    const btnAdicionarExecutante = document.getElementById('btnAdicionarExecutante');
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

    window.removerExecutante = function(index) {
        executantesReais.splice(index, 1);
        atualizarTabelaExecutantes();
    };

    // 5. Envio do formulário de revalidação
    const formRevalidacao = document.getElementById('formRevalidacao');
    formRevalidacao.addEventListener('submit', async (e) => {
        e.preventDefault();

        const statusTurno = document.getElementById('statusTurno').value;

        let servicoConcluido = false;
        let revalidacaoParaContinuidade = true;
        let servicoInterrompido = false;

        if (statusTurno === 'CONCLUIDO') {
            servicoConcluido = true;
            revalidacaoParaContinuidade = false;
        } else if (statusTurno === 'INTERROMPIDO') {
            servicoConcluido = false;
            revalidacaoParaContinuidade = false;
            servicoInterrompido = true;
        } else {
            servicoConcluido = false;
            revalidacaoParaContinuidade = true;
        }

        const payload = {
            dataTerminoJornada: document.getElementById('revalData').value,
            horaTerminoJornada: document.getElementById('revalHora').value,
            emitente: document.getElementById('revalEmitente').value,
            servicoConcluido: servicoConcluido,
            revalidacaoParaContinuidade: revalidacaoParaContinuidade,
            servicoInterrompido: servicoInterrompido,
            observacoes: document.getElementById('revalObservacoes').value,
            executantesReais: executantesReais
        };

        try {
            const response = await fetch(`http://localhost:8080/api/permissoes-trabalho/${ptId}/revalidar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert("Revalidação e registro de turno salvos com sucesso!");
                
                if (statusTurno === 'CONCLUIDO' || statusTurno === 'INTERROMPIDO') {
                    window.location.href = `baixar-pt.html?id=${ptId}`;
                } else {
                    window.location.href = "dashboard.html";
                }
            } else {
                alert("Erro ao salvar a revalidação no servidor.");
            }
        } catch (error) {
            console.error("Erro de comunicação:", error);
            alert("Falha de comunicação com o servidor.");
        }
    });
});

function atualizarTabelaExecutantes() {
    const tbodyExecutantes = document.getElementById('tbodyExecutantes');
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