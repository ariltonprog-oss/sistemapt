package com.gestaopt.sistemapt.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gestaopt.sistemapt.model.Configuracao;

public interface ConfiguracaoRepository extends JpaRepository<Configuracao, String> {
}