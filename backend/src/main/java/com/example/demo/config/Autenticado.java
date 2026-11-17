package com.example.demo.config;

import org.springframework.security.oauth2.jwt.Jwt;

// lê do token quem está logado
public final class Autenticado {

    private Autenticado() {
    }

    public static Integer id(Jwt jwt) {
        return ((Number) jwt.getClaim("id")).intValue();
    }

    public static String tipo(Jwt jwt) {
        return jwt.getClaimAsString("tipo");
    }

    // corretor e admin formam a "equipe" da imobiliária
    public static boolean equipe(Jwt jwt) {
        String tipo = tipo(jwt);
        return "ADMIN".equals(tipo) || "CORRETOR".equals(tipo);
    }
}
