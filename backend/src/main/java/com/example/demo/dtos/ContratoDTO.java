package com.example.demo.dtos;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.example.demo.models.StatusContrato;
import com.example.demo.models.TipoOferta;

// notificacaoEnviada: só preenchido ao aprovar (true/false = e-mail ao cliente enviado ou não)
public record ContratoDTO(Integer id, Integer ofertaId, Integer imovelId, String imovelTitulo,
                          Integer clienteId, String clienteNome, String clienteEmail,
                          TipoOferta tipo, BigDecimal valor, StatusContrato status,
                          LocalDateTime criadoEm, LocalDateTime dataAprovacao,
                          LocalDateTime dataAssinatura, String preparadoPor,
                          Boolean notificacaoEnviada) {

    public ContratoDTO comNotificacao(boolean enviada) {
        return new ContratoDTO(id, ofertaId, imovelId, imovelTitulo, clienteId, clienteNome, clienteEmail,
            tipo, valor, status, criadoEm, dataAprovacao, dataAssinatura, preparadoPor, enviada);
    }
}
