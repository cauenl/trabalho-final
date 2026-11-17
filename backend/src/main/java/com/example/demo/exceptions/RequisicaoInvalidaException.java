package com.example.demo.exceptions;

// dado de entrada inválido: vira HTTP 400 com a mensagem
public class RequisicaoInvalidaException extends RuntimeException {
    public RequisicaoInvalidaException(String mensagem) {
        super(mensagem);
    }
}
