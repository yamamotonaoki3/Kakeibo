package com.example.Kakeibo.Model.Transaction;

public enum Category {
    FOOD("食費"),
    RENT("家賃"),
    UTILITTES("光熱費"),
    SALARY("給料"),
    OTHER("その他");

    private  final  String label;

    Category(String label){
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
