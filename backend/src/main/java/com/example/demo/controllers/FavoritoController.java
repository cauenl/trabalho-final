package com.example.demo.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.config.Autenticado;
import com.example.demo.dtos.ImovelResumoDTO;
import com.example.demo.services.FavoritoService;

// só o cliente (USER) usa favoritos
@RestController
@RequestMapping("/favoritos")
public class FavoritoController {

    private final FavoritoService service;

    public FavoritoController(FavoritoService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<ImovelResumoDTO>> listar(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(service.listar(Autenticado.id(jwt)));
    }

    // só os ids: usado para pintar os corações na vitrine
    @GetMapping("/ids")
    public ResponseEntity<List<Integer>> ids(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(service.ids(Autenticado.id(jwt)));
    }

    @PostMapping("/{imovelId}")
    public ResponseEntity<Void> adicionar(@PathVariable Integer imovelId, @AuthenticationPrincipal Jwt jwt) {
        service.adicionar(Autenticado.id(jwt), imovelId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{imovelId}")
    public ResponseEntity<Void> remover(@PathVariable Integer imovelId, @AuthenticationPrincipal Jwt jwt) {
        service.remover(Autenticado.id(jwt), imovelId);
        return ResponseEntity.noContent().build();
    }
}
