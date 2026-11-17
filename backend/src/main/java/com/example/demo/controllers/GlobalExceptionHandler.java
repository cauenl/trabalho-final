package com.example.demo.controllers;

import java.util.NoSuchElementException;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import com.example.demo.exceptions.RegraNegocioException;
import com.example.demo.exceptions.RequisicaoInvalidaException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // regra de negócio violada: 409 com a mensagem da regra (o front-end mostra o texto)
    @ExceptionHandler(RegraNegocioException.class)
    public ResponseEntity<String> regraNegocio(RegraNegocioException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
    }

    @ExceptionHandler(RequisicaoInvalidaException.class)
    public ResponseEntity<String> requisicaoInvalida(RequisicaoInvalidaException e) {
        return ResponseEntity.badRequest().body(e.getMessage());
    }

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<String> naoEncontrado(NoSuchElementException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
    }

    // apagar algo que esta em uso, ou apontar para um id que nao existe
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<String> integridade(DataIntegrityViolationException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
            .body("Operação recusada: o registro está em uso por outros dados ou referencia um id que não existe.");
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<String> arquivoGrande(MaxUploadSizeExceededException e) {
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
            .body("Arquivo maior que o limite permitido (10MB).");
    }
}
