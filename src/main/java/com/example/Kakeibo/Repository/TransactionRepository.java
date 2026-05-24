package com.example.Kakeibo.Repository;

import com.example.Kakeibo.Model.Transaction.Transaction;
import com.example.Kakeibo.Model.Transaction.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction,Integer> {

    List<Transaction> findByDate(LocalDate date);

    // 月範囲取得（基本）
    List<Transaction> findByDateBetween(LocalDate start, LocalDate end);

    // 集計（実務寄り）
    @Query("""
        SELECT COALESCE(SUM(t.amount),0)
        FROM Transaction t
        WHERE t.type = :type
        AND t.date BETWEEN :start AND :end
    """)
    Long sumAmountByTypeAndDateBetween(@Param("type") TransactionType type,
                                       @Param("start") LocalDate start,
                                       @Param("end") LocalDate end);
}