package com.example.demo.services;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dtos.ImovelResumoDTO;
import com.example.demo.dtos.PaginaDTO;
import com.example.demo.models.ImovelModel;
import com.example.demo.repositories.ImovelRepository;
import com.example.demo.specs.ImovelSpecs;

@Service
public class ImovelService {
    private final ImovelRepository repository;
    private final FotoImovelService fotoService;

    public ImovelService(ImovelRepository repository, FotoImovelService fotoService) {
        this.repository = repository;
        this.fotoService = fotoService;
    }

    public List<ImovelModel> getAll() {
        return repository.findAll();
    }

    public ImovelModel find(Integer id) {
        Optional<ImovelModel> model = repository.findById(id);
        return model.orElse(null);
    }

    public ImovelModel insert(ImovelModel model) {
        return repository.save(model);
    }

    // o controller confere se o imovel existe antes de chamar
    public ImovelModel update(ImovelModel model) {
        return repository.save(model);
    }

    // altera so o status; devolve null se o imovel nao existe
    public ImovelModel atualizarStatus(Integer id, String status) {
        ImovelModel imovel = find(id);
        if (imovel == null) {
            return null;
        }
        imovel.setStatus(status);
        return repository.save(imovel);
    }

    // apaga tambem as fotos (arquivos e registros), que dependem do imovel
    @Transactional
    public void delete(Integer id) {
        fotoService.excluirPorImovel(id);
        repository.deleteById(id);
    }

    // vitrine: só disponíveis, com filtros, ordenação por preço e paginação.
    // finalidade "ALUGUEL" usa precoAluguel; qualquer outra coisa usa precoVenda.
    public PaginaDTO<ImovelResumoDTO> vitrine(Integer bairroId, String finalidade,
                                              BigDecimal precoMin, BigDecimal precoMax,
                                              String ordem, int pagina, int tamanho) {
        boolean aluguel = "ALUGUEL".equalsIgnoreCase(finalidade);
        String campo = aluguel ? "precoAluguel" : "precoVenda";

        Specification<ImovelModel> spec = ImovelSpecs.disponivel();
        if (bairroId != null) {
            spec = spec.and(ImovelSpecs.doBairro(bairroId));
        }
        if (aluguel || "VENDA".equalsIgnoreCase(finalidade) || precoMin != null || precoMax != null) {
            spec = spec.and(ImovelSpecs.comPreco(campo, precoMin, precoMax));
        }

        String ordenacao = ordem == null ? "" : ordem;
        Sort sort = switch (ordenacao) {
            case "preco_asc" -> Sort.by(Sort.Direction.ASC, campo);
            case "preco_desc" -> Sort.by(Sort.Direction.DESC, campo);
            default -> Sort.by(Sort.Direction.DESC, "id");
        };

        int tam = Math.min(Math.max(tamanho, 1), 50);
        Pageable pageable = PageRequest.of(Math.max(pagina, 0), tam, sort);
        Page<ImovelModel> resultado = repository.findAll(spec, pageable);

        List<ImovelResumoDTO> itens = resultado.getContent().stream()
            .map(i -> ImovelResumoDTO.de(i, fotoService.capaDoImovel(i.getId())))
            .toList();

        return new PaginaDTO<>(itens, resultado.getNumber(), resultado.getSize(),
            resultado.getTotalElements(), resultado.getTotalPages());
    }
}