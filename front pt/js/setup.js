async function executarSetup() {
    // Atenção: As chaves aqui devem ser idênticas aos nomes dos campos no seu DTO Java
    const dadosCadastro = {
        nomeFantasia: document.getElementById('nomeEmpresa').value, // Ajustado para nomeFantasia
        cnpj: document.getElementById('cnpjEmpresa').value,
        nomeAdmin: document.getElementById('nomeAdmin').value,
        usuarioAdmin: document.getElementById('loginAdmin').value,
        senhaAdmin: document.getElementById('senhaAdmin').value
    };

    const response = await fetch('http://localhost:8080/api/empresas', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(dadosCadastro)
    });

    if (response.ok) {
        alert("Sistema configurado com sucesso! Redirecionando...");
        window.location.href = 'dashboard.html';
    } else {
        // Se der erro, mostra o que o Java respondeu
        const erro = await response.text();
        alert("Erro ao configurar sistema: " + erro);
    }
}