package com.example.demo.exceptions;

// violação de regra de negócio: vira HTTP 409 com a mensagem da regra
public class RegraNegocioException extends RuntimeException {
    public RegraNegocioException(String mensagem) {
        super(mensagem);
    }
}
