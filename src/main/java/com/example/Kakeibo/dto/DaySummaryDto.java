package com.example.Kakeibo.dto;

public class DaySummaryDto {

    private Integer day;
    private  Long income;
    private  Long expense;
    private  Long balance;


    public DaySummaryDto(Integer day, Long income, Long expense, Long balance) {
        this.day = day;
        this.income = income;
        this.expense = expense;
        this.balance = balance;
    }

    public Integer getDay() {
        return day;
    }

    public void setDay(Integer day) {
        this.day = day;
    }

    public Long getIncome() {
        return income;
    }

    public void setIncome(Long income) {
        this.income = income;
    }

    public Long getExpense() {
        return expense;
    }

    public void setExpense(Long expense) {
        this.expense = expense;
    }

    public Long getBalance() {
        return balance;
    }

    public void setBalance(Long balance) {
        this.balance = balance;
    }
}
