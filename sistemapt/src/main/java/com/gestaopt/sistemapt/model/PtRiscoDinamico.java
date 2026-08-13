package com.gestaopt.sistemapt.model;

import java.time.LocalDateTime;

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
@Table(name = "pt_riscos_dinamicos")
public class PtRiscoDinamico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "permissao_trabalho_id", nullable = false)
    private PermissaoTrabalho permissaoTrabalho;

    @Column(name = "descricao_risco", nullable = false, length = 255)
    private String descricaoRisco;

    @Column(name = "medidas_controle", nullable = false, length = 500)
    private String medidasControle;

    @Column(name = "data_hora_identificacao", nullable = false)
    private LocalDateTime dataHoraIdentificacao = LocalDateTime.now();

    @Column(name = "registrado_por")
    private String registradoPor;

    // Construtores, Getters e Setters
    public PtRiscoDinamico() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public PermissaoTrabalho getPermissaoTrabalho() {
        return permissaoTrabalho;
    }

    public void setPermissaoTrabalho(PermissaoTrabalho pt) {
        this.permissaoTrabalho = pt;
    }

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

    public LocalDateTime getDataHoraIdentificacao() {
        return dataHoraIdentificacao;
    }

    public void setDataHoraIdentificacao(LocalDateTime dataHoraIdentificacao) {
        this.dataHoraIdentificacao = dataHoraIdentificacao;
    }

    public String getRegistradoPor() {
        return registradoPor;
    }

    public void setRegistradoPor(String registradoPor) {
        this.registradoPor = registradoPor;
    }
}
