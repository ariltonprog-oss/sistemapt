package com.gestaopt.sistemapt.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;

@interface JsonIgnoreProperties {

    String[] value() default {};
}

@interface JsonProperty {

    String value() default "";
}

@Entity
@Table(name = "permissoes_trabalho")
public class PermissaoTrabalho {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("id")
    private Long id;

    // --- BLOCO 1 AO 6: CABEÇALHO DO FORMULÁRIO ---
    @JsonProperty("plantaArea")
    private String plantaArea;

    @Column(name = "data_hora_emissao")
    @JsonProperty("data_HoraEmissao")
    private LocalDateTime dataHoraEmissao;

    @Column(name = "data_hora_inicio")
    @JsonProperty("dataHoraInicio")
    private LocalDateTime dataHoraInicio;

    @Column(name = "data_hora_fim")
    @JsonProperty("dataHoraFim")
    private LocalDateTime dataHoraFim;

    @JsonProperty("empresaGestora")
    private String empresaGestora;

    @Column(name = "turno_grupo")
    @JsonProperty("turnoGrupo")
    private String turnoGrupo;

    @JsonProperty("tag")
    private String tag;

    @JsonProperty("ordemPj")
    private String ordemPj;

    @JsonProperty("emergencial")
    private boolean emergencial = false;

    @Column(name = "descricao_atividade", length = 255, nullable = false)
    @JsonProperty("descricaoAtividade")
    private String descricaoAtividade;

    @Column(name = "recomendacoes_emissor", length = 500)
    @JsonProperty("recomendacoesEmissor")
    private String recomendacoesEmissor;

    @Column(name = "loto_detalhes", length = 255)
    @JsonProperty("lotoDetalhes")
    private String lotoDetalhes;

    @Column(name = "altura_detalhes", length = 255)
    @JsonProperty("alturaDetalhes")
    private String alturaDetalhes;

    @Column(name = "nome_ast", length = 255)
    @JsonProperty("nomeAst")
    private String nomeAst;

    @Column(name = "monitoramento_ambiental", length = 255)
    @JsonProperty("monitoramentoAmbiental")
    private String monitoramentoAmbiental;

    // Controle de fluxo do Sistema ("SOLICITADA", "EMITIDA", "EM_REVALIDACAO", "ENCERRADA")
    @JsonProperty("status")
    private String status;

    // --- CONTROLE DE REVALIDAÇÕES OPERACIONAIS ---
    @Column(name = "qtd_revalidadas")
    @JsonProperty("qtdRevalidadas")
    private int qtdRevalidadas = 0;

    @Transient
    public static final int LIMITE_TOTAL_DIAS = 5;

    @OneToMany(mappedBy = "permissaoTrabalho", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnoreProperties("permissaoTrabalho")
    @JsonProperty("revalidacoes")
    private List<RevalidaPermissao> revalidacoes = new ArrayList<>();

    @Column(name = "servico_concluido")
    @JsonProperty("servicoConcluido")
    private Boolean servicoConcluido;

    @Column(name = "equipamento_testado")
    @JsonProperty("equipamentoTestado")
    private String equipamentoTestado;

    @Column(name = "revalidacao_para_continuidade")
    @JsonProperty("revalidacaoParaContinuidade")
    private Boolean revalidacaoParaContinuidade;

    @Column(name = "justificativa_nao_conclusao", length = 500)
    @JsonProperty("justificativaNaoConclusao")
    private String justificativaNaoConclusao;

    // --- INDICADOR OPERACIONAL ---
    @JsonProperty("solicitanteExecutante")
    private boolean solicitanteExecutante;

    // --- ESPECIALIDADE ---
    @Enumerated(EnumType.STRING)
    @Column(name = "area_atuacao")
    @JsonProperty("areaAtuacao")
    private Especialidade areaAtuacao;

    // --- MATRIZ DE EPIs CALCULADOS ---
    @ElementCollection
    @JsonProperty("episObrigatorios")
    private List<String> episObrigatorios = new ArrayList<>();

    public List<String> getEpisObrigatorios() {
        return episObrigatorios;
    }

    public void setEpisObrigatorios(List<String> episObrigatorios) {
        this.episObrigatorios = episObrigatorios;
    }

    // --- FLIP DE RISCOS / ATIVIDADES CRÍTICAS TRADICIONAIS ---
    @JsonProperty("requerTrabalhoFrio")
    private boolean requerTrabalhoFrio;

    @JsonProperty("requerTrabalhoAltura")
    private boolean requerTrabalhoAltura;

    @JsonProperty("requerEspacoConfinado")
    private boolean requerEspacoConfinado;

    @JsonProperty("requerTrabalhoQuente")
    private boolean requerTrabalhoQuente;

    @JsonProperty("requerRiscoEletrico")
    private boolean requerRiscoEletrico;

    @JsonProperty("requerAltaTensaoSep")
    private boolean requerAltaTensaoSep;

    @JsonProperty("requerAreaClassificada")
    private boolean requerAreaClassificada;

    @JsonProperty("requerAtividadePintura")
    private boolean requerAtividadePintura;

    @JsonProperty("requerSegurancaMaquinas")
    private boolean requerSegurancaMaquinas;

    @Column(name = "requer_loto", nullable = false)
    @JsonProperty("requerLoto")
    private boolean requerLoto;
    @OneToMany(mappedBy = "permissaoTrabalho", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnoreProperties("permissaoTrabalho")
    @JsonProperty("historicoExecutantes")
    private List<PtExecutanteHistorico> historicoExecutantes = new ArrayList<>();

    @OneToMany(mappedBy = "permissaoTrabalho", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnoreProperties("permissaoTrabalho")
    @JsonProperty("riscosDinamicos")
    private List<PtRiscoDinamico> riscosDinamicos = new ArrayList<>();

    // =========================================================================
    // --- MATRIZ DETALHADA DE RISCOS E CONTROLES (13 ITENS VIA JSON CONVERTER) ---
    // =========================================================================
    @Convert(converter = RiskControlConverter.class)
    @Column(columnDefinition = "TEXT")
    @JsonProperty("ruido")
    private RiskControlItem ruido = new RiskControlItem();

    @Convert(converter = RiskControlConverter.class)
    @Column(columnDefinition = "TEXT")
    @JsonProperty("vibracao")
    private RiskControlItem vibracao = new RiskControlItem();

    @Convert(converter = RiskControlConverter.class)
    @Column(columnDefinition = "TEXT")
    @JsonProperty("superficiesAquecidas")
    private RiskControlItem superficiesAquecidas = new RiskControlItem();

    @Convert(converter = RiskControlConverter.class)
    @Column(columnDefinition = "TEXT")
    @JsonProperty("radiacaoNaoIonizante")
    private RiskControlItem radiacaoNaoIonizante = new RiskControlItem();

    @Convert(converter = RiskControlConverter.class)
    @Column(columnDefinition = "TEXT")
    @JsonProperty("agentesQuimicos")
    private RiskControlItem agentesQuimicos = new RiskControlItem();

    @Convert(converter = RiskControlConverter.class)
    @Column(columnDefinition = "TEXT")
    @JsonProperty("diphoterine")
    private RiskControlItem diphoterine = new RiskControlItem();

    @Convert(converter = RiskControlConverter.class)
    @Column(columnDefinition = "TEXT")
    @JsonProperty("isolamentoArea")
    private RiskControlItem isolamentoArea = new RiskControlItem();

    // --- RELACIONAMENTOS E PAPÉIS DE SEGURANÇA ---
    @ManyToOne
    @JoinColumn(name = "solicitante_id")
    @JsonIgnoreProperties({"administradorResponsavel", "senha", "usuario"})
    private Funcionario solicitante;

    @ManyToOne
    @JoinColumn(name = "emitente_id")
    @JsonIgnoreProperties({"administradorResponsavel", "senha", "usuario"})
    private Funcionario emitente;

    @ManyToMany
    @JoinTable(
            name = "pt_executantes",
            joinColumns = @JoinColumn(name = "pt_id"),
            inverseJoinColumns = @JoinColumn(name = "funcionario_id")
    )
    @JsonIgnoreProperties({"administradorResponsavel", "senha", "usuario"})
    private List<Funcionario> executantes;

    // --- CONSTRUTOR PADRÃO ---
    public PermissaoTrabalho() {
        this.status = "SOLICITADA";
        this.qtdRevalidadas = 0;
    }

    // --- CALLBACK DO JPA ---
    @PrePersist
    public void prePersist() {
        if (this.status == null || this.status.isBlank() || "RASCUNHO".equalsIgnoreCase(this.status)) {
            this.status = "SOLICITADA";
        }
    }

    // --- MÉTODOS DE REGRA DE NEGÓCIO DA PT ---
    @Transient
    public boolean podeRevalidar() {
        return this.qtdRevalidadas < LIMITE_TOTAL_DIAS;
    }

    @Transient
    public boolean requerMonitoramentoAmbiental() {
        return this.requerEspacoConfinado || (this.requerTrabalhoQuente && this.requerAreaClassificada);
    }

    @Transient
    public boolean necessitaFormularioAdicional() {
        return this.qtdRevalidadas > 1;
    }

    // --- GETTERS AND SETTERS DOS NOVOS ITENS DE RISCO ---
    public RiskControlItem getRuido() {
        return ruido;
    }

    public void setRuido(RiskControlItem ruido) {
        this.ruido = ruido;
    }

    public RiskControlItem getVibracao() {
        return vibracao;
    }

    public void setVibracao(RiskControlItem vibracao) {
        this.vibracao = vibracao;
    }

    public RiskControlItem getSuperficiesAquecidas() {
        return superficiesAquecidas;
    }

    public void setSuperficiesAquecidas(RiskControlItem superficiesAquecidas) {
        this.superficiesAquecidas = superficiesAquecidas;
    }

    public RiskControlItem getRadiacaoNaoIonizante() {
        return radiacaoNaoIonizante;
    }

    public void setRadiacaoNaoIonizante(RiskControlItem radiacaoNaoIonizante) {
        this.radiacaoNaoIonizante = radiacaoNaoIonizante;
    }

    public RiskControlItem getAgentesQuimicos() {
        return agentesQuimicos;
    }

    public void setAgentesQuimicos(RiskControlItem agentesQuimicos) {
        this.agentesQuimicos = agentesQuimicos;
    }

    public RiskControlItem getDiphoterine() {
        return diphoterine;
    }

    public void setDiphoterine(RiskControlItem diphoterine) {
        this.diphoterine = diphoterine;
    }

    public RiskControlItem getIsolamentoArea() {
        return isolamentoArea;
    }

    public void setIsolamentoArea(RiskControlItem isolamentoArea) {
        this.isolamentoArea = isolamentoArea;
    }

    // --- GETTERS AND SETTERS TRADICIONAIS RESTANTES ---
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPlantaArea() {
        return plantaArea;
    }

    public void setPlantaArea(String plantaArea) {
        this.plantaArea = plantaArea;
    }

    public LocalDateTime getDataHoraEmissao() {
        return dataHoraEmissao;
    }

    public void setDataHoraEmissao(LocalDateTime dataHoraEmissao) {
        this.dataHoraEmissao = dataHoraEmissao;
    }

    public LocalDateTime getDataHoraInicio() {
        return dataHoraInicio;
    }

    public void setDataHoraInicio(LocalDateTime dataHoraInicio) {
        this.dataHoraInicio = dataHoraInicio;
    }

    public LocalDateTime getDataHoraFim() {
        return dataHoraFim;
    }

    public void setDataHoraFim(LocalDateTime dataHoraFim) {
        this.dataHoraFim = dataHoraFim;
    }

    public String getEmpresaGestora() {
        return empresaGestora;
    }

    public void setEmpresaGestora(String empresaGestora) {
        this.empresaGestora = empresaGestora;
    }

    public String getTurnoGrupo() {
        return turnoGrupo;
    }

    public void setTurnoGrupo(String turnoGrupo) {
        this.turnoGrupo = turnoGrupo;
    }

    public String getTag() {
        return tag;
    }

    public void setTag(String tag) {
        this.tag = tag;
    }

    public String getOrdemPj() {
        return ordemPj;
    }

    public void setOrdemPj(String ordemPj) {
        this.ordemPj = ordemPj;
    }

    public boolean isEmergencial() {
        return emergencial;
    }

    public void setEmergencial(boolean emergencial) {
        this.emergencial = emergencial;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public int getQtdRevalidadas() {
        return qtdRevalidadas;
    }

    public void setQtdRevalidadas(int qtdRevalidadas) {
        this.qtdRevalidadas = qtdRevalidadas;
    }

    public List<RevalidaPermissao> getRevalidacoes() {
        return revalidacoes;
    }

    public void setRevalidacoes(List<RevalidaPermissao> revalidacoes) {
        this.revalidacoes = revalidacoes;
    }

    public boolean isSolicitanteExecutante() {
        return solicitanteExecutante;
    }

    public void setSolicitanteExecutante(boolean solicitanteExecutante) {
        this.solicitanteExecutante = solicitanteExecutante;
    }

    public Especialidade getAreaAtuacao() {
        return areaAtuacao;
    }

    public void setAreaAtuacao(Especialidade areaAtuacao) {
        this.areaAtuacao = areaAtuacao;
    }

    public boolean isRequerTrabalhoAltura() {
        return requerTrabalhoAltura;
    }

    public void setRequerTrabalhoAltura(boolean requerTrabalhoAltura) {
        this.requerTrabalhoAltura = requerTrabalhoAltura;
    }

    public boolean isRequerEspacoConfinado() {
        return requerEspacoConfinado;
    }

    public void setRequerEspacoConfinado(boolean requerEspacoConfinado) {
        this.requerEspacoConfinado = requerEspacoConfinado;
    }

    public boolean isRequerTrabalhoQuente() {
        return requerTrabalhoQuente;
    }

    public void setRequerTrabalhoQuente(boolean requerTrabalhoQuente) {
        this.requerTrabalhoQuente = requerTrabalhoQuente;
    }

    public Funcionario getSolicitante() {
        return solicitante;
    }

    public void setSolicitante(Funcionario solicitante) {
        this.solicitante = solicitante;
    }

    public Funcionario getEmitente() {
        return emitente;
    }

    public void setEmitente(Funcionario emitente) {
        this.emitente = emitente;
    }

    public List<Funcionario> getExecutantes() {
        return executantes;
    }

    public void setExecutantes(List<Funcionario> executantes) {
        this.executantes = executantes;
    }

    public boolean isRequerRiscoEletrico() {
        return requerRiscoEletrico;
    }

    public void setRequerRiscoEletrico(boolean r) {
        this.requerRiscoEletrico = r;
    }

    public boolean isRequerAltaTensaoSep() {
        return requerAltaTensaoSep;
    }

    public void setRequerAltaTensaoSep(boolean r) {
        this.requerAltaTensaoSep = r;
    }

    public boolean isRequerAreaClassificada() {
        return requerAreaClassificada;
    }

    public void setRequerAreaClassificada(boolean r) {
        this.requerAreaClassificada = r;
    }

    public boolean isRequerAtividadePintura() {
        return requerAtividadePintura;
    }

    public void setRequerAtividadePintura(boolean r) {
        this.requerAtividadePintura = r;
    }

    public boolean isRequerSegurancaMaquinas() {
        return requerSegurancaMaquinas;
    }

    public void setRequerSegurancaMaquinas(boolean r) {
        this.requerSegurancaMaquinas = r;
    }

    public boolean isRequerTrabalhoFrio() {
        return requerTrabalhoFrio;
    }

    public void setRequerTrabalhoFrio(boolean requerTrabalhoFrio) {
        this.requerTrabalhoFrio = requerTrabalhoFrio;
    }

    public boolean isRequerLoto() {
        return requerLoto;
    }

    public void setRequerLoto(boolean requerLoto) {
        this.requerLoto = requerLoto;
    }

    public String getDescricaoAtividade() {
        return descricaoAtividade;
    }

    public void setDescricaoAtividade(String descricaoAtividade) {
        this.descricaoAtividade = descricaoAtividade;
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

    public List<PtExecutanteHistorico> getHistoricoExecutantes() {
        return historicoExecutantes;
    }

    public void setHistoricoExecutantes(List<PtExecutanteHistorico> historicoExecutantes) {
        this.historicoExecutantes = historicoExecutantes;
    }

    public List<PtRiscoDinamico> getRiscosDinamicos() {
        return riscosDinamicos;
    }

    public void setRiscosDinamicos(List<PtRiscoDinamico> riscosDinamicos) {
        this.riscosDinamicos = riscosDinamicos;
    }
}
