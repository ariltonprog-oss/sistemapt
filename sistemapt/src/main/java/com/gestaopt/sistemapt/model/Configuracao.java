package com.gestaopt.sistemapt.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "configuracoes")
public class Configuracao {

    @Id
    private String chave; // Ex: "limite-pt"
    private String valor; // Ex: "5"

    public Configuracao() {}

    public Configuracao(String chave, String valor) {
        this.chave = chave;
        this.valor = valor;
    }

    // Getters e Setters
    public String getChave() { return chave; }
    public void setChave(String chave) { this.chave = chave; }
    public String getValor() { return valor; }
    public void setValor(String valor) { this.valor = valor; }
}