package com.example.demo.services;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
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
        enviarEmailComTemplate(para, null, assunto, template, variaveis);
    }

    // responderPara (opcional): quem recebe a resposta ao clicar em "Responder"
    public void enviarEmailComTemplate(String para, String responderPara, String assunto,
                                  String template, Map<String, Object> variaveis)
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

        mailSender.send(mime);
    }
}
