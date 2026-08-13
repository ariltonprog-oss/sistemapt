package com.gestaopt.sistemapt.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.gestaopt.sistemapt.dto.RequisitoDTO;
import com.gestaopt.sistemapt.model.Especialidade; // <-- Importação do Enum!
import com.gestaopt.sistemapt.model.Funcionario;
import com.gestaopt.sistemapt.repository.FuncionarioRepository;

@Service
public class FuncionarioService {

    private final FuncionarioRepository funcionarioRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public FuncionarioService(FuncionarioRepository funcionarioRepository) {
        this.funcionarioRepository = funcionarioRepository;
    }

    /**
     * CADASTRA OU ATUALIZA UM FUNCIONÁRIO
     */
    public Funcionario salvarFuncionario(Funcionario funcionario) throws Exception {
        if (funcionario.getNome() == null || funcionario.getNome().trim().isEmpty()) {
            throw new Exception("O nome do funcionário é obrigatório!");
        }
        if (funcionario.getFuncao() == null || funcionario.getFuncao().trim().isEmpty()) {
            throw new Exception("A função do funcionário é obrigatória!");
        }
        if (funcionario.getMatricula() == null || funcionario.getMatricula().trim().isEmpty()) {
            throw new Exception("A matrícula do funcionário é obrigatória!");
        }

        // 1. ASO: Presença E Validade
        if (funcionario.getRealizacaoASO() == null) {
            throw new Exception("Todo funcionário precisa ter a data de realização do ASO cadastrada!");
        }

        // Primeiro calcula as validades para podermos testar se estão vencidas
        calcularValidadesNR(funcionario);

        LocalDate hoje = LocalDate.now();

        if (funcionario.getValidadeASO() != null && funcionario.getValidadeASO().isBefore(hoje)) {
            throw new Exception("⚠️ O ASO informado está VENCIDO! No cadastro inicial o ASO deve estar em dia.");
        }

        // 2. NRs DO CARGO: Presença E Validade
        if (funcionario.getFuncao() != null) {
            List<String> nrsObrigatorias = obterNrsPorCargo(funcionario.getFuncao());

            for (String nr : nrsObrigatorias) {
                LocalDate realizacao = obterRealizacaoPorSigla(funcionario, nr);
                LocalDate validade = obterValidadePorSigla(funcionario, nr);

                if (realizacao == null) {
                    throw new Exception("⚠️ A data de realização para " + obterNomeAmigavelNr(nr) + " é obrigatória para o cargo de " + funcionario.getFuncao() + "!");
                }
                if (validade != null && validade.isBefore(hoje)) {
                    throw new Exception("⚠️ O requisito " + obterNomeAmigavelNr(nr) + " está VENCIDO! Atualize os treinos antes de cadastrar.");
                }
            }
        }

// =========================================================================
// TRAVA DE SEGURANÇA E GERADOR AUTOMÁTICO DE LOGIN
// =========================================================================
        String perfil = funcionario.getPerfil() != null ? funcionario.getPerfil().toUpperCase() : "";

// 1. Apenas EXECUTANTE é 100% sem acesso (limpa usuario e senha)
        if ("EXECUTANTE".equals(perfil)) {
            funcionario.setUsuario(null);
            funcionario.setSenha(null);

        } else {
            // 2. Se for EDIÇÃO, tenta restaurar login e senha antigos
            Long idFuncional = funcionario.getId(); // Variável local garante estabilidade de nulidade para o compilador
            if (idFuncional != null) {
                Optional<Funcionario> funcionarioExistente = funcionarioRepository.findById(idFuncional);
                if (funcionarioExistente.isPresent()) {
                    Funcionario antigo = funcionarioExistente.get();

                    if (funcionario.getSenha() == null || funcionario.getSenha().trim().isEmpty()) {
                        funcionario.setSenha(antigo.getSenha());
                    }
                    if (funcionario.getUsuario() == null || funcionario.getUsuario().trim().isEmpty()) {
                        funcionario.setUsuario(antigo.getUsuario());
                    }
                }
            }

            // 3. GERADOR AUTOMÁTICO DE LOGIN
            // Roda para cadastros novos OU para colaboradores antigos editados que continuam com usuario null/vazio
            if (funcionario.getUsuario() == null || funcionario.getUsuario().trim().isEmpty()) {
                if (funcionario.getNome() != null && !funcionario.getNome().trim().isEmpty()) {
                    String nomeCompleto = funcionario.getNome().trim().toLowerCase();
                    String[] partesDoNome = nomeCompleto.split("\\s+");

                    String loginGerado;
                    if (partesDoNome.length >= 2) {
                        String primeiroNome = partesDoNome[0];
                        String ultimoSobrenome = partesDoNome[partesDoNome.length - 1];
                        loginGerado = primeiroNome + "." + ultimoSobrenome;
                    } else {
                        loginGerado = partesDoNome[0];
                    }

                    // Garante unicidade do login (ex: gil.gomes, gil.gomes1, gil.gomes2...)
                    String loginFinal = loginGerado;
                    int contador = 1;
                    while (funcionarioRepository.findByUsuario(loginFinal).isPresent()) {
                        loginFinal = loginGerado + contador;
                        contador++;
                    }

                    funcionario.setUsuario(loginFinal);
                }
            }
        }

// =========================================================================
// --- VALIDAÇÃO DE MATRÍCULA ÚNICA ---
// =========================================================================
        if (funcionario.getMatricula() != null) {
            String matriculaLimpa = funcionario.getMatricula().trim();
            funcionario.setMatricula(matriculaLimpa);

            if (funcionario.getId() == null) {
                if (funcionarioRepository.existsByMatricula(matriculaLimpa)) {
                    throw new Exception("⚠️ Erro: Já existe um colaborador cadastrado com a matrícula " + matriculaLimpa + "!");
                }
            } else {
                Optional<Funcionario> comMesmaMatricula = funcionarioRepository.findAllByOrderByMatriculaAsc().stream()
                        .filter(f -> matriculaLimpa.equals(f.getMatricula()) && !java.util.Objects.equals(f.getId(), funcionario.getId()))
                        .findFirst();

                if (comMesmaMatricula.isPresent()) {
                    throw new Exception("⚠️ Erro: A matrícula " + matriculaLimpa + " já está sendo usada por outro colaborador!");
                }
            }
        }

// Limpeza do campo função
        if (funcionario.getFuncao() != null) {
            funcionario.setFuncao(funcionario.getFuncao().trim());
        }

// =========================================================================
// --- CRIPTOGRAFIA DE SENHA E VALIDAÇÕES FINAIS ---
// =========================================================================
        if (funcionario.getSenha() != null && !funcionario.getSenha().trim().isEmpty()) {
            String senhaAtual = funcionario.getSenha().trim();
            if (!senhaAtual.startsWith("$2a$") && !senhaAtual.startsWith("$2b$") && !senhaAtual.startsWith("$2y$")) {
                funcionario.setSenha(passwordEncoder.encode(senhaAtual));
            } else {
                funcionario.setSenha(senhaAtual);
            }
        }

        if (!Funcionario.PERFIL_ADMIN_SISTEMA.equals(funcionario.getPerfil())
                && funcionario.getEmpresa() == null) {
            throw new Exception("Usuários deste perfil devem estar vinculados a uma empresa.");
        }

        // =========================================================================
        // 🚀 ADICIONADO AQUI: CALCULA AS VALIDADES DAS NRS ANTES DE SALVAR
        // =========================================================================
        calcularValidadesNR(funcionario);

        return funcionarioRepository.save(funcionario);
    }

    /**
     * BUSCA TODOS OS FUNCIONÁRIOS CADASTRADOS (Exceto Admin)
     */
    public List<Funcionario> listarTodos() {
        return funcionarioRepository.findAll().stream()
                .filter(this::isNotAdminSistema)
                .toList();
    }

    /**
     * BUSCA COM FILTRO DE NOME OU MATRÍCULA (Exceto Admin)
     */
    public List<Funcionario> buscarPorFiltro(String filtro) {
        if (filtro == null || filtro.trim().isEmpty()) {
            return listarTodos();
        }
        return funcionarioRepository.buscarPorFiltroETerceiros(null, filtro).stream()
                .filter(this::isNotAdminSistema)
                .toList();
    }

    /**
     * BUSCA FUNCIONÁRIOS POR EMPRESA + TERCEIRIZADOS (Exceto Admin)
     */
    public List<Funcionario> listarPorEmpresaETerceiros(Long empresaId, String filtro) {
        List<Funcionario> lista;

        if (filtro != null && !filtro.trim().isEmpty()) {
            lista = funcionarioRepository.buscarPorFiltroETerceiros(empresaId, filtro.trim());
        } else {
            lista = funcionarioRepository.findAllPorEmpresaOuTerceiros(empresaId);
        }

        return lista.stream()
                .filter(this::isNotAdminSistema)
                .toList();
    }

    /**
     * BUSCA FUNCIONÁRIOS POR EMPRESA (Método legado mantido para
     * compatibilidade)
     */
    public List<Funcionario> listarPorEmpresa(Long empresaId) {
        return funcionarioRepository.findAllByEmpresaId(empresaId).stream()
                .filter(this::isNotAdminSistema)
                .toList();
    }

    /**
     * BUSCA APENAS OS QUE PODEM EMITIR PT (EMITENTES)
     */
    public List<Funcionario> listarEmitentes() {
        return funcionarioRepository.findAll().stream()
                .filter(f -> isNotAdminSistema(f) && f.isPodeEmitirPt())
                .toList();
    }

    /**
     * BUSCA APENAS OS QUE PODEM SOLICITAR PT (SOLICITANTES/FISCAIS)
     */
    public List<Funcionario> listarSolicitantes() {
        return funcionarioRepository.findAll().stream()
                .filter(f -> isNotAdminSistema(f) && f.isPodeSolicitarPt())
                .toList();
    }

    /**
     * BUSCA UM FUNCIONÁRIO PELO ID
     */
    public Optional<Funcionario> buscarPorId(Long id) {
        if (id == null) {
            return Optional.empty(); // Proteção defensiva contra nulos
        }
        return funcionarioRepository.findById(id);
    }

    /**
     * DELETA UM FUNCIONÁRIO DO SISTEMA
     */
    public void deletarFuncionario(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("❌ O ID do funcionário não pode ser nulo.");
        }
        funcionarioRepository.deleteById(id);
    }

    // =========================================================================
    // 🚀 NOVOS MÉTODOS ADICIONADOS PARA A REGRA DAS NRS
    // =========================================================================
    /**
     * RETORNA AS NRS OBRIGATÓRIAS COM BASE NO CARGO SELECIONADO
     */
    public List<String> obterNrsPorCargo(String cargo) {
        Especialidade especialidade = Especialidade.fromCargo(cargo);
        return especialidade.getNrsObrigatorias();
    }

    /**
     * MÉTODO AUXILIAR: Calcula e preenche as datas de validade das NRs (+12 ou
     * +24 meses) com base exata nos atributos da classe Funcionario.java.
     */
    private void calcularValidadesNR(Funcionario f) {
        if (f == null) {
            return;
        }

        // Requisitos com validade de 12 meses
        if (f.getRealizacaoASO() != null) {
            f.setValidadeASO(f.getRealizacaoASO().plusMonths(12));
        }
        if (f.getRealizacaoReciclagemPt() != null) {
            f.setValidadeReciclagemPt(f.getRealizacaoReciclagemPt().plusMonths(12));
        }
        if (f.getRealizacaoNr20() != null) {
            f.setValidadeNr20(f.getRealizacaoNr20().plusMonths(12));
        }
        if (f.getRealizacaoNr33() != null) {
            f.setValidadeNr33(f.getRealizacaoNr33().plusMonths(12));
        }
        if (f.getRealizacaoBrigada() != null) {
            f.setValidadeBrigada(f.getRealizacaoBrigada().plusMonths(12));
        }

        // Requisitos com validade de 24 meses
        if (f.getRealizacaoNr01() != null) {
            f.setValidadeNr01(f.getRealizacaoNr01().plusMonths(24));
        }
        if (f.getRealizacaoNr10() != null) {
            f.setValidadeNr10(f.getRealizacaoNr10().plusMonths(24));
        }
        if (f.getRealizacaoNr10Sep() != null) {
            f.setValidadeNr10Sep(f.getRealizacaoNr10Sep().plusMonths(24));
        }
        if (f.getRealizacaoNr12() != null) {
            f.setValidadeNr12(f.getRealizacaoNr12().plusMonths(24));
        }
        if (f.getRealizacaoNr13() != null) {
            f.setValidadeNr13(f.getRealizacaoNr13().plusMonths(24));
        }
        if (f.getRealizacaoNr18() != null) {
            f.setValidadeNr18(f.getRealizacaoNr18().plusMonths(24));
        }
        if (f.getRealizacaoNr35() != null) {
            f.setValidadeNr35(f.getRealizacaoNr35().plusMonths(24));
        }
    }

    /**
     * MÉTODO AUXILIAR: Verifica se o funcionário NÃO é o Admin do Sistema.
     */
    private boolean isNotAdminSistema(Funcionario f) {
        if (f == null) {
            return false;
        }
        return !Funcionario.PERFIL_ADMIN_SISTEMA.equalsIgnoreCase(f.getPerfil());
    }

    // Método no FuncionarioService.java
    public List<RequisitoDTO> obterRequisitosPorCargo(String cargo) {
        // 1. Busca as siglas que pertencem ao cargo (ex: ["NR10", "NR12"])
        List<String> siglas = obterNrsPorCargo(cargo);

        // 2. Transforma cada sigla no objeto RequisitoDTO com o nome completo
        return siglas.stream()
                .map(sigla -> new RequisitoDTO(sigla, obterNomeAmigavelNr(sigla)))
                .toList();
    }

// Mapeamento simples dos nomes amigáveis
    private String obterNomeAmigavelNr(String sigla) {
        return switch (sigla) {
            case "NR01" ->
                "NR-01 Gerenciamento de Riscos Ocupacionais";
            case "NR10" ->
                "NR-10 Segurança em Eletricidade";
            case "NR10SEP" ->
                "NR-10SEP Segurança no Sistema Elétrico de Potência";
            case "NR11" ->
                "NR-11 Transporte e Movimentação de Cargas";
            case "NR12" ->
                "NR-12 Segurança no Trabalho em Máquinas";
            case "NR13" ->
                "NR-13 Caldeiras, Vasos de Pressão e Tubulações";
            case "NR18" ->
                "NR-18 Segurança na Construção Civil";
            case "NR20" ->
                "NR-20 Segurança em Inflamáveis e Combustíveis";
            case "NR33" ->
                "NR-33 Segurança em Espaços Confinados";
            case "NR34" ->
                "NR-34 Condições de Trabalho Naval/Quente";
            case "NR35" ->
                "NR-35 Trabalho em Altura";
            case "BRIGADA" ->
                "Brigada de Incêndio";
            default ->
                sigla;
        };
    }
    // =========================================================================
    // MÉTODOS AUXILIARES: BUSCA DINÂMICA DE DATAS POR SIGLA DA NR
    // =========================================================================

    /**
     * Retorna a data de REALIZAÇÃO do requisito/NR com base na sigla.
     */
    private java.time.LocalDate obterRealizacaoPorSigla(Funcionario f, String sigla) {
        if (f == null || sigla == null) {
            return null;
        }
        return switch (sigla.toUpperCase().trim()) {
            case "ASO" ->
                f.getRealizacaoASO();
            case "RECICLAGEMPT", "PT" ->
                f.getRealizacaoReciclagemPt();
            case "NR01" ->
                f.getRealizacaoNr01();
            case "NR10" ->
                f.getRealizacaoNr10();
            case "NR10SEP" ->
                f.getRealizacaoNr10Sep();
            case "NR11" ->
                f.getRealizacaoNr11();
            case "NR12" ->
                f.getRealizacaoNr12();
            case "NR13" ->
                f.getRealizacaoNr13();
            case "NR18" ->
                f.getRealizacaoNr18();
            case "NR20" ->
                f.getRealizacaoNr20();
            case "NR33" ->
                f.getRealizacaoNr33();
            case "NR34" ->
                f.getRealizacaoNr34();
            case "NR35" ->
                f.getRealizacaoNr35();
            case "BRIGADA" ->
                f.getRealizacaoBrigada();
            default ->
                null;
        };
    }

    /**
     * Retorna a data de VALIDADE do requisito/NR com base na sigla.
     */
    private java.time.LocalDate obterValidadePorSigla(Funcionario f, String sigla) {
        if (f == null || sigla == null) {
            return null;
        }
        return switch (sigla.toUpperCase().trim()) {
            case "ASO" ->
                f.getValidadeASO();
            case "RECICLAGEMPT", "PT" ->
                f.getValidadeReciclagemPt();
            case "NR01" ->
                f.getValidadeNr01();
            case "NR10" ->
                f.getValidadeNr10();
            case "NR10SEP" ->
                f.getValidadeNr10Sep();
            case "NR11" ->
                f.getValidadeNr11();
            case "NR12" ->
                f.getValidadeNr12();
            case "NR13" ->
                f.getValidadeNr13();
            case "NR18" ->
                f.getValidadeNr18();
            case "NR20" ->
                f.getValidadeNr20();
            case "NR33" ->
                f.getValidadeNr33();
            case "NR34" ->
                f.getValidadeNr34();
            case "NR35" ->
                f.getValidadeNr35();
            case "BRIGADA" ->
                f.getValidadeBrigada();
            default ->
                null;
        };
    }
}
