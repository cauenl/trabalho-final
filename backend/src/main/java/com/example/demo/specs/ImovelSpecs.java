package com.example.demo.specs;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.jpa.domain.Specification;

import com.example.demo.models.ImovelModel;

import jakarta.persistence.criteria.Predicate;

public final class ImovelSpecs {

    private ImovelSpecs() {
    }

    // só imóveis disponíveis aparecem na vitrine
    public static Specification<ImovelModel> disponivel() {
        return (root, query, cb) -> cb.like(cb.lower(root.<String>get("status")), "dispon%");
    }

    public static Specification<ImovelModel> doBairro(Integer bairroId) {
        return (root, query, cb) -> cb.equal(root.get("bairro").get("id"), bairroId);
    }

    // campo = "precoVenda" ou "precoAluguel"
    public static Specification<ImovelModel> comPreco(String campo, BigDecimal min, BigDecimal max) {
        return (root, query, cb) -> {
            List<Predicate> condicoes = new ArrayList<>();
            condicoes.add(cb.isNotNull(root.get(campo)));
            if (min != null) {
                condicoes.add(cb.greaterThanOrEqualTo(root.<BigDecimal>get(campo), min));
            }
            if (max != null) {
                condicoes.add(cb.lessThanOrEqualTo(root.<BigDecimal>get(campo), max));
            }
            return cb.and(condicoes.toArray(new Predicate[0]));
        };
    }
}