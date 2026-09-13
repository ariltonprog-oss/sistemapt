document.addEventListener("DOMContentLoaded", async function () {

    // 1. Obtém o usuário logado do sessionStorage
    const usuarioLogado = JSON.parse(sessionStorage.getItem('usuarioLogado')) || {};
    const nomeUsuario = usuarioLogado.nome || usuarioLogado.usuario || 'Usuário';
    const funcionarioId = usuarioLogado.id;

    // Normaliza o perfil vindo da sessão
    const perfil = (
        usuarioLogado.perfil ||
        usuarioLogado.tipo ||
        ''
    ).toUpperCase().trim();

    // 2. Busca a função direto da API do funcionário (Funcionario.java) se houver ID
    let funcaoExibicao = '';
    if (funcionarioId) {
        try {
            const response = await fetch(`http://localhost:8080/api/funcionarios/${funcionarioId}`);
            if (response.ok) {
                const funcionario = await response.json();
                funcaoExibicao = funcionario.funcao || funcionario.cargo || '';
            }
        } catch (error) {
            console.error("Erro ao buscar dados do funcionário para a sidebar:", error);
        }
    }

    // Fallback caso a API falhe, tentando pegar da sessão
    if (!funcaoExibicao) {
        funcaoExibicao = usuarioLogado.funcao || usuarioLogado.cargo || '';
    }

    // Formata o texto da função para exibição elegante
    const funcaoFormatada = funcaoExibicao ? String(funcaoExibicao).replace('_', ' ') : '';
    const htmlFuncao = funcaoFormatada ? `<div class="funcao-usuario">${funcaoFormatada}</div>` : '';

    // 3. REGRAS DE ADMINISTRADOR / MASTER
    const ehAdminSistema = usuarioLogado.ehAdminSistema === true ||
        ['ADMIN_SISTEMA', 'MASTER_SISTEMA'].includes(perfil);

    const ehMasterEmpresa = usuarioLogado.ehMasterEmpresa === true ||
        ['MASTER_EMPRESA', 'ADMIN_EMPRESA', 'MASTER', 'ADMIN', 'ADM'].includes(perfil) ||
        perfil.includes('MASTER');

    const podeSolicitar = usuarioLogado.podeSolicitar === true ||
        ['OFICIAL', 'ENCARREGADO'].includes(perfil);

    // 4. MONTAGEM DINÂMICA DO MENU
    let menuLinks = "";

    if (ehAdminSistema) {
        menuLinks += `
        <li><a href="admin.html">Gerenciar Empresas</a></li>
        <li><a href="lista-admins.html">Lista de Administradores</a></li>
    `;
    }
    else if (ehMasterEmpresa) {
        menuLinks += `
        <li><a href="dashboard.html">Monitoramento</a></li>
        <li><a href="cadastro.html">Cadastro de Usuário</a></li>
        <li><a href="gerenciar-colaborador.html">Gerenciar Colaboradores</a></li>
    `;
    }
    else {
        menuLinks += `<li><a href="dashboard.html">Monitoramento</a></li>`;
        if (podeSolicitar) {
            menuLinks += `<li><a href="solicitar-pt.html">Solicitar Permissão de Trabalho</a></li>`;
        }
    }

    menuLinks += `
        <li>
            <a href="#" onclick="sessionStorage.clear(); window.location.href='login.html'">
                Sair
            </a>
        </li>
    `;

    // Cabeçalho da empresa na sidebar
    const nomeEmpresa = (usuarioLogado && usuarioLogado.empresaNome) ? usuarioLogado.empresaNome : 'Notlira';
    const primeiraLetra = nomeEmpresa.charAt(0).toUpperCase();
    const restoDoNome = nomeEmpresa.slice(1);

    // 5. Constrói o HTML final da barra lateral
    const sidebarHTML = `
    <nav class="sidebar">
        <div class="sidebar-header">
            <h3>
                ${ehAdminSistema
            ? 'PAINEL INSTALAÇÃO'
            : ehMasterEmpresa
                ? 'PAINEL EMPRESA'
                : 'SISTEMA PT'
        }
            </h3>
        </div>

        <!-- BLOCO EMPRESA GESTORA -->
        <div class="sidebar-empresa-gestora">
            <span class="label-empresa">Empresa Gestora</span>
            <div class="nome-empresa">
                <span class="letra-destaque">${primeiraLetra}</span>${restoDoNome}
            </div>
        </div>

        <!-- BLOCO USUÁRIO LOGADO -->
        <div class="usuario-logado-sidebar">
            <span class="label-usuario">Usuário Logado</span>
            <div class="nome-usuario">${nomeUsuario}</div>
            ${htmlFuncao}
        </div>

        <ul class="sidebar-menu">
            ${menuLinks}
        </ul>
    </nav>`;

    // 6. Injeta a barra lateral na tela
    const container = document.getElementById('sidebar-wrapper');
    if (container) {
        container.innerHTML = sidebarHTML;
    } else {
        document.body.insertAdjacentHTML('afterbegin', sidebarHTML);
    }

});