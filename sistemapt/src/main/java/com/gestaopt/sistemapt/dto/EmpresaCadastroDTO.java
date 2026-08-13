package com.gestaopt.sistemapt.dto;

public class EmpresaCadastroDTO {

    // Dados da Empresa
    private String nomeFantasia;
    private String cnpj;

    // Dados do Primeiro Usuário Administrador (Master da Empresa)
    private String nomeAdmin;
    private String usuarioAdmin; // O login
    private String senhaAdmin;

    // ==========================================
    // GETTERS E SETTERS (Gerados para o Spring ler e gravar os dados)
    // ==========================================
    public String getNomeFantasia() {
        return nomeFantasia;
    }

    public void setNomeFantasia(String nomeFantasia) {
        this.nomeFantasia = nomeFantasia;
    }

    public String getCnpj() {
        return cnpj;
    }

    public void setCnpj(String cnpj) {
        this.cnpj = cnpj;
    }

    public String getNomeAdmin() {
        return nomeAdmin;
    }

    public void setNomeAdmin(String nomeAdmin) {
        this.nomeAdmin = nomeAdmin;
    }

    public String getUsuarioAdmin() {
        return usuarioAdmin;
    }

    public void setUsuarioAdmin(String usuarioAdmin) {
        this.usuarioAdmin = usuarioAdmin;
    }

    public String getSenhaAdmin() {
        return senhaAdmin;
    }

    public void setSenhaAdmin(String senhaAdmin) {
        this.senhaAdmin = senhaAdmin;
    }
}
