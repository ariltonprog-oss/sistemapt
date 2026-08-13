package com.gestaopt.sistemapt.model;

import java.util.ArrayList;
import java.util.List;

public class RiskControlItem {

    private boolean ativo = false;
    private List<String> opcoesSelecionadas = new ArrayList<>();
    private String textoComplementar;

    public RiskControlItem() {
    }

    public boolean isAtivo() {
        return ativo;
    }

    public void setAtivo(boolean ativo) {
        this.ativo = ativo;
    }

    public List<String> getOpcoesSelecionadas() {
        return opcoesSelecionadas;
    }

    public void setOpcoesSelecionadas(List<String> opcoesSelecionadas) {
        this.opcoesSelecionadas = opcoesSelecionadas;
    }

    public String getTextoComplementar() {
        return textoComplementar;
    }

    public void setTextoComplementar(String textoComplementar) {
        this.textoComplementar = textoComplementar;
    }
}
