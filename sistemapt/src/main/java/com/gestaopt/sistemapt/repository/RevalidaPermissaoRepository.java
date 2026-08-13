package com.gestaopt.sistemapt.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gestaopt.sistemapt.model.RevalidaPermissao;

public interface RevalidaPermissaoRepository extends JpaRepository<RevalidaPermissao, Long> {

    // Vincula corretamente o método de busca ao novo nome da classe
    List<RevalidaPermissao> findByPermissaoTrabalhoIdOrderByDataHoraRevalidacaoAsc(Long permissaoId);
}
