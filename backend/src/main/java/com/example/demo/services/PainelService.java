package com.example.demo.services;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dtos.PainelDTO;
import com.example.demo.dtos.PainelDTO.ItemGrafico;
import com.example.demo.models.StatusContrato;
import com.example.demo.models.StatusOferta;
import com.example.demo.repositories.ContratoRepository;
import com.example.demo.repositories.ImovelRepository;
import com.example.demo.repositories.OfertaRepository;

// Números e dados dos gráficos do painel.
@Service
public class PainelService {

    private final ImovelRepository imoveis;
    private final OfertaRepository ofertas;
    private final ContratoRepository contratos;

    public PainelService(ImovelRepository imoveis, OfertaRepository ofertas, ContratoRepository contratos) {
        this.imoveis = imoveis;
        this.ofertas = ofertas;
        this.contratos = contratos;
    }

    @Transactional(readOnly = true)
    public PainelDTO resumo() {
        List<ItemGrafico> porBairro = imoveis.contarPorBairro().stream()
            .map(l -> new ItemGrafico((String) l[0], ((Number) l[1]).longValue()))
            .toList();

        // todas as situações aparecem no gráfico, mesmo as com zero
        Map<StatusOferta, Long> contagem = new EnumMap<>(StatusOferta.class);
        for (Object[] l : ofertas.contarPorStatus()) {
            contagem.put((StatusOferta) l[0], ((Number) l[1]).longValue());
        }
        List<ItemGrafico> porSituacao = java.util.Arrays.stream(StatusOferta.values())
            .map(s -> new ItemGrafico(rotulo(s), contagem.getOrDefault(s, 0L)))
            .toList();

        List<ItemGrafico> porFinalidade = List.of(
            new ItemGrafico("Venda", imoveis.countByPrecoVendaIsNotNull()),
            new ItemGrafico("Aluguel", imoveis.countByPrecoAluguelIsNotNull()));

        return new PainelDTO(
            imoveis.countByStatusStartingWithIgnoreCase("dispon"),
            ofertas.countByStatus(StatusOferta.PENDENTE),
            contratos.countByStatus(StatusContrato.AGUARDANDO_ASSINATURA),
            porBairro, porSituacao, porFinalidade);
    }

    private static String rotulo(StatusOferta s) {
        return switch (s) {
            case PENDENTE -> "Pendente";
            case ACEITA -> "Aceita";
            case EM_ESPERA -> "Em espera";
            case RECUSADA -> "Recusada";
            case CANCELADA -> "Cancelada";
        };
    }
}
