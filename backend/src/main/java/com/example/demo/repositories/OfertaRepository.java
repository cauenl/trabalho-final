package com.example.demo.repositories;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.demo.models.OfertaModel;
import com.example.demo.models.StatusOferta;

public interface OfertaRepository extends JpaRepository<OfertaModel, Integer> {

    boolean existsByUsuarioIdAndImovelIdAndStatus(Integer usuarioId, Integer imovelId, StatusOferta status);

    List<OfertaModel> findByUsuarioIdOrderByCriadoEmDesc(Integer usuarioId);

    List<OfertaModel> findAllByOrderByCriadoEmDesc();

    List<OfertaModel> findByStatusOrderByCriadoEmDesc(StatusOferta status);

    List<OfertaModel> findByImovelIdAndStatusIn(Integer imovelId, Collection<StatusOferta> status);

    long countByStatus(StatusOferta status);

    @Query("select o.status, count(o) from OfertaModel o group by o.status")
    List<Object[]> contarPorStatus();
}
