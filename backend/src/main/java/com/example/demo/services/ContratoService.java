package com.example.demo.services;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dtos.ContratoDTO;
import com.example.demo.exceptions.RegraNegocioException;
import com.example.demo.models.ContratoModel;
import com.example.demo.models.ImovelModel;
import com.example.demo.models.OfertaModel;
import com.example.demo.models.StatusContrato;
import com.example.demo.models.StatusImovel;
import com.example.demo.models.StatusOferta;
import com.example.demo.models.TipoOferta;
import com.example.demo.repositories.ContratoRepository;
import com.example.demo.repositories.OfertaRepository;
import com.example.demo.repositories.UserRepository;

// Regras de negócio dos contratos:
//   corretor prepara (AGUARDANDO_APROVACAO) -> admin aprova (AGUARDANDO_ASSINATURA, e-mail ao cliente)
//   -> cliente assina (ASSINADO). O admin pode recusar o rascunho ou cancelar o contrato.
@Service
public class ContratoService {

    private static final Logger log = LoggerFactory.getLogger(ContratoService.class);

    private final ContratoRepository contratos;
    private final OfertaRepository ofertas;
    private final UserRepository usuarios;
    private final ContratoPdf pdf;
    private final EmailService emailService;
    private final String uploadDir;
    private final String nomeImobiliaria;
    private final String frontUrl;

    public ContratoService(ContratoRepository contratos, OfertaRepository ofertas, UserRepository usuarios,
                           ContratoPdf pdf, EmailService emailService,
                           @Value("${app.upload-dir}") String uploadDir,
                           @Value("${app.imobiliaria.nome}") String nomeImobiliaria,
                           @Value("${app.front-url:http://localhost:3000}") String frontUrl) {
        this.contratos = contratos;
        this.ofertas = ofertas;
        this.usuarios = usuarios;
        this.pdf = pdf;
        this.emailService = emailService;
        this.uploadDir = uploadDir;
        this.nomeImobiliaria = nomeImobiliaria;
        this.frontUrl = frontUrl;
    }

    // Corretor/admin prepara o contrato de uma oferta ACEITA e o PDF é gerado.
    @Transactional
    public ContratoDTO preparar(Integer ofertaId, Integer preparadorId) {
        OfertaModel oferta = ofertas.findById(ofertaId)
            .orElseThrow(() -> new NoSuchElementException("Oferta não encontrada."));

        if (oferta.getStatus() != StatusOferta.ACEITA) {
            throw new RegraNegocioException("Só é possível preparar o contrato de uma oferta aceita.");
        }
        if (contratos.findFirstByOfertaIdAndStatusNot(ofertaId, StatusContrato.CANCELADO).isPresent()) {
            throw new RegraNegocioException("Esta oferta já tem um contrato em andamento.");
        }

        ContratoModel contrato = new ContratoModel();
        contrato.setOferta(oferta);
        contrato.setStatus(StatusContrato.AGUARDANDO_APROVACAO);
        contrato.setPreparadoPor(usuarios.getReferenceById(preparadorId));
        contrato = contratos.save(contrato);

        Path destino = Paths.get(uploadDir, "contratos", "contrato-" + contrato.getId() + ".pdf");
        try {
            pdf.gerar(destino, contrato, nomeImobiliaria);
        } catch (IOException e) {
            throw new UncheckedIOException("Falha ao gerar o PDF do contrato", e);
        }
        contrato.setCaminhoPdf(destino.toString());
        return paraDTO(contrato);
    }

    // Admin aprova: o contrato vai para o cliente (AGUARDANDO_ASSINATURA) e ele é avisado por e-mail.
    // Se o e-mail falhar (ex.: sandbox do Mailgun), a aprovação continua valendo.
    @Transactional
    public ContratoDTO aprovar(Integer id) {
        ContratoModel contrato = buscar(id);
        if (contrato.getStatus() != StatusContrato.AGUARDANDO_APROVACAO) {
            throw new RegraNegocioException("Só contratos aguardando aprovação podem ser aprovados.");
        }
        contrato.setStatus(StatusContrato.AGUARDANDO_ASSINATURA);
        contrato.setDataAprovacao(LocalDateTime.now());

        return paraDTO(contrato).comNotificacao(notificarCliente(contrato));
    }

    // Admin recusa o rascunho do corretor: o contrato é cancelado e o corretor pode preparar outro.
    @Transactional
    public ContratoDTO recusar(Integer id) {
        ContratoModel contrato = buscar(id);
        if (contrato.getStatus() != StatusContrato.AGUARDANDO_APROVACAO) {
            throw new RegraNegocioException("Só contratos aguardando aprovação podem ser recusados.");
        }
        contrato.setStatus(StatusContrato.CANCELADO);
        return paraDTO(contrato);
    }

    // Cliente desistiu: o admin cancela, o imóvel volta a ficar disponível e as ofertas que estavam
    // em espera voltam a ser pendentes.
    @Transactional
    public ContratoDTO cancelar(Integer id) {
        ContratoModel contrato = buscar(id);
        if (contrato.getStatus() == StatusContrato.ASSINADO) {
            throw new RegraNegocioException("Um contrato já assinado não pode ser cancelado.");
        }
        if (contrato.getStatus() == StatusContrato.CANCELADO) {
            throw new RegraNegocioException("O contrato já está cancelado.");
        }
        contrato.setStatus(StatusContrato.CANCELADO);

        OfertaModel oferta = contrato.getOferta();
        ImovelModel imovel = oferta.getImovel();
        if (oferta.getStatus() == StatusOferta.ACEITA) {
            oferta.setStatus(StatusOferta.CANCELADA);
        }
        if (StatusImovel.RESERVADO.equalsIgnoreCase(imovel.getStatus())) {
            imovel.setStatus(StatusImovel.DISPONIVEL);
        }
        for (OfertaModel outra : ofertas.findByImovelIdAndStatusIn(imovel.getId(), List.of(StatusOferta.EM_ESPERA))) {
            outra.setStatus(StatusOferta.PENDENTE);
        }
        return paraDTO(contrato);
    }

    // Cliente assina: o imóvel vira Alugado ou Vendido e as demais ofertas dele são recusadas.
    @Transactional
    public ContratoDTO assinar(Integer id, Integer usuarioId) {
        ContratoModel contrato = buscar(id);
        OfertaModel oferta = contrato.getOferta();
        if (!oferta.getUsuario().getId().equals(usuarioId)) {
            throw new AccessDeniedException("Este contrato não é seu.");
        }
        if (contrato.getStatus() != StatusContrato.AGUARDANDO_ASSINATURA) {
            throw new RegraNegocioException("Este contrato não está aguardando assinatura.");
        }

        contrato.setStatus(StatusContrato.ASSINADO);
        contrato.setDataAssinatura(LocalDateTime.now());

        ImovelModel imovel = oferta.getImovel();
        imovel.setStatus(oferta.getTipo() == TipoOferta.VENDA ? StatusImovel.VENDIDO : StatusImovel.ALUGADO);

        for (OfertaModel outra : ofertas.findByImovelIdAndStatusIn(imovel.getId(),
                List.of(StatusOferta.PENDENTE, StatusOferta.EM_ESPERA))) {
            outra.setStatus(StatusOferta.RECUSADA);
        }
        return paraDTO(contrato);
    }

    @Transactional(readOnly = true)
    public List<ContratoDTO> listar() {
        return contratos.findAllByOrderByCriadoEmDesc().stream().map(this::paraDTO).toList();
    }

    @Transactional(readOnly = true)
    public List<ContratoDTO> meus(Integer usuarioId) {
        return contratos.findByOfertaUsuarioIdAndDataAprovacaoIsNotNullOrderByCriadoEmDesc(usuarioId)
            .stream().map(this::paraDTO).toList();
    }

    // Quem pode baixar: a equipe (corretor/admin) sempre; o cliente só o próprio contrato já enviado.
    @Transactional(readOnly = true)
    public Path arquivoPdf(Integer id, Integer usuarioId, boolean equipe) {
        ContratoModel contrato = buscar(id);
        if (!equipe) {
            boolean dono = contrato.getOferta().getUsuario().getId().equals(usuarioId);
            if (!dono || contrato.getDataAprovacao() == null) {
                throw new AccessDeniedException("Você não tem acesso a este contrato.");
            }
        }
        if (contrato.getCaminhoPdf() == null || !Files.isReadable(Paths.get(contrato.getCaminhoPdf()))) {
            throw new NoSuchElementException("O arquivo PDF deste contrato não foi encontrado.");
        }
        return Paths.get(contrato.getCaminhoPdf());
    }

    private boolean notificarCliente(ContratoModel contrato) {
        OfertaModel oferta = contrato.getOferta();
        ImovelModel imovel = oferta.getImovel();
        try {
            Map<String, Object> variaveis = new HashMap<>();
            variaveis.put("nomeCliente", oferta.getUsuario().getNome());
            variaveis.put("numeroContrato", contrato.getId());
            variaveis.put("imovelTitulo", imovel.getTitulo());
            variaveis.put("tipo", oferta.getTipo() == TipoOferta.VENDA ? "compra e venda" : "locação");
            variaveis.put("valor", NumberFormat.getCurrencyInstance(new java.util.Locale("pt", "BR"))
                .format(oferta.getValorProposto()));
            variaveis.put("link", frontUrl + "/cliente/contratos");
            variaveis.put("nomeImobiliaria", nomeImobiliaria);

            emailService.enviarEmailComAnexo(
                oferta.getUsuario().getEmail(),
                "Seu contrato do imóvel " + imovel.getId() + " está pronto para assinatura",
                "email/contrato-aprovado",
                variaveis,
                Paths.get(contrato.getCaminhoPdf()),
                "contrato-" + contrato.getId() + ".pdf");
            return true;
        } catch (Exception e) {
            log.error("Contrato {} aprovado, mas o e-mail para {} não foi enviado", contrato.getId(),
                oferta.getUsuario().getEmail(), e);
            return false;
        }
    }

    private ContratoModel buscar(Integer id) {
        return contratos.findById(id).orElseThrow(() -> new NoSuchElementException("Contrato não encontrado."));
    }

    private ContratoDTO paraDTO(ContratoModel c) {
        OfertaModel o = c.getOferta();
        return new ContratoDTO(
            c.getId(), o.getId(), o.getImovel().getId(), o.getImovel().getTitulo(),
            o.getUsuario().getId(), o.getUsuario().getNome(), o.getUsuario().getEmail(),
            o.getTipo(), o.getValorProposto(), c.getStatus(), c.getCriadoEm(),
            c.getDataAprovacao(), c.getDataAssinatura(),
            c.getPreparadoPor() == null ? null : c.getPreparadoPor().getNome(), null);
    }
}
