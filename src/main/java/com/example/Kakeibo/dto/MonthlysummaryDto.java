package com.example.Kakeibo.dto;

public class MonthlysummaryDto {
    private Long incomeTotal;
    private Long expenseTotal;

    public MonthlysummaryDto(Long incomeTotal, Long expenseTotal) {
        this.incomeTotal = incomeTotal;
        this.expenseTotal = expenseTotal;
    }


    public Long getIncomeTotal() {

        return incomeTotal;
    }

    public Long getExpenseTotal()
    {
        return expenseTotal;
    }

    public Long getBalance(){
        return  incomeTotal - expenseTotal;
    }
}

