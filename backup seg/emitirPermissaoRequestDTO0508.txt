package com.gestaopt.sistemapt.dto;

import java.time.LocalDateTime;

public class EmitirPermissaoRequestDTO {

    private LocalDateTime dataHoraInicio;
    private String recomendacoesEmissor;
    private String lotoDetalhes;
    private String alturaDetalhes;
    private String nomeAst;
    private String monitoramentoAmbiental;
    private String turnoGrupo; // <-- Adicionado aqui
    private Long emitenteId;
    private String matricula;

    // Getters e Setters
    public LocalDateTime getDataHoraInicio() {
        return dataHoraInicio;
    }

    public void setDataHoraInicio(LocalDateTime dataHoraInicio) {
        this.dataHoraInicio = dataHoraInicio;
    }

    public String getRecomendacoesEmissor() {
        return recomendacoesEmissor;
    }

    public void setRecomendacoesEmissor(String recomendacoesEmissor) {
        this.recomendacoesEmissor = recomendacoesEmissor;
    }

    public String getLotoDetalhes() {
        return lotoDetalhes;
    }

    public void setLotoDetalhes(String lotoDetalhes) {
        this.lotoDetalhes = lotoDetalhes;
    }

    public String getAlturaDetalhes() {
        return alturaDetalhes;
    }

    public void setAlturaDetalhes(String alturaDetalhes) {
        this.alturaDetalhes = alturaDetalhes;
    }

    public String getNomeAst() {
        return nomeAst;
    }

    public void setNomeAst(String nomeAst) {
        this.nomeAst = nomeAst;
    }

    public String getMonitoramentoAmbiental() {
        return monitoramentoAmbiental;
    }

    public void setMonitoramentoAmbiental(String monitoramentoAmbiental) {
        this.monitoramentoAmbiental = monitoramentoAmbiental;
    }

    public String getTurnoGrupo() {
        return turnoGrupo;
    }

    public void setTurnoGrupo(String turnoGrupo) {
        this.turnoGrupo = turnoGrupo;
    }

    public Long getEmitenteId() {
        return emitenteId;
    }

    public void setEmitenteId(Long emitenteId) {
        this.emitenteId = emitenteId;
    }

    public String getMatricula() {
        return matricula;
    }

    public void setMatricula(String matricula) {
        this.matricula = matricula;
    }
}
