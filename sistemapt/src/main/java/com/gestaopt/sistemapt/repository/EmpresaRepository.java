package com.gestaopt.sistemapt.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gestaopt.sistemapt.model.Empresa;

public interface EmpresaRepository extends JpaRepository<Empresa, Long> {

    // Busca uma empresa pelo CNPJ para evitar duplicidade
    Optional<Empresa> findByCnpj(String cnpj);

    // Busca apenas as empresas ativas para popular os <select> do front-end
    List<Empresa> findByAtivoTrue();

    // NOVO: Busca apenas empresas que estão ATIVAS e são TERCEIRIZADAS
    List<Empresa> findByAtivoTrueAndEhTerceiroTrue();
}
