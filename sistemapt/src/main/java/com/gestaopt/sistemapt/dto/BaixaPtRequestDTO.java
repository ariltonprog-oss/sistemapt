package com.gestaopt.sistemapt.dto;

import java.util.List;

public class BaixaPtRequestDTO {

    private Boolean servicoConcluido;             // true = Sim, false = Não
    private String equipamentoTestado;            // "TESTADO_AGORA" ou "PROXIMO_TURNO"
    private Boolean revalidacaoParaContinuidade;    // true = Sim, false = Não
    private String justificativaNaoConclusao;       // Obrigatório se não concluído e sem revalidação
    private List<Long> executantesReaisIds;         // IDs dos executantes reais conferidos no papel

    // --- Getters e Setters ---
    public Boolean getServicoConcluido() {
        return servicoConcluido;
    }

    public void setServicoConcluido(Boolean servicoConcluido) {
        this.servicoConcluido = servicoConcluido;
    }

    public String getEquipamentoTestado() {
        return equipamentoTestado;
    }

    public void setEquipamentoTestado(String equipamentoTestado) {
        this.equipamentoTestado = equipamentoTestado;
    }

    public Boolean getRevalidacaoParaContinuidade() {
        return revalidacaoParaContinuidade;
    }

    public void setRevalidacaoParaContinuidade(Boolean revalidacaoParaContinuidade) {
        this.revalidacaoParaContinuidade = revalidacaoParaContinuidade;
    }

    public String getJustificativaNaoConclusao() {
        return justificativaNaoConclusao;
    }

    public void setJustificativaNaoConclusao(String justificativaNaoConclusao) {
        this.justificativaNaoConclusao = justificativaNaoConclusao;
    }

    public List<Long> getExecutantesReaisIds() {
        return executantesReaisIds;
    }

    public void setExecutantesReaisIds(List<Long> executantesReaisIds) {
        this.executantesReaisIds = executantesReaisIds;
    }
}
