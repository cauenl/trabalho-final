-- ============================================================
-- Imobiliária API: dados de exemplo (bairros, tipos e imóveis)
-- Rode DEPOIS do schema.sql (ou depois de iniciar o app uma vez).
-- Uso:  mysql -u root restaurante < database/dados-exemplo.sql
--
-- Não inclui usuários (senhas) nem fotos. O administrador inicial é
-- criado pelo app na primeira execução (veja app.admin.* em
-- application-local.properties).
-- ============================================================

INSERT INTO `bairros` (`id`, `cep_inicial`, `cidade`, `estado`, `nome`) VALUES (1,'80000','Curitiba','PR','Centro'),(2,'80000','Curitiba','PR','Centro'),(3,'98280000','Panambi','PR','Medianeira');
INSERT INTO `tipos_imoveis` (`id`, `created_at`, `descricao`, `nome`, `updated_at`) VALUES (1,'2026-10-06 21:03:58.000000','Casa residencial','Casa','2026-10-06 21:03:58.000000'),(2,'2026-10-06 21:04:27.000000','Predio Residencial','Predio','2026-10-06 21:04:27.000000');
INSERT INTO `imoveis` (`id`, `area_construida`, `area_total`, `banheiros`, `caracteristicas`, `cep`, `complemento`, `created_at`, `descricao`, `destaque`, `dormitorios`, `endereco`, `finalidade`, `garagem`, `numero`, `preco_aluguel`, `preco_venda`, `status`, `titulo`, `updated_at`, `bairro_id`, `tipo_imovel_id`) VALUES (2,180.75,300.50,512,'Piscina, Churrasqueira, Jardim','12345-678','Casa 02','2026-10-06 21:05:35.000000','Excelente casa em bairro tranquilo, próximo a escolas e comércios.','',3,'Rua das Flores','Residencial',2,'123',3500.00,850000.00,'Disponível','Casa ampla com piscina','2026-10-27 20:16:42.000000',3,2),(3,180.75,300.50,2,'Piscina, Churrasqueira, Jardim','12345-678','Casa 02','2026-10-06 21:05:37.000000','Excelente casa em bairro tranquilo, próximo a escolas e comércios.','',3,'Rua das Flores','Residencial',2,'123',3500.00,850000.00,'Disponível','Predio bem grande','2026-10-06 21:08:56.000000',1,2),(7,180.75,300.50,2,'Piscina, Churrasqueira, Jardim','12345-678','Casa 02','2026-10-27 20:19:26.000000','TESTANDO O USUARIO ADMIN','',3,'Rua das Flores','Residencial',2,'123',3500.00,850000.00,'Disponível','Casa ampla com piscina','2026-10-27 20:19:26.000000',1,2);
