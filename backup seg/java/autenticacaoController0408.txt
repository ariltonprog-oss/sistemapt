package com.gestaopt.sistemapt.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gestaopt.sistemapt.dto.LoginRequest;
import com.gestaopt.sistemapt.model.Funcionario;
import com.gestaopt.sistemapt.repository.FuncionarioRepository;

@RestController
@RequestMapping("/api/autenticacao")

public class AutenticacaoController {

    private final FuncionarioRepository funcionarioRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AutenticacaoController(FuncionarioRepository funcionarioRepository) {
        this.funcionarioRepository = funcionarioRepository;
    }

    // Este método resolve o erro de CORS (Preflight/OPTIONS) sem quebrar o POST
    @org.springframework.web.bind.annotation.RequestMapping(value = "/login", method = org.springframework.web.bind.annotation.RequestMethod.OPTIONS)
    public ResponseEntity<?> handleOptions() {
        return ResponseEntity.ok().build();
    }

    @PostMapping("/login")
    public ResponseEntity<?> efetuarLogin(@RequestBody LoginRequest loginRequest) {
        String usuarioDigitado = loginRequest.getUsuario() != null ? loginRequest.getUsuario().trim() : "";
        String senhaDigitada = loginRequest.getSenha() != null ? loginRequest.getSenha().trim() : "";

        if (usuarioDigitado.isEmpty() || senhaDigitada.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Usuário e senha são obrigatórios!");
        }

        Optional<Funcionario> funcionarioOpt = funcionarioRepository.findByUsuarioIgnoreCase(usuarioDigitado);
        if (funcionarioOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuário inválido ou não cadastrado!");
        }

        Funcionario funcionario = funcionarioOpt.get();
        String senhaBanco = funcionario.getSenha() != null ? funcionario.getSenha().trim() : "";

        boolean senhaValida = senhaBanco.equals(senhaDigitada) || passwordEncoder.matches(senhaDigitada, senhaBanco);
        if (!senhaValida) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Senha incorreta!");
        }

        if (!senhaBanco.startsWith("$2a$") && !senhaBanco.startsWith("$2b$") && !senhaBanco.startsWith("$2y$")) {
            funcionario.setSenha(passwordEncoder.encode(senhaDigitada));
            funcionarioRepository.save(funcionario);
        }

        Map<String, Object> resposta = new HashMap<>();
        resposta.put("id", funcionario.getId());
        resposta.put("usuario", funcionario.getUsuario());
        resposta.put("nome", funcionario.getNome());
        resposta.put("perfil", funcionario.getPerfil());
        if (funcionario.getEmpresa() != null) {
            resposta.put("empresaId", funcionario.getEmpresa().getId());
            Map<String, Object> empresaMap = new HashMap<>();
            empresaMap.put("id", funcionario.getEmpresa().getId());
            empresaMap.put("nomeFantasia", funcionario.getEmpresa().getNomeFantasia());
            resposta.put("empresa", empresaMap);
        }

        return ResponseEntity.ok(resposta);
    }
}
