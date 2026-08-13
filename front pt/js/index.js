//🔒 Segurança da Sessão
document.addEventListener('DOMContentLoaded', () => {
    const logado = sessionStorage.getItem('usuarioLogado');
    if (!logado) {
        window.location.href = 'login.html';
        return;
    }

    const usuario = JSON.parse(logado);
    const perfil = usuario.perfil ? usuario.perfil.toUpperCase() : '';
    const API_BASE_URL = 'http://localhost:8080/api';

    document.getElementById('txtIdentificacao').textContent = `👤 ${usuario.nome} [${usuario.perfil}]`;

    const isAdminSistema = perfil === 'ADMIN_SISTEMA' || perfil === 'ADMIN';
    const isAdminSesmt = perfil === 'ADMIN_SESMT';
    const isMasterEmpresa = perfil === 'MASTER_EMPRESA' || perfil === 'MASTER';

    if (isAdminSistema || isAdminSesmt) {
        document.getElementById('painelIndicadores').classList.remove('escondido');
        carregarMetricasDoBanco();

        document.getElementById('modAdmin').classList.remove('escondido');
        document.getElementById('modSolicitar').classList.remove('escondido');
        document.getElementById('modPesquisar').classList.remove('escondido');
        document.getElementById('modRenovacao').classList.remove('escondido');
    } else if (perfil === 'SOLICITANTE' || perfil === 'SOLICITANTE_EXECUTANTE') {
        document.getElementById('modSolicitar').classList.remove('escondido');
        document.getElementById('modPesquisar').classList.remove('escondido');
    } else if (perfil === 'EMITENTE') {
        document.getElementById('modPesquisar').classList.remove('escondido');
        document.getElementById('modRenovacao').classList.remove('escondido');
    } else if (isMasterEmpresa) {
        document.getElementById('modSolicitar').classList.remove('escondido');
        document.getElementById('modPesquisar').classList.remove('escondido');
    }

    window.logout = function () {
        sessionStorage.removeItem('usuarioLogado');
        window.location.href = '/login.html';
    };

    async function carregarMetricasDoBanco() {
        try {
            const resFunc = await fetch(`${API_BASE_URL}/funcionarios`);
            if (resFunc.ok) {
                const funcionarios = await resFunc.json();
                const dataAtual = new Date();
                let aptos = 0, vencidos = 0;

                funcionarios.forEach(f => {
                    const aso = f.validadeAso ? new Date(f.validadeAso) : null;
                    const nr = f.validadeTreinamento ? new Date(f.validadeTreinamento) : null;
                    if ((aso && aso < dataAtual) || (nr && nr < dataAtual)) vencidos++;
                    else aptos++;
                });
                document.getElementById('qtdAptos').textContent = aptos;
                document.getElementById('qtdVencidos').textContent = vencidos;
            }
            const resPts = await fetch(`${API_BASE_URL}/permissoes-trabalho`);
            if (resPts.ok) {
                const pts = await resPts.json();
                document.getElementById('qtdPtsAbertas').textContent = pts.length;
            }
        } catch (e) {
            console.error("Erro nas métricas:", e);
        }
    }
});