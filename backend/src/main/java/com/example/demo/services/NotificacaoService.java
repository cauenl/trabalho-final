package com.example.demo.services;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

// Avisos por e-mail quando uma oferta ou um contrato muda de situação.
// - só sai depois que a transação foi gravada (se der erro e voltar atrás, nenhum e-mail é enviado);
// - o envio é feito em segundo plano e uma falha (ex.: destinatário não autorizado no sandbox do
//   Mailgun) só vai para o log: nunca atrapalha a ação do usuário.
@Service
public class NotificacaoService {

    private static final Logger log = LoggerFactory.getLogger(NotificacaoService.class);

    private final EmailService emailService;
    private final String nomeImobiliaria;
    private final String emailImobiliaria;
    private final String frontUrl;

    public NotificacaoService(EmailService emailService,
                              @Value("${app.imobiliaria.nome}") String nomeImobiliaria,
                              @Value("${app.imobiliaria.email:}") String emailImobiliaria,
                              @Value("${app.front-url:http://localhost:3000}") String frontUrl) {
        this.emailService = emailService;
        this.nomeImobiliaria = nomeImobiliaria;
        this.emailImobiliaria = emailImobiliaria;
        this.frontUrl = frontUrl;
    }

    // Aviso para um usuário. caminho é a rota do front-end (ex.: "/cliente/ofertas"); pode ser null.
    public void avisar(String para, String nome, String assunto, String titulo, String mensagem,
                       String caminho, String textoLink) {
        if (para == null || para.isBlank()) {
            return;
        }
        Map<String, Object> variaveis = new HashMap<>();
        variaveis.put("nome", nome);
        variaveis.put("titulo", titulo);
        variaveis.put("mensagem", mensagem);
        variaveis.put("link", caminho == null ? null : frontUrl + caminho);
        variaveis.put("textoLink", textoLink);
        variaveis.put("nomeImobiliaria", nomeImobiliaria);

        depoisDoCommit(() -> enviar(para, "[" + nomeImobiliaria + "] " + assunto, variaveis));
    }

    // Aviso para a equipe da imobiliária (e-mail configurado em app.imobiliaria.email).
    public void avisarImobiliaria(String assunto, String titulo, String mensagem, String caminho, String textoLink) {
        avisar(emailImobiliaria, nomeImobiliaria, assunto, titulo, mensagem, caminho, textoLink);
    }

    private void enviar(String para, String assunto, Map<String, Object> variaveis) {
        CompletableFuture.runAsync(() -> {
            try {
                emailService.enviarEmailComTemplate(para, assunto, "email/notificacao", variaveis);
                log.info("E-mail enviado para {}: {}", para, assunto);
            } catch (Exception e) {
                log.warn("E-mail NÃO enviado para {} ({}): {}", para, assunto, e.getMessage());
            }
        });
    }

    private void depoisDoCommit(Runnable acao) {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    acao.run();
                }
            });
        } else {
            acao.run();
        }
    }
}
