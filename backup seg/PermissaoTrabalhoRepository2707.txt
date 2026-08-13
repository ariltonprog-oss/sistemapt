package com.gestaopt.sistemapt.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gestaopt.sistemapt.model.PermissaoTrabalho;


public interface PermissaoTrabalhoRepository extends JpaRepository<PermissaoTrabalho, Long> {
    // Prontinho para salvar e buscar as PTs da planta!
}