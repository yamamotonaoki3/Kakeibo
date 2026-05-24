package com.example.Kakeibo.Model.Transaction;

import jakarta.persistence.*;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@Entity
public class Transaction {
    /*
    フィールド
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotNull (message = "金額を入力してください")
    @Positive(message = "１以上を入力してください")
    private  Integer amount;

    @Size (max = 50 , message = "50文字以内にしてください")
    private  String memo;

    @NotNull(message = "日付を入力してください")
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate date;

    @NotNull(message = "カテゴリを指定してください")
    @Enumerated(EnumType.STRING)
    private Category category;

    @NotNull(message = "支出か収入かえらんでください")
    @Enumerated(EnumType.STRING)
    private  TransactionType type;

    /*
    コンストラクタ
     */

    public Transaction(){
    }



    public Integer getAmount() {
        return amount;
    }

    public void setAmount(Integer amount) {

        this.amount = amount;
    }

    public String getMemo() {
        return memo;
    }

    public void setMemo(String memo) {

        this.memo = memo;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public TransactionType getType() {
        return type;
    }

    public void setType(TransactionType type) {
        this.type = type;
    }
}
