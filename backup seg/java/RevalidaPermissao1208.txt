package com.gestaopt.sistemapt.model;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "permissao_revalidacoes") // 👈 Mudado de 'pt_revalidacoes' para evitar a sigla
public class RevalidaPermissao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "permissao_id", nullable = false) // 👈 Mudado de 'pt_id' para 'permissao_id'
    @JsonIgnoreProperties("revalidacoes")
    private PermissaoTrabalho permissaoTrabalho;

    @Column(name = "data_hora_revalidacao")
    @JsonProperty("dataHoraRevalidacao")
    private LocalDateTime dataHoraRevalidacao;

    // --- INÍCIO DA JORNADA ---
    @Column(name = "inicio_jornada")
    @JsonProperty("inicioJornada")
    private LocalDateTime inicioJornada;

    @Column(name = "emitente_inicio_nome")
    @JsonProperty("emitenteInicioNome")
    private String emitenteInicioNome;

    @Column(name = "emitente_inicio_matricula")
    @JsonProperty("emitenteInicioMatricula")
    private String emitenteInicioMatricula;

    // --- MONITORAMENTO AMBIENTAL (Gases) ---
    @Column(name = "gas_oxigenio")
    @JsonProperty("gasOxigenio")
    private Double gasOxigenio;

    @Column(name = "gas_explosividade")
    @JsonProperty("gasExplosividade")
    private Double gasExplosividade;

    @Column(name = "gas_toxicidade")
    @JsonProperty("gasToxicidade")
    private Double gasToxicidade;

    // --- TÉRMINO DA JORNADA ---
    @Column(name = "termino_jornada")
    @JsonProperty("terminoJornada")
    private LocalDateTime terminoJornada;

    @Column(name = "emitente_fim_nome")
    @JsonProperty("emitenteFimNome")
    private String emitenteFimNome;

    @Column(name = "emitente_fim_matricula")
    @JsonProperty("emitenteFimMatricula")
    private String emitenteFimMatricula;

    // --- CONSTRUTOR PADRÃO ---
    public RevalidaPermissao() {
    }

    // --- GETTERS AND SETTERS ---
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public PermissaoTrabalho getPermissaoTrabalho() {
        return permissaoTrabalho;
    }

    public void setPermissaoTrabalho(PermissaoTrabalho permissaoTrabalho) {
        this.permissaoTrabalho = permissaoTrabalho;
    }

    public LocalDateTime getDataHoraRevalidacao() {
        return dataHoraRevalidacao;
    }

    public void setDataHoraRevalidacao(LocalDateTime dataHoraRevalidacao) {
        this.dataHoraRevalidacao = dataHoraRevalidacao;
    }

    public LocalDateTime getInicioJornada() {
        return inicioJornada;
    }

    public void setInicioJornada(LocalDateTime inicioJornada) {
        this.inicioJornada = inicioJornada;
    }

    public String getEmitenteInicioNome() {
        return emitenteInicioNome;
    }

    public void setEmitenteInicioNome(String emitenteInicioNome) {
        this.emitenteInicioNome = emitenteInicioNome;
    }

    public String getEmitenteInicioMatricula() {
        return emitenteInicioMatricula;
    }

    public void setEmitenteInicioMatricula(String emitenteInicioMatricula) {
        this.emitenteInicioMatricula = emitenteInicioMatricula;
    }

    public Double getGasOxigenio() {
        return gasOxigenio;
    }

    public void setGasOxigenio(Double gasOxigenio) {
        this.gasOxigenio = gasOxigenio;
    }

    public Double getGasExplosividade() {
        return gasExplosividade;
    }

    public void setGasExplosividade(Double gasExplosividade) {
        this.gasExplosividade = gasExplosividade;
    }

    public Double getGasToxicidade() {
        return gasToxicidade;
    }

    public void setGasToxicidade(Double gasToxicidade) {
        this.gasToxicidade = gasToxicidade;
    }

    public LocalDateTime getTerminoJornada() {
        return terminoJornada;
    }

    public void setTerminoJornada(LocalDateTime terminoJornada) {
        this.terminoJornada = terminoJornada;
    }

    public String getEmitenteFimNome() {
        return emitenteFimNome;
    }

    public void setEmitenteFimNome(String emitenteFimNome) {
        this.emitenteFimNome = emitenteFimNome;
    }

    public String getEmitenteFimMatricula() {
        return emitenteFimMatricula;
    }

    public void setEmitenteFimMatricula(String emitenteFimMatricula) {
        this.emitenteFimMatricula = emitenteFimMatricula;
    }
}
