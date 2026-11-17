package com.example.demo.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.config.Autenticado;
import com.example.demo.dtos.OfertaDTO;
import com.example.demo.dtos.OfertaRequest;
import com.example.demo.services.OfertaService;

@RestController
@RequestMapping("/ofertas")
public class OfertaController {

    private final OfertaService service;

    public OfertaController(OfertaService service) {
        this.service = service;
    }

    // cliente: faz uma oferta
    @PostMapping
    public ResponseEntity<OfertaDTO> criar(@RequestBody OfertaRequest req, @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.criar(Autenticado.id(jwt), req));
    }

    // cliente: as suas ofertas
    @GetMapping("/minhas")
    public ResponseEntity<List<OfertaDTO>> minhas(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(service.minhas(Autenticado.id(jwt)));
    }

    // corretor/admin: todas as ofertas (?status=PENDENTE filtra por situação)
    @GetMapping
    public ResponseEntity<List<OfertaDTO>> listar(@RequestParam(required = false) String status) {
        return ResponseEntity.ok(service.listar(status));
    }

    // cliente: cancela a própria oferta
    @PatchMapping("/{id}/cancelar")
    public ResponseEntity<OfertaDTO> cancelar(@PathVariable Integer id, @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(service.cancelar(id, Autenticado.id(jwt)));
    }

    // corretor/admin
    @PatchMapping("/{id}/aceitar")
    public ResponseEntity<OfertaDTO> aceitar(@PathVariable Integer id) {
        return ResponseEntity.ok(service.aceitar(id));
    }

    // corretor/admin
    @PatchMapping("/{id}/recusar")
    public ResponseEntity<OfertaDTO> recusar(@PathVariable Integer id) {
        return ResponseEntity.ok(service.recusar(id));
    }
}
