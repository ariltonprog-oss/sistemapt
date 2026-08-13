package com.gestaopt.sistemapt.model;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "funcionarios")
public class Funcionario {

    public static final String PERFIL_ADMIN_SISTEMA = "ADMIN_SISTEMA";
    public static final String PERFIL_MASTER_EMPRESA = "MASTER_EMPRESA";
    public static final String PERFIL_EMITENTE = "EMITENTE";
    public static final String PERFIL_EXECUTANTE = "EXECUTANTE";
    public static final String PERFIL_SOLICITANTE = "SOLICITANTE";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- DADOS BÁSICOS ---
    private String nome;
    private String matricula;
    private String funcao;
    private boolean podeSolicitarPt;
    private boolean podeEmitirPt;
    @Column(name = "eh_terceiro", nullable = false) // Adicione nullable = false
    private Boolean ehTerceiro = false; // 👈 Inicialize com false aqui

    @ManyToOne
    @JoinColumn(name = "empresa_id", nullable = false)
    private Empresa empresa;

    // --- REQUISITOS DE SAÚDE E SEGURANÇA (HISTÓRICO COMPLETO) ---
    private LocalDate realizacaoAso; // 👈 NOVA
    private LocalDate validadeAso;

    private LocalDate realizacaoReciclagemPt; // 👈 NOVA
    private LocalDate validadeReciclagemPt;

    // Treinamentos de NR's Obrigatórios (Realização e Vencimento)
    private LocalDate realizacaoNr01; // 👈 NOVA
    private LocalDate validadeNr01;

    private LocalDate realizacaoNr10; // 👈 NOVA
    private LocalDate validadeNr10;

    private LocalDate realizacaoNr10Sep; // 👈 NOVA
    private LocalDate validadeNr10Sep;

    private LocalDate realizacaoNr12; // 👈 NOVA
    private LocalDate validadeNr12;

    private LocalDate realizacaoNr13; // 👈 NOVA
    private LocalDate validadeNr13;

    private LocalDate realizacaoNr18; // 👈 NOVA
    private LocalDate validadeNr18;

    private LocalDate realizacaoNr20; // 👈 NOVA
    private LocalDate validadeNr20;

    private LocalDate realizacaoNr33; // 👈 NOVA
    private LocalDate validadeNr33;

    // Mapeamento explícito da NR-35 acompanhando o padrão existente
    @Column(name = "realizacao_trabalho_altura") // 👈 NOVA
    private LocalDate realizacaoNr35;

    @Column(name = "validade_trabalho_altura")
    private LocalDate validadeNr35;

    private LocalDate realizacaoBrigada; // 👈 NOVA
    private LocalDate validadeBrigada;

    // --- CAMPOS DE SEGURANÇA E ACESSO ---
    private String usuario;
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String senha;
    private String perfil;

    // --- HIERARQUIA ADMINISTRATIVA ---
    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "administrador_id")
    private Funcionario administradorResponsavel;

    // --- CONSTRUTOR PADRÃO ---
    public Funcionario() {
    }

    // --- GETTERS AND SETTERS ---
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getMatricula() {
        return matricula;
    }

    public void setMatricula(String matricula) {
        this.matricula = matricula;
    }

    public String getFuncao() {
        return funcao;
    }

    public void setFuncao(String funcao) {
        this.funcao = funcao;
    }

    public boolean isEhTerceiro() {
        return ehTerceiro;
    }

    public void setEhTerceiro(boolean ehTerceiro) {
        this.ehTerceiro = ehTerceiro;
    }

    public Empresa getEmpresa() {
        return empresa;
    }

    public void setEmpresa(Empresa empresa) {
        this.empresa = empresa;
    }

    public LocalDate getRealizacaoAso() {
        return realizacaoAso;
    }

    public void setRealizacaoAso(LocalDate realizacaoAso) {
        this.realizacaoAso = realizacaoAso;
    }

    public LocalDate getValidadeAso() {
        return validadeAso;
    }

    public void setValidadeAso(LocalDate validadeAso) {
        this.validadeAso = validadeAso;
    }

    public LocalDate getRealizacaoReciclagemPt() {
        return realizacaoReciclagemPt;
    }

    public void setRealizacaoReciclagemPt(LocalDate realizacaoReciclagemPt) {
        this.realizacaoReciclagemPt = realizacaoReciclagemPt;
    }

    public LocalDate getValidadeReciclagemPt() {
        return validadeReciclagemPt;
    }

    public void setValidadeReciclagemPt(LocalDate validadeReciclagemPt) {
        this.validadeReciclagemPt = validadeReciclagemPt;
    }

    public boolean isPodeSolicitarPt() {
        return podeSolicitarPt;
    }

    public void setPodeSolicitarPt(boolean podeSolicitarPt) {
        this.podeSolicitarPt = podeSolicitarPt;
    }

    public boolean isPodeEmitirPt() {
        return podeEmitirPt;
    }

    public void setPodeEmitirPt(boolean podeEmitirPt) {
        this.podeEmitirPt = podeEmitirPt;
    }

    public LocalDate getRealizacaoNr01() {
        return realizacaoNr01;
    }

    public void setRealizacaoNr01(LocalDate realizacaoNr01) {
        this.realizacaoNr01 = realizacaoNr01;
    }

    public LocalDate getValidadeNr01() {
        return validadeNr01;
    }

    public void setValidadeNr01(LocalDate validadeNr01) {
        this.validadeNr01 = validadeNr01;
    }

    public LocalDate getRealizacaoNr10() {
        return realizacaoNr10;
    }

    public void setRealizacaoNr10(LocalDate realizacaoNr10) {
        this.realizacaoNr10 = realizacaoNr10;
    }

    public LocalDate getValidadeNr10() {
        return validadeNr10;
    }

    public void setValidadeNr10(LocalDate validadeNr10) {
        this.validadeNr10 = validadeNr10;
    }

    public LocalDate getRealizacaoNr10Sep() {
        return realizacaoNr10Sep;
    }

    public void setRealizacaoNr10Sep(LocalDate realizacaoNr10Sep) {
        this.realizacaoNr10Sep = realizacaoNr10Sep;
    }

    public LocalDate getValidadeNr10Sep() {
        return validadeNr10Sep;
    }

    public void setValidadeNr10Sep(LocalDate validadeNr10Sep) {
        this.validadeNr10Sep = validadeNr10Sep;
    }

    public LocalDate getRealizacaoNr12() {
        return realizacaoNr12;
    }

    public void setRealizacaoNr12(LocalDate realizacaoNr12) {
        this.realizacaoNr12 = realizacaoNr12;
    }

    public LocalDate getValidadeNr12() {
        return validadeNr12;
    }

    public void setValidadeNr12(LocalDate validadeNr12) {
        this.validadeNr12 = validadeNr12;
    }

    public LocalDate getRealizacaoNr13() {
        return realizacaoNr13;
    }

    public void setRealizacaoNr13(LocalDate realizacaoNr13) {
        this.realizacaoNr13 = realizacaoNr13;
    }

    public LocalDate getValidadeNr13() {
        return validadeNr13;
    }

    public void setValidadeNr13(LocalDate validadeNr13) {
        this.validadeNr13 = validadeNr13;
    }

    public LocalDate getRealizacaoNr18() {
        return realizacaoNr18;
    }

    public void setRealizacaoNr18(LocalDate realizacaoNr18) {
        this.realizacaoNr18 = realizacaoNr18;
    }

    public LocalDate getValidadeNr18() {
        return validadeNr18;
    }

    public void setValidadeNr18(LocalDate validadeNr18) {
        this.validadeNr18 = validadeNr18;
    }

    public LocalDate getRealizacaoNr20() {
        return realizacaoNr20;
    }

    public void setRealizacaoNr20(LocalDate realizacaoNr20) {
        this.realizacaoNr20 = realizacaoNr20;
    }

    public LocalDate getValidadeNr20() {
        return validadeNr20;
    }

    public void setValidadeNr20(LocalDate validadeNr20) {
        this.validadeNr20 = validadeNr20;
    }

    public LocalDate getRealizacaoNr33() {
        return realizacaoNr33;
    }

    public void setRealizacaoNr33(LocalDate realizacaoNr33) {
        this.realizacaoNr33 = realizacaoNr33;
    }

    public LocalDate getValidadeNr33() {
        return validadeNr33;
    }

    public void setValidadeNr33(LocalDate validadeNr33) {
        this.validadeNr33 = validadeNr33;
    }

    public LocalDate getRealizacaoNr35() {
        return realizacaoNr35;
    }

    public void setRealizacaoNr35(LocalDate realizacaoNr35) {
        this.realizacaoNr35 = realizacaoNr35;
    }

    public LocalDate getValidadeNr35() {
        return validadeNr35;
    }

    public void setValidadeNr35(LocalDate validadeNr35) {
        this.validadeNr35 = validadeNr35;
    }

    public LocalDate getRealizacaoBrigada() {
        return realizacaoBrigada;
    }

    public void setRealizacaoBrigada(LocalDate realizacaoBrigada) {
        this.realizacaoBrigada = realizacaoBrigada;
    }

    public LocalDate getValidadeBrigada() {
        return validadeBrigada;
    }

    public void setValidadeBrigada(LocalDate validadeBrigada) {
        this.validadeBrigada = validadeBrigada;
    }

    public String getUsuario() {
        return usuario;
    }

    public void setUsuario(String usuario) {
        this.usuario = usuario;
    }

    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }

    public String getPerfil() {
        return perfil;
    }

    public void setPerfil(String perfil) {
        this.perfil = perfil;
    }

    public Funcionario getAdministradorResponsavel() {
        return administradorResponsavel;
    }

    public void setAdministradorResponsavel(Funcionario administradorResponsavel) {
        this.administradorResponsavel = administradorResponsavel;
    }
}
