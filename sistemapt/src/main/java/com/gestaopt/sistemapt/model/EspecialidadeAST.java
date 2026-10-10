package com.gestaopt.sistemapt.model;

public enum EspecialidadeAST {
    INSTRUMENTATION("Manutenção em Instrumentação Industrial"),
    ELECTRICAL("Manutenção Elétrica Industrial"),
    MECHANICAL("Manutenção Mecânica Industrial"),
    BOILERMAKING_PIPING("Caldeiraria e Tubulação Industrial"),
    WELDING("Soldagem Industrial"),
    PAINTING_COATING("Pintura e Revestimento Industrial"),
    CIVIL_MAINTENANCE("Manutenção Civil Industrial"),
    SCAFFOLDING("Montagem, Desmontagem e Utilização de Andaimes Industriais");

    private final String descricao;

    EspecialidadeAST(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}