package com.gestaopt.sistemapt.service;

import com.gestaopt.sistemapt.model.EspecialidadeAST;
import org.springframework.stereotype.Service;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Service
public class AstConteudoService {

    public static class ModeloAstDTO {
        private final String titulo;
        private final String descricaoGeral;
        private final List<EtapaAstDTO> etapas;
        private final String episRecursos;
        private final String condicoesImpeditivas;

        public ModeloAstDTO(String titulo, String descricaoGeral, List<EtapaAstDTO> etapas, String episRecursos, String condicoesImpeditivas) {
            this.titulo = titulo;
            this.descricaoGeral = descricaoGeral;
            this.etapas = etapas;
            this.episRecursos = episRecursos;
            this.condicoesImpeditivas = condicoesImpeditivas;
        }

        public String getTitulo() { return titulo; }
        public String getDescricaoGeral() { return descricaoGeral; }
        public List<EtapaAstDTO> getEtapas() { return etapas; }
        public String getEpisRecursos() { return episRecursos; }
        public String getCondicoesImpeditivas() { return condicoesImpeditivas; }
    }

    public static class EtapaAstDTO {
        private final String etapa;
        private final String perigosRiscos;
        private final String medidasPreventivas;

        public EtapaAstDTO(String etapa, String perigosRiscos, String medidasPreventivas) {
            this.etapa = etapa;
            this.perigosRiscos = perigosRiscos;
            this.medidasPreventivas = medidasPreventivas;
        }

        public String getEtapa() { return etapa; }
        public String getPerigosRiscos() { return perigosRiscos; }
        public String getMedidasPreventivas() { return medidasPreventivas; }
    }

    private static final Map<EspecialidadeAST, ModeloAstDTO> CATALOGO_ASTS = new EnumMap<>(EspecialidadeAST.class);

    static {
        // Exemplo preenchido para Instrumentação
        CATALOGO_ASTS.put(EspecialidadeAST.INSTRUMENTATION, new ModeloAstDTO(
            "AST 1 — MANUTENÇÃO EM INSTRUMENTAÇÃO INDUSTRIAL",
            "Execução de manutenção preventiva e corretiva, inspeção, ajustes, calibração, testes e substituição em sistemas de instrumentação.",
            List.of(
                new EtapaAstDTO("Deslocamento até o local", "Quedas, tropeços, escorregões e colisões.", "Utilizar rotas autorizadas, observar o piso e respeitar a sinalização."),
                new EtapaAstDTO("Isolamento e preparação", "Choque elétrico, energização inesperada, pressão residual.", "Identificar fontes de energia, aplicar LOTO, aliviar pressões residuais e confirmar segurança."),
                new EtapaAstDTO("Execução da manutenção", "Cortes, prensamentos, impactos, superfícies quentes.", "Usar ferramentas adequadas, seguir procedimentos e manter organização.")
            ),
            "• Capacete, óculos, calçado de segurança e vestimenta compatível.\n• Luvas adequadas aos riscos mecânicos, químicos ou elétricos.\n• Instrumentos de teste apropriados e bloqueios/etiquetas.",
            "• Ausência de autorização ou liberação exigida.\n• Impossibilidade de confirmar isolamento de energias perigosas.\n• Vazamentos ou atmosfera perigosa."
        ));

        // As demais especialidades podem ser adicionadas seguindo exatamente este mesmo padrão (ELECTRICAL, MECHANICAL, etc.)
    }

    public ModeloAstDTO obterConteudoPorEspecialidade(EspecialidadeAST especialidade) {
        return CATALOGO_ASTS.get(especialidade);
    }
} 