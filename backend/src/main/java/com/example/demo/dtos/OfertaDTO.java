package com.example.demo.dtos;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.example.demo.models.StatusContrato;
import com.example.demo.models.StatusOferta;
import com.example.demo.models.TipoOferta;

public record OfertaDTO(Integer id, Integer imovelId, String imovelTitulo, String imovelStatus,
                        String bairro, Integer usuarioId, String usuarioNome, String usuarioEmail,
                        TipoOferta tipo, BigDecimal valorProposto, String mensagem,
                        StatusOferta status, LocalDateTime criadoEm,
                        Integer contratoId, StatusContrato contratoStatus) {
}
