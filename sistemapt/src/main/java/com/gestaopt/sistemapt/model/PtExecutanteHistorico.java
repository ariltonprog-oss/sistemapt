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
@Table(name = "pt_executantes_historico")
public class PtExecutanteHistorico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "permissao_trabalho_id", nullable = false)
    private PermissaoTrabalho permissaoTrabalho;

    @Column(name = "nome_funcionario", nullable = false)
    private String nomeFuncionario;

    @Column(name = "matricula")
    private String matricula;

    @Column(name = "tipo_acao", nullable = false) // "ENTRADA" ou "SAIDA"
    private String tipoAcao;

    @Column(name = "data_hora_registro", nullable = false)
    private LocalDateTime dataHoraRegistro = LocalDateTime.now();

    @Column(name = "observacao", length = 500)
    private String observacao;

    @Column(name = "registrado_por")
    private String registradoPor; // Operador que inseriu no sistema

    // Construtores, Getters e Setters
    public PtExecutanteHistorico() {
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

    public String getTipoAcao() {
        return tipoAcao;
    }

    public void setTipoAcao(String tipoAcao) {
        this.tipoAcao = tipoAcao;
    }

    public LocalDateTime getDataHoraRegistro() {
        return dataHoraRegistro;
    }

    public void setDataHoraRegistro(LocalDateTime dataHoraRegistro) {
        this.dataHoraRegistro = dataHoraRegistro;
    }

    public String getObservacao() {
        return observacao;
    }

    public void setObservacao(String observacao) {
        this.observacao = observacao;
    }

    public String getRegistradoPor() {
        return registradoPor;
    }

    public void setRegistradoPor(String registradoPor) {
        this.registradoPor = registradoPor;
    }
}
