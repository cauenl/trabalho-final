package com.example.demo.models;

import java.io.Serializable;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "contratos")
@Getter
@Setter
public class ContratoModel implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "oferta_id")
    private OfertaModel oferta;

    @Column(name = "caminho_pdf")
    private String caminhoPdf;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private StatusContrato status;

    @Column(name = "data_aprovacao")
    private LocalDateTime dataAprovacao;

    @Column(name = "data_assinatura")
    private LocalDateTime dataAssinatura;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "preparado_por_id")
    private UserModel preparadoPor;

    @CreationTimestamp
    @Column(name = "criado_em", updatable = false)
    private LocalDateTime criadoEm;
}
