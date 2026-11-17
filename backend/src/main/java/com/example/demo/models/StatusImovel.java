package com.example.demo.models;

// o status do imóvel é texto livre no banco; estes são os valores que as regras de negócio usam
public final class StatusImovel {

    public static final String DISPONIVEL = "Disponível";
    public static final String RESERVADO = "Reservado";
    public static final String ALUGADO = "Alugado";
    public static final String VENDIDO = "Vendido";

    private StatusImovel() {
    }

    // aceita "Disponível" e "Disponivel", em qualquer caixa
    public static boolean disponivel(String status) {
        return status != null && status.trim().toLowerCase().startsWith("dispon");
    }
}
