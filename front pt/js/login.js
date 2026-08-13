// 🛡️ PROTEÇÃO ANTI-AUTOFILL ATUALIZADA
document.addEventListener('DOMContentLoaded', () => {
    // Atualizado para o novo ID 'usrAcesso'
    const campoUsuario = document.getElementById('usrAcesso');
    const campoSenha = document.getElementById('senha');

    if (campoUsuario && campoSenha) {
        // Executa imediatamente
        campoUsuario.value = '';
        campoSenha.value = '';

        // ⚡ TRUQUE DO DELAY: O Chrome tenta injetar os dados logo após o carregamento. 
        // Esse bloco roda 50 milissegundos depois e limpa qualquer insistência do navegador.
        setTimeout(() => {
            campoUsuario.value = '';
            campoSenha.value = '';
        }, 50);

        // Quando o operador clica no campo de senha, ele vira password real
        campoSenha.addEventListener('focus', () => {
            campoSenha.type = 'password';
        });

        // Se clicar fora e estiver vazio, volta a ser text
        campoSenha.addEventListener('blur', () => {
            if (campoSenha.value === '') {
                campoSenha.type = 'text';
            }
        });
    }
});

// 🚀 ENVIO PARA A API JAVA (RECONFIGURADO PARA API EXTERNA)
document.getElementById('formLogin').addEventListener('submit', async (e) => {
    e.preventDefault();

    const usuario = document.getElementById('usrAcesso').value;
    const senha = document.getElementById('senha').value;
    const msgDiv = document.getElementById('msg');

    msgDiv.textContent = "Autenticando...";
    msgDiv.className = "message";

    try {
        const response = await fetch('http://localhost:8080/api/autenticacao/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario, senha })
        });

        if (response.ok) {
            const dadosUsuario = await response.json();
            const nomeExibicao = typeof dadosUsuario.usuario === 'string'
                ? dadosUsuario.usuario
                : (dadosUsuario.nome || "Usuário");

            msgDiv.textContent = `Acesso Permitido! Bem-vindo, ${nomeExibicao}.`;
            msgDiv.className = "message success";

            sessionStorage.clear();
            sessionStorage.setItem('usuarioLogado', JSON.stringify(dadosUsuario));

            if (dadosUsuario.empresaId) {
                sessionStorage.setItem('empresaId', dadosUsuario.empresaId);
            } else if (dadosUsuario.empresa && dadosUsuario.empresa.id) {
                sessionStorage.setItem('empresaId', dadosUsuario.empresa.id);
            } else {
                sessionStorage.removeItem('empresaId');
            }

            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 800);
        } else {
            const erroTexto = await response.text();
            msgDiv.textContent = erroTexto || "Falha no login.";
            msgDiv.className = "message error";
        }
    } catch (error) {
        console.error("Erro de conexão:", error);
        msgDiv.textContent = "Erro ao conectar com o servidor. Verifique se o Java está rodando.";
        msgDiv.className = "message error";
    }
});
        