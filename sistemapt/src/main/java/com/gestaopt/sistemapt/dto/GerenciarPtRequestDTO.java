package com.gestaopt.sistemapt.dto;

import java.util.List;

public class GerenciarPtRequestDTO {

    private List<ExecutanteApoioDTO> executantesAdicionados;
    private List<ExecutanteSaidaDTO> executantesRemovidos;
    private List<RiscoDinamicoDTO> riscosDinamicos;

    // --- Sub-classes DTO ---
    public static class ExecutanteApoioDTO {

        private String nomeFuncionario;
        private String matricula;

        public String getNomeFuncionario() {
            return nomeFuncionario;
        }

        public void setNomeFuncionario(String nomeFuncionario) {
            this.nomeFuncionario = nomeFuncionario;
        }

        public String getMatricula() {
            return matricula;
        }

        public void setMatricula(String matricula) {
            this.matricula = matricula;
        }
    }

    public static class ExecutanteSaidaDTO {

        private String nomeFuncionario;
        private String matricula;
        private String observacao;

        public String getNomeFuncionario() {
            return nomeFuncionario;
        }

        public void setNomeFuncionario(String nomeFuncionario) {
            this.nomeFuncionario = nomeFuncionario;
        }

        public String getMatricula() {
            return matricula;
        }

        public void setMatricula(String matricula) {
            this.matricula = matricula;
        }

        public String getObservacao() {
            return observacao;
        }

        public void setObservacao(String observacao) {
            this.observacao = observacao;
        }
    }

    public static class RiscoDinamicoDTO {

        private String descricaoRisco;
        private String medidasControle;

        public String getDescricaoRisco() {
            return descricaoRisco;
        }

        public void setDescricaoRisco(String descricaoRisco) {
            this.descricaoRisco = descricaoRisco;
        }

        public String getMedidasControle() {
            return medidasControle;
        }

        public void setMedidasControle(String medidasControle) {
            this.medidasControle = medidasControle;
        }
    }

    // --- Getters e Setters principais ---
    public List<ExecutanteApoioDTO> getExecutantesAdicionados() {
        return executantesAdicionados;
    }

    public void setExecutantesAdicionados(List<ExecutanteApoioDTO> executantesAdicionados) {
        this.executantesAdicionados = executantesAdicionados;
    }

    public List<ExecutanteSaidaDTO> getExecutantesRemovidos() {
        return executantesRemovidos;
    }

    public void setExecutantesRemovidos(List<ExecutanteSaidaDTO> executantesRemovidos) {
        this.executantesRemovidos = executantesRemovidos;
    }

    public List<RiscoDinamicoDTO> getRiscosDinamicos() {
        return riscosDinamicos;
    }

    public void setRiscosDinamicos(List<RiscoDinamicoDTO> riscosDinamicos) {
        this.riscosDinamicos = riscosDinamicos;
    }
}
