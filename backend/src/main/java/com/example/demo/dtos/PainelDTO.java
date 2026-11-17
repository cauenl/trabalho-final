package com.example.demo.dtos;

import java.util.List;

public record PainelDTO(long imoveisDisponiveis, long ofertasPendentes,
                        long contratosAguardandoAssinatura,
                        List<ItemGrafico> imoveisPorBairro,
                        List<ItemGrafico> ofertasPorSituacao,
                        List<ItemGrafico> imoveisPorFinalidade) {

    public record ItemGrafico(String rotulo, long total) {
    }
}
