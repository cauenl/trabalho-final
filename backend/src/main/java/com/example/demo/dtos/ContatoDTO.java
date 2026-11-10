package com.example.demo.dtos;

import lombok.Getter;
import lombok.Setter;

// dados do visitante que quer falar com a imobiliária sobre um imóvel
@Getter
@Setter
public class ContatoDTO {
    private String nome;
    private String email;
    private String telefone; // opcional
    private String mensagem; // opcional
}
