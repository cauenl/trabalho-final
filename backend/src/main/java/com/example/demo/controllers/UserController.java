package com.example.demo.controllers;

import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.example.demo.config.Autenticado;
import com.example.demo.dtos.UserDTO;
import com.example.demo.exceptions.RegraNegocioException;
import com.example.demo.models.UserModel;
import com.example.demo.services.UserService;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService service;

    public UserController(UserService service) {
        this.service = service;
    }

    // ?busca= filtra por parte do nome ou do e-mail
    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers(@RequestParam(required = false) String busca) {
        List<UserDTO> listaDtos = service.buscar(busca)
                .stream()
                .map(UserDTO::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(listaDtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> find(@PathVariable Integer id) {
        UserModel model = service.find(id);

        if (model == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(new UserDTO(model));
    }

    @PostMapping
    public ResponseEntity<Void> insert(@RequestBody UserDTO dto) {
        UserModel model = service.insert(dto);

        URI uri = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(model.getId())
                .toUri();

        return ResponseEntity.created(uri).build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> update(
            @RequestBody UserDTO dto,
            @PathVariable Integer id,
            @AuthenticationPrincipal Jwt jwt) {

        if (service.find(id) == null) {
            return ResponseEntity.notFound().build();
        }
        // o admin não troca o próprio perfil (evita ficar sem acesso)
        if (id.equals(Autenticado.id(jwt)) && !"ADMIN".equalsIgnoreCase(dto.getTipo())) {
            throw new RegraNegocioException("Você não pode alterar o seu próprio perfil.");
        }

        dto.setId(id);
        service.update(dto);

        return ResponseEntity.noContent().build();
    }

    // troca o perfil: { "tipo": "ADMIN" | "CORRETOR" | "USER" }
    @PatchMapping("/{id}/tipo")
    public ResponseEntity<UserDTO> alterarTipo(@PathVariable Integer id,
                                               @RequestBody Map<String, String> corpo,
                                               @AuthenticationPrincipal Jwt jwt) {
        if (id.equals(Autenticado.id(jwt))) {
            throw new RegraNegocioException("Você não pode alterar o seu próprio perfil.");
        }
        UserModel user = service.alterarTipo(id, corpo.get("tipo"));
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(new UserDTO(user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id, @AuthenticationPrincipal Jwt jwt) {
        if (service.find(id) == null) {
            return ResponseEntity.notFound().build();
        }
        if (id.equals(Autenticado.id(jwt))) {
            throw new RegraNegocioException("Um administrador não pode excluir a si mesmo.");
        }

        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
