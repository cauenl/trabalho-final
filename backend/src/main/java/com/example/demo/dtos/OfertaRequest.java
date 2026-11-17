package com.example.demo.dtos;

import java.math.BigDecimal;

// corpo do POST /ofertas: tipo é "VENDA" ou "ALUGUEL"
public record OfertaRequest(Integer imovelId, String tipo, BigDecimal valor, String mensagem) {
}
