package com.gestaopt.sistemapt.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gestaopt.sistemapt.dto.EmpresaCadastroDTO;
import com.gestaopt.sistemapt.model.Empresa;
import com.gestaopt.sistemapt.service.EmpresaService;

@RestController
@RequestMapping("/api/empresas")
public class EmpresaController {

    private final EmpresaService empresaService;

    public EmpresaController(EmpresaService empresaService) {
        this.empresaService = empresaService;
    }

    /**
     * ROTA PARA CADASTRAR APENAS A EMPRESA (Usado para Terceirizadas) URL: POST
     * http://localhost:8080/api/empresas
     */
    @PostMapping
    public ResponseEntity<?> cadastrarEmpresaSimples(@RequestBody Empresa empresa) {
        try {
            Empresa novaEmpresa = empresaService.salvarEmpresa(empresa); // Método simples no Service
            return ResponseEntity.ok(novaEmpresa);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * ROTA PARA CADASTRAR EMPRESA COMPLETA + ADMIN (Onboarding de Contratantes)
     * URL: POST http://localhost:8080/api/empresas/com-admin
     */
    @PostMapping("/com-admin")
    public ResponseEntity<?> cadastrarEmpresaComAdmin(@RequestBody EmpresaCadastroDTO dto) {
        try {
            Empresa novaEmpresa = empresaService.cadastrarEmpresaComAdmin(dto);
            return ResponseEntity.ok(novaEmpresa);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * ROTA PARA LISTAR TODAS AS EMPRESAS (Para popular o select na tela de
     * Funcionários) URL: GET http://localhost:8080/api/empresas
     */
    @GetMapping
    public ResponseEntity<List<Empresa>> listarEmpresas() {
        List<Empresa> empresas = empresaService.listarTodas();
        return ResponseEntity.ok(empresas);
    }

    @GetMapping("/terceiras")
    public ResponseEntity<List<Empresa>> listarEmpresasTerceiras() {
        List<Empresa> terceiras = empresaService.listarTerceiras(); // 👈 Chamando através do Service!
        return ResponseEntity.ok(terceiras);
    }
}
