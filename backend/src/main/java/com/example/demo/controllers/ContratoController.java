package com.example.demo.controllers;

import java.nio.file.Path;
import java.util.List;
import java.util.Map;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.config.Autenticado;
import com.example.demo.dtos.ContratoDTO;
import com.example.demo.exceptions.RequisicaoInvalidaException;
import com.example.demo.services.ContratoService;

@RestController
@RequestMapping("/contratos")
public class ContratoController {

    private final ContratoService service;

    public ContratoController(ContratoService service) {
        this.service = service;
    }

    // corretor/admin: prepara o contrato de uma oferta aceita: { "ofertaId": 1 }
    @PostMapping
    public ResponseEntity<ContratoDTO> preparar(@RequestBody Map<String, Integer> corpo,
                                                @AuthenticationPrincipal Jwt jwt) {
        Integer ofertaId = corpo.get("ofertaId");
        if (ofertaId == null) {
            throw new RequisicaoInvalidaException("Informe a oferta (ofertaId).");
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(service.preparar(ofertaId, Autenticado.id(jwt)));
    }

    // corretor/admin: todos os contratos
    @GetMapping
    public ResponseEntity<List<ContratoDTO>> listar() {
        return ResponseEntity.ok(service.listar());
    }

    // cliente: os contratos que já foram enviados a ele
    @GetMapping("/meus")
    public ResponseEntity<List<ContratoDTO>> meus(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(service.meus(Autenticado.id(jwt)));
    }

    // admin
    @PatchMapping("/{id}/aprovar")
    public ResponseEntity<ContratoDTO> aprovar(@PathVariable Integer id) {
        return ResponseEntity.ok(service.aprovar(id));
    }

    // admin
    @PatchMapping("/{id}/recusar")
    public ResponseEntity<ContratoDTO> recusar(@PathVariable Integer id) {
        return ResponseEntity.ok(service.recusar(id));
    }

    // admin
    @PatchMapping("/{id}/cancelar")
    public ResponseEntity<ContratoDTO> cancelar(@PathVariable Integer id) {
        return ResponseEntity.ok(service.cancelar(id));
    }

    // cliente
    @PostMapping("/{id}/assinar")
    public ResponseEntity<ContratoDTO> assinar(@PathVariable Integer id, @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(service.assinar(id, Autenticado.id(jwt)));
    }

    // equipe baixa qualquer um; o cliente só o próprio, depois de aprovado
    @GetMapping("/{id}/pdf")
    public ResponseEntity<Resource> pdf(@PathVariable Integer id, @AuthenticationPrincipal Jwt jwt) {
        Path arquivo = service.arquivoPdf(id, Autenticado.id(jwt), Autenticado.equipe(jwt));
        return ResponseEntity.ok()
            .contentType(MediaType.APPLICATION_PDF)
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"contrato-" + id + ".pdf\"")
            .body(new FileSystemResource(arquivo));
    }
}
