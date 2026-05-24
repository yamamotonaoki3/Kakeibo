package com.example.Kakeibo.Mapper;

import com.example.Kakeibo.Model.Transaction.Transaction;
import com.example.Kakeibo.dto.TransactionFrom;
import org.springframework.stereotype.Component;

@Component
public class TransactionMapper {
    //Entity→DTOに変換
    public TransactionFrom TransactionToFrom(Transaction transaction) {
        TransactionFrom form = new TransactionFrom();
        form.setDate(transaction.getDate());
        form.setAmount(transaction.getAmount());
        form.setCategory(transaction.getCategory());
        form.setId(transaction.getId());
        form.setMemo(transaction.getMemo());
        form.setType(transaction.getType());
        return form;
    }

    //DTO→Entityに変換
    public void TransactionToEntity(TransactionFrom form, Transaction transaction) {
        transaction.setId(form.getId());
        transaction.setDate(form.getDate());
        transaction.setAmount(form.getAmount());
        transaction.setCategory(form.getCategory());
        transaction.setMemo(form.getMemo());
        transaction.setType(form.getType());
    }
}
