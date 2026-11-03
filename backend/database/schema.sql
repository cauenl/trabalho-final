-- ============================================================
-- Imobiliária API: estrutura do banco de dados (MySQL / MariaDB)
-- Gerado a partir do banco "restaurante" criado pelo Hibernate.
-- Uso:  mysql -u root < database/schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS restaurante CHARACTER SET utf8mb4;
USE restaurante;

SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS `bairros` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cep_inicial` varchar(255) DEFAULT NULL,
  `cidade` varchar(255) DEFAULT NULL,
  `estado` varchar(255) DEFAULT NULL,
  `nome` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
CREATE TABLE IF NOT EXISTS `fotos_imoveis` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `caminho` varchar(255) DEFAULT NULL,
  `capa` bit(1) DEFAULT NULL,
  `nome_arquivo` varchar(255) DEFAULT NULL,
  `ordem` int(11) DEFAULT NULL,
  `imovel_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKlxjlrrwj621jii9i201qr6x3d` (`imovel_id`),
  CONSTRAINT `FKlxjlrrwj621jii9i201qr6x3d` FOREIGN KEY (`imovel_id`) REFERENCES `imoveis` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
CREATE TABLE IF NOT EXISTS `imoveis` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `area_construida` decimal(15,2) DEFAULT NULL,
  `area_total` decimal(15,2) DEFAULT NULL,
  `banheiros` int(11) DEFAULT NULL,
  `caracteristicas` text DEFAULT NULL,
  `cep` varchar(255) DEFAULT NULL,
  `complemento` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `descricao` text DEFAULT NULL,
  `destaque` bit(1) DEFAULT NULL,
  `dormitorios` int(11) DEFAULT NULL,
  `endereco` varchar(255) DEFAULT NULL,
  `finalidade` varchar(255) DEFAULT NULL,
  `garagem` int(11) DEFAULT NULL,
  `numero` varchar(255) DEFAULT NULL,
  `preco_aluguel` decimal(15,2) DEFAULT NULL,
  `preco_venda` decimal(15,2) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `titulo` varchar(255) DEFAULT NULL,
  `updated_at` datetime(6) NOT NULL,
  `bairro_id` int(11) DEFAULT NULL,
  `tipo_imovel_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKlbe75ud15gr1jhci27a5febtj` (`bairro_id`),
  KEY `FK8l4n1619tyasatoa0a7051ins` (`tipo_imovel_id`),
  CONSTRAINT `FK8l4n1619tyasatoa0a7051ins` FOREIGN KEY (`tipo_imovel_id`) REFERENCES `tipos_imoveis` (`id`),
  CONSTRAINT `FKlbe75ud15gr1jhci27a5febtj` FOREIGN KEY (`bairro_id`) REFERENCES `bairros` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
CREATE TABLE IF NOT EXISTS `tipos_imoveis` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `descricao` text DEFAULT NULL,
  `nome` varchar(255) DEFAULT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) DEFAULT NULL,
  `nome` varchar(255) DEFAULT NULL,
  `senha` varchar(255) DEFAULT NULL,
  `tipo` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

SET FOREIGN_KEY_CHECKS = 1;
