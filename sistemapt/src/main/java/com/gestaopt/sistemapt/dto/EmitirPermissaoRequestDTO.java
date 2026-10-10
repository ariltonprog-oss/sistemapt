package com.gestaopt.sistemapt.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.gestaopt.sistemapt.model.EspecialidadeAST;

public class EmitirPermissaoRequestDTO {

    private LocalDateTime dataHoraInicio;
    private String recomendacoesEmissor;
    private String lotoDetalhes;
    private String alturaDetalhes;
    private String nomeAst;
    private String monitoramentoAmbiental;
    private String turnoGrupo;
    private Long emitenteId;
    private String matricula;
    
    // --- NOVOS CAMPOS ADICIONADOS ---
    private String numeroPec;
    private List<EspecialidadeAST> astsVinculadas;

    // Getters e Setters existentes
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

    // --- GETTERS E SETTERS DOS NOVOS CAMPOS ---
    public String getNumeroPec() {
        return numeroPec;
    }

    public void setNumeroPec(String numeroPec) {
        this.numeroPec = numeroPec;
    }

    public List<EspecialidadeAST> getAstsVinculadas() {
        return astsVinculadas;
    }

    public void setAstsVinculadas(List<EspecialidadeAST> astsVinculadas) {
        this.astsVinculadas = astsVinculadas;
    }
}