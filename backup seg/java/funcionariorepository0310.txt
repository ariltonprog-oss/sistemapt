package com.gestaopt.sistemapt.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.gestaopt.sistemapt.model.Funcionario;

public interface FuncionarioRepository extends JpaRepository<Funcionario, Long> {

    Optional<Funcionario> findByUsuario(String usuario);

    Optional<Funcionario> findByUsuarioIgnoreCase(String usuario);

    boolean existsByUsuarioIgnoreCase(String usuario);

    List<Funcionario> findAllByOrderByMatriculaAsc();

    List<Funcionario> findAllByEmpresaId(Long empresaId);

    // =========================================================================
    // CONSULTAS QUE INCLUEM TERCEIRIZADOS
    // =========================================================================
    // 1. Traz funcionários da empresa OU qualquer colaborador que seja Terceiro
    @Query("SELECT f FROM Funcionario f WHERE f.empresa.id = :empresaId OR f.ehTerceiro = true")
    List<Funcionario> findAllPorEmpresaOuTerceiros(@Param("empresaId") Long empresaId);

    // 2. Busca com filtro (por nome ou matrícula) trazendo próprios E terceiros
    @Query("SELECT f FROM Funcionario f WHERE (f.empresa.id = :empresaId OR f.ehTerceiro = true) "
            + "AND (LOWER(f.nome) LIKE LOWER(CONCAT('%', :filtro, '%')) OR LOWER(f.matricula) LIKE LOWER(CONCAT('%', :filtro, '%')))")
    List<Funcionario> buscarPorFiltroETerceiros(@Param("empresaId") Long empresaId, @Param("filtro") String filtro);

    boolean existsByMatricula(String matricula);

    // Buscar todos os funcionários filtrando pelo status (ativo = true ou false)
    List<Funcionario> findByAtivo(boolean ativo);

    // Buscar funcionários de uma empresa específica filtrando pelo status
    List<Funcionario> findByEmpresaIdAndAtivo(Long empresaId, boolean ativo);

    // Buscar funcionários de uma empresa filtrando por função
    List<Funcionario> findByEmpresaIdAndFuncao(Long empresaId, String funcao);

    // Opcional: Para preencher o <select> do HTML apenas com as funções cadastradas daquela empresa
    @Query("SELECT DISTINCT f.funcao FROM Funcionario f WHERE f.empresa.id = :empresaId AND f.funcao IS NOT NULL ORDER BY f.funcao")
    List<String> findDistinctFuncoesByEmpresaId(@Param("empresaId") Long empresaId);

    // Buscar funcionários da empresa filtrando opcionalmente por texto, função e status ativo
    @Query("SELECT f FROM Funcionario f WHERE f.empresa.id = :empresaId " +
           "AND (:filtro IS NULL OR :filtro = '' OR LOWER(f.nome) LIKE LOWER(CONCAT('%', :filtro, '%')) OR LOWER(f.matricula) LIKE LOWER(CONCAT('%', :filtro, '%'))) " +
           "AND (:funcao IS NULL OR :funcao = '' OR f.funcao = :funcao) " +
           "AND (:ativo IS NULL OR f.ativo = :ativo)")
    List<Funcionario> findByEmpresaComFiltros(
            @Param("empresaId") Long empresaId,
            @Param("filtro") String filtro,
            @Param("funcao") String funcao,
            @Param("ativo") Boolean ativo
    );
    
}
