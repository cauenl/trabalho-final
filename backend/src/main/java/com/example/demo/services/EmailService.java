package com.example.demo.services;

import java.nio.file.Path;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;
    private final String remetente;

    public EmailService(JavaMailSender mailSender,
                        TemplateEngine templateEngine,
                        @Value("${spring.mail.username}") String remetente) {
        this.mailSender = mailSender;
        this.templateEngine = templateEngine;
        this.remetente = remetente;
    }

    public void enviarEmailComTemplate(String para, String assunto,
                                  String template, Map<String, Object> variaveis)
            throws MessagingException {
        enviar(para, null, assunto, template, variaveis, null, null);
    }

    // responderPara (opcional): quem recebe a resposta ao clicar em "Responder"
    public void enviarEmailComTemplate(String para, String responderPara, String assunto,
                                  String template, Map<String, Object> variaveis)
            throws MessagingException {
        enviar(para, responderPara, assunto, template, variaveis, null, null);
    }

    // e-mail com um arquivo anexo (ex.: o contrato em PDF)
    public void enviarEmailComAnexo(String para, String assunto, String template,
                                    Map<String, Object> variaveis, Path anexo, String nomeAnexo)
            throws MessagingException {
        enviar(para, null, assunto, template, variaveis, anexo, nomeAnexo);
    }

    private void enviar(String para, String responderPara, String assunto, String template,
                        Map<String, Object> variaveis, Path anexo, String nomeAnexo)
            throws MessagingException {

        Context context = new Context();
        context.setVariables(variaveis);

        String html = templateEngine.process(template, context);

        MimeMessage mime = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mime, true, "UTF-8");
        helper.setFrom(remetente);
        helper.setTo(para);
        if (responderPara != null && !responderPara.isBlank()) {
            helper.setReplyTo(responderPara);
        }
        helper.setSubject(assunto);
        helper.setText(html, true);
        if (anexo != null) {
            helper.addAttachment(nomeAnexo, new FileSystemResource(anexo.toFile()));
        }

        mailSender.send(mime);
    }
}
