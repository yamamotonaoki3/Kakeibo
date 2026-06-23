package com.example.Kakeibo.domain.split;

import com.example.Kakeibo.domain.group.ExpenseGroup;
import com.example.Kakeibo.domain.user.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "split_transactions")
@Getter
@Setter
public class SplitTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private ExpenseGroup group;

    @Column(nullable = false)
    private Long totalAmount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paid_by_user_id", nullable = false)
    private User paidBy;

    @Size(max = 200)
    private String memo;

    @Column(nullable = false)
    private LocalDate splitDate;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "splitTransaction", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SplitShare> shares = new ArrayList<>();

    @PrePersist
    void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}
