// Variável global para armazenar a lista de colaboradores e permitir a busca rápida
let listaColaboradoresGlobal = [];

document.addEventListener('DOMContentLoaded', () => {
    // 1. Verificação de Segurança (Sessão)
    const logado = sessionStorage.getItem('usuarioLogado');
    if (!logado) {
        window.location.href = 'login.html';
        return;
    }

    const usuario = JSON.parse(logado);
    const perfil = usuario.perfil ? usuario.perfil.toUpperCase() : '';

    console.log("Gerenciamento de Colaboradores carregado. Acesso como: ", perfil);

    // Carrega os dados da API
    carregarColaboradores();

    // 2. Configura o evento de busca em tempo real
    const campoBusca = document.getElementById('campoBusca');
    if (campoBusca) {
        campoBusca.addEventListener('input', (e) => {
            const termo = e.target.value.toLowerCase().trim();
            filtrarColaboradores(termo);
        });
    }
});

// Função para buscar colaboradores no backend
async function carregarColaboradores() {
    try {
        const response = await fetch('http://localhost:8080/api/funcionarios');
        if (!response.ok) {
            throw new Error('Erro ao buscar colaboradores na API.');
        }

        listaColaboradoresGlobal = await response.json();
        renderizarTabela(listaColaboradoresGlobal);

    } catch (error) {
        console.error("Erro ao carregar colaboradores:", error);
        const corpoTabela = document.getElementById('tabelaCorpo');
        if (corpoTabela) {
            corpoTabela.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; color: #ff6b6b; padding: 20px;">
                        Erro ao conectar com o servidor para carregar os colaboradores.
                    </td>
                </tr>`;
        }
    }
}

// Filtra a lista global com base no termo digitado (Nome ou Matrícula)
function filtrarColaboradores(termo) {
    if (!termo) {
        renderizarTabela(listaColaboradoresGlobal);
        return;
    }

    const filtrados = listaColaboradoresGlobal.filter(func => {
        const nome = (func.nome || '').toLowerCase();
        const matricula = (func.matricula || '').toLowerCase();
        return nome.includes(termo) || matricula.includes(termo);
    });

    renderizarTabela(filtrados);
}

// Renderiza os dados na tabela HTML
function renderizarTabela(lista) {
    const corpoTabela = document.getElementById('tabelaCorpo');
    if (!corpoTabela) return;

    if (lista.length === 0) {
        corpoTabela.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 20px;">
                    Nenhum colaborador encontrado.
                </td>
            </tr>`;
        return;
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    corpoTabela.innerHTML = lista.map(func => {
        // Formatação de datas e verificação de vencimento (ASO)
        let asoFormatado = '-';
        let classeAso = '';
        if (func.validadeASO) {
            const dataAso = new Date(func.validadeASO + 'T00:00:00');
            asoFormatado = dataAso.toLocaleDateString('pt-BR');
            if (dataAso < hoje) {
                classeAso = 'color: #ff6b6b; font-weight: bold;'; // Vencido
                asoFormatado += ' ⚠️ (Vencido)';
            }
        } else {
            asoFormatado = 'Ausente';
            classeAso = 'color: #ff9f43;';
        }

        // Formatação de datas e verificação de validade de PT / Reciclagem
        let validadePtFormatado = '-';
        let classeValidadePt = '';
        if (func.validadeReciclagemPt) {
            const dataRec = new Date(func.validadeReciclagemPt + 'T00:00:00');
            validadePtFormatado = dataRec.toLocaleDateString('pt-BR');
            if (dataRec < hoje) {
                classeValidadePt = 'color: #ff6b6b; font-weight: bold;';
                validadePtFormatado += ' ⚠️ (Vencida)';
            }
        } else {
            validadePtFormatado = 'Ausente';
            classeValidadePt = 'color: #ff9f43;';
        }

        // NRs / Treinamentos
        const nrsVencidas = func.nrsVencidas || func.quantidadeNrsVencidas || 'Nenhuma';

        // 🏢 Tratamento seguro para extrair o nome fantasia da empresa associada
        let nomeEmpresa = '-';
        if (func.empresa) {
            if (typeof func.empresa === 'object') {
                nomeEmpresa = func.empresa.nomeFantasia || func.empresa.nome || func.empresa.razaoSocial || '-';
            } else {
                nomeEmpresa = func.empresa;
            }
        }

        return `
            <tr>
                <td><strong>${func.nome || '-'}</strong></td>
                <td>${func.matricula || '-'}</td>
                <td>${func.funcao || '-'}</td>
                <td>${nomeEmpresa}</td>
                <td><span style="${classeAso}">${asoFormatado}</span></td>
                <td><span style="${classeValidadePt}">${validadePtFormatado}</span></td>
                <td>${nrsVencidas}</td>
                <td class="coluna-acoes">
                    <a href="editar-colaborador.html?id=${func.id}" class="btn-acao-editar" title="Editar Colaborador">✏️ Editar</a>
                </td>
            </tr>
        `;
    }).join('');
}