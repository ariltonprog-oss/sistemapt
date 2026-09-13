package com.gestaopt.sistemapt.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.gestaopt.sistemapt.model.PermissaoTrabalho;

public interface PermissaoTrabalhoRepository extends JpaRepository<PermissaoTrabalho, Long> {

    @Query("SELECT MAX(p.numeroEmissao) FROM PermissaoTrabalho p")
    Integer encontrarMaiorNumeroEmissao();

    @Query("SELECT MAX(p.numeroEmissao) FROM PermissaoTrabalho p WHERE p.anoEmissao = :ano")
    Integer encontrarMaiorNumeroPorAno(@Param("ano") Integer ano);

}
