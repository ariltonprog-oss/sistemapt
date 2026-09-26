// =========================================================================
// 1. INICIALIZAÇÃO E EVENTOS DA PÁGINA
// =========================================================================

document.addEventListener('DOMContentLoaded', async () => {
    // Vincula o botão de salvar
    const btnSalvar = document.getElementById('btnDispararSubmit');
    if (btnSalvar) btnSalvar.addEventListener('click', salvarAlteracoes);

    // Vincula a mudança da função (para atualizar a grade de NRs)
    const selectFuncao = document.getElementById('funcao');
    if (selectFuncao) selectFuncao.addEventListener('change', atualizarMatrizNRs);

    // 🚀 Vincula a mudança do Perfil Operacional para alternar a flag de Emitente
    const selectPerfil = document.getElementById('perfil');
    if (selectPerfil) selectPerfil.addEventListener('change', alternarFlagEmitente);

    // Vincula o evento para alternar o campo de empresa parceira
    const selectTerceiro = document.getElementById('ehTerceiro');
    if (selectTerceiro) {
        selectTerceiro.addEventListener('change', toggleEmpresa);
    }

    // Carrega a lista de empresas terceirizadas primeiro
    await carregarEmpresasTerceiras();

    // Carrega os dados do colaborador para edição
    await carregarDadosDoColaborador();
});

// =========================================================================
// 2. FUNÇÕES DE SUPORTE A EMPRESAS TERCEIRIZADAS E MODAL
// =========================================================================

async function carregarEmpresasTerceiras() {
    const select = document.getElementById('selectEmpresaTerceira');
    if (!select) return;

    try {
        const response = await fetch('http://localhost:8080/api/empresas/terceiras');
        if (!response.ok) throw new Error('Erro ao buscar lista de empresas');

        const empresas = await response.json();
        const valorAtual = select.value;

        select.innerHTML = '<option value="">Selecione a empresa terceirizada...</option>';

        empresas.forEach(empresa => {
            const option = document.createElement('option');
            option.value = empresa.id;
            option.textContent = empresa.nomeFantasia;
            select.appendChild(option);
        });

        if (valorAtual) select.value = valorAtual;
    } catch (error) {
        console.error('Erro ao carregar empresas terceiras:', error);
    }
}

function toggleEmpresa() {
    const ehTerceiro = document.getElementById('ehTerceiro')?.value === "true";
    const grupoEmpresa = document.getElementById('grupoEmpresa');

    if (grupoEmpresa) {
        grupoEmpresa.style.display = ehTerceiro ? 'block' : 'none';
        if (ehTerceiro) {
            carregarEmpresasTerceiras();
        }
    }
}

function abrirModalEmpresa() {
    const modal = document.getElementById('modalNovaEmpresa');
    if (modal) {
        modal.classList.remove('oculto');
        modal.style.display = 'flex';
    }
}

function fecharModalEmpresa() {
    const modal = document.getElementById('modalNovaEmpresa');
    if (modal) {
        modal.classList.add('oculto');
        modal.style.display = 'none';
    }

    const inputNome = document.getElementById('modalNomeFantasia');
    const inputCnpj = document.getElementById('modalCnpj');
    if (inputNome) inputNome.value = '';
    if (inputCnpj) inputCnpj.value = '';
}

async function salvarNovaEmpresaTerceira() {
    const nomeFantasia = document.getElementById('modalNomeFantasia')?.value.trim();
    const cnpj = document.getElementById('modalCnpj')?.value.trim();

    if (!nomeFantasia || !cnpj) {
        alert("Por favor, preencha o Nome Fantasia e o CNPJ da empresa.");
        return;
    }

    try {
        const response = await fetch('http://localhost:8080/api/empresas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nomeFantasia, cnpj, ativo: true })
        });

        if (!response.ok) {
            const erro = await response.text();
            throw new Error(erro);
        }

        const empresaSalva = await response.json();
        alert("Empresa terceirizada cadastrada com sucesso!");

        fecharModalEmpresa();
        await carregarEmpresasTerceiras();

        const select = document.getElementById('selectEmpresaTerceira');
        if (select) select.value = empresaSalva.id;

    } catch (error) {
        console.error("Erro ao salvar empresa:", error);
        alert("Erro ao cadastrar empresa: " + error.message);
    }
}

// =========================================================================
// 3. CARREGAMENTO DOS DADOS DO COLABORADOR
// =========================================================================

async function carregarDadosDoColaborador() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
        alert("Erro: ID do colaborador não encontrado na URL.");
        window.location.href = "gerenciar.html";
        return;
    }

    try {
        const response = await fetch(`http://localhost:8080/api/funcionarios/${id}`);
        if (!response.ok) throw new Error("Erro ao buscar dados do colaborador.");

        const funcionario = await response.json();

        // Preenche campos simples
        if (document.getElementById('nome')) document.getElementById('nome').value = funcionario.nome || '';
        if (document.getElementById('matricula')) document.getElementById('matricula').value = funcionario.matricula || '';
        if (document.getElementById('funcao')) document.getElementById('funcao').value = funcionario.funcao || '';
        if (document.getElementById('perfil')) document.getElementById('perfil').value = funcionario.perfil || '';
        if (document.getElementById('usuario')) document.getElementById('usuario').value = funcionario.usuario || '';

        // Preenche tipo (Próprio / Terceiro) e Empresa
        const selectTerceiro = document.getElementById('ehTerceiro');
        if (selectTerceiro) {
            selectTerceiro.value = funcionario.ehTerceiro ? "true" : "false";
            toggleEmpresa();

            if (funcionario.ehTerceiro && funcionario.empresa) {
                const selectEmpresa = document.getElementById('selectEmpresaTerceira');
                if (selectEmpresa) {
                    selectEmpresa.value = funcionario.empresa.id;
                }
            }
        }

        // 🚀 Atualiza o estado de exibição do card de Emitente conforme o perfil carregado
        alternarFlagEmitente();

        // Permissão de Emissão de PT
        const chkPodeEmitir = document.getElementById('podeEmitirPT');
        if (chkPodeEmitir) {
            chkPodeEmitir.checked = !!funcionario.podeEmitirPt;
        }

        // Aguarda o Java retornar as NRs do cargo e renderizar os cards na tela
        await atualizarMatrizNRs();

        // Datas Fixas (ASO e PT)
        if (document.getElementById('realizacaoASO')) document.getElementById('realizacaoASO').value = funcionario.realizacaoASO || '';
        if (document.getElementById('validadeASO')) document.getElementById('validadeASO').value = funcionario.validadeASO || '';
        if (document.getElementById('realizacaoReciclagemPt')) document.getElementById('realizacaoReciclagemPt').value = funcionario.realizacaoReciclagemPt || '';
        if (document.getElementById('validadeReciclagemPt')) document.getElementById('validadeReciclagemPt').value = funcionario.validadeReciclagemPt || '';

        // Preenche as NRs dinâmicas percorrendo os cards recém-criados no HTML
        document.querySelectorAll('.card-nr-item').forEach(card => {
            const tagStrong = card.querySelector("strong");
            if (!tagStrong) return;

            const nr = tagStrong.innerText.trim(); // "NR10"
            const nomeCampo = obterNomeCampoJava(nr); // "Nr10"

            if (nomeCampo) {
                const inputR = document.getElementById(`realizacao_${nr}`);
                if (inputR) {
                    inputR.value = funcionario["realizacao" + nomeCampo] || '';
                }
            }
        });

    } catch (error) {
        console.error(error);
        alert("Não foi possível carregar os dados.");
    }
}

// =========================================================================
// 4. ATUALIZAÇÃO DA GRADE DE NRs E CONTROLE DE PERFIL
// =========================================================================

async function atualizarMatrizNRs() {
    const selectFuncao = document.getElementById('funcao');
    if (!selectFuncao) return;

    const funcao = selectFuncao.value;
    const container = document.getElementById('containerMatrizNRs');
    if (!container) return;

    if (!funcao) {
        container.innerHTML = '<p>Selecione uma função para ver as NRs.</p>';
        return;
    }

    try {
        const response = await fetch(`http://localhost:8080/api/funcionarios/requisitos-cargo/${encodeURIComponent(funcao)}`);

        if (!response.ok) {
            throw new Error('Erro ao buscar requisitos do cargo no servidor');
        }

        const nrsExigidas = await response.json();

        if (!nrsExigidas || nrsExigidas.length === 0) {
            container.innerHTML = '<p>Nenhuma NR específica exigida para esta função.</p>';
            return;
        }

        let html = '<div class="grid-nrs">';

        nrsExigidas.forEach(req => {
            const sigla = req.sigla;
            const nome = req.nome;

            html += `<div class="card-nr-item" data-nr="${sigla}">
                <label><strong>${sigla}</strong></label>
                <small style="display:block; margin-bottom: 5px;">${nome}</small>
                
                <div class="form-group">
                    <input type="date" id="realizacao_${sigla}" class="form-control">
                </div>
            </div>`;
        });

        container.innerHTML = html + '</div>';

    } catch (error) {
        console.error("Erro ao carregar NRs do backend:", error);
        container.innerHTML = '<p style="color:red;">Erro ao carregar NRs para esta função.</p>';
    }
}

// =========================================================================
// CONTROLE DE EXIBIÇÃO DA PERMISSÃO DE EMISSÃO (SÓ PARA PERFIL ENCARREGADO)
// =========================================================================
function alternarFlagEmitente() {
    const selectPerfil = document.getElementById('perfil');
    const container = document.getElementById('containerAlcadaEmissao');
    const checkboxEmitente = document.getElementById('podeEmitirPT');

    if (!selectPerfil || !container) return;

    const valorPerfil = selectPerfil.value ? selectPerfil.value.toLowerCase().trim() : "";
    const idx = selectPerfil.selectedIndex;
    const textoPerfil = (idx >= 0 && selectPerfil.options[idx]) 
        ? selectPerfil.options[idx].text.toLowerCase().trim() 
        : "";

    const ehEncarregado = valorPerfil.includes('encarregado') || textoPerfil.includes('encarregado');

    if (ehEncarregado) {
        container.style.removeProperty('display');
        container.classList.remove('elemento-escondido');
        container.style.display = 'flex';
    } else {
        container.classList.add('elemento-escondido');
        container.style.display = 'none';

        if (checkboxEmitente) {
            checkboxEmitente.checked = false;
        }
    }
}

window.alternarFlagEmitente = alternarFlagEmitente;

// =========================================================================
// MAPEAMENTO DE SIGLAS DAS NRs PARA ATRIBUTOS DA ENTIDADE JAVA
// =========================================================================
function obterNomeCampoJava(nr) {
    if (!nr) return null;
    const cleanNr = nr.toUpperCase().replace('-', '').replace(' ', '').trim();
    switch (cleanNr) {
        case "NR01": return "Nr01";
        case "NR10": return "Nr10";
        case "NR10SEP": return "Nr10Sep";
        case "NR11": return "Nr11";
        case "NR12": return "Nr12";
        case "NR13": return "Nr13";
        case "NR18": return "Nr18";
        case "NR20": return "Nr20";
        case "NR33": return "Nr33";
        case "NR34": return "Nr34";
        case "NR35": return "Nr35";
        case "BRIGADA": return "Brigada";
        default: return cleanNr.charAt(0).toUpperCase() + cleanNr.slice(1).toLowerCase();
    }
}

// =========================================================================
// 5. ENVIO DAS ALTERAÇÕES (PUT)
// =========================================================================

async function salvarAlteracoes() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
        alert("ID do colaborador não informado.");
        return;
    }

    const usuarioLogado = JSON.parse(sessionStorage.getItem('usuarioLogado'));
    const ehTerceiro = document.getElementById('ehTerceiro')?.value === "true";
    const empresaTerceiraId = document.getElementById('selectEmpresaTerceira')?.value;

    if (ehTerceiro && !empresaTerceiraId) {
        alert("Por favor, selecione a empresa parceira do colaborador terceiro.");
        return;
    }

    let objetoEmpresa = null;
    if (ehTerceiro) {
        objetoEmpresa = { id: parseInt(empresaTerceiraId) };
    } else if (usuarioLogado && usuarioLogado.empresaId) {
        objetoEmpresa = { id: parseInt(usuarioLogado.empresaId) };
    } else {
        objetoEmpresa = { id: 1 };
    }

    // 🚀 Tratativa inteligente da regra de emissão de PT
    const perfilSelecionado = document.getElementById('perfil')?.value;
    let podeEmitirPtFinal = false;
    if (perfilSelecionado === 'OPERADOR_INDUSTRIAL') {
        podeEmitirPtFinal = true;
    } else if (perfilSelecionado === 'ENCARREGADO') {
        podeEmitirPtFinal = document.getElementById('podeEmitirPT')?.checked || false;
    }

    const data = {
        id: parseInt(id),
        nome: document.getElementById('nome')?.value.trim(),
        matricula: document.getElementById('matricula')?.value.trim(),
        funcao: document.getElementById('funcao')?.value,
        perfil: perfilSelecionado,
        usuario: document.getElementById('usuario')?.value.trim(),
        senha: document.getElementById('senha') ? document.getElementById('senha').value : "",

        ehTerceiro: ehTerceiro,
        empresa: objetoEmpresa,

        podeEmitirPt: podeEmitirPtFinal,
        podeSolicitarPt: perfilSelecionado === "SOLICITANTE",

        realizacaoASO: document.getElementById('realizacaoASO')?.value || null,
        validadeASO: document.getElementById('validadeASO')?.value || null,
        realizacaoReciclagemPt: document.getElementById('realizacaoReciclagemPt')?.value || null,
        validadeReciclagemPt: document.getElementById('validadeReciclagemPt')?.value || null,

        usuarioLogadoId: usuarioLogado ? usuarioLogado.id : null
    };

    document.querySelectorAll('.card-nr-item').forEach(card => {
        const tagStrong = card.querySelector("strong");
        if (!tagStrong) return;

        const nr = card.dataset.nr || tagStrong.innerText.trim();
        const nomeCampo = obterNomeCampoJava(nr);
        if (!nomeCampo) return;

        const realizacao = card.querySelector(`input[id="realizacao_${nr}"]`)
            || card.querySelector(`input[id="realizacao${nomeCampo}"]`);

        if (realizacao && realizacao.value) {
            data["realizacao" + nomeCampo] = realizacao.value;
        } else {
            data["realizacao" + nomeCampo] = null;
        }
    });

    try {
        const resp = await fetch(`http://localhost:8080/api/funcionarios/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if (!resp.ok) {
            const erroDetalhado = await resp.text();
            console.error("ERRO DO SERVIDOR:", erroDetalhado);
            throw new Error(erroDetalhado);
        }

        alert("Alterações salvas com sucesso!");
        window.location.href = 'gerenciar.html';
    } catch (erro) {
        console.error("Erro ao salvar:", erro);
        alert("Erro ao salvar: " + erro.message);
    }
}