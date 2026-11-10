package com.example.demo.dtos;

import java.math.BigDecimal;

import com.example.demo.models.BairroModel;
import com.example.demo.models.ImovelModel;
import com.example.demo.models.TipoImovelModel;

public record ImovelResumoDTO(Integer id, String titulo, String tipo, String bairro,
                              String cidade, String estado, BigDecimal precoVenda,
                              BigDecimal precoAluguel, String status, Integer dormitorios,
                              Integer banheiros, Integer garagem, BigDecimal areaTotal,
                              Integer fotoCapaId) {

    public static ImovelResumoDTO de(ImovelModel i, Integer fotoCapaId) {
        BairroModel b = i.getBairro();
        TipoImovelModel t = i.getTipoImovel();
        return new ImovelResumoDTO(
            i.getId(), i.getTitulo(),
            t == null ? null : t.getNome(),
            b == null ? null : b.getNome(),
            b == null ? null : b.getCidade(),
            b == null ? null : b.getEstado(),
            i.getPrecoVenda(), i.getPrecoAluguel(), i.getStatus(),
            i.getDormitorios(), i.getBanheiros(), i.getGaragem(),
            i.getAreaTotal(), fotoCapaId);
    }
}