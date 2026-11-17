package com.example.demo.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dtos.PainelDTO;
import com.example.demo.services.PainelService;

@RestController
@RequestMapping("/painel")
public class PainelController {

    private final PainelService service;

    public PainelController(PainelService service) {
        this.service = service;
    }

    // totais e dados dos gráficos (corretor e admin)
    @GetMapping("/resumo")
    public ResponseEntity<PainelDTO> resumo() {
        return ResponseEntity.ok(service.resumo());
    }
}
