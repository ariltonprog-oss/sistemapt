document.addEventListener("DOMContentLoaded", function () {

    // 1. Obtém o usuário logado
    const usuarioLogado = JSON.parse(sessionStorage.getItem('usuarioLogado')) || {};

    // Normaliza o perfil vindo do banco/sessão
    const perfil = (
        usuarioLogado.perfil ||
        usuarioLogado.funcao ||
        usuarioLogado.tipo ||
        ''
    ).toUpperCase().trim();

    // 2. REGRAS DE ADMINISTRADOR / MASTER
    const ehAdminSistema = usuarioLogado.ehAdminSistema === true ||
        ['ADMIN_SISTEMA', 'MASTER_SISTEMA'].includes(perfil);

    const ehMasterEmpresa = usuarioLogado.ehMasterEmpresa === true ||
        ['MASTER_EMPRESA', 'ADMIN_EMPRESA', 'MASTER', 'ADMIN', 'ADM'].includes(perfil) ||
        perfil.includes('MASTER');

    // 3. REGRAS OPERACIONAIS BASEADAS NO <SELECT> DO SEU HTML:
    const podeSolicitar = usuarioLogado.podeSolicitar === true ||
        ['OFICIAL', 'ENCARREGADO'].includes(perfil);

    // 4. MONTAGEM DINÂMICA DO MENU
    let menuLinks = "";

    if (ehAdminSistema) {
        // ⚙️ MENU ADMINISTRADOR DO SISTEMA MULTITENANT
        menuLinks += `
        <li><a href="admin.html">Gerenciar Empresas</a></li>
        <li><a href="lista-admins.html">Lista de Administradores</a></li>
    `;
    }
    else if (ehMasterEmpresa) {
        // 👑 MENU MASTER / ADMIN DA EMPRESA CLIENTE
        menuLinks += `
        <li><a href="dashboard.html">Monitoramento</a></li>
        <li><a href="cadastro.html">Cadastro de Usuário</a></li>
        <li><a href="gerenciar.html">Gerenciar Colaboradores</a></li>
    `;
    }
    else {
        // 🛠️ MENU OPERACIONAL (CHÃO DE FÁBRICA)
        menuLinks += `<li><a href="dashboard.html">Monitoramento</a></li>`;

        // Exibe "Solicitar PT" apenas para OFICIAL e ENCARREGADO
        if (podeSolicitar) {
            menuLinks += `<li><a href="solicitar-pt.html">Solicitar Permissão de Trabalho</a></li>`;
        }
        // *Nota: O link de Emitir/Encerrar foi removido daqui pois agora a ação é feita 
        // diretamente na tabela do Dashboard por botão contextual.
    }

    // 5. Adiciona o botão de Logout (Sair) no final do menu
    menuLinks += `
        <li>
            <a href="#" onclick="sessionStorage.clear(); window.location.href='login.html'">
                Sair
            </a>
        </li>
    `;

    // Recupera dados para o cabeçalho da empresa na sidebar
    const logado = sessionStorage.getItem('usuarioLogado');
    const usuario = logado ? JSON.parse(logado) : null;
    const nomeEmpresa = (usuario && usuario.empresaNome) ? usuario.empresaNome : 'Notlira';
    const primeiraLetra = nomeEmpresa.charAt(0).toUpperCase();
    const restoDoNome = nomeEmpresa.slice(1);

    // 6. Constrói o HTML final da barra lateral
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

        <ul class="sidebar-menu">
            ${menuLinks}
        </ul>
    </nav>`;

    // 7. Injeta a barra lateral na tela
    const container = document.getElementById('sidebar-wrapper');
    if (container) {
        container.innerHTML = sidebarHTML;
    } else {
        document.body.insertAdjacentHTML('afterbegin', sidebarHTML);
    }

});