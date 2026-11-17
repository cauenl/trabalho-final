package com.example.demo.services;

import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.demo.dtos.UserDTO;
import com.example.demo.exceptions.RegraNegocioException;
import com.example.demo.exceptions.RequisicaoInvalidaException;
import com.example.demo.models.UserModel;
import com.example.demo.repositories.UserRepository;

@Service
public class UserService {

    private static final Pattern EMAIL = Pattern.compile("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository repository, PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<UserModel> getAllUsers() {
        return repository.findAll();
    }

    // busca por parte do nome ou do e-mail
    public List<UserModel> buscar(String busca) {
        if (busca == null || busca.isBlank()) {
            return repository.findAll();
        }
        String termo = busca.trim();
        return repository.findByNomeContainingIgnoreCaseOrEmailContainingIgnoreCase(termo, termo);
    }

    public UserModel find(Integer id) {
        Optional<UserModel> user = repository.findById(id);
        return user.orElse(null);
    }

    public UserModel insert(UserDTO dto) {
        validar(dto);
        String email = dto.getEmail().trim();
        if (repository.existsByEmail(email)) {
            throw new RegraNegocioException("E-mail já cadastrado.");
        }

        UserModel user = new UserModel();
        user.setNome(dto.getNome().trim());
        user.setEmail(email);
        user.setTipo(normalizarTipo(dto.getTipo()));

        if (dto.getSenha() != null && !dto.getSenha().isBlank()) {
            user.setSenha(passwordEncoder.encode(dto.getSenha()));
        }

        return repository.save(user);
    }

    public UserModel update(UserDTO dto) {
        UserModel user = find(dto.getId());

        if (user == null) {
            return null;
        }

        validar(dto);
        String email = dto.getEmail().trim();
        if (repository.existsByEmailAndIdNot(email, user.getId())) {
            throw new RegraNegocioException("E-mail já cadastrado.");
        }

        user.setNome(dto.getNome().trim());
        user.setEmail(email);
        user.setTipo(normalizarTipo(dto.getTipo()));

        // sem senha no corpo = mantem a atual
        if (dto.getSenha() != null && !dto.getSenha().isBlank()) {
            user.setSenha(passwordEncoder.encode(dto.getSenha()));
        }

        return repository.save(user);
    }

    // troca só o perfil: ADMIN, CORRETOR ou USER (cliente)
    public UserModel alterarTipo(Integer id, String tipo) {
        UserModel user = find(id);
        if (user == null) {
            return null;
        }
        user.setTipo(normalizarTipo(tipo));
        return repository.save(user);
    }

    public void delete(Integer id) {
        repository.deleteById(id);
    }

    private void validar(UserDTO dto) {
        if (dto.getNome() == null || dto.getNome().isBlank()) {
            throw new RequisicaoInvalidaException("Informe o nome.");
        }
        if (dto.getEmail() == null || !EMAIL.matcher(dto.getEmail().trim()).matches()) {
            throw new RequisicaoInvalidaException("Informe um e-mail válido.");
        }
    }

    // vazio vira USER; valor desconhecido é recusado
    public static String normalizarTipo(String tipo) {
        String t = tipo == null || tipo.isBlank() ? "USER" : tipo.trim().toUpperCase();
        if (!t.equals("ADMIN") && !t.equals("CORRETOR") && !t.equals("USER")) {
            throw new RequisicaoInvalidaException("Perfil inválido: use ADMIN, CORRETOR ou USER.");
        }
        return t;
    }
}
