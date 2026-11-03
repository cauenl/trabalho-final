# Banco de dados

Banco **MySQL / MariaDB** chamado `restaurante` (nome herdado da aula; é o que o
`application.properties` usa).

| Arquivo | O que faz |
|---|---|
| `schema.sql` | Cria o banco e as 5 tabelas (`bairros`, `tipos_imoveis`, `imoveis`, `fotos_imoveis`, `usuarios`) |
| `dados-exemplo.sql` | Insere bairros, tipos e imóveis de exemplo |

## Como usar

Com o MySQL ligado (XAMPP), na raiz do projeto:

```bash
mysql -u root < database/schema.sql
mysql -u root restaurante < database/dados-exemplo.sql
```

Nenhum dos dois passos é obrigatório: com `spring.jpa.hibernate.ddl-auto=update` o
Hibernate cria as tabelas sozinho na primeira execução. Os scripts servem para
recriar o banco do zero e para documentar a estrutura.

## Modelo

```
bairros 1 ────< imoveis >──── 1 tipos_imoveis
                  │
                  1
                  │
                  └──< fotos_imoveis

usuarios   (independente; senha guardada com hash BCrypt)
```

- `imoveis.bairro_id` e `imoveis.tipo_imovel_id` são chaves estrangeiras.
- `fotos_imoveis.imovel_id` é obrigatório: não existe foto sem imóvel.
- `usuarios.tipo` define o papel: `admin` vira ADMIN, qualquer outro valor vira USER.

## Usuários

Os scripts **não** trazem usuários. O administrador inicial é criado pelo app na
primeira execução, a partir de `app.admin.email` e `app.admin.senha` (em
`application-local.properties`, que não vai para o Git).

> As próximas etapas do trabalho final adicionam as tabelas `ofertas`, `contratos`
> e `favoritos`; este script será atualizado quando elas existirem.
