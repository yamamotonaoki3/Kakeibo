package com.example.Kakeibo.Model.Transaction;

public enum TransactionType {
    INCOME("収入"),
    EXPENSE("支出");

    private final String label;

    TransactionType(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
