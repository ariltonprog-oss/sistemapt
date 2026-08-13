package com.gestaopt.sistemapt.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Libera todos os endpoints do sistema (/api/...)
                .allowedOrigins("http://127.0.0.1:5500", "http://localhost:5500") // ⚠️ Coloque aqui a URL onde roda o seu Front-end (ex: Live Server)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH") // Métodos permitidos
                .allowedHeaders("*") // Permite qualquer cabeçalho HTTP
                .allowCredentials(true); // Permite envio de cookies/autenticação se necessário futuramente
    }
}
