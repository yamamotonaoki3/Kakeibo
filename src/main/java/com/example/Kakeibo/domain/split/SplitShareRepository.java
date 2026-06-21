package com.example.Kakeibo.domain.split;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface SplitShareRepository extends JpaRepository<SplitShare, Long> {

    @Query("SELECT ss FROM SplitShare ss " +
           "JOIN FETCH ss.splitTransaction st " +
           "JOIN FETCH st.group " +
           "JOIN FETCH st.paidBy " +
           "WHERE ss.user.id = :userId " +
           "AND (:from IS NULL OR st.splitDate >= :from) " +
           "AND (:to IS NULL OR st.splitDate <= :to) " +
           "ORDER BY st.splitDate DESC")
    List<SplitShare> findByUserId(
            @Param("userId") Long userId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);
}
