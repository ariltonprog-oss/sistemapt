package com.gestaopt.sistemapt.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gestaopt.sistemapt.model.Configuracao;
import com.gestaopt.sistemapt.repository.ConfiguracaoRepository;

@RestController
@RequestMapping("/api/configuracoes")
public class ConfiguracaoController {

    private final ConfiguracaoRepository repository;

    public ConfiguracaoController(ConfiguracaoRepository repository) {
        this.repository = repository;
    }

    // GET: Busca o limite atual (se não existir, retorna o padrão 3)
    @GetMapping("/limite-pt")
    public ResponseEntity<String> getLimitePt() {
        String limite = repository.findById("limite-pt")
                .map(c -> c.getValor()) // ✅ Substituído para sumir com o aviso de Null type safety
                .orElse("3");
        return ResponseEntity.ok(limite);
    }

    // POST: Salva ou atualiza o limite enviado pelo admin.html
    @PostMapping("/limite-pt")
    public ResponseEntity<Void> salvarLimitePt(@RequestBody Map<String, String> payload) {
        String valor = payload.get("valor");
        if (valor == null || valor.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        Configuracao config = new Configuracao("limite-pt", valor);
        repository.save(config);
        return ResponseEntity.ok().build();
    }
}
