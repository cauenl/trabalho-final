package com.example.demo.services;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dtos.ImovelResumoDTO;
import com.example.demo.models.FavoritoModel;
import com.example.demo.models.ImovelModel;
import com.example.demo.repositories.FavoritoRepository;
import com.example.demo.repositories.ImovelRepository;
import com.example.demo.repositories.UserRepository;

@Service
public class FavoritoService {

    private final FavoritoRepository favoritos;
    private final ImovelRepository imoveis;
    private final UserRepository usuarios;
    private final FotoImovelService fotoService;

    public FavoritoService(FavoritoRepository favoritos, ImovelRepository imoveis,
                           UserRepository usuarios, FotoImovelService fotoService) {
        this.favoritos = favoritos;
        this.imoveis = imoveis;
        this.usuarios = usuarios;
        this.fotoService = fotoService;
    }

    // adicionar duas vezes não duplica
    @Transactional
    public void adicionar(Integer usuarioId, Integer imovelId) {
        if (favoritos.findByUsuarioIdAndImovelId(usuarioId, imovelId).isPresent()) {
            return;
        }
        ImovelModel imovel = imoveis.findById(imovelId)
            .orElseThrow(() -> new NoSuchElementException("Imóvel não encontrado."));

        FavoritoModel favorito = new FavoritoModel();
        favorito.setUsuario(usuarios.getReferenceById(usuarioId));
        favorito.setImovel(imovel);
        favoritos.save(favorito);
    }

    @Transactional
    public void remover(Integer usuarioId, Integer imovelId) {
        favoritos.findByUsuarioIdAndImovelId(usuarioId, imovelId).ifPresent(favoritos::delete);
    }

    @Transactional(readOnly = true)
    public List<ImovelResumoDTO> listar(Integer usuarioId) {
        return favoritos.findByUsuarioIdOrderByIdDesc(usuarioId).stream()
            .map(f -> ImovelResumoDTO.de(f.getImovel(), fotoService.capaDoImovel(f.getImovel().getId())))
            .toList();
    }

    @Transactional(readOnly = true)
    public List<Integer> ids(Integer usuarioId) {
        return favoritos.findByUsuarioIdOrderByIdDesc(usuarioId).stream()
            .map(f -> f.getImovel().getId())
            .toList();
    }
}
