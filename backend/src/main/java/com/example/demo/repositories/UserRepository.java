package com.example.demo.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.models.UserModel;

public interface UserRepository extends JpaRepository<UserModel, Integer> {

    Optional<UserModel> findFirstByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByEmailAndIdNot(String email, Integer id);

    // busca por nome ou e-mail (parte do texto, sem diferenciar maiúsculas)
    List<UserModel> findByNomeContainingIgnoreCaseOrEmailContainingIgnoreCase(String nome, String email);
}
