package com.example.demo.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.models.FavoritoModel;

public interface FavoritoRepository extends JpaRepository<FavoritoModel, Integer> {

    Optional<FavoritoModel> findByUsuarioIdAndImovelId(Integer usuarioId, Integer imovelId);

    List<FavoritoModel> findByUsuarioIdOrderByIdDesc(Integer usuarioId);
}
