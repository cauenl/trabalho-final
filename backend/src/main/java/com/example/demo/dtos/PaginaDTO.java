package com.example.demo.dtos;

import java.util.List;

public record PaginaDTO<T>(List<T> conteudo, int pagina, int tamanho,
                           long totalElementos, int totalPaginas) {
}