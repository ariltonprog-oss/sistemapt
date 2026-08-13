package com.gestaopt.sistemapt;

import java.time.LocalDate;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.gestaopt.sistemapt.model.Funcionario;
import com.gestaopt.sistemapt.repository.EmpresaRepository;
import com.gestaopt.sistemapt.repository.FuncionarioRepository;

@SpringBootApplication
public class SistemaptApplication {

    public static void main(String[] args) {
        SpringApplication.run(SistemaptApplication.class, args);
    }

    /**
     * CARGA INICIAL FORÇADA: Roda direto na inicialização do arquivo principal
     */
    @Bean
    public CommandLineRunner cargaInicialForcada(
            FuncionarioRepository funcionarioRepository,
            EmpresaRepository empresaRepository) {
        return args -> {
            if (funcionarioRepository.findByUsuarioIgnoreCase("admin").isEmpty()) {

                com.gestaopt.sistemapt.model.Empresa empresaPadrao = new com.gestaopt.sistemapt.model.Empresa();
                empresaPadrao.setNomeFantasia("EMPRESA PADRAO");
                empresaPadrao.setCnpj("00.000.000/0000-00");
                empresaPadrao.setAtivo(true);
                com.gestaopt.sistemapt.model.Empresa empresaSalva = empresaRepository.save(empresaPadrao);

                BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
                Funcionario admin = new Funcionario();
                admin.setNome("Administrador do Sistema");
                admin.setUsuario("admin");
                admin.setSenha(passwordEncoder.encode("admin123"));
                admin.setPerfil(Funcionario.PERFIL_ADMIN_SISTEMA);
                admin.setEmpresa(empresaSalva);
                admin.setValidadeASO(LocalDate.now().plusYears(1));
                admin.setPodeEmitirPt(true);
                admin.setPodeSolicitarPt(true);
                admin.setEhTerceiro(false);

                funcionarioRepository.save(admin);

                System.out.println("\n🚀 USUÁRIO ADMIN_SISTEMA 'admin' criado com sucesso!");
            }
        };
    }
}
