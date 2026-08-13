
const API_URL = 'http://localhost:8080/api/empresas';

// 🛡️ CONTROLE DE ACESSO: Valida se quem entrou é realmente o instalador Master
const logado = sessionStorage.getItem('usuarioLogado');
if (!logado) {
    window.location.href = './login.html';
} else {
    const usuarioLogado = JSON.parse(logado);
    const perfil = usuarioLogado.perfil ? usuarioLogado.perfil.toUpperCase() : '';
    const isAdminSistema = perfil === 'ADMIN_SISTEMA' || perfil === 'ADMIN';
    if (!isAdminSistema) {
        alert("Acesso Restrito: Painel exclusivo do Administrador do Sistema!");
        window.location.href = './login.html';
    }
}

// 📤 FUNÇÃO: Carrega a lista de empresas do banco de dados Java
async function carregarEmpresas() {
    try {
        const response = await fetch(API_URL);
        if (response.ok) {
            const empresas = await response.json();
            const corpoTabela = document.getElementById('tabelaEmpresasCorpo');
            corpoTabela.innerHTML = '';

            empresas.forEach(emp => {
                corpoTabela.innerHTML += `
                            <tr>
                                <td><strong># ${emp.id}</strong></td>
                                <td>${emp.nomeFantasia}</td>
                                <td>${emp.cnpj}</td>
                                <td><span class="texto-sucesso">🟢 ATIVA / OPERANDO</span></td>
                            </tr>
                        `;
            });
        }
    } catch (error) {
        console.error("Erro ao carregar empresas do CLP:", error);
    }
}

// 📥 FUNÇÃO: Envia o formulário de nova empresa para o back-end
// 📥 FUNÇÃO: Envia o formulário de nova empresa para o back-end
document.getElementById('formCadastroEmpresa').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nomeFantasia = document.getElementById('nomeFantasia').value;
    const cnpj = document.getElementById('cnpj').value;

    const nomeAdmin = document.getElementById('nomeMaster').value;
    const usuarioAdmin = document.getElementById('usuarioMaster').value;
    const senhaAdmin = document.getElementById('senhaMaster').value;
    const msgDiv = document.getElementById('msgFeedback');

    msgDiv.textContent = "Processando gravação no banco de dados...";
    msgDiv.className = "";

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nomeFantasia,
                cnpj,
                nomeAdmin,
                usuarioAdmin,
                senhaAdmin
            })
        });

        if (response.ok) {

            msgDiv.textContent = "✅ Empresa cadastrada com sucesso na rede!";
            msgDiv.className = "texto-sucesso";

            document.getElementById('formCadastroEmpresa').reset();

            carregarEmpresas();

        } else {

            const textoErro = await response.text();

            msgDiv.textContent = "❌ " + (textoErro || "Erro ao registrar.");
            msgDiv.className = "texto-alerta";
        }

    } catch (error) {

        msgDiv.textContent = "❌ Falha de comunicação com o servidor Java.";
        msgDiv.className = "texto-alerta";
    }
});

// Inicialização Automática da Planta
carregarEmpresas();
