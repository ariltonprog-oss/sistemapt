// Variável global para armazenar a empresa logada atual
let empresaIdLogada = null;

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

    // Identifica o ID da empresa associada ao usuário logado
    // (Ajuste a propriedade conforme o objeto salvo na sua sessão, ex: usuario.empresaId ou usuario.empresa.id)
    empresaIdLogada = usuario.empresaId || (usuario.empresa ? usuario.empresa.id : null);

    if (!empresaIdLogada) {
        console.warn("ID da empresa não encontrado na sessão. Tentando carregar ID padrão ou genérico se aplicável.");
        empresaIdLogada = 1; // Fallback de segurança se necessário
    }

    // Carrega as funções para o <select> e os colaboradores da empresa
    carregarFuncoesDaEmpresa();
    carregarColaboradores();

    // 2. Configura os eventos de escuta para busca e filtros
    const campoBusca = document.getElementById('campoBusca');
    const filtroStatus = document.getElementById('filtroStatus');
    const filtroFuncao = document.getElementById('filtroFuncao');
    const filtroTipo = document.getElementById('filtroTipo'); // 🔹 ADICIONADO AQUI
    const filtroTreinamento = document.getElementById('filtroTreinamento');

    if (campoBusca) {
        campoBusca.addEventListener('input', () => carregarColaboradores());
    }
    if (filtroStatus) {
        filtroStatus.addEventListener('change', () => carregarColaboradores());
    }
    if (filtroFuncao) {
        filtroFuncao.addEventListener('change', () => carregarColaboradores());
    }
    if (filtroTipo) { // 🔹 ADICIONADO AQUI
        filtroTipo.addEventListener('change', () => carregarColaboradores());
    }
    if (filtroTreinamento) {
        filtroTreinamento.addEventListener('change', () => carregarColaboradores());
    }
});

// Função para buscar as funções distintas da empresa e popular o <select>
async function carregarFuncoesDaEmpresa() {
    console.log("🔍 A tentar carregar funções para o ID da empresa:", empresaIdLogada);

    if (!empresaIdLogada) {
        console.warn("⚠️ Alerta: O ID da empresa está vazio na sessão!");
        return;
    }

    try {
        const url = `http://localhost:8080/api/funcionarios/empresa/${empresaIdLogada}/funcoes`;
        console.log("🔍 A efetuar pedido fetch para o URL:", url);

        const response = await fetch(url);
        console.log("🔍 Estado da resposta da API de funções:", response.status);

        if (!response.ok) {
            console.error("❌ Erro na resposta da API:", response.statusText);
            return;
        }

        const funcoes = await response.json();
        console.log("🔍 Lista de funções recebidas do Java:", funcoes);

        const selectFuncao = document.getElementById('filtroFuncao');
        if (!selectFuncao) return;

        selectFuncao.innerHTML = '<option value="">Todas as Funções</option>';
        funcoes.forEach(funcao => {
            if (funcao) {
                const option = document.createElement('option');
                option.value = funcao;
                option.textContent = funcao;
                selectFuncao.appendChild(option);
            }
        });
    } catch (error) {
        console.error("❌ Erro crítico ao carregar a lista de funções:", error);
    }
}

// Função para buscar colaboradores na API enviando os filtros de backend
async function carregarColaboradores() {
    try {
        const termoBusca = document.getElementById('campoBusca')?.value.trim() || '';
        const statusVal = document.getElementById('filtroStatus')?.value || 'ativo';
        const funcaoVal = document.getElementById('filtroFuncao')?.value || '';
        const tipoVal = document.getElementById('filtroTipo')?.value || ''; // 🔹 ADICIONADO AQUI

        let ativoParam = '';
        if (statusVal === 'ativo') ativoParam = 'true';
        if (statusVal === 'inativo') ativoParam = 'false';

        let url = `http://localhost:8080/api/funcionarios/empresa/${empresaIdLogada}?`;
        const params = new URLSearchParams();

        if (termoBusca) params.append('filtro', termoBusca);
        if (funcaoVal) params.append('funcao', funcaoVal);
        if (statusVal !== 'todos') params.append('ativo', ativoParam);

        if (tipoVal !== '') { // 🔹 ADICIONADO AQUI: envia 'true' (terceiro) ou 'false' (próprio) para o back-end
            params.append('ehTerceiro', tipoVal);
        }

        const response = await fetch(url + params.toString());
        if (!response.ok) {
            throw new Error('Erro ao buscar colaboradores na API.');
        }

        const listaColaboradores = await response.json();
        aplicarFiltroTreinamentoLocal(listaColaboradores);

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

// Filtro complementar de treinamentos executado localmente sobre os dados já filtrados pelo banco
function aplicarFiltroTreinamentoLocal(lista) {
    const treinamentoSelecionado = document.getElementById('filtroTreinamento')?.value || 'todos';
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const filtrados = lista.filter(func => {
        let temVencimento = false;

        if (func.validadeASO) {
            const dataAso = new Date(func.validadeASO + 'T00:00:00');
            if (dataAso < hoje) temVencimento = true;
        } else {
            temVencimento = true;
        }

        if (func.validadeReciclagemPt) {
            const dataRec = new Date(func.validadeReciclagemPt + 'T00:00:00');
            if (dataRec < hoje) temVencimento = true;
        }

        const qtdNrs = Number(func.nrsVencidas || func.quantidadeNrsVencidas || 0);
        if (qtdNrs > 0) temVencimento = true;

        let matchTreinamento = true;
        if (treinamentoSelecionado === 'regular') matchTreinamento = !temVencimento;
        if (treinamentoSelecionado === 'vencidos') matchTreinamento = temVencimento;

        return matchTreinamento;
    });

    renderizarTabela(filtrados);
}

// Renderiza os dados filtrados na tabela HTML (mantido igual ao seu original)
function renderizarTabela(lista) {
    const corpoTabela = document.getElementById('tabelaCorpo');
    if (!corpoTabela) return;

    if (lista.length === 0) {
        corpoTabela.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 20px; color: #666;">
                    Nenhum colaborador encontrado com os filtros selecionados.
                </td>
            </tr>`;
        return;
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    corpoTabela.innerHTML = lista.map(func => {
        let asoFormatado = '-';
        let classeAso = '';
        if (func.validadeASO) {
            const dataAso = new Date(func.validadeASO + 'T00:00:00');
            asoFormatado = dataAso.toLocaleDateString('pt-BR');
            if (dataAso < hoje) {
                classeAso = 'color: #ff6b6b; font-weight: bold;';
                asoFormatado += ' ⚠️ (Vencido)';
            }
        } else {
            asoFormatado = 'Ausente';
            classeAso = 'color: #ff9f43;';
        }

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

        const nrsVencidas = func.nrsVencidas || func.quantidadeNrsVencidas || 'Nenhuma';

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