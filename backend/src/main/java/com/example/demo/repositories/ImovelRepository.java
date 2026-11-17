package com.example.demo.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import com.example.demo.models.ImovelModel;

public interface ImovelRepository extends JpaRepository<ImovelModel, Integer>,
        JpaSpecificationExecutor<ImovelModel> {

    // painel: totais e gráficos
    long countByStatusStartingWithIgnoreCase(String prefixo);

    long countByPrecoVendaIsNotNull();

    long countByPrecoAluguelIsNotNull();

    @Query("select coalesce(b.nome, 'Sem bairro'), count(i) from ImovelModel i "
         + "left join i.bairro b group by coalesce(b.nome, 'Sem bairro') order by count(i) desc")
    List<Object[]> contarPorBairro();
}
