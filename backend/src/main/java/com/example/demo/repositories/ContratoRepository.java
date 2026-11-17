package com.example.demo.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.models.ContratoModel;
import com.example.demo.models.StatusContrato;

public interface ContratoRepository extends JpaRepository<ContratoModel, Integer> {

    // contrato "vivo" da oferta (qualquer um que não esteja cancelado)
    Optional<ContratoModel> findFirstByOfertaIdAndStatusNot(Integer ofertaId, StatusContrato status);

    List<ContratoModel> findAllByOrderByCriadoEmDesc();

    // o cliente só vê contratos que já foram aprovados e enviados a ele
    List<ContratoModel> findByOfertaUsuarioIdAndDataAprovacaoIsNotNullOrderByCriadoEmDesc(Integer usuarioId);

    long countByStatus(StatusContrato status);
}
