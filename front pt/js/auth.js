function verificarAutenticacao() {
    const logado = sessionStorage.getItem('usuarioLogado');

    // 1. Verifica se existe algo no sessionStorage
    if (!logado) {
        window.location.href = 'login.html';
        return null;
    }

    try {
        // 2. Tenta transformar a string em objeto
        return JSON.parse(logado);
    } catch (e) {
        // 3. Se deu erro (JSON corrompido), limpa e manda pro login
        console.error("Erro ao ler usuário do sessionStorage:", e);
        sessionStorage.clear();
        window.location.href = 'login.html';
        return null;
    }
}