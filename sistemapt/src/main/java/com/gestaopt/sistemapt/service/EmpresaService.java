package com.gestaopt.sistemapt.service;

import java.util.List;
import java.util.Optional;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gestaopt.sistemapt.dto.EmpresaCadastroDTO;
import com.gestaopt.sistemapt.model.Empresa;
import com.gestaopt.sistemapt.model.Funcionario;
import com.gestaopt.sistemapt.repository.EmpresaRepository;
import com.gestaopt.sistemapt.repository.FuncionarioRepository;

@Service
public class EmpresaService {

    private final EmpresaRepository empresaRepository;
    private final FuncionarioRepository funcionarioRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public EmpresaService(EmpresaRepository empresaRepository, FuncionarioRepository funcionarioRepository) {
        this.empresaRepository = empresaRepository;
        this.funcionarioRepository = funcionarioRepository;
    }

    /**
     * SALVA UMA EMPRESA SIMPLES (Ideal para terceirizadas)
     */
    public Empresa salvarEmpresa(Empresa empresa) {
        // 1. Validação do CNPJ para evitar duplicidade
        if (empresa.getCnpj() != null && !empresa.getCnpj().isBlank()) {
            Optional<Empresa> existente = empresaRepository.findByCnpj(empresa.getCnpj());
            if (existente.isPresent() && !existente.get().getId().equals(empresa.getId())) {
                throw new RuntimeException("Erro: Já existe uma empresa cadastrada com este CNPJ!");
            }
        }

        // 2. Garante que a empresa nasça como ativa se o campo for nulo
        if (empresa.getAtivo() == null) {
            empresa.setAtivo(true);
        }

        // 3. Salva no banco de dados
        return empresaRepository.save(empresa);
    }

    // 🔒 @Transactional garante a regra de "Tudo ou Nada" no banco de dados
    @Transactional
    public Empresa cadastrarEmpresaComAdmin(EmpresaCadastroDTO dto) {
        if (dto.getUsuarioAdmin() == null || dto.getUsuarioAdmin().trim().isEmpty()) {
            throw new RuntimeException("Erro: O usuário do Master da empresa é obrigatório!");
        }

        if (dto.getNomeAdmin() == null || dto.getNomeAdmin().trim().isEmpty()) {
            throw new RuntimeException("Erro: O nome do Master da empresa é obrigatório!");
        }

        if (dto.getSenhaAdmin() == null || dto.getSenhaAdmin().trim().isEmpty()) {
            throw new RuntimeException("Erro: A senha do Master da empresa é obrigatória!");
        }
        if (funcionarioRepository.existsByUsuarioIgnoreCase(dto.getUsuarioAdmin().trim())) {
            throw new RuntimeException("Erro: Já existe um usuário com este login!");
        }

        // 1. Validação de Segurança do CNPJ
        Optional<Empresa> empresaExistente = empresaRepository.findByCnpj(dto.getCnpj());
        if (empresaExistente.isPresent()) {
            throw new RuntimeException("Erro: Já existe uma empresa cadastrada com este CNPJ!");
        }

        // 2. Desempacotar e Salvar a EMPRESA
        Empresa novaEmpresa = new Empresa();
        novaEmpresa.setNomeFantasia(dto.getNomeFantasia());
        novaEmpresa.setCnpj(dto.getCnpj());
        novaEmpresa.setAtivo(true);

        Empresa empresaSalva = empresaRepository.save(novaEmpresa);

        // 3. Desempacotar e Salvar o PRIMEIRO USUÁRIO (O Master do Cliente)
        Funcionario adminEmpresa = new Funcionario();
        adminEmpresa.setNome(dto.getNomeAdmin().trim());
        adminEmpresa.setUsuario(dto.getUsuarioAdmin().trim());
        adminEmpresa.setSenha(passwordEncoder.encode(dto.getSenhaAdmin().trim()));
        adminEmpresa.setPerfil(Funcionario.PERFIL_MASTER_EMPRESA);
        adminEmpresa.setEmpresa(empresaSalva);
        adminEmpresa.setEhTerceiro(false);
        adminEmpresa.setPodeEmitirPt(false);
        adminEmpresa.setPodeSolicitarPt(false);
        adminEmpresa.setAdministradorResponsavel(null);

        funcionarioRepository.save(adminEmpresa);
        return empresaSalva;
    }

    public List<Empresa> listarTodas() {
        return empresaRepository.findAll();
    }

    public List<Empresa> listarTerceiras() {
        return empresaRepository.findByAtivoTrueAndEhTerceiroTrue();
    }
}
