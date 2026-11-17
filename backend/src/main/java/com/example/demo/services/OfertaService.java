package com.example.demo.services;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dtos.OfertaDTO;
import com.example.demo.dtos.OfertaRequest;
import com.example.demo.exceptions.RegraNegocioException;
import com.example.demo.exceptions.RequisicaoInvalidaException;
import com.example.demo.models.ContratoModel;
import com.example.demo.models.ImovelModel;
import com.example.demo.models.OfertaModel;
import com.example.demo.models.StatusContrato;
import com.example.demo.models.StatusImovel;
import com.example.demo.models.StatusOferta;
import com.example.demo.models.TipoOferta;
import com.example.demo.models.UserModel;
import com.example.demo.repositories.ContratoRepository;
import com.example.demo.repositories.ImovelRepository;
import com.example.demo.repositories.OfertaRepository;
import com.example.demo.repositories.UserRepository;

// Regras de negócio das ofertas.
@Service
public class OfertaService {

    private final OfertaRepository ofertas;
    private final ImovelRepository imoveis;
    private final UserRepository usuarios;
    private final ContratoRepository contratos;

    public OfertaService(OfertaRepository ofertas, ImovelRepository imoveis,
                         UserRepository usuarios, ContratoRepository contratos) {
        this.ofertas = ofertas;
        this.imoveis = imoveis;
        this.usuarios = usuarios;
        this.contratos = contratos;
    }

    // Cliente faz uma oferta. Regras: só imóvel disponível; no máximo 1 oferta pendente do mesmo
    // cliente para o mesmo imóvel; vários clientes podem ofertar no mesmo imóvel ao mesmo tempo.
    @Transactional
    public OfertaDTO criar(Integer usuarioId, OfertaRequest req) {
        if (req.imovelId() == null) {
            throw new RequisicaoInvalidaException("Informe o imóvel.");
        }
        TipoOferta tipo = converterTipo(req.tipo());
        if (req.valor() == null || req.valor().signum() <= 0) {
            throw new RequisicaoInvalidaException("Informe um valor proposto maior que zero.");
        }
        if (req.mensagem() != null && req.mensagem().length() > 2000) {
            throw new RequisicaoInvalidaException("A mensagem pode ter até 2000 caracteres.");
        }

        ImovelModel imovel = imoveis.findById(req.imovelId())
            .orElseThrow(() -> new NoSuchElementException("Imóvel não encontrado."));

        if (!StatusImovel.disponivel(imovel.getStatus())) {
            throw new RegraNegocioException("Este imóvel não está disponível para ofertas.");
        }
        if (tipo == TipoOferta.VENDA && imovel.getPrecoVenda() == null) {
            throw new RegraNegocioException("Este imóvel não está à venda.");
        }
        if (tipo == TipoOferta.ALUGUEL && imovel.getPrecoAluguel() == null) {
            throw new RegraNegocioException("Este imóvel não está disponível para aluguel.");
        }
        if (ofertas.existsByUsuarioIdAndImovelIdAndStatus(usuarioId, imovel.getId(), StatusOferta.PENDENTE)) {
            throw new RegraNegocioException("Você já tem uma oferta pendente para este imóvel.");
        }

        UserModel usuario = usuarios.findById(usuarioId)
            .orElseThrow(() -> new NoSuchElementException("Usuário não encontrado."));

        OfertaModel oferta = new OfertaModel();
        oferta.setImovel(imovel);
        oferta.setUsuario(usuario);
        oferta.setTipo(tipo);
        oferta.setValorProposto(req.valor());
        oferta.setMensagem(req.mensagem() == null ? null : req.mensagem().trim());
        oferta.setStatus(StatusOferta.PENDENTE);
        return paraDTO(ofertas.save(oferta));
    }

    @Transactional(readOnly = true)
    public List<OfertaDTO> minhas(Integer usuarioId) {
        return ofertas.findByUsuarioIdOrderByCriadoEmDesc(usuarioId).stream().map(this::paraDTO).toList();
    }

    @Transactional(readOnly = true)
    public List<OfertaDTO> listar(String status) {
        List<OfertaModel> lista = (status == null || status.isBlank())
            ? ofertas.findAllByOrderByCriadoEmDesc()
            : ofertas.findByStatusOrderByCriadoEmDesc(converterStatus(status));
        return lista.stream().map(this::paraDTO).toList();
    }

    // O próprio cliente cancela a sua oferta (pendente ou em espera)
    @Transactional
    public OfertaDTO cancelar(Integer id, Integer usuarioId) {
        OfertaModel oferta = buscar(id);
        if (!oferta.getUsuario().getId().equals(usuarioId)) {
            throw new AccessDeniedException("Esta oferta não é sua.");
        }
        if (oferta.getStatus() != StatusOferta.PENDENTE && oferta.getStatus() != StatusOferta.EM_ESPERA) {
            throw new RegraNegocioException("Só ofertas pendentes ou em espera podem ser canceladas.");
        }
        oferta.setStatus(StatusOferta.CANCELADA);
        return paraDTO(oferta);
    }

    // Aceitar: o imóvel vira Reservado e as outras ofertas pendentes dele ficam EM_ESPERA.
    @Transactional
    public OfertaDTO aceitar(Integer id) {
        OfertaModel oferta = buscar(id);
        if (oferta.getStatus() != StatusOferta.PENDENTE) {
            throw new RegraNegocioException("Só ofertas pendentes podem ser aceitas.");
        }
        ImovelModel imovel = oferta.getImovel();
        if (!StatusImovel.disponivel(imovel.getStatus())) {
            throw new RegraNegocioException(
                "O imóvel não está mais disponível (situação atual: " + imovel.getStatus() + ").");
        }

        oferta.setStatus(StatusOferta.ACEITA);
        imovel.setStatus(StatusImovel.RESERVADO);

        for (OfertaModel outra : ofertas.findByImovelIdAndStatusIn(imovel.getId(), List.of(StatusOferta.PENDENTE))) {
            if (!outra.getId().equals(oferta.getId())) {
                outra.setStatus(StatusOferta.EM_ESPERA);
            }
        }
        return paraDTO(oferta);
    }

    @Transactional
    public OfertaDTO recusar(Integer id) {
        OfertaModel oferta = buscar(id);
        if (oferta.getStatus() != StatusOferta.PENDENTE && oferta.getStatus() != StatusOferta.EM_ESPERA) {
            throw new RegraNegocioException("Só ofertas pendentes ou em espera podem ser recusadas.");
        }
        oferta.setStatus(StatusOferta.RECUSADA);
        return paraDTO(oferta);
    }

    public OfertaDTO paraDTO(OfertaModel o) {
        ContratoModel contrato = contratos.findFirstByOfertaIdAndStatusNot(o.getId(), StatusContrato.CANCELADO)
            .orElse(null);
        ImovelModel imovel = o.getImovel();
        return new OfertaDTO(
            o.getId(), imovel.getId(), imovel.getTitulo(), imovel.getStatus(),
            imovel.getBairro() == null ? null : imovel.getBairro().getNome(),
            o.getUsuario().getId(), o.getUsuario().getNome(), o.getUsuario().getEmail(),
            o.getTipo(), o.getValorProposto(), o.getMensagem(), o.getStatus(), o.getCriadoEm(),
            contrato == null ? null : contrato.getId(),
            contrato == null ? null : contrato.getStatus());
    }

    private OfertaModel buscar(Integer id) {
        return ofertas.findById(id).orElseThrow(() -> new NoSuchElementException("Oferta não encontrada."));
    }

    private TipoOferta converterTipo(String tipo) {
        try {
            return TipoOferta.valueOf(tipo == null ? "" : tipo.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RequisicaoInvalidaException("Tipo de oferta inválido: use VENDA ou ALUGUEL.");
        }
    }

    private StatusOferta converterStatus(String status) {
        try {
            return StatusOferta.valueOf(status.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RequisicaoInvalidaException("Situação inválida: " + status);
        }
    }
}
