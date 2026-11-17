package com.example.demo.services;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.stereotype.Component;

import com.example.demo.models.BairroModel;
import com.example.demo.models.ContratoModel;
import com.example.demo.models.ImovelModel;
import com.example.demo.models.OfertaModel;
import com.example.demo.models.TipoOferta;

// Gera o PDF do contrato (texto simples, fontes padrão do PDF).
@Component
public class ContratoPdf {

    private static final float MARGEM = 56f;
    private static final DateTimeFormatter DATA = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    public void gerar(Path destino, ContratoModel contrato, String imobiliaria) throws IOException {
        OfertaModel oferta = contrato.getOferta();
        ImovelModel imovel = oferta.getImovel();
        BairroModel bairro = imovel.getBairro();
        boolean venda = oferta.getTipo() == TipoOferta.VENDA;

        NumberFormat moeda = NumberFormat.getCurrencyInstance(new Locale("pt", "BR"));
        String valor = moeda.format(oferta.getValorProposto()).replace(' ', ' ');

        String endereco = juntar(", ", imovel.getEndereco(), imovel.getNumero(), imovel.getComplemento(),
            bairro == null ? null : bairro.getNome(),
            bairro == null ? null : juntar("/", bairro.getCidade(), bairro.getEstado()));

        Files.createDirectories(destino.getParent());

        PDType1Font normal = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
        PDType1Font negrito = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);

        try (PDDocument doc = new PDDocument(); Escritor e = new Escritor(doc)) {
            e.paragrafo(venda ? "CONTRATO DE COMPRA E VENDA DE IMOVEL" : "CONTRATO DE LOCACAO DE IMOVEL",
                negrito, 16, 4);
            e.paragrafo("Contrato n. " + contrato.getId() + "  -  emitido em " + DATA.format(LocalDateTime.now()),
                normal, 10, 14);

            e.paragrafo("PARTES", negrito, 12, 2);
            e.paragrafo((venda ? "VENDEDORA: " : "LOCADORA: ") + imobiliaria
                + ", na qualidade de intermediadora do negocio.", normal, 11, 2);
            e.paragrafo((venda ? "COMPRADOR(A): " : "LOCATARIO(A): ") + oferta.getUsuario().getNome()
                + " (e-mail " + oferta.getUsuario().getEmail() + ").", normal, 11, 12);

            e.paragrafo("OBJETO", negrito, 12, 2);
            e.paragrafo("Imovel codigo " + imovel.getId() + ": " + imovel.getTitulo() + ".", normal, 11, 2);
            if (!endereco.isBlank()) {
                e.paragrafo("Endereco: " + endereco + (imovel.getCep() == null ? "" : " - CEP " + imovel.getCep())
                    + ".", normal, 11, 2);
            }
            if (imovel.getAreaTotal() != null) {
                e.paragrafo("Area total: " + imovel.getAreaTotal() + " m2.", normal, 11, 2);
            }
            e.paragrafo("", normal, 11, 8);

            e.paragrafo("VALOR E CONDICOES", negrito, 12, 2);
            e.paragrafo((venda ? "Valor da venda: " : "Valor mensal do aluguel: ") + valor + ".", normal, 11, 8);

            List<String> clausulas = new ArrayList<>();
            if (venda) {
                clausulas.add("1. O VENDEDOR transfere ao COMPRADOR a propriedade do imovel descrito neste contrato, "
                    + "livre de onus, pelo valor acima, a ser pago na forma combinada entre as partes.");
                clausulas.add("2. As despesas de escritura e registro correrao por conta do COMPRADOR.");
                clausulas.add("3. A posse sera transmitida apos a quitacao integral do valor.");
            } else {
                clausulas.add("1. O LOCADOR cede ao LOCATARIO o uso do imovel descrito neste contrato pelo valor "
                    + "mensal acima, a ser pago ate o dia combinado de cada mes.");
                clausulas.add("2. O LOCATARIO deve conservar o imovel e devolve-lo nas condicoes em que o recebeu.");
                clausulas.add("3. O prazo e as garantias da locacao seguem o combinado entre as partes.");
            }
            clausulas.add("4. Este contrato so produz efeitos apos a aprovacao da imobiliaria e a assinatura do cliente.");
            clausulas.add("5. Fica eleito o foro da comarca do imovel para resolver qualquer questao deste contrato.");

            e.paragrafo("CLAUSULAS", negrito, 12, 2);
            for (String c : clausulas) {
                e.paragrafo(c, normal, 11, 4);
            }

            e.paragrafo("", normal, 11, 36);
            e.paragrafo("______________________________          ______________________________", normal, 11, 2);
            e.paragrafo(oferta.getUsuario().getNome() + "                    " + imobiliaria, normal, 9, 0);
            e.paragrafo("Cliente                                                          Imobiliaria", normal, 9, 0);

            e.fechar();
            doc.save(destino.toFile());
        }
    }

    private static String juntar(String separador, String... partes) {
        List<String> uteis = new ArrayList<>();
        for (String p : partes) {
            if (p != null && !p.isBlank()) {
                uteis.add(p.trim());
            }
        }
        return String.join(separador, uteis);
    }

    // controla a posição na página, quebra linhas e abre páginas novas
    private static final class Escritor implements AutoCloseable {
        private final PDDocument doc;
        private PDPageContentStream cs;
        private float y;

        Escritor(PDDocument doc) throws IOException {
            this.doc = doc;
            novaPagina();
        }

        private void novaPagina() throws IOException {
            if (cs != null) {
                cs.close();
            }
            PDPage pagina = new PDPage(PDRectangle.A4);
            doc.addPage(pagina);
            cs = new PDPageContentStream(doc, pagina);
            y = PDRectangle.A4.getHeight() - MARGEM;
        }

        void paragrafo(String texto, PDType1Font fonte, float tamanho, float depois) throws IOException {
            float largura = PDRectangle.A4.getWidth() - 2 * MARGEM;
            for (String linha : quebrar(limpar(texto, fonte), fonte, tamanho, largura)) {
                if (y < MARGEM + tamanho) {
                    novaPagina();
                }
                if (!linha.isEmpty()) {
                    cs.beginText();
                    cs.setFont(fonte, tamanho);
                    cs.newLineAtOffset(MARGEM, y);
                    cs.showText(linha);
                    cs.endText();
                }
                y -= tamanho * 1.45f;
            }
            y -= depois;
        }

        // troca por "?" o que a fonte padrão não consegue desenhar
        private static String limpar(String texto, PDType1Font fonte) {
            StringBuilder sb = new StringBuilder();
            for (char c : texto.toCharArray()) {
                try {
                    fonte.encode(String.valueOf(c));
                    sb.append(c);
                } catch (Exception ex) {
                    sb.append('?');
                }
            }
            return sb.toString();
        }

        private static List<String> quebrar(String texto, PDType1Font fonte, float tamanho, float largura)
                throws IOException {
            List<String> linhas = new ArrayList<>();
            if (texto.isEmpty()) {
                linhas.add("");
                return linhas;
            }
            StringBuilder atual = new StringBuilder();
            for (String palavra : texto.split(" ")) {
                String tentativa = atual.isEmpty() ? palavra : atual + " " + palavra;
                if (fonte.getStringWidth(tentativa) / 1000 * tamanho > largura && !atual.isEmpty()) {
                    linhas.add(atual.toString());
                    atual = new StringBuilder(palavra);
                } else {
                    atual = new StringBuilder(tentativa);
                }
            }
            linhas.add(atual.toString());
            return linhas;
        }

        void fechar() throws IOException {
            if (cs != null) {
                cs.close();
                cs = null;
            }
        }

        @Override
        public void close() throws IOException {
            fechar();
        }
    }
}
